/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Region, Faction, RegionID, FactionID, HistoryLog } from '../types/game';

// Custo de suprimentos por brigada por turno (1 semana de campanha)
const CUSTO_SUPRIMENTO_POR_BRIGADA = 0.4;

// Penalidades de isolamento logístico (região sem linha de abastecimento)
const PENALIDADE_MORAL_ISOLAMENTO = 5;
const PENALIDADE_SUPRIMENTOS_ISOLAMENTO = 8;

// Atrito de tropas por suprimentos zerados em região isolada
const ATRITO_SEM_SUPRIMENTOS = 1;

// Regiões que funcionam como quartel-general (nunca são consideradas isoladas)
const HQ_POR_FACAO: Partial<Record<FactionID, RegionID>> = {
  BRASIL: 'BRASILIA',
  PARAGUAI: 'ASSUNCAO',
  COALIZAO_CHACO: 'CHACO',
};

/**
 * Verifica se uma região está conectada à sua linha de suprimentos.
 * Uma região está conectada se:
 *   a) É o quartel-general da facção, OU
 *   b) Tem pelo menos uma região adjacente controlada pela mesma facção
 */
function estaConectada(
  regionId: RegionID,
  faccao: FactionID,
  regions: Record<RegionID, Region>,
  adjacency: Record<RegionID, RegionID[]>
): boolean {
  if (HQ_POR_FACAO[faccao] === regionId) return true;

  const vizinhos = adjacency[regionId] ?? [];
  return vizinhos.some(vizId => regions[vizId]?.controller === faccao);
}

/**
 * Processa logística regional para um turno de campanha.
 * Muta diretamente updatedRegions e updatedFactions (já deep-clonados pelo caller).
 *
 * Efeitos aplicados:
 *  1. Consumo de suprimentos proporcional às tropas em cada região
 *  2. Penalidade de moral e suprimentos em regiões isoladas
 *  3. Atrito de tropas quando facção está sem suprimentos E região está isolada
 */
export function processarLogisticaRegional(
  updatedRegions: Record<RegionID, Region>,
  updatedFactions: Record<FactionID, Faction>,
  adjacency: Record<RegionID, RegionID[]>,
  currentTurn: number,
  logs: HistoryLog[]
): void {
  // 1. Consumo de suprimentos por manutenção de tropas (todas as facções)
  const consumoPorFacao: Partial<Record<FactionID, number>> = {};

  Object.values(updatedRegions).forEach((region) => {
    const faccao = region.controller;
    const custo = Math.round(region.troops * CUSTO_SUPRIMENTO_POR_BRIGADA);
    consumoPorFacao[faccao] = (consumoPorFacao[faccao] ?? 0) + custo;
  });

  (Object.entries(consumoPorFacao) as [FactionID, number][]).forEach(([faccao, custo]) => {
    const faction = updatedFactions[faccao];
    if (!faction) return;

    const antesDe = faction.resources.supplies;
    faction.resources.supplies = Math.max(0, faction.resources.supplies - custo);

    if (faction.resources.supplies <= 0 && antesDe > 0) {
      logs.push({
        id: `log_sup_zero_${faccao}_${currentTurn}`,
        turn: currentTurn,
        type: 'MILITAR',
        message: `🔴 CRISE LOGÍSTICA [${faction.name.toUpperCase()}]: Estoques de suprimentos esgotados — tropas em campo sem alimentos, munições e combustível.`
      });
    }
  });

  // 2. Verificação de linhas de suprimento e penalidades de isolamento
  (Object.values(updatedRegions) as Region[]).forEach((region) => {
    const faccao = region.controller;
    const faction = updatedFactions[faccao];
    if (!faction || region.troops <= 0) return;

    const conectada = estaConectada(region.id as RegionID, faccao, updatedRegions, adjacency);

    if (!conectada) {
      // Região isolada: moral cai e faction perde suprimentos extras
      region.morale = Math.max(0, region.morale - PENALIDADE_MORAL_ISOLAMENTO);
      faction.resources.supplies = Math.max(
        0,
        faction.resources.supplies - PENALIDADE_SUPRIMENTOS_ISOLAMENTO
      );

      logs.push({
        id: `log_isolamento_${region.id}_${currentTurn}`,
        turn: currentTurn,
        type: 'MILITAR',
        message: `⚠️ LINHA CORTADA [${region.name.toUpperCase()}]: Guarnição isolada sem rota de abastecimento. Moral caiu -${PENALIDADE_MORAL_ISOLAMENTO}. Suprimentos críticos consumidos na tentativa de reabastecimento aéreo.`
      });

      // 3. Atrito de tropas quando facção está sem suprimentos E região está isolada
      if (faction.resources.supplies <= 0 && region.troops > 1) {
        region.troops = Math.max(1, region.troops - ATRITO_SEM_SUPRIMENTOS);
        logs.push({
          id: `log_atrito_${region.id}_${currentTurn}`,
          turn: currentTurn,
          type: 'MILITAR',
          message: `💀 ATRITO OPERACIONAL [${region.name.toUpperCase()}]: Tropas sem suprimentos há semanas. Baixas por desidratação, deserção e colapso logístico: -${ATRITO_SEM_SUPRIMENTOS} brigadas.`
        });
      }
    }
  });
}

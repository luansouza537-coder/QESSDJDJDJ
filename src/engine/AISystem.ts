/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Region, Faction, RegionID, FactionID, HistoryLog, TerrainType } from '../types/game';

// Configuração por dificuldade
const AI_CONFIG = {
  FACIL:  { rodadasPorTurno: 1, custoRecrutamento: 25, ratioMinimoAtaque: 2.0, quantidadeRecrutamento: 2 },
  NORMAL: { rodadasPorTurno: 2, custoRecrutamento: 20, ratioMinimoAtaque: 1.5, quantidadeRecrutamento: 3 },
  DIFICIL:{ rodadasPorTurno: 3, custoRecrutamento: 15, ratioMinimoAtaque: 1.2, quantidadeRecrutamento: 5 },
};

// Prioridade estratégica de cada região como alvo de ataque
const VALOR_ESTRATEGICO: Record<RegionID, number> = {
  ITAIPU:          10,
  BRASILIA:         9,
  FOZ_DO_IGUACU:   8,
  ASSUNCAO:         7,
  CIUDAD_DEL_ESTE:  6,
  MATO_GROSSO_SUL:  5,
  CHACO:            3,
};

// Modificador de terreno para defesa (replicando a lógica do combate)
function modificadorDefesa(terrain: TerrainType): number {
  switch (terrain) {
    case 'Rio/Barragem': return 0.50;
    case 'Urbano':       return 0.65;
    case 'Pantanal':     return 0.70;
    case 'Floresta':     return 0.875;
    case 'Chaco':        return 1.00;
    case 'Campo Aberto': return 1.40;
    default:             return 1.00;
  }
}

/**
 * Resolve um combate entre IA atacante e qualquer defensor, sem abrir modal interativo.
 * Usa o mesmo sistema D6 do executeBattleRound, mas em 3 rodadas auto-resolvidas.
 */
function resolverCombateIA(
  atacanteRegiao: RegionID,
  alvoRegiao: RegionID,
  tropasAtacante: number,
  regions: Record<RegionID, Region>,
  factions: Record<FactionID, Faction>,
  facaoAtacante: FactionID,
  logs: HistoryLog[],
  currentTurn: number
): void {
  const alvo = regions[alvoRegiao];
  const facaoDefensora = alvo.controller;
  const defensora = factions[facaoDefensora];

  let atkTroops = tropasAtacante;
  let defTroops = alvo.troops;

  let totalBaixasAtk = 0;
  let totalBaixasDef = 0;

  const maxRounds = 5;

  for (let round = 0; round < maxRounds; round++) {
    if (atkTroops <= 0 || defTroops <= 0) break;

    const rollAtk = Math.floor(Math.random() * 6) + 1;
    const rollDef = Math.floor(Math.random() * 6) + 1;

    const poderAtk = atkTroops * (factions[facaoAtacante].nationalMorale / 100) * (rollAtk + 2);
    const poderDef = (defTroops + alvo.defenseRating) * (alvo.morale / 100) * (rollDef + 2);

    let dmgAtk = poderAtk * 0.12 * modificadorDefesa(alvo.terrain);
    let dmgDef = poderDef * 0.12;

    const baixasAtk = Math.min(atkTroops, Math.max(1, Math.floor(dmgDef)));
    const baixasDef = Math.min(defTroops, Math.max(1, Math.floor(dmgAtk)));

    atkTroops -= baixasAtk;
    defTroops -= baixasDef;
    totalBaixasAtk += baixasAtk;
    totalBaixasDef += baixasDef;
  }

  if (atkTroops > defTroops) {
    // Atacante vence — toma controle da região
    regions[atacanteRegiao].troops = Math.max(0, regions[atacanteRegiao].troops);
    alvo.controller = facaoAtacante;
    alvo.troops = Math.max(1, atkTroops);
    alvo.morale = Math.max(20, alvo.morale - 15);

    if (defensora) {
      defensora.nationalMorale = Math.max(0, defensora.nationalMorale - 8);
    }

    logs.unshift({
      id: `ai_victory_${alvoRegiao}_${currentTurn}_${Date.now()}`,
      turn: currentTurn,
      type: 'MILITAR',
      message: `🚨 OFENSIVA INIMIGA: ${factions[facaoAtacante].name} conquistou ${alvo.name}! Baixas defensoras: -${totalBaixasDef} brigadas. Resistência destruída.`,
    });
  } else {
    // Defensor sustenta a posição
    alvo.troops = Math.max(1, defTroops);
    regions[atacanteRegiao].troops += Math.max(0, atkTroops);

    logs.unshift({
      id: `ai_repelled_${alvoRegiao}_${currentTurn}_${Date.now()}`,
      turn: currentTurn,
      type: 'MILITAR',
      message: `🛡️ ATAQUE REPELIDO: Nossa guarnição em ${alvo.name} resistiu ao avanço de ${factions[facaoAtacante].name}. Baixas inimigas: -${totalBaixasAtk}. Posição mantida.`,
    });
  }
}

/**
 * Ponto de entrada principal: executa o turno completo de todas as facções de IA.
 * Para cada facção não-jogador, aplica recrutamento, redistribuição e ataques
 * com número de rodadas de decisão proporcional à dificuldade.
 */
export function executarTurnoIA(
  regions: Record<RegionID, Region>,
  factions: Record<FactionID, Faction>,
  adjacency: Record<RegionID, RegionID[]>,
  difficulty: 'FACIL' | 'NORMAL' | 'DIFICIL',
  playerFaction: FactionID,
  currentTurn: number,
  logs: HistoryLog[]
): void {
  const config = AI_CONFIG[difficulty];

  // Lista de facções que são controladas pela IA
  const faccoesIA: FactionID[] = (Object.keys(factions) as FactionID[]).filter(
    id => id !== playerFaction && factions[id] != null
  );

  for (const facaoId of faccoesIA) {
    const faction = factions[facaoId];
    if (!faction) continue;

    // Regiões desta facção
    const regioesProprias = (Object.values(regions) as Region[]).filter(
      r => r.controller === facaoId
    );
    if (regioesProprias.length === 0) continue;

    // Regiões de fronteira: têm pelo menos um vizinho inimigo
    const fronteiras = regioesProprias.filter(r =>
      (adjacency[r.id] ?? []).some(
        vizId => regions[vizId] && regions[vizId].controller !== facaoId
      )
    );

    // Regiões seguras: sem vizinhos inimigos
    const seguras = regioesProprias.filter(r =>
      !(adjacency[r.id] ?? []).some(
        vizId => regions[vizId] && regions[vizId].controller !== facaoId
      )
    );

    // ── FASE 1: RECRUTAMENTO ─────────────────────────────────────────────────
    if (faction.resources.supplies >= config.custoRecrutamento) {
      // Recruta na região de fronteira com menos tropas (prioridade de reforço)
      const alvoRecrutamento =
        fronteiras.sort((a, b) => a.troops - b.troops)[0] ?? regioesProprias[0];

      if (alvoRecrutamento) {
        alvoRecrutamento.troops += config.quantidadeRecrutamento;
        faction.resources.supplies -= config.custoRecrutamento;
      }
    }

    // ── FASE 2: REDISTRIBUIÇÃO (NORMAL e DIFICIL) ───────────────────────────
    if (difficulty !== 'FACIL' && seguras.length > 0 && fronteiras.length > 0) {
      const origensSafe = seguras.filter(r => r.troops > 12);

      for (const origem of origensSafe) {
        const destino = fronteiras
          .filter(f => (adjacency[origem.id] ?? []).includes(f.id))
          .sort((a, b) => a.troops - b.troops)[0];

        if (destino) {
          const mover = Math.min(5, Math.floor(origem.troops * 0.3));
          if (mover > 0) {
            origem.troops -= mover;
            destino.troops += mover;
          }
        }
      }
    }

    // ── FASE 3: ATAQUES (N rodadas de decisão por turno) ────────────────────
    for (let rodada = 0; rodada < config.rodadasPorTurno; rodada++) {
      // Re-calcula fronteiras após cada ação (regiões podem mudar de mãos)
      const fronteirasAtuais = (Object.values(regions) as Region[]).filter(
        r => r.controller === facaoId &&
          (adjacency[r.id] ?? []).some(
            vizId => regions[vizId] && regions[vizId].controller !== facaoId
          )
      );

      // Para cada região de fronteira, avalia os alvos possíveis
      type Candidato = { origem: RegionID; alvo: RegionID; score: number; tropas: number };
      const candidatos: Candidato[] = [];

      for (const regFront of fronteirasAtuais) {
        const vizinhosInimigos = (adjacency[regFront.id] ?? []).filter(
          vizId => regions[vizId] && regions[vizId].controller !== facaoId
        );

        for (const alvoId of vizinhosInimigos) {
          const alvo = regions[alvoId];
          if (!alvo) continue;

          const forcaAtk = regFront.troops;
          const forcaDef = alvo.troops + alvo.defenseRating;
          const ratio = forcaAtk / Math.max(1, forcaDef);

          if (ratio >= config.ratioMinimoAtaque) {
            const score = ratio * VALOR_ESTRATEGICO[alvoId];
            candidatos.push({
              origem: regFront.id,
              alvo: alvoId,
              score,
              tropas: Math.floor(regFront.troops * 0.6), // usa 60% das tropas no ataque
            });
          }
        }
      }

      if (candidatos.length === 0) break;

      // Executa o ataque com maior score estratégico
      candidatos.sort((a, b) => b.score - a.score);
      const melhor = candidatos[0];

      // Retira tropas da origem antes do combate
      regions[melhor.origem].troops -= melhor.tropas;

      resolverCombateIA(
        melhor.origem,
        melhor.alvo,
        melhor.tropas,
        regions,
        factions,
        facaoId,
        logs,
        currentTurn
      );

      // ── FASE 4: DEFESA REATIVA (apenas DIFICIL) ───────────────────────────
      if (difficulty === 'DIFICIL') {
        // Reforça regiões próprias que estão abaixo de 8 tropas e têm vizinhos inimigos
        const ameacadas = (Object.values(regions) as Region[]).filter(
          r => r.controller === facaoId &&
            r.troops < 8 &&
            (adjacency[r.id] ?? []).some(
              vizId => regions[vizId] && regions[vizId].controller !== facaoId
            )
        );

        for (const ameacada of ameacadas) {
          // Tenta puxar tropas de uma região adjacente segura
          const vizinhosSegurosProprios = (adjacency[ameacada.id] ?? []).filter(
            vizId =>
              regions[vizId] &&
              regions[vizId].controller === facaoId &&
              regions[vizId].troops > 10
          );

          if (vizinhosSegurosProprios.length > 0) {
            const doador = regions[vizinhosSegurosProprios[0]];
            const reforco = Math.min(4, Math.floor(doador.troops * 0.25));
            if (reforco > 0) {
              doador.troops -= reforco;
              ameacada.troops += reforco;
            }
          }
        }
      }
    }

    // ── COALIZÃO DO CHACO: comportamento específico ──────────────────────────
    if (facaoId === 'COALIZAO_CHACO') {
      const chaco = regions['CHACO'];
      if (chaco && chaco.controller === 'COALIZAO_CHACO' && chaco.troops < 20 &&
          faction.resources.funds > 15) {
        chaco.troops += 4;
        faction.resources.funds -= 15;
        logs.unshift({
          id: `ai_chaco_fort_${currentTurn}_${Date.now()}`,
          turn: currentTurn,
          type: 'MILITAR',
          message: `ℹ️ INTELIGÊNCIA: A Coalizão do Chaco reforçou os poços de gás no deserto com brigadas estepárias (+4 brigadas).`,
        });
      }
    }
  }
}

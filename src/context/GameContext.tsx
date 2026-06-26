/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import { engineManager } from '../engine/EngineManager';
import { regiaoParaZonaClimatica } from '../engine/SimulationBridge';
import { processarLogisticaRegional } from '../engine/RegionalLogistics';
import { executarTurnoIA } from '../engine/AISystem';
import { avaliarCondicoes, gerarEventoGemini, CondicaoJogo } from '../engine/EventSystem';
import {
  GameState,
  FactionID,
  RegionID,
  GameEvent,
  EventChoice,
  HistoryLog,
  Character,
  Region,
  Faction,
  DiplomaticRelation,
  ActiveBattle,
  BattleRound,
  BattleReport,
  EconomicIndicators,
  UnitType,
  UnitComposition,
  TerrainType
} from '../types/game';
import { INITIAL_FACTIONS, INITIAL_REGIONS, INITIAL_CHARACTERS, INITIAL_RELATIONS } from '../data/initialData';
import { INITIAL_INFRASTRUCTURE_STATE } from '../data/infrastructureData';
import { GEOPOLITICAL_EVENTS } from '../data/events';
import { PREQUEL_EVENTS, PREQUEL_EVENTS_PARAGUAI, generateProceduralEvent } from '../data/campaignEvents';

// Re-exports para compatibilidade com imports existentes
export type { EconomicIndicators };
export type { UnitType, UnitComposition };

// Custos de recrutamento por tipo de unidade
export const UNIT_COSTS: Record<UnitType, { funds: number; supplies: number }> = {
  INFANTARIA:    { funds: 4,  supplies: 10 },
  BLINDADOS:     { funds: 10, supplies: 15 },
  ARTILHARIA:    { funds: 8,  supplies: 12 },
  FORCA_ESPECIAL:{ funds: 12, supplies: 8  },
};

// Multiplicador de eficácia de combate por tipo de unidade × terreno
function calcCompositionMultiplier(
  composition: UnitComposition,
  totalTroops: number,
  terrain: TerrainType
): number {
  if (totalTroops <= 0) return 1.0;
  const mult: Record<UnitType, Record<TerrainType, number>> = {
    INFANTARIA:     { 'Urbano': 1.00, 'Floresta': 1.00, 'Chaco': 1.00, 'Pantanal': 1.00, 'Rio/Barragem': 1.00, 'Campo Aberto': 1.00 },
    BLINDADOS:      { 'Campo Aberto': 1.35, 'Chaco': 1.00, 'Pantanal': 0.60, 'Floresta': 0.65, 'Rio/Barragem': 0.75, 'Urbano': 0.80 },
    ARTILHARIA:     { 'Campo Aberto': 1.30, 'Urbano': 1.25, 'Chaco': 1.10, 'Pantanal': 0.85, 'Floresta': 0.70, 'Rio/Barragem': 0.90 },
    FORCA_ESPECIAL: { 'Floresta': 1.40, 'Urbano': 1.25, 'Chaco': 1.20, 'Campo Aberto': 1.10, 'Pantanal': 1.15, 'Rio/Barragem': 1.15 },
  };
  const unitTypes: UnitType[] = ['INFANTARIA', 'BLINDADOS', 'ARTILHARIA', 'FORCA_ESPECIAL'];
  let weighted = 0;
  for (const t of unitTypes) {
    weighted += composition[t] * (mult[t][terrain] ?? 1.0);
  }
  return weighted / totalTroops;
}

// Transfere `count` tropas proporcionalmente da composição de origem
function transferComposition(
  source: UnitComposition,
  sourceTroops: number,
  count: number
): { transferred: UnitComposition; remaining: UnitComposition } {
  if (sourceTroops <= 0 || count <= 0) {
    return { transferred: { INFANTARIA: count, BLINDADOS: 0, ARTILHARIA: 0, FORCA_ESPECIAL: 0 }, remaining: { ...source } };
  }
  const ratio = count / sourceTroops;
  const transferred: UnitComposition = { INFANTARIA: 0, BLINDADOS: 0, ARTILHARIA: 0, FORCA_ESPECIAL: 0 };
  let total = 0;
  for (const t of ['BLINDADOS', 'ARTILHARIA', 'FORCA_ESPECIAL'] as UnitType[]) {
    const amt = Math.min(source[t], Math.floor(source[t] * ratio));
    transferred[t] = amt;
    total += amt;
  }
  transferred.INFANTARIA = Math.max(0, count - total);
  const remaining: UnitComposition = {
    INFANTARIA: source.INFANTARIA - transferred.INFANTARIA,
    BLINDADOS:  source.BLINDADOS  - transferred.BLINDADOS,
    ARTILHARIA: source.ARTILHARIA - transferred.ARTILHARIA,
    FORCA_ESPECIAL: source.FORCA_ESPECIAL - transferred.FORCA_ESPECIAL,
  };
  return { transferred, remaining };
}

// Escala composição proporcionalmente a um novo total de tropas
function scaleComposition(comp: UnitComposition, oldTotal: number, newTotal: number): UnitComposition {
  if (oldTotal <= 0 || newTotal <= 0) return { INFANTARIA: newTotal, BLINDADOS: 0, ARTILHARIA: 0, FORCA_ESPECIAL: 0 };
  const ratio = newTotal / oldTotal;
  const scaled: UnitComposition = {
    INFANTARIA: 0, BLINDADOS: 0, ARTILHARIA: 0, FORCA_ESPECIAL: 0,
  };
  let total = 0;
  for (const t of ['BLINDADOS', 'ARTILHARIA', 'FORCA_ESPECIAL'] as UnitType[]) {
    const amt = Math.min(comp[t], Math.round(comp[t] * ratio));
    scaled[t] = amt;
    total += amt;
  }
  scaled.INFANTARIA = Math.max(0, newTotal - total);
  return scaled;
}

interface GameContextProps {
  gameState: GameState;
  pendingEventGeneration: boolean;
  startGame: (factionId: FactionID, difficulty: 'FACIL' | 'NORMAL' | 'DIFICIL', advisor: string) => void;
  resetGame: () => void;
  advanceTurn: () => void;
  resolveActiveEventChoice: (choiceId: string) => void;
  selectRegion: (regionId: RegionID | null) => void;
  recruitTroops: (regionId: RegionID, count: number, unitType?: UnitType) => boolean;
  moveTroops: (fromRegionId: RegionID, toRegionId: RegionID, count: number) => void;
  deployCharacterMission: (
    characterId: string, 
    regionId: RegionID, 
    missionType: 'DEFESA' | 'SABOTAGEM' | 'DIPLOMACIA' | 'PRODUCAO'
  ) => void;
  performDiplomacy: (
    targetFactionId: FactionID, 
    action: 'PACTO_NAO_AGRESSAO' | 'DIPLOMACIA_PRESENCIAL' | 'FINANCIAR' | 'DECLARAR_GUERRA'
  ) => void;
  executeBattleRound: () => void;
  retreatBattle: () => void;
  autoResolveBattle: () => void;
  closeBattleReport: () => void;
  advancePrequelYear: () => void;
  triggerDirectEnding: (endingId: string) => void;
  repairInfrastructure: (infraId: string) => boolean;
  upgradeInfrastructureDefense: (infraId: string) => boolean;
  sabotageInfrastructure: (infraId: string) => boolean;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

// Lista de adjacências de regiões para movimentação estratégica
export const REGION_ADJACENCY: Record<RegionID, RegionID[]> = {
  BRASILIA: ['MATO_GROSSO_SUL'],
  MATO_GROSSO_SUL: ['BRASILIA', 'FOZ_DO_IGUACU', 'CHACO'],
  FOZ_DO_IGUACU: ['MATO_GROSSO_SUL', 'ITAIPU', 'CIUDAD_DEL_ESTE'],
  ITAIPU: ['FOZ_DO_IGUACU', 'CIUDAD_DEL_ESTE', 'ASSUNCAO'],
  CIUDAD_DEL_ESTE: ['FOZ_DO_IGUACU', 'ITAIPU', 'ASSUNCAO'],
  ASSUNCAO: ['ITAIPU', 'CIUDAD_DEL_ESTE', 'CHACO'],
  CHACO: ['MATO_GROSSO_SUL', 'ASSUNCAO']
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [pendingEventGeneration, setPendingEventGeneration] = useState(false);
  const pendingEventContextRef = useRef<{ conditionType: CondicaoJogo; gameStateCopy: GameState } | null>(null);

  const [gameState, setGameState] = useState<GameState>(() => {
    // Estado inicial fictício até o jogo começar pelo Menu Principal
    return {
      currentTurn: 0, // 0 indica que está no Menu Principal
      playerFaction: 'BRASIL',
      factions: JSON.parse(JSON.stringify(INITIAL_FACTIONS)),
      regions: JSON.parse(JSON.stringify(INITIAL_REGIONS)),
      characters: JSON.parse(JSON.stringify(INITIAL_CHARACTERS)),
      relations: JSON.parse(JSON.stringify(INITIAL_RELATIONS)),
      historyLogs: [
        { id: 'start_0', turn: 1, type: 'SISTEMA', message: 'Teatro de Guerra pronto para inicialização.' }
      ],
      activeEvent: null,
      selectedRegionId: null,
      victoryStatus: 'JOGANDO',
      difficulty: 'NORMAL',
      warAdvisor: 'Estratégia Militar',
      activeBattle: null,
      battleReports: [],
      // Novos campos com valores iniciais padrão
      popularSupport: 50,
      politicalStability: 50,
      intelPoints: 30,
      fuelReserve: 100,
      globalInfluence: 40,
      timelineProgress: 'PREQUEL',
      prequelYear: 2024,
      resolvedPrequelEvents: [],
      infrastructure: JSON.parse(JSON.stringify(INITIAL_INFRASTRUCTURE_STATE))
    };
  });

  // Começar um novo jogo salvando preferências de dificuldade e assessoria militar
  const startGame = (factionId: FactionID, difficulty: 'FACIL' | 'NORMAL' | 'DIFICIL', advisor: string) => {
    const freshFactions: Record<FactionID, Faction> = JSON.parse(JSON.stringify(INITIAL_FACTIONS));
    const freshRegions: Record<RegionID, Region> = JSON.parse(JSON.stringify(INITIAL_REGIONS));
    const freshCharacters: Character[] = JSON.parse(JSON.stringify(INITIAL_CHARACTERS));
    const freshRelations: DiplomaticRelation[] = JSON.parse(JSON.stringify(INITIAL_RELATIONS));

    // Ajustar recursos iniciais baseado na dificuldade
    if (difficulty === 'FACIL') {
      freshFactions[factionId].resources.funds += 60;
      freshFactions[factionId].resources.supplies += 100;
      freshFactions[factionId].resources.energy += 50;
    } else if (difficulty === 'DIFICIL') {
      freshFactions[factionId].resources.funds = Math.max(10, freshFactions[factionId].resources.funds - 30);
      freshFactions[factionId].resources.supplies = Math.max(20, freshFactions[factionId].resources.supplies - 80);
      freshFactions[factionId].resources.energy = Math.max(10, freshFactions[factionId].resources.energy - 40);
    }

    const firstLog: HistoryLog = {
      id: 'init_log_1',
      turn: 1,
      type: 'SISTEMA',
      message: `Campanha iniciada sob a chefia de ${freshFactions[factionId].leaderTitle} ${freshFactions[factionId].leaderName} no modo ${difficulty}. Iniciando Linha do Tempo: Prequel Geopolítico Clandestino (2024 - 2033).`
    };

    setGameState({
      currentTurn: 1,
      playerFaction: factionId,
      factions: freshFactions,
      regions: freshRegions,
      characters: freshCharacters,
      relations: freshRelations,
      historyLogs: [firstLog],
      // Começamos o jogo diretamente com o evento de 2024 activo!
      activeEvent: factionId === 'PARAGUAI' ? PREQUEL_EVENTS_PARAGUAI[2024] : PREQUEL_EVENTS[2024],
      selectedRegionId: factionId === 'PARAGUAI' ? 'ASSUNCAO' : 'BRASILIA',
      victoryStatus: 'JOGANDO',
      difficulty,
      warAdvisor: advisor,
      activeBattle: null,
      battleReports: [],
      popularSupport: 50,
      politicalStability: 50,
      intelPoints: 30,
      fuelReserve: 100,
      globalInfluence: 40,
      timelineProgress: 'PREQUEL',
      prequelYear: 2024,
      resolvedPrequelEvents: [],
      infrastructure: JSON.parse(JSON.stringify(INITIAL_INFRASTRUCTURE_STATE))
    });
  };

  const resetGame = () => {
    engineManager.stop();
    setGameState(prev => ({
      ...prev,
      currentTurn: 0,
      activeEvent: null,
      selectedRegionId: null,
      victoryStatus: 'JOGANDO'
    }));
  };

  // Delega ciclo de vida do motor real-time ao EngineManager (singleton fora do React)
  useEffect(() => {
    if (gameState.timelineProgress === 'GUERRA') {
      engineManager.start(gameState);
    } else {
      engineManager.stop();
    }
  }, [gameState.timelineProgress]);

  // Cleanup ao desmontar o provider
  useEffect(() => {
    return () => engineManager.stop();
  }, []);

  // Geração assíncrona de eventos pelo Gemini — dispara quando advanceTurn sinaliza
  useEffect(() => {
    if (!pendingEventGeneration || !pendingEventContextRef.current) return;

    const ctx = pendingEventContextRef.current;
    pendingEventContextRef.current = null;

    gerarEventoGemini(ctx.gameStateCopy, ctx.conditionType)
      .then(geminiEvent => {
        setGameState(prev => {
          // Não sobrescreve se um evento fixo de enredo já foi definido
          if (prev.activeEvent !== null) return prev;

          const finalEvent = geminiEvent ?? generateProceduralEvent(prev.currentTurn, prev);
          const source = geminiEvent ? 'Análise de inteligência ativa' : 'Relatório operacional automático';

          return {
            ...prev,
            activeEvent: finalEvent,
            historyLogs: [
              {
                id: `event_ai_${prev.currentTurn}_${Date.now()}`,
                turn: prev.currentTurn,
                type: 'EVENTO' as const,
                message: `🚨 COMUNICAÇÃO OPERACIONAL: ${finalEvent.title}. ${source}.`,
              },
              ...prev.historyLogs,
            ],
          };
        });
      })
      .finally(() => {
        setPendingEventGeneration(false);
      });
  }, [pendingEventGeneration]);

  const selectRegion = (regionId: RegionID | null) => {
    setGameState(prev => ({
      ...prev,
      selectedRegionId: regionId
    }));
  };

  // Recrutar tropas com tipo de unidade específico
  const recruitTroops = (regionId: RegionID, count: number, unitType: UnitType = 'INFANTARIA'): boolean => {
    if (gameState.currentTurn === 0) return false;

    const cost = UNIT_COSTS[unitType];
    const playerFac = gameState.factions[gameState.playerFaction];

    const totalFundsCost = cost.funds * count;
    const totalSuppliesCost = cost.supplies * count;

    if (playerFac.resources.funds < totalFundsCost || playerFac.resources.supplies < totalSuppliesCost) {
      return false;
    }

    setGameState(prev => {
      const updatedFactions = { ...prev.factions };
      const updatedRegions = { ...prev.regions };

      updatedFactions[prev.playerFaction].resources.funds -= totalFundsCost;
      updatedFactions[prev.playerFaction].resources.supplies -= totalSuppliesCost;
      updatedRegions[regionId].troops += count;
      updatedRegions[regionId].composition = {
        ...updatedRegions[regionId].composition,
        [unitType]: updatedRegions[regionId].composition[unitType] + count,
      };

      const unitLabels: Record<UnitType, string> = {
        INFANTARIA: 'brigadas de infantaria',
        BLINDADOS: 'esquadrões blindados',
        ARTILHARIA: 'baterias de artilharia',
        FORCA_ESPECIAL: 'operativos de força especial',
      };

      const newLog: HistoryLog = {
        id: `recruit_${prev.currentTurn}_${Date.now()}`,
        turn: prev.currentTurn,
        type: 'MILITAR',
        message: `Mobilizados +${count} ${unitLabels[unitType]} em ${updatedRegions[regionId].name} ao custo de F$ ${totalFundsCost} e ${totalSuppliesCost} suprimentos.`
      };

      return {
        ...prev,
        factions: updatedFactions,
        regions: updatedRegions,
        historyLogs: [newLog, ...prev.historyLogs]
      };
    });

    return true;
  };

  // Executar movimentação defensiva ou ataque tático tencionando controle com combate interativo
  const moveTroops = (fromRegionId: RegionID, toRegionId: RegionID, count: number) => {
    if (gameState.currentTurn === 0) return;

    const fromRegion = gameState.regions[fromRegionId];
    if (fromRegion.controller !== gameState.playerFaction || fromRegion.troops <= count) {
      return; 
    }

    setGameState(prev => {
      const updatedRegions = { ...prev.regions };
      const currentTurn = prev.currentTurn;
      const logs: HistoryLog[] = [];

      const targetRegion = updatedRegions[toRegionId];
      const isCombat = targetRegion.controller !== prev.playerFaction;

      if (!isCombat) {
        // Movimentação amistosa simples de reforço
        const { transferred, remaining } = transferComposition(
          updatedRegions[fromRegionId].composition,
          updatedRegions[fromRegionId].troops,
          count
        );
        updatedRegions[fromRegionId].troops -= count;
        updatedRegions[fromRegionId].composition = remaining;
        updatedRegions[toRegionId].troops += count;
        updatedRegions[toRegionId].composition = {
          INFANTARIA: updatedRegions[toRegionId].composition.INFANTARIA + transferred.INFANTARIA,
          BLINDADOS:  updatedRegions[toRegionId].composition.BLINDADOS  + transferred.BLINDADOS,
          ARTILHARIA: updatedRegions[toRegionId].composition.ARTILHARIA + transferred.ARTILHARIA,
          FORCA_ESPECIAL: updatedRegions[toRegionId].composition.FORCA_ESPECIAL + transferred.FORCA_ESPECIAL,
        };

        logs.push({
          id: `move_${currentTurn}_${Date.now()}`,
          turn: currentTurn,
          type: 'MILITAR',
          message: `Movidas ${count} brigadas de ${fromRegion.name} para reforçar ${targetRegion.name}.`
        });

        return {
          ...prev,
          regions: updatedRegions,
          historyLogs: [logs[0], ...prev.historyLogs]
        };
      } else {
        // Iniciar Combate Tático Por Turnos!
        const { transferred: atkComp, remaining: fromRemaining } = transferComposition(
          updatedRegions[fromRegionId].composition,
          updatedRegions[fromRegionId].troops,
          count
        );
        updatedRegions[fromRegionId].troops -= count;
        updatedRegions[fromRegionId].composition = fromRemaining;

        const activeBattle: ActiveBattle = {
          regionId: toRegionId,
          attacker: prev.playerFaction,
          defender: targetRegion.controller,
          attackerInitialTroops: count,
          defenderInitialTroops: targetRegion.troops,
          currentAttackerTroops: count,
          currentDefenderTroops: targetRegion.troops,
          attackerComposition: atkComp,
          defenderComposition: { ...targetRegion.composition },
          terrain: targetRegion.terrain,
          rounds: [],
          currentRound: 0,
          finished: false,
          winner: null,
          attackerLosses: 0,
          defenderLosses: 0,
          fromRegionId: fromRegionId
        };

        // Salvar batalha no estado para exibir o painel/modal de combate round-a-round
        return {
          ...prev,
          regions: updatedRegions,
          activeBattle
        };
      }
    });
  };

  // Executar uma rodada (round) de combate por turno
  const executeBattleRound = () => {
    setGameState(prev => {
      if (!prev.activeBattle || prev.activeBattle.finished) return prev;

      const battle = { ...prev.activeBattle };
      const updatedRegions = { ...prev.regions };
      const updatedFactions = { ...prev.factions };
      const characters = [...prev.characters];
      const currentTurn = prev.currentTurn;

      const nextRound = battle.currentRound + 1;
      const attackerFaction = prev.factions[battle.attacker];
      const defenderFaction = prev.factions[battle.defender];
      const targetRegion = updatedRegions[battle.regionId];

      // Buscar comandantes (Generais)
      const attackerCommander = characters.find(
        c => c.faction === battle.attacker && c.role === 'GENERAL' && (c.location === battle.fromRegionId || c.location === battle.regionId) && c.status === 'DISPONIVEL'
      );
      const defenderCommander = characters.find(
        c => c.faction === battle.defender && c.role === 'GENERAL' && c.location === battle.regionId && c.status === 'DISPONIVEL'
      );

      const attackerStrategyBonus = attackerCommander ? attackerCommander.skills.strategy : 0;
      const defenderStrategyBonus = defenderCommander ? defenderCommander.skills.strategy : 0;

      // Rolagens tácticas (1d6)
      const attackerRoll = Math.floor(Math.random() * 6) + 1;
      const defenderRoll = Math.floor(Math.random() * 6) + 1;

      // Calcular o Poder de Combate (afetado por fuzis, estratégia militar e moral de prontidão)
      const attackerPower = (battle.currentAttackerTroops + attackerStrategyBonus) * (attackerFaction.nationalMorale / 100) * (attackerRoll + 2);
      const defenderPower = (battle.currentDefenderTroops + defenderStrategyBonus + targetRegion.defenseRating) * (targetRegion.morale / 100) * (defenderRoll + 2);

      // Calcular o Dano de Combate Inicial
      let attackerDmg = attackerPower * 0.12;
      let defenderDmg = defenderPower * 0.12;

      // Aplicar modificador estrito baseado no terreno correspondente
      let terrainDescValue = '';
      switch (battle.terrain) {
        case 'Urbano':
          // Redução drástica para o atacante pelas guarnições urbanas
          attackerDmg *= 0.65;
          terrainDescValue = 'Terreno Urbano: Linhas de trincheira e abrigos reduzem eficácia do atacante em -35%.';
          break;
        case 'Floresta':
          // Emboscadas na selva geram comportamento inconstante
          const forestryChaosFactor = 0.75 + Math.random() * 0.50; // 0.75x a 1.25x
          attackerDmg *= forestryChaosFactor;
          defenderDmg *= (0.75 + Math.random() * 0.50);
          terrainDescValue = 'Selva Atlântica: Emboscadas e visibilidade nula dispersam o poder das linhas de choque.';
          break;
        case 'Chaco':
          // Desgaste escalado severo do calor
          terrainDescValue = 'Frente do Chaco: Clima árido impõe perdas adicionais bilaterais por esgotamento de suprimentos.';
          break;
        case 'Pantanal':
          // Desvantagem de atoleiros
          attackerDmg *= 0.70;
          terrainDescValue = 'Pantanal alagadiço: Cavalarias de blindados atolam. Penalidade de 30% no dano direto atacante.';
          break;
        case 'Rio/Barragem':
          // Travessia de rio em Itaipu/Rio Paraná é sangrenta
          const isAtkDoubleSize = battle.currentAttackerTroops >= battle.currentDefenderTroops * 2;
          const riverBarrierPenalty = isAtkDoubleSize ? 0.75 : 0.50;
          attackerDmg *= riverBarrierPenalty;
          terrainDescValue = isAtkDoubleSize 
            ? 'Travessia de Represa: Vantagem de ofensiva em massa (2:1) atenua penalidade na ponte para 25%.'
            : 'Travessia de Rio/Represa: Avanço frontal sob fogo de barragem de Itaipu. Atacante sofre -50% de eficácia.';
          break;
        case 'Campo Aberto':
          // Conflito puro de atrito
          attackerDmg *= 1.40;
          defenderDmg *= 1.40;
          terrainDescValue = 'Campo de Pradaria Aberta: Sem fortificações ou coberturas de relevo. +40% de baixas bilaterais.';
          break;
      }

      // Aplicar modificadores de composição de unidades × terreno
      const atkCompMult = calcCompositionMultiplier(battle.attackerComposition, battle.currentAttackerTroops, battle.terrain);
      const defCompMult = calcCompositionMultiplier(battle.defenderComposition, battle.currentDefenderTroops, battle.terrain);
      attackerDmg *= atkCompMult;
      defenderDmg *= defCompMult;

      // Aplicar modificadores climáticos (motor real-time)
      const zonaClimatica = regiaoParaZonaClimatica(battle.regionId);
      const clima = engineManager.getSimState()?.climaGlobal[zonaClimatica];
      let weatherDesc = '';
      if (clima) {
        // Visibilidade reduzida prejudica mais o atacante (avança em terreno desconhecido)
        if (clima.visibilidadeCoeficiente < 0.5) {
          attackerDmg *= 0.80;
          weatherDesc = ` Condição climática (${clima.condicao}): visibilidade reduzida penaliza atacante em -20%.`;
        }
        // Bloqueio de radar prejudica defensor (perde vantagem de monitoramento)
        if (clima.bloqueioRadarCoeficiente > 0.5) {
          defenderDmg *= 0.90;
          weatherDesc += ` Interferência eletromagnética severa: defensor perde 10% de eficácia de radar.`;
        }
        // Garantir que terreno + clima não ultrapassem -80% total (cap de segurança)
        const minDmgAttacker = defenderDmg * 0.20;
        const minDmgDefender = attackerDmg * 0.20;
        attackerDmg = Math.max(minDmgAttacker, attackerDmg);
        defenderDmg = Math.max(minDmgDefender, defenderDmg);
      }

      // Consolidar perdas do turno
      let atkLosses = Math.min(battle.currentAttackerTroops, Math.max(1, Math.floor(defenderDmg)));
      let defLosses = Math.min(battle.currentDefenderTroops, Math.max(1, Math.floor(attackerDmg)));

      // Desgaste de insustentabilidade do Chaco
      if (battle.terrain === 'Chaco' && nextRound % 2 === 0) {
        atkLosses = Math.min(battle.currentAttackerTroops, atkLosses + 1);
        defLosses = Math.min(battle.currentDefenderTroops, defLosses + 1);
      }

      const nextAtkTroops = Math.max(0, battle.currentAttackerTroops - atkLosses);
      const nextDefTroops = Math.max(0, battle.currentDefenderTroops - defLosses);

      const logMsg = `Round ${nextRound}: Atacante rola [${attackerRoll}], tirando ${defLosses} baixas. Defensor rola [${defenderRoll}], abatendo ${atkLosses} brigadas.${weatherDesc}`;

      const newRound: BattleRound = {
        round: nextRound,
        attackerRoll,
        attackerDamage: defLosses,
        defenderRoll,
        defenderDamage: atkLosses,
        attackerTroopsLeft: nextAtkTroops,
        defenderTroopsLeft: nextDefTroops,
        log: logMsg
      };

      battle.currentAttackerTroops = nextAtkTroops;
      battle.currentDefenderTroops = nextDefTroops;
      battle.attackerLosses += atkLosses;
      battle.defenderLosses += defLosses;
      battle.rounds.push(newRound);
      battle.currentRound = nextRound;

      const isAttakerDead = nextAtkTroops <= 0;
      const isDefenderDead = nextDefTroops <= 0;

      if (isAttakerDead || isDefenderDead) {
        battle.finished = true;
        let isAttackerWinner = false;

        if (isDefenderDead && !isAttakerDead) {
          isAttackerWinner = true;
          battle.winner = battle.attacker;
        } else if (isAttakerDead && !isDefenderDead) {
          isAttackerWinner = false;
          battle.winner = battle.defender;
        } else {
          isAttackerWinner = false;
          battle.winner = battle.defender; // Defensor ganha em caso de mútua aniquilação
        }

        let finalReportLog = '';
        let intensityValue: 'BAIXA' | 'MEDIA' | 'ALTA' = 'MEDIA';
        const totalCasualties = battle.attackerLosses + battle.defenderLosses;
        if (totalCasualties > 15) intensityValue = 'ALTA';
        else if (totalCasualties < 6) intensityValue = 'BAIXA';

        if (isAttackerWinner) {
          updatedRegions[battle.regionId].controller = battle.attacker;
          updatedRegions[battle.regionId].troops = nextAtkTroops;
          updatedRegions[battle.regionId].composition = scaleComposition(battle.attackerComposition, battle.attackerInitialTroops, nextAtkTroops);
          updatedRegions[battle.regionId].morale = Math.max(15, Math.floor(targetRegion.morale - 20));

          finalReportLog = `CONQUISTA DO SETOR ${targetRegion.name}! Nossas forças terrestres aniquilaram as defesas do oponente. Terreno: ${battle.terrain}. ${nextAtkTroops} brigadas operam agora para consolidar o perímetro de ocupação. Baixas: Atacante [-${battle.attackerLosses}] | Defensor [-${battle.defenderLosses}].`;
        } else {
          const defSurv = Math.max(1, nextDefTroops);
          updatedRegions[battle.regionId].troops = defSurv;
          updatedRegions[battle.regionId].composition = scaleComposition(battle.defenderComposition, battle.defenderInitialTroops, defSurv);
          updatedRegions[battle.regionId].morale = Math.max(25, Math.floor(targetRegion.morale - 10));

          if (nextAtkTroops > 0) {
            const retComp = scaleComposition(battle.attackerComposition, battle.attackerInitialTroops, nextAtkTroops);
            updatedRegions[battle.fromRegionId].troops += nextAtkTroops;
            updatedRegions[battle.fromRegionId].composition = {
              INFANTARIA: updatedRegions[battle.fromRegionId].composition.INFANTARIA + retComp.INFANTARIA,
              BLINDADOS:  updatedRegions[battle.fromRegionId].composition.BLINDADOS  + retComp.BLINDADOS,
              ARTILHARIA: updatedRegions[battle.fromRegionId].composition.ARTILHARIA + retComp.ARTILHARIA,
              FORCA_ESPECIAL: updatedRegions[battle.fromRegionId].composition.FORCA_ESPECIAL + retComp.FORCA_ESPECIAL,
            };
            finalReportLog = `RECUO DEFENSIVO EM ${targetRegion.name}. A ofensiva tática falhou contra as linhas fortificadas oponentes. ${nextAtkTroops} fuzileiros retrocederam em segurança para ${updatedRegions[battle.fromRegionId].name}. Baixas: Atacante [-${battle.attackerLosses}] | Defensor [-${battle.defenderLosses}].`;
          } else {
            finalReportLog = `ANIQUILAÇÃO TOTAL DAS FORÇAS DE ASSALTO na ofensiva em ${targetRegion.name}. Nossas brigadas caíram integralmente no combate. Baixas: Atacante [-${battle.attackerLosses}] | Defensor [-${battle.defenderLosses}].`;
          }
        }

        // Criar Relatório de Batalha Detalhado
        const bReport: BattleReport = {
          turn: currentTurn,
          region: battle.regionId,
          attacker: battle.attacker,
          defender: battle.defender,
          attackerTroopsBefore: battle.attackerInitialTroops,
          defenderTroopsBefore: battle.defenderInitialTroops,
          attackerLosses: battle.attackerLosses,
          defenderLosses: battle.defenderLosses,
          winner: battle.winner!,
          conquered: isAttackerWinner,
          intensity: intensityValue,
          details: `${terrainDescValue} Após ${battle.currentRound} turnos de fogo cruzado e confrontação tática móvel, a batalha resultou em: ` + finalReportLog
        };

        const newMilitLog: HistoryLog = {
          id: `battle_done_${currentTurn}_${Date.now()}`,
          turn: currentTurn,
          type: 'MILITAR',
          message: finalReportLog
        };

        // Penalidades e ajustes nos Generais presentes
        if (attackerCommander) {
          attackerCommander.morale = Math.max(20, Math.min(100, attackerCommander.morale + (isAttackerWinner ? 10 : -20)));
        }
        if (defenderCommander) {
          defenderCommander.morale = Math.max(20, Math.min(100, defenderCommander.morale + (!isAttackerWinner ? 10 : -20)));
        }

        return {
          ...prev,
          regions: updatedRegions,
          activeBattle: battle,
          historyLogs: [newMilitLog, ...prev.historyLogs],
          battleReports: [bReport, ...prev.battleReports]
        };
      }

      return {
        ...prev,
        activeBattle: battle
      };
    });
  };

  // Simular e resolver a batalha de imediato passo a passo de forma síncrona
  const autoResolveBattle = () => {
    setGameState(prev => {
      if (!prev.activeBattle || prev.activeBattle.finished) return prev;

      let tempState = { ...prev };
      let loops = 0;

      while (tempState.activeBattle && !tempState.activeBattle.finished && loops < 100) {
        loops++;
        const battle = { ...tempState.activeBattle };
        const updatedRegions = { ...tempState.regions };
        const updatedFactions = { ...tempState.factions };
        const characters = [...tempState.characters];
        const currentTurn = tempState.currentTurn;

        const nextRound = battle.currentRound + 1;
        const attackerFaction = tempState.factions[battle.attacker];
        const defenderFaction = tempState.factions[battle.defender];
        const targetRegion = updatedRegions[battle.regionId];

        const attackerCommander = characters.find(
          c => c.faction === battle.attacker && c.role === 'GENERAL' && (c.location === battle.fromRegionId || c.location === battle.regionId) && c.status === 'DISPONIVEL'
        );
        const defenderCommander = characters.find(
          c => c.faction === battle.defender && c.role === 'GENERAL' && c.location === battle.regionId && c.status === 'DISPONIVEL'
        );

        const attackerStrategyBonus = attackerCommander ? attackerCommander.skills.strategy : 0;
        const defenderStrategyBonus = defenderCommander ? defenderCommander.skills.strategy : 0;

        const attackerRoll = Math.floor(Math.random() * 6) + 1;
        const defenderRoll = Math.floor(Math.random() * 6) + 1;

        const attackerPower = (battle.currentAttackerTroops + attackerStrategyBonus) * (attackerFaction.nationalMorale / 100) * (attackerRoll + 2);
        const defenderPower = (battle.currentDefenderTroops + defenderStrategyBonus + targetRegion.defenseRating) * (targetRegion.morale / 100) * (defenderRoll + 2);

        let attackerDmg = attackerPower * 0.12;
        let defenderDmg = defenderPower * 0.12;

        let terrainDescValue = '';
        switch (battle.terrain) {
          case 'Urbano':
            attackerDmg *= 0.65;
            terrainDescValue = 'Terreno Urbano: Linhas de trincheira e abrigos reduzem eficácia do atacante em -35%.';
            break;
          case 'Floresta':
            const forestryChaosFactor = 0.75 + Math.random() * 0.50;
            attackerDmg *= forestryChaosFactor;
            defenderDmg *= (0.75 + Math.random() * 0.55);
            terrainDescValue = 'Selva Atlântica: Emboscadas e visibilidade nula dispersam o poder das linhas de choque.';
            break;
          case 'Chaco':
            terrainDescValue = 'Frente do Chaco: Clima árido impõe perdas adicionais bilaterais por esgotamento de suprimentos.';
            break;
          case 'Pantanal':
            attackerDmg *= 0.70;
            terrainDescValue = 'Pantanal alagadiço: Cavalarias de blindados atolam. Penalidade de 30% no dano direto atacante.';
            break;
          case 'Rio/Barragem':
            const isAtkDoubleSize = battle.currentAttackerTroops >= battle.currentDefenderTroops * 2;
            const riverBarrierPenalty = isAtkDoubleSize ? 0.75 : 0.50;
            attackerDmg *= riverBarrierPenalty;
            terrainDescValue = isAtkDoubleSize 
              ? 'Travessia de Represa: Vantagem de ofensiva em massa (2:1) atenua penalidade na ponte para 25%.'
              : 'Travessia de Rio/Represa: Avanço frontal sob fogo de barragem de Itaipu. Atacante sofre -50% de eficácia.';
            break;
          case 'Campo Aberto':
            attackerDmg *= 1.40;
            defenderDmg *= 1.40;
            terrainDescValue = 'Campo de Pradaria Aberta: Sem fortificações ou coberturas de relevo. +40% de baixas bilaterais.';
            break;
        }

        // Aplicar modificadores de composição de unidades × terreno
        attackerDmg *= calcCompositionMultiplier(battle.attackerComposition, battle.currentAttackerTroops, battle.terrain);
        defenderDmg *= calcCompositionMultiplier(battle.defenderComposition, battle.currentDefenderTroops, battle.terrain);

        let atkLosses = Math.min(battle.currentAttackerTroops, Math.max(1, Math.floor(defenderDmg)));
        let defLosses = Math.min(battle.currentDefenderTroops, Math.max(1, Math.floor(attackerDmg)));

        if (battle.terrain === 'Chaco' && nextRound % 2 === 0) {
          atkLosses = Math.min(battle.currentAttackerTroops, atkLosses + 1);
          defLosses = Math.min(battle.currentDefenderTroops, defLosses + 1);
        }

        const nextAtkTroops = Math.max(0, battle.currentAttackerTroops - atkLosses);
        const nextDefTroops = Math.max(0, battle.currentDefenderTroops - defLosses);

        const logMsg = `Round ${nextRound}: Atacante rola [${attackerRoll}], tirando ${defLosses} baixas. Defensor rola [${defenderRoll}], abatendo ${atkLosses} brigadas.`;

        const newRound: BattleRound = {
          round: nextRound,
          attackerRoll,
          attackerDamage: defLosses,
          defenderRoll,
          defenderDamage: atkLosses,
          attackerTroopsLeft: nextAtkTroops,
          defenderTroopsLeft: nextDefTroops,
          log: logMsg
        };

        battle.currentAttackerTroops = nextAtkTroops;
        battle.currentDefenderTroops = nextDefTroops;
        battle.attackerLosses += atkLosses;
        battle.defenderLosses += defLosses;
        battle.rounds.push(newRound);
        battle.currentRound = nextRound;

        const isAttakerDead = nextAtkTroops <= 0;
        const isDefenderDead = nextDefTroops <= 0;

        if (isAttakerDead || isDefenderDead) {
          battle.finished = true;
          let isAttackerWinner = false;

          if (isDefenderDead && !isAttakerDead) {
            isAttackerWinner = true;
            battle.winner = battle.attacker;
          } else if (isAttakerDead && !isDefenderDead) {
            isAttackerWinner = false;
            battle.winner = battle.defender;
          } else {
            isAttackerWinner = false;
            battle.winner = battle.defender;
          }

          let finalReportLog = '';
          let intensityValue: 'BAIXA' | 'MEDIA' | 'ALTA' = 'MEDIA';
          const totalCasualties = battle.attackerLosses + battle.defenderLosses;
          if (totalCasualties > 15) intensityValue = 'ALTA';
          else if (totalCasualties < 6) intensityValue = 'BAIXA';

          if (isAttackerWinner) {
            updatedRegions[battle.regionId].controller = battle.attacker;
            updatedRegions[battle.regionId].troops = nextAtkTroops;
            updatedRegions[battle.regionId].composition = scaleComposition(battle.attackerComposition, battle.attackerInitialTroops, nextAtkTroops);
            updatedRegions[battle.regionId].morale = Math.max(15, Math.floor(targetRegion.morale - 20));
            finalReportLog = `CONQUISTA DO SETOR ${targetRegion.name}! Nossas forças terrestres aniquilaram as defesas do oponente. Terreno: ${battle.terrain}. ${nextAtkTroops} brigadas operam agora para consolidar o perímetro de ocupação. Baixas: Atacante [-${battle.attackerLosses}] | Defensor [-${battle.defenderLosses}].`;
          } else {
            const defSurv = Math.max(1, nextDefTroops);
            updatedRegions[battle.regionId].troops = defSurv;
            updatedRegions[battle.regionId].composition = scaleComposition(battle.defenderComposition, battle.defenderInitialTroops, defSurv);
            updatedRegions[battle.regionId].morale = Math.max(25, Math.floor(targetRegion.morale - 10));

            if (nextAtkTroops > 0) {
              const retComp = scaleComposition(battle.attackerComposition, battle.attackerInitialTroops, nextAtkTroops);
              updatedRegions[battle.fromRegionId].troops += nextAtkTroops;
              updatedRegions[battle.fromRegionId].composition = {
                INFANTARIA: updatedRegions[battle.fromRegionId].composition.INFANTARIA + retComp.INFANTARIA,
                BLINDADOS:  updatedRegions[battle.fromRegionId].composition.BLINDADOS  + retComp.BLINDADOS,
                ARTILHARIA: updatedRegions[battle.fromRegionId].composition.ARTILHARIA + retComp.ARTILHARIA,
                FORCA_ESPECIAL: updatedRegions[battle.fromRegionId].composition.FORCA_ESPECIAL + retComp.FORCA_ESPECIAL,
              };
              finalReportLog = `RECUO DEFENSIVO EM ${targetRegion.name}. A ofensiva tática falhou contra as linhas fortificadas oponentes. ${nextAtkTroops} fuzileiros retrocederam em segurança para ${updatedRegions[battle.fromRegionId].name}. Baixas: Atacante [-${battle.attackerLosses}] | Defensor [-${battle.defenderLosses}].`;
            } else {
              finalReportLog = `ANIQUILAÇÃO TOTAL DAS FORÇAS DE ASSALTO na ofensiva em ${targetRegion.name}. Nossas brigadas caíram integralmente no combate. Baixas: Atacante [-${battle.attackerLosses}] | Defensor [-${battle.defenderLosses}].`;
            }
          }

          const bReport: BattleReport = {
            turn: currentTurn,
            region: battle.regionId,
            attacker: battle.attacker,
            defender: battle.defender,
            attackerTroopsBefore: battle.attackerInitialTroops,
            defenderTroopsBefore: battle.defenderInitialTroops,
            attackerLosses: battle.attackerLosses,
            defenderLosses: battle.defenderLosses,
            winner: battle.winner!,
            conquered: isAttackerWinner,
            intensity: intensityValue,
            details: `${terrainDescValue} Após ${battle.currentRound} turnos de fogo cruzado e confrontação tática móvel, a batalha resultou em: ` + finalReportLog
          };

          const newMilitLog: HistoryLog = {
            id: `battle_done_${currentTurn}_${Date.now()}`,
            turn: currentTurn,
            type: 'MILITAR',
            message: finalReportLog
          };

          if (attackerCommander) {
            attackerCommander.morale = Math.max(20, Math.min(100, attackerCommander.morale + (isAttackerWinner ? 10 : -20)));
          }
          if (defenderCommander) {
            defenderCommander.morale = Math.max(20, Math.min(100, defenderCommander.morale + (!isAttackerWinner ? 10 : -20)));
          }

          tempState = {
            ...tempState,
            regions: updatedRegions,
            activeBattle: battle,
            historyLogs: [newMilitLog, ...tempState.historyLogs],
            battleReports: [bReport, ...tempState.battleReports],
            characters
          };
          break; // sair do while
        }

        tempState = {
          ...tempState,
          activeBattle: battle
        };
      }

      return tempState;
    });
  };

  // Recuar da batalha de forma imersiva e voluntária
  const retreatBattle = () => {
    setGameState(prev => {
      if (!prev.activeBattle || prev.activeBattle.finished) return prev;

      const battle = { ...prev.activeBattle };
      const updatedRegions = { ...prev.regions };
      const currentTurn = prev.currentTurn;

      const survivingTroops = battle.currentAttackerTroops;

      if (survivingTroops > 0) {
        const retComp = scaleComposition(battle.attackerComposition, battle.attackerInitialTroops, survivingTroops);
        updatedRegions[battle.fromRegionId].troops += survivingTroops;
        updatedRegions[battle.fromRegionId].composition = {
          INFANTARIA: updatedRegions[battle.fromRegionId].composition.INFANTARIA + retComp.INFANTARIA,
          BLINDADOS:  updatedRegions[battle.fromRegionId].composition.BLINDADOS  + retComp.BLINDADOS,
          ARTILHARIA: updatedRegions[battle.fromRegionId].composition.ARTILHARIA + retComp.ARTILHARIA,
          FORCA_ESPECIAL: updatedRegions[battle.fromRegionId].composition.FORCA_ESPECIAL + retComp.FORCA_ESPECIAL,
        };
      }

      battle.finished = true;
      battle.winner = battle.defender;

      const retreatDesc = `REMETIDO RECUO VOLUNTÁRIO em ${updatedRegions[battle.regionId].name}. Nossos batalhões evacuaram pântanos e ravinas estrategicamente. ${survivingTroops} sobreviventes recuaram para ${updatedRegions[battle.fromRegionId].name}.`;

      const bReport: BattleReport = {
        turn: currentTurn,
        region: battle.regionId,
        attacker: battle.attacker,
        defender: battle.defender,
        attackerTroopsBefore: battle.attackerInitialTroops,
        defenderTroopsBefore: battle.defenderInitialTroops,
        attackerLosses: battle.attackerLosses,
        defenderLosses: battle.defenderLosses,
        winner: battle.defender,
        conquered: false,
        intensity: 'BAIXA',
        details: `O Comando Central tático optou por retirar as forças durante o round ${battle.currentRound}. ` + retreatDesc
      };

      const newMilitLog: HistoryLog = {
        id: `retreat_${currentTurn}_${Date.now()}`,
        turn: currentTurn,
        type: 'MILITAR',
        message: retreatDesc
      };

      return {
        ...prev,
        regions: updatedRegions,
        activeBattle: battle,
        historyLogs: [newMilitLog, ...prev.historyLogs],
        battleReports: [bReport, ...prev.battleReports]
      };
    });
  };

  const closeBattleReport = () => {
    setGameState(prev => ({
      ...prev,
      activeBattle: null
    }));
  };

  // Posicionar personagem em missão especializada
  const deployCharacterMission = (
    characterId: string, 
    regionId: RegionID, 
    missionType: 'DEFESA' | 'SABOTAGEM' | 'DIPLOMACIA' | 'PRODUCAO'
  ) => {
    setGameState(prev => {
      const updatedChars = prev.characters.map(char => {
        if (char.id === characterId) {
          let desc = '';
          let turns = 2;
          
          switch (missionType) {
            case 'DEFESA':
              desc = `Fortificando trincheiras e organizando logística militar em ${prev.regions[regionId].name}.`;
              turns = 2;
              break;
            case 'SABOTAGEM':
              desc = `Semeando contrainformação e sabotando linhas de abastecimento em ${prev.regions[regionId].name}.`;
              turns = 3;
              break;
            case 'DIPLOMACIA':
              desc = `Realizando encontros com autoridades locais para expandir lealdade geopolítica em ${prev.regions[regionId].name}.`;
              turns = 2;
              break;
            case 'PRODUCAO':
              desc = `Otimizando instalações locais em ${prev.regions[regionId].name} para maximizar retornos de guerra.`;
              turns = 2;
              break;
          }

          return {
            ...char,
            status: 'EM_MISSAO' as const,
            location: regionId,
            currentMissionDescription: desc,
            turnsInMissionLeft: turns
          };
        }
        return char;
      });

      const characterName = prev.characters.find(c => c.id === characterId)?.name || 'Especialista';
      const regionName = prev.regions[regionId].name;

      const newLog: HistoryLog = {
        id: `char_deploy_${prev.currentTurn}_${Date.now()}`,
        turn: prev.currentTurn,
        type: 'DIPLOMACIA',
        message: `Designado(a) ${characterName} para missão de ${missionType} em ${regionName}. Estimativa: 2-3 turnos.`
      };

      return {
        ...prev,
        characters: updatedChars,
        historyLogs: [newLog, ...prev.historyLogs]
      };
    });
  };

  // Realizar ação diplomática ativa com outra facção
  const performDiplomacy = (
    targetFactionId: FactionID, 
    action: 'PACTO_NAO_AGRESSAO' | 'DIPLOMACIA_PRESENCIAL' | 'FINANCIAR' | 'DECLARAR_GUERRA'
  ) => {
    setGameState(prev => {
      const updatedRelations = [...prev.relations];
      const updatedFactions = { ...prev.factions };
      const playerFac = updatedFactions[prev.playerFaction];

      const relIdx = updatedRelations.findIndex(
        r => (r.factionA === prev.playerFaction && r.factionB === targetFactionId) ||
             (r.factionA === targetFactionId && r.factionB === prev.playerFaction)
      );

      if (relIdx === -1) return prev;

      let scoreChange = 0;
      let costFunds = 0;
      let treatyToAdd: string | null = null;
      let treatyToRemove: string | null = null;
      let logMsg = '';

      switch (action) {
        case 'PACTO_NAO_AGRESSAO':
          if (updatedRelations[relIdx].value < -10) {
            logMsg = `Fracasso: A facção ${updatedFactions[targetFactionId].name} recusou o tratado civil devido à hostilidade ativa.`;
          } else {
            costFunds = 25;
            if (playerFac.resources.funds >= costFunds) {
              scoreChange = 15;
              treatyToAdd = 'Pacto de Não-Agressão';
              logMsg = `Sucesso: Assinado o Pacto de Não-Agressão com ${updatedFactions[targetFactionId].name}.`;
            } else {
              logMsg = 'Fundos insuficientes para selar os acordos internacionais.';
            }
          }
          break;
        case 'DIPLOMACIA_PRESENCIAL':
          costFunds = 15;
          if (playerFac.resources.funds >= costFunds) {
            scoreChange = 12;
            logMsg = `Sucesso: Enviada delegação brasileira formal para ${updatedFactions[targetFactionId].name}. Relações aumentadas em +12.`;
          } else {
            logMsg = 'Recursos governamentais indisponíveis para visitas diplomáticas.';
          }
          break;
        case 'FINANCIAR':
          costFunds = 40;
          if (playerFac.resources.funds >= costFunds) {
            scoreChange = 30;
            updatedFactions[targetFactionId].resources.funds += 30;
            logMsg = `Doado auxílio econômico de F$ 30 às forças de ${updatedFactions[targetFactionId].name}. Relações subiram +30.`;
          } else {
            logMsg = 'Deficit financeiro impossibilita envio de apoio monetário externo.';
          }
          break;
        case 'DECLARAR_GUERRA':
          scoreChange = -60;
          treatyToRemove = 'Pacto de Não-Agressão';
          logMsg = `ATENÇÃO: O Brasil declarou oficialmente estado de hostilidades contra a facção ${updatedFactions[targetFactionId].name}!`;
          break;
      }

      if (costFunds > 0 && playerFac.resources.funds >= costFunds) {
        playerFac.resources.funds -= costFunds;
      } else if (costFunds > 0 && action !== 'PACTO_NAO_AGRESSAO') {
        return prev; // abort
      }

      // Aplicar relações modificadas
      updatedRelations[relIdx].value = Math.max(-100, Math.min(100, updatedRelations[relIdx].value + scoreChange));
      
      if (treatyToAdd && !updatedRelations[relIdx].treaties.includes(treatyToAdd)) {
        updatedRelations[relIdx].treaties.push(treatyToAdd);
      }
      if (treatyToRemove) {
        updatedRelations[relIdx].treaties = updatedRelations[relIdx].treaties.filter(t => t !== treatyToRemove);
      }

      const newLog: HistoryLog = {
        id: `diplomacy_${prev.currentTurn}_${Date.now()}`,
        turn: prev.currentTurn,
        type: 'DIPLOMACIA',
        message: logMsg
      };

      return {
        ...prev,
        factions: updatedFactions,
        relations: updatedRelations,
        historyLogs: [newLog, ...prev.historyLogs]
      };
    });
  };


  // Resolver Missões Ativas de Personagens
  const resolveCharacterMissions = (
    characters: Character[], 
    regions: Record<RegionID, Region>, 
    factions: Record<FactionID, Faction>,
    logs: HistoryLog[]
  ) => {
    return characters.map(char => {
      if (char.status === 'EM_MISSAO') {
        const left = char.turnsInMissionLeft - 1;
        if (left <= 0) {
          // Missão completada! Gerar bônus e notificar log
          const playerFac = factions[char.faction];
          const currentRegion = regions[char.location as RegionID];
          let bonusMsg = '';

          if (char.role === 'GENERAL') {
            currentRegion.troops += 3;
            currentRegion.morale = Math.min(100, currentRegion.morale + 10);
            bonusMsg = `General ${char.name} completou adestramento militar: adicionado +3 brigadas táticas e elevou a moral de ${currentRegion.name} em +10%.`;
          } else if (char.role === 'ESPIAO') {
            playerFac.resources.supplies += 60;
            currentRegion.morale = Math.max(0, currentRegion.morale - 15);
            bonusMsg = `Espião(ã) ${char.name} infiltrou-se nas depósitos inimigos: desviou +60 suprimentos e desestabilizou a moral da população em ${currentRegion.name} (-15).`;
          } else if (char.role === 'DIPLOMATA') {
            playerFac.resources.funds += 40;
            currentRegion.morale = Math.min(100, currentRegion.morale + 15);
            bonusMsg = `Diplomata ${char.name} concluiu rodadas de paz na região: rendeu +F$ 40 em créditos alfandegários e elevou a estabilidade de ${currentRegion.name} (+15).`;
          }

          logs.unshift({
            id: `mission_end_${char.id}_${Date.now()}`,
            turn: gameState.currentTurn,
            type: 'EVENTO',
            message: `✅ OPERAÇÃO CONCLUÍDA: ${bonusMsg}`
          });

          return {
            ...char,
            status: 'DISPONIVEL' as const,
            currentMissionDescription: null,
            turnsInMissionLeft: 0,
            morale: Math.min(100, char.morale + 5)
          };
        } else {
          return {
            ...char,
            turnsInMissionLeft: left
          };
        }
      }
      return char;
    });
  };

  // Avançar Turno (Uma semana de guerra por turno)
  const advanceTurn = () => {
    if (gameState.currentTurn === 0 || gameState.activeEvent !== null) return;

    // Avalia condições ANTES do setGameState para capturar o estado atual
    const condicaoAtual = avaliarCondicoes(gameState);
    const apiKeyDisponivel = !!(import.meta.env as Record<string, string | undefined>)['VITE_GEMINI_API_KEY'];
    const nextTurnNum = gameState.currentTurn + 1;

    // Determina antecipadamente se este turno vai gerar evento pelo Gemini.
    // Turnos fixos (2, 5, 10) e estados de fim de jogo usam eventos pré-definidos.
    const isFixedTurn = nextTurnNum === 2 || nextTurnNum === 5 || nextTurnNum === 10;
    const playerControlsItaipu  = gameState.regions['ITAIPU']?.controller  === gameState.playerFaction;
    const playerControlsAssuncao = gameState.regions['ASSUNCAO']?.controller === gameState.playerFaction;
    const playerControlsCde      = gameState.regions['CIUDAD_DEL_ESTE']?.controller === gameState.playerFaction;
    const playerControlsBrasilia = gameState.regions['BRASILIA']?.controller === gameState.playerFaction;
    const isVictoryOrDefeat =
      (playerControlsItaipu && playerControlsAssuncao && playerControlsCde) ||
      !playerControlsBrasilia || !playerControlsItaipu;
    const isEndGameTurn = nextTurnNum >= 15 || isVictoryOrDefeat;
    const useGeminiForEvent = apiKeyDisponivel && !isFixedTurn && !isEndGameTurn;

    if (useGeminiForEvent) {
      pendingEventContextRef.current = {
        conditionType: condicaoAtual,
        gameStateCopy: { ...gameState, historyLogs: gameState.historyLogs.slice(0, 10) },
      };
    }

    setGameState(prev => {
      const nextTurn = prev.currentTurn + 1;
      const updatedFactions = JSON.parse(JSON.stringify(prev.factions)) as Record<FactionID, Faction>;
      const updatedRegions = JSON.parse(JSON.stringify(prev.regions)) as Record<RegionID, Region>;
      const updatedRelations = [...prev.relations];
      const internalLogs: HistoryLog[] = [];

      let currentPopularSupport = prev.popularSupport;
      let currentPoliticalStability = prev.politicalStability;

      // 1. Coleta automática de recursos por região para a facção controladora
      // com modificadores macroeconômicos do motor real-time (EconomySystem)
      const simEconBrasil = engineManager.getSimState()?.facoes['BRASIL']?.estadoEconomico ?? null;
      const simEconParaguai = engineManager.getSimState()?.facoes['PARAGUAI']?.estadoEconomico ?? null;

      Object.values(updatedRegions).forEach((region: Region) => {
        const leaderFaction = region.controller;
        const faction = updatedFactions[leaderFaction];

        const econState = leaderFaction === 'BRASIL' ? simEconBrasil
                        : leaderFaction === 'PARAGUAI' ? simEconParaguai
                        : null;

        // Modificador de fundos: PIB crescente aumenta arrecadação, recessão corta receitas
        let fundsModifier = 1.0;
        // Modificador de suprimentos: inflação alta corrói o poder de compra
        let suppliesModifier = 1.0;

        if (econState) {
          const pibBonus = Math.min(0.30, Math.max(-0.25, econState.pibCrescimento * 5));
          fundsModifier = Math.min(1.8, Math.max(0.4, 1.0 + pibBonus));

          const inflacaoExcesso = Math.max(0, econState.inflacao - 0.05); // acima de 5% base
          suppliesModifier = Math.min(1.0, Math.max(0.5, 1.0 - inflacaoExcesso * 3));
        }

        faction.resources.funds += Math.round(region.fundsProduction * fundsModifier);
        faction.resources.supplies += Math.round(region.supplyProduction * suppliesModifier);
        faction.resources.energy += region.energyProduction;
      });

      // 1.1 Consequências macroeconômicas no moral e estabilidade política
      const playerEcon = prev.playerFaction === 'BRASIL' ? simEconBrasil : simEconParaguai;
      if (playerEcon) {
        // Desemprego acima de 15% corrói apoio popular (cada ponto percentual extra = -1 apoio)
        if (playerEcon.desemprego > 0.15) {
          const desempregoPenalty = Math.floor((playerEcon.desemprego - 0.15) * 100);
          currentPopularSupport = Math.max(0, currentPopularSupport - desempregoPenalty);
          internalLogs.push({
            id: `econ_desemprego_${nextTurn}`,
            turn: nextTurn,
            type: 'ECONOMIA',
            message: `⚠️ CRISE DE EMPREGO: Desemprego em ${(playerEcon.desemprego * 100).toFixed(1)}% — tensão social aumenta, apoio popular caiu -${desempregoPenalty}.`
          });
        }

        // Inflação acima de 10% desestabiliza o governo
        if (playerEcon.inflacao > 0.10) {
          const inflacaoPenalty = Math.floor((playerEcon.inflacao - 0.10) * 50);
          currentPoliticalStability = Math.max(0, currentPoliticalStability - inflacaoPenalty);
          internalLogs.push({
            id: `econ_inflacao_${nextTurn}`,
            turn: nextTurn,
            type: 'ECONOMIA',
            message: `🔴 INFLAÇÃO CRÍTICA: ${(playerEcon.inflacao * 100).toFixed(1)}% ao ano — custo de vida dispara, estabilidade política caiu -${inflacaoPenalty}.`
          });
        }

        // PIB negativo impõe corte orçamentário emergencial
        if (playerEcon.pibCrescimento < 0) {
          const corteFunds = Math.max(5, Math.floor(Math.abs(playerEcon.pibCrescimento) * 200));
          updatedFactions[prev.playerFaction].resources.funds = Math.max(
            0,
            updatedFactions[prev.playerFaction].resources.funds - corteFunds
          );
          internalLogs.push({
            id: `econ_recessao_${nextTurn}`,
            turn: nextTurn,
            type: 'ECONOMIA',
            message: `🔴 RECESSÃO: PIB retraindo ${(Math.abs(playerEcon.pibCrescimento) * 100).toFixed(2)}% — corte emergencial de F$${corteFunds} no orçamento de guerra.`
          });
        }

        // PIB forte (>5%) gera bônus de produção
        if (playerEcon.pibCrescimento > 0.05) {
          const bonusFunds = Math.floor((playerEcon.pibCrescimento - 0.05) * 300);
          updatedFactions[prev.playerFaction].resources.funds += bonusFunds;
          internalLogs.push({
            id: `econ_crescimento_${nextTurn}`,
            turn: nextTurn,
            type: 'ECONOMIA',
            message: `✅ CRESCIMENTO ACELERADO: PIB a ${(playerEcon.pibCrescimento * 100).toFixed(1)}% — superávit industrial gerou +F$${bonusFunds} extras ao tesouro.`
          });
        }
      }

      // 1.2 Logística Regional — consumo de suprimentos por manutenção e penalidade de isolamento
      processarLogisticaRegional(
        updatedRegions,
        updatedFactions,
        REGION_ADJACENCY,
        nextTurn,
        internalLogs
      );

      // 1.5 Processar impactos contínuos da Infraestrutura Estratégica
      const acarayItem = prev.infrastructure.items.find(i => i.id === 'ACARAY');
      const yguazuItem = prev.infrastructure.items.find(i => i.id === 'YGUAZU');
      const rioParaguaiItem = prev.infrastructure.items.find(i => i.id === 'RIO_PARAGUAI');
      const apGuaraniItem = prev.infrastructure.items.find(i => i.id === 'AP_GUARANI');
      const corChinaItem = prev.infrastructure.items.find(i => i.id === 'CORREDOR_CHINA');

      const paraguaiFaction = updatedFactions['PARAGUAI'];

      // Se Acaray e Yguazú caírem, Paraguai entra em estado de emergência energética
      if (acarayItem?.status !== 'OPERATIONAL' && yguazuItem?.status !== 'OPERATIONAL') {
        currentPoliticalStability = Math.max(0, currentPoliticalStability - 8);
        paraguaiFaction.resources.funds = Math.max(0, paraguaiFaction.resources.funds - 10);
        internalLogs.push({
          id: `infra_impact_energy_${nextTurn}`,
          turn: nextTurn,
          type: 'SISTEMA',
          message: '🚨 CRISE ENERGÉTICA SEVERA: Acaray e Yguazú estão inoperantes! Paraguai raciona energia, indústrias estagnaram e a estabilidade política ruiu em -8.'
        });
      }

      // Se o Rio Paraguai for bloqueado/averiado, Assunção sofre com racionamento de água potável
      if (rioParaguaiItem?.status !== 'OPERATIONAL') {
        currentPopularSupport = Math.max(0, currentPopularSupport - 10);
        internalLogs.push({
          id: `infra_impact_water_${nextTurn}`,
          turn: nextTurn,
          type: 'ECONOMIA',
          message: '🚨 RACIOANAMENTO HÍDRICO EM ASSUNÇÃO: A estação de captação central do Rio Paraguai está inativa. O apoio popular à campanha despencou em -10.'
        });
      }

      // Se o Aeroporto Guaraní for destruído, Paraguai perde 80% do reabastecimento aéreo pesado
      if (apGuaraniItem?.status !== 'OPERATIONAL') {
        paraguaiFaction.resources.supplies = Math.max(0, paraguaiFaction.resources.supplies - 30);
        internalLogs.push({
          id: `infra_impact_airport_${nextTurn}`,
          turn: nextTurn,
          type: 'MILITAR',
          message: '🚨 COLAPSO DO HUB GUARANÍ (CDE): Cargas aéreas chinesas pesadas não conseguem pousar. Perda de suprimentos militares no leste.'
        });
      }

      // Se o corredor aéreo chinês for avariado, suprime reabastecimento de munições
      if (corChinaItem?.status !== 'OPERATIONAL') {
        paraguaiFaction.resources.supplies = Math.max(0, paraguaiFaction.resources.supplies - 15);
        internalLogs.push({
          id: `infra_impact_corridor_${nextTurn}`,
          turn: nextTurn,
          type: 'MILITAR',
          message: '🚨 EMBARGO AÉREO CONESUL: Corredor Aéreo Militar da China totalmente bloqueado por patrulhas aéreas aliadas. Perda de munições táticas de precisão.'
        });
      }

      internalLogs.push({
        id: `turn_start_${nextTurn}`,
        turn: nextTurn,
        type: 'ECONOMIA',
        message: `=== INÍCIO DO TURNO ${nextTurn} (SEMANA DA CAMPANHA) === Recursos de exploração territorial tributados e estocados com sucesso.`
      });

      // 2. Simular ações táticas de todas as facções de IA
      executarTurnoIA(
        updatedRegions,
        updatedFactions,
        REGION_ADJACENCY,
        prev.difficulty,
        prev.playerFaction,
        nextTurn,
        internalLogs
      );

      // 3. Processar missões de personagens brasileiros e oponentes
      const updatedCharacters = resolveCharacterMissions(prev.characters, updatedRegions, updatedFactions, internalLogs);

      // 4. Checar condições de vitória ou derrota geopolítica
      let updatedVictory: 'JOGANDO' | 'VITORIA' | 'DERROTA' = 'JOGANDO';

      const playerControlsItaipu = updatedRegions['ITAIPU'].controller === prev.playerFaction;
      const playerControlsAssuncao = updatedRegions['ASSUNCAO'].controller === prev.playerFaction;
      const playerControlsCde = updatedRegions['CIUDAD_DEL_ESTE'].controller === prev.playerFaction;
      const playerControlsBrasilia = updatedRegions['BRASILIA'].controller === prev.playerFaction;

      // Vitória: Brasil reconquista ou sela controle das 3 bases do Paraná de volta
      if (playerControlsItaipu && playerControlsAssuncao && playerControlsCde) {
        updatedVictory = 'VITORIA';
        internalLogs.unshift({
          id: `victory_${nextTurn}`,
          turn: nextTurn,
          type: 'SISTEMA',
          message: '🏆 CAMPANHA VITORIOSA! O Brasil conquistou soberania absoluta e pacificou o Teatro de Conflitos do Prata!'
        });
      }

      // Derrota: Perde a usina central de Itaipu, Brasília ou a moral governamental desmorona a zero
      if (!playerControlsBrasilia || !playerControlsItaipu || updatedFactions['BRASIL'].nationalMorale <= 0) {
        updatedVictory = 'DERROTA';
        internalLogs.unshift({
          id: `defeat_${nextTurn}`,
          turn: nextTurn,
          type: 'SISTEMA',
          message: '❌ OPERAÇÃO FRACASSADA. As forças estrategistas colapsaram. Recuo incondicional emitido.'
        });
      }

      // 5. Engatilhar geopolítica dinâmica: sela marcos da história ou sortear da lista procedimental
      let triggeredEvent: GameEvent | null = null;
      let logMsg = '';

      // Turnos importantes de guerra histórica em 2034:
      if (nextTurn === 2) {
        triggeredEvent = {
          id: 'TRIG_TURN_2',
          title: 'A Ofensiva de Choque: Deslocamento no Rio Paraná',
          description: 'O General paraguaio Santiago Caballero posicionou baterias pesadas móveis na margem ocidental de Ciudad del Este. Nossas patrulhas do capitão Lucas Azevedo pedem fuzis anti-blindados e barreiras acústicas extras para resguardar a soberania das turbinas.',
          image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=400',
          category: 'MILITAR',
          choices: [
            {
              id: 'T2_A',
              text: 'Autorizar bombardeio preventivo de artilharia pesada',
              consequencesDescription: 'Garante vantagem defensiva imediata (+10 tropas em Foz), mas consome 40 suprimentos e desgasta imagem internacional (-15).',
              effect: {
                suppliesChange: -40,
                troopsChange: { FOZ_DO_IGUACU: 8 },
                globalInfluenceChange: -15,
                logMessage: 'Nossas artilharias de MS responderam com pesado fogo de barragem, silenciando os morteiros paraguaios.'
              }
            },
            {
              id: 'T2_B',
              text: 'Aguardar e fixar defesas passivas em Itaipu',
              consequencesDescription: 'Preserva munições preciosas, mas reduz a moral em Foz do Iguaçu (-20%) sob fogo cerrado.',
              effect: {
                moraleChange: { FOZ_DO_IGUACU: -20 },
                popularSupportChange: -10,
                logMessage: 'Permanecemos entrincheirados. Os tiros de Caballero sacudiram as cercanias da Vila Operária de Itaipu.'
              }
            }
          ]
        };
        logMsg = `🚨 MARCO MILITAR: ${triggeredEvent.title}. Relatório tático prioritário.`;
      } else if (nextTurn === 5) {
        triggeredEvent = {
          id: 'TRIG_TURN_5',
          title: 'Baixas Táticas: Incursão Hostil na Ponte da Amizade',
          description: 'O Capitão Lucas Azevedo lidera uma flotilha de escolta de madrugada, chocando-se diretamente contra o regimento de elite do Sargento paraguaio Miguel Rojas. No violento tiroteio noturno, ambos saíram pesadamente baqueados.',
          image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400',
          category: 'MILITAR',
          choices: [
            {
              id: 'T5_A',
              text: 'Enviar força-tarefa de resgate médico liderada por Maria Clara',
              consequencesDescription: 'Resgata com êxito os feridos (+15 de Apoio Popular), gastando 20 suprimentos biomédicos.',
              effect: {
                suppliesChange: -20,
                popularSupportChange: 20,
                nationalMoraleChange: 10,
                logMessage: 'Maria Clara e voluntários removeram os combatentes feridos sob fuzilaria cruzada no iguaçu.'
              }
            },
            {
              id: 'T5_B',
              text: 'Priorizar captura e isolamento de oficiais prisioneiros',
              consequencesDescription: 'Dá foco em prender comandantes inimigos (+30 de Inteligência), ao custo de abandono de feridos civis.',
              effect: {
                intelPointsChange: 40,
                popularSupportChange: -15,
                logMessage: 'Capturamos oficiais paraguaios no dique de escoamento. O capitão Azevedo foi evacuado para MS em estado sério.'
              }
            }
          ]
        };
        logMsg = `🚨 MARCO MILITAR: ${triggeredEvent.title}. Combates severos de infantaria.`;
      } else if (nextTurn === 10) {
        triggeredEvent = {
          id: 'TRIG_TURN_10',
          title: 'A Ofensiva Cibernética da State Grid de Pequim',
          description: 'A rede de computadores de Brasília acusa um travamento geral algorítmico em massa. O diretor Li Wei em Ciudad del Este ativa o backdoor backdoor adormecido, bloqueando relés de alta tensão do Sudeste. O país pode sofrer um blecaute total caso não capitule às condições da Junta.',
          image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400',
          category: 'INFRAESTRUTURA',
          choices: [
            {
              id: 'T10_A',
              text: 'Injetar redes purificadas do Dossiê tático de Gama',
              consequencesDescription: 'Requer 60 de Inteligência acumulada. Purga os Cavalos de Tróia de forma brilhante, mantendo a luz acesa.',
              effect: {
                intelPointsChange: -40,
                politicalStabilityChange: 25,
                nationalMoraleChange: 15,
                logMessage: 'Os firewalls desenhados pelo General Gama neutralizaram a State Grid em minutos. Li Wei recuou indignado.'
              }
            },
            {
              id: 'T10_B',
              text: 'Proceder com desligamento de contingência e racionamento manual',
              consequencesDescription: 'Reduz severamente a estabilidade nacional, gerando apagões rotativos no Sudeste.',
              effect: {
                energyChange: -100,
                politicalStabilityChange: -30,
                popularSupportChange: -25,
                logMessage: 'O desligamento preventivo deixou São Paulo no escuro por 12 horas, gerando revoltas civis nas avenidas paulistas.'
              }
            }
          ]
        };
        logMsg = `🚨 MARCO DE SEGURANÇA: ${triggeredEvent.title}. Risco cibernético nacional máximo!`;
      } else if (nextTurn >= 15 || updatedVictory !== 'JOGANDO') {
        // Fase de encerramento automático da guerra por desgaste e pontuação: FINAIS!
        let endingType: 'VITORIA_BRASIL' | 'VITORIA_PARAGUAI' | 'COLAPSO' | 'GOLPE' | 'REVELACAO_SUPERPOTENCIAS' | 'PAZ_NEGOCIADA' | 'GUERRA_PROLONGADA' = 'GUERRA_PROLONGADA';
        
        if (playerControlsItaipu && playerControlsAssuncao && playerControlsCde) {
          endingType = 'VITORIA_BRASIL';
        } else if (prev.politicalStability <= 25) {
          endingType = 'GOLPE';
        } else if (prev.popularSupport <= 25 || updatedFactions['BRASIL'].resources.funds <= 20) {
          endingType = 'COLAPSO';
        } else if (prev.intelPoints >= 100 && prev.globalInfluence >= 70) {
          endingType = 'REVELACAO_SUPERPOTENCIAS';
        } else if (updatedRelations.find(r => (r.factionA === 'BRASIL' && r.factionB === 'PARAGUAI'))?.value && (updatedRelations.find(r => (r.factionA === 'BRASIL' && r.factionB === 'PARAGUAI'))?.value ?? 0) > 20) {
          endingType = 'PAZ_NEGOCIADA';
        } else if (!playerControlsBrasilia || !playerControlsItaipu) {
          endingType = 'VITORIA_PARAGUAI';
        }

        return {
          ...prev,
          victoryStatus: 'DERROTA', // Indica conclusão
          timelineProgress: 'FINAIS',
          activeEvent: null,
          historyLogs: [{
            id: `ending_trig_${nextTurn}`,
            turn: nextTurn,
            type: 'SISTEMA',
            message: `🏁 CAMPANHA CONCLUÍDA! O Teatro do Prata resolveu seu destino geopolítico com o desfecho: ${endingType}.`
          }, ...prev.historyLogs]
        };
      } else {
        if (useGeminiForEvent) {
          // Gemini gera evento contextual assincronamente — activeEvent ficará null
          // até que o useEffect conclua e chame setGameState com o evento gerado
          logMsg = '';
        } else {
          // Fallback: evento procedimental temático quando Gemini não está disponível
          const uncompletedEvents = GEOPOLITICAL_EVENTS.filter(
            evt => !prev.historyLogs.some(l => l.message.includes(evt.title))
          );

          if (uncompletedEvents.length > 0 && Math.random() < 0.40) {
            triggeredEvent = uncompletedEvents[Math.floor(Math.random() * uncompletedEvents.length)];
          } else {
            triggeredEvent = generateProceduralEvent(nextTurn, prev);
          }

          logMsg = `🚨 COMUNICAÇÃO OPERACIONAL: ${triggeredEvent.title}. Ganhos de inteligência aplicados.`;
        }
      }

      if (triggeredEvent) {
        internalLogs.unshift({
          id: `event_alert_${nextTurn}_${Date.now()}`,
          turn: nextTurn,
          type: 'EVENTO',
          message: logMsg
        });
      }

      return {
        ...prev,
        currentTurn: nextTurn,
        factions: updatedFactions,
        regions: updatedRegions,
        characters: updatedCharacters,
        victoryStatus: updatedVictory,
        activeEvent: triggeredEvent,
        popularSupport: currentPopularSupport,
        politicalStability: currentPoliticalStability,
        historyLogs: [...internalLogs, ...prev.historyLogs]
      };
    });

    // Dispara geração assíncrona se o Gemini for responsável pelo evento deste turno
    if (useGeminiForEvent) {
      setPendingEventGeneration(true);
    }
  };

  // Resolver escolha do evento estocando consequências táticas no estado global
  const resolveActiveEventChoice = (choiceId: string) => {
    if (!gameState.activeEvent) return;

    const activeEvent = gameState.activeEvent;
    const choice = activeEvent.choices.find(c => c.id === choiceId);
    if (!choice) return;

    setGameState(prev => {
      const updatedFactions = JSON.parse(JSON.stringify(prev.factions)) as Record<FactionID, Faction>;
      const updatedRegions = JSON.parse(JSON.stringify(prev.regions)) as Record<RegionID, Region>;
      const updatedRelations = [...prev.relations];
      const playerFac = updatedFactions[prev.playerFaction];

      const effect = choice.effect;

      // Aplicar penalizações ou custos de escolha
      if (choice.requiredFunds) playerFac.resources.funds = Math.max(0, playerFac.resources.funds - choice.requiredFunds);
      if (choice.requiredSupplies) playerFac.resources.supplies = Math.max(0, playerFac.resources.supplies - choice.requiredSupplies);
      if (choice.requiredEnergy) playerFac.resources.energy = Math.max(0, playerFac.resources.energy - choice.requiredEnergy);

      // Aplicar modificações táticas de recursos principais
      if (effect.fundsChange) playerFac.resources.funds = Math.max(0, playerFac.resources.funds + effect.fundsChange);
      if (effect.suppliesChange) playerFac.resources.supplies = Math.max(0, playerFac.resources.supplies + effect.suppliesChange);
      if (effect.energyChange) playerFac.resources.energy = Math.max(0, playerFac.resources.energy + effect.energyChange);
      if (effect.nationalMoraleChange) playerFac.nationalMorale = Math.max(0, Math.min(100, playerFac.nationalMorale + effect.nationalMoraleChange));

      // Aplicar modificações táticas dos NOVOS recursos geopolíticos e narrativos
      const supportChange = effect.popularSupportChange || 0;
      const stabilityChange = effect.politicalStabilityChange || 0;
      const intelChange = effect.intelPointsChange || 0;
      const fuelChange = effect.fuelReserveChange || 0;
      const influenceChange = effect.globalInfluenceChange || 0;

      const popularSupport = Math.max(0, Math.min(100, (prev.popularSupport || 50) + supportChange));
      const politicalStability = Math.max(0, Math.min(100, (prev.politicalStability || 50) + stabilityChange));
      const intelPoints = Math.max(0, Math.min(200, (prev.intelPoints || 30) + intelChange));
      const fuelReserve = Math.max(0, Math.min(500, (prev.fuelReserve || 100) + fuelChange));
      const globalInfluence = Math.max(0, Math.min(100, (prev.globalInfluence || 40) + influenceChange));

      // Alterar moral local de regiões de forma modular
      if (effect.moraleChange) {
        if (typeof effect.moraleChange === 'number') {
          const change = effect.moraleChange;
          Object.keys(updatedRegions).forEach((regId) => {
            const region = updatedRegions[regId as RegionID];
            if (region.controller === prev.playerFaction) {
              region.morale = Math.max(0, Math.min(100, region.morale + change));
            }
          });
        } else {
          const moraleMods = effect.moraleChange as Record<string, number>;
          Object.entries(moraleMods).forEach(([regId, change]) => {
            if (updatedRegions[regId as RegionID]) {
              updatedRegions[regId as RegionID].morale = Math.max(0, Math.min(100, updatedRegions[regId as RegionID].morale + (change as number)));
            }
          });
        }
      }

      // Alterar quantidade de tropas táticas por região
      if (effect.troopsChange) {
        const troopsMods = effect.troopsChange as Record<string, number>;
        Object.entries(troopsMods).forEach(([regId, change]) => {
          if (updatedRegions[regId as RegionID]) {
             updatedRegions[regId as RegionID].troops = Math.max(0, updatedRegions[regId as RegionID].troops + (change as number));
          }
        });
      }

      // Modificar relações diplomáticas
      if (effect.relationChange) {
        Object.entries(effect.relationChange).forEach(([facId, change]) => {
          const relIdx = updatedRelations.findIndex(
            r => (r.factionA === prev.playerFaction && r.factionB === facId) ||
                 (r.factionA === facId && r.factionB === prev.playerFaction)
          );
          if (relIdx !== -1) {
            updatedRelations[relIdx].value = Math.max(-100, Math.min(100, updatedRelations[relIdx].value + change));
          }
        });
      }

      // Salvar resolução de eventos históricos para mapear pre-configurações
      const isPrequelEvent = activeEvent.id.startsWith('PREQ_');
      const updatedResolved = isPrequelEvent 
        ? [...prev.resolvedPrequelEvents, activeEvent.id]
        : prev.resolvedPrequelEvents;

      const logDecision: HistoryLog = {
        id: `choice_${activeEvent.id}_${Date.now()}`,
        turn: prev.currentTurn,
        type: 'EVENTO',
        message: `HISTÓRIA (ANO ${prev.prequelYear}): ${choice.text}. Resultado: ${effect.logMessage}`
      };

      return {
        ...prev,
        factions: updatedFactions,
        regions: updatedRegions,
        relations: updatedRelations,
        activeEvent: null, // Desativa após escolha
        resolvedPrequelEvents: updatedResolved,
        popularSupport,
        politicalStability,
        intelPoints,
        fuelReserve,
        globalInfluence,
        historyLogs: [logDecision, ...prev.historyLogs]
      };
    });
  };

  // Avançar o Ano do Prequel (2024 a 2033) ou disparar a Guerra em 2034!
  const advancePrequelYear = () => {
    setGameState(prev => {
      if (prev.timelineProgress !== 'PREQUEL') return prev;
      
      const nextYear = prev.prequelYear + 1;
      const internalLogs = [...prev.historyLogs];
      
      if (nextYear <= 2033) {
        // Encontra o evento do próximo ano e carrega como activo
        const nextEvent = prev.playerFaction === 'PARAGUAI' ? PREQUEL_EVENTS_PARAGUAI[nextYear] : PREQUEL_EVENTS[nextYear];
        
        internalLogs.unshift({
          id: `prequel_adv_${nextYear}`,
          turn: 1,
          type: 'SISTEMA',
          message: `Cronologia avançada. Arquivos nacionais abertos para o ano geopolítico de ${nextYear}.`
        });

        return {
          ...prev,
          prequelYear: nextYear,
          activeEvent: nextEvent,
          historyLogs: internalLogs
        };
      } else {
        // FIM DO PREQUEL -> ENTRADA NA GUERRA EM 2034!
        // Aplicar bônus iniciais táticos baseados nas escolhas acumuladas:
        const updatedRegions = JSON.parse(JSON.stringify(prev.regions)) as Record<RegionID, Region>;
        const updatedFactions = JSON.parse(JSON.stringify(prev.factions)) as Record<FactionID, Faction>;
        
        // Se decretou Alerta Máximo em 2033, ganha tropas extras no front
        if (prev.resolvedPrequelEvents.includes('PREQ_2033')) {
          if (prev.playerFaction === 'PARAGUAI') {
            updatedRegions['CIUDAD_DEL_ESTE'].troops += 10;
            updatedRegions['ASSUNCAO'].troops += 5;
          } else {
            updatedRegions['FOZ_DO_IGUACU'].troops += 10;
            updatedRegions['ITAIPU'].troops += 5;
          }
        }
        
        // Se salvou o porto em 2027 recusando o pagamento, perde combustível mas ganha suprimentos extras
        if (prev.resolvedPrequelEvents.includes('PREQ_2027')) {
          if (prev.playerFaction === 'PARAGUAI') {
            updatedFactions['PARAGUAI'].resources.supplies += 100;
          } else {
            updatedFactions['BRASIL'].resources.supplies += 100;
          }
        }

        // Evento do Dia Zero: Ofensiva Ampla de Caballero
        const diaZeroEvent: GameEvent = {
          id: 'TRIG_DIA_ZERO',
          title: prev.playerFaction === 'PARAGUAI' 
            ? 'Operação Dia Zero: O Assalto de Caballero em Itaipu'
            : 'Operação Dia Zero: A Invasão de Caballero em Itaipu',
          description: prev.playerFaction === 'PARAGUAI'
            ? 'Às 04:30 da manhã, nossas colunas mecanizadas cruzaram a fronteira em Ciudad del Este iniciando o assalto decisivo contra o complexo hidrelétrico de Itaipu. O sargento Miguel Rojas lidera nossos regimentos de assalto pela Ponte da Amizade. Sua missão turn-to-turn no Teatro tático começa agora. Estabeleça as posições sob o Rio Paraná e liberte as subestações!'
            : 'Pontualmente às 04:30 da manhã, colunas mecanizadas paraguaias cruzaram a fronteira em Ciudad del Este e assaltaram o reservatório de Itaipu. O sargento Miguel Rojas lidera grupos anfíbios na Ponte da Amizade. Sua missão turn-to-turn no Teatro tático começa agora. Defenda as subestações brasileiras e recupere o controle territorial!',
          image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400',
          category: 'MILITAR',
          choices: prev.playerFaction === 'PARAGUAI'
            ? [
                {
                  id: 'DIAZERO_A',
                  text: 'Lançar mobilização ofensiva total em Ciudad del Este',
                  consequencesDescription: 'Garante barricadas ofensivas e reforços (+5 tropas grátis em Ciudad del Este), consome 20 de Combustível Estratégico.',
                  effect: {
                    fuelReserveChange: -20,
                    troopsChange: { CIUDAD_DEL_ESTE: 5 },
                    nationalMoraleChange: 10,
                    logMessage: 'O sargento Miguel Rojas mobilizou os regimentos de assalto com precisão cirúrgica.'
                  }
                },
                {
                  id: 'DIAZERO_B',
                  text: 'Adotar incursão tática cautelosa',
                  consequencesDescription: 'Preserva tropas e depósitos de combustível, deitando menor ímpeto inicial na Ponte da Amizade (-20% moral em Ciudad del Este).',
                  effect: {
                    moraleChange: { CIUDAD_DEL_ESTE: -20 },
                    popularSupportChange: -15,
                    logMessage: 'As patrulhas avançaram lentamente visando flanquear Foz do Iguaçu. Caballero elogiou a disciplina.'
                  }
                }
              ]
            : [
                {
                  id: 'DIAZERO_A',
                  text: 'Autorizar mobilização de emergência defensiva ativa',
                  consequencesDescription: 'Garante barricadas pesadas (+5 tropas grátis em Foz), consome 20 de Combustível Estratégico.',
                  effect: {
                    fuelReserveChange: -20,
                    troopsChange: { FOZ_DO_IGUACU: 5 },
                    nationalMoraleChange: 10,
                    logMessage: 'O capitão Lucas Azevedo mobilizou as frotas de patrulha a tempo. Enfrentamos a invasão sob alta prontidão militar.'
                  }
                },
                {
                  id: 'DIAZERO_B',
                  text: 'Ordenar recuo planejado dos postos de observação avançados',
                  consequencesDescription: 'Preserva tropas e estoques petrolíferos, mas reduz moral populacional em Foz do Iguaçu (-20%).',
                  effect: {
                    moraleChange: { FOZ_DO_IGUACU: -20 },
                    popularSupportChange: -15,
                    logMessage: 'As guaritas recuaram ordenadamente sob tiros de morteiro. Caballero ergueu o pavilhão operário em Ciudad del Este.'
                  }
                }
              ]
        };

        internalLogs.unshift({
          id: `war_start_2034`,
          turn: 1,
          type: 'SISTEMA',
          message: `🚨 ALERTA GERAL: ANO 2034! O PREQUEL FOI CONCLUÍDO. O Teatro Operacional do Prata está oficialmente ativo!`
        });

        return {
          ...prev,
          currentTurn: 1,
          prequelYear: 2034,
          timelineProgress: 'GUERRA',
          activeEvent: diaZeroEvent,
          regions: updatedRegions,
          factions: updatedFactions,
          historyLogs: internalLogs
        };
      }
    });
  };

  // Disparar Finais Directos (usado para bônus ou simulação rápida)
  const triggerDirectEnding = (endingId: string) => {
    setGameState(prev => ({
      ...prev,
      timelineProgress: 'FINAIS',
      victoryStatus: 'DERROTA', // Indica fim
      historyLogs: [{
        id: `direct_ending_${Date.now()}`,
        turn: prev.currentTurn,
        type: 'SISTEMA',
        message: `Decreto Narrativo: Carregando Fim da Guerra: ${endingId}.`
      }, ...prev.historyLogs]
    }));
  };

  const repairInfrastructure = (infraId: string): boolean => {
    let success = false;
    setGameState(prev => {
      const item = prev.infrastructure.items.find(i => i.id === infraId);
      if (!item || item.status === 'OPERATIONAL') return prev;

      const playerFac = prev.factions[prev.playerFaction];
      const fundsCost = 20;
      const suppliesCost = 30;

      if (playerFac.resources.funds < fundsCost || playerFac.resources.supplies < suppliesCost) {
        return prev;
      }

      success = true;
      const updatedFactions = JSON.parse(JSON.stringify(prev.factions)) as Record<FactionID, Faction>;
      updatedFactions[prev.playerFaction].resources.funds -= fundsCost;
      updatedFactions[prev.playerFaction].resources.supplies -= suppliesCost;

      const updatedItems = prev.infrastructure.items.map(i => {
        if (i.id === infraId) {
          return { ...i, status: 'OPERATIONAL' as const };
        }
        return i;
      });

      // Se todas as hidrelétricas ficaram ativas, podemos reduzir eventual emergência
      const acaray = updatedItems.find(i => i.id === 'ACARAY');
      const yguazu = updatedItems.find(i => i.id === 'YGUAZU');
      const isEnergyCrisisResolved = acaray?.status === 'OPERATIONAL' && yguazu?.status === 'OPERATIONAL';

      const logMsg: HistoryLog = {
        id: `infra_rep_${infraId}_${Date.now()}`,
        turn: prev.currentTurn,
        type: 'SISTEMA',
        message: `RECONSTRUÇÃO: A infraestrutura estratégica '${item.name}' foi totalmente restaurada em '${item.location}'.`
      };

      return {
        ...prev,
        factions: updatedFactions,
        infrastructure: {
          ...prev.infrastructure,
          items: updatedItems,
          rationingLevel: isEnergyCrisisResolved ? 'NONE' : prev.infrastructure.rationingLevel
        },
        historyLogs: [logMsg, ...prev.historyLogs]
      };
    });
    return success;
  };

  const upgradeInfrastructureDefense = (infraId: string): boolean => {
    let success = false;
    setGameState(prev => {
      const item = prev.infrastructure.items.find(i => i.id === infraId);
      if (!item || item.defenseLevel >= 3) return prev;

      const playerFac = prev.factions[prev.playerFaction];
      const fundsCost = 15;
      const suppliesCost = 20;

      if (playerFac.resources.funds < fundsCost || playerFac.resources.supplies < suppliesCost) {
        return prev;
      }

      success = true;
      const updatedFactions = JSON.parse(JSON.stringify(prev.factions)) as Record<FactionID, Faction>;
      updatedFactions[prev.playerFaction].resources.funds -= fundsCost;
      updatedFactions[prev.playerFaction].resources.supplies -= suppliesCost;

      const updatedItems = prev.infrastructure.items.map(i => {
        if (i.id === infraId) {
          return { ...i, defenseLevel: i.defenseLevel + 1 };
        }
        return i;
      });

      const logMsg: HistoryLog = {
        id: `infra_upg_${infraId}_${Date.now()}`,
        turn: prev.currentTurn,
        type: 'DIPLOMACIA',
        message: `FORTIFICAÇÃO: Sistemas de contra-medidas cibernéticas e de defesa aérea para '${item.name}' elevados para Nível ${item.defenseLevel + 1}.`
      };

      return {
        ...prev,
        factions: updatedFactions,
        infrastructure: {
          ...prev.infrastructure,
          items: updatedItems
        },
        historyLogs: [logMsg, ...prev.historyLogs]
      };
    });
    return success;
  };

  const sabotageInfrastructure = (infraId: string): boolean => {
    let played = false;
    setGameState(prev => {
      const item = prev.infrastructure.items.find(i => i.id === infraId);
      if (!item) return prev;

      const costIntel = 20;
      if (prev.intelPoints < costIntel) return prev;

      played = true;
      const newIntel = prev.intelPoints - costIntel;

      // Calcular chance baseada na defesa
      const successChance = Math.max(10, 85 - (item.defenseLevel * 25));
      const rolled = Math.random() * 100;
      const isSuccess = rolled <= successChance;

      const internalLogs = [...prev.historyLogs];

      if (isSuccess) {
        const updatedItems = prev.infrastructure.items.map(i => {
          if (i.id === infraId) {
            const nextStatus = i.status === 'OPERATIONAL' ? 'DAMAGED' : 'OFFLINE';
            return { ...i, status: nextStatus as 'DAMAGED' | 'OFFLINE' };
          }
          return i;
        });

        const acaray = updatedItems.find(i => i.id === 'ACARAY');
        const yguazu = updatedItems.find(i => i.id === 'YGUAZU');
        const rioParaguai = updatedItems.find(i => i.id === 'RIO_PARAGUAI');

        const energyCrisis = (acaray?.status !== 'OPERATIONAL') && (yguazu?.status !== 'OPERATIONAL');
        const waterEmergency = rioParaguai?.status !== 'OPERATIONAL';

        internalLogs.unshift({
          id: `infra_sab_succ_${infraId}_${Date.now()}`,
          turn: prev.currentTurn,
          type: 'MILITAR',
          message: `SABOTAGEM INFILTRADA: Sucesso absoluto! Células clandestinas comprometeram os sistemas de '${item.name}' (${item.location}).`
        });

        return {
          ...prev,
          intelPoints: newIntel,
          politicalStability: Math.max(0, prev.politicalStability - (energyCrisis ? 15 : 5)),
          popularSupport: Math.max(0, prev.popularSupport - (waterEmergency ? 15 : 5)),
          infrastructure: {
            ...prev.infrastructure,
            items: updatedItems,
            rationingLevel: energyCrisis ? 'SEVERE' : (acaray?.status !== 'OPERATIONAL' || yguazu?.status !== 'OPERATIONAL' ? 'LIGHT' : 'NONE'),
            waterEmergency
          },
          historyLogs: internalLogs
        };
      } else {
        internalLogs.unshift({
          id: `infra_sab_fail_${infraId}_${Date.now()}`,
          turn: prev.currentTurn,
          type: 'MILITAR',
          message: `OPERAÇÃO CLANDESTINA RETIDA: Nossos infiltrados foram detectados pelas defesas integradas em '${item.name}'.`
        });

        return {
          ...prev,
          intelPoints: newIntel,
          historyLogs: internalLogs
        };
      }
    });
    return played;
  };

  return (
    <GameContext.Provider value={{
      gameState,
      pendingEventGeneration,
      startGame,
      resetGame,
      advanceTurn,
      resolveActiveEventChoice,
      selectRegion,
      recruitTroops,
      moveTroops,
      deployCharacterMission,
      performDiplomacy,
      executeBattleRound,
      retreatBattle,
      autoResolveBattle,
      closeBattleReport,
      advancePrequelYear,
      triggerDirectEnding,
      repairInfrastructure,
      upgradeInfrastructureDefense,
      sabotageInfrastructure
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame deve ser utilizado sob um GameProvider de Teatro de Conflitos.');
  }
  return context;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Tipos principais para o jogo Teatro de Conflito do Prata: 2034

export type FactionID = 'BRASIL' | 'PARAGUAI' | 'COALIZAO_CHACO' | 'MERCENARIOS';

export type RegionID = 
  | 'ITAIPU' 
  | 'FOZ_DO_IGUACU' 
  | 'CIUDAD_DEL_ESTE' 
  | 'CHACO' 
  | 'ASSUNCAO' 
  | 'MATO_GROSSO_SUL' 
  | 'BRASILIA';

export interface Resources {
  funds: number;       // Fundos Geopolíticos (Bilhôes de USD ou créditos)
  supplies: number;    // Unidades de Suprimentos (Munição, Alimento, Combustível)
  energy: number;      // Rede Elétrica / Capacidade Energética (GW/h)
}

export interface Faction {
  id: FactionID;
  name: string;
  leaderName: string;
  leaderTitle: string;
  leaderAvatar: string;
  resources: Resources;
  isPlayer: boolean;
  color: string;         // Classe CSS de cor (ex: bg-green-600)
  borderColor: string;   // Classe CSS de borda (ex: border-green-500)
  glowColor: string;     // Classe CSS de brilho (ex: shadow-green-500/50)
  textColor: string;     // Classe CSS de texto (ex: text-green-400)
  description: string;
  nationalMorale: number; // Moral Nacional (0-100)
}

export type TerrainType = 'Urbano' | 'Floresta' | 'Chaco' | 'Pantanal' | 'Rio/Barragem' | 'Campo Aberto';

export interface Region {
  id: RegionID;
  name: string;
  controller: FactionID;
  troops: number;        // Quantidade de brigadas estrategicamente posicionadas
  morale: number;        // Moral da população/tropa local (0-100)
  energyProduction: number;   // Energia gerada por turno nesta região
  supplyProduction: number;   // Suprimentos gerados por turno nesta região
  fundsProduction: number;    // Fundos gerados por turno nesta região
  defenseRating: number; // Capacidade defensiva (1 a 5)
  importance: string;    // Descrição breve de seu papel estratégico
  description: string;   // Histórico geopolítico breve em 2034
  terrain: TerrainType;  // Tipo de terreno tático
}

import { CharacterRole, CharacterSkills, CharacterStatus, Character } from './Character';
import { StrategicInfrastructureState } from './infrastructure';
export type { CharacterRole, CharacterSkills, CharacterStatus, Character };

export interface EventChoiceEffect {
  moraleChange?: { [key in RegionID]?: number } | number; // Se número: aplica em todas as regiões do jogador
  nationalMoraleChange?: number;
  fundsChange?: number;
  suppliesChange?: number;
  energyChange?: number;
  troopsChange?: { [key in RegionID]?: number };
  relationChange?: { [key in FactionID]?: number };
  logMessage: string;
  popularSupportChange?: number;
  politicalStabilityChange?: number;
  intelPointsChange?: number;
  fuelReserveChange?: number;
  globalInfluenceChange?: number;
}

export interface EventChoice {
  id: string;
  text: string;
  requirementsDescription?: string;
  consequencesDescription: string;
  requiredFunds?: number;
  requiredSupplies?: number;
  requiredEnergy?: number;
  effect: EventChoiceEffect;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  image: string;       // Nome descritivo da imagem ou prompt visual
  triggerTurn?: number; // Se definido, engatilha neste turno
  category: 'MILITAR' | 'DIPLOMATICO' | 'INFRAESTRUTURA' | 'REMANCENTES';
  choices: EventChoice[];
}

export interface DiplomaticRelation {
  factionA: FactionID;
  factionB: FactionID;
  value: number; // -100 (Guerra total) a +100 (Aliança inseparável)
  treaties: string[]; // ex: ["Pacto Não-Agressão", "Acordo Comercial"]
}

export interface BattleReport {
  turn: number;
  region: RegionID;
  attacker: FactionID;
  defender: FactionID;
  attackerTroopsBefore: number;
  defenderTroopsBefore: number;
  attackerLosses: number;
  defenderLosses: number;
  winner: FactionID;
  conquered: boolean;
  intensity: 'BAIXA' | 'MEDIA' | 'ALTA';
  details: string;
}

export interface HistoryLog {
  id: string;
  turn: number;
  type: 'ECONOMIA' | 'MILITAR' | 'DIPLOMACIA' | 'EVENTO' | 'SISTEMA';
  message: string;
}

export interface BattleRound {
  round: number;
  attackerRoll: number;
  attackerDamage: number;
  defenderRoll: number;
  defenderDamage: number;
  attackerTroopsLeft: number;
  defenderTroopsLeft: number;
  log: string;
}

export interface ActiveBattle {
  regionId: RegionID;
  attacker: FactionID;
  defender: FactionID;
  attackerInitialTroops: number;
  defenderInitialTroops: number;
  currentAttackerTroops: number;
  currentDefenderTroops: number;
  terrain: TerrainType;
  rounds: BattleRound[];
  currentRound: number;
  finished: boolean;
  winner: FactionID | null;
  attackerLosses: number;
  defenderLosses: number;
  fromRegionId: RegionID;
}

export interface GameState {
  currentTurn: number; // 1 semana por turno
  playerFaction: FactionID;
  factions: Record<FactionID, Faction>;
  regions: Record<RegionID, Region>;
  characters: Character[];
  relations: DiplomaticRelation[];
  historyLogs: HistoryLog[];
  activeEvent: GameEvent | null;
  selectedRegionId: RegionID | null;
  victoryStatus: 'JOGANDO' | 'VITORIA' | 'DERROTA';
  difficulty: 'FACIL' | 'NORMAL' | 'DIFICIL';
  warAdvisor: string;
  activeBattle: ActiveBattle | null;
  battleReports: BattleReport[];
  // Novos campos de recursos narrativos da Campanha Geopolítica
  popularSupport: number;      // Apoio Popular (0-100)
  politicalStability: number;  // Estabilidade Política (0-100)
  intelPoints: number;         // Pontos de Inteligência / Espionagem (0-200)
  fuelReserve: number;         // Combustível / Reservas Estratégicas de Petróleo (0-500)
  globalInfluence: number;     // Impacto e Influência Internacional (0-100)
  timelineProgress: 'PREQUEL' | 'GUERRA' | 'FINAIS'; // Localização na Cronologia
  prequelYear: number;         // Ano do Prequel (2024 a 2033)
  resolvedPrequelEvents: string[]; // Registro de quais decisões históricas foram feitas
  infrastructure: StrategicInfrastructureState;
}

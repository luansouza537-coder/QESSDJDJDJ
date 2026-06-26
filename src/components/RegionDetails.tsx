/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame, REGION_ADJACENCY } from '../context/GameContext';
import { RegionID } from '../types/game';
import { 
  Shield, 
  Zap, 
  Package, 
  Coins, 
  Users, 
  Compass, 
  AlertTriangle, 
  ArrowRight, 
  Award,
  Lock,
  Target
} from 'lucide-react';

export default function RegionDetails() {
  const { 
    gameState, 
    recruitTroops, 
    moveTroops, 
    deployCharacterMission 
  } = useGame();

  const { regions, factions, selectedRegionId, characters, playerFaction } = gameState;
  const currentRegion = selectedRegionId ? regions[selectedRegionId] : null;

  // Estado para quantidade de recrutas e transporte
  const [recruitCount, setRecruitCount] = useState<number>(5);
  const [moveCount, setMoveCount] = useState<number>(5);
  const [targetRegionId, setTargetRegionId] = useState<RegionID | ''>('');
  const [selectedCharId, setSelectedCharId] = useState<string>('');
  const [missionType, setMissionType] = useState<'DEFESA' | 'SABOTAGEM' | 'DIPLOMACIA' | 'PRODUCAO'>('DEFESA');
  const [recruitError, setRecruitError] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  if (!currentRegion) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <Compass className="w-12 h-12 text-slate-600 animate-spin mb-3" style={{ animationDuration: '6s' }} />
        <p className="text-slate-400 font-sans text-sm">
          Nenhum quadrante operacional selecionado.<br />
          <span className="text-xs text-slate-500 font-mono">Clique em uma base no mapa acima para inspecionar métricas.</span>
        </p>
      </div>
    );
  }

  const isPlayerRegion = currentRegion.controller === playerFaction;
  const controllerFaction = factions[currentRegion.controller];
  const playerResources = factions[playerFaction].resources;

  // Adjacências válidas
  const adjacentIds = REGION_ADJACENCY[currentRegion.id] || [];

  // Filtrar personagens pertencentes ao jogador que estão disponíveis
  const playerAvailableChars = characters.filter(
    c => c.faction === playerFaction && c.status === 'DISPONIVEL'
  );

  // Ação de recrutamento
  const handleRecruit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recruitCount <= 0) return;
    setRecruitError(null);
    const success = recruitTroops(currentRegion.id, recruitCount);
    if (!success) {
      setRecruitError('Fundos ou Suprimentos insuficientes para recrutar esse contingente.');
    }
  };

  // Ação de movimentação / Ataque
  const handleMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRegionId || moveCount <= 0) return;
    setMoveError(null);
    if (moveCount >= currentRegion.troops) {
      setMoveError('Você deve manter pelo menos 1 brigada na guarnição para evitar abandono de posto.');
      return;
    }
    moveTroops(currentRegion.id, targetRegionId, moveCount);
    setTargetRegionId('');
  };

  // Ação de missão de personagem
  const handleDeployCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharId) return;
    deployCharacterMission(selectedCharId, currentRegion.id, missionType);
    setSelectedCharId('');
  };

  // Custos calculados
  const costFunds = recruitCount * 4;
  const costSupplies = recruitCount * 10;
  const canAffordRecruits = playerResources.funds >= costFunds && playerResources.supplies >= costSupplies;

  return (
    <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-5 shadow-2xl relative">
      {/* Indicador de facção controladora */}
      <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
        <div>
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${controllerFaction.borderColor} ${controllerFaction.textColor} bg-slate-900/40 uppercase font-semibold`}>
            {controllerFaction.name}
          </span>
          <h3 className="text-lg font-bold text-slate-100 font-sans mt-0.5 tracking-tight">
            {currentRegion.name}
          </h3>
          <p className="text-[11px] text-slate-400 italic font-mono mt-1">{currentRegion.importance}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-mono">Força da Unidade</div>
          <div className="text-xl font-black font-mono text-teal-400 bg-slate-900 px-3 py-1 rounded border border-slate-800 mt-1">
            🛡️ {currentRegion.troops} <span className="text-xs font-normal text-slate-500">Brigadas</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-350 leading-relaxed mb-4 leading-relaxed font-sans border-l-2 border-slate-700 pl-3">
        {currentRegion.description}
      </p>

      {/* Grid de produção e moral */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-lg flex items-center space-x-3">
          <Zap className="text-amber-500 w-5 h-5 flex-shrink-0" />
          <div>
            <div className="text-[9px] text-slate-500 font-mono">Flutuação de Energia</div>
            <div className="text-xs font-bold text-slate-200 font-mono">+{currentRegion.energyProduction} GW/h</div>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-lg flex items-center space-x-3">
          <Package className="text-teal-450 w-5 h-5 flex-shrink-0" />
          <div>
            <div className="text-[9px] text-slate-500 font-mono">Suprimento de Guerra</div>
            <div className="text-xs font-bold text-slate-200 font-mono">+{currentRegion.supplyProduction} Un.</div>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-lg flex items-center space-x-3">
          <Coins className="text-yellow-500 w-5 h-5 flex-shrink-0" />
          <div>
            <div className="text-[9px] text-slate-500 font-mono">Tributação e Créditos</div>
            <div className="text-xs font-bold text-slate-200 font-mono">+F$ {currentRegion.fundsProduction}</div>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-lg flex items-center space-x-3">
          <Award className="text-cyan-400 w-5 h-5 flex-shrink-0" />
          <div>
            <div className="text-[9px] text-slate-500 font-mono">Fidelidade Regional</div>
            <div className="text-xs font-bold text-slate-200 font-mono">{currentRegion.morale}%</div>
          </div>
        </div>
      </div>

      {/* Painéis operacionais baseados em controle */}
      {isPlayerRegion ? (
        <div className="space-y-4 pt-1">
          {/* Seção 1: Mobilização e Recrutamento */}
          <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/30">
            <h4 className="text-xs font-bold text-emerald-400 font-sans tracking-wide mb-3 flex items-center space-x-1.5 border-b border-slate-800 pb-1.5 uppercase">
              <Users className="w-3.5 h-3.5" />
              <span>Contingenciamento e Treinamento</span>
            </h4>
            <form onSubmit={handleRecruit} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-center justify-between">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <label className="text-xs font-mono text-slate-400">Soldados:</label>
                <input 
                  type="number"
                  min="1"
                  max="30"
                  value={recruitCount}
                  onChange={(e) => setRecruitCount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1 text-xs w-16 text-center font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Custos dinâmicos */}
              <div className="flex space-x-3 text-[10px] font-mono bg-slate-950 px-3 py-1.5 rounded border border-slate-850">
                <span className="text-slate-500">Custos:</span>
                <span className={playerResources.funds >= costFunds ? "text-yellow-405 font-medium" : "text-red-400 font-bold"}>
                  F$ {costFunds}
                </span>
                <span className="text-slate-600">|</span>
                <span className={playerResources.supplies >= costSupplies ? "text-teal-400 font-medium" : "text-red-400 font-bold"}>
                  📦 {costSupplies} sup.
                </span>
              </div>

              <button
                type="submit"
                disabled={!canAffordRecruits}
                className={`w-full sm:w-auto text-xs font-bold px-4 py-1.5 rounded transition ${
                  canAffordRecruits 
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-slate-100 cursor-pointer shadow-lg shadow-emerald-950/40' 
                    : 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800'
                }`}
              >
                Reforçar Base
              </button>
            </form>
            {recruitError && (
              <p className="text-[10px] text-red-450 font-mono mt-2.5 flex items-center space-x-1.5 bg-red-950/40 border border-red-900/40 p-2 rounded">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-450" />
                <span>{recruitError}</span>
              </p>
            )}
          </div>

          {/* Seção 2: Deslocamento Estratégico ou Ataque Geopolítico */}
          <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/30">
            <h4 className="text-xs font-bold text-teal-400 font-sans tracking-wide mb-3 flex items-center space-x-1.5 border-b border-slate-800 pb-1.5 uppercase">
              <Target className="w-3.5 h-3.5" />
              <span>Projeção de Brigada / Movimento</span>
            </h4>
            <form onSubmit={handleMove} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-3 flex flex-col space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Quantidade</label>
                <input 
                  type="number"
                  min="1"
                  max={Math.max(1, currentRegion.troops - 1)}
                  value={moveCount}
                  onChange={(e) => setMoveCount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1 text-xs text-center font-mono focus:outline-none focus:border-teal-500 w-full"
                />
              </div>

              <div className="sm:col-span-5 flex flex-col space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Guarnição Destino</label>
                <select
                  value={targetRegionId}
                  onChange={(e) => setTargetRegionId(e.target.value as RegionID)}
                  required
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-teal-500 w-full"
                >
                  <option value="">Selecione...</option>
                  {adjacentIds.map((id) => (
                    <option key={id} value={id}>
                      {regions[id].name} {regions[id].controller !== playerFaction ? '🎯 (OPONENTE / ATAQUE)' : '🛡️'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <button
                  type="submit"
                  disabled={!targetRegionId || currentRegion.troops <= 1}
                  className={`w-full text-xs font-bold px-4 py-2 rounded transition flex items-center justify-center space-x-1.5 ${
                    targetRegionId && currentRegion.troops > 1
                      ? 'bg-teal-700 hover:bg-teal-600 text-slate-100 cursor-pointer shadow-lg shadow-teal-950/40'
                      : 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800'
                  }`}
                >
                  <span>Projetar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>
            {moveError && (
              <p className="text-[10px] text-red-450 font-mono mt-2.5 flex items-center space-x-1.5 bg-red-950/40 border border-red-900/40 p-2 rounded">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-450" />
                <span>{moveError}</span>
              </p>
            )}
            {currentRegion.troops <= 1 && (
              <p className="text-[10px] text-amber-500 font-mono mt-2 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Impossível deslocar: Necessária 1 tropa mínima de segurança na retaguarda.</span>
              </p>
            )}
          </div>

          {/* Seção 3: Outorga de Missão de Personagens Brasileiros */}
          <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/30">
            <h4 className="text-xs font-bold text-amber-500 font-sans tracking-wide mb-3 flex items-center space-x-1.5 border-b border-slate-800 pb-1.5 uppercase">
              <Users className="w-3.5 h-3.5" />
              <span>Incitar Assessoria de Especialistas</span>
            </h4>
            {playerAvailableChars.length === 0 ? (
              <p className="text-[10px] text-slate-500 font-mono text-center py-2 bg-slate-900/10 rounded">
                Todos os diplomatas, generais e espiões estão encarregados em missões ativas neste momento.
              </p>
            ) : (
              <form onSubmit={handleDeployCharacter} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4 flex flex-col space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Especialista</label>
                  <select
                    value={selectedCharId}
                    onChange={(e) => setSelectedCharId(e.target.value)}
                    required
                    className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-amber-500 w-full"
                  >
                    <option value="">Selecione...</option>
                    {playerAvailableChars.map(char => (
                      <option key={char.id} value={char.id}>
                        {char.name} ({char.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-5 flex flex-col space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Diretriz Operativa</label>
                  <select
                    value={missionType}
                    onChange={(e) => setMissionType(e.target.value as any)}
                    required
                    className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-amber-500 w-full"
                  >
                    <option value="DEFESA">Preparar Defesa Territorial (Treina Tropas)</option>
                    <option value="SABOTAGEM">Operação Clandestina / Sabotaria (Desvia Suprimentos)</option>
                    <option value="DIPLOMACIA">Propaganda das Linhas Sócio-Políticas (Aumenta Fundos)</option>
                    <option value="PRODUCAO">Otimizar Fábricas Avançadas (Rendimento Geral)</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    disabled={!selectedCharId}
                    className={`w-full text-xs font-bold px-3 py-2 rounded transition ${
                      selectedCharId
                        ? 'bg-amber-700 hover:bg-amber-600 text-slate-100 cursor-pointer shadow-lg shadow-amber-950/40'
                        : 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800'
                    }`}
                  >
                    Iniciar Missão
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Região hostil/oponente - Ações indisponíveis */
        <div className="bg-slate-900/30 border border-red-950 rounded-lg p-5 flex flex-col items-center justify-center text-center mt-3">
          <Lock className="w-8 h-8 text-red-500/70 mb-2 animate-bounce" />
          <h5 className="text-xs font-bold font-mono uppercase text-red-400 tracking-wider">
            Soberania Territorial Violada
          </h5>
          <p className="text-[10px] text-slate-400 font-mono mt-1 max-w-[280px]">
            Esta região estratégica está atualmente sob guarda de {controllerFaction.name}. Mobilize tropas adjacentes de Foz ou Chaco para planejar uma invasão retaliadora.
          </p>
        </div>
      )}
    </div>
  );
}

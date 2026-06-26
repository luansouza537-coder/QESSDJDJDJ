/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  Sword, 
  UserSquare2, 
  CornerDownLeft, 
  Zap, 
  Volume2, 
  Award, 
  X,
  Skull,
  TrendingDown,
  Info,
  ChevronRight
} from 'lucide-react';

export default function ActiveBattleModal() {
  const { 
    gameState, 
    executeBattleRound, 
    retreatBattle, 
    autoResolveBattle, 
    closeBattleReport 
  } = useGame();
  
  const { activeBattle, factions, regions, characters } = gameState;
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Rolar auto para o fim do log a cada novo round
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeBattle?.rounds.length]);

  if (!activeBattle) return null;

  const region = regions[activeBattle.regionId];
  const fromRegion = regions[activeBattle.fromRegionId];
  const attackerFac = factions[activeBattle.attacker];
  const defenderFac = factions[activeBattle.defender];

  // Buscar os generais envolvidos
  const attackerGeneral = characters.find(
    c => c.faction === activeBattle.attacker && c.role === 'GENERAL' && (c.location === activeBattle.fromRegionId || c.location === activeBattle.regionId) && c.status === 'DISPONIVEL'
  );
  const defenderGeneral = characters.find(
    c => c.faction === activeBattle.defender && c.role === 'GENERAL' && c.location === activeBattle.regionId && c.status === 'DISPONIVEL'
  );

  // Mapeamento de Cores por Facção
  const getFactionColor = (factionId: string) => {
    if (factionId === 'BRASIL') return 'from-teal-600 to-emerald-600 border-teal-500';
    if (factionId === 'PARAGUAI') return 'from-red-650 to-indigo-850 border-red-600';
    return 'from-amber-600 to-amber-700 border-amber-500';
  };

  const getFactionBadge = (factionId: string) => {
    if (factionId === 'BRASIL') return 'bg-teal-950 text-teal-350 border-teal-800';
    if (factionId === 'PARAGUAI') return 'bg-red-950 text-red-350 border-red-800';
    return 'bg-amber-950 text-amber-350 border-amber-800';
  };

  // Mapeamento de Descrições/Avisos de Terreno
  const getTerrainBadge = (terrain: string) => {
    switch (terrain) {
      case 'Urbano':
        return {
          title: 'ZONA URBANA FORTIFICADA',
          desc: 'Defensores abrigados em fortificações e coberturas urbanas. Atacante sofre -35% de dano direto devido às muretas e escombros.',
          color: 'bg-slate-900 border-slate-700 text-slate-350',
          impact: 'Ataque -35%',
          danger: false
        };
      case 'Floresta':
        return {
          title: 'SELVA DO ALTO PARANÁ',
          desc: 'Vegetação densa, baixa visibilidade e perigo de emboscadas táticas indiretas. Multiplicador aleatório caótico de dano para ambos os lados.',
          color: 'bg-emerald-950 border-emerald-900 text-emerald-400',
          impact: 'Danos Instáveis +/- 25%',
          danger: false
        };
      case 'Chaco':
        return {
          title: 'ARENAS HOSTIS DO CHACO',
          desc: 'Calor severo e desgaste logístico nas dunas. Ambos os lados perdem tropas táticas extras a cada round par por insolação e falta de ração de campanha.',
          color: 'bg-amber-950 border-amber-900 text-amber-400',
          impact: 'Desgaste Severo Bilateral',
          danger: true
        };
      case 'Pantanal':
        return {
          title: 'LANÇANTE ALAGADA DO PANTANAL',
          desc: 'Lodo espesso e igapós profundos engolem divisões mecanizadas de infantaria blindada. Atacante sofre penalidade severa de -30% no avanço.',
          color: 'bg-yellow-950/60 border-yellow-905 text-yellow-500',
          impact: 'Ataque -30%',
          danger: false
        };
      case 'Rio/Barragem':
        return {
          title: 'TRAVESSIA FLUVIAL / ITAIPU',
          desc: 'Assalto frontal cruzando as pontes sob forte monitoramento oponente. Reduz o dano do atacante em extraordinários -50%, a menos que ele ataque com superioridade numérica de 2:1, reduzindo a debilidade para -25%.',
          color: 'bg-blue-950 border-blue-900 text-blue-400',
          impact: 'Ataque -50% (Suscetível)',
          danger: true
        };
      default:
        return {
          title: 'CAMPO DESCOBERTO',
          desc: 'Planícies vastas ideais para manobra e atrito rápido de blindados pesados. Sem cobertura ou posições defensivas. Ambos os lados desferem +40% de dano total.',
          color: 'bg-cyan-950/60 border-cyan-900 text-cyan-400',
          impact: 'Danos letais +40%',
          danger: false
        };
    }
  };

  const terrainInfo = getTerrainBadge(activeBattle.terrain);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
        
        {/* --- CABEÇALHO DO TEATRO DE GUERRA --- */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-950 border border-red-500 flex items-center justify-center text-red-400 font-bold shadow-md">
              <Sword className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-white uppercase leading-none mb-1">
                COMBATE INTERATIVO : {region.name}
              </h2>
              <p className="text-[10px] font-mono text-slate-400 uppercase leading-none">
                Setor de Fronteira • Turno do Conflito Nº {gameState.currentTurn}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Terreno:</span>
            <span className="px-2 py-0.5 rounded border text-[10px] font-mono font-bold bg-slate-900 border-slate-700 text-slate-300">
              {activeBattle.terrain}
            </span>
          </div>
        </div>

        {/* --- ÁREA DO RELEVO TÁTICO --- */}
        <div className={`px-6 py-3 border-b border-slate-800 flex items-center gap-3 shrink-0 ${terrainInfo.color}`}>
          <Info className="w-5 h-5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold uppercase tracking-wider block text-[10px]">{terrainInfo.title}</span>
            <p className="text-slate-350 leading-tight mt-0.5">{terrainInfo.desc}</p>
          </div>
          <div className="ml-auto shrink-0 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 flex flex-col items-center">
            <span className="text-[8px] text-slate-550 block uppercase font-mono leading-none">Impacto</span>
            <span className="font-mono text-[10px] font-black tracking-tight uppercase leading-none mt-1">
              {terrainInfo.impact}
            </span>
          </div>
        </div>

        {/* --- PAINEL DAS FORÇAS NO FRONT (LADO A VS LADO B) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-950/40 border-b border-slate-800 shrink-0">
          
          {/* Faction A: Atacante */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-mono">Força Invasora</span>
                <span className="text-base font-black tracking-tight text-slate-100 uppercase">{attackerFac.name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono tracking-wider ${getFactionBadge(activeBattle.attacker)}`}>
                Atacante
              </span>
            </div>

            {/* Troops status */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-slate-950 p-2 rounded border border-slate-850">
                <span className="text-[8px] text-slate-500 uppercase block leading-none mb-1">Brigadas Originais</span>
                <span className="text-sm font-black font-mono text-slate-450">{activeBattle.attackerInitialTroops}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-teal-900/40">
                <span className="text-[8px] text-emerald-500 uppercase block leading-none mb-1">Em Combate</span>
                <span className="text-sm font-black font-mono text-emerald-400">{activeBattle.currentAttackerTroops}</span>
              </div>
            </div>

            {/* General info */}
            <div className="flex items-center space-x-2.5 pt-2 border-t border-slate-850/60">
              <div className="w-8 h-8 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                <UserSquare2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[8px] text-slate-505 block leading-none uppercase">General Comandante</span>
                <span className="text-xs font-bold text-slate-300">
                  {attackerGeneral ? `${attackerGeneral.name} (Estr. ${attackerGeneral.skills.strategy})` : 'Comando Terrestre Geral'}
                </span>
              </div>
              <div className="ml-auto text-right">
                <span className="text-[8px] text-slate-505 block leading-none uppercase">Moral</span>
                <span className="text-xs font-mono font-bold text-teal-400">
                  {attackerGeneral ? `${attackerGeneral.morale}%` : `${attackerFac.nationalMorale}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Faction B: Defensor */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-mono">Guarnição Defensiva</span>
                <span className="text-base font-black tracking-tight text-slate-100 uppercase">{defenderFac.name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono tracking-wider ${getFactionBadge(activeBattle.defender)}`}>
                Defensor
              </span>
            </div>

            {/* Troops status */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-slate-950 p-2 rounded border border-slate-850">
                <span className="text-[8px] text-slate-500 uppercase block leading-none mb-1">Brigadas Originais</span>
                <span className="text-sm font-black font-mono text-slate-450">{activeBattle.defenderInitialTroops}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-red-900/40">
                <span className="text-[8px] text-red-500 uppercase block leading-none mb-1">Em Combate</span>
                <span className="text-sm font-black font-mono text-red-400">{activeBattle.currentDefenderTroops}</span>
              </div>
            </div>

            {/* General info */}
            <div className="flex items-center space-x-2.5 pt-2 border-t border-slate-850/60">
              <div className="w-8 h-8 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                <UserSquare2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[8px] text-slate-505 block leading-none uppercase">General Defensor</span>
                <span className="text-xs font-bold text-slate-300">
                  {defenderGeneral ? `${defenderGeneral.name} (Estr. ${defenderGeneral.skills.strategy})` : 'Defesa Local Organizada'}
                </span>
              </div>
              <div className="ml-auto text-right">
                <span className="text-[8px] text-slate-505 block leading-none uppercase">Estabilidade</span>
                <span className="text-xs font-mono font-bold text-red-400">
                  {defenderGeneral ? `${defenderGeneral.morale}%` : `${region.morale}%`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- FEED DE LOGS DO COMBATE (Histórico de Fogo) --- */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[160px] bg-slate-950/80">
          <div className="border-b border-slate-900 pb-2 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
            <span>Registro Operacional de Fogo</span>
            <span>Rounds da Batalha</span>
          </div>

          {activeBattle.rounds.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-855 flex items-center justify-center text-slate-500">
                <Sword className="w-5 h-5" />
              </div>
              <p className="text-xs font-sans text-slate-400">
                As brigadas tomaram as fileiras estratégicas da região {region.name}. Aguardando ordem parlamentar para iniciar fogo tático.
              </p>
            </div>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {activeBattle.rounds.map((round, index) => (
                <div 
                  key={index} 
                  className="p-3.5 rounded border border-slate-850 bg-slate-900/30 flex flex-col justify-between space-y-1"
                >
                  <div className="flex items-center justify-between border-b border-slate-850 pb-1 mb-1.5 text-[10px] text-slate-450 uppercase font-mono">
                    <span className="font-bold text-teal-400">Round {round.round}</span>
                    <span className="flex items-center space-x-3 text-[9px] text-slate-500">
                      <span>Rolo Atk: [{round.attackerRoll}] | Baixas Def: [-{round.attackerDamage}]</span>
                      <span>•</span>
                      <span>Rolo Def: [{round.defenderRoll}] | Baixas Atk: [-{round.defenderDamage}]</span>
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs tracking-tight leading-normal">
                    {round.log}
                  </p>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </div>

        {/* --- BARRA DE RELATÓRIO DO FIM COMBATE (SE TERMINOU) --- */}
        {activeBattle.finished && (
          <div className="bg-slate-900 border-t border-slate-800 p-5 shrink-0 animate-scale-up">
            <div className="bg-slate-950 rounded-lg border border-slate-850 p-4">
              <div className="flex items-center space-x-2.5 mb-2 text-emerald-400 font-sans">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  DESFECHO TÁTICO FINAL : COMBATE CONCLUÍDO
                </span>
              </div>
              <p className="text-xs text-slate-350 leading-relaxed font-sans mt-1">
                {activeBattle.winner === activeBattle.attacker ? (
                  <span className="font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/60 uppercase text-[10px] mr-1.5">Consolidada Vitória</span>
                ) : (
                  <span className="font-bold text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/60 uppercase text-[10px] mr-1.5">Frente Segurada pelo Defensor</span>
                )}
                Região Militar de {region.name} registrou baixas totais de {activeBattle.attackerLosses + activeBattle.defenderLosses} unidades estrategicamente eliminadas. O controle político foi transferido ao império da facção vencedora.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-900 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-550">BAIXAS ATACANTE:</span>
                  <span className="font-bold text-red-500">-{activeBattle.attackerLosses} brigadas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-550">BAIXAS DEFENSOR:</span>
                  <span className="font-bold text-red-500">-{activeBattle.defenderLosses} brigadas</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CONTROLES DA CONTA INTERATIVA --- */}
        <div className="bg-slate-950 px-6 py-4.5 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          
          <div className="text-xs font-mono text-slate-500">
            {activeBattle.finished ? (
              <span>Teatro resolvido. Registre e feche.</span>
            ) : (
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>FOGO ATIVO: Round atual tático: {activeBattle.currentRound}</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {!activeBattle.finished ? (
              <>
                {/* Botão de Próximo Round */}
                <button
                  onClick={executeBattleRound}
                  className="px-4.5 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-[11px] font-sans tracking-wider uppercase transition flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <Sword className="w-3.5 h-3.5" />
                  <span>Próximo Round</span>
                </button>

                {/* Botão de Auto Resolver */}
                <button
                  onClick={autoResolveBattle}
                  className="px-4.5 py-2 rounded bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold text-[11px] font-sans tracking-wider uppercase transition flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Auto-Resolver</span>
                </button>

                {/* Botão de Recuar */}
                <button
                  onClick={retreatBattle}
                  className="px-4.5 py-2 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-extrabold text-[11px] font-sans tracking-wider uppercase transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span>Recuar Forças</span>
                </button>
              </>
            ) : (
              /* Botão de Fechar Relatório */
              <button
                onClick={closeBattleReport}
                className="px-6 py-2 rounded bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-slate-100 font-extrabold text-xs tracking-widest font-sans uppercase tracking-wider transition cursor-pointer shadow-md flex items-center space-x-1"
              >
                <span>Fechar Relatório e Consolidar Solo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Character, CharacterRole, RegionID } from '../types/game';
import {
  Users,
  Skull,
  Send,
  Clock,
  X,
  ChevronDown
} from 'lucide-react';

type MissionType = 'DEFESA' | 'SABOTAGEM' | 'DIPLOMACIA' | 'PRODUCAO';

const MISSION_OPTIONS: { value: MissionType; label: string; desc: string; duration: string }[] = [
  { value: 'DEFESA',     label: 'Fortif. Militar',  desc: '+3 brigadas e +10 moral na região',           duration: '~2 semanas' },
  { value: 'DIPLOMACIA', label: 'Diplomacia',        desc: '+F$40 créditos alfandegários e +15 moral',    duration: '~2 semanas' },
  { value: 'PRODUCAO',   label: 'Otimização Produt.', desc: 'Maximiza retornos industriais da região',   duration: '~2 semanas' },
  { value: 'SABOTAGEM',  label: 'Sabotagem',         desc: '+60 suprimentos desviados, -15 moral inimiga', duration: '~3 semanas' },
];

export default function CharactersPanel() {
  const { gameState, deployCharacterMission } = useGame();
  const { characters, regions, playerFaction } = gameState;

  const [selectedCategory, setSelectedCategory] = useState<'TODOS' | 'BRASIL' | 'PARAGUAI' | 'INTERNACIONAL'>('TODOS');
  const [deployingCharId, setDeployingCharId] = useState<string | null>(null);
  const [deployRegion, setDeployRegion] = useState<RegionID | ''>('');
  const [deployMission, setDeployMission] = useState<MissionType>('DEFESA');

  const filteredCharacters = characters.filter(c => {
    if (selectedCategory === 'TODOS') return true;
    if (selectedCategory === 'BRASIL') return c.faction === 'BRASIL';
    if (selectedCategory === 'PARAGUAI') return c.faction === 'PARAGUAI';
    if (selectedCategory === 'INTERNACIONAL') {
      return c.faction === 'CHINA' || c.faction === 'EUA' || c.faction === 'INTERNACIONAL';
    }
    return true;
  });

  // Regiões controladas pelo jogador (alvos válidos de missão)
  const playerRegions = Object.values(regions).filter(r => r.controller === playerFaction);

  const handleDeploy = (charId: string) => {
    if (!deployRegion) return;
    deployCharacterMission(charId, deployRegion as RegionID, deployMission);
    setDeployingCharId(null);
    setDeployRegion('');
    setDeployMission('DEFESA');
  };

  const cancelDeploy = () => {
    setDeployingCharId(null);
    setDeployRegion('');
    setDeployMission('DEFESA');
  };

  const getRoleBadgeColor = (role: CharacterRole) => {
    switch (role) {
      case 'GENERAL':    return 'bg-red-955/40 border-red-900 text-red-400';
      case 'ESPIAO':     return 'bg-purple-955/40 border-purple-900 text-purple-400';
      case 'DIPLOMATA':  return 'bg-cyan-955/40 border-cyan-900 text-cyan-400';
    }
  };

  const getStatusBadge = (char: Character) => {
    if (char.lifeStatus && char.lifeStatus !== 'VIVO') {
      const colors: Record<string, string> = {
        'MORTO':        'bg-red-950 text-red-500 border-red-900',
        'PRESO':        'bg-amber-955 text-amber-500 border-amber-900',
        'DESAPARECIDO': 'bg-slate-950 text-slate-500 border-slate-900'
      };
      return (
        <span className={`border px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wide flex items-center space-x-1 ${colors[char.lifeStatus] || 'bg-slate-950'}`}>
          <Skull className="w-3 h-3 text-red-500" />
          <span>{char.lifeStatus}</span>
        </span>
      );
    }

    switch (char.status) {
      case 'DISPONIVEL':
        return (
          <span className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 font-bold px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wide flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Ativo</span>
          </span>
        );
      case 'EM_MISSAO':
        return (
          <span className="bg-amber-950/40 border border-amber-900 text-amber-500 font-bold px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wide flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Em Op. (~{char.turnsInMissionLeft * 7}d)</span>
          </span>
        );
      case 'LESIONADO':
        return (
          <span className="bg-slate-900 border border-slate-850 text-slate-500 font-bold px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wide flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block"></span>
            <span>Incapaz</span>
          </span>
        );
    }
  };

  const getFactionBadge = (faction: string) => {
    if (faction === 'BRASIL')      return 'bg-emerald-950 text-emerald-300 border-emerald-900';
    if (faction === 'PARAGUAI')    return 'bg-red-950 text-red-350 border-red-900';
    if (faction === 'CHINA')       return 'bg-amber-950 text-amber-300 border-amber-900';
    if (faction === 'EUA')         return 'bg-blue-950 text-blue-300 border-blue-900';
    return 'bg-purple-950 text-purple-300 border-purple-900';
  };

  // Progresso visual de missão (turnos decorridos / total estimado)
  const getMissionProgress = (char: Character) => {
    const totalTurns = char.turnsInMissionLeft + (char.turnsInMissionLeft <= 2 ? 0 : 1);
    const maxTurns = 3;
    const progress = Math.max(0, Math.min(100, ((maxTurns - char.turnsInMissionLeft) / maxTurns) * 100));
    return progress;
  };

  const isPlayerChar = (char: Character) => char.faction === playerFaction;

  return (
    <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-6 shadow-2xl">
      {/* Cabeçalho */}
      <div className="border-b border-slate-800 pb-3 mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Users className="text-teal-400 w-5 h-5" />
          <h3 className="font-bold text-slate-200 uppercase font-sans tracking-tight text-sm">
            Fichas Biográficas de Personagens e Inteligência
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          Teatro Operacional do Prata : 15 Atores Centrais
        </span>
      </div>

      {/* Categorias de Filtro */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-905 pb-4">
        {(['TODOS', 'BRASIL', 'PARAGUAI', 'INTERNACIONAL'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wider font-mono uppercase cursor-pointer border transition-all ${
              selectedCategory === cat
                ? 'bg-teal-900/30 text-teal-400 border-teal-500'
                : 'bg-slate-900/60 text-slate-400 border-transparent hover:bg-slate-850'
            }`}
          >
            {cat === 'INTERNACIONAL' ? 'Clandestinos (CIA & Huawei)' : cat}
          </button>
        ))}
      </div>

      {/* Grid de Personagens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharacters.map((char) => {
          const isDeploying = deployingCharId === char.id;
          const canDeploy = isPlayerChar(char) && char.status === 'DISPONIVEL' && (!char.lifeStatus || char.lifeStatus === 'VIVO');

          return (
            <div
              key={char.id}
              className={`bg-slate-900/40 border p-4 rounded-xl flex flex-col justify-between transition duration-150 relative ${
                isDeploying
                  ? 'border-teal-700 bg-slate-900/70'
                  : 'border-slate-850 hover:border-slate-800 hover:bg-slate-900/60'
              }`}
            >
              {/* Moldura superior */}
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={char.avatar}
                      alt={char.name}
                      className="w-12 h-12 rounded-lg border border-slate-800 object-cover shadow shadow-slate-950"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-black font-sans text-slate-100 tracking-tight leading-none mb-1">
                        {char.name}
                      </h4>
                      <p className="text-[10px] text-teal-400 leading-none mb-1.5 font-sans font-bold italic">
                        {char.title || 'Militar'}
                      </p>
                      <div className="flex space-x-1 items-center">
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${getRoleBadgeColor(char.role)} uppercase`}>
                          {char.role}
                        </span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${getFactionBadge(char.faction)}`}>
                          {char.faction}
                        </span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(char)}
                </div>

                {/* Biografia Narrativa Breve */}
                <div className="bg-slate-950/45 border border-slate-900 rounded p-2.5 my-3 text-[11px] text-slate-300 leading-normal font-sans">
                  <p>{char.bio || 'Sem informações operativas adicionais nos bancos de dados.'}</p>
                </div>

                {/* Status Gerais / Métricas Diplomáticas e Políticas */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/50 rounded-lg p-2 border border-slate-850 mb-4 text-[9px] font-mono text-center text-slate-400">
                  <div className="border-r border-slate-850">
                    <span className="text-[8px] text-slate-500 block uppercase leading-none mb-1">Lealdade</span>
                    <span className={`font-bold ${char.loyalty >= 80 ? 'text-teal-400' : char.loyalty >= 50 ? 'text-yellow-500' : 'text-red-450'}`}>
                      {char.loyalty}%
                    </span>
                  </div>
                  <div className="border-r border-slate-850">
                    <span className="text-[8px] text-slate-550 block uppercase leading-none mb-1">Pop.</span>
                    <span className="text-sky-400 font-bold">{char.popularity}%</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-550 block uppercase leading-none mb-1">Influência</span>
                    <span className="text-amber-500 font-bold">{char.influence}%</span>
                  </div>
                </div>

                {/* Atributos Táticos/Operários */}
                <div className="space-y-2 mb-4">
                  <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">
                    Atributos Operacionais
                  </span>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[9px] font-mono">
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="text-slate-500">Estratégia:</span>
                      <span className="text-red-400 font-bold">{char.skills.strategy}/10</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="text-slate-500">Intriga:</span>
                      <span className="text-purple-400 font-bold">{char.skills.intrigue}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Carisma:</span>
                      <span className="text-cyan-400 font-bold">{char.skills.charisma}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Administração:</span>
                      <span className="text-emerald-400 font-bold">{char.skills.administration}/10</span>
                    </div>
                  </div>
                </div>

                {/* Habilidade Especial única e descritiva */}
                <div className="bg-slate-950/80 rounded border border-slate-900 p-2.5 text-[10px] space-y-1">
                  <span className="text-[8px] font-mono font-bold tracking-widest text-teal-400 block uppercase">
                    Especialidade Diretiva
                  </span>
                  <p className="text-slate-300 leading-tight">
                    {char.specialAbility}
                  </p>
                </div>
              </div>

              {/* ── Seção de Missão / Deploy ── */}
              <div className="border-t border-slate-850 pt-3 mt-4">
                {char.status === 'EM_MISSAO' ? (
                  // Missão em andamento: descrição + barra de progresso
                  <div className="space-y-2">
                    <div className="bg-slate-950 rounded p-2 border border-amber-900/40 text-[10px] font-mono text-amber-500">
                      <span className="font-bold uppercase text-[9px] block text-amber-400 mb-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Operação em Curso
                      </span>
                      <p className="text-amber-400/80 leading-snug">{char.currentMissionDescription}</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-1">
                        <span>Progresso estimado</span>
                        <span>~{char.turnsInMissionLeft * 7} dias restantes</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600 rounded-full transition-all"
                          style={{ width: `${getMissionProgress(char)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : char.lifeStatus && char.lifeStatus !== 'VIVO' ? (
                  // Fora de combate
                  <div className="bg-slate-950 rounded p-2 border border-slate-900 text-center text-[10px] font-mono text-red-500 font-bold uppercase">
                    Foco Fora de Ação
                  </div>
                ) : canDeploy ? (
                  // ── Formulário de Deploy de Missão ──
                  isDeploying ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-mono text-teal-400 uppercase font-bold">Designar Missão</span>
                        <button
                          onClick={cancelDeploy}
                          className="text-slate-500 hover:text-slate-300 transition"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Seletor de Região */}
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Teatro de Operações</label>
                        <select
                          value={deployRegion}
                          onChange={(e) => setDeployRegion(e.target.value as RegionID)}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-[10px] font-mono focus:outline-none focus:border-teal-600"
                        >
                          <option value="">— Selecione uma região —</option>
                          {playerRegions.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Seletor de Tipo de Missão */}
                      <div>
                        <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Diretriz Operativa</label>
                        <div className="grid grid-cols-2 gap-1">
                          {MISSION_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setDeployMission(opt.value)}
                              className={`text-left px-2 py-1.5 rounded border text-[9px] font-mono transition-all ${
                                deployMission === opt.value
                                  ? 'bg-teal-900/40 border-teal-600 text-teal-300'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <span className="font-bold block">{opt.label}</span>
                              <span className="text-[8px] text-slate-500">{opt.duration}</span>
                            </button>
                          ))}
                        </div>
                        {deployMission && (
                          <p className="text-[9px] text-slate-500 font-mono mt-1 leading-snug">
                            {MISSION_OPTIONS.find(o => o.value === deployMission)?.desc}
                          </p>
                        )}
                      </div>

                      {/* Botão Confirmar */}
                      <button
                        onClick={() => handleDeploy(char.id)}
                        disabled={!deployRegion}
                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider transition-all ${
                          deployRegion
                            ? 'bg-teal-800/60 border border-teal-700 text-teal-300 hover:bg-teal-700/50 cursor-pointer'
                            : 'bg-slate-800/40 border border-slate-700 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        Lançar Operação
                      </button>
                    </div>
                  ) : (
                    // Botão para abrir formulário
                    <button
                      onClick={() => { setDeployingCharId(char.id); setDeployRegion(''); setDeployMission('DEFESA'); }}
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-teal-400 hover:border-teal-800/50 rounded px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <ChevronDown className="w-3 h-3" />
                      Designar Missão
                    </button>
                  )
                ) : (
                  // Personagem não-jogador disponível
                  <div className="bg-slate-950 rounded p-2 border border-slate-900 text-center text-[10px] font-mono text-emerald-400 italic">
                    Sem encargos. Disponível para atuação estratégica.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

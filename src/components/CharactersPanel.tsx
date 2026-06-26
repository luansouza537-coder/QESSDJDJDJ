/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Character, CharacterRole } from '../types/game';
import { 
  Users, 
  MapPin, 
  Activity,
  Award,
  BookOpen,
  Skull
} from 'lucide-react';

export default function CharactersPanel() {
  const { gameState } = useGame();
  const { characters } = gameState;

  // Estado para categoria ativa
  const [selectedCategory, setSelectedCategory] = useState<'TODOS' | 'BRASIL' | 'PARAGUAI' | 'INTERNACIONAL'>('TODOS');

  // Filtrar personagens com base na categoria
  const filteredCharacters = characters.filter(c => {
    if (selectedCategory === 'TODOS') return true;
    if (selectedCategory === 'BRASIL') return c.faction === 'BRASIL';
    if (selectedCategory === 'PARAGUAI') return c.faction === 'PARAGUAI';
    if (selectedCategory === 'INTERNACIONAL') {
      return c.faction === 'CHINA' || c.faction === 'EUA' || c.faction === 'INTERNACIONAL';
    }
    return true;
  });

  const getRoleBadgeColor = (role: CharacterRole) => {
    switch (role) {
      case 'GENERAL':
        return 'bg-red-955/40 border-red-900 text-red-400';
      case 'ESPIAO':
        return 'bg-purple-955/40 border-purple-900 text-purple-400';
      case 'DIPLOMATA':
        return 'bg-cyan-955/40 border-cyan-900 text-cyan-400';
    }
  };

  const getStatusBadge = (char: Character) => {
    if (char.lifeStatus && char.lifeStatus !== 'VIVO') {
      const colors = {
        'MORTO': 'bg-red-950 text-red-500 border-red-900',
        'PRESO': 'bg-amber-955 text-amber-500 border-amber-900',
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
            <span className="w-1.5 h-1.5 rounded-full bg-amber-550 inline-block"></span>
            <span>Em Operação ({char.turnsInMissionLeft}s)</span>
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
    if (faction === 'BRASIL') return 'bg-emerald-950 text-emerald-300 border-emerald-900';
    if (faction === 'PARAGUAI') return 'bg-red-950 text-red-350 border-red-900';
    if (faction === 'CHINA') return 'bg-amber-950 text-amber-300 border-amber-900';
    if (faction === 'EUA') return 'bg-blue-950 text-blue-300 border-blue-900';
    return 'bg-purple-950 text-purple-300 border-purple-900';
  };

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
          return (
            <div 
              key={char.id} 
              className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 hover:bg-slate-900/60 transition duration-150 relative"
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

              {/* Status de Missão Ativa */}
              <div className="border-t border-slate-850 pt-3 mt-4">
                {char.status === 'EM_MISSAO' ? (
                  <div className="bg-slate-950 rounded p-2 border border-slate-850 text-[10px] font-mono text-amber-500">
                    <span className="font-bold uppercase text-[9px] block text-amber-405 mb-0.5">Missão Em Curso:</span>
                    {char.currentMissionDescription}
                  </div>
                ) : char.lifeStatus && char.lifeStatus !== 'VIVO' ? (
                  <div className="bg-slate-950 rounded p-2 border border-slate-900 text-center text-[10px] font-mono text-red-500 font-bold uppercase">
                    Foco Fora de Ação
                  </div>
                ) : (
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

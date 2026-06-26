/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useGame } from '../context/GameContext';
import { FactionID, Faction } from '../types/game';
import { 
  Users, 
  MapPin, 
  Handshake, 
  Flag, 
  Heart, 
  Coins, 
  Send, 
  Ban,
  ShieldAlert
} from 'lucide-react';

export default function DiplomacyPanel() {
  const { gameState, performDiplomacy } = useGame();
  const { factions, relations, playerFaction } = gameState;

  // Filtrar as outras facções
  const otherFactions = (Object.values(factions) as Faction[]).filter(
    f => f.id !== playerFaction
  );

  // Buscar valor de relação específico do Brasil com outra facção
  const getRelationValue = (targetId: FactionID) => {
    const rel = relations.find(
      r => (r.factionA === playerFaction && r.factionB === targetId) ||
           (r.factionA === targetId && r.factionB === playerFaction)
    );
    return rel ? rel.value : 0;
  };

  // Buscar os tratados ativos
  const getTreaties = (targetId: FactionID) => {
    const rel = relations.find(
      r => (r.factionA === playerFaction && r.factionB === targetId) ||
           (r.factionA === targetId && r.factionB === playerFaction)
    );
    return rel ? rel.treaties : [];
  };

  const getRelationColor = (val: number) => {
    if (val <= -40) return 'text-red-500 bg-red-950/40 border-red-900';
    if (val < 15) return 'text-amber-500 bg-amber-950/20 border-amber-900/50';
    return 'text-emerald-500 bg-emerald-950/30 border-emerald-900';
  };

  const getRelationLabel = (val: number) => {
    if (val <= -50) return 'GUERRA FRIA/CONFLITO ATIVO';
    if (val <= -15) return 'TENSÃO GEOPOLÍTICA';
    if (val < 15) return 'NEUTRALIDADE INSTÁVEL';
    if (val < 50) return 'RELAÇÃO COOPERATIVA';
    return 'COALIZÃO ALLIADA';
  };

  return (
    <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-6 shadow-2xl">
      <div className="border-b border-slate-800 pb-3 mb-5 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Handshake className="text-teal-400 w-5 h-5" />
          <h3 className="font-bold text-slate-200 uppercase font-sans tracking-tight text-sm">
            Gabinete do Itamaraty & Negociações do Prata
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          Canal de Comunicação Criptografado
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {otherFactions.map((fac) => {
          const val = getRelationValue(fac.id);
          const treaties = getTreaties(fac.id);
          const relationClass = getRelationColor(val);

          return (
            <div 
              key={fac.id} 
              className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex flex-col justify-between align-stretch hover:border-slate-800 transition duration-150"
            >
              <div>
                {/* Cabeçalho da Facção */}
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={fac.leaderAvatar} 
                    alt={fac.leaderName} 
                    className="w-12 h-12 rounded-full border border-slate-705 shadow object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">
                      {fac.leaderTitle}
                    </span>
                    <h4 className="text-xs font-bold font-sans text-slate-100">
                      {fac.leaderName}
                    </h4>
                    <span className={`text-[10px] font-mono font-medium ${fac.textColor}`}>
                      {fac.name}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-sans leading-relaxed mb-4">
                  {fac.description}
                </p>

                {/* Status de Relação Geopolítica */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-1">
                    <span>RELAÇÕES BRASILEIRAS</span>
                    <span className="text-slate-300 font-bold">{val} / 100</span>
                  </div>
                  
                  {/* Barra Relacional */}
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        val <= -20 ? 'bg-red-650' : val < 15 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(10, Math.min(100, (val + 100) / 2))}%` }}
                    />
                  </div>

                  <div className={`mt-2 border rounded p-1.5 text-[9px] font-extrabold font-mono tracking-wider text-center ${relationClass}`}>
                    {getRelationLabel(val)}
                  </div>
                </div>

                {/* Tratados Ativos */}
                <div className="mb-5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">
                    Tratados em Vigor
                  </span>
                  <div className="flex flex-wrap gap-1.5 min-h-[25px]">
                    {treaties.length === 0 ? (
                      <span className="text-[10px] text-slate-600 font-mono italic">
                        Nenhum pacto formalizado.
                      </span>
                    ) : (
                      treaties.map((treaty) => (
                        <span 
                          key={treaty} 
                          className="bg-emerald-950/20 border border-emerald-900 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase"
                        >
                          ✓ {treaty}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de Ações de Itamaraty */}
              <div className="space-y-2 border-t border-slate-850 pt-3">
                <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1.5 text-center">
                  Canais de Deliberação
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => performDiplomacy(fac.id, 'DIPLOMACIA_PRESENCIAL')}
                    className="flex items-center justify-center space-x-1 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-[10px] text-slate-350 font-bold py-1.5 px-2 rounded transition cursor-pointer"
                  >
                    <Send className="w-3 h-3 text-cyan-400" />
                    <span>Visita Militar (F$ 15)</span>
                  </button>
                  <button
                    onClick={() => performDiplomacy(fac.id, 'FINANCIAR')}
                    className="flex items-center justify-center space-x-1 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-[10px] text-slate-350 font-bold py-1.5 px-2 rounded transition cursor-pointer"
                  >
                    <Coins className="w-3 h-3 text-yellow-500" />
                    <span>Subsidiar (F$ 40)</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => performDiplomacy(fac.id, 'PACTO_NAO_AGRESSAO')}
                    disabled={treaties.includes('Pacto de Não-Agressão')}
                    className={`flex items-center justify-center space-x-1 text-[10px] font-bold py-1.5 px-2 rounded transition ${
                      treaties.includes('Pacto de Não-Agressão')
                        ? 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed'
                        : 'bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-350 cursor-pointer'
                    }`}
                  >
                    <Handshake className="w-3 h-3 text-emerald-500" />
                    <span>Assinar Pacto (F$ 25)</span>
                  </button>
                  <button
                    onClick={() => performDiplomacy(fac.id, 'DECLARAR_GUERRA')}
                    className="flex items-center justify-center space-x-1 bg-red-955 border border-red-900 hover:bg-red-950 hover:border-red-700 text-[10px] text-red-400 font-bold py-1.5 px-2 rounded transition cursor-pointer"
                  >
                    <ShieldAlert className="w-3 h-3 text-red-500" />
                    <span>Declarar Guerra</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

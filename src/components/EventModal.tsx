/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GameEvent, EventChoice } from '../types/game';
import { 
  Building2, 
  Terminal, 
  Flame, 
  Award, 
  ShieldAlert, 
  Zap, 
  Coins, 
  Package, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function EventModal() {
  const { gameState, resolveActiveEventChoice } = useGame();
  const { activeEvent, playerFaction, factions } = gameState;

  // Guarda qual escolha está atualmente selecionada no modal
  const [selectedChoiceId, setSelectedChoiceId] = useState<string>('');

  if (!activeEvent) return null;

  const playerFac = factions[playerFaction];
  const { funds, supplies, energy } = playerFac.resources;

  const getCategoryIcon = (cat: GameEvent['category']) => {
    switch (cat) {
      case 'MILITAR':
        return <Flame className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'DIPLOMATICO':
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
      case 'INFRAESTRUTURA':
        return <Building2 className="w-5 h-5 text-emerald-450" />;
      case 'REMANCENTES':
        return <Terminal className="w-5 h-5 text-purple-400" />;
    }
  };

  const handleConfirmChoice = () => {
    if (!selectedChoiceId) return;
    resolveActiveEventChoice(selectedChoiceId);
    setSelectedChoiceId(''); // limpa pra próximo evento
  };

  // Verificar se o jogador cumpre os critérios para uma dada escolha
  const isChoiceAffordable = (choice: EventChoice) => {
    if (choice.requiredFunds && funds < choice.requiredFunds) return false;
    if (choice.requiredSupplies && supplies < choice.requiredSupplies) return false;
    if (choice.requiredEnergy && energy < choice.requiredEnergy) return false;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-fade-in"
        style={{ animationDuration: '0.4s' }}
      >
        {/* Visual Line Top Decor */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-amber-500 to-red-600"></div>

        <div className="p-6">
          {/* Tag Categoria */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase flex items-center space-x-1">
              <span>CANAL OPERATIVO CRÍTICO DE BRASÍLIA</span>
            </span>
            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-850 px-2.5 py-0.5 rounded-full">
              {getCategoryIcon(activeEvent.category)}
              <span className="text-[9px] font-extrabold font-mono text-slate-300 uppercase tracking-widest">
                {activeEvent.category}
              </span>
            </div>
          </div>

          {/* Imagem do Evento */}
          <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4 border border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
            <img 
              src={activeEvent.image} 
              alt={activeEvent.title} 
              className="w-full h-full object-cover filter brightness-90 saturate-[0.8]"
              referrerPolicy="no-referrer"
            />
            {/* Overlay indicando Urgência */}
            <span className="absolute top-3 left-3 bg-red-950/80 border border-red-800 text-red-400 font-mono text-[9px] font-black px-2 py-0.5 rounded uppercase flex items-center space-x-1 z-25">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>DECISÃO OBRIGATÓRIA</span>
            </span>
          </div>

          {/* Texto do Evento */}
          <h2 className="text-xl font-bold font-sans text-slate-100 tracking-tight leading-tight mb-2">
            {activeEvent.title}
          </h2>
          <p className="text-xs text-slate-350 leading-relaxed font-sans mb-5">
            {activeEvent.description}
          </p>

          {/* Opções de Escrita Grelhada */}
          <div className="space-y-3 mb-6">
            {activeEvent.choices.map((choice) => {
              const affordable = isChoiceAffordable(choice);
              const isSelected = selectedChoiceId === choice.id;

              return (
                <div
                  key={choice.id}
                  onClick={() => affordable && setSelectedChoiceId(choice.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition flex items-start space-x-3 text-left ${
                    !affordable 
                      ? 'bg-slate-900/10 border-slate-850/40 opacity-40 cursor-not-allowed'
                      : isSelected
                        ? 'bg-slate-800/40 border-teal-500/80 shadow-md shadow-slate-950'
                        : 'bg-slate-950/40 border-slate-850 hover:bg-slate-850/40 hover:border-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="geopolitical-choice"
                    checked={isSelected}
                    disabled={!affordable}
                    onChange={() => {}}
                    className="mt-1 accent-teal-500 h-3.5 w-3.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start gap-1">
                      <h4 className="text-xs font-bold font-sans text-slate-200">
                        {choice.text}
                      </h4>
                      {/* Custos das Opções */}
                      <div className="flex space-x-2 text-[8px] font-mono mt-0.5">
                        {choice.requiredFunds && (
                          <span className={`${funds >= choice.requiredFunds ? 'text-yellow-500' : 'text-red-500 font-black'}`}>
                            F$ {choice.requiredFunds}
                          </span>
                        )}
                        {choice.requiredSupplies && (
                          <span className={`${supplies >= choice.requiredSupplies ? 'text-teal-400' : 'text-red-500 font-black'}`}>
                            📦 {choice.requiredSupplies} sup.
                          </span>
                        )}
                        {choice.requiredEnergy && (
                          <span className={`${energy >= choice.requiredEnergy ? 'text-amber-500' : 'text-red-500 font-black'}`}>
                            ⚡ {choice.requiredEnergy} GW
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 font-sans mt-1.5 leading-relaxed">
                      {choice.consequencesDescription}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botão de Confirmação */}
          <div className="flex justify-end space-x-3 border-t border-slate-800 pt-4">
            <button
              onClick={handleConfirmChoice}
              disabled={!selectedChoiceId}
              className={`w-full text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition uppercase tracking-wider ${
                selectedChoiceId
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-slate-100 cursor-pointer shadow-lg shadow-teal-950/40'
                  : 'bg-slate-850 text-slate-650 cursor-not-allowed border border-slate-800'
              }`}
            >
              <span>Homologar Decisão de Gabinete</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

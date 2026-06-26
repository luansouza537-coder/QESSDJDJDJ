/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { HistoryLog } from '../types/game';
import { 
  FileText, 
  Terminal, 
  Settings, 
  Filter, 
  ShieldAlert, 
  Globe2, 
  BarChart4, 
  Activity 
} from 'lucide-react';

export default function WarReports() {
  const { gameState } = useGame();
  const { historyLogs, warAdvisor, currentTurn } = gameState;

  // Estado para filtragem de logs
  const [filterType, setFilterType] = useState<HistoryLog['type'] | 'TODOS'>('TODOS');

  // Filtrar logs
  const filteredLogs = historyLogs.filter(log => {
    if (filterType === 'TODOS') return true;
    return log.type === filterType;
  });

  // Conselhos dinâmicos do assessor de guerra
  const getAdvisorMessage = () => {
    if (warAdvisor.includes('Militar')) {
      return 'Doutrina Tática: Mantenha sempre um mínimo de 20 brigadas armadas no perímetro da Usina de Itaipu. Perder Itaipu causará colapso elétrico imediato e derrota irretroativa.';
    } else if (warAdvisor.includes('Diplomacia')) {
      return 'Doutrina Diplomática: Mantenha as relações com a Aliança do Chaco acima de +30. Eles são o nosso escudo ao norte contra as ofensivas de Solano.';
    } else {
      return 'Doutrina Operativa: Envie a espiã Major Mariana Lemos para infiltrar Ciudad del Este e pilhar suprimentos da milícia do oponente toda semana.';
    }
  };

  const getLogIcon = (type: HistoryLog['type']) => {
    switch (type) {
      case 'MILITAR':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
      case 'DIPLOMACIA':
        return <Globe2 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'ECONOMIA':
        return <BarChart4 className="w-3.5 h-3.5 text-emerald-450" />;
      case 'EVENTO':
        return <Activity className="w-3.5 h-3.5 text-amber-500" />;
      case 'SISTEMA':
        return <Terminal className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col h-full min-h-[420px]">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <Terminal className="text-teal-400 w-5 h-5" />
          <h3 className="font-bold text-slate-200 font-sans tracking-tight text-sm uppercase">
            Relatórios Bi-Nacionais & Logs Operacionais
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">Filtrando: {filterType}</span>
      </div>

      {/* Conselho do Assessor de Guerra */}
      <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-lg flex items-start space-x-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 font-bold font-mono text-[9px] flex items-center justify-center text-teal-300 flex-shrink-0 animate-pulse">
          AWM
        </div>
        <div>
          <span className="text-[9px] font-extrabold text-slate-400 font-mono tracking-wider uppercase block">
            Diretriz Técnica de {warAdvisor}
          </span>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-0.5">
            "{getAdvisorMessage()}"
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilterType('TODOS')}
          className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide font-mono uppercase transition ${
            filterType === 'TODOS' ? 'bg-teal-850 border border-teal-500 text-teal-300' : 'bg-slate-900 text-slate-400 border border-transparent hover:bg-slate-850'
          }`}
        >
          Tudo
        </button>
        <button
          onClick={() => setFilterType('MILITAR')}
          className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide font-mono uppercase transition ${
            filterType === 'MILITAR' ? 'bg-red-950 border border-red-800 text-red-400' : 'bg-slate-900 text-slate-400 border border-transparent hover:bg-slate-850'
          }`}
        >
          Combate
        </button>
        <button
          onClick={() => setFilterType('DIPLOMACIA')}
          className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide font-mono uppercase transition ${
            filterType === 'DIPLOMACIA' ? 'bg-cyan-950/70 border border-cyan-850 text-cyan-400' : 'bg-slate-900 text-slate-400 border border-transparent hover:bg-slate-850'
          }`}
        >
          Diplomacia
        </button>
        <button
          onClick={() => setFilterType('ECONOMIA')}
          className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide font-mono uppercase transition ${
            filterType === 'ECONOMIA' ? 'bg-emerald-950/70 border border-emerald-900 text-emerald-400' : 'bg-slate-900 text-slate-400 border border-transparent hover:bg-slate-850'
          }`}
        >
          Economia
        </button>
        <button
          onClick={() => setFilterType('EVENTO')}
          className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide font-mono uppercase transition ${
            filterType === 'EVENTO' ? 'bg-amber-950/80 border border-amber-800 text-amber-500' : 'bg-slate-900 text-slate-400 border border-transparent hover:bg-slate-850'
          }`}
        >
          Decretos
        </button>
      </div>

      {/* Lista de relatórios táticos */}
      <div className="flex-1 overflow-y-auto max-h-[350px] space-y-2 pr-1 custom-scrollbar">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-600 font-mono text-xs">
            Nenhuma diretriz reportada nesta aba de satélite.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="bg-slate-900/40 hover:bg-slate-900/85 border border-slate-850 p-2.5 rounded-lg flex items-start space-x-3 transition duration-150"
            >
              <div className="mt-0.5 flex-shrink-0 bg-slate-950 p-1.5 rounded-md border border-slate-800">
                {getLogIcon(log.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-extrabold font-mono tracking-wider uppercase text-slate-500">
                    Tipo: {log.type}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-850">
                    Semana {log.turn}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono mt-1 leading-relaxed">
                  {log.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-900 pt-3 mt-4 text-[9px] font-mono text-slate-500 text-right flex justify-between items-center">
        <span>Prontidão Operacional: 100%</span>
        <span>Criptografia: SHA-512 Ativada</span>
      </div>
    </div>
  );
}

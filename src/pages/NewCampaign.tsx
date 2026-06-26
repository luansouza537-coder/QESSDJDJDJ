/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { FactionID } from '../types/game';
import { 
  ShieldAlert, 
  HelpCircle, 
  UserCheck, 
  Volume2, 
  Award, 
  ChevronRight, 
  Briefcase, 
  ChevronLeft 
} from 'lucide-react';

interface NewCampaignProps {
  onBackToMenu: () => void;
}

export default function NewCampaign({ onBackToMenu }: NewCampaignProps) {
  const { startGame } = useGame();

  // Estados locais para configuração da campanha
  const [selectedFaction, setSelectedFaction] = useState<FactionID>('BRASIL');
  const [difficulty, setDifficulty] = useState<'FACIL' | 'NORMAL' | 'DIFICIL'>('NORMAL');
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>('Estratégia Militar - Cavalcanti');

  // Lançar Campanha (Chama a inicialização do Context e abre o Dashboard)
  const handleLaunchCampaign = () => {
    startGame(selectedFaction, difficulty, selectedAdvisor);
  };

  const getDifficultyDescription = (diff: typeof difficulty) => {
    switch (diff) {
      case 'FACIL':
        return 'Ideal para estreantes. A facção escolhida inicia com fundos adicionais (+F$ 60), amplos suprimentos gerais de fronteira (+100) e rede e estabilidade altamente saudáveis.';
      case 'NORMAL':
        return 'A curva de simulação padrão de 2034. Recursos em níveis históricos normais. Forças opositoras e do Chaco agem agressivamente.';
      case 'DIFICIL':
        return 'Sobrevivência geopolítica severa. Suas reservas financeiras de guerra iniciam deduzidas (-30), cadeia de suprimento encurtada (-80) e menor margem de erro geral.';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:30px_30px] opacity-25"></div>

      {/* Header */}
      <div className="border-b border-slate-900 px-6 py-4 flex justify-between items-center bg-slate-950/80 backdrop-blur z-10">
        <button
          onClick={onBackToMenu}
          className="flex items-center space-x-1 hover:text-teal-400 text-xs text-slate-405 font-mono cursor-pointer transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Retornar ao Menu</span>
        </button>
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          Configuração de Inteligência Bélica
        </span>
      </div>

      {/* Container Principal */}
      <div className="max-w-5xl mx-auto px-6 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 relative">
        
        {/* Lado Esquerdo: Facções (6 colunas) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <h2 className="text-xl font-black font-sans tracking-tight text-slate-100 uppercase">
              1. Selecionar Beligerante
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Escolha a soberania estatal que você comandará.
            </p>
          </div>

          <div className="space-y-3">
            {/* Opção 1: BRASIL (Playable) */}
            <div 
              onClick={() => setSelectedFaction('BRASIL')}
              className={`border rounded-xl p-4 cursor-pointer transition relative overflow-hidden ${
                selectedFaction === 'BRASIL'
                  ? 'bg-emerald-950/25 border-emerald-500 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900/30 border-slate-850 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded bg-emerald-700/80 border border-emerald-500 flex items-center justify-center font-bold text-slate-100 font-sans">
                  BR
                </div>
                <div>
                  <h4 className="text-sm font-bold font-sans text-slate-100">
                    República Federativa do Brasil
                  </h4>
                  <span className="text-[10px] text-teal-400 font-mono uppercase">Líder: Presidente Alberto Mendonça</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-350 leading-relaxed font-sans mt-3">
                Objetivo: Unificar as usinas, coibir agressões táticas na Ponte da Amizade e salvaguardar a eletricidade hidráulica vital de Itaipu sem colapsar a diplomacia com o Chaco.
              </p>
              <span className="absolute top-4 right-4 bg-emerald-950 border border-emerald-800 text-emerald-400 text-[9px] font-black px-1.5 py-0.2 rounded font-mono">
                DISPONÍVEL
              </span>
            </div>

            {/* Opção 2: PARAGUAI (Playable) */}
            <div 
              onClick={() => setSelectedFaction('PARAGUAI')}
              className={`border rounded-xl p-4 cursor-pointer transition relative overflow-hidden ${
                selectedFaction === 'PARAGUAI'
                  ? 'bg-red-950/25 border-red-500 shadow-md shadow-red-950/40'
                  : 'bg-slate-900/30 border-slate-850 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded bg-red-800/80 border border-red-500 flex items-center justify-center font-bold text-slate-100 font-sans">
                  PY
                </div>
                <div>
                  <h4 className="text-sm font-bold font-sans text-slate-100">
                    República do Paraguai
                  </h4>
                  <span className="text-[10px] text-red-400 font-mono uppercase">Líder: General Santiago Caballero</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-350 leading-relaxed font-sans mt-3">
                Objetivo: Unificar as usinas sob soberania paraguaia e neutralizar a influência militar de Brasília nos postos de fronteira e em Itaipu.
              </p>
              <span className="absolute top-4 right-4 bg-red-950 border border-red-800 text-red-400 text-[9px] font-black px-1.5 py-0.2 rounded font-mono">
                DISPONÍVEL
              </span>
            </div>

            {/* Opção 3: COALIZAO CHACO (NPC) */}
            <div className="border border-slate-900 rounded-xl p-4 bg-slate-900/10 opacity-50 cursor-not-allowed relative">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded bg-amber-950 border border-amber-900 flex items-center justify-center font-bold text-slate-500">
                  CH
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 font-sans">Aliança Autônoma do Chaco</h4>
                  <span className="text-[9px] text-amber-500 font-mono uppercase">Líder: General Alexei "El Toro" Benítez</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-sans mt-2">
                Objetivo: Consolidar refinarias de gás táticas e guarnecer o deserto árido do Chaco por meios militares altamente equipados.
              </p>
              <span className="absolute top-4 right-4 bg-slate-950 border border-slate-900 text-slate-505 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                APENAS NPC
              </span>
            </div>
          </div>
        </div>

        {/* Lado Direito: Opções (6 colunas) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Sessão 2: Conselheiro militar */}
          <div>
            <h2 className="text-xl font-black font-sans tracking-tight text-slate-100 uppercase">
              2. Escolher Doutrina do Gabinete
            </h2>
            <p className="text-xs text-slate-405 font-mono mt-1">
              Define conselhos estratégicos automáticos e foco de bônus preliminares.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div 
              onClick={() => setSelectedAdvisor('Estratégia Militar - Cavalcanti')}
              className={`border rounded-lg p-3 cursor-pointer transition flex flex-col items-center justify-center text-center ${
                selectedAdvisor.includes('Militar')
                  ? 'bg-slate-900 border-teal-500 shadow shadow-teal-900/10 text-slate-100'
                  : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Briefcase className="w-6 h-6 text-red-400 mb-1.5" />
              <span className="text-[10px] font-bold font-sans">Ad. Cavalcanti</span>
              <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">Estratégia Militar</span>
            </div>

            <div 
              onClick={() => setSelectedAdvisor('Diplomacia Ativa - Alencar')}
              className={`border rounded-lg p-3 cursor-pointer transition flex flex-col items-center justify-center text-center ${
                selectedAdvisor.includes('Diplomacia')
                  ? 'bg-slate-900 border-teal-500 shadow shadow-teal-900/10 text-slate-100'
                  : 'bg-slate-900/40 border-slate-850 text-slate-405 hover:bg-slate-900'
              }`}
            >
              <UserCheck className="w-6 h-6 text-cyan-400 mb-1.5" />
              <span className="text-[10px] font-bold font-sans">Ad. Alencar</span>
              <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">Relações Exteriores</span>
            </div>

            <div 
              onClick={() => setSelectedAdvisor('Intrigas e Contrainformação - Lemos')}
              className={`border rounded-lg p-3 cursor-pointer transition flex flex-col items-center justify-center text-center ${
                selectedAdvisor.includes('Intrigas')
                  ? 'bg-slate-900 border-teal-500 shadow shadow-teal-900/10 text-slate-100'
                  : 'bg-slate-900/30 border-slate-850 text-slate-405 hover:bg-slate-900'
              }`}
            >
              <Award className="w-6 h-6 text-purple-400 mb-1.5" />
              <span className="text-[10px] font-bold font-sans">Ad. Lemos</span>
              <span className="text-[8px] font-mono text-slate-550 uppercase mt-0.5">Contrainformação</span>
            </div>
          </div>

          {/* Sessão 3: Nível de Gravidade / Dificuldade */}
          <div>
            <h2 className="text-xl font-black font-sans tracking-tight text-slate-100 uppercase">
              3. Nível de Dificuldade
            </h2>
            <p className="text-xs text-slate-405 font-mono mt-1">
              Determina as reservas iniciais de fundos e de rede elétrica do Brasil.
            </p>
          </div>

          <div className="flex space-x-2 border-b border-transparent pb-1">
            {['FACIL', 'NORMAL', 'DIFICIL'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff as any)}
                className={`flex-1 py-1.5 text-center text-xs font-mono font-bold tracking-widest rounded transition cursor-pointer border ${
                  difficulty === diff 
                    ? 'bg-teal-900 border-teal-500 text-teal-300 shadow' 
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-905'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Card Descritivo da Dificuldade */}
          <div className="bg-slate-900/50 border border-slate-850 p-3.5 rounded-lg text-xs leading-relaxed font-sans text-slate-350 min-h-[75px]">
            {getDifficultyDescription(difficulty)}
          </div>
        </div>
      </div>

      {/* Botão de Lançamento Tático (Rodapé) */}
      <div className="border-t border-slate-900 p-6 flex justify-end bg-slate-950/80 backdrop-blur z-10">
        <button
          onClick={handleLaunchCampaign}
          className="group bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-slate-100 font-extrabold text-xs px-8 py-3 rounded-lg flex items-center space-x-2 shadow-lg shadow-teal-950/45 cursor-pointer hover:scale-[1.01] transition-transform uppercase tracking-wider"
        >
          <span>Lançar Ofensiva da Aliança</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import Map from '../components/Map';
import RegionDetails from '../components/RegionDetails';
import DiplomacyPanel from '../components/DiplomacyPanel';
import CharactersPanel from '../components/CharactersPanel';
import WarReports from '../components/WarReports';
import EventModal from '../components/EventModal';
import ActiveBattleModal from '../components/ActiveBattleModal';
import PrequelDashboard from '../components/PrequelDashboard';
import EndingViewer from '../components/EndingViewer';
import StrategicInfrastructure from '../components/StrategicInfrastructure';
import {
  Zap,
  Coins,
  Package,
  Award,
  Compass,
  Handshake,
  Users,
  Terminal,
  ChevronRight,
  Calendar,
  Sparkles,
  ShieldAlert,
  Clock,
  BookOpen,
  Cpu,
  TrendingUp,
  TrendingDown,
  BarChart2
} from 'lucide-react';

export default function Dashboard() {
  const { gameState, advanceTurn, economicIndicators } = useGame();
  const {
    currentTurn,
    factions,
    playerFaction,
    victoryStatus,
    timelineProgress,
    prequelYear
  } = gameState;

  // Estado para aba ativa da dashboard
  // Abas normais da guerra: "MAPA", "DIPLOMACIA", "PERSONAGENS", "RELATORIOS"
  // Abas do prequel: "CRONOLOGIA", "CONSELHO"
  const [activeTab, setActiveTab] = useState<'MAPA' | 'DIPLOMACIA' | 'PERSONAGENS' | 'RELATORIOS' | 'CRONOLOGIA' | 'INFRAESTRUTURA'>('MAPA');

  // Ajusta a aba inicial com base no estágio da campanha
  useEffect(() => {
    if (timelineProgress === 'PREQUEL') {
      setActiveTab('CRONOLOGIA');
    } else {
      setActiveTab('MAPA');
    }
  }, [timelineProgress]);

  const playerFac = factions[playerFaction];
  const { funds, supplies, energy } = playerFac?.resources || { funds: 0, supplies: 0, energy: 0 };

  const handleNextTurn = () => {
    advanceTurn();
  };

  // Se o jogo estivier concluído (Finais desvelados), exibe o painel cinemático de Finais
  if (victoryStatus !== 'JOGANDO' || timelineProgress === 'FINAIS') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative py-12 px-4 selection:bg-teal-500/35">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:30px_30px] opacity-25"></div>
        <EndingViewer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative select-none ${playerFaction === 'PARAGUAI' ? 'selection:bg-red-500/35' : 'selection:bg-teal-500/35'}`}>
      {/* Background GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:30px_30px] opacity-25"></div>

      {/* --- CABEÇALHO GEOPOLÍTICO E PAINEL DE METRICAS --- */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur z-30 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Título e turnos */}
          <div className="flex items-center space-x-3.5">
            <div className={`w-9 h-9 rounded flex items-center justify-center font-bold font-sans shrink-0 border shadow ${
              playerFaction === 'PARAGUAI'
                ? 'bg-red-950/60 border-red-500/80 text-red-400 shadow-red-950'
                : 'bg-teal-850/60 border-teal-500/80 text-teal-450 shadow-teal-950'
            }`}>
              C2
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-200 uppercase font-sans leading-none mb-1">
                Teatro de Conflito do Prata
              </h1>
              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-850 text-[10px] font-mono text-slate-400">
                <Calendar className={`w-3.5 h-3.5 ${playerFaction === 'PARAGUAI' ? 'text-red-400' : 'text-teal-400'}`} />
                {timelineProgress === 'PREQUEL' ? (
                  <span>Cronologia Clandestina • Ano de {prequelYear}</span>
                ) : (
                  <span>Semana {currentTurn} of Conflict • Ano 2034</span>
                )}
              </div>
            </div>
          </div>

          {/* Sinais Vitais / Recursos Táticos da Nação */}
          {timelineProgress === 'GUERRA' ? (
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 font-mono">
              {/* Fundos */}
              <div className="px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-850 flex items-center space-x-2 shadow-sm">
                <Coins className="w-4 h-4 text-yellow-500" />
                <div>
                  <span className="text-[8px] text-slate-500 block uppercase leading-none">Fundos</span>
                  <span className="text-xs font-black text-slate-200">F$ {funds}</span>
                </div>
              </div>

              {/* Suprimentos */}
              <div className="px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-850 flex items-center space-x-2 shadow-sm">
                <Package className="w-4 h-4 text-teal-455" />
                <div>
                  <span className="text-[8px] text-slate-500 block uppercase leading-none">Suprimentos</span>
                  <span className="text-xs font-black text-slate-200">{supplies} Un.</span>
                </div>
              </div>

              {/* Energia */}
              <div className="px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-850 flex items-center space-x-2 shadow-sm">
                <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                <div>
                  <span className="text-[8px] text-slate-500 block uppercase leading-none">Rede Hidráulica</span>
                  <span className="text-xs font-black text-slate-200">{energy} GW/h</span>
                </div>
              </div>

              {/* Moral Nacional */}
              <div className="px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-850 flex items-center space-x-2 shadow-sm">
                <Award className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-[8px] text-slate-505 block uppercase leading-none">Moral Nacional</span>
                  <span className="text-xs font-black text-slate-200">{playerFac?.nationalMorale || 50}%</span>
                </div>
              </div>

              {/* Indicadores Econômicos (motor real-time) */}
              {economicIndicators && (
                <>
                  <div className={`px-3 py-1.5 rounded-lg bg-slate-900/40 border flex items-center space-x-2 shadow-sm ${
                    economicIndicators.pibCrescimento >= 0
                      ? 'border-emerald-900/60'
                      : 'border-red-900/60'
                  }`}>
                    {economicIndicators.pibCrescimento >= 0
                      ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                      : <TrendingDown className="w-4 h-4 text-red-400" />
                    }
                    <div>
                      <span className="text-[8px] text-slate-500 block uppercase leading-none">PIB</span>
                      <span className={`text-xs font-black ${economicIndicators.pibCrescimento >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {economicIndicators.pibCrescimento >= 0 ? '+' : ''}{(economicIndicators.pibCrescimento * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className={`px-3 py-1.5 rounded-lg bg-slate-900/40 border flex items-center space-x-2 shadow-sm ${
                    economicIndicators.inflacao > 0.10
                      ? 'border-red-900/60'
                      : economicIndicators.inflacao > 0.06
                        ? 'border-amber-900/60'
                        : 'border-slate-850'
                  }`}>
                    <BarChart2 className={`w-4 h-4 ${
                      economicIndicators.inflacao > 0.10 ? 'text-red-400'
                      : economicIndicators.inflacao > 0.06 ? 'text-amber-400'
                      : 'text-slate-400'
                    }`} />
                    <div>
                      <span className="text-[8px] text-slate-500 block uppercase leading-none">Inflação</span>
                      <span className={`text-xs font-black ${
                        economicIndicators.inflacao > 0.10 ? 'text-red-400'
                        : economicIndicators.inflacao > 0.06 ? 'text-amber-400'
                        : 'text-slate-200'
                      }`}>
                        {(economicIndicators.inflacao * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 font-mono">
              <div className={`px-3 py-1 rounded border text-[10px] flex items-center space-x-1 ${
                playerFaction === 'PARAGUAI'
                  ? 'bg-red-950/20 border-red-900/45 text-red-400'
                  : 'bg-teal-950/20 border-teal-900/45 text-teal-400'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>Simulação do Prequel Ativa: Suas decisões moldarão os recursos da campanha!</span>
              </div>
            </div>
          )}

          {/* Ação de Próximo Turno */}
          {timelineProgress === 'GUERRA' && (
            <button
              onClick={handleNextTurn}
              disabled={gameState.activeEvent !== null}
              className="group px-5 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:from-slate-850 disabled:to-slate-850 disabled:cursor-not-allowed border border-teal-500/20 text-slate-100 font-extrabold text-xs tracking-wider flex items-center space-x-2 cursor-pointer shadow-md shadow-teal-950 transition-transform uppercase"
            >
              <span>Passar Turno</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </header>

      {/* --- MENU DE NAVEGAÇÃO DA DASHBOARD --- */}
      <nav className="border-b border-slate-900 bg-slate-950/40 z-20">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto py-2">
          {timelineProgress === 'PREQUEL' ? (
            <>
              <button
                onClick={() => setActiveTab('CRONOLOGIA')}
                className={`px-4 py-1.5 rounded text-[10px] font-extrabold tracking-wider font-mono uppercase transition flex items-center space-x-1.5 border cursor-pointer ${
                  activeTab === 'CRONOLOGIA' 
                    ? playerFaction === 'PARAGUAI'
                      ? 'bg-red-950/40 text-red-350 border-red-500/80 shadow'
                      : 'bg-teal-950/40 text-teal-350 border-teal-500/80 shadow' 
                    : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-850'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Cronologia Decenal</span>
              </button>

              <button
                onClick={() => setActiveTab('PERSONAGENS')}
                className={`px-4 py-1.5 rounded text-[10px] font-extrabold tracking-wider font-mono uppercase transition flex items-center space-x-1.5 border cursor-pointer ${
                  activeTab === 'PERSONAGENS' 
                    ? playerFaction === 'PARAGUAI'
                      ? 'bg-red-950/40 text-red-350 border-red-500/80 shadow'
                      : 'bg-teal-950/40 text-teal-350 border-teal-500/80 shadow' 
                    : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-850'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Fichas de Inteligência</span>
              </button>

              <button
                onClick={() => setActiveTab('INFRAESTRUTURA')}
                className={`px-4 py-1.5 rounded text-[10px] font-extrabold tracking-wider font-mono uppercase transition flex items-center space-x-1.5 border cursor-pointer ${
                  activeTab === 'INFRAESTRUTURA' 
                    ? playerFaction === 'PARAGUAI'
                      ? 'bg-red-950/40 text-red-350 border-red-500/80 shadow'
                      : 'bg-teal-950/40 text-teal-350 border-teal-500/80 shadow' 
                    : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-850'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Infraestrutura</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('MAPA')}
                className={`px-4 py-1.5 rounded text-[10px] font-extrabold tracking-wider font-mono uppercase transition flex items-center space-x-1.5 border cursor-pointer ${
                  activeTab === 'MAPA' 
                    ? playerFaction === 'PARAGUAI'
                      ? 'bg-red-950/40 text-red-350 border-red-500/80 shadow'
                      : 'bg-teal-950/40 text-teal-350 border-teal-500/80 shadow' 
                    : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-850'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Mapa Estratégico</span>
              </button>

              <button
                onClick={() => setActiveTab('DIPLOMACIA')}
                className={`px-4 py-1.5 rounded text-[10px] font-extrabold tracking-wider font-mono uppercase transition flex items-center space-x-1.5 border cursor-pointer ${
                  activeTab === 'DIPLOMACIA' 
                    ? playerFaction === 'PARAGUAI'
                      ? 'bg-red-950/40 text-red-350 border-red-500/80 shadow'
                      : 'bg-teal-950/40 text-teal-350 border-teal-500/80 shadow' 
                    : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-850'
                }`}
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>Diplomacia do Prata</span>
              </button>

              <button
                onClick={() => setActiveTab('PERSONAGENS')}
                className={`px-4 py-1.5 rounded text-[10px] font-extrabold tracking-wider font-mono uppercase transition flex items-center space-x-1.5 border cursor-pointer ${
                  activeTab === 'PERSONAGENS' 
                    ? playerFaction === 'PARAGUAI'
                      ? 'bg-red-950/40 text-red-350 border-red-500/80 shadow'
                      : 'bg-teal-950/40 text-teal-350 border-teal-500/80 shadow' 
                    : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-850'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Conselho Operacional</span>
              </button>

              <button
                onClick={() => setActiveTab('RELATORIOS')}
                className={`px-4 py-1.5 rounded text-[10px] font-extrabold tracking-wider font-mono uppercase transition flex items-center space-x-1.5 border cursor-pointer ${
                  activeTab === 'RELATORIOS' 
                    ? playerFaction === 'PARAGUAI'
                      ? 'bg-red-950/40 text-red-350 border-red-500/80 shadow'
                      : 'bg-teal-950/40 text-teal-350 border-teal-500/80 shadow' 
                    : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-850'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Relatórios Bi-Nacionais</span>
              </button>

              <button
                onClick={() => setActiveTab('INFRAESTRUTURA')}
                className={`px-4 py-1.5 rounded text-[10px] font-extrabold tracking-wider font-mono uppercase transition flex items-center space-x-1.5 border cursor-pointer ${
                  activeTab === 'INFRAESTRUTURA' 
                    ? playerFaction === 'PARAGUAI'
                      ? 'bg-red-950/40 text-red-350 border-red-500/80 shadow'
                      : 'bg-teal-950/40 text-teal-350 border-teal-500/80 shadow' 
                    : 'bg-slate-900 text-slate-400 border-transparent hover:bg-slate-850'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Infraestrutura</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* --- CORPO PRINCIPAL COM CONTEÚDOS DAS ABAS --- */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full z-10 relative">
        {/* Vistas do Prequel */}
        {timelineProgress === 'PREQUEL' && activeTab === 'CRONOLOGIA' && (
          <PrequelDashboard />
        )}

        {/* Vistas Comuns e de Guerra */}
        {activeTab === 'MAPA' && timelineProgress === 'GUERRA' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Mapa Satélite (8 colunas) */}
            <div className="lg:col-span-8 space-y-6">
              <Map />
              <div className="hidden lg:block">
                <WarReports />
              </div>
            </div>

            {/* Painel de Controle de guarnição selecionada (4 colunas) */}
            <div className="lg:col-span-4 space-y-6">
              <RegionDetails />
              <div className="block lg:hidden">
                <WarReports />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'DIPLOMACIA' && timelineProgress === 'GUERRA' && (
          <DiplomacyPanel />
        )}

        {activeTab === 'PERSONAGENS' && (
          <CharactersPanel />
        )}

        {activeTab === 'RELATORIOS' && timelineProgress === 'GUERRA' && (
          <div className="max-w-3xl mx-auto">
            <WarReports />
          </div>
        )}

        {activeTab === 'INFRAESTRUTURA' && (
          <StrategicInfrastructure />
        )}
      </main>

      {/* --- INTERFACE MODAL DE DECISÕES GEOPOLÍTICAS --- */}
      <EventModal />

      {/* --- INTERFACE MODAL DE COMBATES POR TURNOS --- */}
      <ActiveBattleModal />

      {/* --- RODAPÉ OPERACIONAL --- */}
      <footer className="border-t border-slate-900 px-6 py-3.5 text-center text-[10px] text-slate-500 font-mono bg-slate-950/80 mt-6 md:mt-12 z-20 flex flex-col md:flex-row justify-between items-center gap-2">
        <span>© 2034 CONTROL SECURITY CONSOLE • AMÉRICA DO SUL</span>
        <div className="flex space-x-3 text-slate-500">
          <span>Tolerância de Rede: ±4 GW/h</span>
          <span>|</span>
          <span>Fração do Prata: Setor Aliança</span>
        </div>
      </footer>
    </div>
  );
}

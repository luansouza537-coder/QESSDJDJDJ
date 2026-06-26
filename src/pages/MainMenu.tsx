/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Compass, 
  Terminal, 
  Activity, 
  Globe2, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck,
  X,
  BookOpen,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface MainMenuProps {
  onStartCampaign: () => void;
}

export default function MainMenu({ onStartCampaign }: MainMenuProps) {
  const [showManual, setShowManual] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Grid Militar e Efeito Holograma */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:35px_35px] opacity-25"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Margem decorativa superior */}
      <div className="border-b border-slate-900 px-6 py-3 flex justify-between items-center bg-slate-950/80 backdrop-blur z-20">
        <div className="flex items-center space-x-2">
          <Terminal className="text-teal-400 w-4 h-4" />
          <span className="text-[10px] font-mono tracking-widest text-[#5c728a] uppercase font-bold">
            TEATRO DE GUERRA DO PRATA: PROTOCOLO 034
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[9px] font-mono text-slate-500">
          <span>ALERTA DEFCON-2</span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
        </div>
      </div>

      {/* Conteúdo Central */}
      <div className="max-w-4xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center items-center text-center z-10 relative">
        
        {/* Radar Militar Animado */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border border-teal-500/30 flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 rounded-full border border-teal-500/50 flex items-center justify-center">
              <Compass className="w-10 h-10 text-teal-400 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
          </div>
          {/* Alvos orbitando */}
          <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
          <span className="absolute bottom-5 left-1 w-1 h-1 bg-teal-400 rounded-full"></span>
        </div>

        {/* Título Principal */}
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-slate-100 to-emerald-450 uppercase mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] font-sans">
          Teatro de Conflito do Prata
        </h1>
        <h2 className="text-lg md:text-xl font-mono text-teal-500 font-bold tracking-widest uppercase mb-6">
          Soberania & Crise • 2034
        </h2>

        {/* Resumo da Lore */}
        <p className="text-slate-400 max-w-xl text-xs md:text-sm leading-relaxed mb-8 font-sans">
          O conflito de 2034 foi forjado ao longo de uma década de tensões ocultas. Entre 2024 e 2033, durante a <strong>Fase Prequel</strong>, você reviverá crises cruciais de espionagem, o avanço tecnológico na foz, revoltas internas em Assunção ou infiltrações de redes estratégicas no Prata. O seu veredito nesses anos silenciados traça os recursos e defesas de Itaipu frente à mobilização militar imediata de 2034. Assuma as rédeas da história contada pelo <strong>Brasil</strong> ou pelo <strong>Paraguai</strong>!
        </p>

        {/* Botões Menu */}
        <div className="flex flex-col space-y-3 w-full max-w-xs">
          <button
            onClick={onStartCampaign}
            className="group w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-slate-100 font-extrabold text-xs py-3 rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-teal-950/45 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition uppercase tracking-wider"
          >
            <span>Iniciar Nova Campanha</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setShowManual(true)}
            className="w-full bg-slate-900 hover:bg-slate-850 text-slate-350 border border-slate-800 text-xs py-3 rounded-lg font-bold transition cursor-pointer"
          >
            Manual de Operações
          </button>
        </div>
      </div>

      {/* Modal Customizado do Manual (Substitui Alertas e Iframe bugs) */}
      {showManual && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Cabeçalho */}
            <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <BookOpen className="text-teal-400 w-4 h-4" />
                <h3 className="text-xs font-black tracking-widest text-slate-200 uppercase font-mono">
                  MANUAL DE DIRETRIZES TÁTICAS
                </h3>
              </div>
              <button 
                onClick={() => setShowManual(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 overflow-y-auto space-y-5 text-left font-sans text-xs text-slate-300 leading-relaxed">
              <div className="space-y-1.5">
                <h4 className="text-teal-400 font-bold uppercase font-mono tracking-wider">Setores Estratégicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="font-bold text-teal-400 block font-mono">⚡ Complexo de Itaipu</span>
                    <span className="text-[11px] text-slate-400 font-mono">Central elétrica binacional. Principal ponto de tensão do escoamento energético.</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="font-bold text-teal-400 block font-mono">🏴‍☠️ Ciudad del Este</span>
                    <span className="text-[11px] text-slate-400 font-mono">Pilar de contrabando, tráfego tático e sabotagens camufladas de inteligência.</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="font-bold text-teal-400 block font-mono">🛢️ Deserto do Chaco</span>
                    <span className="text-[11px] text-slate-400 font-mono">Reservas profundas de carbono e gás. Desgaste severo por calor em combate.</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="font-bold text-teal-400 block font-mono">🏰 Assunção</span>
                    <span className="text-[11px] text-slate-400 font-mono">Centro de soberania militar paraguaia. Sob governo da Junta de Caballero.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-teal-400 font-bold uppercase font-mono tracking-wider">Objetivos e Condições de Vitória</h4>
                <p className="text-[11px] text-slate-400">
                  Cada comitê governamental visa garantir a segurança e o controle soberano sobre Itaipu e as bacias hidrográficas do Paraná.
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-450 font-mono bg-slate-950 p-3 rounded border border-slate-850">
                  <li><strong>Vitória por Conquista:</strong> Controle e assente a soberania sobre Itaipu, Ciudad del Este e Assunção (ou Brasília) simultaneamente.</li>
                  <li><strong>Vitória Diplomática:</strong> Colete acordos e eleve as relações bi-nacionais a patamares de confiança mútua.</li>
                  <li><strong>Vitória Tecnológica:</strong> Acumule Pontos de Inteligência (PI), dominando backdoors cibernéticos para expor ingerências externas.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-teal-400 font-bold uppercase font-mono tracking-wider">Fases de Jogo</h4>
                <p className="text-[11px] text-slate-400">
                  <strong>Fase 1 (Prequel):</strong> Navegue pela década de 2024 a 2033 tomando decisões secretas e moldando a estabilidade e recursos do país.
                </p>
                <p className="text-[11px] text-slate-400">
                  <strong>Fase 2 (Teatro Operacional):</strong> Comande movimentações terrestres, contrate tropas, envie diplomatas/generais em missões dinâmicas e resolva combates táticos rodada a rodada de modo interativo.
                </p>
              </div>
            </div>

            {/* Rodapé */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 text-center shrink-0">
              <button
                onClick={() => setShowManual(false)}
                className="px-5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-[11px] rounded uppercase font-black tracking-wider cursor-pointer"
              >
                Ciente das Diretrizes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Créditos no rodapé */}
      <div className="border-t border-slate-900 px-6 py-4 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 font-mono bg-slate-950/80 z-20">
        <span>© 2026 ALTO COMANDO COALIZADO DO CONE SUL</span>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <span className="flex items-center">
            <ShieldCheck className="w-3 h-3 text-emerald-500 mr-1" />
            VIGIA SÉCULOS
          </span>
          <span className="flex items-center">
            <Globe2 className="w-3 h-3 text-cyan-500 mr-1" />
            AMÉRICA LATINA UNIDA
          </span>
        </div>
      </div>
    </div>
  );
}

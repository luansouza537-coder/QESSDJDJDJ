import React from 'react';
import { useGame } from '../context/GameContext';
import { 
  ShieldAlert, 
  Calendar, 
  Flame, 
  Cpu, 
  Globe2, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { PREQUEL_EVENTS } from '../data/campaignEvents';

export default function PrequelDashboard() {
  const { gameState, resolveActiveEventChoice, advancePrequelYear } = useGame();
  const { 
    prequelYear, 
    activeEvent, 
    resolvedPrequelEvents,
    popularSupport,
    politicalStability,
    intelPoints,
    fuelReserve,
    globalInfluence 
  } = gameState;

  // Verifica se o evento do ano atual já foi resolvido
  const isYearResolved = resolvedPrequelEvents.includes(`PREQ_${prequelYear}`);

  // Retorna a cor correspondente para as barras de progresso
  const getResourceColor = (val: number, max: number) => {
    const pct = (val / max) * 100;
    const isParaguai = gameState.playerFaction === 'PARAGUAI';
    if (pct >= 75) return isParaguai ? 'from-red-500 to-rose-500' : 'from-teal-500 to-emerald-500';
    if (pct >= 40) return 'from-yellow-500 to-amber-500';
    return isParaguai ? 'from-orange-650 to-red-600' : 'from-red-650 to-orange-600';
  };

  const isParaguai = gameState.playerFaction === 'PARAGUAI';

  return (
    <div className="space-y-6">
      {/* Alerta de Modo de Jogo */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <ShieldAlert className={`w-5 h-5 mt-0.5 shrink-0 ${isParaguai ? 'text-red-400' : 'text-teal-400'}`} />
          <div>
            <span className={`text-[9px] font-mono tracking-widest uppercase font-extrabold block mb-0.5 ${isParaguai ? 'text-red-400' : 'text-teal-400'}`}>
              FASE 1: PREQUEL RESTRITO - HISTÓRIA CLANDESTINA (2024 - 2033)
            </span>
            <p className="text-[11px] text-slate-350 leading-relaxed font-sans max-w-2xl">
              {isParaguai 
                ? 'Você está liderando as frentes diplomáticas e táticas do Paraguai no caminho da emancipação energética. Cada decisão histórica tomada nesta década molda a soberania, os recursos estratégicos e a prontidão das forças nacionais.'
                : 'Você está pilotando os comitês de inteligência do Brasil nas sombras da diplomacia. Cada decisão histórica tomada ao longo desta década molda a estabilidade, os recursos materiais e os segredos antiaéreos da nação quando a guerra começar amanhã, em 2034.'}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded font-mono text-center shrink-0 border ${
          isParaguai ? 'bg-red-950/40 border-red-500/80' : 'bg-teal-950/40 border-teal-500/80'
        }`}>
          <span className={`text-[8px] block uppercase leading-none ${isParaguai ? 'text-red-400' : 'text-teal-450'}`}>Cronologia Atual</span>
          <span className="text-sm font-black text-slate-100">{prequelYear}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel Esquerdo: Evento Histórico Ativo (7 Colunas) */}
        <div className="lg:col-span-7 space-y-6">
          {activeEvent && !isYearResolved ? (
            <div className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden shadow-lg animate-scale-up">
              <div className="h-44 relative overflow-hidden flex items-center justify-center">
                <img 
                  src={activeEvent.image} 
                  alt={activeEvent.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={`border text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                    isParaguai
                      ? 'bg-red-950 border-red-500/50 text-red-350'
                      : 'bg-teal-900 border-teal-500/50 text-teal-350'
                  }`}>
                    ANO {prequelYear} • {activeEvent.category}
                  </span>
                  <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight font-sans mt-1">
                    {activeEvent.title}
                  </h3>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {activeEvent.description}
                </p>

                <div className="border-t border-slate-850 pt-4 space-y-3">
                  <span className="text-[8px] font-mono font-extrabold text-slate-500 tracking-wider block uppercase">DIGITE SEU DECRETO OFICIAL:</span>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {activeEvent.choices.map((choice) => (
                      <button
                        key={choice.id}
                        onClick={() => resolveActiveEventChoice(choice.id)}
                        className="text-left bg-slate-950 text-slate-200 hover:text-white border border-slate-850 hover:border-slate-700 rounded-lg p-3.5 transition group hover:bg-slate-900 relative"
                      >
                        <span className={`text-[11px] font-bold block mb-1 font-sans ${isParaguai ? 'text-red-400 group-hover:text-red-355' : 'text-teal-400 group-hover:text-teal-300'}`}>
                          {choice.text}
                        </span>
                        <p className="text-[9px] text-slate-450 font-mono leading-tight">
                          {choice.consequencesDescription}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-850/50 rounded-xl p-8 text-center space-y-4 shadow-lg">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto animate-pulse border ${
                isParaguai 
                  ? 'bg-red-950 border-red-900 text-red-400' 
                  : 'bg-emerald-950 border-emerald-900 text-emerald-400'
              }`}>
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-sans text-slate-100 uppercase tracking-tight">Decisões de {prequelYear} Concluídas!</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-md mx-auto mt-1">
                  Seu gabinete sintonizou com sucesso a dotação de inteligência e segurança para este ciclo. Transmita o dossiê confidencial para desbloquear a próxima fenda da história clandestina.
                </p>
              </div>

              <button
                onClick={advancePrequelYear}
                className={`inline-flex items-center space-x-2 border text-slate-100 font-extrabold text-xs py-3 px-6 rounded-lg uppercase tracking-wider shadow cursor-pointer transition-transform hover:scale-102 ${
                  isParaguai
                    ? 'bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-550 hover:to-rose-500 border-red-500/20 shadow-red-950'
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 border-teal-550/20 shadow-teal-950'
                }`}
              >
                <span>{prequelYear === 2033 ? 'ATIVAR OPERAÇÃO DIA ZERO (2034)' : `Avançar Cronologia para o Ano de ${prequelYear + 1}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Histórico Recente de Decisões */}
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-4">
            <span className="text-[8px] font-mono font-bold tracking-widest text-slate-500 block uppercase mb-3">CONVERSAÇÕES OPERACIONAIS ARQUIVADAS:</span>
            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {gameState.historyLogs.length <= 1 ? (
                <div className="text-center py-6 text-[10px] font-mono text-slate-505">
                  Nenhuma interceptação decodificada no banco nacional.
                </div>
              ) : (
                gameState.historyLogs.filter(l => l.message.includes('HISTÓRIA')).map(log => (
                  <div key={log.id} className="text-[10px] font-mono bg-slate-950 border border-slate-900 rounded p-2 text-slate-350">
                    <span className={`block uppercase text-[8px] mb-0.5 leading-none font-bold ${isParaguai ? 'text-rose-450' : 'text-teal-450'}`}>Registro Decodificado</span>
                    <p className="leading-tight">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Painel Direito: Métricas Políticas e Geopolíticas (5 colunas) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-black font-sans uppercase tracking-tight text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Recursos Diplomáticos Nacionais</span>
              <TrendingUp className="w-4 h-4 text-slate-550" />
            </h3>

            {/* APOIO POPULAR */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400 flex items-center"><Flame className="w-3.5 h-3.5 text-orange-500 mr-1" /> Apoio Popular Civil</span>
                <span className="text-slate-200 font-bold">{popularSupport}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900/60">
                <div 
                  className={`h-full bg-gradient-to-r ${getResourceColor(popularSupport, 100)} transition-all duration-500`}
                  style={{ width: `${popularSupport}%` }}
                ></div>
              </div>
            </div>

            {/* ESTABILIDADE POLÍTICA */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400 flex items-center"><ShieldAlert className="w-3.5 h-3.5 text-cyan-400 mr-1" /> Estabilidade Política</span>
                <span className="text-slate-200 font-bold">{politicalStability}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900/60">
                <div 
                  className={`h-full bg-gradient-to-r ${getResourceColor(politicalStability, 100)} transition-all duration-500`}
                  style={{ width: `${politicalStability}%` }}
                ></div>
              </div>
            </div>

            {/* PONTOS DE INTELIGÊNCIA */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400 flex items-center"><Cpu className={`w-3.5 h-3.5 mr-1 ${isParaguai ? 'text-red-400' : 'text-teal-400'}`} /> Rede de Inteligência e Espionagem</span>
                <span className="text-slate-200 font-bold">{intelPoints} / 200 PI</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900/60">
                <div 
                  className={`h-full bg-gradient-to-r ${getResourceColor(intelPoints, 200)} transition-all duration-500`}
                  style={{ width: `${(intelPoints / 200) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* RESERVA DE COMBUSTÍVEL */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400 flex items-center"><AlertTriangle className="w-3.5 h-3.5 text-amber-500 mr-1" /> Reserva Estratégica de Petróleo</span>
                <span className="text-slate-200 font-bold">{fuelReserve} / 500 Barris</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900/60">
                <div 
                  className={`h-full bg-gradient-to-r ${getResourceColor(fuelReserve, 500)} transition-all duration-500`}
                  style={{ width: `${(fuelReserve / 500) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* IMPACTO GLOBAL */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400 flex items-center"><Globe2 className="w-3.5 h-3.5 text-indigo-400 mr-1" /> Influência Global (Washington-Pequim)</span>
                <span className="text-slate-200 font-bold">{globalInfluence}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900/60">
                <div 
                  className={`h-full bg-gradient-to-r ${getResourceColor(globalInfluence, 100)} transition-all duration-500`}
                  style={{ width: `${globalInfluence}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Cartógrafo Informativo */}
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-3 font-sans text-xs">
            <h4 className="font-bold flex items-center space-x-1 uppercase text-slate-350 tracking-tight">
              <Award className={`w-4 h-4 ${gameState.playerFaction === 'PARAGUAI' ? 'text-red-400' : 'text-teal-400'}`} />
              <span>Instruções da Agência de Defesa</span>
            </h4>
            <ul className="space-y-2 text-slate-400 list-disc list-inside leading-normal text-[11px]">
              <li>Use o tempo do prequel para turbinar as <strong>reservas materiais</strong> {gameState.playerFaction === 'PARAGUAI' ? 'do Paraguai' : 'do Brasil'}.</li>
              <li>Tente garantir que a <strong>Estabilidade Política</strong> não caia a níveis críticos.</li>
              <li>{gameState.playerFaction === 'PARAGUAI' ? 'A Inteligência garantida dará suporte contra ações de espionagem do sul.' : 'A Inteligência acumulada ajudará a neutralizar ransomwares chineses.'}</li>
              <li>Resolva o pacto de cada ano clicando na escolha oficial que condiz com seus princípios de soberania geopolítica.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useGame } from '../context/GameContext';
import { 
  RotateCcw, 
  Award, 
  Flame, 
  Globe, 
  ShieldAlert, 
  Cpu, 
  CheckCircle,
  HelpCircle,
  TrendingDown,
  AlertOctagon,
  Users
} from 'lucide-react';

export default function EndingViewer() {
  const { gameState, resetGame } = useGame();
  const { 
    popularSupport, 
    politicalStability, 
    intelPoints, 
    fuelReserve, 
    globalInfluence,
    regions,
    relations,
    factions
  } = gameState;

  // Determinar o Tipo de Final atingido baseado nos scores reais do jogador
  const playerControlsItaipu = regions['ITAIPU'].controller === 'BRASIL';
  const playerControlsAssuncao = regions['ASSUNCAO'].controller === 'BRASIL';
  const playerControlsCde = regions['CIUDAD_DEL_ESTE'].controller === 'BRASIL';
  const paraguayRelationsVal = relations.find(r => (r.factionA === 'BRASIL' && r.factionB === 'PARAGUAI') || (r.factionA === 'PARAGUAI' && r.factionB === 'BRASIL'))?.value ?? 0;

  let endingId = 'GUERRA_PROLONGADA';
  let title = 'GUERRA DE ATRITO PROLONGADA';
  let bannerImage = 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=600';
  let icon = <HelpCircle className="w-10 h-10 text-slate-400" />;
  let colorClass = 'from-slate-500 to-slate-700';
  let description = '';

  // Avaliação das condições estritas do Teatro de Conflitos
  if (playerControlsItaipu && playerControlsAssuncao && playerControlsCde) {
    endingId = 'VITÓRIA_BRASILEIRA';
    title = 'VITÓRIA ABSOLUTA DO BRASIL E QUEDA DA JUNTA DE CABALLERO';
    bannerImage = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600';
    icon = <CheckCircle className="w-10 h-10 text-teal-400 animate-bounce" />;
    colorClass = 'from-teal-600 to-emerald-600';
    description = 'Sua bravura tática restabeleceu o controle total sobre a bacia do Paraná e a Usina Bi-Nacional de Itaipu. O general Santiago Caballero foi capturado em Assunção enquanto tentava evadir-se em um helicóptero utilitário no Chaco. A Junta paraguaia foi desmobilizada e uma nova liderança democrática assinou a revisão energética exigida por Brasília. As indústrias do Sudeste brasileiro voltaram a brilhar sob fluxo pleno, sintonizando energia e progresso.';
  } else if (politicalStability <= 25) {
    endingId = 'GOLPE_MILITAR';
    title = 'GOLPE DE ESTADO MILITAR EM BRASÍLIA';
    bannerImage = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=600';
    icon = <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />;
    colorClass = 'from-red-750 to-amber-700';
    description = 'A violenta instabilidade civil, somada às derrotas logísticas e de infraestrutura, pulverizou a credibilidade constitucional de Brasília. Uma junta militar composta por generais legalistas de Gama desmantelou o congresso, depondo o presidente Alberto Mendonça por decretos de Segurança Nacional. A deputada Letícia Albuquerque assumiu a vice-regência especial, impondo censores federais nas redes de escoamento de energia de Itaipu.';
  } else if (popularSupport <= 25 || factions['BRASIL'].resources.funds <= 10) {
    endingId = 'COLAPSO_REGIONAL';
    title = 'COLAPSO ECONÔMICO E SOCIAL REGIONAL';
    bannerImage = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600';
    icon = <TrendingDown className="w-10 h-10 text-orange-500" />;
    colorClass = 'from-orange-600 to-amber-600';
    description = 'As reservas monetárias e petrolíferas exauriram totalmente por conta das greves intermináveis e rompimento das linhas de suprimento de Seu Manoel. Sem fundos para pagar juros ou comprar materiais de blindagem, a inflação disparou. Cascavel, MS e Assunção foram tomadas por longos apagões industriais e racionamento severo de bens básicos. O Teatro se desfez em um imenso vácuo logístico bilateral.';
  } else if (intelPoints >= 100 && globalInfluence >= 70) {
    endingId = 'INTERFERENCIA_REVELADA';
    title = 'REVELAÇÃO DA INTERFERÊNCIA DAS SUPERPOTÊNCIAS';
    bannerImage = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600';
    icon = <Cpu className="w-10 h-10 text-blue-400" />;
    colorClass = 'from-blue-600 to-indigo-650';
    description = 'Seus analistas em Brasília reuniram provas inequívocas do envolvimento oculto de Mike Connors (CIA) e Li Wei (State Grid / Shenzhen) na manipulação dos relés e sistemas defensivos da fronteira de Itaipu. O dossiê vazou para o New York Times e fóruns da ONU, desvelando a mordaça tecnológica. Sob clamor global, Washington e Pequim retiraram todo o apoio financeiro sigiloso, paralisando instantaneamente as hostilidades.';
  } else if (paraguayRelationsVal > 25) {
    endingId = 'PAZ_NEGOCIADA';
    title = 'ACORDO DE PAZ BI-NACIONAL E COMPARTILHAMENTO DE CORES';
    bannerImage = 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=600';
    icon = <Globe className="w-10 h-10 text-emerald-400" />;
    colorClass = 'from-emerald-600 to-cyan-600';
    description = 'A diplomacia ponderada do senador Ricardo Benítez e o pragmatismo de Brasília superaram o clamor de artilharia. Um armistício em Ciudad del Este estabeleceu a venda livre do excedente elétrico do Paraguai para terceiros parceiros comerciais, enquanto o Brasil assumiu a vigilância conjunta contra ransomwares. O sargento Miguel Rojas e o sargento Azevedo assinaram o tratado na própria Ponte da Amizade.';
  } else {
    endingId = 'GUERRA_PROLONGADA';
    title = 'CONFLITO DE EXAUSTÃO PROLONGADA';
    bannerImage = 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=600';
    icon = <AlertOctagon className="w-10 h-10 text-amber-500" />;
    colorClass = 'from-amber-600 to-slate-700';
    description = 'Após 20 duras semanas de artilharia e fuzilaria mútua, nenhuma das nações obteve brechas definitivas na defesa oponente. A bacia do Prata permanece militarizada, com centenas de minas flutuantes e cercanias bloqueadas. Os cidadãos de Foz e o exército paraguaio vivem sob vigilância draconiana eterna. A rede do Sudeste brasileiro opera de forma claudicante sob o espectro de novos blecautes repentinos.';
  }

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl animate-scale-up">
      {/* Imagem de Fundo de Banner com Gradiente */}
      <div className="h-56 relative overflow-hidden flex items-center justify-center">
        <img 
          src={bannerImage} 
          alt={title} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6 flex items-center space-x-4">
          <div className="p-3 bg-slate-905/85 border border-slate-750 rounded-full shrink-0 shadow">
            {icon}
          </div>
          <div>
            <span className="text-[9px] font-mono tracking-widest text-teal-400 block uppercase font-bold leading-none mb-1">FIM DA CAMPANHA • ARQUIVO CONFIGURADO</span>
            <h2 className="text-lg font-black font-sans uppercase tracking-tight text-white leading-tight">
              {title}
            </h2>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Corpo Descritivo */}
        <div className="bg-slate-950/80 rounded-xl border border-slate-850 p-6 space-y-4">
          <h3 className="text-xs font-mono tracking-widest text-teal-400 block uppercase font-bold">Relatório Conclusivo de Gabinete</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans first-letter:text-2xl first-letter:font-black first-letter:text-teal-400 first-letter:mr-1">
            {description}
          </p>
        </div>

        {/* Painel de Estatísticas Finais */}
        <div>
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block mb-2.5">Métricas de Conclusão Operacional:</span>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="bg-slate-950/40 border border-slate-850 rounded-lg p-3">
              <span className="text-[8px] font-mono text-slate-500 block uppercase leading-none mb-1">Apoio Popular</span>
              <span className={`text-sm font-black font-mono ${popularSupport >= 70 ? 'text-teal-400' : popularSupport >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>{popularSupport}%</span>
            </div>
            <div className="bg-slate-950/40 border border-slate-850 rounded-lg p-3">
              <span className="text-[8px] font-mono text-slate-500 block uppercase leading-none mb-1">Estabilidade</span>
              <span className={`text-sm font-black font-mono ${politicalStability >= 70 ? 'text-teal-400' : politicalStability >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>{politicalStability}%</span>
            </div>
            <div className="bg-slate-950/40 border border-slate-850 rounded-lg p-3">
              <span className="text-[8px] font-mono text-slate-500 block uppercase leading-none mb-1">Espionagem</span>
              <span className="text-sm font-black font-mono text-sky-400">{intelPoints} PI</span>
            </div>
            <div className="bg-slate-950/40 border border-slate-850 rounded-lg p-3">
              <span className="text-[8px] font-mono text-slate-500 block uppercase leading-none mb-1">Petróleo</span>
              <span className="text-sm font-black font-mono text-amber-500">{fuelReserve} bbl</span>
            </div>
            <div className="bg-slate-950/40 border border-slate-850 rounded-lg p-3 col-span-2 md:col-span-1">
              <span className="text-[8px] font-mono text-slate-500 block uppercase leading-none mb-1">Influência</span>
              <span className="text-sm font-black font-mono text-indigo-400">{globalInfluence}%</span>
            </div>
          </div>
        </div>

        {/* Botão de Resgate */}
        <div className="border-t border-slate-850 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2.5 text-slate-400">
            <Users className="w-5 h-5 text-slate-500" />
            <div className="text-[10px] font-mono">
              <span className="block text-slate-500 uppercase leading-none">Comandante tático</span>
              <span className="font-bold text-slate-305">{gameState.warAdvisor}</span>
            </div>
          </div>

          <button
            onClick={resetGame}
            className={`w-full sm:w-auto text-xs font-black px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all text-slate-100 uppercase tracking-widest cursor-pointer bg-gradient-to-r ${colorClass} hover:opacity-90`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Voltar ao Teatro Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
}

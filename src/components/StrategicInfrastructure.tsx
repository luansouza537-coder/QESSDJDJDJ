/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { InfrastructureItem, InfraType } from '../types/infrastructure';
import { 
  Zap, 
  Droplet, 
  Plane, 
  Route, 
  ShieldAlert, 
  Wrench, 
  Shield, 
  Cpu, 
  Activity, 
  Sparkles, 
  Lock, 
  AlertTriangle,
  Flame,
  Globe,
  Plus
} from 'lucide-react';

export default function StrategicInfrastructure() {
  const { 
    gameState, 
    repairInfrastructure, 
    upgradeInfrastructureDefense, 
    sabotageInfrastructure 
  } = useGame();

  const { playerFaction, infrastructure, factions, intelPoints } = gameState;
  const isParaguai = playerFaction === 'PARAGUAI';
  const playerFac = factions[playerFaction];

  const [selectedType, setSelectedType] = useState<InfraType | 'ALL'>('ALL');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtrar itens
  const filteredItems = infrastructure.items.filter(item => {
    if (selectedType === 'ALL') return true;
    return item.type === selectedType;
  });

  // Métricas de Infraestrutura
  const totalItems = infrastructure.items.length;
  const operationalCount = infrastructure.items.filter(i => i.status === 'OPERATIONAL').length;
  const damagedCount = infrastructure.items.filter(i => i.status === 'DAMAGED').length;
  const offlineCount = infrastructure.items.filter(i => i.status === 'OFFLINE').length;

  const energyItems = infrastructure.items.filter(i => i.type === 'ENERGY');
  const energyOperational = energyItems.filter(i => i.status === 'OPERATIONAL').length;
  const energyStatusPct = Math.round((energyOperational / energyItems.length) * 100);

  const waterItems = infrastructure.items.filter(i => i.type === 'WATER');
  const waterOperational = waterItems.filter(i => i.status === 'OPERATIONAL').length;
  const waterStatusPct = Math.round((waterOperational / waterItems.length) * 100);

  const airportItems = infrastructure.items.filter(i => i.type === 'AIRPORT');
  const airportOperational = airportItems.filter(i => i.status === 'OPERATIONAL').length;
  const airportStatusPct = Math.round((airportOperational / airportItems.length) * 100);

  const corridorItems = infrastructure.items.filter(i => i.type === 'CORRIDOR');
  const corridorOperational = corridorItems.filter(i => i.status === 'OPERATIONAL').length;
  const corridorStatusPct = Math.round((cororidors(corridorOperational, corridorItems.length)) * 100);

  function cororidors(operational: number, total: number) {
    if (total === 0) return 1;
    return operational / total;
  }

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleRepair = (id: string, name: string) => {
    // Custos: 20 fundos, 30 suprimentos
    if (playerFac.resources.funds < 20 || playerFac.resources.supplies < 30) {
      showNotification('Recursos insuficientes! Reparar requer 20 Fundos e 30 Suprimentos.', true);
      return;
    }
    const ok = repairInfrastructure(id);
    if (ok) {
      showNotification(`Restauração iniciada com sucesso na infraestrutura: ${name}!`);
    } else {
      showNotification('Falha ao acionar reparos.', true);
    }
  };

  const handleUpgradeDefense = (id: string, name: string) => {
    // Custos: 15 fundos, 20 suprimentos
    if (playerFac.resources.funds < 15 || playerFac.resources.supplies < 20) {
      showNotification('Recursos insuficientes! Blindagem de defesa requer 15 Fundos e 20 Suprimentos.', true);
      return;
    }
    const ok = upgradeInfrastructureDefense(id);
    if (ok) {
      showNotification(`Sistemas defensivos aéreos e cibernéticos fortalecidos para ${name}!`);
    } else {
      showNotification('Falha ao reforçar contramedidas.', true);
    }
  };

  const handleSabotage = (id: string, name: string) => {
    // Custo: 20 pontos de inteligência (PI)
    if (intelPoints < 20) {
      showNotification('Pontos de Inteligência (PI) insuficientes! Sabotagem requer 20 PI.', true);
      return;
    }
    const beforeStats = infrastructure.items.find(i => i.id === id)?.status;
    const ok = sabotageInfrastructure(id);
    if (ok) {
      // Checar se foi avaria real comparando dados atuais
      setTimeout(() => {
        const afterItem = gameState.infrastructure.items.find(i => i.id === id);
        if (afterItem && afterItem.status !== beforeStats) {
          showNotification(`Célula tática obteve ÊXITO e comprometeu as redes de: ${name}!`);
        } else {
          showNotification(`Operação fracassada! As redes de segurança de ${name} neutralizaram nossa incursão.`, true);
        }
      }, 200);
    }
  };

  const getTypeIcon = (type: InfraType) => {
    switch (type) {
      case 'ENERGY': return <Zap className="w-4 h-4" />;
      case 'WATER': return <Droplet className="w-4 h-4" />;
      case 'AIRPORT': return <Plane className="w-4 h-4" />;
      case 'CORRIDOR': return <Route className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: InfraType) => {
    switch (type) {
      case 'ENERGY': return 'Setor Elétrico';
      case 'WATER': return 'Abastecimento Hídrico';
      case 'AIRPORT': return 'Aeroportos Estratégicos';
      case 'CORRIDOR': return 'Corredores Logísticos';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="strategic-infrastructure-tab">
      
      {/* NOTIFICAÇÃO DE AÇÃO */}
      {successMsg && (
        <div className="fixed top-24 right-6 bg-slate-900 border-2 border-emerald-500/80 text-emerald-400 font-mono text-xs px-5 py-3 rounded-lg shadow-xl shadow-emerald-950/40 z-50 flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-24 right-6 bg-slate-900 border-2 border-rose-500/80 text-rose-400 font-mono text-xs px-5 py-3 rounded-lg shadow-xl shadow-rose-950/40 z-50 flex items-center space-x-2 animate-bounce">
          <AlertTriangle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CABEÇALHO DA INFRAESTRUTURA */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-850 p-6 rounded-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-slate-800/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 relative">
          <div>
            <div className={`text-[10px] font-mono tracking-widest uppercase font-extrabold flex items-center mb-1.5 ${isParaguai ? 'text-red-400' : 'text-teal-400'}`}>
              <Activity className="w-3.5 h-3.5 mr-1" />
              Soberania de Recursos e Redes Vitais
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight font-sans">
              INFRAESTRUTURA ESTRATÉGICA
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Mapeamento em tempo real dos sistemas de água, aeroportos, geração elétrica e canais logísticos do Paraguai. 
              {isParaguai 
                ? ' Proteja as hidrelétricas de Acaray/Yguazú e mantenha as estações potáveis livres de ações hostis para evitar racionamentos.' 
                : ' Sabote e bombardeie canais logísticos clandestinos ou usinas inimigas para drenar a estabilidade defensiva paraguaia.'}
            </p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-900 text-[10px] font-mono shrink-0">
            <span className="text-slate-500 px-2 py-1">Racionamento Geral:</span>
            <span className={`px-2 py-1 rounded font-bold uppercase ${
              infrastructure.rationingLevel === 'SEVERE'
                ? 'bg-red-950 text-red-400'
                : infrastructure.rationingLevel === 'LIGHT'
                  ? 'bg-amber-950 text-amber-400'
                  : 'bg-emerald-950 text-emerald-400'
            }`}>
              {infrastructure.rationingLevel === 'SEVERE' ? 'SEVERO (CRÍTICO)' : infrastructure.rationingLevel === 'LIGHT' ? 'LEVE (ALERTA)' : 'NORMAL'}
            </span>
          </div>
        </div>

        {/* ALERTA SE HOUVER CRISES */}
        {(infrastructure.rationingLevel === 'SEVERE' || infrastructure.waterEmergency) && (
          <div className="mt-4 p-3 bg-red-950/30 border border-red-900/40 rounded-lg flex items-start space-x-3">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              <span className="font-extrabold text-red-400 block uppercase font-mono tracking-wider">Mecanismo de Emergência Nacional Ativo</span>
              <p className="text-slate-400 text-[10px]">
                {infrastructure.rationingLevel === 'SEVERE' && '• O Paraguai perdeu suas hidrelétricas de Acaray e Yguazú! Indústrias paralisadas, racionamento elétrico geral ativo, causando queda contínua de estabilidade política. '}
                {infrastructure.waterEmergency && '• Captação do Rio Paraguai comprometida! Falta de água potável em Assunção pressiona as forças da capital tática, erodindo apoio popular.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* PAINEL DE VELOCÍMETROS E MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ENERGIA GRÁFICO */}
        <div className="bg-slate-950/60 border border-slate-900/60 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-slate-500 flex items-center">
              <Zap className="w-3.5 h-3.5 text-amber-500 mr-1" /> Redox de Energia
            </div>
            <div className="text-xl font-black text-slate-200">{energyStatusPct}%</div>
            <div className="text-[9px] text-slate-400 font-mono">
              {energyOperational}/{energyItems.length} Plantas Operacionais
            </div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Círculo de progresso rústico */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#0f172a" strokeWidth="4" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke={energyStatusPct < 50 ? '#f43f5e' : energyStatusPct < 100 ? '#eab308' : '#10b981'} strokeWidth="4" fill="transparent"
                strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * energyStatusPct) / 100} />
            </svg>
            <span className="absolute text-[8px] font-mono text-slate-500">Grid</span>
          </div>
        </div>

        {/* ÁGUA GRÁFICO */}
        <div className="bg-slate-950/60 border border-slate-900/60 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-slate-500 flex items-center">
              <Droplet className="w-3.5 h-3.5 text-blue-500 mr-1" /> Index de Segurança Hídrica
            </div>
            <div className="text-xl font-black text-slate-200">{waterStatusPct}%</div>
            <div className="text-[9px] text-slate-400 font-mono">
              {waterOperational}/{waterItems.length} Fontes Seguras
            </div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#0f172a" strokeWidth="4" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke={waterStatusPct < 50 ? '#f43f5e' : waterStatusPct < 100 ? '#eab308' : '#3b82f6'} strokeWidth="4" fill="transparent"
                strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * waterStatusPct) / 100} />
            </svg>
            <span className="absolute text-[8px] font-mono text-slate-500">Água</span>
          </div>
        </div>

        {/* AEROPORTOS GRÁFICO */}
        <div className="bg-slate-950/60 border border-slate-900/60 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-slate-500 flex items-center">
              <Plane className="w-3.5 h-3.5 text-purple-500 mr-1" /> Segurança de Pistas
            </div>
            <div className="text-xl font-black text-slate-200">{airportStatusPct}%</div>
            <div className="text-[9px] text-slate-400 font-mono">
              {airportOperational}/{airportItems.length} Hubs Ativos
            </div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#0f172a" strokeWidth="4" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke={airportStatusPct < 50 ? '#f43f5e' : airportStatusPct < 100 ? '#eab308' : '#a855f7'} strokeWidth="4" fill="transparent"
                strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * airportStatusPct) / 100} />
            </svg>
            <span className="absolute text-[8px] font-mono text-slate-500">Portas</span>
          </div>
        </div>

        {/* CORREDORES GRÁFICO */}
        <div className="bg-slate-950/60 border border-slate-900/60 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-slate-500 flex items-center">
              <Route className="w-3.5 h-3.5 text-teal-500 mr-1" /> Vazão de Suprimentos
            </div>
            <div className="text-xl font-black text-slate-200">{corridorStatusPct}%</div>
            <div className="text-[9px] text-slate-400 font-mono">
              {corridorOperational}/{corridorItems.length} Rotas Abertas
            </div>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#0f172a" strokeWidth="4" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke={corridorStatusPct < 50 ? '#f43f5e' : corridorStatusPct < 100 ? '#eab308' : '#0d9488'} strokeWidth="4" fill="transparent"
                strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * corridorStatusPct) / 100} />
            </svg>
            <span className="absolute text-[8px] font-mono text-slate-500">Roteiro</span>
          </div>
        </div>
      </div>

      {/* FILTROS E SUBMENU */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-900 pb-3 font-mono text-[9px] uppercase tracking-wide">
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-3 py-1.5 rounded border transition-all cursor-pointer ${
            selectedType === 'ALL'
              ? isParaguai 
                ? 'bg-red-950 text-red-350 border-red-800'
                : 'bg-teal-950 text-teal-350 border-teal-800'
              : 'bg-slate-950/40 text-slate-450 border-slate-900 hover:bg-slate-900'
          }`}
        >
          Visão Completa ({totalItems})
        </button>

        <button
          onClick={() => setSelectedType('ENERGY')}
          className={`px-3 py-1.5 rounded border transition-all cursor-pointer flex items-center space-x-1 ${
            selectedType === 'ENERGY'
              ? 'bg-amber-950 text-amber-350 border-amber-800'
              : 'bg-slate-950/40 text-slate-450 border-slate-900 hover:bg-slate-900'
          }`}
        >
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Energia ({energyItems.length})</span>
        </button>

        <button
          onClick={() => setSelectedType('WATER')}
          className={`px-3 py-1.5 rounded border transition-all cursor-pointer flex items-center space-x-1 ${
            selectedType === 'WATER'
              ? 'bg-blue-950/80 text-blue-350 border-blue-900'
              : 'bg-slate-950/40 text-slate-450 border-slate-900 hover:bg-slate-900'
          }`}
        >
          <Droplet className="w-3 h-3 text-blue-400" />
          <span>Água ({waterItems.length})</span>
        </button>

        <button
          onClick={() => setSelectedType('AIRPORT')}
          className={`px-3 py-1.5 rounded border transition-all cursor-pointer flex items-center space-x-1 ${
            selectedType === 'AIRPORT'
              ? 'bg-purple-950 text-purple-350 border-purple-800'
              : 'bg-slate-950/40 text-slate-450 border-slate-900 hover:bg-slate-900'
          }`}
        >
          <Plane className="w-3 h-3 text-purple-400" />
          <span>Aeroportos ({airportItems.length})</span>
        </button>

        <button
          onClick={() => setSelectedType('CORRIDOR')}
          className={`px-3 py-1.5 rounded border transition-all cursor-pointer flex items-center space-x-1 ${
            selectedType === 'CORRIDOR'
              ? 'bg-teal-950 text-teal-350 border-teal-800'
              : 'bg-slate-950/40 text-slate-450 border-slate-900 hover:bg-slate-900'
          }`}
        >
          <Route className="w-3 h-3 text-teal-400" />
          <span>Canais de Armas ({corridorItems.length})</span>
        </button>
      </div>

      {/* GRID COM OS CARD’S DE INFRAESTRUTURA DETALHADA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item: InfrastructureItem) => {
          const isItemDamaged = item.status === 'DAMAGED';
          const isItemOffline = item.status === 'OFFLINE';
          const isItemOk = item.status === 'OPERATIONAL';

          return (
            <div 
              key={item.id} 
              className={`bg-slate-950 border rounded-xl p-5 space-y-4 hover:border-slate-800/80 transition-all flex flex-col justify-between shadow-md relative group ${
                isItemOk 
                  ? 'border-slate-900' 
                  : isItemDamaged 
                    ? 'border-amber-900/60 bg-amber-950/5' 
                    : 'border-red-900/60 bg-red-950/5'
              }`}
            >
              
              {/* INDICADOR DE STATUS (MARGEM) */}
              <div className="absolute top-4 right-4 flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  isItemOk 
                    ? 'bg-emerald-500 animate-pulse' 
                    : isItemDamaged 
                      ? 'bg-amber-500 animate-pulse' 
                      : 'bg-red-600 animate-bounce'
                }`} />
                <span className={`text-[8px] font-mono tracking-wider font-extrabold uppercase ${
                  isItemOk 
                    ? 'text-emerald-400' 
                    : isItemDamaged 
                      ? 'text-amber-400' 
                      : 'text-red-400'
                }`}>
                  {item.status}
                </span>
              </div>

              {/* TÍTULO E ÍCONE */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    item.type === 'ENERGY' 
                      ? 'bg-amber-950/30 border-amber-900/40 text-amber-400' 
                      : item.type === 'WATER'
                        ? 'bg-blue-950/30 border-blue-900/40 text-blue-400'
                        : item.type === 'AIRPORT'
                          ? 'bg-purple-950/30 border-purple-900/40 text-purple-400'
                          : 'bg-teal-950/30 border-teal-900/40 text-teal-400'
                  }`}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <span className="text-[7.5px] font-mono tracking-widest text-slate-500 block uppercase font-bold">
                      {getTypeLabel(item.type)} • PROVÍNCIA
                    </span>
                    <h3 className="text-xs font-extrabold text-slate-200 uppercase leading-snug group-hover:text-slate-100 transition-colors">
                      {item.name}
                    </h3>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/40 border border-slate-900 text-[10px] space-y-1.5 mt-3 leading-snug">
                  <div>
                    <span className="text-slate-500 block text-[8px] uppercase font-mono">Localização</span>
                    <span className="text-slate-350">{item.location}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-850 pt-1.5">
                    <div>
                      <span className="text-slate-500 block text-[8px] uppercase font-mono">Capacidade</span>
                      <span className="text-slate-300 font-bold">{item.capacity}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[8px] uppercase font-mono">Nível de Defesa</span>
                      <span className="text-slate-300 font-mono flex items-center text-[9px] font-bold">
                        <Shield className="w-3 h-3 text-emerald-500 mr-0.5" />
                        Nível {item.defenseLevel} / 3
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESCRIÇÃO E DETALHE TÉCNICO */}
              <div className="space-y-3 mt-3">
                <p className="text-[10px] text-slate-400 leading-snug">
                  {item.description}
                </p>

                <div className="text-[9px] bg-slate-900/20 border border-slate-900/60 p-2 rounded text-slate-400 font-mono">
                  <span className="text-rose-450 block uppercase text-[7.5px] font-extrabold mb-0.5">Vulnerabilidade Crítica</span>
                  {item.vulnerability}
                </div>

                <div className="text-[9px] bg-indigo-950/20 border border-indigo-900/30 p-2 rounded text-indigo-200">
                  <span className="text-indigo-400 block uppercase text-[7.5px] font-extrabold mb-0.5">Impacto Operacional em Pane</span>
                  {item.effectOnFailure}
                </div>
              </div>

              {/* INTERAÇÕES - SE FOR O JOGADOR */}
              <div className="border-t border-slate-900/80 pt-4 mt-4 flex items-center gap-1.5 justify-end">
                {isParaguai ? (
                  <>
                    {/* BOTÃO DEFESA */}
                    {item.defenseLevel < 3 && (
                      <button
                        onClick={() => handleUpgradeDefense(item.id, item.name)}
                        className="px-2.5 py-1.5 rounded text-[8px] bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-850 hover:border-slate-700 font-bold font-mono uppercase flex items-center space-x-1 cursor-pointer select-none"
                        title="Eleva o nível de defesa local de baterias antiaéreas FN-6 e contra-medida cyber (Custo: 15 Fundos, 20 Suprimentos)"
                      >
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Fortalecer (+1)</span>
                      </button>
                    )}

                    {/* BOTÃO REPARAR SE AVARIADO */}
                    {!isItemOk ? (
                      <button
                        onClick={() => handleRepair(item.id, item.name)}
                        className="px-2.5 py-1.5 rounded text-[8px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-100 font-bold font-mono uppercase flex items-center space-x-1 cursor-pointer select-none border border-emerald-500/10"
                        title="Conserta a infraestrutura tática danificada (Custo: 20 Fundos, 30 Suprimentos)"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Reparar</span>
                      </button>
                    ) : (
                      <div className="text-[8px] text-slate-500 font-mono flex items-center bg-slate-900/30 px-2 py-1.5 border border-slate-900 rounded">
                        <Lock className="w-3 h-3 text-slate-600 mr-1" /> Funcionando Plenamente
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* SE JOGADOR É BRASIL, OPÇÃO DE SABOTAGEM / BOMBARDEIO */}
                    {isItemOk || isItemDamaged ? (
                      <button
                        onClick={() => handleSabotage(item.id, item.name)}
                        className="px-2.5 py-1.5 rounded text-[8px] bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-500 hover:to-rose-500 text-slate-100 font-extrabold font-mono uppercase flex items-center space-x-1 cursor-pointer select-none border border-red-500/10 shadow shadow-red-950/20"
                        title={`Realizar incursão de sabotagem clandestina (Custo: 20 Pontos de Inteligência PI. Chance de sucesso: ${Math.max(10, 85 - (item.defenseLevel * 25))}%)`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Infiltrar e Sabotar</span>
                      </button>
                    ) : (
                      <div className="text-[8px] text-rose-500 font-mono flex items-center bg-red-950/20 px-2 py-1.5 border border-red-900/25 rounded">
                        <ShieldAlert className="w-3 h-3 mr-1" /> Totalmente Fora de Ação
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* TABELA DE ACORDO DE RESUMO DE ATUAÇÃO INTEGRADA */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-mono font-extrabold text-slate-350 tracking-wider uppercase flex items-center">
          <Globe className="w-4 h-4 mr-1.5 text-blue-500" /> Tabela Comparativa Estocada de Redes
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-mono border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-sans uppercase font-extrabold text-[8.5px]">
                <th className="py-2.5 px-3">Modelo Estratégico</th>
                <th className="py-2.5 px-3 text-red-400">Paraguai (Teatro de Defesa)</th>
                <th className="py-2.5 px-3 text-teal-400">Brasil (Soberano)</th>
                <th className="py-2.5 px-3 text-slate-400">Argentina (Neutro Observador)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50 text-slate-350">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">Energia Elétrica</td>
                <td className="py-2.5 px-3">Acaray, Yguazú, Termas, geradores móveis</td>
                <td className="py-2.5 px-3 font-bold text-teal-400">Itaipu Binacional + Rede Operacional Geral</td>
                <td className="py-2.5 px-3 text-slate-400">Complexo de Yacyretá / Rede Autónoma</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">Abastecimento de Água</td>
                <td className="py-2.5 px-3">Aquífero Guarani, Poços Chaco, Rio Paraguai</td>
                <td className="py-2.5 px-3 text-teal-400">Aquífero Guarani, Bacia Paraná</td>
                <td className="py-2.5 px-3 text-slate-400">Aquífero de Misiones</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">Pistas Aéreas</td>
                <td className="py-2.5 px-3">Silvio Pettirossi (ASU), Guaraní (CDE), Boquerón</td>
                <td className="py-2.5 px-3 text-teal-400">Guarulhos (GRU), Galeão, Congonhas, Campo MS</td>
                <td className="py-2.5 px-3 text-slate-400">Ezeiza (EZE), San Fernando militar</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-200">Rotas Logísticas</td>
                <td className="py-2.5 px-3">Corredor Aéreo China, Rio Paraná, Terrestre Bolívia</td>
                <td className="py-2.5 px-3 text-teal-400">Malha rodoviária federal e ferroviária sul</td>
                <td className="py-2.5 px-3 text-slate-400">Fluvial Paraná profunda</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

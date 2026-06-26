/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useGame, REGION_ADJACENCY } from '../context/GameContext';
import { RegionID, Region } from '../types/game';
import { Shield, Zap, Compass, Crosshair, HelpCircle, Swords, MapPin, Activity } from 'lucide-react';

interface MapPoint {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
}

// Coordinates for nodes (visual central points in viewBox 800x520)
const REGION_COORDINATES: Record<RegionID, MapPoint> = {
  BRASILIA: { x: 700, y: 95, labelX: 700, labelY: 135 },
  MATO_GROSSO_SUL: { x: 520, y: 175, labelX: 520, labelY: 215 },
  CHACO: { x: 190, y: 200, labelX: 190, labelY: 245 },
  ASSUNCAO: { x: 230, y: 395, labelX: 230, labelY: 440 },
  ITAIPU: { x: 450, y: 260, labelX: 450, labelY: 195 },
  CIUDAD_DEL_ESTE: { x: 360, y: 375, labelX: 350, labelY: 420 },
  FOZ_DO_IGUACU: { x: 540, y: 375, labelX: 550, labelY: 420 }
};

// Strategic vector territories (polygons that fully tile the Prata basin)
const REGION_SECTORS: Record<RegionID, string> = {
  BRASILIA: "615,15 785,15 785,185 645,190 615,110",
  MATO_GROSSO_SUL: "420,15 615,15 615,110 645,190 495,270 425,210",
  CHACO: "15,15 420,15 425,210 275,230 155,300 15,300",
  ASSUNCAO: "15,300 155,300 275,230 325,340 295,475 15,475",
  CIUDAD_DEL_ESTE: "325,340 435,315 420,455 295,475",
  ITAIPU: "425,210 495,270 565,270 470,330 435,315",
  FOZ_DO_IGUACU: "495,270 785,185 785,475 535,475 470,330"
};

// Colors mapping depending on the controlling faction
const GET_SECTOR_COLORS = (controller: string, isHovered: boolean, isSelected: boolean) => {
  if (controller === 'BRASIL') {
    return {
      fill: isSelected ? 'rgba(16, 185, 129, 0.16)' : isHovered ? 'rgba(16, 185, 129, 0.10)' : 'rgba(16, 185, 129, 0.04)',
      stroke: isSelected ? '#10b981' : isHovered ? 'rgba(16, 185, 129, 0.7)' : 'rgba(16, 185, 129, 0.25)',
      strokeWidth: isSelected ? '2.5' : '1.5',
      glow: isSelected ? 'rgba(16, 185, 129, 0.4)' : 'transparent'
    };
  } else if (controller === 'PARAGUAI') {
    return {
      fill: isSelected ? 'rgba(239, 68, 68, 0.16)' : isHovered ? 'rgba(239, 68, 68, 0.10)' : 'rgba(239, 68, 68, 0.04)',
      stroke: isSelected ? '#ef4444' : isHovered ? 'rgba(239, 68, 68, 0.7)' : 'rgba(239, 68, 68, 0.25)',
      strokeWidth: isSelected ? '2.5' : '1.5',
      glow: isSelected ? 'rgba(239, 68, 68, 0.4)' : 'transparent'
    };
  } else if (controller === 'COALIZAO_CHACO') {
    return {
      fill: isSelected ? 'rgba(245, 158, 11, 0.16)' : isHovered ? 'rgba(245, 158, 11, 0.10)' : 'rgba(245, 158, 11, 0.04)',
      stroke: isSelected ? '#f59e0b' : isHovered ? 'rgba(245, 158, 11, 0.7)' : 'rgba(245, 158, 11, 0.25)',
      strokeWidth: isSelected ? '2.5' : '1.5',
      glow: isSelected ? 'rgba(245, 158, 11, 0.4)' : 'transparent'
    };
  } else {
    return {
      fill: isSelected ? 'rgba(148, 163, 184, 0.16)' : isHovered ? 'rgba(148, 163, 184, 0.10)' : 'rgba(148, 163, 184, 0.04)',
      stroke: isSelected ? '#94a3b8' : isHovered ? 'rgba(148, 163, 184, 0.7)' : 'rgba(148, 163, 184, 0.25)',
      strokeWidth: isSelected ? '2.5' : '1.5',
      glow: isSelected ? 'rgba(148, 163, 184, 0.4)' : 'transparent'
    };
  }
};

export default function Map() {
  const { gameState, selectRegion } = useGame();
  const { regions, factions, selectedRegionId } = gameState;
  const [hoveredRegionId, setHoveredRegionId] = useState<RegionID | null>(null);

  // Active region data
  const currentRegion = selectedRegionId ? regions[selectedRegionId] : null;

  // Render glowing tactical connections between nodes
  const renderConnections = () => {
    const lines: React.ReactNode[] = [];
    const rendered = new Set<string>();

    Object.entries(REGION_ADJACENCY).forEach(([fromKey, neighbors]) => {
      const fromID = fromKey as RegionID;
      const fromPt = REGION_COORDINATES[fromID];

      neighbors.forEach((toID) => {
        const pairKey = [fromID, toID].sort().join('-');
        if (!rendered.has(pairKey)) {
          rendered.add(pairKey);
          const toPt = REGION_COORDINATES[toID];
          const isRelatedHover = hoveredRegionId === fromID || hoveredRegionId === toID;
          const isRelatedSelect = selectedRegionId === fromID || selectedRegionId === toID;

          lines.push(
            <g key={pairKey}>
              {/* Outer Glow Line */}
              <line
                x1={fromPt.x}
                y1={fromPt.y}
                x2={toPt.x}
                y2={toPt.y}
                className="transition-all duration-300 pointer-events-none"
                stroke={isRelatedSelect ? 'rgba(45, 212, 191, 0.3)' : isRelatedHover ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.08)'}
                strokeWidth={isRelatedSelect ? '6' : '3'}
              />
              {/* Inner Pulsing Dotted Tactical Line */}
              <line
                x1={fromPt.x}
                y1={fromPt.y}
                x2={toPt.x}
                y2={toPt.y}
                className="laser-line transition-all duration-300 pointer-events-none"
                stroke={isRelatedSelect ? '#2dd4bf' : 'rgba(148, 163, 184, 0.5)'}
                strokeWidth="1.5"
                strokeDasharray="6,8"
              />
            </g>
          );
        }
      });
    });

    return lines;
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-2xl flex flex-col h-full">
      {/* CSS Styles injection for military radar sweep and moving dash lasers */}
      <style>{`
        @keyframes movingLaser {
          to {
            stroke-dashoffset: -20;
          }
        }
        @keyframes pulseAlert {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.3); opacity: 0.45; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .laser-line {
          animation: movingLaser 1.5s linear infinite;
        }
        .alert-pulse {
          animation: pulseAlert 2.5s ease-in-out infinite;
          transform-origin: center;
        }
        .spin-slow {
          transform-origin: center;
          animation: spinSlow 30s linear infinite;
        }
      `}</style>

      {/* Background Military Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b1329_1px,transparent_1px),linear-gradient(to_bottom,#0b1329_1px,transparent_1px)] bg-[size:40px_35px] opacity-40 pointer-events-none"></div>

      {/* Holographic Radar Sweep Compass Graphic (Left Corner Decorator) */}
      <div className="absolute top-16 left-6 w-24 h-24 rounded-full border border-slate-900/40 opacity-15 pointer-events-none flex items-center justify-center">
        <div className="w-18 h-18 rounded-full border border-dashed border-slate-800/60 flex items-center justify-center">
          <Compass className="w-8 h-8 text-slate-700 spin-slow" />
        </div>
      </div>

      {/* Map Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 select-none relative z-20 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <h2 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              GABINETE TÁTICO: OPERAÇÕES DE FRONTEIRA
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Clique em qualquer setor ou guarnição do mapa para selecionar.</p>
        </div>
        
        {/* Faction Legend */}
        <div className="flex flex-wrap gap-3 text-[10px] font-mono border border-slate-850 p-2 rounded bg-slate-950/80">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500 block"></span>
            <span className="text-slate-300">Brasil</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500 block"></span>
            <span className="text-slate-300">Paraguai</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500 block"></span>
            <span className="text-slate-300">Chaco</span>
          </div>
        </div>
      </div>

      {/* Interactive Vector Map Theater */}
      <div className="w-full flex-grow overflow-x-auto relative z-10 select-none scrollbar-thin scrollbar-thumb-slate-800">
        <svg
          viewBox="0 0 800 520"
          className="w-full min-w-[720px] h-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
        >
          {/* SVG Definitions for textures and grids */}
          <defs>
            <pattern id="sector-dots" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="rgba(148, 163, 184, 0.08)" />
            </pattern>
            <radialGradient id="ocean-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0b1329" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#020617" stopOpacity="1" />
            </radialGradient>
          </defs>

          {/* Map Outer Boundary Limits */}
          <rect x="5" y="5" width="790" height="510" fill="url(#ocean-glow)" rx="8" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" strokeDasharray="14,10" />

          {/* Latitude & Longitude Decorative Ticks */}
          <g className="opacity-40 font-mono text-[9px] fill-slate-500">
            <text x="25" y="18">24° 04&apos; S</text>
            <text x="25" y="495">26° 12&apos; S</text>
            <text x="735" y="495">54° 15&apos; W</text>
            <text x="735" y="18">47° 52&apos; W</text>
            
            {/* Visual Compass Reticle on base */}
            <circle cx="100" cy="100" r="45" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
            <circle cx="100" cy="100" r="25" fill="none" stroke="rgba(148, 163, 184, 0.05)" strokeWidth="1" />
            <line x1="100" y1="50" x2="100" y2="150" stroke="rgba(148, 163, 184, 0.1)" />
            <line x1="50" y1="100" x2="150" y2="100" stroke="rgba(148, 163, 184, 0.1)" />
            <text x="96" y="45" className="font-bold fill-slate-400">N</text>
          </g>

          {/* RIO PARANÁ / CYBER-HYDROLOGY */}
          {/* Glowing Outer River Path */}
          <path
            d="M 520,120 Q 480,210 450,260 T 360,375 T 230,395"
            fill="none"
            stroke="rgba(6, 182, 212, 0.15)"
            strokeWidth="8"
            className="transition-all duration-300"
          />
          <path
            d="M 520,120 Q 480,210 450,260 T 360,375 T 230,395"
            fill="none"
            stroke="#0891b2"
            strokeWidth="2.5"
            className="transition-all duration-300 opacity-60"
          />
          {/* Sliding Blue River core */}
          <path
            d="M 520,120 Q 480,210 450,260 T 360,375 T 230,395"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1"
            className="opacity-90 transition-all duration-300"
            strokeDasharray="15,40"
            style={{ animation: 'movingLaser 3s linear infinite' }}
          />

          {/* Strategic Logistic connections lines */}
          {renderConnections()}

          {/* TERRITORY POLYGON SECTORS */}
          {(Object.entries(regions) as [RegionID, Region][]).map(([regId, region]) => {
            const isHovered = hoveredRegionId === regId;
            const isSelected = selectedRegionId === regId;
            const style = GET_SECTOR_COLORS(region.controller, isHovered, isSelected);

            return (
              <g
                key={`sector-${regId}`}
                className="cursor-pointer transition-all duration-300"
                onClick={() => selectRegion(regId)}
                onMouseEnter={() => setHoveredRegionId(regId)}
                onMouseLeave={() => setHoveredRegionId(null)}
              >
                {/* Polygon Backdrop */}
                <polygon
                  points={REGION_SECTORS[regId]}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  className="transition-all duration-300"
                  style={{
                    filter: style.glow !== 'transparent' ? `drop-shadow(0 0 10px ${style.glow})` : 'none'
                  }}
                />

                {/* Subtle fill texture for hovered/selected sector */}
                {(isHovered || isSelected) && (
                  <polygon
                    points={REGION_SECTORS[regId]}
                    fill="url(#sector-dots)"
                    className="pointer-events-none transition-all duration-300"
                  />
                )}
              </g>
            );
          })}

          {/* NODE BADGES AND LABELS (drawn on top of sectors) */}
          {(Object.entries(regions) as [RegionID, Region][]).map(([regId, region]) => {
            const pt = REGION_COORDINATES[regId];
            const faction = factions[region.controller];
            const isHovered = hoveredRegionId === regId;
            const isSelected = selectedRegionId === regId;

            // Highlight size based on selection
            const nodeRadius = isSelected ? 22 : isHovered ? 20 : 17;
            const strokeColor = isSelected ? '#2dd4bf' : faction.id === 'BRASIL' ? '#10b981' : faction.id === 'PARAGUAI' ? '#ef4444' : '#f59e0b';

            return (
              <g
                key={`badge-${regId}`}
                className="cursor-pointer"
                onClick={() => selectRegion(regId)}
                onMouseEnter={() => setHoveredRegionId(regId)}
                onMouseLeave={() => setHoveredRegionId(null)}
              >
                {/* Threat / Combat Active Alarm ring */}
                {region.controller !== 'BRASIL' && region.troops > 15 && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={nodeRadius + 15}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    className="alert-pulse"
                    style={{ animationDuration: '2s' }}
                  />
                )}

                {/* Selection outer ring indicator */}
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={nodeRadius + 6}
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    className="animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                )}

                {/* High-tech hexagon or circular frame for the troop node */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={nodeRadius}
                  fill="#030712"
                  stroke={strokeColor}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  className="transition-all duration-300 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
                />

                {/* Active Outer Border Glow */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={nodeRadius - 3}
                  fill="none"
                  stroke={isSelected ? '#2dd4bf' : 'rgba(148, 163, 184, 0.15)'}
                  strokeWidth="1"
                />

                {/* Troop Quantity Display */}
                <text
                  x={pt.x}
                  y={pt.y + 4}
                  textAnchor="middle"
                  className="font-mono text-xs font-black fill-slate-100 select-none pointer-events-none transition-all duration-300"
                  style={{ fontSize: isSelected ? '13px' : '11px' }}
                >
                  {region.troops}
                </text>

                {/* Small indicator dot matching owner */}
                <circle
                  cx={pt.x + nodeRadius - 5}
                  cy={pt.y - nodeRadius + 5}
                  r="4"
                  fill={faction.id === 'BRASIL' ? '#34d399' : faction.id === 'PARAGUAI' ? '#f87171' : '#fbbf24'}
                  stroke="#020617"
                  strokeWidth="1"
                />

                {/* Sector Label Tag */}
                <foreignObject
                  x={pt.labelX - 85}
                  y={pt.labelY}
                  width="170"
                  height="50"
                  className="pointer-events-none"
                >
                  <div className="flex flex-col items-center">
                    {/* Region name box */}
                    <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded border transition-all duration-300 font-extrabold uppercase shadow-lg shadow-black/80 ${
                      isSelected 
                        ? 'bg-teal-950 border-teal-400 text-teal-300' 
                        : isHovered 
                          ? 'bg-slate-900 border-slate-700 text-slate-100'
                          : 'bg-slate-950/95 border-slate-900 text-slate-400'
                    }`}>
                      {region.name.replace('Distrito Decisório de ', '').replace('Complexo Hidrelétrico de ', '').replace('Base Logística de ', '')}
                    </span>
                    
                    {/* Small metrics tag below label */}
                    <div className="flex space-x-2 mt-1 py-0.2 px-1 text-[8px] text-slate-400 font-mono bg-slate-950/80 rounded border border-slate-900/60 shadow">
                      <span className="flex items-center text-rose-500">
                        🛡️ {region.defenseRating}
                      </span>
                      <span className="text-slate-700">|</span>
                      <span className="flex items-center text-amber-500">
                        ⚡ {region.energyProduction}
                      </span>
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Contextual Information Overlay - Adds incredible Geopolitical flavor */}
        <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-slate-800 p-3 rounded-lg max-w-[280px] shadow-2xl pointer-events-none border-l-2 border-l-teal-500">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold text-slate-300">FOCO GEOPOLÍTICO</span>
            <span className="text-[8px] bg-slate-900 text-emerald-400 font-mono px-1 border border-slate-800 rounded">PRONTIDÃO</span>
          </div>
          {currentRegion ? (
            <div>
              <p className="text-[11px] font-bold text-slate-200 uppercase tracking-tight">{currentRegion.name}</p>
              <p className="text-[9px] text-slate-400 leading-tight mt-1 line-clamp-2">{currentRegion.description}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-900 font-mono text-[9px]">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span className="text-slate-400">DEF:</span>
                  <span className="text-slate-200 font-bold">{currentRegion.defenseRating}/5</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-slate-400">ELETRI:</span>
                  <span className="text-slate-200 font-bold">{currentRegion.energyProduction} GW</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-medium text-slate-400">Nenhum setor sob custódia tática selecionado de imediato.</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Clique nas divisões físicas do mapa para emitir ordens de remanejamento ou recrutar companhias de defesa.</p>
            </div>
          )}
        </div>

        {/* Water River System legend on bottom-left */}
        <div className="absolute bottom-3 left-3 text-[9px] text-slate-500 font-mono flex items-center space-x-1.5 bg-slate-950/80 p-1.5 rounded border border-slate-900 pointer-events-none">
          <span className="inline-block w-4 h-0.5 bg-cyan-500"></span>
          <span>Hidrovia do Rio Paraná e Bacia de Prata</span>
        </div>
      </div>
    </div>
  );
}

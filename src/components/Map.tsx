/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGame } from '../context/GameContext';
import { RegionID, Region } from '../types/game';
import { Activity, Layers } from 'lucide-react';

// ── Tile providers ────────────────────────────────────────────────────────────

type TileStyleKey = 'ESC' | 'VOY' | 'CLA' | 'SAT' | 'REL';

const TILE_PROVIDERS: Record<
  TileStyleKey,
  { label: string; url: string; attribution: string; subdomains?: string }
> = {
  ESC: {
    label: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>',
    subdomains: 'abcd',
  },
  VOY: {
    label: 'CartoDB Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>',
    subdomains: 'abcd',
  },
  CLA: {
    label: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>',
    subdomains: 'abcd',
  },
  SAT: {
    label: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com">Esri</a>, DigitalGlobe, GeoEye, Earthstar Geographics',
  },
  REL: {
    label: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>, <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    subdomains: 'abc',
  },
};

// ── Region geography ──────────────────────────────────────────────────────────

// Non-overlapping tiles covering lat[-28,-14] × lng[-62,-46] (Prata Basin)
const REGION_POLYGONS: Record<RegionID, [number, number][]> = {
  BRASILIA:        [[-14,-52], [-14,-46], [-22,-46], [-22,-52]],
  MATO_GROSSO_SUL: [[-14,-58], [-14,-52], [-22,-52], [-22,-58]],
  CHACO:           [[-14,-62], [-14,-58], [-22,-58], [-22,-62]],
  ASSUNCAO:        [[-22,-62], [-22,-57], [-25,-57], [-25,-62]],
  CIUDAD_DEL_ESTE: [[-22,-57], [-22,-52], [-25,-52], [-25,-57]],
  ITAIPU:          [[-22,-52], [-22,-46], [-25,-46], [-25,-52]],
  FOZ_DO_IGUACU:   [[-25,-62], [-25,-46], [-28,-46], [-28,-62]],
};

const REGION_CENTERS: Record<RegionID, [number, number]> = {
  BRASILIA:        [-18,   -49  ],
  MATO_GROSSO_SUL: [-18,   -55  ],
  CHACO:           [-18,   -60  ],
  ASSUNCAO:        [-23.5, -59.5],
  CIUDAD_DEL_ESTE: [-23.5, -54.5],
  ITAIPU:          [-23.5, -49  ],
  FOZ_DO_IGUACU:   [-26.5, -54  ],
};

// ── Faction colours ───────────────────────────────────────────────────────────

const FACTION_STYLE: Record<string, { fill: string; border: string }> = {
  BRASIL:          { fill: '#10b981', border: '#34d399' },
  PARAGUAI:        { fill: '#ef4444', border: '#f87171' },
  COALIZAO_CHACO:  { fill: '#f59e0b', border: '#fbbf24' },
  MERCENARIOS:     { fill: '#94a3b8', border: '#cbd5e1' },
};

// ── Label icon builder ────────────────────────────────────────────────────────

function buildLabelIcon(
  name: string,
  troops: number,
  borderColor: string,
  selected: boolean,
): L.DivIcon {
  const short = name
    .replace('Distrito Decisório de ', '')
    .replace('Complexo Hidrelétrico de ', '')
    .replace('Base Logística de ', '')
    .replace('Setor de ', '');

  const bg   = 'rgba(2,6,23,0.90)';
  const bdr  = selected ? '#2dd4bf' : borderColor;
  const clr  = selected ? '#2dd4bf' : '#e2e8f0';

  const html = `
    <div style="transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:none">
      <div style="background:${bg};border:1px solid ${bdr};border-radius:3px;padding:1px 6px;font-size:8px;color:${clr};white-space:nowrap;text-transform:uppercase;font-weight:700;letter-spacing:0.07em;font-family:monospace;box-shadow:0 2px 6px rgba(0,0,0,0.7)">
        ${short}
      </div>
      <div style="background:${bg};border:1.5px solid ${bdr};border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#f1f5f9;font-weight:900;font-family:monospace;box-shadow:0 2px 8px rgba(0,0,0,0.8)">
        ${troops}
      </div>
    </div>`;

  return L.divIcon({ html, className: '', iconSize: [0, 0], iconAnchor: [0, 0] });
}

// ── Leaflet size fix ──────────────────────────────────────────────────────────
// Forces Leaflet to re-detect container dimensions after React renders the DOM.
// Without this, flex-grow containers resolve to 0px at Leaflet init time.
function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(id);
  }, [map]);
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Map() {
  const { gameState, selectRegion } = useGame();
  const { regions, selectedRegionId } = gameState;

  const [tileStyle, setTileStyle] = useState<TileStyleKey>('ESC');
  const [showPicker, setShowPicker]   = useState(false);

  const provider = TILE_PROVIDERS[tileStyle];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden shadow-2xl flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center px-5 py-3 border-b border-slate-800 relative z-[1001] bg-slate-950/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <h2 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            TEATRO DE OPERAÇÕES
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Faction legend */}
          <div className="hidden sm:flex gap-3 text-[10px] font-mono border border-slate-800 px-2 py-1 rounded bg-slate-950/80">
            {[
              { label: 'Brasil',   bg: 'bg-emerald-500/20', bdr: 'border-emerald-500' },
              { label: 'Paraguai', bg: 'bg-red-500/20',     bdr: 'border-red-500'     },
              { label: 'Chaco',    bg: 'bg-amber-500/20',   bdr: 'border-amber-500'   },
            ].map(f => (
              <span key={f.label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded ${f.bg} border ${f.bdr} block`} />
                <span className="text-slate-300">{f.label}</span>
              </span>
            ))}
          </div>

          {/* Style picker button */}
          <div className="relative">
            <button
              onClick={() => setShowPicker(v => !v)}
              className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded hover:border-teal-500 hover:text-teal-300 transition-colors bg-slate-900/80 select-none"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="text-teal-400 tracking-widest">{tileStyle}</span>
              <span className="text-slate-500 text-[8px]">▾</span>
            </button>

            {showPicker && (
              <>
                {/* Backdrop to close picker */}
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setShowPicker(false)}
                />
                <div className="absolute top-full right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-[9999] min-w-[230px]">
                  {(Object.entries(TILE_PROVIDERS) as [TileStyleKey, typeof TILE_PROVIDERS[TileStyleKey]][]).map(([key, p]) => (
                    <button
                      key={key}
                      onClick={() => { setTileStyle(key); setShowPicker(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-800 transition-colors ${
                        tileStyle === key ? 'bg-slate-800/80' : ''
                      }`}
                    >
                      <span className={`font-mono font-black text-[11px] w-9 text-center py-0.5 rounded border shrink-0 ${
                        tileStyle === key
                          ? 'border-teal-500 text-teal-300 bg-teal-950'
                          : 'border-slate-700 text-slate-400'
                      }`}>
                        {key}
                      </span>
                      <span className={`text-[11px] font-mono ${tileStyle === key ? 'text-teal-300' : 'text-slate-300'}`}>
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Leaflet Map ─────────────────────────────────────────────────────── */}
      <div style={{ height: '480px' }}>
        <MapContainer
          center={[-21, -54]}
          zoom={5}
          style={{ height: '100%', width: '100%', background: '#020617' }}
          zoomControl
          scrollWheelZoom
        >
          <InvalidateOnMount />
          <TileLayer
            key={tileStyle}
            url={provider.url}
            attribution={provider.attribution}
            subdomains={provider.subdomains ?? 'abc'}
          />

          {(Object.entries(regions) as [RegionID, Region][]).map(([regId, region]) => {
            const isSelected = selectedRegionId === regId;
            const colors = FACTION_STYLE[region.controller] ?? FACTION_STYLE.MERCENARIOS;

            return (
              <React.Fragment key={regId}>
                <Polygon
                  key={`poly-${regId}-${isSelected}`}
                  positions={REGION_POLYGONS[regId]}
                  pathOptions={{
                    color:       colors.border,
                    fillColor:   colors.fill,
                    fillOpacity: isSelected ? 0.38 : 0.14,
                    weight:      isSelected ? 2.5 : 1,
                    dashArray:   isSelected ? undefined : '5,5',
                  }}
                  eventHandlers={{ click: () => selectRegion(regId) }}
                />
                <Marker
                  key={`lbl-${regId}-${isSelected}-${region.troops}`}
                  position={REGION_CENTERS[regId]}
                  icon={buildLabelIcon(region.name, region.troops, colors.border, isSelected)}
                  eventHandlers={{ click: () => selectRegion(regId) }}
                />
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

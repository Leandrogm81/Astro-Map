"use client";

import React, { useMemo, useState, useRef } from 'react';
import { NatalChart, PlanetPosition } from '@/types';

const CX = 400;
const CY = 400;

// Constantes de Raio baseadas na geometria moderna premium
const R_OUTER = 380;
const R_ZODIAC_INNER = 330;
const R_TICKS_INNER = 320;
const R_ASPECTS = 210;

// Cores dos Signos (Padrão AstroMap)
const SIGN_COLORS: Record<string, string> = {
  'Aries': '#ef4444', 'Taurus': '#22c55e', 'Gemini': '#3b82f6', 'Cancer': '#06b6d4',
  'Leo': '#ef4444', 'Virgo': '#22c55e', 'Libra': '#3b82f6', 'Scorpio': '#06b6d4',
  'Sagittarius': '#ef4444', 'Capricorn': '#22c55e', 'Aquarius': '#3b82f6', 'Pisces': '#06b6d4'
};

const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

interface TraditionalChartProps {
  chart: NatalChart;
  options: {
    houseSystem: 'whole_sign' | 'equal_house';
    showAspects: boolean;
    showAllLots: boolean;
  };
  onOptionChange?: (key: string, value: any) => void;
}

export default function TraditionalChart({ chart, options, onOptionChange }: TraditionalChartProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null);
  const [hoveredLotId, setHoveredLotId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auxiliares de Cálculo
  const asc = chart.houses[0].longitude;
  const longitudeToAngle = (lon: number) => {
    // Inverter direção para anti-horário e rotacionar para o ASC na esquerda (180°)
    let deg = (lon - asc + 180) % 360;
    return (deg * Math.PI) / 180;
  };

  const getArcPath = (startLon: number, endLon: number, rOut: number, rIn: number) => {
    const startAngle = longitudeToAngle(startLon);
    const endAngle = longitudeToAngle(endLon);
    
    // Coordenadas
    const x1 = CX + rOut * Math.cos(startAngle);
    const y1 = CY + rOut * Math.sin(startAngle);
    const x2 = CX + rOut * Math.cos(endAngle);
    const y2 = CY + rOut * Math.sin(endAngle);
    const x3 = CX + rIn * Math.cos(endAngle);
    const y3 = CY + rIn * Math.sin(endAngle);
    const x4 = CX + rIn * Math.cos(startAngle);
    const y4 = CY + rIn * Math.sin(startAngle);

    return `M ${x1} ${y1} A ${rOut} ${rOut} 0 0 0 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 0 1 ${x4} ${y4} Z`;
  };

  // 1. Zodíaco Colorido (Fatias)
  const zodiacElements = SIGN_NAMES.map((name, i) => {
    const color = SIGN_COLORS[name];
    const signLon = i * 30;
    const path = getArcPath(signLon, signLon + 30, R_OUTER, R_ZODIAC_INNER);
    const textAngle = longitudeToAngle(signLon + 15);
    const tx = CX + (R_OUTER + R_ZODIAC_INNER) / 2 * Math.cos(textAngle);
    const ty = CY + (R_OUTER + R_ZODIAC_INNER) / 2 * Math.sin(textAngle);

    return (
      <g key={name}>
        <path d={path} fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <text 
          x={tx} y={ty} textAnchor="middle" dominantBaseline="central" 
          fill={color} fontSize="24" fontWeight="bold" className="select-none"
        >
          {SIGN_SYMBOLS[i]}
        </text>
      </g>
    );
  });

  // 2. Ticks de Graus
  const degreeTicks = useMemo(() => {
    return Array.from({ length: 360 }).map((_, i) => {
      const angle = longitudeToAngle(i);
      const isMain = i % 30 === 0;
      const isFive = i % 5 === 0;
      const r2 = isMain ? R_TICKS_INNER - 15 : (isFive ? R_TICKS_INNER - 8 : R_TICKS_INNER - 4);
      return (
        <line
          key={`tick-${i}`}
          x1={CX + R_ZODIAC_INNER * Math.cos(angle)} y1={CY + R_ZODIAC_INNER * Math.sin(angle)}
          x2={CX + r2 * Math.cos(angle)} y2={CY + r2 * Math.sin(angle)}
          stroke={isMain ? "#cbd5e1" : "#475569"}
          strokeWidth={isMain ? 1.5 : 1}
          opacity={isMain ? 0.8 : 0.4}
        />
      );
    });
  }, [asc]);

  // 3. Casas Tradicionais
  const houseElements = useMemo(() => {
    const houses = [];
    for (let i = 0; i < 12; i++) {
        let hStartLon;
        if (options.houseSystem === 'whole_sign') {
            const ascSign = Math.floor(asc / 30);
            hStartLon = ((ascSign + i) * 30) % 360;
        } else {
            hStartLon = (asc + i * 30) % 360;
        }
        
        const angle = longitudeToAngle(hStartLon);
        const nextAngle = longitudeToAngle(hStartLon + 15);
        const isAngular = [0, 3, 6, 9].includes(i); // 1, 4, 7, 10

        houses.push(
            <g key={`h-${i}`}>
                <line 
                   x1={CX} y1={CY} 
                   x2={CX + R_ZODIAC_INNER * Math.cos(angle)} y2={CY + R_ZODIAC_INNER * Math.sin(angle)}
                   stroke={isAngular ? "#fbbf24" : "#7c3aed"} 
                   strokeWidth={isAngular ? 3 : 1.5} 
                   opacity={isAngular ? 1 : 0.6}
                />
                <text 
                  x={CX + (R_ASPECTS + 20) * Math.cos(nextAngle)} 
                  y={CY + (R_ASPECTS + 20) * Math.sin(nextAngle)}
                  textAnchor="middle" dominantBaseline="central"
                  fill={isAngular ? "#e2e8f0" : "#94a3b8"}
                  fontSize="16" fontWeight={isAngular ? "bold" : "normal"}
                >
                  {i + 1}
                </text>
            </g>
        );
    }
    return houses;
  }, [asc, options.houseSystem]);

  // 4. Planetas Classic (7)
  const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const classicPlanets = chart.planets.filter(p => {
      const pId = p.id?.toLowerCase();
      return classicIds.includes(pId);
  });

  const planetNodes = classicPlanets.map(p => {
    const angle = longitudeToAngle(p.longitude);
    const r = R_ZODIAC_INNER - 40;
    const x = CX + r * Math.cos(angle);
    const y = CY + r * Math.sin(angle);
    const isHovered = hoveredPlanetId === p.id;

    return (
      <g 
        key={p.id} 
        onMouseEnter={() => setHoveredPlanetId(p.id)}
        onMouseLeave={() => setHoveredPlanetId(null)}
        className="cursor-pointer transition-all duration-300"
      >
        <line 
          x1={x} y1={y} 
          x2={CX + R_ZODIAC_INNER * Math.cos(angle)} y2={CY + R_ZODIAC_INNER * Math.sin(angle)} 
          stroke="#475569" strokeWidth="0.5" opacity="0.3" 
        />
        <line 
          x1={x} y1={y} 
          x2={CX + (r + 10) * Math.cos(angle)} y2={CY + (r + 10) * Math.sin(angle)} 
          stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" 
        />
        <circle cx={x} cy={y} r="16" fill="#0f172a" stroke={isHovered ? "#fbbf24" : "#94a3b8"} strokeWidth="2" />
        <text 
          x={x} y={y} textAnchor="middle" dominantBaseline="central" 
          fill={isHovered ? "#fbbf24" : "#94a3b8"} fontSize="20" fontWeight="bold"
        >
          {p.symbol}
        </text>
      </g>
    );
  });

  // 5. Lotes Herméticos
  const lotColors: Record<string, string> = {
    fortune: '#fbbf24', spirit: '#60a5fa', eros: '#f472b6', 
    necessity: '#2dd4bf', courage: '#ef4444', victory: '#a855f7', nemesis: '#64748b'
  };

  const lotNodes = (chart.lots || [])
    .filter(l => options.showAllLots || l.id === 'fortune' || l.id === 'spirit')
    .map(l => {
      const angle = longitudeToAngle(l.longitude);
      const r = R_ASPECTS + 40;
      const x = CX + r * Math.cos(angle);
      const y = CY + r * Math.sin(angle);
      const color = lotColors[l.id] || '#94a3b8';
      const isHovered = hoveredLotId === l.id;

      return (
        <g 
          key={l.id} 
          onMouseEnter={() => setHoveredLotId(l.id)}
          onMouseLeave={() => setHoveredLotId(null)}
          className="cursor-help transition-all duration-300"
        >
          <line 
             x1={x} y1={y} 
             x2={CX + R_ZODIAC_INNER * Math.cos(angle)} y2={CY + R_ZODIAC_INNER * Math.sin(angle)} 
             stroke={color} strokeWidth="0.5" strokeDasharray="1,2" opacity="0.3" 
          />
          <circle 
            cx={x} cy={y} r="18" 
            fill={isHovered ? "#1e293b" : "#020617"} 
            stroke={color} 
            strokeWidth="2" 
            strokeDasharray={isHovered ? "none" : "2,1"} 
          />
          <text 
            x={x} y={y} textAnchor="middle" dominantBaseline="central" 
            fill={color} fontSize="20" fontWeight="bold"
          >
            {l.symbol}
          </text>
        </g>
      );
    });

  // 6. Aspectos Dinâmicos e de Hover
  const aspectLines = chart.aspects
    .map(a => {
      const p1 = classicPlanets.find(pp => pp.id?.toLowerCase() === a.planet1.toLowerCase() || pp.name?.toLowerCase() === a.planet1.toLowerCase());
      const p2 = classicPlanets.find(pp => pp.id?.toLowerCase() === a.planet2.toLowerCase() || pp.name?.toLowerCase() === a.planet2.toLowerCase());
      
      if (!p1 || !p2 || a.orb > 10) return null;

      const isConnectedToHover = hoveredPlanetId === p1.id || hoveredPlanetId === p2.id;
      const shouldShow = options.showAspects || isConnectedToHover;
      
      if (!shouldShow) return null;

      let color = '#94a3b8';
      if (a.type === 'trine') color = '#10b981';
      if (a.type === 'sextile') color = '#3b82f6';
      if (a.type === 'square') color = '#ef4444';
      if (a.type === 'opposition') color = '#f97316';
      if (a.type === 'conjunction') color = '#fbbf24';

      const a1 = longitudeToAngle(p1.longitude);
      const a2 = longitudeToAngle(p2.longitude);

      return (
        <line 
          key={`${a.planet1}-${a.planet2}-${a.type}`}
          x1={CX + R_ASPECTS * Math.cos(a1)} y1={CY + R_ASPECTS * Math.sin(a1)}
          x2={CX + R_ASPECTS * Math.cos(a2)} y2={CY + R_ASPECTS * Math.sin(a2)}
          stroke={color} 
          strokeWidth={isConnectedToHover ? 3 : 2} 
          opacity={isConnectedToHover ? 1 : 0.6}
          strokeDasharray={a.orb > 6 ? "5,3" : "none"}
          className="transition-all duration-300"
        />
      );
    });

  const renderTooltip = () => {
    const target = hoveredPlanetId 
       ? classicPlanets.find(p => p.id === hoveredPlanetId)
       : (hoveredLotId ? chart.lots?.find(l => l.id === hoveredLotId) : null);

    if (!target) return null;

    const angle = longitudeToAngle(target.longitude);
    const r = hoveredPlanetId ? R_ZODIAC_INNER - 40 : R_ASPECTS + 40;
    const focusX = CX + r * Math.cos(angle);
    const focusY = CY + r * Math.sin(angle);

    const title = (target as any).name || (target as any).label || "Lote";
    const subtitle = `${SIGN_NAMES[Math.floor(target.longitude / 30)]} ${Math.floor(target.longitude % 30)}°${Math.floor((target.longitude % 1) * 60)}'`;
    const desc = (target as any).description;
    
    const offsetSide = focusX > CX ? 40 : -240;
    const offsetTop = focusY > CY ? -120 : 40;

    return (
      <g transform={`translate(${focusX}, ${focusY})`} className="pointer-events-none">
        <g transform={`translate(${offsetSide}, ${offsetTop})`}>
          <rect width="200" height={desc ? 120 : 90} rx="14" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" className="shadow-2xl" opacity="0.98" />
          <text x="100" y="30" textAnchor="middle" fill="#fbbf24" fontSize="16" fontWeight="bold">{title}</text>
          <text x="100" y="55" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="600">{subtitle}</text>
          <text x="100" y="78" textAnchor="middle" fill="#94a3b8" fontSize="13">Posição Clássica</text>
          {desc && (
            <text x="100" y="100" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="normal">
              {desc.length > 50 ? desc.substring(0, 47) + '...' : desc}
            </text>
          )}
        </g>
      </g>
    );
  };

  // Handlers de Mouse/Touch para Arraste
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-[850px] flex items-center justify-center p-8">
      <div ref={containerRef} className="w-full h-full relative group">
        <svg 
          viewBox="0 0 800 800" 
          className="w-full h-full touch-none cursor-grab active:cursor-grabbing shadow-inner"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={(e) => {
            if (Math.abs(e.deltaY) < 1) return;
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setZoom(z => Math.min(Math.max(z * delta, 0.5), 4));
          }}
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} className="origin-[0_0]">
            {/* Círculo Principal */}
            <circle cx={CX} cy={CY} r={R_OUTER} fill="#0f172a" stroke="#7c3aed" strokeWidth="2" />
            <circle cx={CX} cy={CY} r={R_ZODIAC_INNER} fill="none" stroke="#7c3aed" strokeWidth="1.5" />
            
            {/* Zodíaco Colorido */}
            {zodiacElements}
            
            {/* Ticks de Graus */}
            {degreeTicks}

            {/* Fundo Central */}
            <circle cx={CX} cy={CY} r={R_ASPECTS} fill="#020617" stroke="#475569" strokeWidth="2" />

            {/* Casas, Aspectos, Planetas e Lotes */}
            {houseElements}
            {aspectLines}
            {lotNodes}
            {planetNodes}
            {renderTooltip()}

            {/* Alvo Central */}
            <circle cx={CX} cy={CY} r="12" fill="none" stroke="#64748b" strokeWidth="2" />
            <line x1={CX-8} y1={CY} x2={CX+8} y2={CY} stroke="#64748b" strokeWidth="2" />
            <line x1={CX} y1={CY-8} x2={CX} y2={CY+8} stroke="#64748b" strokeWidth="2" />
          </g>
        </svg>

        {/* Controles Dinâmicos */}
        <div className="absolute right-6 top-6 flex flex-col gap-3">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-3 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-all shadow-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-3 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-all shadow-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg></button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-3 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-all shadow-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg></button>
          <div className="w-px h-6 bg-slate-800 self-center" />
          <button onClick={() => setShowSettings(!showSettings)} className={`p-3 backdrop-blur border rounded-xl transition-all shadow-lg ${showSettings ? 'bg-gold-500/20 border-gold-500/50 text-gold-400' : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
        </div>

        {/* Menu de Configuração Glassmorphism */}
        {showSettings && (
          <div className="absolute right-20 top-6 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300 z-50">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>Ajustes de Visualização</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-pointer" onClick={() => onOptionChange?.('showAspects', !options.showAspects)}>
                <span className="text-slate-300 text-sm">Linhas de Aspecto</span>
                <div className={`text-xl transition-colors ${options.showAspects ? 'text-red-500' : 'text-slate-600'}`}>{options.showAspects ? '👁️' : '🔒'}</div>
              </div>

              <div className="flex items-center justify-between group cursor-pointer" onClick={() => onOptionChange?.('showAllLots', !options.showAllLots)}>
                <span className="text-slate-300 text-sm">Todos os Lotes</span>
                <div className={`text-xl transition-colors ${options.showAllLots ? 'text-red-500' : 'text-slate-600'}`}>{options.showAllLots ? '👁️' : '🔒'}</div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">Sistema de Casas</span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => onOptionChange?.('houseSystem', 'whole_sign')} className={`px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${options.houseSystem === 'whole_sign' ? 'bg-gold-500/20 border-gold-500 text-gold-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>Signos Inteiros</button>
                  <button onClick={() => onOptionChange?.('houseSystem', 'equal_house')} className={`px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${options.houseSystem === 'equal_house' ? 'bg-gold-500/20 border-gold-500 text-gold-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>Casas Iguais</button>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[9px] text-slate-500 leading-tight italic">A análise Dorotheana recomenda Signos Inteiros para regências clássicas.</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useMemo, useState, useRef } from 'react';
import { NatalChart } from '@/types';

const CX = 400;
const CY = 400;

// Constantes de Raio Hierárquicas
const R_TOTAL = 398;
const R_SIGNS_IN = 368;  // Fim dos Signos (30px)
const R_FACES_IN = 348;  // Fim das Faces (20px)
const R_TERMS_IN = 318;  // Fim dos Termos (30px)
const R_TICKS_IN = 310;  // Fim da Régua (8px)
const R_ASPECTS = 210;   // Início do Círculo Negro

// Símbolos
const PLANET_SYMBOLS: Record<string, string> = {
  saturn: '♄', jupiter: '♃', mars: '♂', sun: '☉', venus: '♀', mercury: '☿', moon: '☽'
};

const SIGN_COLORS: Record<string, string> = {
  'Aries': '#ef4444', 'Taurus': '#10b981', 'Gemini': '#3b82f6', 'Cancer': '#06b6d4',
  'Leo': '#f97316', 'Virgo': '#059669', 'Libra': '#60a5fa', 'Scorpio': '#0891b2',
  'Sagittarius': '#dc2626', 'Capricorn': '#047857', 'Aquarius': '#2563eb', 'Pisces': '#0891b2'
};

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

// Tabela de Termos Egípcios (Bounds: até qual grau o planeta rege)
const EGYPTIAN_TERMS: Record<string, {p: string, b: number}[]> = {
  'Aries': [{p:'jupiter', b:6}, {p:'venus', b:12}, {p:'mercury', b:20}, {p:'mars', b:25}, {p:'saturn', b:30}],
  'Taurus': [{p:'venus', b:8}, {p:'mercury', b:14}, {p:'jupiter', b:22}, {p:'saturn', b:27}, {p:'mars', b:30}],
  'Gemini': [{p:'mercury', b:6}, {p:'jupiter', b:12}, {p:'venus', b:17}, {p:'mars', b:24}, {p:'saturn', b:30}],
  'Cancer': [{p:'mars', b:7}, {p:'venus', b:13}, {p:'mercury', b:19}, {p:'jupiter', b:26}, {p:'saturn', b:30}],
  'Leo': [{p:'jupiter', b:6}, {p:'mercury', b:11}, {p:'saturn', b:18}, {p:'venus', b:24}, {p:'mars', b:30}],
  'Virgo': [{p:'mercury', b:7}, {p:'venus', b:17}, {p:'jupiter', b:21}, {p:'mars', b:28}, {p:'saturn', b:30}],
  'Libra': [{p:'saturn', b:6}, {p:'venus', b:11}, {p:'jupiter', b:19}, {p:'mercury', b:24}, {p:'mars', b:30}],
  'Scorpio': [{p:'mars', b:7}, {p:'venus', b:11}, {p:'mercury', b:19}, {p:'jupiter', b:24}, {p:'saturn', b:30}],
  'Sagittarius': [{p:'jupiter', b:12}, {p:'venus', b:17}, {p:'mercury', b:21}, {p:'saturn', b:25}, {p:'mars', b:30}],
  'Capricorn': [{p:'mercury', b:7}, {p:'jupiter', b:14}, {p:'venus', b:22}, {p:'saturn', b:26}, {p:'mars', b:30}],
  'Aquarius': [{p:'mercury', b:7}, {p:'venus', b:13}, {p:'jupiter', b:20}, {p:'mars', b:25}, {p:'saturn', b:30}],
  'Pisces': [{p:'venus', b:12}, {p:'jupiter', b:16}, {p:'mercury', b:19}, {p:'mars', b:28}, {p:'saturn', b:30}]
};

// Faces Caldeias (10° cada)
const CHALDEAN_FACES = [
  'mars', 'sun', 'venus',      // Aries
  'mercury', 'moon', 'saturn',  // Taurus
  'jupiter', 'mars', 'sun',    // Gemini
  'venus', 'mercury', 'moon',   // Cancer
  'saturn', 'jupiter', 'mars',  // Leo
  'sun', 'venus', 'mercury',   // Virgo
  'moon', 'saturn', 'jupiter',  // Libra
  'mars', 'sun', 'venus',      // Scorpio
  'mercury', 'moon', 'saturn',  // Sagittarius
  'jupiter', 'mars', 'sun',    // Capricorn
  'venus', 'mercury', 'moon',   // Aquarius
  'saturn', 'jupiter', 'mars'   // Pisces
];

interface Props {
  chart: NatalChart;
  showAllLots?: boolean;
  selectedPlanetId?: string | null;
  onPlanetClick?: (id: string | null) => void;
  options?: any;
  onOptionChange?: any;
}

export default function TraditionalChart({ 
  chart, 
  showAllLots = false,
  selectedPlanetId,
  onPlanetClick,
  options: externalOptions, 
  onOptionChange 
}: Props) {
  const [internalOptions, setInternalOptions] = useState({
    showAspects: true,
    houseSystem: 'whole_sign' as 'whole_sign' | 'placidus',
    showSettings: false
  });

  const options = externalOptions || internalOptions;
  const handleOptionChange = (key: string, value: any) => {
    if (onOptionChange) {
      onOptionChange(key, value);
    } else {
      setInternalOptions(prev => ({ ...prev, [key]: value }));
    }
  };

  const asc = chart.ascendant;
  const longitudeToAngle = (lon: number) => ((lon - asc + 180) % 360) * (Math.PI / 180);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeHoverId = hoveredId || selectedPlanetId;

  const getArcPath = (sL: number, eL: number, rO: number, rI: number) => {
    const a1 = longitudeToAngle(sL), a2 = longitudeToAngle(eL);
    return `M ${CX+rO*Math.cos(a1)} ${CY+rO*Math.sin(a1)} A ${rO} ${rO} 0 0 0 ${CX+rO*Math.cos(a2)} ${CY+rO*Math.sin(a2)} L ${CX+rI*Math.cos(a2)} ${CY+rI*Math.sin(a2)} A ${rI} ${rI} 0 0 1 ${CX+rI*Math.cos(a1)} ${CY+rI*Math.sin(a1)} Z`;
  };

  // 1. Signos
  const zodiacRings = SIGN_NAMES.map((name, i) => {
    const color = SIGN_COLORS[name];
    const signLon = i * 30;
    const aText = longitudeToAngle(signLon + 15);
    return (
      <g key={name}>
        <path d={getArcPath(signLon, signLon+30, R_TOTAL, R_SIGNS_IN)} fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <text 
          x={CX+(R_TOTAL+R_SIGNS_IN)/2*Math.cos(aText)} y={CY+(R_TOTAL+R_SIGNS_IN)/2*Math.sin(aText)}
          textAnchor="middle" dominantBaseline="central" fill={color} fontSize="20" fontWeight="bold"
        >{SIGN_SYMBOLS[i]}</text>
      </g>
    );
  });

  // 2. Faces (Decanatos)
  const faceRings = CHALDEAN_FACES.map((p, i) => {
    const sL = i * 10, eL = (i+1) * 10;
    const aText = longitudeToAngle(sL + 5);
    return (
      <g key={`face-${i}`}>
        <path d={getArcPath(sL, eL, R_SIGNS_IN, R_FACES_IN)} fill="none" stroke="#475569" strokeWidth="0.5" opacity="0.3" />
        <text 
          x={CX+(R_SIGNS_IN+R_FACES_IN)/2*Math.cos(aText)} y={CY+(R_SIGNS_IN+R_FACES_IN)/2*Math.sin(aText)}
          textAnchor="middle" dominantBaseline="central" fill="#94a3b8" fontSize="12"
        >{PLANET_SYMBOLS[p]}</text>
      </g>
    );
  });

  // 3. Termos Egípcios
  const termRings = useMemo(() => {
    const elements: React.ReactNode[] = [];
    SIGN_NAMES.forEach((sign, sIdx) => {
      const terms = EGYPTIAN_TERMS[sign];
      let lastBound = 0;
      terms.forEach((t, tIdx) => {
        const signLon = sIdx * 30;
        const sL = signLon + lastBound;
        const eL = signLon + t.b;
        const aT = longitudeToAngle(sL + (t.b - lastBound)/2);
        elements.push(
          <g key={`term-${sign}-${tIdx}`}>
            <path d={getArcPath(sL, eL, R_FACES_IN, R_TERMS_IN)} fill="none" stroke="#475569" strokeWidth="0.5" opacity="0.3" />
            <text 
              x={CX+(R_FACES_IN+R_TERMS_IN)/2*Math.cos(aT)} y={CY+(R_FACES_IN+R_TERMS_IN)/2*Math.sin(aT)}
              textAnchor="middle" dominantBaseline="central" fill="#cbd5e1" fontSize="11"
            >{PLANET_SYMBOLS[t.p]}</text>
          </g>
        );
        lastBound = t.b;
      });
    });
    return elements;
  }, [asc]);

  // 4. Régua de Graus
  const degreeTicks = Array.from({length:360}).map((_, i) => {
    const a = longitudeToAngle(i);
    const isM = i % 30 === 0, isF = i % 5 === 0;
    const r2 = isM ? R_TICKS_IN-10 : (isF ? R_TICKS_IN-5 : R_TICKS_IN-3);
    return <line key={i} x1={CX+R_TERMS_IN*Math.cos(a)} y1={CY+R_TERMS_IN*Math.sin(a)} x2={CX+r2*Math.cos(a)} y2={CY+r2*Math.sin(a)} stroke="#475569" strokeWidth={isM?1:0.5} opacity={isM?0.8:0.3} />;
  });

  // 5. Planetas e Lotes (Ajustados para o novo espaço central)
  const classicPlanets = chart.planets.filter(p => ['sun','moon','mercury','venus','mars','jupiter','saturn'].includes(p.id?.toLowerCase() || ''));
  const planetElements = classicPlanets.map(p => {
    const a = longitudeToAngle(p.longitude);
    const r = R_TICKS_IN - 35;
    const isH = activeHoverId === p.id;
    return (
      <g 
        key={p.id} 
        onMouseEnter={()=>setHoveredId(p.id)} 
        onMouseLeave={()=>setHoveredId(null)} 
        onClick={() => onPlanetClick?.(p.id)}
        className="cursor-pointer transition-all"
      >
        <line x1={CX+r*Math.cos(a)} y1={CY+r*Math.sin(a)} x2={CX+R_TERMS_IN*Math.cos(a)} y2={CY+R_TERMS_IN*Math.sin(a)} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" opacity="0.4" />
        <circle cx={CX+r*Math.cos(a)} cy={CY+r*Math.sin(a)} r="15" fill="#0f172a" stroke={isH?"#fbbf24":"#94a3b8"} strokeWidth="1.5" />
        <text x={CX+r*Math.cos(a)} y={CY+r*Math.sin(a)} textAnchor="middle" dominantBaseline="central" fill={isH?"#fbbf24":"#94a3b8"} fontSize="18">{p.symbol}</text>
      </g>
    );
  });

  // 5.1 Lotes
  const lotsToShow = chart.lots?.filter(l => {
    if (showAllLots) return true;
    return ['fortune', 'spirit'].includes(l.id.toLowerCase());
  }) || [];

  const lotElements = lotsToShow.map(l => {
    const a = longitudeToAngle(l.longitude);
    const r = R_TICKS_IN - 65;
    const isH = activeHoverId === l.id;
    return (
      <g key={l.id} onMouseEnter={()=>setHoveredId(l.id)} onMouseLeave={()=>setHoveredId(null)} className="cursor-pointer transition-all">
        <line x1={CX+r*Math.cos(a)} y1={CY+r*Math.sin(a)} x2={CX+R_TERMS_IN*Math.cos(a)} y2={CY+R_TERMS_IN*Math.sin(a)} stroke="#94a3b8" strokeWidth="1" strokeDasharray="1,2" opacity="0.3" />
        <text x={CX+r*Math.cos(a)} y={CY+r*Math.sin(a)} textAnchor="middle" dominantBaseline="central" fill={isH ? "#fbbf24" : "#64748b"} fontSize="16" fontWeight="bold">{l.symbol}</text>
      </g>
    );
  });

  // 6. Casas (Linhas Dinâmicas)
  const currentHouses = options.houseSystem === 'whole_sign' ? chart.housesWhole : chart.housesPlacidus;
  const houseLines = currentHouses.map((h, i) => {
    const a = longitudeToAngle(h.longitude);
    const aN = longitudeToAngle(h.longitude + 15);
    const isA = [1, 4, 7, 10].includes(h.number);
    return (
      <g key={i}>
        <line x1={CX} y1={CY} x2={CX + R_TERMS_IN * Math.cos(a)} y2={CY + R_TERMS_IN * Math.sin(a)} stroke={isA ? "#fbbf24" : "#7c3aed"} strokeWidth={isA ? 2.5 : 1} opacity={isA ? 0.8 : 0.4} />
        <text x={CX + (R_ASPECTS + 25) * Math.cos(aN)} y={CY + (R_ASPECTS + 25) * Math.sin(aN)} textAnchor="middle" dominantBaseline="central" fill="#64748b" fontSize="14" fontWeight="bold">{h.number}</text>
      </g>
    );
  });

  // 7. Aspectos (On Hover e Global)
  const aspectLines = chart.aspects.map((a, i) => {
    const p1 = [...classicPlanets, ...(chart.lots || [])].find(pp=>pp.id?.toLowerCase()===a.planet1.toLowerCase()||pp.name?.toLowerCase()===a.planet1.toLowerCase());
    const p2 = [...classicPlanets, ...(chart.lots || [])].find(pp=>pp.id?.toLowerCase()===a.planet2.toLowerCase()||pp.name?.toLowerCase()===a.planet2.toLowerCase());
    if(!p1 || !p2 || a.orb > 10) return null;
    const isConn = activeHoverId === p1.id || activeHoverId === p2.id;
    if(!options.showAspects && !isConn) return null;
    let color = '#94a3b8';
    if(a.type==='trine') color='#10b981'; else if(a.type==='sextile') color='#3b82f6'; else if(a.type==='square') color='#ef4444'; else if(a.type==='opposition') color='#f97316'; else if(a.type==='conjunction') color='#fbbf24';
    const a1 = longitudeToAngle(p1.longitude), a2 = longitudeToAngle(p2.longitude);
    return <line key={i} x1={CX+R_ASPECTS*Math.cos(a1)} y1={CY+R_ASPECTS*Math.sin(a1)} x2={CX+R_ASPECTS*Math.cos(a2)} y2={CY+R_ASPECTS*Math.sin(a2)} stroke={color} strokeWidth={isConn?3:1.5} opacity={isConn?1:0.4} strokeDasharray={a.orb>6?"5,3":"none"} />;
  });

  return (
    <div className="relative w-full h-[850px] flex items-center justify-center p-8">
      <svg 
        viewBox="0 0 800 800" className="w-full h-full touch-none cursor-grab"
        onPointerDown={e=>{setIsDragging(true); setLastMousePos({x:e.clientX, y:e.clientY}); (e.target as Element).setPointerCapture(e.pointerId)}}
        onPointerMove={e=>{if(!isDragging)return; setPan((p: {x:number, y:number})=>({x:p.x+e.clientX-lastMousePos.x, y:p.y+e.clientY-lastMousePos.y})); setLastMousePos({x:e.clientX, y:e.clientY})}}
        onPointerUp={()=>setIsDragging(false)}
        onWheel={e=>{const d=e.deltaY>0?0.9:1.1; setZoom((z: number)=>Math.min(Math.max(z*d,0.5),4))}}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} className="origin-[0_0]">
          <circle cx={CX} cy={CY} r={R_TOTAL} fill="#0f172a" stroke="#7c3aed" strokeWidth="2" />
          {zodiacRings}
          {faceRings}
          {termRings}
          {degreeTicks}
          <circle cx={CX} cy={CY} r={R_ASPECTS} fill="#020617" stroke="#475569" strokeWidth="2" />
          {houseLines}
          {aspectLines}
          {planetElements}
          {lotElements}
        </g>
      </svg>
      {/* Botão de Menu Simplificado */}
      <button 
        title="Configurações do Mapa"
        aria-label="Configurações do Mapa"
        onClick={()=>handleOptionChange('showSettings', !options.showSettings)} 
        className="absolute right-10 top-10 p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all shadow-xl"
      >
        ⚙️
      </button>

      {/* Painel de Configurações Lateral (Condicional) */}
      {options.showSettings && (
        <div className="absolute right-12 top-24 w-64 bg-slate-900/90 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-right-4">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">Configurações do Mapa</h4>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Sistema de Casas</label>
              <select 
                title="Escolha o sistema de casas"
                value={options.houseSystem}
                onChange={(e) => handleOptionChange('houseSystem', e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm text-white"
              >
                <option value="whole_sign">Signos Inteiros</option>
                <option value="placidus">Placidus</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Mostrar Aspectos</span>
              <button 
                title="Alternar visibilidade de aspectos"
                aria-label="Alternar visibilidade de aspectos"
                onClick={() => handleOptionChange('showAspects', !options.showAspects)}
                className={`w-10 h-5 rounded-full transition-all ${options.showAspects ? 'bg-purple-600' : 'bg-slate-700'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full transition-all ${options.showAspects ? 'translate-x-5.5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NatalChart, PlanetPosition } from '@/types';
import { ZODIAC_SIGNS, PLANETS } from '@/types';
import { getElementColor, getDignity } from '@/lib/astrology';

interface TransitWheelProps {
  natalChart: NatalChart;
  transitChart: NatalChart;
  onChartReady?: (svgElement: SVGSVGElement | null) => void;
}

export default function TransitWheel({ natalChart, transitChart, onChartReady }: TransitWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Interactions
  const [hoveredPlanet, setHoveredPlanet] = useState<{name: string, isTransit: boolean} | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<{name: string, isTransit: boolean} | null>(null);
  const [showAspects, setShowAspects] = useState(true);
  
  // Pan & Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    const scaleAmount = -e.deltaY * 0.001;
    let newZoom = zoom * (1 + scaleAmount);
    newZoom = Math.max(0.5, Math.min(newZoom, 5));
    setZoom(newZoom);
  };

  useEffect(() => {
    if (svgRef.current && onChartReady) {
      onChartReady(svgRef.current);
    }
  }, [onChartReady, natalChart, transitChart]);

  // Constantes de Raios e ViewBox (800x800)
  const CX = 400;
  const CY = 400;
  const R_TRANSIT_OUTER = 380;
  const R_TRANSIT_INNER = 340;
  const R_ZODIAC_OUTER = 330;
  const R_ZODIAC_INNER = 280;
  const R_TICK_INNER = 270;
  const R_NATAL_OUTER = 250;
  const R_ASPECTS = 160;

  // Ancoragem do Ascendente Natal
  const ascendantLongitude = natalChart.housesPlacidus.find(h => h.number === 1)?.longitude || 0;

  const longitudeToAngle = (longitude: number): number => {
    // 180 (Esquerda) = Ascendente, roda anti-horária
    return (180 - (longitude - ascendantLongitude)) * (Math.PI / 180);
  };

  // Zodíaco do mapa natal em anel Anular
  const zodiacSlices = ZODIAC_SIGNS.map((sign) => {
    const startAngle = longitudeToAngle(sign.start);
    const endAngle = longitudeToAngle(sign.start + 30);
    
    // Zodíaco Ring
    const x1_out = CX + R_ZODIAC_OUTER * Math.cos(startAngle);
    const y1_out = CY + R_ZODIAC_OUTER * Math.sin(startAngle);
    const x2_out = CX + R_ZODIAC_OUTER * Math.cos(endAngle);
    const y2_out = CY + R_ZODIAC_OUTER * Math.sin(endAngle);
    
    const x1_in = CX + R_ZODIAC_INNER * Math.cos(startAngle);
    const y1_in = CY + R_ZODIAC_INNER * Math.sin(startAngle);
    const x2_in = CX + R_ZODIAC_INNER * Math.cos(endAngle);
    const y2_in = CY + R_ZODIAC_INNER * Math.sin(endAngle);

    // Fundo do trilho de trânsitos (Anel de Trânsitos)
    const tx1_out = CX + R_TRANSIT_OUTER * Math.cos(startAngle);
    const ty1_out = CY + R_TRANSIT_OUTER * Math.sin(startAngle);
    const tx2_out = CX + R_TRANSIT_OUTER * Math.cos(endAngle);
    const ty2_out = CY + R_TRANSIT_OUTER * Math.sin(endAngle);
    const tx1_in = CX + R_TRANSIT_INNER * Math.cos(startAngle);
    const ty1_in = CY + R_TRANSIT_INNER * Math.sin(startAngle);
    const tx2_in = CX + R_TRANSIT_INNER * Math.cos(endAngle);
    const ty2_in = CY + R_TRANSIT_INNER * Math.sin(endAngle);

    const midAngle = (startAngle + endAngle) / 2;
    const rMid = (R_ZODIAC_OUTER + R_ZODIAC_INNER) / 2;

    return (
      <g key={sign.name}>
        {/* Zodiac Slice */}
        <path
          d={`M ${x1_out} ${y1_out} A ${R_ZODIAC_OUTER} ${R_ZODIAC_OUTER} 0 0 0 ${x2_out} ${y2_out} L ${x2_in} ${y2_in} A ${R_ZODIAC_INNER} ${R_ZODIAC_INNER} 0 0 1 ${x1_in} ${y1_in} Z`}
          fill={`${getElementColor(sign.element)}15`}
          stroke={getElementColor(sign.element)}
          strokeWidth="1.5"
        />
        <text
          x={CX + rMid * Math.cos(midAngle)}
          y={CY + rMid * Math.sin(midAngle)}
          textAnchor="middle"
          dominantBaseline="central"
          fill={getElementColor(sign.element)}
          fontSize="20"
          fontWeight="bold"
          className="select-none"
        >
          {sign.symbol}
        </text>

        {/* Trilho Externo p/ Trânsitos */}
        <path
          d={`M ${tx1_out} ${ty1_out} A ${R_TRANSIT_OUTER} ${R_TRANSIT_OUTER} 0 0 0 ${tx2_out} ${ty2_out} L ${tx2_in} ${ty2_in} A ${R_TRANSIT_INNER} ${R_TRANSIT_INNER} 0 0 1 ${tx1_in} ${ty1_in} Z`}
          fill={`${getElementColor(sign.element)}08`}
          stroke={getElementColor(sign.element)}
          strokeWidth="0.5"
          strokeDasharray="2,2"
          opacity="0.5"
        />
      </g>
    );
  });

  // Ticks Internos (Régua)
  const degreeTicks = [];
  for (let i = 0; i < 360; i++) {
    const angle = longitudeToAngle(i);
    const is10 = i % 10 === 0;
    const is5 = i % 5 === 0;
    const tickLen = is10 ? 10 : is5 ? 6 : 3;
    const r2 = R_ZODIAC_INNER - tickLen;
    degreeTicks.push(
      <line 
        key={`tick-${i}`}
        x1={CX + R_ZODIAC_INNER * Math.cos(angle)}
        y1={CY + R_ZODIAC_INNER * Math.sin(angle)}
        x2={CX + r2 * Math.cos(angle)}
        y2={CY + r2 * Math.sin(angle)}
        stroke={is10 ? '#cbd5e1' : '#64748b'}
        strokeWidth={is10 ? 1.5 : 1}
      />
    );
  }

  // Linhas das casas Natais
  const houseLines = natalChart.housesPlacidus.map((house) => {
    const angle = longitudeToAngle(house.longitude);
    const xIn = CX + R_ASPECTS * Math.cos(angle);
    const yIn = CY + R_ASPECTS * Math.sin(angle);
    const xOut = CX + R_TICK_INNER * Math.cos(angle);
    const yOut = CY + R_TICK_INNER * Math.sin(angle);
    
    const isAsc = house.number === 1;
    const isDsc = house.number === 7;
    const isMC = house.number === 10;
    const isIC = house.number === 4;
    const isCardinal = isAsc || isDsc || isMC || isIC;

    // Números das casas
    const numAngle = angle - (4 * (Math.PI / 180)); 
    const rNum = R_ASPECTS + 15;
    const numX = CX + rNum * Math.cos(numAngle);
    const numY = CY + rNum * Math.sin(numAngle);

    return (
      <g key={`house-${house.number}`}>
        <line
          x1={isCardinal ? CX : xIn}
          y1={isCardinal ? CY : yIn}
          x2={isCardinal ? CX + R_ZODIAC_INNER * Math.cos(angle) : xOut}
          y2={isCardinal ? CY + R_ZODIAC_INNER * Math.sin(angle) : yOut}
          stroke={isAsc || isDsc ? '#fbbf24' : isMC || isIC ? '#22c55e' : '#7c3aed'}
          strokeWidth={isCardinal ? 3 : 1.5}
          opacity={isCardinal ? 1 : 0.6}
        />
        <text
          x={numX} y={numY}
          textAnchor="middle" dominantBaseline="central"
          fill={isCardinal ? '#e2e8f0' : '#94a3b8'}
          fontSize="14" fontWeight={isCardinal ? 'bold' : 'normal'}
        >
          {house.number}
        </text>
      </g>
    );
  });

  const plotPlanets = (planets: PlanetPosition[], isTransit: boolean) => {
    const startRadius = isTransit ? R_TRANSIT_OUTER - 15 : R_NATAL_OUTER;
    const positions: { p: PlanetPosition; x: number; y: number; angle: number }[] = [];
    
    planets.forEach(planet => {
      const angle = longitudeToAngle(planet.longitude);
      let currentR = startRadius;
      let overlap = true;
      let attempts = 0;
      
      while (overlap && attempts < 8) {
        overlap = false;
        const x = CX + currentR * Math.cos(angle);
        const y = CY + currentR * Math.sin(angle);
        for (const pos of positions) {
          const dist = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
          if (dist < 22) {
            overlap = true;
            // Se transit, empurra mais pra fora? Trânsitos têm faixa fina.
            // Se natal, empurra pra dentro.
            currentR += isTransit ? -15 : -15; 
            break;
          }
        }
        attempts++;
      }
      positions.push({ p: planet, angle, x: CX + currentR * Math.cos(angle), y: CY + currentR * Math.sin(angle) });
    });

    return positions.map(({ p, x, y, angle }) => {
      const isHovered = hoveredPlanet?.name === p.name && hoveredPlanet?.isTransit === isTransit;
      const isSelected = selectedPlanet?.name === p.name && selectedPlanet?.isTransit === isTransit;
      const focus = isHovered || isSelected;
      const info = PLANETS.find(pl => pl.name === p.name);
      const color = isTransit ? '#10b981' : '#fbbf24'; // Verde limão p/ trânsito, Amarelo p/ natal
      
      // Ponteiro: de onde na régua ele é "fisgado"?
      // Se Trânsito: da borda externa do Zodiaco.
      // Se Natal: da borda interna (Ticks).
      const tickAnchorR = isTransit ? R_ZODIAC_OUTER : R_TICK_INNER;
      const tickX = CX + tickAnchorR * Math.cos(angle);
      const tickY = CY + tickAnchorR * Math.sin(angle);

      // Linha âncora para os aspectos (só natal)
      const aspectX = CX + R_ASPECTS * Math.cos(angle);
      const aspectY = CY + R_ASPECTS * Math.sin(angle);

      return (
        <g
          key={`${isTransit ? 't' : 'n'}-${p.name}`}
          className="cursor-pointer"
          onMouseEnter={() => setHoveredPlanet({ name: p.name, isTransit })}
          onMouseLeave={() => setHoveredPlanet(null)}
          onClick={() => setSelectedPlanet(isSelected ? null : { name: p.name, isTransit })}
        >
          {/* Fio de guia métrico */}
          <line x1={x} y1={y} x2={tickX} y2={tickY} stroke={color} strokeWidth="1" strokeDasharray="2,2" opacity={isTransit ? "0.8" : "0.5"} />
          
          {/* Linha Aspecto (só natal desce até o core) */}
          {!isTransit && (
            <line x1={x} y1={y} x2={aspectX} y2={aspectY} stroke="#475569" strokeWidth="0.5" opacity="0.3" />
          )}

          <g transform={`translate(${x}, ${y})`}>
            {focus && <circle r="20" fill="none" stroke={color} strokeWidth="2" opacity="0.6" />}
            <circle r={focus ? 15 : 12} fill="#0f172a" stroke={p.retrograde ? '#ef4444' : color} strokeWidth={focus ? 3 : 2} className="transition-all duration-200" />
            <text textAnchor="middle" dominantBaseline="central" fill={color} fontSize="14" fontWeight="bold" className="select-none">
              {info?.symbol || '●'}
            </text>
            
            {p.retrograde && (
              <text x="8" y="-8" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">R</text>
            )}
          </g>
        </g>
      );
    });
  };

  // Encontrar o planeta em foco (Natal ou Trânsito) para o Tooltip
  const allPlanetPositions = [
    ...natalChart.planets.map(p => ({ p, isTransit: false, startRadius: R_NATAL_OUTER })),
    ...transitChart.planets.map(p => ({ p, isTransit: true, startRadius: R_TRANSIT_OUTER - 15 }))
  ];

  // Logic to find the focused one again for the top-level tooltip
  const getFocusedTooltip = () => {
    const focus = hoveredPlanet || selectedPlanet;
    if (!focus) return null;
    const isTransit = focus.isTransit;
    const name = focus.name;
    
    // We need to recalculate the position (x, y) exactly as plotPlanets does
    // This is a bit redundant but ensures the tooltip is at the right place
    const isNatal = !isTransit;
    const planetsToCalc = isNatal ? natalChart.planets : transitChart.planets;
    const startRadius = isNatal ? R_NATAL_OUTER : R_TRANSIT_OUTER - 15;
    
    // Simple position find logic (ideally we store these in state or ref, but for now we follow the math)
    const positions: { p: PlanetPosition; x: number; y: number }[] = [];
    planetsToCalc.forEach(planet => {
      const angle = longitudeToAngle(planet.longitude);
      let currentR = startRadius;
      let overlap = true;
      let attempts = 0;
      while (overlap && attempts < 8) {
        overlap = false;
        const x = CX + currentR * Math.cos(angle);
        const y = CY + currentR * Math.sin(angle);
        for (const pos of positions) {
          const dist = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
          if (dist < 22) { overlap = true; currentR -= 15; break; }
        }
        attempts++;
      }
      positions.push({ p: planet, x: CX + currentR * Math.cos(angle), y: CY + currentR * Math.sin(angle) });
    });

    const focused = positions.find(pos => pos.p.name === name);
    if (!focused) return null;

    const color = isTransit ? '#10b981' : '#fbbf24';
    
    return (
      <g transform={`translate(${focused.x}, ${focused.y})`} className="pointer-events-none">
         <g transform={`translate(${focused.x > CX ? -190 : 20}, -50)`}>
          <rect width="180" height="90" rx="6" fill="#0f172a" stroke={color} strokeWidth="1" />
          <text x="90" y="20" textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="bold">
            {focused.p.name} {isTransit ? '(Transitando)' : '(Natal)'}
          </text>
          <text x="90" y="40" textAnchor="middle" fill="#94a3b8" fontSize="12">
            {focused.p.sign} {Math.floor(focused.p.degree)}°{Math.floor((focused.p.degree % 1) * 60)}'
          </text>
          <text x="90" y="58" textAnchor="middle" fill="#94a3b8" fontSize="12">
            Casa {focused.p.house} • {getDignity(focused.p.name, focused.p.sign)}
          </text>
          <text x="90" y="75" textAnchor="middle" fill={focused.p.retrograde ? '#ef4444' : '#94a3b8'} fontSize="11">
            {focused.p.speed > 0 ? `Rapidez: ${focused.p.speed.toFixed(2)}°/d` : ''} {focused.p.retrograde ? '(Retrógrado)' : ''}
          </text>
        </g>
      </g>
    );
  };

  return (
    <div ref={containerRef} className="w-full aspect-square max-w-[800px] mx-auto bg-[#020617] rounded-3xl p-4 shadow-2xl border border-slate-800">
      <svg
        ref={svgRef} viewBox="0 0 800 800"
        className="w-full h-full touch-none cursor-grab active:cursor-grabbing font-sans"
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onWheel={handleWheel}
      >
        <g style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} className="origin-center">
          
          <circle cx={CX} cy={CY} r={R_TRANSIT_OUTER} fill="#0f172a" />
          
          {zodiacSlices}
          
          {/* Bordas e Réguas Extras */}
          <circle cx={CX} cy={CY} r={R_ZODIAC_OUTER} fill="none" stroke="#7c3aed" strokeWidth="2" />
          <circle cx={CX} cy={CY} r={R_ZODIAC_INNER} fill="none" stroke="#7c3aed" strokeWidth="1.5" />
          <circle cx={CX} cy={CY} r={R_TICK_INNER} fill="none" stroke="#334155" strokeWidth="1" />
          {degreeTicks}

          <circle cx={CX} cy={CY} r={R_ASPECTS} fill="#020617" stroke="#475569" strokeWidth="2" />
          
          {houseLines}
          
          {plotPlanets(natalChart.planets, false)}
          {plotPlanets(transitChart.planets, true)}
          {getFocusedTooltip()}
          
          <circle cx={CX} cy={CY} r="12" fill="none" stroke="#64748b" strokeWidth="2" />
          <line x1={CX - 8} y1={CY} x2={CX + 8} y2={CY} stroke="#64748b" strokeWidth="2" />
          <line x1={CX} y1={CY - 8} x2={CX} y2={CY + 8} stroke="#64748b" strokeWidth="2" />
        </g>
      </svg>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-full">
          Resetar Visão
        </button>
        <div className="flex gap-4 text-xs font-medium text-slate-300 bg-slate-800/50 px-4 py-2 rounded-xl">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-yellow-400 rounded-full"></span> Planetas Natais</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Planetas Transitando</span>
        </div>
      </div>
    </div>
  );
}

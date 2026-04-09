import React, { useState, useEffect, useRef } from 'react';
import { NatalChart, PlanetPosition } from '@/types';
import { ZODIAC_SIGNS, PLANETS } from '@/types';
import { getElementColor, getDignity } from '@/lib/astrology';

interface AstroChartProps {
  chart: NatalChart;
  onChartReady?: (svgElement: SVGSVGElement | null) => void;
}

export default function AstroChart({ chart, onChartReady }: AstroChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [showAspects, setShowAspects] = useState(true);

  // Zoom and Pan states
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

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    const scaleAmount = -e.deltaY * 0.001;
    let newZoom = zoom * (1 + scaleAmount);
    newZoom = Math.max(0.5, Math.min(newZoom, 5));
    setZoom(newZoom);
  };

  // Notify parent when chart is ready
  useEffect(() => {
    if (svgRef.current && onChartReady) {
      onChartReady(svgRef.current);
    }
  }, [onChartReady, chart]);

  // Constants for 800x800 viewBox
  const CX = 400;
  const CY = 400;
  const R_OUTER = 380;
  const R_ZODIAC_INNER = 330;
  const R_TICK_INNER = 320;
  const R_PLANETS_OUTER = 300;
  const R_PLANETS_INNER = 250;
  const R_ASPECTS = 210;

  // Ascendant is anchor (9 o'clock / 180 degrees)
  const ascendantLongitude = chart.housesPlacidus.find(h => h.number === 1)?.longitude || 0;

  const longitudeToAngle = (longitude: number): number => {
    // 180 at left, decreasing angle moves UP and RIGHT (Counter-Clockwise in standard rect, where +y is down)
    return (180 - (longitude - ascendantLongitude)) * (Math.PI / 180);
  };

  // Gerar fatias do zodíaco (Annular Arcs)
  const zodiacSlices = ZODIAC_SIGNS.map((sign) => {
    const startAngle = longitudeToAngle(sign.start);
    const endAngle = longitudeToAngle(sign.start + 30);
    
    const x1_out = CX + R_OUTER * Math.cos(startAngle);
    const y1_out = CY + R_OUTER * Math.sin(startAngle);
    const x2_out = CX + R_OUTER * Math.cos(endAngle);
    const y2_out = CY + R_OUTER * Math.sin(endAngle);
    
    const x1_in = CX + R_ZODIAC_INNER * Math.cos(startAngle);
    const y1_in = CY + R_ZODIAC_INNER * Math.sin(startAngle);
    const x2_in = CX + R_ZODIAC_INNER * Math.cos(endAngle);
    const y2_in = CY + R_ZODIAC_INNER * Math.sin(endAngle);

    // Midpoint para o ícone
    const midAngle = (startAngle + endAngle) / 2;
    const rMid = (R_OUTER + R_ZODIAC_INNER) / 2;
    const iconX = CX + rMid * Math.cos(midAngle);
    const iconY = CY + rMid * Math.sin(midAngle);

    return (
      <g key={sign.name}>
        <path
          d={`M ${x1_out} ${y1_out} A ${R_OUTER} ${R_OUTER} 0 0 0 ${x2_out} ${y2_out} L ${x2_in} ${y2_in} A ${R_ZODIAC_INNER} ${R_ZODIAC_INNER} 0 0 1 ${x1_in} ${y1_in} Z`}
          fill={`${getElementColor(sign.element)}15`}
          stroke={getElementColor(sign.element)}
          strokeWidth="1.5"
        />
        <text
          x={iconX}
          y={iconY}
          textAnchor="middle"
          dominantBaseline="central"
          fill={getElementColor(sign.element)}
          fontSize="24"
          fontWeight="bold"
          className="select-none"
        >
          {sign.symbol}
        </text>
      </g>
    );
  });

  // Ticks rings
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

  // Linhas das casas e Números
  const houseElements = chart.housesPlacidus.map((house) => {
    const angle = longitudeToAngle(house.longitude);
    
    // As linhas de casa vão da borda da Roda Aspectos até a borda de Ticks
    const xIn = CX + R_ASPECTS * Math.cos(angle);
    const yIn = CY + R_ASPECTS * Math.sin(angle);
    const xOut = CX + R_TICK_INNER * Math.cos(angle);
    const yOut = CY + R_TICK_INNER * Math.sin(angle);

    const isAsc = house.number === 1;
    const isDsc = house.number === 7;
    const isMC = house.number === 10;
    const isIC = house.number === 4;
    const isCardinal = isAsc || isDsc || isMC || isIC;

    // Números das casas colocados adjacentes à linha da casa
    const numAngle = angle - (4 * (Math.PI / 180)); 
    const rNum = R_ASPECTS + 20;
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
          x={numX}
          y={numY}
          textAnchor="middle"
          dominantBaseline="central"
          fill={isCardinal ? '#e2e8f0' : '#94a3b8'}
          fontSize="16"
          fontWeight={isCardinal ? 'bold' : 'normal'}
        >
          {house.number}
        </text>
      </g>
    );
  });

  // Planetas e seus ponteiros
  const planetPositions: { planet: PlanetPosition; x: number; y: number; angle: number }[] = [];
  
  chart.planets.forEach((planet) => {
    const angle = longitudeToAngle(planet.longitude);
    
    let currentR = R_PLANETS_OUTER;
    let overlap = true;
    let attempts = 0;
    
    while (overlap && attempts < 8) {
      overlap = false;
      const x = CX + currentR * Math.cos(angle);
      const y = CY + currentR * Math.sin(angle);
      
      for (const pos of planetPositions) {
        const dx = pos.x - x;
        const dy = pos.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 26) {
          overlap = true;
          currentR -= 16;
          break; // Try smaller radius
        }
      }
      attempts++;
    }
    
    planetPositions.push({ 
      planet, 
      angle,
      x: CX + currentR * Math.cos(angle), 
      y: CY + currentR * Math.sin(angle) 
    });
  });

  const planetElements = planetPositions.map(({ planet, x, y, angle }) => {
    const isHovered = hoveredPlanet === planet.name;
    const isSelected = selectedPlanet === planet.name;
    const isFocused = isHovered || isSelected;
    const planetInfo = PLANETS.find(p => p.name === planet.name);
    
    const tickX = CX + R_TICK_INNER * Math.cos(angle);
    const tickY = CY + R_TICK_INNER * Math.sin(angle);

    const aspectX = CX + R_ASPECTS * Math.cos(angle);
    const aspectY = CY + R_ASPECTS * Math.sin(angle);

    return (
      <g key={planet.name}
         onMouseEnter={() => setHoveredPlanet(planet.name)}
         onMouseLeave={() => setHoveredPlanet(null)}
         onClick={() => setSelectedPlanet(selectedPlanet === planet.name ? null : planet.name)}
         className="cursor-pointer"
      >
        {/* Linha ponteiro do planeta para a régua */}
        <line x1={x} y1={y} x2={tickX} y2={tickY} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
        
        {/* Linha sutil do planeta para o núcleo de aspectos */}
        <line x1={x} y1={y} x2={aspectX} y2={aspectY} stroke="#475569" strokeWidth="0.5" opacity="0.3" />

        <g transform={`translate(${x}, ${y})`}>
          {isFocused && <circle r="22" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.7" />}
          <circle r={isFocused ? 16 : 14} fill="#0f172a" stroke={planet.retrograde ? '#ef4444' : '#fbbf24'} strokeWidth={isFocused ? 3 : 2} className="transition-all duration-200" />
          <text textAnchor="middle" dominantBaseline="central" fill="#fbbf24" fontSize="18" fontWeight="bold" className="select-none">
            {planetInfo?.symbol || '●'}
          </text>
          
          {planet.retrograde && (
            <text x="10" y="-10" textAnchor="middle" dominantBaseline="central" fill="#ef4444" fontSize="12" fontWeight="bold">R</text>
          )}

        </g>
      </g>
    );
  });

  // Encontrar planeta em foco para o Tooltip (renderizado por último para ficar em cima)
  const focusedPlanetPos = planetPositions.find(p => (hoveredPlanet === p.planet.name || selectedPlanet === p.planet.name) && (hoveredPlanet === p.planet.name ? !selectedPlanet : true));
  const tooltipElement = focusedPlanetPos && (
    <g transform={`translate(${focusedPlanetPos.x}, ${focusedPlanetPos.y})`}>
      <g transform={`translate(${focusedPlanetPos.x > CX ? -190 : 20}, -60)`} style={{ pointerEvents: 'none' }}>
        <rect width="180" height="90" rx="6" fill="#0f172a" stroke="#7c3aed" strokeWidth="1" />
        <text x="90" y="20" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="bold">{focusedPlanetPos.planet.name}</text>
        <text x="90" y="40" textAnchor="middle" fill="#94a3b8" fontSize="12">{focusedPlanetPos.planet.sign} {Math.floor(focusedPlanetPos.planet.degree)}°{Math.floor((focusedPlanetPos.planet.degree % 1) * 60)}'</text>
        <text x="90" y="58" textAnchor="middle" fill="#94a3b8" fontSize="12">Casa {focusedPlanetPos.planet.house} • {getDignity(focusedPlanetPos.planet.name, focusedPlanetPos.planet.sign)}</text>
        <text x="90" y="75" textAnchor="middle" fill="#94a3b8" fontSize="11">{focusedPlanetPos.planet.speed > 0 ? `Rapidez: ${focusedPlanetPos.planet.speed.toFixed(2)}°/d` : ''} {focusedPlanetPos.planet.retrograde ? '(Retrógrado)' : ''}</text>
      </g>
    </g>
  );

  const filteredAspects = chart.aspects.filter(aspect => {
    if (!hoveredPlanet && !selectedPlanet) return true;
    const focus = selectedPlanet || hoveredPlanet;
    return aspect.planet1 === focus || aspect.planet2 === focus;
  });

  const aspectLines = showAspects ? filteredAspects.slice(0, 15).map((aspect, index) => {
    const p1 = planetPositions.find(pp => pp.planet.name === aspect.planet1);
    const p2 = planetPositions.find(pp => pp.planet.name === aspect.planet2);
    
    if (!p1 || !p2) return null;

    const isFocused = hoveredPlanet || selectedPlanet;

    let strokeColor = '#64748b';
    let strokeWidth = isFocused ? 2 : 1;
    switch (aspect.type) {
      case 'conjunction':
        strokeColor = '#fbbf24';
        break; 
      case 'trine':
        strokeColor = '#3b82f6'; 
        break;
      case 'square':
        strokeColor = '#ef4444'; 
        break;
      case 'opposition':
        strokeColor = '#ef4444'; 
        strokeWidth = isFocused ? 2.5 : 1.5;
        break;
      case 'sextile':
        strokeColor = '#3b82f6'; 
        break;
    }

    const x1 = CX + R_ASPECTS * Math.cos(p1.angle);
    const y1 = CY + R_ASPECTS * Math.sin(p1.angle);
    const x2 = CX + R_ASPECTS * Math.cos(p2.angle);
    const y2 = CY + R_ASPECTS * Math.sin(p2.angle);

    return (
      <line
        key={`${aspect.planet1}-${aspect.planet2}-${index}`}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={isFocused ? 0.9 : 0.4}
      />
    );
  }) : [];

  return (
    <div ref={containerRef} className="w-full aspect-square max-w-[800px] mx-auto bg-[#020617] rounded-3xl p-4 shadow-2xl border border-slate-800">
      <svg
        ref={svgRef}
        viewBox="0 0 800 800"
        className="w-full h-full touch-none cursor-grab active:cursor-grabbing font-sans"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <g style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center' }}>
          
          <circle cx={CX} cy={CY} r={R_OUTER} fill="#0f172a" />
          <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#7c3aed" strokeWidth="2" />
          <circle cx={CX} cy={CY} r={R_ZODIAC_INNER} fill="none" stroke="#7c3aed" strokeWidth="1.5" />
          
          {zodiacSlices}
          
          <circle cx={CX} cy={CY} r={R_TICK_INNER} fill="none" stroke="#334155" strokeWidth="1" />
          {degreeTicks}

          <circle cx={CX} cy={CY} r={R_ASPECTS} fill="#020617" stroke="#475569" strokeWidth="2" />
          
          {houseElements}
          {aspectLines}
          {planetElements}
          
          <circle cx={CX} cy={CY} r="12" fill="none" stroke="#64748b" strokeWidth="2" />
          <line x1={CX - 8} y1={CY} x2={CX + 8} y2={CY} stroke="#64748b" strokeWidth="2" />
          <line x1={CX} y1={CY - 8} x2={CX} y2={CY + 8} stroke="#64748b" strokeWidth="2" />
        </g>
      </svg>

      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showAspects}
              onChange={(e) => setShowAspects(e.target.checked)}
              className="w-4 h-4 rounded border-purple-500/30 bg-slate-900 text-purple-600 focus:ring-purple-500/50"
            />
            Mostrar aspectos
          </label>
          
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-full">
            Resetar Visão
          </button>
          
          {selectedPlanet && (
            <button onClick={() => setSelectedPlanet(null)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-3 py-1.5 rounded-full">
              Limpar foco ({selectedPlanet})
            </button>
          )}
        </div>

        {showAspects && (
          <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-300 bg-slate-800/50 px-4 py-2 rounded-xl">
            <span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-yellow-400"></span>Conjunção</span>
            <span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-blue-500"></span>Trígono / Sextil</span>
            <span className="flex items-center gap-2"><span className="w-4 h-0.5 bg-red-500"></span>Quadratura / Oposição</span>
          </div>
        )}
      </div>
    </div>
  );
}
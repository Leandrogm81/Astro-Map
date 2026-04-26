import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { NatalChart, PlanetPosition } from '@/types';
import { ZODIAC_SIGNS, PLANETS } from '@/types';
import { getElementColor, getDignity } from '@/lib/astrology';
import { normalizePlanetKey, planetLabelPtBr, PlanetId } from '@/lib/planetNaming';

interface AstroChartProps {
  chart: NatalChart;
  onChartReady?: (svgElement: SVGSVGElement | null) => void;
  variant?: 'default' | 'minimal';
}

export default function AstroChart({ chart, onChartReady, variant = 'default' }: AstroChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const chartGroupRef = useRef<SVGGElement>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [showAspects, setShowAspects] = useState(true);
  const isMinimal = variant === 'minimal';

  // Zoom and Pan states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const getLocalCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: clientX, y: clientY };
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const transformed = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const pointers = useRef<Map<number, { x: number, y: number }>>(new Map());
  const initialDist = useRef<number>(0);
  const initialZoom = useRef<number>(1);
  const initialPan = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const initialMid = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.target instanceof Element) {
      e.target.setPointerCapture(e.pointerId);
    }
    const clientPos = { x: e.clientX, y: e.clientY };
    const localPos = getLocalCoords(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, clientPos);

    if (pointers.current.size === 1) {
      setIsDragging(true);
      setDragStart({ x: localPos.x - pan.x, y: localPos.y - pan.y });
    } else if (pointers.current.size === 2) {
      setIsDragging(false);
      const pts = Array.from(pointers.current.values());
      const midClient = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const midLocal = getLocalCoords(midClient.x, midClient.y);
      
      initialDist.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      initialZoom.current = zoom;
      initialPan.current = { ...pan };
      initialMid.current = midLocal;
    }
  };


  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const clientPos = { x: e.clientX, y: e.clientY };
    const localPos = getLocalCoords(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, clientPos);

    if (pointers.current.size === 1 && isDragging) {
      const newPan = { x: localPos.x - dragStart.x, y: localPos.y - dragStart.y };
      setPan(newPan);
    } else if (pointers.current.size === 2 && initialDist.current > 0) {
      const pts = Array.from(pointers.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      
      const midClient = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const currentMid = getLocalCoords(midClient.x, midClient.y);

      const scale = currentDist / initialDist.current;
      const newZoom = Math.max(0.7, Math.min(initialZoom.current * scale, 5));
      
      const newPan = {
        x: currentMid.x - (initialMid.current.x - initialPan.current.x) * (newZoom / initialZoom.current),
        y: currentMid.y - (initialMid.current.y - initialPan.current.y) * (newZoom / initialZoom.current)
      };

      setZoom(newZoom);
      setPan(newPan);
    }
  };


  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    
    if (pointers.current.size === 0) {
      setIsDragging(false);
    } else if (pointers.current.size === 1) {
      const remaining = Array.from(pointers.current.values())[0];
      const localPos = getLocalCoords(remaining.x, remaining.y);
      setDragStart({ x: localPos.x - pan.x, y: localPos.y - pan.y });
      setIsDragging(true);
    }
  };


  useEffect(() => {
    if (chartGroupRef.current) {
      // Removed direct transform sync to use React state + transform-origin for predictability
    }
  }, [pan, zoom]);

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
    const isHovered = hoveredPlanet === planet.id;
    const isSelected = selectedPlanet === planet.id;
    const isFocused = isHovered || isSelected;
    const planetInfo = PLANETS.find(p => p.id === planet.id);
    
    const tickX = CX + R_TICK_INNER * Math.cos(angle);
    const tickY = CY + R_TICK_INNER * Math.sin(angle);

    const aspectX = CX + R_ASPECTS * Math.cos(angle);
    const aspectY = CY + R_ASPECTS * Math.sin(angle);

    return (
      <g key={planet.name}
        onMouseEnter={() => setHoveredPlanet(normalizePlanetKey(planet.name))}
          onMouseLeave={() => setHoveredPlanet(null)}
          onClick={() => {
            const normalized = normalizePlanetKey(planet.name);
            setSelectedPlanet(selectedPlanet === normalized ? null : normalized);
          }}
         className="cursor-pointer"
      >
        {/* Linha ponteiro do planeta para a régua */}
        <line x1={x} y1={y} x2={tickX} y2={tickY} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
        
        {/* Linha sutil do planeta para o núcleo de aspectos */}
        <line x1={x} y1={y} x2={aspectX} y2={aspectY} stroke="#475569" strokeWidth="0.5" opacity="0.3" />

        <g transform={`translate(${x}, ${y})`}>
          {isFocused && <circle r="22" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.7" />}
          <circle r={isFocused ? 16 : 14} fill="#0f172a" stroke={planet.retrograde ? '#ef4444' : '#fbbf24'} strokeWidth={isFocused ? 3 : 2} className="transition-all duration-200" />
          <text 
            textAnchor="middle" 
            dominantBaseline="central" 
            fill="#fbbf24" 
            stroke="#fbbf24"
            strokeWidth={['Marte', 'Vênus'].includes(planet.name) ? "0.6" : "0.1"}
            fontSize="18" 
            fontWeight={['Marte', 'Vênus'].includes(planet.name) ? "bold" : "normal"}
            className="select-none"
          >
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
  const focusedPlanetPos = planetPositions.find(p => (hoveredPlanet === p.planet.id || selectedPlanet === p.planet.id) && (hoveredPlanet === p.planet.id ? !selectedPlanet : true));
  const tooltipElement = focusedPlanetPos && (
    <g transform={`translate(${focusedPlanetPos.x}, ${focusedPlanetPos.y})`}>
      <g transform={`translate(${focusedPlanetPos.x > CX ? -190 : 20}, -60)`} className="pointer-events-none">
        <rect width="180" height="90" rx="6" fill="#0f172a" stroke="#7c3aed" strokeWidth="1" />
        <text x="90" y="20" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="bold">{planetLabelPtBr(planetPositions.find(p => p.planet.id === hoveredPlanet || p.planet.id === selectedPlanet)?.planet.id as PlanetId || 'sun')}</text>
        <text x="90" y="40" textAnchor="middle" fill="#94a3b8" fontSize="12">{focusedPlanetPos.planet.sign} {Math.floor(focusedPlanetPos.planet.degree)}°{Math.floor((focusedPlanetPos.planet.degree % 1) * 60)}&apos;</text>
        <text x="90" y="58" textAnchor="middle" fill="#94a3b8" fontSize="12">Casa {focusedPlanetPos.planet.house} • {getDignity(normalizePlanetKey(focusedPlanetPos.planet.name) || 'sun', focusedPlanetPos.planet.sign)}</text>
        <text x="90" y="75" textAnchor="middle" fill="#94a3b8" fontSize="11">{focusedPlanetPos.planet.speed > 0 ? `Rapidez: ${focusedPlanetPos.planet.speed.toFixed(2)}°/d` : ''} {focusedPlanetPos.planet.retrograde ? '(Retrógrado)' : ''}</text>
      </g>
    </g>
  );

  chart.aspects.filter(aspect => {
    if (!hoveredPlanet && !selectedPlanet) return true;
    const focus = selectedPlanet || hoveredPlanet;
    if (!focus) return true;
    return aspect.planet1 === focus || aspect.planet2 === focus;
  });

  const aspectLines = showAspects ? chart.aspects
    .filter(a => ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type))
    .map((aspect, index) => {
      const p1 = planetPositions.find(pp => pp.planet.id === aspect.planet1);
      const p2 = planetPositions.find(pp => pp.planet.id === aspect.planet2);
      
      if (!p1 || !p2) return null;

      const isFocused = hoveredPlanet === aspect.planet1 || hoveredPlanet === aspect.planet2 || 
                        selectedPlanet === aspect.planet1 || selectedPlanet === aspect.planet2;

      if (!hoveredPlanet && !selectedPlanet) return null;
      if (!isFocused) return null;

      let strokeColor = '#64748b';
      // Orb 0-8. Menor órbita = mais forte.
      const strength = Math.max(0, 1 - (aspect.orb / 8));
      let strokeWidth = (isFocused ? 2.5 : 1.2) + (strength * 1.5);
      
      switch (aspect.type) {
        case 'conjunction': strokeColor = '#fbbf24'; break; 
        case 'trine': strokeColor = '#22c55e'; break;
        case 'sextile': strokeColor = '#3b82f6'; break;
        case 'square': strokeColor = '#ef4444'; break;
        case 'opposition': 
          strokeColor = '#f97316'; 
          strokeWidth += 0.5;
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
          opacity={isFocused ? 0.9 : 0.2 + (strength * 0.3)}
          className="transition-all duration-300"
          strokeDasharray={aspect.orb > 5 ? "4,2" : "none"}
        />
      );
    }) : [];

  return (
    <div ref={containerRef} className={`w-full mx-auto bg-[#020617] shadow-2xl ${isMinimal ? 'max-w-none rounded-2xl p-2 border border-white/10' : 'max-w-[960px] rounded-3xl p-4 border border-slate-800'}`}>
      
      <div className={`relative w-full aspect-square overflow-hidden ${isMinimal ? 'rounded-xl' : 'rounded-2xl'}`}>
        {/* Botão Reset flutuante para Mobile */}
        {isTouchDevice && (zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
          <button 
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="absolute bottom-4 right-4 z-20 bg-purple-600/90 text-white p-3 rounded-full shadow-lg shadow-purple-500/40 animate-in fade-in zoom-in duration-300 backdrop-blur-sm border border-white/20 active:scale-90 transition-transform"
            title="Resetar Visão"
          >
            <Maximize className="w-6 h-6" />
          </button>
        )}

        {/* Controles de Zoom Overlay - Somente no Desktop */}
        {!isTouchDevice && !isMinimal && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 bg-slate-900/80 p-2 rounded-xl border border-slate-700/50 backdrop-blur-md">
            <button 
              onClick={() => setZoom(z => Math.min(5, z + 0.3))} 
              className="p-2 text-slate-300 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setZoom(z => Math.max(0.5, z - 0.3))} 
              className="p-2 text-slate-300 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} 
              className="p-2 text-slate-300 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors mt-1 border-t border-slate-700/50 pt-3"
              title="Resetar Visão"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox="0 0 800 800"
          className="w-full h-full touch-none cursor-grab active:cursor-grabbing font-sans"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <g ref={chartGroupRef} transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} className="origin-[0_0]">
            
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
            {tooltipElement}
            
            <circle cx={CX} cy={CY} r="12" fill="none" stroke="#64748b" strokeWidth="2" />
            <line x1={CX - 8} y1={CY} x2={CX + 8} y2={CY} stroke="#64748b" strokeWidth="2" />
            <line x1={CX} y1={CY - 8} x2={CX} y2={CY + 8} stroke="#64748b" strokeWidth="2" />
          </g>
        </svg>
      </div>

      {!isMinimal && (
      <div className="mt-6 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={showAspects}
              onChange={(e) => setShowAspects(e.target.checked)}
              className="w-4 h-4 rounded border-purple-500/30 bg-slate-900 text-purple-600 focus:ring-purple-500/50"
            />
            Mostrar aspectos
          </label>
          
          {selectedPlanet && (
            <button onClick={() => setSelectedPlanet(null)} className="text-xs text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-4 py-1.5 rounded-full border border-purple-500/20">
              Limpar foco ({selectedPlanet})
            </button>
          )}
        </div>

        {showAspects && (
          <div className="flex flex-wrap justify-center gap-y-1.5 md:gap-y-3 gap-x-3 md:gap-x-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-900/60 backdrop-blur-sm px-3 py-3 md:px-6 md:py-4 rounded-2xl border border-white/5 shadow-xl w-full">
            <div className="flex items-center gap-2">
              <span className="text-sm aspect-conjunction">☌</span>
              <span>Conjunção</span>
              <span className="w-6 h-[2px] bg-yellow-400 opacity-80"></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm aspect-trine">△</span>
              <span>Trígono</span>
              <span className="w-6 h-[2px] bg-green-500 opacity-80"></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm aspect-sextile">⚹</span>
              <span>Sextil</span>
              <span className="w-6 h-[2px] bg-blue-500 opacity-80"></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm aspect-square">□</span>
              <span>Quadratura</span>
              <span className="w-6 h-[2px] bg-red-500 opacity-80"></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm aspect-opposition">☍</span>
              <span>Oposição</span>
              <span className="w-6 h-[2px] bg-orange-500 opacity-80"></span>
            </div>
            <div className="w-full h-[1px] bg-white/5 my-1 md:hidden"></div>
            <div className="flex items-center gap-4 text-slate-500 border-l border-white/10 pl-6 hidden md:flex">
              <div className="flex items-center gap-2">
                <span className="w-4 h-[3.5px] bg-slate-500 rounded-full"></span>
                <span>Exato</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-[1px] bg-slate-500 border-b border-dashed border-slate-400 opacity-60"></span>
                <span>Largo</span>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

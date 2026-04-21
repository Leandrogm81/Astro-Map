"use client";

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { NatalChart, ZODIAC_SIGNS, PLANETS, HERMETIC_LOTS } from '@/types';
import { EGYPTIAN_TERMS, getFaceRuler } from '@/lib/traditional/dignities';
import { getTraditionalWheelAnchor, longitudeToTraditionalAngle, getTraditionalTooltipPosition } from '@/lib/traditional/wheelGeometry';

const CX = 400;
const CY = 400;

// Constantes de Raio baseadas na geometria moderna premium
const R_OUTER = 380;
const R_ZODIAC_INNER = 330;
const R_TICKS_INNER = 320;

// Novos aneis de dignidades (Termos e Decanos)
const R_TERMS_OUTER = 318;
const R_TERMS_INNER = 298;
const R_DECANS_OUTER = 298;
const R_DECANS_INNER = 278;

const R_ASPECTS = 210;

// Cores dos Signos (Padrão AstroMap)
const SIGN_COLORS: Record<string, string> = {
  'Áries': '#ef4444', 'Touro': '#22c55e', 'Gêmeos': '#fbbf24', 'Câncer': '#3b82f6',
  'Leão': '#ef4444', 'Virgem': '#22c55e', 'Libra': '#fbbf24', 'Escorpião': '#3b82f6',
  'Sagitário': '#ef4444', 'Capricórnio': '#22c55e', 'Aquário': '#fbbf24', 'Peixes': '#3b82f6'
};


interface TraditionalChartProps {
  chart: NatalChart;
  showAllLots?: boolean;
  selectedPlanetId?: string | null;
  onPlanetClick?: (id: string | null, position?: { x: number, y: number }) => void;
}

export default function TraditionalChart({ 
  chart, 
  showAllLots: externalShowAllLots = false,
  selectedPlanetId: externalSelectedPlanetId = null,
  onPlanetClick 
}: TraditionalChartProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null);
  const [hoveredLotId, setHoveredLotId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Detect touch device if needed for potential UI adjustments
  }, []);

  // Estados internos para configurações (podem ser movidos para props no futuro se necessário)
  const [houseSystem, setHouseSystem] = useState<'whole_sign' | 'equal_house'>('whole_sign');
  const [showAspects, setShowAspects] = useState(true);
  const [showAllLots, setShowAllLots] = useState(externalShowAllLots);

  // Sincronizar showAllLots se mudar externamente
  React.useEffect(() => {
    setShowAllLots(externalShowAllLots);
  }, [externalShowAllLots]);

  // 0. Interaction Logic Mirroring AstroChart
  const svgRef = useRef<SVGSVGElement>(null);
  const pointers = useRef<Map<number, { x: number, y: number }>>(new Map());
  const initialDist = useRef<number>(0);
  const initialZoom = useRef<number>(1);
  const initialPan = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const initialMid = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  const getLocalCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: clientX, y: clientY };
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const transformed = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const asc = getTraditionalWheelAnchor(chart);
  const longitudeToAngle = (lon: number) => {
    return longitudeToTraditionalAngle(lon, asc);
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
  const zodiacElements = ZODIAC_SIGNS.map((sign, i) => {
    const color = SIGN_COLORS[sign.name] || '#94a3b8';
    const signLon = i * 30;
    const path = getArcPath(signLon, signLon + 30, R_OUTER, R_ZODIAC_INNER);
    const textAngle = longitudeToAngle(signLon + 15);
    const tx = CX + (R_OUTER + R_ZODIAC_INNER) / 2 * Math.cos(textAngle);
    const ty = CY + (R_OUTER + R_ZODIAC_INNER) / 2 * Math.sin(textAngle);

    return (
      <g key={sign.name}>
        <path d={path} fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <text 
          x={tx} y={ty} textAnchor="middle" dominantBaseline="central" 
          fill={color} fontSize="24" fontWeight="bold" className="select-none"
        >
          {sign.symbol}
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
        if (houseSystem === 'whole_sign') {
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
                   x1={CX + R_ASPECTS * Math.cos(angle)} y1={CY + R_ASPECTS * Math.sin(angle)} 
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
  }, [asc, houseSystem]);

  // 2.5 Aneis de Dignidades (Termos e Decanos)
  const dignityRings = useMemo(() => {
    const terms: React.ReactNode[] = [];
    const decans: React.ReactNode[] = [];

    ZODIAC_SIGNS.forEach((sign, signIndex) => {
      const signStartLon = signIndex * 30;
      const color = SIGN_COLORS[sign.name] || '#94a3b8';

      // Termos Egípcios
      const signTerms = EGYPTIAN_TERMS[sign.name];
      let lastLimit = 0;
      signTerms.forEach((term, termIndex) => {
        const start = signStartLon + lastLimit;
        const end = signStartLon + term.limit;
        const middle = (start + end) / 2;
        const path = getArcPath(start, end, R_TERMS_OUTER, R_TERMS_INNER);
        const symbolAngle = longitudeToAngle(middle);
        const symbol = PLANETS.find(p => p.id === term.planet)?.symbol || term.planet;
        
        terms.push(
          <g key={`term-${sign.name}-${termIndex}`}>
            <path d={path} fill="transparent" stroke={color} strokeWidth="0.5" opacity="0.3" />
            <text 
              x={CX + (R_TERMS_OUTER + R_TERMS_INNER) / 2 * Math.cos(symbolAngle)}
              y={CY + (R_TERMS_OUTER + R_TERMS_INNER) / 2 * Math.sin(symbolAngle)}
              textAnchor="middle" dominantBaseline="central"
              fill={color} fontSize="12" fontWeight="bold" opacity="1" className="select-none"
            >
              {symbol}
            </text>
          </g>
        );
        lastLimit = term.limit;
      });

      // Decanos (Faces) - 3 por signo (10° cada)
      for (let d = 0; d < 3; d++) {
        const start = signStartLon + d * 10;
        const end = start + 10;
        const middle = start + 5;
        const path = getArcPath(start, end, R_DECANS_OUTER, R_DECANS_INNER);
        const symbolAngle = longitudeToAngle(middle);
        const rulerId = getFaceRuler(sign.name, d * 10);
        const symbol = PLANETS.find(p => p.id === rulerId)?.symbol || rulerId;

        decans.push(
          <g key={`decan-${sign.name}-${d}`}>
            <path d={path} fill="transparent" stroke={color} strokeWidth="0.5" opacity="0.2" />
            <text 
              x={CX + (R_DECANS_OUTER + R_DECANS_INNER) / 2 * Math.cos(symbolAngle)}
              y={CY + (R_DECANS_OUTER + R_DECANS_INNER) / 2 * Math.sin(symbolAngle)}
              textAnchor="middle" dominantBaseline="central"
              fill={color} fontSize="10" fontWeight="bold" opacity="1" className="select-none"
            >
              {symbol}
            </text>
          </g>
        );
      }
    });

    return (
      <g id="traditional-dignities" key={`rings-${asc}`}>
        <g id="terms-ring">{terms}</g>
        <g id="decans-ring">{decans}</g>
      </g>
    );
  }, [asc]);

  // 4. Planetas Classic (7)
  const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const classicPlanets = useMemo(() => {
    return chart.planets.filter(p => {
        const pId = p.id?.toLowerCase();
        return classicIds.includes(pId);
    });
  }, [chart.planets]);

  const planetNodes = classicPlanets.map(p => {
    const angle = longitudeToAngle(p.longitude);
    const r = 258;
    const x = CX + r * Math.cos(angle);
    const y = CY + r * Math.sin(angle);
    const isHovered = hoveredPlanetId === p.id;
    const isSelected = externalSelectedPlanetId === p.id;
    const isHighlighted = isHovered || isSelected;

    return (
      <g 
        key={p.id} 
        onMouseEnter={() => setHoveredPlanetId(p.id)}
        onMouseLeave={() => setHoveredPlanetId(null)}
        onClick={(e) => onPlanetClick?.(p.id, { x: e.clientX, y: e.clientY })}
        className="cursor-pointer transition-all duration-300"
      >
        {/* Ponteiro de Grau (Traço) */}
        <line 
          x1={x} y1={y} 
          x2={CX + (R_ZODIAC_INNER + 5) * Math.cos(angle)} y2={CY + (R_ZODIAC_INNER + 5) * Math.sin(angle)} 
          stroke="#3b82f6" strokeWidth="1.5" opacity="0.8" 
        />
        <line 
          x1={CX + (R_ZODIAC_INNER - 2) * Math.cos(angle)} y1={CY + (R_ZODIAC_INNER - 2) * Math.sin(angle)} 
          x2={CX + (R_ZODIAC_INNER + 5) * Math.cos(angle)} y2={CY + (R_ZODIAC_INNER + 5) * Math.sin(angle)} 
          stroke="#3b82f6" strokeWidth="2.5" opacity="1" 
        />
        <circle cx={x} cy={y} r="13" fill="none" stroke={isHighlighted ? "#fbbf24" : "#94a3b8"} strokeWidth="2" />
        <text 
          x={x} y={y} textAnchor="middle" dominantBaseline="central" 
          fill={isHighlighted ? "#fbbf24" : "#fbbf24"} fontSize="18" fontWeight="bold"
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
    .filter(l => showAllLots || l.id === 'fortune' || l.id === 'spirit')
    .map(l => {
      const angle = longitudeToAngle(l.longitude);
      const r = 225;
      const x = CX + r * Math.cos(angle);
      const y = CY + r * Math.sin(angle);
      const color = lotColors[l.id] || '#94a3b8';
      const isHovered = hoveredLotId === l.id;
      const lotInfo = HERMETIC_LOTS.find(lot => lot.id === l.id);

      return (
        <g 
          key={l.id} 
          onMouseEnter={() => setHoveredLotId(l.id)}
          onMouseLeave={() => setHoveredLotId(null)}
          className="cursor-help transition-all duration-300"
        >
          {/* Ponteiro de Grau (Traço) */}
          <line 
             x1={x} y1={y} 
             x2={CX + (R_ZODIAC_INNER + 5) * Math.cos(angle)} y2={CY + (R_ZODIAC_INNER + 5) * Math.sin(angle)} 
             stroke={color} strokeWidth="1.2" opacity="0.6" 
          />
          <line 
            x1={CX + (R_ZODIAC_INNER - 2) * Math.cos(angle)} y1={CY + (R_ZODIAC_INNER - 2) * Math.sin(angle)} 
            x2={CX + (R_ZODIAC_INNER + 5) * Math.cos(angle)} y2={CY + (R_ZODIAC_INNER + 5) * Math.sin(angle)} 
            stroke={color} strokeWidth="2" opacity="1" 
          />
          <circle 
            cx={x} cy={y} r="14" 
            fill="none" 
            stroke={color} 
            strokeWidth="2" 
            strokeDasharray={isHovered ? "none" : "2,1"} 
          />
          <text 
            x={x} y={y} textAnchor="middle" dominantBaseline="central" 
            fill={color} fontSize="18" fontWeight="bold"
          >
            {lotInfo?.symbol || l.symbol}
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
      const isConnectedToSelect = externalSelectedPlanetId === p1.id || externalSelectedPlanetId === p2.id;
      const isCurrentHighlighted = isConnectedToHover || isConnectedToSelect;
      
      const isAnyActiveHighlight = !!hoveredPlanetId || !!externalSelectedPlanetId;
      
      if (!isAnyActiveHighlight) return null;
      if (!isCurrentHighlighted) return null;

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
          strokeWidth="2.5"
          opacity="1"
          strokeDasharray={a.orb > 6 ? "5,3" : "none"}
          className="transition-all duration-300 pointer-events-none"
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

    const title = target.name;
    const signIndex = Math.floor(target.longitude / 30);
    const subtitle = `${ZODIAC_SIGNS[signIndex].name} ${Math.floor(target.longitude % 30)}°${Math.floor((target.longitude % 1) * 60)}'`;
    const desc = 'description' in target ? target.description : undefined;
    
    // Dimensões estimadas para o clamping
    const BOX_WIDTH = 200;
    const BOX_HEIGHT = desc ? 120 : 90;

    const { ox, oy } = getTraditionalTooltipPosition(
      focusX, 
      focusY, 
      BOX_WIDTH, 
      BOX_HEIGHT
    );

    return (
      <g transform={`translate(${focusX}, ${focusY})`} className="pointer-events-none transition-all duration-300">
        <g transform={`translate(${ox}, ${oy})`}>
          <rect 
            width={BOX_WIDTH} 
            height={BOX_HEIGHT} 
            rx="14" 
            fill="#0f172a" 
            stroke="#fbbf24" 
            strokeWidth="2" 
            className="shadow-2xl" 
            opacity="0.98" 
          />
          <text x={BOX_WIDTH / 2} y="30" textAnchor="middle" fill="#fbbf24" fontSize="16" fontWeight="bold">{title}</text>
          <text x={BOX_WIDTH / 2} y="55" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="600">{subtitle}</text>
          <text x={BOX_WIDTH / 2} y="78" textAnchor="middle" fill="#94a3b8" fontSize="13">Posição Clássica</text>
          {desc && (
            <text x={BOX_WIDTH / 2} y="100" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="normal">
              {desc.length > 50 ? desc.substring(0, 47) + '...' : desc}
            </text>
          )}
        </g>
      </g>
    );
  };

  // Handlers de Mouse/Touch para Arraste (Sincronizado com AstroChart)
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
      const newZoom = Math.max(0.5, Math.min(initialZoom.current * scale, 5));
      
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

  return (
    <div className="relative w-full h-[600px] md:h-[800px] lg:h-[950px] flex items-center justify-center p-4 md:p-8 bg-black/20 rounded-[2.5rem] border border-white/5">
      <div className="w-full h-full relative group">
        <svg 
          ref={svgRef}
          viewBox="0 0 800 800" 
          className="w-full h-full touch-none cursor-grab active:cursor-grabbing shadow-inner drop-shadow-2xl"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={() => {}}
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} className="origin-[0_0] transition-transform duration-75">
            {/* Círculo Principal com Gradiente */}
            <defs>
              <radialGradient id="traditionalWheelBg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="70%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </radialGradient>
            </defs>
            <circle cx={CX} cy={CY} r={R_OUTER} fill="url(#traditionalWheelBg)" stroke="#7c3aed" strokeWidth="2.5" opacity="0.8" />
            <circle cx={CX} cy={CY} r={R_ZODIAC_INNER} fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.5" />

            
            {/* Zodíaco Colorido */}
            {zodiacElements}
            
            {/* Ticks de Graus */}
            {degreeTicks}

            {/* Fundo Central */}
            <circle cx={CX} cy={CY} r={R_ASPECTS} fill="#020617" stroke="#475569" strokeWidth="2" />

            {/* Casas e Aspectos */}
            {houseElements}
            {dignityRings}
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
          <button 
            onClick={() => setZoom(z => Math.min(z + 0.2, 3))} 
            title="Aumentar Zoom"
            aria-label="Aumentar Zoom"
            className="p-3 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
          </button>
          <button 
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} 
            title="Diminuir Zoom"
            aria-label="Diminuir Zoom"
            className="p-3 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
          </button>
          <button 
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} 
            title="Resetar Visualização"
            aria-label="Resetar Visualização"
            className="p-3 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          </button>
          <div className="w-px h-6 bg-slate-800 self-center" />
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            title="Ajustes de Visualização"
            aria-label="Ajustes de Visualização"
            className={`p-3 backdrop-blur border rounded-xl transition-all shadow-lg ${showSettings ? 'bg-gold-500/20 border-gold-500 text-gold-400' : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>

        {/* Menu de Configuração Glassmorphism */}
        {showSettings && (
          <div className="absolute right-20 top-6 w-64 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300 z-50">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>Ajustes de Visualização</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-pointer" onClick={() => setShowAspects(!showAspects)}>
                <span className="text-slate-300 text-sm">Linhas de Aspecto</span>
                <div className={`text-xl transition-colors ${showAspects ? 'text-red-500' : 'text-slate-600'}`}>{showAspects ? '👁️' : '🔒'}</div>
              </div>

              <div className="flex items-center justify-between group cursor-pointer" onClick={() => setShowAllLots(!showAllLots)}>
                <span className="text-slate-300 text-sm">Todos os Lotes</span>
                <div className={`text-xl transition-colors ${showAllLots ? 'text-red-500' : 'text-slate-600'}`}>{showAllLots ? '👁️' : '🔒'}</div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 block">Sistema de Casas</span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setHouseSystem('whole_sign')} className={`px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${houseSystem === 'whole_sign' ? 'bg-gold-500/20 border-gold-500 text-gold-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>Signos Inteiros</button>
                  <button onClick={() => setHouseSystem('equal_house')} className={`px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${houseSystem === 'equal_house' ? 'bg-gold-500/20 border-gold-500 text-gold-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>Casas Iguais</button>
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

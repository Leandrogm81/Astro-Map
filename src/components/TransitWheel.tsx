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
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });
  
  // Interactions
  const [hoveredPlanet, setHoveredPlanet] = useState<{name: string, isTransit: boolean} | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<{name: string, isTransit: boolean} | null>(null);
  
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
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const size = Math.min(width, height, 800);
      setDimensions({ width: size, height: size });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (svgRef.current && onChartReady) {
      onChartReady(svgRef.current);
    }
  }, [onChartReady]);

  const { width, height } = dimensions;
  const centerX = width / 2;
  const centerY = height / 2;
  const transitRadius = Math.min(width, height) / 2 - 20; // Raios externos (trânsito)
  const outerRadius = transitRadius * 0.8; // Raios do mapa natal
  const innerRadius = outerRadius * 0.35;
  const houseRadius = outerRadius * 0.75;
  const scale = width / 500;

  const longitudeToAngle = (longitude: number) => (longitude - 90) * (Math.PI / 180);

  // Zodíaco do mapa natal
  const zodiacSlices = ZODIAC_SIGNS.map((sign) => {
    const startAngle = longitudeToAngle(sign.start);
    const endAngle = longitudeToAngle((sign.start + 30) % 360);
    const x1 = centerX + outerRadius * Math.cos(startAngle);
    const y1 = centerY + outerRadius * Math.sin(startAngle);
    const x2 = centerX + outerRadius * Math.cos(endAngle);
    const y2 = centerY + outerRadius * Math.sin(endAngle);
    
    // Extensão para trânsitos (anel verde limão/cinza para transitos)
    const tx1 = centerX + transitRadius * Math.cos(startAngle);
    const ty1 = centerY + transitRadius * Math.sin(startAngle);
    const tx2 = centerX + transitRadius * Math.cos(endAngle);
    const ty2 = centerY + transitRadius * Math.sin(endAngle);

    return (
      <g key={sign.name}>
        {/* Natal Zodiac */}
        <path
          d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} Z`}
          fill={`${getElementColor(sign.element)}15`}
          stroke={getElementColor(sign.element)}
          strokeWidth="0.5"
        />
        {/* Transit Zodiac Outer Ring Extension */}
        <path
          d={`M ${x1} ${y1} L ${tx1} ${ty1} A ${transitRadius} ${transitRadius} 0 0 1 ${tx2} ${ty2} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 0 ${x1} ${y1} Z`}
          fill={`${getElementColor(sign.element)}08`}
          stroke={getElementColor(sign.element)}
          strokeWidth="0.2"
          strokeDasharray="2,2"
        />
        <text
          x={centerX + (outerRadius - 18 * scale) * Math.cos((startAngle + endAngle) / 2)}
          y={centerY + (outerRadius - 18 * scale) * Math.sin((startAngle + endAngle) / 2)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={getElementColor(sign.element)}
          fontSize={16 * scale}
          fontWeight="bold"
          className="select-none"
        >
          {sign.symbol}
        </text>
      </g>
    );
  });

  const houseLines = natalChart.housesPlacidus.map((house) => {
    const angle = longitudeToAngle(house.longitude);
    const x = centerX + houseRadius * Math.cos(angle);
    const y = centerY + houseRadius * Math.sin(angle);
    const isAsc = house.number === 1;
    const isMC = house.number === 10;
    return (
      <g key={house.number}>
        <line
          x1={centerX} y1={centerY} x2={x} y2={y}
          stroke={isAsc ? '#fbbf24' : isMC ? '#22c55e' : '#7c3aed'}
          strokeWidth={isAsc ? 2 : 1}
          opacity={isAsc ? 1 : isMC ? 0.8 : 0.4}
        />
        <text
          x={centerX + (houseRadius + 12 * scale) * Math.cos(angle)}
          y={centerY + (houseRadius + 12 * scale) * Math.sin(angle)}
          textAnchor="middle" dominantBaseline="middle"
          fill={isAsc ? '#fbbf24' : isMC ? '#22c55e' : '#94a3b8'}
          fontSize={10 * scale}
        >
          {house.number}
        </text>
      </g>
    );
  });

  const plotPlanets = (planets: PlanetPosition[], isTransit: boolean) => {
    const baseRadius = isTransit ? outerRadius + 15 : innerRadius + 10;
    const positions: { p: PlanetPosition; x: number; y: number }[] = [];
    
    planets.forEach(planet => {
      const angle = longitudeToAngle(planet.longitude);
      let r = baseRadius;
      let overlap = true;
      let attempts = 0;
      while (overlap && attempts < 10) {
        overlap = false;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        for (const pos of positions) {
          const dist = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
          if (dist < 18 * scale) {
            overlap = true;
            r += 12;
            break;
          }
        }
        attempts++;
      }
      positions.push({ p: planet, x: centerX + r * Math.cos(angle), y: centerY + r * Math.sin(angle) });
    });

    return positions.map(({ p, x, y }) => {
      const isHovered = hoveredPlanet?.name === p.name && hoveredPlanet?.isTransit === isTransit;
      const isSelected = selectedPlanet?.name === p.name && selectedPlanet?.isTransit === isTransit;
      const focus = isHovered || isSelected;
      const info = PLANETS.find(pl => pl.name === p.name);
      const color = isTransit ? '#10b981' : '#fbbf24'; // Verde para trânsitos

      return (
        <g
          key={`${isTransit ? 't' : 'n'}-${p.name}`}
          transform={`translate(${x}, ${y})`}
          className="cursor-pointer"
          onMouseEnter={() => setHoveredPlanet({ name: p.name, isTransit })}
          onMouseLeave={() => setHoveredPlanet(null)}
          onClick={() => setSelectedPlanet(isSelected ? null : { name: p.name, isTransit })}
        >
          {focus && <circle r={14 * scale} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />}
          <circle r={10 * scale} fill="#1e293b" stroke={p.retrograde ? '#ef4444' : color} strokeWidth={2} />
          <text textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={12 * scale} fontWeight="bold">
            {info?.symbol || '●'}
          </text>
          
          {isHovered && !isSelected && (
            <g transform={`translate(${x > centerX ? -180 : 20}, -50)`}>
              <rect width="180" height="85" rx="6" fill="#0f172a" stroke={color} strokeWidth="1" />
              <text x="90" y="18" textAnchor="middle" fill="#e2e8f0" fontSize={13} fontWeight="bold">
                {p.name} {isTransit ? '(Trânsito)' : '(Natal)'}
              </text>
              <text x="90" y="35" textAnchor="middle" fill="#94a3b8" fontSize={11}>
                {p.sign} {Math.floor(p.degree)}°{Math.floor((p.degree % 1) * 60)}'
              </text>
              <text x="90" y="50" textAnchor="middle" fill="#94a3b8" fontSize={11}>
                Casa {p.house} • {getDignity(p.name, p.sign)}
              </text>
              <text x="90" y="65" textAnchor="middle" fill={p.retrograde ? '#ef4444' : '#94a3b8'} fontSize={10}>
                {p.retrograde ? 'Retrógrado' : 'Direto'}
              </text>
            </g>
          )}
        </g>
      );
    });
  };

  const sunSign = natalChart.planets.find(p => p.name === 'Sol')?.sign || '';
  const sunSymbol = ZODIAC_SIGNS.find(s => s.name === sunSign)?.symbol || '☉';

  return (
    <div ref={containerRef} className="w-full aspect-square max-w-[800px] mx-auto">
      <svg
        ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onWheel={handleWheel}
      >
        <g style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center' }}>
          <circle cx={centerX} cy={centerY} r={transitRadius} fill="#0f172a" stroke="#10b981" strokeWidth="1" strokeDasharray="4,4" />
          <circle cx={centerX} cy={centerY} r={outerRadius} fill="#0f172a" stroke="#7c3aed" strokeWidth="2" />
          {zodiacSlices}
          {houseLines}
          <circle cx={centerX} cy={centerY} r={innerRadius} fill="#1e293b" stroke="#7c3aed" opacity="0.8" />
          
          {plotPlanets(natalChart.planets, false)}
          {plotPlanets(transitChart.planets, true)}

          <circle cx={centerX} cy={centerY} r={20 * scale} fill="#1e293b" stroke="#fbbf24" strokeWidth="2" />
          <text x={centerX} y={centerY} textAnchor="middle" dominantBaseline="middle" fill="#fbbf24" fontSize={16 * scale}>
            {sunSymbol}
          </text>
        </g>
      </svg>
      <div className="mt-4 flex flex-col items-center gap-2">
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="text-xs text-blue-400 hover:text-blue-300">
          Resetar Visualização
        </button>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-yellow-400 rounded-full"></span> Planetas Natais</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded-full"></span> Trânsitos Atuais</span>
        </div>
      </div>
    </div>
  );
}

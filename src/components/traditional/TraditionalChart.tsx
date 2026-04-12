import React from 'react';
import { NatalChart, ZODIAC_SIGNS, PLANETS } from '@/types';
import { getElementColor } from '@/lib/astrology';

interface TraditionalChartProps {
  chart: NatalChart;
  showAllLots?: boolean;
  onPlanetClick?: (id: string) => void;
  selectedPlanetId?: string | null;
}

export default function TraditionalChart({ 
  chart, 
  showAllLots, 
  onPlanetClick,
  selectedPlanetId 
}: TraditionalChartProps) {
  const CX = 400;
  const CY = 400;
  const R_OUTER = 380;
  const R_ZODIAC_INNER = 320;
  const R_HOUSES_INNER = 220;
  const R_PLANETS = 270;
  const R_LOTS = 240;

  const ascendantLongitude = chart.ascendant;

  const longitudeToAngle = (longitude: number): number => {
    return (180 - (longitude - ascendantLongitude)) * (Math.PI / 180);
  };

  // Filtrar apenas os 7 planetas clássicos com busca flexível
  const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const classicPlanets = chart.planets.filter(p => {
    const pId = p.id?.toLowerCase();
    return classicIds.includes(pId) || classicIds.includes(p.name?.toLowerCase());
  });

  // Renderizar Signos
  const zodiacElements = ZODIAC_SIGNS.map((sign) => {
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

    const midAngle = (startAngle + endAngle) / 2;
    const rMid = (R_OUTER + R_ZODIAC_INNER) / 2;
    const iconX = CX + rMid * Math.cos(midAngle);
    const iconY = CY + rMid * Math.sin(midAngle);

    return (
      <g key={sign.name}>
        <path
          d={`M ${x1_out} ${y1_out} A ${R_OUTER} ${R_OUTER} 0 0 0 ${x2_out} ${y2_out} L ${x2_in} ${y2_in} A ${R_ZODIAC_INNER} ${R_ZODIAC_INNER} 0 0 1 ${x1_in} ${y1_in} Z`}
          className="fill-slate-900/50 stroke-gold-500/30"
          strokeWidth="1"
        />
        <text
          x={iconX}
          y={iconY}
          textAnchor="middle"
          dominantBaseline="central"
          fill={getElementColor(sign.element)}
          className="text-xl font-black select-none drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]"
        >
          {sign.symbol}
        </text>
      </g>
    );
  });

  // Linhas das Casas (Whole Sign)
  const houseLines = Array.from({ length: 12 }).map((_, i) => {
    const lon = (Math.floor(ascendantLongitude / 30) * 30 + i * 30) % 360;
    const angle = longitudeToAngle(lon);
    
    const xOut = CX + R_ZODIAC_INNER * Math.cos(angle);
    const yOut = CY + R_ZODIAC_INNER * Math.sin(angle);
    const xIn = CX + R_HOUSES_INNER * Math.cos(angle);
    const yIn = CY + R_HOUSES_INNER * Math.sin(angle);

    return (
      <line
        key={`house-${i}`}
        x1={xIn} y1={yIn} x2={xOut} y2={yOut}
        className="stroke-gold-500/10"
        strokeWidth="1"
      />
    );
  });

  // Renderizar Planetas
  const planetElements = classicPlanets.map((planet) => {
    const angle = longitudeToAngle(planet.longitude);
    const x = CX + R_PLANETS * Math.cos(angle);
    const y = CY + R_PLANETS * Math.sin(angle);
    const isSelected = selectedPlanetId === planet.id;

    return (
      <g 
        key={planet.id} 
        className="cursor-pointer group" 
        onClick={() => onPlanetClick?.(planet.id)}
      >
        {/* Glow externo para planeta selecionado */}
        {isSelected && (
          <circle
            cx={x} cy={y} r="22"
            className="fill-gold-500/20 animate-pulse"
          />
        )}
        <circle
          cx={x} cy={y} r="18"
          className={`${isSelected ? 'fill-gold-500' : 'fill-slate-900/80'} transition-all duration-300 stroke-gold-500/60`}
          strokeWidth={isSelected ? 3 : 1.5}
        />
        <text
          x={x} y={y}
          textAnchor="middle"
          dominantBaseline="central"
          className={`${isSelected ? 'fill-slate-950' : 'fill-white group-hover:fill-gold-200'} font-bold transition-colors [text-shadow:0_0_5px_rgba(255,255,255,0.3)]`}
          fontSize="18"
        >
          {planet.symbol}
        </text>
      </g>
    );
  });

  // Renderizar Lotes
  const lotElements = (chart.lots || [])
    .filter(lot => {
      if (showAllLots) return true;
      return lot.id === 'fortune' || lot.id === 'spirit';
    })
    .map(lot => {
      const angle = longitudeToAngle(lot.longitude);
      const x = CX + R_LOTS * Math.cos(angle);
      const y = CY + R_LOTS * Math.sin(angle);

      return (
        <g key={lot.id}>
          <circle 
            cx={x} cy={y} r="14" 
            className="fill-gold-500/5 stroke-gold-500/40" 
            strokeDasharray="3 2" 
          />
          <text
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-gold-400 font-black [text-shadow:0_0_8px_rgba(212,175,55,0.5)]"
            fontSize="14"
          >
            {lot.symbol}
          </text>
        </g>
      );
    });

  return (
    <svg 
      viewBox="0 0 800 800" 
      className="w-full h-full drop-shadow-2xl drop-shadow-[0_0_20px_rgba(180,150,50,0.1)]"
    >
      {/* Background circles */}
      <circle cx={CX} cy={CY} r={R_OUTER} className="fill-slate-950/20 stroke-gold-500/20" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={R_ZODIAC_INNER} className="fill-none stroke-gold-500/10" strokeWidth="1" />
      
      {zodiacElements}
      {houseLines}
      {planetElements}
      {lotElements}

      {/* Center point */}
      <circle cx={CX} cy={CY} r="4" className="fill-gold-500/50" />
    </svg>
  );
}

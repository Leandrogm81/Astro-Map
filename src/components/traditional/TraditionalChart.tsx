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
  const R_ZODIAC_INNER = 330;
  const R_HOUSES_INNER = 210;
  const R_PLANETS = 275;
  const R_LOTS = 245;

  const ascendantLongitude = chart.ascendant;

  const longitudeToAngle = (longitude: number): number => {
    // Rotação para que o Ascendente fique na esquerda (9h no relógio)
    return (180 - (longitude - ascendantLongitude)) * (Math.PI / 180);
  };

  // Filtrar apenas os 7 planetas clássicos com busca flexível
  const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const classicPlanets = chart.planets.filter(p => {
    const pId = p.id?.toLowerCase();
    return classicIds.includes(pId) || classicIds.includes(p.name?.toLowerCase());
  });

  // Renderizar Signos (Fatias Coloridas / Estilo Moderno)
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

    const color = getElementColor(sign.element);

    return (
      <g key={sign.name}>
        <path
          d={`M ${x1_out} ${y1_out} A ${R_OUTER} ${R_OUTER} 0 0 0 ${x2_out} ${y2_out} L ${x2_in} ${y2_in} A ${R_ZODIAC_INNER} ${R_ZODIAC_INNER} 0 0 1 ${x1_in} ${y1_in} Z`}
          fill={`${color}15`}
          stroke={color}
          strokeWidth="1.5"
          className="transition-opacity duration-300"
        />
        <text
          x={iconX}
          y={iconY}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          className="text-2xl font-bold select-none"
        >
          {sign.symbol}
        </text>
      </g>
    );
  });

  // Linhas das Casas e numeração (Estetica AstroChart)
  const houseElements = Array.from({ length: 12 }).map((_, i) => {
    const houseNum = i + 1;
    const lon = (Math.floor(ascendantLongitude / 30) * 30 + i * 30) % 360;
    const angle = longitudeToAngle(lon);
    
    // Angulo central da casa para o número
    const midAngle = longitudeToAngle(lon + 15);
    const rText = (R_HOUSES_INNER + 50) / 2;
    const tx = CX + rText * Math.cos(midAngle);
    const ty = CY + rText * Math.sin(midAngle);

    const isCardinal = [1, 4, 7, 10].includes(houseNum);
    
    return (
      <g key={`house-${i}`}>
        {/* Linha da Cúspide */}
        <line
          x1={CX + R_HOUSES_INNER * Math.cos(angle)} 
          y1={CY + R_HOUSES_INNER * Math.sin(angle)} 
          x2={CX + R_ZODIAC_INNER * Math.cos(angle)} 
          y2={CY + R_ZODIAC_INNER * Math.sin(angle)}
          stroke={isCardinal ? "#fbbf24" : "#475569"}
          strokeWidth={isCardinal ? "2" : "1"}
          opacity={isCardinal ? "1" : "0.6"}
        />
        {/* Número da Casa */}
        <text
          x={tx} y={ty}
          textAnchor="middle" dominantBaseline="central"
          fill={isCardinal ? "#e2e8f0" : "#94a3b8"}
          fontSize="16" fontWeight={isCardinal ? "bold" : "normal"}
          className="select-none"
        >
          {houseNum}
        </text>
      </g>
    );
  });

  // Planetas (Tokens Gold com Fundo Dark)
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
        {isSelected && (
          <circle
            cx={x} cy={y} r="20"
            className="fill-gold-500/20 animate-pulse"
          />
        )}
        <circle
          cx={x} cy={y} r="15"
          className={`${isSelected ? 'fill-gold-500' : 'fill-[#0f172a]'} transition-all duration-300 stroke-[#fbbf24]`}
          strokeWidth="2"
        />
        <text
          x={x} y={y}
          textAnchor="middle"
          dominantBaseline="central"
          className={`${isSelected ? 'fill-slate-950' : 'fill-[#fbbf24]'} font-bold transition-colors`}
          fontSize="18"
        >
          {planet.symbol}
        </text>
      </g>
    );
  });

  // Lotes (Tokens Dourados Compactos)
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
        <g key={lot.id} className="group">
          <circle 
            cx={x} cy={y} r="12" 
            className="fill-[#0f172a]/80 stroke-gold-400/50" 
            strokeDasharray="2 2" 
          />
          <text
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-gold-400 font-bold"
            fontSize="14"
          >
            {lot.symbol}
          </text>
          <title>{lot.name}</title>
        </g>
      );
    });

  return (
    <svg 
      viewBox="0 0 800 800" 
      className="w-full h-full font-sans"
    >
      {/* Background circles */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill="#0f172a" />
      <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#7c3aed" strokeWidth="2" />
      <circle cx={CX} cy={CY} r={R_ZODIAC_INNER} fill="none" stroke="#7c3aed" strokeWidth="1.5" />
      
      {/* Zodiac wedges */}
      {zodiacElements}

      {/* Internal houses area */}
      <circle cx={CX} cy={CY} r={R_HOUSES_INNER} fill="#020617" stroke="#475569" strokeWidth="2" />
      {houseElements}
      
      {/* Planets and Lots */}
      {planetElements}
      {lotElements}

      {/* Center Crosshair */}
      <g opacity="0.8">
        <circle cx={CX} cy={CY} r="12" fill="none" stroke="#64748b" strokeWidth="2" />
        <line x1={CX - 8} y1={CY} x2={CX + 8} y2={CY} stroke="#64748b" strokeWidth="2" />
        <line x1={CX} y1={CY - 8} x2={CX} y2={CY + 8} stroke="#64748b" strokeWidth="2" />
      </g>
    </svg>
  );
}

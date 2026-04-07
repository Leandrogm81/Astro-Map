import React from 'react';
import { Svg, Circle, Line, Text, G } from '@react-pdf/renderer';
import { NatalChart, PlanetPosition, ZODIAC_SIGNS } from '@/types';

interface ChartSimplePDFProps {
  chart: NatalChart;
  size?: number;
}

export default function ChartSimplePDF({ chart, size = 300 }: ChartSimplePDFProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 20;
  const signR = outerR - 15;
  const houseR = outerR * 0.78;
  const innerR = outerR * 0.42;
  const planetR = innerR * 0.65;

  const strokeColor = '#000000';
  const textColor = '#000000';
  const bgColor = '#ffffff';
  const lightStroke = '#333333';
  const mediumStroke = '#555555';

  const toAngle = (lon: number) => (lon - 90) * (Math.PI / 180);

  const signSymbols: Record<string, string> = {
    'Áries': '♈', 'Touro': '♉', 'Gêmeos': '♊', 'Câncer': '♋',
    'Leão': '♌', 'Virgem': '♍', 'Libra': '♎', 'Escorpião': '♏',
    'Sagitário': '♐', 'Capricórnio': '♑', 'Aquário': '♒', 'Peixes': '♓',
  };

  const planetSymbols: Record<string, string> = {
    'Sol': '☉', 'Lua': '☽', 'Mercúrio': '☿', 'Vênus': '♀',
    'Marte': '♂', 'Júpiter': '♃', 'Saturno': '♄', 'Urano': '♅',
    'Netuno': '♆', 'Plutão': '♇', 'North Node': '☊', 'Chiron': '⚷',
  };

  const aspectLines: { planet1: PlanetPosition; planet2: PlanetPosition; opacity: number }[] = [];
  
  const majorAspects = chart.aspects.filter(a =>
    ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type) && a.orb <= 6
  ).slice(0, 12);

  majorAspects.forEach(aspect => {
    const p1 = chart.planets.find(p => p.name === aspect.planet1);
    const p2 = chart.planets.find(p => p.name === aspect.planet2);
    if (p1 && p2) {
      const opacity = aspect.type === 'conjunction' || aspect.type === 'opposition' ? 0.6 : 0.35;
      aspectLines.push({ planet1: p1, planet2: p2, opacity });
    }
  });

  const planetPositions: { planet: PlanetPosition; x: number; y: number }[] = [];
  
  chart.planets.forEach((planet) => {
    const angle = toAngle(planet.longitude);
    let r = planetR;
    let attempts = 0;
    let overlap = true;

    while (overlap && attempts < 20) {
      overlap = false;
      const testX = cx + r * Math.cos(angle);
      const testY = cy + r * Math.sin(angle);

      for (const pos of planetPositions) {
        const dx = pos.x - testX;
        const dy = pos.y - testY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 16) {
          overlap = true;
          r += 10;
          if (r > innerR * 0.85) {
            overlap = false;
            break;
          }
          break;
        }
      }
      attempts++;
    }

    planetPositions.push({
      planet,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy} r={outerR + 10} fill={bgColor} stroke={strokeColor} strokeWidth="1.5" />

      <Circle cx={cx} cy={cy} r={outerR} fill="none" stroke={strokeColor} strokeWidth="1.2" />

      <Circle cx={cx} cy={cy} r={signR} fill="none" stroke={lightStroke} strokeWidth="0.5" />

      {ZODIAC_SIGNS.map((sign, i) => {
        const angle = toAngle(sign.start);
        const x1 = cx + signR * Math.cos(angle);
        const y1 = cy + signR * Math.sin(angle);
        const x2 = cx + outerR * Math.cos(angle);
        const y2 = cy + outerR * Math.sin(angle);
        return (
          <Line
            key={`slice-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth="0.6"
          />
        );
      })}

      {ZODIAC_SIGNS.map((sign, i) => {
        const midAngle = toAngle(sign.start + 15);
        const textR = (signR + outerR) / 2;
        const x = cx + textR * Math.cos(midAngle);
        const y = cy + textR * Math.sin(midAngle);
        
        return (
          <Text
            key={`sign-${i}`}
            x={x}
            y={y + 3}
            style={{
              fontSize: 9,
              textAlign: 'center',
              fill: textColor,
              fontWeight: 'bold',
            }}
          >
            {signSymbols[sign.name] || sign.name.substring(0, 3)}
          </Text>
        );
      })}

      <Circle cx={cx} cy={cy} r={houseR} fill="none" stroke={mediumStroke} strokeWidth="0.8" />

      {chart.housesPlacidus.map((house) => {
        const angle = toAngle(house.longitude);
        const x2 = cx + houseR * Math.cos(angle);
        const y2 = cy + houseR * Math.sin(angle);
        const numX = cx + (houseR + 6) * Math.cos(angle);
        const numY = cy + (houseR + 6) * Math.sin(angle);

        const isASC = house.number === 1;
        const isMC = house.number === 10;

        return (
          <G key={`house-${house.number}`}>
            <Line
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth={isASC || isMC ? 1.2 : 0.5}
              strokeOpacity={isASC || isMC ? 1 : 0.5}
            />
            <Text
              x={numX}
              y={numY + 2}
              style={{
                fontSize: 6,
                textAlign: 'center',
                fill: textColor,
                fontWeight: isASC || isMC ? 'bold' : 'normal',
              }}
            >
              {house.number}
            </Text>
          </G>
        );
      })}

      {aspectLines.map((aspect, i) => {
        const angle1 = toAngle(aspect.planet1.longitude);
        const angle2 = toAngle(aspect.planet2.longitude);
        const r = innerR * 0.55;
        
        return (
          <Line
            key={`aspect-${i}`}
            x1={cx + r * Math.cos(angle1)}
            y1={cy + r * Math.sin(angle1)}
            x2={cx + r * Math.cos(angle2)}
            y2={cy + r * Math.sin(angle2)}
            stroke={strokeColor}
            strokeWidth="0.4"
            strokeOpacity={aspect.opacity}
          />
        );
      })}

      <Circle cx={cx} cy={cy} r={innerR} fill={bgColor} stroke={strokeColor} strokeWidth="1" />

      {planetPositions.map(({ planet, x, y }) => (
        <G key={`planet-${planet.name}`}>
          <Circle cx={x} cy={y} r={7} fill={bgColor} stroke={strokeColor} strokeWidth="0.6" />
          <Text
            x={x}
            y={y + 3}
            style={{
              fontSize: 8,
              textAlign: 'center',
              fill: textColor,
              fontWeight: 'bold',
            }}
          >
            {planetSymbols[planet.name] || planet.name.substring(0, 2)}
          </Text>
          {planet.retrograde && (
            <Text
              x={x + 8}
              y={y - 5}
              style={{
                fontSize: 5,
                fill: textColor,
                fontWeight: 'bold',
              }}
            >
              ℞
            </Text>
          )}
        </G>
      ))}

      <Circle cx={cx} cy={cy} r={14} fill={bgColor} stroke={strokeColor} strokeWidth="1.2" />
      
      {(() => {
        const sunPlanet = chart.planets.find(p => p.name === 'Sol');
        const sunSign = sunPlanet?.sign || '';
        const sunSymbol = signSymbols[sunSign] || '♈';
        
        return (
          <Text
            x={cx}
            y={cy + 4}
            style={{
              fontSize: 11,
              textAlign: 'center',
              fill: textColor,
              fontWeight: 'bold',
            }}
          >
            {sunSymbol}
          </Text>
        );
      })()}
    </Svg>
  );
}

export default function ChartSimplePDF({ chart, size = 300 }: ChartSimplePDFProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 35; // Radius for sign names
  const houseR = outerR * 0.82; // Radius for house lines
  const innerR = outerR * 0.45; // Inner circle radius
  const planetR = innerR + 20;  // Base radius for planet names

  // Black and white colors only
  const strokeColor = '#000000';
  const textColor = '#000000';
  const bgColor = '#ffffff';

  // Convert ecliptic longitude to angle (0° = Aries = right side)
  const toAngle = (lon: number) => (lon - 90) * (Math.PI / 180);

  // Sign abbreviations for display
  const signNames: Record<string, string> = {
    'Áries': 'Áries',
    'Touro': 'Touro',
    'Gêmeos': 'Gêmeos',
    'Câncer': 'Câncer',
    'Leão': 'Leão',
    'Virgem': 'Virgem',
    'Libra': 'Libra',
    'Escorpião': 'Escorpião',
    'Sagitário': 'Sagitário',
    'Capricórnio': 'Capricórnio',
    'Aquário': 'Aquário',
    'Peixes': 'Peixes',
  };

  // Calculate planet positions avoiding overlap
  const planetPositions: { planet: PlanetPosition; x: number; y: number }[] = [];
  
  chart.planets.forEach((planet) => {
    const angle = toAngle(planet.longitude);
    let r = planetR;
    let attempts = 0;
    let overlap = true;

    while (overlap && attempts < 15) {
      overlap = false;
      const testX = cx + r * Math.cos(angle);
      const testY = cy + r * Math.sin(angle);

      for (const pos of planetPositions) {
        const dx = pos.x - testX;
        const dy = pos.y - testY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 20) {
          overlap = true;
          r += 12;
          break;
        }
      }
      attempts++;
    }

    planetPositions.push({
      planet,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <Circle cx={cx} cy={cy} r={outerR + 25} fill={bgColor} stroke={strokeColor} strokeWidth="2" />

      {/* Outer zodiac circle */}
      <Circle cx={cx} cy={cy} r={outerR} fill={bgColor} stroke={strokeColor} strokeWidth="1.5" />

      {/* Zodiac slice lines (12 divisions) */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const angle = toAngle(sign.start);
        const x2 = cx + outerR * Math.cos(angle);
        const y2 = cy + outerR * Math.sin(angle);
        return (
          <Line
            key={`slice-${i}`}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth="0.5"
          />
        );
      })}

      {/* Sign names positioned outside the circle */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const midAngle = toAngle(sign.start + 15);
        const textR = outerR + 18;
        const x = cx + textR * Math.cos(midAngle);
        const y = cy + textR * Math.sin(midAngle);
        
        return (
          <Text
            key={`sign-${i}`}
            x={x}
            y={y + 2}
            style={{
              fontSize: 5,
              textAlign: 'center',
              fill: textColor,
              fontWeight: 'bold',
            }}
          >
            {signNames[sign.name] || sign.name.substring(0, 3)}
          </Text>
        );
      })}

      {/* House circle (inner boundary for houses) */}
      <Circle cx={cx} cy={cy} r={houseR} fill="none" stroke={strokeColor} strokeWidth="0.5" strokeOpacity="0.5" />

      {/* House lines with numbers */}
      {chart.housesPlacidus.map((house) => {
        const angle = toAngle(house.longitude);
        const x2 = cx + houseR * Math.cos(angle);
        const y2 = cy + houseR * Math.sin(angle);
        const numX = cx + (houseR + 8) * Math.cos(angle);
        const numY = cy + (houseR + 8) * Math.sin(angle);

        const isASC = house.number === 1;
        const isMC = house.number === 10;

        return (
          <G key={`house-${house.number}`}>
            <Line
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth={isASC || isMC ? 1.5 : 0.5}
              strokeOpacity={isASC || isMC ? 1 : 0.4}
            />
            <Text
              x={numX}
              y={numY + 2}
              style={{
                fontSize: 5,
                textAlign: 'center',
                fill: textColor,
                fontWeight: isASC || isMC ? 'bold' : 'normal',
              }}
            >
              {house.number}
            </Text>
          </G>
        );
      })}

      {/* Inner circle (planet area boundary) */}
      <Circle cx={cx} cy={cy} r={innerR} fill={bgColor} stroke={strokeColor} strokeWidth="1" />

      {/* Planet names */}
      {planetPositions.map(({ planet, x, y }) => (
        <G key={`planet-${planet.name}`}>
          <Text
            x={x}
            y={y + 2}
            style={{
              fontSize: 4.5,
              textAlign: 'center',
              fill: textColor,
              fontWeight: 'bold',
            }}
          >
            {planet.name}
          </Text>
          {planet.retrograde && (
            <Text
              x={x + 12}
              y={y - 3}
              style={{
                fontSize: 4,
                fill: textColor,
                fontWeight: 'bold',
              }}
            >
              R
            </Text>
          )}
        </G>
      ))}

      {/* Center circle */}
      <Circle cx={cx} cy={cy} r={12} fill={bgColor} stroke={strokeColor} strokeWidth="1" />
    </Svg>
  );
}

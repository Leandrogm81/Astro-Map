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

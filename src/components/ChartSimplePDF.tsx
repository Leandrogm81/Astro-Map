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
  const outerR = size / 2 - 22;
  const signR = outerR - 14;
  const tickR = outerR - 3;
  const houseR = outerR * 0.75;
  const aspectR = outerR * 0.55;
  const innerR = outerR * 0.38;

  const strokeColor = '#000000';
  const textColor = '#000000';
  const bgColor = '#ffffff';
  const mediumStroke = '#555555';

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

  const ascLongitude = chart.ascendant;

  const toAngle = (lon: number) => {
    const rotatedLon = (lon - ascLongitude + 180) % 360;
    return (rotatedLon - 90) * (Math.PI / 180);
  };

  const formatDegree = (lon: number): string => {
    const deg = Math.floor(lon % 30);
    return `${deg}°`;
  };

  const getSignFromLongitude = (lon: number): string => {
    const signIndex = Math.floor(((lon % 360) + 360) % 360 / 30);
    return ZODIAC_SIGNS[signIndex]?.name || '';
  };

  const ticks: { angle: number; isMajor: boolean; isMinor: boolean }[] = [];
  for (let i = 0; i < 360; i++) {
    const angle = toAngle(i);
    const isMajor = i % 30 === 0;
    const isMinor = i % 5 === 0;
    ticks.push({ angle, isMajor, isMinor });
  }

  const aspectLines: { planet1: PlanetPosition; planet2: PlanetPosition; opacity: number; isStrong: boolean }[] = [];

  const majorAspects = chart.aspects.filter(a =>
    ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type) && a.orb <= 8
  ).slice(0, 20);

  majorAspects.forEach(aspect => {
    const p1 = chart.planets.find(p => p.name === aspect.planet1);
    const p2 = chart.planets.find(p => p.name === aspect.planet2);
    if (p1 && p2) {
      const isStrong = aspect.type === 'conjunction' || aspect.type === 'opposition' || aspect.type === 'square' || aspect.type === 'trine';
      const opacity = isStrong ? 0.5 : 0.25;
      aspectLines.push({ planet1: p1, planet2: p2, opacity, isStrong });
    }
  });

  const planetPositions: { planet: PlanetPosition; x: number; y: number }[] = [];

  const planetBaseR = innerR * 0.5;

  chart.planets.forEach((planet) => {
    const angle = toAngle(planet.longitude);
    let r = planetBaseR;
    let attempts = 0;
    let overlap = true;

    while (overlap && attempts < 25) {
      overlap = false;
      const testX = cx + r * Math.cos(angle);
      const testY = cy + r * Math.sin(angle);

      for (const pos of planetPositions) {
        const dx = pos.x - testX;
        const dy = pos.y - testY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 18) {
          overlap = true;
          r += 10;
          if (r > innerR * 0.8) {
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

  const axisLabelR = outerR + 14;

  const ascAngle = toAngle(ascLongitude);
  const mcLongitude = chart.mc;
  const mcAngle = toAngle(mcLongitude);
  const dcLongitude = (ascLongitude + 180) % 360;
  const icLongitude = (mcLongitude + 180) % 360;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy} r={outerR + 18} fill={bgColor} stroke={strokeColor} strokeWidth="1.8" />

      <Circle cx={cx} cy={cy} r={outerR} fill="none" stroke={strokeColor} strokeWidth="1.2" />
      <Circle cx={cx} cy={cy} r={signR} fill="none" stroke={mediumStroke} strokeWidth="0.4" />
      <Circle cx={cx} cy={cy} r={tickR} fill="none" stroke={strokeColor} strokeWidth="0.8" />

      {ticks.map((tick, i) => {
        if (i % 30 === 0) return null;
        const outerTickR = tickR;
        let innerTickR = tickR - 2;
        if (tick.isMinor) {
          innerTickR = tickR - 4;
        }
        return (
          <Line
            key={`tick-${i}`}
            x1={cx + innerTickR * Math.cos(tick.angle)}
            y1={cy + innerTickR * Math.sin(tick.angle)}
            x2={cx + outerTickR * Math.cos(tick.angle)}
            y2={cy + outerTickR * Math.sin(tick.angle)}
            stroke={tick.isMinor ? strokeColor : mediumStroke}
            strokeWidth={tick.isMinor ? 0.4 : 0.2}
          />
        );
      })}

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
            strokeWidth="0.8"
          />
        );
      })}

      {ZODIAC_SIGNS.map((sign, i) => {
        const midAngle = toAngle(sign.start + 15);
        const textR = (signR + tickR) / 2;
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

      <Circle cx={cx} cy={cy} r={houseR} fill="none" stroke={mediumStroke} strokeWidth="0.6" />

      {chart.housesPlacidus.map((house) => {
        const angle = toAngle(house.longitude);
        const x2 = cx + houseR * Math.cos(angle);
        const y2 = cy + houseR * Math.sin(angle);
        const numX = cx + (houseR + 7) * Math.cos(angle);
        const numY = cy + (houseR + 7) * Math.sin(angle);

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
              strokeWidth={isASC || isMC ? 0.3 : 0.2}
              strokeOpacity={isASC || isMC ? 0.3 : 0.3}
            />
            {!isASC && !isMC && (
              <Text
                x={numX}
                y={numY + 2}
                style={{
                  fontSize: 5,
                  textAlign: 'center',
                  fill: mediumStroke,
                }}
              >
                {house.number}
              </Text>
            )}
          </G>
        );
      })}

      <Line
        x1={cx + (outerR + 16) * Math.cos(ascAngle)}
        y1={cy + (outerR + 16) * Math.sin(ascAngle)}
        x2={cx + (outerR + 16) * Math.cos(ascAngle + Math.PI)}
        y2={cy + (outerR + 16) * Math.sin(ascAngle + Math.PI)}
        stroke={strokeColor}
        strokeWidth="1"
        strokeOpacity="0.6"
      />

      <Line
        x1={cx + (outerR + 16) * Math.cos(mcAngle)}
        y1={cy + (outerR + 16) * Math.sin(mcAngle)}
        x2={cx + (outerR + 16) * Math.cos(mcAngle + Math.PI)}
        y2={cy + (outerR + 16) * Math.sin(mcAngle + Math.PI)}
        stroke={strokeColor}
        strokeWidth="1"
        strokeOpacity="0.6"
      />

      <Text
        x={cx + axisLabelR * Math.cos(ascAngle)}
        y={cy + axisLabelR * Math.sin(ascAngle) + 3}
        style={{
          fontSize: 6,
          textAlign: 'center',
          fill: textColor,
          fontWeight: 'bold',
        }}
      >
        AC
      </Text>

      <Text
        x={cx + axisLabelR * Math.cos(mcAngle)}
        y={cy + axisLabelR * Math.sin(mcAngle) + 3}
        style={{
          fontSize: 6,
          textAlign: 'center',
          fill: textColor,
          fontWeight: 'bold',
        }}
      >
        MC
      </Text>

      {aspectLines.map((aspect, i) => {
        const angle1 = toAngle(aspect.planet1.longitude);
        const angle2 = toAngle(aspect.planet2.longitude);
        const r = aspectR;
        
        return (
          <Line
            key={`aspect-${i}`}
            x1={cx + r * Math.cos(angle1)}
            y1={cy + r * Math.sin(angle1)}
            x2={cx + r * Math.cos(angle2)}
            y2={cy + r * Math.sin(angle2)}
            stroke={strokeColor}
            strokeWidth={aspect.isStrong ? 0.5 : 0.3}
            strokeOpacity={aspect.opacity}
            strokeDasharray={aspect.isStrong ? undefined : '3,2'}
          />
        );
      })}

      <Circle cx={cx} cy={cy} r={innerR} fill={bgColor} stroke={strokeColor} strokeWidth="1" />

      {planetPositions.map(({ planet, x, y }) => {
        const isRetrograde = planet.retrograde;
        return (
          <G key={`planet-${planet.name}`}>
            <Circle cx={x} cy={y} r={8} fill={bgColor} stroke={strokeColor} strokeWidth="0.5" />
            <Text
              x={x - 2}
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
            <Text
              x={x + 10}
              y={y + 1}
              style={{
                fontSize: 4,
                fill: textColor,
              }}
            >
              {formatDegree(planet.longitude)}
            </Text>
            {isRetrograde && (
              <Text
                x={x + 10}
                y={y + 6}
                style={{
                  fontSize: 5,
                  fill: textColor,
                  fontWeight: 'bold',
                }}
              >
                R
              </Text>
            )}
          </G>
        );
      })}

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

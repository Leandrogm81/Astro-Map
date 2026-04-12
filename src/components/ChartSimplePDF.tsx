import React from 'react';
import { Svg, Circle, Line, Text, G, Path } from '@react-pdf/renderer';
import { NatalChart, PlanetPosition, ZODIAC_SIGNS } from '@/types';

interface ChartSimplePDFProps {
  chart: NatalChart;
  size?: number;
}

export default function ChartSimplePDF({ chart, size = 350 }: ChartSimplePDFProps) {
  const cx = size / 2;
  const cy = size / 2;
  
  // Geometria (Inspirada no Astro-Seek)
  const outerR = size / 2 - 25;
  const signsOuterR = outerR;
  const signsInnerR = outerR - 22;
  const ticksR = outerR - 2;
  const housesR = signsInnerR;
  const aspectsR = housesR - 35;
  const innerR = housesR - 45;

  const strokeColor = '#000000';
  const textColor = '#000000';
  const bgColor = '#ffffff';
  const mediumStroke = '#666666';
  const liteStroke = '#cccccc';

  const signSymbols: Record<string, string> = {
    'Áries': '♈', 'Touro': '♉', 'Gêmeos': '♊', 'Câncer': '♋',
    'Leão': '♌', 'Virgem': '♍', 'Libra': '♎', 'Escorpião': '♏',
    'Sagitário': '♐', 'Capricórnio': '♑', 'Aquário': '♒', 'Peixes': '♓',
  };

  const planetSymbols: Record<string, string> = {
    'Sol': '☉', 'Lua': '☽', 'Mercúrio': '☿', 'Vênus': '♀',
    'Marte': '♂', 'Júpiter': '♃', 'Saturno': '♄', 'Urano': '♅',
    'Netuno': '♆', 'Plutão': '♇', 
    'Nodo Norte': '☊', 'Quíron': '⚷', 'Lilith': '⚸', 'Roda da Fortuna': '⊗',
    'North Node': '☊', 'Chiron': '⚷'
  };

  const ascendantDegree = chart.ascendant || chart.housesPlacidus.find(h => h.number === 1)?.longitude || 0;

  // A função converte a longitude para radianos, ajustando de forma que o Ascendente fique na esquerda (180° = Math.PI)
  // e o zodíaco cresça no sentido anti-horário.
  const toAngle = (deg: number) => {
    const diff = deg - ascendantDegree;
    const angleDeg = 180 + diff;
    return angleDeg * (Math.PI / 180);
  };

  const describeArc = (radius: number, startAngle: number, endAngle: number) => {
    const startX = cx + radius * Math.cos(startAngle);
    const startY = cy + radius * Math.sin(startAngle);
    const endX = cx + radius * Math.cos(endAngle);
    const endY = cy + radius * Math.sin(endAngle);
    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Círculo Principal */}
      <Circle cx={cx} cy={cy} r={outerR + 20} fill={bgColor} />
      
      {/* Ticks Externos (360 graus) */}
      {[...Array(360)].map((_, i) => {
        if (i % 5 !== 0) return null;
        const angle = toAngle(i);
        const isMajor = i % 30 === 0;
        const r1 = ticksR;
        const r2 = isMajor ? ticksR - 5 : ticksR - 2;
        return (
          <Line
            key={`pdf-tick-${i}`}
            x1={cx + r1 * Math.cos(angle)}
            y1={cy + r1 * Math.sin(angle)}
            x2={cx + r2 * Math.cos(angle)}
            y2={cy + r2 * Math.sin(angle)}
            stroke={strokeColor}
            strokeWidth={isMajor ? 0.6 : 0.3}
          />
        );
      })}

      {/* Anel de Signos (Arcos) */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const start = toAngle(sign.start);
        const end = toAngle(sign.start + 30);
        const mid = toAngle(sign.start + 15);
        const symbolR = (signsOuterR + signsInnerR) / 2;

        return (
          <G key={`pdf-sign-${i}`}>
            <Path
              d={describeArc(signsOuterR, start, end)}
              stroke={strokeColor}
              strokeWidth="0.8"
              fill="none"
            />
            <Path
              d={describeArc(signsInnerR, start, end)}
              stroke={strokeColor}
              strokeWidth="0.6"
              fill="none"
            />
            {/* Divisórias de signos */}
            <Line
              x1={cx + signsOuterR * Math.cos(start)}
              y1={cy + signsOuterR * Math.sin(start)}
              x2={cx + signsInnerR * Math.cos(start)}
              y2={cy + signsInnerR * Math.sin(start)}
              stroke={strokeColor}
              strokeWidth="0.8"
            />
            {/* Símbolo do Signo */}
            <Text
              x={cx + symbolR * Math.cos(mid) - 4}
              y={cy + symbolR * Math.sin(mid) + 4}
              style={{ fontSize: 10, fill: textColor, fontFamily: 'DejaVu Sans' }}
            >
              {signSymbols[sign.name]}
            </Text>
          </G>
        );
      })}

      {/* Linhas das Casas */}
      {chart.housesPlacidus.map((house) => {
        const angle = toAngle(house.longitude);
        const isAngular = [1, 4, 7, 10].includes(house.number);
        const labelR = housesR - 10;

        return (
          <G key={`pdf-house-${house.number}`}>
            <Line
              x1={cx + housesR * Math.cos(angle)}
              y1={cy + housesR * Math.sin(angle)}
              x2={cx + innerR * Math.cos(angle)}
              y2={cy + innerR * Math.sin(angle)}
              stroke={isAngular ? strokeColor : mediumStroke}
              strokeWidth={isAngular ? 0.6 : 0.3}
            />
            {/* Números das casas */}
            {!isAngular && (
              <Text
                x={cx + labelR * Math.cos(angle + 0.15) - 2}
                y={cy + labelR * Math.sin(angle + 0.15) + 2}
                style={{ fontSize: 6, fill: mediumStroke }}
              >
                {house.number}
              </Text>
            )}
          </G>
        );
      })}

      {/* Aspectos Removidos por solicitação do usuário para simplificar a versão impressa */}

      {/* Inner Circle (White out for aspects) */}
      <Circle cx={cx} cy={cy} r={innerR} fill="none" stroke={liteStroke} strokeWidth="0.5" />

      {/* Planetas */}
      {chart.planets.map((planet) => {
        const angle = toAngle(planet.longitude);
        // Distribuímos os planetas no anel entre houses e inner
        const planetR = housesR - 18;
        const x = cx + planetR * Math.cos(angle);
        const y = cy + planetR * Math.sin(angle);

        return (
          <G key={`pdf-planet-${planet.name}`}>
            {/* Background circle for clarity */}
            <Circle cx={x} cy={y} r={7} fill={bgColor} />
            {/* Símbolo do Planeta */}
            <Text
              x={x - 4}
              y={y + 4}
              style={{ fontSize: 10, fill: textColor, fontFamily: 'DejaVu Sans' }}
            >
              {planetSymbols[planet.name] || planet.name.substring(0, 1)}
            </Text>
            {planet.retrograde && (
              <Text
                x={x + 3}
                y={y + 5}
                style={{ fontSize: 4, fill: '#ef4444' }}
              >
                R
              </Text>
            )}
          </G>
        );
      })}

      {/* Eixos Principais (AC/MC) */}
      {(() => {
        const ascAngle = toAngle(chart.ascendant);
        const mcAngle = toAngle(chart.mc);
        return (
          <G>
            {/* Ascendente */}
            <Line
              x1={cx + (signsOuterR + 15) * Math.cos(ascAngle)}
              y1={cy + (signsOuterR + 15) * Math.sin(ascAngle)}
              x2={cx + innerR * Math.cos(ascAngle)}
              y2={cy + innerR * Math.sin(ascAngle)}
              stroke={strokeColor}
              strokeWidth="1.2"
            />
            {/* Meio do Céu */}
            <Line
              x1={cx + (signsOuterR + 15) * Math.cos(mcAngle)}
              y1={cy + (signsOuterR + 15) * Math.sin(mcAngle)}
              x2={cx + innerR * Math.cos(mcAngle)}
              y2={cy + innerR * Math.sin(mcAngle)}
              stroke={strokeColor}
              strokeWidth="1"
            />
            <Text
              x={cx + (signsOuterR + 18) * Math.cos(ascAngle) - 4}
              y={cy + (signsOuterR + 18) * Math.sin(ascAngle) + 3}
              style={{ fontSize: 7, fill: textColor, fontWeight: 'bold' }}
            >
              AC
            </Text>
            <Text
              x={cx + (signsOuterR + 18) * Math.cos(mcAngle) - 4}
              y={cy + (signsOuterR + 18) * Math.sin(mcAngle) + 3}
              style={{ fontSize: 7, fill: textColor, fontWeight: 'bold' }}
            >
              MC
            </Text>
          </G>
        );
      })()}

      <Circle cx={cx} cy={cy} r={10} fill={bgColor} stroke={strokeColor} strokeWidth="0.8" />
    </Svg>
  );
}

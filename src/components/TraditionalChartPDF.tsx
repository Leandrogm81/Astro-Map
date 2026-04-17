import React from 'react';
import { Svg, Circle, Line, Text, G, Path, Rect } from '@react-pdf/renderer';
import { NatalChart, ZODIAC_SIGNS, PLANETS, PlanetPosition } from '@/types';
import { EGYPTIAN_TERMS, getFaceRuler } from '@/lib/traditional/dignities';
import {
  getTraditionalAxisLongitudes,
  getTraditionalWheelAnchor,
  longitudeToTraditionalAngle
} from '@/lib/traditional/wheelGeometry';

interface TraditionalChartPDFProps {
  chart: NatalChart;
  size?: number;
}

const SIGN_COLORS: Record<string, string> = {
  'Áries': '#f87171',
  'Touro': '#34d399',
  'Gêmeos': '#fbbf24',
  'Câncer': '#60a5fa',
  'Leão': '#f472b6',
  'Virgem': '#22c55e',
  'Libra': '#fbbf24',
  'Escorpião': '#38bdf8',
  'Sagitário': '#ec4899',
  'Capricórnio': '#22c55e',
  'Aquário': '#7c3aed',
  'Peixes': '#60a5fa'
};

const PLANET_SYMBOLS: Record<string, string> = {
  'Sol': '☉',
  'Lua': '☽',
  'Mercúrio': '☿',
  'Vênus': '♀',
  'Marte': '♂',
  'Júpiter': '♃',
  'Saturno': '♄',
  'Urano': '♅',
  'Netuno': '♆',
  'Plutão': '♇',
  'North Node': '☊',
  'Chiron': '⚷',
  'Lilith': '⚸',
  'Roda da Fortuna': '⊗',
  'Fortune': '⊗',
  'Spirit': '🕊️'
};

const ASPECT_COLORS: Record<string, string> = {
  trine: '#10b981',
  sextile: '#3b82f6',
  square: '#ef4444',
  opposition: '#f97316',
  conjunction: '#fbbf24'
};

export default function TraditionalChartPDF({ chart, size = 350 }: TraditionalChartPDFProps) {
  const cx = size / 2;
  const cy = size / 2;

  const outerR = size / 2 - 14;
  const signsOuterR = outerR;
  const signsInnerR = outerR - 30;

  const termsOuterR = signsInnerR;
  const termsInnerR = signsInnerR - 14;
  const decansOuterR = termsInnerR;
  const decansInnerR = termsInnerR - 12;

  const housesR = decansInnerR;
  const innerR = housesR - 62;
  const planetR = housesR - 20;

  const bgColor = '#050816';
  const panelColor = '#0b1220';
  const ringColor = '#7c3aed';
  const accentGold = '#fbbf24';
  const accentOrange = '#f59e0b';
  const gridStroke = '#24324b';
  const labelColor = '#94a3b8';

  const asc = getTraditionalWheelAnchor(chart);
  const toAngle = (lon: number) => longitudeToTraditionalAngle(lon, asc);

  const getArcPath = (startLon: number, endLon: number, rOut: number, rIn: number) => {
    const startAngle = toAngle(startLon);
    const endAngle = toAngle(endLon);

    const x1 = cx + rOut * Math.cos(startAngle);
    const y1 = cy + rOut * Math.sin(startAngle);
    const x2 = cx + rOut * Math.cos(endAngle);
    const y2 = cy + rOut * Math.sin(endAngle);
    const x3 = cx + rIn * Math.cos(endAngle);
    const y3 = cy + rIn * Math.sin(endAngle);
    const x4 = cx + rIn * Math.cos(startAngle);
    const y4 = cy + rIn * Math.sin(startAngle);

    return `M ${x1} ${y1} A ${rOut} ${rOut} 0 0 0 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 0 1 ${x4} ${y4} Z`;
  };

  const axisText = (lon: number, label: string, isPrimary = false) => {
    const angle = toAngle(lon);
    const r = signsOuterR + 9;
    return (
      <G key={label}>
        <Line
          x1={cx + signsOuterR * Math.cos(angle)}
          y1={cy + signsOuterR * Math.sin(angle)}
          x2={cx + (housesR - 6) * Math.cos(angle)}
          y2={cy + (housesR - 6) * Math.sin(angle)}
          stroke={accentGold}
          strokeWidth={isPrimary ? 1.8 : 1.2}
          opacity={0.9}
        />
        <Text
          x={cx + r * Math.cos(angle) - 9}
          y={cy + r * Math.sin(angle) + 4}
          style={{ fontSize: 10, fill: accentOrange, fontWeight: 'bold', fontFamily: 'DejaVu Sans' }}
        >
          {label}
        </Text>
      </G>
    );
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect x={0} y={0} width={size} height={size} fill={bgColor} />

      <Circle cx={cx} cy={cy} r={outerR} fill={panelColor} stroke={ringColor} strokeWidth="1.5" opacity={0.98} />

      {ZODIAC_SIGNS.map((sign, i) => {
        const start = i * 30;
        const color = SIGN_COLORS[sign.name] || '#94a3b8';
        const midAngle = toAngle(start + 15);
        const badgeR = signsOuterR - 14;
        const badgeX = cx + badgeR * Math.cos(midAngle) - 8;
        const badgeY = cy + badgeR * Math.sin(midAngle) - 8;
        return (
          <G key={`sign-${i}`}>
            <Path
              d={getArcPath(start, start + 30, signsOuterR, signsInnerR)}
              fill={`${color}18`}
              stroke={color}
              strokeWidth="1"
              opacity={0.95}
            />
            <Rect x={badgeX} y={badgeY} width={16} height={16} rx={4} fill="#8b5cf6" opacity={0.95} />
            <Text
              x={cx + badgeR * Math.cos(midAngle) - 4.5}
              y={cy + badgeR * Math.sin(midAngle) + 4.5}
              style={{ fontSize: 9, fill: '#ffffff', fontFamily: 'DejaVu Sans', fontWeight: 'bold' }}
            >
              {sign.symbol}
            </Text>
          </G>
        );
      })}

      {[...Array(360)].map((_, i) => {
        if (i % 5 !== 0) return null;
        const angle = toAngle(i);
        const isMain = i % 30 === 0;
        const r1 = signsInnerR;
        const r2 = isMain ? r1 - 10 : r1 - 4;

        return (
          <Line
            key={`tick-${i}`}
            x1={cx + r1 * Math.cos(angle)}
            y1={cy + r1 * Math.sin(angle)}
            x2={cx + r2 * Math.cos(angle)}
            y2={cy + r2 * Math.sin(angle)}
            stroke={isMain ? '#475569' : gridStroke}
            strokeWidth={isMain ? 1.2 : 0.5}
            opacity={0.7}
          />
        );
      })}

      {ZODIAC_SIGNS.map((sign) => {
        const signStart = ZODIAC_SIGNS.indexOf(sign) * 30;
        const termsData = EGYPTIAN_TERMS[sign.name as keyof typeof EGYPTIAN_TERMS];
        if (!termsData) return null;
        let lastLimit = 0;

        return termsData.map((term, ti) => {
          const start = signStart + lastLimit;
          const end = signStart + term.limit;
          const midAngle = toAngle((start + end) / 2);
          const tr = (termsOuterR + termsInnerR) / 2;
          const planetInfo = PLANETS.find(p => p.id === term.planet.toLowerCase());
          const symbol = planetInfo?.symbol || term.planet[0];

          lastLimit = term.limit;

          return (
            <G key={`term-${sign.name}-${ti}`}>
              <Path d={getArcPath(start, end, termsOuterR, termsInnerR)} fill="none" stroke={colorForSign(sign.name)} strokeWidth="0.35" opacity="0.22" />
              <Text
                x={cx + tr * Math.cos(midAngle) - 2.5}
                y={cy + tr * Math.sin(midAngle) + 2.5}
                style={{ fontSize: 7, fill: '#cbd5e1', fontFamily: 'DejaVu Sans' }}
              >
                {symbol}
              </Text>
            </G>
          );
        });
      })}

      {ZODIAC_SIGNS.map((sign, si) => {
        const signStart = si * 30;
        return [0, 10, 20].map((d) => {
          const rulerId = getFaceRuler(sign.name as any, d);
          if (!rulerId) return null;
          const planetInfo = PLANETS.find(p => p.id === rulerId.toLowerCase());
          const symbol = planetInfo?.symbol || rulerId[0];
          const start = signStart + d;
          const end = start + 10;
          const midAngle = toAngle(start + 5);
          const dr = (decansOuterR + decansInnerR) / 2;

          return (
            <G key={`face-${si}-${d}`}>
              <Path d={getArcPath(start, end, decansOuterR, decansInnerR)} fill="none" stroke={colorForSign(sign.name)} strokeWidth="0.3" opacity="0.18" />
              <Text
                x={cx + dr * Math.cos(midAngle) - 1.8}
                y={cy + dr * Math.sin(midAngle) + 1.8}
                style={{ fontSize: 4, fill: '#60a5fa', fontFamily: 'DejaVu Sans' }}
              >
                {symbol}
              </Text>
            </G>
          );
        });
      })}

      {[...Array(12)].map((_, i) => {
        const house = chart.housesPlacidus[i];
        const houseStartLon = house?.longitude ?? ((asc + i * 30) % 360);
        const angle = toAngle(houseStartLon);
        const isAngular = i === 0 || i === 3 || i === 6 || i === 9;
        const midHouseAngle = toAngle(houseStartLon + 15);
        const numR = housesR - 10;

        return (
          <G key={`house-${i + 1}`}>
            <Line
              x1={cx + housesR * Math.cos(angle)}
              y1={cy + housesR * Math.sin(angle)}
              x2={cx + innerR * Math.cos(angle)}
              y2={cy + innerR * Math.sin(angle)}
              stroke={isAngular ? accentGold : '#6d28d9'}
              strokeWidth={isAngular ? 1.6 : 0.8}
              opacity={isAngular ? 0.95 : 0.45}
            />
            <Text
              x={cx + numR * Math.cos(midHouseAngle) - 2.5}
              y={cy + numR * Math.sin(midHouseAngle) + 2.5}
              style={{
                fontSize: 8,
                fill: isAngular ? '#e2e8f0' : labelColor,
                fontWeight: isAngular ? 'bold' : 'normal',
                fontFamily: 'DejaVu Sans'
              }}
            >
              {i + 1}
            </Text>
          </G>
        );
      })}

      {chart.aspects && chart.aspects.filter(a => a.orb <= 5).map((a, ai) => {
        if (!a.planet1 || !a.planet2) return null;
        const p1 = chart.planets.find(pp => pp.name === a.planet1 || (pp.id && pp.id.toLowerCase() === a.planet1.toLowerCase()));
        const p2 = chart.planets.find(pp => pp.name === a.planet2 || (pp.id && pp.id.toLowerCase() === a.planet2.toLowerCase()));
        if (!p1 || !p2) return null;

        const a1 = toAngle(p1.longitude);
        const a2 = toAngle(p2.longitude);
        const color = ASPECT_COLORS[a.type] || '#94a3b8';

        return (
          <Line
            key={`aspect-${ai}`}
            x1={cx + (innerR - 2) * Math.cos(a1)}
            y1={cy + (innerR - 2) * Math.sin(a1)}
            x2={cx + (innerR - 2) * Math.cos(a2)}
            y2={cy + (innerR - 2) * Math.sin(a2)}
            stroke={color}
            strokeWidth="0.8"
            opacity="0.32"
            strokeDasharray={a.orb > 3 ? '2,2' : 'none'}
          />
        );
      })}

      {(() => {
        const classic = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
        let planetsToRender = chart.planets.filter(p => classic.includes(p.name));

        if (chart.lots) {
          const lotsAsPlanets = chart.lots
            .filter(l => l.id === 'fortune' || l.id === 'spirit')
            .map(l => ({
              name: l.name,
              id: l.id,
              sign: l.sign,
              degree: l.degree % 30,
              longitude: l.longitude,
              house: 0,
              retrograde: false,
              symbol: l.symbol,
              latitude: 0,
              speed: 0
            })) as PlanetPosition[];
          planetsToRender = [...planetsToRender, ...lotsAsPlanets];
        }

        return planetsToRender.map((p, i) => {
          const angle = toAngle(p.longitude);
          const x = cx + planetR * Math.cos(angle);
          const y = cy + planetR * Math.sin(angle);

          let color = accentGold;
          if (p.name === 'Sol') color = '#f59e0b';
          if (p.name === 'Lua') color = '#cbd5e1';
          if (p.name === 'Marte') color = '#ef4444';
          if (p.name === 'Saturno') color = '#cbd5e1';
          if (p.name === 'Mercúrio') color = '#60a5fa';
          if (p.name === 'Vênus') color = '#22c55e';
          if (p.id === 'fortune') color = '#fbbf24';
          if (p.id === 'spirit') color = '#8b5cf6';

          return (
            <G key={`planet-${i}`}>
              <Line
                x1={x}
                y1={y}
                x2={cx + housesR * Math.cos(angle)}
                y2={cy + housesR * Math.sin(angle)}
                stroke={color}
                strokeWidth="0.55"
                opacity="0.45"
              />
              <Circle cx={x} cy={y} r={8.5} fill={bgColor} stroke={color} strokeWidth="1" />
              <Text
                x={x - 4.5}
                y={y + 4.5}
                style={{ fontSize: 10, fill: color, fontFamily: 'DejaVu Sans' }}
              >
                {PLANET_SYMBOLS[p.name] || p.symbol || p.name[0]}
              </Text>
              {p.retrograde && (
                <Text x={x + 4} y={y - 4} style={{ fontSize: 5, fill: '#ef4444', fontFamily: 'DejaVu Sans' }}>
                  R
                </Text>
              )}
            </G>
          );
        });
      })()}

      {(() => {
        const axes = getTraditionalAxisLongitudes(chart);
        return (
          <G>
            {axisText(axes.ac, 'AC', true)}
            {axisText(axes.dc, 'DC')}
            {axisText(axes.mc, 'MC', true)}
            {axisText(axes.ic, 'IC')}
          </G>
        );
      })()}

      <Circle cx={cx} cy={cy} r={innerR} fill={bgColor} stroke="#1e293b" strokeWidth="0.8" />
      <Circle cx={cx} cy={cy} r={innerR - 2} fill={bgColor} stroke="#334155" strokeWidth="0.4" strokeDasharray="2,2" opacity="0.9" />
      <Circle cx={cx} cy={cy} r={5} fill="none" stroke={accentGold} strokeWidth="1" />
    </Svg>
  );
}

function colorForSign(signName: string): string {
  return SIGN_COLORS[signName] || '#94a3b8';
}

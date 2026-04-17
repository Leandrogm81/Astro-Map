import React from 'react';
import { Svg, Circle, Line, Text, G, Path } from '@react-pdf/renderer';
import { NatalChart, ZODIAC_SIGNS, PLANETS, PlanetPosition } from '@/types';
import { EGYPTIAN_TERMS, getFaceRuler } from '@/lib/traditional/dignities';

interface ChartSimplePDFProps {
  chart: NatalChart;
  size?: number;
  isTraditional?: boolean;
}

const SIGN_COLORS: Record<string, string> = {
  'Áries': '#ef4444', 'Touro': '#22c55e', 'Gêmeos': '#3b82f6', 'Câncer': '#06b6d4',
  'Leão': '#ef4444', 'Virgem': '#22c55e', 'Libra': '#3b82f6', 'Escorpião': '#06b6d4',
  'Sagitário': '#ef4444', 'Capricórnio': '#22c55e', 'Aquário': '#3b82f6', 'Peixes': '#06b6d4'
};

const PLANET_SYMBOLS: Record<string, string> = {
  'Sol': '☉', 'Lua': '☽', 'Mercúrio': '☿', 'Vênus': '♀',
  'Marte': '♂', 'Júpiter': '♃', 'Saturno': '♄', 'Urano': '♅',
  'Netuno': '♆', 'Plutão': '♇', 
  'North Node': '☊', 'Chiron': '⚷', 'Lilith': '⚸', 'Roda da Fortuna': '⊗',
  'Fortune': '⊗', 'Spirit': '🕊️'
};

const ASPECT_COLORS: Record<string, string> = {
  'trine': '#10b981',    // Verde
  'sextile': '#3b82f6',  // Azul
  'square': '#ef4444',   // Vermelho
  'opposition': '#f97316',// Laranja
  'conjunction': '#fbbf24'// Dourado
};

export default function ChartSimplePDF({ chart, size = 350, isTraditional = false }: ChartSimplePDFProps) {
  const cx = size / 2;
  const cy = size / 2;
  
  // Geometria Premium para PDF
  const outerR = size / 2 - 15;
  const signsOuterR = outerR;
  const signsInnerR = outerR - 25;
  
  // Aneis de Dignidades
  const termsOuterR = signsInnerR;
  const termsInnerR = signsInnerR - 18;
  const decansOuterR = termsInnerR;
  const decansInnerR = termsInnerR - 15;
  
  const housesR = decansInnerR;
  const innerR = housesR - 40;
  const planetR = housesR - 18;

  const strokeColor = '#334155'; // Slate escuro para bordas
  const goldColor = '#b45309';   // Dourado clássico para fundo claro
  const gridStroke = '#cbd5e1';  // Cinza claro para grades
  const labelColor = '#64748b';
  const bgColor = '#ffffff';

  const asc = chart.ascendant || 0;
  
  const toAngle = (lon: number) => {
    // Sincronizado com TraditionalChart.tsx: (180 - (lon - asc + 360) % 360)
    return ((180 - (lon - asc + 360) % 360) * Math.PI) / 180;
  };

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

    // No react-pdf/renderer Svg:
    // M x1 y1 -> Move para início externo
    // A rOut rOut 0 0 0 x2 y2 -> Arco externo (sentido anti-horário p/ ângulo crescente no PDF)
    // L x3 y3 -> Linha para interior
    // A rIn rIn 0 0 1 x4 y4 -> Arco interno (sentido horário)
    return `M ${x1} ${y1} A ${rOut} ${rOut} 0 0 0 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 0 1 ${x4} ${y4} Z`;
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Fundo Principal */}
      <Circle cx={cx} cy={cy} r={outerR} fill={bgColor} stroke={strokeColor} strokeWidth="1.5" />
      
      {/* 1. Zodíaco */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const start = i * 30;
        const color = SIGN_COLORS[sign.name];
        const textAngle = toAngle(start + 15);
        const tr = (signsOuterR + signsInnerR) / 2;

        return (
          <G key={`sign-${i}`}>
            <Path
              d={getArcPath(start, start + 30, signsOuterR, signsInnerR)}
              fill={`${color}10`}
              stroke={color}
              strokeWidth="1"
            />
            <Text
              x={cx + tr * Math.cos(textAngle) - 5}
              y={cy + tr * Math.sin(textAngle) + 5}
              style={{ fontSize: 13, fill: color, fontFamily: 'DejaVu Sans', fontWeight: 'bold' }}
            >
              {sign.symbol}
            </Text>
          </G>
        );
      })}

      {/* 2. Ticks de 1 grau (Sutis) */}
      {[...Array(360)].map((_, i) => {
        if (i % 5 !== 0) return null;
        const angle = toAngle(i);
        const isThirty = i % 30 === 0;
        const r1 = signsInnerR;
        const r2 = isThirty ? r1 - 8 : r1 - 4;
        return (
          <Line
            key={`tick-${i}`}
            x1={cx + r1 * Math.cos(angle)}
            y1={cy + r1 * Math.sin(angle)}
            x2={cx + r2 * Math.cos(angle)}
            y2={cy + r2 * Math.sin(angle)}
            stroke={isThirty ? goldColor : gridStroke}
            strokeWidth={isThirty ? 1 : 0.5}
            opacity={0.6}
          />
        );
      })}

      {/* 3. Dignidades: Termos Egípcios */}
      {isTraditional && ZODIAC_SIGNS.map((sign) => {
        const signStart = ZODIAC_SIGNS.indexOf(sign) * 30;
        const termsData = EGYPTIAN_TERMS[sign.name as keyof typeof EGYPTIAN_TERMS];
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
              <Path 
                d={getArcPath(start, end, termsOuterR, termsInnerR)} 
                fill="none" stroke={gridStroke} strokeWidth="0.3" opacity="0.3" 
              />
              <Text
                x={cx + tr * Math.cos(midAngle) - 3}
                y={cy + tr * Math.sin(midAngle) + 3}
                style={{ fontSize: 7, fill: labelColor, fontFamily: 'DejaVu Sans' }}
              >
                {symbol}
              </Text>
            </G>
          );
        });
      })}

      {/* 4. Dignidades: Decanos (Faces) */}
      {isTraditional && ZODIAC_SIGNS.map((sign, si) => {
        const signStart = si * 30;
        return [0, 10, 20].map((d) => {
          const rulerId = getFaceRuler(sign.name as any, d);
          const planetInfo = PLANETS.find(p => p.id === rulerId.toLowerCase());
          const symbol = planetInfo?.symbol || rulerId[0];
          const start = signStart + d;
          const end = start + 10;
          const midAngle = toAngle(start + 5);
          const dr = (decansOuterR + decansInnerR) / 2;

          return (
            <G key={`face-${si}-${d}`}>
              <Path 
                d={getArcPath(start, end, decansOuterR, decansInnerR)} 
                fill="none" stroke={gridStroke} strokeWidth="0.3" opacity="0.2" 
              />
              <Text
                x={cx + dr * Math.cos(midAngle) - 2}
                y={cy + dr * Math.sin(midAngle) + 2}
                style={{ fontSize: 4, fill: labelColor, fontFamily: 'DejaVu Sans' }}
              >
                {symbol}
              </Text>
            </G>
          );
        });
      })}

      {/* 5. Linhas das Casas */}
      {chart.housesPlacidus.map((house) => {
        const angle = toAngle(house.longitude);
        const isAngular = [1, 4, 7, 10].includes(house.number);
        const nextAngle = toAngle(house.longitude + 15);
        // Reposicionado para dentro para não sobrepor dignidades
        const numR = isTraditional ? housesR - 10 : housesR + 8;

        return (
          <G key={`house-${house.number}`}>
            {/* No modo tradicional, as linhas AC/DC/MC/IC já são desenhadas pelo bloco de eixos. Esconde as angulares aqui para evitar duplicidade. */}
            {!(isTraditional && isAngular) && (
              <Line
                x1={cx + housesR * Math.cos(angle)}
                y1={cy + housesR * Math.sin(angle)}
                x2={cx + innerR * Math.cos(angle)}
                y2={cy + innerR * Math.sin(angle)}
                stroke={isAngular ? goldColor : gridStroke}
                strokeWidth={isAngular ? 1.5 : 0.6}
                opacity={isAngular ? 0.9 : 0.4}
              />
            )}
            <Text
              x={cx + numR * Math.cos(nextAngle) - 3}
              y={cy + numR * Math.sin(nextAngle) + 3}
              style={{ fontSize: 8, fill: isAngular ? goldColor : labelColor }}
            >
              {house.number}
            </Text>
          </G>
        );
      })}

      {/* 5.5 Aspectos Sutis (0-5 graus) */}
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
            opacity="0.4"
            strokeDasharray={a.orb > 3 ? "2,2" : "none"}
          />
        );
      })}

      {/* 6. Planetas */}
      {(() => {
        let planetsToRender = chart.planets;
        if (isTraditional) {
          const classic = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
          planetsToRender = chart.planets.filter(p => classic.includes(p.name));
          
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
        }

        return planetsToRender.map((p, i) => {
          const angle = toAngle(p.longitude);
          const x = cx + planetR * Math.cos(angle);
          const y = cy + planetR * Math.sin(angle);
          
          let color = goldColor;
          if (p.name === 'Sol') color = '#b45309';
          if (p.name === 'Lua') color = '#334155'; 
          if (p.name === 'Marte') color = '#b91c1c'; 
          if (p.name === 'Saturno') color = '#0f172a'; 
          if (p.name === 'Mercúrio') color = '#2563eb'; 
          if (p.name === 'Vênus') color = '#15803d'; 
          if (p.id === 'fortune') color = '#854d0e';
          if (p.id === 'spirit') color = '#7e22ce';

          return (
            <G key={`planet-${i}`}>
              <Line 
                x1={x} y1={y} 
                x2={cx + housesR * Math.cos(angle)} y2={cy + housesR * Math.sin(angle)}
                stroke={color} strokeWidth="0.5" opacity="0.4"
              />
              <Circle cx={x} cy={y} r={9} fill={bgColor} stroke={color} strokeWidth="1" />
              <Text
                x={x - 4.5}
                y={y + 4.5}
                style={{ fontSize: 11, fill: color, fontFamily: 'DejaVu Sans' }}
              >
                {PLANET_SYMBOLS[p.name] || p.symbol || p.name[0]}
              </Text>
              {p.retrograde && (
                <Text x={x + 4} y={y - 4} style={{ fontSize: 5, fill: '#ef4444' }}>R</Text>
              )}
            </G>
          );
        });
      })()}

      {/* 7. Eixos AC/DC e MC/IC Destacados (Graus Reais) */}
      {(() => {
        const eixos = [
          { lon: chart.ascendant, label: 'AC' },
          { lon: (chart.ascendant + 180) % 360, label: 'DC' },
          { lon: chart.mc, label: 'MC' },
          { lon: (chart.mc + 180) % 360, label: 'IC' }
        ];

        return (
          <G>
            {eixos.map((e, ei) => {
              const angle = toAngle(e.lon);
              const isACMC = e.label === 'AC' || e.label === 'MC';
              
              return (
                <G key={`axis-${ei}`}>
                  <Line
                    x1={cx + signsOuterR * Math.cos(angle)}
                    y1={cy + signsOuterR * Math.sin(angle)}
                    x2={cx + innerR * Math.cos(angle)}
                    y2={cy + innerR * Math.sin(angle)}
                    stroke={goldColor}
                    strokeWidth={isACMC ? "2" : "1.2"}
                  />
                  <Text
                    x={cx + (signsOuterR + 10) * Math.cos(angle) - 8}
                    y={cy + (signsOuterR + 10) * Math.sin(angle) + 4}
                    style={{ fontSize: 10, fill: goldColor, fontWeight: 'bold' }}
                  >
                    {e.label}
                  </Text>
                </G>
              );
            })}
          </G>
        );
      })()}

      <Circle cx={cx} cy={cy} r={innerR} fill="none" stroke={gridStroke} strokeWidth="0.5" strokeDasharray="2,2" />
      <Circle cx={cx} cy={cy} r={5} fill="none" stroke={goldColor} strokeWidth="1" />
    </Svg>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize, Settings, Eye, EyeOff } from 'lucide-react';
import { NatalChart, PlanetPosition, ZODIAC_SIGNS, PLANETS } from '@/types';
import { getElementColor } from '@/lib/astrology';

interface TraditionalChartProps {
  chart: NatalChart;
  showAllLots?: boolean;
  onPlanetClick?: (id: string) => void;
  selectedPlanetId?: string | null;
}

export default function TraditionalChart({ 
  chart, 
  showAllLots: showAllLotsProp, 
  onPlanetClick,
  selectedPlanetId 
}: TraditionalChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [hoveredLotId, setHoveredLotId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Opções de Visualização
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [options, setOptions] = useState({
    showAspects: true,
    houseSystem: 'whole_sign' as 'whole_sign' | 'equal',
    showAllLots: showAllLotsProp ?? false
  });

  useEffect(() => {
    setOptions(prev => ({ ...prev, showAllLots: showAllLotsProp ?? false }));
  }, [showAllLotsProp]);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const getLocalCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: clientX, y: clientY };
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const transformed = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const pointers = useRef<Map<number, { x: number, y: number }>>(new Map());

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.target instanceof Element) {
      e.target.setPointerCapture(e.pointerId);
    }
    const clientPos = { x: e.clientX, y: e.clientY };
    const localPos = getLocalCoords(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, clientPos);

    if (pointers.current.size === 1) {
      setIsDragging(true);
      setDragStart({ x: (localPos.x * zoom) - pan.x, y: (localPos.y * zoom) - pan.y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const localPos = getLocalCoords(e.clientX, e.clientY);

    if (pointers.current.size === 1 && isDragging) {
      setPan({ x: (localPos.x * zoom) - dragStart.x, y: (localPos.y * zoom) - dragStart.y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) setIsDragging(false);
  };

  // Constantes de Design (Aumentadas para preencher melhor o SVG)
  const CX = 400;
  const CY = 400;
  const R_OUTER = 395;
  const R_ZODIAC_INNER = 345;
  const R_PLANETS_OUTER = 315;
  const R_LOTS_INNER = 265;
  const R_ASPECTS = 225;

  const ascendantLongitude = chart.ascendant;
  const longitudeToAngle = (longitude: number): number => {
    return (180 - (longitude - ascendantLongitude)) * (Math.PI / 180);
  };

  // Filtrar 7 clássicos
  const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const classicPlanets = chart.planets.filter(p => {
    const pId = p.id?.toLowerCase();
    return classicIds.includes(pId) || classicIds.includes(p.name?.toLowerCase());
  });

  // Renderizar Signos
  const zodiacElements = ZODIAC_SIGNS.map((sign) => {
    const startAngle = longitudeToAngle(sign.start);
    const endAngle = longitudeToAngle(sign.start + 30);
    const midAngle = (startAngle + endAngle) / 2;
    const color = getElementColor(sign.element);

    const x1_out = CX + R_OUTER * Math.cos(startAngle);
    const y1_out = CY + R_OUTER * Math.sin(startAngle);
    const x2_out = CX + R_OUTER * Math.cos(endAngle);
    const y2_out = CY + R_OUTER * Math.sin(endAngle);
    const x1_in = CX + R_ZODIAC_INNER * Math.cos(startAngle);
    const y1_in = CY + R_ZODIAC_INNER * Math.sin(startAngle);
    const x2_in = CX + R_ZODIAC_INNER * Math.cos(endAngle);
    const y2_in = CY + R_ZODIAC_INNER * Math.sin(endAngle);

    return (
      <g key={sign.name}>
        <path
          d={`M ${x1_out} ${y1_out} A ${R_OUTER} ${R_OUTER} 0 0 0 ${x2_out} ${y2_out} L ${x2_in} ${y2_in} A ${R_ZODIAC_INNER} ${R_ZODIAC_INNER} 0 0 1 ${x1_in} ${y1_in} Z`}
          fill={`${color}15`}
          stroke={color}
          strokeWidth="1.5"
        />
        <text
          x={CX + ((R_OUTER + R_ZODIAC_INNER) / 2) * Math.cos(midAngle)}
          y={CY + ((R_OUTER + R_ZODIAC_INNER) / 2) * Math.sin(midAngle)}
          textAnchor="middle" dominantBaseline="central"
          fill={color} fontSize="20" fontWeight="bold" className="select-none"
        >
          {sign.symbol}
        </text>
      </g>
    );
  });

  // Linhas das Casas dinâmica
  const houseLines = Array.from({ length: 12 }).map((_, i) => {
    let lon = 0;
    if (options.houseSystem === 'whole_sign') {
      lon = (Math.floor(ascendantLongitude / 30) * 30 + i * 30) % 360;
    } else {
      // Equal Houses: Start at exactly Ascendant degree
      lon = (ascendantLongitude + i * 30) % 360;
    }
    
    const angle = longitudeToAngle(lon);
    const midAngle = longitudeToAngle(lon + 15);
    const rNum = R_ASPECTS + 20;
    const isCardinal = [1, 4, 7, 10].includes(i + 1);

    return (
      <g key={`house-${i}`}>
        <line
          x1={CX + R_ASPECTS * Math.cos(angle)} y1={CY + R_ASPECTS * Math.sin(angle)}
          x2={CX + R_ZODIAC_INNER * Math.cos(angle)} y2={CY + R_ZODIAC_INNER * Math.sin(angle)}
          stroke={isCardinal ? "#fbbf24" : "#334155"}
          strokeWidth={isCardinal ? 2 : 1}
          opacity={isCardinal ? 1 : 0.5}
        />
        <text
          x={CX + rNum * Math.cos(midAngle)} y={CY + rNum * Math.sin(midAngle)}
          textAnchor="middle" dominantBaseline="central"
          fill={isCardinal ? "#e2e8f0" : "#64748b"}
          fontSize="14" fontWeight={isCardinal ? "bold" : "normal"}
        >
          {i + 1}
        </text>
      </g>
    );
  });

  // Gestão de Sobreposição de Planetas
  interface PositionedPlanet extends PlanetPosition {
    x: number;
    y: number;
    angle: number;
  }
  const positionedPlanets: PositionedPlanet[] = [];
  classicPlanets.forEach(p => {
    const angle = longitudeToAngle(p.longitude);
    let r = R_PLANETS_OUTER;
    let overlap = true;
    while (overlap) {
      overlap = false;
      const x = CX + r * Math.cos(angle);
      const y = CY + r * Math.sin(angle);
      for (const pos of positionedPlanets) {
        const dist = Math.hypot(pos.x - x, pos.y - y);
        if (dist < 28) {
          overlap = true;
          r -= 20;
          break;
        }
      }
    }
    positionedPlanets.push({ ...p, x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle), angle });
  });

  const planetNodes = positionedPlanets.map(p => {
    const isFocused = selectedPlanetId === p.id || hoveredPlanet === p.id;
    const planetInfo = PLANETS.find(pi => pi.name.toLowerCase() === p.name.toLowerCase() || pi.id === p.id);
    
    return (
      <g 
        key={p.id}
        onClick={() => onPlanetClick?.(p.id)}
        onMouseEnter={() => setHoveredPlanet(p.id)}
        onMouseLeave={() => setHoveredPlanet(null)}
        className="cursor-pointer transition-all duration-300"
      >
        <line 
          x1={p.x} y1={p.y} 
          x2={CX + R_ZODIAC_INNER * Math.cos(p.angle)} y2={CY + R_ZODIAC_INNER * Math.sin(p.angle)} 
          stroke="#475569" strokeWidth="1" strokeDasharray="2,2" opacity="0.4" 
        />
        <g transform={`translate(${p.x}, ${p.y})`}>
          {isFocused && (
            <circle r="22" fill="none" stroke="#fbbf24" strokeWidth="2" className="animate-pulse" />
          )}
          <circle 
            r={isFocused ? 18 : 16} 
            fill={isFocused ? "#1e293b" : "#0f172a"} 
            stroke="#fbbf24" 
            strokeWidth="2" 
            className="shadow-xl"
          />
          <text 
            textAnchor="middle" dominantBaseline="central" 
            fill="#fbbf24" fontSize="18" fontWeight="bold"
            className="select-none"
          >
            {planetInfo?.symbol || p.symbol}
          </text>
        </g>
      </g>
    );
  });

  // Lotes (Fortuna, Espírito, etc) dinâmicos
  const lotNodes = (chart.lots || [])
    .filter(l => options.showAllLots || l.id === 'fortune' || l.id === 'spirit')
    .map(l => {
      const angle = longitudeToAngle(l.longitude);
      const x = CX + R_LOTS_INNER * Math.cos(angle);
      const y = CY + R_LOTS_INNER * Math.sin(angle);
      const isHovered = hoveredLotId === l.id;

      // Cores por Lote
      const lotColors: Record<string, string> = {
        fortune: '#fbbf24',    // Gold
        spirit: '#60a5fa',     // Azure/Spirit
        eros: '#f472b6',       // Pink/Love
        necessity: '#2dd4bf',  // Teal/Mercury
        courage: '#ef4444',    // Red/Mars
        victory: '#a855f7',    // Purple/Jupiter
        nemesis: '#64748b'     // Slate/Saturn
      };
      
      const color = lotColors[l.id] || '#94a3b8';
      
      return (
        <g 
          key={l.id} 
          onMouseEnter={() => setHoveredLotId(l.id)}
          onMouseLeave={() => setHoveredLotId(null)}
          className="cursor-help transition-all duration-300"
        >
          {isHovered && (
            <circle cx={x} cy={y} r="22" fill={`${color}15`} stroke={`${color}50`} strokeWidth="1" className="animate-pulse" />
          )}
          <circle 
            cx={x} cy={y} r="18" 
            fill={isHovered ? "#1e293b" : "#020617"} 
            stroke={color} 
            strokeWidth="2" 
            strokeDasharray={isHovered ? "none" : "2,1"} 
          />
          <text 
            x={x} y={y} textAnchor="middle" dominantBaseline="central" 
            fill={color} 
            fontSize="20" fontWeight="bold"
            className="select-none"
          >
            {l.symbol}
          </text>
        </g>
      );
    });

  // Aspectos tradicionais condicionais (Reforçados para visibilidade máxima)
  const septenaryAspects = options.showAspects ? chart.aspects
    .filter(a => {
      const p1Id = a.planet1.toLowerCase();
      const p2Id = a.planet2.toLowerCase();
      return classicIds.includes(p1Id) && classicIds.includes(p2Id) && a.orb <= 10;
    })
    .map((a, i) => {
      // Busca robusta por ID ou Nome (ignore case)
      const p1 = positionedPlanets.find(pp => 
        pp.id?.toLowerCase() === a.planet1.toLowerCase() || 
        pp.name?.toLowerCase() === a.planet1.toLowerCase()
      );
      const p2 = positionedPlanets.find(pp => 
        pp.id?.toLowerCase() === a.planet2.toLowerCase() || 
        pp.name?.toLowerCase() === a.planet2.toLowerCase()
      );
      
      if (!p1 || !p2) return null;

      let color = '#94a3b8';
      if (a.type === 'trine') color = '#10b981';
      if (a.type === 'sextile') color = '#3b82f6';
      if (a.type === 'square') color = '#ef4444';
      if (a.type === 'opposition') color = '#f97316';
      if (a.type === 'conjunction') color = '#fbbf24';

      return (
        <line 
          key={`asp-${i}`}
          x1={CX + R_ASPECTS * Math.cos(p1.angle)} y1={CY + R_ASPECTS * Math.sin(p1.angle)}
          x2={CX + R_ASPECTS * Math.cos(p2.angle)} y2={CY + R_ASPECTS * Math.sin(p2.angle)}
          stroke={color} 
          strokeWidth={2.5} 
          opacity={1}
          strokeDasharray={a.orb > 6 ? "5,3" : "none"}
        />
      );
    }) : [];

  // Tooltip Element
  const renderTooltip = () => {
    let focusX = 0, focusY = 0, title = '', subtitle = '', info = '', desc = '';
    
    if (hoveredPlanet) {
      const p = positionedPlanets.find(pp => pp.id === hoveredPlanet);
      if (p) {
        focusX = p.x; focusY = p.y;
        title = p.name;
        subtitle = `${p.sign} ${Math.floor(p.degree)}°${String(Math.floor((p.degree % 1) * 60)).padStart(2, '0')}'`;
        info = `Casa ${p.house}`;
      }
    } else if (hoveredLotId) {
      const l = (chart.lots || []).find(ll => ll.id === hoveredLotId);
      if (l) {
        const angle = longitudeToAngle(l.longitude);
        focusX = CX + R_LOTS_INNER * Math.cos(angle);
        focusY = CY + R_LOTS_INNER * Math.sin(angle);
        title = l.name;
        subtitle = `${l.sign} ${Math.floor(l.degree)}°${String(Math.floor((l.degree % 1) * 60)).padStart(2, '0')}'`;
        info = `Casa ${l.house}`;
        desc = l.description || '';
      }
    }

    if (!title) return null;

    const offsetSide = focusX > CX ? -200 : 20;
    const offsetTop = focusY > CY ? -110 : 20;

    return (
      <g transform={`translate(${focusX}, ${focusY})`} className="pointer-events-none">
        <g transform={`translate(${offsetSide}, ${offsetTop})`}>
          <rect width="200" height={desc ? 120 : 90} rx="14" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" className="shadow-2xl" opacity="0.98" />
          <text x="100" y="30" textAnchor="middle" fill="#fbbf24" fontSize="16" fontWeight="bold">{title}</text>
          <text x="100" y="55" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="600">{subtitle}</text>
          <text x="100" y="78" textAnchor="middle" fill="#94a3b8" fontSize="13">Casa {info.replace('Casa ', '')}</text>
          {desc && (
            <text x="100" y="100" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="normal">
              {desc.length > 50 ? desc.substring(0, 47) + '...' : desc}
            </text>
          )}
        </g>
      </g>
    );
  };

  // Painel de Configurações Lateral
  const renderSettingsPanel = () => {
    if (!isSettingsOpen) return null;

    return (
      <div className="absolute top-4 left-4 z-20 w-64 bg-slate-900/90 border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-300">
        <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-gold-400" />
          Ajustes de Visualização
        </h4>

        <div className="space-y-4">
          {/* Toggle Aspectos */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Linhas de Aspecto</span>
            <button 
              onClick={() => setOptions(prev => ({ ...prev, showAspects: !prev.showAspects }))}
              className={`p-1.5 rounded-lg transition-all ${options.showAspects ? 'bg-gold-500/20 text-gold-400' : 'bg-white/5 text-slate-500'}`}
            >
              {options.showAspects ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Toggle Lotes */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Todos os Lotes</span>
            <button 
              onClick={() => setOptions(prev => ({ ...prev, showAllLots: !prev.showAllLots }))}
              className={`p-1.5 rounded-lg transition-all ${options.showAllLots ? 'bg-gold-500/20 text-gold-400' : 'bg-white/5 text-slate-500'}`}
            >
              {options.showAllLots ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Seletor de Casas */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Sistema de Casas</span>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setOptions(prev => ({ ...prev, houseSystem: 'whole_sign' }))}
                className={`text-[10px] py-2 rounded-lg border transition-all ${options.houseSystem === 'whole_sign' ? 'bg-gold-500/20 border-gold-500/30 text-gold-400' : 'bg-white/5 border-white/5 text-slate-500'}`}
              >
                Signos Inteiros
              </button>
              <button 
                onClick={() => setOptions(prev => ({ ...prev, houseSystem: 'equal' }))}
                className={`text-[10px] py-2 rounded-lg border transition-all ${options.houseSystem === 'equal' ? 'bg-gold-500/20 border-gold-500/30 text-gold-400' : 'bg-white/5 border-white/5 text-slate-500'}`}
              >
                Casas Iguais
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <p className="text-[9px] text-slate-500 leading-tight">
              A análise Dorotheana recomenda Signos Inteiros para regências clássicas.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="w-full aspect-square relative bg-[#020617] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
      {/* Settings Panel */}
      {renderSettingsPanel()}

      {/* Zoom Controls Overlay */}
      {!isTouchDevice && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 bg-slate-900/80 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setZoom(z => Math.min(5, z + 0.4))} 
            title="Aumentar Zoom"
            aria-label="Aumentar Zoom"
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setZoom(z => Math.max(0.5, z - 0.4))} 
            title="Diminuir Zoom"
            aria-label="Diminuir Zoom"
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button 
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} 
            title="Resetar Visualização"
            aria-label="Resetar Visualização"
            className="p-2 text-slate-400 hover:text-white transition-colors border-b border-white/5 pb-2"
          >
            <Maximize className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
            title="Configurações Visuais"
            aria-label="Configurações Visuais"
            className={`p-2 transition-colors ${isSettingsOpen ? 'text-gold-400' : 'text-slate-400 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 800 800"
        className="w-full h-full touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} className="origin-[0_0]">
          {/* Anéis de Fundo */}
          <circle cx={CX} cy={CY} r={R_OUTER} fill="#0f172a" stroke="#7c3aed" strokeWidth="2" opacity="0.6" />
          <circle cx={CX} cy={CY} r={R_ZODIAC_INNER} fill="none" stroke="#475569" strokeWidth="1" opacity="0.3" />
          
          {zodiacElements}
          
          <circle cx={CX} cy={CY} r={R_ASPECTS} fill="#020617" stroke="#475569" strokeWidth="2" />
          
          {houseLines}
          {septenaryAspects}
          {lotNodes}
          {planetNodes}
          {renderTooltip()}

          {/* Crosshair Central */}
          <g opacity="0.4">
            <circle cx={CX} cy={CY} r="10" fill="none" stroke="#64748b" strokeWidth="1.5" />
            <line x1={CX-6} y1={CY} x2={CX+6} y2={CY} stroke="#64748b" />
            <line x1={CX} y1={CY-6} x2={CX} y2={CY+6} stroke="#64748b" />
          </g>
        </g>
      </svg>
    </div>
  );
}

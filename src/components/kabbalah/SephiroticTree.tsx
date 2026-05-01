'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Hexagon } from 'lucide-react';
import type { NatalChart } from '@/types';
import { SEPHIRAH_RADIUS, SEPHIROTH_COORDS, TREE_PATHS } from '@/lib/kabbalah/constants';
import { getSephirahDefinition, mapChartToSephiroth } from '@/lib/kabbalah/sephiroth';
import type { SephirahName, SephirothMapping } from '@/lib/kabbalah/types';
import { calculateSephirothScores, SephirahScore } from '@/lib/kabbalah/scoring';
import { getZodiacSign } from '@/lib/astrology';
import SephirahPopover from './SephirahPopover';
import ScoringRanking from './ScoringRanking';

interface SephiroticTreeProps {
  readonly chart?: NatalChart | null;
}

function formatDegree(degree: number): string {
  return `${degree.toFixed(1)}°`;
}

function getMappingSymbol(mapping: SephirothMapping | undefined, name: SephirahName): string {
  if (!mapping) return '—';
  if ('planetSymbol' in mapping) return mapping.planetSymbol;
  if (name === 'Malkuth') return 'ASC';
  return '—';
}

function getCardInsetShadowClass(name: SephirahName): string {
  const insetShadowClassBySephirah: Record<SephirahName, string> = {
    Kether: 'shadow-[inset_0_0_0_1px_#FFFFFF22]',
    Chokmah: 'shadow-[inset_0_0_0_1px_#A9A9A922]',
    Binah: 'shadow-[inset_0_0_0_1px_#00000022]',
    Daath: 'shadow-[inset_0_0_0_1px_#D8BFD822]',
    Chesed: 'shadow-[inset_0_0_0_1px_#0000FF22]',
    Geburah: 'shadow-[inset_0_0_0_1px_#FF000022]',
    Tiphereth: 'shadow-[inset_0_0_0_1px_#FFD70022]',
    Netzach: 'shadow-[inset_0_0_0_1px_#00800022]',
    Hod: 'shadow-[inset_0_0_0_1px_#FFA50022]',
    Yesod: 'shadow-[inset_0_0_0_1px_#8A2BE222]',
    Malkuth: 'shadow-[inset_0_0_0_1px_#1A1A1A22]',
  };

  return insetShadowClassBySephirah[name];
}

function getHaloProps(score?: SephirahScore) {
  if (!score) return { opacity: 0, scale: 1, filter: 'none' };
  
  // Calculate relative intensity based on score (0-100)
  const normalized = score.score / 100;
  
  if (score.score >= 80) {
    // High power: thick, glowing
    return { 
      opacity: 0.8 * normalized, 
      scale: 1.25 + (normalized * 0.15), 
      filter: 'url(#glow)',
      strokeWidth: 4,
      strokeDasharray: 'none'
    };
  } else if (score.score <= 20) {
    // Low power: faint, dashed
    return { 
      opacity: 0.3, 
      scale: 1.1, 
      filter: 'none',
      strokeWidth: 1.5,
      strokeDasharray: '4 4'
    };
  } else {
    // Normal power
    return { 
      opacity: 0.4 * normalized, 
      scale: 1.15 + (normalized * 0.05), 
      filter: 'none',
      strokeWidth: 2,
      strokeDasharray: 'none'
    };
  }
}

export default function SephiroticTree({ chart }: SephiroticTreeProps) {
  const mappings = useMemo(() => (chart ? mapChartToSephiroth(chart) : []), [chart]);
  const [selectedSephirah, setSelectedSephirah] = useState<SephirahName | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const circleRefs = useRef<Map<SephirahName, SVGCircleElement>>(new Map());
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mappingBySephirah = useMemo(() => {
    const map = new Map<SephirahName, SephirothMapping>();
    mappings.forEach((item) => map.set(item.sephirah.name, item));
    return map;
  }, [mappings]);

  const selectedMapping = selectedSephirah ? mappingBySephirah.get(selectedSephirah) : undefined;
  const selectedDefinition = selectedSephirah ? getSephirahDefinition(selectedSephirah) : undefined;

  const [showHalos, setShowHalos] = useState(true);

  const scores = useMemo(() => {
    if (!chart || mappings.length === 0) return null;
    const ascSign = getZodiacSign(chart.ascendant);
    return calculateSephirothScores(mappings, chart.aspects, ascSign);
  }, [chart, mappings]);

  const selectedScore = selectedSephirah && scores ? scores[selectedSephirah] : undefined;

  const supportsHover =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: hover)').matches;

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const openSephirah = (name: SephirahName, anchor: DOMRect | null) => {
    clearHoverTimeout();
    setAnchorRect(anchor);
    setSelectedSephirah(name);
  };

  const closeSephirah = () => {
    clearHoverTimeout();
    setAnchorRect(null);
    setSelectedSephirah(null);
  };

  const scheduleOpen = (name: SephirahName, anchor: DOMRect | null) => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setAnchorRect(anchor);
      setSelectedSephirah(name);
    }, 150);
  };

  const scheduleClose = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setAnchorRect(null);
      setSelectedSephirah(null);
    }, 150);
  };

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 md:p-6 shadow-2xl shadow-black/25">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500 font-bold">Módulo B</p>
          <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-1">Árvore Sephirótica</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            Nesta etapa o módulo mostra a projeção dos planetas nas Sephiroth com SVG interativo e detalhes por Sephirah.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-slate-300">
          <Hexagon className="w-4 h-4 text-gold-300" />
          SVG interativo
        </div>
      </div>

      {chart ? (
        <>
          <div className="mb-5 rounded-2xl border border-gold-500/10 bg-gold-500/5 p-4 text-sm text-slate-300">
            <Hexagon className="inline-block w-4 h-4 text-gold-300 mr-2 -mt-0.5" />
            Mapa carregado: <span className="text-white font-semibold">{chart.birthData.name}</span>
            {' '}| Ascendente {formatDegree(chart.ascendant)}
          </div>

          <div className="flex flex-col xl:flex-row gap-6 mb-6">
            <div className="flex-1 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
              <svg
                viewBox="0 0 400 600"
                role="img"
                aria-label="Árvore Sephirótica com projeção planetária"
                className="w-full h-auto"
              >
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <title>Árvore Sephirótica</title>
              {TREE_PATHS.map(([from, to]) => {
                const fromCoord = SEPHIROTH_COORDS[from];
                const toCoord = SEPHIROTH_COORDS[to];
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={fromCoord.x}
                    y1={fromCoord.y}
                    x2={toCoord.x}
                    y2={toCoord.y}
                    stroke="rgba(212, 175, 55, 0.35)"
                    strokeWidth={2}
                  />
                );
              })}

              {(Object.keys(SEPHIROTH_COORDS) as SephirahName[]).map((name) => {
                const coord = SEPHIROTH_COORDS[name];
                const definition = getSephirahDefinition(name);
                const mapping = mappingBySephirah.get(name);
                const isActive = selectedSephirah === name;
                const score = scores ? scores[name] : undefined;
                const halo = getHaloProps(score);

                return (
                  <g key={name}>
                    {showHalos && score && (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={SEPHIRAH_RADIUS * halo.scale}
                        fill="transparent"
                        stroke={definition.color}
                        strokeOpacity={halo.opacity}
                        strokeWidth={halo.strokeWidth}
                        strokeDasharray={halo.strokeDasharray}
                        filter={halo.filter}
                        className="transition-all duration-500 ease-in-out"
                      />
                    )}
                    <circle
                      ref={(el) => {
                        if (el) {
                          circleRefs.current.set(name, el);
                        } else {
                          circleRefs.current.delete(name);
                        }
                      }}
                      cx={coord.x}
                      cy={coord.y}
                      r={SEPHIRAH_RADIUS}
                      fill={isActive ? definition.color : 'rgba(15, 23, 42, 0.9)'}
                      stroke={definition.color}
                      strokeWidth={isActive ? 3 : 2}
                      className="cursor-pointer outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                      aria-label={`Sephirah ${name}`}
                      role="button"
                      data-sephirah={name}
                      tabIndex={0}
                      onClick={(event) => {
                        const anchor = event.currentTarget.getBoundingClientRect();
                        if (supportsHover) {
                          openSephirah(name, anchor);
                          return;
                        }

                        if (selectedSephirah === name) {
                          closeSephirah();
                          return;
                        }

                        openSephirah(name, anchor);
                      }}
                      onMouseEnter={(event) => {
                        if (!supportsHover) return;
                        scheduleOpen(name, event.currentTarget.getBoundingClientRect());
                      }}
                      onMouseLeave={() => {
                        if (!supportsHover) return;
                        scheduleClose();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openSephirah(name, event.currentTarget.getBoundingClientRect());
                        }
                      }}
                    />
                    <text
                      x={coord.x}
                      y={coord.y - 2}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.95)"
                      fontSize={11}
                      fontWeight={700}
                    >
                      {name}
                    </text>
                    <text
                      x={coord.x}
                      y={coord.y + 13}
                      textAnchor="middle"
                      fill="rgba(212,175,55,0.95)"
                      fontSize={10}
                      fontWeight={700}
                    >
                      {getMappingSymbol(mapping, name)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          
          {scores && (
            <div className="xl:w-80 shrink-0">
              <ScoringRanking 
                scores={scores} 
                showHalos={showHalos} 
                onToggleHalos={() => setShowHalos(!showHalos)} 
              />
            </div>
          )}
        </div>

          <AnimatePresence>
            {selectedSephirah && selectedMapping && selectedDefinition && anchorRect && (
              <SephirahPopover
                key={selectedSephirah}
                sephirahName={selectedSephirah}
                mapping={selectedMapping}
                score={selectedScore}
                anchorRect={anchorRect}
                onClose={closeSephirah}
                onMouseEnter={clearHoverTimeout}
                onMouseLeave={scheduleClose}
              />
            )}
          </AnimatePresence>

          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {mappings.map((mapping) => {
              const planetName = 'planetName' in mapping ? mapping.planetName : 'Ascendente';
              const planetSymbol = 'planetSymbol' in mapping ? mapping.planetSymbol : 'ASC';
              const houseLabel = 'house' in mapping ? `Casa ${mapping.house}` : 'Casa 1';

              return (
                <article
                  key={mapping.sephirah.name}
                  className={`rounded-2xl border border-white/10 bg-slate-950/60 p-4 ${getCardInsetShadowClass(mapping.sephirah.name)}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">
                        {mapping.sephirah.name}
                      </p>
                      <h4 className="text-lg font-bold text-white">{planetName}</h4>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-black text-gold-200">
                      {planetSymbol}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-slate-400">
                      {mapping.sign} {formatDegree(mapping.degree)} | {houseLabel}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-gold-200 font-semibold">{mapping.angel.name}</span>
                      {' '}· {mapping.angel.psalm}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-500">{mapping.sephirah.description.pt}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex min-h-[20rem] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-8 text-center">
          <div className="max-w-md">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-gold-500/20 bg-gold-500/10">
              <Hexagon className="h-8 w-8 text-gold-300" />
            </div>
            <h4 className="text-2xl font-bold text-white">Carregue um mapa natal</h4>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              A árvore completa precisa do mapa carregado para posicionar cada planeta na Sephirah correspondente.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}



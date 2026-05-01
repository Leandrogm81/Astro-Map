'use client';

import { useMemo, useState } from 'react';
import type { NatalChart } from '@/types';
import { mapChartToSephiroth, getSephirahDefinition } from '@/lib/kabbalah/sephiroth';
import { SEPHIRAH_RADIUS, SEPHIROTH_COORDS, TREE_PATHS } from '@/lib/kabbalah/constants';
import type { SephirahName, SephirothMapping } from '@/lib/kabbalah/types';
import { Hexagon } from 'lucide-react';

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

export default function SephiroticTree({ chart }: SephiroticTreeProps) {
  const mappings = useMemo(() => (chart ? mapChartToSephiroth(chart) : []), [chart]);
  const [selectedSephirah, setSelectedSephirah] = useState<SephirahName | null>(null);

  const mappingBySephirah = useMemo(() => {
    const map = new Map<SephirahName, SephirothMapping>();
    mappings.forEach((item) => map.set(item.sephirah.name, item));
    return map;
  }, [mappings]);

  const selectedMapping = selectedSephirah ? mappingBySephirah.get(selectedSephirah) : undefined;
  const selectedDefinition = selectedSephirah ? getSephirahDefinition(selectedSephirah) : undefined;

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

          <div className="mb-6 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
            <svg
              viewBox="0 0 400 600"
              role="img"
              aria-label="Árvore Sephirótica com projeção planetária"
              className="w-full h-auto"
            >
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

                return (
                  <g key={name}>
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={SEPHIRAH_RADIUS}
                      fill={isActive ? definition.color : 'rgba(15, 23, 42, 0.9)'}
                      stroke={definition.color}
                      strokeWidth={isActive ? 3 : 2}
                      style={{ cursor: 'pointer' }}
                      aria-label={`Sephirah ${name}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedSephirah(name)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedSephirah(name);
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

          {selectedMapping && selectedDefinition && (
            <section className="mb-6 rounded-2xl border border-gold-500/20 bg-gold-500/8 p-4" aria-live="polite">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold-200 font-bold">Detalhe da Sephirah</p>
              <h4 className="mt-1 text-xl font-bold text-white">{selectedDefinition.name} · {selectedDefinition.meaning}</h4>
              <p className="mt-2 text-sm text-slate-300">{selectedDefinition.description.pt}</p>
              <p className="mt-1 text-sm text-gold-100">
                {'planetName' in selectedMapping ? selectedMapping.planetName : 'Ascendente'} · {selectedMapping.sign} {formatDegree(selectedMapping.degree)} · Casa {selectedMapping.house}
              </p>
              <p className="text-sm text-slate-300">
                Anjo regente: <span className="text-gold-200 font-semibold">{selectedMapping.angel.name}</span> · {selectedMapping.angel.psalm}
              </p>
            </section>
          )}

          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {mappings.map((mapping) => {
              const sephirah = getSephirahDefinition(mapping.sephirah.name);
              const planetName = 'planetName' in mapping ? mapping.planetName : 'Ascendente';
              const planetSymbol = 'planetSymbol' in mapping ? mapping.planetSymbol : 'ASC';
              const houseLabel = 'house' in mapping ? `Casa ${mapping.house}` : 'Casa 1';

              return (
                <article
                  key={mapping.sephirah.name}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                  style={{ boxShadow: `0 0 0 1px ${sephirah.color}22 inset` }}
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

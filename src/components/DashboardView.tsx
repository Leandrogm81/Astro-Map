'use client';

import { Calendar, Clock, MapPin, Moon, Sparkles, Star, Sun } from 'lucide-react';
import AstroChart from '@/components/AstroChart';
import type { NatalChart, PlanetPosition } from '@/types';

interface DashboardViewProps {
  chart: NatalChart;
  transitChart?: NatalChart | null;
}

function findPlanet(planets: PlanetPosition[], id: string): PlanetPosition | undefined {
  return planets.find((planet) => planet.id === id);
}

function formatPosition(planet?: PlanetPosition): string {
  if (!planet) return 'Indisponivel';
  return `${planet.sign} ${Math.floor(planet.degree)} deg`;
}

function getTransitItems(chart?: NatalChart | null): PlanetPosition[] {
  return chart?.planets.slice(0, 4) ?? [];
}

export default function DashboardView({ chart, transitChart }: DashboardViewProps) {
  const sun = findPlanet(chart.planets, 'sun');
  const moon = findPlanet(chart.planets, 'moon');
  const transitItems = getTransitItems(transitChart);

  return (
    <section
      data-testid="mobile-dashboard"
      className="min-h-[calc(100vh-4rem)] bg-[#111415] text-white -mx-4 px-4 py-5"
    >
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#fcc419]/70">
                Dashboard Astrologico
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-white">
                {chart.birthData.name}
              </h2>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#fcc419]/40 bg-[#fcc419]/10">
              <Sparkles className="h-5 w-5 text-[#fcc419]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#fcc419]/20 bg-[#fcc419]/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-[#fcc419]">
                <Sun className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sol</span>
              </div>
              <p className="text-lg font-bold">{formatPosition(sun)}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-slate-200">
                <Moon className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Lua</span>
              </div>
              <p className="text-lg font-bold">{formatPosition(moon)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-md">
          <AstroChart chart={chart} variant="minimal" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-md">
            <Calendar className="mb-2 h-4 w-4 text-[#fcc419]" />
            <p>{chart.birthData.date}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-md">
            <Clock className="mb-2 h-4 w-4 text-[#fcc419]" />
            <p>{chart.birthData.time}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-md">
            <MapPin className="mb-2 h-4 w-4 text-[#fcc419]" />
            <p className="truncate">{chart.birthData.location}</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#fcc419]">
              Transitos
            </h3>
            <Star className="h-4 w-4 text-[#fcc419]" />
          </div>
          {transitItems.length > 0 ? (
            <div className="space-y-2">
              {transitItems.map((planet) => (
                <div
                  key={planet.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                >
                  <span className="text-sm font-semibold text-white">{planet.name}</span>
                  <span className="text-xs text-slate-300">{formatPosition(planet)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm text-slate-300">
              Nenhum transito calculado.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

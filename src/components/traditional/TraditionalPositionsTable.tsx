import React from 'react';
import { NatalChart, ZodiacSign } from '@/types';
import { Compass, Trophy, Star } from 'lucide-react';

interface TraditionalPositionsTableProps {
  chart: NatalChart;
}

export default function TraditionalPositionsTable({ chart }: TraditionalPositionsTableProps) {
  const formatDegree = (degree: number): string => {
    const d = Math.floor(degree);
    const m = Math.floor((degree - d) * 60);
    return `${d}°${m.toString().padStart(2, '0')}'`;
  };

  const getHouse = (longitude: number) => {
    const houses = chart.housesPlacidus;
    for (let i = 0; i < houses.length; i++) {
        const start = houses[i].longitude;
        const end = houses[(i + 1) % 12].longitude;
        
        if (start < end) {
            if (longitude >= start && longitude < end) return i + 1;
        } else {
            if (longitude >= start || longitude < end) return i + 1;
        }
    }
    return 1;
  };

  const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const planets = chart.planets.filter(p => classicIds.includes(p.id?.toLowerCase()));
  const lots = chart.lots || [];

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-gold-500" />
          Posições e Lotes Herméticos
        </h3>
      </div>

      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <th className="px-4 py-2">Ponto</th>
              <th className="px-4 py-2">Signo</th>
              <th className="px-4 py-2">Grau</th>
              <th className="px-4 py-2 text-right">Casa</th>
            </tr>
          </thead>
          <tbody>
            {/* Planetas */}
            {planets.map((planet) => (
              <tr key={planet.id} className="group hover:bg-white/5 transition-all duration-300">
                <td className="px-4 py-3 rounded-l-2xl border-y border-l border-white/5 flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                    <Star className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-bold text-white">{planet.name}</span>
                </td>
                <td className="px-4 py-3 border-y border-white/5 text-sm text-slate-300">
                  {planet.sign}
                </td>
                <td className="px-4 py-3 border-y border-white/5 text-sm font-mono text-gold-400/80">
                  {formatDegree(planet.degree)}
                </td>
                <td className="px-4 py-3 rounded-r-2xl border-y border-r border-white/5 text-right text-sm font-bold text-white">
                  {planet.house}
                </td>
              </tr>
            ))}

            {/* Divisor */}
            <tr><td colSpan={4} className="py-2"><div className="h-px bg-white/5 w-full"></div></td></tr>

            {/* Lotes */}
            {lots.map((lot) => (
              <tr key={lot.id} className="group hover:bg-gold-500/5 transition-all duration-300">
                <td className="px-4 py-3 rounded-l-2xl border-y border-l border-white/5 flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-gold-500/10 text-gold-500">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-bold text-gold-100">{lot.name}</span>
                </td>
                <td className="px-4 py-3 border-y border-white/5 text-sm text-slate-300">
                  {lot.sign}
                </td>
                <td className="px-4 py-3 border-y border-white/5 text-sm font-mono text-gold-400/80">
                  {formatDegree(lot.degree % 30)}
                </td>
                <td className="px-4 py-3 rounded-r-2xl border-y border-r border-white/5 text-right text-sm font-bold text-white">
                  {getHouse(lot.degree)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

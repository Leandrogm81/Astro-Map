import React from 'react';
import { TraditionalAssessment } from '@/lib/traditional/types';
import { ShieldCheck, ShieldAlert, Star } from 'lucide-react';

interface TraditionalPlanetTableProps {
  assessments: Record<string, TraditionalAssessment>;
  onPlanetClick: (id: string, position?: { x: number, y: number }) => void;
  selectedPlanetId: string | null;
}

const PLANET_ORDER = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

export default function TraditionalPlanetTable({ 
  assessments, 
  onPlanetClick,
  selectedPlanetId 
}: TraditionalPlanetTableProps) {
  return (
    <div className="overflow-x-auto scrollbar-none">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <th className="px-4 py-2">Planeta</th>
            <th className="px-4 py-2">Condição</th>
            <th className="px-4 py-2 text-center">Essencial</th>
            <th className="px-4 py-2 text-center">Acidental</th>
            <th className="px-4 py-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {PLANET_ORDER.map((id) => {
            const data = assessments[id];
            if (!data) return null;

            const isStrong = data.score.total >= 5;
            const isWeak = data.score.total <= -5;
            const isSelected = selectedPlanetId === id;

            return (
              <tr 
                key={id}
                onClick={(e) => onPlanetClick(id, { x: e.clientX, y: e.clientY })}
                className={`group cursor-pointer transition-all duration-300 ${
                  isSelected ? 'bg-gold-500/10' : 'hover:bg-white/5'
                }`}
              >
                <td className="px-4 py-4 rounded-l-2xl border-y border-l border-white/5 group-hover:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors ${
                      isSelected ? 'text-gold-400' : 'text-slate-300'
                    }`}>
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-none flex items-center gap-2">
                        {getPlanetLabel(id)}
                        {data.score.breakdown.essential['Exílio'] && (
                          <span className="text-[7px] text-red-500 border border-red-500/30 px-1 rounded bg-red-500/5">EXÍLIO</span>
                        )}
                        {data.score.breakdown.essential['Queda'] && (
                          <span className="text-[7px] text-orange-500 border border-orange-500/30 px-1 rounded bg-orange-500/5">QUEDA</span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">
                        {data.sign} {Math.floor(data.degree)}°
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 border-y border-white/5 group-hover:border-white/10">
                  <div className="flex gap-2">
                    {data.condition.isCombust && (
                      <span className="text-[9px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20 font-bold uppercase">Combusto</span>
                    )}
                    {data.isRetrograde && (
                      <span className="text-[9px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full border border-orange-500/20 font-bold uppercase">Retro</span>
                    )}
                    {data.condition.isHayz && (
                      <span className="text-[9px] bg-gold-500/10 text-gold-500 px-2 py-0.5 rounded-full border border-gold-500/20 font-bold uppercase">Hayz</span>
                    )}
                    {!data.condition.isCombust && !data.isRetrograde && !data.condition.isHayz && (
                      <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20 font-bold uppercase tracking-tighter">Normal</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4 border-y border-white/5 group-hover:border-white/10 text-center">
                  <span className={`text-xs font-bold ${data.score.essential >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.score.essential > 0 ? `+${data.score.essential}` : data.score.essential}
                  </span>
                </td>

                <td className="px-4 py-4 border-y border-white/5 group-hover:border-white/10 text-center">
                  <span className={`text-xs font-bold ${data.score.accidental >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.score.accidental > 0 ? `+${data.score.accidental}` : data.score.accidental}
                  </span>
                </td>

                <td className="px-4 py-4 rounded-r-2xl border-y border-r border-white/5 group-hover:border-white/10 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`text-lg font-black ${
                      isStrong ? 'text-gold-400' : isWeak ? 'text-red-400' : 'text-white'
                    }`}>
                      {data.score.total}
                    </span>
                    {isStrong && <ShieldCheck className="w-4 h-4 text-gold-500" />}
                    {isWeak && <ShieldAlert className="w-4 h-4 text-red-500" />}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getPlanetLabel(id: string): string {
  const map: Record<string, string> = {
    sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio',
    venus: 'Vênus', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno'
  };
  return map[id] || id;
}

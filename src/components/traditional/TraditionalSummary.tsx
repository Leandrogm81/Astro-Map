import React from 'react';
import { NatalChart } from '@/types';
import { TraditionalAssessment } from '@/lib/traditional/types';
import { Sun, Moon, Star, Shield, Zap, TrendingUp } from 'lucide-react';

interface TraditionalSummaryProps {
  chart: NatalChart;
  assessments: Record<string, TraditionalAssessment>;
}

export default function TraditionalSummary({ chart, assessments }: TraditionalSummaryProps) {
  const isDay = chart.isDayChart;
  
  // Encontrar o Almuten (planeta com maior total score)
  const assessmentList = Object.values(assessments);
  const strongest = [...assessmentList].sort((a, b) => b.score.total - a.score.total)[0];
  const weakest = [...assessmentList].sort((a, b) => a.score.total - b.score.total)[0];

  const strongestName = strongest ? getPlanetLabel(strongest.planetId) : 'N/A';
  const weakestName = weakest ? getPlanetLabel(weakest.planetId) : 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card de Seita */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/10 flex items-center gap-4 group hover:border-gold-500/30 transition-all">
        <div className={`p-3 rounded-2xl ${isDay ? 'bg-orange-500/20 text-orange-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
          {isDay ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Seita do Mapa</p>
          <p className="text-lg font-bold text-white">{isDay ? 'Diurno' : 'Noturno'}</p>
        </div>
      </div>

      {/* Card de Almuten (Provisório) */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/10 flex items-center gap-4 group hover:border-gold-500/30 transition-all">
        <div className="p-3 rounded-2xl bg-gold-500/20 text-gold-400">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mais Potente</p>
          <p className="text-lg font-bold text-white">{strongestName}</p>
        </div>
      </div>

      {/* Card de Debilidade */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/10 flex items-center gap-4 group hover:border-gold-500/30 transition-all">
        <div className="p-3 rounded-2xl bg-red-500/20 text-red-400">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mais Debilitado</p>
          <p className="text-lg font-bold text-white">{weakestName}</p>
        </div>
      </div>

      {/* Card de Síntese */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-white/10 flex items-center gap-4 group hover:border-gold-500/30 transition-all">
        <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status Geral</p>
          <p className="text-lg font-bold text-white">
            {strongest && strongest.score.total > 10 ? 'Excelente' : 'Funcional'}
          </p>
        </div>
      </div>
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

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

  const strongestName = strongest ? getPlanetLabel(strongest.planetId) : 'Calculando...';
  const weakestName = weakest ? getPlanetLabel(weakest.planetId) : 'Calculando...';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-slate-950/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/5 flex items-center gap-4 group hover:border-gold-500/20 hover:bg-slate-900/40 transition-all duration-500 shadow-gold-premium">
        <div className={`p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110 ${isDay ? 'bg-orange-500/10 text-orange-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
          {isDay ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Seita do Mapa</p>
          <p className={`text-lg font-bold ${isDay ? 'text-orange-200' : 'text-indigo-200'}`}>{isDay ? 'Diurna' : 'Noturna'}</p>
        </div>
      </div>

      <div className="bg-slate-950/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/5 flex items-center gap-4 group hover:border-gold-500/30 hover:bg-slate-900/40 transition-all duration-500 shadow-gold-premium">
        <div className="p-3 rounded-2xl bg-gold-500/10 text-gold-400 transition-transform duration-500 group-hover:scale-110">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Mais Potente</p>
          <p className="text-lg font-bold text-white group-hover:text-gold-200 transition-colors">{strongestName}</p>
        </div>
      </div>

      <div className="bg-slate-950/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/5 flex items-center gap-4 group hover:border-red-500/20 hover:bg-slate-900/40 transition-all duration-500 shadow-lg">
        <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 transition-transform duration-500 group-hover:scale-110">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Mais Debilitado</p>
          <p className="text-lg font-bold text-white group-hover:text-red-200 transition-colors">{weakestName}</p>
        </div>
      </div>

      <div className="bg-slate-950/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/5 flex items-center gap-4 group hover:border-blue-500/20 hover:bg-slate-900/40 transition-all duration-500 shadow-lg">
        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 transition-transform duration-500 group-hover:scale-110">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Status Geral</p>
          <p className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors">
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

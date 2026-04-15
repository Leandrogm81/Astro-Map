import React from 'react';
import { NatalChart, ASPECT_ORBS } from '@/types';
import { Info } from 'lucide-react';

interface TraditionalAspectListProps {
  chart: NatalChart;
}

const TRADITIONAL_TYPES = ['conjunction', 'sextile', 'square', 'trine', 'opposition'];

const TYPE_NAME_PT: Record<string, string> = {
  conjunction: 'Conjunção',
  sextile: 'Sextil',
  square: 'Quadratura',
  trine: 'Trígono',
  opposition: 'Oposição'
};

const PLANET_NAME_PT: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', 
  mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno'
};

export default function TraditionalAspectList({ chart }: TraditionalAspectListProps) {
  const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  
  const filteredAspects = chart.aspects.filter(as => {
    return TRADITIONAL_TYPES.includes(as.type) && 
           classicIds.includes(as.planet1.toLowerCase()) && 
           classicIds.includes(as.planet2.toLowerCase());
  });

  if (filteredAspects.length === 0) {
    return (
      <div className="bg-white/5 rounded-3xl p-8 border border-white/10 text-center">
        <p className="text-slate-500 italic">Nenhum aspecto tradicional principal encontrado entre os planetas clássicos.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-xl">
      <div className="p-5 border-b border-white/10 bg-white/5">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          Análise de Aspectos Tradicionais
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Planetas</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aspecto</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Orbe</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Dinamismo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredAspects.map((aspect, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-tight">
                      {PLANET_NAME_PT[aspect.planet1.toLowerCase()] || aspect.planet1}
                    </span>
                    <span className="text-slate-600 text-[10px]">e</span>
                    <span className="text-sm font-bold text-white tracking-tight">
                      {PLANET_NAME_PT[aspect.planet2.toLowerCase()] || aspect.planet2}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${getAspectColor(aspect.type)}`}>
                    {TYPE_NAME_PT[aspect.type]}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-xs font-mono text-slate-400">
                    {aspect.orb.toFixed(2)}°
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${aspect.applying ? 'text-green-400' : 'text-slate-500'}`}>
                    {aspect.applying ? 'Aplicativo' : 'Separativo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-blue-500/5 text-blue-400 text-[10px] flex items-start gap-3 border-t border-white/5">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <p className="leading-relaxed">
          Os aspectos tradicionais são considerados apenas entre os sete planetas visíveis a olho nu, utilizando orbes ptolemaicos. Aspectos aplicativos (se aproximando) possuem maior impacto de manifestação futura.
        </p>
      </div>
    </div>
  );
}

function getAspectColor(type: string): string {
  switch (type) {
    case 'conjunction': return 'bg-white/10 text-white';
    case 'sextile': return 'bg-cyan-500/20 text-cyan-400';
    case 'trine': return 'bg-emerald-500/20 text-emerald-400';
    case 'square': return 'bg-red-500/20 text-red-400';
    case 'opposition': return 'bg-orange-500/20 text-orange-400';
    default: return 'bg-slate-500/20 text-slate-400';
  }
}

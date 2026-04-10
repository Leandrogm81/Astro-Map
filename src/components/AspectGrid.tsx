import React from 'react';
import { NatalChart, PLANETS, Aspect } from '@/types';

interface AspectGridProps {
  chart: NatalChart;
}

const GRID_PLANETS = [
  'Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Netuno', 'Plutão'
];

export default function AspectGrid({ chart }: AspectGridProps) {
  const findAspect = (p1: string, p2: string): Aspect | undefined => {
    return chart.aspects.find(a => 
      (a.planet1 === p1 && a.planet2 === p2) || 
      (a.planet1 === p2 && a.planet2 === p1)
    );
  };

  const getAspectSymbol = (type: Aspect['type']): string => {
    switch (type) {
      case 'conjunction': return '☌';
      case 'sextile': return '⚹';
      case 'square': return '□';
      case 'trine': return '△';
      case 'opposition': return '☍';
      default: return '•';
    }
  };

  const getAspectColor = (type: Aspect['type']): string => {
    return `aspect-${type}`;
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-block min-w-full align-middle">
        <div className="relative border border-white/5 rounded-xl overflow-hidden bg-slate-950/20 backdrop-blur-sm">
          {/* Header Row */}
          <div className="flex">
            <div className="w-12 h-12 flex-shrink-0 border-b border-r border-white/5 bg-slate-900/40"></div>
            {GRID_PLANETS.map(p => {
              const symbol = PLANETS.find(info => info.name === p)?.symbol || '?';
              return (
                <div key={`header-${p}`} className="w-10 h-12 flex-shrink-0 border-b border-r border-white/5 flex flex-col items-center justify-center bg-slate-900/40" title={p}>
                  <span className="text-gold-400 font-serif text-lg">{symbol}</span>
                  <span className="text-[7px] uppercase tracking-tighter text-slate-500 font-bold">{p.substring(0, 3)}</span>
                </div>
              );
            })}
          </div>

          {/* Grid Rows */}
          {GRID_PLANETS.map((p1, rowIndex) => (
            <div key={`row-${p1}`} className="flex">
              {/* Row Label */}
              <div className="w-12 h-10 flex-shrink-0 border-b border-r border-white/5 flex flex-col items-center justify-center bg-slate-900/40" title={p1}>
                <span className="text-gold-400 font-serif text-lg">
                  {PLANETS.find(info => info.name === p1)?.symbol}
                </span>
                <span className="text-[7px] uppercase tracking-tighter text-slate-500 font-bold">{p1.substring(0, 3)}</span>
              </div>

              {/* Data Cells */}
              {GRID_PLANETS.map((p2, colIndex) => {
                // Symmetrical half only (triangular matrix)
                if (colIndex >= rowIndex) {
                  return (
                    <div key={`cell-${p1}-${p2}`} className="w-10 h-10 flex-shrink-0 border-b border-r border-white/5 bg-slate-950/10"></div>
                  );
                }

                const aspect = findAspect(p1, p2);
                if (!aspect) {
                  return (
                    <div key={`cell-${p1}-${p2}`} className="w-10 h-10 flex-shrink-0 border-b border-r border-white/5 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-slate-800" />
                    </div>
                  );
                }

                return (
                  <div 
                    key={`cell-${p1}-${p2}`} 
                    className={`w-10 h-10 flex-shrink-0 border-b border-r border-white/5 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-help group`}
                    title={`${p1} ${aspect.type} ${p2} (órbita: ${aspect.orb.toFixed(1)}°)`}
                  >
                    <span className={`text-xl leading-none ${getAspectColor(aspect.type)} drop-shadow-sm`}>
                      {getAspectSymbol(aspect.type)}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 mt-0.5 font-bold">
                      {Math.round(aspect.orb)}°
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-4 text-[10px] uppercase tracking-widest font-black text-slate-500 px-2">
        <span className="flex items-center gap-1.5"><span className="text-yellow-400 text-lg">☌</span> Conjunção</span>
        <span className="flex items-center gap-1.5"><span className="text-blue-400 text-lg">⚹</span> Sextil</span>
        <span className="flex items-center gap-1.5"><span className="text-red-500 text-lg">□</span> Quadratura</span>
        <span className="flex items-center gap-1.5"><span className="text-green-400 text-lg">△</span> Trígono</span>
        <span className="flex items-center gap-1.5"><span className="text-orange-500 text-lg">☍</span> Oposição</span>
      </div>
    </div>
  );
}

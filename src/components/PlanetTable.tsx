import { NatalChart, ZODIAC_SIGNS } from '@/types';
import { getElementColor } from '@/lib/astrology';

interface PlanetTableProps {
  chart: NatalChart;
}

export default function PlanetTable({ chart }: PlanetTableProps) {
  const formatDegree = (degree: number): string => {
    const d = Math.floor(degree);
    const m = Math.floor((degree - d) * 60);
    return `${d}°${m.toString().padStart(2, '0')}'`;
  };

  const getElementFromSign = (sign: string): 'fire' | 'earth' | 'air' | 'water' => {
    const signData = ZODIAC_SIGNS.find(s => s.name === sign);
    return signData?.element || 'fire';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {chart.planets.map((planet) => {
        const element = getElementFromSign(planet.sign);
        const elementColor = getElementColor(element);
        
        return (
          <div 
            key={planet.name}
            className={`group element-${element} relative overflow-hidden p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/5`}
          >
            {/* Element Glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 blur-[40px] opacity-20 transition-opacity group-hover:opacity-40 bg-element-gradient" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                    {planet.symbol}
                  </span>
                  <div>
                    <h4 className="text-lg font-serif font-semibold text-white leading-tight">
                      {planet.name}
                    </h4>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                      Planeta
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-element-soft text-element border border-element-soft`}>
                    {planet.sign}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {formatDegree(planet.degree)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-950/50 border border-white/10 text-gold-400 font-serif text-lg mb-1">
                  {planet.house}
                </div>
                <p className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">Casa</p>
                {planet.retrograde && (
                  <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-500 uppercase tracking-tighter">
                    <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                    Retrógrado
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

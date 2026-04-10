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
            className={`group element-${element} relative overflow-hidden p-5 min-h-[140px] rounded-2xl bg-white/5 border border-white/10 hover:border-gold-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/5 flex flex-col justify-between`}
          >
            {/* Element Glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 blur-[40px] opacity-20 transition-opacity group-hover:opacity-40 bg-element-gradient" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] shrink-0">
                  {planet.symbol}
                </span>
                <div className="min-w-0">
                  <h4 className="text-lg font-serif font-semibold text-white leading-tight truncate">
                    {planet.name}
                  </h4>
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                    Planeta
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-950/50 border border-white/10 text-gold-400 font-serif font-bold text-lg">
                  {planet.house}
                </div>
                <p className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold">Casa</p>
              </div>
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-element-soft text-element border border-element-soft`}>
                  {planet.sign}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {formatDegree(planet.degree)}
                </span>
              </div>

              {planet.retrograde && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-500 uppercase tracking-tighter">
                  <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                  Rx
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

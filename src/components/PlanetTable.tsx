import { NatalChart, ZODIAC_SIGNS } from '@/types';
import { getElementColor, getDignity } from '@/lib/astrology';

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

  const getModalityFromSign = (sign: string): string => {
    const cardinal = ['Áries', 'Câncer', 'Libra', 'Capricórnio'];
    const fixed = ['Touro', 'Leão', 'Escorpião', 'Aquário'];
    if (cardinal.includes(sign)) return 'Cardinal';
    if (fixed.includes(sign)) return 'Fixo';
    return 'Mutável';
  };

  // Cálculos de Resumo
  const elementCounts = chart.planets.reduce((acc, p) => {
    const el = getElementFromSign(p.sign);
    acc[el] = (acc[el] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const modalityCounts = chart.planets.reduce((acc, p) => {
    const mod = getModalityFromSign(p.sign);
    acc[mod] = (acc[mod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const elementWidths: Record<number, string> = {
    0: 'w-[0%]', 1: 'w-[10%]', 2: 'w-[20%]', 3: 'w-[30%]', 4: 'w-[40%]',
    5: 'w-[50%]', 6: 'w-[60%]', 7: 'w-[70%]', 8: 'w-[80%]', 9: 'w-[90%]', 10: 'w-[100%]'
  };

  const modalityWidths: Record<number, string> = {
    0: 'w-[0%]', 1: 'w-[12%]', 2: 'w-[24%]', 3: 'w-[36%]', 4: 'w-[48%]',
    5: 'w-[60%]', 6: 'w-[72%]', 7: 'w-[84%]', 8: 'w-[96%]', 9: 'w-[100%]', 10: 'w-[100%]'
  };

  return (
    <div className="space-y-8">
      {/* Resumo Elemental e Modal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-4 rounded-2xl border border-white/5">
          <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-3">Distribuição Elemental</h5>
          <div className="flex gap-2">
            {(['fire', 'earth', 'air', 'water'] as const).map(el => (
              <div key={el} className={`flex-1 flex flex-col gap-1 element-${el}`}>
                <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                  <div 
                    className={`h-full transition-all duration-1000 bg-[var(--el-color)] ${elementWidths[elementCounts[el] || 0] || 'w-0'}`}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                  <span>{el === 'fire' ? 'Fogo' : el === 'earth' ? 'Terra' : el === 'air' ? 'Ar' : 'Água'}</span>
                  <span className="text-element">{elementCounts[el] || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/5">
          <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-3">Ritmos / Modalidades</h5>
          <div className="flex gap-2">
            {['Cardinal', 'Fixo', 'Mutável'].map(mod => (
              <div key={mod} className="flex-1 flex flex-col gap-1">
                <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                  <div 
                    className={`h-full bg-purple-500/50 transition-all duration-1000 ${modalityWidths[modalityCounts[mod] || 0] || 'w-0'}`}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                  <span>{mod}</span>
                  <span className="text-purple-400">{modalityCounts[mod] || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {chart.planets.map((planet) => {
          const element = getElementFromSign(planet.sign);
          const dignity = getDignity(planet.name, planet.sign);
          
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
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-element-soft text-element border border-element-soft`}>
                      {planet.sign}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatDegree(planet.degree)}
                    </span>
                  </div>
                  {dignity !== 'Neutro / Peregrino' && (
                    <span className={`text-[10px] font-bold ${
                      dignity === 'Domicílio' || dignity === 'Exaltação' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {dignity === 'Domicílio' ? '🏠 Domicílio' : 
                       dignity === 'Exaltação' ? '⬆ Exaltação' : 
                       dignity === 'Queda' ? '🔻 Queda' : '❌ Exílio'}
                    </span>
                  )}
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
    </div>
  );
}

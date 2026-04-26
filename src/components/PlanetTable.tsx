import { NatalChart, ZODIAC_SIGNS } from '@/types';
import { getElementColor, getDignity } from '@/lib/astrology';
import AdvancedAnalysis from './AdvancedAnalysis';
import { Info } from 'lucide-react';

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

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        {chart.planets.map((planet) => {
          const element = getElementFromSign(planet.sign);
          const dignity = getDignity(planet.name, planet.sign);
          
          return (
            <div 
              key={planet.name}
              data-testid="planet-card"
              className={`group element-${element} relative p-3 md:p-5 min-h-[120px] md:min-h-[140px] rounded-2xl bg-white/5 border border-white/10 hover:border-gold-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/5 flex flex-col justify-between`}
            >
              {/* Element Glow - Wrapped to handle overflow-hidden without clipping tooltips */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className="absolute -top-12 -right-12 w-24 h-24 blur-[40px] opacity-20 transition-opacity group-hover:opacity-40 bg-element-gradient" />
              </div>
              
              <div className="flex items-start justify-between relative z-10 gap-2">
                <div className="flex min-w-0 items-center gap-2 md:gap-3">
                  <span className="text-xl md:text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] shrink-0">
                    {planet.symbol}
                  </span>
                  <div className="min-w-0 flex items-center gap-1.5 md:gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm md:text-lg font-serif font-semibold text-white leading-tight truncate">
                        {planet.name}
                      </h4>
                      <p className="hidden md:block text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                        Planeta
                      </p>
                      <div className="group relative">
                        <Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 hover:text-gold-400 cursor-help transition-colors" />
                        <div className="absolute left-0 bottom-full mb-2 w-52 p-3 bg-slate-900 border border-white/20 rounded-xl text-[11px] leading-relaxed text-slate-200 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] translate-y-2 group-hover:translate-y-0">
                          <div className="flex flex-col gap-1">
                            <span className="font-black uppercase tracking-tighter text-gold-500 text-[9px]">Significado</span>
                            {planet.name.toLowerCase() === 'sol' && 'A essência, vitalidade e a identidade central.'}
                            {planet.name.toLowerCase() === 'lua' && 'As emoções, reações intuitivas e necessidades de segurança.'}
                            {planet.name.toLowerCase() === 'mercúrio' && 'A comunicação, o intelecto e a forma como processamos dados.'}
                            {planet.name.toLowerCase() === 'vênus' && 'Os valores, relacionamentos e o senso de beleza e prazer.'}
                            {planet.name.toLowerCase() === 'marte' && 'A ação, energia física, desejo e como afirmamos nossa vontade.'}
                            {planet.name.toLowerCase() === 'júpiter' && 'A expansão, sorte, sabedoria e busca por significado.'}
                            {planet.name.toLowerCase() === 'saturno' && 'A estrutura, responsabilidade, limitações e lições de tempo.'}
                            {planet.name.toLowerCase() === 'urano' && 'A inovação, originalidade, rebeldia e mudanças súbitas.'}
                            {planet.name.toLowerCase() === 'netuno' && 'A espiritualidade, sonhos, imaginação e dissolução de fronteiras.'}
                            {planet.name.toLowerCase() === 'plutão' && 'A transformação profunda, poder, renascimento e processos ocultos.'}
                            {planet.name.toLowerCase() === 'quíron' && 'A ferida profunda que se torna o portal para a cura.'}
                            {planet.name.toLowerCase() === 'lilith' && 'A sombra selvagem, o poder reprimido e a rebeldia.'}
                            {planet.name.toLowerCase() === 'nodo norte' && 'O propósito evolutivo e a missão desta existência.'}
                            {planet.name.toLowerCase() === 'nodo sul' && 'Talentos inatos e comportamentos do passado a serem equilibrados.'}
                            {planet.name.toLowerCase() === 'roda da fortuna' && 'O ponto de maior harmonia, alegria e abundância.'}
                            {planet.name.toLowerCase() === 'ascendente' && 'A forma como você se apresenta e inicia novos ciclos.'}
                            {planet.name.toLowerCase() === 'meio do céu' && 'A vocação e a realização profissional.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-slate-950/50 border border-white/10 text-gold-400 font-serif font-bold text-sm md:text-lg">
                    {planet.house}
                  </div>
                  <p className="hidden md:block text-[9px] uppercase tracking-tighter text-slate-500 font-bold">Casa</p>
                </div>
              </div>

              <div className="relative z-10 mt-3 md:mt-4 flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1.5 md:gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                    <span className={`px-1.5 md:px-2 py-0.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-wider bg-element-soft text-element border border-element-soft`}>
                      {planet.sign}
                    </span>
                    <span className="text-[10px] md:text-[11px] font-mono text-slate-400">
                      {formatDegree(planet.degree)}
                    </span>
                  </div>
                  {dignity !== 'Neutro / Peregrino' && (
                    <span className={`text-[9px] md:text-[10px] leading-tight font-bold ${
                      dignity === 'Domicílio' || dignity === 'Exaltação' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {dignity === 'Domicílio' ? '🏠 Domicílio' : 
                       dignity === 'Exaltação' ? '⬆ Exaltação' : 
                       dignity === 'Queda' ? '🔻 Queda' : '❌ Exílio'}
                    </span>
                  )}
                </div>

                {planet.retrograde && (
                  <div className="inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[8px] md:text-[9px] font-black text-red-500 uppercase tracking-tighter">
                    <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                    Rx
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AdvancedAnalysis chart={chart} />
    </div>
  );
}

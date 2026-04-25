import { NatalChart, Aspect } from '@/types';
import AspectGrid from './AspectGrid';
import { planetLabelPtBr, normalizePlanetKey } from '@/lib/planetNaming';

interface AspectsListProps {
  chart: NatalChart;
}

export default function AspectsList({ chart }: AspectsListProps) {
  const getAspectSymbol = (type: Aspect['type']): string => {
    switch (type) {
      case 'conjunction': return '☌';
      case 'sextile': return '⚹';
      case 'square': return '□';
      case 'trine': return '△';
      case 'opposition': return '☍';
      case 'semisextile': return '⚺';
      case 'semisquare': return '∠';
      case 'sesquiquadrate': return '⚼';
      case 'quincunx': return '⚻';
      default: return '◦';
    }
  };

  const getAspectName = (type: Aspect['type']): string => {
    const names: Record<string, string> = {
      'conjunction': 'Conjunção',
      'sextile': 'Sextil',
      'square': 'Quadratura',
      'trine': 'Trígono',
      'opposition': 'Oposição',
      'semisextile': 'Semisextil',
      'semisquare': 'Semiquadratura',
      'sesquiquadrate': 'Sesquiquadratura',
      'quincunx': 'Quincúncio',
    };
    return names[type] || type;
  };

  const majorAspects = chart.aspects.filter(a =>
    ['conjunction', 'sextile', 'square', 'trine', 'opposition', 'quincunx'].includes(a.type)
  ).sort((a, b) => a.orb - b.orb);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gold-500/60 mb-6 flex items-center gap-3">
          <span className="w-8 h-[1px] bg-gold-500/30"></span>
          Grade de Aspectos
          <span className="flex-1 h-[1px] bg-gold-500/30"></span>
        </h3>
        <AspectGrid chart={chart} />
      </div>

      <hr className="border-white/5" />

      <div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gold-500/60 mb-6 flex items-center gap-3">
          <span className="w-8 h-[1px] bg-gold-500/30"></span>
          Lista Detalhada
          <span className="flex-1 h-[1px] bg-gold-500/30"></span>
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {majorAspects.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              Nenhum aspecto principal encontrado
            </p>
          ) : (
            majorAspects.map((aspect, index) => {
              const key = [normalizePlanetKey(aspect.planet1), normalizePlanetKey(aspect.planet2)]
                .filter(Boolean)
                .sort()
                .join('|');
              return (
                <div
                  key={`${key}-${index}`}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 p-3 bg-slate-900/50 border border-purple-500/10 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300 min-w-[80px]">
                      {planetLabelPtBr(normalizePlanetKey(aspect.planet1)!)}
                    </span>

                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 shrink-0 border border-white/5"
                      title={getAspectName(aspect.type)}
                    >
                      <span className="text-lg">{getAspectSymbol(aspect.type)}</span>
                    </div>

                    <span className="text-sm text-slate-300 min-w-[80px]">
                      {planetLabelPtBr(normalizePlanetKey(aspect.planet2)!)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 md:gap-4 text-xs">
                    <span
                      className={`px-3 py-1 rounded-full bg-aspect-${aspect.type} text-white/90 font-bold uppercase tracking-tighter text-[10px] shadow-lg border border-white/10`}
                    >
                      {getAspectName(aspect.type)}
                    </span>

                    <span className="text-slate-500">
                      {aspect.angle.toFixed(1)}°
                    </span>

                    <span
                      className={`px-2 py-1 rounded ${
                        aspect.orb <= 3
                          ? 'bg-green-500/20 text-green-400'
                          : aspect.orb <= 6
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      órbita: {aspect.orb.toFixed(1)}°
                    </span>

                    <span className="text-slate-500">
                      {aspect.applying ? 'aplicando' : 'separando'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

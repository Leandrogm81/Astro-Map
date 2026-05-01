import { SephirahScore } from '@/lib/kabbalah/scoring';
import { SephirahName } from '@/lib/kabbalah/types';
import { Eye, EyeOff, Trophy, Flame, Sparkles } from 'lucide-react';
import { getSephirahDefinition } from '@/lib/kabbalah/sephiroth';

interface ScoringRankingProps {
  readonly scores: Record<SephirahName, SephirahScore>;
  readonly showHalos: boolean;
  readonly onToggleHalos: () => void;
}

export default function ScoringRanking({ scores, showHalos, onToggleHalos }: ScoringRankingProps) {
  const sortedScores = Object.values(scores).sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col h-full rounded-3xl border border-white/10 bg-slate-950/60 p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gold-300" />
            Poder Planetário
          </h4>
          <p className="text-xs text-slate-400 mt-1">Intensidade energética na Árvore</p>
        </div>
        <button
          onClick={onToggleHalos}
          className="p-2 rounded-full hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
          title={showHalos ? 'Ocultar Halos' : 'Mostrar Halos'}
        >
          {showHalos ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[500px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {sortedScores.map((score, index) => {
          const def = getSephirahDefinition(score.sephirah);
          const isHighest = index === 0 && score.score > 0;
          
          return (
            <div 
              key={score.sephirah}
              className="relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-3"
            >
              <div 
                className="absolute inset-y-0 left-0 w-1 opacity-50"
                style={{ backgroundColor: def.color }} // nosonar
              />
              
              <div className="flex items-center justify-between mb-1 pl-2">
                <span className="font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                  {isHighest && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                  {score.sephirah}
                </span>
                <span className="font-bold text-sm text-white">
                  {score.score}
                </span>
              </div>
              
              <div className="w-full bg-black/40 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${score.score}%`,
                    backgroundColor: def.color,
                    boxShadow: score.score >= 80 ? `0 0 8px ${def.color}` : 'none'
                  }} // nosonar
                />
              </div>
              
              {isHighest && (
                <div className="mt-2 text-[10px] text-orange-300/80 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Esfera mais ativa
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

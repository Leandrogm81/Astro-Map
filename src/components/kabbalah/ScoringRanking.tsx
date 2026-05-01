import { SephirahScore } from '@/lib/kabbalah/scoring';
import { SephirahName } from '@/lib/kabbalah/types';
import { Eye, EyeOff, Trophy, Flame, Sparkles } from 'lucide-react';

interface ScoringRankingProps {
  readonly scores: Record<SephirahName, SephirahScore>;
  readonly showHalos: boolean;
  readonly onToggleHalos: () => void;
}

function getAccentClasses(name: SephirahName): { readonly strip: string; readonly fill: string } {
  const accentClassBySephirah: Record<SephirahName, { readonly strip: string; readonly fill: string }> = {
    Kether: { strip: 'bg-[#FFFFFF]', fill: 'text-[#FFFFFF]' },
    Chokmah: { strip: 'bg-[#A9A9A9]', fill: 'text-[#A9A9A9]' },
    Binah: { strip: 'bg-[#000000]', fill: 'text-[#D1D5DB]' },
    Daath: { strip: 'bg-[#D8BFD8]', fill: 'text-[#D8BFD8]' },
    Chesed: { strip: 'bg-[#0000FF]', fill: 'text-[#3B82F6]' },
    Geburah: { strip: 'bg-[#FF0000]', fill: 'text-[#EF4444]' },
    Tiphereth: { strip: 'bg-[#FFD700]', fill: 'text-[#FACC15]' },
    Netzach: { strip: 'bg-[#008000]', fill: 'text-[#22C55E]' },
    Hod: { strip: 'bg-[#FFA500]', fill: 'text-[#F59E0B]' },
    Yesod: { strip: 'bg-[#8A2BE2]', fill: 'text-[#A855F7]' },
    Malkuth: { strip: 'bg-[#1A1A1A]', fill: 'text-[#9CA3AF]' },
  };

  return accentClassBySephirah[name];
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
          const accent = getAccentClasses(score.sephirah);
          const isHighest = index === 0 && score.score > 0;
          
          return (
            <div 
              key={score.sephirah}
              className="relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-3"
            >
              <div 
                className={`absolute inset-y-0 left-0 w-1 opacity-50 ${accent.strip}`}
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
              
              <progress
                value={score.score}
                max={100}
                aria-label={`Poder de ${score.sephirah}`}
                className={`mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40 ${accent.fill} [&::-webkit-progress-bar]:bg-black/40 [&::-webkit-progress-value]:bg-current [&::-moz-progress-bar]:bg-current ${
                  score.score >= 80
                    ? '[&::-webkit-progress-value]:shadow-[0_0_8px_currentColor] [&::-moz-progress-bar]:shadow-[0_0_8px_currentColor]'
                    : ''
                }`}
              />
              
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

'use client';

import { NatalChart, LotPosition } from '@/types';
import { formatDegree } from '@/lib/astrology';
import { Info, Sparkles, Sword, Heart, Shield, Trophy, Zap, Scale } from 'lucide-react';

interface LotTableProps {
  chart: NatalChart;
}

const LotIcon = ({ id }: { id: string }) => {
  switch (id) {
    case 'fortune': return <Sparkles className="w-4 h-4 text-gold-400" />;
    case 'spirit': return <Zap className="w-4 h-4 text-purple-400" />;
    case 'eros': return <Heart className="w-4 h-4 text-pink-400" />;
    case 'necessity': return <Scale className="w-4 h-4 text-slate-400" />;
    case 'courage': return <Sword className="w-4 h-4 text-red-400" />;
    case 'victory': return <Trophy className="w-4 h-4 text-amber-400" />;
    case 'nemesis': return <Shield className="w-4 h-4 text-indigo-400" />;
    default: return null;
  }
};

export default function LotTable({ chart }: LotTableProps) {
  if (!chart.lots || chart.lots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 glass rounded-3xl border border-white/5">
        <div className="w-16 h-16 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-serif font-bold text-white">Lotes Ausentes</h3>
        <p className="text-sm text-slate-400 max-w-xs">
          Este mapa foi salvo em uma versão anterior. Selecione-o novamente na lista lateral para atualizar os cálculos automaticamente.
        </p>
      </div>
    );
  }

  const traditionalPoints = chart.traditionalPoints;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Pontos Tradicionais (Senhor da Natividade, etc.) */}
      {traditionalPoints && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass p-4 rounded-2xl border border-white/5 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gold-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-1">Senhor da Natividade</h5>
             <p className="text-lg font-serif font-bold text-white group-hover:text-gold-400 transition-colors uppercase tracking-tight">
               {traditionalPoints.lordOfNativity}
             </p>
          </div>
          <div className="glass p-4 rounded-2xl border border-white/5 relative overflow-hidden group">
             <div className="absolute inset-0 bg-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-1">Almuten Figuris</h5>
             <p className="text-lg font-serif font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">
               {traditionalPoints.almutenFiguris}
             </p>
          </div>
          <div className="glass p-4 rounded-2xl border border-white/5 relative overflow-hidden group">
             <div className="absolute inset-0 bg-red-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-1">Hyleg</h5>
             <p className="text-lg font-serif font-bold text-white group-hover:text-red-400 transition-colors uppercase tracking-tight">
               {traditionalPoints.hyleg}
             </p>
          </div>
          <div className="glass p-4 rounded-2xl border border-white/5 relative overflow-hidden group">
             <div className="absolute inset-0 bg-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-1">Alcocoden</h5>
             <p className="text-lg font-serif font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
               {traditionalPoints.alcocoden}
             </p>
          </div>
        </div>
      )}

      {/* Lotes Herméticos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {chart.lots.map((lot) => (
          <div 
            key={lot.id}
            className="glass group relative p-5 rounded-2xl border border-white/10 hover:border-gold-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-gold-500/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {lot.symbol}
                </div>
                <div>
                  <h4 className="text-base font-serif font-bold text-white leading-tight">
                    {lot.name}
                  </h4>
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Lote Hermético</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-serif font-bold text-gold-400">{lot.house}ª</div>
                <p className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold">Casa</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10">
                  {lot.sign}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {formatDegree(lot.degree)}
                </span>
              </div>
              
              <div className="flex items-start gap-2 pt-2 border-t border-white/5">
                <LotIcon id={lot.id} />
                <p className="text-[11px] leading-relaxed text-slate-400 group-hover:text-slate-200 transition-colors line-clamp-2">
                  {lot.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

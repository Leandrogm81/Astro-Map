import React from 'react';
import { TraditionalPoints } from '@/types';
import { Crown, Sparkles, Shield, Heart } from 'lucide-react';

interface TraditionalSpecialPointsProps {
  points: TraditionalPoints;
}

export default function TraditionalSpecialPoints({ points }: TraditionalSpecialPointsProps) {
  if (!points) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-8 px-1">
        <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-800/30 min-h-[160px] flex items-center justify-center">
          <p className="text-slate-500 text-sm">Dados não disponíveis</p>
        </div>
        <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-800/30 min-h-[160px] flex items-center justify-center">
          <p className="text-slate-500 text-sm">Dados não disponíveis</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      ...(points.lordOfNativity ?? {}),
      icon: <Crown className="w-5 h-5 text-amber-400" />,
      tag: "Direção",
      bgColor: "from-amber-600/10 to-amber-900/5",
      borderColor: "border-amber-500/30",
      glowColor: "group-hover:shadow-amber-500/20",
      label: "Senhor da Natividade"
    },
    {
      ...(points.hyleg ?? {}),
      icon: <Heart className="w-5 h-5 text-rose-400" />,
      tag: "Vitalidade",
      bgColor: "from-rose-600/10 to-rose-900/5",
      borderColor: "border-rose-500/30",
      glowColor: "group-hover:shadow-rose-500/20",
      label: "Hyleg"
    },
    {
      ...(points.almutenFiguris ?? {}),
      icon: <Sparkles className="w-5 h-5 text-violet-400" />,
      tag: "Guardião",
      bgColor: "from-violet-600/10 to-violet-900/5",
      borderColor: "border-violet-500/30",
      glowColor: "group-hover:shadow-violet-500/20",
      label: "Almuten Figuris"
    },
    {
      ...(points.alcocoden ?? {}),
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      tag: "Longevidade",
      bgColor: "from-emerald-600/10 to-emerald-900/5",
      borderColor: "border-emerald-500/30",
      glowColor: "group-hover:shadow-emerald-500/20",
      label: "Alcocoden"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-8 px-1">
      {cards.map((card) => (
        <div
          key={`${card.label}-${card.id}`}
          className={`relative p-6 rounded-xl border ${card.borderColor} bg-gradient-to-br ${card.bgColor} backdrop-blur-xl shadow-lg group hover:scale-[1.01] transition-all duration-200 overflow-hidden cursor-default min-h-[160px] ${card.glowColor}`}
        >
          {/* Luz de fundo sutil */}
          <div className={`absolute -top-6 -right-6 w-20 h-20 blur-[40px] opacity-20 rounded-full bg-current ${card.borderColor.replace('border', 'bg')}`} />

          {/* Tag flutuante superior */}
          <div className="flex justify-between items-start mb-3">
            <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform duration-200`}>
              {card.icon}
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-black/40 text-slate-400 border border-white/5 backdrop-blur-md">
              {card.tag}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1 filter drop-shadow-sm leading-tight">
                {card.id === 'lordOfNativity' ? 'Senhor da Natividade' : card.label}
              </h4>
              <p className="text-lg font-serif font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-200 leading-tight">
                {card.name}
              </p>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              {card.description}
            </p>
          </div>

          {/* Efeito de brilho na borda ao passar o mouse */}
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
      ))}
    </div>
  );
}

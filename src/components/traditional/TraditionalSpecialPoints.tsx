import React from 'react';
import { TraditionalPoints } from '@/types';
import { Crown, Sparkles, Shield, Zap, TrendingUp, Heart } from 'lucide-react';

interface TraditionalSpecialPointsProps {
  points: TraditionalPoints;
}

export default function TraditionalSpecialPoints({ points }: TraditionalSpecialPointsProps) {
  const cards = [
    { 
      ...points.lordOfNativity, 
      icon: <Crown className="w-4 h-4 text-amber-400" />,
      tag: "Direção",
      bgColor: "from-amber-600/10 to-amber-900/5",
      borderColor: "border-amber-500/30",
      glowColor: "group-hover:shadow-amber-500/20",
      label: "Senhor da Natividade"
    },
    { 
      ...points.hyleg, 
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      tag: "Vitalidade",
      bgColor: "from-rose-600/10 to-rose-900/5",
      borderColor: "border-rose-500/30",
      glowColor: "group-hover:shadow-rose-500/20",
      label: "Hyleg"
    },
    { 
      ...points.almutenFiguris, 
      icon: <Sparkles className="w-4 h-4 text-violet-400" />,
      tag: "Guardião",
      bgColor: "from-violet-600/10 to-violet-900/5",
      borderColor: "border-violet-500/30",
      glowColor: "group-hover:shadow-violet-500/20",
      label: "Almuten Figuris"
    },
    { 
      ...points.alcocoden, 
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      tag: "Longevidade",
      bgColor: "from-emerald-600/10 to-emerald-900/5",
      borderColor: "border-emerald-500/30",
      glowColor: "group-hover:shadow-emerald-500/20",
      label: "Alcocoden"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6 px-1">
      {cards.map((card) => (
        <div 
          key={`${card.label}-${card.id}`} 
          className={`relative p-3 rounded-xl border ${card.borderColor} bg-gradient-to-br ${card.bgColor} backdrop-blur-xl shadow-lg group hover:scale-[1.01] transition-all duration-200 overflow-hidden cursor-default ${card.glowColor}`}
        >
          {/* Luz de fundo sutil */}
          <div className={`absolute -top-4 -right-4 w-16 h-16 blur-[30px] opacity-15 rounded-full bg-current ${card.borderColor.replace('border', 'bg')}`} />

          {/* Tag flutuante superior */}
          <div className="flex justify-between items-start mb-1.5">
            <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:scale-105 transition-transform duration-200`}>
              {card.icon}
            </div>
            <span className="text-[7px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-full bg-black/40 text-slate-400 border border-white/5 backdrop-blur-md">
              {card.tag}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div>
              <h4 className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-0.5 filter drop-shadow-sm leading-tight">
                {card.id === 'lordOfNativity' ? 'Senhor da Natividade' : card.label}
              </h4>
              <p className="text-sm font-serif font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-200 leading-tight">
                {card.name}
              </p>
            </div>

            <p className="text-[9px] text-slate-400 leading-tight font-medium line-clamp-2">
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

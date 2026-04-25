'use client';

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { PlanetPosition, NatalChart } from '@/types';
import { TraditionalAssessment } from '@/lib/traditional/types';
import { X, Shield, Zap, Star, Activity, Info, Link2, GripHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTraditionalAspectInterpretation, getPlanetNamePT } from '@/lib/traditional/aspects';

interface TraditionalPlanetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  planet: PlanetPosition | null;
  assessment: TraditionalAssessment | null;
  chart: NatalChart;
  position: { x: number, y: number } | null;
}

export default function TraditionalPlanetDrawer({ 
  isOpen, 
  onClose, 
  planet, 
  assessment,
  chart,
  position
}: TraditionalPlanetDrawerProps) {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && position) {
      const drawerWidth = window.innerWidth < 768 ? window.innerWidth - 16 : 448;
      const drawerHeight = Math.min(600, window.innerHeight * 0.8); 
      
      // Lógica "Ao lado do clique" solicitada pelo usuário
      let left = position.x + 40;
      // Mobile: centralizar com margem de 8px
      if (window.innerWidth < 768) {
        left = 8;
      }
      let top = position.y - 150;

      // Ajuste horizontal (evitar sair pela direita)
      if (left + drawerWidth > window.innerWidth) {
        left = position.x - drawerWidth - 40;
      }
      
      // Fallback total se ainda sair ou se o clique for muito na borda
      if (left < 10) left = 10;
      if (left + drawerWidth > window.innerWidth) {
        left = (window.innerWidth - drawerWidth) / 2;
      }

      // Ajuste vertical
      if (top + drawerHeight > window.innerHeight) {
        top = window.innerHeight - drawerHeight - 20;
      }
      if (top < 10) top = 10;

      setCoords({ top, left });
    }
  }, [isOpen, position]);

  const filteredAspects = useMemo(() => {
    if (!planet || !chart.aspects) return [];
    const pId = planet.id.toLowerCase();
    const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    
    return chart.aspects.filter(as => {
      const p1 = as.planet1.toLowerCase();
      const p2 = as.planet2.toLowerCase();
      return (p1 === pId || p2 === pId) && 
             classicIds.includes(p1) && 
             classicIds.includes(p2);
    }).sort((a, b) => a.orb - b.orb);
  }, [planet, chart.aspects]);

  if (!planet || !assessment) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop leve para foco, mas permitindo ver o mapa */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[100]"
            onClick={onClose}
          />

          {/* Floating Card - Agora com Arraste (Drag) */}
          <motion.div
            ref={drawerRef}
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              top: coords.top,
              left: coords.left
            }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ 
              position: 'fixed',
              zIndex: 101,
            }}
            className="w-full max-w-[calc(100vw-16px)] md:max-w-lg bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Drag Handle Top Bar */}
            <div className="h-6 w-full flex items-center justify-center bg-white/5 cursor-move active:bg-white/10 transition-colors shrink-0">
               <GripHorizontal className="w-4 h-4 text-slate-600" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-6 pt-2 border-b border-white/5 bg-white/5 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/20">
                  <span className="text-2xl font-bold leading-none select-none drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                    {planet.symbol}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white leading-none tracking-tight">
                    {getPlanetNamePT(planet.id)}
                  </h2>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                    <Star className="w-3 h-3 text-gold-500/50" />
                    {planet.sign} • {Math.floor(planet.degree)}°{Math.floor((planet.degree % 1) * 60)}'
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="group p-2.5 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/20 border border-transparent transition-all"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto overflow-x-hidden p-6 custom-scrollbar space-y-8 pb-10">
              
              {/* Pontuadores Principais */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-white/5 to-transparent p-5 rounded-3xl border border-white/10 flex flex-col items-center justify-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gold-500/60 mb-2">Poder Operacional</p>
                  <span className={`text-4xl font-black ${
                    assessment.score.total >= 0 ? 'text-gold-400' : 'text-red-400'
                  } drop-shadow-[0_0_12px_rgba(251,191,36,0.2)]`}>
                    {assessment.score.total}
                  </span>
                </div>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col justify-center">
                  <div className="flex items-start gap-2">
                    <Info className="w-3 h-3 text-slate-500 mt-1 shrink-0" />
                    <p className="text-[11px] text-slate-300 leading-relaxed font-serif italic">
                      {assessment.technicalSummary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Aspectos Tradicionais */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <Link2 className="w-3 h-3" />
                    Teia de Aspectos
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                </div>
                
                <div className="space-y-2.5">
                  {filteredAspects.length > 0 ? (
                    filteredAspects.map((as, idx) => {
                      const otherPlanet = as.planet1.toLowerCase() === planet.id.toLowerCase() ? as.planet2 : as.planet1;
                      const otherName = getPlanetNamePT(otherPlanet);
                      const aspectInterpretation = getTraditionalAspectInterpretation(as.type, as.planet1, as.planet2);
                      
                      return (
                        <div key={idx} className="bg-white/5 rounded-2xl border border-white/5 p-3.5 hover:bg-white/[0.08] transition-colors group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-200">
                                {as.type === 'conjunction' ? 'Conjunção' : 
                                 as.type === 'sextile' ? 'Sextil' : 
                                 as.type === 'square' ? 'Quadratura' : 
                                 as.type === 'trine' ? 'Trígono' : 'Oposição'}
                              </span>
                              <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded-md bg-white/5 font-mono">
                                {as.orb.toFixed(1)}°
                              </span>
                            </div>
                            <span className="text-xs font-black text-gold-400 group-hover:scale-110 transition-transform">
                              {otherName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed italic">
                            "{aspectInterpretation}"
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 px-6 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                       <p className="text-[10px] text-slate-500 font-medium italic">Nenhum aspecto clássico principal encontrado para este ponto.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Dignidades e Analise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gold-500 flex items-center gap-2 mb-4">
                    <Shield className="w-3.5 h-3.5" />
                    Essencial
                  </h3>
                  <div className="space-y-1.5">
                    {Object.entries(assessment.score.breakdown.essential).length > 0 ? (
                      Object.entries(assessment.score.breakdown.essential).map(([name, val]) => (
                        <div key={name} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">{name}</span>
                          <span className={`font-bold ${val > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {val > 0 ? `+${val}` : val}
                          </span>
                        </div>
                      ))
                    ) : (
                       <p className="text-[10px] text-slate-600 italic">Peregrino</p>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2 mb-4">
                    <Zap className="w-3.5 h-3.5" />
                    Acidental
                  </h3>
                  <div className="space-y-1.5">
                    {Object.entries(assessment.score.breakdown.accidental).slice(0, 4).map(([name, val]) => (
                      <div key={name} className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400 truncate max-w-[80px]">{name}</span>
                        <span className={`font-bold ${val > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {val > 0 ? `+${val}` : val}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Vibe e Descrição */}
              <section className="bg-gradient-to-br from-indigo-500/5 to-transparent p-5 rounded-[2rem] border border-white/10">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 mb-4">
                  <Activity className="w-3.5 h-3.5" />
                  Ambiente e Vibe
                </h3>
                <div className="space-y-4">
                  <div className="relative pl-4 border-l border-gold-500/30">
                    <p className="text-[9px] font-black text-gold-500/50 uppercase tracking-widest mb-1.5">Qualidade do Termo</p>
                    <p className="text-[11px] text-slate-200 leading-relaxed italic pr-2">
                      "{assessment.interpretations.term}"
                    </p>
                  </div>
                  <div className="relative pl-4 border-l border-blue-400/30">
                    <p className="text-[9px] font-black text-blue-400/50 uppercase tracking-widest mb-1.5">Coloração do Decanato</p>
                    <p className="text-[11px] text-slate-200 leading-relaxed italic pr-2">
                      "{assessment.interpretations.face}"
                    </p>
                  </div>
                </div>
              </section>

              {/* Status de Sol e Seita */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/5 flex items-center justify-around gap-2 text-[10px] font-bold">
                 <div className="flex flex-col items-center gap-1">
                    <span className="text-slate-500 uppercase tracking-tighter">Condição</span>
                    <span className={`${
                      assessment.condition.isCazimi ? 'text-gold-400' : 
                      assessment.condition.isCombust ? 'text-red-400' : 
                      'text-slate-300'
                    }`}>
                      {assessment.condition.isCazimi ? 'Cazimi' : assessment.condition.isCombust ? 'Combusto' : 'Livre'}
                    </span>
                 </div>
                 <div className="w-px h-6 bg-white/5" />
                 <div className="flex flex-col items-center gap-1">
                    <span className="text-slate-500 uppercase tracking-tighter">Seita</span>
                     <span className={`${
                       assessment.sectRole.endsWith('_of_sect') ? 'text-green-400' : 'text-red-400'
                     }`}>
                        {assessment.sectRole.endsWith('_of_sect') ? 'Em Seita' : 'Fora da Seita'}
                     </span>
                 </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

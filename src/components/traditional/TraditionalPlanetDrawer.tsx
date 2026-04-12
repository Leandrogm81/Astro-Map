import React from 'react';
import { PlanetPosition } from '@/types';
import { TraditionalAssessment } from '@/lib/traditional/types';
import { X, Shield, Zap, Star, Activity, Info } from 'lucide-react';

interface TraditionalPlanetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  planet: PlanetPosition | null;
  assessment: TraditionalAssessment | null;
}

export default function TraditionalPlanetDrawer({ 
  isOpen, 
  onClose, 
  planet, 
  assessment 
}: TraditionalPlanetDrawerProps) {
  if (!planet || !assessment) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none`}>
        {/* Modal Card */}
        <div className={`w-full max-w-lg bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl pointer-events-auto transition-all duration-500 ease-out transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 rounded-t-[2.5rem]">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gold-500/20 text-gold-400">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white leading-none">{getPlanetLabel(planet.id)}</h2>
                <p className="text-sm text-slate-500 mt-1">{planet.sign} {Math.floor(planet.degree)}°</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Fechar ficha do planeta"
              title="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content Wrapper com altura limitada para modal */}
          <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden p-6 custom-scrollbar">
          
          {/* Resumo Score */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-900 p-4 rounded-3xl border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 text-center">Score Total</p>
              <p className={`text-3xl font-black text-center ${
                assessment.score.total >= 0 ? 'text-gold-400' : 'text-red-400'
              }`}>
                {assessment.score.total}
              </p>
            </div>
            <div className="bg-slate-900 p-4 rounded-3xl border border-white/5 flex flex-col justify-center">
               <p className="text-[10px] font-medium text-slate-400 leading-tight">
                 {assessment.technicalSummary}
               </p>
            </div>
          </div>

          {/* Breakdown Seções */}
          <div className="space-y-6">
            
            {/* Dignidades Essenciais */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 flex items-center gap-2 mb-4">
                <Shield className="w-3.5 h-3.5" />
                Dignidades Essenciais
              </h3>
              <div className="space-y-2">
                {Object.entries(assessment.score.breakdown.essential).length > 0 ? (
                  Object.entries(assessment.score.breakdown.essential).map(([name, val]) => (
                    <div key={name} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                      <span className="text-sm text-slate-300">{name}</span>
                      <span className={`text-sm font-bold ${val > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {val > 0 ? `+${val}` : val}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic px-3">Sem dignidades essenciais significativas.</p>
                )}
              </div>
            </section>

            {/* Dignidades Acidentais */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2 mb-4">
                <Zap className="w-3.5 h-3.5" />
                Dignidades Acidentais
              </h3>
              <div className="space-y-2">
                {Object.entries(assessment.score.breakdown.accidental).map(([name, val]) => (
                  <div key={name} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                    <span className="text-sm text-slate-300">{name}</span>
                    <span className={`text-sm font-bold ${val > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {val > 0 ? `+${val}` : val}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Detalhes Técnicos */}
            <section className="bg-gold-500/5 p-5 rounded-3xl border border-gold-500/10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 flex items-center gap-2 mb-4">
                <Info className="w-3.5 h-3.5" />
                Análise de Tradição
              </h3>
              <ul className="space-y-3">
                <li className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Condição do Sol:</span>
                  <span className="text-slate-200">
                    {assessment.condition.isCazimi ? 'Cazimi' : 
                     assessment.condition.isCombust ? 'Combusto' : 
                     assessment.condition.isUnderRays ? 'Sob os Raios' : 'Livre'}
                  </span>
                </li>
                <li className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Seita (Sect):</span>
                  <span className="text-slate-200">{assessment.condition.sectStatus === 'benefic' ? 'Em Seita (Benefic)' : 'Fora da Seita'}</span>
                </li>
                <li className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Hayz:</span>
                  <span className="text-slate-200">{assessment.condition.isHayz ? 'Sim' : 'Não'}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

function getPlanetLabel(id: string): string {
  const map: Record<string, string> = {
    sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio',
    venus: 'Vênus', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno'
  };
  return map[id] || id;
}

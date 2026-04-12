import React, { useState, useMemo } from 'react';
import { NatalChart, PlanetPosition } from '@/types';
import { calculateTraditionalAssessment } from '@/lib/traditional/scoring';
import { TraditionalAssessment } from '@/lib/traditional/types';
import TraditionalChart from '@/components/traditional/TraditionalChart';
import TraditionalPlanetTable from '@/components/traditional/TraditionalPlanetTable';
import TraditionalSummary from '@/components/traditional/TraditionalSummary';
import TraditionalPlanetDrawer from '@/components/traditional/TraditionalPlanetDrawer';
import { Sparkles, Info } from 'lucide-react';

interface TraditionalViewProps {
  chart: NatalChart;
}

export default function TraditionalView({ chart }: TraditionalViewProps) {
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const [showAllLots, setShowAllLots] = useState(false);

  // Cálculos técnicos tradicionais para os 7 clássicos
  const assessments = useMemo(() => {
    const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    const classicPlanets = chart.planets.filter(p => classicIds.includes(p.id));
    const sun = chart.planets.find(p => p.id === 'sun');

    if (!sun) return {} as Record<string, TraditionalAssessment>;

    return classicPlanets.reduce((acc, planet) => {
      acc[planet.id] = calculateTraditionalAssessment(planet, sun, chart.isDayChart ?? false);
      return acc;
    }, {} as Record<string, TraditionalAssessment>);
  }, [chart]);

  const selectedAssessment = selectedPlanetId ? assessments[selectedPlanetId] : null;
  const selectedPlanet = selectedPlanetId ? chart.planets.find(p => p.id === selectedPlanetId) : null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Resumo Superior */}
      <TraditionalSummary chart={chart} assessments={assessments} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Mandala Tradicional */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <Sparkles className="w-12 h-12 text-gold-500" />
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Mandala Tradicional
              <span className="text-[10px] bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">7 Planetas Classicos</span>
            </h3>
            
            <button 
              onClick={() => setShowAllLots(!showAllLots)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-gold-400 hover:border-gold-500/30 transition-all"
            >
              {showAllLots ? 'Ocultar Lotes Extras' : 'Ver Todos os Lotes'}
            </button>
          </div>

          <div className="aspect-square w-full max-w-[500px] mx-auto">
            <TraditionalChart 
              chart={chart} 
              showAllLots={showAllLots}
              onPlanetClick={setSelectedPlanetId}
              selectedPlanetId={selectedPlanetId}
            />
          </div>
        </div>

        {/* Tabela Planetária Técnica */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl">
           <h3 className="text-lg font-bold text-white mb-6">Condição Planetária</h3>
           <TraditionalPlanetTable 
             assessments={assessments} 
             onPlanetClick={setSelectedPlanetId}
             selectedPlanetId={selectedPlanetId}
           />
           
           <div className="mt-6 p-4 bg-gold-500/5 border border-gold-500/10 rounded-2xl flex gap-3">
             <Info className="w-5 h-5 text-gold-500 shrink-0" />
             <p className="text-xs text-gold-200/70 leading-relaxed">
               Esta análise utiliza regências tradicionais (7 planetas clássicos), triplicidades dorotheanas 
               e dignidades essenciais por signo e seita. A pontuação reflete a força operacional do planeta 
               no mapa.
             </p>
           </div>
        </div>
      </div>

      {/* Drawer da Ficha do Planeta */}
      <TraditionalPlanetDrawer 
        isOpen={!!selectedPlanetId}
        onClose={() => setSelectedPlanetId(null)}
        planet={selectedPlanet ?? null}
        assessment={selectedAssessment ?? null}
      />
    </div>
  );
}

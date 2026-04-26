import React, { useState, useMemo } from 'react';
import { NatalChart } from '@/types';
import { calculateTraditionalAssessment } from '@/lib/traditional/scoring';
import { TraditionalAssessment } from '@/lib/traditional/types';
import TraditionalChart from '@/components/traditional/TraditionalChart';
import TraditionalPlanetTable from '@/components/traditional/TraditionalPlanetTable';
import TraditionalSummary from '@/components/traditional/TraditionalSummary';
import TraditionalPlanetDrawer from '@/components/traditional/TraditionalPlanetDrawer';
import TraditionalAIReport from '@/components/traditional/TraditionalAIReport';
import TraditionalSpecialPoints from '@/components/traditional/TraditionalSpecialPoints';
import TraditionalAspectList from '@/components/traditional/TraditionalAspectList';
import ExportPDF from '@/components/ExportPDF';
import { calculateTraditionalPoints } from '@/lib/traditional/points';
import TraditionalPositionsTable from '@/components/traditional/TraditionalPositionsTable';
import {
  getTraditionalReportStorageKey,
  loadTraditionalReportFromStorage,
} from '@/lib/traditional/reportStorage';
import { 
  Info, 
  ArrowLeft,
} from 'lucide-react';

interface TraditionalViewProps {
  chart: NatalChart;
  onBack?: () => void;
}

export default function TraditionalView({ chart, onBack }: TraditionalViewProps) {
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number, y: number } | null>(null);
  const [showAllLots] = useState(false);
  const reportStorageKey = useMemo(() => getTraditionalReportStorageKey(chart.birthData), [chart.birthData]);
  const [reportState, setReportState] = useState(() => ({
    storageKey: reportStorageKey,
    text: loadTraditionalReportFromStorage(chart.birthData),
  }));
  const reportText =
    reportState.storageKey === reportStorageKey
      ? reportState.text
      : loadTraditionalReportFromStorage(chart.birthData);

  const handleReportUpdated = React.useCallback((text: string) => {
    setReportState({
      storageKey: reportStorageKey,
      text,
    });
  }, [reportStorageKey]);

  const traditionalPoints = useMemo(() => {
    return calculateTraditionalPoints(
      chart.ascendant,
      chart.planets,
      chart.housesPlacidus, // Or Whole, assuming Placidus for traditional points focus
      chart.isDayChart ?? false
    );
  }, [chart]);

  const reportChart = useMemo(() => ({
    ...chart,
    traditionalPoints
  }), [chart, traditionalPoints]);

  const handlePlanetClick = (id: string | null, position?: { x: number, y: number }) => {
    setSelectedPlanetId(id);
    if (position) {
      setClickPosition(position);
    }
  };

  // Cálculos técnicos tradicionais para os 7 clássicos
  const assessments = useMemo(() => {
    const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    
    // Busca flexível por ID (ignore case) ou nome
    const classicPlanets = chart.planets.filter(p => {
      const pId = p.id?.toLowerCase();
      return classicIds.includes(pId) || classicIds.includes(p.name?.toLowerCase());
    });

    const sun = chart.planets.find(p => p.id?.toLowerCase() === 'sun' || p.name?.toLowerCase() === 'sun');

    if (!sun || classicPlanets.length === 0) return {} as Record<string, TraditionalAssessment>;

    return classicPlanets.reduce((acc, planet) => {
      acc[planet.id] = calculateTraditionalAssessment(planet, chart.planets, chart.isDayChart ?? false);
      return acc;
    }, {} as Record<string, TraditionalAssessment>);
  }, [chart]);

  const selectedAssessment = selectedPlanetId ? assessments[selectedPlanetId] : null;
  const selectedPlanet = selectedPlanetId ? chart.planets.find(p => p.id === selectedPlanetId) : null;

  const memoizedAssessments = useMemo(() => Object.values(assessments), [assessments]);


  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header com Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              title="Voltar para Calculadora"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-serif font-black tracking-tighter gradient-text-gold">Estudo Tradicional</h1>
            <div className="flex items-center gap-2">
              <span className="h-px w-4 bg-gold-600/50"></span>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">Setenário & Dignidades</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
        <ExportPDF 
          chart={chart} 
          reportText={reportText}
          isTraditional={true}
          traditionalAssessments={memoizedAssessments}
            variant="compact"
          />
        </div>
      </div>
      {/* Resumo Superior */}
      <TraditionalSummary chart={chart} assessments={assessments} />

      {/* Mandala Centralizada e Grande */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-4 shadow-xl relative overflow-visible">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Mandala Tradicional
            <span className="text-[10px] bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              7 Planetas Clássicos
            </span>
          </h3>
        </div>

        <div className="aspect-square w-full max-w-[950px] mx-auto transition-all duration-500">
          <TraditionalChart 
            chart={chart} 
            showAllLots={showAllLots}
            selectedPlanetId={selectedPlanetId}
            onPlanetClick={handlePlanetClick}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <TraditionalPositionsTable chart={chart} />
        <TraditionalSpecialPoints points={traditionalPoints} />
      </div>

      {/* Análise de Dignidades - Tabela Completa */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          Análise de Dignidades
        </h3>
        <TraditionalPlanetTable
          assessments={assessments}
          onPlanetClick={handlePlanetClick}
          selectedPlanetId={selectedPlanetId}
        />

        <div className="mt-8 p-4 bg-gold-500/5 rounded-2xl border border-gold-500/10 flex items-start gap-4">
          <Info className="w-6 h-6 text-gold-400 shrink-0 mt-1" />
          <p className="text-sm text-slate-400 leading-relaxed">
            Esta análise utiliza regências tradicionais (7 planetas clássicos), triplicidades dorotheanas e dignidades essenciais por signo e seita. A pontuação reflete a força operacional do planeta no mapa.
          </p>
        </div>
      </div>

      {/* Análise de Aspectos Tradicionais - Tabela Completa */}
      <TraditionalAspectList chart={chart} />

      {/* Relatório de IA Tradicional */}
      <div className="mt-12">
        <TraditionalAIReport 
          chart={reportChart} 
          assessments={Object.values(assessments)}
          onReportUpdated={handleReportUpdated}
        />
      </div>

      {/* Drawer da Ficha do Planeta */}
      <TraditionalPlanetDrawer 
        isOpen={!!selectedPlanetId}
        onClose={() => setSelectedPlanetId(null)}
        planet={selectedPlanet ?? null}
        assessment={selectedAssessment ?? null}
        chart={chart}
        position={clickPosition}
      />
    </div>
  );
}

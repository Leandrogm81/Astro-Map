'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BirthData, NatalChart, AIReport as AIReportType, SavedChart } from '@/types';
import { initSweph, calculateNatalChart } from '@/lib/ephemeris';
import { saveChart, updateChart } from '@/lib/storage';
import BirthForm from '@/components/BirthForm';
import AstroChart from '@/components/AstroChart';
import PlanetTable from '@/components/PlanetTable';
import HousesTable from '@/components/HousesTable';
import AspectsList from '@/components/AspectsList';
import AIReport from '@/components/AIReport';
import SolarRevolution from '@/components/SolarRevolution';
import SavedCharts from '@/components/SavedCharts';
import ExportPDF from '@/components/ExportPDF';
import Image from 'next/image';
import { Sparkles, Moon, Sun, Star, ChevronDown, ChevronUp, Save } from 'lucide-react';

function isValidChart(chart: unknown): chart is NatalChart {
  if (!chart || typeof chart !== 'object') return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = chart as Record<string, any>;
  return (
    c.birthData &&
    typeof c.birthData === 'object' &&
    c.birthData.name &&
    c.birthData.date &&
    c.birthData.time &&
    Array.isArray(c.planets) &&
    c.planets.length > 0 &&
    Array.isArray(c.housesPlacidus) &&
    Array.isArray(c.housesWhole) &&
    Array.isArray(c.aspects)
  );
}

export default function Home() {
  const [initialized, setInitialized] = useState(false);
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [savedChartId, setSavedChartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'houses' | 'aspects' | 'report' | 'revolution'>('chart');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['form', 'saved']));
  const [editingChartId, setEditingChartId] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<BirthData | undefined>(undefined);
  const [aiReport, setAiReport] = useState<AIReportType | null>(null);
  const [solarRevolution, setSolarRevolution] = useState<NatalChart | null>(null);
  const [solarYear, setSolarYear] = useState<number | undefined>(undefined);
  const [solarReportText, setSolarReportText] = useState<string>('');

  useEffect(() => {
    initSweph()
      .then(() => setInitialized(true))
      .catch((err) => {
        console.error('Failed to initialize ephemeris:', err);
        setError('Falha ao inicializar cálculos astronômicos. Recarregue a página.');
      });
  }, []);

  const handleFormSubmit = useCallback(async (birthData: BirthData) => {
    if (!initialized) {
      setError('Sistema ainda não inicializado. Aguarde um momento.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const calculatedChart = await calculateNatalChart(birthData);
      
      if (!isValidChart(calculatedChart)) {
        throw new Error('Dados do mapa astral inválidos');
      }
      
      setChart(calculatedChart);
      setAiReport(null);
      setSolarRevolution(null);
      setSolarYear(undefined);
      setSolarReportText('');
      
      try {
        if (editingChartId) {
          const updatedChart = { ...chart, aiReport: undefined, solarRevolution: undefined, solarYear: undefined, solarReport: undefined };
          updateChart(editingChartId, { chart: updatedChart, name: `${birthData.name} - ${birthData.date}` });
          setSavedChartId(editingChartId);
          setEditingChartId(null);
          setInitialFormData(undefined);
        } else {
          const saved = saveChart(`${birthData.name} - ${birthData.date}`, calculatedChart);
          setSavedChartId(saved.id);
        }
      } catch (saveErr) {
        console.warn('Failed to save chart:', saveErr);
      }
    } catch (err) {
      console.error('Chart calculation error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao calcular mapa astral');
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  const handleSelectChart = useCallback((savedChart: SavedChart) => {
    if (isValidChart(savedChart.chart)) {
      setChart(savedChart.chart);
      
      // Carrega relatório natal se existir cache
      const reportKey = `report_${savedChart.chart.birthData.name}_${savedChart.chart.birthData.date}`;
      const savedReport = localStorage.getItem(reportKey);
      if (savedReport) {
        setAiReport({ sections: [], summary: savedReport, generatedAt: new Date().toISOString() });
      } else {
        setAiReport(null);
      }
      
      setSolarRevolution(savedChart.solarRevolution || null);
      setSolarYear(savedChart.solarYear || undefined);

      // Carrega relatório de revolução solar se existir cache
      if (savedChart.solarYear) {
         const solarReportKey = `solar_report_${savedChart.chart.birthData.name}_${savedChart.chart.birthData.date}_${savedChart.solarYear}`;
         const savedSolarReport = localStorage.getItem(solarReportKey);
         if (savedSolarReport) setSolarReportText(savedSolarReport);
         else setSolarReportText('');
      } else {
         setSolarReportText('');
      }

      setSavedChartId(savedChart.id);
      setEditingChartId(null);
      setInitialFormData(undefined);
      setError(null);
    } else {
      setError('Dados do mapa astral inválidos ou corrompidos');
    }
  }, []);

  const handleEditChart = useCallback((savedChart: SavedChart) => {
    setEditingChartId(savedChart.id);
    setInitialFormData(savedChart.chart.birthData);
    setExpandedSections(prev => new Set([...prev, 'form']));
    // Rola para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleReportGenerated = useCallback((report: AIReportType | null) => {
    setAiReport(report);
    if (savedChartId && report) {
      updateChart(savedChartId, { aiReport: report });
    }
  }, [savedChartId]);

  const handleRevolutionCalculated = useCallback((rev: NatalChart | null, year: number) => {
    setSolarRevolution(rev);
    setSolarYear(year);
    if (savedChartId && rev) {
      updateChart(savedChartId, { solarRevolution: rev, solarYear: year });
    }
  }, [savedChartId]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(section)) {
        newExpanded.delete(section);
      } else {
        newExpanded.add(section);
      }
      return newExpanded;
    });
  }, []);

  const hasValidChart = isValidChart(chart);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/20 border border-purple-500/30">
                <Image 
                  src="/assets/logo-premium.png" 
                  alt="AstroMap Logo" 
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Astro<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Map</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Premium Astrological Suite</p>
              </div>
            </div>

            <nav className="flex items-center gap-4">
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-purple-300 transition-colors"
              >
                Obter API Key
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Formulário */}
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('form')}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-900/80 hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-purple-200">
                    Dados de Nascimento
                  </h2>
                </div>
                {expandedSections.has('form') ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {expandedSections.has('form') && (
                <div className="p-6">
                  {!initialized ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                      <p className="text-slate-400">Calculando efemérides...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editingChartId && (
                        <div className="bg-blue-500/20 text-blue-200 border border-blue-500/30 p-3 rounded-lg text-sm flex justify-between items-center">
                          <span>Você está editando um mapa salvo. Clique em "Calcular" para atualizar.</span>
                          <button onClick={() => { setEditingChartId(null); setInitialFormData(undefined); }} className="text-blue-400 hover:text-blue-300 underline">Cancelar</button>
                        </div>
                      )}
                      <BirthForm 
                        onSubmit={handleFormSubmit} 
                        loading={loading} 
                        initialData={initialFormData}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mapas Salvos */}
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('saved')}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-900/80 hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Save className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-purple-200">
                    Mapas Salvos
                  </h2>
                </div>
                {expandedSections.has('saved') ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {expandedSections.has('saved') && (
                <div className="p-6">
                  <SavedCharts onSelectChart={handleSelectChart} onEditChart={handleEditChart} />
                </div>
              )}
            </div>

            {/* Exportar PDF */}
            {hasValidChart && (
              <ExportPDF 
                chart={chart} 
                solarRevolution={solarRevolution} 
                solarYear={solarYear}
                reportText={aiReport?.summary}
                solarReportText={solarReportText}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Erro */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-200">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
                >
                  Fechar
                </button>
              </div>
            )}

            {/* Resultado */}
            {hasValidChart ? (
              <div className="space-y-6">
                {/* Info Header */}
                <div className="p-6 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-xl">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {chart.birthData.name}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                    <span className="flex items-center gap-1">
                      <Sun className="w-4 h-4 text-yellow-400" />
                      {chart.birthData.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Moon className="w-4 h-4 text-slate-300" />
                      {chart.birthData.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-purple-400" />
                      {chart.birthData.location}
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-purple-500/20">
                  {[
                    { id: 'chart', label: 'Mapa', icon: Star },
                    { id: 'houses', label: 'Casas', icon: Moon },
                    { id: 'aspects', label: 'Aspectos', icon: Sun },
                    { id: 'report', label: 'Relatório IA', icon: Sparkles },
                    { id: 'revolution', label: 'Revolução Solar', icon: Sun },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-300'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
                  {activeTab === 'chart' && (
                    <div className="space-y-6">
                      <AstroChart chart={chart} />
                      <PlanetTable chart={chart} />
                    </div>
                  )}

                  {activeTab === 'houses' && (
                    <div className="space-y-6">
                      <HousesTable chart={chart} system="placidus" />
                      <hr className="border-purple-500/20" />
                      <HousesTable chart={chart} system="whole" />
                    </div>
                  )}

                  {activeTab === 'aspects' && (
                    <AspectsList chart={chart} />
                  )}

                  {activeTab === 'report' && (
                    <AIReport 
                      chart={chart} 
                      onReportGenerated={handleReportGenerated}
                    />
                  )}

                  {activeTab === 'revolution' && (
                    <SolarRevolution 
                      natalChart={chart}
                      onRevolutionCalculated={handleRevolutionCalculated}
                      onReportUpdated={setSolarReportText}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                  <Sparkles className="w-12 h-12 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-purple-200 mb-3">
                  Bem-vindo ao AstroMap
                </h2>
                <p className="text-slate-400 max-w-md mb-6">
                  Calcule seu mapa astral completo com precisão profissional.
                  Descubra a posição dos planetas, casas astrológicas e gere um
                  relatório completo com inteligência artificial.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Cálculos precisos
                  </span>
                  <span className="flex items-center gap-1">
                    <Moon className="w-4 h-4" />
                    Dois sistemas de casas
                  </span>
                  <span className="flex items-center gap-1">
                    <Sun className="w-4 h-4" />
                    Aspectos completos
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    IA integrada
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>
              © 2026 AstroMap. Cálculos astronômicos via Astronomy Engine.
            </p>
            <div className="flex items-center gap-4">
              <span>Grátis e sem cadastro</span>
              <span>•</span>
              <span>Dados salvos localmente</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

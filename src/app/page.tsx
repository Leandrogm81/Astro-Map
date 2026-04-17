'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BirthData, NatalChart, AIReport as AIReportType, SavedChart } from '@/types';
import { initSweph, calculateNatalChart } from '@/lib/ephemeris';
import { saveChart, updateChart, getReportKey, getReportKeyLegacy } from '@/lib/storage';
import BirthForm from '@/components/BirthForm';
import AstroChart from '@/components/AstroChart';
import PlanetTable from '@/components/PlanetTable';
import HousesTable from '@/components/HousesTable';
import AspectsList from '@/components/AspectsList';
import AIReport from '@/components/AIReport';
import SolarRevolution from '@/components/SolarRevolution';
import SavedCharts from '@/components/SavedCharts';
import ExportPDF from '@/components/ExportPDF';
import TraditionalView from '@/components/traditional/TraditionalView';
import UnifiedMenu from '@/components/UnifiedMenu';
import Image from 'next/image';
import { Sparkles, Moon, Sun, Star, ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import { hydrateNatalChart } from '@/lib/chartHydration';

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
  const [activeTab, setActiveTab] = useState<'chart' | 'traditional' | 'houses' | 'aspects' | 'report' | 'revolution'>('chart');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['form']));
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [editingChartId, setEditingChartId] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<BirthData | undefined>(undefined);
  const [aiReport, setAiReport] = useState<AIReportType | null>(null);
  const [natalReportText, setNatalReportText] = useState<string>('');
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
      
      const hydrated = hydrateNatalChart(calculatedChart); 
      setChart(hydrated);
      setAiReport(null);
      setSolarRevolution(null);
      setSolarYear(undefined);
      setSolarReportText('');
      setSidebarVisible(false); // Hide sidebar after calculation
      
      try {
        if (editingChartId) {
          updateChart(editingChartId, { 
            chart: hydrated, 
            name: `${birthData.name} - ${birthData.date}`,
            aiReport: undefined,
            solarRevolution: undefined,
            solarYear: undefined,
            solarReport: undefined 
          });
          setSavedChartId(editingChartId);
          setEditingChartId(null);
          setInitialFormData(undefined);
        } else {
          const saved = saveChart(`${birthData.name} - ${birthData.date}`, hydrated);
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
  }, [initialized, editingChartId]);

  const handleNewChart = useCallback(() => {
    setChart(null);
    setSavedChartId(null);
    setAiReport(null);
    setSolarRevolution(null);
    setSolarYear(undefined);
    setSolarReportText('');
    setActiveTab('chart');
    setEditingChartId(null);
    setInitialFormData(undefined);
    setSidebarVisible(true);
    setExpandedSections(new Set(['form']));
  }, []);

  const handleSelectChart = useCallback((savedChart: SavedChart) => {
    if (savedChart.chart) {
      const currentChart = hydrateNatalChart(savedChart.chart);
      setChart(currentChart);
      
      // Carrega relatório natal se existir cache
      const reportKey = getReportKey(currentChart.birthData);
      const legacyKey = getReportKeyLegacy(currentChart.birthData.name, currentChart.birthData.date);
      const savedReport = localStorage.getItem(reportKey) || localStorage.getItem(legacyKey);
      
      if (savedReport) {
        setAiReport({ sections: [], summary: savedReport, generatedAt: new Date().toISOString() });
      } else {
        setAiReport(null);
      }
      
      setSolarRevolution(savedChart.solarRevolution || null);
      setSolarYear(savedChart.solarYear || undefined);

      // Carrega relatório de revolução solar se existir cache
      if (savedChart.solarYear) {
         const solarReportKey = getReportKey(currentChart.birthData, true, savedChart.solarYear);
         const solarLegacyKey = getReportKeyLegacy(currentChart.birthData.name, currentChart.birthData.date, true, savedChart.solarYear);
         const savedSolarReport = localStorage.getItem(solarReportKey) || localStorage.getItem(solarLegacyKey);
         if (savedSolarReport) setSolarReportText(savedSolarReport);
         else setSolarReportText('');
      } else {
         setSolarReportText('');
      }

      setSavedChartId(savedChart.id);
      setEditingChartId(null);
      setInitialFormData(undefined);
      setSidebarVisible(false); // Esconde a sidebar ao selecionar um mapa
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
      <header className="border-b border-gold-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-gold-500/10 border border-gold-500/20">
                <Image 
                  src="/assets/logo-premium.png" 
                  alt="AstroMap Logo" 
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-serif font-black tracking-tight text-white">
                  Astro<span className="gradient-text-gold">Map</span>
                </h1>
                <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-gold-500/60">Suíte Astrológica Clássica</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasValidChart && !sidebarVisible && (
                <button
                  onClick={handleNewChart}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 rounded-full transition-all flex items-center gap-2"
                >
                  <Star className="w-3 h-3" />
                  Calcular Novo Mapa
                </button>
              )}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-gold-400 transition-colors"
                title="Configurar chave para relatórios de IA"
              >
                Chave da API
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          {sidebarVisible && (
            <div className="lg:col-span-4 space-y-6 animate-in slide-in-from-left duration-500">
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
                        <p className="text-slate-400">Calculando efemérides astronômicas...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {editingChartId && (
                          <div className="bg-blue-500/20 text-blue-200 border border-blue-500/30 p-3 rounded-lg text-sm flex justify-between items-center">
                            <span>Você está editando um mapa salvo. Clique em &quot;Calcular&quot; para atualizar.</span>
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
            </div>
          )}

          {/* Main Content */}
          <div className={`${sidebarVisible ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-8 transition-all duration-500`}>
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
                <div className="p-8 glass-gold rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-gold-500/10 transition-colors" />
                  <h2 className="text-4xl font-serif font-bold text-white mb-4 tracking-tight">
                    {chart.birthData.name}
                  </h2>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                      <Sun className="w-4 h-4 text-gold-400" />
                      <span className="text-slate-200">{chart.birthData.date}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span className="text-slate-200">{chart.birthData.time}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                      <Star className="w-4 h-4 text-gold-500" />
                      <span className="text-slate-200">{chart.birthData.location}</span>
                    </div>
                  </div>
                </div>

                <div className="sticky top-[56px] z-40 flex items-center gap-2 p-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg shadow-black/20 overflow-x-auto scrollbar-none">
                  <UnifiedMenu activeTab={activeTab} onTabChange={(id: string) => setActiveTab(id as typeof activeTab)} />
                  {[
                    { id: 'traditional', label: 'Tradicional', icon: Sparkles },
                    { id: 'revolution', label: 'Revolução Solar', icon: Sun },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`px-6 py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30 shadow-lg shadow-gold-500/5'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}

                    {/* UnifiedMenu moved to chart tab content */}
                  
                  {/* Separador visual */}
                  <div className="w-px bg-white/10 mx-1 self-stretch shrink-0" />
                  
                  {/* Botão PDF Compacto */}
                  <div className="shrink-0">
                    <ExportPDF
                      variant="compact"
                      chart={chart}
                      solarRevolution={solarRevolution}
                      solarYear={solarYear}
                      reportText={natalReportText}
                      solarReportText={solarReportText}
                    />
                  </div>
                </div>

                {/* Tab Content */}
                <div className="glass rounded-3xl p-8 shadow-2xl">
{activeTab === 'chart' && (
                      <div className="space-y-6">
                        <AstroChart chart={chart} />
                        <PlanetTable chart={chart} />
                      </div>
                    )}

                  {activeTab === 'traditional' && (
                    <TraditionalView chart={chart} />
                  )}

                  {activeTab === 'houses' && (
                    <div className="space-y-6">
                      <HousesTable chart={chart} system="placidus" />
                    </div>
                  )}

                  {activeTab === 'aspects' && (
                    <AspectsList chart={chart} />
                  )}

                  {activeTab === 'report' && (
                    <AIReport 
                      chart={chart} 
                      solarRevolution={solarRevolution}
                      solarYear={solarYear}
                      onReportGenerated={handleReportGenerated}
                      onReportUpdated={setNatalReportText}
                    />
                  )}

                  {activeTab === 'revolution' && (
                    <SolarRevolution 
                      natalChart={chart}
                      initialYear={solarYear}
                      initialSolarRevolution={solarRevolution}
                      onRevolutionCalculated={handleRevolutionCalculated}
                      onReportUpdated={setSolarReportText}
                    />
                  )}
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                  <Sparkles className="w-12 h-12 text-gold-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-3">
                  Bem-vindo ao AstroMap
                </h2>
                <p className="text-slate-400 max-w-md mb-6">
                  Calcule seu mapa astral completo com precisão profissional.
                  Explore a posição dos planetas, analise casas e gere um
                  relatório detalhado com inteligência artificial.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Cálculos precisos
                  </span>
                  <span className="flex items-center gap-1">
                    <Moon className="w-4 h-4" />
                    Casas Placidus
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
              <span>Grátis e sem necessidade de cadastro</span>
              <span>•</span>
              <span>Dados protegidos e salvos localmente</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

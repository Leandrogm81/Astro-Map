'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NatalChart } from '@/types';
import { calculateSolarReturn } from '@/lib/ephemeris';
import { Sun, Loader2, Sparkles, ScrollText, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TransitWheel from './TransitWheel';

interface SolarRevolutionProps {
  natalChart: NatalChart;
  onRevolutionCalculated?: (solarReturn: NatalChart | null, year: number) => void;
}

export default function SolarRevolution({ natalChart, onRevolutionCalculated }: SolarRevolutionProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [solarReturn, setSolarReturn] = useState<NatalChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportText, setReportText] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Carregar relatório salvo ao mudar de mapa/ano
  useEffect(() => {
    if (natalChart && year) {
      const reportKey = `solar_report_${natalChart.birthData.name}_${natalChart.birthData.date}_${year}`;
      const savedReport = localStorage.getItem(reportKey);
      if (savedReport) setReportText(savedReport);
      else setReportText('');
    }
  }, [natalChart, year]);

  const calculateRevolution = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await calculateSolarReturn(natalChart, year);
      setSolarReturn(result);
      if (onRevolutionCalculated) {
        onRevolutionCalculated(result, year);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular revolução solar');
    } finally {
      setLoading(false);
    }
  }, [natalChart, year, onRevolutionCalculated]);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      calculateRevolution();
    }
  }, [initialized, calculateRevolution]);

  const handleGenerateReport = async () => {
    if (!solarReturn) return;
    
    const storedApiKey = localStorage.getItem('openrouter_api_key') || '';
    if (!storedApiKey) {
      setError('Por favor, configure sua chave API na aba "Relatório IA" primeiro.');
      return;
    }

    setGeneratingReport(true);
    setError(null);
    setReportText('');

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart: natalChart,
          solarRevolution: solarReturn,
          solarYear: year,
          apiKey: storedApiKey,
          model: 'google/gemini-2.0-flash-001',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao gerar relatório');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Falha ao iniciar stream');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        accumulated += chunk;
        setReportText(accumulated);
      }

      // Salvar
      const reportKey = `solar_report_${natalChart.birthData.name}_${natalChart.birthData.date}_${year}`;
      localStorage.setItem(reportKey, accumulated);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDeleteReport = () => {
    if (confirm('Deseja apagar este relatório anual?')) {
      const reportKey = `solar_report_${natalChart.birthData.name}_${natalChart.birthData.date}_${year}`;
      localStorage.removeItem(reportKey);
      setReportText('');
    }
  };

  const formatDegree = (degree: number): string => {
    const d = Math.floor(degree);
    const m = Math.floor((degree - d) * 60);
    return `${d}°${m}'`;
  };

  const natalAsc = natalChart.housesPlacidus[0].sign;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Sun className="w-6 h-6 text-yellow-500 animate-pulse" />
          Revolução Solar {year}
        </h3>
        
        <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => { setYear(y => y - 1); calculateRevolution(); }}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            disabled={loading}
          >
            ←
          </button>
          <span className="px-4 py-2 text-slate-100 font-bold min-w-[80px] text-center">
            {year}
          </span>
          <button
            onClick={() => { setYear(y => y + 1); calculateRevolution(); }}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            disabled={loading}
          >
            →
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-20 text-center">
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-purple-500" />
          <p className="mt-4 text-slate-400 font-medium tracking-wide">Calculando alinhamentos astronômicos...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 text-sm">
          {error}
        </div>
      )}

      {solarReturn && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Gráfico de Revolução (Sobreposição) */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 shadow-inner">
             <div className="flex items-center justify-between mb-6">
                <div>
                   <h4 className="text-lg font-bold text-slate-200">Sobreposição Natal vs Revolução</h4>
                   <p className="text-xs text-slate-500 uppercase tracking-widest">Externo: {year} | Interno: Natal</p>
                </div>
             </div>
             <TransitWheel natalChart={natalChart} transitChart={solarReturn} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ascendente do Ano</span>
              <div className="text-xl font-black text-white mt-1">
                {solarReturn.housesPlacidus[0].sign}
              </div>
              <p className="text-[10px] text-purple-400 mt-1 font-bold">Grau {formatDegree(solarReturn.housesPlacidus[0].degree)}</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sol na Casa</span>
              <div className="text-xl font-black text-white mt-1">
                Casa {solarReturn.planets.find(p => p.name === 'Sol')?.house}
              </div>
              <p className="text-[10px] text-yellow-500 mt-1 font-bold">{solarReturn.birthData.date}</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lua do Ano</span>
              <div className="text-xl font-black text-white mt-1">
                {solarReturn.planets.find(p => p.name === 'Lua')?.sign}
              </div>
              <p className="text-[10px] text-indigo-400 mt-1 font-bold">Casa {solarReturn.planets.find(p => p.name === 'Lua')?.house}</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tema Central</span>
              <div className="text-sm font-bold text-purple-300 mt-2 leading-tight">
                 {solarReturn.housesPlacidus[0].sign === natalAsc ? 'Retorno Profundo' : 'Nova Abordagem'}
              </div>
            </div>
          </div>

          {/* AI Report Section for Solar Return */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h4 className="font-bold text-slate-100">Guia Anual Inteligente</h4>
                </div>
                {reportText && !generatingReport && (
                  <button onClick={handleDeleteReport} title="Apagar Relatório" className="text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="p-6 md:p-8">
                {!reportText && !generatingReport ? (
                  <div className="text-center py-10 space-y-4">
                     <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                        <ScrollText className="w-8 h-8 text-purple-400" />
                     </div>
                     <div className="max-w-xs mx-auto">
                        <p className="text-slate-300 font-medium">Analise as tendências para o seu novo ciclo.</p>
                        <p className="text-xs text-slate-500 mt-2">Nossa IA cruzará os dados da revolução com seu mapa natal para um diagnóstico completo.</p>
                     </div>
                     <button
                        onClick={handleGenerateReport}
                        className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold transition-all transform active:scale-95 shadow-lg shadow-purple-500/20"
                     >
                        GERAR ANÁLISE {year}
                     </button>
                  </div>
                ) : (
                  <article className="prose prose-invert prose-slate max-w-none prose-p:text-slate-400 prose-p:leading-relaxed prose-headings:text-purple-300 prose-strong:text-purple-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reportText}
                    </ReactMarkdown>
                    {generatingReport && (
                      <div className="flex items-center gap-2 mt-6 text-purple-400 animate-pulse">
                         <Loader2 className="w-4 h-4 animate-spin" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Consultando as Estrelas de {year}...</span>
                      </div>
                    )}
                  </article>
                )}
              </div>
          </div>
        </div>
      )}
    </div>
  );
}

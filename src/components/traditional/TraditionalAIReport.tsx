'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NatalChart } from '@/types';
import { TraditionalAssessment } from '@/lib/traditional/types';
import {
  Sparkles,
  AlertCircle,
  Loader2,
  FileText,
  History,
  ShieldCheck,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  clearTraditionalReportFromStorage,
  loadTraditionalReportFromStorage,
  saveTraditionalReportToStorage,
} from '@/lib/traditional/reportStorage';
import { DEFAULT_MODEL_ID } from '@/lib/aiConfig';

interface TraditionalAIReportProps {
  chart: NatalChart;
  assessments: TraditionalAssessment[];
  onReportUpdated?: (text: string) => void;
}

export default function TraditionalAIReport({ chart, assessments, onReportUpdated }: TraditionalAIReportProps) {
  const [reportText, setReportText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDeleteReport = true;
  const reportLimitReached = false;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedReport = loadTraditionalReportFromStorage(chart.birthData);
    if (savedReport) {
      setReportText(savedReport);
      // Removed redundant onReportUpdated(savedReport) to prevent infinite loops
    }
  }, [chart.birthData]); // Only re-run if birth data changes

  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [reportText, isStreaming]);

  const handleGenerateReport = async () => {
    setLoading(true);
    setIsStreaming(true);
    setError(null);
    setReportText('');
    onReportUpdated?.('');

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart,
          assessments,
          reportMode: 'traditional',
          model: DEFAULT_MODEL_ID,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao gerar o tratado');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Falha no stream de dados');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setReportText(fullText);
        if (onReportUpdated) onReportUpdated(fullText);
      }

      saveTraditionalReportToStorage(chart.birthData, fullText);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro inesperado';
      setError(message);
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const clearReport = () => {
    if (window.confirm('Deseja excluir este tratado permanente?')) {
      setReportText('');
      onReportUpdated?.('');
      clearTraditionalReportFromStorage(chart.birthData);
    }
  };

  return (
    <div className="flex flex-col gap-6 group/report">
      {/* Header do Relatório */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-gold-500/20 p-6 shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-gold-500/40">
        {/* User Requested Gold Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-gold-600/10 via-gold-400/5 to-transparent opacity-0 group-hover/report:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                <ShieldCheck className="w-7 h-7 text-gold-500" />
                Tratado de Astrologia Tradicional
              </h2>
              <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                Análise baseada em técnicas clássicas e medievais. Explore a operacionalidade do seu mapa,
                as dignidades essenciais e a força do seu Almuten Figuris através de inteligência artificial especializada.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {reportText && canDeleteReport && (
                <button
                  onClick={clearReport}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                  title="Excluir Tratado"
                >
                  <History className="w-5 h-5" />
                </button>
              )}



              {reportLimitReached ? (
                <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-xs max-w-[200px]">
                  Crédito de visitante para o Tratado utilizado.
                </div>
              ) : (
                <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className={`group relative flex items-center gap-2 px-6 py-3.5 text-base font-bold rounded-2xl transition-all duration-300 overflow-hidden shadow-xl ${loading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    : 'bg-slate-950 text-gold-400 border border-gold-500/30 hover:border-gold-400/60 hover:text-white hover:shadow-gold-500/20 active:scale-95'
                    }`}
                >
                  {/* Background Glow */}
                  {!loading && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-gold-600/10 via-gold-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}

                  {/* Animated Gradient Border (Simulated) */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[linear-gradient(45deg,transparent,rgba(212,175,55,0.8),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Invocando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 flex-shrink-0 group-hover:animate-pulse" />
                      <span className="relative z-10">{reportText ? 'Atualizar Tratado' : 'Gerar Tratado'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Área do Relatório */}
      <div className="relative min-h-[400px]">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {reportText ? (
          <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 p-6 md:p-12 shadow-inner group relative overflow-hidden transition-all duration-500 hover:border-gold-500/20">
            {/* Subtle Gold Background Glow for the report text area */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <div
              ref={scrollRef}
              className="prose prose-invert prose-gold max-w-none 
                prose-headings:font-serif prose-headings:text-gold-100 
                prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg
                prose-strong:text-gold-400 prose-strong:font-bold
                prose-h3:border-b prose-h3:border-gold-500/20 prose-h3:pb-2 prose-h3:mt-8 md:prose-h3:mt-12"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {reportText}
              </ReactMarkdown>
            </div>

            {isStreaming && (
              <div className="flex items-center gap-2 text-gold-500 mt-8 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-mono uppercase tracking-widest">Tecendo o destino...</span>
              </div>
            )}
          </div>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-3xl border-2 border-dashed border-white/5">
            <div className="w-20 h-20 rounded-full bg-gold-500/5 flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-gold-500/40" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum tratado gerado</h3>
            <p className="text-slate-400 max-w-md text-center text-sm px-6">
              Clique em &quot;Gerar Tratado&quot; para que a inteligência artificial analise suas dignidades tradicionais e lotes herméticos.
            </p>
          </div>
        )}

        {loading && !reportText && (
          <div className="flex flex-col items-center justify-center py-32 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-gold-500/10 shadow-2xl relative overflow-hidden">
            {/* Animated Background stars */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" />
              <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-gold-400 rounded-full animate-pulse" />
              <div className="absolute top-1/2 left-2/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping delay-700" />
              <div className="absolute top-1/3 left-3/4 w-1 h-1 bg-white rounded-full animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-gold-500/10 border-t-gold-500 animate-spin transition-all duration-1000 shadow-[0_0_30px_rgba(212,175,55,0.2)]"></div>
                <div className="absolute inset-0 rounded-full border border-white/5 animate-pulse scale-110"></div>
                <Sparkles className="w-8 h-8 text-gold-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
              </div>
              <p className="text-xl font-serif text-gold-200 animate-pulse tracking-wide font-black">Consultando as Esferas Celestes...</p>
              <div className="flex items-center gap-3 mt-4">
                <span className="h-[2px] w-8 bg-gradient-to-r from-transparent to-gold-500/40"></span>
                <p className="text-xs text-slate-500 font-medium tracking-[0.3em] uppercase">Decifrando o Destino</p>
                <span className="h-[2px] w-8 bg-gradient-to-l from-transparent to-gold-500/40"></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NatalChart, AIReport as AIReportType } from '@/types';
import {
  Sparkles,
  AlertCircle,
  Loader2,
  Trash2,
  ScrollText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { getReportKey, getReportKeyLegacy } from '@/lib/storage';
import { DEFAULT_MODEL_ID } from '@/lib/aiConfig';

interface AIReportProps {
  chart: NatalChart;
  reportMode?: 'natal' | 'solar' | 'traditional';
  solarRevolution?: NatalChart | null;
  solarYear?: number;
  onReportGenerated?: (report: AIReportType | null) => void;
  onReportUpdated?: (text: string) => void;
}

export default function AIReport({
  chart,
  reportMode = 'natal',
  solarRevolution,
  solarYear,
  onReportGenerated,
  onReportUpdated,
}: AIReportProps) {
  const isSolarMode = reportMode === 'solar';
  const [reportText, setReportText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelId] = useState(DEFAULT_MODEL_ID);
  const [userRole, setUserRole] = useState<string>('admin');

  useEffect(() => {
    const match = document.cookie.match(/astromap_role=([^;]+)/);
    if (match) setUserRole(match[1]);
  }, []);

  const isGuest = userRole.startsWith('guest:');
  const isGuestUsed = (() => {
    if (!isGuest) return false;
    const credits = userRole.split(':')[1];
    const code = reportMode === 'solar' ? 'r' : 'n';
    const match = credits.match(new RegExp(`${code}(\\d)`));
    return match ? match[1] === '0' : true;
  })();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Carregar relatório salvo no início
  useEffect(() => {
    // Tentar carregar relatório salvo para este mapa
    const reportKey = getReportKey(chart.birthData, isSolarMode, solarYear);
    const legacyKey = getReportKeyLegacy(chart.birthData.name, chart.birthData.date, isSolarMode, solarYear);
    const savedReport = localStorage.getItem(reportKey) || localStorage.getItem(legacyKey);

    if (savedReport) {
      setReportText(savedReport);
      if (onReportUpdated) onReportUpdated(savedReport);
    }
  }, [chart, isSolarMode, solarYear, onReportUpdated]);

  // Auto-scroll durante o streaming
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
          reportMode,
          solarChart: isSolarMode ? solarRevolution : undefined,
          solarYear: isSolarMode ? solarYear : undefined,
          model: modelId,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Erro ao comunicar com a IA';

        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } else {
          const text = await response.text();
          errorMessage = text || `Erro do servidor (${response.status})`;
        }

        throw new Error(errorMessage);
      }

      if (!response.body) throw new Error('Falha no stream de dados');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setReportText(accumulatedText);
        if (onReportUpdated) onReportUpdated(accumulatedText);
      }

      // Salvar no localStorage ao finalizar
      const reportKey = getReportKey(chart.birthData, isSolarMode, solarYear);
      localStorage.setItem(reportKey, accumulatedText);

      if (onReportGenerated) {
        onReportGenerated({
          sections: [], // Compatibilidade com tipo antigo
          summary: accumulatedText.slice(0, 200),
          generatedAt: new Date().toISOString()
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
      setIsStreaming(false);
      // Atualizar role após tentativa de geração (pode ter mudado para guest:used)
      const match = document.cookie.match(/astromap_role=([^;]+)/);
      if (match) setUserRole(match[1]);
    }
  };

  const handleDeleteReport = () => {
    if (confirm('Tem certeza que deseja apagar permanentemente este relatório?')) {
      const reportKey = getReportKey(chart.birthData, isSolarMode, solarYear);
      const legacyKey = getReportKeyLegacy(chart.birthData.name, chart.birthData.date, isSolarMode, solarYear);
      localStorage.removeItem(reportKey);
      localStorage.removeItem(legacyKey);
      setReportText('');
      onReportUpdated?.('');
      onReportGenerated?.(null);
    }
  };


  return (
    <div className="flex flex-col h-full max-h-[70vh] md:max-h-[85vh] bg-slate-950/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header Premium */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-purple-500/30">
            <Image
              src="/assets/logo-premium.png"
              alt="Logo"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              {solarYear ? `Revolução Solar ${solarYear}` : 'Interpretação IA'}
            </h3>
            <p className="text-xs text-slate-400">
              {reportText ? 'Relatório Astrológico Híbrido' : 'Pronto para analisar seu mapa'}
            </p>
          </div>
        </div>

        {reportText && !isStreaming && !isGuest && (
          <button
            onClick={handleDeleteReport}
            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
            title="Apagar Relatório"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth custom-scrollbar"
      >
        {!reportText && !loading && (
          <div className="max-w-md mx-auto py-12 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-inner">
              <ScrollText className="w-10 h-10 text-purple-400" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-medium text-slate-200">Seu Mapa em Profundidade</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Nossa IA combina astrologia psicológica e preditiva para criar um guia único sobre seu temperamento, desafios e o momento atual.
              </p>
            </div>



            {isGuestUsed ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <p className="text-amber-200 text-sm">
                  Seu crédito de visitante para este relatório ({reportMode === 'solar' ? 'Revolução Solar' : 'Mapa Natal'}) foi utilizado. 
                  Para gerar relatórios ilimitados, considere o acesso completo.
                </p>
              </div>
            ) : (
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white font-bold shadow-lg shadow-purple-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-3"
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
                GERAR RELATÓRIO COM IA
              </button>
            )}
          </div>
        )}

        {reportText && (
          <article className="prose prose-invert prose-slate max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-headings:text-purple-300 prose-strong:text-purple-200 prose-hr:border-slate-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {reportText}
            </ReactMarkdown>

            {isStreaming && (
              <div className="flex items-center gap-2 mt-4 text-purple-400 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-medium tracking-widest uppercase">Interpretando astros...</span>
              </div>
            )}
          </article>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="text-sm text-red-200/80">
              <p className="font-bold">Houve uma interrupção cósmica</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>

      {reportText && !isStreaming && (
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-center gap-4">
          <p className="text-[10px] text-slate-500 font-medium">Este relatório está salvo no seu dispositivo.</p>
        </div>
      )}
    </div>
  );
}

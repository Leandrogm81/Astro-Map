'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NatalChart, AIReport as AIReportType } from '@/types';
import { 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  ChevronDown, 
  Key, 
  Eye, 
  EyeOff, 
  Trash2, 
  ScrollText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

interface Model {
  id: string;
  name: string;
  description: string;
  cost: string;
}

interface AIReportProps {
  chart: NatalChart;
  solarRevolution?: NatalChart | null;
  solarYear?: number;
  onReportGenerated?: (report: AIReportType | null) => void;
  onReportUpdated?: (text: string) => void;
}

export default function AIReport({ chart, solarRevolution, solarYear, onReportGenerated, onReportUpdated }: AIReportProps) {
  const [reportText, setReportText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.0-flash-001');
  const [models, setModels] = useState<Model[]>([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Carregar chave e modelos no início
  useEffect(() => {
    const storedApiKey = localStorage.getItem('openrouter_api_key');
    if (storedApiKey) setApiKey(storedApiKey);
    
    // Tentar carregar relatório salvo para este mapa
    const reportKey = `report_${chart.birthData.name}_${chart.birthData.date}${solarYear ? `_SR${solarYear}` : ''}`;
    const savedReport = localStorage.getItem(reportKey);
    if (savedReport) {
      setReportText(savedReport);
      if (onReportUpdated) onReportUpdated(savedReport);
    }
    
    fetch('/api/report')
      .then(res => res.json())
      .then(data => { if (data.models) setModels(data.models); })
      .catch(console.error);
  }, [chart, solarYear]);

  // Auto-scroll durante o streaming
  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [reportText, isStreaming]);

  const handleGenerateReport = async () => {
    if (!apiKey.trim()) {
      setError('Por favor, insira sua chave API da OpenRouter');
      return;
    }

    localStorage.setItem('openrouter_api_key', apiKey.trim());
    setLoading(true);
    setIsStreaming(true);
    setError(null);
    setReportText('');

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chart,
          solarRevolution,
          solarYear,
          model: selectedModel,
          apiKey: apiKey.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao comunicar com a IA');
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
      const reportKey = `report_${chart.birthData.name}_${chart.birthData.date}${solarYear ? `_SR${solarYear}` : ''}`;
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
    }
  };

  const handleDeleteReport = () => {
    if (confirm('Tem certeza que deseja apagar permanentemente este relatório?')) {
      const reportKey = `report_${chart.birthData.name}_${chart.birthData.date}${solarYear ? `_SR${solarYear}` : ''}`;
      localStorage.removeItem(reportKey);
      setReportText('');
    }
  };

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-slate-950/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
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

        {reportText && !isStreaming && (
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

            {/* Model Selector Tooltip-style */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="relative">
                <button
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl hover:border-purple-500/40 transition-all text-left"
                >
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Modelo de IA</span>
                    <span className="text-sm text-slate-200 font-medium">{selectedModelData?.name || 'Carregando...'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
                </button>

                {showModelSelector && (
                  <div className="absolute bottom-full mb-2 z-50 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                    {models.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedModel(m.id); setShowModelSelector(false); }}
                        className={`w-full p-3 text-left hover:bg-purple-500/10 border-b border-slate-800 last:border-0 transition-colors ${selectedModel === m.id ? 'bg-purple-500/10' : ''}`}
                      >
                        <div className="text-sm font-medium text-slate-200">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                    <Key className="w-3 h-3" />
                     Chave OpenRouter
                  </span>
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-[10px] text-purple-400 hover:underline">Obter chave</a>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full px-4 py-3 pr-12 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={loading || !apiKey.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white font-bold shadow-lg shadow-purple-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              GERAR RELATÓRIO COM IA
            </button>
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

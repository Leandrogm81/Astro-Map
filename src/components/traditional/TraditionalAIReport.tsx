'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NatalChart } from '@/types';
import { TraditionalAssessment } from '@/lib/traditional/types';
import { 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  ChevronDown, 
  Key, 
  ScrollText,
  FileText,
  History,
  ShieldCheck,
  Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  clearTraditionalReportFromStorage,
  loadTraditionalReportFromStorage,
  saveTraditionalReportToStorage,
} from '@/lib/traditional/reportStorage';

interface Model {
  id: string;
  name: string;
  description: string;
  cost: string;
}

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
  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.5-flash-lite');
  const [models, setModels] = useState<Model[]>([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openrouter_api_key');
    if (storedApiKey) setApiKey(storedApiKey);
    
    const savedReport = loadTraditionalReportFromStorage(chart.birthData);
    if (savedReport) {
      setReportText(savedReport);
      if (onReportUpdated) onReportUpdated(savedReport);
    }
    
    fetch('/api/report')
      .then(res => res.json())
      .then(data => {
        if (data.models) setModels(data.models);
      })
      .catch(err => {
        console.error('Erro ao carregar modelos:', err);
      });
  }, [chart]);

  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [reportText, isStreaming]);

  const handleGenerateReport = async () => {
    if (!apiKey.trim()) {
      setError('Por favor, insira sua chave API da OpenRouter nas configurações.');
      return;
    }

    localStorage.setItem('openrouter_api_key', apiKey.trim());
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
          isTraditional: true,
          model: selectedModel,
          apiKey: apiKey.trim(),
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
              {reportText && (
                <button
                  onClick={clearReport}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                  title="Excluir Tratado"
                >
                  <History className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all text-sm font-medium"
              >
                <Zap className="w-4 h-4 text-gold-500" />
                {models.find(m => m.id === selectedModel)?.name || 'Modelo'}
                <ChevronDown className={`w-4 h-4 transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className={`group relative flex items-center gap-2 px-6 py-3.5 text-base font-bold rounded-2xl transition-all duration-300 overflow-hidden shadow-xl ${
                  loading 
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
            </div>
          </div>

          {/* Seletor de Modelo */}
          {showModelSelector && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModelSelector(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedModel === model.id 
                      ? 'bg-gold-500/10 border-gold-500/50' 
                      : 'bg-white/5 border-white/10 hover:border-gold-500/30'
                  }`}
                >
                  <div className="text-sm font-black text-gold-400 mb-1.5 uppercase tracking-wide">{model.name}</div>
                  <div className="space-y-2">
                    {model.description.split('\n').map((line, idx) => (
                      <div key={idx} className={`${line.includes('Custo:') ? 'text-white font-bold bg-white/5 px-2 py-1 rounded-md inline-block text-[11px]' : 'text-slate-300 text-xs leading-relaxed'}`}>
                        {line}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Área do Relatório */}
      <div className="relative min-h-[400px]">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
            {!apiKey && (
               <div className="ml-auto flex items-center gap-2">
                 <input 
                   type="password" 
                   placeholder="Chave OpenRouter" 
                   value={apiKey}
                   onChange={(e) => setApiKey(e.target.value)}
                   className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-xs focus:ring-1 focus:ring-gold-500 outline-none w-48 text-white"
                 />
               </div>
            )}
          </div>
        )}

        {reportText ? (
          <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 p-8 md:p-12 shadow-inner group relative overflow-hidden transition-all duration-500 hover:border-gold-500/20">
            {/* Subtle Gold Background Glow for the report text area */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div 
              ref={scrollRef}
              className="prose prose-invert prose-gold max-w-none 
                prose-headings:font-serif prose-headings:text-gold-100 
                prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-lg
                prose-strong:text-gold-400 prose-strong:font-bold
                prose-h3:border-b prose-h3:border-gold-500/20 prose-h3:pb-2 prose-h3:mt-12"
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


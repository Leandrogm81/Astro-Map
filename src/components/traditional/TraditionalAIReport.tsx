'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NatalChart } from '@/types';
import { TraditionalAssessment } from '@/lib/traditional/scoring';
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
  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.0-flash-001');
  const [models, setModels] = useState<Model[]>([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openrouter_api_key');
    if (storedApiKey) setApiKey(storedApiKey);
    
    const reportKey = `trad_report_${chart.birthData.name}_${chart.birthData.date}`;
    const savedReport = localStorage.getItem(reportKey);
    if (savedReport) {
      setReportText(savedReport);
      if (onReportUpdated) onReportUpdated(savedReport);
    }
    
    fetch('/api/report')
      .then(res => res.json())
      .then(data => { if (data.models) setModels(data.models); })
      .catch(console.error);
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
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setReportText(fullText);
          if (onReportUpdated) onReportUpdated(fullText);
        }
      }

      const reportKey = `trad_report_${chart.birthData.name}_${chart.birthData.date}`;
      localStorage.setItem(reportKey, fullText);
      
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado');
      console.error(err);
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  const clearReport = () => {
    if (window.confirm('Deseja excluir este tratado permanente?')) {
      setReportText('');
      const reportKey = `trad_report_${chart.birthData.name}_${chart.birthData.date}`;
      localStorage.removeItem(reportKey);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header do Relatório */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-gold-500/20 p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                <ShieldCheck className="w-7 h-7 text-gold-500" />
                Tratado de Astrologia Tradicional
              </h2>
              <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                Análise baseada em técnicas clássicas e medievais. Explore a operationalidade do seu mapa, 
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
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] border-t border-white/20 ${
                  loading 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-tr from-gold-500 via-gold-400 to-gold-300 text-slate-950 hover:from-gold-400 hover:to-gold-200 hover:scale-105 active:scale-95'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {reportText ? 'Atualizar Tratado' : 'Gerar Tratado'}
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
                  <div className="text-xs font-bold text-gold-400 mb-1">{model.name}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{model.description}</div>
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
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl border border-white/5 p-8 md:p-12 shadow-inner group">
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
              Clique em "Gerar Tratado" para que a inteligência artificial analise suas dignidades tradicionais e lotes herméticos.
            </p>
          </div>
        )}

        {loading && !reportText && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-gold-500/10 border-t-gold-500 animate-spin"></div>
              <Sparkles className="w-6 h-6 text-gold-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="mt-6 text-gold-400 font-medium animate-pulse">Consultando os Antigos...</p>
            <p className="text-xs text-slate-500 mt-2">Isso pode levar alguns segundos.</p>
          </div>
        )}
      </div>
    </div>
  );
}

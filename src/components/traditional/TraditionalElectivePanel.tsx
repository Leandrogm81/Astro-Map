'use client';

import React, { useState, useMemo } from 'react';
import { NatalChart } from '@/types';
import { 
  MagicPurpose, 
  PlanetHour, 
  LunarMansion, 
  ElectiveVeredict 
} from '@/lib/traditional/types';
import { 
  calculatePlanetHour, 
  getLunarMansion, 
  getElectiveVeredict,
  PURPOSE_RULER 
} from '@/lib/traditional/elective';
import { 
  Moon, 
  Sun, 
  Clock, 
  Sparkles, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Zap,
  Loader2,
  Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TraditionalElectivePanelProps {
  chart: NatalChart;
}

export default function TraditionalElectivePanel({ chart }: TraditionalElectivePanelProps) {
  const [purpose, setPurpose] = useState<MagicPurpose>('love');
  const [isGenerating, setIsGenerating] = useState(false);
  const [magicInsight, setMagicInsight] = useState<string | null>(null);

  // Dados para cálculo (Simulado se não houver dados de sunrise exatos, mas usando aproximados do mapa)
  // No mundo real, usaríamos astronomy-engine para sunrise/sunset exatos.
  // Como simplificação para o MVP, vamos estimar se é dia/noite pelo Sol na casa.
  
  const veredict = useMemo(() => {
    // Estimativa de Sunrise/Sunset para Hora Planetária aproximada
    // Se o mapa é diurno, o Sol está entre ASC e DESC
    const now = new Date(chart.birthData.date + 'T' + chart.birthData.time);
    const dayOfWeek = now.getDay();
    
    // Mock de sunrise/sunset para o cálculo da hora (6h - 18h)
    const sunrise = new Date(now); sunrise.setHours(6, 0, 0);
    const sunset = new Date(now); sunset.setHours(18, 0, 0);
    const nextSunrise = new Date(now); nextSunrise.setDate(nextSunrise.getDate() + 1); nextSunrise.setHours(6, 0, 0);

    const moon = chart.planets.find(p => p.id === 'moon')!;
    const planetHour = calculatePlanetHour(now, sunrise, sunset, nextSunrise, dayOfWeek);
    const mansion = getLunarMansion(moon.longitude);

    return getElectiveVeredict(purpose, chart.planets, chart.isDayChart ?? true, planetHour, mansion);
  }, [chart, purpose]);

  const handleGenerateInsight = async () => {
    setIsGenerating(true);
    setMagicInsight(null);
    const apiKey = localStorage.getItem('openrouter_api_key');

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart,
          reportMode: 'elective_magic',
          veredict,
          apiKey: apiKey || '',
        }),
      });

      if (!response.ok) throw new Error('Falha ao gerar insight');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value);
        setMagicInsight(fullText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'propitious': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'neutral': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'challenging': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getScoreIcon = (score: string) => {
    switch (score) {
      case 'propitious': return <CheckCircle className="w-5 h-5" />;
      case 'neutral': return <AlertTriangle className="w-5 h-5" />;
      case 'challenging': return <Shield className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-slate-950/50 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-transparent">
        <h3 className="text-xl font-serif font-black text-white flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-gold-400" />
          Eletiva Mágica
        </h3>
        <p className="text-slate-400 text-sm mt-1">Determine a auspiciosidade do céu para operações teúrgicas.</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna 1: Configuração e Veredito */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Propósito da Obra</label>
            <div className="grid grid-cols-1 gap-2">
              {(['authority', 'love', 'communication', 'expansion', 'conflict', 'structure', 'emotion'] as MagicPurpose[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPurpose(p)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    purpose === p 
                      ? 'bg-gold-500/10 border-gold-500/50 text-gold-200' 
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span className="capitalize">{p === 'love' ? 'Amor / Vênus' : p === 'authority' ? 'Poder / Sol' : p === 'communication' ? 'Mente / Mercúrio' : p === 'expansion' ? 'Sorte / Júpiter' : p === 'conflict' ? 'Defesa / Marte' : p === 'structure' ? 'Ordem / Saturno' : 'Emoção / Lua'}</span>
                  {purpose === p && <Zap className="w-4 h-4 fill-current" />}
                </button>
              ))}
            </div>
          </div>

          <div className={`p-5 rounded-2xl border-2 animate-in zoom-in-95 duration-500 ${getScoreColor(veredict.score)}`}>
            <div className="flex items-center gap-3 mb-2">
              {getScoreIcon(veredict.score)}
              <span className="font-black uppercase tracking-tighter text-lg">
                {veredict.score === 'propitious' ? 'Céu Auspicioso' : veredict.score === 'neutral' ? 'Céu Neutro' : 'Céu Hostil'}
              </span>
            </div>
            <p className="text-sm opacity-80 leading-tight">
              {veredict.score === 'propitious' 
                ? 'As emanações celestes estão em harmonia com sua intenção. Prossiga com fé.' 
                : veredict.score === 'neutral' 
                  ? 'O céu não favorece nem impede. A força do magista ditará o resultado.' 
                  : 'As estrelas resistem a esta obra. Cautela ou adiamento são recomendados.'}
            </p>
          </div>
        </div>

        {/* Coluna 2: Detalhes Técnicos */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Condições de Tempo</h4>
          
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold-500/10">
                  <Clock className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Hora Planetária</div>
                  <div className="text-white font-bold capitalize">{veredict.planetHour.planetId}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Ordem</div>
                <div className="text-gold-400 text-xs font-mono">{veredict.planetHour.hourNumber}ª da {veredict.planetHour.isDaytime ? 'Luz' : 'Sombra'}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Moon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Mansão Lunar</div>
                  <div className="text-white font-bold">{veredict.lunarMansion.number} - {veredict.lunarMansion.name}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Estado da Lua:</span>
                <span className="text-slate-300 font-medium">{veredict.moonStatus.phase}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Regente ({veredict.rulerCondition.planetId}):</span>
                <span className={`font-bold ${veredict.rulerCondition.totalScore > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {veredict.rulerCondition.totalScore} pts
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
            <h5 className="text-[10px] text-gold-500 uppercase font-black mb-2 flex items-center gap-2">
              <Info className="w-3 h-3" />
              Virtude da Mansão
            </h5>
            <p className="text-xs text-slate-400 italic leading-relaxed">
              &quot;{veredict.lunarMansion.summary}&quot;
            </p>
          </div>
        </div>

        {/* Coluna 3: Insight de IA */}
        <div className="flex flex-col h-full">
          {!magicInsight ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <button
                onClick={handleGenerateInsight}
                disabled={isGenerating}
                className="group relative px-6 py-3 bg-slate-950 border border-gold-500/30 rounded-xl text-gold-400 font-bold hover:text-white transition-all overflow-hidden"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Consultando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Insight Mágico</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-4 uppercase tracking-widest font-bold">Usa IA para análise profunda</p>
            </div>
          ) : (
            <div className="flex-1 bg-slate-900/50 rounded-3xl border border-gold-500/20 p-6 overflow-y-auto max-h-[400px] custom-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full uppercase font-black">Oráculo Ativado</span>
                <button onClick={() => setMagicInsight(null)} className="text-[10px] text-slate-500 hover:text-white">Limpar</button>
              </div>
              <div className="prose prose-invert prose-xs prose-gold max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {magicInsight}
                </ReactMarkdown>
              </div>
              {isGenerating && (
                 <div className="flex items-center gap-2 text-gold-500 mt-4 animate-pulse text-[10px]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Tecendo a resposta...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

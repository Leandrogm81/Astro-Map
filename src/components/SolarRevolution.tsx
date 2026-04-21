'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NatalChart, PlanetPosition, Aspect } from '@/types';
import { calculateSolarReturn } from '@/lib/ephemeris';
import { Sun, Loader2, Sparkles, ScrollText, Trash2, Home, Compass, Zap, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TransitWheel from './TransitWheel';
import { calculateCrossAspects, getHouseForPlanet, getElementColor, ZODIAC_SIGNS } from '@/lib/astrology';
import { getReportKey, getReportKeyLegacy } from '@/lib/storage';


const HOUSE_MEANINGS: Record<number, { title: string; area: string }> = {
  1: { title: 'Identidade', area: 'Autoimagem, come\u00e7os e vitalidade' },
  2: { title: 'Recursos', area: 'Finan\u00e7as, valores e seguran\u00e7a' },
  3: { title: 'Comunica\u00e7\u00e3o', area: 'Estudos, viagens curtas e ambiente' },
  4: { title: 'Ra\u00edzes', area: 'Lar, fam\u00edlia e base emocional' },
  5: { title: 'Criatividade', area: 'Prazer, romance e projetos' },
  6: { title: 'Rotina', area: 'Sa\u00fade, trabalho e h\u00e1bitos' },
  7: { title: 'Parcerias', area: 'Relacionamentos e contratos' },
  8: { title: 'Transforma\u00e7\u00e3o', area: 'Crises, intimidade e bens partilhados' },
  9: { title: 'Expans\u00e3o', area: 'Filosofia, estudos superiores e viagens' },
  10: { title: 'Carreira', area: 'Status, metas e reputa\u00e7\u00e3o' },
  11: { title: 'Social', area: 'Amizades, grupos e esperan\u00e7as' },
  12: { title: 'Inconsciente', area: 'Espiritualidade, isolamento e fim de ciclos' },
};
interface SolarRevolutionProps {
  natalChart: NatalChart;
  initialYear?: number;
  initialSolarRevolution?: NatalChart | null;
  onRevolutionCalculated?: (solarReturn: NatalChart | null, year: number) => void;
  onReportUpdated?: (reportText: string) => void;
}

export default function SolarRevolution({ 
  natalChart, 
  initialYear, 
  initialSolarRevolution, 
  onRevolutionCalculated, 
  onReportUpdated 
}: SolarRevolutionProps) {
  const [year, setYear] = useState(initialYear || new Date().getFullYear());
  const [solarReturn, setSolarReturn] = useState<NatalChart | null>(initialSolarRevolution || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportText, setReportText] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState(false);

  const getAspectSymbol = (type: string): string => {
    const symbols: Record<string, string> = {
      'conjun\u00e7\u00e3o': '\u260c', 'sextil': '\u26b9', 'quadratura': '\u25fb', 'tr\u00edgono': '\u25b3', 'oposi\u00e7\u00e3o': '\u260d',
      'semisextil': '\u26ba', 'semiquadratura': '\u2220', 'sesquiquadratura': '\u26bc', 'quinc\u00fancio': '\u26bb',
    };
    return symbols[type] || '\u25e6';
  };

  const getAspectClass = (type: string): string => {
    const classes: Record<string, string> = {
      'conjun\u00e7\u00e3o': 'aspect-conjuncao',
      'sextil': 'aspect-sextil',
      'quadratura': 'aspect-quadratura',
      'tr\u00edgono': 'aspect-trigono',
      'oposi\u00e7\u00e3o': 'aspect-oposicao'
    };
    return classes[type] || 'aspect-neutral';
  };

  // Funções de análise
  const crossAspects = solarReturn ? calculateCrossAspects(solarReturn.planets, natalChart.planets)
    .filter(a => ['conjun\u00e7\u00e3o', 'sextil', 'quadratura', 'tr\u00edgono', 'oposi\u00e7\u00e3o'].includes(a.type))
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 12) : [];

  const getYearThemes = () => {
    if (!solarReturn) return [];
    const themes: { label: string; icon: any }[] = [];
    const srAsc = solarReturn.housesPlacidus?.[0]?.sign;
    const natalAsc = natalChart.housesPlacidus?.[0]?.sign;
    const srSunHouse = solarReturn.planets.find(p => p.name === 'Sol')?.house;

    if (srAsc === natalAsc) themes.push({ label: 'Retorno Profundo', icon: Target });
    if (srSunHouse === 10 || srSunHouse === 1) themes.push({ label: 'Destaque e Visibilidade', icon: Sun });
    if (solarReturn.planets.find(p => p.name === 'Saturno')?.house === 10) themes.push({ label: 'Constru\u00e7\u00e3o de Carreira', icon: Zap });
    if (solarReturn.planets.find(p => p.name === 'J\u00fapiter')?.house === 2) themes.push({ label: 'Expans\u00e3o Financeira', icon: Sparkles });
    
    return themes.length > 0 ? themes : [{ label: 'Novo Ciclo', icon: Compass }];
  };

  // Sincronizar com props iniciais quando mudarem (ao carregar mapa salvo)
  useEffect(() => {
    if (initialYear) setYear(initialYear);
    if (initialSolarRevolution) setSolarReturn(initialSolarRevolution);
  }, [initialYear, initialSolarRevolution]);

  // Carregar relatório salvo ao mudar de mapa/ano
  useEffect(() => {
    if (natalChart && year) {
      const reportKey = getReportKey(natalChart.birthData, true, year);
      const legacyKey = getReportKeyLegacy(natalChart.birthData.name, natalChart.birthData.date, true, year);
      const savedReport = localStorage.getItem(reportKey) || localStorage.getItem(legacyKey);
      setReportText(savedReport || '');
    }
  }, [natalChart, year]);

  // Propagar o texto do relatório para cima quando mudar
  useEffect(() => {
    if (onReportUpdated) {
      onReportUpdated(reportText);
    }
  }, [reportText, onReportUpdated]);

  const calculateRevolution = useCallback(async (targetYear?: number) => {
    const calcYear = targetYear ?? year;
    setLoading(true);
    setError(null);

    try {
      const result = await calculateSolarReturn(natalChart, calcYear);
      setSolarReturn(result);
      if (onRevolutionCalculated) {
        onRevolutionCalculated(result, calcYear);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular revolu\u00e7\u00e3o solar');
    } finally {
      setLoading(false);
    }
  }, [natalChart, year, onRevolutionCalculated]);

  // Calcular automaticamente apenas se não tivermos um retorno solar inicial para este mapa/ano
  useEffect(() => {
    if (!solarReturn || (initialYear && year !== initialYear)) {
      calculateRevolution();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natalChart]);

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
          reportMode: 'solar',
          solarRevolution: solarReturn,
          solarYear: year,
          apiKey: storedApiKey,
        model: 'google/gemini-2.5-flash-lite',
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
      const reportKey = getReportKey(natalChart.birthData, true, year);
      localStorage.setItem(reportKey, accumulated);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDeleteReport = () => {
    if (confirm('Deseja apagar este relatório anual?')) {
      const reportKey = getReportKey(natalChart.birthData, true, year);
      const legacyKey = getReportKeyLegacy(natalChart.birthData.name, natalChart.birthData.date, true, year);
      localStorage.removeItem(reportKey);
      localStorage.removeItem(legacyKey);
      setReportText('');
    }
  };

  const formatDegree = (degree: number): string => {
    const d = Math.floor(degree);
    const m = Math.floor((degree - d) * 60);
    return `${d}°${m}'`;
  };

  const natalAsc = natalChart.housesPlacidus?.[0]?.sign;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-serif">
          <Sun className="w-6 h-6 text-yellow-500 animate-pulse" />
          {"Revolu\u00e7\u00e3o Solar"} {year}
        </h3>
        
        <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => { const newYear = year - 1; setYear(newYear); calculateRevolution(newYear); }}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            disabled={loading}
          >
            {"\u2190"}
          </button>
          <span className="px-4 py-2 text-slate-100 font-bold min-w-[80px] text-center font-mono">
            {year}
          </span>
          <button
            onClick={() => { const newYear = year + 1; setYear(newYear); calculateRevolution(newYear); }}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            disabled={loading}
          >
            {"\u2192"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-20 text-center">
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-purple-500" />
          <p className="mt-4 text-slate-400 font-medium tracking-wide">Calculando alinhamentos astron\u00f4micos...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 text-sm">
          {error}
        </div>
      )}

      {solarReturn && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Painel de Temas */}
          <div className="flex flex-wrap gap-3">
             {getYearThemes().map((theme, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest shadow-lg shadow-gold-500/5">
                   <theme.icon className="w-3.5 h-3.5" />
                   {theme.label}
                </div>
             ))}
          </div>

          {/* Gráfico de Revolu\u00e7\u00e3o (Sobreposi\u00e7\u00e3o) */}
          <div className="glass p-6 rounded-3xl shadow-inner relative overflow-hidden group">
             <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                   <h4 className="text-lg font-bold text-slate-200 font-serif">{"Sobreposi\u00e7\u00e3o Natal vs Revolu\u00e7\u00e3o"}</h4>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest">Externo: {year} | Interno: Natal</p>
                </div>
             </div>
             <TransitWheel natalChart={natalChart} transitChart={solarReturn} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-gold p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ascendente do Ano</span>
              <div className="text-xl font-black text-white mt-1 font-serif">
                {solarReturn.housesPlacidus?.[0]?.sign}
              </div>
              <p className="text-[10px] text-purple-400 mt-1 font-bold">Grau {formatDegree(solarReturn.housesPlacidus?.[0]?.degree ?? 0)}</p>
            </div>

            <div className="glass-gold p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sol na Casa</span>
              <div className="text-xl font-black text-white mt-1 font-serif">
                Casa {solarReturn.planets.find(p => p.name === 'Sol')?.house}
              </div>
              <p className="text-[10px] text-yellow-500 mt-1 font-bold">{solarReturn.birthData.date}</p>
            </div>

            <div className="glass-gold p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lua do Ano</span>
              <div className="text-xl font-black text-white mt-1 font-serif">
                {solarReturn.planets.find(p => p.name === 'Lua')?.sign}
              </div>
              <p className="text-[10px] text-indigo-400 mt-1 font-bold">Casa {solarReturn.planets.find(p => p.name === 'Lua')?.house}</p>
            </div>

            <div className="glass-gold p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tema Central</span>
              <div className="text-sm font-bold text-purple-300 mt-2 leading-tight font-serif">
                 {solarReturn.housesPlacidus?.[0]?.sign === natalAsc ? 'Retorno Profundo' : 'Nova Abordagem'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Aspectos Cruzados */}
             <div className="glass p-6 rounded-3xl">
                <h4 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2 font-serif">
                   <Zap className="w-5 h-5 text-gold-500" />
                   Aspectos Cruzados (RS ↔ Natal)
                </h4>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                   {crossAspects.map((aspect, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                         <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-white min-w-[70px]">{aspect.planet1} (RS)</span>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-white/5 ${getAspectClass(aspect.type)}`}>
                               <span className="text-xl">{getAspectSymbol(aspect.type)}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-300 min-w-[70px]">{aspect.planet2} (Natal)</span>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-500 uppercase truncate">{aspect.type}</p>
                       <p className="text-[9px] font-mono text-slate-600">órbita: {aspect.orb.toFixed(1)}°</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Planetas RS nas Casas Natais */}
             <div className="glass p-6 rounded-3xl">
                <h4 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2 font-serif">
                   <Home className="w-5 h-5 text-indigo-400" />
                   Foco Vital (RS nas Casas Natais)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                   {solarReturn.planets.slice(0, 10).map((p, i) => {
                      const natalHouse = getHouseForPlanet(p.longitude, natalChart.housesPlacidus);
                      return (
                         <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between">
                               <span className="text-lg">{p.symbol}</span>
                               <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">CASA {natalHouse} NATAL</span>
                            </div>
                            <p className="text-xs font-bold text-white mt-2">{p.name}</p>
                            <p className="text-[10px] text-slate-500 leading-tight mt-1">{HOUSE_MEANINGS[natalHouse].title}</p>
                         </div>
                      );
                   })}
                </div>
             </div>
          </div>

          {/* Grid de Casas da RS */}
          <div className="glass p-6 rounded-3xl">
             <h4 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2 font-serif">
                <Compass className="w-5 h-5 text-purple-400" />
                 Estrutura de Casas da Revolu\u00e7\u00e3o Solar
             </h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {solarReturn.housesPlacidus.map((house, i) => {
                   const planetInHouse = solarReturn.planets.filter(p => p.house === house.number);
                   return (
                      <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all min-h-[140px] flex flex-col overflow-hidden">
                         <div className="mb-2 overflow-hidden">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Casa {house.number}</span>
                            <span className="text-sm font-bold text-purple-300 block truncate">{house.sign}</span>
                         </div>
                         <p className="text-sm font-bold text-white mb-1 font-serif truncate">{HOUSE_MEANINGS[house.number].title}</p>
                         <div className="flex flex-wrap gap-1 mt-auto py-2 max-h-[2.5rem] overflow-hidden">
                            {planetInHouse.map(p => (
                               <span key={p.name} title={p.name} className="text-xl leading-none">{p.symbol}</span>
                            ))}
                         </div>
                         <p className="text-[11px] text-slate-400 mt-2 leading-snug uppercase tracking-normal line-clamp-2">{HOUSE_MEANINGS[house.number].area}</p>
                      </div>
                   );
                })}
             </div>
          </div>

          {/* AI Report Section for Solar Return */}
          <div className="glass-gold rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="p-4 bg-slate-800/20 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h4 className="font-bold text-slate-100 font-serif">Guia Anual Inteligente</h4>
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
                         <span className="text-[10px] font-black uppercase tracking-widest leading-none">Consultando as Estrelas de {year}...</span>
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


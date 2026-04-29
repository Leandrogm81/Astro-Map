'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NatalChart, BirthData, GeocodingResult } from '@/types';
import { ElectiveMode, MagicPurpose } from '@/lib/traditional/types';
import {
  calculatePlanetHour,
  getLunarMansion,
  getElectiveVeredict,
  getPlanetaryDay
} from '@/lib/traditional/elective';
import { calculateTraditionalPoints } from '@/lib/traditional/points';
import { calculateTraditionalAssessment } from '@/lib/traditional/scoring';
import { calculateNatalChart, parseTimezoneOffset, calculateRiseSet } from '@/lib/ephemeris';
import { getTimezoneOffsetForDate, getTimezoneFromCoordinates } from '@/lib/geocoding';
import { useGeocoding } from '@/hooks/useGeocoding';
import { PLANETARY_CORRESPONDENCES, RITUAL_INTENTIONS, RITUAL_CATEGORIES, PlanetKey, RitualCategoryId } from '@/lib/traditional/magic-correspondences';
import { translatePlanetKeyPt, translatePlanetNamePt } from '@/lib/traditional/constants';
import { deleteElectiveSynced, getSavedElectivesSynced, saveElectiveSynced, SavedElective } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';
import {
  Moon,
  Clock,
  Sparkles,
  Shield,
  AlertTriangle,
  CheckCircle,
  Zap,
  Loader2,
  Calendar,
  Flame,
  Droplets,
  Wind,
  MapPin,
  Play,
  Pause,
  Search,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  X,
  Heart,
  Coins,
  Brain,
  Sword,
  Sun as SunIcon,
  ChevronDown,
  Save,
  Trash2,
  BookOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TraditionalElectivePanelProps {
  chart: NatalChart;
}

const PLANET_TO_MAGIC_PURPOSE: Record<PlanetKey, MagicPurpose> = {
  Sun: 'authority',
  Moon: 'emotion',
  Mercury: 'communication',
  Venus: 'love',
  Mars: 'conflict',
  Jupiter: 'expansion',
  Saturn: 'structure',
};

function buildMomentBirthData(baseBirthData: BirthData, moment: Date): BirthData {
  const timezone = getTimezoneOffsetForDate(baseBirthData.latitude, baseBirthData.longitude, moment);
  const offsetHours = parseTimezoneOffset(timezone);
  const localizedMoment = new Date(moment.getTime() + offsetHours * 3600000);

  return {
    ...baseBirthData,
    name: `${baseBirthData.name} - Céu Eletivo`,
    date: `${localizedMoment.getUTCFullYear()}-${String(localizedMoment.getUTCMonth() + 1).padStart(2, '0')}-${String(localizedMoment.getUTCDate()).padStart(2, '0')}`,
    time: `${String(localizedMoment.getUTCHours()).padStart(2, '0')}:${String(localizedMoment.getUTCMinutes()).padStart(2, '0')}`,
    timezone,
  };
}

export default function TraditionalElectivePanel({ chart }: TraditionalElectivePanelProps) {
  const [intentionId, setIntentionId] = useState<string>(RITUAL_INTENTIONS[0].id);
  const [electiveMode, setElectiveMode] = useState<ElectiveMode>('sky_only');
  const [expandedCategory, setExpandedCategory] = useState<RitualCategoryId>('love');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCalculatingSky, setIsCalculatingSky] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [magicInsight, setMagicInsight] = useState<string | null>(null);
  const [skyChart, setSkyChart] = useState<NatalChart | null>(null);
  const [skyTimestamp, setSkyTimestamp] = useState<Date | null>(null);

  // Frente 3: AI Report UI states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const insightScrollRef = useRef<HTMLDivElement>(null);

  const handleScrollProgress = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const progress = el.scrollHeight <= el.clientHeight ? 100 : Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    setScrollProgress(progress);
  }, []);

  const handleCopyInsight = useCallback(async () => {
    if (!magicInsight) return;
    try {
      await navigator.clipboard.writeText(magicInsight);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch { /* fallback silencioso */ }
  }, [magicInsight]);

  // Frente 2: Save/Load states
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);
  const [savedElectives, setSavedElectives] = useState<SavedElective[]>([]);
  const [saveToast, setSaveToast] = useState(false);
  
  const { user } = useAuth();
  const canPersistElectives = true;
  const reportLimitReached = false;
  
  // Time Machine States
  const [isRealTime, setIsRealTime] = useState(true);
  const [targetDateStr, setTargetDateStr] = useState<string>('');
  const [targetTimeStr, setTargetTimeStr] = useState<string>('');
  // Custom Location States
  const [targetLocation, setTargetLocation] = useState<string>(chart.birthData.location || 'Local Atual');
  const [targetLat, setTargetLat] = useState<number>(chart.birthData.latitude);
  const [targetLon, setTargetLon] = useState<number>(chart.birthData.longitude);
  const [targetTimezone, setTargetTimezone] = useState<string>(chart.birthData.timezone);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    showResults,
    setShowResults,
    isSearching,
    handleSearch
  } = useGeocoding();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(targetLocation);
  }, [targetLocation, setSearchQuery]);

  useEffect(() => {
    if (showResults && searchInputRef.current && dropdownRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      const el = dropdownRef.current;
      el.style.position = 'fixed';
      el.style.top = `${rect.bottom + 8}px`;
      el.style.left = `${rect.left}px`;
      el.style.width = `${rect.width}px`;
      el.style.zIndex = '9999';
    }
  }, [showResults, searchResults]);

  const onSearchClick = useCallback(async () => {
    await handleSearch(searchQuery);
  }, [handleSearch, searchQuery]);

  const handleSelectLocation = (result: GeocodingResult) => {
    setTargetLocation(result.display_name);
    setTargetLat(result.lat);
    setTargetLon(result.lon);
    setTargetTimezone(getTimezoneFromCoordinates(result.lat, result.lon));
    
    setSearchQuery(result.display_name);
    setShowResults(false);
    setIsRealTime(false);
  };

  const baseBirthData = useMemo<BirthData>(
    () => ({
      name: chart.birthData.name,
      date: chart.birthData.date,
      time: chart.birthData.time,
      location: targetLocation,
      latitude: targetLat,
      longitude: targetLon,
      timezone: targetTimezone,
    }),
    [chart.birthData, targetLocation, targetLat, targetLon, targetTimezone]
  );

  const selectedIntention = useMemo(() => 
    RITUAL_INTENTIONS.find(r => r.id === intentionId) || RITUAL_INTENTIONS[0], 
  [intentionId]);

  const purpose: MagicPurpose = PLANET_TO_MAGIC_PURPOSE[selectedIntention.ruler];
  const correspondences = PLANETARY_CORRESPONDENCES[selectedIntention.ruler];

  // Initialize date/time strings on mount if empty
  useEffect(() => {
    if (!targetDateStr || !targetTimeStr) {
      const now = new Date();
      setTargetDateStr(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
      setTargetTimeStr(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to handle real-time clock updates
  useEffect(() => {
    if (!isRealTime) return;

    const tick = () => {
      const now = new Date();
      setTargetDateStr(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
      setTargetTimeStr(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    };

    tick();
    const intervalId = window.setInterval(tick, 60000);
    return () => window.clearInterval(intervalId);
  }, [isRealTime]);

  // Effect to handle sky calculation when date/time or location changes
  useEffect(() => {
    let active = true;

    const updateSky = async () => {
      if (!targetDateStr || !targetTimeStr) return;
      
      const [year, month, day] = targetDateStr.split('-').map(Number);
      const [hours, minutes] = targetTimeStr.split(':').map(Number);
      const moment = new Date(year, month - 1, day, hours, minutes, 0);

      setIsCalculatingSky(true);
      try {
        const calculatedSkyChart = await calculateNatalChart(buildMomentBirthData(baseBirthData, moment));
        if (!active) return;
        setSkyChart(calculatedSkyChart);
        setSkyTimestamp(moment);
        setError(null);
    } catch (err) {
        if (!active) return;
        console.error(err);
        setError('Não foi possível calcular o céu do momento.');
      } finally {
        if (active) setIsCalculatingSky(false);
      }
    };

    updateSky();
    return () => {
      active = false;
    };
  }, [baseBirthData, targetDateStr, targetTimeStr]);

  // Limpar insight se mudar de modo
  useEffect(() => {
    setMagicInsight(null);
  }, [electiveMode, intentionId, isRealTime]);

  const electiveDateTime = useMemo(() => skyTimestamp ?? new Date(), [skyTimestamp]);

  const veredict = useMemo(() => {
    if (!skyChart) return null;

    // dayOfWeek is not used
    const { sunrise, sunset, nextSunrise, previousSunset } = calculateRiseSet(
      electiveDateTime,
      targetLat,
      targetLon
    );
    
    const moon = skyChart.planets.find((planet) => planet.id?.toLowerCase() === 'moon');
    if (!moon) return null;

    const planetHour = calculatePlanetHour(
      electiveDateTime,
      sunrise,
      sunset,
      nextSunrise,
      previousSunset
    );
    const mansion = getLunarMansion(moon.longitude);

    return getElectiveVeredict(
      purpose,
      skyChart.planets,
      skyChart.isDayChart ?? true,
      planetHour,
      mansion
    );
  }, [electiveDateTime, purpose, skyChart, targetLat, targetLon]);

  const planetaryDay = useMemo(() => {
    const { sunrise } = calculateRiseSet(electiveDateTime, targetLat, targetLon);
    return getPlanetaryDay(electiveDateTime, sunrise);
  }, [electiveDateTime, targetLat, targetLon]);

  const handleGenerateInsight = async () => {
    if (!skyChart || !veredict) {
      setError('O céu do momento ainda está sendo calculado.');
      return;
    }

    setIsGenerating(true);
    setMagicInsight(null);
    setError(null);
    try {
      // Enriquecer o mapa natal com dados tradicionais se necessário
      const enrichedNatalChart = { ...chart };
      
      if (electiveMode === 'sky_plus_natal' && !enrichedNatalChart.traditionalPoints) {
        // Calcular pontos tradicionais (Almuten, Hyleg, etc)
        enrichedNatalChart.traditionalPoints = calculateTraditionalPoints(
          chart.ascendant,
          chart.planets,
          chart.housesPlacidus,
          chart.isDayChart ?? true,
          chart.prenatalSyzygy
        );

        // Calcular estado operacional dos planetas (assessments)
        enrichedNatalChart.traditionalAssessments = chart.planets
          .filter(p => ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(p.id))
          .map((p) => calculateTraditionalAssessment(
            p,
            chart.planets,
            chart.isDayChart ?? true
          ));
      }

      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart: skyChart,
          natalChart: enrichedNatalChart,
          reportMode: 'elective_magic',
          electiveMode,
          veredict,
          targetDate: skyChart.birthData.date,
          targetTime: skyChart.birthData.time,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha na conexão com o oráculo.');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Falha ao iniciar o fluxo de dados.');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMagicInsight(fullText);
      }

      if (fullText.length === 0) {
        throw new Error('O oráculo não retornou uma resposta. Verifique sua chave API.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Um erro inesperado ocorreu.';
      console.error(err);
      setError(errorMessage);
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

  const resolvedScore = veredict?.score ?? 'neutral';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-black tracking-tighter gradient-text-gold">Eletiva Magística</h1>
          <div className="flex items-center gap-2">
            <span className="h-px w-4 bg-gold-600/50"></span>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">Grimório Digital & Máquina do Tempo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {veredict && !isCalculatingSky && canPersistElectives && (
            <button
              onClick={async () => {
                const intention = RITUAL_INTENTIONS.find(i => i.id === intentionId);
                await saveElectiveSynced({
                  label: `${intention?.ruler ?? '?'} — ${intention?.label ?? '?'} — ${targetDateStr} ${targetTimeStr}`,
                  dateStr: targetDateStr,
                  timeStr: targetTimeStr,
                  location: targetLocation,
                  latitude: targetLat,
                  longitude: targetLon,
                  timezone: targetTimezone,
                  intentionId,
                  electiveMode,
                  planetaryDay,
                  score: resolvedScore as 'propitious' | 'neutral' | 'adverse',
                  rulerPlanet: intention?.ruler ?? 'Sun',
                  magicInsight,
                }, user);
                setSavedElectives(await getSavedElectivesSynced(user));
                setSaveToast(true);
                setTimeout(() => setSaveToast(false), 2500);
              }}
              title="Salvar esta eletiva"
              aria-label="Salvar eletiva"
              className="flex items-center gap-2 px-3 py-1.5 bg-gold-500/20 border border-gold-500/30 rounded-lg text-gold-300 hover:bg-gold-500/40 hover:text-white transition-all text-xs font-bold"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar
            </button>
          )}
          <button
            onClick={async () => {
              setSavedElectives(await getSavedElectivesSynced(user));
              setShowSavedDrawer(!showSavedDrawer);
            }}
            title="Eletivas salvas"
            aria-label="Ver eletivas salvas"
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
              showSavedDrawer
                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Salvas
          </button>
        </div>
      </div>

      {/* Save toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-emerald-500/90 backdrop-blur-sm text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Eletiva salva com sucesso!</span>
        </div>
      )}

      {/* Saved Rituals Drawer */}
      {showSavedDrawer && (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Eletivas Salvas ({savedElectives.length})
            </h3>
            <button onClick={() => setShowSavedDrawer(false)} className="p-1 text-slate-500 hover:text-white" aria-label="Fechar painel de eletivas salvas">
              <X className="w-4 h-4" />
            </button>
          </div>
          {savedElectives.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Nenhuma eletiva salva ainda.</p>
          ) : (
            <div className="space-y-1.5 max-h-[240px] overflow-y-auto custom-scrollbar">
              {savedElectives.map((el) => (
                <div key={el.id} className="flex items-center justify-between bg-black/30 rounded-xl p-3 border border-white/5 hover:border-indigo-500/30 transition-colors group">
                  <button
                    onClick={() => {
                      setTargetDateStr(el.dateStr);
                      setTargetTimeStr(el.timeStr);
                      setTargetLocation(el.location);
                      setTargetLat(el.latitude);
                      setTargetLon(el.longitude);
                      setTargetTimezone(el.timezone);
                      setIntentionId(el.intentionId);
                      setElectiveMode(el.electiveMode);
                      if (el.magicInsight) setMagicInsight(el.magicInsight);
                      setIsRealTime(false);
                      setShowSavedDrawer(false);
                      const intention = RITUAL_INTENTIONS.find(i => i.id === el.intentionId);
                      if (intention) setExpandedCategory(intention.category);
                    }}
                    className="flex-1 text-left"
                  >
                    <p className="text-sm text-white font-medium truncate">{el.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(el.savedAt).toLocaleDateString('pt-BR')} • {el.score === 'propitious' ? '✅ Auspicioso' : el.score === 'neutral' ? '⚖️ Neutro' : '⛔ Hostil'}
                    </p>
                  </button>
                  {canPersistElectives && (
                    <button
                      onClick={async () => {
                        await deleteElectiveSynced(el.id, user);
                        setSavedElectives(await getSavedElectivesSynced(user));
                      }}
                      title="Excluir eletiva"
                      aria-label="Excluir eletiva salva"
                      className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coluna Esquerda: Controles e Contexto Cósmico */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* MÁQUINA DO TEMPO */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Máquina do Tempo
              </h3>
              <button 
                onClick={() => setIsRealTime(!isRealTime)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  isRealTime 
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {isRealTime ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {isRealTime ? 'Tempo Real' : 'Tempo Pausado'}
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Data Alvo</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      aria-label="Data Alvo"
                      type="date" 
                      value={targetDateStr}
                      onChange={(e) => {
                        setTargetDateStr(e.target.value);
                        setIsRealTime(false);
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Hora Alvo</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      aria-label="Hora Alvo"
                      type="time" 
                      value={targetTimeStr}
                      onChange={(e) => {
                        setTargetTimeStr(e.target.value);
                        setIsRealTime(false);
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="electiveLocation" className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Localização</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      id="electiveLocation"
                      type="text" 
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onSearchClick())}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="Ex: São Paulo, SP, Brasil"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onSearchClick}
                    disabled={isSearching || searchQuery.length < 3}
                    title="Pesquisar local"
                    aria-label="Pesquisar local"
                    className="px-4 py-2.5 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/40 hover:text-white text-blue-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 disabled:cursor-not-allowed rounded-xl transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Resultados da busca de localização */}
                {showResults && searchResults.length > 0 && createPortal(
                  <div ref={dropdownRef} className="z-[9999] bg-slate-900 border border-blue-500/30 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectLocation(result)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-500/20 transition-colors border-b border-blue-500/10 last:border-0"
                      >
                        <p className="text-sm text-white whitespace-normal break-words leading-snug">{result.display_name}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {result.lat.toFixed(4)}°, {result.lon.toFixed(4)}°
                        </p>
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
              </div>
            </div>
          </div>

          {/* PROPÓSITO RITUALÍSTICO — Frente 1: Categorias Colapsáveis */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-400" />
              Propósito da Obra
            </h3>
            <div className="space-y-1.5">
              {RITUAL_CATEGORIES.map((cat) => {
                const CategoryIcon = {
                  Heart, Coins, Shield, Sword, Brain, Sun: SunIcon
                }[cat.icon] || Sparkles;
                const catIntentions = RITUAL_INTENTIONS.filter(i => i.category === cat.id);
                const isExpanded = expandedCategory === cat.id;
                const hasActiveIntention = catIntentions.some(i => i.id === intentionId);

                return (
                  <div key={cat.id} className="rounded-xl overflow-hidden border border-white/5">
                    {/* Category Header */}
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? '' as RitualCategoryId : cat.id)}
                      className={`w-full flex items-center justify-between p-3 transition-all ${
                        hasActiveIntention
                          ? 'bg-gold-500/10 text-gold-200'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-4 h-4" />
                        <span className="font-semibold text-sm">{cat.label}</span>
                        {hasActiveIntention && (
                          <span className="text-[9px] bg-gold-500/20 text-gold-300 px-1.5 py-0.5 rounded-full">
                            {catIntentions.find(i => i.id === intentionId)?.label}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Intentions List */}
                    {isExpanded && (
                      <div className="bg-black/20 border-t border-white/5">
                        {catIntentions.map((intention) => (
                          <button
                            key={intention.id}
                            onClick={() => {
                              setIntentionId(intention.id);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 transition-all text-left border-b border-white/5 last:border-0 ${
                              intentionId === intention.id
                                ? 'bg-gold-500/10 text-gold-200'
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
                            }`}
                          >
                            <span className="text-sm">{intention.label}</span>
                            {intentionId === intention.id && <Zap className="w-3.5 h-3.5 fill-current text-gold-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CÓDICE DE CORRESPONDÊNCIAS */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Códice Hermético
              </h3>
              <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                Regente: {translatePlanetKeyPt(selectedIntention.ruler)}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Velas / Cores</div>
                  <div className="text-sm text-slate-200">{correspondences.colors.join(', ')}</div>
                </div>
                <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Metal</div>
                  <div className="text-sm text-slate-200">{correspondences.metals.join(', ')}</div>
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Incensos</div>
                <div className="text-sm text-slate-200">{correspondences.incense.join(', ')}</div>
              </div>
              <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Caridade Planetária</div>
                <div className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-gold-500/30 pl-3 py-1">
                  &quot;{correspondences.charity}&quot;
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Coluna Direita: Contexto do Momento e Relatório IA */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* PAINEL DE SÍNTESE ASTROLÓGICA */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Wind className="w-5 h-5 text-cyan-400" />
              Sintonia Celeste
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Dia Planetário</div>
                <div className="text-white font-bold capitalize text-lg">{translatePlanetNamePt(planetaryDay)}</div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase">Governa o período</div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Hora Planetária</div>
                <div className="text-white font-bold capitalize text-lg">{veredict ? translatePlanetNamePt(veredict.planetHour.planetId) : '--'}</div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase">
                  {veredict ? `${veredict.planetHour.hourNumber}ª da ${veredict.planetHour.isDaytime ? 'Luz' : 'Sombra'}` : '--'}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Fase da Lua</div>
                <div className="text-white font-bold text-lg">{veredict?.moonStatus.phase ?? '--'}</div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase">
                  {veredict?.moonStatus?.isVoidOfCourse ? (
                    <span className="text-red-400">Curso Vazio!</span>
                  ) : veredict?.moonStatus?.aspects.length ? (
                    <span className="text-emerald-400">Em curso ativo</span>
                  ) : (
                    <span className="text-amber-400">Curso Vazio não calculado</span>
                  )}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Força do Regente</div>
                <div className={`font-bold text-lg ${(veredict?.rulerCondition.totalScore ?? 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {veredict?.rulerCondition.totalScore ?? '--'} pontos
                </div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase">{translatePlanetKeyPt(selectedIntention.ruler)} em {veredict?.rulerCondition.dignity ?? '--'}</div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border-2 animate-in zoom-in-95 duration-500 ${getScoreColor(resolvedScore)}`}>
              <div className="flex items-center gap-3 mb-2">
                {getScoreIcon(resolvedScore)}
                <span className="font-black uppercase tracking-tighter text-lg">
                  {resolvedScore === 'propitious' ? 'Céu Auspicioso' : resolvedScore === 'neutral' ? 'Céu Neutro' : 'Céu Hostil'}
                </span>
              </div>
              <p className="text-sm opacity-80 leading-tight">
                {resolvedScore === 'propitious'
                  ? 'As emanações celestes estão em harmonia com sua intenção. Prossiga com fé.'
                  : resolvedScore === 'neutral'
                    ? 'O céu não favorece nem impede. A força do magista ditará o resultado.'
                    : 'As estrelas resistem a esta obra. Cautela ou adiamento são recomendados.'}
              </p>
            </div>
            
            <div className="mt-4 p-4 bg-black/20 rounded-2xl border border-white/5">
              <h5 className="text-[10px] text-slate-400 uppercase font-black mb-1 flex items-center gap-2">
                <Moon className="w-3 h-3" /> Mansão Lunar: {veredict ? `${veredict.lunarMansion.number} - ${veredict.lunarMansion.name}` : '--'}
              </h5>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                &quot;{veredict?.lunarMansion.summary ?? 'Aguardando o cálculo do céu do momento.'}&quot;
              </p>
            </div>
          </div>

          {/* O CONSELHO DO MESTRE (IA) — Frente 3: Expanded UI */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Droplets className="w-5 h-5 text-indigo-400" />
                O Conselho do Mestre
              </h3>

              <div className="flex items-center gap-2">
                {magicInsight && !isGenerating && (
                  <>
                    <button
                      onClick={handleCopyInsight}
                      title={isCopied ? 'Copiado!' : 'Copiar texto'}
                      aria-label="Copiar texto do conselho"
                      className="p-1.5 text-slate-500 hover:text-indigo-300 transition-colors rounded-lg hover:bg-white/5"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setIsFullscreen(true)}
                      title="Leitura imersiva"
                      aria-label="Abrir leitura imersiva"
                      className="p-1.5 text-slate-500 hover:text-indigo-300 transition-colors rounded-lg hover:bg-white/5"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <select
                  aria-label="Modo Eletivo"
                  value={electiveMode}
                  onChange={(e) => setElectiveMode(e.target.value as ElectiveMode)}
                  className="bg-black/40 border border-white/10 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="sky_only">Apenas o Céu Eletivo</option>
                  <option value="sky_plus_natal">Céu Eletivo + Mapa Natal</option>
                </select>

                {reportLimitReached ? (
                  <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200 text-[10px] font-bold">
                    Crédito de visitante esgotado.
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateInsight}
                    disabled={isGenerating || isCalculatingSky || !veredict}
                    className="group relative px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-300 font-bold hover:text-white hover:bg-indigo-500/40 transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating || isCalculatingSky ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-xs">{isCalculatingSky ? 'Calculando...' : 'Evocando...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-xs">Consultar Astros</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-red-200 font-medium">{error}</p>
                </div>
              </div>
            )}

            {!magicInsight ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/20 rounded-2xl border border-dashed border-white/10 text-center min-h-[300px]">
                <Sparkles className="w-8 h-8 text-indigo-500/30 mb-4" />
                <p className="text-sm text-slate-400 max-w-md">
                  Clique em &quot;Consultar Astros&quot; para receber o veredito completo da inteligência artificial sobre a operação mágica no tempo e espaço selecionados.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {/* Scroll progress bar */}
                {!isGenerating && scrollProgress > 0 && scrollProgress < 100 && (
                  <div className="h-0.5 bg-black/30 rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-200 w-[var(--progress-width)]"
                      style={{ '--progress-width': `${scrollProgress}%` } as React.CSSProperties}
                    />
                  </div>
                )}
                <div
                  ref={insightScrollRef}
                  onScroll={handleScrollProgress}
                  className={`flex-1 bg-black/30 rounded-2xl border border-indigo-500/20 overflow-y-auto custom-scrollbar shadow-inner ${
                    isFullscreen ? 'p-8 md:p-12' : 'p-6 min-h-[500px]'
                  }`}
                >
                  <div className={`prose prose-invert prose-indigo max-w-none prose-p:leading-relaxed prose-headings:text-indigo-200 prose-strong:text-indigo-100 prose-hr:border-indigo-500/20 ${
                    isFullscreen ? 'prose-base md:prose-lg' : 'prose-sm md:prose-base'
                  }`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {magicInsight}
                    </ReactMarkdown>
                  </div>
                  {isGenerating && (
                    <div className="flex items-center gap-2 text-indigo-400 mt-6 animate-pulse text-[10px] font-bold uppercase tracking-widest border-t border-indigo-500/20 pt-4">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>O Mestre continua a escrever...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen overlay Portal */}
          {isFullscreen && magicInsight && typeof document !== 'undefined' && createPortal(
            <div
              className="fixed inset-0 z-[9998] bg-black/90 backdrop-blur-xl flex flex-col animate-in fade-in duration-300"
              onKeyDown={(e) => e.key === 'Escape' && setIsFullscreen(false)}
              tabIndex={-1}
              ref={(el) => el?.focus()}
            >
              {/* Fullscreen Header */}
              <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-indigo-500/20 bg-slate-950/80">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-indigo-400" />
                  O Conselho do Mestre
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyInsight}
                    title="Copiar texto"
                    aria-label="Copiar texto do conselho"
                    className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsFullscreen(false)}
                    title="Fechar leitura imersiva"
                    aria-label="Fechar leitura imersiva"
                    className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Fullscreen Content */}
              <div className="flex-1 overflow-hidden px-4 md:px-10 py-6">
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-red-200 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col">
                    {/* Scroll progress bar */}
                    {!isGenerating && scrollProgress > 0 && scrollProgress < 100 && (
                      <div className="h-0.5 bg-black/30 rounded-full mb-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-200 w-[var(--progress-width)]"
                          style={{ '--progress-width': `${scrollProgress}%` } as React.CSSProperties}
                        />
                      </div>
                    )}
                    <div
                      ref={insightScrollRef}
                      onScroll={handleScrollProgress}
                      className="flex-1 bg-black/30 rounded-2xl border border-indigo-500/20 overflow-y-auto custom-scrollbar shadow-inner p-8 md:p-12"
                    >
                      <div className="prose prose-invert prose-indigo max-w-none prose-p:leading-relaxed prose-headings:text-indigo-200 prose-strong:text-indigo-100 prose-hr:border-indigo-500/20 prose-base md:prose-lg">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {magicInsight}
                        </ReactMarkdown>
                      </div>
                      {isGenerating && (
                        <div className="flex items-center gap-2 text-indigo-400 mt-6 animate-pulse text-[10px] font-bold uppercase tracking-widest border-t border-indigo-500/20 pt-4">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>O Mestre continua a escrever...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fullscreen Footer */}
              <div className="px-6 md:px-10 py-3 border-t border-indigo-500/10 bg-slate-950/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">{scrollProgress}% lido</span>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Minimize2 className="w-3.5 h-3.5 inline mr-1" />
                  Voltar ao painel
                </button>
              </div>
            </div>,
            document.body
          )}

        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, Languages, RotateCcw, Sparkles } from 'lucide-react';
import GematriaResult from './GematriaResult';
import { calculateGematria } from '@/lib/kabbalah/gematria';
import type { GematriaSystem } from '@/lib/kabbalah/types';
import { requestHebrewTranslation } from '@/lib/kabbalah/translateClient';

interface GematriaCalculatorProps {
  readonly initialInputText?: string;
  readonly initialHebrewText?: string;
  readonly initialActiveSystem?: GematriaSystem;
  readonly initialError?: string | null;
}

function buildGematriaResults(hebrewText: string) {
  const standard = calculateGematria(hebrewText, 'standard');
  const ordinal = calculateGematria(hebrewText, 'ordinal');
  const misparKatan = calculateGematria(hebrewText, 'misparKatan');
  const latin = calculateGematria(hebrewText, 'latin');

  return {
    standard,
    ordinal,
    misparKatan,
    latin,
  } satisfies Record<GematriaSystem, ReturnType<typeof calculateGematria>>;
}

export default function GematriaCalculator({
  initialInputText = '',
  initialHebrewText = '',
  initialActiveSystem = 'standard',
  initialError = null,
}: GematriaCalculatorProps) {
  const [inputText, setInputText] = useState(initialInputText);
  const [hebrewText, setHebrewText] = useState(initialHebrewText);
  const [activeSystem, setActiveSystem] = useState<GematriaSystem>(initialActiveSystem);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [detectedSourceLang, setDetectedSourceLang] = useState<string | null>(null);

  const results = useMemo(() => buildGematriaResults(hebrewText), [hebrewText]);
  const hasHebrewText = hebrewText.trim().length > 0;
  const canTranslate = inputText.trim().length > 0 && !isTranslating;

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Digite um nome antes de traduzir.');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const response = await requestHebrewTranslation(inputText);
      setHebrewText(response.translatedText);
      setDetectedSourceLang(response.detectedSourceLang ?? null);
      setActiveSystem('standard');
    } catch (translateError) {
      const message = translateError instanceof Error
        ? translateError.message
        : 'Não foi possível traduzir automaticamente.';
      setError(message);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setHebrewText('');
    setDetectedSourceLang(null);
    setError(null);
    setActiveSystem('standard');
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[1.75rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 md:p-6 shadow-2xl shadow-black/25">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500 font-bold">Módulo A</p>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-1">
              Gematria do Nome
            </h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Digite o nome em qualquer idioma, traduza para hebraico e ajuste o texto manualmente antes do cálculo.
            </p>
          </div>
          <div className="rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-gold-200">
            Editável
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">
              Nome original
            </span>
            <input
              type="text"
              value={inputText}
              onChange={(event) => {
                setInputText(event.target.value);
                setDetectedSourceLang(null);
              }}
              placeholder="Ex: Leandro"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white placeholder:text-slate-500 focus:border-gold-500/40 focus:outline-none focus:ring-2 focus:ring-gold-500/10"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">
              Hebraico editável
            </span>
            <input
              type="text"
              value={hebrewText}
              onChange={(event) => {
                setHebrewText(event.target.value);
                setError(null);
              }}
              placeholder="Ex: ליאנדרו"
              dir="rtl"
              lang="he"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-lg text-gold-100 placeholder:text-slate-600 focus:border-gold-500/40 focus:outline-none focus:ring-2 focus:ring-gold-500/10"
            />
          </label>

          {detectedSourceLang && (
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
              Idioma detectado: {detectedSourceLang}
            </p>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleTranslate}
              disabled={!canTranslate}
              className="inline-flex items-center gap-2 rounded-2xl border border-gold-500/30 bg-gradient-to-r from-gold-500/20 to-gold-500/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.25em] text-gold-100 transition-all hover:border-gold-400/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
              Traduzir
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.25em] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar
            </button>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm leading-relaxed text-slate-300">
            <div className="flex items-center gap-2 text-gold-200 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="uppercase tracking-[0.25em] text-[10px] font-bold">Fluxo</span>
            </div>
            O texto em hebraico sempre fica editável. A leitura gemátrica usa exatamente o conteúdo atual do campo.
          </div>
        </div>
      </article>

      <div className="min-w-0">
        {hasHebrewText ? (
          <GematriaResult
            results={results}
            activeSystem={activeSystem}
            onSystemChange={setActiveSystem}
          />
        ) : (
          <div className="flex h-full min-h-[24rem] items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-slate-900/40 p-8 text-center">
            <div className="max-w-md">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-gold-500/20 bg-gold-500/10">
                <Sparkles className="h-8 w-8 text-gold-300" />
              </div>
              <h4 className="text-2xl font-bold text-white">Pronto para a tradução</h4>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Converta o nome para hebraico ou digite manualmente o texto para destravar os quatro sistemas de gematria.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

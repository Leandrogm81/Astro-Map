'use client';

import React, { useState } from 'react';
import { Hexagon, Sparkles, Star } from 'lucide-react';
import type { NatalChart } from '@/types';
import GematriaCalculator from './GematriaCalculator';
import SephiroticTree from './SephiroticTree';
import KabbalahPDF from './KabbalahPDF';
import { getZodiacSign, getDomicileRuler } from '@/lib/astrology';

interface KabbalahViewProps {
  readonly chart?: NatalChart | null;
  readonly initialSection?: 'gematria' | 'tree';
}

export default function KabbalahView({
  chart,
  initialSection = 'gematria',
}: KabbalahViewProps) {
  const [activeSection, setActiveSection] = useState<'gematria' | 'tree'>(initialSection);
  const calculatorKey = chart
    ? `${chart.birthData.name}-${chart.birthData.date}-${chart.birthData.time}`
    : 'kabbalah-gematria-empty';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="rounded-[2rem] border border-gold-500/15 bg-gradient-to-br from-slate-950/95 via-slate-900/80 to-slate-900/60 p-5 md:p-7 shadow-2xl shadow-black/25 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute -top-12 right-0 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="absolute -bottom-10 left-8 h-44 w-44 rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-200/80 font-bold">
              Kabbalah Hermética
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-white">
              Gematria + Árvore Sephirótica
            </h2>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-300 max-w-2xl">
              Um núcleo isolado para cálculo gemátrico e projeção sephirótica, com interface dark, gold e glass compatível com o tema Infinity.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Nome em foco</p>
              <p className="mt-1 text-sm text-white font-semibold truncate">
                {chart?.birthData.name ?? 'Sem mapa carregado'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Ascendente</p>
              <p className="mt-1 text-sm text-white font-semibold">
                {chart 
                  ? `${getZodiacSign(chart.ascendant)} (${getDomicileRuler(getZodiacSign(chart.ascendant))})` 
                  : '—'}
              </p>
            </div>
            {chart && (
              <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                <KabbalahPDF chart={chart} />
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="inline-flex flex-wrap gap-2 rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-2">
        <button
          type="button"
          onClick={() => setActiveSection('gematria')}
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold uppercase tracking-[0.25em] transition-all ${
            activeSection === 'gematria'
              ? 'bg-gold-500/20 text-gold-200 border border-gold-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Gematria
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('tree')}
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold uppercase tracking-[0.25em] transition-all ${
            activeSection === 'tree'
              ? 'bg-gold-500/20 text-gold-200 border border-gold-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Hexagon className="w-4 h-4" />
          Árvore
        </button>
      </nav>

      {activeSection === 'gematria' ? (
        <GematriaCalculator
          key={calculatorKey}
          initialInputText={chart?.birthData.name ?? ''}
        />
      ) : (
        <SephiroticTree chart={chart ?? null} />
      )}

      <footer className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-xs md:text-sm leading-relaxed text-slate-400">
        <div className="flex items-start gap-3">
          <Star className="w-4 h-4 text-gold-300 shrink-0 mt-0.5" />
          <p>
            Passe o mouse sobre cada Sephirah para ver as correspondências rituais da Golden Dawn personalizadas pelo seu mapa natal.
          </p>
        </div>
      </footer>
    </div>
  );
}

import type { GematriaResult as GematriaResultType, GematriaSystem } from '@/lib/kabbalah/types';
import { getSephirahDefinition } from '@/lib/kabbalah/sephiroth';
import { ChevronRight, Sparkles } from 'lucide-react';

interface GematriaResultProps {
  readonly results: Record<GematriaSystem, GematriaResultType>;
  readonly activeSystem: GematriaSystem;
  readonly onSystemChange: (system: GematriaSystem) => void;
}

const SYSTEM_META: Record<GematriaSystem, { label: string; description: string; accent: string }> = {
  standard: {
    label: 'Standard',
    description: 'Valores hebraicos clássicos',
    accent: 'from-gold-500/20 to-gold-500/5 border-gold-500/30 text-gold-100',
  },
  ordinal: {
    label: 'Ordinal',
    description: 'Sequência alfabética',
    accent: 'from-sky-500/20 to-sky-500/5 border-sky-400/30 text-sky-100',
  },
  misparKatan: {
    label: 'Mispar Katan',
    description: 'Redução dos valores',
    accent: 'from-emerald-500/20 to-emerald-500/5 border-emerald-400/30 text-emerald-100',
  },
  latin: {
    label: 'Latina',
    description: 'Letra simples A-Z',
    accent: 'from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-400/30 text-fuchsia-100',
  },
};

const SYSTEM_ORDER: GematriaSystem[] = ['standard', 'ordinal', 'misparKatan', 'latin'];

export default function GematriaResult({ results, activeSystem, onSystemChange }: GematriaResultProps) {
  const activeResult = results[activeSystem];
  const sephirah = getSephirahDefinition(activeResult.sephirah);
  const hasBreakdown = activeResult.breakdown.length > 0;

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 md:p-6 shadow-2xl shadow-black/30">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500 font-bold">Resultado</p>
          <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Leitura Gemátrica
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Selecione um sistema e compare as leituras lado a lado.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-gold-200">
          <Sparkles className="w-3.5 h-3.5" />
          Sephirah dominante
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {SYSTEM_ORDER.map((system) => {
          const result = results[system];
          const meta = SYSTEM_META[system];
          const isActive = system === activeSystem;
          const resultSephirah = getSephirahDefinition(result.sephirah);

          return (
            <button
              key={system}
              type="button"
              onClick={() => onSystemChange(system)}
              className={`rounded-2xl border bg-gradient-to-br p-4 text-left transition-all duration-200 ${
                isActive
                  ? `${meta.accent} shadow-lg shadow-black/20 scale-[1.01]`
                  : 'border-white/5 bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/8'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] font-bold">{meta.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{meta.description}</p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />}
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <span className="text-3xl font-black tracking-tight">{result.totalValue}</span>
                <span className="text-[11px] uppercase tracking-[0.25em] text-current/70">
                  {resultSephirah.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 md:p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">
                Sistema selecionado
              </p>
              <h4 className="text-xl md:text-2xl font-bold text-white mt-1">{SYSTEM_META[activeSystem].label}</h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Redução</p>
              <p className="text-3xl md:text-4xl font-black text-gold-300">{activeResult.reducedValue}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-2">Texto original</p>
              <p className="text-base text-slate-100 break-words">{activeResult.inputText}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-2">Hebraico editável</p>
              <p className="text-lg text-gold-100 break-words leading-relaxed" dir="rtl" lang="he">
                {activeResult.hebrewText}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-gold-500/15 bg-gold-500/5 p-4">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold-200">
                {sephirah.name}
              </span>
              <span className="text-sm text-slate-300">{sephirah.meaning}</span>
            </div>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed">{sephirah.description.pt}</p>
            <p className="mt-2 text-xs md:text-sm text-slate-400" dir="rtl" lang="he">
              {sephirah.description.he}
            </p>
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Decomposição</p>
              <h4 className="text-xl font-bold text-white mt-1">Letra por letra</h4>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-300">
              {hasBreakdown ? `${activeResult.breakdown.length} letras` : 'Sem letras reconhecidas'}
            </span>
          </div>

          {hasBreakdown ? (
            <ul className="space-y-2 max-h-[28rem] overflow-auto pr-1 custom-scrollbar">
              {activeResult.breakdown.map((item, index) => (
                <li
                  key={`${item.letter}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <span className="text-lg font-semibold text-white">{item.letter}</span>
                  <span className="text-sm font-bold text-gold-300">{item.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
              O sistema atual não reconheceu letras no texto informado. Tente alternar o sistema ou editar o campo hebraico.
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

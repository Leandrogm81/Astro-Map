'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Edit2, Loader2, Save, Sparkles } from 'lucide-react';
import { createSalmoDiaryEntry, updateSalmoDiaryEntry } from '@/actions/salmos';
import type { SalmoDiaryEntryRow } from '@/lib/salmos/types';

interface DiarioPraticasProps {
  salmoId: string;
  redirectTo: string;
  initialEntries: SalmoDiaryEntryRow[];
  isAuthenticated: boolean;
}

export default function DiarioPraticas({
  salmoId,
  redirectTo,
  initialEntries,
  isAuthenticated,
}: DiarioPraticasProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5 text-gold-400" />
          <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
            Diário de Práticas
          </h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Entre para salvar suas anotações privadas e registrar a prática deste salmo.
        </p>
        <Link
          href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="inline-flex px-4 py-2 bg-gold-500/15 text-gold-300 text-sm font-bold uppercase tracking-widest rounded-xl border border-gold-500/20 hover:bg-gold-500/20 transition-colors"
        >
          Entrar para usar o diário
        </Link>
      </div>
    );
  }

  const submitNewEntry = () => {
    const trimmedDraft = draft.trim();
    if (trimmedDraft === '') {
      setError('Digite uma anotação antes de salvar.');
      return;
    }

    setError('');
    setIsPending(true);
    void (async () => {
      try {
        const created = await createSalmoDiaryEntry({ salmoId, anotacao: trimmedDraft });
        setEntries((current) => [created, ...current]);
        setDraft('');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Não foi possível salvar a anotação.');
      } finally {
        setIsPending(false);
      }
    })();
  };

  const submitEditEntry = (entryId: string) => {
    const trimmedDraft = editingDraft.trim();
    if (trimmedDraft === '') {
      setError('Digite uma anotação antes de salvar.');
      return;
    }

    setError('');
    setIsPending(true);
    void (async () => {
      try {
        const updated = await updateSalmoDiaryEntry({ entryId, anotacao: trimmedDraft });
        setEntries((current) => current.map((entry) => (entry.id === entryId ? updated : entry)));
        setEditingId(null);
        setEditingDraft('');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Não foi possível atualizar a anotação.');
      } finally {
        setIsPending(false);
      }
    })();
  };

  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-5 h-5 text-gold-400" />
        <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
          Diário de Práticas
        </h3>
      </div>

      <div className="space-y-3 mb-6">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Nova anotação
        </label>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          className="w-full rounded-2xl bg-slate-950/80 border border-white/10 text-slate-100 placeholder:text-slate-600 p-4 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
          placeholder="Ex: Acendi uma vela e fiz a oração..."
        />
        {error && (
          <p className="text-sm text-rose-300 border border-rose-500/20 bg-rose-500/10 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={submitNewEntry}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 text-slate-950 text-sm font-bold uppercase tracking-widest hover:bg-gold-400 transition-colors disabled:opacity-70"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar anotação
        </button>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhuma anotação registrada ainda.
          </p>
        ) : (
          entries.map((entry) => {
            const isEditing = editingId === entry.id;

            return (
              <div key={entry.id} className="rounded-2xl border border-white/5 bg-slate-950/70 p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500">
                      {entry.created_at ? new Date(entry.created_at).toLocaleString('pt-BR') : 'Anotação'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setEditingId(entry.id);
                      setEditingDraft(entry.anotacao);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-300 hover:text-gold-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingDraft}
                      onChange={(event) => setEditingDraft(event.target.value)}
                      rows={4}
                      className="w-full rounded-2xl bg-slate-950/80 border border-white/10 text-slate-100 placeholder:text-slate-600 p-4 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => submitEditEntry(entry.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 text-slate-950 text-xs font-bold uppercase tracking-widest hover:bg-gold-400 transition-colors disabled:opacity-70"
                      >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar edição
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditingDraft('');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {entry.anotacao}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-600">
        <Sparkles className="w-3.5 h-3.5" />
        Anotações privadas e associadas a este salmo
      </div>
    </div>
  );
}

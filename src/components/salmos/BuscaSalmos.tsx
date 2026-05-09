'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { searchSalmos } from '@/actions/salmos';
import type { SalmoSearchResult } from '@/lib/salmos/types';

export default function BuscaSalmos() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SalmoSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    setHasSearched(true);
    setErrorMessage('');

    try {
      const data = await searchSalmos(query);
      setResults(data);
    } catch (error) {
      console.error('Failed to search salmos:', error);
      setResults([]);
      setErrorMessage(error instanceof Error ? error.message : 'Não conseguimos analisar sua queixa no momento.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() !== '') {
        performSearch();
      } else {
        setResults([]);
        setHasSearched(false);
        setErrorMessage('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  return (
    <div className="glass rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-500/5 blur-3xl -z-10 rounded-full" />

      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl md:text-2xl font-serif font-bold text-white uppercase tracking-wider">
            Qual sua intenção?
          </h3>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-gold-400 animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-gold-400" />
            )}
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-slate-900/80 border border-gold-500/20 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all text-lg shadow-inner"
            placeholder="Ex: proteção, cura, justiça, amor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {hasSearched && (
          <div className="mt-4 space-y-4">
            {errorMessage && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            {isLoading && results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 animate-pulse">Sintonizando frequências...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((salmo) => (
                  <Link
                    href={`/salmos/${salmo.number}`}
                    key={salmo.id}
                    className="group block p-5 bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 hover:border-gold-500/30 rounded-2xl transition-all hover:shadow-lg hover:shadow-gold-500/5"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-serif font-bold text-white group-hover:text-gold-400 transition-colors">
                        Salmo {salmo.number}
                      </h4>
                      <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-gold-400 transform group-hover:translate-x-1 transition-all" />
                    </div>
                    {salmo.nome_divino && (
                      <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">
                        Nome Divino: {salmo.nome_divino}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {salmo.matched_purposes.slice(0, 3).map((purpose, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white/5 text-slate-300 text-[11px] rounded-md border border-white/10">
                          {purpose}
                        </span>
                      ))}
                      {salmo.matched_purposes.length > 3 && (
                        <span className="px-2 py-1 bg-white/5 text-slate-400 text-[11px] rounded-md border border-white/10">
                          +{salmo.matched_purposes.length - 3}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">Nenhum salmo encontrado para esta intenção.</p>
                <p className="text-sm text-slate-500 mt-2">Tente usar palavras-chave diferentes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

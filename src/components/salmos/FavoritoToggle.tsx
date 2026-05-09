'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { toggleSalmoFavorite } from '@/actions/salmos';

interface FavoritoToggleProps {
  salmoId: string;
  initialIsFavorite: boolean;
  redirectTo: string;
  isAuthenticated: boolean;
}

export default function FavoritoToggle({
  salmoId,
  initialIsFavorite,
  redirectTo,
  isAuthenticated,
}: FavoritoToggleProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, setIsPending] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
        className="px-4 py-2 bg-rose-500/10 text-rose-300 text-sm font-bold uppercase tracking-widest rounded-xl border border-rose-500/20 hover:border-rose-400/40 hover:bg-rose-500/20 transition-colors"
      >
        Entrar para favoritar
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        setIsPending(true);
        void (async () => {
          try {
            const nextState = await toggleSalmoFavorite({
              salmoId,
              isFavorite,
            });
            setIsFavorite(nextState);
          } finally {
            setIsPending(false);
          }
        })();
      }}
      className={`px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-xl border transition-colors flex items-center gap-2 ${
        isFavorite
          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
      } ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      {isFavorite ? 'Favorito' : 'Favoritar'}
    </button>
  );
}

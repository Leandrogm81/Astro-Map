'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Moon, Star, KeyRound, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão ao tentar fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Estrelas de fundo */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse blur-[1px]"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-200 rounded-full animate-pulse delay-75 blur-[1px]"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-gold-200 rounded-full animate-pulse delay-150 blur-[1px]"></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-purple-200 rounded-full animate-pulse delay-300 blur-[1px]"></div>
      </div>
      
      {/* Efeito de brilho de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[100px] z-0 pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4 rounded-2xl overflow-hidden shadow-2xl shadow-gold-500/20 border border-gold-500/30">
            <Image 
              src="/assets/logo-premium.png" 
              alt="AstroMap Logo" 
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-3xl font-serif font-black tracking-tight text-white mb-2">
            Astro<span className="gradient-text-gold">Map</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-gold-500/60 text-center">
            Suíte Astrológica Clássica
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-gold-400" />
            Acesso Restrito
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/30 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 sm:text-sm transition-all"
                  placeholder="Seu usuário"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/30 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <Moon className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold uppercase tracking-wider text-slate-900 bg-gold-400 hover:bg-gold-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
            >
              {loading ? (
                <Star className="w-5 h-5 animate-spin text-slate-900" />
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

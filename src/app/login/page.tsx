'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { AlertCircle, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, Moon, Sparkles, UserPlus } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';

type AuthTab = 'login' | 'recover';

const TAB_LABELS: Record<AuthTab, string> = {
  login: 'Login',
  recover: 'Recuperar',
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useSupabase();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('redirectTo') || '/';
  const isRecover = activeTab === 'recover';

  useEffect(() => {
    if (searchParams.get('error') === 'supabase_not_configured') {
      setError('Supabase nao configurado. Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(redirectTo);
    });
  }, [redirectTo, router, supabase]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Supabase nao configurado. Configure as variaveis de ambiente e reinicie o servidor.');
      return;
    }

    if (!email) {
      setError('Informe seu email.');
      return;
    }

    if (!isRecover && password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.replace(redirectTo);
        router.refresh();
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (resetError) throw resetError;
      setMessage('Enviamos as instrucoes de recuperacao para o seu email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel concluir a autenticacao.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse blur-[1px]" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-200 rounded-full animate-pulse delay-75 blur-[1px]" />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-gold-200 rounded-full animate-pulse delay-150 blur-[1px]" />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-purple-200 rounded-full animate-pulse delay-300 blur-[1px]" />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[100px] z-0 pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4 rounded-2xl overflow-hidden shadow-2xl shadow-gold-500/20 border border-gold-500/30">
            <Image src="/assets/logo-premium.png" alt="AstroMap Logo" fill className="object-cover" />
          </div>
          <h1 className="text-3xl font-serif font-black tracking-tight text-white mb-2">
            Astro<span className="gradient-text-gold">Map</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-gold-500/60 text-center">
            Suite Astrologica Classica
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/50">
          <div className="grid grid-cols-3 gap-1 p-1 mb-6 bg-black/30 border border-white/10 rounded-xl">
            {(Object.keys(TAB_LABELS) as AuthTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setError('');
                  setMessage('');
                }}
                className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab ? 'bg-gold-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
            {activeTab === 'login' ? <KeyRound className="w-5 h-5 text-gold-400" /> : <UserPlus className="w-5 h-5 text-gold-400" />}
            {activeTab === 'login' ? 'Acesso ao Sistema' : 'Recuperar Senha'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/30 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 sm:text-sm transition-all"
                  placeholder="voce@email.com"
                  id="email"
                  name="email"
                  autoComplete="email"
                />
              </div>
            </div>

            {!isRecover && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-xl bg-black/30 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 sm:text-sm transition-all"
                    placeholder="••••••••"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-gold-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <Sparkles className="w-4 h-4" />
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold uppercase tracking-wider text-slate-900 bg-gold-400 hover:bg-gold-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-900" /> : <Moon className="w-4 h-4 text-slate-900" />}
              {activeTab === 'login' ? 'Entrar' : 'Enviar Link'}
            </button>

            {activeTab === 'login' && (
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  setError('');
                  try {
                    const { error: demoError } = await supabase!.auth.signInWithPassword({
                      email: 'demo@astromap.com',
                      password: 'demo123'
                    });
                    if (demoError) throw demoError;
                    router.replace(redirectTo);
                    router.refresh();
                  } catch {
                    setError('Erro ao acessar demonstração. Verifique se o usuário demo@astromap.com existe.');
                    setLoading(false);
                  }
                }}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:bg-white/5 hover:text-white transition-all mt-2"
              >
                <Sparkles className="w-3 h-3 text-gold-500/50" />
                Ver Demonstração
              </button>
            )}

            <p className="text-[10px] text-center text-slate-500 mt-4 leading-relaxed">
              Acesso exclusivo por email e senha. O modo visitante foi removido.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-950" />}>
      <LoginPageContent />
    </Suspense>
  );
}

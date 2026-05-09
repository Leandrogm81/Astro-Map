import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Droplets, BookOpen } from 'lucide-react';
import FavoritoToggle from '@/components/salmos/FavoritoToggle';
import DiarioPraticas from '@/components/salmos/DiarioPraticas';
import { SALMO_BASE_SELECT } from '@/lib/salmos/queries';
import type {
  SalmoCondicaoAstroRow,
  SalmoDiaryEntryRow,
  SalmoElementoRow,
  SalmoFonteRow,
  SalmoPropositoRow,
  SalmoRow,
} from '@/lib/salmos/types';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const number = Number.parseInt(id, 10);

  return {
    title: `Salmo ${number} - AstroMap`,
    description: `Detalhes e práticas do Salmo ${number}`,
  };
}

export default async function SalmoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const number = Number.parseInt(id, 10);

  if (!Number.isInteger(number) || number < 1 || number > 150) {
    notFound();
  }

  const { data: salmoData, error } = await supabase
    .from('salmos')
    .select(SALMO_BASE_SELECT)
    .eq('number', number)
    .maybeSingle();

  const salmo = salmoData as SalmoRow | null;

  if (error || !salmo) {
    notFound();
  }

  const [
    { data: propositosData },
    { data: elementosData },
    { data: fontesData },
    { data: condicoesData },
  ] = await Promise.all([
    supabase.from('salmos_propositos').select('*').eq('salmo_id', salmo.id).order('id', { ascending: true }),
    supabase.from('salmos_elementos').select('*').eq('salmo_id', salmo.id).order('id', { ascending: true }),
    supabase.from('salmos_fontes').select('*').eq('salmo_id', salmo.id).order('id', { ascending: true }),
    supabase.from('salmos_condicoes_astro').select('*').eq('salmo_id', salmo.id).order('id', { ascending: true }),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let diaryEntries: SalmoDiaryEntryRow[] = [];
  let isFavorite = false;

  if (user) {
    const { data: favoriteData } = await supabase
      .from('user_salmos_favoritos')
      .select('*')
      .eq('user_id', user.id)
      .eq('salmo_id', salmo.id)
      .maybeSingle();

    const { data: diaryData } = await supabase
      .from('salmos_diario')
      .select('*')
      .eq('user_id', user.id)
      .eq('salmo_id', salmo.id)
      .order('created_at', { ascending: false });

    diaryEntries = (diaryData ?? []) as SalmoDiaryEntryRow[];
    isFavorite = Boolean(favoriteData);
  }

  const propositos = (propositosData ?? []) as SalmoPropositoRow[];
  const elementos = (elementosData ?? []) as SalmoElementoRow[];
  const fontes = (fontesData ?? []) as SalmoFonteRow[];
  const condicoes = (condicoesData ?? []) as SalmoCondicaoAstroRow[];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      <header className="border-b border-gold-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/salmos" className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-900 rounded-full border border-white/5 hover:border-gold-500/30">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-serif font-black tracking-tight text-white flex items-center gap-2">
                Salmo <span className="gradient-text-gold">{salmo.number}</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold-500/60">
                {salmo.nome_divino || 'Oração Ancestral'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-3xl p-8 border border-gold-500/30 shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 relative z-10 leading-tight">
            Salmo {salmo.number}
          </h2>

          <div className="flex flex-wrap gap-3 mt-6 relative z-10">
            {salmo.nome_divino && (
              <div className="px-4 py-2 bg-purple-500/10 text-purple-300 text-sm font-bold uppercase tracking-widest rounded-xl border border-purple-500/30 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Nome Divino: {salmo.nome_divino}
              </div>
            )}
            <div className="px-4 py-2 bg-slate-800/80 text-gold-400 text-sm font-bold rounded-xl border border-gold-500/20">
              Páginas {salmo.page_start ?? '?'}-{salmo.page_end ?? '?'}
            </div>
            <FavoritoToggle
              salmoId={salmo.id}
              initialIsFavorite={isFavorite}
              redirectTo={`/salmos/${number}`}
              isAuthenticated={Boolean(user)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {propositos.length > 0 && (
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-5 h-5 text-gold-400" />
                <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                  Propósitos e Virtudes
                </h3>
              </div>
              <ul className="space-y-4">
                {propositos.map((prop) => (
                  <li key={prop.id} className="flex flex-col gap-1">
                    <span className="text-slate-200 font-medium">{prop.nome}</span>
                    {prop.evidencia && (
                      <span className="text-xs text-slate-500 italic pl-4 border-l border-slate-800">
                        &quot;{prop.evidencia}&quot;
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-8">
            {(elementos.length > 0 || condicoes.length > 0) && (
              <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wider">
                    Conexão Astral
                  </h3>
                </div>

                {elementos.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Elementos</h4>
                    <div className="flex flex-wrap gap-2">
                      {elementos.map((el) => (
                        <div key={el.id} className="px-3 py-1.5 bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-widest rounded-lg border border-blue-500/20 flex items-center gap-2">
                          <Droplets className="w-3.5 h-3.5" />
                          {el.nome}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {condicoes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Condições Favoráveis</h4>
                    <ul className="space-y-2">
                      {condicoes.map((cond) => (
                        <li key={cond.id} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-gold-500 mt-0.5">•</span>
                          {cond.descricao}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {fontes.length > 0 && (
              <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                  Referências Bibliográficas
                </h3>
                <ul className="space-y-2">
                  {fontes.map((fonte) => (
                    <li key={fonte.id} className="text-sm text-slate-400">
                      {fonte.nome_fonte}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <DiarioPraticas
              salmoId={salmo.id}
              redirectTo={`/salmos/${number}`}
              initialEntries={diaryEntries}
              isAuthenticated={Boolean(user)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

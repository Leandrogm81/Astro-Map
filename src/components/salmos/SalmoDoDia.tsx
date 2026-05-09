import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Sun, Star, Droplets } from 'lucide-react';
import { getPlanetOfTheDay, selectDailySalmo } from '@/lib/salmos/daily';
import { SALMO_BASE_SELECT } from '@/lib/salmos/queries';
import type { SalmoCondicaoAstroRow, SalmoElementoRow, SalmoFonteRow, SalmoPropositoRow, SalmoRow } from '@/lib/salmos/types';

function DailySalmoFallback({ message }: { message: string }) {
  return (
    <div className="glass rounded-3xl p-8 border border-white/5 shadow-2xl">
      <p className="text-slate-400">{message}</p>
    </div>
  );
}

export default async function SalmoDoDia() {
  const supabase = await createClient();
  const planetOfTheDay = getPlanetOfTheDay();

  const { data } = await supabase
    .from('salmos')
    .select(SALMO_BASE_SELECT)
    .order('number', { ascending: true });

  if (!data || data.length === 0) {
    return <DailySalmoFallback message="Nao foi possivel carregar o Salmo do Dia no momento." />;
  }

  const salmo = selectDailySalmo(data as SalmoRow[], new Date());

  if (!salmo) {
    return <DailySalmoFallback message="Nao encontramos um salmo disponivel para o regente de hoje." />;
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

  const propositos = (propositosData ?? []) as SalmoPropositoRow[];
  const elementos = (elementosData ?? []) as SalmoElementoRow[];
  const fontes = (fontesData ?? []) as SalmoFonteRow[];
  const condicoes = (condicoesData ?? []) as SalmoCondicaoAstroRow[];

  return (
    <div className="glass rounded-3xl p-8 border border-gold-500/30 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-gold-500/10 transition-colors" />

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <Sun className="w-6 h-6 text-gold-400" />
        <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-wider">
          Salmo do Dia
        </h3>
        <span className="px-3 py-1 bg-white/5 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-full border border-white/10">
          {planetOfTheDay}
        </span>
        <span className="ml-auto px-3 py-1 bg-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest rounded-full border border-gold-500/30">
          Salmo {salmo.number}
        </span>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="flex flex-wrap gap-2">
          {elementos.map((el) => (
            <div key={el.id} className="px-3 py-1.5 bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-widest rounded-lg border border-blue-500/20 flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5" />
              Elemento: {el.nome}
            </div>
          ))}
          {salmo.nome_divino && (
            <div className="px-3 py-1.5 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-widest rounded-lg border border-purple-500/20 flex items-center gap-2">
              <Star className="w-3.5 h-3.5" />
              Nome Divino: {salmo.nome_divino}
            </div>
          )}
        </div>

        {propositos.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Propositos Principais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {propositos.map((prop) => (
                <div key={prop.id} className="p-3 bg-slate-900/50 border border-white/5 rounded-xl">
                  <p className="text-slate-200 font-medium">{prop.nome}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {condicoes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Condicoes Astrologicas Favoraveis
            </h4>
            <div className="flex flex-wrap gap-2">
              {condicoes.map((cond) => (
                <div key={cond.id} className="px-3 py-1.5 bg-white/5 text-slate-300 text-xs rounded-lg border border-white/10">
                  {cond.descricao}
                </div>
              ))}
            </div>
          </div>
        )}

        {fontes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Fontes
            </h4>
            <div className="flex flex-wrap gap-2">
              {fontes.map((item) => (
                <div key={item.id} className="px-3 py-1.5 bg-white/5 text-slate-300 text-xs rounded-lg border border-white/10">
                  {item.nome_fonte}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

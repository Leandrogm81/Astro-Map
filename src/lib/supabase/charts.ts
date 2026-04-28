import type { User } from '@supabase/supabase-js';
import type { NatalChart, SavedChart } from '@/types';
import { createClient } from './client';
import type { Json } from './database.types';
import { hasSupabaseEnv } from './config';

type DbResult = { data: unknown; error: Error | null };
type QueryBuilder = PromiseLike<DbResult> & {
  delete: () => QueryBuilder;
  eq: (column: string, value: unknown) => QueryBuilder;
  insert: (value: unknown) => QueryBuilder;
  order: (column: string, options?: unknown) => QueryBuilder;
  select: (columns?: string) => QueryBuilder;
  single: () => Promise<DbResult>;
  update: (value: unknown) => QueryBuilder;
};
type SupabaseCrudClient = { from: (table: string) => QueryBuilder };

function chartToRow(name: string, chart: NatalChart, profileId: string) {
  return {
    profile_id: profileId,
    name,
    birth_data: chart.birthData as unknown as Json,
    planets: chart.planets as unknown as Json,
    houses: {
      placidus: chart.housesPlacidus,
      whole: chart.housesWhole,
    } as unknown as Json,
    aspects: chart.aspects as unknown as Json,
    ascendant: chart.ascendant,
    mc: chart.mc,
    lots: (chart.lots ?? null) as unknown as Json | null,
    traditional_points: (chart.traditionalPoints ?? null) as unknown as Json | null,
    traditional_assessments: (chart.traditionalAssessments ?? null) as unknown as Json | null,
    is_day_chart: chart.isDayChart ?? null,
    prenatal_syzygy: chart.prenatalSyzygy ?? null,
  };
}

function rowToSavedChart(row: {
  id: string;
  name: string;
  birth_data: Json;
  planets: Json;
  houses: Json;
  aspects: Json;
  ascendant: number | null;
  mc: number | null;
  lots: Json | null;
  traditional_points: Json | null;
  traditional_assessments: Json | null;
  is_day_chart: boolean | null;
  prenatal_syzygy: number | null;
  created_at: string | null;
}): SavedChart {
  const houses = row.houses as { placidus?: unknown; whole?: unknown };
  const chart = {
    birthData: row.birth_data,
    planets: row.planets,
    housesPlacidus: houses.placidus ?? [],
    housesWhole: houses.whole ?? [],
    aspects: row.aspects,
    ascendant: row.ascendant ?? 0,
    mc: row.mc ?? 0,
    lots: row.lots ?? undefined,
    traditionalPoints: row.traditional_points ?? undefined,
    traditionalAssessments: row.traditional_assessments ?? undefined,
    isDayChart: row.is_day_chart ?? undefined,
    prenatalSyzygy: row.prenatal_syzygy ?? undefined,
  } as unknown as NatalChart;

  return {
    id: row.id,
    name: row.name,
    birthData: chart.birthData,
    chart,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export async function listRemoteCharts(user: User | null): Promise<SavedChart[]> {
  if (!user || !hasSupabaseEnv()) return [];

  const supabase = createClient() as unknown as SupabaseCrudClient;
  const { data, error } = await supabase
    .from('charts')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as Parameters<typeof rowToSavedChart>[0][]).map(rowToSavedChart);
}

export async function saveRemoteChart(name: string, chart: NatalChart, user: User | null): Promise<SavedChart | null> {
  if (!user || !hasSupabaseEnv()) return null;

  const supabase = createClient() as unknown as SupabaseCrudClient;
  const { data, error } = await supabase
    .from('charts')
    .insert(chartToRow(name, chart, user.id))
    .select('*')
    .single();

  if (error) throw error;
  return data ? rowToSavedChart(data as Parameters<typeof rowToSavedChart>[0]) : null;
}

export async function updateRemoteChart(id: string, name: string, chart: NatalChart, user: User | null): Promise<SavedChart | null> {
  if (!user || !hasSupabaseEnv()) return null;

  const supabase = createClient() as unknown as SupabaseCrudClient;
  const { data, error } = await supabase
    .from('charts')
    .update(chartToRow(name, chart, user.id))
    .eq('id', id)
    .eq('profile_id', user.id)
    .select('*')
    .single();

  if (error) throw error;
  return data ? rowToSavedChart(data as Parameters<typeof rowToSavedChart>[0]) : null;
}

export async function deleteRemoteChart(id: string, user: User | null): Promise<boolean> {
  if (!user || !hasSupabaseEnv()) return false;

  const supabase = createClient() as unknown as SupabaseCrudClient;
  const { error } = await supabase.from('charts').delete().eq('id', id).eq('profile_id', user.id);
  if (error) throw error;
  return true;
}

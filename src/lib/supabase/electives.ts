import type { User } from '@supabase/supabase-js';
import type { SavedElective } from '@/lib/storage';
import { createClient } from './client';
import { hasSupabaseEnv } from './config';

type DbResult = { data: unknown; error: Error | null };
type QueryBuilder = PromiseLike<DbResult> & {
  delete: () => QueryBuilder;
  eq: (column: string, value: unknown) => QueryBuilder;
  insert: (value: unknown) => QueryBuilder;
  order: (column: string, options?: unknown) => QueryBuilder;
  select: (columns?: string) => QueryBuilder;
  single: () => Promise<DbResult>;
};
type SupabaseCrudClient = { from: (table: string) => QueryBuilder };
type ElectiveRow = {
  id: string;
  created_at: string | null;
  label: string;
  date_str: string;
  time_str: string;
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  intention_id: string;
  elective_mode: SavedElective['electiveMode'];
  planetary_day: string;
  score: SavedElective['score'];
  ruler_planet: string;
  magic_insight: string | null;
};

export async function listRemoteElectives(user: User | null): Promise<SavedElective[]> {
  if (!user || !hasSupabaseEnv()) return [];

  const supabase = createClient() as unknown as SupabaseCrudClient;
  const { data, error } = await supabase
    .from('electives')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as ElectiveRow[]).map((row) => ({
    id: row.id,
    savedAt: row.created_at ?? new Date().toISOString(),
    label: row.label,
    dateStr: row.date_str,
    timeStr: row.time_str,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    timezone: row.timezone,
    intentionId: row.intention_id,
    electiveMode: row.elective_mode,
    planetaryDay: row.planetary_day,
    score: row.score,
    rulerPlanet: row.ruler_planet as SavedElective['rulerPlanet'],
    magicInsight: row.magic_insight,
  }));
}

export async function saveRemoteElective(
  elective: Omit<SavedElective, 'id' | 'savedAt'>,
  user: User | null
): Promise<{ id: string; created_at: string | null } | null> {
  if (!user || !hasSupabaseEnv()) return null;

  const supabase = createClient() as unknown as SupabaseCrudClient;
  const { data, error } = await supabase
    .from('electives')
    .insert({
      profile_id: user.id,
      label: elective.label,
      date_str: elective.dateStr,
      time_str: elective.timeStr,
      location: elective.location,
      latitude: elective.latitude,
      longitude: elective.longitude,
      timezone: elective.timezone,
      intention_id: elective.intentionId,
      elective_mode: elective.electiveMode,
      planetary_day: elective.planetaryDay,
      score: elective.score,
      ruler_planet: elective.rulerPlanet,
      magic_insight: elective.magicInsight,
    })
    .select('*')
    .single();

  if (error) throw error;
  const row = data as { id: string; created_at: string | null } | null;
  return row ? { id: row.id, created_at: row.created_at } : null;
}

export async function deleteRemoteElective(id: string, user: User | null): Promise<boolean> {
  if (!user || !hasSupabaseEnv()) return false;

  const supabase = createClient() as unknown as SupabaseCrudClient;
  const { error } = await supabase.from('electives').delete().eq('id', id).eq('profile_id', user.id);
  if (error) throw error;
  return true;
}

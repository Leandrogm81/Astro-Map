import type { User } from '@supabase/supabase-js';
import { createClient } from './client';
import { hasSupabaseEnv } from './config';

export type ReportType = 'natal' | 'traditional' | 'solar' | 'elective';
type DbResult = { data: unknown; error: Error | null };
type QueryBuilder = {
  insert: (value: unknown) => QueryBuilder;
  select: (columns?: string) => QueryBuilder;
  single: () => Promise<DbResult>;
};
type SupabaseCrudClient = { from: (table: string) => QueryBuilder };

export async function saveRemoteReport(params: {
  user: User | null;
  chartId: string | null;
  type: ReportType;
  content: string;
  modelId?: string | null;
}) {
  if (!params.user || !params.chartId || !hasSupabaseEnv()) return null;

  const supabase = createClient() as unknown as SupabaseCrudClient;
  const { data, error } = await supabase
    .from('ai_reports')
    .insert({
      profile_id: params.user.id,
      chart_id: params.chartId,
      type: params.type,
      content: params.content,
      model_id: params.modelId ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

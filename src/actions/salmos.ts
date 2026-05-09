'use server';

import { createClient } from '@/lib/supabase/server';
import { SALMO_BASE_SELECT } from '@/lib/salmos/queries';
import {
  buildSearchResult,
  extractSalmoNumber,
  findLocalSalmoResults,
  normalizeSalmoQuery,
} from '@/lib/salmos/search';
import {
  searchSalmosWithOpenRouter,
  SalmosAiSearchError,
  SALMOS_AI_FALLBACK_MESSAGE,
} from '@/lib/salmos/openrouter';
import type {
  SalmoDetailRow,
  SalmoDiaryEntryRow,
  SalmoFavoriteRow,
  SalmoRow,
  SalmoSearchResult,
} from '@/lib/salmos/types';

function attachEmptyRelations(row: {
  id: string;
  number: number;
  nome_divino: string | null;
  page_start: string | null;
  page_end: string | null;
}): SalmoDetailRow {
  return {
    ...row,
    salmos_propositos: [],
    salmos_elementos: [],
    salmos_fontes: [],
    salmos_condicoes_astro: [],
  };
}

function groupBySalmoId<T extends { salmo_id: string }>(rows: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const current = grouped.get(row.salmo_id) ?? [];
    current.push(row);
    grouped.set(row.salmo_id, current);
  }
  return grouped;
}

async function fetchSalmoRelationsById(
  supabase: Awaited<ReturnType<typeof createClient>>,
  salmoId: string
): Promise<Pick<SalmoDetailRow, 'salmos_propositos' | 'salmos_elementos' | 'salmos_fontes' | 'salmos_condicoes_astro'> | null> {
  const [
    { data: propositosData, error: propositosError },
    { data: elementosData, error: elementosError },
    { data: fontesData, error: fontesError },
    { data: condicoesData, error: condicoesError },
  ] = await Promise.all([
    supabase.from('salmos_propositos').select('*').eq('salmo_id', salmoId).order('id', { ascending: true }),
    supabase.from('salmos_elementos').select('*').eq('salmo_id', salmoId).order('id', { ascending: true }),
    supabase.from('salmos_fontes').select('*').eq('salmo_id', salmoId).order('id', { ascending: true }),
    supabase.from('salmos_condicoes_astro').select('*').eq('salmo_id', salmoId).order('id', { ascending: true }),
  ]);

  if (propositosError || elementosError || fontesError || condicoesError) {
    return null;
  }

  return {
    salmos_propositos: (propositosData ?? []) as SalmoDetailRow['salmos_propositos'],
    salmos_elementos: (elementosData ?? []) as SalmoDetailRow['salmos_elementos'],
    salmos_fontes: (fontesData ?? []) as SalmoDetailRow['salmos_fontes'],
    salmos_condicoes_astro: (condicoesData ?? []) as SalmoDetailRow['salmos_condicoes_astro'],
  };
}

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Voce precisa entrar para salvar favoritos ou diario.');
  }

  return { supabase, userId: user.id };
}

async function fetchSalmosCatalog(): Promise<SalmoDetailRow[]> {
  const supabase = await createClient();
  const [{ data: salmosData, error: salmosError }, { data: propositosData, error: propositosError }] = await Promise.all([
    supabase.from('salmos').select(SALMO_BASE_SELECT).order('number', { ascending: true }),
    supabase.from('salmos_propositos').select('*').order('id', { ascending: true }),
  ]);

  if (salmosError) {
    throw salmosError;
  }

  if (propositosError) {
    throw propositosError;
  }

  const propositosBySalmoId = groupBySalmoId((propositosData ?? []) as SalmoDetailRow['salmos_propositos']);
  return ((salmosData ?? []) as SalmoRow[]).map((row) => ({
    ...attachEmptyRelations(row),
    salmos_propositos: propositosBySalmoId.get(row.id) ?? [],
  }));
}

async function fetchSalmoByNumber(number: number): Promise<SalmoDetailRow | null> {
  const supabase = await createClient();
  const { data: salmoData, error: salmoError } = await supabase
    .from('salmos')
    .select(SALMO_BASE_SELECT)
    .eq('number', number)
    .maybeSingle();

  if (salmoError || !salmoData) {
    return null;
  }

  const salmo = salmoData as SalmoRow;
  const relations = await fetchSalmoRelationsById(supabase, salmo.id);
  if (!relations) {
    return null;
  }

  return {
    ...salmo,
    ...relations,
  };
}

async function fetchFavoriteState(salmoId: string): Promise<SalmoFavoriteRow | null> {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from('user_salmos_favoritos')
    .select('*')
    .eq('user_id', userId)
    .eq('salmo_id', salmoId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as SalmoFavoriteRow;
}

async function fetchDiaryEntries(salmoId: string): Promise<SalmoDiaryEntryRow[]> {
  const { supabase, userId } = await requireUserId();
  const { data, error } = await supabase
    .from('salmos_diario')
    .select('*')
    .eq('user_id', userId)
    .eq('salmo_id', salmoId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as SalmoDiaryEntryRow[];
}

export async function getSalmoDetailByNumber(number: number): Promise<SalmoDetailRow | null> {
  if (!Number.isInteger(number) || number < 1 || number > 150) {
    return null;
  }

  return fetchSalmoByNumber(number);
}

export async function getSalmoFavoriteById(salmoId: string): Promise<SalmoFavoriteRow | null> {
  try {
    return await fetchFavoriteState(salmoId);
  } catch {
    return null;
  }
}

export async function getSalmoDiaryById(salmoId: string): Promise<SalmoDiaryEntryRow[]> {
  try {
    return await fetchDiaryEntries(salmoId);
  } catch {
    return [];
  }
}

export async function searchSalmos(query: string): Promise<SalmoSearchResult[]> {
  const normalizedQuery = normalizeSalmoQuery(query);

  if (normalizedQuery === '') {
    return [];
  }

  const catalog = await fetchSalmosCatalog();
  const localResults = findLocalSalmoResults(catalog, normalizedQuery);
  const numericQuery = extractSalmoNumber(normalizedQuery);

  if (numericQuery !== null) {
    return localResults;
  }

  if (localResults.length >= 3) {
    return localResults.slice(0, 3);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return localResults;
  }

  try {
    const aiNumbers = await searchSalmosWithOpenRouter(normalizedQuery, apiKey, 8000);
    const catalogByNumber = new Map(catalog.map((row) => [row.number, row] as const));
    const aiResults = aiNumbers
      .map((number) => catalogByNumber.get(number))
      .filter((row): row is SalmoDetailRow => Boolean(row))
      .map((row) => buildSearchResult(row, normalizedQuery));

    const mergedResults = [...localResults, ...aiResults];
    const dedupedResults = mergedResults.filter((result, index, array) => (
      array.findIndex((item) => item.id === result.id) === index
    ));

    return dedupedResults.sort((left, right) => left.number - right.number).slice(0, 3);
  } catch (error) {
    if (localResults.length > 0) {
      return localResults;
    }

    if (error instanceof SalmosAiSearchError) {
      return [];
    }

    throw new Error(SALMOS_AI_FALLBACK_MESSAGE);
  }
}

export async function toggleSalmoFavorite(params: {
  salmoId: string;
  isFavorite: boolean;
}): Promise<boolean> {
  const { supabase, userId } = await requireUserId();

  if (params.isFavorite) {
    const { error } = await supabase
      .from('user_salmos_favoritos')
      .delete()
      .eq('user_id', userId)
      .eq('salmo_id', params.salmoId);

    if (error) {
      throw error;
    }

    return false;
  }

  const { error } = await supabase.from('user_salmos_favoritos').upsert(
    {
      user_id: userId,
      salmo_id: params.salmoId,
    } as never,
    {
      onConflict: 'user_id,salmo_id',
    }
  );

  if (error) {
    throw error;
  }

  return true;
}

export async function createSalmoDiaryEntry(params: {
  salmoId: string;
  anotacao: string;
}): Promise<SalmoDiaryEntryRow> {
  const anotacao = params.anotacao.trim();
  if (anotacao === '') {
    throw new Error('Digite uma anotacao antes de salvar.');
  }

  const { supabase, userId } = await requireUserId();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('salmos_diario')
    .insert({
      user_id: userId,
      salmo_id: params.salmoId,
      anotacao,
      data_pratica: now,
      created_at: now,
      updated_at: now,
    } as never)
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Nao foi possivel salvar a anotacao.');
  }

  return data as SalmoDiaryEntryRow;
}

export async function updateSalmoDiaryEntry(params: {
  entryId: string;
  anotacao: string;
}): Promise<SalmoDiaryEntryRow> {
  const anotacao = params.anotacao.trim();
  if (anotacao === '') {
    throw new Error('Digite uma anotacao antes de salvar.');
  }

  const { supabase } = await requireUserId();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('salmos_diario')
    .update({
      anotacao,
      updated_at: now,
    } as never)
    .eq('id', params.entryId)
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Nao foi possivel atualizar a anotacao.');
  }

  return data as SalmoDiaryEntryRow;
}

export async function getSalmoFavoriteStateById(salmoId: string): Promise<boolean> {
  const favorite = await getSalmoFavoriteById(salmoId);
  return Boolean(favorite);
}

export async function getSalmoDiaryEntriesById(salmoId: string): Promise<SalmoDiaryEntryRow[]> {
  return getSalmoDiaryById(salmoId);
}

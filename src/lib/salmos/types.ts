export interface SalmoRow {
  id: string;
  number: number;
  nome_divino: string | null;
  page_start: string | null;
  page_end: string | null;
}

export interface SalmoPropositoRow {
  id: string;
  salmo_id: string;
  nome: string;
  evidencia: string | null;
}

export interface SalmoElementoRow {
  id: string;
  salmo_id: string;
  nome: string;
}

export interface SalmoFonteRow {
  id: string;
  salmo_id: string;
  nome_fonte: string;
}

export interface SalmoCondicaoAstroRow {
  id: string;
  salmo_id: string;
  descricao: string;
}

export interface SalmoDetailRow extends SalmoRow {
  salmos_propositos: SalmoPropositoRow[];
  salmos_elementos: SalmoElementoRow[];
  salmos_fontes: SalmoFonteRow[];
  salmos_condicoes_astro: SalmoCondicaoAstroRow[];
}

export interface SalmoSearchResult {
  id: string;
  number: number;
  title: string;
  nome_divino: string | null;
  matched_purposes: string[];
}

export interface SalmoDiaryEntryRow {
  id: string;
  user_id: string;
  salmo_id: string;
  anotacao: string;
  data_pratica: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SalmoFavoriteRow {
  id: string;
  user_id: string;
  salmo_id: string;
  created_at: string | null;
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'user' | 'admin';
          tier: 'free' | 'standard' | 'premium' | 'admin' | 'blocked';
          is_suspended: boolean;
          is_demo: boolean;
          ai_reports_limit: number;
          ai_reports_used: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'user' | 'admin';
          tier?: 'free' | 'standard' | 'premium' | 'admin' | 'blocked';
          is_suspended?: boolean;
          is_demo?: boolean;
          ai_reports_limit?: number;
          ai_reports_used?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'user' | 'admin';
          tier?: 'free' | 'standard' | 'premium' | 'admin' | 'blocked';
          is_suspended?: boolean;
          is_demo?: boolean;
          ai_reports_limit?: number;
          ai_reports_used?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      charts: {
        Row: {
          id: string;
          profile_id: string;
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
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          birth_data: Json;
          planets: Json;
          houses: Json;
          aspects: Json;
          ascendant?: number | null;
          mc?: number | null;
          lots?: Json | null;
          traditional_points?: Json | null;
          traditional_assessments?: Json | null;
          is_day_chart?: boolean | null;
          prenatal_syzygy?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          birth_data?: Json;
          planets?: Json;
          houses?: Json;
          aspects?: Json;
          ascendant?: number | null;
          mc?: number | null;
          lots?: Json | null;
          traditional_points?: Json | null;
          traditional_assessments?: Json | null;
          is_day_chart?: boolean | null;
          prenatal_syzygy?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      ai_reports: {
        Row: {
          id: string;
          profile_id: string;
          chart_id: string;
          type: 'natal' | 'traditional' | 'solar' | 'elective';
          content: string;
          model_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          chart_id: string;
          type: 'natal' | 'traditional' | 'solar' | 'elective';
          content: string;
          model_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          chart_id?: string;
          type?: 'natal' | 'traditional' | 'solar' | 'elective';
          content?: string;
          model_id?: string | null;
          created_at?: string | null;
        };
      };
      electives: {
        Row: {
          id: string;
          profile_id: string;
          label: string;
          date_str: string;
          time_str: string;
          location: string;
          latitude: number;
          longitude: number;
          timezone: string;
          intention_id: string;
          elective_mode: 'sky_only' | 'sky_plus_natal';
          planetary_day: string;
          score: 'propitious' | 'neutral' | 'adverse';
          ruler_planet: string;
          magic_insight: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          label: string;
          date_str: string;
          time_str: string;
          location: string;
          latitude: number;
          longitude: number;
          timezone: string;
          intention_id: string;
          elective_mode: 'sky_only' | 'sky_plus_natal';
          planetary_day: string;
          score: 'propitious' | 'neutral' | 'adverse';
          ruler_planet: string;
          magic_insight?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          label?: string;
          date_str?: string;
          time_str?: string;
          location?: string;
          latitude?: number;
          longitude?: number;
          timezone?: string;
          intention_id?: string;
          elective_mode?: 'sky_only' | 'sky_plus_natal';
          planetary_day?: string;
          score?: 'propitious' | 'neutral' | 'adverse';
          ruler_planet?: string;
          magic_insight?: string | null;
          created_at?: string | null;
        };
      };
      salmos: {
        Row: {
          id: string;
          number: number;
          nome_divino: string | null;
          page_start: string | null;
          page_end: string | null;
        };
        Insert: {
          id?: string;
          number: number;
          nome_divino?: string | null;
          page_start?: string | null;
          page_end?: string | null;
        };
        Update: {
          id?: string;
          number?: number;
          nome_divino?: string | null;
          page_start?: string | null;
          page_end?: string | null;
        };
      };
      salmos_propositos: {
        Row: {
          id: string;
          salmo_id: string;
          nome: string;
          evidencia: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          salmo_id: string;
          nome: string;
          evidencia?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          salmo_id?: string;
          nome?: string;
          evidencia?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      salmos_elementos: {
        Row: {
          id: string;
          salmo_id: string;
          nome: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          salmo_id: string;
          nome: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          salmo_id?: string;
          nome?: string;
          created_at?: string | null;
        };
      };
      salmos_fontes: {
        Row: {
          id: string;
          salmo_id: string;
          nome_fonte: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          salmo_id: string;
          nome_fonte: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          salmo_id?: string;
          nome_fonte?: string;
          created_at?: string | null;
        };
      };
      salmos_condicoes_astro: {
        Row: {
          id: string;
          salmo_id: string;
          descricao: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          salmo_id: string;
          descricao: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          salmo_id?: string;
          descricao?: string;
          created_at?: string | null;
        };
      };
      user_salmos_favoritos: {
        Row: {
          id: string;
          user_id: string;
          salmo_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          salmo_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          salmo_id?: string;
          created_at?: string | null;
        };
      };
      salmos_diario: {
        Row: {
          id: string;
          user_id: string;
          salmo_id: string;
          anotacao: string;
          data_pratica: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          salmo_id: string;
          anotacao: string;
          data_pratica?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          salmo_id?: string;
          anotacao?: string;
          data_pratica?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

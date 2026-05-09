-- Salmos module schema

CREATE TABLE salmos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  texto TEXT NOT NULL,
  nome_divino TEXT,
  nome_divino_hebraico TEXT,
  planeta TEXT NOT NULL,
  elemento TEXT NOT NULL,
  intencao TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE salmos_propositos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salmo_id UUID NOT NULL REFERENCES salmos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  evidencia TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE salmos_elementos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salmo_id UUID NOT NULL REFERENCES salmos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE salmos_fontes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salmo_id UUID NOT NULL REFERENCES salmos(id) ON DELETE CASCADE,
  nome_fonte TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE salmos_condicoes_astro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salmo_id UUID NOT NULL REFERENCES salmos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_salmos_favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salmo_id UUID NOT NULL REFERENCES salmos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, salmo_id)
);

CREATE TABLE salmos_diario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  salmo_id UUID NOT NULL REFERENCES salmos(id) ON DELETE CASCADE,
  anotacao TEXT NOT NULL,
  data_pratica TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE salmos ENABLE ROW LEVEL SECURITY;
ALTER TABLE salmos_propositos ENABLE ROW LEVEL SECURITY;
ALTER TABLE salmos_elementos ENABLE ROW LEVEL SECURITY;
ALTER TABLE salmos_fontes ENABLE ROW LEVEL SECURITY;
ALTER TABLE salmos_condicoes_astro ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_salmos_favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE salmos_diario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salmos are public" ON salmos
  FOR SELECT USING (true);

CREATE POLICY "Salmos propositos are public" ON salmos_propositos
  FOR SELECT USING (true);

CREATE POLICY "Salmos elementos are public" ON salmos_elementos
  FOR SELECT USING (true);

CREATE POLICY "Salmos fontes are public" ON salmos_fontes
  FOR SELECT USING (true);

CREATE POLICY "Salmos condicoes are public" ON salmos_condicoes_astro
  FOR SELECT USING (true);

CREATE POLICY "Users own favorite salmos" ON user_salmos_favoritos
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own salmo diary entries" ON salmos_diario
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


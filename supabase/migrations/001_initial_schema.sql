-- AstroMap Supabase initial schema

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_data JSONB NOT NULL,
  planets JSONB NOT NULL,
  houses JSONB NOT NULL,
  aspects JSONB NOT NULL,
  ascendant FLOAT,
  mc FLOAT,
  lots JSONB,
  traditional_points JSONB,
  traditional_assessments JSONB,
  is_day_chart BOOLEAN,
  prenatal_syzygy FLOAT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chart_id UUID NOT NULL REFERENCES charts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('natal', 'traditional', 'solar', 'elective')),
  content TEXT NOT NULL,
  model_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE electives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  date_str TEXT NOT NULL,
  time_str TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  timezone TEXT NOT NULL,
  intention_id TEXT NOT NULL,
  elective_mode TEXT NOT NULL CHECK (elective_mode IN ('sky_only', 'sky_plus_natal')),
  planetary_day TEXT NOT NULL,
  score TEXT NOT NULL CHECK (score IN ('propitious', 'neutral', 'adverse')),
  ruler_planet TEXT NOT NULL,
  magic_insight TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE credit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  limits JSONB NOT NULL,
  price_cents INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_credits (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES credit_plans(id),
  credits_used JSONB NOT NULL DEFAULT '{}',
  credits_remaining JSONB NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE electives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own profiles" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users own charts" ON charts
  FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Users own reports" ON ai_reports
  FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Users own electives" ON electives
  FOR ALL USING (auth.uid() = profile_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

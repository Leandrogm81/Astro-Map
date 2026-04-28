# Plano de Implementação: Supabase Auth — Sprints Detalhados

> **Versão:** 2.0 | **Status:** Aprovado para execução  
> **Escopo:** Remover fluxo guest. Implementar apenas autenticação real (email/senha) via Supabase Auth + PostgreSQL.  
> **Decisões:** Email+Senha apenas (sem OAuth) | Login imediato (sem confirmação de email) | Acesso irrestrito agora, estrutura para créditos futura

---

## Sprint 1: Fundação & Setup

**Objetivo:** Projeto Supabase criado, schema aplicado, dependências instaladas, clientes configurados.

| # | Tarefa | Arquivo(s) | Estimativa |
|---|--------|------------|------------|
| 1.1 | Criar projeto no Supabase Dashboard | — | 15 min |
| 1.2 | Instalar `@supabase/supabase-js` e `@supabase/ssr` | `package.json` | 5 min |
| 1.3 | Adicionar variáveis ao `.env.local` e `.env.local.example` | `.env.local` | 10 min |
| 1.4 | Criar `src/lib/supabase/client.ts` (browser client) | `src/lib/supabase/client.ts` | 20 min |
| 1.5 | Criar `src/lib/supabase/server.ts` (server client com cookie handling) | `src/lib/supabase/server.ts` | 30 min |
| 1.6 | Criar `src/lib/supabase/middleware.ts` (session refresh helper) | `src/lib/supabase/middleware.ts` | 30 min |
| 1.7 | Aplicar schema SQL no Supabase (migração 001) | `supabase/migrations/001_initial_schema.sql` | 45 min |
| 1.8 | Configurar trigger `on_auth_user_created` no Supabase | SQL no dashboard | 15 min |
| 1.9 | Gerar tipos TypeScript (`supabase gen types`) | `src/lib/supabase/database.types.ts` | 10 min |
| 1.10 | Validar `npm run build` passa após instalação | — | 10 min |

### Schema SQL (migração 001)

```sql
-- profiles (estende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- charts
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

-- ai_reports
CREATE TABLE ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chart_id UUID NOT NULL REFERENCES charts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('natal', 'traditional', 'solar', 'elective')),
  content TEXT NOT NULL,
  model_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- electives
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

-- Estrutura futura para créditos (não usada ainda, mas preparada)
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

-- RLS
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

-- Trigger
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
```

### Critérios de aceitação do Sprint 1

- [ ] `npm install` completo sem conflitos
- [ ] `supabase gen types` gera `database.types.ts` sem erro
- [ ] Trigger cria `profile` automaticamente ao inserir em `auth.users`
- [ ] `npm run build` passa
- [ ] Variáveis de ambiente documentadas em `.env.local.example`

---

## Sprint 2: Auth Core

**Objetivo:** Middleware, login page, hooks e server actions funcionando com Supabase Auth.

| # | Tarefa | Arquivo(s) | Estimativa |
|---|--------|------------|------------|
| 2.1 | Refatorar `src/middleware.ts` para usar `updateSession` do Supabase | `src/middleware.ts` | 45 min |
| 2.2 | Criar `src/hooks/useAuth.ts` — retorna `user`, `loading`, `isAdmin` | `src/hooks/useAuth.ts` | 30 min |
| 2.3 | Criar `src/hooks/useSupabase.ts` — expõe cliente browser | `src/hooks/useSupabase.ts` | 15 min |
| 2.4 | Refatorar `src/app/login/page.tsx` — 3 abas (Login / Cadastro / Recuperar) | `src/app/login/page.tsx` | 2h |
| 2.5 | Implementar `signInWithPassword` na aba Login | `src/app/login/page.tsx` | 30 min |
| 2.6 | Implementar `signUp` na aba Cadastro | `src/app/login/page.tsx` | 30 min |
| 2.7 | Implementar `resetPasswordForEmail` na aba Recuperar | `src/app/login/page.tsx` | 30 min |
| 2.8 | Refatorar `src/app/api/auth/logout/route.ts` para `signOut()` server-side | `src/app/api/auth/logout/route.ts` | 20 min |
| 2.9 | Remover `src/app/api/auth/login/route.ts` | deletar arquivo | 5 min |
| 2.10 | Adicionar `src/app/auth/callback/route.ts` | `src/app/auth/callback/route.ts` | 15 min |
| 2.11 | Criar componente `LogoutButton` que chama `/api/auth/logout` | `src/components/LogoutButton.tsx` | 15 min |
| 2.12 | Integrar `LogoutButton` no layout/page principal | `src/app/page.tsx` | 15 min |

### Critérios de aceitação do Sprint 2

- [ ] Middleware redireciona não-autenticados para `/login`
- [ ] Usuário consegue criar conta e logar imediatamente
- [ ] Logout limpa sessão e redireciona para `/login`
- [ ] `useAuth` retorna user correto após login
- [ ] Rotas `/api/*` retornam 401 sem sessão válida
- [ ] `npm run lint` passa

---

## Sprint 3: Data Layer — Supabase CRUD + localStorage Sync

**Objetivo:** Mapas, relatórios e eletivas persistidos no PostgreSQL, com localStorage como cache offline.

| # | Tarefa | Arquivo(s) | Estimativa |
|---|--------|------------|------------|
| 3.1 | Criar `src/lib/supabase/charts.ts` — CRUD de charts | `src/lib/supabase/charts.ts` | 1h |
| 3.2 | Criar `src/lib/supabase/reports.ts` — CRUD de reports | `src/lib/supabase/reports.ts` | 45 min |
| 3.3 | Criar `src/lib/supabase/electives.ts` — CRUD de eletivas | `src/lib/supabase/electives.ts` | 45 min |
| 3.4 | Refatorar `src/lib/storage.ts` — adicionar camada de sync | `src/lib/storage.ts` | 1h |
| 3.5 | Refatorar `src/components/SavedCharts.tsx` — buscar do Supabase | `src/components/SavedCharts.tsx` | 45 min |
| 3.6 | Refatorar `src/components/AIReport.tsx` — salvar relatório no Supabase | `src/components/AIReport.tsx` | 30 min |
| 3.7 | Refatorar `src/components/traditional/TraditionalAIReport.tsx` — idem | `src/components/traditional/TraditionalAIReport.tsx` | 30 min |
| 3.8 | Refatorar `src/components/traditional/TraditionalElectivePanel.tsx` — salvar eletiva | `src/components/traditional/TraditionalElectivePanel.tsx` | 30 min |
| 3.9 | Criar fluxo de "Importar mapas locais" (modal) | `src/components/ImportLocalDataModal.tsx` | 1h |

### Estratégia de sync

```typescript
export async function saveChart(name, chart, user) {
  const local = saveChartLocal(name, chart);
  if (user) {
    const { data } = await supabase.from('charts').insert({...});
    return data;
  }
  return local;
}
```

### Critérios de aceitação do Sprint 3

- [ ] Criar mapa → aparece no Supabase
- [ ] Recarregar página → mapa persiste (vindo do Supabase)
- [ ] Deletar mapa → desaparece do Supabase e do localStorage
- [ ] Relatório de IA gerado → salvo em `ai_reports` vinculado ao `chart_id`
- [ ] Eletiva salva → aparece em `electives`
- [ ] Modal de importação aparece se localStorage tem dados e Supabase está vazio
- [ ] `npm run test` passa

---

## Sprint 4: Cleanup, Testes & Validação

**Objetivo:** Remover todo código guest/legacy, garantir cobertura de testes, validar build.

| # | Tarefa | Arquivo(s) | Estimativa |
|---|--------|------------|------------|
| 4.1 | Remover `isGuest` de `src/app/page.tsx` | `src/app/page.tsx` | 30 min |
| 4.2 | Remover `isGuest` de `src/components/SavedCharts.tsx` | `src/components/SavedCharts.tsx` | 15 min |
| 4.3 | Remover `isGuest`/`isGuestUsed` de `src/components/AIReport.tsx` | `src/components/AIReport.tsx` | 20 min |
| 4.4 | Remover lógica guest de `TraditionalAIReport.tsx` | `src/components/traditional/TraditionalAIReport.tsx` | 20 min |
| 4.5 | Remover lógica guest de `TraditionalElectivePanel.tsx` | `src/components/traditional/TraditionalElectivePanel.tsx` | 20 min |
| 4.6 | Refatorar `src/app/api/report/route.ts` — remover guest/créditos | `src/app/api/report/route.ts` | 45 min |
| 4.7 | Remover cookies custom (`astromap_session`, `astromap_role`) de todo o projeto | grep + edit | 30 min |
| 4.8 | Remover `ADMIN_USERNAME` e `ADMIN_PASSWORD` do `.env.local` e código | `.env.local`, API routes | 15 min |
| 4.9 | Escrever testes unitários para `useAuth` hook | `src/hooks/useAuth.test.ts` | 45 min |
| 4.10 | Escrever testes de integração para `/api/report` | `src/app/api/report/route.test.ts` | 45 min |
| 4.11 | Escrever testes E2E (Playwright): cadastro → login → mapa → logout | `e2e/auth-flow.spec.ts` | 1h |
| 4.12 | Rodar `npm run lint` e corrigir erros | — | 30 min |
| 4.13 | Rodar `npm run build` e garantir sucesso | — | 15 min |
| 4.14 | Rodar `npm run test` — 100% cobertura em código novo | — | 30 min |
| 4.15 | Atualizar `README.md` com instruções de setup do Supabase | `README.md` | 30 min |

### Critérios de aceitação do Sprint 4

- [ ] Zero referências a `guest` no codebase (`grep -r "guest" src/` retorna vazio)
- [ ] Zero referências a `astromap_session` / `astromap_role`
- [ ] `/api/report` retorna 401 para requisição sem sessão válida
- [ ] Testes unitários passam
- [ ] Testes E2E passam
- [ ] `npm run lint` sem erros
- [ ] `npm run build` sucede
- [ ] `npm run test` com 100% cobertura em código novo

---

## Resumo de Estimativas

| Sprint | Tarefas | Estimativa Total |
|--------|---------|------------------|
| Sprint 1: Fundação & Setup | 10 | ~3.5h |
| Sprint 2: Auth Core | 12 | ~5.5h |
| Sprint 3: Data Layer | 9 | ~6h |
| Sprint 4: Cleanup & Testes | 15 | ~6.5h |
| **TOTAL** | **46** | **~21.5h** |

---

## Dependências entre Sprints

```
Sprint 1 ──▶ Sprint 2 ──▶ Sprint 3 ──▶ Sprint 4
```

---

## Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENROUTER_API_KEY=sk-or-v1-...
```

---

## Notas sobre Estrutura Futura de Créditos

As tabelas `credit_plans` e `user_credits` foram criadas no schema mas **não são utilizadas** no MVP. Quando implementado:

1. Seed de planos (Free, Pro)
2. Inserir `user_credits` ao criar `profile`
3. Verificar saldo em `/api/report` antes de chamar OpenRouter
4. UI de "Você tem X créditos restantes"

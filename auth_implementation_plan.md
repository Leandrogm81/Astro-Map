# Plano de Implementação: Autenticação Real & Persistência Supabase

Este documento detalha a migração do sistema de autenticação simulada do AstroMap para uma infraestrutura robusta utilizando **Supabase (Auth + PostgreSQL)**.

## 🎯 Objetivos

- **Segurança**: Substituir o login hardcoded por sessões JWT reais.
- **Sincronização**: Persistir mapas e relatórios no banco de dados, eliminando a dependência exclusiva do `localStorage`.
- **Gestão de Créditos**: Controle centralizado de uso de IA por usuário.

---

## 🏗️ Estrutura de Dados (PostgreSQL)

### 1. Tabela `profiles`

Estende os dados de autenticação do Supabase.

- `id`: UUID (Primary Key, FK para auth.users)
- `email`: Text (Único)
- `role`: Text ('guest' | 'user' | 'admin')
- `credits`: JSONB (Ex: `{"n": 1, "t": 1, "r": 1, "e": 1}`)
- `created_at`: Timestamp
- `expires_at`: Timestamp (Expiração de 3 dias para 'guest', NULL para 'user')

### 2. Tabela `charts`

Armazena os mapas astrais gerados.

- `id`: UUID (Primary Key)
- `profile_id`: UUID (FK para profiles)
- `name`: Text
- `birth_data`: JSONB
- `planets`: JSONB
- `houses`: JSONB
- `aspects`: JSONB
- `created_at`: Timestamp

### 3. Tabela `ai_reports`

Armazena os relatórios de IA gerados.

- `id`: UUID (Primary Key)
- `profile_id`: UUID (FK para profiles)
- `chart_id`: UUID (FK para charts)
- `type`: Text ('natal' | 'traditional' | 'solar' | 'elective')
- `content`: Text
- `created_at`: Timestamp

---

## 🔄 Fluxos de Autenticação

### A. Acesso Visitante (Guest)

1. **Entrada**: Usuário fornece apenas o email.
2. **Registro**: Conta criada no Supabase com role `guest` e expiração definida para 3 dias.
3. **Validação**: **Acesso direto**, sem necessidade de confirmação de email imediata.
4. **Limitação**: Pode criar apenas 1 mapa e não pode excluí-lo.

### B. Usuário Permanente

1. **Entrada**: Email e Senha.
2. **Registro**: Role `user`, sem data de expiração.
3. **Validação**: Exige **confirmação de email** para ativação total.

### C. Upgrade (Guest ➔ User)

1. O usuário logado como visitante solicita o registro permanente.
2. O perfil existente é atualizado: a role muda para `user` e o campo `expires_at` é limpo.
3. Os dados existentes (mapas e relatórios) permanecem vinculados à conta.

---

## 🛡️ Regras de Segurança (RLS)

- **Isolamento**: Cada usuário só pode ver e criar dados (`charts`, `reports`) onde `profile_id` seja igual ao seu próprio UID.
- **Restrição de Escrita**: Visitantes (`role == 'guest'`) possuem permissão de `DELETE` bloqueada.

---

## 🛠️ Próximos Passos Técnicos

1. Configuração do projeto no Console do Supabase.
2. Definição das variáveis de ambiente (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).
3. Implementação do `SupabaseClient` no projeto Next.js.
4. Refatoração dos endpoints `/api/auth` e `/api/report`.
5. Atualização do `middleware.ts` para validação de sessões reais.

---
**Status**: Aguardando autorização para início da execução.

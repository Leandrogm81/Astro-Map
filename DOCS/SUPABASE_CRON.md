# Reset Mensal de Uso de IA (Supabase)

Para garantir que os limites de relatórios de IA sejam resetados todo mês, você pode configurar uma tarefa agendada (Cron Job) no Supabase.

## 1. Script SQL de Reset

Execute este comando no **SQL Editor** do Supabase para resetar o contador de todos os usuários (exceto administradores):

```sql
update public.profiles
set ai_reports_used = 0
where tier != 'admin';
```

## 2. Automatizando com pg_cron (Recomendado)

Se o seu projeto Supabase tiver a extensão `pg_cron` ativada, você pode automatizar isso para rodar no primeiro dia de cada mês às 00:00:

```sql
-- Ativar a extensão se necessário
-- create extension if not exists pg_cron;

-- Agendar o reset mensal
select cron.schedule(
  'reset-monthly-ai-usage', -- nome da tarefa
  '0 0 1 * *',              -- cron schedule (meia-noite do dia 1)
  $$ update public.profiles set ai_reports_used = 0 where tier != 'admin' $$
);
```

## 3. Alternativa: Edge Functions + GitHub Actions

Caso prefira não usar `pg_cron`, você pode criar uma **Edge Function** que executa o update e chamá-la via uma tarefa agendada no **GitHub Actions** ou um serviço externo como o **Cron-job.org**.

---
*Nota: Administradores são excluídos do reset pois geralmente possuem limites ilimitados ou específicos que não seguem o ciclo mensal padrão.*

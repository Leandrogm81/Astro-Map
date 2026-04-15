# 🚀 REGRAS GERAIS DO PROJETO - GEMINI.MD
Versão: 1.0 | Última atualização: {{data_atual}}

## 1. Filosofia do Projeto
- Sempre priorize **qualidade, segurança e manutenibilidade** acima de velocidade.
- "Código que roda bem" > "Código que parece bonito".
- Todo código deve ser legível por humanos e por agentes de IA.

## 2. Padrões Obrigatórios
- **Branching**: Sempre trabalhe em branches curtas (`feature/`, `fix/`, `refactor/`). Nunca altere `main` diretamente.
- **Commits**: Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`).
- **Linting**: Rode Ruff / ESLint / SonarLint antes de finalizar qualquer tarefa.
- **Testes**: 
  - 100% de cobertura em código novo (unit + integration).
  - Testes de edge cases obrigatórios.
- **Documentação**: Mantenha `README.md`, `ARCHITECTURE.md` e `API.md` sempre atualizados.

## 3. Regras de Código (por linguagem – adicione a sua)
**Python**
- Use Ruff (config .ruff.toml) + MyPy (strict).
- Type hints em TODAS as funções.
- Evite `any`, `print()` em produção, `except: pass`.

**TypeScript / JavaScript**
- ESLint + @typescript-eslint (strict).
- Use `const`/`let` corretamente, nunca `var`.
- Interfaces e tipos explícitos.

**Geral**
- Funções com no máximo 50 linhas.
- Nome de variáveis e funções claras e em português ou inglês consistente.
- Tratamento de erros obrigatório + logging estruturado.
- Nenhuma credencial hardcoded (use .env + dotenv).

## 4. Segurança (obrigatório)
- Nunca exponha chaves API no código.
- Valide TODOS os inputs do usuário.
- Use rate limiting e sanitização quando aplicável.
- Rode Bandit / npm audit / Trivy antes de deploy.

## 5. Performance
- Evite loops desnecessários e N+1 queries.
- Use caching quando faz sentido.
- Sempre pense em escalabilidade desde o início.

## 6. Como os Agentes Devem Agir
- Sempre pergunte antes de fazer mudanças grandes.
- Mostre o plano completo (arquivos, testes, edge cases) antes de codar.
- Após codar, rode automaticamente: lint → testes → review.
- Se encontrar problema, sugira solução + alternativa.

✅ **Aceito apenas código que passe em todos os itens acima.**
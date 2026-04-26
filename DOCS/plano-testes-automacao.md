# 🛡️ Plano de Testes e Automação AstroMap

Este documento detalha a estratégia de estabilidade para o ecossistema AstroMap, dividida em Sprints de implementação.

## 📅 Cronograma de Sprints

### Sprint 1: Base de Testes E2E (Interface)
**Foco:** Infraestrutura e "Smoke Tests".
- **Ferramenta:** Playwright.
- **Entregáveis:**
  - Configuração do Playwright para Next.js.
  - Teste de carga da página inicial.
  - Teste de visibilidade do formulário de entrada.
  - Script `npm run test:e2e` disponível.

### Sprint 2: Pipeline de Integração Contínua (CI)
**Foco:** Garantia de que nenhum erro chegue à branch principal.
- **Ferramenta:** GitHub Actions.
- **Entregáveis:**
  - Workflow `.github/workflows/ci.yml`.
  - Execução automática de Lint, Vitest e Build.
  - Bloqueio de merges caso os testes falhem.
  - Notificações de falha integradas ao GitHub.

### Sprint 3: Cobertura de Fluxos de Negócio
**Foco:** Validar a "alma" do projeto (Astrologia e Exportação).
- **Tarefas:**
  - Validação de entrada de coordenadas (Latitude/Longitude).
  - Teste de renderização da Mandala (presença de elementos SVG).
  - Teste de fluxo de exportação para PDF (Relatório Premium).
  - Teste de menus responsivos (Mobile vs Desktop).

## 🛠️ Tecnologias Utilizadas

| Camada | Ferramenta | Propósito |
| :--- | :--- | :--- |
| **Unitário** | Vitest | Lógica astrológica e funções puras. |
| **E2E** | Playwright | Experiência do usuário e interface. |
| **Lint** | ESLint | Qualidade e padrão de código. |
| **CI/CD** | GitHub Actions | Execução automática de tudo acima. |

## 🚀 Como Executar (Pós-Implementação)

```bash
# Rodar testes unitários
npm run test

# Rodar testes de interface (Headless)
npm run test:e2e

# Abrir interface visual do Playwright para depurar
npx playwright show-report
```

---
*Plano elaborado pela Antigravity AI para o AstroMap.*

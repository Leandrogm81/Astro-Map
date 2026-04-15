# 🤖 AGENTS.MD - Papéis e Responsabilidades

## Agente Principal: Planner (Claude Opus 4.5 ou Gemini 3 Pro)
- Responsável por criar planos detalhados.
- Deve sempre entregar:
  1. Objetivo claro
  2. Arquitetura proposta
  3. Lista de arquivos a criar/alterar
  4. Testes necessários
  5. Possíveis edge cases e riscos

## Agente Coder (Gemini Flash ou GPT-4.5)
- Executa exatamente o plano aprovado.
- Usa OpenCode para edições precisas.
- Nunca inventa funcionalidades fora do escopo.

## Agente Reviewer (SonarLint + Humano)
- Faz review de qualidade, segurança e performance.
- Deve rodar lint + testes automaticamente.
- Só aprova se passar em 100% das regras do GEMINI.md.

## Agente Tester
- Cria e executa testes unitários, de integração e e2e.
- Usa ferramentas: pytest, Jest, Playwright, etc.

## Agente Documenter
- Atualiza README, ARCHITECTURE.md e comentários.
- Mantém o projeto sempre documentado.

## Regras de Colaboração entre Agentes
- Planner → Coder → Tester → Reviewer → Documenter (fluxo padrão).
- Todo agente deve citar o GEMINI.md quando necessário.
- Mudanças grandes só são aplicadas após aprovação humana (diff review).
- Use MCPs/Skills do Antigravity para automações repetitivas.

## Prompt Padrão para Iniciar Tarefa
"Você é o [Papel]. Siga estritamente o GEMINI.md. 
Objetivo: [descreva]. 
Primeiro passo: crie o plano completo."
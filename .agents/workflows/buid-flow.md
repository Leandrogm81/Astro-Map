---
description:  Workflow para implementar novas funcionalidades no AstroMap com escopo mínimo, risco controlado e validação proporcional.
---

# BUILD FLOW - AstroMap

**Descrição:**  
Use este workflow quando a demanda principal for construir uma nova funcionalidade, ampliar comportamento existente ou implementar uma melhoria funcional.  
O objetivo é entregar a menor solução útil, sem over-engineering, sem escopo oculto e sem contaminar o sistema com mudanças paralelas.

---

## 🎯 Missão

Implementar mudanças funcionais com o menor escopo válido, preservando clareza, consistência e segurança de evolução.

---

## 🧭 Princípios

- **Construir só o que foi pedido.**
- **Evitar feature creep.**
- **Não esconder refactor dentro de feature.**
- **Priorizar integração nativa ao projeto.**
- **A menor solução útil é preferível à solução “mais flexível”.**

---

## 📥 Quando Acionar

Acione este workflow quando a demanda for:

- nova funcionalidade
- melhoria funcional
- ampliação de fluxo existente
- novo componente com comportamento
- nova rota, página ou endpoint
- alteração de comportamento pedida explicitamente

Normalmente **não** é o workflow correto para:

- bugfix puro
- refactor estrutural
- revisão de incidente
- promoção/release

---

## 📥 Entradas Esperadas

- objetivo da funcionalidade
- escopo esperado
- risco vindo do Triage
- restrições conhecidas
- impacto em `UI`, `API`, `domain`, `data` ou `export`
- não-objetivos, quando disponíveis
- plano vindo de `Spec / Change Design`, quando aplicável

---

## 📤 Saídas Obrigatórias

- funcionalidade implementada
- escopo real da mudança
- arquivos principais alterados
- riscos residuais
- validação mínima necessária
- workflows auxiliares a acionar, se preciso

---

## 🛠️ Protocolo de Execução

### Passo 1: Confirmar Escopo

Antes de implementar, responder:

- o que esta feature faz?
- o que ela não faz?
- qual o menor resultado aceitável?
- há risco de tocar contrato, domínio, UI crítica ou export?

Se a resposta ainda estiver vaga, voltar para `Spec / Change Design`.

---

### Passo 2: Preservar Fronteiras

Verificar se a mudança exige workflows auxiliares:

- `Contract Guardian` se tocar contratos, payloads, shared types ou integrações
- `Domain Verifier` se tocar lógica astrológica ou output canônico
- `UI / Accessibility Review` se tocar interface relevante
- `Test / Regression Harness` para definir a blindagem mínima

---

### Passo 3: Escolher a Implementação Mínima

Preferir:

- reaproveitar padrões existentes
- tocar o menor número possível de arquivos
- usar abstrações já consolidadas
- manter a solução local quando isso for suficiente

Evitar:

- abstração nova sem necessidade
- generalização prematura
- refactor transversal não pedido
- reescrita de áreas adjacentes

---

### Passo 4: Implementar

Durante a implementação:

- manter nomes coerentes com o projeto
- respeitar tipos compartilhados
- evitar aliases desnecessários
- manter o comportamento fora do escopo intacto
- registrar qualquer risco residual real

---

### Passo 5: Definir Blindagem

Antes de encerrar, declarar:

- o que precisa ser validado
- se há smoke do fluxo principal
- se há teste dirigido
- se há revisão de contrato, domínio ou UI

Se a mudança for `risky` ou `structural`, acionar os workflows auxiliares necessários antes de promoção.

---

## 🚫 Fronteiras

Este workflow:

- **não é para bugfix puro**
- **não é para refactor estrutural disfarçado**
- **não promove release**
- **não atualiza MAESTRO**
- **não gera log por reflexo**

---

## ✅ Checklist Final

- [ ] O objetivo da feature está claro?
- [ ] Os não-objetivos estão claros?
- [ ] A implementação ficou no menor escopo útil?
- [ ] Não houve refactor escondido?
- [ ] Os workflows auxiliares corretos foram acionados, se necessário?
- [ ] A validação mínima foi declarada?

---

## 📌 Formato de Saída Recomendado

```markdown
**BUILD FLOW Result**
- Objetivo: adicionar configuração de API com validação básica
- Escopo implementado:
  - novo formulário
  - persistência local
  - feedback de erro simples
- Fora de escopo:
  - redesign completo da tela
  - integração com múltiplos provedores
- Riscos residuais:
  - revisão de acessibilidade ainda necessária
- Workflows auxiliares:
  - UI / Accessibility Review
  - Test / Regression Harness
- Validação mínima:
  - smoke do fluxo
  - lint
  - build

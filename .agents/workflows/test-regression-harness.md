---
description: Workflow para definir a blindagem mínima correta de testes, smoke checks e regressão no AstroMap.
---

# Test / Regression Harness - AstroMap

**Descrição:**  
Use este workflow para decidir como uma mudança deve ser validada.  
Ele não existe para “rodar tudo por reflexo”, mas para escolher a menor blindagem que reduza risco de regressão de forma confiável.

---

## 🎯 Missão

Traduzir risco de mudança em evidência de qualidade: testes, smoke checks, fixtures, validação manual dirigida e cobertura de regressão.

---

## 🧭 Princípios

- **Nem toda mudança precisa do mesmo nível de teste.**
- **Não testar demais por ritual.**
- **Não testar de menos por pressa.**
- **Toda regressão conhecida merece blindagem proporcional.**
- **A validação deve seguir o risco, não a ansiedade.**

---

## 📥 Quando Acionar

Acione após:

- bugfix
- feature
- improvement
- refactor
- ajuste em contrato
- ajuste em cálculo
- mudança de UI com risco real
- mudança de config/deploy com impacto verificável

---

## 📥 Entradas Esperadas

- tipo de mudança
- nível de risco
- área afetada
- comportamento alterado
- regressão conhecida
- diff final
- fluxos principais tocados

---

## 📤 Saídas Obrigatórias

- estratégia de validação
- testes obrigatórios
- testes dispensáveis
- smoke checks necessários
- necessidade de fixture/caso canônico
- evidência mínima para considerar a mudança segura

---

## 🛠️ Protocolo de Execução

### Passo 1: Classificar a Mudança

Definir:

- `bugfix`
- `feature`
- `refactor`
- `contract`
- `domain`
- `ui`
- `deploy/config`

---

### Passo 2: Ler o Risco

Usar o risco vindo do Triage:

- `trivial`
- `standard`
- `risky`
- `structural`

Se não houver classificação prévia, fazer uma mínima antes de continuar.

---

### Passo 3: Escolher a Blindagem Mínima

### Para `trivial`

Normalmente basta:

- validação local dirigida
- lint
- build quando necessário

### Para `standard`

Normalmente exigir:

- lint
- build
- teste dirigido ou smoke do fluxo principal

### Para `risky`

Normalmente exigir:

- lint
- build
- teste novo ou atualização de teste existente
- smoke do fluxo afetado
- checagem explícita de regressão

### Para `structural`

Normalmente exigir:

- lint
- build
- suíte relevante
- smoke dirigido
- verificação cruzada de contratos/domínio/UI conforme o caso

---

### Passo 4: Escolher o Tipo de Evidência

Use uma ou mais destas:

- teste unitário
- contract test
- fixture canônica
- smoke manual dirigido
- teste de regressão
- build
- verificação tipada
- validação visual dirigida

---

### Passo 5: Cobrir a Regressão Principal

Responder:

- o que poderia quebrar novamente?
- qual evidência mínima impediria isso?
- a correção ficou “provável” ou “provada”?

Se foi bug reproduzível, a validação deve idealmente cobrir o cenário que falhava.

---

### Passo 6: Declarar o que Não é Necessário

Também registrar o que **não precisa** ser feito, para evitar excesso ritual:

- “não exige suíte completa”
- “não exige novo fixture”
- “não exige contract test”
- “não exige smoke visual”

---

## 🧪 Heurísticas por Área

### Bugfix local

- reproduzir
- corrigir
- validar o cenário afetado

### Feature com UI

- fluxo principal
- estados básicos
- build

### Contract/API

- shape do request/response
- erro em JSON
- compatibilidade com consumidor

### Domain

- fixture canônica
- consistência semântica
- build/teste direcionado

### Refactor

- preservação de comportamento
- testes existentes + 1 evidência dirigida se necessário

### Deploy/config

- build
- checagem de config
- smoke essencial

---

## 🚫 Fronteiras

Este workflow:

- **não implementa**
- **não decide release sozinho**
- **não cria teste por vaidade**
- **não roda bateria máxima por padrão**
- **não cria log por reflexo**

---

## ✅ Checklist Final

- [ ] O risco foi considerado?
- [ ] A blindagem foi escolhida de forma proporcional?
- [ ] Há evidência para a regressão principal?
- [ ] Foi definido o que é obrigatório?
- [ ] Foi definido o que é dispensável?
- [ ] A validação ficou mais objetiva do que genérica?

---

## 📌 Formato de Saída Recomendado

```markdown
**Validation Plan**
- Tipo de mudança: `bugfix`
- Risco: `risky`
- Evidência obrigatória:
  - repro do bug
  - correção validada no cenário original
  - teste direcionado
  - lint + build
- Evidência adicional:
  - smoke do fluxo relacionado
- Dispensado:
  - suíte completa
  - revisão visual ampla
```

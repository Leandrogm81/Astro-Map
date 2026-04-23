---
description: Workflow para diagnosticar causa raiz e aplicar correção mínima no AstroMap com validação proporcional.
---

# DEBUG TRACE - AstroMap

**Descrição:**  
Use este workflow quando houver bug, regressão, quebra visual, falha de teste, erro de API, erro de cálculo, falha de export ou comportamento inesperado.  
O objetivo é encontrar a causa raiz antes de alterar o código e aplicar a menor correção útil com evidência suficiente.

---

## 🎯 Missão

Corrigir falhas com precisão, mínimo blast radius e validação compatível com o risco do problema.

---

## 🧭 Princípios

- **Entender antes de corrigir.**
- **Não adivinhar remédio sem causa raiz.**
- **Corrigir o menor necessário.**
- **Não usar bug como desculpa para refactor amplo.**
- **Validar de acordo com o tipo de falha.**

---

## 📥 Quando Acionar

Acione este workflow quando houver:

- bug funcional
- regressão
- erro em produção
- falha de teste
- quebra de UI
- erro de API
- erro de cálculo
- falha em export/PDF
- comportamento inesperado em fluxo existente

---

## 📥 Entradas Esperadas

- descrição do erro
- área afetada
- contexto (`logs`, `prints`, `arquivos`, `diff recente`)
- ambiente (`local`, `preview`, `produção`)
- comportamento esperado
- comportamento atual
- repro steps, se houver

---

## 📤 Saídas Obrigatórias

- hipótese de causa raiz
- correção mínima proposta ou aplicada
- área de impacto
- validação adequada ao bug
- incident note, apenas se justificado

---

## 🛠️ Protocolo de Execução

### Passo 1: Normalizar a Falha

Descrever o problema em uma frase objetiva:

> “Quando [ação], o sistema faz [resultado atual] em vez de [resultado esperado].”

Se isso não estiver claro, pedir apenas a informação mínima faltante.

---

### Passo 2: Classificar o Bug

Identificar o tipo principal:

- `ui`
- `api`
- `contract`
- `domain`
- `export`
- `build`
- `runtime`
- `regression`
- `intermittent`

Isso ajuda a escolher a validação correta depois.

---

### Passo 3: Buscar Evidência Útil

Sempre que possível, reunir:

- repro mínima
- erro observado
- logs úteis
- área tocada recentemente
- se é regressão ou não
- se ocorre sempre ou de forma intermitente

Consultar logs/incidentes recentes **apenas se houver sinal real de correlação**, não por ritual.

---

### Passo 4: Formular Causa Raiz

Responder:

- onde a falha nasce?
- em que ponto o comportamento desvia?
- o problema é de contrato, lógica, renderização, dados ou ambiente?
- existe falso culpado óbvio que precisa ser descartado?

Se ainda for hipótese, deixar isso explícito.

---

### Passo 5: Definir Correção Mínima

A correção deve:

- atacar a causa raiz
- tocar o menor número possível de arquivos
- evitar mudança paralela de comportamento
- deixar claro o blast radius

Se a correção tocar contrato, domínio ou UI relevante, acionar os workflows auxiliares adequados.

---

### Passo 6: Validar a Correção

Escolher validação proporcional:

- bug local: repro + validação local
- API/contract: shape + consumidor
- domain: fixture/caso canônico
- UI: smoke visual dirigido
- build/runtime: lint/build/teste direcionado
- regressão: evidência de que o cenário falho agora passa

---

### Passo 7: Decidir se Vale Registro

Criar note/log apenas se houver valor claro para:

- rastreabilidade futura
- regressão relevante
- incidente importante
- aprendizado reaproveitável

Se não houver, não registrar por reflexo.

---

## 🚫 Fronteiras

Este workflow:

- **não implementa feature nova**
- **não faz redesign por oportunidade**
- **não promove release**
- **não atualiza MAESTRO**
- **não gera log por padrão**

---

## ✅ Checklist Final

- [ ] O erro foi descrito de forma objetiva?
- [ ] O tipo de bug foi classificado?
- [ ] A causa raiz foi identificada ou delimitada honestamente?
- [ ] A correção foi mínima?
- [ ] A validação foi proporcional ao bug?
- [ ] O registro formal foi tratado como opcional e justificado?

---

## 📌 Formato de Saída Recomendado

```markdown
**DEBUG TRACE Result**
- Tipo de bug: `contract`
- Área: export/PDF
- Causa raiz: consumidor ainda usava alias local em vez do campo canônico
- Correção mínima:
  - alinhar consumidor ao shared type
- Blast radius:
  - export
  - tipagem do fluxo
- Validação mínima:
  - Contract Guardian
  - build
  - smoke do export
- Registro formal:
  - não necessário

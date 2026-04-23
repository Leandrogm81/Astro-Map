---
description: Workflow para transformar intenção em escopo operacional claro antes da implementação no AstroMap.
---

# Spec / Change Design - AstroMap

**Descrição:**  
Use este workflow quando a mudança não for trivial e precisar de clareza de escopo antes de entrar no BUILD FLOW ou no DEBUG TRACE.  
O objetivo é reduzir improviso, evitar overbuilding e deixar explícito o que será feito, o que não será feito e como a mudança será validada.

---

## 🎯 Missão

Converter uma demanda em um plano de mudança mínimo, claro e verificável, com risco controlado e sem inflar a implementação.

---

## 🧭 Princípios

- **Planejar só o suficiente para reduzir erro.**
- **Não transformar toda mudança em RFC.**
- **Escopo explícito evita feature creep.**
- **Não-objetivos são tão importantes quanto objetivos.**
- **O melhor design é o menor que resolve o problema.**

---

## 📥 Quando Acionar

Acione este workflow quando a mudança for:

- `standard` com ambiguidade relevante
- `risky`
- `structural`
- nova feature de fluxo
- API nova ou alteração de contrato relevante
- mudança em cálculo, export ou domínio
- refactor com risco de comportamento

Normalmente **não** é necessário para mudanças `trivial`.

---

## 📥 Entradas Esperadas

- objetivo da mudança
- contexto do pedido
- resultado esperado
- área afetada (`UI`, `API`, `domain`, `data`, `export`, `config`)
- restrições conhecidas
- risco vindo do Triage
- evidências ou referências úteis

---

## 📤 Saídas Obrigatórias

- objetivo operacional
- não-objetivos
- impacto por camada
- riscos principais
- plano mínimo de implementação
- validação mínima exigida
- workflow seguinte recomendado

---

## 🛠️ Protocolo de Execução

### Passo 1: Reescrever o Objetivo

Converter o pedido em uma frase objetiva:

> “A mudança deve permitir / corrigir / alinhar…”

Se não for possível escrever isso com clareza, ainda não está pronta para implementação.

---

### Passo 2: Declarar Não-Objetivos

Registrar explicitamente o que **não** faz parte da mudança.

Exemplos:

- não redesenhar a tela
- não refatorar arquivos adjacentes
- não alterar contrato externo
- não introduzir abstração nova
- não mexer em PDF/export, salvo o necessário

---

### Passo 3: Mapear Impacto

Definir onde a mudança toca:

- `UI`
- `API`
- `domain`
- `shared types`
- `data flow`
- `export/PDF`
- `deploy/config`

Se tocar mais de uma camada, registrar isso.

---

### Passo 4: Identificar Riscos Reais

Responder:

- pode quebrar contrato?
- pode quebrar cálculo?
- pode gerar regressão visual?
- pode alterar comportamento central?
- pode exigir approval humana?
- pode exigir Contract Guardian, Domain Verifier ou UI Review?

---

### Passo 5: Desenhar a Implementação Mínima

Descrever o menor plano válido, incluindo:

- arquivos ou áreas prováveis
- abordagem escolhida
- abordagem descartada
- por que esta é a menor mudança útil

---

### Passo 6: Definir Validação

Declarar o mínimo necessário para considerar a mudança segura.

Exemplos:

- lint + build
- smoke do fluxo principal
- contract check
- fixture de domínio
- revisão visual dirigida
- teste direcionado

---

### Passo 7: Definir Próxima Rota

Escolher qual workflow executa depois:

- `BUILD FLOW`
- `DEBUG TRACE`
- `Refactor / Debt Controller`
- `Contract Guardian`
- `Domain Verifier`

---

## 🚫 Fronteiras

Este workflow:

- **não implementa**
- **não corrige bug**
- **não valida release**
- **não atualiza MAESTRO**
- **não cria log por reflexo**

---

## ✅ Checklist Final

- [ ] O objetivo foi reescrito com clareza?
- [ ] Os não-objetivos foram declarados?
- [ ] O impacto por camada foi mapeado?
- [ ] Os riscos reais foram identificados?
- [ ] A implementação mínima foi descrita?
- [ ] A validação mínima foi definida?
- [ ] O próximo workflow foi escolhido?

---

## 📌 Formato de Saída Recomendado

```markdown
**Change Design**
- Objetivo: alinhar fluxo de export com novo contrato tipado
- Não-objetivos:
  - não redesenhar UI
  - não alterar cálculo
- Impacto:
  - shared types
  - export/PDF
- Riscos:
  - drift de contrato
  - regressão no export
- Plano mínimo:
  - alinhar consumidor ao tipo canônico
  - revisar campos usados no export
- Validação mínima:
  - Contract Guardian
  - build
  - smoke do export
- Próximo workflow:
  - BUILD FLOW
```

---
description: Workflow de entrada e classificação de demandas do AstroMap. Define tipo, risco, rota correta e validação mínima antes de qualquer execução.
---

# Intake / Triage - AstroMap

**Descrição:**  
Use este workflow sempre que uma nova demanda chegar ao sistema: bug, feature, melhoria, refactor, quebra visual, erro de cálculo, problema de deploy ou dúvida de contrato.  
O objetivo é classificar corretamente a demanda antes de qualquer ação.

---

## 🎯 Missão

Transformar pedidos vagos ou mistos em uma rota operacional clara, com o menor custo possível de contexto e o menor risco de execução errada.

---

## 🧭 Princípios

- **Toda demanda entra por aqui.**
- **Classificar antes de agir.**
- **Não implementar nada neste workflow.**
- **Não presumir risco baixo sem evidência.**
- **Não mandar tudo para o Debugger ou Feature Builder por conveniência.**

---

## 📥 Entradas Esperadas

Sempre que possível, coletar:

- Objetivo ou problema relatado
- Área afetada
- Ambiente (`local`, `preview`, `produção`)
- Evidência disponível (`logs`, `prints`, `arquivos`, `diff recente`)
- Comportamento esperado
- Comportamento atual
- Grau de urgência percebido

---

## 📤 Saídas Obrigatórias

Este workflow deve produzir:

1. **Tipo da demanda**
2. **Nível de risco**
3. **Workflow principal**
4. **Workflows auxiliares recomendados**
5. **Validação mínima exigida**
6. **Se precisa aprovação humana**

---

## 🧩 Tipos de Demanda

Classifique em um destes:

- `bug`
- `feature`
- `improvement`
- `refactor`
- `contract`
- `domain`
- `ui`
- `deploy`
- `incident`
- `unknown`

Se a demanda misturar mais de um tipo, escolha um **tipo principal** e registre os secundários.

---

## ⚠️ Níveis de Risco

Classifique em um destes:

### `trivial`

Mudança local, baixo impacto, sem alteração de contrato, domínio ou fluxo crítico.

### `standard`

Mudança comum, com risco controlado, sem impacto estrutural relevante.

### `risky`

Pode gerar regressão perceptível, tocar contrato, cálculo, export, UI crítica ou comportamento central.

### `structural`

Afeta arquitetura, múltiplas camadas, convenções centrais, fluxos amplos ou base do sistema.

---

## 🗺️ Roteamento Principal

Use estas rotas como padrão:

- `bug` → **Debugger**
- `feature` → **Feature Builder**
- `improvement` → **Feature Builder**
- `refactor` → **Refactor / Debt Controller**
- `contract` → **Contract Guardian**
- `domain` → **Domain Verifier**
- `ui` → **UI / Accessibility Review**
- `deploy` → **Deploy / Validate**
- `incident` → **Observability / Incident Review**
- `unknown` → **pedir clarificação mínima ou classificar como risky**

---

## 🧪 Validação Mínima por Tipo

### Bug

- repro ou evidência suficiente
- validação da correção
- checagem de regressão mínima

### Feature / Improvement

- escopo
- não-objetivos
- validação do fluxo principal
- lint/build

### Contract

- campos
- tipos
- compatibilidade
- source of truth

### Domain

- casos canônicos
- tolerância
- consistência com regras do projeto

### UI

- loading/error/empty states
- responsividade
- acessibilidade

### Deploy

- lint
- testes
- build
- revisão do diff

---

## 🛠️ Protocolo de Execução

### Passo 1: Normalizar a Demanda

Converter o pedido em uma frase operacional:

> “O usuário quer / está vendo / precisa de…”

Se isso não puder ser feito com clareza, pedir apenas a informação mínima faltante.

---

### Passo 2: Classificar o Tipo Principal

Definir o tipo principal da demanda.

Se houver mistura, registrar assim:

- **Principal:** `feature`
- **Secundário:** `contract`, `ui`

---

### Passo 3: Avaliar o Risco

Responder rapidamente:

- toca contrato?
- toca cálculo?
- toca export/PDF?
- toca UI crítica?
- toca config/deploy?
- toca múltiplas camadas?
- há chance clara de regressão?

Com base nisso, definir `trivial`, `standard`, `risky` ou `structural`.

---

### Passo 4: Definir a Rota

Escolher:

- workflow principal
- workflows auxiliares
- necessidade ou não de aprovação humana

---

### Passo 5: Definir a Blindagem Mínima

Declarar qual validação mínima será exigida depois.

Exemplos:

- `trivial bug local` → repro + validação local + lint
- `feature standard com UI` → fluxo principal + UI review + build
- `mudança risky em cálculo` → Domain Verifier + testes/fixures + build
- `mudança structural` → design + contracts + regressão + release disciplinado

---

## 🚫 Fronteiras

Este workflow:

- **não implementa**
- **não debuga**
- **não refatora**
- **não promove para release**
- **não atualiza o MAESTRO**
- **não gera log por padrão**

---

## ✅ Checklist Final

- [ ] O tipo principal foi definido?
- [ ] O risco foi classificado?
- [ ] O workflow principal foi escolhido?
- [ ] A validação mínima foi declarada?
- [ ] A necessidade de aprovação humana foi decidida?
- [ ] A demanda saiu menos ambígua do que entrou?

---

## 📌 Formato de Saída Recomendado

```markdown
**Triage Result**
- Tipo principal: `bug`
- Secundários: `ui`
- Risco: `standard`
- Workflow principal: `Debugger`
- Workflows auxiliares: `UI / Accessibility Review`, `Test / Regression Harness`
- Validação mínima: repro + correção validada + smoke visual + lint/build
- Aprovação humana: não
```

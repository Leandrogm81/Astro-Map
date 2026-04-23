---
description: Workflow para transformar incidentes reais em aprendizado filtrado, melhoria operacional e prevenção de recorrência no AstroMap.
---

# Observability / Incident Review - AstroMap

**Descrição:**  
Use este workflow após incidentes relevantes, regressões repetidas, quebras em produção ou falhas difíceis de detectar.  
O objetivo é extrair aprendizado útil sem transformar cada incidente em regra permanente ou burocracia excessiva.

---

## 🎯 Missão

Converter incidente real em melhoria filtrada: melhor teste, melhor validação, melhor observabilidade, melhor triagem ou, raramente, melhor regra.

---

## 🧭 Princípios

- **Nem todo incidente merece virar regra.**
- **Aprendizado útil vale mais que documentação volumosa.**
- **Primeiro entender a falha, depois pensar em prevenção.**
- **MAESTRO só muda quando a lição for geral, recorrente e curta.**
- **O resultado ideal é prevenção proporcional, não expansão ritual.**

---

## 📥 Quando Acionar

Acione este workflow quando houver:

- incidente relevante
- regressão repetida
- quebra em produção
- bug de difícil diagnóstico
- falha não capturada pela validação atual
- padrão recorrente de erro

---

## 📥 Entradas Esperadas

- descrição do incidente
- evidências úteis
- área afetada
- impacto real
- correção aplicada
- causa raiz, se conhecida
- gaps percebidos no processo atual

---

## 📤 Saídas Obrigatórias

- resumo do incidente
- causa raiz resumida
- lacuna que permitiu a falha
- melhoria proposta
- decisão sobre registro formal
- decisão sobre sugestão ou não ao MAESTRO

---

## 🛠️ Protocolo de Execução

### Passo 1: Resumir o Incidente

Registrar em uma frase:

> “O que aconteceu, onde e com qual impacto?”

---

### Passo 2: Declarar a Causa Raiz

Se conhecida, registrar de forma curta.  
Se ainda não for certa, registrar a melhor hipótese com honestidade.

---

### Passo 3: Identificar a Lacuna

Responder:

- o que deixou essa falha passar?
- faltou triagem?
- faltou contract check?
- faltou fixture?
- faltou smoke?
- faltou validação visual?
- faltou observabilidade?

---

### Passo 4: Escolher a Prevenção Mínima

Selecionar a menor melhoria útil:

- teste direcionado
- ajuste em workflow
- ajuste em validação
- fixture nova
- observabilidade melhor
- incident note
- sugestão para MAESTRO, apenas se passar no filtro

---

### Passo 5: Decidir se Vale Registro Formal

Registrar formalmente apenas se houver valor para:

- rastreabilidade futura
- diagnóstico repetível
- release safety
- aprendizado reaproveitável

Se não houver, não gerar artefato só por ritual.

---

### Passo 6: Aplicar Filtro de MAESTRO

Antes de sugerir mudança ao MAESTRO, responder:

- isso é recorrente?
- isso é geral?
- isso cabe em regra curta?
- isso vale o custo always-on?

Se qualquer resposta crítica for “não”, não promover.

---

## 🚫 Fronteiras

Este workflow:

- **não corrige o bug por si**
- **não substitui DEBUG TRACE**
- **não atualiza MAESTRO automaticamente**
- **não cria log por reflexo**
- **não transforma toda falha em regra**

---

## ✅ Checklist Final

- [ ] O incidente foi resumido com clareza?
- [ ] A causa raiz foi declarada?
- [ ] A lacuna do processo foi identificada?
- [ ] A prevenção mínima foi escolhida?
- [ ] A necessidade de registro formal foi decidida?
- [ ] A sugestão ao MAESTRO passou pelo filtro correto?

---

## 📌 Formato de Saída Recomendado

```markdown
**Incident Review**
- Incidente: export falhou em produção com campo tipado divergente
- Impacto: quebra do fluxo de PDF
- Causa raiz: consumidor ainda usava alias local de contrato
- Lacuna: contract check não foi acionado
- Prevenção mínima:
  - acionar Contract Guardian em mudanças desse tipo
  - adicionar smoke do export
- Registro formal: sim
- Sugestão ao MAESTRO: não, lição muito local
```

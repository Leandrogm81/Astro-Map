---
description: Workflow para conduzir refactors e redução de dívida técnica no AstroMap sem contaminar fluxos de bugfix e feature.
---

# Refactor / Debt Controller - AstroMap

**Descrição:**  
Use este workflow quando a motivação principal da mudança for estrutural: clareza, simplificação, redução de acoplamento, organização interna ou remoção de dívida técnica.  
O objetivo é impedir refactors disfarçados de feature ou bugfix e manter escopo disciplinado.

---

## 🎯 Missão

Executar refactors mínimos e úteis, preservando comportamento e evitando overreach.

---

## 🧭 Princípios

- **Refactor não é desculpa para reescrever metade do sistema.**
- **Preservar comportamento é regra padrão.**
- **Dívida real vale mais do que perfeccionismo abstrato.**
- **Refactor bom reduz risco futuro; refactor ruim cria risco agora.**
- **Se a mudança principal é funcional, não é este workflow.**

---

## 📥 Quando Acionar

Acione este workflow quando a intenção principal for:

- simplificar código
- reduzir duplicação
- organizar estrutura
- melhorar legibilidade
- reduzir acoplamento
- isolar responsabilidade
- preparar área para mudanças futuras sem alterar comportamento agora

---

## 📥 Entradas Esperadas

- área afetada
- problema estrutural percebido
- sintomas da dívida
- limites do refactor
- comportamento que deve ser preservado
- risco vindo do Triage

---

## 📤 Saídas Obrigatórias

- problema estrutural definido
- escopo do refactor
- não-objetivos
- riscos aceitos
- comportamento que deve permanecer intacto
- validação mínima do refactor

---

## 🛠️ Protocolo de Execução

### Passo 1: Declarar a Dívida

Definir o problema real em uma frase.

Exemplos:

- função com múltiplas responsabilidades
- componente profundo demais
- contrato duplicado em várias camadas
- abstração inconsistente
- acoplamento excessivo entre UI e lógica

---

### Passo 2: Delimitar o Escopo

Especificar:

- o que será tocado
- o que não será tocado
- qual fronteira do refactor
- o que seria “refactor bom”
- o que seria “refactor excessivo”

---

### Passo 3: Declarar Preservação de Comportamento

Responder:

- o comportamento deve permanecer idêntico?
- existe algum efeito funcional permitido?
- há contratos ou outputs que não podem mudar?

Se houver mudança funcional relevante, este workflow não é suficiente sozinho.

---

### Passo 4: Escolher a Menor Abordagem Útil

Preferir:

- extração local
- simplificação de fluxo
- alinhamento de naming
- isolamento de lógica
- redução de duplicação

Evitar:

- arquitetura nova por ambição
- abstração genérica prematura
- refactor transversais sem necessidade

---

### Passo 5: Avaliar Risco

Checar:

- risco de regressão
- risco de contrato
- risco de domínio
- risco de diff inflado
- necessidade de Contract Guardian ou Test Harness

---

### Passo 6: Definir Validação

Normally envolverá:

- preservação de comportamento
- testes existentes
- teste direcionado, se necessário
- lint
- build
- smoke do fluxo afetado, quando fizer sentido

---

## 🚫 Fronteiras

Este workflow:

- **não inventa feature**
- **não corrige incidentes complexos disfarçados**
- **não muda comportamento sem declarar**
- **não atualiza MAESTRO**
- **não cria log por reflexo**

---

## ✅ Checklist Final

- [ ] A dívida foi definida com clareza?
- [ ] O escopo do refactor foi delimitado?
- [ ] Os não-objetivos foram declarados?
- [ ] A preservação de comportamento foi explicitada?
- [ ] A menor abordagem útil foi escolhida?
- [ ] A validação do refactor foi definida?

---

## 📌 Formato de Saída Recomendado

```markdown
**Refactor Plan**
- Área: camada de export
- Problema estrutural: lógica de serialização duplicada
- Escopo:
  - centralizar transformação em um ponto
  - remover duplicação local
- Não-objetivos:
  - não alterar contrato
  - não redesenhar fluxo
- Comportamento esperado:
  - output idêntico
- Riscos:
  - drift em campo tipado
- Validação mínima:
  - Contract Guardian
  - build
  - smoke do export
```

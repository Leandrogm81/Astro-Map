---
description: Workflow para validar se uma mudança no AstroMap está tecnicamente pronta para promoção, sem confundir validação com release.
---

# VALIDATE GATE - AstroMap

**Descrição:**  
Use este workflow quando a mudança já foi implementada e precisa provar prontidão técnica antes de seguir para `Release / Rollback`.  
O objetivo é confirmar que a alteração passou pelas verificações corretas, no nível proporcional ao seu risco.

---

## 🎯 Missão

Separar “mudança implementada” de “mudança tecnicamente pronta para promoção”.

---

## 🧭 Princípios

- **Validar não é publicar.**
- **Nem toda mudança exige a mesma profundidade de checagem.**
- **A validação deve seguir o risco.**
- **Diferença entre parecer pronto e estar pronto importa.**
- **Se falta evidência crítica, a mudança ainda não passou pelo gate.**

---

## 📥 Quando Acionar

Acione este workflow depois de:

- `BUILD FLOW`
- `DEBUG TRACE`
- `Refactor / Debt Controller`

e após quaisquer revisões auxiliares necessárias, como:

- `Contract Guardian`
- `Domain Verifier`
- `UI / Accessibility Review`
- `Test / Regression Harness`

---

## 📥 Entradas Esperadas

- descrição da mudança
- risco (`trivial`, `standard`, `risky`, `structural`)
- arquivos alterados
- validação esperada
- evidências já obtidas
- workflows auxiliares acionados
- área principal afetada

---

## 📤 Saídas Obrigatórias

- status de validação
- evidências presentes
- evidências faltantes
- blockers para promoção
- conclusão: `pass`, `pass with conditions` ou `fail`

---

## 🛠️ Protocolo de Execução

### Passo 1: Identificar a Classe da Mudança

Definir:

- `feature`
- `bugfix`
- `refactor`
- `contract`
- `domain`
- `ui`
- `deploy/config`

Se tocar mais de uma classe, registrar a principal e as secundárias.

---

### Passo 2: Ler o Risco

Usar a classificação do Triage:

- `trivial`
- `standard`
- `risky`
- `structural`

A profundidade da validação deve seguir essa classificação.

---

### Passo 3: Conferir Evidência Obrigatória

Checar o que era esperado:

- lint
- build
- teste dirigido
- smoke do fluxo principal
- contract review
- domain verification
- UI review
- outras evidências específicas

Nada deve ser tratado como “feito” sem alguma confirmação real.

---

### Passo 4: Identificar Lacunas

Perguntar:

- ainda falta alguma validação obrigatória?
- há área sensível sem revisão?
- a mudança toca contrato, domínio ou UI crítica sem evidência correspondente?
- o risco real parece maior do que o inicialmente classificado?

Se sim, o gate não passa limpo.

---

### Passo 5: Classificar o Resultado

### `pass`

Quando toda a validação mínima foi cumprida.

### `pass with conditions`

Quando a mudança está quase pronta, mas ainda depende de item pequeno e explícito antes da promoção.

### `fail`

Quando falta evidência crítica ou há inconsistência relevante.

---

### Passo 6: Preparar a Transição

Se o resultado for `pass` ou `pass with conditions`, indicar se pode seguir para:

- `Release / Rollback`

Se for `fail`, indicar para qual workflow deve retornar.

---

## 🚫 Fronteiras

Este workflow:

- **não publica**
- **não faz commit/push por si**
- **não corrige o código**
- **não substitui os workflows especialistas**
- **não atualiza MAESTRO**
- **não cria log por reflexo**

---

## ✅ Checklist Final

- [ ] A classe da mudança foi identificada?
- [ ] O risco foi respeitado?
- [ ] A evidência obrigatória foi conferida?
- [ ] As lacunas foram registradas?
- [ ] O resultado foi classificado com clareza?
- [ ] A próxima rota foi definida?

---

## 📌 Formato de Saída Recomendado

```markdown
**VALIDATE GATE Result**
- Classe principal: `feature`
- Risco: `standard`
- Evidências presentes:
  - lint
  - build
  - smoke do fluxo principal
- Evidências faltantes:
  - UI / Accessibility Review
- Status: `pass with conditions`
- Próxima rota:
  - corrigir revisão de UI
  - depois seguir para Release / Rollback

# Sequências Operacionais do AstroMap

## Regra Geral

**Fluxo padrão:**  
**Intake / Triage → workflow principal → workflows auxiliares → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

**Exceção:**  
Você pode pular o **Intake / Triage** quando o workflow correto já estiver óbvio e o risco for baixo.

---

## 1. Ideia ainda crua, confusa ou ampla

### Sequência principal

**Intake / Triage → PROJECT CANVAS → SPEC STUDIO em DISCOVERY MODE**

### Se a ideia amadurecer logo

**Intake / Triage → PROJECT CANVAS → SPEC STUDIO em PRD MODE**

### Se a ideia já mostrar risco de escopo inflado

**Intake / Triage → PROJECT CANVAS → SPEC STUDIO em MVP MODE**

---

## 2. Você quer montar um PRD

### Sequência principal

**Intake / Triage → SPEC STUDIO em PRD MODE**

### Se a ideia ainda estiver nebulosa

**Intake / Triage → PROJECT CANVAS → SPEC STUDIO em PRD MODE**

### Se depois quiser transformar em plano mais operacional

**Intake / Triage → SPEC STUDIO em PRD MODE → Spec / Change Design**

---

## 3. Você quer montar uma spec sem executar

### Sequência principal

**Intake / Triage → SPEC STUDIO em SPEC MODE**

### Se ainda faltar clareza

**Intake / Triage → SPEC STUDIO em DISCOVERY MODE → SPEC STUDIO em SPEC MODE**

### Se quiser um desenho mais tático antes da execução

**Intake / Triage → SPEC STUDIO em SPEC MODE → Spec / Change Design**

---

## 4. Você quer apenas definir o MVP

### Sequência principal

**Intake / Triage → SPEC STUDIO em MVP MODE**

### Se a ideia ainda estiver aberta demais

**Intake / Triage → PROJECT CANVAS → SPEC STUDIO em MVP MODE**

### Se depois quiser transformar em execução

**Intake / Triage → SPEC STUDIO em MVP MODE → Spec / Change Design → BUILD FLOW**

---

## 5. Feature simples, clara e de baixo risco

### Sequência curta

**BUILD FLOW → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

### Sequência formal

**Intake / Triage → BUILD FLOW → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 6. Feature nova com ambiguidade de escopo

### Sequência principal

**Intake / Triage → Spec / Change Design → BUILD FLOW → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 7. Feature que toca contrato/API/shared types

### Sequência principal

**Intake / Triage → Spec / Change Design → BUILD FLOW → Contract Guardian → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

### Se for simples e clara

**Intake / Triage → BUILD FLOW → Contract Guardian → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 8. Feature que toca lógica astrológica ou output canônico

### Sequência principal

**Intake / Triage → Spec / Change Design → BUILD FLOW → Domain Verifier → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

### Se também tocar contrato

**Intake / Triage → Spec / Change Design → BUILD FLOW → Contract Guardian → Domain Verifier → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 9. Feature com impacto forte de UI

### Sequência principal

**Intake / Triage → Spec / Change Design → BUILD FLOW → UI / Accessibility Review → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

### Se tocar UI e contrato

**Intake / Triage → Spec / Change Design → BUILD FLOW → Contract Guardian → UI / Accessibility Review → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 10. Feature completa, multi-camada

### Sequência principal

**Intake / Triage → Spec / Change Design → BUILD FLOW → Contract Guardian → Domain Verifier → UI / Accessibility Review → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 11. Bug simples e localizado

### Sequência curta

**DEBUG TRACE → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

### Sequência formal

**Intake / Triage → DEBUG TRACE → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 12. Bug de contrato/API

### Sequência principal

**Intake / Triage → DEBUG TRACE → Contract Guardian → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 13. Bug de cálculo ou domínio

### Sequência principal

**Intake / Triage → DEBUG TRACE → Domain Verifier → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

### Se também houver contrato envolvido

**Intake / Triage → DEBUG TRACE → Contract Guardian → Domain Verifier → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 14. Bug visual / quebra de interface

### Sequência principal

**Intake / Triage → DEBUG TRACE → UI / Accessibility Review → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 15. Bug em export/PDF

### Sequência principal

**Intake / Triage → DEBUG TRACE → Contract Guardian → Domain Verifier**

### Se houver UI relevante no output

**→ UI / Accessibility Review → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 16. Regressão descoberta depois de uma mudança recente

### Sequência principal

**Intake / Triage → DEBUG TRACE → workflow auxiliar da área afetada → Test / Regression Harness → VALIDATE GATE → Release / Rollback → Observability / Incident Review**

---

## 17. Incidente em produção

### Sequência principal

**Intake / Triage → DEBUG TRACE → Contract Guardian ou Domain Verifier ou UI / Accessibility Review → Test / Regression Harness → VALIDATE GATE → Release / Rollback → Observability / Incident Review**

---

## 18. Mudança de configuração, provider, model ID ou integração externa

### Sequência principal

**Intake / Triage → Contract Guardian → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

### Se houver execução de mudança funcional também

**Intake / Triage → Spec / Change Design → BUILD FLOW → Contract Guardian → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 19. Refactor puro, sem mudança funcional

### Sequência principal

**Intake / Triage → Refactor / Debt Controller → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 20. Refactor que toca contratos

### Sequência principal

**Intake / Triage → Refactor / Debt Controller → Contract Guardian → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 21. Refactor que toca domínio

### Sequência principal

**Intake / Triage → Refactor / Debt Controller → Domain Verifier → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 22. Refactor com impacto visual perceptível

### Sequência principal

**Intake / Triage → Refactor / Debt Controller → UI / Accessibility Review → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 23. Revisão de contrato sem feature ou bug

### Sequência principal

**Intake / Triage → Contract Guardian → Test / Regression Harness → VALIDATE GATE**

---

## 24. Revisão de domínio sem implementação grande

### Sequência principal

**Intake / Triage → Domain Verifier → Test / Regression Harness → VALIDATE GATE**

---

## 25. Revisão de UI sem alteração grande de lógica

### Sequência principal

**Intake / Triage → UI / Accessibility Review → Test / Regression Harness → VALIDATE GATE**

---

## 26. Quando você quer só validar uma mudança já pronta

### Sequência principal

**VALIDATE GATE → Release / Rollback**

### Se faltar evidência

**VALIDATE GATE → workflow faltante → VALIDATE GATE → Release / Rollback**

**Exemplo:**  
**VALIDATE GATE → UI / Accessibility Review → VALIDATE GATE → Release / Rollback**

---

## 27. Quando a mudança falha no VALIDATE GATE

### Sequência padrão

**VALIDATE GATE → workflow correto para corrigir a lacuna → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

### Exemplos

- faltou contrato → `Contract Guardian`
- faltou domínio → `Domain Verifier`
- faltou UI → `UI / Accessibility Review`
- faltou correção real → `DEBUG TRACE`
- faltou ajuste funcional → `BUILD FLOW`

---

## 28. Quando você quer só fazer brainstorming inicial

### Sequência principal

**PROJECT CANVAS**

### Se amadurecer

**PROJECT CANVAS → SPEC STUDIO em DISCOVERY MODE**  
ou  
**PROJECT CANVAS → SPEC STUDIO em PRD MODE**

---

## 29. Quando você quer sair de brainstorming para execução

### Sequência completa

**PROJECT CANVAS → SPEC STUDIO → Spec / Change Design → BUILD FLOW → workflows auxiliares → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 30. Quando a demanda chega misturada e confusa

### Sequência principal

**Intake / Triage → workflow principal escolhido → workflows auxiliares conforme necessidade → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

---

## 31. Quando você já sabe exatamente o workflow certo

### Sequência direta possível

**workflow correto → auxiliares, se necessários → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

### Exemplos

- `SPEC STUDIO em PRD MODE`
- `DEBUG TRACE`
- `BUILD FLOW`

---

## 32. Cadeias-padrão resumidas

### Planejamento de projeto

**Intake / Triage → PROJECT CANVAS → SPEC STUDIO**

### Planejamento mais tático

**Intake / Triage → SPEC STUDIO → Spec / Change Design**

### Construção

**Intake / Triage → BUILD FLOW → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

### Correção

**Intake / Triage → DEBUG TRACE → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

### Refactor

**Intake / Triage → Refactor / Debt Controller → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

### Incidente relevante

**Intake / Triage → DEBUG TRACE → auxiliares da área → Test / Regression Harness → VALIDATE GATE → Release / Rollback → Observability / Incident Review**

---

## 33. Regra de bolso para decidir rápido

**Ideia nebulosa** → `PROJECT CANVAS`  
**Documento de planejamento** → `SPEC STUDIO`  
**Mudança já definida, mas ainda tática** → `Spec / Change Design`  
**Construir** → `BUILD FLOW`  
**Corrigir** → `DEBUG TRACE`  
**Contrato** → `Contract Guardian`  
**Domínio** → `Domain Verifier`  
**UI** → `UI / Accessibility Review`  
**Blindagem** → `Test / Regression Harness`  
**Provar prontidão** → `VALIDATE GATE`  
**Promover** → `Release / Rollback`  
**Refactor** → `Refactor / Debt Controller`  
**Aprender com incidente** → `Observability / Incident Review`

---

## 34. Sequências mais usadas no dia a dia

1. **Intake / Triage → PROJECT CANVAS → SPEC STUDIO**
2. **Intake / Triage → SPEC STUDIO → Spec / Change Design**
3. **Intake / Triage → BUILD FLOW → Test / Regression Harness → VALIDATE GATE → Release / Rollback**
4. **Intake / Triage → BUILD FLOW → Contract Guardian → Test / Regression Harness → VALIDATE GATE → Release / Rollback**
5. **Intake / Triage → BUILD FLOW → Domain Verifier → Test / Regression Harness → VALIDATE GATE → Release / Rollback**
6. **Intake / Triage → DEBUG TRACE → Test / Regression Harness → VALIDATE GATE → Release / Rollback**
7. **Intake / Triage → DEBUG TRACE → Contract Guardian/Domain Verifier/UI Review → Test / Regression Harness → VALIDATE GATE → Release / Rollback**
8. **Intake / Triage → Refactor / Debt Controller → Test / Regression Harness → VALIDATE GATE → Release / Rollback**

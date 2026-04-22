---
description: Workflow de promoção controlada de mudanças no AstroMap, com disciplina de release e capacidade explícita de rollback.
---

# Release / Rollback - AstroMap

**Descrição:**  
Use este workflow depois que a mudança já tiver passado por validação técnica.  
O objetivo é decidir se a alteração está pronta para promoção, garantir que o escopo publicado é exatamente o pretendido e preservar capacidade clara de recuo.

---

## 🎯 Missão

Separar **código validado** de **mudança pronta para entrar em circulação**, com revisão final de escopo, risco e rollback.

---

## 🧭 Princípios

- **Validar não é publicar.**
- **Publicar não é despejar tudo o que está no working tree.**
- **Release deve ser seletiva, legível e reversível.**
- **Toda promoção deve ter escopo claro.**
- **Quanto maior o risco, maior a disciplina de release.**

---

## 📥 Quando Acionar

Acione após:

- Deploy / Validate aprovado
- revisão do diff concluída
- testes/build/smokes necessários concluídos
- decisão de promover a mudança

---

## 📥 Entradas Esperadas

- diff final
- branch atual
- arquivos alterados
- risco da mudança
- resultado da validação
- áreas sensíveis tocadas
- nota curta do que mudou

---

## 📤 Saídas Obrigatórias

- decisão `go/no-go`
- escopo final da release
- staging seletivo
- mensagem de commit adequada
- plano de rollback
- nota curta de monitoramento pós-promoção

---

## 🛠️ Protocolo de Execução

### Passo 1: Confirmar Prontidão Técnica

Verificar se já existe evidência de:

- lint
- testes exigidos
- build
- smoke dirigido, quando necessário
- validações auxiliares por contrato/domínio/UI

Se algo obrigatório ainda não passou, a release não avança.

---

### Passo 2: Revisar Escopo Real

Conferir:

- quais arquivos mudaram
- se há arquivos inesperados
- se há outputs acidentais
- se há mudanças fora do pedido
- se o diff está mais largo do que deveria

Qualquer ruído aqui deve ser resolvido antes da promoção.

---

### Passo 3: Decidir `Go / No-Go`

### `Go`

Quando:

- a validação mínima foi cumprida
- o diff está limpo
- o escopo está claro
- o risco é aceitável

### `No-Go`

Quando:

- falta evidência crítica
- o diff está contaminado
- há ambiguidade relevante
- rollback seria obscuro
- escopo real não bate com a intenção

---

### Passo 4: Fazer Staging Seletivo

**Nunca** promover por hábito com seleção indiscriminada.

A promoção deve incluir apenas:

- arquivos necessários
- logs/notes úteis quando justificados
- nada temporário ou acidental

---

### Passo 5: Preparar Commit

A mensagem deve:

- seguir o padrão do projeto
- representar o escopo real
- não esconder refactor, fix e feature no mesmo rótulo sem necessidade

---

## Passo 6: Declarar Rollback

Antes do push/promoção, declarar:

- o que desfazer se necessário
- qual parte é mais sensível
- qual sinal indicaria reversão
- se rollback é simples ou exige cuidado adicional

---

### Passo 7: Registrar Nota Curta de Release

A nota deve ser curta e útil:

- o que entrou
- área afetada
- risco
- o que observar depois

Só registrar formalmente quando houver valor operacional.

---

## 🔍 Perguntas Obrigatórias

1. O código está validado ou só “parece funcionar”?
2. O diff final corresponde exatamente ao pedido?
3. Há arquivos que não deveriam entrar?
4. O rollback está claro?
5. O risco de promoção foi declarado honestamente?

---

## 🚫 Fronteiras

Este workflow:

- **não implementa**
- **não corrige bugs**
- **não valida sozinho o código**
- **não usa staging indiscriminado**
- **não cria log por reflexo**
- **não atualiza MAESTRO**

---

## ✅ Checklist Final

- [ ] A validação técnica necessária foi concluída?
- [ ] O diff foi revisado?
- [ ] O escopo real da release está limpo?
- [ ] O staging foi seletivo?
- [ ] Há decisão explícita de go/no-go?
- [ ] O rollback foi pensado?
- [ ] A release ficou mais segura, não só mais rápida?

---

## 📌 Formato de Saída Recomendado

```markdown
**Release Decision**
- Status: `GO`
- Risco: `standard`
- Escopo: ajuste em contrato + correção do consumidor
- Arquivos promovidos: [lista]
- Arquivos excluídos: [lista, se houver]
- Commit: `fix: align BirthData contract in export flow`
- Rollback: reverter commit se export falhar no smoke pós-promoção
- Monitorar: fluxo de export PDF
```

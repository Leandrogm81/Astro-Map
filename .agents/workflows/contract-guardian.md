---
description: Workflow de proteção de contratos, tipos compartilhados e nomes canônicos entre camadas do AstroMap.
---

# Contract Guardian - AstroMap

**Descrição:**  
Use este workflow sempre que uma mudança tocar contratos entre camadas, payloads, tipos compartilhados, serialização, integrações externas, IDs de modelo, chaves de configuração ou exportadores/consumidores de dados.

---

## 🎯 Missão

Evitar drift estrutural entre frontend, backend, tipos compartilhados e integrações, preservando consistência de nomes, formatos, campos e source of truth.

---

## 🧭 Princípios

- **Campos canônicos devem permanecer idênticos entre camadas.**
- **Shared types são a fonte principal quando existirem.**
- **Não criar aliases locais para dados compartilhados sem justificativa forte.**
- **Não mudar contrato por conveniência de um único arquivo.**
- **Nunca confiar em memória para IDs externos ou chaves de config.**

---

## 📥 Quando Acionar

Acione este workflow se a mudança tocar:

- payloads de API
- `src/types/` ou equivalentes
- serialização/deserialização
- contratos frontend ↔ backend
- export/PDF com dados tipados
- integrações com modelos, provedores ou configs externas
- nomes de campos compartilhados
- respostas de erro/JSON

---

## 📥 Entradas Esperadas

- arquivos afetados
- tipos compartilhados
- contratos atuais
- payload novo ou alterado
- endpoints envolvidos
- campos renomeados
- configs ou IDs externos afetados

---

## 📤 Saídas Obrigatórias

- inconsistências encontradas
- source of truth identificado
- ajustes necessários
- risco de backward incompatibility
- validação mínima de contrato

---

## 🛠️ Protocolo de Execução

### Passo 1: Identificar o Contrato Real

Definir claramente qual contrato está em jogo:

- request body
- response body
- shared type
- interface de exportação
- config key
- model ID
- formato de erro

---

### Passo 2: Encontrar a Fonte da Verdade

Prioridade padrão:

1. shared types
2. contrato documentado do projeto
3. implementação consolidada
4. documentação externa oficial, quando aplicável

Se a fonte da verdade não estiver clara, registrar isso explicitamente.

---

### Passo 3: Comparar as Camadas

Verificar, no mínimo:

- nomes dos campos
- tipos
- nulabilidade/opcionalidade
- nomes de erro
- shape do JSON
- serialização
- compatibilidade com exportadores e consumidores

---

### Passo 4: Procurar Drift

Checar sinais comuns de drift:

- `lat/lng` vs `latitude/longitude`
- nomes diferentes para o mesmo campo
- frontend esperando shape diferente do backend
- tipo compartilhado desatualizado
- erro retornando texto quando o cliente espera JSON
- IDs/configs alterados sem confirmação na fonte oficial

---

### Passo 5: Decidir a Correção Estrutural Mínima

A correção deve:

- preservar o contrato canônico
- reduzir duplicação
- evitar alias desnecessário
- tocar o menor número possível de arquivos

---

### Passo 6: Definir Validação

Escolher validação adequada:

- contract test
- checagem tipada
- verificação de response shape
- build
- smoke do fluxo consumidor

---

## 🔍 Perguntas Obrigatórias

Antes de encerrar, responder:

1. Qual é a fonte da verdade?
2. Houve renomeação real de contrato ou só conveniência local?
3. Existe risco de quebrar consumidor antigo?
4. O frontend e o backend agora falam exatamente o mesmo idioma?
5. Algum ID/config externo foi alterado sem verificação oficial?

---

## 🚫 Fronteiras

Este workflow:

- **não implementa feature inteira**
- **não substitui o Test / Regression Harness**
- **não redesenha UI**
- **não atualiza MAESTRO por padrão**
- **não cria log por reflexo**

---

## ✅ Checklist Final

- [ ] A fonte da verdade foi identificada?
- [ ] Os nomes dos campos estão idênticos entre camadas?
- [ ] Os tipos estão coerentes?
- [ ] O shape de erro/JSON está correto?
- [ ] O risco de incompatibilidade foi avaliado?
- [ ] A validação de contrato foi definida?

---

## 📌 Formato de Saída Recomendado

```markdown
**Contract Review**
- Contrato avaliado: `BirthData`
- Fonte da verdade: `src/types/index.ts`
- Drift encontrado: `lat/lng` em exportador
- Correção mínima: alinhar exportador para `latitude/longitude`
- Backward compatibility: sem impacto externo
- Validação mínima: type-check + build + smoke do export
```

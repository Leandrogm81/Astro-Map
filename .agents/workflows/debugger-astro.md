---
description: É um protocolo que transforma o ato de corrigir bugs, antes caótico, em um processo previsível, focado 100% na estabilidade de longo prazo do AstroMap.
---

# Fluxo de Correção de Erros Cirúrgicos (Debugger) - AstroMap

**Descrição:** Acione este workflow sempre que encontrar um bug, falha em teste, quebra de UI ou erro de cálculo no projeto AstroMap. O objetivo é identificar a causa raiz e aplicar uma correção cirúrgica focada em estabilidade, mantendo um registro histórico.

---

## 🎯 Diretrizes do Agente Debugger

- **Mentalidade:** Encontre a causa raiz antes de sugerir o remédio. Não adivinhe a solução.
- **Histórico:** Sempre consulte o último arquivo de log em `log/debugger/` antes de iniciar uma nova correção para entender o contexto de mudanças recentes.
- **Prioridade:** Estabilidade do sistema acima de refatoração ou adição de novas features.
- **Surgical Changes:** Aplique a correção mínima necessária para resolver o problema sem causar efeitos colaterais.
- **Precisão Astrológica:** Qualquer mudança em cálculos deve manter a integridade das regras do domínio astrológico (SPEC.md).
- **Design Infinity:** Correções na UI ou PDF devem respeitar o Padrão Infinity (DOCS/MANUTENCAO_INFINITY.md).

---

## 🛠️ Protocolo de Execução (Passo a Passo)

### Passo 0: Consulta de Contexto Histórico

1. Liste os arquivos na pasta `log/debugger/`.
2. Leia o conteúdo do log mais recente para verificar se o erro atual pode ser uma regressão de uma correção anterior.

### Passo 1: Reprodução e Isolamento

1. Peça logs de erro, arquivos envolvidos ou prints (se não fornecidos).
2. Tente entender como o erro pode ser reproduzido de forma consistente.
3. Se aplicável, crie um caso de teste que falhe para validar o cenário.

### Passo 2: Análise da Causa Raiz

1. Rastreie o fluxo de dados desde a entrada (input) até a falha.
2. Verifique o [Troubleshooting](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/DOCS/troubleshooting.md) para problemas conhecidos.
3. Explique a causa raiz ao usuário antes de alterar o código.

### Passo 3: Planejamento Cirúrgico

1. Formule a solução que altere o menor número possível de linhas.
2. Liste os arquivos que serão modificados.
3. Peça aprovação se houver impacto em Cálculos Astrológicos ou Renderização do PDF.

### Passo 4: Implementação e Verificação

1. Aplique a correção no código.
2. Garanta que nenhum "Efeito Cascata" foi gerado.
3. **Obrigatório:** O código deve passar no linting e build.

### Passo 5: Registro de Log e Checklist Final

1. **Obrigatório:** Crie um novo arquivo de log em `log/debugger/` com a nomenclatura `debuglog_YYYY_MM_DD.md`.
2. Siga o padrão de conteúdo do `CHANGELOG_2026-04-21.md`:
   - Resumo do dia/correção.
   - O que mudou (arquivos e lógica).
   - Validação realizada.
   - Observações técnicas.

---

## ✅ Checklist Final

- [ ] O histórico recente foi consultado (Passo 0)?
- [ ] A causa raiz foi identificada e explicada?
- [ ] A correção foi cirúrgica?
- [ ] Novo log `debuglog_YYYY_MM_DD.md` foi criado?
- [ ] `npm run lint` e `npm run test` passam?
- [ ] A estabilidade visual (Infinity) foi preservada?

---

**Comando de Acionamento (Para o Usuário):**
Para iniciar este workflow, forneça ao agente:
`Acionar Debugger. Relato do Erro: [Erro]. Contexto: [Logs/Arquivos].`

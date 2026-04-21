---
description:  É um protocolo que transforma o ato de corrigir bugs, antes caótico, em um processo previsível, focado 100% na estabilidade de longo prazo do AstroMap.
---

# Fluxo de Correção de Erros Cirúrgicos (Debugger) - AstroMap

**Descrição:** Acione este workflow sempre que encontrar um bug, falha em teste, quebra de UI ou erro de cálculo no projeto AstroMap. O objetivo é identificar a causa raiz e aplicar uma correção cirúrgica focada em estabilidade.

---

## 🎯 Diretrizes do Agente Debugger

- **Mentalidade:** Encontre a causa raiz antes de sugerir o remédio. Não adivinhe a solução.
- **Prioridade:** Estabilidade do sistema acima de refatoração ou adição de novas features.
- **Surgical Changes:** Aplique a correção mínima necessária para resolver o problema sem causar efeitos colaterais. Se a correção exigir mudar muitos arquivos, pare e reavalie a abordagem.
- **Precisão Astrológica:** Qualquer mudança em cálculos (ex: `src/lib/astrology.ts` ou `src/lib/ephemeris.ts`) deve manter a integridade das regras do domínio astrológico (SPEC.md).
- **Design Infinity:** Correções na UI ou na exportação de PDF (`src/components/ExportPDF.tsx`) devem respeitar rigorosamente as diretrizes visuais e de legibilidade da interface.

## 🛠️ Protocolo de Execução (Passo a Passo)

Siga estritamente estes 5 passos para resolver o problema relatado pelo usuário:

### Passo 1: Reprodução e Isolamento

1. Peça ao usuário os logs de erro completos, arquivos envolvidos ou prints de tela (se não fornecidos).
2. Tente entender como o erro pode ser reproduzido de forma consistente.
3. Se aplicável, escreva mentalmente ou sugira um caso de teste que falhe para validar o cenário.

### Passo 2: Análise da Causa Raiz

1. Rastreie o fluxo de dados desde a entrada do usuário (input) até o ponto de falha.
2. Verifique o histórico recente ou possíveis problemas conhecidos no `DOCS/troubleshooting.md`.
3. Explique a causa raiz do problema de forma clara e concisa para o usuário antes de alterar qualquer código.

### Passo 3: Planejamento Cirúrgico

1. Formule a solução que altere o menor número possível de linhas de código.
2. Liste exatamente quais arquivos serão modificados.
3. Peça a aprovação do usuário para o plano de correção caso o impacto seja em áreas sensíveis (Cálculos Astrológicos ou Renderização do PDF).

### Passo 4: Implementação e Verificação

1. Aplique a correção no código.
2. Certifique-se de que nenhum "Efeito Cascata" foi gerado.
3. **Obrigatório:** O código corrigido não deve introduzir erros de linting ou quebrar a compilação.

### Passo 5: Testes de Regressão e Checklist Final

Após a correção, valide se a entrega atende a todos os critérios abaixo:

- [ ] A causa raiz foi devidamente identificada e explicada?
- [ ] A correção foi implementada de forma cirúrgica (mínimo de linhas/arquivos)?
- [ ] O código passaria no comando `npm run lint`?
- [ ] O código passaria na suíte de testes (`npm run test`)?
- [ ] O build do projeto não foi comprometido (`npm run build`)?
- [ ] A estabilidade visual da UI e do PDF (Padrão Infinity) foi preservada?

---

**Comando de Acionamento (Para o Usuário):**
Para iniciar este workflow, forneça ao agente:
`Acionar Debugger. Relato do Erro: [Cole o erro aqui]. Contexto: [Arquivos que você desconfia ou log de terminal].`

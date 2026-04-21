# 📋 Template de Plano de Tarefa — AstroMap

> **Uso:** Este template deve ser preenchido pelo **Planner** ao analisar um novo requisito.
> 
> **Referências:** Consulte `AGENTS.md` (perfis de agentes), `SPEC.md` (especificação técnica), `GEMINI.MD` (regras do projeto) e `CLAUDE.md` (guidelines behaviorais).

---

## 🎯 1. Objetivo

**Descrição clara do que precisa ser implementado:**

[Descreva em 2-3 frases o objetivo da tarefa. Seja específico sobre o resultado esperado.]

**Exemplo:** _Implementar o sistema de Progressão Secundária para cálculo de posições planetárias em datas futuras, permitindo ao usuário visualizar mapas progressos e gerar relatórios interpretativos._

---

## 🏗️ 2. Arquitetura Proposta

### 2.1 Visão Geral

[Descreva a abordagem arquitetural. Inclua diagrama mental ou referência a fluxos da SPEC.md.]

```
[Componente A] → [Função B] → [Store C] → [API D]
```

### 2.2 Decisões Técnicas

| Decisão | Justificativa | Alternativas Consideradas |
|---------|---------------|---------------------------|
| [Ex: Usar cálculo client-side] | [Porquê] | [Alternativa e porquê descartada] |
| [Ex: Novo tipo de relatório] | [Porquê] | [Alternativa e porquê descartada] |

### 2.3 Impacto em Componentes Existentes

- **Modificações:** [Lista componentes que serão alterados]
- **Novos Componentes:** [Lista componentes a criar]
- **Sem Impacto:** [Componentes que permanecem inalterados]

---

## 📁 3. Lista de Arquivos

### 3.1 Arquivos a Criar

| Arquivo | Tipo | Responsabilidade | Complexidade |
|---------|------|------------------|--------------|
| `src/lib/progression.ts` | Lib | Cálculo de progressão secundária | Média |
| `src/components/ProgressionView.tsx` | Componente | Visualização do mapa progresso | Baixa |
| `src/__tests__/progression.test.ts` | Teste | Validação de cálculos | Média |

### 3.2 Arquivos a Alterar

| Arquivo | Alteração | Motivo |
|---------|-----------|--------|
| `src/lib/ephemeris.ts` | Adicionar `calculateProgression()` | Reutilizar lógica de cálculo de posições |
| `src/components/BirthForm.tsx` | Adicionar campo "Data Progresso" | Input para data alvo |
| `src/types/index.ts` | Adicionar `ProgressionChart` type | Tipagem do novo objeto |

### 3.3 Arquivos de Referência (Não Alterar)

- `src/lib/astrology.ts` — [Porquê não precisa mudar]
- `src/app/api/report/route.ts` — [Porquê não precisa mudar]

---

## 🧪 4. Testes Necessários

### 4.1 Testes Unitários

| Caso de Teste | Entrada | Saída Esperada | Arquivo de Teste |
|---------------|---------|----------------|------------------|
| Progressão 1 ano | Data natal + 1 ano | Posição solar avançada ~1° | `progression.test.ts` |
| Progressão 30 anos | Data natal + 30 anos | Progressão completa | `progression.test.ts` |
| Data inválida | Data anterior ao nascimento | Erro tratado | `progression.test.ts` |

### 4.2 Testes de Integração

- [ ] Fluxo completo: Formulário → Cálculo → Visualização
- [ ] Teste de snapshot do componente ProgressionView
- [ ] Validação contra efemérides de referência (dados conhecidos)

### 4.3 Testes de Edge Case

| Cenário | Comportamento Esperado |
|---------|------------------------|
| Data muito no futuro (>100 anos) | Cálculo realizado com aviso de precisão reduzida |
| Data no passado | Mensagem de erro clara |
| Coordenadas diferentes do natal | Aplicar mesma latitude/longitude do mapa natal |

---

## ⚠️ 5. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| [Ex: Erro de cálculo em datas distantes] | Média | Alto | Validação contra efemérides online; testes com dados conhecidos |
| [Ex: Performance lenta] | Baixa | Médio | Cálculo incremental; cache de resultados |
| [Ex: Compatibilidade com sistemas de casas] | Média | Médio | Testar ambos Placidus e Whole Signs |

---

## 📊 6. Estimativa de Esforço

| Atividade | Tempo Estimado | Responsável |
|-----------|----------------|-------------|
| Análise e planejamento detalhado | 30 min | Planner |
| Implementação lib/ (cálculos) | 2-3 horas | Coder |
| Implementação componentes UI | 1-2 horas | Coder |
| Criação de testes | 1-2 horas | Tester |
| Review e ajustes | 1 hora | Reviewer |
| Documentação | 30 min | Documenter |
| **Total Estimado** | **6-9 horas** | — |

**Complexidade:** [ ] Baixa [x] Média [ ] Alta

---

## ✅ 7. Checklist de Aceitação (Definition of Done)

Antes de marcar a tarefa como completa, verificar:

### Funcional
- [ ] Funcionalidade implementada conforme objetivo
- [ ] Todos os casos de teste unitário passam
- [ ] Testes de integração passam
- [ ] Edge cases tratados apropriadamente

### Qualidade (GEMINI.MD)
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` sucede
- [ ] `npm run test` — 100% cobertura em código novo
- [ ] TypeScript strict mode satisfeito
- [ ] Nenhum `any` ou tipagem implícita

### Código (CLAUDE.md)
- [ ] Simplicity First aplicado (mínimo código necessário)
- [ ] Surgical Changes (apenas o que precisa ser alterado)
- [ ] Funções com no máximo 50 linhas
- [ ] Nome de variáveis claros e consistentes

### Segurança (GEMINI.MD §4)
- [ ] Inputs validados (ranges, formatos)
- [ ] Nenhuma credencial hardcoded
- [ ] Tratamento de erros implementado
- [ ] Logging estruturado onde aplicável

### Documentação
- [ ] Código comentado onde necessário (complexidade astrológica)
- [ ] README.md atualizado (se feature visível ao usuário)
- [ ] SPEC.md atualizado (se mudança arquitetural)
- [ ] docs/ atualizados conforme necessário

---

## 📝 8. Notas do Planner

[Espaço para anotações adicionais, descobertas durante análise, referências úteis, etc.]

### Descobertas Técnicas
- 

### Referências Úteis
- Documentação astronomy-engine: [link]
- Artigo sobre Progressão Secundária: [link]
- Issue relacionada: #123

### Dúvidas para o Humano
1. 

---

## 🔄 9. Histórico de Revisão

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0 | [data] | Planner [nome] | Criação inicial do plano |
| 1.1 | [data] | [nome] | [descrição das alterações] |

---

**Status do Plano:** [ ] Rascunho [ ] Aguardando Aprovação Humana [ ] Aprovado [ ] Em Execução [ ] Concluído

**Aprovado por:** _______________ **Data:** _______________

---

*Template versão 1.0 | AstroMap | Use em conjunto com AGENTS.md, SPEC.md, GEMINI.MD e CLAUDE.md*

# PRD — Máquina do Tempo 2.0 (Scanner de Eletivas)

## 1. Resumo Executivo

A "Máquina do Tempo 2.0" é uma evolução do módulo de Eletiva Mágica do AstroMap. Ela adiciona ao painel de eletiva existente uma visualização visual do céu (mandala astrológica) e controles de navegação temporal que permitem ao usuário explorar manualmente diferentes momentos no tempo. O objetivo é facilitar a identificação visual de janelas propícias para rituais e intenções mágicas, sem depender apenas da pontuação numérica.

---

## 2. Objetivo do Produto

**Objetivo principal:** Permitir que o usuário visualize o estado do céu em qualquer momento escolhido e navegue temporalmente de forma intuitiva, integrando a mandala astrológica (`TraditionalChart`) ao painel de eletiva existente.

**Resultado esperado:** O usuário consegue:

- Ver a mandala astrológica do momento atual ou de qualquer momento selecionado
- Navegar no tempo usando botões de ajuste rápido (-1d, -1h, +1h, +1d)
- Observar como o veredito, a hora planetária e a mandala se atualizam em sincronia

---

## 3. Problema a Resolver

Atualmente, o módulo de eletiva permite apenas a visualização do momento atual ou de uma data/hora inserida manualmente. Para encontrar momentos propícios, o usuário precisa:

- Inserir manualmente diferentes datas/horas
- Gerar relatórios repetidamente
- Não tem feedback visual imediato de como o céu muda

**Dor:** O processo de exploração temporal é lento, manual e não visual. Usuários perdem tempo tentando diferentes momentos sem uma forma rápida de avaliar visualmente o estado do céu.

**Oportunidade:** Adicionar uma mandala interativa com controles de navegação temporal transforma a exploração em um processo visual, intuitivo e eficiente.

---

## 4. Público-Alvo e Personas

| Persona | Necessidade |
|---------|-------------|
| **Astrologues profissionais** | Encontrar rapidamente janelas propícias para clientes, explorando diferentes datas/horas visualmente |
| **Praticantes de magia ritualística** | Identificar o momento ideal para rituais, visualizando a configuração planetária |
| **Estudantes de astrologia tradicional** | Aprender como o céu muda ao longo do tempo, observando padrões visuais |

---

## 5. Escopo do MVP

O MVP inclui **apenas** o que está descrito no plano de implementação original:

1. **Integração do `TraditionalChart`** no `TraditionalElectivePanel.tsx`
2. **Botões de navegação temporal** (-1d, -1h, +1h, +1d) na seção "Máquina do Tempo"
3. **Lógica de ajuste temporal** (`adjustTime(amount, unit)`) que atualiza `targetDateStr` e `targetTimeStr`
4. **Desativação automática de `isRealTime`** quando o usuário ajusta manualmente o tempo
5. **Atualização instantânea do gráfico** quando o tempo muda (de-bounced pela lógica de efeito existente)
6. **Estado de carregamento** (overlay) sobre o gráfico enquanto o `skyChart` é recalculado
7. **Botão de reset "Agora"** que reativa `isRealTime` e retorna o painel ao momento atual
8. **Suporte ao modo `sky_plus_natal`** — cruzamento do mapa natal do usuário com o céu eletivo (funcionalidade já existente no código)

---

## 6. Fora de Escopo

As funcionalidades abaixo **NÃO** devem ser implementadas nesta versão:

| Item | Motivo |
|------|--------|
| Navegação automática (play/pause temporal) | Complexidade extra, não essencial para o MVP |
| Busca automática de momentos propícios | Requer algoritmo de otimização, fora do escopo |
| Exportação da mandala como imagem ou PDF | Funcionalidade existente no AstroChart, não no TraditionalChart |
| Comparação visual de dois momentos lado a lado | Requer múltiplas instâncias do gráfico, alta complexidade |
| Animações de transição entre momentos | Cosmético, não funcional |
| Navegação por arrasto temporal (timeline drag) | UX complexa, pode ser adicionada depois |
| Modificações no componente `TraditionalChart` | Apenas consumo, sem alterações no componente |

---

## 7. Funcionalidades Principais

### 7.1 Visualização do Céu (Mandala)

**Objetivo:** Exibir a mandala astrológica do momento selecionado dentro do painel de eletiva.

**Comportamento esperado:**

- O componente `TraditionalChart` é renderizado dentro de um card na coluna da direita do painel
- A mandala reflete o estado do céu para a data/hora atualmente selecionada (`targetDateStr` + `targetTimeStr`)
- A mandala atualiza automaticamente quando o tempo muda

**Regras:**

- O `TraditionalChart` recebe como prop o objeto `NatalChart` calculado para o momento selecionado
- O componente é reutilizado **sem modificações** — apenas importado e integrado
- A renderização do SVG não deve causar lentidão perceptível na interface

**Critérios de aceite:**

- [ ] A mandala aparece no painel de eletiva para qualquer momento selecionado
- [ ] A mandala reflete corretamente as posições planetárias do momento
- [ ] A mandala atualiza quando o usuário muda a data/hora
- [ ] Não há lentidão perceptível durante a renderização

---

### 7.2 Navegação Temporal Manual

**Objetivo:** Permitir que o usuário ajuste o tempo rapidamente usando botões de incremento/decremento.

**Comportamento esperado:**

- Quatro botões são exibidos na seção "Máquina do Tempo": `-1d`, `-1h`, `+1h`, `+1d`
- Cada clique ajusta a data/hora selecionada pela quantidade indicada
- O ajuste é refletido imediatamente na mandala, no veredito e na hora planetária

**Regras:**

- Qualquer ajuste manual define `isRealTime` como `false`
- A função `adjustTime(amount, unit)` deve gerenciar corretamente a virada de data:
  1. Converter as strings `targetDateStr` + `targetTimeStr` em um único objeto `Date`
  2. Aplicar o ajuste temporal (`amount`, `unit`) sobre esse objeto `Date`
  3. Formatar os valores resultantes separadamente para `targetDateStr` (YYYY-MM-DD) e `targetTimeStr` (HH:MM)
- O formato de data permanece `YYYY-MM-DD` e o formato de hora permanece `HH:MM`
- Não há limites mínimos ou máximos para navegação temporal
- Se o usuário estiver às 23:30 e clicar em `+1h`, a data deve avançar para o dia seguinte (00:30)

**Critérios de aceite:**

- [ ] Cada botão (-1d, -1h, +1h, +1d) ajusta corretamente a data/hora
- [ ] Ajustes que cruzam meia-noite (23:30 + 1h) ou meio-dia (00:30 - 1h) atualizam corretamente a data
- [ ] O campo `isRealTime` é definido como `false` após qualquer ajuste manual
- [ ] A mandala, o veredito e a hora planetária atualizam em sincronia
- [ ] Feedback visual indica o momento atualmente selecionado

---

### 7.3 Sincronização com Veredito

**Objetivo:** Garantir que o veredito e a hora planetária se atualizem quando o usuário navega no tempo.

**Comportamento esperado:**

- Quando o usuário ajusta o tempo, o sistema recalcula o `skyChart` para o novo momento
- O veredito (pontuação) é recalculado com base no novo estado do céu
- A hora planetária é recalculada para o novo momento

**Regras:**

- O recálculo segue a mesma lógica existente no módulo de eletiva
- O `skyChart` é recalculado de forma assíncrona (não bloqueia a UI)
- Um overlay de carregamento é exibido sobre o gráfico durante o recálculo
- Qualquer ajuste manual de tempo mantém o `magicInsight` existente visível, mas exibe um banner de aviso indicando que o relatório pertence ao momento anterior. O usuário decide quando gerar um novo relatório para o novo momento

**Critérios de aceite:**

- [ ] O veredito é recalculado corretamente para cada momento selecionado
- [ ] A hora planetária é recalculada corretamente
- [ ] O overlay de carregamento aparece durante o recálculo e desaparece após conclusão

### 7.4 Modo Sky + Natal (Cruzamento Natal + Eletiva)

**Objetivo:** Integrar o mapa natal do usuário ao veredito eletivo, permitindo análise comparativa.

**Comportamento esperado:**

- O componente já possui seletor de modo (`sky_only` / `sky_plus_natal`) na UI
- Quando `sky_plus_natal` é selecionado, o sistema enriquece o mapa natal com pontos tradicionais (Almuten, Hyleg, Alcocoden) e assessments
- O `chart` (mapa natal) é obtido do estado global via prop, sem necessidade de reinserção de dados
- O relatório IA é gerado com contexto natal integrado (prompt `ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM`)

**Regras:**

- O mapa natal é o mesmo que foi calculado no módulo tradicional (não é reinserido)
- Se não houver mapa natal calculado, o modo `sky_plus_natal` deve estar desabilitado ou exibir aviso
- A funcionalidade já está implementada — apenas documentada aqui para clareza de escopo

**Critérios de aceite:**

- [ ] O seletor de modo permite alternar entre `sky_only` e `sky_plus_natal`
- [ ] No modo `sky_plus_natal`, o relatório inclui análise do mapa natal integrado
- [ ] O mapa natal é obtido do estado global sem reinserção de dados

---

## 8. Funcionalidades Secundárias

As funcionalidades abaixo são **desejáveis mas não essenciais** para o MVP:

- **Indicador de momento selecionado**: Exibir a data/hora atualmente selecionada de forma proeminente
- **Atalhos de teclado**: Permitir navegação temporal via teclado (setas esquerda/direita)

---

## 9. Fluxos de Usuário

### Fluxo Principal: Exploração Temporal

1. Usuário acessa o módulo de eletiva
2. Sistema exibe o painel com a mandala do momento atual (se `isRealTime` for `true`)
3. Usuário clica no botão `+1h` na seção "Máquina do Tempo"
4. Sistema atualiza `targetTimeStr` para 1 hora à frente
5. Sistema define `isRealTime` como `false`
6. Sistema recalcula o `skyChart` para o novo momento
7. Sistema exibe overlay de carregamento sobre a mandala
8. Sistema atualiza a mandala, o veredito e a hora planetária
9. Se `magicInsight` existir, sistema exibe banner de aviso: "Este relatório é referente ao momento anterior. Gere um novo relatório para o momento atual."
10. Overlay de carregamento desaparece
11. Usuário observa o novo estado do céu e decide se o momento é propício

### Fluxo Alternativo: Carregar Eletiva Salva

1. Usuário carrega uma eletiva salva
2. Sistema preenche `targetDateStr` e `targetTimeStr` com os dados salvos
3. Sistema define `isRealTime` como `false`
4. Sistema recalcula o `skyChart` para o momento salvo
5. Sistema exibe a mandala com a configuração correta

---

## 10. Telas e Componentes

### Tela: TraditionalElectivePanel (Modificado)

**Componentes existentes (não modificados):**

- Cronômetro da hora planetária atual
- Card da mansão lunar
- Seletor de intenções mágicas
- Botão "Gerar Relatório de Eletiva"

**Novos componentes:**

| Componente | Localização | Descrição |
|------------|-------------|-----------|
| `TraditionalChart` | Coluna da direita, acima da "Síntese Astrológica" | Mandala astrológica do momento selecionado |
| Controles de navegação | Seção "Máquina do Tempo" | Botões `-1d`, `-1h`, `+1h`, `+1d` |
| Overlay de carregamento | Sobre o `TraditionalChart` | Indicador de que o gráfico está sendo recalculado |

**Decisão tomada:** O gráfico será posicionado no topo da coluna da direita (acima da Síntese Astrológica). O painel crescerá verticalmente para acomodá-lo.

**Nota:** O seletor de modo (`sky_only` / `sky_plus_natal`) já está presente na UI do `TraditionalElectivePanel` (linha ~858). Não requer implementação adicional.

---

## 11. Dados e Entidades

### Entidades Envolvidas

| Entidade | Origem | Uso |
|----------|--------|-----|
| `NatalChart` | Calculado pelo engine de eletiva | Dados de entrada para o `TraditionalChart` |
| `targetDateStr` | Estado do `TraditionalElectivePanel` | Data selecionada para cálculo |
| `targetTimeStr` | Estado do `TraditionalElectivePanel` | Hora selecionada para cálculo |
| `isRealTime` | Estado do `TraditionalElectivePanel` | Indica se o momento é o atual ou manual |
| `skyChart` | Calculado pelo engine | Resultado do cálculo para o momento selecionado |

### Campos Relevantes

```typescript
// Estado existente no TraditionalElectivePanel
targetDateStr: string;    // formato YYYY-MM-DD
targetTimeStr: string;    // formato HH:MM
isRealTime: boolean;      // true = momento atual, false = manual
skyChart: NatalChart;     // resultado do cálculo
```

---

## 12. Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| **R1** | Qualquer ajuste manual de tempo define `isRealTime` como `false` |
| **R2** | A mandala deve atualizar instantaneamente ao mudar o tempo (de-bounced pela lógica de efeito existente) |
| **R3** | O `TraditionalChart` é reutilizado sem modificações — apenas consumo |
| **R4** | O overlay de carregamento é exibido enquanto o `skyChart` é recalculado, condicionado à variável de estado `isCalculatingSky` já existente no `TraditionalElectivePanel` |
| **R5** | A navegação temporal não tem limites mínimos ou máximos |
| **R6** | O formato de data permanece `YYYY-MM-DD` e o formato de hora permanece `HH:MM` |
| **R7** | A função `adjustTime` deve converter `targetDateStr` + `targetTimeStr` em `Date`, aplicar o ajuste e reformatar separadamente, garantindo virada correta de dia/mês/ano |
| **R8** | Qualquer ajuste manual de tempo mantém o `magicInsight` visível + exibe banner de aviso de desatualização. O relatório anterior é preservado até o usuário gerar um novo |

---

## 13. Permissões e Papéis de Usuário

**Tipo de usuário:** Todos os usuários do AstroMap têm acesso ao módulo de eletiva e, portanto, à Máquina do Tempo 2.0.

**Restrições:** Não há restrições de permissão. A funcionalidade está disponível para todos os usuários.

---

## 14. Integrações

| Integração | Tipo | Descrição |
|------------|------|-----------|
| `TraditionalChart` | Componente React | Reutilizado sem modificações para renderizar a mandala |
| Engine de eletiva (`elective.ts`) | Biblioteca interna | Recalcula o `skyChart` para o momento selecionado |
| `chart` (mapa natal) | Estado global (Zustand/useState) | Passado como prop do componente pai; usado no modo `sky_plus_natal` |
| `astronomy-engine` | Biblioteca externa | Cálculos astronômicos para posições planetárias |

---

## 15. Requisitos Não Funcionais

| Requisito | Descrição | Métrica |
|-----------|-----------|---------|
| **Performance** | A renderização do SVG não deve causar lentidão perceptível | < 100ms para atualização do gráfico |
| **Responsividade** | A mandala deve ser visível em telas desktop e mobile | Redimensionamento dinâmico do SVG via `aspect-ratio` ou viewBox para caber na largura da tela; o painel como um todo mantém scroll vertical |
| **Acessibilidade** | Botões de navegação devem ser acessíveis via teclado | Tab navigation + Enter/Space |
| **Confiabilidade** | O overlay de carregamento deve aparecer durante recálculos | 100% dos recálculos exibem overlay |

---

## 16. Critérios de Aceite Gerais

- [ ] A mandala aparece no painel de eletiva e reflete o momento selecionado
- [ ] Os botões de navegação temporal (-1d, -1h, +1h, +1d) funcionam corretamente
- [ ] O veredito e a hora planetária são recalculados após cada navegação
- [ ] O overlay de carregamento é exibido durante recálculos
- [ ] A navegação temporal é intuitiva e rápida
- [ ] O layout mantém a estética premium "Infinity" do AstroMap
- [ ] A build de produção é gerada sem erros
- [ ] O lint passa sem erros

---

## 17. Riscos e Mitigação

### Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Performance do SVG** | Média | Alto | O componente `TraditionalChart` já é otimizado com `useMemo`. Monitorar performance em dispositivos médios. |
| **Sincronização de estado** | Baixa | Alto | O `skyChart` já é recalculado via efeito existente. Garantir que o `adjustTime` dispare o efeito corretamente. |
| **Overflow de data** | Baixa | Médio | Ajustes de ±1d devem lidar corretamente com mudanças de mês/ano. Usar manipulação de Date nativa. |

### Riscos de Produto

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Confusão do usuário** | Média | Médio | Adicionar indicador claro do momento selecionado e feedback visual nos botões |
| **Layout poluído** | Média | Médio | Posicionar a mandala em card dedicado com espaçamento adequado |

---

## 18. Métricas de Sucesso

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Usabilidade** | 80% dos usuários conseguem navegar temporalmente sem instrução | Teste de usabilidade com 5 usuários |
| **Performance** | Renderização do SVG < 100ms | Profiler do navegador |
| **Satisfação** | Usuários relatam que a navegação é "intuitiva" | Feedback qualitativo |
| **Adoção** | 50% dos usuários de eletiva usam a navegação temporal | Analytics de cliques nos botões |

---

## 19. Pontos de Decisão Pendentes

| # | Ponto de Decisão | Opções | Recomendação |
|---|------------------|--------|--------------|
| 1 | **Botões de navegação** | Resolvido: apenas -1d, -1h, +1h, +1d | Decisão tomada para MVP |

---

## 20. Resumo para o Agente de Implementação

**Objetivo:** Integrar o `TraditionalChart` no `TraditionalElectivePanel.tsx` e adicionar botões de navegação temporal.

**Arquivo a modificar:** `src/components/traditional/TraditionalElectivePanel.tsx`

**Alterações:**

1. Importar `TraditionalChart` de `./TraditionalChart`
2. Implementar função `adjustTime(amount, unit)` para atualizar `targetDateStr` e `targetTimeStr`
3. Garantir que ajustes manuais definem `isRealTime` como `false`
4. Adicionar botões de navegação (-1d, -1h, +1h, +1d) na seção "Máquina do Tempo"
5. Inserir card com `TraditionalChart` na coluna da direita
6. Adicionar overlay de carregamento sobre o gráfico

**Não modificar:** O componente `TraditionalChart` permanece inalterado.

**Dependências:** Nenhuma nova dependência. O componente já existe.

**Testes manais:**

1. Verificar se a mandala aparece e reflete o momento selecionado
2. Clicar nos botões de navegação e observar atualização sincronizada
3. Carregar eletiva salva e confirmar exibição correta
4. Verificar performance em dispositivo médio

---

## Checklist de Qualidade do PRD

- [x] **Escopo claro:** O que está dentro e fora do escopo está bem definido (seções 5, 6)
- [x] **Regras claras:** 8 regras de negócio objetivas (seção 12)
- [x] **Critérios de aceite claros:** 8 critérios gerais + critérios por funcionalidade (seções 7, 16)
- [x] **Telas definidas:** Componentes, localização e estados especificados (seção 10)
- [x] **Dados definidos:** Entidades, campos e relações mapeados (seção 11)
- [x] **Riscos mapeados:** 3 riscos técnicos e 2 riscos de produto com mitigação (seção 17)
- [x] **Fora de escopo definido:** 8 itens explicitamente excluídos com motivos (seção 6)
- [x] **Pronto para virar plano de implementação:** Resumo executável para agente (seção 20)

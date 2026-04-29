# Plano de Refinamento — Módulo de Eletiva Mágica do AstroMap

## Objetivo

Refinar o módulo de **Eletiva Mágica** do AstroMap para tornar os relatórios de IA mais fiéis aos dados calculados pelo engine, reduzir alucinações interpretativas, melhorar a coerência técnica da astrologia tradicional e corrigir inconsistências entre a interface, o dossiê técnico enviado à IA e o texto final gerado.

Este plano deve ser executado no Antigravity com foco em **correções pontuais, auditáveis e testáveis**, sem reescrever o módulo inteiro.

---

## Arquivos principais envolvidos

- `src/lib/aiPrompts.ts`
- `src/lib/aiPrompts.test.ts`
- `src/app/api/report/route.ts`
- `src/lib/traditional/types.ts`
- `src/lib/traditional/elective.ts`
- `src/lib/traditional/magic-correspondences.ts`

---

## Diagnóstico resumido

O módulo está bem estruturado: o backend calcula os dados técnicos da eletiva e a IA apenas interpreta. Porém, há alguns problemas que precisam ser corrigidos:

1. O prompt diz para a IA não inventar dados, mas também pede linguagem grimorial, conjurações, inteligências planetárias, daimon, virtudes de mansões e instruções ritualísticas que nem sempre são fornecidas pelo engine.
2. O resumo da Mansão Lunar aparece na interface, mas aparentemente não é enviado de forma completa para a IA.
3. O campo de Curso Vazio pode ser tratado de forma incorreta quando o status não foi calculado.
4. O prompt da IA mistura instruções, exemplos, regras e dados calculados no mesmo bloco, aumentando custo de tokens e confusão contextual.
5. A rota `/api/report` exige semanticamente `chart.birthData` como se todo relatório dependesse de mapa natal, mesmo no modo `elective_magic`.
6. A temperatura usada na OpenRouter é alta para relatórios técnicos de eletiva, favorecendo exageros literários e inferências indevidas.
7. Os testes existentes protegem parte do contrato textual, mas ainda não cobrem os principais bugs observados no relatório gerado.

---

# Fase 1 — Corrigir o dossiê técnico enviado à IA

## 1.1. Incluir o resumo da Mansão Lunar no `formatElectiveForAI`

### Problema

O objeto `lunarMansion` possui campos úteis como `summary` e possivelmente `degreeRange`, mas o formatter envia apenas número, nome e signo. Isso faz a IA dizer que as virtudes da mansão não foram calculadas, mesmo quando a interface exibe um sumário.

### Ação

No arquivo `src/lib/aiPrompts.ts`, dentro de `formatElectiveForAI`, localizar o bloco:

```ts
result += `- Mansão Lunar: ${lunarMansion.number} - ${lunarMansion.name} (${lunarMansion.sign})\n`;
```

Substituir por uma versão mais completa:

```ts
result += `- Mansão Lunar: ${lunarMansion.number} - ${lunarMansion.name} (${lunarMansion.sign})\n`;

if (lunarMansion.degreeRange) {
  result += `- Faixa da Mansão Lunar: ${lunarMansion.degreeRange}\n`;
}

if (lunarMansion.summary) {
  result += `- Virtude/Sumário da Mansão Lunar: ${lunarMansion.summary}\n`;
}
```

### Critério de aceite

Ao gerar um relatório de eletiva, a IA deve receber explicitamente o sumário da mansão lunar quando esse dado existir.

---

## 1.2. Corrigir o tratamento do Curso Vazio

### Problema

Atualmente, se `moonStatus.voidOfCourseStatus` não for exatamente `'void'`, o sistema tende a exibir `NÃO`. Isso pode transformar um dado ausente ou não calculado em uma afirmação técnica falsa.

### Ação

No `formatElectiveForAI`, substituir a lógica atual de Curso Vazio por uma função auxiliar.

Adicionar em `src/lib/aiPrompts.ts`:

```ts
function formatVoidOfCourseStatus(status?: string): string {
  if (status === 'void') return 'SIM (Lua Fora de Curso)';
  if (status === 'not_void') return 'NÃO';
  if (status === 'not_calculated') return 'NÃO CALCULADO';
  if (!status) return 'NÃO CALCULADO';
  return `STATUS DESCONHECIDO (${status})`;
}
```

E trocar:

```ts
result += `- Curso Vazio: ${moonStatus.voidOfCourseStatus === 'void' ? 'SIM (Lua Fora de Curso)' : 'NÃO'}\n`;
```

por:

```ts
result += `- Curso Vazio: ${formatVoidOfCourseStatus(moonStatus.voidOfCourseStatus)}\n`;
```

### Critério de aceite

- `void` deve virar `SIM (Lua Fora de Curso)`.
- `not_void` deve virar `NÃO`.
- `not_calculated`, `undefined` ou valor ausente devem virar `NÃO CALCULADO`.
- A IA não deve ser levada a afirmar que a Lua não está fora de curso quando o dado não foi calculado.

---

## 1.3. Ajustar o bloco “DADOS NÃO CALCULADOS”

### Problema

`formatTraditionalSkyContext` sempre declara:

```txt
Virtudes completas das mansões lunares: NÃO CALCULADAS PELO ASTROMAP NESTA VERSÃO
```

Isso pode entrar em conflito com o `lunarMansion.summary` quando este é enviado.

### Ação

Modificar `formatTraditionalSkyContext` para receber um parâmetro opcional:

```ts
function formatTraditionalSkyContext(chart: NatalChart, options?: { hasLunarMansionSummary?: boolean }): string {
```

No trecho de dados não calculados, alterar para:

```ts
if (!options?.hasLunarMansionSummary) {
  result.push('- Virtudes completas das mansões lunares: NÃO CALCULADAS PELO ASTROMAP NESTA VERSÃO');
} else {
  result.push('- Virtudes completas das mansões lunares: RESUMO BÁSICO FORNECIDO PELO ASTROMAP; NÃO EXPANDIR ALÉM DO SUMÁRIO');
}
```

Na chamada dentro de `formatElectiveForAI`, usar:

```ts
result += formatTraditionalSkyContext(skyChart, {
  hasLunarMansionSummary: Boolean(lunarMansion.summary),
});
```

### Critério de aceite

O dossiê não deve afirmar que as virtudes da mansão não foram calculadas quando um sumário da mansão já foi fornecido.

---

# Fase 2 — Reduzir alucinação ritualística no prompt

## 2.1. Separar dados fornecidos de elementos não fornecidos

### Problema

O prompt pede que a IA forneça orações, conjurações, inteligências planetárias, daimon, sufumígios e virtudes de mansão. Quando esses dados não estão na estrutura enviada, o modelo tende a inventar.

### Ação

No `ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM` e no `ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM`, substituir instruções que incentivam invenção por instruções condicionais.

Localizar trechos semelhantes a:

```txt
Forneça um guia sensorial completo: Cores, Incensos, Orações ou Conjurações sugeridas e o estado mental.
```

Substituir por:

```txt
Forneça um guia ritualístico somente com os elementos explicitamente fornecidos no dossiê técnico ou nas correspondências mágicas do AstroMap. Não invente nomes de inteligências, daimon, espíritos, orações, salmos, pedras, metais, incensos ou conjurações que não estejam listados nos dados recebidos.

Se algum item ritualístico não estiver presente, omita o item ou declare: “Dado ritualístico não fornecido pelo AstroMap”.
```

### Critério de aceite

A IA não deve criar nomes espirituais, orações ou correspondências que não existam no dossiê.

---

## 2.2. Transformar “termos obrigatórios” em “termos permitidos quando aplicáveis”

### Problema

O prompt exige termos como `Almuten`, `Cazimi`, `Triplicidade`, `Sínodo`, `Inteligência Planetária`, `Daimon`. Isso empurra a IA a usar termos mesmo quando não há dado correspondente.

### Ação

Trocar:

```txt
Termos obrigatórios: Almuten, Cazimi, Triplicidade, Sextil, Quadratura, Sínodo, Inteligência Planetária, Daimon.
```

por:

```txt
Termos permitidos quando tecnicamente aplicáveis: Almuten, Cazimi, Triplicidade, Sextil, Quadratura, Sínodo, Inteligência Planetária, Daimon. Use esses termos apenas quando o dado correspondente estiver presente no dossiê ou nas correspondências do AstroMap.
```

### Critério de aceite

A IA deve parar de forçar terminologia não sustentada pelos dados.

---

## 2.3. Criar dois estilos de relatório

### Objetivo

Permitir que o usuário escolha entre um relatório mais técnico e um relatório mais ritualístico.

### Sugestão de enum

No tipo de request ou no estado da interface, adicionar algo como:

```ts
reportStyle?: 'technical' | 'grimorial';
```

### Comportamento esperado

- `technical`: linguagem sóbria, auditável, menos floreada.
- `grimorial`: linguagem tradicional, elevada e simbólica, mas ainda limitada aos dados fornecidos.

### Prompt sugerido para estilo técnico

```txt
ESTILO DO RELATÓRIO: TÉCNICO TRADICIONAL
Use linguagem clara, hierárquica e verificável. Priorize dignidades, casas, aspectos, Lua, regente do propósito e veredito. Evite teatralidade excessiva.
```

### Prompt sugerido para estilo grimorial

```txt
ESTILO DO RELATÓRIO: GRIMORIAL TRADICIONAL
Use linguagem solene, ritualística e simbólica, mas não invente dados. Toda afirmação técnica ou ritualística deve derivar diretamente do dossiê fornecido.
```

### Critério de aceite

O relatório técnico deve ser objetivo e verificável. O relatório grimorial pode ser belo e solene, mas sem criar dados inexistentes.

---

# Fase 3 — Melhorar a rota `/api/report`

## 3.1. Ajustar validação para `elective_magic`

### Problema

A rota exige `chart.birthData` e retorna erro de “mapa natal obrigatório” mesmo para eletiva do céu do momento.

### Ação

Em `src/app/api/report/route.ts`, obter `reportMode`, `veredict`, `contextChart` e `electiveMode` antes da validação geral do chart.

Substituir a validação atual:

```ts
const chart = body.chart as NatalChart | undefined;
if (!chart?.birthData) {
  return NextResponse.json({ error: 'Dados do mapa natal são obrigatórios.' }, { status: 400 });
}
```

por uma validação contextual:

```ts
const chart = body.chart as NatalChart | undefined;
const reportMode = body.reportMode as string | undefined;
const veredict = body.veredict as ElectiveVeredict | undefined;
const contextChart = body.contextChart as NatalChart | undefined;
const electiveMode = body.electiveMode as 'sky_only' | 'sky_plus_natal' | undefined;

if (reportMode === 'elective_magic') {
  const skyChart = contextChart || chart;

  if (!veredict || !electiveMode || !skyChart?.birthData) {
    return NextResponse.json(
      { error: 'Dados da eletiva são obrigatórios: veredito, modo de leitura e céu do momento.' },
      { status: 400 }
    );
  }

  if (electiveMode === 'sky_plus_natal' && !body.natalChart) {
    return NextResponse.json(
      { error: 'Mapa natal obrigatório para o modo céu do momento + mapa natal.' },
      { status: 400 }
    );
  }
} else if (!chart?.birthData) {
  return NextResponse.json({ error: 'Dados do mapa natal são obrigatórios.' }, { status: 400 });
}
```

### Critério de aceite

- Modo `elective_magic` não deve depender semanticamente de `chart` natal quando `contextChart` está presente.
- Modo `sky_plus_natal` deve exigir `natalChart`.
- Os erros devem ser claros para debug.

---

## 3.2. Reduzir temperatura para relatórios técnicos/eletivos

### Problema

`temperature: 0.7` gera criatividade excessiva para relatórios de eletiva, aumentando risco de floreio e inferência.

### Ação

No corpo enviado à OpenRouter, substituir:

```ts
temperature: 0.7,
```

por:

```ts
temperature: body.reportMode === 'elective_magic' ? 0.35 : 0.7,
```

Opcionalmente, se `reportStyle` for implementado:

```ts
temperature:
  body.reportMode === 'elective_magic'
    ? body.reportStyle === 'grimorial'
      ? 0.45
      : 0.25
    : 0.7,
```

### Critério de aceite

O relatório de eletiva deve ficar mais consistente, menos inventivo e mais fiel ao dossiê.

---

## 3.3. Avaliar `reasoning.exclude`

### Observação

A rota usa:

```ts
reasoning: {
  effort: 'high',
  exclude: false,
}
```

para modelos `grok-4.1`.

### Ação sugerida

Verificar se a resposta final está vindo com algum conteúdo de raciocínio ou metadados desnecessários. Se houver ruído ou custo excessivo, testar:

```ts
reasoning: {
  effort: 'high',
  exclude: true,
}
```

### Critério de aceite

O usuário final deve receber apenas o relatório final, sem exposição de raciocínio interno ou blocos desnecessários.

---

# Fase 4 — Reforçar os testes

## 4.1. Teste para resumo da Mansão Lunar

Adicionar em `src/lib/aiPrompts.test.ts`:

```ts
it('should include lunar mansion summary when available', () => {
  const output = formatElectiveForAI(mockElectiveVeredict, mockSolarChart, 'sky_only');

  expect(output).toContain('Virtude/Sumário da Mansão Lunar');
  expect(output).toContain('Favorece cautela');
});
```

---

## 4.2. Teste para faixa da Mansão Lunar

```ts
it('should include lunar mansion degree range when available', () => {
  const output = formatElectiveForAI(mockElectiveVeredict, mockSolarChart, 'sky_only');

  expect(output).toContain('Faixa da Mansão Lunar');
  expect(output).toContain('8-21');
});
```

---

## 4.3. Teste para Curso Vazio não calculado

```ts
it('should not convert not_calculated void of course status into NÃO', () => {
  const veredict = {
    ...mockElectiveVeredict,
    moonStatus: {
      ...mockElectiveVeredict.moonStatus,
      voidOfCourseStatus: 'not_calculated',
    },
  } as ElectiveVeredict;

  const output = formatElectiveForAI(veredict, mockSolarChart, 'sky_only');

  expect(output).toContain('Curso Vazio: NÃO CALCULADO');
});
```

---

## 4.4. Teste para status ausente de Curso Vazio

```ts
it('should handle missing void of course status as not calculated', () => {
  const veredict = {
    ...mockElectiveVeredict,
    moonStatus: {
      ...mockElectiveVeredict.moonStatus,
      voidOfCourseStatus: undefined,
    },
  } as unknown as ElectiveVeredict;

  const output = formatElectiveForAI(veredict, mockSolarChart, 'sky_only');

  expect(output).toContain('Curso Vazio: NÃO CALCULADO');
});
```

---

## 4.5. Teste para exclusão de planetas modernos no contexto eletivo

```ts
it('should exclude non-traditional planets from elective sky context', () => {
  const output = formatElectiveForAI(mockElectiveVeredict, mockChart, 'sky_only');

  expect(output).not.toContain('Lilith');
  expect(output).not.toContain('Urano');
  expect(output).not.toContain('Netuno');
  expect(output).not.toContain('Plutão');
});
```

---

## 4.6. Teste para não contradizer resumo de mansão lunar

Após ajustar `formatTraditionalSkyContext`, adicionar:

```ts
it('should not say lunar mansion virtues are not calculated when summary is provided', () => {
  const output = formatElectiveForAI(mockElectiveVeredict, mockSolarChart, 'sky_only');

  expect(output).not.toContain('Virtudes completas das mansões lunares: NÃO CALCULADAS');
  expect(output).toContain('RESUMO BÁSICO FORNECIDO');
});
```

---

# Fase 5 — Melhorar a estrutura do relatório final

## 5.1. Nova estrutura recomendada para o relatório técnico

Atualizar o prompt para pedir uma estrutura mais auditável:

```md
### I. Veredito Técnico da Eleição
- Veredito calculado pelo AstroMap
- Pontuação ou classificação
- Síntese do motivo principal

### II. Regente do Propósito
- Planeta regente
- Dignidade essencial
- Estado acidental
- Casa
- Aspectos relevantes
- Avaliação de força

### III. Lua, Fase e Curso
- Signo, casa e fase
- Curso Vazio
- Próximo aspecto exato
- Aspectos ativos
- Papel da Lua na transmissão da operação

### IV. Mansão Lunar
- Número, nome e signo
- Sumário fornecido pelo AstroMap
- Aplicação ao propósito mágico

### V. Hora Planetária e Correspondência Temporal
- Dia planetário
- Hora planetária
- Relação com o regente do propósito
- Se favorece, neutraliza ou enfraquece a obra

### VI. Testemunhos Favoráveis e Contrários
- Lista objetiva dos fatores positivos
- Lista objetiva dos fatores tensos
- Hierarquia do que pesa mais

### VII. Correspondências Ritualísticas Fornecidas
- Cores
- Metais
- Incensos
- Caridade planetária
- Outros elementos apenas se fornecidos

### VIII. Conselho Final
- Realizar, ajustar ou evitar
- Melhor uso da janela
- Cuidados técnicos
```

---

## 5.2. Evitar contradições entre aspectos resumidos e aspectos reais

### Problema observado

A IA pode dizer algo como:

```txt
oposição a Marte aplicativo no resumo, separando nos aspectos reais
```

Isso enfraquece a clareza do relatório.

### Ação

No prompt, adicionar:

```txt
Se houver divergência entre uma lista resumida de aspectos e a seção ASPECTOS TRADICIONAIS REAIS, priorize a seção ASPECTOS TRADICIONAIS REAIS. Não exponha a contradição ao usuário final. Formule o julgamento usando apenas o dado técnico mais específico.
```

### Critério de aceite

O relatório final não deve mencionar contradições internas do dossiê. Deve escolher o dado mais técnico e apresentar um julgamento coerente.

---

# Fase 6 — Melhorar correspondências mágicas estruturadas

## 6.1. Garantir que correspondências sejam enviadas para a IA

### Problema

A interface mostra cores, metais, incensos e caridade planetária, mas o dossiê técnico precisa garantir que esses elementos também cheguem à IA.

### Ação

Verificar se `ElectiveVeredict` ou outro objeto enviado para `formatElectiveForAI` contém as correspondências mágicas do propósito.

Se não contiver, adicionar ao tipo:

```ts
ritualCorrespondences?: {
  colors?: string[];
  metals?: string[];
  incenses?: string[];
  charity?: string;
  stones?: string[];
  warnings?: string[];
};
```

E no formatter:

```ts
if (veredict.ritualCorrespondences) {
  result += `\nCORRESPONDÊNCIAS RITUALÍSTICAS FORNECIDAS PELO ASTROMAP:\n`;
  result += `-`.repeat(40) + '\n';

  const c = veredict.ritualCorrespondences;
  if (c.colors?.length) result += `- Cores: ${c.colors.join(', ')}\n`;
  if (c.metals?.length) result += `- Metais: ${c.metals.join(', ')}\n`;
  if (c.incenses?.length) result += `- Incensos: ${c.incenses.join(', ')}\n`;
  if (c.stones?.length) result += `- Pedras: ${c.stones.join(', ')}\n`;
  if (c.charity) result += `- Caridade planetária: ${c.charity}\n`;
  if (c.warnings?.length) result += `- Observações: ${c.warnings.join('; ')}\n`;
}
```

### Critério de aceite

A IA deve usar somente as correspondências fornecidas pelo AstroMap, evitando inventar pedras, nomes espirituais ou ingredientes.

---

# Fase 7 — Ordem de execução recomendada no Antigravity

Executar em commits pequenos e verificáveis.

## Commit 1 — Dossiê lunar e Curso Vazio

Alterar:

- `src/lib/aiPrompts.ts`
- `src/lib/aiPrompts.test.ts`

Objetivos:

- incluir `lunarMansion.summary`;
- incluir `lunarMansion.degreeRange`;
- corrigir `voidOfCourseStatus`;
- adicionar testes correspondentes.

Comando esperado:

```bash
npm test -- aiPrompts
```

ou o comando real de testes do projeto.

---

## Commit 2 — Redução de alucinação no prompt

Alterar:

- `src/lib/aiPrompts.ts`

Objetivos:

- transformar termos obrigatórios em termos condicionais;
- impedir que a IA invente conjurações, inteligências, daimon ou correspondências;
- melhorar a estrutura do relatório.

Rodar testes.

---

## Commit 3 — Validação contextual da rota

Alterar:

- `src/app/api/report/route.ts`

Objetivos:

- validar `elective_magic` com base em `veredict`, `electiveMode` e `contextChart`;
- manter validação natal para os demais modos;
- reduzir temperatura para `elective_magic`.

Rodar testes e build.

```bash
npm run build
```

---

## Commit 4 — Correspondências ritualísticas estruturadas

Alterar, se necessário:

- `src/lib/traditional/types.ts`
- `src/lib/traditional/elective.ts`
- `src/lib/traditional/magic-correspondences.ts`
- `src/lib/aiPrompts.ts`
- testes correspondentes

Objetivo:

- garantir que cores, metais, incensos e caridade planetária sejam enviados à IA em campos estruturados.

---

# Prompt operacional para o Antigravity

Use este prompt dentro do Antigravity:

```txt
Você é um engenheiro full-stack sênior trabalhando no AstroMap.

Objetivo: refinar o módulo de Eletiva Mágica para que os relatórios de IA fiquem mais fiéis aos dados técnicos calculados, com menos alucinação ritualística, melhor tratamento de Mansão Lunar, Curso Vazio e validação correta da rota de geração de relatório.

Leia primeiro estes arquivos:
- src/lib/aiPrompts.ts
- src/lib/aiPrompts.test.ts
- src/app/api/report/route.ts
- src/lib/traditional/types.ts
- src/lib/traditional/elective.ts
- src/lib/traditional/magic-correspondences.ts

Tarefas obrigatórias:

1. Em formatElectiveForAI, incluir lunarMansion.summary e lunarMansion.degreeRange quando existirem.
2. Corrigir Curso Vazio para não transformar status ausente ou not_calculated em “NÃO”. Use “NÃO CALCULADO”.
3. Ajustar formatTraditionalSkyContext para não declarar que as virtudes da Mansão Lunar não foram calculadas quando um summary foi fornecido.
4. Revisar os prompts ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM e ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM para impedir que a IA invente conjurações, daimon, inteligências planetárias, orações, pedras, incensos ou virtudes não fornecidas.
5. Trocar “termos obrigatórios” por “termos permitidos quando tecnicamente aplicáveis”.
6. Na rota src/app/api/report/route.ts, ajustar a validação para que reportMode === 'elective_magic' use contextChart || chart como céu do momento e não retorne erro genérico de mapa natal obrigatório.
7. Reduzir temperature para relatórios elective_magic, preferencialmente 0.35.
8. Adicionar testes em aiPrompts.test.ts para:
   - summary da Mansão Lunar;
   - degreeRange da Mansão Lunar;
   - Curso Vazio not_calculated;
   - Curso Vazio ausente;
   - exclusão de planetas modernos no contexto eletivo;
   - ausência de contradição sobre virtudes lunares quando summary existe.

Restrições:

- Não reescreva o módulo inteiro.
- Não altere regras astrológicas centrais sem necessidade.
- Faça mudanças pequenas, com baixo risco.
- Preserve compatibilidade com os tipos existentes sempre que possível.
- Se precisar alterar tipos, faça isso de forma mínima e atualize os testes.
- Rode os testes relacionados.
- Rode build se possível.
- Ao final, entregue um resumo com arquivos alterados, decisões tomadas, testes executados e riscos remanescentes.
```

---

# Checklist final de aceite

Antes de considerar a tarefa concluída, verificar:

- [ ] A IA recebe o sumário da Mansão Lunar quando existir.
- [ ] A IA recebe a faixa da Mansão Lunar quando existir.
- [ ] `voidOfCourseStatus` ausente ou `not_calculated` não aparece como `NÃO`.
- [ ] O dossiê técnico não contradiz a existência do resumo da Mansão Lunar.
- [ ] O prompt não obriga a IA a inventar daimon, inteligências, conjurações ou correspondências.
- [ ] Termos técnicos são usados apenas quando sustentados pelos dados.
- [ ] A rota valida corretamente `elective_magic`.
- [ ] A temperatura do modo eletivo foi reduzida.
- [ ] Os testes cobrem os bugs observados.
- [ ] O build continua funcionando.

---

# Resultado esperado

Depois dessas mudanças, o relatório de IA deve:

1. respeitar melhor o dossiê calculado pelo AstroMap;
2. usar corretamente a Mansão Lunar exibida na interface;
3. não afirmar Curso Vazio como “NÃO” quando o dado não foi calculado;
4. reduzir invenções de nomes espirituais, orações e correspondências;
5. manter linguagem tradicional e ritualística, mas com mais controle técnico;
6. produzir uma análise mais confiável, auditável e adequada ao módulo de Eletiva Mágica.

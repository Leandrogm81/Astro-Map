# Plano de Refinamento v2 — Módulo de Eletiva Mágica do AstroMap

## Objetivo

Refinar o módulo de **Eletiva Mágica** para que os relatórios de IA fiquem mais fiéis aos dados calculados pelo engine, com menos alucinação ritualística, melhor tratamento de Mansão Lunar e Curso Vazio, validação correta da rota `/api/report`, e correspondências mágicas enviadas de forma estruturada.

Este plano foi validado contra o código real (`route.ts:24-60, 102-105, 140, 143-150`, `aiPrompts.ts:82-141, 683-737, 738-859`, `elective.ts:171-258`, `types.ts:73-109`, `magic-correspondences.ts:1-123`, `aiPrompts.test.ts:1-279`).

---

## Fase 0 — Discovery (pré-código, leitura e confirmação)

**Objetivo:** confirmar suposições antes de alterar qualquer arquivo. Rápida, 5-10 min.

### 0.1. Verificar se `contextChart` chega no body pelo frontend

- **Onde:** buscar no frontend o `fetch` para `/api/report` (provavelmente em `src/components/` ou hooks).
- **Critério:** confirmar que `body.contextChart` é enviado no modo `elective_magic` sem depender de `body.chart`.

### 0.2. Confirmar que `lunarMansion.summary` e `degreeRange` sempre vêm populados

- **Fato já confirmado:** `getLunarMansion` em `elective.ts:84-87` retorna sempre `LUNAR_MANSIONS[mansionIndex]`, que contém `summary` (via `getMansionSummary`) e `degreeRange`. Então **sim, sempre vêm populados**. ✓
- **Ação:** apenas anotar que é seguro enviá-los sempre, sem verificação condicional de existência (diferente do plano original que sugere `if (lunarMansion.summary)`).

### 0.3. Confirmar que `ritualCorrespondences` NÃO existe no `ElectiveVeredict`

- **Fato já confirmado:** `ElectiveVeredict` (`types.ts:83-109`) não tem campo `ritualCorrespondences`. As correspondências existem em `magic-correspondences.ts` mas não são injetadas no veredito. ✓
- **Ação:** será necessário adicionar o campo e populá-lo em `getElectiveVeredict` ou no chamador.

### 0.4. Confirmar que `buildPrompt` já trata `elective_magic` corretamente

- **Fato já confirmado:** `route.ts:44-49` destrutura `veredict`, `contextChart`, `electiveMode` e usa `contextChart || chart`. O problema está **antes** disso, na validação da linha 103 que exige `chart.birthData` incondicionalmente. ✓
- **Ação:** corrigir **apenas** a validação (linhas 102-105 do route.ts). A função `buildPrompt` não precisa ser alterada.

### 0.5. Confirmar que `getElectiveVeredict` sempre define `voidOfCourseStatus` como `'void'` ou `'not_void'`

- **Fato já confirmado:** `elective.ts:219` — `voidOfCourseStatus: voc.isVoid ? 'void' : 'not_void'`. O valor `'not_calculated'` nunca é produzido pelo engine atual. ✓
- **Ação:** o tratamento de `'not_calculated'` continua sendo útil como defesa contra chamadas diretas com objetos mock/manuais, mas **não deve ser o foco principal**. Prioridade é corrigir o bug real (status `'not_void'` virando `'NÃO'` quando poderia estar ausente logicamente).

---

## Fase 1 — Dossiê lunar e Curso Vazio

**Arquivos:** `src/lib/aiPrompts.ts`, `src/__tests__/aiPrompts.test.ts`

### 1.1. Incluir `summary` e `degreeRange` da Mansão Lunar no `formatElectiveForAI`

**Impacto:** +~80 tokens no prompt

```ts
// Linha atual (aiPrompts.ts:713):
result += `- Mansão Lunar: ${lunarMansion.number} - ${lunarMansion.name} (${lunarMansion.sign})\n`;

// Substituir por:
result += `- Mansão Lunar: ${lunarMansion.number} - ${lunarMansion.name} (${lunarMansion.sign})\n`;
result += `- Faixa da Mansão Lunar: ${lunarMansion.degreeRange}\n`;
result += `- Virtude/Sumário da Mansão Lunar: ${lunarMansion.summary}\n`;
```

> **Correção sobre o plano v1:** `summary` e `degreeRange` **sempre** existem (confirmado em 0.2), então não usar `if (lunarMansion.summary)`.

### 1.2. Corrigir tratamento do Curso Vazio

```ts
// Nova função auxiliar (antes de formatElectiveForAI):
function formatVoidOfCourseStatus(status?: string): string {
  if (status === 'void') return 'SIM (Lua Fora de Curso)';
  if (status === 'not_void') return 'NÃO';
  if (status === 'not_calculated') return 'NÃO CALCULADO';
  if (!status) return 'NÃO CALCULADO';
  return `STATUS DESCONHECIDO (${status})`;
}

// Linha atual (aiPrompts.ts:715):
result += `- Curso Vazio: ${moonStatus.voidOfCourseStatus === 'void' ? 'SIM (Lua Fora de Curso)' : 'NÃO'}\n`;

// Substituir por:
result += `- Curso Vazio: ${formatVoidOfCourseStatus(moonStatus.voidOfCourseStatus)}\n`;
```

### 1.3. Ajustar `formatTraditionalSkyContext` para não contradizer o sumário da Mansão Lunar

```ts
// Linha atual (aiPrompts.ts:82):
function formatTraditionalSkyContext(chart: NatalChart): string {

// Substituir por:
function formatTraditionalSkyContext(
  chart: NatalChart,
  options?: { hasLunarMansionSummary?: boolean }
): string {
```

Dentro de `formatTraditionalSkyContext`, trocar (linha ~137):

```ts
// Atual:
result.push('- Virtudes completas das mansões lunares: NÃO CALCULADAS PELO ASTROMAP NESTA VERSÃO');

// Por:
if (!options?.hasLunarMansionSummary) {
  result.push('- Virtudes completas das mansões lunares: NÃO CALCULADAS PELO ASTROMAP NESTA VERSÃO');
} else {
  result.push('- Virtudes completas das mansões lunares: RESUMO BÁSICO FORNECIDO PELO ASTROMAP; NÃO EXPANDIR ALÉM DO SUMÁRIO');
}
```

Na chamada em `formatElectiveForAI` (linha ~729), usar:

```ts
result += formatTraditionalSkyContext(skyChart, {
  hasLunarMansionSummary: true, // sempre true, confirmado em 0.2
});
```

### 1.4. Testes da Fase 1

Adicionar em `src/__tests__/aiPrompts.test.ts`:

```ts
it('should include lunar mansion summary in output', () => {
  const output = formatElectiveForAI(mockElectiveVeredict, mockSolarChart, 'sky_only');
  expect(output).toContain('Virtude/Sumário da Mansão Lunar');
  expect(output).toContain('Favorece cautela');
});

it('should include lunar mansion degree range', () => {
  const output = formatElectiveForAI(mockElectiveVeredict, mockSolarChart, 'sky_only');
  expect(output).toContain('Faixa da Mansão Lunar');
  expect(output).toContain('8-21');
});

it('should handle void of course status "not_calculated" as NÃO CALCULADO', () => {
  const verdict = {
    ...mockElectiveVeredict,
    moonStatus: {
      ...mockElectiveVeredict.moonStatus,
      voidOfCourseStatus: 'not_calculated' as const,
    },
  };
  const output = formatElectiveForAI(verdict, mockSolarChart, 'sky_only');
  expect(output).toContain('Curso Vazio: NÃO CALCULADO');
});

it('should handle missing void of course status as NÃO CALCULADO', () => {
  const verdict = {
    ...mockElectiveVeredict,
    moonStatus: {
      ...mockElectiveVeredict.moonStatus,
      voidOfCourseStatus: undefined,
    },
  } as unknown as ElectiveVeredict;
  const output = formatElectiveForAI(verdict, mockSolarChart, 'sky_only');
  expect(output).toContain('Curso Vazio: NÃO CALCULADO');
});

it('should not declare mansion virtues uncalculated when summary is provided', () => {
  const output = formatElectiveForAI(mockElectiveVeredict, mockSolarChart, 'sky_only');
  expect(output).not.toContain('Virtudes completas das mansões lunares: NÃO CALCULADAS');
  expect(output).toContain('RESUMO BÁSICO FORNECIDO');
});

it('should exclude non-traditional planets from elective sky context', () => {
  const output = formatElectiveForAI(mockElectiveVeredict, mockSolarChart, 'sky_only');
  expect(output).not.toContain('Lilith');
  expect(output).not.toContain('Urano');
  expect(output).not.toContain('Netuno');
  expect(output).not.toContain('Plutão');
});
```

---

## Fase 2 — Redução de alucinação ritualística nos prompts

**Arquivos:** `src/lib/aiPrompts.ts`

### 2.1. Extrair base comum dos dois prompts eletivos

Os prompts `ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM` e `ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM` compartilham: regras de confiabilidade, exemplos de comportamento, proibições, legenda de casas e anti-prolixidade. Isso representa ~60% de sobreposição.

**Ação:** Criar uma constante `ELECTIVE_MAGIC_PROMPT_BASE` com as regras compartilhadas:

```ts
const ELECTIVE_MAGIC_PROMPT_BASE = `
REGRAS DE CONFIABILIDADE (NÃO NEGOCIÁVEIS):
- Use APENAS os dados explicitamente listados em DADOS CALCULADOS.
- Se um campo estiver em DADOS NÃO CALCULADOS, trate-o como ausente.
- Não infira Ascendente, Curso Vazio, aspectos ou dignidades que não tenham sido fornecidos.
- Não chame casa 3, 6, 9 ou 12 de angular.
- Não use "combustão marcial"; combustão só se aplica ao Sol.
- Quando faltar dado, declare a ausência em vez de preencher a lacuna com suposição.

EXEMPLOS DE COMPORTAMENTO:
CORRETO: "Saturno em Áries está em queda. Na Casa 3, cadente, a obra pede disciplina e estudo, não impulso."
CORRETO: "Curso Vazio da Lua: não calculado pelo AstroMap nesta versão; não será usado como critério."
INCORRETO: "O Ascendente parece estar em Aquário ou Peixes."
INCORRETO: "A conjunção Saturno-Marte gera combustão marcial."

CLASSIFICAÇÃO DE CASAS:
| Casas Angulares  | 1, 4, 7, 10 | (Máxima força acidental)
| Casas Sucedentes | 2, 5, 8, 11 | (Força moderada)
| Casas Cadentes   | 3, 6, 9, 12 | (Debilidade acidental)

DIRETRIZES DE ESTILO:
- Extensão: O relatório deve ser detalhado e profundo, explorando exaustivamente cada dado técnico.
- DIRETRIZ ANTI-PROLIXIDADE: Evite introduções longas ou definições de termos. Cada parágrafo deve conter uma observação técnica específica sobre o céu eleito.
- Use Português Brasileiro formal/solene.`;
```

Cada prompt eletivo passa a concatenar `ELECTIVE_MAGIC_PROMPT_BASE` com sua identidade e estrutura específicas.

**Impacto:** reduz ~300 tokens duplicados entre os prompts, facilita manutenção futura.

### 2.2. Transformar "forneça guia sensorial" em "guia apenas com dados fornecidos"

**Local:** `ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM`, seção da Liturgia (linha ~782).

```txt
// Atual:
🕯️ IV. A Liturgia da Captura (Instruções Ritualísticas)
Forneça um guia sensorial completo: Cores (baseadas nas tabelas de Agrippa), Incensos (os 'Sufumígios' adequados), Orações ou Conjurações sugeridas e o estado mental (pathos) do operador.

// Substituir por:
🕯️ IV. A Liturgia da Captura (Instruções Ritualísticas)
Forneça um guia ritualístico SOMENTE com os elementos explicitamente fornecidos no dossiê técnico ou nas correspondências mágicas do AstroMap.
Não invente nomes de inteligências, daimon, espíritos, orações, salmos, pedras, metais, incensos ou conjurações que não estejam listados nos dados recebidos.
Se algum item ritualístico não estiver presente no dossiê, omita ou declare: "Dado ritualístico não fornecido pelo AstroMap".
O estado mental (pathos) do operador pode ser descrito com base na condição planetária, sem inventar entidades.
```

**Local:** `ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM`, seção correspondente (linha ~846).

```txt
// Atual:
🕯️ IV. A Liturgia Sob Medida (Cores, Metais e Incensos)
Instruções ritualísticas baseadas na mistura das energias. Se a eleição é de Sol, mas seu Sol natal precisa de força, sugira o uso de pedras ou metais que façam essa ponte.

// Substituir por:
🕯️ IV. A Liturgia Sob Medida (Cores, Metais e Incensos)
Instruções ritualísticas baseadas APENAS nas correspondências fornecidas pelo AstroMap no dossiê técnico. Não invente pedras, metais ou incensos que não constem nos dados recebidos. Se o dossiê não contiver correspondências para determinado aspecto, omita.
```

### 2.3. Trocar "termos obrigatórios" por "termos permitidos quando aplicáveis"

**Local:** `ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM`, linha 791.

```txt
// Atual:
- Linguagem: Use Português Brasileiro Solene/Arcaico. Termos obrigatórios: Almuten, Cazimi, Triplicidade, Sextil, Quadratura, Sínodo, Inteligência Planetária, Daimon.

// Substituir por:
- Linguagem: Use Português Brasileiro Solene/Arcaico.
- Termos permitidos quando tecnicamente aplicáveis: Almuten, Cazimi, Triplicidade, Sextil, Quadratura, Sínodo, Inteligência Planetária, Daimon. Use estes termos APENAS quando o dado correspondente estiver presente no dossiê ou nas correspondências fornecidas pelo AstroMap.
```

### 2.4. Estrutura do relatório mais auditável

Atualizar ambos os prompts para usar esta estrutura de seções (mais técnica, com títulos fixos que facilitam verificação):

```md
### I. Veredito Técnico da Eleição
### II. Regente do Propósito (Dignidades e Estado)
### III. Lua, Fase e Curso
### IV. Mansão Lunar (Sumário e Aplicação)
### V. Hora Planetária e Correspondência Temporal
### VI. Testemunhos Favoráveis e Contrários
### VII. Correspondências Ritualísticas Fornecidas (apenas se houver dados)
### VIII. Conselho Final (Realizar, Ajustar ou Evitar)
```

> **Nota sobre Fase 2.3 do plano v1 (estilos `technical` / `grimorial`):** Removida deste plano. É um incremento de escopo que deve ser tratado como feature separada, não como correção de bugs. Se for prioridade, abrir plano dedicado pós-estabilização.

### 2.5. Instrução contra contradições de aspectos (substitui Fase 5.2 do plano v1)

> **Correção sobre o plano v1:** Em vez de instruir a IA a "não expor contradições ao usuário", a raiz do problema deve ser investigada em `elective.ts` ou no `formatElectiveForAI`. A divergência entre aspectos resumidos e reais indica inconsistência nos dados de origem que a IA não deveria precisar esconder.

**Ação de debug** (fora do prompt, no código):
- Em `formatElectiveForAI`, verificar se `moonStatus.aspects` (resumo) e `skyChart.aspects` (reais) são gerados da mesma fonte (`calculateTraditionalAspects` em `elective.ts:189`).
- Se houver divergência, unificar a fonte no engine, antes de enviar à IA.

**Ação no prompt** (como paliativo enquanto o debug não é feito):

```txt
Se houver divergência entre a lista resumida de aspectos lunares e a seção ASPECTOS TRADICIONAIS REAIS, priorize a seção ASPECTOS TRADICIONAIS REAIS (que são os aspectos canônicos calculados pelo engine). Não mencione a divergência no relatório final.
```

---

## Fase 3 — Rota `/api/report`

**Arquivos:** `src/app/api/report/route.ts`

### 3.1. Validação contextual para `elective_magic`

**Problema:** `route.ts:103` — `if (!chart?.birthData)` bloqueia `elective_magic` quando `chart` não é enviado (apenas `contextChart`).

**Solução:** Mover a extração de `reportMode`, `veredict`, `contextChart`, `electiveMode` para antes da validação.

```ts
// ANTES da linha 102, adicionar:
const reportMode = body.reportMode as string | undefined;
const veredict = body.veredict as ElectiveVeredict | undefined;
const contextChart = body.contextChart as NatalChart | undefined;
const electiveMode = body.electiveMode as 'sky_only' | 'sky_plus_natal' | undefined;

// Substituir linhas 102-105:
const chart = body.chart as NatalChart | undefined;

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

### 3.2. Reduzir temperatura para modo eletivo

```ts
// Linha 140 atual:
temperature: 0.7,

// Substituir por:
temperature: body.reportMode === 'elective_magic' ? 0.35 : 0.7,
```

**Critério de rollback:** Se em 5 relatórios consecutivos o texto ficar robótico ou excessivamente repetitivo, subir para `0.45`. Se ainda assim houver alucinação, descer para `0.25`. Manter registro da temperatura em uso para análise posterior.

### 3.3. `reasoning.exclude` — tornar acionável

**Situação atual:** `exclude: false` para `grok-4.1` (linha 146). O raciocínio interno é enviado ao cliente.

**Ação:** Trocar `exclude: false` para `exclude: true`:

```ts
reasoning: {
  effort: 'high',
  exclude: true,  // ← era false
}
```

**Justificativa:** O usuário final deve receber apenas o relatório. O conteúdo de raciocínio interno:
- Aumenta o tráfego da stream (~30-50% a mais de tokens).
- Pode expor o modelo "pensando em voz alta" sobre contradições nos dados.
- Não tem valor para o usuário final.

**Risco:** Nenhum. O `exclude` só remove da resposta final, não altera a qualidade do raciocínio.

---

## Fase 4 — Correspondências ritualísticas estruturadas

**Arquivos:** `src/lib/traditional/types.ts`, `src/lib/traditional/elective.ts`, `src/lib/aiPrompts.ts`, `src/__tests__/aiPrompts.test.ts`

### 4.1. Adicionar `ritualCorrespondences` ao `ElectiveVeredict`

```ts
// Em types.ts, dentro de ElectiveVeredict:
ritualCorrespondences?: {
  colors?: string[];
  metals?: string[];
  incenses?: string[];
  charity?: string;
  intentions?: string[];
};
```

### 4.2. Popular correspondências em `getElectiveVeredict`

```ts
// Em elective.ts, importar:
import { PLANETARY_CORRESPONDENCES, PlanetKey } from './magic-correspondences';

// Após determinar rulerId, mapear para PlanetKey:
const planetKey = rulerId.charAt(0).toUpperCase() + rulerId.slice(1) as PlanetKey;
const correspondences = PLANETARY_CORRESPONDENCES[planetKey];

// Adicionar ao retorno de getElectiveVeredict:
ritualCorrespondences: correspondences ? {
  colors: correspondences.colors,
  metals: correspondences.metals,
  incenses: correspondences.incense,
  charity: correspondences.charity,
  intentions: correspondences.intentions,
} : undefined,
```

### 4.3. Incluir correspondências no dossiê enviado à IA

```ts
// Em formatElectiveForAI, após a linha ~724 (condição do regente):
if (veredict.ritualCorrespondences) {
  result += `\nCORRESPONDÊNCIAS RITUALÍSTICAS FORNECIDAS PELO ASTROMAP:\n`;
  result += '-'.repeat(40) + '\n';

  const c = veredict.ritualCorrespondences;
  if (c.colors?.length) result += `- Cores: ${c.colors.join(', ')}\n`;
  if (c.metals?.length) result += `- Metais: ${c.metals.join(', ')}\n`;
  if (c.incenses?.length) result += `- Incensos: ${c.incenses.join(', ')}\n`;
  if (c.charity) result += `- Caridade planetária: ${c.charity}\n`;
  if (c.intentions?.length) result += `- Intenções favorecidas: ${c.intentions.join(', ')}\n`;
}
```

**Impacto no custo de tokens:** +~120 tokens no prompt de eletiva. Estimativa de custo adicional: ~US$ 0.0001 por relatório (modelo `deepseek-chat`).

### 4.4. Atualizar mock de teste

No `mockElectiveVeredict` em `aiPrompts.test.ts`, adicionar:

```ts
ritualCorrespondences: {
  colors: ['Verde-esmeralda', 'Rosa'],
  metals: ['Cobre'],
  incenses: ['Rosa', 'Sândalo'],
  charity: 'Apoio a mulheres vulneráveis.',
  intentions: ['Amor', 'Atração'],
},
```

### 4.5. Teste para correspondências

```ts
it('should include ritual correspondences in the AI dossier', () => {
  const output = formatElectiveForAI(mockElectiveVeredict, mockSolarChart, 'sky_only');
  expect(output).toContain('CORRESPONDÊNCIAS RITUALÍSTICAS');
  expect(output).toContain('Verde-esmeralda');
  expect(output).toContain('Cobre');
});
```

---

## Fase 5 — Testes de integração para `/api/report`

**Arquivos:** `src/__tests__/api-report.test.ts` (novo, ou adicionar a teste existente)

### 5.1. Teste para elective_magic sem chart natal

```ts
it('should accept elective_magic with contextChart but no chart', async () => {
  const res = await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reportMode: 'elective_magic',
      electiveMode: 'sky_only',
      contextChart: { birthData: { date: '2026-05-15', time: '08:22', ... } },
      veredict: mockElectiveVeredict,
      apiKey: 'test-key',
    }),
  });
  expect(res.status).not.toBe(400);
});
```

### 5.2. Teste para sky_plus_natal sem natalChart

```ts
it('should reject sky_plus_natal without natalChart', async () => {
  const res = await fetch('/api/report', {
    method: 'POST',
    body: JSON.stringify({
      reportMode: 'elective_magic',
      electiveMode: 'sky_plus_natal',
      contextChart: { birthData: { date: '2026-05-15', time: '08:22', ... } },
      veredict: mockElectiveVeredict,
      apiKey: 'test-key',
    }),
  });
  expect(res.status).toBe(400);
  const json = await res.json();
  expect(json.error).toContain('Mapa natal obrigatório');
});
```

> **Nota:** Estes testes exigem mock do `createClient` do Supabase e da resposta da OpenRouter. Verificar `setupTests.ts` ou arquivos de mock existentes no projeto.

---

## Fase 6 — Monitoramento pós-deploy

### 6.1. Adicionar log estruturado para detecção de alucinação

```ts
// No handler de stream (route.ts), após coletar a resposta completa:
const hallucinationPatterns = [
  /\bdaimon\b/i,
  /\binteligência planetária\b/i,
  /\bconjuração\b/i,
  /\boração a\b/i,
  /\bpedra de\b(?!.*fornecida)/i,
];

const foundPatterns = hallucinationPatterns.filter(p => p.test(fullResponse));
if (foundPatterns.length > 0) {
  console.warn('[elective_hallucination_check]', {
    patterns: foundPatterns.map(p => p.source),
    // Não logar o texto completo por privacidade
  });
}
```

### 6.2. Métricas de custo por relatório eletivo

Adicionar log do número de tokens consumidos (quando disponível no header `x-openrouter-tokens`) para comparar antes/depois das mudanças.

---

## Ordem de execução e commits

### Commit 1 — Dossiê lunar e Curso Vazio

```
fix(ai): inclui summary, degreeRange e corrige voidOfCourse para dossiê eletivo
```

Arquivos:
- `src/lib/aiPrompts.ts` (Fase 1.1, 1.2, 1.3)
- `src/__tests__/aiPrompts.test.ts` (Fase 1.4)

Verificar: `npm test -- aiPrompts`

### Commit 2 — Redução de alucinação nos prompts

```
fix(ai): restringe invenção ritualística e extrai base comum dos prompts eletivos
```

Arquivos:
- `src/lib/aiPrompts.ts` (Fase 2.1, 2.2, 2.3, 2.4, 2.5)

Verificar: `npm test -- aiPrompts`

### Commit 3 — Validação e temperatura da rota

```
fix(api): validação contextual para elective_magic e redução de temperatura
```

Arquivos:
- `src/app/api/report/route.ts` (Fase 3.1, 3.2, 3.3)
- `src/__tests__/api-report.test.ts` (Fase 5 — se viável; senão, mover para commit separado)

Verificar: `npm run build`

### Commit 4 — Correspondências ritualísticas

```
feat(ai): envia correspondências mágicas estruturadas à IA
```

Arquivos:
- `src/lib/traditional/types.ts` (Fase 4.1)
- `src/lib/traditional/elective.ts` (Fase 4.2)
- `src/lib/aiPrompts.ts` (Fase 4.3)
- `src/__tests__/aiPrompts.test.ts` (Fase 4.4, 4.5)

Verificar: `npm test`

---

## Impacto estimado de tokens por relatório eletivo

| Mudança | Δ tokens (aprox.) |
|---------|-------------------|
| `lunarMansion.summary` + `degreeRange` | +80 |
| `ritualCorrespondences` | +120 |
| Prompt base extraído (redução) | −150 |
| Estrutura de seções | +50 |
| **Total líquido** | **~+100 tokens** |

Custo adicional estimado: ~US$ 0.0001/relatório (modelo `deepseek-chat`). Desprezível.

---

## Checklist final de aceite

- [x] **Discovery:** `contextChart` confirmado no frontend, `summary` sempre existe, `ritualCorrespondences` ausente, `buildPrompt` OK
- [ ] IA recebe `lunarMansion.summary` e `degreeRange`
- [ ] `voidOfCourseStatus` `not_calculated`/ausente aparece como `NÃO CALCULADO`
- [ ] `formatTraditionalSkyContext` não contradiz existência do resumo da Mansão Lunar
- [ ] Prompts não obrigam a IA a inventar daimon, inteligências, conjurações ou correspondências
- [ ] Termos técnicos são condicionais, não obrigatórios
- [ ] Prompt base extraído reduz duplicação entre os dois prompts eletivos
- [ ] Rota valida `elective_magic` sem exigir `chart.birthData`
- [ ] Temperatura do modo eletivo = 0.35
- [ ] `reasoning.exclude = true` para grok-4.1
- [ ] Correspondências mágicas enviadas no dossiê
- [ ] Testes cobrem os bugs observados (unitários + integração)
- [ ] `npm test` passa
- [ ] `npm run build` passa
- [ ] `npm run lint` passa
- [ ] Log de detecção de alucinação ativo

---

## Diferenças em relação ao plano v1

| Aspecto | Plano v1 | Plano v2 |
|---------|----------|----------|
| Discovery | Ausente | Fase 0 com confirmações de código real |
| `lunarMansion.summary` | `if (lunarMansion.summary)` | Sempre incluso (dado sempre existe) |
| Prompt duplicado | Não abordado | Base comum extraída (Fase 2.1) |
| Estilos `technical`/`grimorial` | Fase 2.3 | Removido (feature separada) |
| Contradição de aspectos | Instruir IA a esconder | Debug na raiz + paliativo no prompt (2.5) |
| `reasoning.exclude` | "Verificar se..." | Decisão: `true` (Fase 3.3) |
| Testes de integração | Ausentes | Fase 5 |
| Log de alucinação | Ausente | Fase 6.1 |
| Métricas de custo | Ausentes | Tabela de impacto + log de tokens (Fase 6.2) |
| Convenções de commit | Ausentes | Mensagens Conventional Commits |
| Rollback de temperatura | Ausente | Critério definido (Fase 3.2) |

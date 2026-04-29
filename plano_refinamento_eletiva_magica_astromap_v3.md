# Plano de Refinamento v3 - Modulo de Eletiva Magica do AstroMap

## 1. Objetivo

Refinar o modulo de **Eletiva Magica** para que os relatorios de IA sejam mais fieis aos dados calculados pelo engine, reduzam alucinacao ritualistica, tratem corretamente Mansao Lunar e Lua Fora de Curso, validem a rota `/api/report` de forma contextual e enviem correspondencias magicas de modo estruturado.

Este plano substitui o v2 como roteiro de implementacao. Ele preserva o melhor do plano anterior, mas corrige premissas encontradas no codigo real:

- O frontend atual envia `chart: skyChart` para `/api/report`, nao `contextChart`.
- A rota ainda deve aceitar `contextChart` como contrato mais explicito para eletivas, sem quebrar o fluxo atual.
- `formatElectiveForAI` usa `moonStatus.aspects` de uma fonte e `formatTraditionalSkyContext` usa `chart.aspects` de outra, o que pode gerar contradicoes.
- As guardrails eletivas ja existem em constantes reutilizaveis; a extracao de prompt base nao deve criar uma terceira copia dessas regras.
- `PLANETARY_CORRESPONDENCES` ja existe, mas ainda nao entra no `ElectiveVeredict` nem no dossie enviado a IA.

## 2. Escopo e nao-escopo

### Em escopo

- Ajustar validacao e payload de `/api/report` para `elective_magic`.
- Ajustar temperatura e `reasoning.exclude` para o modelo atual `x-ai/grok-4.1-fast`.
- Enriquecer o dossie eletivo com `lunarMansion.summary`, `lunarMansion.degreeRange` e correspondencias ritualisticas estruturadas.
- Corrigir tratamento textual de `voidOfCourseStatus`.
- Unificar a fonte de aspectos tradicionais usada no dossie de IA.
- Endurecer prompts eletivos contra invencao de entidades, oracoes, pedras, metais, incensos e termos tecnicos nao fornecidos.
- Cobrir os comportamentos novos com testes unitarios e testes de rota.

### Fora de escopo nesta rodada

- Criar modos de estilo como `technical` ou `grimorial`.
- Redesenhar a UI do modulo de eletiva.
- Persistir `ritualCorrespondences` em storage/Supabase. O veredito e recalculado no fluxo atual, entao a persistencia deve ser planejada separadamente se virar requisito.
- Adicionar monitoramento completo de alucinacao lendo a resposta inteira do stream. Isso muda o comportamento de streaming e deve ser tratado como melhoria posterior.
- Validar astrologicamente todas as mansoes contra fontes historicas externas. Este plano usa o resumo ja existente no engine.

## 3. Criterios de aceite

- `/api/report` aceita `elective_magic` com `contextChart` e sem `chart`.
- `/api/report` continua aceitando o fluxo atual do frontend com `chart: skyChart`.
- `/api/report` rejeita `sky_plus_natal` sem `natalChart.birthData`.
- O modo eletivo usa temperatura menor que os demais relatorios.
- Para `grok-4.1`, `reasoning.exclude` fica `true`.
- O dossie da IA inclui Mansao Lunar, faixa da mansao e resumo/virtude da mansao.
- `voidOfCourseStatus` ausente ou `not_calculated` aparece como `NAO CALCULADO`.
- Aspectos tradicionais reais e resumo lunar usam a mesma fonte canonica.
- Prompts nao obrigam uso de `Daimon`, `Inteligencia Planetaria`, conjuracoes ou correspondencias ausentes.
- Correspondencias ritualisticas aparecem no dossie somente quando fornecidas.
- `npm run lint`, `npm run build` e `npm run test` passam antes de entregar.

## 4. Plano de implementacao

### Commit 1 - Corrigir rota e contrato de entrada eletivo

**Mensagem sugerida:** `fix(api): valida entrada contextual de relatorio eletivo`

**Arquivos:**

- `src/app/api/report/route.ts`
- `src/__tests__/api-report.test.ts` ou `src/__tests__/reportRoute.test.ts`

**Mudancas:**

1. Mover a leitura de campos relevantes para logo apos o parse do body:

```ts
const chart = body.chart as NatalChart | undefined;
const contextChart = body.contextChart as NatalChart | undefined;
const reportMode = body.reportMode as string | undefined;
const electiveMode = body.electiveMode as ElectiveMode | undefined;
const veredict = body.veredict as ElectiveVeredict | undefined;
const natalChart = body.natalChart as NatalChart | undefined;
const skyChart = contextChart ?? chart;
```

1. Adicionar um type guard local para o modo eletivo:

```ts
function isElectiveMode(value: unknown): value is ElectiveMode {
  return value === 'sky_only' || value === 'sky_plus_natal';
}
```

1. Trocar a validacao incondicional de `chart.birthData` por validacao contextual:

```ts
if (reportMode === 'elective_magic') {
  if (!veredict || !isElectiveMode(electiveMode) || !skyChart?.birthData) {
    return NextResponse.json(
      { error: 'Dados da eletiva sao obrigatorios: veredito, modo de leitura e ceu do momento.' },
      { status: 400 },
    );
  }

  if (electiveMode === 'sky_plus_natal' && !natalChart?.birthData) {
    return NextResponse.json(
      { error: 'Mapa natal obrigatorio para o modo ceu do momento + mapa natal.' },
      { status: 400 },
    );
  }
} else if (!chart?.birthData) {
  return NextResponse.json({ error: 'Dados do mapa natal sao obrigatorios.' }, { status: 400 });
}
```

1. Ajustar `buildPrompt` para aceitar o mapa efetivo usado na validacao. Evitar chamar `buildPrompt(body, chart, ...)` quando `chart` pode ser `undefined` no contrato `contextChart`:

```ts
const promptChart = reportMode === 'elective_magic' ? skyChart! : chart!;
const prompt = await buildPrompt(body, promptChart, profile?.is_demo ?? false);
```

1. Dentro de `buildPrompt`, manter o fallback `contextChart || chart`, mas o `chart` recebido ja deve ser o mapa efetivo validado para eletivas.

2. Trocar temperatura por modo:

```ts
temperature: reportMode === 'elective_magic' ? 0.35 : 0.7,
```

1. Trocar `reasoning.exclude` para `true` em `grok-4.1`:

```ts
reasoning: {
  effort: 'high',
  exclude: true,
}
```

**Testes:**

- Mockar `createClient` de `@/lib/supabase/server` para retornar usuario autenticado, perfil valido e chain `.from().select().eq().single()`.
- Mockar `global.fetch` para simular OpenRouter com stream SSE minimo.
- Testar `POST(new NextRequest(...))`, nao `fetch('/api/report')` em ambiente Node.
- Casos obrigatorios:
  - aceita `elective_magic` com `contextChart` e sem `chart`;
  - aceita fluxo atual com `chart: skyChart`;
  - rejeita `sky_plus_natal` sem `natalChart.birthData`;
  - rejeita `elective_magic` sem `veredict`;
  - payload enviado a OpenRouter usa `temperature: 0.35`;
  - payload de `grok-4.1` usa `reasoning.exclude: true`.

### Commit 2 - Enriquecer dossie lunar e corrigir Curso Vazio

**Mensagem sugerida:** `fix(ai): inclui dossie lunar e normaliza curso vazio`

**Arquivos:**

- `src/lib/aiPrompts.ts`
- `src/__tests__/aiPrompts.test.ts`

**Mudancas:**

1. Criar helper privado em `aiPrompts.ts`:

```ts
function formatVoidOfCourseStatus(status?: ElectiveVeredict['moonStatus']['voidOfCourseStatus']): string {
  if (status === 'void') return 'SIM (Lua Fora de Curso)';
  if (status === 'not_void') return 'NAO';
  return 'NAO CALCULADO';
}
```

1. Se preferir preservar acentos na saida atual, usar `NÃO` e `NÃO CALCULADO`; manter os testes alinhados com o padrao real de `translateElectiveText`.

2. Em `formatElectiveForAI`, apos a linha da Mansao Lunar, incluir sempre:

```ts
result += `- Faixa da Mansao Lunar: ${lunarMansion.degreeRange}\n`;
result += `- Virtude/Sumario da Mansao Lunar: ${lunarMansion.summary}\n`;
```

1. Substituir o ternario atual do Curso Vazio por:

```ts
result += `- Curso Vazio: ${formatVoidOfCourseStatus(moonStatus.voidOfCourseStatus)}\n`;
```

1. Ajustar `formatTraditionalSkyContext` para receber opcoes:

```ts
function formatTraditionalSkyContext(
  chart: NatalChart,
  options?: { hasLunarMansionSummary?: boolean },
): string
```

1. No bloco `DADOS NAO CALCULADOS`, trocar a frase fixa sobre virtudes completas:

```ts
if (options?.hasLunarMansionSummary) {
  result.push('- Virtudes completas das mansoes lunares: RESUMO BASICO FORNECIDO PELO ASTROMAP; NAO EXPANDIR ALEM DO SUMARIO');
} else {
  result.push('- Virtudes completas das mansoes lunares: NAO CALCULADAS PELO ASTROMAP NESTA VERSAO');
}
```

1. Chamar:

```ts
result += formatTraditionalSkyContext(skyChart, { hasLunarMansionSummary: true });
```

**Testes:**

- Inclui `Virtude/Sumario da Mansao Lunar`.
- Inclui `Faixa da Mansao Lunar`.
- `voidOfCourseStatus: 'void'` gera `SIM`.
- `voidOfCourseStatus: 'not_void'` gera `NAO`/`NÃO`.
- `voidOfCourseStatus: 'not_calculated'` gera `NAO CALCULADO`/`NÃO CALCULADO`.
- Status ausente, via mock manual tipado com `unknown as ElectiveVeredict`, tambem gera `NAO CALCULADO`.
- O dossie nao declara que as virtudes lunares sao totalmente ausentes quando o resumo basico foi enviado.

### Commit 3 - Unificar fonte canonica dos aspectos tradicionais

**Mensagem sugerida:** `fix(ai): usa aspectos tradicionais canonicos no dossie eletivo`

**Arquivos:**

- `src/lib/aiPrompts.ts`
- `src/__tests__/aiPrompts.test.ts`

**Problema:**

`moonStatus.aspects` e gerado em `getElectiveVeredict` usando `calculateTraditionalAspects(targetPlanets)`, mas `formatTraditionalSkyContext` lista aspectos de `chart.aspects`. Essa diferenca pode colocar no prompt dois conjuntos distintos de aspectos.

**Mudancas:**

1. Importar `calculateTraditionalAspects` e `getPlanetNamePT` de `./traditional/aspects`, se ainda nao estiverem disponiveis.

2. Em `formatTraditionalSkyContext`, substituir o calculo de `majorAspects` baseado em `chart.aspects` por:

```ts
const majorAspects = calculateTraditionalAspects(chart.planets)
  .sort((a, b) => a.orb - b.orb)
  .slice(0, 20);
```

1. Ajustar a formatacao para o shape de `TraditionalAspect`:

```ts
const typePT = ASPECT_NAMES_PT[aspect.type] || aspect.type;
result.push(
  `- ${getPlanetNamePT(aspect.p1)} ${typePT} ${getPlanetNamePT(aspect.p2)} ` +
  `(Orbita: ${aspect.orb.toFixed(1)} deg, ${aspect.isApplying ? 'aplicando' : 'separando'})`,
);
```

1. Manter `chart.aspects` fora da secao eletiva para evitar contradicao. Outros formatos de relatorio nao devem ser alterados.

2. Nao adicionar uma instrucao de prompt para esconder divergencias; a divergencia deve ser removida na origem.

**Testes:**

- Montar `mockSolarChart.aspects` com um aspecto moderno ou inconsistente e `mockSolarChart.planets` com um aspecto tradicional calculavel.
- Confirmar que `ASPECTOS TRADICIONAIS REAIS` reflete a fonte calculada por `calculateTraditionalAspects`.
- Confirmar que planetas modernos nao entram como aspectos calculados.
- Evitar teste `not.toContain('Urano')` no output completo, pois `DADOS NAO CALCULADOS` pode mencionar planetas modernos por nome.

### Commit 4 - Adicionar correspondencias ritualisticas estruturadas

**Mensagem sugerida:** `feat(ai): envia correspondencias magicas estruturadas para IA`

**Arquivos:**

- `src/lib/traditional/types.ts`
- `src/lib/traditional/elective.ts`
- `src/lib/aiPrompts.ts`
- `src/__tests__/aiPrompts.test.ts`

**Mudancas de tipo:**

Adicionar em `ElectiveVeredict`:

```ts
ritualCorrespondences?: {
  colors?: string[];
  metals?: string[];
  incenses?: string[];
  charity?: string;
  intentions?: string[];
};
```

**Mudancas no engine:**

1. Importar correspondencias:

```ts
import { PLANETARY_CORRESPONDENCES, PlanetKey } from './magic-correspondences';
```

1. Evitar cast dinamico por capitalizacao. Criar mapa explicito:

```ts
const PLANET_ID_TO_KEY: Record<string, PlanetKey> = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
};
```

1. Em `getElectiveVeredict`, apos `rulerId`, resolver:

```ts
const planetKey = PLANET_ID_TO_KEY[rulerId];
const correspondences = planetKey ? PLANETARY_CORRESPONDENCES[planetKey] : undefined;
```

1. No retorno do veredito:

```ts
ritualCorrespondences: correspondences
  ? {
      colors: correspondences.colors,
      metals: correspondences.metals,
      incenses: correspondences.incense,
      charity: correspondences.charity,
      intentions: correspondences.intentions,
    }
  : undefined,
```

**Mudancas no dossie de IA:**

Em `formatElectiveForAI`, depois da condicao do regente e antes do contexto completo:

```ts
if (veredict.ritualCorrespondences) {
  const c = veredict.ritualCorrespondences;
  result += `CORRESPONDENCIAS RITUALISTICAS FORNECIDAS PELO ASTROMAP:\n`;
  result += '-'.repeat(40) + '\n';
  if (c.colors?.length) result += `- Cores: ${c.colors.join(', ')}\n`;
  if (c.metals?.length) result += `- Metais: ${c.metals.join(', ')}\n`;
  if (c.incenses?.length) result += `- Incensos: ${c.incenses.join(', ')}\n`;
  if (c.charity) result += `- Caridade planetaria: ${c.charity}\n`;
  if (c.intentions?.length) result += `- Intencoes favorecidas: ${c.intentions.join(', ')}\n`;
  result += `\n`;
}
```

**Testes:**

- Atualizar `mockElectiveVeredict` com correspondencias de Venus.
- Confirmar que o dossie inclui cores, metais, incensos, caridade e intencoes.
- Confirmar que, sem `ritualCorrespondences`, a secao nao aparece.
- Adicionar teste unitario pequeno para `getElectiveVeredict` se ja houver fixture facil; caso contrario, cobrir via `formatElectiveForAI` e manter validacao do engine para uma rodada posterior.

### Commit 5 - Endurecer prompts eletivos sem duplicar guardrails

**Mensagem sugerida:** `fix(ai): restringe instrucoes ritualisticas dos prompts eletivos`

**Arquivos:**

- `src/lib/aiPrompts.ts`
- `src/__tests__/aiPrompts.test.ts`

**Mudancas:**

1. Nao criar uma nova copia completa de `REGRAS DE CONFIABILIDADE`. As constantes existentes ja sao injetadas no user message:

- `ELECTIVE_CONFIDENCE_GUARDRAILS`
- `ELECTIVE_PROHIBITED_RULES`
- `ELECTIVE_HOUSES_LEGEND`
- `ELECTIVE_FEW_SHOT_EXAMPLES`

1. Criar uma constante pequena apenas para as regras ritualisticas compartilhadas dos system prompts:

```ts
const ELECTIVE_MAGIC_RITUAL_DATA_RULES = `
REGRAS PARA CORRESPONDENCIAS RITUALISTICAS:
- Use somente cores, metais, incensos, caridades e intencoes listados no dossie tecnico.
- Nao invente nomes de inteligencias, daimon, espiritos, salmos, oracoes, conjuracoes, pedras, metais ou incensos.
- Se um item ritualistico nao estiver nos dados recebidos, omita ou diga: "Dado ritualistico nao fornecido pelo AstroMap".
- Termos como Almuten, Cazimi, Triplicidade, Sinodo, Inteligencia Planetaria e Daimon so podem ser usados quando tecnicamente sustentados pelos dados fornecidos.
`;
```

1. Inserir essa constante em ambos os prompts eletivos.

2. Trocar as secoes ritualisticas atuais por instrucoes condicionadas aos dados fornecidos.

3. Trocar "Termos obrigatorios" por "Termos permitidos quando aplicaveis".

4. Atualizar a estrutura sugerida de resposta para secoes auditaveis:

```md
### I. Veredito Tecnico da Eleicao
### II. Regente do Proposito
### III. Lua, Fase e Curso
### IV. Mansao Lunar
### V. Hora Planetaria
### VI. Testemunhos Favoraveis e Contrarios
### VII. Correspondencias Ritualisticas Fornecidas
### VIII. Conselho Final
```

1. Em `sky_plus_natal`, manter secoes personalizadas, mas sem mandar inventar pontes por pedras/metais ausentes. A ponte entre natal e ceu eleito deve ser astrologica, nao uma correspondencia material inventada.

**Testes:**

- Prompts contem regra para nao inventar correspondencias.
- Prompts nao contem mais "Termos obrigatorios".
- Prompts contem "Termos permitidos quando aplicaveis".
- Prompts mantem identidade ritualistica e personalizacao ao Radix.
- Prompts contem referencia a `Correspondencias Ritualisticas Fornecidas`.

## 5. Plano de testes completo

### Testes unitarios de prompt

Executar:

```bash
npm run test -- aiPrompts
```

Cobrir:

- Mansao Lunar com `degreeRange` e `summary`.
- Curso Vazio `void`, `not_void`, `not_calculated` e ausente.
- Secao de virtudes lunares nao contradiz resumo fornecido.
- Aspectos tradicionais usam `calculateTraditionalAspects(chart.planets)`.
- Correspondencias ritualisticas aparecem somente quando existem.
- Prompts eletivos nao obrigam termos ou entidades nao fornecidas.

### Testes de rota

Executar:

```bash
npm run test -- api-report
```

Ou o nome escolhido para o arquivo de teste.

Cobrir:

- Usuario nao autenticado retorna 401.
- Body invalido retorna 400.
- Natal/traditional/solar sem `chart.birthData` continuam retornando 400.
- `elective_magic` aceita `contextChart`.
- `elective_magic` aceita `chart: skyChart`.
- `sky_plus_natal` sem natal valido retorna 400.
- OpenRouter recebe `temperature: 0.35` no modo eletivo.
- OpenRouter recebe `temperature: 0.7` nos demais modos.
- `reasoning.exclude` e `true` para `x-ai/grok-4.1-fast`.

### Validacao final obrigatoria

Executar antes de concluir:

```bash
npm run lint
npm run build
npm run test
```

Se houver falha preexistente nao relacionada, registrar no resumo final com evidencia e manter as mudancas focadas.

## 6. Riscos e mitigacoes

| Risco | Mitigacao |
| --- | --- |
| Quebrar fluxo atual do frontend | Aceitar tanto `chart: skyChart` quanto `contextChart` na rota. |
| Criar duplicacao de regras nos prompts | Reaproveitar constantes existentes e adicionar apenas regras ritualisticas compartilhadas. |
| Contradicao entre aspectos lunares e aspectos reais | Usar `calculateTraditionalAspects(chart.planets)` como fonte unica no dossie eletivo. |
| Teste de planeta moderno falhar por mencao em `DADOS NAO CALCULADOS` | Testar apenas secoes calculadas, nao o output completo. |
| `reasoning.exclude` alterar debug manual | Se necessario, criar toggle futuro de diagnostico; para usuario final, manter `true`. |
| Temperatura 0.35 deixar texto repetitivo | Ajustar para 0.45 em plano posterior se cinco relatorios consecutivos ficarem excessivamente rigidos. |
| Correspondencias calculadas por cast invalido | Usar mapa explicito `PLANET_ID_TO_KEY`, sem capitalizacao dinamica. |

## 7. Checklist de implementacao

- [ ] Criar/ajustar testes da rota antes ou junto da mudanca de validacao.
- [ ] Corrigir `/api/report` para aceitar `contextChart` e fluxo atual com `chart`.
- [ ] Usar `skyChart` validado ao chamar `buildPrompt`.
- [ ] Aplicar temperatura eletiva `0.35`.
- [ ] Definir `reasoning.exclude = true`.
- [ ] Incluir `degreeRange` e `summary` da Mansao Lunar no dossie.
- [ ] Normalizar Curso Vazio com helper dedicado.
- [ ] Fazer `formatTraditionalSkyContext` reconhecer resumo lunar fornecido.
- [ ] Unificar aspectos tradicionais pela fonte `calculateTraditionalAspects`.
- [ ] Adicionar `ritualCorrespondences` ao tipo `ElectiveVeredict`.
- [ ] Popular correspondencias via mapa explicito de planeta.
- [ ] Inserir correspondencias no dossie enviado a IA.
- [ ] Restringir prompts a dados ritualisticos fornecidos.
- [ ] Atualizar testes de prompt.
- [ ] Rodar `npm run lint`.
- [ ] Rodar `npm run build`.
- [ ] Rodar `npm run test`.

## 8. Ordem recomendada de execucao

1. Implementar Commit 1 primeiro, porque corrige o contrato da rota e evita bug de `buildPrompt` com `contextChart`.
2. Implementar Commit 2, pois melhora o dossie sem mudar contratos externos.
3. Implementar Commit 3, porque remove contradicao de origem antes de mexer mais nos prompts.
4. Implementar Commit 4, porque cria os dados ritualisticos estruturados.
5. Implementar Commit 5 por ultimo, quando os prompts ja podem exigir que o modelo use apenas as correspondencias fornecidas.

## 9. Backlog pos-estabilizacao

- Criar modo de estilo `technical`/`grimorial` como feature separada.
- Avaliar monitoramento de alucinacao apos stream, acumulando resposta com limite de memoria e sem logar texto sensivel.
- Registrar estatisticas de custo via endpoint de generation stats da OpenRouter, usando o `id` da resposta quando disponivel.
- Revisar historicamente os textos das 28 mansoes lunares em `LUNAR_MANSIONS`.
- Adicionar persistencia remota de dossie/veredito completo se o produto passar a recarregar relatorios eletivos sem recalcular o ceu.

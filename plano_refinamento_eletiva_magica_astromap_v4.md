# Refinamento do Módulo de Eletiva Mágica — Plano Consolidado v4

## Contexto

Este plano consolida os três planos anteriores (v1, v2, v3) em um único roteiro verificado contra o código atual. O objetivo é corrigir o módulo de **Eletiva Mágica** para que os relatórios de IA sejam tecnicamente precisos, auditáveis e fiéis aos dados calculados pelo engine.

> [!IMPORTANT]
> Este plano **substitui** os três planos anteriores (`plano_refinamento_eletiva_magica_astromap.md`, `_v2.md`, `_v3.md`) como roteiro de implementação.

---

## Diagnóstico Verificado no Código Atual

### Problemas Confirmados

| # | Problema | Arquivo | Linhas |
|---|---------|---------|--------|
| 1 | Rota exige `chart.birthData` incondicionalmente, bloqueando eletivas que usam `contextChart` | [route.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/app/api/report/route.ts) | L102-105 |
| 2 | Temperatura fixa `0.7` para todos os modos — alta demais para eletiva técnica | [route.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/app/api/report/route.ts) | L140 |
| 3 | `reasoning.exclude: false` para grok-4.1 — desperdiça tokens de raciocínio na resposta | [route.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/app/api/report/route.ts) | L147 |
| 4 | `lunarMansion.summary` e `degreeRange` existem no tipo mas NÃO são enviados para a IA | [aiPrompts.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/aiPrompts.ts) | L713 |
| 5 | Void of Course: ternário simples transforma `not_calculated` em "NÃO" (afirmação falsa) | [aiPrompts.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/aiPrompts.ts) | L715 |
| 6 | Aspectos do dossiê usam `chart.aspects` (fonte moderna), mas moonStatus usa `calculateTraditionalAspects` — duas fontes divergentes | [aiPrompts.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/aiPrompts.ts) | L86-94 vs elective.ts L189 |
| 7 | `PLANETARY_CORRESPONDENCES` existe mas NÃO entra no `ElectiveVeredict` nem no dossiê IA | [magic-correspondences.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/traditional/magic-correspondences.ts) | L13-63 |
| 8 | Prompts obrigam termos como "Daimon", "Inteligência Planetária" e pedem conjurações não fornecidas | [aiPrompts.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/aiPrompts.ts) | L791, L855 |
| 9 | `DADOS NÃO CALCULADOS` diz "Virtudes completas das mansões lunares: NÃO CALCULADAS" mesmo quando `summary` está disponível | [aiPrompts.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/aiPrompts.ts) | L137 |

### Fatos Verificados (sem ação necessária)

- `LunarMansion` sempre tem `summary` e `degreeRange` populados (tipo obrigatório em `types.ts:73-79`, populado via `LUNAR_MANSIONS[]` em `elective.ts`)
- `voidOfCourseStatus` no engine sempre retorna `'void'` ou `'not_void'` (`elective.ts:219`), mas o tipo aceita `'not_calculated'` — tratamento defensivo é válido
- Guardrails já existem como constantes reutilizáveis (`ELECTIVE_CONFIDENCE_GUARDRAILS`, `ELECTIVE_PROHIBITED_RULES`, `ELECTIVE_HOUSES_LEGEND`, `ELECTIVE_FEW_SHOT_EXAMPLES`) — NÃO duplicar
- Frontend atual envia `chart: skyChart` — a rota deve continuar aceitando este fluxo além de `contextChart`

---

## Escopo e Não-Escopo

### Em escopo

- Ajustar validação e payload de `/api/report` para `elective_magic`
- Temperatura e `reasoning.exclude` otimizados para modelo atual
- Enriquecer dossiê com `lunarMansion.summary`, `degreeRange` e correspondências rituais
- Normalizar `voidOfCourseStatus` com helper dedicado
- Unificar fonte de aspectos tradicionais
- Endurecer prompts contra invenção de entidades/correspondências não fornecidas
- Cobrir novos comportamentos com testes

### Fora de escopo

- Modos de estilo `technical`/`grimorial`
- Redesenho de UI
- Persistência de `ritualCorrespondences` em Supabase
- Monitoramento pós-stream de alucinação
- Validação histórica das 28 mansões lunares

---

## Plano de Implementação

### Commit 1 — Corrigir rota e contrato de entrada eletivo

**Mensagem:** `fix(api): valida entrada contextual de relatório eletivo`

#### [MODIFY] [route.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/app/api/report/route.ts)

1. **Validação contextual** (L102-105): Trocar a verificação incondicional de `chart.birthData` por validação por modo:
   - `elective_magic`: exige `veredict`, `electiveMode` válido e `skyChart.birthData` (onde `skyChart = contextChart ?? chart`)
   - `sky_plus_natal`: exige adicionalmente `natalChart.birthData`
   - Demais modos: mantém exigência de `chart.birthData`

2. **Temperatura por modo** (L140): `temperature: reportMode === 'elective_magic' ? 0.35 : 0.7`

3. **Reasoning exclude** (L147): `exclude: true` para grok-4.1

4. **buildPrompt chart**: Passa `skyChart!` validado em vez de `chart` para evitar undefined

#### [NEW] `src/__tests__/api-report.test.ts`

Testes obrigatórios:

- Aceita `elective_magic` com `contextChart` (sem `chart`)
- Aceita fluxo atual com `chart: skyChart`
- Rejeita `sky_plus_natal` sem `natalChart.birthData` → 400
- Rejeita `elective_magic` sem `veredict` → 400
- Payload OpenRouter usa `temperature: 0.35` no modo eletivo
- Payload grok-4.1 usa `reasoning.exclude: true`

---

### Commit 2 — Enriquecer dossiê lunar e normalizar Curso Vazio

**Mensagem:** `fix(ai): inclui dossiê lunar e normaliza curso vazio`

#### [MODIFY] [aiPrompts.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/aiPrompts.ts)

1. **Helper `formatVoidOfCourseStatus`** (novo, antes de `formatElectiveForAI`):

   ```ts
   function formatVoidOfCourseStatus(
     status?: ElectiveVeredict['moonStatus']['voidOfCourseStatus']
   ): string {
     if (status === 'void') return 'SIM (Lua Fora de Curso)';
     if (status === 'not_void') return 'NÃO';
     return 'NÃO CALCULADO';
   }
   ```

2. **Mansão Lunar expandida** (após L713): Adicionar sempre `degreeRange` e `summary`:

   ```ts
   result += `- Faixa da Mansão Lunar: ${lunarMansion.degreeRange}\n`;
   result += `- Virtude/Sumário da Mansão Lunar: ${lunarMansion.summary}\n`;
   ```

3. **Curso Vazio normalizado** (L715): Substituir ternário por `formatVoidOfCourseStatus(moonStatus.voidOfCourseStatus)`

4. **`formatTraditionalSkyContext` parametrizado** (L82): Adicionar parâmetro `options?: { hasLunarMansionSummary?: boolean }` e ajustar L137:
   - Se `hasLunarMansionSummary`: "RESUMO BÁSICO FORNECIDO PELO ASTROMAP; NÃO EXPANDIR ALÉM DO SUMÁRIO"
   - Caso contrário: mantém mensagem atual

5. **Chamada atualizada** (L729): `formatTraditionalSkyContext(skyChart, { hasLunarMansionSummary: true })`

#### [MODIFY] `src/__tests__/aiPrompts.test.ts`

- `voidOfCourseStatus: 'void'` → contém "SIM"
- `voidOfCourseStatus: 'not_void'` → contém "NÃO" (sem "CALCULADO")
- `voidOfCourseStatus: 'not_calculated'` → contém "NÃO CALCULADO"
- Status ausente → "NÃO CALCULADO"
- Dossiê contém "Faixa da Mansão Lunar"
- Dossiê contém "Virtude/Sumário da Mansão Lunar"
- Seção NÃO CALCULADOS menciona resumo fornecido (não "NÃO CALCULADAS")

---

### Commit 3 — Unificar fonte canônica dos aspectos tradicionais

**Mensagem:** `fix(ai): usa aspectos tradicionais canônicos no dossiê eletivo`

#### [MODIFY] [aiPrompts.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/aiPrompts.ts)

**Problema:** `formatTraditionalSkyContext` (L86-94) usa `chart.aspects` (calculados pelo chart builder, potencialmente com planetas modernos e orbes diferentes), enquanto `getElectiveVeredict` (L189) usa `calculateTraditionalAspects(targetPlanets)`. Isso gera dois conjuntos de aspectos potencialmente contraditórios no prompt.

1. **Importar** `calculateTraditionalAspects` de `./traditional/aspects`

2. **Substituir** L86-94 por:

   ```ts
   const majorAspects = calculateTraditionalAspects(chart.planets)
     .sort((a, b) => a.orb - b.orb)
     .slice(0, 20);
   ```

3. **Ajustar formatação** para o shape de `TraditionalAspect` (L128-131):

   ```ts
   const typePT = ASPECT_NAMES_PT[aspect.type] || aspect.type;
   result.push(
     `- ${getPlanetNamePT(aspect.p1)} ${typePT} ${getPlanetNamePT(aspect.p2)} ` +
     `(Órbita: ${aspect.orb.toFixed(1)}°, ${aspect.isApplying ? 'aplicando' : 'separando'})`
   );
   ```

> [!WARNING]
> `formatTraditionalSkyContext` é usada apenas pelo dossiê eletivo (chamada em `formatElectiveForAI` L729). Outros modos de relatório usam `formatChartForAI` ou `formatTraditionalChartForAI`, que NÃO são afetados por esta mudança.

#### [MODIFY] `src/__tests__/aiPrompts.test.ts`

- Confirmar que "ASPECTOS TRADICIONAIS REAIS" reflete `calculateTraditionalAspects`
- Confirmar que planetas modernos (Urano, Netuno, Plutão) não aparecem na seção de aspectos calculados

---

### Commit 4 — Injetar correspondências rituais estruturadas

**Mensagem:** `feat(ai): envia correspondências mágicas estruturadas para IA`

#### [MODIFY] [types.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/traditional/types.ts)

Adicionar campo opcional em `ElectiveVeredict` (após L108):

```ts
ritualCorrespondences?: {
  colors?: string[];
  metals?: string[];
  incenses?: string[];
  charity?: string;
  intentions?: string[];
};
```

#### [MODIFY] [elective.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/traditional/elective.ts)

1. Importar `PLANETARY_CORRESPONDENCES` e `PlanetKey`
2. Criar mapa explícito `PLANET_ID_TO_KEY: Record<string, PlanetKey>` (sem capitalização dinâmica)
3. Em `getElectiveVeredict`, resolver correspondências via `PLANET_ID_TO_KEY[rulerId]` e incluir no retorno

#### [MODIFY] [aiPrompts.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/aiPrompts.ts)

Em `formatElectiveForAI`, após condição do regente (L725), antes do contexto completo (L727):

```ts
if (veredict.ritualCorrespondences) {
  const c = veredict.ritualCorrespondences;
  result += `CORRESPONDÊNCIAS RITUALISTICAS FORNECIDAS PELO ASTROMAP:\n`;
  result += '-'.repeat(40) + '\n';
  if (c.colors?.length) result += `- Cores: ${c.colors.join(', ')}\n`;
  if (c.metals?.length) result += `- Metais: ${c.metals.join(', ')}\n`;
  if (c.incenses?.length) result += `- Incensos: ${c.incenses.join(', ')}\n`;
  if (c.charity) result += `- Caridade planetária: ${c.charity}\n`;
  if (c.intentions?.length) result += `- Intenções favorecidas: ${c.intentions.join(', ')}\n`;
  result += '\n';
}
```

#### [MODIFY] `src/__tests__/aiPrompts.test.ts`

- Com correspondências: dossiê contém "Cores:", "Metais:", "Incensos:"
- Sem correspondências: seção não aparece

---

### Commit 5 — Endurecer prompts sem duplicar guardrails

**Mensagem:** `fix(ai): restringe instruções ritualísticas dos prompts eletivos`

#### [MODIFY] [aiPrompts.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/aiPrompts.ts)

1. **Nova constante compartilhada** (junto das demais guardrails):

   ```ts
   const ELECTIVE_MAGIC_RITUAL_DATA_RULES = `
   REGRAS PARA CORRESPONDÊNCIAS RITUALÍSTICAS:
   - Use somente cores, metais, incensos, caridades e intenções listados no dossiê técnico.
   - Não invente nomes de inteligências, daimon, espíritos, salmos, orações, conjurações, pedras, metais ou incensos.
   - Se um item ritualístico não estiver nos dados recebidos, omita ou diga: "Dado não fornecido pelo AstroMap".
   - Termos como Almuten, Cazimi, Triplicidade, Sínodo, Inteligência Planetária e Daimon só podem ser usados quando tecnicamente sustentados pelos dados fornecidos.`;
   ```

2. **Inserir** `ELECTIVE_MAGIC_RITUAL_DATA_RULES` em ambos os system prompts (L738-792 e L794-859)

3. **Trocar** "Termos obrigatórios" → "Termos permitidos quando aplicáveis" (L791, L855)

4. **Condicionar** seção de liturgia/instruções rituais aos dados fornecidos (não mandar a IA inventar pontes por pedras/metais ausentes)

5. **Ajustar estrutura sugerida** para seções auditáveis

#### [MODIFY] `src/__tests__/aiPrompts.test.ts`

- Prompts contêm regra para não inventar correspondências
- Prompts NÃO contêm "Termos obrigatórios"
- Prompts contêm "Termos permitidos quando aplicáveis"
- Prompts contêm referência a "Correspondências Ritualísticas Fornecidas"

---

## Critérios de Aceite Globais

- [ ] `/api/report` aceita `elective_magic` com `contextChart` e sem `chart`
- [ ] `/api/report` continua aceitando fluxo atual com `chart: skyChart`
- [ ] `/api/report` rejeita `sky_plus_natal` sem `natalChart.birthData`
- [ ] Modo eletivo usa `temperature: 0.35`
- [ ] grok-4.1 usa `reasoning.exclude: true`
- [ ] Dossiê inclui Mansão Lunar com `degreeRange` e `summary`
- [ ] `voidOfCourseStatus` ausente → "NÃO CALCULADO"
- [ ] Aspectos tradicionais usam fonte canônica única
- [ ] Correspondências rituais aparecem no dossiê quando disponíveis
- [ ] Prompts não obrigam uso de termos/entidades não fornecidos
- [ ] `npm run lint`, `npm run build`, `npm run test` passam

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Quebrar fluxo frontend atual | Aceitar `chart: skyChart` E `contextChart` na rota |
| Duplicação de guardrails nos prompts | Reutilizar constantes existentes; adicionar apenas `RITUAL_DATA_RULES` |
| Contradição entre aspectos | Fonte única via `calculateTraditionalAspects` |
| Cast dinâmico de `planetId` para `PlanetKey` | Mapa explícito `PLANET_ID_TO_KEY` |
| Temperatura 0.35 muito restritiva | Ajustar para 0.45 se cinco relatórios ficarem repetitivos |
| `reasoning.exclude: true` dificulta debug | Toggle futuro de diagnóstico se necessário |

---

## Ordem de Execução

1. **Commit 1** → corrige contrato da rota (pré-requisito para tudo)
2. **Commit 2** → melhora dossiê sem mudar contratos externos
3. **Commit 3** → remove contradição de aspectos antes de mexer nos prompts
4. **Commit 4** → cria dados rituais estruturados
5. **Commit 5** → endurece prompts quando os dados já estão disponíveis

---

## Backlog Pós-Estabilização

- Criar modo de estilo `technical`/`grimorial` como feature separada
- Monitoramento de alucinação pós-stream
- Estatísticas de custo via OpenRouter
- Revisão histórica dos textos das 28 mansões lunares
- Persistência remota de dossiê/veredito completo

---

## Validação Final Obrigatória

```bash
npm run lint
npm run build
npm run test
```

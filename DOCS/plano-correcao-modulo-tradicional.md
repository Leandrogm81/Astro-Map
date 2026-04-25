# Plano de Execução — Correção Técnica do Módulo Tradicional

> **Baseado no PRD:** Correção Técnica do Módulo Tradicional do AstroMap
> **Status:** ⏸️ Aguardando autorização

---

## Resumo da Auditoria

| # | Item | Status Atual | Severidade |
|---|------|-------------|------------|
| 1 | Almuten + Sizígia no frontend (`points.ts`) | ✅ Já funciona | — |
| 2 | Almuten + Sizígia **no servidor** (`/api/report`) | ❌ `prenatalSyzygy` não é passado | **Alta** |
| 3 | Almuten + Sizígia **no TraditionalView** | ❌ `prenatalSyzygy` não é passado | **Alta** |
| 4 | Breakdown do Almuten (RF02 do PRD) | ❌ Não existe | **Média** |
| 5 | Seita: Saturno em mapa diurno | ❌ Retorna `malefic_out_of_sect` (deveria ser `in_sect`/`malefic_of_sect`) | **Alta** |
| 6 | Seita: Marte em mapa noturno | ❌ Retorna `malefic_out_of_sect` (deveria ser `in_sect`/`malefic_of_sect`) | **Alta** |
| 7 | Tipos `SectStatus`/`SectRole` | ❌ Não existem (usa `string` genérica) | **Média** |
| 8 | Dignidade principal (`getPrimaryDignityLabel`) | ✅ Já retorna labels corretos | — |
| 9 | PDF Sizígia placeholders (`TraditionalChartPDF.tsx`) | ❌ `sign: 'Áries'`, `degree: 0`, `house: 0` | **Média** |
| 10 | Hyleg/Alcocoden metadata | ❌ Não marcados como `simplified` | **Baixa** |
| 11 | Menu acesso módulos (Tradicional, Revolução, Eletiva) | ✅ Acessível via botões fixos na navbar (`page.tsx`) | — |
| 12 | API key no client | ✅ Cliente não envia `apiKey`; servidor usa fallback `process.env.OPENROUTER_API_KEY` | — |

---

## Etapas de Implementação

### Etapa 1 — Tipos (`src/lib/traditional/types.ts`)

Adicionar tipos explícitos de seita, breakdown do Almuten e metadados de confiabilidade.

```typescript
export type SectStatus = 'in_sect' | 'out_of_sect' | 'neutral' | 'mercury_variable';

export type SectRole =
  | 'benefic_of_sect'
  | 'benefic_out_of_sect'
  | 'malefic_of_sect'
  | 'malefic_out_of_sect'
  | 'luminary'
  | 'mercury_variable'
  | 'none';

export interface AlmutenFigurisBreakdownPoint {
  label: string;           // "Sol", "Lua", "Ascendente", "Parte da Fortuna", "Sizígia Pré-Natal"
  longitude: number;
  sign: string;
  degree: number;
  domicileRuler: string;
  exaltationRuler: string | null;
  triplicityRulers: string[];
  termRuler: string;
  faceRuler: string;
}

export interface AlmutenFigurisBreakdown {
  points: AlmutenFigurisBreakdownPoint[];
  scores: Record<string, number>;  // { sun: 12, jupiter: 8, ... }
}

export type TraditionalMethodGrade = 'complete' | 'complete_with_prenatal_syzygy' | 'simplified' | 'basic';

export interface TraditionalMethodMetadata {
  almutenFiguris: TraditionalMethodGrade;
  hyleg: TraditionalMethodGrade;
  alcocoden: TraditionalMethodGrade;
  houseSystem: string;
  sect: string;
  aspects: string;
}
```

**Alterar `TraditionalAssessment.sectStatus`** de `string` para `SectStatus` + adicionar `sectRole: SectRole`.

**Alterar `TraditionalPoints`** para incluir `almutenFigurisBreakdown?: AlmutenFigurisBreakdown` e `methodMetadata?: TraditionalMethodMetadata`.

---

### Etapa 2 — Seita (`src/lib/traditional/sect.ts`)

Nova função `getSectRole` + correção de `getSectStatus`.

Regras conceituais:

**Mapa diurno:**
```
Sol:      in_sect / luminary
Júpiter:  in_sect / benefic_of_sect
Saturno:  in_sect / malefic_of_sect    ← ANTES: malefic_out_of_sect
Lua:      out_of_sect / luminary
Vênus:    out_of_sect / benefic_out_of_sect
Marte:    out_of_sect / malefic_out_of_sect
Mercúrio: mercury_variable
```

**Mapa noturno:**
```
Lua:      in_sect / luminary
Vênus:    in_sect / benefic_of_sect
Marte:    in_sect / malefic_of_sect     ← ANTES: malefic_out_of_sect
Sol:      out_of_sect / luminary
Júpiter:  out_of_sect / benefic_out_of_sect
Saturno:  out_of_sect / malefic_out_of_sect
Mercúrio: mercury_variable
```

Exportar:
```typescript
export function getSectStatus(planetId: string, isDayChart: boolean): SectStatus
export function getSectRole(planetId: string, isDayChart: boolean): SectRole
```

**Ajustar `scoring.ts`** para usar os novos tipos e funções.

---

### Etapa 3 — Almuten Breakdown (`src/lib/traditional/points.ts`)

Criar função separada:

```typescript
export function calculateAlmutenFigurisBreakdown(
  planets: PlanetPosition[],
  fortuneLon: number,
  ascLon: number,
  isDay: boolean,
  prenatalSyzygy?: number
): AlmutenFigurisBreakdown
```

Incluir no retorno de `calculateTraditionalPoints`:
```typescript
almutenFigurisBreakdown: calculateAlmutenFigurisBreakdown(planets, fortuneLon, ascLon, isDay, prenatalSyzygy)
```

Garantir fallback: se `prenatalSyzygy` for `undefined`, avaliar apenas 4 pontos (sem o 5º).

---

### Etapa 4 — TraditionalView (`src/components/traditional/TraditionalView.tsx`)

**Linha 54-61:** Passar `chart.prenatalSyzygy`:

```typescript
const traditionalPoints = useMemo(() => {
  return calculateTraditionalPoints(
    chart.ascendant,
    chart.planets,
    chart.housesPlacidus,
    chart.isDayChart ?? false,
    chart.prenatalSyzygy  // ← ADICIONAR
  );
}, [chart]);
```

---

### Etapa 5 — API Route (`src/app/api/report/route.ts`)

**Linha 104-109:** Passar `chart.prenatalSyzygy`:

```typescript
chart.traditionalPoints = calculateTraditionalPoints(
  chart.ascendant,
  chart.planets,
  chart.housesPlacidus,
  chart.isDayChart ?? true,
  chart.prenatalSyzygy  // ← ADICIONAR
);
```

---

### Etapa 6 — PDF Sizígia (`src/components/TraditionalChartPDF.tsx`)

**Linhas 323-335:** Substituir placeholders:

```typescript
if (chart.prenatalSyzygy !== undefined) {
  const syzygySign = signs[Math.floor(chart.prenatalSyzygy / 30)];
  const syzygyDegree = chart.prenatalSyzygy % 30;
  const syzygyHouse = getHouseForPlanet(chart.prenatalSyzygy, chart.housesPlacidus);

  planetsToRender.push({
    name: 'Sizígia',
    id: 'syzygy',
    sign: syzygySign,
    degree: syzygyDegree,
    longitude: chart.prenatalSyzygy,
    house: syzygyHouse,
    retrograde: false,
    symbol: '☾',
    latitude: 0,
    speed: 0
  } as PlanetPosition);
}
```

Criar helper local para `getHouseForPlanet(longitude, houses): number`.

---

### Etapa 7 — Metadados Hyleg/Alcocoden (`src/lib/traditional/points.ts`)

Adicionar metadados nos objetos `TraditionalPoint` retornados:

```typescript
hyleg: {
  id: hylegId,
  name: hylegPlanet.name,
  label: 'Hyleg',
  description: 'O Doador da Vida. (Método simplificado experimental — não representa cálculo medieval completo.)',
  method: 'simplified' as const
}
```

```typescript
alcocoden: {
  id: alcocodenId,
  name: alcocodenPlanet.name,
  label: 'Alcocoden',
  description: 'O Doador de Anos. (Método simplificado experimental baseado no regente do signo do Hyleg.)',
  method: 'simplified' as const
}
```

Atualizar interface `TraditionalPoint` em `types.ts` para incluir `method?: string`.

---

### Etapa 8 — Metadados para IA (`src/lib/aiPrompts.ts`)

No `formatTraditionalChartForAI`, incluir:

```typescript
result += `\n## Metadados de Confiabilidade do Módulo Tradicional\n`;
result += `- Almuten Figuris: complete_with_prenatal_syzygy\n`;
result += `- Hyleg: simplified (experimental, não representa cálculo medieval completo)\n`;
result += `- Alcocoden: simplified (experimental)\n`;
result += `- Sistema de Casas: placidus\n`;
result += `- Seita: corrected_basic\n`;
result += `- Aspectos: moiety_basic\n`;
```

Ajustar `TRADITIONAL_PROMPT_SYSTEM` para instruir a IA a não tratar Hyleg/Alcocoden como definitivos.

---

### Etapa 9 — Testes

**`src/__tests__/traditionalSect.test.ts`:**

```typescript
describe('getSectStatus', () => {
  it('day chart: saturn is in_sect', () => {
    expect(getSectStatus('saturn', true)).toBe('in_sect');
  });
  it('night chart: mars is in_sect', () => {
    expect(getSectStatus('mars', false)).toBe('in_sect');
  });
});

describe('getSectRole', () => {
  it('day chart: saturn is malefic_of_sect', () => {
    expect(getSectRole('saturn', true)).toBe('malefic_of_sect');
  });
  it('day chart: mars is malefic_out_of_sect', () => {
    expect(getSectRole('mars', true)).toBe('malefic_out_of_sect');
  });
  it('night chart: mars is malefic_of_sect', () => {
    expect(getSectRole('mars', false)).toBe('malefic_of_sect');
  });
  it('night chart: saturn is malefic_out_of_sect', () => {
    expect(getSectRole('saturn', false)).toBe('malefic_out_of_sect');
  });
});
```

**`src/__tests__/traditionalPoints.test.ts`:**

```typescript
describe('calculateTraditionalPoints', () => {
  it('includes prenatal syzygy in Almuten when available', () => {
    const result = calculateTraditionalPoints(asc, planets, houses, true, 45.0);
    expect(result.almutenFigurisBreakdown).toBeDefined();
    expect(result.almutenFigurisBreakdown.points).toContainEqual(
      expect.objectContaining({ label: 'Sizígia Pré-Natal' })
    );
  });

  it('does not break without prenatal syzygy', () => {
    const result = calculateTraditionalPoints(asc, planets, houses, true);
    expect(result.almutenFiguris).toBeDefined();
  });
});
```

---

## Arquivos a Alterar (9 arquivos)

```
src/lib/traditional/types.ts                     — Novos tipos
src/lib/traditional/sect.ts                      — Corrigir + getSectRole
src/lib/traditional/points.ts                    — Almuten breakdown + metadata
src/lib/traditional/scoring.ts                   — Consumir novos tipos de seita
src/components/traditional/TraditionalView.tsx   — Passar prenatalSyzygy
src/app/api/report/route.ts                      — Passar prenatalSyzygy
src/components/TraditionalChartPDF.tsx           — Placeholders → valores reais
src/lib/aiPrompts.ts                             — Metadados + prompt
src/__tests__/traditionalSect.test.ts            — Testes seita
src/__tests__/traditionalPoints.test.ts          — Testes Almuten
```

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| `TraditionalView` sem `prenatalSyzygy` no chart | Almuten incorreto no frontend | Fallback `chart.prenatalSyzygy` opcional; `calculateTraditionalPoints` já trata `undefined` |
| Mudança em `sect.ts` afeta `scoring.ts` | Pontuação acidental incorreta | Revisar `scoring.ts`: `sectStatus === 'in_sect'` continua válido; `sectRole` é novo campo |
| PDF quebra com `getHouseForPlanet` | Build falha | Função helper simples: percorre `housesPlacidus` e compara longitudes |
| ExportPDF.tsx com `translateDignity` contendo "Afligido" | Código morto | Manter como fallback seguro; não há geração de "Afligido" atualmente |

---

## Critérios de Aceite

```
[ ] Almuten Figuris inclui Sizígia no servidor e no TraditionalView
[ ] Breakdown do Almuten disponível para uso futuro
[ ] Saturno (mapa diurno) = in_sect / malefic_of_sect
[ ] Marte (mapa noturno) = in_sect / malefic_of_sect
[ ] PDF sem placeholders falsos (sign, degree, house reais)
[ ] Hyleg e Alcocoden marcados como simplified (método experimental)
[ ] IA recebe metadados de confiabilidade
[ ] Menu funcional (Tradicional, Revolução, Eletiva) — já OK
[ ] npm run lint passa sem erros
[ ] npm run build sucede sem erros
[ ] npm run test passa
```

---

## Próximos Passos (após autorização)

1. Executar Etapa 1 (tipos)
2. Executar Etapa 2 (seita)
3. Executar Etapa 3 (breakdown Almuten)
4. Executar Etapa 4 + 5 (passar prenatalSyzygy nos consumidores)
5. Executar Etapa 6 (PDF)
6. Executar Etapa 7 (metadados Hyleg/Alcocoden)
7. Executar Etapa 8 (IA)
8. Executar Etapa 9 (testes)
9. Validar: `npm run lint && npm run build && npm run test`

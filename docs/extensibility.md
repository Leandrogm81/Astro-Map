# Extensibilidade — AstroMap

## Visão Geral

O AstroMap foi architectado para facilitar extensões. Esta seção documenta como adicionar novas funcionalidades ao codebase.

---

## Adicionando Novos Sistemas de Casas

### Arquitetura Atual

O app suporta **Placidus** e **Whole Signs** nativamente. A estrutura de `HouseCusp` é agnóstica:

```typescript
interface HouseCusp {
  number: number;       // 1-12
  longitude: number;    // Longitude eclíptica da cúspide
  sign: ZodiacSign;     // Signo da cúspide
  degree: number;       // Grau dentro do signo
}
```

### Passos para Adicionar Koch, Porphyry, etc.

1. **Crie a função de cálculo** em `src/lib/ephemeris.ts`:

```typescript
function calculateKochHouses(jd: number, latitude: number, longitude: number): HouseCusp[] {
  // Implementar algoritmo de Koch
  // https://www.astro.com/astrology/koch.htm
  // ...
}

function calculatePorphyryHouses(ascendant: number, mc: number): HouseCusp[] {
  // Implementar método Porphyry
  // Divide os quadrantes em 3 partes iguais
  // ...
}
```

2. **Exporte a função** no módulo

3. **Adicione à store de settings** em `src/lib/settingsStore.ts`:

```typescript
export type HouseSystem = 'placidus' | 'whole' | 'koch' | 'porphyry';

export interface SettingsState {
  houseSystem: HouseSystem;
  setHouseSystem: (system: HouseSystem) => void;
}
```

4. **Atualize o cálculo principal** em `calculateNatalChart`:

```typescript
switch (houseSystem) {
  case 'placidus':
    housesPlacidus = calculatePlacidusHouses(jd, latitude, longitude);
    break;
  case 'whole':
    housesWhole = calculateWholeSignsHouses(ascendant);
    break;
  case 'koch':
    housesKoch = calculateKochHouses(jd, latitude, longitude);
    break;
  case 'porphyry':
    housesPorphyry = calculatePorphyryHouses(ascendant, mc);
    break;
}
```

5. **Adicione UI de seleção** no formulário de BirthForm

---

## Adicionando Novos Planetas ou Lotes

### Novos Planetas

1. **Adicione ao catálogo** em `src/types/index.ts`:

```typescript
export const PLANETS = [
  // ... existente
  { id: 'ceres', name: 'Ceres', symbol: '⚳', sweId: 14 },
  { id: 'pallas', name: 'Palas', symbol: '⚴', sweId: 16 },
  { id: 'vesta', name: 'Vesta', symbol: '⚵', sweId: 17 },
  { id: 'juno', name: 'Juno', symbol: '⚶', sweId: 15 },
] as const;
```

2. **Adicione função de cálculo** em `ephemeris.ts`:

```typescript
async function calculateCeresPosition(date: Date): Promise<PlanetPosition> {
  const vector = Astronomy.GeoVector(Astronomy.Body.Ceres, date, true);
  // ... processar
}
```

3. **Mapeie o SweId** no `bodyMap` ehandle o caso na função principal.

### Novos Lotes Herméticos

1. **Adicione ao catálogo** em `src/types/index.ts`:

```typescript
export const HERMETIC_LOTS = [
  // ... existentes
  { id: 'inheritance', name: 'Lote da Herança', symbol: '🏛', description: 'Patrimônio e legados.' },
  { id: 'marriage', name: 'Lote do Casamento', symbol: '💍', description: 'União e parcerias.' },
] as const;
```

2. **Implemente o cálculo** em `src/lib/traditional/lots.ts`:

```typescript
export function calculateLotLongitude(
  lotId: string,
  ascendant: number,
  planets: PlanetPosition[],
  isDayChart: boolean
): number {
  // Implementar fórmula específica do lote
  // Exemplo: Lote da Herança = Sol + Saturno - Júpiter
  // ...
}
```

---

## Adicionando Novos Modelos de IA

### 1. Atualize a Lista de Modelos

Em `src/app/api/report/route.ts`:

```typescript
export const AVAILABLE_MODELS = [
  // ... existente
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Rápido — Claude 3 Haiku',
    description: 'Excelente velocidade.\nCusto: R$ 0,003 / relatório',
    cost: 'R$ 0,003'
  },
];
```

### 2. Adicione Descrição do Modelo

```typescript
const MODEL_DESCRIPTIONS: Record<string, string> = {
  'qwen/qwen3-32b': 'Melhor para: relatórios rápidos e diários...',
  'deepseek/deepseek-chat-v3.1': 'Melhor para: análises profundas...',
  // ... adicione novo modelo
};
```

### 3. Considere Configurações Específicas

Alguns modelos podem necesitar ajustes de temperatura ou max_tokens:

```typescript
const MODEL_CONFIG: Record<string, { temperature: number; max_tokens: number }> = {
  'qwen/qwen3-32b': { temperature: 0.75, max_tokens: 8000 },
  // ... novo modelo pode ter需求 diferentes
};
```

---

## Adicionando Novos Tipos de Relatório

### 1. Defina o Prompt do Sistema

Em `src/lib/aiPrompts.ts`:

```typescript
export const PROGRESSIONS_PROMPT_SYSTEM = `Você é um astrólogo especializado
em técnicas de Progressão Secundária...`;
```

### 2. Crie a Função de Formatação

```typescript
export function formatProgressionsForAI(
  natal: NatalChart,
  progressed: NatalChart,
  date: string
): string {
  // Formatar dados comparativos
  // ...
}
```

### 3. Adicione o Tipo ao Route Handler

Em `src/app/api/report/route.ts`:

```typescript
const reportType = request.body.reportType || 'natal';

switch (reportType) {
  case 'natal':
    systemPrompt = NATAL_PROMPT_SYSTEM;
    break;
  case 'traditional':
    systemPrompt = TRADITIONAL_PROMPT_SYSTEM;
    break;
  case 'solar':
    systemPrompt = SOLAR_RETURN_PROMPT_SYSTEM;
    break;
  case 'progressions':
    systemPrompt = PROGRESSIONS_PROMPT_SYSTEM;
    break;
}
```

---

## Adicionando Exportação para Novos Formatos

### Exportar para JSON

```typescript
// src/lib/exportJSON.ts
export function exportChartAsJSON(chart: NatalChart, report?: AIReport): Blob {
  const data = {
    chart,
    report,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
}
```

### Exportar para CSV

```typescript
// src/lib/exportCSV.ts
export function exportPlanetsAsCSV(planets: PlanetPosition[]): string {
  const headers = 'Planeta,Signo,Grau,Casa,Retrogradação\n';
  const rows = planets.map(p =>
    `${p.name},${p.sign},${p.degree},${p.house},${p.retrograde ? 'Sim' : 'Não'}`
  ).join('\n');
  return headers + rows;
}
```

### Exportar para Imagem (PNG)

```typescript
// src/lib/chartToImage.ts
import { toPng } from 'html-to-image';

export async function exportChartAsPNG(elementId: string): Promise<Blob> {
  const dataUrl = await toPng(document.getElementById(elementId)!, {
    quality: 1.0,
    pixelRatio: 2,
  });
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  return new Blob([binary], { type: 'image/png' });
}
```

---

## Adicionando Localização para Outros Países

O geocoding atual é filtrado para o Brasil (`countrycodes: 'br'`). Para expandir:

### 1. Remova o Filtro de País

Em `src/lib/geocoding.ts`:

```typescript
// Antes (apenas Brasil)
countrycodes: 'br'

// Depois (todos os países)
countrycodes: '' // Vazio = todos os países
```

### 2. Adicione Suporte a Timezones Globais

A função `getBrazilianTimezone` é específica para o Brasil. Crie uma generalização:

```typescript
export function getTimezoneFromLongitude(longitude: number): number {
  return Math.round(longitude / 15);
}
```

### 3. Trate Horários de Verão Internacionais

Considere usar bibliotecas como:
- `luxon` — manipulação de timezones
- `date-fns-tz` — versão com timezone do date-fns

---

## Hooks e Componentes Reutilizáveis

### Criando um Novo Hook

```typescript
// src/hooks/useAspectFilter.ts
import { useState, useMemo } from 'react';
import { Aspect } from '@/types';

export function useAspectFilter(aspects: Aspect[]) {
  const [filter, setFilter] = useState<string>('all');

  const filteredAspects = useMemo(() => {
    if (filter === 'all') return aspects;
    return aspects.filter(a => a.type === filter);
  }, [aspects, filter]);

  return { filteredAspects, filter, setFilter };
}
```

### Criando um Componente Genérico

```typescript
// src/components/DataTable.tsx
interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
}: {
  data: T[];
  columns: Column<T>[];
}) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => <th key={String(col.key)}>{col.header}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            {columns.map(col => (
              <td key={String(col.key)}>
                {col.render ? col.render(row[col.key], row) : String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Checklist de Extensibilidade

Ao adicionar novas funcionalidades:

- [ ] Adicionar tipos TypeScript apropriados em `src/types/index.ts`
- [ ] Manter consistência com a nomenclatura existente
- [ ] Documentar a nova funcionalidade neste arquivo
- [ ] Adicionar testes unitários em `src/__tests__/`
- [ ] Atualizar o diagrama de arquitetura em `docs/architecture.md`
- [ ] Seguir as convenções de código do projeto ( ESLint + Prettier)
## Extensibilidade Kabbalah

### Nova Sephirah

1. Adicione a definição em `src/lib/kabbalah/sephiroth.ts`.
2. Acrescente a coordenada em `src/lib/kabbalah/constants.ts`.
3. Atualize os testes em `src/__tests__/kabbalah/`.

### Novo comportamento na Árvore

1. Reaproveite `mapChartToSephiroth(chart)` como fonte única.
2. Mantenha o SVG baseado em `viewBox` para seguir responsivo.
3. Adicione novo detalhe no painel sem acoplar o componente ao core tradicional.

### Nova correspondência de PDF

1. Estenda `src/components/kabbalah/KabbalahPDF.tsx`.
2. Preserve o fallback seguro para SSR/teste.
3. Atualize a documentação quando o formato de exportação mudar.

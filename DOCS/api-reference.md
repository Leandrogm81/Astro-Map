# Referência da API — AstroMap

## Endpoint: `/api/report`

### Descrição

Endpoint principal para geração de relatórios astrológicos via inteligência artificial. Utiliza **streaming SSE** (Server-Sent Events) para retornar o relatório em tempo real.

**Rota:** `POST /api/report`

**Método:** `POST`

**Autenticação:** A chave API pode ser fornecida de duas formas:
- No corpo da requisição (`clientApiKey`)
- Via variável de ambiente `OPENROUTER_API_KEY` configurada no servidor

---

## Formato da Requisição

### Headers

```
Content-Type: application/json
```

### Body (JSON)

```json
{
  "chart": { ... },
  "model": "qwen/qwen3-32b",
  "apiKey": "sk-or-v1-...",
  "isTraditional": false,
  "solarRevolution": null,
  "solarYear": null,
  "assessments": []
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `chart` | `NatalChart` | **Sim** | Dados completos do mapa astral |
| `model` | `string` | Não | ID do modelo OpenRouter (padrão: `qwen/qwen3-32b`) |
| `apiKey` | `string` | Não | Chave API do cliente. Se omitida, usa `OPENROUTER_API_KEY` do servidor |
| `isTraditional` | `boolean` | Não | Se `true`, usa prompt de Astrologia Tradicional (padrão: `false`) |
| `solarRevolution` | `NatalChart` | Não | Mapa da Revolução Solar (para relatórios comparativos) |
| `solarYear` | `number` | Não | Ano da Revolução Solar (ex: `2026`) |
| `assessments` | `TraditionalAssessment[]` | Não | Avaliações de dignidade para relatório tradicional |

---

## Tipos de Dados

### `NatalChart`

```typescript
interface NatalChart {
  birthData: BirthData;
  planets: PlanetPosition[];
  housesPlacidus: HouseCusp[];
  housesWhole: HouseCusp[];
  aspects: Aspect[];
  ascendant: number;
  mc: number;
  lots?: LotPosition[];
  traditionalPoints?: TraditionalPoints;
  isDayChart?: boolean;
}

interface BirthData {
  name: string;
  date: string;         // YYYY-MM-DD
  time: string;         // HH:MM
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface PlanetPosition {
  id: string;
  name: string;
  symbol: string;
  longitude: number;    // 0-360 graus eclípticos
  latitude: number;
  speed: number;
  sign: ZodiacSign;
  degree: number;       // 0-29° no signo
  house: number;        // 1-12
  retrograde: boolean;
}

interface HouseCusp {
  number: number;       // 1-12
  longitude: number;
  sign: ZodiacSign;
  degree: number;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  angle: number;        // Ângulo exato
  orb: number;          // Diferença do ângulo perfeito
  applying: boolean;    // true = aplicando, false = separando
}

type ZodiacSign =
  | 'Áries' | 'Touro' | 'Gêmeos' | 'Câncer' | 'Leão' | 'Virgem'
  | 'Libra' | 'Escorpião' | 'Sagitário' | 'Capricórnio' | 'Aquário' | 'Peixes';

type AspectType =
  | 'conjunction' | 'semisextile' | 'semisquare' | 'sextile'
  | 'quintile' | 'square' | 'trine' | 'sesquiquadrate'
  | 'biquintile' | 'quincunx' | 'opposition';

interface LotPosition {
  id: string;
  name: string;
  symbol: string;
  longitude: number;
  sign: ZodiacSign;
  degree: number;
  house: number;
  description: string;
}

interface TraditionalPoints {
  lordOfNativity: TraditionalPoint;
  almutenFiguris: TraditionalPoint;
  hyleg: TraditionalPoint;
  alcocoden: TraditionalPoint;
}

interface TraditionalPoint {
  id: string;
  name: string;
  label: string;
  description: string;
}
```

---

## Formato da Resposta

### Sucesso (200 OK)

**Content-Type:** `text/plain; charset=utf-8`

A resposta é um **stream SSE** contendo chunks do relatório em texto plano. Cada chunk é uma fração do texto gerado pela IA.

```
data: Aqui está a introdução do relatório...

data: Os planetas em Áries indicam...

data: [DONE]
```

### Erro de Validação (400 Bad Request)

```json
{
  "error": "Dados do mapa astral não fornecidos"
}
```

### Erro de Autenticação (401 Unauthorized)

```json
{
  "error": "Chave API não fornecida. Configure na interface ou no servidor."
}
```

### Erro da API Externa (502 Bad Gateway)

```json
{
  "error": "Erro detalhado retornado pela OpenRouter"
}
```

### Erro Interno (500 Internal Server Error)

```json
{
  "error": "Erro interno do servidor"
}
```

---

## Modelos Disponíveis

### Lista de Modelos

**GET** `/api/report` retorna a lista de modelos disponíveis:

```json
{
  "models": [
    {
      "id": "qwen/qwen3-32b",
      "name": "Econômico — Qwen 3 32B",
      "description": "Relatórios rápidos e eficientes. Perfeito para o dia a dia.\nCusto: R$ 0,0075 / relatório",
      "cost": "R$ 0,0075"
    },
    {
      "id": "deepseek/deepseek-chat-v3.1",
      "name": "Inteligente — DeepSeek V3.1",
      "description": "Análises profundas e inteligentes. A melhor escolha para textos estruturados.\nCusto: R$ 0,019 / relatório",
      "cost": "R$ 0,019"
    },
    {
      "id": "google/gemini-2.5-flash",
      "name": "Premium — Gemini 2.5 Flash",
      "description": "Máxima sofisticação e escrita superior. Indicado para análises refinadas.\nCusto: R$ 0,055 / relatório",
      "cost": "R$ 0,055"
    },
    {
      "id": "google/gemini-2.5-flash-lite:nitro",
      "name": "Contexto Longo — Gemini 2.5 Flash Lite Nitro",
      "description": "Ideal para grandes volumes de dados e relatórios muito extensos.\nCusto: R$ 0,011 / relatório",
      "cost": "R$ 0,011"
    }
  ]
}
```

---

## Exemplo Completo

### Requisição

```bash
curl -X POST http://localhost:3000/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "chart": {
      "birthData": {
        "name": "Maria Silva",
        "date": "1990-06-15",
        "time": "14:30",
        "location": "São Paulo, SP",
        "latitude": -23.5505,
        "longitude": -46.6333,
        "timezone": "UTC-3:00"
      },
      "planets": [
        {"id": "sun", "name": "Sol", "symbol": "☉", "longitude": 83.5, "latitude": 0, "speed": 0.9, "sign": "Gêmeos", "degree": 23.5, "house": 3, "retrograde": false},
        {"id": "moon", "name": "Lua", "symbol": "☽", "longitude": 215.2, "latitude": 2.1, "speed": 11.8, "sign": "Escorpião", "degree": 5.2, "house": 7, "retrograde": false}
      ],
      "housesPlacidus": [],
      "housesWhole": [],
      "aspects": [],
      "ascendant": 125.3,
      "mc": 280.7
    },
    "model": "deepseek/deepseek-chat-v3.1",
    "isTraditional": false
  }'
```

### Resposta (stream)

```
data: ## Visão Geral da Personalidade
data:
data: Seu Sol em Gêmeos...
data: (texto continuando em chunks)
```

---

## Prompts do Sistema

O endpoint utiliza diferentes prompts de sistema conforme o tipo de relatório:

### Mapa Natal Moderno (`isTraditional: false`, sem `solarYear`)

Analisa personalidade, planetas nos signos, casas, aspectos, síntese e orientações práticas.

### Astrologia Tradicional (`isTraditional: true`)

Análise técnica com Almuten Figuris, Hyleg, Alcocoden, dignidades essenciais, Termos e Faces, seita, Lotes Herméticos.

### Revolução Solar (`solarYear` presente)

Previsão anual com aspectos cruzados entre RS e natal, interposição de casas, tema central do ano.

---

## Limitações

| Parâmetro | Valor |
|-----------|-------|
| `max_tokens` | 8000 |
| `temperature` | 0.75 |

Essas configurações visam equilíbrio entre qualidade e custo. Ajuste diretamente no código de `route.ts` se necessário.
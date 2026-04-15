# Especificação Final — Módulo Tradicional do AstroMap

## Objetivo geral

Expandir o AstroMap atual para suportar **Astrologia Tradicional** como um módulo paralelo e robusto, sem quebrar o modo moderno já existente, e concentrando toda a experiência tradicional dentro da aba já existente, que será renomeada de **`Lotes/Tradicional`** para **`Tradicional`**. Hoje essa aba já existe e já recebe `lots` e `traditionalPoints`, então a base de encaixe já está pronta.

Esse módulo deverá oferecer:

- roda zodiacal tradicional,
- tabela planetária tradicional,
- avaliação técnica tradicional,
- lotes herméticos,
- regências e sect,
- relatório de IA tradicional,
- e exportação em PDF tradicional, mesmo com grande volume de páginas.

---

## Diretriz principal de implementação

A implementação deve continuar **modular, paralela e não destrutiva**, preservando:
- o modo moderno,
- os componentes modernos,
- os prompts modernos,
- e o fluxo atual de PDF moderno.

A lógica tradicional não deve ser “misturada por padrão” com a moderna. Ela deve ser adicionada como uma **camada paralela**, aproveitando apenas infraestrutura reutilizável, como:
- cálculo astronômico base,
- componentes de layout,
- sistema de tabs,
- pipeline de IA,
- pipeline de exportação PDF.

---

# 1. UX final desejada

## Aba existente
A aba atual:
- `Lotes/Tradicional`

passará a se chamar apenas:

- **Tradicional**

## Dentro da aba Tradicional
A aba Tradicional concentrará tudo o que pertence à leitura tradicional, sem criar novo menu principal.

A estrutura ideal da aba será:

1. **Roda Tradicional**
2. **Resumo Técnico Tradicional**
3. **Tabela Planetária Tradicional**
4. **Aspectos Tradicionais**
5. **Lotes Herméticos**
6. **Regências**
7. **Ficha Detalhada do Planeta**
8. **Relatório IA Tradicional**
9. **Exportação PDF Tradicional**

Tudo dentro da mesma aba, com subseções, cards, drawers ou painéis internos.

---

# 2. Princípio técnico central

O app deve passar a ter **duas camadas de leitura**:

- **Moderna**
- **Tradicional**

Mas, nesta etapa, **sem obrigar um toggle global em toda a aplicação**.

## Decisão recomendada
Na Fase 1 e Fase 2:
- o restante do app continua como está;
- a aba Tradicional passa a operar com regras próprias;
- a arquitetura já fica preparada para, no futuro, aceitar:
  - `modern`
  - `traditional`
  - `mixed`

Ou seja:
- o modelo de dados pode já aceitar `mode`,
- mas a UX inicial pode ficar centrada na aba Tradicional.

Isso reduz regressão e acelera a entrega.

---

# 3. Tradição-base a ser congelada antes da implementação

Antes de codar a lógica, é preciso fixar uma tradição-base mínima para evitar inconsistência interna.

## Padrão inicial recomendado
- zodíaco: **tropical**
- casas padrão do tradicional: **Whole Sign**
- secundariamente permitir Placidus se já existir
- regências: **7 planetas clássicos**
- triplicidades: padrão tradicional fixado
- termos: **egípcios** por padrão
- faces/decanos: tradicionais
- lotes-base da Fase 1:
  - Fortuna
  - Espírito
- lotes adicionais preparados para expansão posterior
- sect:
  - diurno/noturno obrigatório
- dignidades:
  - essenciais completas
  - acidentais básicas na Fase 1
- IA tradicional:
  - linguagem técnica, objetiva e não psicológica-moderna

Esse congelamento é essencial porque hoje o repositório ainda usa regências modernas em helpers como `getDomicileRuler()`, o que inviabiliza leitura tradicional estrita se for reutilizado sem separação.

---

# 4. Nova arquitetura proposta

## 4.1 Separação em 3 camadas

### Camada A — Núcleo astronômico
Responsável por:
- posições planetárias,
- casas,
- longitudes,
- aspectos-base,
- dados brutos.

Pode reaproveitar a base atual de `ephemeris.ts` para os 7 clássicos. Hoje o app já calcula planetas, casas, lots e `traditionalPoints` nesse arquivo.

### Camada B — Núcleo tradicional
Responsável por:
- regências tradicionais,
- dignidades essenciais,
- dignidades acidentais,
- sect,
- lotes,
- recepção,
- pontuação,
- síntese técnica.

Essa camada deve ser nova e desacoplada da moderna.

### Camada C — UI tradicional
Responsável por:
- roda tradicional,
- tabela tradicional,
- ficha do planeta,
- cards técnicos,
- relatório IA tradicional,
- PDF tradicional.

---

## 4.2 Estrutura sugerida de pastas

```text
src/lib/traditional/
  rulers.ts
  dignities.ts
  sect.ts
  lots.ts
  receptions.ts
  aspects.ts
  scoring.ts
  synthesis.ts
  hyleg.ts
  almuten.ts
  alcocoden.ts
  types.ts

src/components/traditional/
  TraditionalChart.tsx
  TraditionalSummary.tsx
  TraditionalPlanetTable.tsx
  TraditionalPlanetDrawer.tsx
  TraditionalAspectTable.tsx
  TraditionalLotsPanel.tsx
  TraditionalRulershipPanel.tsx
  TraditionalAIReport.tsx
```

Isso evita inflar ainda mais `ephemeris.ts` e `LotTable.tsx`, que hoje já acumulam responsabilidades.

---

# 5. Modelo de dados ajustado

O seu modelo proposto está bom. Eu só acrescentaria duas coisas:

## 5.1 Explicação de score
Além do score numérico, armazenar os motivos do score.

Exemplo:

```ts
TraditionalAssessment {
  planet: string
  signCondition: string[]
  houseCondition: string[]
  sectCondition: string[]
  combustionCondition: string[]
  receptionCondition: string[]
  aspectCondition: string[]
  summary: string
  score: number
  scoreBreakdown: {
    essential: number
    accidental: number
    sect: number
    combustion: number
    reception: number
    aspects: number
  }
}
```

## 5.2 Status de confiabilidade
Enquanto Almuten/Hyleg/Alcocoden não estiverem completos, usar algo como:

```ts
traditionalStatus: {
  essentialDignities: 'ready'
  sect: 'ready'
  lots: 'ready'
  almuten: 'partial'
  hyleg: 'partial'
  alcocoden: 'partial'
}
```

Isso ajuda a UI a ser honesta.

Hoje `NatalChart` já aceita `lots`, `traditionalPoints` e `isDayChart`, o que facilita essa expansão sem quebrar o formato atual.

---

# 6. Conteúdo da aba Tradicional

## 6.1 Roda Tradicional
Novo componente:
- `TraditionalChart.tsx`

Ela deve exibir:
- 12 signos
- 12 casas
- apenas os 7 planetas clássicos
- Fortuna e Espírito na Fase 1
- outros lotes herméticos preparados para Fase 2

Não exibir por padrão:
- Urano
- Netuno
- Plutão
- Quíron
- Lilith
- Nodo

Hoje a aba já mostra cards de pontos tradicionais e lotes, mas ainda não tem essa roda. Ela deve virar a âncora visual da aba.

---

## 6.2 Resumo Técnico Tradicional
Painel superior com:
- mapa diurno ou noturno
- regente do Ascendente
- Fortuna
- Espírito
- planeta mais forte
- planeta mais fraco
- síntese técnica curta

---

## 6.3 Tabela Planetária Tradicional
Nova tabela com colunas como você propôs:
- planeta
- signo
- grau
- casa
- dignidade essencial
- dignidade acidental
- sect
- combustão
- recepção
- score

---

## 6.4 Ficha detalhada do planeta
Abrir por clique em modal, drawer ou painel lateral.

Mostrar:
- posição completa
- regências
- dignidades
- debilidades
- condição sectária
- combustão
- aspectos
- recepções
- score
- resumo técnico curto

---

## 6.5 Aspectos Tradicionais
Painel próprio com:
- conjunção
- sextil
- quadratura
- trígono
- oposição
- orbe
- aplicativo/separativo
- classificação benéfico/maléfico quando relevante

---

## 6.6 Lotes Herméticos
Na Fase 1:
- Fortuna
- Espírito

Na Fase 2:
- Eros
- Necessidade
- Coragem
- Vitória
- Nêmesis

Hoje o app já possui uma estrutura parcial para esses lotes, então o ideal é migrar essa lógica para o namespace tradicional e tratá-la como cálculo tradicional oficial.

---

## 6.7 Regências
Mostrar:
- regente do Ascendente
- regente de cada casa
- regente do signo de cada planeta
- recepção mútua, quando houver

---

## 6.8 Relatório IA Tradicional
Sim, isso deve entrar.

Hoje o app já tem pipeline de IA para relatório natal e solar, e o `page.tsx` já alimenta `AIReport` e `ExportPDF` com os textos gerados. Isso pode ser estendido para o tradicional sem refazer o fluxo inteiro.

### Novo componente recomendado
- `TraditionalAIReport.tsx`

### Novo prompt recomendado
Separado do moderno, sem misturar linguagem moderna.

Esse prompt deve gerar:
- linguagem técnica
- objetiva
- clara
- sem psicologização moderna
- sem clichês esotéricos vagos

### Seções sugeridas do relatório tradicional
- `[[TRADITIONAL_OVERVIEW]]`
- `[[SECT_AND_QUALITY]]`
- `[[PLANETARY_STRENGTHS]]`
- `[[RULERSHIPS_AND_HOUSES]]`
- `[[LOTS_HERMETIC]]`
- `[[TECHNICAL_SYNTHESIS]]`

Se quiser, isso pode seguir o mesmo modelo semi-rígido de tags que você já está usando para o PDF premium.

---

# 7. PDF Tradicional

Sim: o PDF tradicional deve existir, e **não tem problema ficar grande**.

Nesse caso, eu não tentaria “encaixar” o tradicional no PDF moderno atual como apêndice curto. Eu faria um **PDF tradicional próprio**, dentro do mesmo pipeline de exportação.

Hoje o app já tem `ExportPDF` embutido na barra e já passa:
- `chart`
- `solarRevolution`
- `solarYear`
- `reportText`
- `solarReportText`

Eu estenderia isso para aceitar também:

- `traditionalReportText`
- `traditionalModeEnabled`
- `traditionalSections`

---

## Estrutura sugerida do PDF Tradicional
Como você disse que mais de 20 páginas não é problema, eu estruturaria algo assim:

1. Capa tradicional  
2. Síntese técnica do mapa  
3. Dados-base do mapa  
4. Roda tradicional  
5. Tabela dos 7 planetas  
6. Dignidades essenciais  
7. Dignidades acidentais  
8. Sect e condição planetária  
9. Regências do Ascendente e casas  
10. Fortuna e Espírito  
11. Outros lotes herméticos  
12. Aspectos tradicionais  
13. Planetas mais fortes  
14. Planetas mais fracos  
15. Ficha do Sol  
16. Ficha da Lua  
17. Ficha do regente do Ascendente  
18. Síntese geral técnica  
19. Relatório IA tradicional — parte 1  
20. Relatório IA tradicional — parte 2  
21+. Continuação automática conforme necessário

Isso fica excelente para um produto rico em conteúdo.

---

# 8. Fases ajustadas

## FASE 1 — Núcleo tradicional mínimo viável
Foco: cálculo real e UI base dentro da aba Tradicional.

Entregáveis:
- renomear aba `Lotes/Tradicional` para `Tradicional`
- criar `TraditionalChart`
- criar namespace `src/lib/traditional`
- implementar regências tradicionais
- implementar dignidades essenciais
- implementar dignidades acidentais básicas
- implementar sect
- implementar Fortuna e Espírito
- tabela planetária tradicional
- resumo técnico simples
- ocultar por padrão modernos na aba Tradicional

---

## FASE 2 — Relatório IA tradicional + PDF tradicional
Foco: leitura automatizada e documentação.

Entregáveis:
- prompt tradicional separado
- `TraditionalAIReport`
- parsing por blocos/tags
- integração com `ExportPDF`
- PDF tradicional completo
- síntese técnica automática por planeta
- recepção básica
- regências das casas

---

## FASE 3 — Refinamento tradicional avançado
Foco: tradição clássica mais profunda.

Entregáveis:
- termos/limites configuráveis
- faces/decanos
- recepção avançada
- aplicação/separação refinada
- sistema de score completo e configurável
- outros lotes herméticos
- Almuten Figuris real
- Hyleg real
- Alcocoden real
- tooltips e documentação aprofundada

---

# 9. Regras de honestidade técnica

Como o seu pedido exige cálculo real, eu deixaria explícito na implementação:

- **Fase 1:** Senhor do Ascendente, sect, dignidades, Fortuna e Espírito = prontos
- **Fase 2:** score e síntese técnica = prontos
- **Fase 3:** Almuten, Hyleg e Alcocoden = somente quando implementados de forma tradicional real

Hoje o repositório já carrega `traditionalPoints`, mas os cálculos ainda estão simplificados e não devem ser promovidos como definitivos sem refatoração.

---

# 10. Testes obrigatórios

Além de testes unitários, eu acrescentaria:

## Testes de mapas de referência
- mapa diurno
- mapa noturno
- planeta combusto
- planeta em domicílio
- planeta em exílio
- Fortuna diurna
- Fortuna noturna
- recepção mútua simples
- aspecto aplicativo
- aspecto separativo

## Testes de regressão
- aba moderna continua intacta
- relatório moderno continua intacto
- PDF moderno continua intacto

---

# 11. Arquivos que provavelmente serão alterados/criados

## Alterar
- `src/app/page.tsx`
- `src/components/LotTable.tsx` ou separar sua função
- `src/components/ExportPDF.tsx`
- `src/lib/ephemeris.ts`
- `src/lib/aiPrompts.ts`
- `src/types/index.ts`

## Criar
- `src/components/traditional/TraditionalChart.tsx`
- `src/components/traditional/TraditionalSummary.tsx`
- `src/components/traditional/TraditionalPlanetTable.tsx`
- `src/components/traditional/TraditionalAspectTable.tsx`
- `src/components/traditional/TraditionalRulershipPanel.tsx`
- `src/components/traditional/TraditionalAIReport.tsx`

## Criar em `src/lib/traditional/`
- `rulers.ts`
- `dignities.ts`
- `sect.ts`
- `lots.ts`
- `receptions.ts`
- `aspects.ts`
- `scoring.ts`
- `synthesis.ts`
- `almuten.ts`
- `hyleg.ts`
- `alcocoden.ts`

---

# 12. Conclusão final

Com a sua nova exigência, o plano fica melhor ainda: o módulo Tradicional deixa de ser só uma tabela complementar e passa a ser **um sistema tradicional completo dentro da aba existente**, com:
- cálculo real,
- leitura técnica,
- IA própria,
- e PDF próprio e expansível.

Isso é totalmente coerente com a sua diretriz de “quanto mais informação, melhor”, e também combina com a infraestrutura atual do app, que já tem:
- aba própria,
- texto de relatório,
- e exportação PDF já conectada ao fluxo principal.

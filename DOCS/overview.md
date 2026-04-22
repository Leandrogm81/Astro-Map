# Visão Geral — AstroMap

## O que é o AstroMap?

AstroMap é um **aplicativo web completo para cálculo e interpretação de mapas astrais**, desenvolvido em Next.js com integração a modelos de inteligência artificial através da API OpenRouter. O aplicativo permite que usuários insiram seus dados de nascimento (nome, data, hora e local) e recebam:

- Cálculos astrológicos precisos baseados em efemérides científicas
- Visualização interativa da roda zodiacal com planetas, casas e aspectos
- Relatórios interpretativos gerados por IA em português brasileiro
- Análise de Revolução Solar (trânsito anual)
- Exportação de relatórios em PDF

---

## Funcionalidades Principais

### 1. Cálculo Astrológico de Alta Precisão

O aplicativo utiliza a biblioteca [`astronomy-engine`](https://github.com/cosinekitty/astronomy) (licença MIT) para cálculos de posição planetária, o que garante precisão científica comparável a efemérides profissionais.

**Planetas calculados:**
- Sol, Lua, Mercúrio, Vênus, Marte, Júpiter, Saturno (clássicos)
- Urano, Netuno, Plutão (modernos/geracionais)
- Nodo Norte Lunar (médio)
- Quíron (aproximação linear)
- Lilith / Apogeu Lunar Médio

**Sistemas de casas suportados:**
- **Placidus** — sistema iterativo para cálculo preciso das cúspides
- **Whole Signs (Signos Inteiros)** — sistema tradicional onde cada casa corresponde a um signo inteiro

### 2. Mapa Visual Interativo

Roda zodiacal SVG que exibe:
- Posições planetárias com símbolos e graus
- Cúspides das 12 casas com signos
- Cores por elemento (Fogo, Terra, Ar, Água)
- Aspectos (conjunções, trigonos, quadraturas, oposições, etc.)
- Marcadores de retrogradação

### 3. Relatório com Inteligência Artificial

O aplicativo oferece três modalidades de análise:

- **Mapa Natal Moderno** — análise psicológica e arquetípica com dignidades, cadeia de disposição e signos interceptados
- **Astrologia Tradicional (Helenística/Medieval)** — relatório técnico com Almuten Figuris, Hyleg, Alcocoden, seita, dignidades essenciais, Termos e Faces
- **Revolução Solar** — previsões anuais comparando o mapa do retorno com o natal, incluindo aspectos cruzados e interposição de casas

### 4. Modelos de IA Disponíveis

| Modelo | Custo Estimado | Melhor Para |
|--------|---------------|-------------|
| Qwen 3 32B | R$ 0,0075/relatório | Relatórios rápidos e eficientes |
| DeepSeek V3.1 | R$ 0,019/relatório | Análises profundas e textos estruturados |
| Gemini 2.5 Flash | R$ 0,055/relatório | Análises refinadas e sofisticadas |
| Gemini 2.5 Flash Lite Nitro | R$ 0,011/relatório | Grandes volumes de dados e relatórios extensos |

### 5. Exportação e Persistência

- **Exportar PDF** — relatório completo formatado com `@react-pdf/renderer`
- **Salvar Localmente** — mapas salvos no `localStorage` do navegador (privacidade total)
- **Salvar em arquivo** — download individual de mapas como JSON

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16.2.1 + React 19 + TypeScript |
| Estilização | Tailwind CSS 4 |
| Cálculos Astronômicos | `astronomy-engine` 2.1.19 |
| Estado Global | Zustand 5 |
| IA (API) | OpenRouter API com streaming SSE |
| PDF | `@react-pdf/renderer` 4.3.2 |
| Geocoding | Nominatim / OpenStreetMap |
| Testes | Vitest |

---

## Características Diferenciadoras

1. **Precisão Astronomômica** — cálculo real de posições eclípticas, não apenas tabelas pré-calculadas
2. **Suporte a Dois Sistemas de Casas** — Placidus e Whole Signs para diferentes tradições astrológicas
3. **Astrologia Tradicional** — implementa técnicas helenísticas e medievais (Almuten, Hyleg, seita)
4. **Lotes Herméticos** — 7 pontos de destino calculados segundo a tradição
5. **Revolução Solar com Aspectos Cruzados** — análise preditiva comparando ano a ano
6. **Streaming de Relatórios** — respostas da IA aparecem em tempo real
7. **Privacidade Total** — dados nunca saem do navegador (exceto quando o usuário opta por enviar à API)

---

## Público-Alvo

O AstroMap é indicado para:

- **Astrologues e estudantes de astrologia** que buscam uma ferramenta de cálculo precisa
- **Pessoas interessadas em autoconhecimento** que desejam entender seu mapa astral
- **Desenvolvedores** que querem estudar a integração de cálculos astronômicos com IA

---

## Limitações Conhecidas

- O buscador de cidades é otimizado e filtrado para o **Brasil**
- O cálculo de fuso horário e horário de verão utiliza **regras simplificadas** para o território brasileiro
- Corpos secundários (**Quíron**, **Lilith** e **Nodos**) utilizam fórmulas de aproximação linear. Para uso profissional/crítico de Quíron, recomenda-se conferir com efemérides oficiais
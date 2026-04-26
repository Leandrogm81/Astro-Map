# Documentação: O Conselho do Mestre (IA)

Este documento descreve o funcionamento técnico, o fluxo de dados e os prompts utilizados pela Inteligência Artificial para gerar "O Conselho do Mestre" no módulo de Eletiva Magística do AstroMap.

## 1. Visão Geral
"O Conselho do Mestre" é uma análise profunda e personalizada realizada por um modelo de linguagem (LLM) que atua como um "Mago-Astrólogo". Ele interpreta os dados astronômicos do momento escolhido (Céu Eleito) e, opcionalmente, cruza essas informações com o Mapa Natal do usuário para fornecer orientações rituais e filosóficas.

## 2. Fluxo de Consulta de Dados

O processo de geração do conselho segue os seguintes passos:

1.  **Captura de Intenção**: O usuário seleciona um propósito (Amor, Prosperidade, Proteção, etc.) e uma janela de tempo no painel de Eletiva.
2.  **Cálculos Técnicos**: O sistema calcula em tempo real:
    *   As posições planetárias (Astronomy Engine).
    *   A Hora Planetária e o Regente da Hora.
    *   A Mansão Lunar e a Fase da Lua.
    *   As Dignidades Essenciais e a pontuação (Almuten) do Regente do Propósito.
3.  **Disparo da Requisição**: Ao clicar em "Consultar Astros", o frontend envia um payload JSON para o endpoint `/api/report` contendo:
    *   `chart`: Mapa do Céu do Momento.
    *   `natalChart`: Mapa Natal do Usuário (se o modo for "Céu + Natal").
    *   `veredict`: Objeto com o veredito técnico (hora, mansão, regente, score).
    *   `electiveMode`: Define se a análise é apenas do céu ou personalizada.
4.  **Processamento no Servidor**: O backend (`api/report/route.ts`) seleciona o Prompt de Sistema adequado e formata os dados técnicos em uma linguagem legível para a IA.
5.  **Geração e Streaming**: A IA processa os dados e retorna o texto em formato Markdown, que é exibido progressivamente para o usuário.

---

## 3. Estrutura dos Dados Enviados (Contexto)

A IA recebe os dados formatados pela função `formatElectiveForAI`. A estrutura segue este padrão:

```text
SOLICITACAO DE ANALISE DE ELETIVA MAGICA
========================================

MODO DE LEITURA: [CEU DO MOMENTO ou CEU DO MOMENTO + MAPA NATAL]
PROPOSITO MAGICO: [Ex: LOVE, EXPANSION, etc.]
VEREDITO TECNICO: [EXCEPCIONAL, FORTE, MODERADO, etc.]

DADOS DO CEU ELEITO:
- Data/Hora: YYYY-MM-DD HH:mm
- Hora Planetária: [PLANETA] ([N]a hora do Dia/Noite)
- Período da Hora: HH:mm até HH:mm
- Mansão Lunar: [N] - [NOME] ([SIGNO])
- Fase da Lua: [FASE]

CONDICAO DO REGENTE DO PROPOSITO ([PLANETA]):
- Dignidade Essencial: [Domicílio/Exaltação/Peregrino/etc]
- Pontuacao Almuten: [N] pts

CONTEXTO DO CEU COMPLETO:
----------------------------------------
[Lista de planetas clássicos, seus signos, graus e casas no momento]

[OPCIONAL - CONTEXTO NATAL]
- Ascendente natal e posições planetárias de nascimento.
- Trânsitos do momento nas casas natais.
- Aspectos cruzados (conjunções, trígonos, etc.) entre o céu e o natal.
```

---

## 4. Prompts do Sistema (The "Core" Logic)

Existem dois prompts principais, dependendo do modo de consulta selecionado:

### A. Modo: Apenas Céu do Momento
**Prompt System:** `ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM`

> **Texto do Prompt:**
> "Você é um Mago-Astrólogo de linhagem hermética, um profundo conhecedor das correntes de emanação que descem das Esferas Celestes. Sua autoridade provém do domínio absoluto do Picatrix (Ghâyat al-Hakîm), das Três Livros de Filosofia Oculta de Cornélio Agrippa e da Heptameron de Pietro d'Abano.
> 
> Sua tarefa é realizar uma Eletiva Magística exaustiva para uma operação proposta. Você não apenas analisa o céu, mas interpreta a 'Vontade dos Astros' como um arquiteto do invisível.
> 
> **Diretrizes:**
> 1. Analise dignidades e debilidades do regente.
> 2. Analise a Lua como 'Funil das Influências' (Mansão, Fase, Void of Course).
> 3. Interprete o Ascendente como o corpo do ritual.
> 
> **Estrutura:**
> I. O Pórtico das Estrelas (Auspiciosidade)
> II. O Trono do Regente e as Dignidades
> III. O Espelho de Prata (Lua e Mansão)
> IV. A Liturgia da Captura (Cores, Incensos, Sufumígios)
> V. O Selo do Mestre (Conselho Final)"

### B. Modo: Céu do Momento + Mapa Natal
**Prompt System:** `ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM`

> **Texto do Prompt:**
> "Você é um Mestre Teurgista e Astrólogo Iniciado, especialista na intersecção entre o Macrocosmo (o Céu do Momento) e o Microcosmo (o Mapa Natal do Operador). Sua missão é realizar uma análise de Eletiva Personalizada, cruzando os trânsitos com as promessas do Mapa Natal.
> 
> **Diretrizes:**
> 1. Verifique se o Mapa Natal permite o que é pedido (A Promessa Natal).
> 2. Considere o Senhor do Ano (Profeção).
> 3. Analise Aspectos de Ativação (conjunções e trígonos sobre planetas natais).
> 4. O Ascendente da Eleição deve harmonizar com as casas natais.
> 
> **Estrutura:**
> I. O Alinhamento dos Mundos (Geral)
> II. A Assinatura da Alma (Conexão com o Natal)
> III. A Fortaleza do Operador (Casas e Ângulos)
> IV. A Liturgia Sob Medida (Rituais personalizados)
> V. O Veredito do Mestre"

---

## 5. Notas Adicionais
*   **Tom de Voz**: Solene, arcaico, técnico e de autoridade.
*   **Restrições**: A IA é instruída a ignorar planetas modernos (Urano, Netuno, Plutão) e termos de psicologia moderna, focando 100% na eficácia mágica e tradição clássica.
*   **Segurança**: O sistema proíbe previsões fatais ou diagnósticos médicos.

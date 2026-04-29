# 🔮 Módulo de Eletiva Mágica (AstroMap)

Este documento detalha o funcionamento técnico, as regras astrológicas e a lógica de implementação do sistema de **Eletiva Mágica** do AstroMap. O módulo combina cálculos astrológicos tradicionais (Hellenísticos e Medievais) com inteligência artificial para fornecer vereditos precisos sobre o timing de rituais e intenções mágicas.

---

## 1. Visão Geral

O módulo de eletiva tem como objetivo identificar o momento ideal para a realização de uma operação mágica, baseando-se na correspondência entre o propósito do usuário e o estado atual do céu. Ele avalia a força do planeta regente da intenção, a condição da Lua e a hora planetária vigente.

### Objetivos Principais

- Calcular **Horas Planetárias** e **Dias Planetários** com precisão astronômica.
- Determinar a **Mansão Lunar** (sistema de 28 divisões).
- Avaliar a **Dignidade e Condição** dos planetas (Essencial e Acidental).
- Fornecer um **Veredito Técnico** (Pontuação) e uma interpretação via AI.

### Modos de Operação

O módulo suporta dois modos distintos, definidos pelo tipo `ElectiveMode` em `types.ts`:

| Modo | Valor | Persona da IA | Contexto Adicional |
| :--- | :--- | :--- | :--- |
| **Céu Somente** | `sky_only` | Mago-Astrólogo de linhagem hermética | Analisa apenas o estado atual do céu |
| **Céu + Natal** | `sky_plus_natal` | Mestre Teurgista e Astrólogo Iniciado | Integra o Mapa Natal do usuário ao veredito |

O modo é selecionado pelo usuário na UI e determina qual prompt do sistema (`ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM` ou `ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM`) será usado no endpoint `/api/report`.

---

## 2. Arquitetura de Arquivos

Os arquivos principais que compõem este módulo são:

- `src/lib/traditional/elective.ts`: Engine central de vereditos e cálculos de horas/mansões.
- `src/lib/traditional/scoring.ts`: Lógica de pontuação de dignidades (Domicílio, Exaltação, Triplicidade, Termo, Face).
- `src/lib/traditional/magic-correspondences.ts`: Definições de intenções, cores, incensos, metais e caridades.
- `src/lib/traditional/types.ts`: Definições de interfaces TypeScript para o módulo.
- `src/lib/aiPrompts.ts`: Prompts do sistema e formatadores de dados para a AI.
- `src/app/api/report/route.ts`: Endpoint que orquestra a geração do relatório final.

---

## 3. Lógica de Cálculo Astrológico

### 3.1 Dia e Noite Planetários

O sistema diferencia o dia civil do dia astrológico. O dia astrológico começa sempre no **Nascer do Sol**.

- **Regentes do Dia:** Seguem a ordem: Sol (Dom), Lua (Seg), Marte (Ter), Mercúrio (Qua), Júpiter (Qui), Vênus (Sex), Saturno (Sáb).
- Se uma consulta for feita às 02:00 da manhã de uma segunda-feira, mas o Sol ainda não nasceu, o sistema corretamente identifica o regente como sendo do dia anterior (Sol/Domingo).

### 3.2 Horas Planetárias

Calculadas dividindo o período de luz (nascer ao pôr do sol) em 12 partes iguais, e o período de trevas (pôr do sol ao próximo nascer) em outras 12 partes.

- **Ordem Caldeia:** Saturno ♄ → Júpiter ♃ → Marte ♂ → Sol ☉ → Vênus ♀ → Mercúrio ☿ → Lua ☾.
- A primeira hora do dia é sempre regida pelo planeta que rege o dia.
- O sistema utiliza a biblioteca `astronomy-engine` para obter horários precisos de nascer/pôr do sol com base na latitude/longitude do usuário.

### 3.3 Mansões Lunares

O AstroMap utiliza o sistema de **28 Mansões Lunares** de divisão igual (12°51'26" cada).

- Cada mansão possui um sumário de influência (ex: Mansão 1: Inícios e Coragem; Mansão 9: Desfortuna).
- Certas mansões são marcadas como "desafiadoras" no código (`[9, 12, 21, 23]`), penalizando a pontuação da eletiva.

### 3.4 Condição da Lua

A Lua é o "transmissor" da influência celeste. O sistema verifica:

- **Fase Lunar:** (Nova, Crescente, Cheia, etc.).
- **Vazio de Curso (VOC):** Verifica se a Lua fará algum aspecto maior antes de mudar de signo.
- **Combustão:** Detectada pela função `getSolarCondition` em `dignities.ts` quando a separação Lua-Sol é ≤ 8.5°. O resultado é exposto no campo booleano `moonAssessment.condition.isCombust` do objeto `ElectiveVeredict`; é esse campo que a engine de eletiva (`elective.ts`) lê para aplicar a penalidade de -10 pontos — não uma checagem direta de graus na engine.
- **Aspectos:** Lista aspectos aplicativos e separativos.

---

## 4. Engine de Veredito (Pontuação)

A função `getElectiveVeredict` em `elective.ts` calcula uma pontuação numérica para definir se o momento é propício.

### Critérios de Pontuação

1. **Hora Planetária (Peso 5):** Se a hora atual é regida pelo planeta que governa o propósito (ex: Hora de Vênus para Amor), ganha +5 pontos.
2. **Benéficos/Maléficos na Hora (Peso 2/-3):** Horas de Júpiter/Vênus dão bônus (+2); Marte/Saturno dão penalidade (-3). A lógica em `elective.ts:194-196` é um `if/else if` em cascata: o primeiro `if` verifica se a hora pertence ao regente do propósito (+5). Por **precedência de código**, se esse `if` for verdadeiro, os ramos de benéficos/maléficos nunca são avaliados — não existe uma cláusula de exceção explícita. O efeito prático é o mesmo: um planeta maléfico que também é regente do propósito recebe +5, não -3.
3. **Dignidade do Regente (Peso: Total/2):** Metade da pontuação de dignidade calculada em `scoring.ts`.
4. **Dignidade da Lua (Peso: Total/3):** Um terço da força da Lua contribui para o sucesso.
5. **Penalidades Específicas:**
    - Lua Combusta: -10 pontos.
    - Mansões Maléficas: -5 pontos.

### Níveis de Veredito

- **Propício (Propitious):** Pontuação >= 7.
- **Neutro (Neutral):** Pontuação entre 0 e 6.
- **Desafiador (Challenging):** Pontuação < 0.

---

## 5. Correspondências Mágicas

O arquivo `magic-correspondences.ts` opera em duas camadas:

### 5.1 Tabela de Planetas (Correspondências Base)

| Planeta | Intenções Principais | Cores | Incensos | Metais |
| :--- | :--- | :--- | :--- | :--- |
| **Sol** | Sucesso, Brilho, Liderança | Dourado | Olíbano, Canela | Ouro |
| **Lua** | Intuição, Mudanças, Sonhos | Prata, Branco | Jasmim, Sândalo | Prata |
| **Mercúrio** | Comunicação, Estudos, Comércio | Laranja | Anis, Lavanda | Moedas |
| **Vênus** | Amor, Arte, Paz, Atração | Verde, Rosa | Rosa, Baunilha | Cobre |
| **Marte** | Defesa, Coragem, Energia | Vermelho | Dragão, Pimenta | Ferro |
| **Júpiter** | Dinheiro, Sorte, Justiça | Azul, Púrpura | Cedro, Cravo | Estanho |
| **Saturno** | Banimento, Disciplina, Tempo | Preto, Chumbo | Mirra, Patchouli | Chumbo |

### 5.2 Sistema Expandido de Intenções Rituais

Além dos 7 propósitos planetários básicos (`MagicPurpose`), o arquivo define **`RITUAL_INTENTIONS`** com 22 intenções organizadas em **6 categorias** temáticas. Este é o sistema que alimenta o seletor da UI no `TraditionalElectivePanel.tsx`:

| Categoria | Exemplos de Intenções |
| :--- | :--- |
| `love` | Atração, Reconciliação, Fidelidade |
| `prosperity` | Abundância, Negócios, Carreira |
| `protection` | Banimento, Escudo, Limpeza |
| `health` | Cura, Vitalidade, Sono |
| `knowledge` | Estudos, Divinação, Comunicação |
| `power` | Liderança, Coragem, Influência |

Cada entrada de `RITUAL_INTENTIONS` mapeia para um `MagicPurpose` (planeta regente) e carrega os elementos rituais correspondentes que serão incluídos no relatório da AI.

---

## 6. Integração com Inteligência Artificial

A AI não "calcula" a eletiva; ela **interpreta** os dados calculados pelo engine TypeScript.

### Fluxo de Dados

1. O backend (`route.ts`) gera o objeto `ElectiveVeredict`.
2. `formatElectiveForAI` em `aiPrompts.ts` serializa o veredito em um bloco de texto estruturado (seção `DADOS CALCULADOS`).
3. Com base no `ElectiveMode` recebido, o endpoint injeta um dos dois prompts de sistema:
   - **`ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM`** → persona: *"Mago-Astrólogo de linhagem hermética"*.
   - **`ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM`** → persona: *"Mestre Teurgista e Astrólogo Iniciado"*, com contexto natal integrado via `natalChart`.

### Guardrails da AI

O prompt de sistema inclui quatro constantes de guardrail injetadas em `aiPrompts.ts`:

| Constante | Propósito |
| :--- | :--- |
| `ELECTIVE_CONFIDENCE_GUARDRAILS` | Define os limites de certeza: a AI não pode afirmar resultados garantidos. |
| `ELECTIVE_PROHIBITED_RULES` | Lista explícita de proibições: planetas modernos (Urano, Netuno, Plutão), suavizar veredito "Desafiador". |
| `ELECTIVE_HOUSES_LEGEND` | Legenda de casas astrológicas para contextualizar a análise sem invenção. |
| `ELECTIVE_FEW_SHOT_EXAMPLES` | Exemplos de resposta canônica para reduzir alucinação estrutural e garantir formato consistente. |

**Fidelidade ao Veredito:** Se a engine calculou "Desafiador", a AI não pode suavizar a avaliação. O formato da seção `DADOS CALCULADOS` é rígido e serve como âncora anti-alucinação.

---

## 7. Componentes de Interface (UI)

O principal componente visual é o `TraditionalElectivePanel.tsx`, que exibe:

- O cronômetro da hora planetária atual.
- O card da mansão lunar.
- O seletor de intenções mágicas.
- O botão "Gerar Relatório de Eletiva" (que aciona a `/api/report`).

---

## Observações Adicionais

- **Precisão:** O sistema usa cálculos de orbe por **Moiety** (metade do diâmetro da luz do planeta), seguindo a tradição medieval.
- **Fuso Horário:** Todo o cálculo de horas planetárias é feito considerando o fuso horário local das coordenadas fornecidas, garantindo que o nascer do sol seja o local exato.
- **Manutenção:** Qualquer alteração na lógica de pontuação em `elective.ts` deve ser refletida neste documento e validada contra os testes em `src/__tests__/aiPrompts.test.ts`.

---
*Documento auditado e corrigido em 2026-04-28. Conformidade com AstroMap Spec §7 e §10. Verificado contra: `elective.ts`, `scoring.ts`, `magic-correspondences.ts`, `types.ts`, `aiPrompts.ts`, `route.ts`.*

# Plano de Melhoria dos Prompts de IA — v2

## Objetivo

Melhorar os prompts do arquivo `src/lib/aiPrompts.ts` para que os relatórios do AstroMap sejam mais bem explicados, profundos e úteis para a vida real de qualquer pessoa, sem perder a precisão astrológica.

A mudança deve orientar a IA a traduzir os fatores astrológicos em temas humanos concretos, como identidade, emoções, relacionamentos, trabalho, vocação, dinheiro, família, desafios, talentos, espiritualidade, escolhas práticas e amadurecimento.

---

## Problema Atual

O arquivo `src/lib/aiPrompts.ts` concentra muitas responsabilidades:

- prompts de sistema;
- formatação de mapa natal;
- formatação de revolução solar;
- formatação do tratado tradicional;
- formatação de eleição mágica;
- traduções auxiliares;
- regras de estilo da resposta.

Além disso, os prompts já pedem profundidade, mas ainda podem produzir respostas muito técnicas ou genéricas se a IA não for instruída a conectar cada símbolo astrológico com situações comuns da vida cotidiana.

---

## Resultado Esperado

Os relatórios devem continuar longos e bem desenvolvidos, mas com explicações mais humanas, aplicáveis e úteis.

Cada interpretação astrológica importante deve responder, sempre que possível:

1. O que esse fator significa astrologicamente.
2. Como isso pode aparecer na vida real.
3. Quais desafios pode indicar.
4. Quais talentos ou recursos pode revelar.
5. Que orientação prática pode ajudar a pessoa a amadurecer ou usar melhor esse potencial.

Ao mesmo tempo, cada tipo de relatório deve preservar sua própria identidade astrológica. A melhoria de linguagem não deve fazer todos os relatórios parecerem iguais.

---

## Identidade Específica de Cada Relatório

Cada prompt deve carregar claramente a natureza do relatório que está produzindo.

### Mapa Natal Moderno

O relatório de mapa natal moderno deve ter foco em autoconhecimento, psicologia simbólica, padrões emocionais, desenvolvimento pessoal e integração da personalidade.

Características esperadas:

- linguagem profunda, acolhedora e contemporânea;
- leitura de identidade, emoções, vínculos, vocação e amadurecimento;
- uso dos planetas modernos quando disponíveis;
- integração de aspectos, casas, signos e regências;
- foco em processos internos e expressão concreta na vida cotidiana;
- tom não determinista, sem fatalismo.

**Exemplo de frases que refletem a voz esperada:**

> "O Sol em Touro na Casa 10 não apenas ilumina sua vocação — ele revela uma necessidade profunda de construir autoridade sobre bases palpáveis, onde o reconhecimento vem do que você materializa."

> "Lua em Leão: você sente com intensidade dramática. O desafio é não depender do olhar do outro para se sentir seguro emocionalmente."

### Revolução Solar

O relatório de revolução solar deve ter foco no ciclo anual, temas do ano, prioridades temporárias, oportunidades, desafios e áreas da vida ativadas entre um aniversário e o próximo.

Características esperadas:

- leitura orientada ao período anual;
- comparação entre mapa natal e revolução solar;
- destaque para Ascendente da revolução solar, Meio do Céu, Sol, Lua e planetas angulares;
- atenção às casas ativadas no ano;
- interpretação de tendências, não promessas absolutas;
- orientação prática para atravessar o ciclo com consciência.

**Exemplo de frases que refletem a voz esperada:**

> "Com o Ascendente da Revolução caindo na sua Casa 4 natal, o ano pede retorno às bases. Assuntos familiares, moradia ou raízes emocionais tendem a dominar o palco."

> "Júpiter em trígono com o Sol da RS sugere expansão — mas onde? Onde ele cai no seu mapa natal revela o departamento da vida que será beneficiado."

### Mapa Tradicional

O relatório de mapa tradicional deve preservar a linguagem e a lógica da astrologia tradicional, com foco em seita, dignidades, debilidades, regências, casas, fortuna, condição dos planetas, testemunhos e juízos técnicos.

Características esperadas:

- abordagem tradicional, não psicológica como eixo principal;
- uso de planetas clássicos;
- atenção a seita, dignidade essencial, dignidade acidental, regentes e condições planetárias;
- interpretação objetiva dos testemunhos astrológicos;
- explicação acessível, mas sem descaracterizar a técnica tradicional;
- evitar misturar indevidamente conceitos modernos quando o relatório for tradicional.

**Exemplo de frases que refletem a voz esperada:**

> "Marte, em domicílio noturno, opera com autoridade. Seu fervor é disciplinado, não destrutivo. Contudo, em quadratura com Saturno, a ação encontra obstáculo — o nativo deve esgotar antes de empreender."

> "Vênus em Queda no signo de Escorpião: o afeto se dá por prova, não por deleite. A recepção é condicionada à superação."

### Eletiva Magística Tradicional

O relatório de eletiva magística tradicional deve ser inspirado na tradição de eleição astrológica associada a Picatrix e Agrippa, mantendo linguagem simbólica, ritualística e tradicional, mas sem prometer resultados sobrenaturais garantidos.

Características esperadas:

- foco em timing astrológico, intenção, símbolo, rito e adequação celeste;
- leitura da Lua, seus aspectos, dignidade, curso, aplicação e separação;
- atenção ao Ascendente, regente do Ascendente, planeta significador e condição dos planetas clássicos;
- linguagem tradicional e magística, sem virar fantasia genérica;
- inspiração em Picatrix e Agrippa como matriz simbólica, não como citação inventada;
- orientação prática e prudente para eleição, consagração, intenção e coerência ritual;
- evitar promessas de poder, garantia de resultado ou causalidade absoluta.

**Exemplo de frases que refletem a voz esperada:**

> "A Lua em Mansão de Al Tarf pede cautela. Não é tempo de conquista, mas de recolhimento. O operador deve preparar o terreno, não colher os frutos."

> "O Regente do Propósito, Vênus, está em domicílio e em recepção mútua com Júpiter — a Emanação do amor encontra canal aberto. Contudo, a quadratura com Saturno adverte: o desejo precisa de forma, não de impulso."

---

## Regra de Preservação de Identidade

Adicionar aos prompts uma instrução geral:

```text
Preserve a identidade específica deste tipo de relatório.

Não transforme um mapa tradicional em leitura psicológica moderna.
Não transforme uma revolução solar em mapa natal genérico.
Não transforme uma eletiva magística tradicional em autoajuda comum.
Não transforme o mapa natal moderno em juízo tradicional rígido.

A linguagem deve ser útil para a vida real, mas sempre respeitando a técnica,
o tom e o objetivo próprios da modalidade astrológica solicitada.
```

---

## Temas Humanos Obrigatórios

Os prompts devem orientar a IA a relacionar os fatores astrológicos com temas úteis para qualquer pessoa:

- identidade e autoconhecimento;
- emoções e necessidades internas;
- vínculos, amor e relacionamentos;
- trabalho, vocação e dinheiro;
- família, raízes e pertencimento;
- desafios recorrentes;
- talentos e recursos pessoais;
- espiritualidade, sentido e propósito;
- escolhas práticas;
- amadurecimento emocional e existencial.

---

## Diretriz Interpretativa Central

Adicionar uma instrução forte nos prompts principais:

```text
Você deve produzir uma interpretação profunda, bem explicada e útil para a vida real.

Cada seção deve traduzir o simbolismo astrológico em temas humanos concretos:
identidade, emoções, relacionamentos, trabalho, vocação, dinheiro, família,
desafios, talentos, espiritualidade, escolhas práticas e amadurecimento.

Não escreva apenas o que o fator significa astrologicamente.
Explique como isso pode aparecer na vida cotidiana da pessoa, em decisões,
padrões emocionais, relações, crises, oportunidades e formas de crescimento.
```

---

## Estrutura Recomendada por Fator Astrológico (Diretriz, não molde rígido)

Sempre que a IA analisar Sol, Lua, Ascendente, planetas, casas, aspectos, dignidades, regentes ou configurações centrais, ela deve considerar esta lógica:

```text
Para cada fator astrológico importante, considere esta estrutura como guia:

1. Significado astrológico direto.
2. Manifestação possível na vida real.
3. Desafios ou distorções possíveis.
4. Talentos, recursos ou potenciais.
5. Orientação prática, sem tom determinista.

IMPORTANTE: Esta estrutura é uma diretriz interpretativa, não um molde rígido.
Integre os elementos de forma fluida e literária, sem forçar todos os 5 pontos
em cada parágrafo. A naturalidade do texto é tão importante quanto a profundidade.
```

---

## Exemplos de Aplicação por Planeta

Adicionar orientação sem engessar a escrita:

- Sol: identidade, vitalidade, direção de vida, propósito e afirmação pessoal.
- Lua: mundo emocional, segurança, hábitos, memória afetiva e necessidades internas.
- Mercúrio: mente, linguagem, aprendizado, escolhas, negociação e interpretação da realidade.
- Vênus: amor, prazer, autoestima, vínculos, beleza, valores e capacidade de receber.
- Marte: ação, coragem, desejo, conflito, iniciativa, defesa e impulso.
- Júpiter: crescimento, fé, oportunidades, expansão, confiança e visão de futuro.
- Saturno: limites, medo, responsabilidade, maturidade, construção e perseverança.
- Ascendente: modo de entrada no mundo, postura diante da vida e caminho de desenvolvimento.
- Meio do Céu: vocação, imagem pública, realização, direção profissional e legado.

---

## Melhorias Técnicas no Arquivo

### 1. Estratégia de Tokens e Custo

Os prompts de sistema atuais somam ~2.5k-4k caracteres cada. A adição de instruções de profundidade humana pode aumentar o tamanho em até 30%.

**Regras para manter custo sob controle:**

- Cada instrução nova DEVE substituir uma instrução antiga equivalente, nunca apenas se somar.
- O bloco `DIRETRIZ ANTI-PROLIXIDADE` existente deve ser substituído ou absorvido pelas novas instruções — não duplicado.
- Estabelecer orçamento máximo: **prompt de sistema ≤ 3.5k caracteres** (~1k tokens), **userMessage ≤ 6k caracteres** (~1.5k tokens), total ≤ ~2.5k tokens por requisição.
- A userMessage (`formatChartForAI`, etc.) não deve ser inflada — os dados do mapa são os mesmos; apenas o prompt de sistema ganha instruções interpretativas.

### 2. Separar responsabilidades (Fase 2 — após validação textual)

Refatorar gradualmente `src/lib/aiPrompts.ts` em módulos menores, apenas após a melhoria textual ser validada:

- `src/lib/ai/prompts/systemPrompts.ts`
- `src/lib/ai/prompts/formatNatalPrompt.ts`
- `src/lib/ai/prompts/formatSolarPrompt.ts`
- `src/lib/ai/prompts/formatTraditionalPrompt.ts`
- `src/lib/ai/prompts/formatElectivePrompt.ts`
- `src/lib/ai/prompts/promptHelpers.ts`

Essa separação deve preservar os exports atuais ou atualizar os imports de forma controlada.

### 3. Melhorar `translateElectiveText`

Substituir a cadeia repetida de `.replace()` por um mapa de tradução com normalização controlada:

```typescript
const PLANET_NAME_MAP: Record<string, string> = {
  sun: 'Sol',
  moon: 'Lua',
  mercury: 'Mercúrio',
  venus: 'Vênus',
  mars: 'Marte',
  jupiter: 'Júpiter',
  saturn: 'Saturno',
};

function translateElectiveText(text: string): string {
  // Usa RegExp com flag 'i' (case-insensitive) para reduzir de 21 para 7 chamadas
  const result = text.replace(
    /\b(sun|moon|mercury|venus|mars|jupiter|saturn)\b/gi,
    (match) => PLANET_NAME_MAP[match.toLowerCase()] ?? match
  );
  return result;
}
```

Objetivo:

- reduzir duplicação (de 21 `.replace()` para 1 `RegExp`);
- evitar esquecimentos (um mapa centralizado);
- facilitar manutenção;
- preservar termos astrológicos em português no relatório final.

### 4. Criar blocos reutilizáveis de instrução

Evitar repetir regras semelhantes em vários prompts.

Criar blocos como:

- `HUMAN_LIFE_APPLICATION_INSTRUCTIONS`;
- `NON_DETERMINISTIC_LANGUAGE_INSTRUCTIONS`;
- `PRACTICAL_INTERPRETATION_STRUCTURE`;
- `SAFETY_AND_SCOPE_INSTRUCTIONS`;
- `REPORT_DEPTH_INSTRUCTIONS`;
- `IDENTITY_PRESERVATION_INSTRUCTIONS`.

### 5. Trocar "extremamente longo" por profundidade com qualidade

Evitar depender apenas de instruções como "relatório extremamente longo" ou "sem limite".

Preferir instruções como:

```text
A resposta deve ser extensa, interpretativa e bem desenvolvida.
Evite frases genéricas. Prefira explicações conectadas à vida concreta.
Não reduza a análise a palavras-chave astrológicas.
```

### 6. Tornar o contrato de resposta mais claro

Adicionar instruções para a IA:

- não inventar dados ausentes;
- usar somente os dados fornecidos;
- declarar quando uma informação não estiver disponível;
- não fazer previsões fatalistas;
- não prometer resultados garantidos;
- não transformar astrologia em diagnóstico médico, jurídico ou financeiro;
- **se um dado astrológico necessário para uma interpretação não estiver presente nos dados fornecidos, pule essa interpretação em vez de supor a posição.**

---

## Segurança e Robustez contra Alucinações

Risco: mesmo com instruções claras, a IA pode inventar posições ou interpretações.

**Camadas de defesa nos prompts:**

1. **Camada 1 — Proibição explícita:** "É terminantemente proibido inventar posições planetárias, casas, aspectos ou qualquer dado astrológico que não esteja explicitamente nos dados fornecidos."
2. **Camada 2 — Omissão segura:** "Se um dado necessário para uma interpretação não estiver presente nos campos fornecidos abaixo, omita essa interpretação. Prefira silêncio a especulação."
3. **Camada 3 — Controle de contexto via systemPrompt:** Manter o systemPrompt focado em regras de tom e interpretação, e os dados brutos na userMessage. Isso evita que a IA confunda instrução com dado.
4. **Camada 4 — Testes contratuais:** Testes devem verificar que, para charts com dados parciais (ex: sem traditionalPoints), o prompt resultante não contém instruções que peçam à IA para "calcular" ou "inferir" o que não foi fornecido.

---

## Pontos de Atenção Astrológica

Durante a implementação, revisar cuidadosamente:

- cálculo ou exibição da casa dos Lotes no tratado tradicional;
- normalização de nomes de planetas em português e inglês;
- consistência dos nomes de aspectos;
- preservação da lógica tradicional separada da lógica moderna;
- manutenção da regra de não usar planetas modernos no tratado tradicional, quando aplicável.

---

## Risco de Contaminação de Identidade

Risco específico identificado: a IA, ao receber instruções de "tornar mais humano" ou "aplicar à vida real", pode involuntariamente modernizar ou psicologizar o tom do relatório tradicional ou eletivo, descaracterizando a técnica.

**Mitigações específicas:**

- Nos prompts tradicional e eletivo, incluir instrução explícita: "A conexão com a vida real deve ser feita em termos técnicos (ex: 'esta condição indica dificuldade em X área'), não psicológicos (ex: 'isso representa uma ferida interior')."
- Na revisão (Reviewer), incluir no checklist: "O relatório tradicional não contém termos como 'inconsciente', 'projeção', 'sombra', 'criança interior' ou outros conceitos da psicologia moderna?"

---

## Não-Objetivos

Esta mudança não deve:

- alterar cálculos astrológicos;
- alterar regras de casas;
- alterar geração de PDF;
- alterar layout visual;
- alterar contrato da API `/api/report`, salvo se for inevitável para manter imports;
- mudar comportamento de autenticação;
- trocar provedor de IA;
- criar novas funcionalidades fora dos prompts.

---

## Arquivos Prováveis

Arquivos principais:

- `src/lib/aiPrompts.ts`
- `src/__tests__/aiPrompts.test.ts`

Arquivos possíveis se houver refatoração modular (Fase 2):

- `src/lib/ai/prompts/systemPrompts.ts`
- `src/lib/ai/prompts/formatNatalPrompt.ts`
- `src/lib/ai/prompts/formatSolarPrompt.ts`
- `src/lib/ai/prompts/formatTraditionalPrompt.ts`
- `src/lib/ai/prompts/formatElectivePrompt.ts`
- `src/lib/ai/prompts/promptHelpers.ts`
- `src/app/api/report/route.ts`

---

## Estratégia de Execução em Fases

### Fase 1 — Melhoria Textual (sem refatoração estrutural)

1. Identificar os prompts principais no arquivo atual.
2. Criar instruções reutilizáveis para interpretação humana e prática.
3. Inserir essas instruções nos prompts natal, tradicional, solar e eletivo.
4. Aplicar as novas instruções de segurança contra alucinações (camadas 1-3).
5. Otimizar `DIRETRIZ ANTI-PROLIXIDADE` → fundir com novas instruções, remover duplicação.
6. Trocar "extremamente longo" por instruções de profundidade com qualidade.
7. Remover redundâncias identificadas.
8. Ajustar testes contratuais (existência dos novos blocos, ausência de termos proibidos, etc.).
9. **Validar:** `npm run lint && npm run build && npm run test`.

### Fase 2 — Refatoração Modular (após aprovação da Fase 1)

10. Extrair cada prompt de sistema para `src/lib/ai/prompts/systemPrompts.ts`.
11. Extrair `formatChartForAI`, `formatSolarComparisonForAI`, `formatTraditionalChartForAI` para seus respectivos módulos.
12. Extrair `formatElectiveForAI` e `translateElectiveText` (já refatorado com `Map`).
13. Extrair helpers (`formatDegree`, `getZodiacSign`, `ASPECT_NAMES_PT`) para `promptHelpers.ts`.
14. Atualizar imports em `src/app/api/report/route.ts` e `src/__tests__/aiPrompts.test.ts`.
15. **Validar:** `npm run lint && npm run build && npm run test`.

---

## Testes Recomendados

### Testes de Contrato (snapshot)

- `NATAL_PROMPT_SYSTEM` contém palavras-chave: `"Não use linguagem New Age"`, `"profundo"`, `"dignidades"`.
- `TRADITIONAL_PROMPT_SYSTEM` contém: `"Ignorar Urano, Netuno e Plutão"`, `"Hyleg e Alcocoden"`, `"Não use linguagem"`.
- `SOLAR_RETURN_PROMPT_SYSTEM` contém: `"comparativo"`, `"Revolução Solar"`.
- `ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM` contém: `"Picatrix"`, `"Mansão Lunar"`.
- Garantir que **nenhum** prompt de sistema tradicional/eletivo contenha termos psicológicos modernos indevidos (ex: `"inconsciente"`, `"sombra"`, `"criança interior"`).

### Testes Funcionais

- Os prompts incluem orientação de aplicação na vida real.
- Os prompts pedem linguagem não determinista.
- Os prompts proíbem invenção de dados ausentes.
- Os prompts incluem a instrução de omitir interpretação quando dados faltam.
- A tradução de planetas eletivos continua funcionando.
- Os relatórios tradicionais preservam a separação de astrologia tradicional.
- Os aspectos e planetas são normalizados corretamente.
- Os exports usados por `/api/report` continuam compatíveis.

### Testes de Ausência de Regressão

- `translateElectiveText` (nova versão com `Map`) produz exatamente o mesmo output da versão antiga para o mesmo input.
- `formatChartForAI` output permanece idêntico (estruturalmente) ao anterior.
- `formatSolarComparisonForAI` output permanece idêntico.

---

## Critérios de Validação Qualitativa (Checklist de Avaliação)

Após gerar um relatório de cada tipo (natal, solar, tradicional, eletivo), aplicar este checklist:

| Critério | Natal | Solar | Trad. | Elet. |
|----------|-------|-------|-------|-------|
| 80%+ das seções citam dados específicos (signo, casa, grau) | | | | |
| Há conexão explícita entre símbolo e vida cotidiana | | | | |
| Linguagem sem fatalismo (ausente "você vai", "certamente") | | | | |
| A voz corresponde à identidade do relatório (ex: trad. sem psicologismo) | | | | |
| Nenhum dado foi inventado (cross-check com os dados fornecidos) | | | | |

---

## Validação Obrigatória

Após implementação:

```bash
npm run lint
npm run build
npm run test
```

Também é recomendado gerar ao menos um relatório de cada tipo:

- natal;
- revolução solar;
- tratado tradicional;
- eletiva mágica.

E aplicar o checklist qualitativo acima.

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|:------------:|:-------:|-----------|
| Aumentar tamanho dos prompts, elevando custo/latência | Média | Médio | Fase 1 sem modularização; cada instrução nova substitui uma antiga; orçamento de tokens definido |
| Repetir instruções em excesso, deixando IA prolixa | Alta | Alto | Blocos reutilizáveis evitam repetição; fusão com DIRETRIZ ANTI-PROLIXIDADE |
| Enfraquecer precisão técnica ao tentar deixar texto mais acessível | Média | Alto | Regra de preservação de identidade + exemplos de voz para cada modalidade |
| Contaminação de identidade (tradicional virar moderno) | Alta | Alto | Instrução explícita anti-contaminação + checklist de revisão com termos proibidos |
| IA inventar dados mesmo com instruções (alucinação) | Média | Crítico | 4 camadas de defesa nos prompts + testes contratuais |
| Quebrar imports se refatoração modular for feita de uma vez | Média | Alto | Fase 1 (texto) separada da Fase 2 (modularização); preservar exports |
| Alterar sem querer o comportamento do tratado tradicional | Baixa | Alto | Testes de snapshot e regressão; revisão com checklist |
| Esquecer de atualizar `translateElectiveText` corretamente | Baixa | Médio | Teste de regressão comparando output old vs new para mesmos inputs |

---

## Próximo Workflow Recomendado

`astromap-delivery`

A próxima etapa deve implementar este plano de forma cirúrgica, começando pela **Fase 1** (melhoria textual e testes), sem alterar a lógica astrológica central ou a estrutura de arquivos.

# Plano de Melhoria dos Prompts de IA

## Objetivo

Melhorar os prompts do arquivo `src/lib/aiPrompts.ts` para que os relatórios do AstroMap sejam mais bem explicados, profundos e úteis para a vida real de qualquer pessoa, sem perder a precisão astrológica.

A mudança deve orientar a IA a traduzir os fatores astrológicos em temas humanos concretos, como identidade, emoções, relacionamentos, trabalho, vocação, dinheiro, família, desafios, talentos, espiritualidade, escolhas práticas e amadurecimento.

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

## Resultado Esperado

Os relatórios devem continuar longos e bem desenvolvidos, mas com explicações mais humanas, aplicáveis e úteis.

Cada interpretação astrológica importante deve responder, sempre que possível:

1. O que esse fator significa astrologicamente.
2. Como isso pode aparecer na vida real.
3. Quais desafios pode indicar.
4. Quais talentos ou recursos pode revelar.
5. Que orientação prática pode ajudar a pessoa a amadurecer ou usar melhor esse potencial.

Ao mesmo tempo, cada tipo de relatório deve preservar sua própria identidade astrológica. A melhoria de linguagem não deve fazer todos os relatórios parecerem iguais.

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

### Revolução Solar

O relatório de revolução solar deve ter foco no ciclo anual, temas do ano, prioridades temporárias, oportunidades, desafios e áreas da vida ativadas entre um aniversário e o próximo.

Características esperadas:

- leitura orientada ao período anual;
- comparação entre mapa natal e revolução solar;
- destaque para Ascendente da revolução solar, Meio do Céu, Sol, Lua e planetas angulares;
- atenção às casas ativadas no ano;
- interpretação de tendências, não promessas absolutas;
- orientação prática para atravessar o ciclo com consciência.

### Mapa Tradicional

O relatório de mapa tradicional deve preservar a linguagem e a lógica da astrologia tradicional, com foco em seita, dignidades, debilidades, regências, casas, fortuna, condição dos planetas, testemunhos e juízos técnicos.

Características esperadas:

- abordagem tradicional, não psicológica como eixo principal;
- uso de planetas clássicos;
- atenção a seita, dignidade essencial, dignidade acidental, regentes e condições planetárias;
- interpretação objetiva dos testemunhos astrológicos;
- explicação acessível, mas sem descaracterizar a técnica tradicional;
- evitar misturar indevidamente conceitos modernos quando o relatório for tradicional.

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

## Estrutura Recomendada por Fator Astrológico

Sempre que a IA analisar Sol, Lua, Ascendente, planetas, casas, aspectos, dignidades, regentes ou configurações centrais, ela deve seguir esta lógica:

```text
Para cada fator astrológico importante, siga esta estrutura:

1. Significado astrológico direto.
2. Manifestação possível na vida real.
3. Desafios ou distorções possíveis.
4. Talentos, recursos ou potenciais.
5. Orientação prática, sem tom determinista.
```

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

## Melhorias Técnicas no Arquivo

### 1. Separar responsabilidades

Refatorar gradualmente `src/lib/aiPrompts.ts` em módulos menores:

- `src/lib/ai/prompts/systemPrompts.ts`
- `src/lib/ai/prompts/formatNatalPrompt.ts`
- `src/lib/ai/prompts/formatSolarPrompt.ts`
- `src/lib/ai/prompts/formatTraditionalPrompt.ts`
- `src/lib/ai/prompts/formatElectivePrompt.ts`
- `src/lib/ai/prompts/promptHelpers.ts`

Essa separação deve preservar os exports atuais ou atualizar os imports de forma controlada.

### 2. Melhorar `translateElectiveText`

Substituir a cadeia repetida de `.replace()` por um mapa de tradução com normalização controlada.

Objetivo:

- reduzir duplicação;
- evitar esquecimentos;
- facilitar manutenção;
- preservar termos astrológicos em português no relatório final.

### 3. Criar blocos reutilizáveis de instrução

Evitar repetir regras semelhantes em vários prompts.

Criar blocos como:

- `HUMAN_LIFE_APPLICATION_INSTRUCTIONS`;
- `NON_DETERMINISTIC_LANGUAGE_INSTRUCTIONS`;
- `PRACTICAL_INTERPRETATION_STRUCTURE`;
- `SAFETY_AND_SCOPE_INSTRUCTIONS`;
- `REPORT_DEPTH_INSTRUCTIONS`.

### 4. Trocar "extremamente longo" por profundidade com qualidade

Evitar depender apenas de instruções como "relatório extremamente longo" ou "sem limite".

Preferir instruções como:

```text
A resposta deve ser extensa, interpretativa e bem desenvolvida.
Evite frases genéricas. Prefira explicações conectadas à vida concreta.
Não reduza a análise a palavras-chave astrológicas.
```

### 5. Tornar o contrato de resposta mais claro

Adicionar instruções para a IA:

- não inventar dados ausentes;
- usar somente os dados fornecidos;
- declarar quando uma informação não estiver disponível;
- não fazer previsões fatalistas;
- não prometer resultados garantidos;
- não transformar astrologia em diagnóstico médico, jurídico ou financeiro.

## Pontos de Atenção Astrológica

Durante a implementação, revisar cuidadosamente:

- cálculo ou exibição da casa dos Lotes no tratado tradicional;
- normalização de nomes de planetas em português e inglês;
- consistência dos nomes de aspectos;
- preservação da lógica tradicional separada da lógica moderna;
- manutenção da regra de não usar planetas modernos no tratado tradicional, quando aplicável.

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

## Arquivos Prováveis

Arquivos principais:

- `src/lib/aiPrompts.ts`
- `src/__tests__/aiPrompts.test.ts`

Arquivos possíveis se houver refatoração modular:

- `src/lib/ai/prompts/systemPrompts.ts`
- `src/lib/ai/prompts/formatNatalPrompt.ts`
- `src/lib/ai/prompts/formatSolarPrompt.ts`
- `src/lib/ai/prompts/formatTraditionalPrompt.ts`
- `src/lib/ai/prompts/formatElectivePrompt.ts`
- `src/lib/ai/prompts/promptHelpers.ts`
- `src/app/api/report/route.ts`

## Plano Mínimo de Implementação

1. Identificar os prompts principais no arquivo atual.
2. Criar instruções reutilizáveis para interpretação humana e prática.
3. Inserir essas instruções nos prompts natal, tradicional, solar e eletivo.
4. Refatorar `translateElectiveText` para mapa de tradução, mantendo o mesmo resultado esperado.
5. Revisar os textos para remover redundâncias e manter profundidade.
6. Adicionar ou ajustar testes de contrato dos prompts.
7. Executar validação completa.

## Testes Recomendados

Adicionar ou ajustar testes para garantir que:

- os prompts incluem orientação de aplicação na vida real;
- os prompts pedem linguagem não determinista;
- os prompts proíbem invenção de dados ausentes;
- a tradução de planetas eletivos continua funcionando;
- os relatórios tradicionais preservam a separação de astrologia tradicional;
- os aspectos e planetas são normalizados corretamente;
- os exports usados por `/api/report` continuam compatíveis.

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

## Riscos

- Aumentar demais o tamanho dos prompts e elevar custo/latência.
- Repetir instruções em excesso e deixar a IA prolixa.
- Enfraquecer precisão técnica ao tentar deixar o texto mais acessível.
- Quebrar imports se a refatoração modular for feita de uma vez.
- Alterar sem querer o comportamento do tratado tradicional.

## Mitigações

- Implementar primeiro a melhoria textual sem grande refatoração estrutural.
- Manter testes dos exports existentes.
- Fazer a modularização em etapa separada, se necessário.
- Preservar todos os dados enviados ao modelo.
- Não alterar cálculos nem estruturas de domínio nesta fase.

## Próximo Workflow Recomendado

`astromap-delivery`

A próxima etapa deve implementar este plano de forma cirúrgica, começando pelos prompts e testes, sem alterar a lógica astrológica central.

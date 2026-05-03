# Plano de Implementação - Grimório Vivo

## 1. Premissas

- O Grimório Vivo é uma expansão do módulo existente de Eletiva Mágica.
- A camada de correspondências já expandida em `src/lib/traditional/magic-correspondences.ts` é a fonte canônica.
- O motor tradicional de eletiva continua como base técnica; a nova camada apenas enriquece o veredito, a IA, a UI e o PDF.
- `NatalChart` é opcional no MVP e serve para contexto adicional, sem alterar a pontuação eletiva.
- O score usado para remédios e leitura do produto será normalizado para escala 0-100.
- A regra de remédios será acionada quando `score normalizado < 70`.
- O checklist de materiais será local e temporário no MVP.
- O PDF deve ser renderizado com `@react-pdf/renderer`, preferencialmente em fluxo client-only.
- Não haverá banco novo, agendamento, marketplace, pagamentos, editor de PDF nem geração de sigilos.

## 2. Visão geral das sprints

1. Sprint 0 - Preparação e leitura do projeto
2. Sprint 1 - Contratos de domínio do Grimório Vivo
3. Sprint 2 - Enriquecimento do veredito eletivo
4. Sprint 3 - Prompt ritual estruturado
5. Sprint 4 - UI do painel Grimório Vivo
6. Sprint 5 - Exportação PDF
7. Sprint 6 - Testes, regressão e polimento controlado
8. Sprint 7 - Documentação mínima e handoff

## 3. Sprint 0 - Preparação e leitura do projeto

### Objetivo

Entender contratos reais, pontos de integração e riscos antes de tocar no domínio.

### Arquivos a inspecionar

- `src/lib/traditional/elective.ts`
- `src/lib/traditional/types.ts`
- `src/lib/traditional/magic-correspondences.ts`
- `src/lib/aiPrompts.ts`
- `src/app/api/report/route.ts`
- `src/components/traditional/TraditionalElectivePanel.tsx`
- `src/components/traditional/TraditionalElectivePanel.module.css`
- `src/components/PDFDownloadButton.tsx`
- `src/components/PDFDownloadButtonInternal.tsx`
- `src/components/kabbalah/KabbalahPDF.tsx`
- `src/__tests__/aiPrompts.test.ts`
- `src/__tests__/api-report.test.ts`

### Estrutura a mapear

- Como `TraditionalElectivePanel` calcula `veredict`.
- Como `/api/report` recebe `veredict`, `chart`, `natalChart` e `electiveMode`.
- Como os PDFs existentes usam `PDFDownloadLink`.
- Como os testes atuais montam mocks de `ElectiveVeredict`.
- Quais campos reais existem em `PlanetaryCorrespondence`.

### Dependências a verificar

- `@react-pdf/renderer` já está no projeto.
- Next.js 16 e React 19 já estão em uso.
- `lucide-react` já está disponível para os ícones do painel.

### Comandos iniciais

```bash
npm run lint
npm run test
npm run build
```

### Riscos

- Há dívida pré-existente em arquivos grandes e testes amplos.
- Alguns textos mostram encoding inconsistente no terminal, então não vale tentar “corrigir” isso como parte desta entrega.
- `TraditionalElectivePanel.tsx` é extenso; mudanças ali precisam ser cirúrgicas.

## 4. Sprint 1 - Contratos de domínio do Grimório Vivo

### Objetivo

Definir tipos mínimos para score normalizado, contexto ritual e remédios sem mudar o comportamento do motor ainda.

### Arquivos prováveis a criar ou alterar

- `src/lib/traditional/types.ts`
- `src/lib/traditional/elective.ts`
- teste novo em `src/__tests__/traditionalElective.test.ts` ou arquivo equivalente do padrão local

### Tarefas em ordem

1. Adicionar campos opcionais em `ElectiveVeredict` para pontuação bruta, score normalizado, contexto ritual e recomendações de remédio.
2. Reaproveitar a estrutura de `PlanetaryCorrespondence` como base do contexto ritual.
3. Tipar `sephirah`, `angel`, `hourAngel`, `olympicSpirit`, `intelligence`, `spirit`, `orphicHymn`, `materials`, `remedies` e `charity`.
4. Manter tudo opcional onde o dado puder faltar.

### Critérios de aceite

- O TypeScript continua aceitando os mocks existentes com mudanças mínimas.
- Não há `any`.
- Não há cálculo novo nesta sprint.

### Comandos de validação

```bash
npm run lint
npm run test -- src/__tests__/aiPrompts.test.ts
```

### Testes necessários

- Caso de `ElectiveVeredict` com e sem `ritualContext`.
- Caso de fallback quando dados rituais não estiverem presentes.

### Riscos

- Quebrar mocks de testes por alteração excessiva do tipo.
- Duplicar campos que já existem em `magic-correspondences.ts`.

### O que NÃO deve ser alterado

- Não mudar cálculo de pontos.
- Não alterar UI.
- Não alterar `/api/report`.
- Não criar persistência.

## 5. Sprint 2 - Enriquecimento do veredito eletivo

### Objetivo

Fazer `getElectiveVeredict` montar o contexto ritual e expor score normalizado, preservando o modo atual.

### Arquivos prováveis a criar ou alterar

- `src/lib/traditional/elective.ts`
- `src/lib/traditional/types.ts`
- testes em `src/__tests__/traditionalElective.test.ts`

### Tarefas em ordem

1. Criar função pequena para normalizar pontuação tradicional para 0-100.
2. Manter a classificação atual `propitious | neutral | challenging`.
3. Expor a pontuação bruta e a normalizada no retorno.
4. Montar `ritualContext` com dados de `PLANETARY_CORRESPONDENCES`.
5. Definir `hourAngel` como o anjo do planeta regente da hora planetária.
6. Definir `remedyRecommendations` quando o score normalizado ficar abaixo de 70.
7. Aceitar `NatalChart` opcional na assinatura sem usá-lo para pontuação no MVP.

### Critérios de aceite

- Chamadas antigas sem `NatalChart` continuam funcionando.
- Júpiter/prosperidade retorna Bethor, Chesed, Sachiel e Hino Órfico de Zeus quando disponíveis.
- Score baixo retorna remédios de pedras, plantas e banhos.
- Score alto não exibe remédios.
- O anjo da hora vem da correspondência do planeta da hora, sem inventar lookup novo.

### Comandos de validação

```bash
npm run test -- src/__tests__/traditionalElective.test.ts
npm run test -- src/__tests__/aiPrompts.test.ts
npm run lint
```

### Testes necessários

- Regressão sky-only sem `NatalChart`.
- Caso Júpiter/prosperidade.
- Caso score baixo dispara remédios.
- Caso de correspondência parcial faltante.

### Riscos

- Normalização errada pode fazer remédios aparecerem sempre.
- Alteração de assinatura pode quebrar a integração do painel.
- Misturar `PlanetKey` e ids minúsculos pode gerar lookup silenciosamente errado.

### O que NÃO deve ser alterado

- Não recalcular dignidades com mapa natal.
- Não adicionar aspectos natais ao score.
- Não mudar `PLANETARY_CORRESPONDENCES`.
- Não inventar anjos, materiais ou remédios.

## 5.1 Pausa forte A - Revisão do contrato de score

### Quando parar

Depois da Sprint 1 e antes de mexer na Sprint 2 de forma definitiva.

### O que revisar com modelo mais forte

- fórmula de normalização do score;
- equivalência entre score normalizado `< 70` e pontos tradicionais `< 3`;
- contrato final de `ElectiveVeredict`;
- profundidade permitida para `NatalChart` no MVP.

### Só continuar se

- os campos de retorno estiverem fechados;
- a regra de remédios estiver explícita;
- `NatalChart` estiver confirmado como contextual apenas.

## 6. Sprint 3 - Prompt ritual estruturado

### Objetivo

Atualizar prompts e serialização para que a IA produza um Protocolo Ritual com cinco blocos fixos.

### Arquivos prováveis a criar ou alterar

- `src/lib/aiPrompts.ts`
- `src/__tests__/aiPrompts.test.ts`
- possivelmente `src/__tests__/api-report.test.ts`

### Tarefas em ordem

1. Atualizar `ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM`.
2. Atualizar `ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM`.
3. Exigir cinco blocos:
   - Veredito Técnico
   - Preparação
   - Invocação
   - Ação Mágica
   - Finalização
4. Reforçar a regra de usar apenas o contexto fornecido.
5. Incluir disclaimer simbólico de remédios quando aplicável.
6. Serializar score normalizado e contexto ritual completo em `formatElectiveForAI`.

### Critérios de aceite

- O prompt contém os cinco blocos obrigatórios.
- O texto proíbe inventar dados ausentes.
- Júpiter/prosperidade carrega Bethor, Chesed e Hino Órfico quando houver dados.
- `sky_plus_natal` continua enviando contexto natal apenas quando solicitado.

### Comandos de validação

```bash
npm run test -- src/__tests__/aiPrompts.test.ts
npm run test -- src/__tests__/api-report.test.ts
npm run lint
```

### Testes necessários

- Prompt com cinco blocos.
- Formatação de contexto ritual completo.
- Fallback quando campos opcionais estiverem ausentes.
- Modo natal versus sky-only.

### Riscos

- Prompt ficar longo e caro.
- Linguagem permitir alucinação.
- Enviar dados natais demais para a IA.

### O que NÃO deve ser alterado

- Não mudar autenticação.
- Não expor chave de API.
- Não mudar modelo padrão.
- Não transformar a saída em um parser novo fora do escopo.

## 6.1 Pausa forte B - Revisão do contrato IA-domínio

### Quando parar

Depois da Sprint 3, antes de partir para UI nova.

### O que revisar com modelo mais forte

- qualidade do prompt;
- risco de alucinação ritual;
- segurança dos remédios;
- clareza dos cinco blocos obrigatórios;
- coerência entre veredito, prompt e PDF.

### Só continuar se

- o prompt proibir invenção de dados ausentes;
- o disclaimer simbólico estiver presente;
- o contrato ritual estiver estável para UI e PDF.

## 7. Sprint 4 - UI do painel Grimório Vivo

### Objetivo

Exibir correspondências, remédios e checklist no painel de eletiva sem redesenhar a tela.

### Arquivos prováveis a criar ou alterar

- `src/components/traditional/TraditionalElectivePanel.tsx`
- `src/components/traditional/TraditionalElectivePanel.module.css`
- possivelmente componentes auxiliares pequenos em `src/components/traditional/`

### Tarefas em ordem

1. Localizar a seção do Códice Hermético.
2. Exibir correspondências cabalísticas e angelicais com base no `veredict`.
3. Exibir Espírito Olímpico, Inteligência, Espírito e Hino Órfico quando existirem.
4. Criar checklist local de materiais para cores, metais e incensos.
5. Mostrar card de remédios apenas quando houver `remedyRecommendations`.
6. Incluir disclaimer simbólico no card de remédios.
7. Manter estados vazios e de carregamento.
8. Garantir comportamento responsivo.

### Critérios de aceite

- Júpiter/prosperidade exibe Bethor e Chesed.
- Score baixo mostra remédios.
- Checklist marca e desmarca sem persistência.
- UI não exibe `undefined`, `null` ou erro técnico.
- O fluxo antigo de consultar IA segue funcionando.

### Comandos de validação

```bash
npm run lint
npm run test
npm run build
```

### Testes necessários

- Smoke de renderização do painel ou subcomponentes.
- Caso de remédios visíveis.
- Caso de correspondências ausentes com fallback.

### Riscos

- Arquivo grande demais para mudanças múltiplas.
- Excesso de cards poluir a experiência.
- Checklist resetar no recálculo, o que é aceitável no MVP.

### O que NÃO deve ser alterado

- Não redesenhar o layout geral.
- Não mexer no Time Machine.
- Não mudar salvamento de eletivas.
- Não criar localStorage para checklist.
- Não mudar o fluxo de geração de IA.

## 7.1 Pausa forte C - Revisão da interface antes do PDF

### Quando parar

Depois da Sprint 4 e antes de construir a exportação.

### O que revisar com modelo mais forte

- densidade visual da UI;
- clareza dos cards de remédio e correspondências;
- impacto no mobile;
- se a informação ritual ficou coerente o suficiente para ser exportada sem nova modelagem.

### Só continuar se

- a interface estiver estável;
- o contrato visual estiver claro;
- não houver necessidade de mudar escopo para acomodar o PDF.

## 8. Sprint 5 - Exportação PDF

### Objetivo

Criar o componente de PDF “grimório antigo”, legível, com dados já visíveis na UI.

### Arquivos prováveis a criar ou alterar

- `src/components/traditional/ElectiveGrimoirePDF.tsx`
- `src/components/traditional/TraditionalElectivePanel.tsx`
- possivelmente um wrapper cliente para `PDFDownloadLink`
- teste novo em `src/__tests__/traditionalPdfFormatting.test.ts` ou equivalente

### Tarefas em ordem

1. Estudar padrões de `KabbalahPDF.tsx` e `PDFDownloadButtonInternal.tsx`.
2. Criar componente PDF isolado com props tipadas.
3. Incluir cabeçalho, intenção, data, veredito, correspondências, materiais, protocolo IA e remédios.
4. Adicionar botão “Exportar PDF (Grimório)” no painel.
5. Desabilitar ou ocultar o botão até haver veredito e protocolo mínimo.
6. Garantir fluxo client-only para evitar erro SSR.
7. Preservar o protocolo na UI em caso de erro de exportação.

### Critérios de aceite

- O PDF gera localmente sem erro.
- O PDF inclui veredito, correspondências, materiais, protocolo e remédios quando existirem.
- O layout permanece legível.
- O build não quebra por causa do `@react-pdf/renderer`.

### Comandos de validação

```bash
npm run test
npm run build
npm run lint
```

### Testes necessários

- Smoke de renderização/estrutura do PDF.
- Caso de filename/props se houver helper.
- Teste manual clicando no botão de exportação.

### Riscos

- Erro SSR com `PDFDownloadLink`.
- PDF bonito, mas ilegível.
- Exposição excessiva de dados sensíveis.

### O que NÃO deve ser alterado

- Não criar editor de PDF.
- Não salvar PDF no servidor.
- Não criar formatos alternativos.
- Não incluir imagens externas ou fontes novas sem motivo forte.

## 8.1 Pausa forte D - Revisão do PDF

### Quando parar

Depois da Sprint 5 e antes do fechamento final.

### O que revisar com modelo mais forte

- quais dados mínimos liberam o botão PDF;
- se o PDF deve exportar protocolo IA, veredito técnico ou ambos;
- risco de SSR;
- legibilidade visual e densidade de informação.

### Só continuar se

- o contrato de props do PDF estiver fechado;
- o botão tiver regra clara de habilitação;
- não houver necessidade de servidor novo.

## 9. Sprint 6 - Testes, regressão e polimento controlado

### Objetivo

Fechar regressões e validar o fluxo completo sem expandir escopo.

### Arquivos prováveis a criar ou alterar

- `src/__tests__/aiPrompts.test.ts`
- `src/__tests__/api-report.test.ts`
- testes novos de eletiva, UI ou PDF conforme o padrão encontrado
- ajustes pontuais nos arquivos das sprints anteriores

### Tarefas em ordem

1. Rodar a suíte completa.
2. Corrigir falhas causadas pelas mudanças.
3. Validar o fluxo sky-only.
4. Validar o fluxo sky-plus-natal.
5. Validar Júpiter/prosperidade.
6. Validar score baixo/remédios.
7. Validar exportação PDF.
8. Verificar responsividade.

### Critérios de aceite

- `lint`, `build` e `test` passam.
- O fluxo atual de eletivas não regrediu.
- Falha na IA não apaga o veredito.
- Falha no PDF não apaga o protocolo.
- O mobile não quebra layout.

### Comandos de validação

```bash
npm run lint
npm run test
npm run build
npm run dev:safe
```

### Testes necessários

- Regressão do veredito antigo.
- Prompt com cinco blocos.
- Fallback de correspondências ausentes.
- Smoke do PDF.
- API `elective_magic`.

### Riscos

- E2E depender de ambiente ou autenticação.
- Testes antigos revelarem dívida não relacionada.

### O que NÃO deve ser alterado

- Não refatorar arquivos grandes por estética.
- Não mudar config de lint/test/build para “passar”.
- Não expandir escopo para problemas fora do Grimório Vivo.

## 9.1 Pausa forte E - Revisão final

### Quando parar

Após a Sprint 6, antes de documentar e entregar.

### O que revisar com modelo mais forte

- regressões de cálculo;
- privacidade;
- fluxo manual completo;
- responsividade;
- escopo negativo;
- qualidade final da integração UI/IA/PDF.

### Só entregar se

- `npm run lint`, `npm run test` e `npm run build` passarem;
- o fluxo prosperidade/Júpiter estiver correto;
- o PDF gerar;
- nada fora do MVP tiver entrado por acidente.

## 10. Sprint 7 - Documentação mínima e handoff

### Objetivo

Registrar o comportamento entregue e os limites do MVP para evitar expansão implícita de escopo.

### Arquivos prováveis a criar ou alterar

- `DOCS/modulo-eletiva.md`
- `DOCS/api-reference.md`, apenas se o contrato documentado mudar
- `docs/PRD-grimorio-vivo-consolidado.md`, apenas se houver decisão validada
- `README.md`, somente se a feature precisar aparecer ali

### Tarefas em ordem

1. Documentar score normalizado e threshold de remédios.
2. Documentar que `NatalChart` não altera a pontuação no MVP.
3. Documentar os campos de contexto ritual usados por UI, IA e PDF.
4. Documentar o fluxo manual de validação.
5. Registrar explicitamente os não-escopos mantidos.

### Critérios de aceite

- A documentação reflete o comportamento entregue.
- Não há promessa de agenda, banco, marketplace ou editor de PDF.
- Outro agente entende o que foi feito e o que ficou fora.

### Comandos de validação

```bash
npm run lint
npm run test
npm run build
```

### Riscos

- Atualizar o PRD como se fosse especificação futura em vez de espelho do estado entregue.

### O que NÃO deve ser alterado

- Não reescrever documentação inteira.
- Não mexer em `SPEC.md` sem necessidade clara.
- Não ampliar escopo.

## 11. Ordem de execução recomendada

Executar na sequência:

1. Sprint 0 - Preparação
2. Sprint 1 - Contratos
3. Pausa forte A
4. Sprint 2 - Engine e veredito
5. Pausa forte B
6. Sprint 3 - Prompt IA
7. Pausa forte C
8. Sprint 4 - UI
9. Pausa forte D
10. Sprint 5 - PDF
11. Sprint 6 - Testes e regressão
12. Pausa forte E
13. Sprint 7 - Documentação

Essa ordem evita duplicação de lookup entre engine, UI e PDF. Primeiro fechamos contrato e veredito; depois damos voz à IA; depois mostramos na interface; por fim exportamos o mesmo conteúdo.

## 12. Checklist de validação geral

- `npm run lint`
- `npm run test`
- `npm run build`
- fluxo manual:
  - abrir Eletiva Mágica;
  - escolher intenção de prosperidade/Júpiter;
  - confirmar Bethor, Chesed, Sachiel e Hino Órfico quando disponíveis;
  - gerar IA e verificar os cinco blocos;
  - testar score baixo e card de remédios;
  - exportar PDF.
- responsividade:
  - desktop e mobile;
  - cards sem sobreposição;
  - checklist legível.
- regressões:
  - sky-only sem mapa natal;
  - sky-plus-natal com mapa natal;
  - salvamento existente de eletiva;
  - Time Machine;
  - `/api/report` em modos não eletivos;
  - nenhuma chave exposta no frontend.

## 13. Pontos que exigem modelo mais forte

- Definir a fórmula exata de normalização do score se os testes mostrarem distribuição ruim.
- Rever qualquer alteração que toque cálculo astrológico tradicional, dignidades ou aspectos.
- Avaliar a qualidade final dos prompts contra alucinação ritual.
- Revisar segurança e privacidade do envio de contexto natal para IA.
- Revisar o visual do PDF e da UI em mobile.
- Investigar falhas de build envolvendo `@react-pdf/renderer` e Next.js 16.
- Decidir mudanças fora do MVP, como persistência de checklist, profundidade do PDF e nome público final.

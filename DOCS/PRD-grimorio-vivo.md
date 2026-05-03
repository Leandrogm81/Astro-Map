# PRD — Grimorio Vivo

## 1. Resumo executivo

O Grimorio Vivo e uma evolucao do modulo de Eletiva Magica do AstroMap. Ele transforma o veredito eletivo atual em um protocolo ritualistico pratico, combinando astrologia tradicional, correspondencias planetarias, cabala hermetica, hierarquias angelicas e exportacao em PDF com estetica de grimorio antigo.

O produto deve ajudar o usuario a sair de uma leitura tecnica do ceu para um guia operacional: quando realizar a operacao, quais forcas invocar, quais materiais usar, quais remedios astrologicos aplicar quando o ceu estiver debilitado e como registrar/exportar o protocolo final.

Estado atual preservado: a camada de dados de correspondencias magicas em `src/lib/traditional/magic-correspondences.ts` ja foi expandida para incluir Espiritos Olimpicos, remedios, Hinos Orficos, hierarquias angelicas e relacao com Sephiroth. O PRD considera essa decisao como tomada e nao solicita redesenho dessa camada.

## 2. Objetivo do produto

O objetivo principal e expandir o modulo de eletivas para uma ferramenta de operacoes magicas guiadas, mantendo a precisao astrologica do AstroMap e adicionando uma camada pratica de preparacao ritual.

Resultado esperado:

- O usuario seleciona uma intencao ritual e consulta uma janela eletiva.
- O sistema calcula o veredito tecnico com base no ceu e, quando aplicavel, no mapa natal.
- O sistema associa o planeta regente a correspondencias hermeticas e cabalisticas.
- O sistema sugere remedios quando a condicao eletiva estiver abaixo do limiar definido.
- A IA gera um "Protocolo Ritual" estruturado, sem resposta livre ou vaga.
- O usuario visualiza materiais, entidades, nomes e etapas em interface clara.
- O usuario exporta o protocolo como PDF com aparencia de grimorio antigo, premium e legivel.

## 3. Problema a resolver

O modulo atual de Eletiva Magica fornece pontuacao e interpretacao, mas ainda exige que o usuario traduza manualmente o veredito em pratica ritual. Isso cria tres problemas:

- A decisao tecnica nao vira automaticamente um plano de acao.
- Correspondencias tradicionais, angelicas e cabalisticas ficam dispersas.
- Usuarios precisam montar manualmente materiais, invocacoes, remedios e registro ritual.

A oportunidade e integrar essas camadas em um fluxo unico: diagnostico astrologico, prescricao ritual e exportacao documental.

## 4. Publico-alvo e personas

| Persona | Necessidade principal |
| --- | --- |
| Praticante de magia ritualistica | Transformar uma eletiva em protocolo pratico com materiais, invocacao e finalizacao |
| Astrologo tradicional | Avaliar se o ceu suporta uma operacao e justificar tecnicamente o veredito |
| Estudante de hermetismo | Aprender correspondencias entre planeta, Sephirah, anjo, hino, remedio e pratica |
| Usuario avancado do AstroMap | Exportar um guia ritual completo, bonito e reutilizavel |

## 5. Escopo do MVP

O MVP deve entregar apenas a primeira versao funcional do Grimorio Vivo dentro do modulo de eletiva existente.

Inclui:

1. Uso das correspondencias ja expandidas em `magic-correspondences.ts`.
2. Ajuste do engine de eletiva para aceitar opcionalmente `NatalChart`.
3. Inclusao de contexto ritual no resultado da eletiva, com planeta, Sephirah, anjo, Espirito Olimpico, remedios e Hino Orfico quando disponiveis.
4. Sugestao de remedios quando a pontuacao ficar abaixo do limiar definido.
5. Atualizacao dos prompts de IA para exigir output estruturado em "Protocolo Ritual".
6. Atualizacao do `TraditionalElectivePanel.tsx` para exibir:
   - card de remedios astrologicos;
   - correspondencias cabalisticas e angelicas;
   - checklist de materiais no Codice Hermetico;
   - botao de exportacao PDF.
7. Criacao do componente `ElectiveGrimoirePDF.tsx` para renderizar o PDF.
8. Verificacao manual dos cenarios descritos no plano original.

## 6. Fora de escopo

Nao implementar agora:

| Item | Motivo |
| --- | --- |
| Redesenho completo do modulo de eletiva | O pedido e expansao do fluxo existente, nao substituicao |
| Novo sistema de agenda, calendario ou booking ritual | Nao solicitado |
| Marketplace de materiais, pedras, ervas ou fornecedores | Fora do objetivo do produto |
| Pagamentos, assinatura ou paywall | Nao solicitado |
| Edicao manual avancada do PDF antes da exportacao | A primeira versao exporta o protocolo gerado |
| Banco de dados para salvar grimorios | Nao solicitado no plano fonte |
| Criacao de novas fontes de dados externas para efemerides | O AstroMap ja usa seu stack astrologico existente |
| Geracao de sigilos graficos automaticos | O plano menciona precisao de nomes e sigilos via texto, nao desenho/geracao |
| Alterar regras astrais centrais sem teste de regressao | Risco alto de regressao de dominio |
| Expandir remedios alem de pedras, plantas e banhos ja previstos | Evita inflar escopo |

## 7. Funcionalidades principais

### 7.1 Contexto ritual enriquecido

**Objetivo:** anexar ao veredito eletivo as correspondencias magicas relevantes para a intencao escolhida.

**Comportamento esperado:**

- Ao calcular uma eletiva, o sistema identifica o planeta regente da intencao.
- O sistema recupera as correspondencias planetarias ja cadastradas.
- O resultado disponibiliza dados para UI, prompt de IA e PDF.

**Regras:**

- A fonte primaria das correspondencias deve ser `magic-correspondences.ts`.
- A Sephirah deve usar a tipagem existente `SephirahName`.
- Dados ausentes devem ser tratados com fallback visual/textual, sem quebrar a tela.
- O sistema nao deve inventar correspondencias em tempo de execucao.

**Criterios de aceite:**

- Para intencao de prosperidade associada a Jupiter, o sistema exibe Bethor e Chesed quando esses dados estiverem cadastrados.
- Para cada planeta suportado, o veredito consegue expor ao menos as correspondencias disponiveis na camada de dados.
- Se uma correspondencia opcional estiver ausente, a UI continua funcional e nao mostra `undefined`, `null` ou erro tecnico.

### 7.2 Engine de eletiva com suporte opcional a mapa natal

**Objetivo:** permitir que `getElectiveVeredict` considere `NatalChart` quando fornecido, sem quebrar o modo atual de ceu somente.

**Comportamento esperado:**

- O modo ceu somente continua funcionando como antes.
- Quando houver `NatalChart`, o engine pode enriquecer o contexto do veredito com relacoes natais relevantes.
- A assinatura e o contrato devem ser claros para o agente implementador.

**Regras:**

- `NatalChart` e opcional.
- A ausencia de `NatalChart` nao deve alterar o comportamento atual esperado do modo `sky_only`.
- Qualquer nova regra de pontuacao envolvendo mapa natal deve ser explicita e testavel.

**Criterios de aceite:**

- Chamadas existentes sem `NatalChart` continuam passando nos testes.
- Chamadas com `NatalChart` nao causam erro de tipo nem erro em runtime.
- O objeto de retorno contem contexto suficiente para prompts, UI e PDF consumirem as correspondencias.

### 7.3 Remedios astrologicos

**Objetivo:** sugerir pedras, plantas e banhos quando a eletiva estiver debilitada.

**Comportamento esperado:**

- Quando o score estiver abaixo do limiar definido, a UI mostra um card de remedios astrologicos.
- Os remedios devem estar relacionados ao planeta/intencao principal.
- A IA deve receber os remedios como contexto para o Protocolo Ritual.

**Regras:**

- O limiar original informado e `score < 70`.
- Se a escala atual do engine nao for 0-100, a implementacao deve resolver o ponto de decisao antes de codar.
- Remedios nao devem ser exibidos como garantia de resultado; devem ser apresentados como compensacao/suporte simbolico.
- Nao sugerir remedios medicos, ingestao de substancias ou promessas terapeuticas.

**Criterios de aceite:**

- Quando o score fica abaixo do limiar acordado, o card de remedios aparece.
- Quando o score fica igual ou acima do limiar acordado, o card pode ficar oculto ou marcado como nao necessario.
- O card lista no minimo categorias para pedras, plantas e banhos quando houver dados.
- O texto nao faz alegacoes medicas.

### 7.4 Anjo do dia/hora e entidades planetarias

**Objetivo:** incluir nomes angelicos e espirituais relevantes no contexto ritual.

**Comportamento esperado:**

- O veredito inclui o Anjo do Dia/Hora quando a regra de lookup estiver disponivel.
- O veredito inclui Espirito Olimpico do planeta regente.
- Quando disponivel, inclui angel, intelligence e spirit associados a hierarquias de Agrippa/Heptameron.

**Regras:**

- O sistema nao deve inventar nomes fora da base cadastrada.
- Nomes devem ser exibidos como dados tradicionais/esotericos, nao como fatos empiricos verificaveis.
- A origem do Anjo do Dia/Hora deve ser consistente com a base de Shemhamphorash existente ou definida.

**Criterios de aceite:**

- Para Jupiter/prosperidade, Bethor aparece quando cadastrado.
- O prompt de IA recebe os nomes disponiveis em campos estruturados.
- A UI nao quebra quando o anjo especifico nao puder ser determinado.

### 7.5 Protocolo Ritual via IA

**Objetivo:** substituir respostas interpretativas soltas por um output estruturado e acionavel.

**Comportamento esperado:**

O prompt `ELECTIVE_MAGIC` deve exigir resposta com cinco blocos:

1. Veredito Tecnico: dignidade, seita, hora/dia planetario e condicao lunar quando disponiveis.
2. Preparacao: altar, materiais, cores, incensos, pedras, plantas e banhos aplicaveis.
3. Invocacao: Hino Orfico, nomes divinos/angelicos e entidades tradicionais disponiveis.
4. Acao Magica: passos praticos do ritual.
5. Finalizacao: licenca para partir e caridade planetaria.

**Regras:**

- A IA deve usar os dados fornecidos pelo sistema como fonte de verdade.
- A IA nao deve inventar dados ausentes como se fossem confirmados.
- O output deve ser legivel em UI e PDF.
- O texto deve respeitar seguranca: sem instrucoes perigosas, ilegais, medicas ou coercitivas.

**Criterios de aceite:**

- Ao gerar insight para prosperidade/Jupiter, o Protocolo Ritual inclui o Hino Orfico de Jupiter quando esse dado existir.
- A resposta da IA contem os cinco blocos obrigatorios.
- A resposta nao expande o escopo para servicos externos, compras ou garantias de resultado.

### 7.6 UI do Grimorio Vivo no painel de eletiva

**Objetivo:** tornar o protocolo ritual visivel e executavel dentro do `TraditionalElectivePanel.tsx`.

**Comportamento esperado:**

- A tela existente recebe secoes novas sem quebrar o fluxo atual.
- O usuario visualiza remedios, correspondencias de Cabala, anjo, Espirito Olimpico e checklist de materiais.
- O botao de PDF fica disponivel quando houver dados suficientes para exportar.

**Regras:**

- Manter a estetica Infinity existente.
- Evitar cards redundantes ou excesso visual.
- Estados vazios, loading e erro devem ser tratados.
- O botao de exportacao nao deve aparecer como ativo se nao houver protocolo ou veredito minimo.

**Criterios de aceite:**

- O card de remedios aparece no cenario de score baixo.
- O Codice Hermetico mostra checklist de materiais.
- Correspondencias de Sephirah e Anjo aparecem integradas a visao planetaria.
- A UI continua responsiva em mobile e desktop.

### 7.7 Exportacao PDF "Grimorio Antigo"

**Objetivo:** permitir que o usuario exporte o protocolo final em PDF com aparencia classica, premium e legivel.

**Comportamento esperado:**

- O usuario aciona "Exportar PDF (Grimorio)".
- O sistema renderiza um PDF com estrutura de capitulo de grimorio.
- O PDF contem veredito, correspondencias, materiais, invocacao, acao magica, finalizacao e remedios quando aplicaveis.

**Regras:**

- Usar `@react-pdf/renderer`, conforme plano original.
- O componente previsto e `src/components/traditional/ElectiveGrimoirePDF.tsx`.
- Estetica antiga nao pode sacrificar legibilidade.
- Nao incluir dados sensiveis alem do necessario para o protocolo.

**Criterios de aceite:**

- O PDF e gerado sem erro em ambiente local.
- O PDF contem os dados principais do protocolo.
- O layout e visualmente consistente com "grimorio antigo" e permanece legivel.
- A exportacao funciona no fluxo manual de teste.

## 8. Funcionalidades secundarias

Recursos uteis, mas nao essenciais para o MVP:

- Ajustes finos de layout visual do PDF.
- Agrupamento de remedios por severidade da debilidade.
- Indicacao textual de "remedio recomendado" versus "remedio opcional".
- Tooltip ou microcopy explicando Sephirah, Espirito Olimpico e Hino Orfico.
- Selo visual de completude do protocolo.
- Exportacao com nome de arquivo padronizado por data/intencao.

## 9. Fluxos de usuario

### 9.1 Fluxo principal: gerar protocolo ritual

1. Usuario acessa o modulo de Eletiva Magica.
2. Usuario seleciona uma intencao ritual.
3. Usuario informa ou utiliza data, hora e local ja definidos no fluxo existente.
4. Sistema calcula o veredito eletivo.
5. Sistema recupera correspondencias planetarias e cabalisticas.
6. Sistema avalia se remedios devem ser sugeridos.
7. Usuario solicita ou visualiza o insight de IA.
8. IA retorna Protocolo Ritual estruturado.
9. UI exibe veredito, correspondencias, remedios e checklist.
10. Usuario decide executar a pratica ou exportar o PDF.

### 9.2 Fluxo secundario: exportar grimorio

1. Usuario gera ou possui um veredito/protocolo valido.
2. Usuario clica em "Exportar PDF (Grimorio)".
3. Sistema monta o PDF com dados estruturados.
4. Usuario recebe o arquivo exportado.
5. Em caso de erro, sistema informa falha sem perder o veredito na tela.

### 9.3 Fluxo com score baixo

1. Usuario calcula uma eletiva.
2. Sistema identifica score abaixo do limiar.
3. UI exibe card de remedios astrologicos.
4. IA inclui remedios na preparacao ou mitigacao do protocolo.
5. PDF inclui remedios na secao correspondente.

## 10. Telas e componentes

### 10.1 Tela: TraditionalElectivePanel

Elementos existentes preservados:

- Seletor de intencao.
- Dados do ceu/eletiva.
- Veredito tecnico.
- Codice Hermetico.
- Geracao de insight/relatorio.

Novos elementos MVP:

- Card "Remedios Astrologicos".
- Secao de correspondencias cabalisticas: Sephirah e Anjo.
- Exibicao do Espirito Olimpico.
- Checklist de materiais no Codice Hermetico.
- Botao "Exportar PDF (Grimorio)".
- Estados de indisponibilidade quando dados ainda nao foram gerados.

### 10.2 Componente: ElectiveGrimoirePDF

Elementos esperados:

- Capa ou cabecalho com intencao e data da eletiva.
- Veredito tecnico.
- Correspondencias planetarias e cabalisticas.
- Materiais/checklist.
- Preparacao ritual.
- Invocacao.
- Acao magica.
- Finalizacao.
- Remedios astrologicos, quando aplicaveis.

### 10.3 Prompt/relatorio de IA

Elemento logico, sem tela propria:

- Prompt `ELECTIVE_MAGIC` atualizado.
- Output em cinco blocos obrigatorios.
- Uso dos dados estruturados do veredito como contexto.

## 11. Dados e entidades

### 11.1 PlanetaryCorrespondence

Campos provaveis, considerando decisao ja tomada:

- `planet`: planeta tradicional.
- `colors`: cores associadas.
- `incenses`: incensos.
- `metals`: metais.
- `olympicSpirit`: Espirito Olimpico.
- `remedies`: conjunto de pedras, plantas e banhos.
- `orphicHymn`: titulo e temas do Hino Orfico.
- `angel`: nome angelico associado.
- `intelligence`: inteligencia planetaria.
- `spirit`: espirito planetario.
- `sephirah`: nome tipado via `SephirahName`.
- outros campos ja existentes no modulo de correspondencias.

### 11.2 ElectiveVeredict

Campos conceituais relevantes:

- `score`: pontuacao do momento.
- `status` ou classificacao equivalente: propicio, neutro, desafiador.
- `purpose`: intencao ritual.
- `rulingPlanet`: planeta regente.
- `planetaryHour`: hora planetaria.
- `planetaryDay`: dia planetario.
- `moonAssessment`: condicao lunar.
- `dignityAssessment`: dignidade do regente e/ou Lua.
- `ritualContext`: novo agrupamento conceitual para correspondencias.
- `remedyRecommendations`: remedios sugeridos quando aplicavel.

### 11.3 RitualContext

Entidade conceitual para consumo por UI, IA e PDF:

- `planet`.
- `sephirah`.
- `angel`.
- `olympicSpirit`.
- `intelligence`.
- `spirit`.
- `orphicHymn`.
- `materials`.
- `remedies`.
- `charity`.

### 11.4 NatalChart

Entidade existente no AstroMap:

- Deve ser opcional para o engine de eletiva.
- Quando presente, pode enriquecer analise e contexto.
- Nao deve ser requisito para o modo ceu somente.

### 11.5 GrimoirePDFDocument

Entidade conceitual para exportacao:

- `title`.
- `intention`.
- `dateTime`.
- `location`, se disponivel e apropriado.
- `technicalVerdict`.
- `ritualProtocol`.
- `correspondences`.
- `remedies`.
- `materialsChecklist`.

## 12. Regras de negocio

1. A fonte de verdade para correspondencias magicas e `magic-correspondences.ts`.
2. O sistema deve sugerir remedios somente quando a pontuacao estiver abaixo do limiar acordado.
3. O limiar informado no plano original e `score < 70`.
4. Se o engine atual usa outra escala de score, a escala deve ser normalizada ou confirmada antes da implementacao.
5. `NatalChart` e opcional e nao pode quebrar o fluxo sem mapa natal.
6. A IA deve receber dados estruturados e seguir os cinco blocos do Protocolo Ritual.
7. A IA nao deve inventar correspondencias ausentes.
8. O PDF deve exportar o protocolo visivel/gerado, nao uma versao divergente.
9. Remedios astrologicos devem ser apresentados como suporte simbolico/tradicional, nao como aconselhamento medico.
10. Dados sensiveis de nascimento nao devem ser enviados a servicos externos sem consentimento explicito.
11. O `OPENROUTER_API_KEY` deve permanecer somente no backend/proxy existente.
12. O sistema deve preservar o comportamento atual de eletivas quando a nova camada ritual nao tiver dados.
13. Se uma correspondencia estiver indisponivel, a UI deve ocultar ou marcar como indisponivel, nunca exibir erro tecnico.

## 13. Permissoes e papeis de usuario

MVP:

- Nao ha novos papeis de usuario.
- Qualquer usuario que acessa o modulo de Eletiva Magica pode gerar o protocolo e exportar PDF, seguindo as restricoes atuais do AstroMap.

Restricoes:

- O sistema nao deve expor chaves de API no frontend.
- Dados de nascimento e dados natais devem ser tratados como sensiveis.
- Caso futuramente exista autenticacao ou historico salvo, permissoes deverao ser revisitadas.

## 14. Integracoes

### Internas

- `src/lib/traditional/magic-correspondences.ts`: correspondencias planetarias.
- `src/lib/traditional/elective.ts`: engine de veredito.
- `src/lib/aiPrompts.ts`: prompts e formatacao de contexto para IA.
- `src/components/traditional/TraditionalElectivePanel.tsx`: UI principal.
- `src/components/traditional/ElectiveGrimoirePDF.tsx`: PDF.
- Modulo de Kabbalah: uso de `SephirahName` e dados relacionados quando disponiveis.

### Externas

- OpenRouter via rota backend existente `/api/report`, se esse for o fluxo atual de IA.
- `@react-pdf/renderer` para exportacao PDF.
- Bibliotecas astrologicas existentes do AstroMap, incluindo `astronomy-engine` quando aplicavel ao calculo de eletiva.

### Nao previstas no MVP

- Pagamentos.
- Banco de dados.
- Autenticacao nova.
- APIs externas de materiais, ervas, imagens ou fornecedores.

## 15. Requisitos nao funcionais

### Desempenho

- A expansao de contexto nao deve tornar o calculo de eletiva perceptivelmente lento.
- A geracao de PDF deve ocorrer sem travar permanentemente a UI.
- O prompt enviado para IA deve ser estruturado e conciso para controlar custo e latencia.

### Responsividade

- UI deve funcionar em desktop e mobile.
- Cards novos nao devem quebrar layout ou empurrar conteudo critico para fora da tela.
- Checklist e remedios devem ser escaneaveis em telas pequenas.

### Seguranca e privacidade

- Nao expor `OPENROUTER_API_KEY` no frontend.
- Nao enviar dados natais desnecessarios para IA.
- Nao registrar dados sensiveis em logs permanentes.
- Nao sugerir remedios com alegacoes medicas.

### Manutenibilidade

- Manter mudancas cirurgicas nos arquivos previstos.
- Evitar duplicacao de correspondencias fora da fonte de verdade.
- Preferir tipos explicitos e contratos claros.
- Nao introduzir `any`.

### Acessibilidade

- Botao de exportacao deve ser acessivel por teclado.
- Cards e listas devem ter contraste adequado.
- Estados de loading/erro devem ser comunicados visualmente.
- Texto do PDF deve priorizar legibilidade.

### Confiabilidade

- Falhas na IA nao devem impedir exibicao do veredito tecnico.
- Falhas no PDF nao devem apagar o protocolo da UI.
- Dados opcionais ausentes nao devem quebrar renderizacao.

## 16. Criterios de aceite gerais

O produto esta pronto quando:

1. A camada de dados expandida e consumida por engine, UI, prompt e PDF sem duplicacao.
2. `getElectiveVeredict` aceita `NatalChart` opcional sem regressao do modo atual.
3. Score baixo dispara remedios astrologicos conforme limiar acordado.
4. A UI mostra card de remedios, checklist de materiais, Sephirah, Anjo e Espirito Olimpico quando disponiveis.
5. O prompt de IA gera Protocolo Ritual com os cinco blocos obrigatorios.
6. O cenario "Prosperidade" mostra Jupiter/Bethor/Chesed quando os dados estiverem cadastrados.
7. O Protocolo Ritual de Jupiter inclui Hino Orfico de Jupiter quando disponivel.
8. O PDF e gerado com estetica de grimorio antigo e permanece legivel.
9. Estados sem dados, loading e erro sao tratados sem quebrar a tela.
10. `npm run lint`, `npm run build` e `npm run test` passam antes da entrega de codigo.
11. Nenhuma chave, segredo ou dado sensivel e exposto.
12. O comportamento existente do modulo de eletiva continua funcionando.

## 17. Riscos e mitigacao

| Risco | Tipo | Impacto | Mitigacao |
| --- | --- | --- | --- |
| Escala de score ambigua (`<70` vs escala atual) | Tecnico/produto | Remedios podem aparecer no momento errado | Resolver ponto de decisao antes de implementar a regra |
| IA inventar correspondencias | Produto | Perda de confianca e inconsistencia tradicional | Prompt deve instruir uso exclusivo dos dados fornecidos |
| PDF bonito mas ilegivel | Produto/UI | Exportacao perde valor pratico | Validar manualmente contraste, hierarquia e tamanho de fonte |
| Mudanca no engine causar regressao em eletivas atuais | Tecnico | Quebra de fluxo central | Testes de regressao para modo sem `NatalChart` |
| Excesso de informacao na UI | Produto | Usuario se perde no fluxo | Priorizar agrupamento por veredito, remedios, correspondencias e checklist |
| Dados opcionais ausentes causarem erro | Tecnico | Quebra de tela/PDF | Fallbacks e renderizacao condicional |
| Sugestoes de remedios parecerem conselho medico | Produto/legal | Risco de interpretacao indevida | Linguagem simbolica/tradicional, sem claims terapeuticos |
| Envio excessivo de dados natais para IA | Privacidade | Exposicao desnecessaria | Enviar apenas campos necessarios ao protocolo |
| Dependencia de `@react-pdf/renderer` gerar incompatibilidade | Tecnico | Exportacao falha | Isolar componente PDF e validar build |

## 18. Metricas de sucesso

MVP:

- Usuario consegue gerar um Protocolo Ritual completo para pelo menos uma intencao principal.
- Cenario manual de prosperidade/Jupiter passa com correspondencias corretas.
- PDF e gerado com sucesso em ambiente local.
- Nenhuma regressao detectada no fluxo atual de eletiva.

V1:

- Maior parte das intencoes rituais cadastradas produz protocolo completo sem lacunas criticas.
- Usuarios conseguem entender rapidamente materiais, entidades e passos.
- Reducao de respostas de IA vagas ou sem estrutura.

Futuro:

- Aumento de uso da exportacao PDF.
- Reuso de protocolos em sessoes posteriores, se historico for implementado.
- Feedback qualitativo positivo sobre clareza e utilidade ritual.

## 19. Pontos de decisao pendentes

1. **Escala do score:** o plano original usa `score < 70`, mas a documentacao existente do modulo de eletiva descreve niveis em escala menor. Decidir se a nova regra normaliza para 0-100 ou se o limiar deve ser adaptado.
2. **Regra exata do Anjo do Dia/Hora:** confirmar a fonte e o algoritmo de lookup do Shemhamphorash para dia/hora, caso ainda nao exista implementado.
3. **Profundidade do uso de `NatalChart`:** decidir se o MVP apenas passa o mapa como contexto ou se altera pontuacao/regras tecnicas.
4. **Conteudo minimo do PDF:** confirmar se o PDF precisa incluir capa completa ou apenas cabecalho estilo grimorio no MVP.
5. **Linguagem de seguranca para remedios:** confirmar texto padrao de disclaimer simbolico/tradicional.
6. **Nome final do produto:** confirmar se "Grimorio Vivo" sera o nome publico da funcionalidade ou apenas nome interno.
7. **Disponibilidade do botao PDF:** decidir se fica visivel sempre desabilitado ate haver protocolo ou se aparece somente apos geracao.

## 20. Resumo para o agente de implementacao

Implementar o Grimorio Vivo como expansao do modulo de Eletiva Magica, sem redesenhar o produto.

Arquivos previstos:

- `src/lib/traditional/elective.ts`: aceitar `NatalChart` opcional, montar contexto ritual e sugerir remedios quando score estiver abaixo do limiar decidido.
- `src/lib/aiPrompts.ts`: atualizar `ELECTIVE_MAGIC` para exigir Protocolo Ritual em cinco blocos.
- `src/components/traditional/TraditionalElectivePanel.tsx`: exibir remedios, correspondencias cabalisticas/angelicas, checklist de materiais e botao PDF.
- `src/components/traditional/ElectiveGrimoirePDF.tsx`: criar componente PDF com estetica de grimorio antigo usando `@react-pdf/renderer`.

Nao alterar:

- Nao reescrever a camada de dados ja expandida salvo correcoes pontuais necessarias.
- Nao criar banco, autenticacao, pagamentos, marketplace, historico salvo ou calendario.
- Nao inventar correspondencias ausentes.

Validacao minima:

- Testar prosperidade/Jupiter e confirmar Jupiter/Bethor/Chesed.
- Gerar insight e confirmar os cinco blocos do Protocolo Ritual.
- Confirmar Hino Orfico de Jupiter quando disponivel.
- Gerar PDF e validar legibilidade.
- Rodar `npm run lint`, `npm run build` e `npm run test`.

## Diferenciacao MVP, V1 e melhorias futuras

### MVP

- Consumir correspondencias existentes.
- Gerar contexto ritual no veredito.
- Exibir remedios para score baixo.
- Atualizar prompt de IA para Protocolo Ritual.
- Exibir cards/checklist no painel.
- Exportar PDF basico premium/legivel.

### V1

- Refinar uso do `NatalChart` com regras explicitas de personalizacao.
- Melhorar organizacao visual do protocolo.
- Padronizar nome de arquivo do PDF.
- Adicionar microcopy para termos hermeticos.
- Cobrir mais intencoes com verificacoes manuais.

### Melhorias futuras

- Historico de grimorios salvos.
- Edicao manual do protocolo antes de exportar.
- Comparacao entre janelas eletivas.
- Exportacao em outros formatos.
- Geracao/associacao visual de sigilos, se solicitada.
- Calendario ritual ou agenda.

## Checklist de qualidade do PRD

- [x] Escopo claro.
- [x] Regras claras.
- [x] Criterios de aceite claros.
- [x] Telas definidas.
- [x] Dados definidos.
- [x] Riscos mapeados.
- [x] Fora de escopo definido.
- [x] Pronto para virar plano de implementacao.

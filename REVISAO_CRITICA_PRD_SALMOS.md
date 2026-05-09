# Revisão Crítica do PRD

## Resumo da avaliação

O PRD tem boa intenção de produto e cobre as features principais, mas ainda não está pronto para virar plano de implementação sem retrabalho. O maior risco é um coder precisar adivinhar a chave de identificação do salmo, a estrutura real do banco e o contrato da busca IA, o que tende a gerar implementação inconsistente.

## Achados críticos

- **CRÍTICO**: A identificação do salmo está inconsistente entre `id`, `numero` e a rota `/salmos/[id]`. O PRD define `salmos.id` como `uuid`, mas os fluxos e a tela interna usam `id` na URL e tratam o salmo como número. Correção: definir uma chave canônica para navegação pública, como `numero` ou `slug`, e separar explicitamente isso do `uuid` interno usado nas FKs.

- **CRÍTICO**: O modelo de dados está incompleto para as telas e comportamentos descritos. A seção de entidades só lista `salmos`, `user_salmos_favoritos` e `salmos_diario`, mas a UI e as regras exigem campos e relações que não aparecem, como `title`, `nome_divino_hebraico`, `salmos_propositos`, `salmos_elementos`, `salmos_fontes` e `salmos_condicoes_astro`. Correção: expandir o dicionário de dados com colunas, tabelas relacionadas e cardinalidades, ou remover do PRD tudo que não estiver modelado.

- **CRÍTICO**: O contrato da busca inteligente com IA está ambíguo demais. O PRD diz para usar OpenRouter e retornar apenas IDs, mas não define payload de entrada, formato exato da resposta, número máximo de resultados, ordenação, deduplicação, nem o que acontece quando a busca local encontra parcialmente algo. Correção: especificar um contrato JSON fechado para request e response, incluindo fallback, ranking e formato de erro.

- **CRÍTICO**: O diário de práticas não tem semântica de persistência bem definida. O PRD diz que o usuário pode salvar e editar notas e vê-las no próximo acesso, mas a entidade `salmos_diario` só mostra `anotacao` e timestamps, sem dizer se existe uma nota por salmo, várias notas por salmo, histórico versionado ou edição de uma única linha. Correção: declarar a cardinalidade exata do diário e a regra de update, inclusão, ordenação e exclusão.

## Achados importantes

- **IMPORTANTE**: A regra do “Salmo do Dia” permite interpretações diferentes demais. O PRD aceita seleção “randômica ou fixa (ciclo semanal)” e não define o comportamento quando houver vários salmos para o mesmo planeta ou nenhum salmo correspondente. Correção: escolher um único algoritmo e definir fallback para ausência de match.

- **IMPORTANTE**: O fluxo de autenticação está incompleto. O PRD diz que usuários anônimos devem ver CTA de login e que o botão só funciona com `session != null`, mas não define em qual momento redirecionar, qual rota usar, nem se leitura do salmo detalhado é pública com ações bloqueadas. Correção: especificar UX e proteção de rota para leitura, favoritar e diário.

- **IMPORTANTE**: A segurança está explicitada só parcialmente. O PRD menciona RLS para o diário, mas não faz a mesma exigência explícita para favoritos, apesar de eles também serem dados por usuário. Correção: declarar RLS e restrição por `user_id = auth.uid()` para ambas as tabelas, com unicidade contra duplicados.

- **IMPORTANTE**: A ordem da busca está indefinida. O PRD fala em tags, palavras-chave e IA, mas não define a precedência entre `tags`, `intencao`, correspondências por número e fallback para LLM. Correção: descrever a pipeline de busca em passos fixos.

- **IMPORTANTE**: Os critérios de aceite estão fracos para estados críticos da interface. Eles não cobrem vazio, loading, erro, timeout, 404 de salmo inválido nem comportamento de sem resultados. Correção: incluir critérios objetivos para cada estado principal da experiência.

- **IMPORTANTE**: Há conflito entre o que o PRD pede e o que já existe na base sobre a tela de detalhes e a busca. O PRD diz que a tela usa só a tabela `salmos` via server component, mas a implementação atual já depende de relações e campos que o PRD não modela claramente. Correção: alinhar PRD e schema antes de delegar implementação.

## Achados opcionais

- **OPCIONAL**: As funcionalidades secundárias parecem fora do núcleo do MVP. Filtros por categoria e histórico completo do diário não têm suporte claro no modelo de dados nem regra de uso definida. Correção: mover para V1 ou detalhar fonte de dados e telas.

- **OPCIONAL**: As métricas de sucesso não têm plano de instrumentação. O PRD cita DAU, cliques e registros, mas não define eventos, nomes de tracking ou onde isso será coletado. Correção: anexar uma pequena especificação de analytics.

- **OPCIONAL**: Os “pontos de decisão pendentes” contradizem o checklist final. O documento afirma estar pronto para implementação, mas ainda deixa questões abertas sobre timeout, modal de IA e futuras mídias no diário. Correção: resolver essas pendências ou removê-las do corpo principal do PRD.

## Correções recomendadas

- Definir chave pública do salmo e padrão de URL sem ambiguidade.
- Completar o modelo de dados com todos os campos e relações usados nas telas.
- Especificar o contrato da busca IA, incluindo fallback, ranking e formato de resposta.
- Fechar a semântica do diário e dos favoritos, com cardinalidade e regras de update.
- Formalizar autenticação, RLS e estados de erro/vazio.
- Rebaixar para V1 tudo o que não for essencial ao MVP.

## Veredito final

**Não pronto**

O PRD ainda precisa de uma rodada de ajustes antes de virar plano de implementação sem alto risco de interpretação errada.

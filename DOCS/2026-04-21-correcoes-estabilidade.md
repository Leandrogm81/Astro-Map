# Correções de Estabilidade e Idioma - 2026-04-21

## Resumo

Nesta atualização foram feitos ajustes cirúrgicos para restaurar a estabilidade textual e visual do AstroMap:

- remoção completa de `qwen/qwen3-32b` dos pontos de seleção e do caminho de fallback;
- padronização do default para `google/gemini-2.5-flash-lite`;
- correção de textos PT-BR quebrados nos componentes de IA e exportação;
- reforço no layout do PDF para reduzir cortes, sobreposições e páginas subutilizadas;
- atualização das notas de estabilidade para evitar trocas de default sem validação.

## Pontos principais

- O endpoint `/api/report` passou a aceitar apenas os modelos ativos.
- Os seletores de relatório natal, tradicional e revolução solar continuam funcionais com os modelos aprovados.
- O PDF recebeu ajustes de espaçamento e colunas para melhorar a leitura em páginas longas.
- A documentação de estabilidade agora pede build e validação visual antes de consolidar mudanças em IA ou PDF.

## Validação esperada

- `npm run build`
- `npm run test`
- conferência visual do PDF gerado
- conferência de que o Qwen não aparece mais na UI

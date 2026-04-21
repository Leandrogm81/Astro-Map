# Correções de 21/04/2026

## Resumo

Hoje foram corrigidos quatro pontos principais no AstroMap:

- separação do fluxo de relatório IA natal vs. revolução solar;
- atualização e simplificação dos modelos da OpenRouter para três opções aprovadas;
- melhorias no PDF para reduzir cortes, sobreposição e textos truncados;
- ajustes de persistência e exibição para relatórios salvos.

## O que mudou

- O atalho `Relatório IA` do menu principal agora abre o relatório do mapa natal moderno de forma explícita.
- O modo de revolução solar continua disponível, mas somente no fluxo próprio da seção de revolução solar.
- A API de relatórios passou a respeitar `reportMode` e a montar prompts de forma explícita por contexto.
- A lista de modelos foi reduzida para:
  - `google/gemini-2.5-flash-lite`
  - `qwen/qwen3-32b`
  - `deepseek/deepseek-chat-v3.1`
- Os modelos antigos foram removidos do seletor e dos defaults internos.
- O PDF recebeu ajustes de layout para:
  - aumentar o espaço útil antes do rodapé;
  - corrigir o título do sumário para `Conteúdo do Dossiê`;
  - reduzir o risco de sobreposição em blocos de duas colunas;
  - melhorar o encaixe das tabelas e seções longas.

## Validação

- Os componentes alterados foram atualizados para usar o novo modelo padrão.
- O build local deve continuar validando o fluxo completo após os ajustes.
- O PDF foi preparado para reduzir cortes e manter o texto em PT-BR mais estável.

## Observações

- As mudanças foram feitas sem redesenhar a estrutura geral do app.
- A prioridade foi manter compatibilidade com os fluxos existentes, só corrigindo a intenção dos botões, os modelos e o layout do PDF.

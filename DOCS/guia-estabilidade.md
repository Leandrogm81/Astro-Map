# Guia de Estabilidade de Funções e Fluxos

## Objetivo

Este guia existe para evitar alterações desnecessárias em partes do AstroMap que já funcionam bem.  
A regra central é simples: **se algo está funcionando e já é usado em produção, só mexa com motivo claro, teste e validação visível**.

## Regras Práticas

1. **Não altere funções estáveis sem necessidade real**
   - Se a função já entrega o resultado esperado, trate-a como contrato.
   - Mudanças pequenas podem gerar regressões grandes em PDF, IA e persistência.

2. **Centralize a lógica em helpers estáveis**
   - Evite duplicar regra em vários componentes.
   - Se precisar mudar comportamento, ajuste o helper único e mantenha os chamadores finos.

3. **Use modos explícitos**
   - Não inferir comportamento por parâmetros opcionais quando houver mais de um fluxo.
   - Prefira algo como `mode: 'natal' | 'solar' | 'traditional'`.

4. **Uma mudança, uma intenção**
   - Não misture correção visual, refatoração e novo recurso no mesmo ajuste.
   - Mudanças pequenas são mais fáceis de validar e reverter.

5. **PDF e IA exigem validação extra**
   - Para PDF: rode build e confira visualmente o documento.
   - Para IA: confirme prompt, modelo, cache e persistência do relatório.

## Checklist Antes de Alterar Algo Que Já Funciona

- localizar onde a função é usada;
- verificar se existe teste cobrindo o comportamento;
- adicionar ou ajustar teste de regressão antes de mudar a lógica;
- rodar build;
- se for layout/PDF, gerar o artefato e inspecionar manualmente;
- confirmar que o comportamento antigo continua intacto.

## O que Evitar

- alterar default de modelo ou fluxo sem atualizar a interface e os testes;
- trocar texto, paginação ou espaçamento do PDF sem validar em mais de um caso;
- mudar lógica de relatório natal e solar no mesmo caminho sem modo explícito;
- fazer refatorações grandes em funções que já estão confiáveis.

## Regra de Ouro

Se uma função já está estável, **não mexa nela por curiosidade**.  
Mexa apenas quando houver:
- bug confirmado;
- requisito novo;
- melhoria documentada;
- teste novo que prove que nada importante foi quebrado.

## Nota de Consolidação

Defaults de IA e ajustes de PDF só devem ser consolidados depois de `build` e validação visual. Se uma troca altera o modelo padrão, o fluxo de geração ou o encaixe das páginas, trate como mudança de risco até a regressão ser comprovada.

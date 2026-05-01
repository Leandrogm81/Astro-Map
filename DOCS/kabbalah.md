# Kabbalah AstroMap

## Resumo

O módulo Kabbalah do AstroMap já está implementado e exposto na tab `kabbalah` da interface principal.

### Componentes

- `GematriaCalculator`: traduz nomes para hebraico, permite edição manual e calcula quatro sistemas de gematria.
- `GematriaResult`: exibe a decomposição letra a letra e a Sephirah dominante.
- `SephiroticTree`: renderiza a Árvore Sephirótica em SVG responsivo, com 22 caminhos, 11 nós e detalhes por clique.
- `KabbalahPDF`: exporta um PDF dedicado com resumo das leituras.
- `KabbalahView`: coordena Gematria, Árvore e exportação.

### Rotas

- `/api/translate`: faz a conversão server-side para hebraico sem expor credenciais.

### Fluxo

1. O usuário abre a tab `kabbalah`.
2. Digita um nome em qualquer idioma.
3. O app traduz para hebraico e calcula a gematria.
4. O usuário alterna para a Árvore Sephirótica para ver a projeção planetária.
5. O usuário pode exportar os dados em PDF.

### Garantias

- O módulo permanece isolado do núcleo tradicional.
- A exportação PDF tem fallback seguro para SSR e testes.
- O SVG usa `viewBox` para manter responsividade em mobile.

### Validação

- `npm run lint`
- `npm run build`
- `npm run test`

### Arquivos principais

- `src/lib/kabbalah/types.ts`
- `src/lib/kabbalah/constants.ts`
- `src/lib/kabbalah/gematria.ts`
- `src/lib/kabbalah/sephiroth.ts`
- `src/lib/kabbalah/shem72.ts`
- `src/lib/kabbalah/translate.ts`
- `src/lib/kabbalah/translateClient.ts`
- `src/components/kabbalah/GematriaCalculator.tsx`
- `src/components/kabbalah/GematriaResult.tsx`
- `src/components/kabbalah/SephiroticTree.tsx`
- `src/components/kabbalah/KabbalahPDF.tsx`
- `src/components/kabbalah/KabbalahView.tsx`
- `src/app/api/translate/route.ts`

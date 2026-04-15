# Guia de Manutenção: Sistema Infinity & PDF

Este documento serve como guia técnico para a manutenção e evolução do sistema de design **Infinity** e da estrutura de relatórios PDF do AstroMap.

## 1. Visão Geral (Estética Infinity)
A estética **Infinity** representa o "Padrão Ouro" da plataforma AstroMap (v2.0). Ela foi concebida para transformar relatórios de dados em um "Livro da Vida" premium, com foco total na legibilidade em mídia impressa e em uma experiência visual cinematográfica.

As premissas fundamentais são:
*   **Contraste Máximo**: Uso de fundo branco puro para garantir economia de tinta e clareza visual.
*   **Autoridade Astrológica**: Layouts que equilibram arte e dados técnicos de alta precisão.
*   **Escalabilidade**: Esta base deve ser herdada por todos os futuros módulos (ex: Sinastria, Trânsitos).

## 2. Tokens de Design e Branding
Para manter a consistência do sistema Infinity, as seguintes diretrizes de cores devem ser seguidas rigorosamente em todos os componentes de estilo do `react-pdf`:

*   **Azul Indigo Profundo (`#1E1B4B`)**: Utilizado para títulos de seção, cabeçalhos de tabela e textos de destaque. Representa autoridade, profundidade e o céu noturno.
*   **Astro Gold (`#D4AF37`)**: Utilizado para bordas de destaque, badges de força planetária e elementos decorativos de luxo. Representa exclusividade e o saber ancestral.
*   **Slate Blue (`#334155`)**: Cor padrão para o corpo do texto (interpretado pela IA), reduzindo a fadiga visual em comparação ao preto puro.
*   **Zebra Styling**: Linhas alternadas em tabelas devem usar `#FFFFFF` (par) e `#F8FAFC` (ímpar).

## 3. Arquitetura do Documento PDF (ExportPDF.tsx)
O relatório é construído de forma modular para suportar conteúdos dinâmicos. A ordem padrão de renderização segue a estrutura:
1.  **Capa Premium**: Identidade visual e natividade.
2.  **Sumário**: Índice dos conteúdos incluídos no dossiê.
3.  **Radix (Natal)**: Mandala principal (Domificação Placidus).
4.  **Geometria e Dignidades**: Tabelas técnicas de planetas e dignidades essenciais.
5.  **Aspectos e Diálogos**: Principais ângulos entre planetas (limite padrão de 30 aspectos para evitar overflow).
6.  **Interpretação IA (Natal)**: Tratado textual gerado via IA (opcional).
7.  **Revolução Solar**: Dados da RS, Interposição e Aspectos Cruzados (opcional).
8.  **Interpretação IA (RS)**: Relatório preditivo anual (opcional).

> [!TIP]
> **Numeração de Páginas**: Atualmente a numeração do sumário é estática. Recomenda-se implementar uma lógica de contagem dinâmica (ex: passando o acumulador de páginas entre componentes) caso o volume de dados da IA aumente significativamente.

## 4. Gestão de Casas Astrológicas
O sistema de casas é o pilar da interpretação e foi reorganizado para evitar redundâncias:
*   **Contexto Natal (Moderno)**: Utiliza exclusivamente o sistema **Placidus**. Todas as referências a *Whole Signs* (Signos Inteiros) foram removidas da UI principal e do PDF natal para focar na abordagem psicológica de arcos de tempo.
*   **Contexto Tradicional (Septenário)**: Mantém o uso de **Whole Signs**, pois o cálculo de dignidades clássicas e lotes depende deste sistema.
*   **Manutenção da UI**: O componente `HousesTable.tsx` aceita o prop `system`. No mapa natal, apenas o valor `placidus` deve ser passado.

## 5. Tipografia e Glifos
A escolha tipográfica visa o equilíbrio entre o design moderno e a necessidade técnica de exibir símbolos astrológicos:

*   **Helvetica / Helvetica-Bold**: Utilizada para 90% do documento. É a fonte padrão do PDF para garantir leveza e uma estética limpa "Sans-Serif".
*   **DejaVu Sans (Fallback)**: É essencial manter o registro desta fonte para glifos como `℞` (Retrógrado), graus `°` e outros símbolos que o PDF nativo pode não renderizar corretamente.
*   **Controle de Estilo**: Todos os estilos estão centralizados no objeto `styles` (StyleSheet). Evite estilos inline; sempre adicione novas regras ao `styles` para manter a organização.

## 6. Substituição de Assets e Branding
Para alterar a identidade visual da marca:

*   **Logo da Capa**: O arquivo deve estar em `public/assets/logo-premium.png`. Recomenda-se um PNG com fundo transparente e resolução mínima de 512x512px.
*   **Favicons e Interface**: Seguem o padrão Next.js na pasta `public/`.
*   **Assinatura IA**: O texto "Codificado por AstroMap AI" na capa pode ser alterado diretamente no componente `Page` da Capa em `ExportPDF.tsx`.

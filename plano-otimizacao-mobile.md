# Change Design - Otimização Extrema da Interface Mobile

## 🎯 Objetivo Operacional

Implementar uma otimização profunda e agressiva na interface mobile do AstroMap, focando na economia de espaço vertical, fechamento automático de menus e densidade de informação nos cards de resultados.

## 🚫 Não-Objetivos

- Não alterar a visualização em Desktop (manter o layout premium atual).
- Não remover dados essenciais do mapa astral.
- Não introduzir dependências novas.

## 🗺️ Impacto por Camada

- **UI**: Alterações em `page.tsx`, `BirthForm.tsx`, `SavedCharts.tsx` e `PlanetTable.tsx`.
- **Fluxo**: Alteração no comportamento do Drawer mobile em `page.tsx`.

## ⚠️ Riscos Reais

- **Sobreposição de Elementos**: O uso de 2 colunas em mobile para planetas pode exigir fontes muito pequenas.
- **Usabilidade**: Garantir que o fechamento automático do menu não confunda o usuário (dar feedback visual de sucesso).

## 🛠️ Plano de Implementação Detalhado

### 1. Comportamento do Menu (`src/app/page.tsx`)

- **Fechamento Automático**: Adicionar `setMobileSidebarOpen(false)` dentro das funções `handleFormSubmit` e `handleSelectChart` para que o menu feche imediatamente após o processamento.
- **Drawer Compacto**:
  - Reduzir padding interno do Drawer de `p-6` para `p-4`.
  - Diminuir a largura máxima no mobile (`w-[85vw]` para `w-[75vw]`).

### 2. Cards de Planetas (`src/components/PlanetTable.tsx`)

- **Layout de 2 Colunas**: Em telas pequenas, usar `grid-cols-2` em vez de `grid-cols-1`.
- **Densidade Extrema**:
  - Reduzir padding do card de `p-5` para `p-3`.
  - Diminuir tamanho do símbolo do planeta de `text-3xl` para `text-xl`.
  - Reduzir o nome do planeta de `text-lg` para `text-sm`.
  - Ocultar labels repetitivas como "Planeta" ou "Casa" em mobile, mantendo apenas os valores.
  - Ajustar o indicador de Casa (círculo) para ser menor.

### 3. Formulário de Nascimento (`src/components/BirthForm.tsx`)

- Reduzir paddings de inputs e botões de `py-3` para `py-2`.
- Diminuir o tamanho da fonte das labels.
- Tornar o botão "Calcular" menos alto em mobile.

### 4. Lista de Mapas Salvos (`src/components/SavedCharts.tsx`)

- **Layout Horizontal**: Colocar ícones de ação (editar/excluir) de forma mais compacta.
- **Remoção de Ruído**: Ocultar "Salvo em [data]" em dispositivos móveis, mantendo apenas a data de nascimento e o local.
- Reduzir padding entre os itens da lista.

## ✅ Validação Mínima

- **Fluxo Mobile**: Testar o ciclo completo (Abrir menu -> Selecionar mapa -> Menu fecha sozinho -> Resultado aparece compacto).
- **Inspeção de Grid**: Verificar se os cards de planetas em 2 colunas não quebram o layout em celulares pequenos (320px-375px).
- **Lighthouse**: Garantir que não houve perda de acessibilidade (target size).

## ➔ Próximo Workflow

- `BUILD FLOW`

# Plano de Localização — Eletiva Magística

## Objetivo

Traduzir elementos que aparecem em inglês no módulo **Eletiva Magística**, tanto na interface do usuário (UI) quanto no relatório gerado pela IA. Isso inclui nomes de planetas (ex: "Sun" -> "Sol"), propósitos mágicos (ex: "LOVE" -> "Amor e Relacionamentos") e condições de regência.

> [!IMPORTANT]
> **RESTRIÇÃO DE ESCOPO (UI ONLY)**: As traduções devem ser aplicadas apenas na camada de exibição (frontend e strings enviadas à IA). A estrutura de dados interna, IDs de planetas (keys), lógica de cálculo e contratos de API **não devem ser alterados** para evitar quebras de lógica no sistema.

## Mudanças Propostas

### [Core] [NEW] [constants.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/traditional/constants.ts)

- Criar mapeamentos centralizados para nomes de planetas e propósitos.

### [Lib] [MODIFY] [scoring.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/traditional/scoring.ts)

- Importar `PLANET_NAME_PT` do novo arquivo de constantes para evitar duplicação.

### [UI] [MODIFY] [TraditionalElectivePanel.tsx](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/components/traditional/TraditionalElectivePanel.tsx)

- Traduzir o campo "Regente" no Códice Hermético.
- Traduzir "Dia Planetário" e "Hora Planetária" no painel de Sintonia Celeste.
- Traduzir o status do regente (ex: "Venus em Peregrino" -> "Vênus em Peregrino").
- Garantir que a seleção de intenção mostre labels em português.

### [AI] [MODIFY] [aiPrompts.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/aiPrompts.ts)

- Traduzir o `purpose` no cabeçalho do prompt.
- Traduzir os nomes dos planetas na hora planetária e na condição do regente.
- Garantir que o contexto enviado para a IA use termos em português.

## Verificação Plan

### Automatizada

- `npm run lint`
- `npm run build`

### Manual

- Abrir o módulo de Eletiva.
- Verificar se "Sol", "Lua", etc. aparecem corretamente nos painéis.
- Gerar um relatório de IA e verificar se o cabeçalho e os dados técnicos estão em português.

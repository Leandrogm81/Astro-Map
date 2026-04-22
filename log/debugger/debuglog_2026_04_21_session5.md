# Debug Log - AstroMap
**Data:** 2026-04-21
**Sessão:** 5
**Agente:** Debugger (Antigravity)

## 1. Problemas Reportados
1. **Relatório da aba Tradicional** gera conteúdo de astrologia **moderna** (natal) em vez de astrologia tradicional.
2. **Relatório da Revolução Solar** não funciona — gera relatório natal genérico.

## 2. Análise da Causa Raiz
Ambos os bugs têm a mesma natureza: **incompatibilidade de chaves JSON** entre os componentes frontend e a rota da API (`/api/report`).

### Bug 1 — Aba Tradicional
- `TraditionalAIReport.tsx` enviava `isTraditional: true` no corpo da requisição.
- A API (`route.ts` linha 85) verifica `reportMode === 'traditional'`.
- Como `reportMode` ficava `undefined`, a condição `isTraditional` era sempre `false`, e a API usava o prompt natal padrão.

### Bug 2 — Revolução Solar
- `SolarRevolution.tsx` enviava `solarRevolution: solarReturn` no corpo da requisição.
- A API (`route.ts` linha 57) faz destructure de `solarChart`, não `solarRevolution`.
- A condição `isSolarReturn = reportMode === 'solar' && solarChart` era `false` (pois `solarChart` ficava `undefined`), gerando o relatório natal genérico.

### Bug Extra — Modelo não reconhecido
- Ambos os componentes usavam `google/gemini-2.5-flash-lite` como modelo padrão, mas este ID não estava na lista `AVAILABLE_MODEL_IDS` da API, causando fallback silencioso para `google/gemini-flash-1.5`.

## 3. Correções Aplicadas (Cirúrgicas)

| Arquivo | Linha | Alteração |
|---------|-------|-----------|
| `TraditionalAIReport.tsx` | 97 | `isTraditional: true` → `reportMode: 'traditional'` |
| `SolarRevolution.tsx` | 159 | `solarRevolution: solarReturn` → `solarChart: solarReturn` |
| `route.ts` | 16-21 | Adicionado `google/gemini-2.5-flash-lite` à lista `AVAILABLE_MODELS` |

## 4. Validação
- `npm run build` → ✅ Compilado com sucesso, sem erros de TypeScript.
- As correções são de **uma linha cada** nos componentes, sem efeitos colaterais.
- A lógica de streaming, salvamento em localStorage e renderização permaneceram intocadas.

## 5. Observações Técnicas
- O padrão de "chaves desconectadas" sugere que a API foi refatorada sem atualizar todos os consumidores. Recomenda-se criar uma interface TypeScript compartilhada (`ReportRequestBody`) em `src/types/` para garantir type-safety entre componentes e API.

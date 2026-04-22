# Debug Log - 2026-04-21 (Sessão 2)

## Contexto

Reincidência de problemas de encoding (Mojibake) na Vercel, mesmo após tentativas iniciais de correção. O problema afetava títulos de Revolução Solar e o PDF.

## Diagnóstico

- A presença de **UTF-8 with BOM** nos arquivos de origem causava confusão no compilador Turbopack/SWC no ambiente Vercel.
- Caracteres especiais hardcoded no JSX eram a causa secundária de fragilidade.

## Correção Cirúrgica

1. **Sanitização de Arquivos**: Remoção de BOM de todos os arquivos `.tsx` e `.ts` críticos.
2. **Hardening Unicode**: Substituição de literais acentuados por sequências de escape `\uXXXX` em:
   - `SolarRevolution.tsx` (Títulos e Símbolos)
   - `ExportPDF.tsx` (Cabeçalhos e Tabelas)
   - `page.tsx` (UI Labels)

## Verificação de Regressão

- O comando `npm run build` confirmou a integridade sintática dos escapes Unicode.
- A remoção de BOM foi validada via script Python operando em modo binário.

## Status: Estabilizado

A branch `codex/fix-idioma-pdf-qwen` está pronta para deploy final com proteção total contra Mojibake.

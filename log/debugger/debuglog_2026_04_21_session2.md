# Debug Log - 2026-04-21 (Sess\u00e3o 2)

## Contexto
Reincid\u00eancia de problemas de encoding (Mojibake) na Vercel, mesmo ap\u00f3s tentativas iniciais de corre\u00e7\u00e3o. O problema afetava t\u00edtulos de Revolu\u00e7\u00e3o Solar e o PDF.

## Diagn\u00f3stico
- A presen\u00e7a de **UTF-8 with BOM** nos arquivos de origem causava confus\u00e3o no compilador Turbopack/SWC no ambiente Vercel.
- Caracteres especiais hardcoded no JSX eram a causa secund\u00e1ria de fragilidade.

## Corre\u00e7\u00e3o Cir\u00fargica
1. **Sanitiza\u00e7\u00e3o de Arquivos**: Remo\u00e7\u00e3o de BOM de todos os arquivos `.tsx` e `.ts` cr\u00edticos.
2. **Hardening Unicode**: Substitui\u00e7\u00e3o de literais acentuados por sequ\u00eancias de escape `\uXXXX` em:
   - `SolarRevolution.tsx` (T\u00edtulos e S\u00edmbolos)
   - `ExportPDF.tsx` (Cabe\u00e7alhos e Tabelas)
   - `page.tsx` (UI Labels)

## Verifica\u00e7\u00e3o de Regress\u00e3o
- O comando `npm run build` confirmou a integridade sint\u00e1tica dos escapes Unicode.
- A remo\u00e7\u00e3o de BOM foi validada via script Python operando em modo bin\u00e1rio.

## Status: Estabilizado
A branch `codex/fix-idioma-pdf-qwen` est\u00e1 pronta para deploy final com prote\u00e7\u00e3o total contra Mojibake.

# Debug Log - 2026-04-21 (Sessão 3)

## Contexto
Reincidência do Mojibake na Vercel após correções anteriores (Sessão 2). As correções de BOM e Unicode escapes NÃO resolveram o problema.

## Diagnóstico (Análise Profunda)

### Metodologia
1. Download direto do chunk JS compilado pela Vercel (`10ezoqpq-9fm5.js`, 2MB).
2. Análise byte-a-byte comparando build local (Windows) vs build Vercel (Linux).
3. Inspeção de headers HTTP e Git blobs.

### Resultados
| Teste | Local (Windows) | Vercel (Linux) |
|---|---|---|
| `Interpretação` no chunk | ✅ Correto | ❌ `InterpretaÃ§Ã£o` |
| `Revolução` no chunk | ✅ Correto | ❌ Parcialmente corrompido |
| Arquivos fonte UTF-8 | ✅ Válido | ✅ Válido (Git blob ok) |
| BOM nos arquivos | ❌ Nenhum | ❌ Nenhum |

### Causa Raiz Real
O **ambiente de build Linux da Vercel** não configura `LANG=en_US.UTF-8` por padrão. O Turbopack/SWC lê os bytes UTF-8 dos arquivos `.tsx` como se fossem Latin-1, causando double-encoding.

### Por que a correção anterior falhou
- Remover BOM era necessário, mas insuficiente.
- Unicode escapes (`\uXXXX`) funcionam, mas são resolvidas pelo compilador de volta para caracteres literais.
- **54 arquivos** possuem caracteres acentuados; converter todos para escapes seria impraticável e frágil.

## Correção Cirúrgica (Sessão 3)

### 1. `vercel.json` (NOVO)
Força `LANG=en_US.UTF-8` e `LC_ALL=en_US.UTF-8` no ambiente de build da Vercel.

### 2. `.gitattributes` (NOVO)
Normaliza line endings para LF em todos os arquivos texto, eliminando inconsistências CRLF/LF entre Windows e Linux.

### 3. `git add --renormalize`
Reescreveu todos os blobs do Git com LF consistente.

## Verificação de Regressão
- `npm run test`: 75/75 passando.
- `npm run build`: Sucesso (zero erros).
- Build local: Zero Mojibake confirmado via análise de bytes.

## Status: Aguardando Validação da Vercel
O deploy precisa ser testado com as novas configurações de ambiente.

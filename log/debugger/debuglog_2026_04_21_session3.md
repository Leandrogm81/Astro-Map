# Debug Log - 2026-04-21 (Sessão 3)

## Contexto

Reincidência do Mojibake na Vercel após correções anteriores (Sessão 2). As correções de BOM e Unicode escapes NÃO resolveram o problema.

## Diagnóstico (Análise Profunda)

### Metodologia

1. Download direto do chunk JS compilado pela Vercel (`10ezoqpq-9fm5.js`, 2MB).
2. Análise byte-a-byte comparando build local (Windows) vs build Vercel (Linux).
3. Inspeção de headers HTTP e Git blobs.

### Resultados

| Teste                     | Local (Windows) | Vercel (Linux)             |
| ------------------------- | --------------- | -------------------------- |
| `Interpretação` no chunk  | ✅ Correto      | ❌ `InterpretaÃ§Ã£o`       |
| `Revolução` no chunk      | ✅ Correto      | ❌ Parcialmente corrompido  |
| Arquivos fonte UTF-8      | ✅ Válido       | ✅ Válido (Git blob ok)    |
| BOM nos arquivos          | ❌ Nenhum       | ❌ Nenhum                  |

### Causa Raiz Real

O **ambiente de build Linux da Vercel** não configura `LANG=en_US.UTF-8` por padrão. O Turbopack/SWC lê os bytes UTF-8 dos arquivos `.tsx` como se fossem Latin-1, causando double-encoding.

### Por que a correção anterior falhou

- Remover BOM era necessário, mas insuficiente.
- Unicode escapes (`\uXXXX`) funcionam, mas são resolvidas pelo compilador de volta para caracteres literais.
- **54 arquivos** possuem caracteres acentuados; converter todos para escapes seria impraticável e frágil.

## Correção Final (Sessão 3.1)

### 1. `vercel.json` (REVISADO)
Movidas as variáveis de ambiente `LANG` e `LC_ALL` para a raiz (`env`), conforme documentação da Vercel. A chave `build.env` era inválida e estava sendo ignorada.

### 2. `package.json` (DEBUG)
Adicionado comando `echo` no script de `build` para validar se as variáveis de ambiente estão presentes no container da Vercel durante a compilação.

### 3. Remoção de BOM (RE-VALIDADO)
Executado script de varredura em todos os arquivos fonte. Nenhum BOM residual foi encontrado fora da `node_modules`.

## Status: Aguardando Novo Build
O commit foi enviado. Recomenda-se que o usuário:
1. Acesse o Dashboard da Vercel.
2. Verifique os logs do novo build para confirmar a saída de `LANG=en_US.UTF-8`.
3. Se o Mojibake persistir, realize um **"Redeploy"** com a opção **"Clear Build Cache"** marcada.

## Verificação de Regressão
- Localhost (3001): OK.
- Lint/Test: OK.

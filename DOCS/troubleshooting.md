# Troubleshooting — AstroMap

## Problemas Comuns e Soluções

### "Chave API não configurada"

**Sintoma:** Ao tentar gerar relatório, retorna erro 401.

**Causas possíveis:**

1. Arquivo `.env.local` não existe
2. Chave mal formatada ou inválida
3. Chave sem créditos na conta OpenRouter

**Solução:**

1. Verifique se o arquivo `.env.local` existe na raiz do projeto:

```bash
# Linux/macOS
ls -la .env.local

# Windows
dir .env.local
```

2. Verifique o conteúdo do arquivo:

```env
OPENROUTER_API_KEY=sk-or-v1-sua-chave-real
```

3. Teste a chave diretamente:

```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer sk-or-v1-sua-chave-real"
```

4. Acesse [openrouter.ai/credits](https://openrouter.ai/credits) para verificar saldo.

---

### "Erro 401 na API OpenRouter"

**Sintoma:** `{"error": {"message": "Invalid API key"}}`

**Solução:**

1. A chave pode estar incorreta ou mal formatada
2. A chave pode ter sido revogada
3. A chave pode não ter permissão para o modelo escolhido

Verifique em [openrouter.ai/keys](https://openrouter.ai/keys).

---

### "Modelo não encontrado"

**Sintoma:** `{"error": {"message": "Model not found"}}`

**Causas:**

1. O modelo ID está incorreto (ex: `qwen/qwen3-32b` vs `qwen3-32b`)
2. O modelo foi descontinuado ou está em manutenção

**Solução:**

1. Use IDs de modelos conforme listados na interface
2. Verifique modelos disponíveis em [openrouter.ai/models](https://openrouter.ai/models)
3. Tente outro modelo como alternativa

---

### "Stream interrupted" ou "Connection reset"

**Sintoma:** O relatório para de gerar no meio ou dá erro de conexão.

**Soluções:**

1. **Timeout do proxy** — se usar Nginx, aumente o timeout:

```nginx
proxy_read_timeout 300s;
proxy_connect_timeout 75s;
```

2. **Rate limit** — aguarde alguns minutos e tente novamente

3. **Rede instável** — verifique sua conexão com a internet

4. **Restart do servidor** — se for deploy próprio:

```bash
pm2 restart astromap
```

---

### Mapa com Ascendente Incorreto

**Sintoma:** O Ascendente parece estar no signo errado.

**Causas comuns:**

1. **Hora de nascimento imprecisa** — erro de 15 minutos pode colocar o Ascendente em signo vizinho
2. **Horário de verão não considerado** — verifique se o fuso está correto
3. **Latitude inválida** — valores extremos podem causar erros

**Soluções:**

1. Teste com horas aproximadas (ex: 12:00) para verificar se o problema persiste
2. Verifique a coordenada de latitude/longitude da cidade
3. Para uso profissional, confirme com efemérides oficiais

---

### "Astronomy Engine not initialized"

**Sintoma:** `Failed to calculate planet position` ou `Astronomy Engine not initialized`.

**Solução:**

```bash
# Limpe o cache e reinstale
rm -rf node_modules
npm install
```

Verifique se a biblioteca está instalada:

```bash
npm list astronomy-engine
```

---

### Posições Planetárias Incorretas

**Sintoma:** Planetas parece estar em signos errados ou com graus muito diferentes de outras fontes.

**Possíveis causas:**

1. **Fuso horário errado** — o cálculo usa UTC internamente, verifice o timezone
2. **Data incorreta** — verifique se a data de nascimento está no formato correto (YYYY-MM-DD)
3. **Cálculo de Quíron/Lilith** — estes usam aproximações lineares e podem ter erro de alguns graus

**Soluções:**

1. Compare com [ephemeris.com](https://www.ephemeris.com) ou [astro.com](https://www.astro.com/ephemeris)
2. Para Quíron, Lilith e Nodos, o erro de ~1-5° é esperado devido às aproximações

---

### PDF não Gera ou Gera em Branco

**Sintoma:** Ao clicar em "Exportar PDF", nada acontece ou o PDF vem vazio.

**Soluções:**

1. **Verifique se o relatório foi gerado** — o PDF inclui o texto do relatório IA
2. **Aguarde o carregamento completo** — gráficos podem demorar para renderizar
3. **Limpe o cache do navegador** —有时候缓存会导致问题
4. **Verifique o console** — procure por erros de `react-pdf`

---

### "Cannot find module '@/types'"

**Sintoma:** Erro de TypeScript ao compilar ou fazer build.

**Solução:**

1. Verifique se o `tsconfig.json` tem o path alias configurado:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

2. Verifique se você está na raiz do projeto ao executar comandos.

---

### Build Falha com ERESOLVE

**Sintoma:** `npm install` falha com erro de dependências.

**Solução:**

```bash
# Limpe o cache e reinstale
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

Se persistir, use:

```bash
npm install --legacy-peer-deps
```

---

### Geocoding Não Encontra a Cidade

**Sintoma:** A busca de localização não retorna resultados ou retorna cidades erradas.

**Causas:**

1. O Nominatim é filtrado para o **Brasil** (`countrycodes: 'br'`)
2. Cidades pequenas podem não estar no banco do OpenStreetMap
3. Termo de busca muito específico

**Soluções:**

1. Use termos mais genéricos (ex: "São Paulo" ao invés de "São Paulo, SP, Brasil")
2. Tente a coordenação manual de latitude/longitude
3. Para desenvolvimento, desabilite temporariamente o filtro de país em `src/lib/geocoding.ts`

---

### "Date inválida" ou "Invalid Date"

**Sintoma:** O formulário não aceita a data inserida.

**Causas:**

1. Formato incorreto — use `YYYY-MM-DD` (ex: `1990-06-15`)
2. Data inexistente (ex: 31 de fevereiro)
3. Locale do navegador incompatível

**Solução:**

Verifique o formato aceito pelo input de data. O app espera ISO 8601.

---

### LocalStorage Cheio

**Sintoma:** "Quota exceeded" ou mapas não são salvos.

**Solução:**

1. Abra o DevTools do navegador (F12)
2. Vá em **Application → Storage → Local Storage**
3. Delete mapas antigos ou não utilizados

```javascript
// Via console do navegador
localStorage.removeItem('astromap-saved-charts');
```

---

### Erro de CORS

**Sintoma:** `Access-Control-Allow-Origin` error no console.

**Causas:**

1. Chamada direta ao OpenRouter pelo frontend (sem proxy)
2. Deploy em domínio diferente do esperado

**Solução:**

1. Sempre use o endpoint `/api/report` como proxy
2. Verifique os headers do servidor de deploy

---

### Monitoramento de Erros em Produção

Para deploy em Vercel, habilite **Error Reporting**:

1. Vá em **Settings → Integrations**
2. Adicione **Sentry** ou similar

Para logs de servidor:

```bash
# Se usar PM2
pm2 logs astromap --lines 100

# Se usar Docker
docker logs astromap --tail 100
```

---

## Checklist de Diagnóstico

Quando enfrentar um problema:

1. [ ] Verifique o **console do navegador** (F12 → Console)
2. [ ] Verifique a **aba Network** para requests falhadas
3. [ ] Confirme que `npm run dev` está rodando sem erros
4. [ ] Verifique o arquivo `.env.local` e a chave API
5. [ ] Limpe o cache do navegador (`Ctrl+Shift+R` / `Cmd+Shift+R`)
6. [ ] Tente com dados mínimos (data: hoje, hora: 12:00, local: São Paulo)
7. [ ] Verifique se há erros no terminal do servidor
# Deploy — AstroMap

## Opções de Implantação

O AstroMap pode ser implantado em diferentes ambientes. A opção recomendada é a **Vercel** por sua integração nativa com Next.js.

---

## Opção 1: Vercel (Recomendado)

### Vantagens

- Deploy automático a cada push no GitHub
- Variáveis de ambiente configuráveis pelo painel
- CDN global para performance
- Preview de branches via URLs temporárias

### Passos para Deploy

#### 1. Faça push do código para GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/astro-map-app.git
git push -u origin main
```

#### 2. Importe o projeto na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Importe o repositório GitHub
4. Selecione **Next.js** como framework

#### 3. Configure variáveis de ambiente

No painel da Vercel, adicione:

| Variável | Valor |
|----------|-------|
| `OPENROUTER_API_KEY` | `sk-or-v1-sua-chave-real` |

#### 4. Deploy

Clique em **"Deploy".** O deploy será iniciado automaticamente.

### Configurando Domínio Personalizado (Opcional)

1. No painel do projeto, vá em **Settings → Domains**
2. Adicione seu domínio (ex: `astro-map.app`)
3. Configure os registros DNS conforme指示

---

## Opção 2: Servidor Próprio ( VPS / Dedicated)

### Requisitos

- Node.js 18.17+
- Nginx (opcional, para proxy reverso)
- SSL certificate (Let's Encrypt recomendado)

### Passos

#### 1.Clone e instale

```bash
git clone https://github.com/seu-usuario/astro-map-app.git
cd astro-map-app
npm install
```

#### 2.Configure variáveis de ambiente

```bash
cp .env.local.example .env.local
nano .env.local
# Edite OPENROUTER_API_KEY=sk-or-v1-...
```

#### 3.Gere o build de produção

```bash
npm run build
```

#### 4.Inicie o servidor

```bash
PORT=3000 npm start
```

#### 5.Configure o Nginx (proxy reverso)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
}
```

#### 6.Renove o SSL

```bash
certbot --nginx -d seu-dominio.com
```

### Usando PM2 para Gestão de Processos

```bash
npm install -g pm2
pm2 start npm --name "astromap" -- start
pm2 save
pm2 startup
```

---

## Opção 3: Docker

### Dockerfile

O projeto já inclui um `Dockerfile` na raiz:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
ENV PORT=3000
ENV OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
CMD ["npm", "start"]
```

### Build e Execução

#### Build da imagem

```bash
docker build -t astromap:latest .
```

#### Executar localmente

```bash
docker run -d \
  --name astromap \
  -p 3000:3000 \
  -e OPENROUTER_API_KEY=sk-or-v1-sua-chave \
  astromap:latest
```

### Docker Compose (Recomendado)

Crie um arquivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  astromap:
    build: .
    container_name: astromap
    ports:
      - "3000:3000"
    environment:
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Execute:

```bash
docker-compose up -d
```

### Deploy em Cloud com Docker

| Provedor | Instruções |
|----------|------------|
| **Railway** | Conecte o repositório GitHub, configure `OPENROUTER_API_KEY`, deploy automático |
| **Fly.io** | `fly launch` → `fly secrets set OPENROUTER_API_KEY=...` → `fly deploy` |
| **Render** | Crie Web Service, conecte GitHub, adicione environment variable |
| **AWS ECS** | Build da imagem → Push para ECR → Criar Task Definition → Executar |

---

## Opção 4: Plataforma como Serviço (PaaS)

### Render

1. Crie uma conta em [render.com](https://render.com)
2. Clique em **"New → Web Service"**
3. Conecte o repositório GitHub
4. Configure:

| Campo | Valor |
|-------|-------|
| Build Command | `npm run build` |
| Start Command | `npm start` |
| Environment Variable | `OPENROUTER_API_KEY` = sua chave |

### Railway

1. Acesse [railway.app](https://railway.app)
2. **New Project → Deploy from GitHub repo**
3. Adicione a variável de ambiente `OPENROUTER_API_KEY`
4. O deploy é automático

### Fly.io

```bash
# Instale o CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch
fly launch

# Configure a chave
fly secrets set OPENROUTER_API_KEY=sk-or-v1-...

# Deploy
fly deploy
```

---

## Variáveis de Ambiente em Produção

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `OPENROUTER_API_KEY` | Chave da API OpenRouter | `sk-or-v1-xxx` |
| `PORT` | Porta do servidor | `3000` |
| `NODE_ENV` | Ambiente (`production`) | `production` |

---

## Checklist Pré-Deploy

- [ ] Chave `OPENROUTER_API_KEY` configurada no ambiente de produção
- [ ] Build executado com sucesso (`npm run build`)
- [ ] HTTPS habilitado (essencial para streaming SSE)
- [ ] Domínio configurado e SSL válido
- [ ]Monitoramento de custos da OpenRouter ativado
- [ ] Teste do fluxo completo (formulário → relatório → PDF)

---

## Troubleshooting de Deploy

### "Connection refused" ou "504 Gateway Timeout"

- Verifique se o servidor está rodando na porta correta
- Configure o proxy reverso (Nginx) se necessário

### "Build failed"

- Execute `npm run build` localmente para identificar o erro
- Verifique se todas as dependências estão no `package.json`

### "API Key not configured"

- Confirme que a variável `OPENROUTER_API_KEY` está definida no ambiente
- Reinicie o servidor após adicionar a variável

### "Streaming interrupted"

- Verifique timeouts do proxy (Nginx: `proxy_read_timeout 300s;`)
- Clouds providers podem ter limites de tempo de conexão

### Performance lenta

- Habilite CDN para arquivos estáticos
- Considere usar Edge Functions para a API
- Monitore uso de memória e CPU
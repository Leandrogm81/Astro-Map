# Instalação — AstroMap

## Pré-requisitos

- **Node.js** 18.17 ou superior
- **npm** 9.x ou superior (ou yarn/pnpm equivalente)
- Uma chave API da [OpenRouter](https://openrouter.ai/keys) (opcional, mas necessária para relatórios com IA)

---

## Instalação Local

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd astro-map-app
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure sua chave API:

```bash
# Linux/macOS
cp .env.local.example .env.local

# Windows (PowerShell)
copy .env.local.example .env.local
```

Edite o arquivo `.env.local`:

```env
OPENROUTER_API_KEY=sk-or-v1-sua-chave-real-aqui
```

> **Importante:** O arquivo `.env.local` já está no `.gitignore`. Nunca cometa este arquivo no controle de versão.

### 4. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `OPENROUTER_API_KEY` | Não | Chave da API OpenRouter. Se não definida, usuários podem inserir sua própria chave na interface. |
| `PORT` | Não | Porta do servidor (padrão: 3000). Usado principalmente em produção. |

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento (hot-reload) |
| `npm run build` | Gera build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o ESLint |
| `npm run test` | Executa os testes unitários (Vitest) |
| `npm run test:watch` | Executa testes em modo watch |

---

## Configuração de IDE

### VS Code — Configurações Recomendadas

Crie um arquivo `.vscode/settings.json` (se não existir):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Estrutura de Arquivos de Configuração

```
├── package.json          # Dependências e scripts
├── tsconfig.json         # Configuração TypeScript
├── next.config.ts        # Configuração Next.js
├── tailwind.config.ts    # Configuração Tailwind CSS
├── vitest.config.ts      # Configuração Vitest
├── .env.local.example    # Template de variáveis de ambiente
├── .gitignore            # Arquivos ignorados pelo git
└── eslint.config.mjs     # Configuração ESLint
```

---

## Resolução de Problemas da Instalação

### "Module not found: astronomy-engine"

```bash
npm install astronomy-engine
```

### "Cannot find module '@/types'"

Verifique se o `tsconfig.json` tem o alias configurado:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Porta 3000 já em uso

```bash
PORT=3001 npm run dev
```

---

## Testes

### Executar Testes Unitários

```bash
npm run test
```

### Executar Testes em Modo Watch

```bash
npm run test:watch
```

### Testes Disponíveis

| Arquivo | Cobertura |
|---------|-----------|
| `ephemeris.test.ts` | Cálculos de posição, casas, aspectos |
| `astrology.test.ts` | Dignidades, signos, casas |
| `geocoding.test.ts` | Geocoding e fuso horário |
| `aiPrompts.test.ts` | Formatação de dados para IA |

---

## Build de Produção

### Gerar Build

```bash
npm run build
```

### Testar Build Local

```bash
npm run start
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Credentiales de API — OpenRouter

### Obtendo uma Chave

1. Acesse [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Clique em **"Create API Key"**
3. Copie a chave (começa com `sk-or-v1-`)
4. Cole no arquivo `.env.local`

### Adicionando Créditos

A OpenRouter usa modelo pay-per-use. Adicione créditos em:
[https://openrouter.ai/credits](https://openrouter.ai/credits)

### Estimativa de Custos

| Modelo | Custo por Relatório |
|--------|-------------------|
| Qwen 3 32B | ~R$ 0,0075 |
| DeepSeek V3.1 | ~R$ 0,019 |
| Gemini 2.5 Flash | ~R$ 0,055 |
| Gemini 2.5 Flash Lite | ~R$ 0,011 |

Os valores podem variar. Consulte os preços atualizados em [openrouter.ai/models](https://openrouter.ai/models).
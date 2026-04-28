# AstroMap — Mapa Astral com IA

Aplicativo web completo para cálculo e interpretação de mapas astrais, com relatórios gerados por inteligência artificial.

## Funcionalidades

- **Cálculo Preciso**: Usa `astronomy-engine` para cálculos astronômicos de alta precisão
- **Mapa Visual**: Roda zodiacal SVG interativa com planetas, casas e aspectos
- **Dois Sistemas de Casas**: Placidus e Signos Inteiros (Whole Signs)
- **Relatório IA**: Geração de interpretações completas via OpenRouter (Cloud-native)
- **Revolução Solar**: Cálculo de trânsitos e previsões anuais
- **Astrologia Tradicional**: Análise helenística/medieval com Almuten, Hyleg, dignidades
- **Exportar PDF**: Download do relatório completo
- **Autenticação Real**: Login, cadastro e recuperação de senha via Supabase Auth
- **Persistência Híbrida**: PostgreSQL/Supabase com localStorage como cache local

## Quick Start

```bash
# Instalar dependências
npm install

# Configurar API Key e Supabase
cp .env.local.example .env.local
# Edite .env.local e adicione OPENROUTER_API_KEY,
# NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

# Aplicar schema no Supabase
# Use o SQL em supabase/migrations/001_initial_schema.sql no SQL Editor do projeto

# Rodar em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Documentação

| Seção | Descrição |
|-------|-----------|
| [Visão Geral](docs/overview.md) | Descrição completa do projeto e funcionalidades |
| [Arquitetura](docs/architecture.md) | Diagramas de fluxo, estrutura de diretórios, modelos de dados |
| [Instalação](docs/installation.md) | Configuração local, variáveis de ambiente, scripts |
| [Uso](docs/usage.md) | Guia passo a passo de como usar o aplicativo |
| [Referência da API](docs/api-reference.md) | Endpoint `/api/report`, tipos, exemplos |
| [Deploy](docs/deployment.md) | Vercel, Docker, servidor próprio, PaaS |
| [Segurança e Privacidade](docs/security-privacy.md) | Fluxo de dados, chaves API, privacidade |
| [Performance e Custos](docs/performance-cost.md) | Métricas, custos OpenRouter, otimizações |
| [Extensibilidade](docs/extensibility.md) | Como adicionar sistemas de casas, planetas, modelos |
| [Troubleshooting](docs/troubleshooting.md) | Problemas comuns e soluções |
| [Contribuindo](docs/contributing.md) | Guia para contribuidores |

## Tecnologias

- **Framework**: Next.js 16.2.1 + React 19 + TypeScript
- **Estilização**: Tailwind CSS 4
- **Efemérides**: astronomy-engine (MIT)
- **IA**: OpenRouter API (Streaming SSE)
- **Auth/Banco**: Supabase Auth + PostgreSQL
- **PDF**: @react-pdf/renderer
- **Estado**: Zustand
- **Testes**: Vitest

## Modelos de IA Disponíveis

| Modelo | Custo Estimado | Melhor Para |
|--------|---------------|-------------|
| Qwen 3 32B | R$ 0,0075 | Relatórios rápidos e eficientes |
| DeepSeek V3.1 | R$ 0,019 | Excelente em Português Brasileiro |
| Gemini 2.5 Flash | R$ 0,055 | Análises sofisticadas e detalhadas |
| Gemini 2.5 Flash Lite | R$ 0,011 | Grandes volumes de dados |

## Comandos

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run start    # Iniciar em produção
npm run lint     # Verificar código
npm run test     # Executar testes
```

## Licença

MIT License - Uso livre.

## Limitações Conhecidas

- **Localização**: Buscador otimizado para o Brasil
- **Timezone**: Regras simplificadas para território brasileiro
- **Corpos secundários**: Quíron, Lilith e Nodos usam aproximações lineares

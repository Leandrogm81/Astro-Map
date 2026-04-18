# Performance e Custos — AstroMap

## Visão Geral

O AstroMap foi desenhado para ser eficiente tanto em **performance** quanto em **custo operacional**. Esta documentação detalha os aspectos técnicos e financeiros do uso da aplicação.

---

## Performance

### Métricas de Performance

| Métrica | Valor Típico | Descrição |
|---------|-------------|-----------|
| **TTI** (Time to Interactive) | ~1.5s | Tempo até a página ficar interativa |
| **LCP** (Largest Contentful Paint) | ~2.0s | Tempo de carregamento do elemento principal |
| **Cálculo de Mapa** | 200-500ms | Tempo para calcular posições e casas |
| **Geração de Relatório IA** | 5-30s | Depende do modelo e tamanho do relatório |
| **Exportação PDF** | 1-3s | Tempo para gerar PDF |

### Fatores que Influenciam a Performance

#### 1. Cálculos no Cliente

Todos os cálculos astrológicos são realizados **no navegador**, o que significa:

- **Vantagem:** Não há latência de rede para cálculos
- **Desvantagem:** Depende do hardware do usuário
- **Otimização:** O `astronomy-engine` é carregado uma única vez e reutilizado

#### 2. Streaming SSE

Relatórios são transmitidos via **Server-Sent Events (SSE)**, o que permite:

- Exibição progressiva do texto sem waiting
- Cancelamento rápido em caso de erro
- Uso eficiente de memória (não precisa guardar texto inteiro antes de exibir)

#### 3. Cache Local

- Mapas calculados ficam em `localStorage`
- Cálculos repetidos são quase instantâneos
- Prompts de IA são pré-formatados e cacheados em memória

### Otimizações Implementadas

| Técnica | Descrição |
|---------|-----------|
| **Lazy loading** | Componentes pesados carregados sob demanda |
| **Memoização** | Cálculos de dignidade/regência cacheados |
| **Debounce** | Busca de cidade com debounce de 300ms |
| **Virtualização** | Listas longas renderizadas apenas no viewport |
| **Compression** | Respostas do servidor compactadas (brotli/gzip) |

---

## Custos

### Custos da OpenRouter

O AstroMap usa a API da **OpenRouter** para geração de relatórios com IA. O modelo é **pay-per-use**.

#### Custos por Modelo (Aproximados)

| Modelo | Custo por 1K tokens (input) | Custo por 1K tokens (output) | Custo por Relatório* |
|--------|---------------------------|------------------------------|---------------------|
| Qwen 3 32B | $0.0002 | $0.0006 | R$ 0,0075 |
| DeepSeek V3.1 | $0.0001 | $0.0003 | R$ 0,019 |
| Gemini 2.5 Flash | $0.0001 | $0.0004 | R$ 0,055 |
| Gemini 2.5 Flash Lite | $0.00005 | $0.00015 | R$ 0,011 |

*\*Estimativa baseada em ~4000 tokens de output por relatório. Valores em BRL approximados (1 USD ≈ 5 BRL).*

#### Fatores que Influenciam o Custo

1. **Tamanho do relatório** — relatórios maiores custam mais
2. **Modelo escolhido** — modelos "premium" custam mais
3. **Quantidade de dados** — mapas com mais planetas/aspectos geram prompts maiores

### Estimativa de Uso Mensal

| Cenário | Relatórios/Mês | Custo Estimado |
|---------|----------------|----------------|
| Uso pessoal | 5 | R$ 0,04 - R$ 0,28 |
| Uso frequente | 20 | R$ 0,15 - R$ 1,10 |
| Uso intensivo | 50 | R$ 0,38 - R$ 2,75 |
| Uso profissional | 100 | R$ 0,75 - R$ 5,50 |

### Custos de Infraestrutura

#### Deploy em Vercel (Free Tier)

| Recurso | Limite | Custo |
|---------|--------|-------|
| Bandwidth | 100GB/mês | Grátis |
| Serverless Functions | 100h/mês | Grátis |
|build minutes | 6.000/mês | Grátis |

#### Deploy em Servidor Próprio

| Recurso | Custo Mensal Estimado |
|---------|----------------------|
| VPS básico (1 vCPU, 1GB RAM) | R$ 30-50 |
| VPS médio (2 vCPU, 4GB RAM) | R$ 80-150 |
| Docker em cloud (Railway) | R$ 5-20 (por usage) |

---

## Monitoramento

### OpenRouter Dashboard

Acesse [openrouter.ai/credits](https://openrouter.ai/credits) para:

- Ver saldo disponível
- Histórico de uso
- Alertas de consumo
- Limites de orçamento

### No Próprio App

Considere adicionar um dashboard interno para tracking de:

- Número de relatórios gerados
- Tokens consumidos por modelo
- Custo médio por relatório

---

## Estratégias de Redução de Custos

### 1. Use modelos econômicos para consultas rápidas

- Qwen 3 32B para relatórios preliminares
- DeepSeek V3.1 para análises detalhadas (custo/benefício excelente)

### 2. Cache respostas da API

Implemente cache no cliente:

```typescript
// Exemplo conceitual
const cacheKey = `report-${chartId}-${model}-${isTraditional}`;
const cached = localStorage.getItem(cacheKey);
if (cached && !forceRefresh) {
  return JSON.parse(cached);
}
```

### 3. Limite o tamanho dos prompts

- Reduza o número de aspectos incluídos no prompt (já limitado a 25)
- Use resumos para mapas já salvos

### 4. Monitore e configure alertas

- Defina orçamento máximo na OpenRouter
- Ative alertas de uso

---

## Comparativo de Performance entre Modelos

| Modelo | Velocidade | Qualidade | Custo | Melhor Para |
|--------|-----------|-----------|-------|-------------|
| Qwen 3 32B | Muito rápida | Boa | Baixo | Relatórios do dia a dia |
| DeepSeek V3.1 | Rápida | Muito boa | Baixo | Análises em português |
| Gemini 2.5 Flash | Média-rápida | Excelente | Médio | Relatórios detalhados |
| Gemini 2.5 Flash Lite | Rápida | Boa | Muito baixo | Relatórios extensos |

---

## Limitações de Performance

| Limitação | Descrição | Mitigação |
|-----------|-----------|-----------|
| **Latência de rede** | Distância até servidores da OpenRouter | Usar CDN, escolher região mais próxima |
| **Rate limiting** | Limite de requisições por minuto | Implementar retry com backoff |
| **Timeout de conexão** | Conexões SSE podem expirar | Manter conexões curtas, chunking |
| **Memória do cliente** | Dispositivos fracos podem travar | Lazy loading, virtualização |
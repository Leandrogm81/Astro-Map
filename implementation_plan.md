# Plano de Implementação: Otimização de Relatórios de IA (Precisão e Velocidade)

Este plano visa resolver a interrupção prematura dos relatórios e melhorar a experiência do usuário (UX) através da escolha de um modelo mais rápido e preciso.

## User Review Required

> [!IMPORTANT]
> **Modelo Selecionado:** Estamos alterando o modelo padrão para o **DeepSeek v4 Flash**. Ele oferece o melhor equilíbrio entre o "início imediato" (baixa latência) que você solicitou e a precisão técnica necessária para a astrologia tradicional.
>
> **Ambiente de Hospedagem:** A configuração de `maxDuration` é essencial para evitar cortes. Caso o deploy seja no Vercel Hobby, o limite de 10s é rígido, mas o uso do modelo Flash minimiza o risco de ultrapassar esse tempo.

## Causa Raiz Identificada

1. **Limite de Saída (max_tokens):** O código atual limita a resposta a 4000 tokens (~3000 palavras). Os prompts solicitam até 4000 palavras, causando o corte.
2. **Timeout da Função:** Sem a diretiva `maxDuration`, a execução pode ser interrompida pelo servidor antes da conclusão em relatórios extensos.
3. **Latência do Modelo:** O modelo anterior (`gpt-oss-120b`) possui um tempo de processamento inicial elevado.

## Mudanças Propostas

### Backend (Configuração e API)

#### [MODIFY] [aiConfig.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/lib/aiConfig.ts)
- Alterar `DEFAULT_MODEL_ID` para `'deepseek/deepseek-v4-flash'`.
- Isso tornará o início da geração muito mais rápido em todas as áreas do app.

#### [MODIFY] [route.ts](file:///c:/Users/leand/OneDrive/Documentos/Antigravity%20AstroMap/Astro-Map/src/app/api/report/route.ts)
- Adicionar `export const maxDuration = 60;` no topo do arquivo.
- Alterar `max_tokens` de `4000` para `8000` para suportar relatórios completos e longos.

## Plano de Verificação

### Verificação Manual
1. Abrir o painel de **Eletiva Magística**.
2. Clicar em **"Consultar Astros"**.
3. Cronometrar o tempo até a primeira palavra (deve ser significativamente menor).
4. Validar se o texto chega ao fim (Seção V do relatório).

### Testes Automatizados
- `npm run build`: Garantir integridade da rota de API.

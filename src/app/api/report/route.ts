import { NextRequest, NextResponse } from 'next/server';
import { 
  formatChartForAI, 
  formatSolarComparisonForAI,
  formatTraditionalChartForAI,
  NATAL_PROMPT_SYSTEM, 
  SOLAR_RETURN_PROMPT_SYSTEM,
  TRADITIONAL_PROMPT_SYSTEM
} from '@/lib/aiPrompts';
import { calculateTraditionalPoints } from '@/lib/traditional/points';

// Configurações da OpenRouter
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL_ID = 'google/gemini-flash-1.5';

export const AVAILABLE_MODELS = [
  {
    id: DEFAULT_MODEL_ID,
    name: 'Padrão - Gemini 1.5 Flash',
    description: 'Boa qualidade com baixo custo e excelente velocidade para relatórios do mapa natal.\nCusto: baixo',
    cost: 'baixo'
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'Análise Forte - DeepSeek V3',
    description: 'Melhor para textos mais profundos, estruturados e análises mais longas.\nCusto: médio',
    cost: 'médio'
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Alternativo - Qwen 2.5 72B',
    description: 'Modelo potente da Alibaba, excelente para estruturação lógica e detalhes técnicos.',
    cost: 'médio'
  }
];

const AVAILABLE_MODEL_IDS = new Set(AVAILABLE_MODELS.map((item) => item.id));

export async function POST(request: NextRequest) {
  try {
    // 1. Parsing robusto do corpo da requisição
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Corpo da requisição inválido. Certifique-se de enviar um JSON válido.' },
        { status: 400 }
      );
    }

    const { 
      chart, 
      model: requestedModel, 
      reportMode, 
      assessments, 
      solarChart, 
      solarYear,
      apiKey: userApiKey 
    } = body;

    // 2. Validação básica de dados
    if (!chart || !chart.birthData) {
      return NextResponse.json(
        { error: 'Dados do mapa natal são obrigatórios.' },
        { status: 400 }
      );
    }

    // 3. Configuração de Chave API e Modelo
    const apiKey = userApiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API não configurada. Por favor, insira uma chave válida.' },
        { status: 401 }
      );
    }

    const model = requestedModel && AVAILABLE_MODEL_IDS.has(requestedModel) 
      ? requestedModel 
      : DEFAULT_MODEL_ID;

    // 4. Preparação dos Prompts baseados no modo de relatório
    const isSolarReturn = reportMode === 'solar' && solarChart;
    const isTraditional = reportMode === 'traditional';

    let systemPrompt = NATAL_PROMPT_SYSTEM;
    let userMessage = '';

    if (isSolarReturn) {
      systemPrompt = SOLAR_RETURN_PROMPT_SYSTEM;
      const year = solarYear || new Date(solarChart.birthData.date).getFullYear();
      userMessage = `Analise minha Revolução Solar para o ano ${year} comparando com meu Mapa Natal. Use especialmente os ASPECTOS CRUZADOS e a INTERPOSIÇÃO DE CASAS fornecidos nos dados abaixo.\n\n${formatSolarComparisonForAI(chart, solarChart, year)}`;
    } else if (isTraditional) {
      systemPrompt = TRADITIONAL_PROMPT_SYSTEM;
      
      // Garante que pontos tradicionais existam
      if (!chart.traditionalPoints) {
        try {
          chart.traditionalPoints = calculateTraditionalPoints(
            chart.ascendant,
            chart.planets,
            chart.housesPlacidus,
            chart.isDayChart ?? true
          );
        } catch {
          console.error('Erro ao calcular pontos tradicionais no servidor:');
        }
      }
      
      userMessage = formatTraditionalChartForAI(chart, assessments || []);
    } else {
      // Padrão: Natal Moderno
      systemPrompt = NATAL_PROMPT_SYSTEM;
      userMessage = formatChartForAI(chart);
    }

    // 5. Chamada para OpenRouter com Streaming
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://astromap.com',
        'X-Title': 'AstroMap',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      
      return NextResponse.json(
        { 
          error: errorData.error?.message || `Erro na OpenRouter: ${response.status}`,
          status: response.status 
        },
        { status: response.status }
      );
    }

    // 6. Manipulação do Stream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body?.getReader();

    if (!reader) {
      return NextResponse.json({ error: 'Falha ao iniciar stream da resposta.' }, { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
              
              const dataStr = trimmedLine.replace(/^data: /, '').trim();
              if (dataStr === '[DONE]') break;

              try {
                const json = JSON.parse(dataStr);
                const text = json.choices?.[0]?.delta?.content || '';
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              } catch {
                // Silenciosamente ignorar chunks parciais
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
          try { controller.close(); } catch { }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API Final Catch:', error);
    return NextResponse.json({ 
      error: 'Erro inesperado no servidor', 
      details: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ models: AVAILABLE_MODELS });
}

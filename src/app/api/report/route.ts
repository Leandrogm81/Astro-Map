import { NextRequest, NextResponse } from 'next/server';
import { 
  formatChartForAI, 
  NATAL_PROMPT_SYSTEM, 
  SOLAR_RETURN_PROMPT_SYSTEM 
} from '@/lib/aiPrompts';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const AVAILABLE_MODELS = [
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', description: 'Alta velocidade e precisão', cost: 'Econômico' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', description: 'Excelente em Português Brasileiro', cost: 'Muito Econômico' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'O melhor para análises psicológicas complexas', cost: 'Premium' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', description: 'Equilibrado e versátil', cost: 'Econômico' },
];

export async function POST(request: NextRequest) {
  try {
    const { chart, model = 'google/gemini-2.0-flash-001', apiKey: clientApiKey, solarRevolution, solarYear } = await request.json();

    if (!chart) {
      return NextResponse.json({ error: 'Dados do mapa astral não fornecidos' }, { status: 400 });
    }

    const apiKey = clientApiKey || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API não fornecida. Configure na interface ou no servidor.' },
        { status: 401 }
      );
    }

    const isSolar = !!(solarRevolution && solarYear);
    const systemPrompt = isSolar ? SOLAR_RETURN_PROMPT_SYSTEM : NATAL_PROMPT_SYSTEM;
    
    const userMessage = isSolar 
      ? `Analise minha Revolução Solar para o ano ${solarYear} comparando com meu Mapa Natal.\n\n=== MAPA NATAL ===\n${formatChartForAI(chart)}\n\n=== REVOLUÇÃO SOLAR ${solarYear} ===\n${formatChartForAI(solarRevolution)}`
      : `Por favor, interprete meu Mapa Natal com base nos seguintes dados:\n\n${formatChartForAI(chart)}`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://astro-map.app',
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
        stream: true, // Habilitar streaming
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || `Erro na API: ${response.status}` },
        { status: response.status }
      );
    }

    // Configurar o Stream para o cliente
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let closed = false;

        const safeClose = () => {
          if (!closed) {
            closed = true;
            try {
              controller.close();
            } catch (e) {
              // Já fechado ou erro inconsequente no encerramento
            }
          }
        };

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Suporte a caracteres multi-byte e buffer incremental
            buffer += decoder.decode(value, { stream: true });

            // Processar apenas linhas completas (terminadas em \n)
            const lines = buffer.split('\n');
            // A última parte (provavelmente incompleta) volta para o buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const dataStr = trimmed.slice(6).trim();

              if (dataStr === '[DONE]') {
                safeClose();
                return;
              }

              try {
                const data = JSON.parse(dataStr);
                const content = data.choices?.[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                // Linha SSE incompleta ou mal-formada neste chunk, ignorar com segurança
                // No próximo chunk o buffer terá a linha completa
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        } finally {
          safeClose();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ models: AVAILABLE_MODELS });
}

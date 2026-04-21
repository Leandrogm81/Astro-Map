import { NextRequest, NextResponse } from 'next/server';
import { 
  formatChartForAI, 
  formatSolarComparisonForAI,
  formatTraditionalChartForAI,
  NATAL_PROMPT_SYSTEM, 
  SOLAR_RETURN_PROMPT_SYSTEM,
  TRADITIONAL_PROMPT_SYSTEM
} from '@/lib/aiPrompts';
import { PlanetPosition, LotPosition } from '@/types';
import { calculateTraditionalPoints } from '@/lib/traditional/points';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL_ID = 'google/gemini-2.5-flash-lite';

export const AVAILABLE_MODELS = [
  {
    id: DEFAULT_MODEL_ID,
    name: 'Padrão - Gemini 2.5 Flash Lite',
    description: 'Boa qualidade com baixo custo e excelente velocidade para relatórios do mapa natal.\nCusto: sob consulta na OpenRouter',
    cost: 'baixo'
  },
  {
    id: 'deepseek/deepseek-chat-v3.1',
    name: 'Análise Forte - DeepSeek V3.1',
    description: 'Melhor para textos mais profundos, estruturados e análises mais longas.\nCusto: sob consulta na OpenRouter',
    cost: 'médio'
  },
];
const AVAILABLE_MODEL_IDS = new Set(AVAILABLE_MODELS.map((item) => item.id));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      chart, 
      model: requestedModel,
      apiKey: clientApiKey, 
      reportMode,
      solarRevolution, 
      solarYear,
      isTraditional = false,
      assessments = []
    } = body;

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

    const hasRequestedModel = Object.prototype.hasOwnProperty.call(body, 'model');
    if (hasRequestedModel && requestedModel !== undefined && !AVAILABLE_MODEL_IDS.has(requestedModel)) {
      return NextResponse.json(
        {
          error: `Modelo não suportado: ${requestedModel}`,
          availableModels: AVAILABLE_MODELS.map((item) => item.id),
        },
        { status: 400 }
      );
    }

    const model = requestedModel ?? DEFAULT_MODEL_ID;

    const effectiveMode = reportMode ?? (isTraditional ? 'traditional' : solarRevolution && solarYear ? 'solar' : 'natal');
    const isSolar = effectiveMode === 'solar';
    
    // Garantir dados tradicionais se necessário
    if (isTraditional && !chart.traditionalPoints) {
      try {
        chart.traditionalPoints = calculateTraditionalPoints(
          chart.ascendant || 0,
          chart.planets || [],
          chart.housesPlacidus || [],
          chart.isDayChart ?? false
        );
      } catch (e) {
        console.error('Falha ao calcular pontos tradicionais no servidor:', e);
      }
    }

    // Seleção de Prompt do Sistema
    let systemPrompt = NATAL_PROMPT_SYSTEM;
    if (isTraditional) {
      systemPrompt = TRADITIONAL_PROMPT_SYSTEM;
    } else if (isSolar) {
      systemPrompt = SOLAR_RETURN_PROMPT_SYSTEM;
    }
    
    // Construção da Mensagem do Usuário
    let userMessage = '';
    if (isTraditional) {
      const formatDeg = (lon: number | undefined) => {
        if (typeof lon !== 'number') return '0°0\'';
        const deg = Math.floor(lon % 30);
        const min = Math.floor((lon % 1) * 60);
        return `${deg}°${min}'`;
      };

      const planetData = (chart.planets || [])
        .filter((p: PlanetPosition) => p?.id && ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(p.id.toLowerCase()))
        .map((p: PlanetPosition) => `- ${p.name || 'Desconhecido'}: ${p.sign || '---'} ${formatDeg(p.longitude)} na Casa ${p.house || '?'}`)
        .join('\n');

      const lotData = (chart.lots || [])
        .map((l: LotPosition) => `- ${l.name || 'Lote'}: ${l.sign || '---'} ${formatDeg(l.degree)}`)
        .join('\n');

userMessage = `Interprete meu Mapa sob a ótica da ASTROLOGIA TRADICIONAL (Clássica/Medieval).

DADOS EXATOS DE POSIÇÃO:
PLANETAS CLÁSSICOS:
${planetData}

LOTES HERMÉTICOS:
${lotData}

Use os dados técnicos de DIGNIDADES e PONTUAÇÃO (Almuten) fornecidos abaixo para a análise profunda.\n\n${(() => {
  try {
    return formatTraditionalChartForAI(chart, assessments || []);
  } catch (e) {
    console.error('Erro ao formatar carta tradicional:', e);
    return 'Erro ao processar dados tradicionais.';
  }
})()}`;
    } else if (isSolar) {
      userMessage = `Analise minha Revolução Solar para o ano ${solarYear} comparando com meu Mapa Natal. Use especialmente os ASPECTOS CRUZADOS e a INTERPOSIÇÃO DE CASAS fornecidos nos dados abaixo.\n\n${formatSolarComparisonForAI(chart, solarRevolution, solarYear)}`;
    } else {
      userMessage = `Por favor, interprete meu Mapa Natal com base nos seguintes dados técnicos. Observe atentamente as DIGNIDADES, a CADEIA DE DISPOSIÇÃO e os SIGNOS INTERCEPTADOS.\n\n${formatChartForAI(chart)}`;
    }

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
        temperature: 0.75,
        max_tokens: 8000,
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
            } catch {
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
              } catch {
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
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ models: AVAILABLE_MODELS });
}


import { NextRequest, NextResponse } from 'next/server';
import { 
  formatChartForAI, 
  formatSolarComparisonForAI,
  formatTraditionalChartForAI,
  NATAL_PROMPT_SYSTEM, 
  SOLAR_RETURN_PROMPT_SYSTEM,
  TRADITIONAL_PROMPT_SYSTEM,
  ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM,
  ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM,
  formatElectiveForAI
} from '@/lib/aiPrompts';
import { calculateTraditionalPoints } from '@/lib/traditional/points';
import { calculateTraditionalAssessment } from '@/lib/traditional/scoring';
import { PlanetPosition } from '@/types';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from '@/lib/aiConfig';

export const maxDuration = 90;

// Configurações da OpenRouter
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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
      natalChart,
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
    } else if (reportMode === 'elective_magic') {
      const { veredict, targetDate, targetTime, electiveMode = 'sky_only' } = body;
      systemPrompt = electiveMode === 'sky_plus_natal' 
        ? ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM 
        : ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM;

      if (!veredict || !veredict.planetHour || !veredict.lunarMansion) {
        return NextResponse.json({ error: 'Dados do veredito incompletos para a análise mágica.' }, { status: 400 });
      }

      // Enriquecimento do NatalChart se for modo sky_plus_natal
      if (electiveMode === 'sky_plus_natal' && natalChart) {
        if (!natalChart.traditionalPoints) {
          try {
            natalChart.traditionalPoints = calculateTraditionalPoints(
              natalChart.ascendant,
              natalChart.planets,
              natalChart.housesPlacidus,
              natalChart.isDayChart ?? true,
              natalChart.prenatalSyzygy
            );
          } catch (e) {
            console.error('API: Erro ao calcular pontos tradicionais natal:', e);
          }
        }

        if (!natalChart.traditionalAssessments) {
          try {
            natalChart.traditionalAssessments = natalChart.planets
              .filter((p: PlanetPosition) => ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(p.id))
              .map((p: PlanetPosition) => calculateTraditionalAssessment(
                p,
                natalChart.planets,
                natalChart.isDayChart ?? true
              ));
          } catch (e) {
            console.error('API: Erro ao calcular assessments tradicionais natal:', e);
          }
        }
      }
      
      // Usa a data/hora enviada pelo frontend (momento do céu eleito).
      // Fallback para o relógio do servidor se o frontend não enviar.
      const contextChart = {
        ...chart,
        birthData: {
          ...chart.birthData,
          date: targetDate || chart.birthData.date,
          time: targetTime || chart.birthData.time
        }
      };

      userMessage = formatElectiveForAI(veredict, contextChart, electiveMode, natalChart);
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
        max_tokens: 8000,
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
              // const dayOfWeek = date.getDay(); // Removido pois não está sendo usado
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

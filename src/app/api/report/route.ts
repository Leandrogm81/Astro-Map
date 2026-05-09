import { NextRequest, NextResponse } from 'next/server';
import {
  ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM,
  ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM,
  formatChartForAI,
  formatElectiveForAI,
  formatSolarComparisonForAI,
  formatTraditionalChartForAI,
  NATAL_PROMPT_SYSTEM,
  SOLAR_RETURN_PROMPT_SYSTEM,
  TRADITIONAL_PROMPT_SYSTEM,
} from '@/lib/aiPrompts';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from '@/lib/aiConfig';
import { createClient } from '@/lib/supabase/server';
import { getTierLimits } from '@/lib/limits';
import { NatalChart, UserProfile } from '@/types';
import { ElectiveMode, ElectiveVeredict } from '@/lib/traditional/types';

export const maxDuration = 90;

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AVAILABLE_MODEL_IDS = new Set(AVAILABLE_MODELS.map((item) => item.id));

function isElectiveMode(value: unknown): value is ElectiveMode {
  return value === 'sky_only' || value === 'sky_plus_natal';
}

function isElectiveHouseSystem(value: unknown): value is 'whole_sign' | 'equal_house' {
  return value === 'whole_sign' || value === 'equal_house';
}

async function buildPrompt(body: Record<string, unknown>, chart: NatalChart, isDemo = false) {
  const reportMode = body.reportMode as string | undefined;
  const solarChart = body.solarChart as NatalChart | undefined;
  const natalChart = body.natalChart as NatalChart | undefined;
  const solarYear = body.solarYear as number | undefined;
  const electiveMode = body.electiveMode as 'sky_only' | 'sky_plus_natal' | undefined;
  const veredict = body.veredict as ElectiveVeredict | undefined;
  const contextChart = body.contextChart as NatalChart | undefined;
  const houseSystem = isElectiveHouseSystem(body.houseSystem) ? body.houseSystem : 'whole_sign';

  const result =
    reportMode === 'solar' && solarChart
      ? {
          systemPrompt: SOLAR_RETURN_PROMPT_SYSTEM,
          userMessage: `Analise minha Revolucao Solar para o ano ${
            solarYear || new Date().getFullYear()
          } comparando com meu Mapa Natal. Use especialmente os ASPECTOS CRUZADOS e a INTERPOSICAO DE CASAS fornecidos nos dados abaixo.\n\n${formatSolarComparisonForAI(
            chart,
            solarChart,
            solarYear || new Date().getFullYear()
          )}`,
        }
      : reportMode === 'traditional'
        ? {
            systemPrompt: TRADITIONAL_PROMPT_SYSTEM,
            userMessage: formatTraditionalChartForAI(chart, (body.assessments as []) || []),
          }
        : reportMode === 'elective_magic' && veredict && (contextChart || chart) && electiveMode
          ? {
              systemPrompt:
                electiveMode === 'sky_plus_natal'
                  ? ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM
                  : ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM,
              userMessage: formatElectiveForAI(veredict, (contextChart || chart)!, electiveMode, natalChart, houseSystem),
            }
          : {
              systemPrompt: NATAL_PROMPT_SYSTEM,
              userMessage: formatChartForAI(chart),
            };

  if (isDemo && !('error' in result)) {
    result.systemPrompt +=
      '\n\nIMPORTANTE: Voce esta em MODO DEMONSTRACAO. Seja extremamente conciso, direto ao ponto e forneca apenas uma visao geral resumida.';
  }

  return result;
}

function sanitizeProviderError(errorText: string, status: number): string {
  try {
    const parsed = JSON.parse(errorText) as { error?: { message?: string } };
    const providerMessage = parsed.error?.message?.trim();

    if (status === 401 || status === 403) {
      return providerMessage || 'Falha de autenticacao com o provedor de IA.';
    }

    return providerMessage || `Erro na OpenRouter: ${status}`;
  } catch {
    return errorText || `Erro na OpenRouter: ${status}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const profileResult = user
      ? await supabase
          .from('profiles')
          .select('id, email, role, tier, is_suspended, is_demo, ai_reports_limit, ai_reports_used, created_at, updated_at')
          .eq('id', user.id)
          .maybeSingle<UserProfile>()
      : { data: null, error: null };
    const profile = profileResult.data ?? null;

    if (profile?.is_suspended) {
      return NextResponse.json({ error: 'Sua conta esta suspensa.' }, { status: 403 });
    }

    const tierLimits = getTierLimits(profile?.tier);
    const limit = profile?.ai_reports_limit ?? tierLimits.ai_reports_per_month;
    const used = profile?.ai_reports_used ?? 0;

    if (profile && used >= limit && profile.tier !== 'admin') {
      return NextResponse.json({ error: 'Limite de relatorios de IA atingido para seu plano.' }, { status: 403 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Corpo da requisicao invalido. Certifique-se de enviar um JSON valido.' },
        { status: 400 }
      );
    }

    const chart = body.chart as NatalChart | undefined;
    const reportMode = body.reportMode as string | undefined;
    const natalChart = body.natalChart as NatalChart | undefined;
    const electiveModeValue = body.electiveMode as string | undefined;
    const veredict = body.veredict as ElectiveVeredict | undefined;
    const contextChart = body.contextChart as NatalChart | undefined;
    const skyChart = contextChart ?? chart;

    if (reportMode === 'elective_magic') {
      if (!veredict || !isElectiveMode(electiveModeValue) || !skyChart?.birthData) {
        return NextResponse.json(
          { error: 'Dados da eletiva sao obrigatorios: veredito, modo de leitura e ceu do momento.' },
          { status: 400 }
        );
      }

      if (electiveModeValue === 'sky_plus_natal' && !natalChart?.birthData) {
        return NextResponse.json(
          { error: 'Mapa natal obrigatorio para o modo ceu do momento + mapa natal.' },
          { status: 400 }
        );
      }
    } else if (!chart?.birthData) {
      return NextResponse.json({ error: 'Dados do mapa natal sao obrigatorios.' }, { status: 400 });
    }

    const apiKey = (body.apiKey as string | undefined) || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API nao configurada. Por favor, insira uma chave valida.' },
        { status: 401 }
      );
    }

    const requestedModel = body.model as string | undefined;
    const model = requestedModel && AVAILABLE_MODEL_IDS.has(requestedModel) ? requestedModel : DEFAULT_MODEL_ID;
    const promptChart = reportMode === 'elective_magic' ? skyChart! : chart!;
    const prompt = await buildPrompt(body, promptChart, profile?.is_demo ?? false);

    if ('error' in prompt) {
      return prompt.error;
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://astromap.com',
        'X-Title': 'AstroMap',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              profile?.is_demo
                ? `${prompt.systemPrompt}\n\nIMPORTANTE: Este e um relatorio de demonstracao. Seja extremamente breve e direto, limitando-se a no maximo 3 paragrafos curtos.`
                : prompt.systemPrompt,
          },
          { role: 'user', content: prompt.userMessage },
        ],
        temperature: reportMode === 'elective_magic' ? 0.35 : 0.7,
        max_tokens: profile?.is_demo ? 1200 : 12000,
        stream: true,
        ...(model.includes('grok-4.1')
          ? {
              reasoning: {
                effort: 'high',
                exclude: true,
              },
            }
          : {}),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: sanitizeProviderError(errorText, response.status),
          status: response.status,
        },
        { status: response.status }
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: 'Falha ao iniciar stream da resposta.' }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          if (user && profile) {
            await supabase
              .from('profiles')
              .update({ ai_reports_used: (profile.ai_reports_used || 0) + 1 } as never)
              .eq('id', user.id);
          }

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
                if (text) controller.enqueue(encoder.encode(text));
              } catch {
                // Ignore partial stream chunks.
              }
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
          try {
            controller.close();
          } catch {
            // Stream may already be closed by the client.
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API Final Catch:', error);
    return NextResponse.json(
      {
        error: 'Erro inesperado no servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ models: AVAILABLE_MODELS });
}

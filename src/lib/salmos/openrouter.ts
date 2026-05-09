const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const SALMOS_AI_FALLBACK_MESSAGE =
  'Nao conseguimos analisar sua busca com IA no momento. Tente usar palavras-chave mais simples.';

export class SalmosAiSearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SalmosAiSearchError';
  }
}

function buildSystemPrompt(): string {
  return [
    'Voce e um assistente especializado em salmos biblicos.',
    'A partir da intencao do usuario, responda apenas com JSON valido.',
    'Retorne somente salmos que estejam dentro do catalogo canonico 1-150.',
    'Nunca explique sua resposta.',
    'Formato obrigatorio: {"salmo_numbers":[1,23,119]}.',
    'Maximo de 3 numeros unicos.',
  ].join(' ');
}

function buildUserPrompt(query: string): string {
  return [
    `Intencao do usuario: ${query}`,
    'Escolha os salmos mais adequados para essa necessidade.',
    'Se nao houver certeza, prefira respostas mais conservadoras.',
  ].join('\n');
}

function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  return objectMatch?.[0]?.trim() ?? trimmed;
}

function parseSalmoNumbers(content: string): number[] {
  try {
    const payload = JSON.parse(extractJsonPayload(content)) as { salmo_numbers?: unknown };
    if (!payload || !Array.isArray(payload.salmo_numbers)) {
      return [];
    }

    const uniqueNumbers = new Set<number>();
    for (const value of payload.salmo_numbers) {
      const number = Number(value);
      if (Number.isInteger(number) && number >= 1 && number <= 150) {
        uniqueNumbers.add(number);
      }
    }

    return Array.from(uniqueNumbers).slice(0, 3);
  } catch {
    return [];
  }
}

function parseOpenRouterErrorMessage(errorText: string, status: number): string {
  if (status === 401 || status === 403) {
    return SALMOS_AI_FALLBACK_MESSAGE;
  }

  try {
    const parsed = JSON.parse(errorText) as { error?: { message?: string } };
    const providerMessage = parsed.error?.message?.trim() ?? '';

    if (/user not found|invalid api key|unauthorized/i.test(providerMessage)) {
      return SALMOS_AI_FALLBACK_MESSAGE;
    }
  } catch {
    return SALMOS_AI_FALLBACK_MESSAGE;
  }

  return SALMOS_AI_FALLBACK_MESSAGE;
}

export async function searchSalmosWithOpenRouter(query: string, apiKey: string, timeoutMs = 8000): Promise<number[]> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://astromap.com',
        'X-Title': 'AstroMap',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(query) },
        ],
        temperature: 0.2,
        max_tokens: 120,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new SalmosAiSearchError(parseOpenRouterErrorMessage(errorText, response.status));
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (data.error?.message) {
      throw new SalmosAiSearchError(SALMOS_AI_FALLBACK_MESSAGE);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new SalmosAiSearchError(SALMOS_AI_FALLBACK_MESSAGE);
    }

    return parseSalmoNumbers(content);
  } catch (error) {
    if (error instanceof SalmosAiSearchError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new SalmosAiSearchError(SALMOS_AI_FALLBACK_MESSAGE);
    }

    throw new SalmosAiSearchError(SALMOS_AI_FALLBACK_MESSAGE);
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

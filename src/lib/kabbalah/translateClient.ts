import type { TranslateRequest, TranslateResponse } from './types';

interface RequestHebrewTranslationOptions {
  readonly fetchImpl?: typeof fetch;
  readonly endpoint?: string;
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const payload = await response.json() as { error?: unknown };
      if (typeof payload.error === 'string' && payload.error.trim()) {
        return payload.error;
      }
    } catch {
      // Ignore malformed JSON and fall back to plain text below.
    }
  }

  try {
    const text = await response.text();
    if (text.trim()) {
      return text;
    }
  } catch {
    // Ignore unreadable body.
  }

  return fallback;
}

export async function requestHebrewTranslation(
  text: string,
  options: RequestHebrewTranslationOptions = {}
): Promise<TranslateResponse> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const endpoint = options.endpoint ?? '/api/translate';

  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      targetLang: 'he',
    } satisfies TranslateRequest),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Falha ao traduzir o nome.'));
  }

  const payload = await response.json() as Partial<TranslateResponse>;

  if (typeof payload.translatedText !== 'string' || !payload.translatedText.trim()) {
    throw new Error('Resposta de tradução inválida.');
  }

  return {
    translatedText: payload.translatedText,
    ...(typeof payload.detectedSourceLang === 'string' && payload.detectedSourceLang
      ? { detectedSourceLang: payload.detectedSourceLang }
      : {}),
  };
}

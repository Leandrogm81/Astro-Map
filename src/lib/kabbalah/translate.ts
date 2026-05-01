import type { TranslateResponse } from './types';

const GOOGLE_TRANSLATE_BASE_URL = 'https://translate.googleapis.com/translate_a/single';

export function buildGoogleTranslateUrl(text: string, targetLang: string): string {
  const url = new URL(GOOGLE_TRANSLATE_BASE_URL);
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'auto');
  url.searchParams.set('tl', targetLang);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);
  return url.toString();
}

function readSegmentText(segment: unknown): string {
  if (!Array.isArray(segment)) {
    return '';
  }

  const translated = segment[0];
  return typeof translated === 'string' ? translated : '';
}

export function parseGoogleTranslatePayload(payload: unknown): TranslateResponse {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    throw new Error('Formato inesperado da resposta do Google Translate.');
  }

  const translatedText = payload[0]
    .map((segment: unknown) => readSegmentText(segment))
    .filter((segment) => segment.length > 0)
    .join('')
    .trim();

  if (!translatedText) {
    throw new Error('O Google Translate não retornou texto traduzido.');
  }

  const detectedSourceLang = typeof payload[2] === 'string' && payload[2] ? payload[2] : undefined;

  return {
    translatedText,
    ...(detectedSourceLang ? { detectedSourceLang } : {}),
  };
}

export async function translateWithGoogle(
  text: string,
  targetLang: string,
  fetchImpl: typeof fetch = fetch
): Promise<TranslateResponse> {
  const response = await fetchImpl(buildGoogleTranslateUrl(text, targetLang), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Google Translate respondeu com status ${response.status}.`);
  }

  const rawBody = await response.text();

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw new Error('Resposta inválida do Google Translate.');
  }

  return parseGoogleTranslatePayload(payload);
}

import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST, __resetTranslateRateLimitState } from '@/app/api/translate/route';
import { buildGoogleTranslateUrl, parseGoogleTranslatePayload, translateWithGoogle } from '@/lib/kabbalah/translate';

function makeRequest(
  body: Record<string, unknown>,
  ip = '203.0.113.10'
): NextRequest {
  return new NextRequest('http://localhost/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  __resetTranslateRateLimitState();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('kabbalah translate helpers', () => {
  it('builds the Google Translate URL with the expected params', () => {
    const url = new URL(buildGoogleTranslateUrl('Leandro', 'he'));

    expect(url.hostname).toBe('translate.googleapis.com');
    expect(url.pathname).toBe('/translate_a/single');
    expect(url.searchParams.get('client')).toBe('gtx');
    expect(url.searchParams.get('sl')).toBe('auto');
    expect(url.searchParams.get('tl')).toBe('he');
    expect(url.searchParams.get('dt')).toBe('t');
    expect(url.searchParams.get('q')).toBe('Leandro');
  });

  it('parses Google Translate payloads into the route response shape', () => {
    const payload = [[null, ['ליאנדרו', 'Leandro', null, null, 1]], null, 'en'] as unknown;
    const result = parseGoogleTranslatePayload(payload);

    expect(result).toEqual({
      translatedText: 'ליאנדרו',
      detectedSourceLang: 'en',
    });
  });

  it('omits detectedSourceLang when the payload does not expose it', () => {
    const payload = [[['שלום', 'Shalom', null, null, 1]]] as unknown;
    const result = parseGoogleTranslatePayload(payload);

    expect(result).toEqual({
      translatedText: 'שלום',
    });
  });

  it('rejects unexpected payload structures', () => {
    expect(() => parseGoogleTranslatePayload({})).toThrow(
      'Formato inesperado da resposta do Google Translate.'
    );
  });

  it('rejects payloads without translated content', () => {
    expect(() => parseGoogleTranslatePayload([[null, null]])).toThrow(
      'O Google Translate não retornou texto traduzido.'
    );
  });

  it('translates text through a mocked fetch implementation', async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify([[['ליאנדרו', 'Leandro', null, null, 1]], null, 'en']),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));

    const result = await translateWithGoogle('Leandro', 'he', fetchMock as typeof fetch);

    expect(result).toEqual({
      translatedText: 'ליאנדרו',
      detectedSourceLang: 'en',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid payloads from Google Translate', async () => {
    const fetchMock = vi.fn(async () => new Response('not json', { status: 200 }));

    await expect(translateWithGoogle('Leandro', 'he', fetchMock as typeof fetch)).rejects.toThrow(
      'Resposta inválida do Google Translate.'
    );
  });

  it('rejects non-OK Google responses', async () => {
    const fetchMock = vi.fn(async () => new Response('blocked', { status: 503 }));

    await expect(translateWithGoogle('Leandro', 'he', fetchMock as typeof fetch)).rejects.toThrow(
      'Google Translate respondeu com status 503.'
    );
  });
});

describe('/api/translate', () => {
  it('returns the translated Hebrew text', async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify([[['ליאנדרו', 'Leandro', null, null, 1]], null, 'en']),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(makeRequest({ text: 'Leandro', targetLang: 'he' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      translatedText: 'ליאנדרו',
      detectedSourceLang: 'en',
    });
  });

  it('rejects malformed JSON bodies', async () => {
    const malformed = new NextRequest('http://localhost/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '203.0.113.13',
      },
      body: 'not-json',
    });

    const response = await POST(malformed);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Corpo da requisição inválido. Envie um JSON válido.',
    });
  });

  it('rejects payloads missing required fields', async () => {
    const response = await POST(makeRequest({ text: null, targetLang: 'he' }, '203.0.113.14'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Campos obrigatórios: text e targetLang.',
    });
  });

  it('rejects unsupported languages', async () => {
    const response = await POST(makeRequest({ text: 'Leandro', targetLang: 'en' }, '203.0.113.11'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Apenas targetLang="he" é suportado nesta rota.',
    });
  });

  it('rejects empty text', async () => {
    const response = await POST(makeRequest({ text: '   ', targetLang: 'he' }, '203.0.113.12'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'O texto a traduzir não pode estar vazio.',
    });
  });

  it('rejects text longer than 100 characters', async () => {
    const response = await POST(makeRequest({ text: 'a'.repeat(101), targetLang: 'he' }, '203.0.113.15'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'O texto deve ter no máximo 100 caracteres.',
    });
  });

  it('returns a 502 when the Google fetch fails', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('network down');
    });
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(makeRequest({ text: 'Leandro', targetLang: 'he' }, '203.0.113.16'));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: 'network down',
    });
  });

  it('enforces the per-IP rate limit', async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify([[['ליאנדרו', 'Leandro', null, null, 1]], null, 'en']),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
    vi.stubGlobal('fetch', fetchMock);

    for (let index = 0; index < 10; index += 1) {
      const response = await POST(makeRequest({ text: 'Leandro', targetLang: 'he' }, '203.0.113.99'));
      expect(response.status).toBe(200);
    }

    const limited = await POST(makeRequest({ text: 'Leandro', targetLang: 'he' }, '203.0.113.99'));

    expect(limited.status).toBe(429);
    await expect(limited.json()).resolves.toEqual({
      error: 'Limite de 10 traduções por minuto atingido. Aguarde um pouco e tente novamente.',
    });
  });

  it('returns the method not allowed response for GET', async () => {
    const response = await GET();

    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toEqual({
      error: 'Método não permitido.',
    });
  });
});

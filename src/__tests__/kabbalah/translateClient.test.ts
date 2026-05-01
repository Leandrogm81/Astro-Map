import { describe, expect, it, vi } from 'vitest';
import { requestHebrewTranslation } from '@/lib/kabbalah/translateClient';

describe('requestHebrewTranslation', () => {
  it('parses a successful API response', async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({
        translatedText: 'ליאנדרו',
        detectedSourceLang: 'en',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));

    const result = await requestHebrewTranslation('Leandro', { fetchImpl: fetchMock as typeof fetch });

    expect(result).toEqual({
      translatedText: 'ליאנדרו',
      detectedSourceLang: 'en',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('surfaces API error messages', async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({ error: 'Tradutor indisponível' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    ));

    await expect(
      requestHebrewTranslation('Leandro', { fetchImpl: fetchMock as typeof fetch })
    ).rejects.toThrow('Tradutor indisponível');
  });

  it('rejects malformed responses', async () => {
    const fetchMock = vi.fn(async () => new Response(
      JSON.stringify({ translated: 'nope' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));

    await expect(
      requestHebrewTranslation('Leandro', { fetchImpl: fetchMock as typeof fetch })
    ).rejects.toThrow('Resposta de tradução inválida.');
  });

  it('uses plain-text error bodies when the API does not return JSON', async () => {
    const fetchMock = vi.fn(async () => new Response('Serviço indisponível', { status: 503 }));

    await expect(
      requestHebrewTranslation('Leandro', { fetchImpl: fetchMock as typeof fetch })
    ).rejects.toThrow('Serviço indisponível');
  });
});

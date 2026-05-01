import { NextRequest, NextResponse } from 'next/server';
import { translateWithGoogle } from '@/lib/kabbalah/translate';
import type { TranslateRequest } from '@/lib/kabbalah/types';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const MAX_TEXT_LENGTH = 100;

const requestBuckets = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(',');
    const trimmed = firstIp.trim();
    if (trimmed) return trimmed;
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  return 'unknown';
}

function pruneStaleEntries(timestamps: number[], now: number): number[] {
  return timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);
}

function consumeRateLimit(ip: string, now: number): boolean {
  const existing = requestBuckets.get(ip) ?? [];
  const recent = pruneStaleEntries(existing, now);

  if (recent.length >= MAX_REQUESTS) {
    requestBuckets.set(ip, recent);
    return false;
  }

  recent.push(now);
  requestBuckets.set(ip, recent);
  return true;
}

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

function readBody(body: unknown): TranslateRequest | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const requestBody = body as Record<string, unknown>;
  const text = requestBody.text;
  const targetLang = requestBody.targetLang;

  if (typeof text !== 'string' || typeof targetLang !== 'string') {
    return null;
  }

  return { text, targetLang };
}

export function __resetTranslateRateLimitState(): void {
  requestBuckets.clear();
}

export async function GET(): Promise<NextResponse> {
  return jsonError('Método não permitido.', 405);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const now = Date.now();
  const clientIp = getClientIp(request);

  if (!consumeRateLimit(clientIp, now)) {
    return jsonError('Limite de 10 traduções por minuto atingido. Aguarde um pouco e tente novamente.', 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Corpo da requisição inválido. Envie um JSON válido.', 400);
  }

  const parsed = readBody(body);
  if (!parsed) {
    return jsonError('Campos obrigatórios: text e targetLang.', 400);
  }

  const text = parsed.text.trim();
  const targetLang = parsed.targetLang.trim().toLowerCase();

  if (!text) {
    return jsonError('O texto a traduzir não pode estar vazio.', 400);
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return jsonError(`O texto deve ter no máximo ${MAX_TEXT_LENGTH} caracteres.`, 400);
  }

  if (targetLang !== 'he') {
    return jsonError('Apenas targetLang="he" é suportado nesta rota.', 400);
  }

  try {
    const translation = await translateWithGoogle(text, targetLang);
    return NextResponse.json(translation, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao traduzir o texto.';
    return jsonError(message, 502);
  }
}

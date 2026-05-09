import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/report/route';
import { createClient } from '@/lib/supabase/server';
import type { ElectiveVeredict } from '@/lib/traditional/types';
import type { NatalChart, UserProfile, ZodiacSign } from '@/types';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

const createClientMock = vi.mocked(createClient);

const baseChart: NatalChart = {
  birthData: {
    name: 'Teste',
    date: '2026-05-15',
    time: '08:22',
    location: 'Sao Paulo, SP',
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: 'UTC-3:00',
  },
  planets: [
    { id: 'sun', name: 'Sol', symbol: 'S', longitude: 54.2, latitude: 0, speed: 0.98, sign: 'Touro', degree: 24.2, house: 4, retrograde: false },
    { id: 'moon', name: 'Lua', symbol: 'L', longitude: 250.1, latitude: 0, speed: 12.0, sign: 'Sagitário', degree: 10.1, house: 11, retrograde: false },
    { id: 'mercury', name: 'Mercurio', symbol: 'M', longitude: 20.7, latitude: 0, speed: 0.4, sign: 'Áries', degree: 20.7, house: 3, retrograde: false },
    { id: 'venus', name: 'Venus', symbol: 'V', longitude: 64.8, latitude: 0, speed: 1.1, sign: 'Gêmeos', degree: 4.8, house: 4, retrograde: false },
    { id: 'mars', name: 'Marte', symbol: 'Ma', longitude: 14.2, latitude: 0, speed: 0.7, sign: 'Áries', degree: 14.2, house: 3, retrograde: false },
    { id: 'jupiter', name: 'Jupiter', symbol: 'J', longitude: 125.5, latitude: 0, speed: 0.1, sign: 'Leão', degree: 5.5, house: 7, retrograde: false },
    { id: 'saturn', name: 'Saturno', symbol: 'Sa', longitude: 8.8, latitude: 0, speed: 0.04, sign: 'Áries', degree: 8.8, house: 3, retrograde: false },
  ],
  housesPlacidus: Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    longitude: (i * 30 + 110) % 360,
    sign: ['Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes', 'Áries', 'Touro', 'Gêmeos', 'Câncer'][i] as ZodiacSign,
    degree: 10 + i,
  })),
  housesWhole: Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    longitude: (i * 30 + 120) % 360,
    sign: ['Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes', 'Áries', 'Touro', 'Gêmeos', 'Câncer'][i] as ZodiacSign,
    degree: i * 30,
  })),
  aspects: [
    { planet1: 'Sol', planet2: 'Lua', type: 'trine', angle: 195.9, orb: 5.9, applying: false },
    { planet1: 'Marte', planet2: 'Venus', type: 'square', angle: 40.5, orb: 4.5, applying: false },
  ],
  ascendant: 355.0,
  mc: 265.0,
};

const electiveVeredict: ElectiveVeredict = {
  score: 'propitious',
  purpose: 'love',
  planetHour: {
    planetId: 'venus',
    isDaytime: false,
    hourNumber: 7,
    startTime: '19:12',
    endTime: '20:08',
  },
  lunarMansion: {
    number: 9,
    name: 'Al Tarf',
    sign: 'Leao',
    degreeRange: '8-21',
    summary: 'Favorece cautela, protecao e retirada ordenada.',
  },
  moonStatus: {
    phase: 'Gibosa Minguante',
    voidOfCourseStatus: 'not_void',
    isVoidOfCourse: false,
    aspects: [],
  },
  rulerCondition: {
    planetId: 'venus',
    totalScore: 9,
    dignity: 'Domicilio',
  },
  planetConditions: {
    venus: {
      planetId: 'venus',
      totalScore: 9,
      dignity: 'Domicilio',
      sign: 'Touro',
      degree: 15.5,
      house: 2,
    },
    moon: {
      planetId: 'moon',
      totalScore: 5,
      dignity: 'Exaltacao',
      sign: 'Touro',
      degree: 3.2,
      house: 2,
    },
  },
  ritualCorrespondences: {
    colors: ['Verde-esmeralda', 'Rosa'],
    metals: ['Cobre'],
    incenses: ['Rosa', 'Sandalo'],
    charity: 'Apoio a mulheres vulneraveis.',
    intentions: ['Amor', 'Atracao'],
  },
};

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function installSupabaseMock(profileOverrides: Partial<UserProfile> = {}) {
  const profile: UserProfile = {
    id: 'user-1',
    email: 'teste@astromap.com',
    role: 'user',
    tier: 'standard',
    is_suspended: false,
    is_demo: false,
    ai_reports_limit: 20,
    ai_reports_used: 0,
    created_at: null,
    updated_at: null,
    ...profileOverrides,
  };

  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    update: vi.fn(() => query),
    single: vi.fn(async () => ({ data: profile, error: null })),
    maybeSingle: vi.fn(async () => ({ data: profile, error: null })),
  };

  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user: { id: profile.id } } })),
    },
    from: vi.fn(() => query),
  };

  createClientMock.mockResolvedValue(supabase as never);
  return { profile, supabase, query };
}

function installGuestSupabaseMock() {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    update: vi.fn(() => query),
    single: vi.fn(async () => ({ data: null, error: null })),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
  };

  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null } })),
    },
    from: vi.fn(() => query),
  };

  createClientMock.mockResolvedValue(supabase as never);
  return { supabase, query };
}

function installOpenRouterMock(content = 'Relatorio eletivo pronto') {
  const fetchMock = vi.fn(async () => new Response(
    `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    }
  ));

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('/api/report', () => {
  it('allows guest report generation when an api key is available', async () => {
    const fetchMock = installOpenRouterMock();
    installGuestSupabaseMock();

    const response = (await POST(makeRequest({
      chart: baseChart,
      reportMode: 'natal',
      apiKey: 'test-key',
    }))) as Response;

    expect(response.status).toBe(200);
    expect(await response.text()).toContain('eletivo pronto');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('accepts elective_magic with contextChart but no chart', async () => {
    const fetchMock = installOpenRouterMock();
    installSupabaseMock();

    const response = (await POST(makeRequest({
      reportMode: 'elective_magic',
      electiveMode: 'sky_only',
      contextChart: baseChart,
      veredict: electiveVeredict,
      apiKey: 'test-key',
    }))) as Response;

    expect(response.status).toBe(200);
    expect(await response.text()).toContain('eletivo pronto');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('propagates the selected elective house system to the generated prompt', async () => {
    const fetchMock = installOpenRouterMock();
    installSupabaseMock();

    const response = (await POST(makeRequest({
      reportMode: 'elective_magic',
      electiveMode: 'sky_only',
      contextChart: baseChart,
      houseSystem: 'equal_house',
      veredict: electiveVeredict,
      apiKey: 'test-key',
    }))) as Response;

    expect(response.status).toBe(200);

    const [, options] = fetchMock.mock.calls[0] as unknown as [string | URL | Request, RequestInit | undefined];
    const payload = JSON.parse(options?.body as string) as {
      messages: Array<{ role: string; content: string }>;
      temperature: number;
      reasoning?: { exclude?: boolean };
    };

    expect(payload.temperature).toBe(0.35);
    expect(payload.reasoning?.exclude).toBe(true);
    expect(payload.messages[1].content).toContain('ESTADO DAS CASAS (SISTEMA CASAS IGUAIS)');
  });

  it('rejects sky_plus_natal without natalChart.birthData', async () => {
    installSupabaseMock();

    const response = (await POST(makeRequest({
      reportMode: 'elective_magic',
      electiveMode: 'sky_plus_natal',
      contextChart: baseChart,
      veredict: electiveVeredict,
      apiKey: 'test-key',
    }))) as Response;

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: 'Mapa natal obrigatorio para o modo ceu do momento + mapa natal.',
    });
  });

  it('rejects elective_magic without veredict', async () => {
    installSupabaseMock();

    const response = (await POST(makeRequest({
      reportMode: 'elective_magic',
      electiveMode: 'sky_only',
      contextChart: baseChart,
      apiKey: 'test-key',
    }))) as Response;

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: 'Dados da eletiva sao obrigatorios: veredito, modo de leitura e ceu do momento.',
    });
  });
});

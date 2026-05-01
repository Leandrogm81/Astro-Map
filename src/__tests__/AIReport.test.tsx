// @vitest-environment jsdom

import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { fireEvent } from '@testing-library/dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AIReport from '@/components/AIReport';
import { useProfile } from '@/hooks/useProfile';
import { getReportKey, getReportKeyLegacy } from '@/lib/storage';
import { getTierLimits } from '@/lib/limits';
import type { NatalChart } from '@/types';

vi.mock('next/image', () => ({
  default: ({ fill, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: unknown }) => {
    void fill;
    return React.createElement('img', props);
  },
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

vi.mock('remark-gfm', () => ({
  default: () => undefined,
}));

vi.mock('@/hooks/useProfile', () => ({
  useProfile: vi.fn(),
}));

vi.mock('@/lib/storage', () => ({
  getReportKey: vi.fn(),
  getReportKeyLegacy: vi.fn(),
}));

vi.mock('@/lib/limits', () => ({
  getTierLimits: vi.fn(),
}));

const mockedUseProfile = vi.mocked(useProfile);
const mockedGetReportKey = vi.mocked(getReportKey);
const mockedGetReportKeyLegacy = vi.mocked(getReportKeyLegacy);
const mockedGetTierLimits = vi.mocked(getTierLimits);

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const storage = new Map<string, string>();

function buildChart(): NatalChart {
  return {
    birthData: {
      name: 'Teste AI',
      date: '1990-01-01',
      time: '12:00',
      location: 'Sao Paulo',
      latitude: -23.55,
      longitude: -46.63,
      timezone: 'America/Sao_Paulo',
    },
    planets: [
      { id: 'sun', name: 'Sol', symbol: '☉', longitude: 15, latitude: 0, speed: 1, sign: 'Áries', degree: 15, house: 1, retrograde: false },
    ],
    housesPlacidus: Array.from({ length: 12 }, (_, index) => ({
      number: index + 1,
      longitude: index * 30,
      sign: 'Áries' as NatalChart['housesPlacidus'][number]['sign'],
      degree: 0,
    })),
    housesWhole: Array.from({ length: 12 }, (_, index) => ({
      number: index + 1,
      longitude: index * 30,
      sign: 'Áries' as NatalChart['housesWhole'][number]['sign'],
      degree: 0,
    })),
    aspects: [],
    ascendant: 123,
    mc: 300,
  } as NatalChart;
}

function buildStreamResponse(text: string) {
  const encoder = new TextEncoder();
  let done = false;

  const read = vi.fn().mockImplementation(async () => {
    if (!done) {
      done = true;
      return { done: false, value: encoder.encode(text) };
    }

    return { done: true, value: undefined };
  });

  return {
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'text/plain' }),
    body: {
      getReader: () => ({ read }),
    },
  } as never;
}

function renderReport(overrides: Partial<React.ComponentProps<typeof AIReport>> = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const props = {
    chart: buildChart(),
    ...overrides,
  } as React.ComponentProps<typeof AIReport>;

  act(() => {
    root.render(<AIReport {...props} />);
  });

  return { container, root };
}

function getButton(container: HTMLElement, label: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll('button')).find((candidate) =>
    candidate.textContent?.includes(label)
  );

  if (!button) {
    throw new Error(`Button not found: ${label}`);
  }

  return button as HTMLButtonElement;
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

beforeEach(() => {
  storage.clear();
  mockedUseProfile.mockReturnValue({
    profile: {
      tier: 'free',
      ai_reports_used: 0,
      ai_reports_limit: 99,
    },
    loading: false,
    error: null,
    refreshProfile: vi.fn(),
  } as never);
  mockedGetReportKey.mockImplementation((_, isSolarMode) => (isSolarMode ? 'solar-report' : 'natal-report'));
  mockedGetReportKeyLegacy.mockImplementation(() => 'legacy-report');
  mockedGetTierLimits.mockReturnValue({
    ai_reports_per_month: 99,
  } as never);

  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
  });

  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('AIReport', () => {
  it('renders the primary generate CTA when there is no saved report', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(buildStreamResponse('Relatório novo'));

    const { container, root } = renderReport();

    expect(container.textContent).toContain('GERAR RELAT');

    await act(async () => {
      fireEvent.click(getButton(container, 'GERAR RELAT'));
      await flushMicrotasks();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(storage.get('natal-report')).toBe('Relatório novo');

    root.unmount();
  });

  it('shows the contextual replace button when a report already exists', async () => {
    storage.set('natal-report', 'Relatório salvo');

    const { container, root } = renderReport();

    await act(async () => {
      await flushMicrotasks();
    });

    expect(container.textContent).toContain('Relatório salvo');
    expect(container.textContent).toContain('Apagar e gerar outro');

    root.unmount();
  });

  it('clears the saved report and regenerates after confirmation', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(buildStreamResponse('Novo tratado gerado'));
    storage.set('natal-report', 'Relatório salvo');
    storage.set('legacy-report', 'Relatório salvo');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { container, root } = renderReport();

    await act(async () => {
      await flushMicrotasks();
    });

    await act(async () => {
      fireEvent.click(getButton(container, 'Apagar e gerar outro'));
      await flushMicrotasks();
    });

    expect(confirmSpy).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(storage.get('natal-report')).toBe('Novo tratado gerado');
    expect(storage.get('legacy-report')).toBeUndefined();
    expect(container.textContent).toContain('Novo tratado gerado');

    root.unmount();
  });

  it('keeps the current report when the confirmation is canceled', async () => {
    const fetchMock = vi.mocked(global.fetch);
    storage.set('natal-report', 'Relatório salvo');
    storage.set('legacy-report', 'Relatório salvo');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const { container, root } = renderReport();

    await act(async () => {
      await flushMicrotasks();
    });

    await act(async () => {
      fireEvent.click(getButton(container, 'Apagar e gerar outro'));
      await flushMicrotasks();
    });

    expect(confirmSpy).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(storage.get('natal-report')).toBe('Relatório salvo');
    expect(storage.get('legacy-report')).toBe('Relatório salvo');
    expect(container.textContent).toContain('Relatório salvo');

    root.unmount();
  });

  it('shows reset button in footer when hideHeader=true and a report exists', async () => {
    storage.set('natal-report', 'Relatório salvo');

    const { container, root } = renderReport({ hideHeader: true });

    await act(async () => {
      await flushMicrotasks();
    });

    expect(container.textContent).toContain('Relatório salvo');
    expect(container.textContent).toContain('Apagar e gerar outro');

    root.unmount();
  });

  it('resets and regenerates report from footer when hideHeader=true', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(buildStreamResponse('Novo relatório gerado'));
    storage.set('natal-report', 'Relatório salvo');
    storage.set('legacy-report', 'Relatório salvo');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { container, root } = renderReport({ hideHeader: true });

    await act(async () => {
      await flushMicrotasks();
    });

    await act(async () => {
      fireEvent.click(getButton(container, 'Apagar e gerar outro'));
      await flushMicrotasks();
    });

    expect(confirmSpy).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(storage.get('natal-report')).toBe('Novo relatório gerado');
    expect(storage.get('legacy-report')).toBeUndefined();
    expect(container.textContent).toContain('Novo relatório gerado');

    root.unmount();
  });
});

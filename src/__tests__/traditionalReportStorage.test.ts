import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearTraditionalReportFromStorage,
  getTraditionalReportStorageKey,
  getTraditionalReportStorageKeyLegacy,
  loadTraditionalReportFromStorage,
  saveTraditionalReportToStorage,
} from '../lib/traditional/reportStorage';

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
  });
});

describe('traditional report storage', () => {
  it('generates a stable normalized key', () => {
    const key = getTraditionalReportStorageKey({
      name: 'Maria da Luz',
      date: '21/04/2026',
      time: '14:30',
      latitude: -23.55,
      longitude: -46.63,
    } as never);

    expect(key).toBe('traditional_report_v2_maria_da_luz_21_04_2026_14_30_-23.55_-46.63');
    expect(getTraditionalReportStorageKeyLegacy({
      name: 'Maria da Luz',
      date: '21/04/2026',
      time: '14:30',
      latitude: -23.55,
      longitude: -46.63,
    } as never)).toBe('trad_report_Maria da Luz_21/04/2026');
  });

  it('saves, loads and clears both current and legacy keys', () => {
    const birthData = {
      name: 'Maria da Luz',
      date: '21/04/2026',
      time: '14:30',
      latitude: -23.55,
      longitude: -46.63,
    } as never;

    saveTraditionalReportToStorage(birthData, 'Relatório salvo');
    expect(loadTraditionalReportFromStorage(birthData)).toBe('Relatório salvo');

    clearTraditionalReportFromStorage(birthData);
    expect(loadTraditionalReportFromStorage(birthData)).toBe('');
  });
});

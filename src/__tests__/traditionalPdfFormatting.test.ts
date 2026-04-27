import { describe, expect, it } from 'vitest';
import type { Aspect } from '../types';
import {
  filterTraditionalAspects,
  formatPdfAspectRow,
  getAspectLabelPt,
  getPlanetLabelPt,
  translateSectStatus,
} from '../lib/traditional/pdfFormatting';

describe('traditional pdf formatting', () => {
  it('translates aspect and planet labels to pt-BR', () => {
    expect(getAspectLabelPt('conjunction')).toBe('Conjunção');
    expect(getAspectLabelPt('square')).toBe('Quadratura');
    expect(getAspectLabelPt('trine')).toBe('Trígono');
    expect(getPlanetLabelPt('uranus')).toBe('Urano');
    expect(getPlanetLabelPt('neptune')).toBe('Netuno');
    expect(getPlanetLabelPt('pluto')).toBe('Plutão');
  });

  it('filters the aspect list to classical/traditional bodies only', () => {
    const aspects: Aspect[] = [
      { planet1: 'sun', planet2: 'moon', type: 'conjunction', orb: 0.2, applying: true, angle: 0 },
      { planet1: 'uranus', planet2: 'moon', type: 'trine', orb: 1.1, applying: false, angle: 120 },
      { planet1: 'mars', planet2: 'saturn', type: 'square', orb: 2.4, applying: true, angle: 90 },
      { planet1: 'sun', planet2: 'moon', type: 'quincunx', orb: 1.0, applying: false, angle: 150 },
    ];

    const filtered = filterTraditionalAspects(aspects);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((a) => a.type)).toEqual(['conjunction', 'square']);
  });

  it('formats a row with pt-BR labels', () => {
    const row = formatPdfAspectRow({
      planet1: 'uranus',
      planet2: 'neptune',
      type: 'opposition',
      orb: 3.7,
      applying: false,
    });

    expect(row).toEqual({
      planet1: 'Urano',
      planet2: 'Netuno',
      aspect: 'Oposição',
      orb: 3.7,
      applying: false,
    });
  });

  it('translates sect statuses for the traditional PDF tables', () => {
    expect(translateSectStatus('benefic')).toBe('BENÉFICO');
    expect(translateSectStatus('out_of_sect')).toBe('FORA DE SEITA');
    expect(translateSectStatus('MERCURY_VARIABLE')).toBe('SEITA VARIÁVEL');
  });
});

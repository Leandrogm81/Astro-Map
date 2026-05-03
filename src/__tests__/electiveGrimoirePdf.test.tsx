// @vitest-environment jsdom

import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ElectiveGrimoirePDF from '@/components/traditional/ElectiveGrimoirePDF';
import type { NatalChart } from '@/types';

vi.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  Document: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  Page: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
  },
  Text: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  View: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

function buildChart(): NatalChart {
  return {
    birthData: {
      name: 'Teste PDF',
      date: '1990-01-01',
      time: '12:00',
      location: 'São Paulo',
      latitude: -23.55,
      longitude: -46.63,
      timezone: 'America/Sao_Paulo',
    },
    planets: [],
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
    ascendant: 0,
    mc: 0,
  } as NatalChart;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ElectiveGrimoirePDF', () => {
  it('renders a disabled PDF button when the export is not ready', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <ElectiveGrimoirePDF
          chart={buildChart()}
          skyChart={null}
          veredict={null}
          intentionLabel="Amor"
          purposeLabel="Vênus"
          disabled
        />
      );
    });

    const button = container.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.textContent).toContain('PDF');

    root.unmount();
  });
});

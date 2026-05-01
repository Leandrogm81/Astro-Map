import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';
import { fireEvent } from '@testing-library/dom';
import GematriaCalculator from '@/components/kabbalah/GematriaCalculator';
import KabbalahView from '@/components/kabbalah/KabbalahView';
import type { NatalChart } from '@/types';
import { requestHebrewTranslation } from '@/lib/kabbalah/translateClient';

vi.mock('@/lib/kabbalah/translateClient', () => ({
  requestHebrewTranslation: vi.fn(),
}));

const mockedRequestHebrewTranslation = vi.mocked(requestHebrewTranslation);

function buildChart(): NatalChart {
  return {
    birthData: {
      name: 'Leandro',
      date: '1990-01-01',
      time: '12:00',
      location: 'São Paulo, SP',
      latitude: -23.5505,
      longitude: -46.6333,
      timezone: 'America/Sao_Paulo',
    },
    planets: [
      { id: 'neptune', name: 'Netuno', symbol: '♆', longitude: 0, latitude: 0, speed: 0, sign: 'Áries', degree: 0, house: 1, retrograde: false },
      { id: 'uranus', name: 'Urano', symbol: '♅', longitude: 30, latitude: 0, speed: 0, sign: 'Touro', degree: 0, house: 2, retrograde: false },
      { id: 'saturn', name: 'Saturno', symbol: '♄', longitude: 60, latitude: 0, speed: 0, sign: 'Gêmeos', degree: 0, house: 3, retrograde: false },
      { id: 'pluto', name: 'Plutão', symbol: '♇', longitude: 90, latitude: 0, speed: 0, sign: 'Câncer', degree: 0, house: 4, retrograde: false },
      { id: 'jupiter', name: 'Júpiter', symbol: '♃', longitude: 120, latitude: 0, speed: 0, sign: 'Leão', degree: 0, house: 5, retrograde: false },
      { id: 'mars', name: 'Marte', symbol: '♂', longitude: 150, latitude: 0, speed: 0, sign: 'Virgem', degree: 0, house: 6, retrograde: false },
      { id: 'sun', name: 'Sol', symbol: '☉', longitude: 180, latitude: 0, speed: 0, sign: 'Libra', degree: 0, house: 7, retrograde: false },
      { id: 'venus', name: 'Vênus', symbol: '♀', longitude: 210, latitude: 0, speed: 0, sign: 'Escorpião', degree: 0, house: 8, retrograde: false },
      { id: 'mercury', name: 'Mercúrio', symbol: '☿', longitude: 240, latitude: 0, speed: 0, sign: 'Sagitário', degree: 0, house: 9, retrograde: false },
      { id: 'moon', name: 'Lua', symbol: '☽', longitude: 270, latitude: 0, speed: 0, sign: 'Capricórnio', degree: 0, house: 10, retrograde: false },
    ],
    housesPlacidus: Array.from({ length: 12 }, (_, index) => ({
      number: index + 1,
      longitude: index * 30,
      sign: ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'][index] as NatalChart['housesPlacidus'][number]['sign'],
      degree: 0,
    })),
    housesWhole: Array.from({ length: 12 }, (_, index) => ({
      number: index + 1,
      longitude: index * 30,
      sign: ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'][index] as NatalChart['housesWhole'][number]['sign'],
      degree: 0,
    })),
    aspects: [],
    ascendant: 123,
    mc: 300,
  };
}

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost/',
  });

  const globals = globalThis as Record<string, unknown>;
  globals.window = dom.window as unknown as Window & typeof globalThis;
  globals.document = dom.window.document;
  Object.defineProperty(globalThis, 'navigator', {
    value: dom.window.navigator,
    configurable: true,
  });
  globals.HTMLElement = dom.window.HTMLElement;
  globals.Node = dom.window.Node;
  globals.MutationObserver = dom.window.MutationObserver;
  globals.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
  globals.requestAnimationFrame = dom.window.requestAnimationFrame
    ? dom.window.requestAnimationFrame.bind(dom.window)
    : ((callback: FrameRequestCallback) => setTimeout(() => callback(performance.now()), 16) as unknown as number);
  globals.cancelAnimationFrame = dom.window.cancelAnimationFrame
    ? dom.window.cancelAnimationFrame.bind(dom.window)
    : ((handle: number) => clearTimeout(handle));
  globals.IS_REACT_ACT_ENVIRONMENT = true;

  const container = dom.window.document.getElementById('root');
  if (!container) {
    throw new Error('Root container não encontrado.');
  }

  return { dom, container };
}

async function renderReact(element: React.ReactElement): Promise<{ dom: JSDOM; container: HTMLElement; root: import('react-dom/client').Root }> {
  const { dom, container } = installDom();
  const { createRoot } = await import('react-dom/client');
  const root = createRoot(container);

  await act(async () => {
    root.render(element);
  });

  return { dom, container, root };
}

function setInputValue(input: HTMLInputElement, value: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(
    input.ownerDocument.defaultView?.HTMLInputElement.prototype ?? HTMLInputElement.prototype,
    'value'
  );
  descriptor?.set?.call(input, value);
  fireEvent.input(input, { target: { value } });
  fireEvent.change(input, { target: { value } });
}

function findButton(container: HTMLElement, label: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll('button')).find((candidate) =>
    candidate.textContent?.includes(label)
  );

  if (!button) {
    throw new Error(`Button not found: ${label}`);
  }

  return button as HTMLButtonElement;
}

beforeEach(() => {
  mockedRequestHebrewTranslation.mockReset();
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('GematriaCalculator interactions', () => {
  it('translates, switches systems, and resets the form', async () => {
    mockedRequestHebrewTranslation.mockResolvedValueOnce({
      translatedText: 'שלום',
      detectedSourceLang: 'en',
    });

    const { container, root, dom } = await renderReact(
      <GematriaCalculator initialInputText="Leandro" />
    );

    const inputs = container.querySelectorAll('input');
    const originalInput = inputs[0] as HTMLInputElement;
    const hebrewInput = inputs[1] as HTMLInputElement;

    expect(originalInput.value).toBe('Leandro');
    expect(hebrewInput.value).toBe('');

    await act(async () => {
      findButton(container, 'Traduzir').click();
      await Promise.resolve();
    });

    expect(hebrewInput.value).toBe('שלום');
    expect(container.textContent).toContain('Idioma detectado: en');
    expect(container.textContent).toContain('Netzach');

    await act(async () => {
      findButton(container, 'Latina').click();
    });

    expect(container.textContent).toContain('Sistema selecionado');
    expect(container.textContent).toContain('Latina');

    await act(async () => {
      setInputValue(originalInput, 'Leandro Jr');
      await Promise.resolve();
    });

    expect(container.textContent).not.toContain('Idioma detectado: en');

    await act(async () => {
      findButton(container, 'Limpar').click();
      await Promise.resolve();
    });

    expect(originalInput.value).toBe('');
    expect(hebrewInput.value).toBe('');
    expect(container.textContent).toContain('Pronto para a tradução');

    root.unmount();
    dom.window.close();
  });

  it('surfaces translation failures and clears them when editing the Hebrew field', async () => {
    mockedRequestHebrewTranslation.mockRejectedValueOnce(new Error('Google offline'));

    const { container, root, dom } = await renderReact(
      <GematriaCalculator initialInputText="Leandro" />
    );

    const hebrewInput = container.querySelectorAll('input')[1] as HTMLInputElement;

    await act(async () => {
      findButton(container, 'Traduzir').click();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Google offline');

    await act(async () => {
      setInputValue(hebrewInput, 'שלום');
      await Promise.resolve();
    });

    expect(container.textContent).not.toContain('Google offline');

    root.unmount();
    dom.window.close();
  });
});

describe('KabbalahView interactions', () => {
  it('switches between the gematria and tree tabs', async () => {
    const { container, root, dom } = await renderReact(
      <KabbalahView chart={buildChart()} />
    );

    expect(container.textContent).toContain('Gematria + Árvore Sephirótica');
    expect(container.textContent).toContain('Gematria do Nome');

    await act(async () => {
      findButton(container, 'Árvore').click();
    });

    expect(container.textContent).toContain('Árvore Sephirótica');
    expect(container.textContent).toContain('Netuno');
    expect(container.querySelector('svg[aria-label="Árvore Sephirótica com projeção planetária"]')).not.toBeNull();

    const ketherNode = container.querySelector('[aria-label="Sephirah Kether"]');
    expect(ketherNode).not.toBeNull();

    await act(async () => {
      fireEvent.click(ketherNode as Element);
    });

    expect(document.body.textContent).toContain('Correspondências da Golden Dawn');
    expect(container.textContent).toContain('Kether');
    expect(document.body.textContent).toContain('Nome Divino');
    expect(document.body.textContent).toContain('Anjo do Shemhamphorash');

    await act(async () => {
      findButton(container, 'Gematria').click();
    });

    expect(container.textContent).toContain('Gematria do Nome');

    root.unmount();
    dom.window.close();
  });
});

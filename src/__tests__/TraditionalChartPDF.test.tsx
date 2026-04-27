import TraditionalChartPDF from '@/components/TraditionalChartPDF';
import type { NatalChart } from '@/types';
import { describe, expect, it } from 'vitest';

type ReactNodeLike = {
  props?: {
    children?: unknown;
    fill?: unknown;
    stroke?: unknown;
    opacity?: unknown;
    strokeWidth?: unknown;
    style?: unknown;
    x?: unknown;
    y?: unknown;
  };
};

type PositionedText = {
  children: unknown;
  x: number;
  y: number;
  style?: Record<string, unknown>;
};

type LineLike = {
  stroke?: unknown;
  opacity?: unknown;
  strokeWidth?: unknown;
};

function collectColors(node: unknown, colors: string[] = []): string[] {
  if (!node) return colors;

  if (Array.isArray(node)) {
    for (const child of node) collectColors(child, colors);
    return colors;
  }

  if (typeof node !== 'object') return colors;

  const element = node as ReactNodeLike;
  const props = element.props;
  if (!props) return colors;

  if (typeof props.fill === 'string') colors.push(props.fill);
  if (typeof props.stroke === 'string') colors.push(props.stroke);

  if (props.style && typeof props.style === 'object' && !Array.isArray(props.style)) {
    const style = props.style as Record<string, unknown>;
    if (typeof style.fill === 'string') colors.push(style.fill);
  }

  collectColors(props.children, colors);
  return colors;
}

function asStyleRecord(style: unknown): Record<string, unknown> | undefined {
  if (!style || typeof style !== 'object' || Array.isArray(style)) return undefined;
  return style as Record<string, unknown>;
}

function collectPositionedText(node: unknown, texts: PositionedText[] = []): PositionedText[] {
  if (!node) return texts;

  if (Array.isArray(node)) {
    for (const child of node) collectPositionedText(child, texts);
    return texts;
  }

  if (typeof node !== 'object') return texts;

  const element = node as ReactNodeLike;
  const props = element.props;
  if (!props) return texts;

  if (props.children !== undefined && typeof props.x === 'number' && typeof props.y === 'number') {
    texts.push({
      children: props.children,
      x: props.x,
      y: props.y,
      style: asStyleRecord(props.style),
    });
  }

  collectPositionedText(props.children, texts);
  return texts;
}

function collectLines(node: unknown, lines: LineLike[] = []): LineLike[] {
  if (!node) return lines;

  if (Array.isArray(node)) {
    for (const child of node) collectLines(child, lines);
    return lines;
  }

  if (typeof node !== 'object') return lines;

  const element = node as ReactNodeLike;
  const props = element.props;
  if (!props) return lines;

  if (props.stroke !== undefined && props.opacity !== undefined) {
    lines.push({
      stroke: props.stroke,
      opacity: props.opacity,
      strokeWidth: props.strokeWidth,
    });
  }

  collectLines(props.children, lines);
  return lines;
}

function findPositionedText(texts: PositionedText[], children: unknown, fontSize: number): PositionedText | undefined {
  return texts.find((text) => text.children === children && text.style?.fontSize === fontSize);
}

function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

function chartAngle(longitude: number, ascendant: number): number {
  return ((180 - normalizeLongitude(longitude - ascendant)) * Math.PI) / 180;
}

function expectedPoint(longitude: number, ascendant: number, radius: number, offsetX: number, offsetY: number) {
  const angle = chartAngle(longitude, ascendant);
  return {
    x: 175 + radius * Math.cos(angle) + offsetX,
    y: 175 + radius * Math.sin(angle) + offsetY,
  };
}

function buildHouses(start: number, step: number): NatalChart['housesPlacidus'] {
  return Array.from({ length: 12 }, (_, index) => ({
    number: index + 1,
    longitude: normalizeLongitude(start + index * step),
    sign: 'Áries',
    degree: 0,
  }));
}

function buildChart(overrides: Partial<NatalChart> = {}): NatalChart {
  return {
    birthData: {
      name: 'Teste PDF',
      date: '1990-01-01',
      time: '12:00',
      location: 'Sao Paulo',
      latitude: -23.55,
      longitude: -46.63,
      timezone: 'America/Sao_Paulo',
    },
    planets: [
      { id: 'sun', name: 'Sol', symbol: 'S', longitude: 15, latitude: 0, speed: 1, sign: 'Áries', degree: 15, house: 1, retrograde: false },
      { id: 'moon', name: 'Lua', symbol: 'M', longitude: 45, latitude: 0, speed: 1, sign: 'Touro', degree: 15, house: 2, retrograde: false },
      { id: 'mercury', name: 'Mercúrio', symbol: 'Me', longitude: 75, latitude: 0, speed: 1, sign: 'Gêmeos', degree: 15, house: 3, retrograde: false },
      { id: 'venus', name: 'Vênus', symbol: 'V', longitude: 105, latitude: 0, speed: 1, sign: 'Câncer', degree: 15, house: 4, retrograde: false },
      { id: 'mars', name: 'Marte', symbol: 'Ma', longitude: 135, latitude: 0, speed: 1, sign: 'Leão', degree: 15, house: 5, retrograde: false },
      { id: 'jupiter', name: 'Júpiter', symbol: 'J', longitude: 165, latitude: 0, speed: 1, sign: 'Virgem', degree: 15, house: 6, retrograde: false },
      { id: 'saturn', name: 'Saturno', symbol: 'Sa', longitude: 195, latitude: 0, speed: 1, sign: 'Libra', degree: 15, house: 7, retrograde: false },
    ],
    housesPlacidus: buildHouses(0, 30),
    housesWhole: buildHouses(0, 30),
    aspects: [],
    ascendant: 0,
    mc: 90,
    ...overrides,
  };
}

describe('TraditionalChartPDF', () => {
  it('uses the white PDF palette with higher-contrast labels and planet colors', () => {
    const tree = TraditionalChartPDF({ chart: buildChart(), size: 350 });
    const colors = collectColors(tree);

    expect(colors).toContain('#ffffff');
    expect(colors).toContain('#64748b');
    expect(colors).toContain('#e2e8f0');
    expect(colors).toContain('#475569');
    expect(colors).toContain('#d97706');

    expect(colors).not.toContain('#050816');
    expect(colors).not.toContain('#0b1220');
    expect(colors).not.toContain('#24324b');
    expect(colors).not.toContain('#f59e0b');
    expect(colors).not.toContain('#cbd5e1');
  });

  it('labels the whole sign angular house lines without legacy axis lines', () => {
    const chart = buildChart({
      ascendant: 100,
      mc: 20,
      housesPlacidus: buildHouses(100, 27),
      housesWhole: buildHouses(90, 30),
    });
    const tree = TraditionalChartPDF({ chart, size: 350 });
    const texts = collectPositionedText(tree);
    const lines = collectLines(tree);

    const houseOne = findPositionedText(texts, 1, 8);
    if (!houseOne) throw new Error('House 1 label not found');

    const expectedHouseOne = expectedPoint(105, 100, 95, -2.5, 2.5);
    expect(houseOne.x).toBeCloseTo(expectedHouseOne.x, 4);
    expect(houseOne.y).toBeCloseTo(expectedHouseOne.y, 4);

    const expectedAxes = [
      ['AC', 90],
      ['IC', 180],
      ['DC', 270],
      ['MC', 0],
    ] as const;

    for (const [label, longitude] of expectedAxes) {
      const axisLabel = findPositionedText(texts, label, 10);
      if (!axisLabel) throw new Error(`${label} label not found`);

      const expectedAxis = expectedPoint(longitude, 100, 170, -9, 4);
      expect(axisLabel.x).toBeCloseTo(expectedAxis.x, 4);
      expect(axisLabel.y).toBeCloseTo(expectedAxis.y, 4);
    }

    const legacyAxisLines = lines.filter((line) => line.stroke === '#fbbf24' && line.opacity === 0.9);
    expect(legacyAxisLines).toHaveLength(0);
  });
});

import type { ZodiacSign } from '@/types';
import type { SephirahName } from './types';

export const HEBREW_VALUES = {
  א: 1,
  ב: 2,
  ג: 3,
  ד: 4,
  ה: 5,
  ו: 6,
  ז: 7,
  ח: 8,
  ט: 9,
  י: 10,
  כ: 20,
  ך: 20,
  ל: 30,
  מ: 40,
  ם: 40,
  נ: 50,
  ן: 50,
  ס: 60,
  ע: 70,
  פ: 80,
  ף: 80,
  צ: 90,
  ץ: 90,
  ק: 100,
  ר: 200,
  ש: 300,
  ת: 400,
} satisfies Record<string, number>;

export const HEBREW_ORDINAL_VALUES = {
  א: 1,
  ב: 2,
  ג: 3,
  ד: 4,
  ה: 5,
  ו: 6,
  ז: 7,
  ח: 8,
  ט: 9,
  י: 10,
  כ: 11,
  ך: 23,
  ל: 12,
  מ: 13,
  ם: 24,
  נ: 14,
  ן: 25,
  ס: 15,
  ע: 16,
  פ: 17,
  ף: 26,
  צ: 18,
  ץ: 27,
  ק: 19,
  ר: 20,
  ש: 21,
  ת: 22,
} satisfies Record<string, number>;

export const HEBREW_KATAN_VALUES = {
  א: 1,
  ב: 2,
  ג: 3,
  ד: 4,
  ה: 5,
  ו: 6,
  ז: 7,
  ח: 8,
  ט: 9,
  י: 1,
  כ: 2,
  ך: 2,
  ל: 3,
  מ: 4,
  ם: 4,
  נ: 5,
  ן: 5,
  ס: 6,
  ע: 7,
  פ: 8,
  ף: 8,
  צ: 9,
  ץ: 9,
  ק: 1,
  ר: 2,
  ש: 3,
  ת: 4,
} satisfies Record<string, number>;

export const SEPHIROTH_COORDS: Record<SephirahName, { x: number; y: number }> = {
  Kether: { x: 200, y: 40 },
  Chokmah: { x: 310, y: 100 },
  Binah: { x: 90, y: 100 },
  Daath: { x: 200, y: 160 },
  Chesed: { x: 310, y: 220 },
  Geburah: { x: 90, y: 220 },
  Tiphereth: { x: 200, y: 290 },
  Netzach: { x: 310, y: 370 },
  Hod: { x: 90, y: 370 },
  Yesod: { x: 200, y: 440 },
  Malkuth: { x: 200, y: 540 },
};

export const SEPHIRAH_RADIUS = 28;

export const TREE_PATHS: readonly [SephirahName, SephirahName][] = [
  ['Kether', 'Chokmah'],
  ['Kether', 'Binah'],
  ['Kether', 'Tiphereth'],
  ['Chokmah', 'Binah'],
  ['Chokmah', 'Chesed'],
  ['Chokmah', 'Tiphereth'],
  ['Binah', 'Geburah'],
  ['Binah', 'Tiphereth'],
  ['Chesed', 'Geburah'],
  ['Chesed', 'Tiphereth'],
  ['Chesed', 'Netzach'],
  ['Geburah', 'Tiphereth'],
  ['Geburah', 'Hod'],
  ['Tiphereth', 'Netzach'],
  ['Tiphereth', 'Yesod'],
  ['Tiphereth', 'Hod'],
  ['Netzach', 'Hod'],
  ['Netzach', 'Yesod'],
  ['Netzach', 'Malkuth'],
  ['Hod', 'Yesod'],
  ['Hod', 'Malkuth'],
  ['Yesod', 'Malkuth'],
];

export const PILLAR_COLORS = {
  Misericórdia: '#3b82f6',
  Severidade: '#ef4444',
  Equilíbrio: '#d4af37',
} as const;

export const ZODIAC_SIGNS_ORDER: readonly ZodiacSign[] = [
  'Áries',
  'Touro',
  'Gêmeos',
  'Câncer',
  'Leão',
  'Virgem',
  'Libra',
  'Escorpião',
  'Sagitário',
  'Capricórnio',
  'Aquário',
  'Peixes',
];

export function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

export function getZodiacSignFromLongitude(longitude: number): ZodiacSign {
  const normalized = normalizeLongitude(longitude);
  return ZODIAC_SIGNS_ORDER[Math.floor(normalized / 30)] ?? 'Áries';
}

export function getDegreeInSign(longitude: number): number {
  const normalized = normalizeLongitude(longitude);
  return normalized % 30;
}

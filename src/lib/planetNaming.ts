export type PlanetId =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto';

export const PLANET_IDS: PlanetId[] = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
];

export const SUPPORTED_PLANET_IDS = new Set<PlanetId>(PLANET_IDS);

export function isSupportedPlanet(id: string): id is PlanetId {
  return SUPPORTED_PLANET_IDS.has(id as PlanetId);
}

export const PLANET_LABELS_PT_BR: Record<PlanetId, string> = {
  sun: 'Sol',
  moon: 'Lua',
  mercury: 'Mercúrio',
  venus: 'Vênus',
  mars: 'Marte',
  jupiter: 'Júpiter',
  saturn: 'Saturno',
  uranus: 'Urano',
  neptune: 'Netuno',
  pluto: 'Plutão',
};

const PLANET_ALIASES: Record<string, PlanetId> = {
  sol: 'sun',
  sun: 'sun',
  lua: 'moon',
  moon: 'moon',
  mercurio: 'mercury',
  mercúrio: 'mercury',
  mercury: 'mercury',
  venus: 'venus',
  vênus: 'venus',
  marte: 'mars',
  mars: 'mars',
  jupiter: 'jupiter',
  júpiter: 'jupiter',
  saturno: 'saturn',
  saturn: 'saturn',
  urano: 'uranus',
  uranus: 'uranus',
  netuno: 'neptune',
  neptune: 'neptune',
  plutão: 'pluto',
  plutao: 'pluto',
  pluto: 'pluto',
};

export function normalizePlanetKey(input: string): PlanetId | null {
  const normalized = (input ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const result = PLANET_ALIASES[normalized];
  return result ?? null;
}

export function planetLabelPtBr(id: PlanetId): string {
  return PLANET_LABELS_PT_BR[id] ?? id;
}

export function isPlanetId(value: string): value is PlanetId {
  return PLANET_IDS.includes(value as PlanetId);
}

export function getPlanetLabel(input: string): string {
  const id = normalizePlanetKey(input);
  if (!id) return input;
  return planetLabelPtBr(id);
}

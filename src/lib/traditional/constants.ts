import { PlanetKey } from './magic-correspondences';
import { MagicPurpose } from './types';

export const PLANET_NAME_PT: Record<string, string> = {
  sun: 'Sol',
  moon: 'Lua',
  mercury: 'Mercúrio',
  venus: 'Vênus',
  mars: 'Marte',
  jupiter: 'Júpiter',
  saturn: 'Saturno',
  Sun: 'Sol',
  Moon: 'Lua',
  Mercury: 'Mercúrio',
  Venus: 'Vênus',
  Mars: 'Marte',
  Jupiter: 'Júpiter',
  Saturn: 'Saturno',
};

export const MAGIC_PURPOSE_PT: Record<MagicPurpose, string> = {
  authority: 'Autoridade e Liderança',
  emotion: 'Emoções, Sonhos e Intuição',
  communication: 'Comunicação, Estudos e Comércio',
  love: 'Amor e Relacionamentos',
  conflict: 'Conflito, Defesa e Retribuição',
  expansion: 'Expansão Financeira e Favores',
  structure: 'Disciplina, Limites e Sabedoria Oculta',
};

export function translatePlanetNamePt(name: string | null | undefined): string {
  if (!name) return 'N/A';
  return PLANET_NAME_PT[name] || name;
}

export function translatePlanetKeyPt(planet: PlanetKey): string {
  return translatePlanetNamePt(planet);
}

export function translateMagicPurposePt(purpose: MagicPurpose): string {
  return MAGIC_PURPOSE_PT[purpose];
}

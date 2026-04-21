import { Aspect } from '@/types';
import { normalizePlanetKey, planetLabelPtBr, PlanetId } from '@/lib/planetNaming';

export const TRADITIONAL_CLASSIC_PLANET_IDS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
] as const;

export const TRADITIONAL_ASPECT_LABELS_PT = {
  conjunction: 'Conjunção',
  sextile: 'Sextil',
  square: 'Quadratura',
  trine: 'Trígono',
  opposition: 'Oposição',
} as const;

export type TraditionalAspectType = keyof typeof TRADITIONAL_ASPECT_LABELS_PT;

export interface PdfAspectRow {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  applying: boolean;
}

export function getPlanetLabelPt(input: string): string {
  const planetId = normalizePlanetKey(input);
  if (!planetId) return input;

  return planetLabelPtBr(planetId);
}

export function getAspectLabelPt(type: string): string {
  if (isTraditionalAspectType(type)) {
    return TRADITIONAL_ASPECT_LABELS_PT[type];
  }

  return type.toUpperCase();
}

export function isTraditionalPlanet(input: string): boolean {
  const planetId = normalizePlanetKey(input);
  return !!planetId && TRADITIONAL_CLASSIC_PLANET_IDS.includes(planetId as PlanetId);
}

export function isTraditionalAspectType(type: string): type is TraditionalAspectType {
  return type in TRADITIONAL_ASPECT_LABELS_PT;
}

export function isTraditionalAspect(aspect: Pick<Aspect, 'planet1' | 'planet2' | 'type'>): boolean {
  return (
    isTraditionalAspectType(aspect.type) &&
    isTraditionalPlanet(aspect.planet1) &&
    isTraditionalPlanet(aspect.planet2)
  );
}

export function filterTraditionalAspects(aspects: Aspect[]): Aspect[] {
  return aspects.filter(isTraditionalAspect);
}

export function formatPdfAspectRow(aspect: Pick<Aspect, 'planet1' | 'planet2' | 'type' | 'orb' | 'applying'>): PdfAspectRow {
  return {
    planet1: getPlanetLabelPt(aspect.planet1),
    planet2: getPlanetLabelPt(aspect.planet2),
    aspect: getAspectLabelPt(aspect.type),
    orb: aspect.orb,
    applying: aspect.applying,
  };
}

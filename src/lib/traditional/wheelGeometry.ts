import type { NatalChart } from '@/types';

export interface TraditionalAxisLongitudes {
  ac: number;
  dc: number;
  mc: number;
  ic: number;
}

export function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

export function getTraditionalWheelAnchor(chart: Pick<NatalChart, 'ascendant' | 'housesPlacidus'>): number {
  return chart.housesPlacidus?.[0]?.longitude ?? chart.ascendant ?? 0;
}

export function longitudeToTraditionalAngle(longitude: number, anchorLongitude: number): number {
  const delta = normalizeLongitude(longitude - anchorLongitude);
  return ((180 - delta) * Math.PI) / 180;
}

export function getTraditionalAxisLongitudes(
  chart: Pick<NatalChart, 'ascendant' | 'mc' | 'housesPlacidus'>
): TraditionalAxisLongitudes {
  const ac = chart.housesPlacidus?.[0]?.longitude ?? chart.ascendant ?? 0;
  const dc = chart.housesPlacidus?.[6]?.longitude ?? normalizeLongitude(ac + 180);
  const mc = chart.housesPlacidus?.[9]?.longitude ?? chart.mc ?? normalizeLongitude(ac + 90);
  const ic = chart.housesPlacidus?.[3]?.longitude ?? normalizeLongitude(mc + 180);

  return { ac, dc, mc, ic };
}

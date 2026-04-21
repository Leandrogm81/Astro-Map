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

/**
 * Calcula a posição ideal de um tooltip no SVG da roda tradicional,
 * garantindo que ele não saia dos limites do viewBox (0-800).
 * 
 * @returns ox, oy (offsets relativos ao ponto de foco)
 */
export function getTraditionalTooltipPosition(
  focusX: number,
  focusY: number,
  boxWidth: number,
  boxHeight: number,
  viewBoxWidth: number = 800,
  viewBoxHeight: number = 800
): { ox: number; oy: number } {
  // Lado preferencial oposto ao centro (CX=400)
  const isRightHalf = focusX > viewBoxWidth / 2;
  
  // Tenta posicionar no lado oposto para não cobrir o centro da roda
  let ox = isRightHalf ? focusX - boxWidth - 35 : focusX + 35;
  
  // Clamping Horizontal (margem de 5px)
  if (ox < 5) ox = 5;
  if (ox + boxWidth > viewBoxWidth - 5) ox = viewBoxWidth - boxWidth - 5;

  // Vertical: Tenta centralizar no foco Y
  let oy = focusY - boxHeight / 2;
  
  // Clamping Vertical (margem de 5px)
  if (oy < 5) oy = 5;
  if (oy + boxHeight > viewBoxHeight - 5) oy = viewBoxHeight - boxHeight - 5;

  // Retorna os offsets relativos ao focusX/focusY
  return { ox: ox - focusX, oy: oy - focusY };
}

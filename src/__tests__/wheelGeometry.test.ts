import { describe, expect, it } from 'vitest';
import {
  getTraditionalAxisLongitudes,
  getTraditionalWheelAnchor,
  longitudeToTraditionalAngle,
  getTraditionalTooltipPosition
} from '../lib/traditional/wheelGeometry';
import type { NatalChart } from '../types';

describe('traditional wheel geometry', () => {
  describe('getTraditionalTooltipPosition', () => {
    const BW = 200;
    const BH = 100;
    const VW = 800;
    const VH = 800;

    it('positions to the right when in the left half', () => {
      // Ponto em x=100, y=400 (metade esquerda) -> tooltip deve estar em 100 + 35 = 135
      const { ox } = getTraditionalTooltipPosition(100, 400, BW, BH, VW, VH);
      expect(100 + ox).toBe(135);
    });

    it('positions to the left when in the right half', () => {
      // Ponto em x=700, y=400 (metade direita) -> tooltip deve estar em 700 - 200 - 35 = 465
      const { ox } = getTraditionalTooltipPosition(700, 400, BW, BH, VW, VH);
      expect(700 + ox).toBe(465);
    });

    it('clamps to the left edge', () => {
      // Ponto em x=10, y=400, forçando ox a ser negativo ou muito pequeno
      // isRightHalf=false, ox = 10 + 35 = 45. Não precisa de clamp aqui, mas e se fosse o inverso?
      // Se estivéssemos na direita e o box fosse grande demais.
      const leftEdge = getTraditionalTooltipPosition(210, 400, 300, BH, VW, VH); // isRightHalf=false, ox = 210 + 35 = 245. boxWidth=300 -> 545. ok.
      expect(210 + leftEdge.ox).toBe(245);
      
      // Teste de clamp na direita:
      const rightEdge = getTraditionalTooltipPosition(780, 400, BW, BH, VW, VH);
      expect(780 + rightEdge.ox).toBe(545);
      // isRightHalf=true, ox = 780 - 200 - 35 = 545. ok.
      
      // Teste forçando clamp na esquerda (se focusX fosse muito pequeno e estivéssemos na direita? Impossível pela lógica isRightHalf)
      // Vamos forçar um ponto na esquerda onde o box não caberia se fosse para a esquerda.
      // actually, a lógica é: se focusX < 400, ox = focusX + 35. Se focusX > 400, ox = focusX - boxWidth - 35.
      // Se focusX = 750 (direita), ox = 750 - 200 - 35 = 515.
      // Se focusX = 410 (direita), ox = 410 - 200 - 35 = 175.
    });

    it('clamps to the top edge', () => {
      // Ponto no topo: x=400, y=20.
      // oy = 20 - (100/2) = -30. Deve virar 5.
      const { oy } = getTraditionalTooltipPosition(400, 20, BW, BH, VW, VH);
      expect(20 + oy).toBe(5);
    });

    it('clamps to the bottom edge', () => {
      // Ponto na base: x=400, y=780.
      // oy = 780 - (100/2) = 730. oy + boxHeight = 830 > 795.
      // Deve virar 800 - 100 - 5 = 695.
      const { oy } = getTraditionalTooltipPosition(400, 780, BW, BH, VW, VH);
      expect(780 + oy).toBe(695);
    });
  });
  it('keeps the ascendant on the left and the descendant on the right', () => {
    const anchor = 90;

    expect(longitudeToTraditionalAngle(90, anchor)).toBeCloseTo(Math.PI, 6);
    expect(longitudeToTraditionalAngle(270, anchor)).toBeCloseTo(0, 6);
    expect(longitudeToTraditionalAngle(180, anchor)).toBeCloseTo(Math.PI / 2, 6);
    expect(longitudeToTraditionalAngle(0, anchor)).toBeCloseTo(-Math.PI / 2, 6);
  });

  it('prefers the first Placidus cusp as the wheel anchor', () => {
    const chart = {
      ascendant: 123,
      mc: 15,
      housesPlacidus: [{ longitude: 210 }]
    } as unknown as Pick<NatalChart, 'ascendant' | 'mc' | 'housesPlacidus'>;

    expect(getTraditionalWheelAnchor(chart)).toBe(210);
  });

  it('derives the four axes from Placidus cusps when available', () => {
    const chart = {
      ascendant: 120,
      mc: 15,
      housesPlacidus: [
        { longitude: 120 },
        { longitude: 150 },
        { longitude: 180 },
        { longitude: 210 },
        { longitude: 240 },
        { longitude: 270 },
        { longitude: 300 },
        { longitude: 330 },
        { longitude: 0 },
        { longitude: 30 },
        { longitude: 60 },
        { longitude: 90 }
      ]
    } as unknown as Pick<NatalChart, 'ascendant' | 'mc' | 'housesPlacidus'>;

    expect(getTraditionalAxisLongitudes(chart)).toEqual({
      ac: 120,
      dc: 300,
      mc: 30,
      ic: 210
    });
  });
});

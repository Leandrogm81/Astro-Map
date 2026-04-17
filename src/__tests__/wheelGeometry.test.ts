import { describe, expect, it } from 'vitest';
import {
  getTraditionalAxisLongitudes,
  getTraditionalWheelAnchor,
  longitudeToTraditionalAngle
} from '../lib/traditional/wheelGeometry';

describe('traditional wheel geometry', () => {
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
      housesPlacidus: [{ longitude: 210 }] as any
    } as any;

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
      ] as any
    } as any;

    expect(getTraditionalAxisLongitudes(chart)).toEqual({
      ac: 120,
      dc: 300,
      mc: 30,
      ic: 210
    });
  });
});

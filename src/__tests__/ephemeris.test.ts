import { describe, it, expect } from 'vitest';
import { parseTimezoneOffset, dateToJD } from '../lib/ephemeris';

describe('Ephemeris Engine Helpers', () => {
  describe('parseTimezoneOffset', () => {
    it('should correctly parse positive and negative offsets', () => {
      expect(parseTimezoneOffset('UTC-3:00')).toBe(-3);
      expect(parseTimezoneOffset('UTC+2:00')).toBe(2);
      expect(parseTimezoneOffset('UTC-10:30')).toBe(-10.5);
      expect(parseTimezoneOffset('UTC+5:45')).toBe(5.75);
    });

    it('should return 0 for invalid formats', () => {
      expect(parseTimezoneOffset('invalid')).toBe(0);
      expect(parseTimezoneOffset('')).toBe(0);
    });
  });

  describe('dateToJD', () => {
    it('should return correct Julian Date for J2000 epoch', () => {
      // J2000 is 1st Jan 2000 12:00:00 UTC
      const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
      expect(dateToJD(j2000)).toBeCloseTo(2451545.0, 4);
    });
  });
});

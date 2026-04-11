import { describe, it, expect } from 'vitest';
import { getZodiacSign, getSignDegree, getDignity } from '../lib/astrology';

describe('Astrology Core Logic', () => {
  describe('getZodiacSign', () => {
    it('should correctly identify sign boundaries', () => {
      expect(getZodiacSign(0)).toBe('Áries');
      expect(getZodiacSign(29.99)).toBe('Áries');
      expect(getZodiacSign(30)).toBe('Touro');
      expect(getZodiacSign(359.99)).toBe('Peixes');
      expect(getZodiacSign(360)).toBe('Áries');
      expect(getZodiacSign(400)).toBe('Touro'); // Handle wrap around
    });
  });

  describe('getSignDegree', () => {
    it('should return degree within the sign (0-30)', () => {
      expect(getSignDegree(0)).toBe(0);
      expect(getSignDegree(45.5)).toBe(15.5);
      expect(getSignDegree(359)).toBe(29);
    });
  });

  describe('getDignity', () => {
    it('should return Domicílio for planets in home signs', () => {
      expect(getDignity('Sol', 'Leão')).toBe('Domicílio');
      expect(getDignity('Mercúrio', 'Gêmeos')).toBe('Domicílio');
      expect(getDignity('Mercúrio', 'Virgem')).toBe('Domicílio');
    });

    it('should return Exílio for planets in opposite signs', () => {
      expect(getDignity('Sol', 'Aquário')).toBe('Exílio');
      expect(getDignity('Lua', 'Capricórnio')).toBe('Exílio');
    });

    it('should return "Neutro / Peregrino" for neutral signs', () => {
      expect(getDignity('Marte', 'Gêmeos')).toBe('Neutro / Peregrino');
    });
  });
});

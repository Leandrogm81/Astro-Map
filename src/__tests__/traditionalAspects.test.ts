import { describe, it, expect } from 'vitest';
import { calculateMoonVoidOfCourse, calculateTraditionalAspects } from '../lib/traditional/aspects';
import { PlanetPosition, ZodiacSign } from '../types';

describe('Traditional Aspects - Moon Void of Course', () => {
  const mockMoon = (lon: number, speed: number = 13.2): PlanetPosition => ({
    id: 'moon',
    name: 'Lua',
    symbol: '☽',
    longitude: lon,
    latitude: 0,
    speed,
    sign: 'Áries', // Simplified for testing
    degree: lon % 30,
    house: 1,
    retrograde: false,
  });

  const mockPlanet = (id: string, lon: number, speed: number = 0.98): PlanetPosition => ({
    id,
    name: id.toUpperCase(),
    symbol: '',
    longitude: lon,
    latitude: 0,
    speed,
    sign: 'Áries',
    degree: lon % 30,
    house: 1,
    retrograde: false,
  });

  it('should detect when Moon is NOT void (upcoming conjunction)', () => {
    const moon = mockMoon(10, 13.0); // 10° Aries
    const sun = mockPlanet('sun', 20, 1.0); // 20° Aries
    
    const result = calculateMoonVoidOfCourse(moon, [sun]);
    
    expect(result.isVoid).toBe(false);
    expect(result.nextAspect).toContain('Sol');
    expect(result.nextAspect).toContain('conjunção');
  });

  it('should detect when Moon IS void (no upcoming aspects in sign)', () => {
    const moon = mockMoon(25, 13.0); // 25° Aries
    const sun = mockPlanet('sun', 10, 1.0); // 10° Aries (already passed)
    
    const result = calculateMoonVoidOfCourse(moon, [sun]);
    
    expect(result.isVoid).toBe(true);
    expect(result.nextAspect).toBeUndefined();
  });

  it('should detect upcoming sextile', () => {
    const moon = mockMoon(10, 13.0); // 10° Aries
    const jupiter = mockPlanet('jupiter', 75, 0.1); // 15° Gemini (75° total)
    // Relative distance: 65°. Moon is at 10, Jupiter at 75. 
    // Target sextile is at 60°. (10 + dist) - 75 = 60? No.
    // Rel position: moon - jupiter = 10 - 75 = -65 = 295°.
    // Target angles: 0, 60, 90, 120, 180, 240, 270, 300.
    // Closest upcoming target for Moon (faster) is 300° (sextile).
    // Current rel lon: (10 - 75 + 360) % 360 = 295°.
    // Dist to 300: 5°.
    // Moon speed 13, Jupiter 0.1. Rel speed 12.9.
    // T = 5 / 12.9 = ~0.38 hours.
    // Moon at T: 10 + 13*0.38 = 10 + 5 = 15° Aries. (Still in Aries).
    
    const result = calculateMoonVoidOfCourse(moon, [jupiter]);
    
    expect(result.isVoid).toBe(false);
    expect(result.nextAspect).toContain('Júpiter');
    expect(result.nextAspect).toContain('sextil');
  });

  it('should respect sign boundaries', () => {
    const moon = mockMoon(28, 13.0); // 28° Aries
    const sun = mockPlanet('sun', 35, 1.0); // 5° Taurus
    // Moon needs 7° to reach Sun.
    // Moon speed 13, Sun 1. Rel speed 12.
    // T = 7 / 12 = 0.58 hours.
    // Moon at T: 28 + 13 * 0.58 = 28 + 7.5 = 35.5° (Taurus!).
    // Sign end is 30°.
    
    const result = calculateMoonVoidOfCourse(moon, [sun]);
    
    expect(result.isVoid).toBe(true);
  });
});

describe('Traditional Aspects - calculateTraditionalAspects', () => {
  const mockPlanet = (id: string, lon: number, speed: number = 0.98): PlanetPosition => ({
    id,
    name: id.toUpperCase(),
    symbol: '',
    longitude: lon,
    latitude: 0,
    speed,
    sign: 'Áries',
    degree: lon % 30,
    house: 1,
    retrograde: false,
  });

  it('should calculate aspects based on Moiety orbs', () => {
    // Sun orb: 15, Moon orb: 12. Combined: 13.5
    const sun = mockPlanet('sun', 10, 0.98);
    const moon = mockPlanet('moon', 23, 13.2); // Dist: 13° (just within 13.5)
    
    const aspects = calculateTraditionalAspects([sun, moon]);
    
    expect(aspects.length).toBe(1);
    expect(aspects[0].type).toBe('conjunction');
    expect(aspects[0].orb).toBeCloseTo(13.0);
  });

  it('should determine applying vs separating correctly', () => {
    // Moon (faster) at 10, Sun at 12. Moon is approaching Sun (applying).
    const moon = mockPlanet('moon', 10, 13.2);
    const sun = mockPlanet('sun', 12, 0.98);
    
    const aspects = calculateTraditionalAspects([moon, sun]);
    
    expect(aspects[0].isApplying).toBe(true);
    
    // Moon at 14, Sun at 12. Moon is moving away from Sun (separating).
    const moonSep = mockPlanet('moon', 14, 13.2);
    const aspectsSep = calculateTraditionalAspects([moonSep, sun]);
    
    expect(aspectsSep[0].isApplying).toBe(false);
  });
});

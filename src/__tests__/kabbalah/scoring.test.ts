import { describe, it, expect } from 'vitest';
import { calculateSephirothScores } from '@/lib/kabbalah/scoring';
import { SephirothMapping } from '@/lib/kabbalah/types';
import { Aspect } from '@/types';

describe('Kabbalah Planetary Scoring', () => {
  it('calculates base score for a planet with no dignities or aspects', () => {
    const mappings = [
      {
        sephirah: { name: 'Geburah' },
        planetName: 'Marte',
        sign: 'Gêmeos', // Mars has no essential dignity here
        longitude: 60,
        retrograde: false
      }
    ] as unknown as SephirothMapping[];
    
    const scores = calculateSephirothScores(mappings, [], 'Leão');
    expect(scores.Geburah).toBeDefined();
    expect(scores.Geburah.score).toBe(50);
    expect(scores.Geburah.trueScore).toBe(50);
  });

  it('calculates score with domicile dignity', () => {
    const mappings = [
      {
        sephirah: { name: 'Geburah' },
        planetName: 'Marte',
        sign: 'Áries', // Mars in domicile
        longitude: 15,
        retrograde: false
      }
    ] as unknown as SephirothMapping[];
    
    const scores = calculateSephirothScores(mappings, [], 'Leão');
    expect(scores.Geburah.score).toBe(70); // 50 + 20
    expect(scores.Geburah.details.some(d => d.reason.includes('Domicílio'))).toBe(true);
  });

  it('calculates score with fall and retrograde penalties', () => {
    const mappings = [
      {
        sephirah: { name: 'Geburah' },
        planetName: 'Marte',
        sign: 'Câncer', // Mars in fall (-20)
        longitude: 95,
        retrograde: true // Retrograde (-10)
      }
    ] as unknown as SephirothMapping[];
    
    const scores = calculateSephirothScores(mappings, [], 'Leão');
    expect(scores.Geburah.score).toBe(20); // 50 - 20 - 10 = 20
    expect(scores.Geburah.details.length).toBe(3); // Base, Queda, Retrógrado
  });

  it('calculates cazimi bonus', () => {
    const mappings = [
      {
        sephirah: { name: 'Tiphereth' },
        planetName: 'Sol',
        longitude: 0,
        sign: 'Áries',
        retrograde: false
      },
      {
        sephirah: { name: 'Hod' },
        planetName: 'Mercúrio',
        longitude: 0.1, // 0.1 degrees away (Cazimi <= 0.28)
        sign: 'Áries',
        retrograde: false
      }
    ] as unknown as SephirothMapping[];
    
    const scores = calculateSephirothScores(mappings, [], 'Leão');
    expect(scores.Hod.score).toBe(65); // 50 + 15
    expect(scores.Hod.details.some(d => d.reason === 'Cazimi')).toBe(true);
  });

  it('calculates aspect modifiers', () => {
    const mappings = [
      {
        sephirah: { name: 'Netzach' },
        planetName: 'Vênus',
        sign: 'Gêmeos',
        longitude: 60,
        retrograde: false
      }
    ] as unknown as SephirothMapping[];
    
    const aspects: Aspect[] = [
      {
        planet1: 'venus',
        planet2: 'mars',
        type: 'trine', // +8
        angle: 120,
        orb: 1,
        applying: true
      },
      {
        planet1: 'saturn',
        planet2: 'venus',
        type: 'square', // -8
        angle: 90,
        orb: 2,
        applying: false
      }
    ];
    
    const scores = calculateSephirothScores(mappings, aspects, 'Leão');
    expect(scores.Netzach.score).toBe(50); // 50 + 8 - 8
    expect(scores.Netzach.details.some(d => d.reason.includes('Trígono'))).toBe(true);
    expect(scores.Netzach.details.some(d => d.reason.includes('Quadratura'))).toBe(true);
  });

  it('clamps score between 0 and 100', () => {
    const mappings = [
      {
        sephirah: { name: 'Chesed' },
        planetName: 'Júpiter',
        sign: 'Câncer', // Exaltation (+15)
        longitude: 95,
        retrograde: false
      }
    ] as unknown as SephirothMapping[];

    // Give it 6 trines to max out score (+48)
    const aspects: Aspect[] = Array(6).fill({
      planet1: 'jupiter',
      planet2: 'sun',
      type: 'trine',
      angle: 120,
      orb: 1,
      applying: true
    });
    
    const scores = calculateSephirothScores(mappings, aspects, 'Leão');
    expect(scores.Chesed.trueScore).toBe(50 + 15 + 48); // 113
    expect(scores.Chesed.score).toBe(100); // Clamped
  });
});

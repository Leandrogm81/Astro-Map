import { describe, it, expect } from 'vitest';
import { formatChartForAI, formatElectiveForAI, formatSolarComparisonForAI } from '../lib/aiPrompts';
import { ElectiveVeredict } from '../lib/traditional/types';
import { NatalChart, ZodiacSign } from '../types';

// Mock minimal NatalChart for testing
const mockChart: NatalChart = {
  birthData: {
    name: 'Teste',
    date: '1990-05-15',
    time: '14:30',
    location: 'São Paulo, SP',
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: 'UTC-3:00',
  },
  planets: [
    { id: 'sun', name: 'Sol', symbol: '☉', longitude: 54.5, latitude: 0, speed: 0.98, sign: 'Touro', degree: 24.5, house: 10, retrograde: false },
    { id: 'moon', name: 'Lua', symbol: '☽', longitude: 120.3, latitude: 0, speed: 13.2, sign: 'Leão', degree: 0.3, house: 1, retrograde: false },
    { id: 'mercury', name: 'Mercúrio', symbol: '☿', longitude: 40.1, latitude: 0, speed: 1.5, sign: 'Touro', degree: 10.1, house: 9, retrograde: false },
    { id: 'venus', name: 'Vênus', symbol: '♀', longitude: 330.7, latitude: 0, speed: 1.2, sign: 'Peixes', degree: 0.7, house: 7, retrograde: false },
    { id: 'mars', name: 'Marte', symbol: '♂', longitude: 290.2, latitude: 0, speed: 0.7, sign: 'Capricórnio', degree: 20.2, house: 5, retrograde: false },
    { id: 'lilith', name: 'Lilith', symbol: '⚸', longitude: 185.0, latitude: 0, speed: 0.11, sign: 'Libra', degree: 5.0, house: 3, retrograde: false },
  ],
  housesPlacidus: Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    longitude: (i * 30 + 110) % 360,
    sign: ['Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio',
           'Aquário', 'Peixes', 'Áries', 'Touro', 'Gêmeos', 'Câncer'][i] as ZodiacSign,
    degree: 10 + i,
  })),
  housesWhole: Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    longitude: (i * 30 + 120) % 360,
    sign: ['Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio',
           'Aquário', 'Peixes', 'Áries', 'Touro', 'Gêmeos', 'Câncer'][i] as ZodiacSign,
    degree: i * 30,
  })),
  aspects: [
    { planet1: 'Sol', planet2: 'Lua', type: 'sextile', angle: 65.8, orb: 5.8, applying: true },
    { planet1: 'Marte', planet2: 'Vênus', type: 'square', angle: 40.5, orb: 4.5, applying: false },
  ],
  ascendant: 120.0,
  mc: 30.0,
};

const mockSolarChart: NatalChart = {
  ...mockChart,
  birthData: {
    ...mockChart.birthData,
    date: '2026-05-15',
    time: '08:22',
  },
  planets: [
    { id: 'sun', name: 'Sol', symbol: '☉', longitude: 54.2, latitude: 0, speed: 0.98, sign: 'Touro', degree: 24.2, house: 4, retrograde: false },
    { id: 'moon', name: 'Lua', symbol: '☽', longitude: 250.1, latitude: 0, speed: 12.0, sign: 'Sagitário', degree: 10.1, house: 11, retrograde: false },
    { id: 'jupiter', name: 'Júpiter', symbol: '♃', longitude: 125.5, latitude: 0, speed: 0.1, sign: 'Leão', degree: 5.5, house: 7, retrograde: false },
  ],
  aspects: [
    { planet1: 'Sol', planet2: 'Lua', type: 'trine', angle: 195.9, orb: 5.9, applying: false },
  ],
  ascendant: 355.0,
  mc: 265.0,
};

const mockElectiveVeredict: ElectiveVeredict = {
  score: 'propitious',
  purpose: 'love',
  planetHour: {
    planetId: 'venus',
    isDaytime: false,
    hourNumber: 7,
    startTime: '19:12',
    endTime: '20:08',
  },
  lunarMansion: {
    number: 9,
    name: 'Al Tarf',
    sign: 'Leao',
    degreeRange: '8-21',
    summary: 'Favorece cautela, protecao e retirada ordenada.',
  },
  moonStatus: {
    phase: 'Gibosa Minguante',
    isVoidOfCourse: false,
    aspects: ['Lua sextil Venus'],
  },
  rulerCondition: {
    planetId: 'venus',
    totalScore: 9,
    dignity: 'Domicilio',
  },
};

describe('AI Prompts Formatting', () => {
  describe('formatChartForAI', () => {
    const output = formatChartForAI(mockChart);

    it('should include dignity information for planets', () => {
      // Vênus em Peixes = Exaltação
      expect(output).toContain('Exaltação');
      // Marte em Capricórnio = Exaltação
      expect(output).toContain('Marte');
      expect(output).toContain('Capricórnio');
    });

    it('should include domicile ruler for each planet', () => {
      expect(output).toContain('Regido por:');
    });

    it('should include dispositor chain section', () => {
      expect(output).toContain('CADEIA DE DISPOSIÇÃO');
    });

    it('should include ascendant ruler', () => {
      expect(output).toContain('Regente do Ascendente');
    });

    it('should include aspect names in Portuguese', () => {
      expect(output).toContain('Sextil');
    });

    it('should include all birth data', () => {
      expect(output).toContain('Teste');
      expect(output).toContain('1990-05-15');
      expect(output).toContain('14:30');
      expect(output).toContain('São Paulo');
    });
  });

  describe('formatSolarComparisonForAI', () => {
    const output = formatSolarComparisonForAI(mockChart, mockSolarChart, 2026);

    it('should include solar return year', () => {
      expect(output).toContain('REVOLUÇÃO SOLAR 2026');
    });

    it('should include SR ascendant falling in natal house', () => {
      expect(output).toContain('ASCENDENTE DA REVOLUÇÃO');
      expect(output).toContain('Casa');
      expect(output).toContain('Mapa Natal');
    });

    it('should include house interposition for planets', () => {
      expect(output).toContain('INTERPOSIÇÃO DE CASAS');
      expect(output).toContain('(RS)');
      expect(output).toContain('(Natal)');
    });

    it('should include cross aspects section', () => {
      expect(output).toContain('ASPECTOS CRUZADOS');
    });

    it('should include exact solar return date', () => {
      expect(output).toContain('2026-05-15');
      expect(output).toContain('08:22');
    });

    it('should include the natal chart data as reference', () => {
      expect(output).toContain('MAPA NATAL (REFERÊNCIA)');
    });
  });
  describe('formatElectiveForAI', () => {
    it('should format the current sky mode without natal overlays', () => {
      const output = formatElectiveForAI(mockElectiveVeredict, mockSolarChart, 'sky_only');

      expect(output).toContain('MODO DE LEITURA: CEU DO MOMENTO');
      expect(output).not.toContain('DADOS NATAIS DE REFER');
      expect(output).toContain('Hora Planet');
    });

    it('should include natal context when the combined mode is requested', () => {
      const output = formatElectiveForAI(mockElectiveVeredict, mockSolarChart, 'sky_plus_natal', mockChart);

      expect(output).toContain('MODO DE LEITURA: CEU DO MOMENTO + MAPA NATAL');
      expect(output).toContain('DADOS NATAIS DE REFER');
      expect(output).toContain('cai na Casa');
    });
  });
});

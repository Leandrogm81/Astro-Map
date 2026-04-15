'use client';

import type { 
  PlanetPosition, 
  HouseCusp, 
  Aspect, 
  BirthData, 
  NatalChart,
  ZodiacSign,
  LotPosition,
  TraditionalPoints
} from '@/types';
import { PLANETS, ZODIAC_SIGNS } from '@/types';
import { getZodiacSign, getSignDegree, getHouseForPlanet } from './astrology';
import { getBrazilianTimezone, getTimezoneOffsetForDate, isBrazilianDST as isBrazilianDSTCheck } from './geocoding';
import { useSettingsStore } from './settingsStore';

import * as Astronomy from 'astronomy-engine';

let astronomyLoaded = false;

export async function initSweph(): Promise<void> {
  if (astronomyLoaded) return;
  
  try {
    if (typeof Astronomy.Body !== 'object' || typeof Astronomy.GeoVector !== 'function') {
      throw new Error('Astronomy Engine module is incomplete');
    }
    astronomyLoaded = true;
    console.log('Astronomy Engine initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Astronomy Engine:', error);
    throw new Error('Não foi possível inicializar a biblioteca de cálculos astronômicos');
  }
}

// Calculate Julian Day from Date
export function dateToJD(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  
  let y = year;
  let m = month;
  
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  
  return jd + hour / 24;
}

// Calculate Obliquity of the Ecliptic
function getObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Obliquity in degrees (IAU 2006)
  return 23.439291 - 0.0130042 * T - 0.00000016 * T * T + 0.0000005 * T * T * T;
}

// Calculate Local Sidereal Time (in degrees)
function getLST(jd: number, longitude: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  
  // GMST in degrees
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  GMST = GMST % 360;
  if (GMST < 0) GMST += 360;
  
  // LST = GMST + longitude (in degrees)
  let LST = GMST + longitude;
  LST = LST % 360;
  if (LST < 0) LST += 360;
  
  return LST;
}

// Calculate Ascendant using correct formula
// For southern hemisphere (negative latitude), we add 180° because the formula
// calculates the Descendant point instead - the Ascendant is opposite
function getAscendant(LST: number, latitude: number, obliquity: number): number {
  const RAMC = LST;
  
  const ramcRad = RAMC * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  const oblRad = obliquity * Math.PI / 180;
  
  const sinRAMC = Math.sin(ramcRad);
  const cosRAMC = Math.cos(ramcRad);
  const sinObl = Math.sin(oblRad);
  const cosObl = Math.cos(oblRad);
  const tanLat = Math.tan(latRad);
  
  const numerator = -cosRAMC;
  const denominator = sinRAMC * cosObl + tanLat * sinObl;
  
  let asc = Math.atan2(numerator, denominator) * 180 / Math.PI;
  
  // For southern hemisphere (negative latitude), add 180°
  // because the formula gives the Descendant point
  if (latitude < 0) {
    asc = (asc + 180) % 360;
  }
  
  asc = ((asc % 360) + 360) % 360;
  
  return asc;
}

// Calculate MC (Medium Coeli / Midheaven)
function getMC(LST: number, obliquity: number): number {
  // MC is approximately equal to the RAMC (Right Ascension of Medium Coeli)
  // converted to ecliptic longitude
  const RAMC = LST * Math.PI / 180;
  const oblRad = obliquity * Math.PI / 180;
  
  // tan(MC) = sin(RAMC) / cos(RAMC) * cos(obl)
  // MC = atan2(sin(RAMC), cos(RAMC) * cos(obl))
  const y = Math.sin(RAMC);
  const x = Math.cos(RAMC) * Math.cos(oblRad);
  
  const mcRad = Math.atan2(y, x);
  const mc = (mcRad * 180 / Math.PI) % 360;
  
  return mc < 0 ? mc + 360 : mc;
}

// Calculate Placidus House cusps using the iterative method
function calculatePlacidusHouses(jd: number, latitude: number, longitude: number): HouseCusp[] {
  const LST = getLST(jd, longitude);
  const obliquity = getObliquity(jd);
  
  const ascendant = getAscendant(LST, latitude, obliquity);
  const MC = getMC(LST, obliquity);
  
  const IC = (MC + 180) % 360;
  const DESC = (ascendant + 180) % 360;
  
  // Placidus iterative solver
  const DEG2RAD = Math.PI / 180;
  const RAD2DEG = 180 / Math.PI;
  const oblRad = obliquity * DEG2RAD;
  const latRad = latitude * DEG2RAD;
  const ramcRad = LST * DEG2RAD;
  
  // X = tan(lat) * tan(obliquity)
  const X = Math.tan(latRad) * Math.tan(oblRad);
  
  const solveIterativeCusp = (D_deg: number, F: number): number => {
    let R = ramcRad + D_deg * DEG2RAD;
    let prev_R = 0;
    
    // Iterate to find Right Ascension of house cusp
    for (let i = 0; i < 100; i++) {
      let sinA = X * Math.sin(R);
      // Fallback for Polar regions (Porphyry-like approximation)
      if (Math.abs(sinA) > 1) {
        sinA = Math.sign(sinA); 
      }
      const A = Math.asin(sinA);
      
      prev_R = R;
      R = ramcRad + D_deg * DEG2RAD + A * F;
      
      if (Math.abs(R - prev_R) < 1e-6) break;
    }
    
    // Convert Right Ascension to Ecliptic Longitude
    const lonRad = Math.atan2(Math.sin(R) / Math.cos(oblRad), Math.cos(R));
    const lonDeg = (lonRad * RAD2DEG) % 360;
    return (lonDeg + 360) % 360;
  };

  const cusp11 = solveIterativeCusp(30, 1/3);
  const cusp12 = solveIterativeCusp(60, 2/3);
  const cusp2 = solveIterativeCusp(120, 2/3);
  const cusp3 = solveIterativeCusp(150, 1/3);
  
  const cusp5 = (cusp11 + 180) % 360;
  const cusp6 = (cusp12 + 180) % 360;
  const cusp8 = (cusp2 + 180) % 360;
  const cusp9 = (cusp3 + 180) % 360;

  const cuspArray = [
    ascendant, // 1
    cusp2,     // 2
    cusp3,     // 3
    IC,        // 4
    cusp5,     // 5
    cusp6,     // 6
    DESC,      // 7
    cusp8,     // 8
    cusp9,     // 9
    MC,        // 10
    cusp11,    // 11
    cusp12,    // 12
  ];
  
  const houses: HouseCusp[] = [];
  for (let i = 0; i < 12; i++) {
    let cusp = cuspArray[i];
    if (isNaN(cusp)) {
      cusp = (ascendant + i * 30) % 360;
    }
    houses.push({
      number: i + 1,
      longitude: cusp,
      sign: getZodiacSign(cusp),
      degree: getSignDegree(cusp),
    });
  }
  
  return houses;
}

// Calculate Whole Signs houses
function calculateWholeSignsHouses(ascendant: number): HouseCusp[] {
  const houses: HouseCusp[] = [];
  // Find the sign that contains the Ascendant
  const ascSignStart = Math.floor(ascendant / 30) * 30;
  
  // Each house starts at the beginning of each sign
  // House 1 starts at the sign of the Ascendant
  for (let i = 0; i < 12; i++) {
    const longitude = (ascSignStart + i * 30) % 360;
    houses.push({
      number: i + 1,
      longitude,
      sign: getZodiacSign(longitude),
      degree: 0, // Always 0° in Whole Signs
    });
  }
  
  return houses;
}

async function calculatePlanetPosition(date: Date, planetId: string): Promise<PlanetPosition> {
  if (!astronomyLoaded) {
    throw new Error('Astronomy Engine not initialized');
  }
  
  const bodyMap: Record<string, Astronomy.Body> = {
    sun: Astronomy.Body.Sun,
    moon: Astronomy.Body.Moon,
    mercury: Astronomy.Body.Mercury,
    venus: Astronomy.Body.Venus,
    mars: Astronomy.Body.Mars,
    jupiter: Astronomy.Body.Jupiter,
    saturn: Astronomy.Body.Saturn,
    uranus: Astronomy.Body.Uranus,
    neptune: Astronomy.Body.Neptune,
    pluto: Astronomy.Body.Pluto,
  };
  
  const body = bodyMap[planetId];
  
  if (!body) {
    if (planetId === 'node') return calculateNodePosition(date);
    if (planetId === 'chiron') return calculateChironPosition(date);
    if (planetId === 'lilith') return calculateLilithPosition(date);
    if (planetId === 'partOfFortune') throw new Error('partOfFortune handled separately');
    throw new Error(`Unknown planet: ${planetId}`);
  }
  
  const vector = Astronomy.GeoVector(body, date, true);
  const ecliptic = Astronomy.Ecliptic(vector);
  
  const longitude = ecliptic.elon;
  const latitude = ecliptic.elat;
  
  // Calculate speed (change in longitude over 1 hour)
  const date1 = new Date(date.getTime() + 3600000);
  const vector1 = Astronomy.GeoVector(body, date1, true);
  const ecliptic1 = Astronomy.Ecliptic(vector1);
  let speed = ecliptic1.elon - longitude;
  if (speed > 180) speed -= 360;
  if (speed < -180) speed += 360;
  
  const planetInfo = PLANETS.find(p => p.id === planetId)!;
  
  return {
    id: planetId,
    name: planetInfo.name,
    symbol: planetInfo.symbol,
    longitude,
    latitude,
    speed,
    sign: getZodiacSign(longitude),
    degree: getSignDegree(longitude),
    house: 1,
    retrograde: speed < 0,
  };
}

/**
 * Calcula a posição média do Nodo Norte Lunar.
 * Método: Aproximação linear do Nodo Médio regredindo ~19.34° por ano.
 * Precisão: ~1 grau de erro. Suficiente para uso geral.
 */
function calculateNodePosition(date: Date): PlanetPosition {
  const jd = dateToJD(date);
  const jd2000 = 2451545.0;
  const years = (jd - jd2000) / 365.25;
  // Mean Node - regresses ~19.3° per year
  const longitude = (125.04355 - years * 19.34) % 360;
  const normalized = longitude < 0 ? longitude + 360 : longitude;
  
  return {
    id: 'node',
    name: 'Nodo Norte',
    symbol: '☊',
    longitude: normalized,
    latitude: 0,
    speed: -0.053,
    sign: getZodiacSign(normalized),
    degree: getSignDegree(normalized),
    house: 1,
    retrograde: true,
  };
}

/**
 * Calcula a posição média de Quíron.
 * Método: Aproximação linear baseada no período orbital de ~50.7 anos.
 * Precisão: Pode haver erro significativo (>5°) devido à alta excentricidade da órbita.
 * Recomendado conferir com efemérides oficiais para uso crítico.
 */
function calculateChironPosition(date: Date): PlanetPosition {
  const jd = dateToJD(date);
  const jd2000 = 2451545.0;
  const years = (jd - jd2000) / 365.25;
  // Chiron orbital period ~50.7 years
  const longitude = (207.67 + years * 7.1) % 360;
  
  return {
    id: 'chiron',
    name: 'Quíron',
    symbol: '⚷',
    longitude,
    latitude: 0,
    speed: 0.019,
    sign: getZodiacSign(longitude),
    degree: getSignDegree(longitude),
    house: 1,
    retrograde: false,
  };
}

/**
 * Calcula a posição da Lilith (Apogeu Lunar Médio).
 * Método: Fórmula polinomial para o apogeu lunar médio.
 * Precisão: ~1 a 2 graus de erro.
 */
function calculateLilithPosition(date: Date): PlanetPosition {
  const jd = dateToJD(date);
  const T = (jd - 2451545.0) / 36525.0;
  // Mean lunar apogee
  let longitude = 83.3532430 + 4069.0137111 * T - 0.0103238 * T * T - T * T * T / 80058;
  longitude = longitude % 360;
  if (longitude < 0) longitude += 360;

  return {
    id: 'lilith',
    name: 'Lilith',
    symbol: '⚸',
    longitude,
    latitude: 0,
    speed: 0.11,
    sign: getZodiacSign(longitude),
    degree: getSignDegree(longitude),
    house: 1,
    retrograde: false,
  };
}

import { calculateLotLongitude } from './traditional/lots';
import { calculateTraditionalPoints } from './traditional/points';

// Parse timezone offset from string like "UTC-3:00" or "UTC+2:00"
export function parseTimezoneOffset(timezone: string): number {
  if (!timezone) return 0;
  
  const match = timezone.match(/UTC([+-]?)(\d{1,2})(?::(\d{2}))?/i);
  if (!match) return 0;
  
  const sign = match[1] === '-' ? -1 : 1;
  const hours = parseInt(match[2], 10);
  const minutes = match[3] ? parseInt(match[3], 10) : 0;
  
  return sign * (hours + minutes / 60);
}

// Estimate timezone from longitude
function estimateTimezoneFromLongitude(longitude: number): number {
  // Each 15° of longitude = 1 hour
  // Round to nearest integer hour
  return Math.round(longitude / 15);
}

export async function calculateNatalChart(birthData: BirthData): Promise<NatalChart> {
  if (!astronomyLoaded) {
    throw new Error('Astronomy Engine must be initialized before calculation');
  }
  
  // Parse date and time
  const [year, month, day] = birthData.date.split('-').map(Number);
  const [hours, minutes] = birthData.time.split(':').map(Number);
  
  // Use coordenadas diretamente, sem inversão forçada
  const latitude = birthData.latitude;
  const longitude = birthData.longitude;

  // Validação básica de limites geográficos
  if (latitude < -90 || latitude > 90) {
    throw new Error(`Latitude inválida: ${latitude}. Deve estar entre -90 e 90.`);
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error(`Longitude inválida: ${longitude}. Deve estar entre -180 e 180.`);
  }
  
  // Determine timezone offset with DST detection
  const birthDateForDST = new Date(year, month - 1, day, hours, minutes);
  const dstTimezone = getTimezoneOffsetForDate(latitude, longitude, birthDateForDST);
  const dstOffset = parseTimezoneOffset(dstTimezone);
  
  // Always use DST-aware timezone
  const timezoneOffset = dstOffset;
  
  const utcHours = hours - timezoneOffset;
  
  console.log('Debug:', {
    localTime: `${hours}:${minutes}`,
    timezone: dstTimezone,
    timezoneOffset,
    utcTime: `${Math.floor(utcHours)}:${minutes}`,
    latitude,
    longitude,
    isDST: isBrazilianDSTCheck(birthDateForDST),
  });
  
  const birthDate = new Date(Date.UTC(year, month - 1, day, Math.floor(utcHours), minutes));
  const jd = dateToJD(birthDate);
  
  // Calculate planets
  const planets: PlanetPosition[] = [];
  for (const planet of PLANETS) {
    try {
      const position = await calculatePlanetPosition(birthDate, planet.id);
      planets.push(position);
    } catch (error) {
      console.warn(`Could not calculate position for ${planet.id}:`, error);
    }
  }
  
  if (planets.length === 0) {
    throw new Error('Failed to calculate any planet positions');
  }
  
  // Calculate houses
  const housesPlacidus = calculatePlacidusHouses(jd, latitude, longitude);
  const ascendant = housesPlacidus[0].longitude;
  const housesWhole = calculateWholeSignsHouses(ascendant);

  // Sect Calculation (Day vs Night)
  const sun = planets.find(p => p.id === 'sun');
  const sunHouse = sun ? getHouseForPlanet(sun.longitude, housesPlacidus) : 1;
  const isDayChart = sunHouse >= 7 && sunHouse <= 12;

  // Calculate Hermetic Lots
  const lots: LotPosition[] = [];
  try {
    const lotConfigs = [
      { id: 'fortune', name: 'Roda da Fortuna', symbol: '⊗', description: 'Prosperidade e vitalidade física.' },
      { id: 'spirit', name: 'Lote do Espírito', symbol: '✦', description: 'Carreira e propósito espiritual.' },
      { id: 'eros', name: 'Lote de Eros', symbol: '♥', description: 'Desejos e amizades.' },
      { id: 'necessity', name: 'Lote da Necessidade', symbol: '⚖', description: 'Restrições e deveres.' },
      { id: 'courage', name: 'Lote da Coragem', symbol: '⚔', description: 'Audácia e força de vontade.' },
      { id: 'victory', name: 'Lote da Vitória', symbol: '🏆', description: 'Sucesso por mérito.' },
      { id: 'nemesis', name: 'Lote de Nêmesis', symbol: '⚡', description: 'Karma e justiça divina.' },
    ];

    for (const config of lotConfigs) {
      const lotLon = calculateLotLongitude(config.id, ascendant, planets, isDayChart);
      lots.push({
        ...config,
        longitude: lotLon,
        sign: getZodiacSign(lotLon),
        degree: getSignDegree(lotLon),
        house: getHouseForPlanet(lotLon, housesPlacidus)
      });
    }
  } catch (err) {
    console.warn('Failed to calculate some lots', err);
  }

  // Calculate Traditional Points using the new specialized library
  const traditionalPoints = calculateTraditionalPoints(ascendant, planets, housesPlacidus, isDayChart);

  // Assign houses to planets
  for (const planet of planets) {
    planet.house = getHouseForPlanet(planet.longitude, housesPlacidus);
  }
  
  // Calculate aspects
  const aspects = calculateAspects(planets);
  
  return {
    birthData,
    planets,
    housesPlacidus,
    housesWhole,
    aspects,
    ascendant,
    mc: housesPlacidus[9].longitude,
    lots,
    traditionalPoints,
    isDayChart,
  };
}

function calculateAspects(planets: PlanetPosition[]): Aspect[] {
  const orbs = useSettingsStore.getState().orbs;
  const aspects: Aspect[] = [];
  const majorAspects = [
    { angle: 0, name: 'conjunction', orb: orbs.conjunction },
    { angle: 60, name: 'sextile', orb: orbs.sextile },
    { angle: 90, name: 'square', orb: orbs.square },
    { angle: 120, name: 'trine', orb: orbs.trine },
    { angle: 180, name: 'opposition', orb: orbs.opposition },
  ];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      
      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;
      
      for (const aspect of majorAspects) {
        const orb = Math.abs(diff - aspect.angle);
        if (orb <= aspect.orb) {
          const isApplying = (p1.speed > p2.speed && p1.longitude < p2.longitude) ||
                           (p1.speed < p2.speed && p1.longitude > p2.longitude);
          
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: aspect.name as Aspect['type'],
            angle: diff,
            orb,
            applying: isApplying,
          });
          break;
        }
      }
    }
  }
  
  return aspects.sort((a, b) => a.orb - b.orb);
}

/**
 * Find the exact time when the Sun returns to a specific longitude
 * Uses iterative binary search to find the exact moment
 */
function findSolarReturnTime(
  approximateDate: Date,
  targetLongitude: number,
  latitude: number,
  longitude: number,
  timezoneOffset: number
): Date {
  // The Sun moves about 1 degree per day, so we search within ±3 days
  let searchStart = new Date(approximateDate);
  searchStart.setDate(searchStart.getDate() - 2);
  
  let searchEnd = new Date(approximateDate);
  searchEnd.setDate(searchEnd.getDate() + 2);
  
  // Binary search for the exact time
  let iterations = 0;
  const maxIterations = 50; // ~1 minute precision
  
  while (iterations < maxIterations) {
    const midTime = new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
    
    // Get Sun position at midTime
    const sunVector = Astronomy.GeoVector(Astronomy.Body.Sun, midTime, true);
    const sunEcliptic = Astronomy.Ecliptic(sunVector);
    let currentLongitude = sunEcliptic.elon;
    
    // Normalize to 0-360
    currentLongitude = ((currentLongitude % 360) + 360) % 360;
    
    // Calculate angular difference
    let diff = currentLongitude - targetLongitude;
    
    // Normalize difference to -180 to 180
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    
    // Check if we're close enough (within 0.01 degrees ≈ 1.5 minutes)
    if (Math.abs(diff) < 0.01) {
      return midTime;
    }
    
    // Adjust search range
    if (diff > 0) {
      // Sun is ahead of target, need to go earlier
      searchEnd = midTime;
    } else {
      // Sun is behind target, need to go later
      searchStart = midTime;
    }
    
    iterations++;
  }
  
  // Return the best approximation if we didn't converge
  return new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
}

/**
 * Calculate the Solar Return chart for a specific year
 * The Solar Return is the moment when the Sun returns to the same zodiacal position
 * as it was at birth. This can vary by up to 2 days from the birthday.
 */
export async function calculateSolarReturn(birthChart: NatalChart, year: number): Promise<NatalChart> {
  if (!astronomyLoaded) {
    throw new Error('Astronomy Engine must be initialized before calculation');
  }
  
  // Get the natal Sun position
  const natalSun = birthChart.planets.find(p => p.name === 'Sol');
  if (!natalSun) {
    throw new Error('Natal Sun position not found');
  }
  
  const targetSunLongitude = natalSun.longitude;
  
  // Get timezone offset
  let timezoneOffset = parseTimezoneOffset(birthChart.birthData.timezone || '');
  if (timezoneOffset === 0) {
    timezoneOffset = estimateTimezoneFromLongitude(birthChart.birthData.longitude);
  }
  
  // Approximate date of solar return (around the birthday)
  const birthDate = new Date(birthChart.birthData.date);
  const approximateReturn = new Date(year, birthDate.getMonth(), birthDate.getDate(), 12, 0, 0);
  
  // Find the exact time when Sun returns to the natal position
  const solarReturnDate = findSolarReturnTime(
    approximateReturn,
    targetSunLongitude,
    birthChart.birthData.latitude,
    birthChart.birthData.longitude,
    timezoneOffset
  );
  
  // Map UTC solarReturnDate to the correct Local Time at the event's location
  const dstTimezone = getTimezoneOffsetForDate(birthChart.birthData.latitude, birthChart.birthData.longitude, solarReturnDate);
  const dstOffset = parseTimezoneOffset(dstTimezone);
  
  const localReturnDate = new Date(solarReturnDate.getTime() + dstOffset * 3600000);

  // Create birth data for solar return
  // Use the same location as natal chart (traditional approach)
  const returnData: BirthData = {
    name: birthChart.birthData.name,
    date: `${localReturnDate.getUTCFullYear()}-${String(localReturnDate.getUTCMonth() + 1).padStart(2, '0')}-${String(localReturnDate.getUTCDate()).padStart(2, '0')}`,
    time: `${String(localReturnDate.getUTCHours()).padStart(2, '0')}:${String(localReturnDate.getUTCMinutes()).padStart(2, '0')}`,
    location: birthChart.birthData.location,
    latitude: birthChart.birthData.latitude,
    longitude: birthChart.birthData.longitude,
    timezone: dstTimezone,
  };
  
  console.log('Solar Return Debug:', {
    year,
    approximateDate: approximateReturn.toISOString(),
    exactDate: solarReturnDate.toISOString(),
    targetSunLongitude,
    timezoneOffset,
  });
  
  return calculateNatalChart(returnData);
}

export function getPlanetSymbol(planetName: string): string {
  const planet = PLANETS.find(p => p.name === planetName);
  return planet?.symbol || '●';
}

export function getSignSymbol(sign: ZodiacSign): string {
  const zodiacSign = ZODIAC_SIGNS.find(z => z.name === sign);
  return zodiacSign?.symbol || '';
}

// Debug function to log calculation details
export function debugCalculation(birthData: BirthData): {
  jd: number;
  lst: number;
  obliquity: number;
  ascendant: number;
  mc: number;
  latitude: number;
  longitude: number;
} {
  const [year, month, day] = birthData.date.split('-').map(Number);
  const [hours, minutes] = birthData.time.split(':').map(Number);
  const birthDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const jd = dateToJD(birthDate);
  
  const lst = getLST(jd, birthData.longitude);
  const obliquity = getObliquity(jd);
  const ascendant = getAscendant(lst, birthData.latitude, obliquity);
  const mc = getMC(lst, obliquity);
  
  return {
    jd,
    lst,
    obliquity,
    ascendant,
    mc,
    latitude: birthData.latitude,
    longitude: birthData.longitude,
  };
}
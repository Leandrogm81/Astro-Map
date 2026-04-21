import { BirthData } from '@/types';

const TRADITIONAL_REPORT_PREFIX = 'traditional_report_v2';
const TRADITIONAL_REPORT_LEGACY_PREFIX = 'trad_report';

function normalizeKeyPart(value: string): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function getTraditionalReportStorageKey(birthData: BirthData): string {
  const lat = birthData.latitude.toFixed(2);
  const lon = birthData.longitude.toFixed(2);

  return [
    TRADITIONAL_REPORT_PREFIX,
    normalizeKeyPart(birthData.name),
    normalizeKeyPart(birthData.date),
    normalizeKeyPart(birthData.time),
    lat,
    lon,
  ].join('_');
}

export function getTraditionalReportStorageKeyLegacy(birthData: BirthData): string {
  return `${TRADITIONAL_REPORT_LEGACY_PREFIX}_${birthData.name}_${birthData.date}`;
}

export function loadTraditionalReportFromStorage(birthData: BirthData): string {
  if (typeof window === 'undefined') return '';

  const primaryKey = getTraditionalReportStorageKey(birthData);
  const legacyKey = getTraditionalReportStorageKeyLegacy(birthData);

  return localStorage.getItem(primaryKey) || localStorage.getItem(legacyKey) || '';
}

export function saveTraditionalReportToStorage(birthData: BirthData, reportText: string): void {
  if (typeof window === 'undefined') return;

  const primaryKey = getTraditionalReportStorageKey(birthData);
  const legacyKey = getTraditionalReportStorageKeyLegacy(birthData);

  localStorage.setItem(primaryKey, reportText);
  localStorage.setItem(legacyKey, reportText);
}

export function clearTraditionalReportFromStorage(birthData: BirthData): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(getTraditionalReportStorageKey(birthData));
  localStorage.removeItem(getTraditionalReportStorageKeyLegacy(birthData));
}


import { SavedChart, NatalChart, BirthData, AIReport } from '@/types';

const STORAGE_KEY = 'astromap_saved_charts';

export function saveChart(
  name: string,
  chart: NatalChart,
  aiReport?: AIReport | null,
  solarReport?: AIReport | null,
  solarRevolution?: NatalChart | null,
  solarYear?: number | null
): SavedChart {
  const savedChart: SavedChart = {
    id: generateId(),
    name: name || `${chart.birthData.name} - ${chart.birthData.date}`,
    birthData: chart.birthData,
    chart,
    createdAt: new Date().toISOString(),
    aiReport: aiReport || undefined,
    solarReport: solarReport || undefined,
    solarRevolution: solarRevolution || undefined,
    solarYear: solarYear || undefined,
  };

  const charts = getSavedCharts();
  charts.push(savedChart);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));

  return savedChart;
}

export function getSavedCharts(): SavedChart[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function loadChart(id: string): SavedChart | null {
  const charts = getSavedCharts();
  return charts.find(c => c.id === id) || null;
}

export function deleteChart(id: string): boolean {
  const charts = getSavedCharts();
  const filtered = charts.filter(c => c.id !== id);
  
  if (filtered.length < charts.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
  
  return false;
}

export function updateChart(id: string, updates: Partial<SavedChart>): SavedChart | null {
  const charts = getSavedCharts();
  const index = charts.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  charts[index] = { ...charts[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
  
  return charts[index];
}

export function clearAllCharts(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportChartToJSON(chart: SavedChart): string {
  return JSON.stringify(chart, null, 2);
}

export function importChartFromJSON(json: string): SavedChart | null {
  try {
    const data = JSON.parse(json);
    
    // Validar estrutura básica
    if (!data.birthData || !data.chart) {
      throw new Error('Invalid chart data');
    }
    
    // Se não tiver ID, gera um. Se já tiver, usa o dele (fiel ao export)
    // Se houver risco de colisão futuro, o usuário pode ser alertado, 
    // mas para restauração o ID deve ser o mesmo.
    const savedChart: SavedChart = {
      ...data,
      id: data.id || generateId(),
      createdAt: data.createdAt || new Date().toISOString()
    };

    const charts = getSavedCharts();
    
    // Evita duplicata se importar o mesmo mapa várias vezes
    const existingIndex = charts.findIndex(c => c.id === savedChart.id);
    if (existingIndex !== -1) {
      charts[existingIndex] = savedChart;
    } else {
      charts.push(savedChart);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
    return savedChart;
  } catch (error) {
    console.error('Import error:', error);
    return null;
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Gera uma chave única para cache de relatórios baseada nos dados do mapa.
 * Inclui nome, data, hora e coordenadas para evitar colisões.
 */
export function getReportKey(birthData: BirthData, isSolar: boolean = false, year?: number): string {
  const { name, date, time, latitude, longitude } = birthData;
  // Arredondar coordenadas para evitar pequenas variações decimais
  const lat = latitude.toFixed(2);
  const lon = longitude.toFixed(2);
  
  const base = `${name}_${date}_${time}_${lat}_${lon}`;
  
  if (isSolar && year) {
    return `solar_report_v2_${base}_${year}`;
  }
  return `report_v2_${base}`;
}

/**
 * Fallback para as chaves antigas (menos específicas)
 */
export function getReportKeyLegacy(name: string, date: string, isSolar: boolean = false, year?: number): string {
  if (isSolar && year) {
    return `solar_report_${name}_${date}_${year}`;
  }
  return `report_${name}_${date}`;
}

// ─── Elective Storage (Frente 2) ───

import { ElectiveMode } from './traditional/types';
import { PlanetKey } from './traditional/magic-correspondences';

const ELECTIVE_STORAGE_KEY = 'astromap_electives';
const MAX_ELECTIVES = 20;

export interface SavedElective {
  id: string;
  savedAt: string;
  label: string;
  dateStr: string;
  timeStr: string;
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  intentionId: string;
  electiveMode: ElectiveMode;
  planetaryDay: string;
  score: 'propitious' | 'neutral' | 'adverse';
  rulerPlanet: PlanetKey;
  magicInsight: string | null;
}

export function getSavedElectives(): SavedElective[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(ELECTIVE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveElective(elective: Omit<SavedElective, 'id' | 'savedAt'>): SavedElective {
  const saved: SavedElective = {
    ...elective,
    id: generateId(),
    savedAt: new Date().toISOString(),
  };

  const electives = getSavedElectives();
  electives.unshift(saved); // newest first

  // Enforce limit
  const trimmed = electives.slice(0, MAX_ELECTIVES);
  localStorage.setItem(ELECTIVE_STORAGE_KEY, JSON.stringify(trimmed));

  return saved;
}

export function deleteElective(id: string): boolean {
  const electives = getSavedElectives();
  const filtered = electives.filter(e => e.id !== id);
  if (filtered.length < electives.length) {
    localStorage.setItem(ELECTIVE_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
  return false;
}

export function getElectiveCount(): number {
  return getSavedElectives().length;
}

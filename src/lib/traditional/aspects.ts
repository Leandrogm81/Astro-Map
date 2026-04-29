import { PlanetPosition } from '@/types';

export interface TraditionalAspect {
  p1: string;
  p2: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  orb: number;
  isApplying: boolean;
  score: number;
}

const PLANET_ORBS: Record<string, number> = {
  sun: 15,
  moon: 12,
  mercury: 7,
  venus: 7,
  mars: 8,
  jupiter: 9,
  saturn: 9
};

const ASPECT_TYPES = [
  { name: 'conjunction', angle: 0 },
  { name: 'sextile', angle: 60 },
  { name: 'square', angle: 90 },
  { name: 'trine', angle: 120 },
  { name: 'opposition', angle: 180 }
] as const;

/**
 * Calcula aspectos tradicionais baseados em orbes dos planetas (Moiety)
 */
export function calculateTraditionalAspects(planets: PlanetPosition[]): TraditionalAspect[] {
  const aspects: TraditionalAspect[] = [];
  const classicPlanets = planets.filter(p => PLANET_ORBS[p.id]);

  for (let i = 0; i < classicPlanets.length; i++) {
    for (let j = i + 1; j < classicPlanets.length; j++) {
      const p1 = classicPlanets[i];
      const p2 = classicPlanets[j];

      const diff = Math.abs(p1.longitude - p2.longitude);
      const angle = Math.min(diff, 360 - diff);

      // Orbe combinado (Moiety) = (Orbe P1 + Orbe P2) / 2
      const combinedOrb = (PLANET_ORBS[p1.id] + PLANET_ORBS[p2.id]) / 2;

      for (const a of ASPECT_TYPES) {
        const orb = Math.abs(angle - a.angle);
        
        if (orb <= combinedOrb) {
          // Determina se é aplicativo ou separativo comparando o orbe agora com o orbe em um curto intervalo futuro
          const p1Future = p1.longitude + p1.speed * 0.01;
          const p2Future = p2.longitude + p2.speed * 0.01;
          const diffFuture = Math.abs(p1Future - p2Future);
          const angleFuture = Math.min(diffFuture, 360 - diffFuture);
          const orbFuture = Math.abs(angleFuture - a.angle);
          
          const isApplying = orbFuture < orb;

          aspects.push({
            p1: p1.id,
            p2: p2.id,
            type: a.name,
            orb: parseFloat(orb.toFixed(2)),
            isApplying,
            score: calculateAspectScore(a.name, orb, combinedOrb)
          });
        }
      }
    }
  }

  return aspects;
}

function calculateAspectScore(type: string, orb: number, maxOrb: number): number {
  const baseScores: Record<string, number> = {
    trine: 4, sextile: 2, conjunction: 3, square: -2, opposition: -4
  };
  const multiplier = 1 - (orb / maxOrb);
  return (baseScores[type] || 0) * multiplier;
}

/**
 * Retorna o nome amigável em Português para o ID do planeta
 */
export function getPlanetNamePT(id: string): string {
  const names: Record<string, string> = {
    sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus',
    mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno'
  };
  return names[id] || id;
}

/**
 * Fornece uma breve interpretação tradicional do aspecto
 */
export function getTraditionalAspectInterpretation(type: string, p1: string, p2: string): string {
  const n1 = getPlanetNamePT(p1);
  const n2 = getPlanetNamePT(p2);
  
  const templates: Record<string, string> = {
    conjunction: `${n1} e ${n2} unem suas naturezas, criando uma força combinada poderosa.`,
    sextile: `${n1} e ${n2} cooperam de forma harmoniosa e fluida, facilitando oportunidades.`,
    trine: `${n1} e ${n2} estão em perfeita sintonia elemental, trazendo sorte e facilidade natural.`,
    square: `${n1} e ${n2} estão em conflito de naturezas, exigindo esforço e superação de tensões.`,
    opposition: `${n1} e ${n2} estão em confronto direto, exigindo equilíbrio entre polaridades opostas.`
  };

  return templates[type] || `Interação entre ${n1} e ${n2}.`;
}

/**
 * Calcula se a Lua está Fora de Curso (Void of Course)
 * Definição: A Lua não fará nenhum aspecto Ptolomeico exato antes de sair do signo atual.
 */
export function calculateMoonVoidOfCourse(
  moon: PlanetPosition,
  planets: PlanetPosition[]
): { isVoid: boolean; nextAspect?: string; remainingDegrees: number } {
  const moonLon = moon.longitude;
  const signIndex = Math.floor(moonLon / 30);
  const signEndLon = (signIndex + 1) * 30;
  const remainingDegrees = signEndLon - moonLon;

  const classicPlanets = planets.filter(p => 
    ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(p.id?.toLowerCase() || '')
  );

  const ptolemaicAngles = [0, 60, 90, 120, 180];
  let earliestT = Infinity;
  let aspectDesc = '';

  for (const p of classicPlanets) {
    // Velocidade relativa em graus/hora
    const relSpeed = moon.speed - p.speed;
    if (relSpeed <= 0) continue; // Lua precisa estar "alcançando" ou se movendo em direção ao aspecto

    for (const targetAngle of ptolemaicAngles) {
      // Calculamos as duas possíveis posições relativas para o ângulo (ex: 60 e 300)
      const targets = [targetAngle, (360 - targetAngle) % 360];
      
      for (const target of targets) {
        const currentRelLon = (moon.longitude - p.longitude + 360) % 360;
        const distToCover = (target - currentRelLon + 360) % 360;
        
        // Se a distância é muito grande e a velocidade relativa é baixa, pode não acontecer
        // Mas a Lua é rápida, então geralmente acontece em poucos dias.
        // O limite é o fim do signo (máximo ~30 graus, ~60 horas).
        
        const t = distToCover / relSpeed; // tempo em horas
        
        if (t > 0 && t < 100) { // Limite de busca razoável (aprox 4 dias)
          const moonLonAtT = moon.longitude + moon.speed * t;
          
          if (moonLonAtT < signEndLon) {
            if (t < earliestT) {
              earliestT = t;
              const typePT = ASPECT_TYPES.find(a => a.angle === targetAngle)?.name || 'aspecto';
              aspectDesc = `${getPlanetNamePT(p.id!)} (${ASPECT_NAMES_PT[typePT] || typePT})`;
            }
          }
        }
      }
    }
  }

  return {
    isVoid: earliestT === Infinity,
    nextAspect: earliestT === Infinity ? undefined : aspectDesc,
    remainingDegrees: parseFloat(remainingDegrees.toFixed(2))
  };
}

const ASPECT_NAMES_PT: Record<string, string> = {
  conjunction: 'conjunção',
  sextile: 'sextil',
  square: 'quadratura',
  trine: 'trígono',
  opposition: 'oposição'
};


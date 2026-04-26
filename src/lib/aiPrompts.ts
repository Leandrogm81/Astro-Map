import { NatalChart, ZodiacSign, PlanetPosition, Aspect } from '@/types';
import { getDignity, getDomicileRuler, calculateDispositorChain, getInterceptedSigns, getHouseForPlanet, calculateCrossAspects } from './astrology';
import { TraditionalAssessment, ElectiveMode, ElectiveVeredict } from './traditional/types';
import { translateMagicPurposePt, translatePlanetNamePt } from './traditional/constants';

const TRADITIONAL_PLANET_IDS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

function translateElectiveText(text: string): string {
  return text
    .replace(/\bSUN\b/g, translatePlanetNamePt('sun'))
    .replace(/\bMOON\b/g, translatePlanetNamePt('moon'))
    .replace(/\bMERCURY\b/g, translatePlanetNamePt('mercury'))
    .replace(/\bVENUS\b/g, translatePlanetNamePt('venus'))
    .replace(/\bMARS\b/g, translatePlanetNamePt('mars'))
    .replace(/\bJUPITER\b/g, translatePlanetNamePt('jupiter'))
    .replace(/\bSATURN\b/g, translatePlanetNamePt('saturn'))
    .replace(/\bSun\b/g, translatePlanetNamePt('Sun'))
    .replace(/\bMoon\b/g, translatePlanetNamePt('Moon'))
    .replace(/\bMercury\b/g, translatePlanetNamePt('Mercury'))
    .replace(/\bVenus\b/g, translatePlanetNamePt('Venus'))
    .replace(/\bMars\b/g, translatePlanetNamePt('Mars'))
    .replace(/\bJupiter\b/g, translatePlanetNamePt('Jupiter'))
    .replace(/\bSaturn\b/g, translatePlanetNamePt('Saturn'))
    .replace(/\bsun\b/g, translatePlanetNamePt('sun'))
    .replace(/\bmoon\b/g, translatePlanetNamePt('moon'))
    .replace(/\bmercury\b/g, translatePlanetNamePt('mercury'))
    .replace(/\bvenus\b/g, translatePlanetNamePt('venus'))
    .replace(/\bmars\b/g, translatePlanetNamePt('mars'))
    .replace(/\bjupiter\b/g, translatePlanetNamePt('jupiter'))
    .replace(/\bsaturn\b/g, translatePlanetNamePt('saturn'));
}

function formatTraditionalSkyContext(chart: NatalChart): string {
  let result = '';

  chart.planets.forEach((planet) => {
    if (!TRADITIONAL_PLANET_IDS.includes(planet.id)) return;

    result += `${planet.name}: ${planet.sign} ${Math.floor(planet.degree)}Â° na Casa ${planet.house}`;
    if (planet.retrograde) {
      result += ' â„ž';
    }
    result += `\n`;
  });

  return translateElectiveText(result);
}

function formatElectiveNatalContext(skyChart: NatalChart, natalChart: NatalChart): string {
  let result = '';

  result += `DADOS NATAIS DE REFERÊNCIA:\n`;
  result += `- Ascendente natal: ${getZodiacSign(natalChart.ascendant)} ${formatDegree(natalChart.ascendant % 30)}\n`;

  natalChart.planets.forEach((planet) => {
    if (!TRADITIONAL_PLANET_IDS.includes(planet.id)) return;
    result += `- ${planet.name}: ${planet.sign} ${Math.floor(planet.degree)}° na Casa ${planet.house}\n`;
  });

  // Adicionar Contexto Tradicional do Mapa Natal se disponível
  if (natalChart.traditionalPoints || (natalChart.traditionalAssessments && natalChart.traditionalAssessments.length > 0)) {
    result += `\nCONTEXTO TRADICIONAL DO MAPA NATAL:\n`;
    result += `-`.repeat(40) + '\n';
    
    if (natalChart.traditionalPoints) {
      const tp = natalChart.traditionalPoints;
      result += `- ALMUTEN FIGURIS: ${tp.almutenFiguris?.name || 'N/A'}\n`;
      result += `- HYLEG: ${tp.hyleg?.name || 'N/A'}\n`;
      result += `- ALCOCODEN: ${tp.alcocoden?.name || 'N/A'}\n`;
      result += `- SENHOR DA NATIVIDADE: ${tp.lordOfNativity?.name || 'N/A'}\n`;
    }

    if (natalChart.traditionalAssessments && natalChart.traditionalAssessments.length > 0) {
      result += `\nESTADO OPERACIONAL DOS PLANETAS NATAIS:\n`;
      natalChart.traditionalAssessments.forEach(ass => {
        const cond = ass.totalScore >= 10 ? 'Soberana' : ass.totalScore >= 5 ? 'Forte' : ass.totalScore <= -10 ? 'Crítica' : ass.totalScore <= -5 ? 'Debilitada' : 'Moderada';
        result += `- ${ass.planetId.toUpperCase()}: ${ass.totalScore} pts (${cond}) | Dignidade: ${ass.dignity}\n`;
      });
    }
  }

  result += `\nTRÂNSITOS DO CÉU DO MOMENTO NAS CASAS NATAIS:\n`;
  result += `-`.repeat(40) + '\n';

  skyChart.planets.forEach((planet) => {
    if (!TRADITIONAL_PLANET_IDS.includes(planet.id)) return;
    const natalHouse = getHouseForPlanet(planet.longitude, natalChart.housesPlacidus);
    result += `${planet.name}: cai na Casa ${natalHouse} natal\n`;
  });

  const crossAspects = calculateCrossAspects(skyChart.planets, natalChart.planets)
    .filter((aspect) =>
      TRADITIONAL_PLANET_IDS.includes(aspect.planet1.toLowerCase()) &&
      TRADITIONAL_PLANET_IDS.includes(aspect.planet2.toLowerCase()) &&
      ['conjunção', 'sextil', 'quadratura', 'trígono', 'oposição'].includes(aspect.type)
    )
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 12);

  if (crossAspects.length > 0) {
    result += `\nASPECTOS ENTRE O CÉU DO MOMENTO E O MAPA NATAL:\n`;
    result += `-`.repeat(40) + '\n';

    crossAspects.forEach((aspect) => {
      result += `${aspect.planet1} (agora) ${aspect.type} ${aspect.planet2} (natal) — órbita ${aspect.orb.toFixed(1)}°\n`;
    });
  }

  return translateElectiveText(result);
}

/**
 * Utilitários para formatar dados do mapa para a IA
 */
const formatDegree = (degree: number): string => {
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  return `${d}°${m}'`;
};

const getZodiacSign = (longitude: number): string => {
  const signs = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  return signs[Math.floor(longitude / 30) % 12];
};

const ASPECT_NAMES_PT: Record<string, string> = {
  conjunction: 'Conjunção',
  sextile: 'Sextil',
  square: 'Quadratura',
  trine: 'Trígono',
  opposition: 'Oposição',
};

/**
 * Formata o mapa astral em uma string rica e legível para a IA,
 * incluindo dignidades, cadeia de disposição e signos interceptados.
 */
export function formatChartForAI(chart: NatalChart): string {
  const { birthData, planets, housesPlacidus, aspects, ascendant, mc } = chart;

  let result = `DADOS DO MAPA ASTRAL\n`;
  result += `====================\n\n`;
  result += `NOME: ${birthData.name}\n`;
  result += `DATA: ${birthData.date}\n`;
  result += `HORA: ${birthData.time}\n`;
  result += `LOCAL: ${birthData.location}\n`;
  result += `COORDENADAS: ${birthData.latitude.toFixed(4)}°, ${birthData.longitude.toFixed(4)}°\n\n`;

  // === Posições com dignidades e regência ===
  result += `POSIÇÕES PLANETÁRIAS (COM DIGNIDADES E REGÊNCIA):\n`;
  result += `-`.repeat(60) + '\n';

  for (const planet of planets) {
    const retro = planet.retrograde ? ' ℞' : '';
    const degree = formatDegree(planet.degree);
    const dignity = getDignity(planet.name, planet.sign);
    const ruler = getDomicileRuler(planet.sign);
    const dignityStr = dignity !== 'Neutro / Peregrino' ? ` — ${dignity}` : ' — Peregrino';
    const rulerStr = ruler ? ` (Regido por: ${ruler})` : '';
    result += `${planet.name}: ${planet.sign} ${degree} na Casa ${planet.house}${retro}${dignityStr}${rulerStr}\n`;
  }

  // === Ângulos ===
  result += `\nÂNGULOS PRINCIPAIS:\n`;
  result += `-`.repeat(60) + '\n';
  result += `Ascendente (ASC): ${getZodiacSign(ascendant)} ${formatDegree(ascendant % 30)}\n`;
  result += `Meio do Céu (MC): ${getZodiacSign(mc)} ${formatDegree(mc % 30)}\n`;
  result += `Regente do Ascendente: ${getDomicileRuler(getZodiacSign(ascendant) as ZodiacSign)}\n`;

  // === Cúspides ===
  result += `\nCÚSPIDES DAS CASAS (Placidus):\n`;
  result += `-`.repeat(60) + '\n';

  for (const house of housesPlacidus) {
    result += `Casa ${house.number}: ${house.sign} ${formatDegree(house.degree)}\n`;
  }

  // === Cadeia de Disposição ===
  result += `\nCADEIA DE DISPOSIÇÃO:\n`;
  result += `-`.repeat(60) + '\n';
  const chain = calculateDispositorChain(planets);
  const domiciles = chain.filter(c => {
    const p = planets.find((pl: PlanetPosition) => pl.name === c.planet);
    return p && getDignity(p.name, p.sign) === 'Domicílio';
  });

  for (const link of chain) {
    const isFinal = domiciles.some(d => d.planet === link.planet);
    result += `${link.planet} → ${link.isRuledBy}${isFinal ? ' (DISPOSITOR FINAL — em Domicílio)' : ''}\n`;
  }

  if (domiciles.length > 0) {
    result += `\n→ Dispositor(es) final(is) do mapa: ${domiciles.map(d => d.planet).join(', ')}\n`;
  }

  // === Signos Interceptados ===
  const intercepted = getInterceptedSigns(housesPlacidus);
  if (intercepted.length > 0) {
    result += `\nSIGNOS INTERCEPTADOS:\n`;
    result += `-`.repeat(60) + '\n';
    result += `${intercepted.join(' e ')} estão interceptados (sem cúspide de casa própria).\n`;
    result += `Planetas nestes signos podem ter dificuldade de expressão direta.\n`;
  }

  // === Aspectos ===
  result += `\nASPECTOS PRINCIPAIS:\n`;
  result += `-`.repeat(60) + '\n';

  const majorAspects = aspects.filter((a: Aspect) =>
    ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type)
  ).slice(0, 25);

  for (const aspect of majorAspects) {
    const applying = aspect.applying ? 'aplicando' : 'separando';
    const typePT = ASPECT_NAMES_PT[aspect.type] || aspect.type;
    result += `${aspect.planet1} ${typePT} ${aspect.planet2} (Órbita: ${aspect.orb.toFixed(1)}°, ${applying})\n`;
  }

  return result;
}

/**
 * Formata a comparação Natal ↔ Revolução Solar com aspectos cruzados
 * e interposição de casas para envio à IA.
 */
export function formatSolarComparisonForAI(
  natal: NatalChart,
  solar: NatalChart,
  year: number
): string {
  let result = '';

  // === Mapa Natal (resumo) ===
  result += `=== MAPA NATAL (REFERÊNCIA) ===\n\n`;
  result += formatChartForAI(natal);

  // === Revolução Solar ===
  result += `\n\n=== REVOLUÇÃO SOLAR ${year} ===\n\n`;

  const { planets: srPlanets, housesPlacidus: srHouses, aspects: srAspects, ascendant: srAsc, mc: srMc } = solar;

  result += `DATA EXATA DO RETORNO SOLAR: ${solar.birthData.date} às ${solar.birthData.time}\n\n`;

  // Ascendente da RS e onde cai no natal
  const srAscSign = getZodiacSign(srAsc);
  const srAscHouseNatal = getHouseForPlanet(srAsc, natal.housesPlacidus);
  result += `ASCENDENTE DA REVOLUÇÃO: ${srAscSign} ${formatDegree(srAsc % 30)}\n`;
  result += `→ Cai na Casa ${srAscHouseNatal} do Mapa Natal\n`;
  result += `→ TEMA CENTRAL DO ANO: A energia de ${srAscSign} ativa a área da Casa ${srAscHouseNatal} natal.\n\n`;

  // MC da RS
  const srMcSign = getZodiacSign(srMc);
  const srMcHouseNatal = getHouseForPlanet(srMc, natal.housesPlacidus);
  result += `MC DA REVOLUÇÃO: ${srMcSign} ${formatDegree(srMc % 30)} → Casa ${srMcHouseNatal} natal\n\n`;

  // === Posições com interposição de casas ===
  result += `POSIÇÕES PLANETÁRIAS DA RS (COM INTERPOSIÇÃO DE CASAS):\n`;
  result += `-`.repeat(60) + '\n';

  for (const planet of srPlanets) {
    const retro = planet.retrograde ? ' ℞' : '';
    const degree = formatDegree(planet.degree);
    const natalHouse = getHouseForPlanet(planet.longitude, natal.housesPlacidus);
    result += `${planet.name}: ${planet.sign} ${degree} na Casa ${planet.house} (RS) → Casa ${natalHouse} (Natal)${retro}\n`;
  }

  // === Aspectos cruzados RS ↔ Natal ===
  result += `\nASPECTOS CRUZADOS (RS ↔ NATAL) — os mais importantes:\n`;
  result += `-`.repeat(60) + '\n';

  const crossAspects = calculateCrossAspects(srPlanets, natal.planets)
    .filter(a => ['conjunção', 'sextil', 'quadratura', 'trígono', 'oposição'].includes(a.type))
    .sort((a, b) => (a as { orb: number }).orb - (b as { orb: number }).orb)
    .slice(0, 20);

  if (crossAspects.length > 0) {
    for (const aspect of crossAspects) {
      result += `${aspect.planet1} (RS) ${aspect.type} ${aspect.planet2} (Natal) — órbita: ${aspect.orb.toFixed(1)}°\n`;
    }
  } else {
    result += `Nenhum aspecto cruzado significativo encontrado.\n`;
  }

  // === Aspectos internos da RS ===
  result += `\nASPECTOS INTERNOS DA RS:\n`;
  result += `-`.repeat(60) + '\n';

  const srMajorAspects = srAspects.filter((a: Aspect) =>
    ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type)
  ).slice(0, 15);

  for (const aspect of srMajorAspects) {
    const typePT = ASPECT_NAMES_PT[aspect.type] || aspect.type;
    result += `${aspect.planet1} ${typePT} ${aspect.planet2} (Órbita: ${aspect.orb.toFixed(1)}°)\n`;
  }

  // === Casas da RS ===
  result += `\nCÚSPIDES DAS CASAS DA RS (Placidus):\n`;
  result += `-`.repeat(60) + '\n';

  for (const house of srHouses) {
    result += `Casa ${house.number}: ${house.sign} ${formatDegree(house.degree)}\n`;
  }

  return result;
}

/**
 * Formata os dados técnicos tradicionais para a IA
 */
export function formatTraditionalChartForAI(chart: NatalChart, assessments: TraditionalAssessment[]): string {
  const { birthData, housesPlacidus } = chart;

  if (!birthData) {
    return 'Erro: Dados de nascimento não encontrados.';
  }

  let result = `DADOS TÉCNICOS DE ASTROLOGIA TRADICIONAL (SETENÁRIO E HELENÍSTICA)\n`;
  result += `===================================================================\n\n`;
  result += `NOME: ${birthData.name}\n`;
  result += `DADOS: ${birthData.date} às ${birthData.time}\n`;
  result += `LOCAL: ${birthData.location}\n\n`;

  // === Seita e Pontos Vitais ===
  const isDay = chart.isDayChart ?? true;
  result += `CONDIÇÃO GERAL:\n`;
  result += `- SEITA DO MAPA: ${isDay ? 'DIURNO (Sol acima do horizonte)' : 'NOTURNO (Sol abaixo do horizonte)'}\n`;

  if (chart.traditionalPoints) {
    const tp = chart.traditionalPoints;
    result += `- ALMUTEN FIGURIS: ${tp.almutenFiguris?.name || 'Não identificado'}\n`;
    result += `- HYLEG: ${tp.hyleg?.name || 'Não identificado'}\n`;
    result += `- ALCOCODEN: ${tp.alcocoden?.name || 'Não identificado'}\n`;
    result += `- SENHOR DA NATIVIDADE: ${tp.lordOfNativity?.name || 'Não identificado'}\n`;
    if (chart.prenatalSyzygy !== undefined) {
      result += `- SIZÍGIA PRÉ-NATAL: ${getZodiacSign(chart.prenatalSyzygy)} ${formatDegree(chart.prenatalSyzygy % 30)}\n`;
    }
  }
  result += `-`.repeat(60) + '\n\n';

  // === Condição dos Planetas Clássicos (Dignidades e Pontuação) ===
  result += `OS SETE GOVERNADORES (ESTADO OPERACIONAL):\n`;
  result += `-`.repeat(60) + '\n';

  const planetMapping: Record<string, string> = {
    sun: 'Sol',
    moon: 'Lua',
    mercury: 'Mercúrio',
    venus: 'Vênus',
    mars: 'Marte',
    jupiter: 'Júpiter',
    saturn: 'Saturno'
  };

  const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

  for (const id of classicIds) {
    const planeName = planetMapping[id];
    const assessment = assessments.find(a => a?.planetId?.toLowerCase() === id.toLowerCase());
    if (!assessment) continue;

    const retro = assessment.isRetrograde ? ' (RETRÓGRADO — Debilidade Acidental)' : '';
    const score = assessment.totalScore;
    const condition = score >= 10 ? 'Soberana/Excepcional' : score >= 5 ? 'Forte' : score <= -10 ? 'Crítica/Severa' : score <= -5 ? 'Debilitada' : 'Moderada';

    // Mapeamento de Debilidades se houver
    const debilities = [];
    if (assessment.score?.breakdown?.essential?.['Exílio']) debilities.push('Exílio (Detrimento)');
    if (assessment.score?.breakdown?.essential?.['Queda']) debilities.push('Queda (Fall)');
    const debilityStr = debilities.length > 0 ? ` [DEBILIDADES: ${debilities.join(', ')}]` : '';

    result += `> ${planeName.toUpperCase()}:\n`;
    result += `   * Signo/Casa: ${assessment.sign} na Casa ${assessment.house}${retro}\n`;
    result += `   * Dignidade Essencial: ${assessment.dignity}${debilityStr}\n`;
    result += `   * Almuten/Pontuação: ${score} pts [Condição: ${condition}]\n`;
    result += `   * Hierarquia de Regência:\n`;
    result += `     - Domicílio: ${assessment.dignities?.domicile || '---'}\n`;
    result += `     - Exaltação: ${assessment.dignities?.exaltation || 'Nenhuma'}\n`;
    result += `     - Triplicidade: ${assessment.dignities?.triplicity || '---'}\n`;
    const termStr = assessment.interpretations?.term || "";
    const faceStr = assessment.interpretations?.face || "";

    result += `     - Termo: ${termStr}\n`;
    result += `     - Face/Decano: ${faceStr}\n`;

    const cond = assessment.condition || {};
    const labels = [];
    if (cond.isCazimi) labels.push("Cazimi (No coração do Sol)");
    if (cond.isCombust) labels.push("Combusto (Queimado pelo Sol)");
    if (cond.isUnderRays) labels.push("Sob os Raios");
    if (cond.isHayz) labels.push("Hayz (Condição de Seita Ideal)");
    if (cond.isInMutualReception && Array.isArray(cond.isInMutualReception) && cond.isInMutualReception.length > 0) {
      labels.push(`Recepção Mútua com ${cond.isInMutualReception.join(', ')}`);
    }

    if (labels.length > 0) {
      result += `   * Acidentes/Recepções: ${labels.join(' | ')}\n`;
    }
    result += `\n`;
  }

  // === Signos das Casas ===
  result += `CÚSPIDES DAS CASAS (DOMÍNIOS DO DESTINO):\n`;
  result += `-`.repeat(60) + '\n';
  if (housesPlacidus && Array.isArray(housesPlacidus)) {
    for (const house of housesPlacidus) {
      result += `Casa ${house.number}: ${house.sign} ${formatDegree(house.degree)}\n`;
    }
  }
  result += `\n`;

  // === Aspectos Tradicionais ===
  result += `ASPECTOS TRADICIONAIS (PTOLOMEICOS):\n`;
  result += `-`.repeat(60) + '\n';
  const classicIdsList = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const traditionalAspects = (chart.aspects || []).filter((a: Aspect) =>
    a?.planet1 && a?.planet2 &&
    classicIdsList.includes(a.planet1.toLowerCase()) &&
    classicIdsList.includes(a.planet2.toLowerCase()) &&
    ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type)
  );

  for (const aspect of traditionalAspects) {
    const typePT = ASPECT_NAMES_PT[aspect.type] || aspect.type;
    result += `- ${aspect.planet1} em ${typePT} com ${aspect.planet2} (Órbita: ${aspect.orb.toFixed(1)}°)\n`;
  }
  result += `\n`;

  // === Lotes Herméticos ===
  result += `LOTES HERMÉTICOS (PONTOS DE DESTINO):\n`;
  result += `-`.repeat(60) + '\n';
  if (chart.lots) {
    for (const lot of chart.lots) {
      const houseNum = housesPlacidus && housesPlacidus.length > 0 ? getHouseForPlanet(lot.degree, housesPlacidus) : '?';
      result += `- ${lot.name}: ${lot.sign} ${formatDegree(lot.degree % 30)} na Casa ${houseNum}\n`;
      result += `  (Propósito: ${lot.description})\n`;
    }
  }

  return result;
}


/**
 * Prompt do Sistema para Relatório Tradicional (Clássico/Medieval)
 */
export const TRADITIONAL_PROMPT_SYSTEM = `Você é um Astrólogo Especialista em Técnicas Tradicionais e Helenísticas, com domínio profundo de obras fundamentais como o Tetrabiblos de Ptolomeu, a Antologia de Valens, e os tratados de Bonatti e Lilly.

Sua abordagem é técnica, analítica e fundamentada no rigor do cálculo das dignidades e do estado cósmico dos planetas. Seu objetivo é fornecer uma análise estrutural do destino e da operacionalidade do nativo no mundo sublunar.

TONALIDADE:
Sóbria, técnica, precisa e acadêmica. Evite floreios dramáticos ou teatralidade excessiva. Use terminologia correta: "Dignidade Essencial", "Estado Acidental", "Seita", "Condição Solar", "Recepção" e "Domínio". Seu texto deve ser lido como um parecer técnico de um mestre de ofício.

DIRETRIZES DE ANÁLISE:
1. **O Governo da Natividade:** Analise a Seita (Mapa Diurno vs Noturno). Isso altera o peso dos luminares e a funcionalidade dos planetas (ex: Marte em mapa noturno é menos destrutivo).
2. **Dignidades e Debilidades:** Avalie cada um dos sete governadores. Diferencie claramente entre um planeta com autoridade (Domicílio/Exaltação) e um planeta em estado de servidão ou exílio.
3. **Almuten Figuris:** Identifique o planeta com maior soberania sobre os pontos vitais (Sol, Lua, ASC, Fortuna e Sizígia). Ele é o guardião e guia da expressão da vida.
4. **Hyleg e Alcocoden:** Analise a vitalidade e a longevidade potencial. 
   - IMPORTANTE: Trate estes pontos como indicadores simbólicos de "força vital" e "sustentação física". 
   - AVISO ÉTICO: É terminantemente proibido fazer previsões de data de morte ou diagnósticos médicos definitivos. Use termos como "vitalidade robusta", "períodos de maior exigência física" ou "sustentação estável".
5. **Lotes Herméticos:** Interprete a Roda da Fortuna e o Lote do Espírito como indicadores de sucesso material e propósito de ação consciente.
6. **Sizígia Pré-Natal:** Use a posição da última lunação antes do nascimento como um ponto de ancoragem para o destino e o Almuten.

ESTRUTURA DO RELATÓRIO (Markdown com H3):

### 🏛️ A Estrutura da Natividade e a Seita
(Análise do sol/lua em relação ao horizonte e o temperamento geral do céu).

### 🛡️ O Almuten Figuris e a Proteção do Destino
(Interpretação do planeta vencedor e sua influência sobre o caráter e o caminho do nativo).

### ✨ Os Sete Governadores: Dignidades e Operacionalidade
(Análise detalhada do estado essencial e acidental de cada planeta clássico).

### ⚖️ Hyleg e Alcocoden: Vitalidade e Sustentação
(Análise da força vital com tom sóbrio e sem previsões fatais).

### ⊗ Os Lotes Herméticos e a Sizígia
(A relação com a matéria e o espírito através da Roda da Fortuna e do Espírito).

### 📜 Síntese Técnica e Conclusão
(Resumo das forças dominantes e dos principais desafios operacionais do mapa).

REGRAS ADICIONAIS:
- Não use linguagem "New Age" (vibrações, energia quântica, evolução espiritual). Use termos de "Eficácia", "Emanação", "Dignidade" e "Destino".
- Ignore Urano, Netuno e Plutão na análise tradicional, exceto se estiverem em conjunção exata (<1°) com ângulos ou luminares.
- Extensão: Entre 2500 e 4000 palavras em Português Brasileiro Erudito.`;

export const NATAL_PROMPT_SYSTEM = `Você é um mestre astrólogo com 30 anos de experiência...

Você escreve em Português Brasileiro impecável, com voz empática, elegante e profunda.

OBJETIVO:
Gerar um relatório astrológico profundo, detalhado e personalizado. Os dados fornecidos incluem DIGNIDADES, CADEIA DE DISPOSIÇÃO e SIGNOS INTERCEPTADOS — use-os ativamente na interpretação. Planetas em Domicílio ou Exaltação são forças do mapa; planetas em Exílio ou Queda representam desafios de integração.

ESTRUTURA DO RELATÓRIO (Use Markdown com H3 para seções):

### 🌟 O Núcleo da Personalidade (Sol, Lua e Ascendente)
### 🏛️ Arquitetura do Mapa (Regente, Elementos e Disposição)
### 💼 Vocação, Carreira e Abundância
### ❤️ Amor, Desejo e Relacionamentos
### 🌑 Lilith — A Sombra e o Poder Oculto
### 🚧 Desafios e Maturidade (Saturno e Aspectos Tensos)
### 🔮 Propósito Evolutivo (Nodos Lunares e Quíron)
### ✨ Síntese e Integração

REGRAS FUNDAMENTAIS:
- Use Markdown com formatação rica (negrito, itálico, listas).
- Seja ESPECÍFICO: cite signos, casas, graus e dignidades dos dados fornecidos. Nunca generalize.
- Use as dignidades ativamente.
- Escreva entre 2500 e 4000 palavras.`;

export const SOLAR_RETURN_PROMPT_SYSTEM = `Você é um astrólogo especializado em técnicas preditivas...

ESTRUTURA DO RELATÓRIO (Markdown com H3):
### 📅 O Grande Tema do Ano
### ☀️ Onde Sua Energia Vital se Concentra
### 🌙 O Ritmo Emocional do Ano
### 🔥 Ativações Planetárias (Aspectos Cruzados)
### 🏛️ Áreas da Vida em Destaque
### 🔄 Promessas Natais Ativadas
### 💡 Orientações para o Ano

REGRAS:
- Seja sempre comparativo.
- Escreva entre 2000 e 3500 palavras.`;

/**
 * Formata os dados de Eletiva Mágica para a IA
 */
export function formatElectiveForAI(
  veredict: ElectiveVeredict,
  skyChart: NatalChart,
  mode: ElectiveMode = 'sky_only',
  natalChart?: NatalChart
): string {
  const { purpose, planetHour, lunarMansion, moonStatus, rulerCondition, score } = veredict;
  const { birthData } = skyChart;

  let result = `SOLICITACAO DE ANALISE DE ELETIVA MAGICA
`;
  result += `========================================

`;
  result += `MODO DE LEITURA: ${mode === 'sky_plus_natal' ? 'CEU DO MOMENTO + MAPA NATAL' : 'CEU DO MOMENTO'}
`;
  result += `PROPOSITO MAGICO: ${translateMagicPurposePt(purpose).toUpperCase()}
`;
  result += `VEREDITO TECNICO: ${score.toUpperCase()}

`;

  result += `DADOS DO CEU ELEITO:
`;
  result += `- Data/Hora: ${birthData.date} ${birthData.time}
`;
  result += `- Hora Planetária: ${(planetHour.planetId || 'N/A').toUpperCase()} (${planetHour.hourNumber}a hora do ${planetHour.isDaytime ? 'Dia' : 'Noite'})
`;
  result += `- Período da Hora: ${planetHour.startTime} até ${planetHour.endTime}
`;
  result += `- Mansão Lunar: ${lunarMansion.number} - ${lunarMansion.name} (${lunarMansion.sign})
`;
  result += `- Fase da Lua: ${moonStatus.phase}

`;

  result += `CONDICAO DO REGENTE DO PROPOSITO (${(rulerCondition.planetId || 'N/A').toUpperCase()}):
`;
  result += `- Dignidade Essencial: ${rulerCondition.dignity}
`;
  result += `- Força Tradicional do Regente: ${rulerCondition.totalScore} pts
`;

  result += `CONTEXTO DO CEU COMPLETO:
`;
  result += '-'.repeat(40) + '\n';
  result += formatTraditionalSkyContext(skyChart);

  if (mode === 'sky_plus_natal' && natalChart) {
    result += `
`;
    result += formatElectiveNatalContext(skyChart, natalChart);
  }

  return result
    .replace(
      `- Hora PlanetÃ¡ria: ${(planetHour.planetId || 'N/A').toUpperCase()}`,
      `- Hora PlanetÃ¡ria: ${translatePlanetNamePt(planetHour.planetId)}`
    )
    .replace(
      `CONDICAO DO REGENTE DO PROPOSITO (${(rulerCondition.planetId || 'N/A').toUpperCase()}):`,
      `CONDICAO DO REGENTE DO PROPOSITO (${translatePlanetNamePt(rulerCondition.planetId)}):`
    );
}

/**
 * Prompt do Sistema para Magia Astrológica (Eletivas)
 */
export const ELECTIVE_MAGIC_SKY_ONLY_PROMPT_SYSTEM = `Você é um Mago-Astrólogo de linhagem hermética, um profundo conhecedor das correntes de emanação que descem das Esferas Celestes. Sua autoridade provém do domínio absoluto do Picatrix (Ghâyat al-Hakîm), das Três Livros de Filosofia Oculta de Cornélio Agrippa e da Heptameron de Pietro d'Abano.

Sua tarefa é realizar uma Eletiva Magística exaustiva para uma operação proposta. Você não apenas analisa o céu, mas interpreta a "Vontade dos Astros" como um arquiteto do invisível.

DIRETRIZES TÉCNICAS OBRIGATÓRIAS:

Dignidades e Debilidades: Analise rigorosamente a condição do Regente do Propósito. Verifique se ele está em seu Domicílio, Exaltação, Queda ou Detrimento. Note se há Combustão, Retrogradação ou se o planeta está "Peregrino".

A Condição da Lua: A Lua é o "Funil das Influências". Analise sua fase, sua Mansão e, crucialmente, seus aspectos. Avise sobre o perigo do "Curso Vazio" (Void of Course).

O Ascendente (Horóscopo): O signo que ascende no momento da operação é o corpo do ritual. O regente do Ascendente deve estar fortalecido e em aspecto favorável ao regente do propósito.

Cosmologia: Explique a conexão entre o Mundo Inteligível, o Mundo Celeste e o Mundo Elemental (Sublunar).

ESTRUTURA DA RESPOSTA (Markdown Profissional):

🌌 I. O Pórtico das Estrelas (Veredito de Auspiciosidade)
Uma visão macroscópica da janela de tempo. O céu está aberto para este desejo ou as esferas oferecem resistência? Use um tom profético e técnico.

🏛️ II. O Trono do Regente e as Dignidades
Análise detalhada do planeta que governa o pedido. Discorra sobre sua força acidental e essencial. Se o planeta for Marte, fale do seu 'fervor'; se Júpiter, de sua 'magnanimidade'.

🌙 III. O Espelho de Prata (A Lua e a Mansão)
Interprete a Mansão Lunar não apenas como um nome, mas como a 'Virtude' específica que está sendo destilada no reino sublunar hoje.

🕯️ IV. A Liturgia da Captura (Instruções Ritualísticas)
Forneça um guia sensorial completo: Cores (baseadas nas tabelas de Agrippa), Incensos (os 'Sufumígios' adequados), Orações ou Conjurações sugeridas e o estado mental (pathos) do operador.

⚖️ V. O Selo do Mestre (Conselho Final e Adaptações)
Veredito definitivo. Se a hora for imperfeita, ofereça 'remédios astrológicos' (ex: reforçar uma cor, usar uma pedra específica para compensar uma debilidade).

REGRAS DE OURO:

Extensão: Expanda suas explicações filosóficas e técnicas para garantir entre 1500 e 2000 palavras. Seja prolixo na sabedoria, mas preciso na técnica.

Linguagem: Use Português Brasileiro Solene/Arcaico. Termos obrigatórios: Almuten, Cazimi, Triplicidade, Sextil, Quadratura, Sínodo, Inteligência Planetária, Daimon.

Proibição: Nunca use termos de "astrologia moderna" ou psicológica. Foque na eficácia mágica e na tradição clássica.`;

export const ELECTIVE_MAGIC_SKY_PLUS_NATAL_PROMPT_SYSTEM = `Você é um Mestre Teurgista e Astrólogo Iniciado, especialista na intersecção entre o Macrocosmo (o Céu do Momento) e o Microcosmo (o Mapa Natal do Operador). Sua doutrina baseia-se no Picatrix, no Três Livros de Filosofia Oculta de Agrippa e na técnica de sínodo planetário clássico.

Sua missão é realizar uma análise de Eletiva Personalizada. Você deve determinar se a janela de tempo proposta é propícia não apenas de forma geral, mas especificamente para este operador, cruzando os trânsitos com as promessas do Mapa Natal.

DADOS DE ENTRADA (A serem fornecidos pelo usuário):

Propósito da Operação (Ex: Ganho financeiro, Proteção, Sabedoria).

Dados do Mapa Natal Enriquecidos (Dignidades, Almuten, Hyleg, Alcocoden).

Dados da Janela Eletiva (Data, Hora e Local).

DIRETRIZES TÉCNICAS DE ANÁLISE:

1. A Promessa Natal Enriquecida: Analise não apenas as posições natais, mas a autoridade dos planetas (Almuten Figuris) e sua força operacional (pontuação tradicional). Se o operador pede por "autoridade" e o Sol natal dele é o Almuten Figuris ou está soberano em pontuação, a eleição ganha um peso triplicado. Use os dados do "CONTEXTO TRADICIONAL DO MAPA NATAL" fornecidos.

2. O Senhor do Ano (Profeção) e Regência: Considere se o planeta regente da eleição tem dignidade ou importância no mapa natal do operador (ex: é o Senhor da Natividade dele?).

3. Aspectos de Ativação: Analise os aspectos dos planetas da eleição sobre os planetas natais. Foque em conjunções, trígonos e sextis. Avise severamente sobre quadraturas ou oposições de maléficos (Saturno/Marte) aos luminares natais.

4. O Ascendente da Eleição: O Ascendente do momento da operação deve, preferencialmente, cair em uma casa favorável do Mapa Natal ou estar em harmonia com o Almuten Figuris do operador.

ESTRUTURA DA RESPOSTA (Markdown):

🌌 I. O Alinhamento dos Mundos (Auspiciosidade Geral)
Análise do "Céu Universal". Como as emanações estão fluindo no momento independente do operador?

👤 II. A Assinatura da Alma (Conexão com o Natal Tradicional)
Aqui reside o coração da análise. Como os astros do momento "tocam" a estrutura técnica do seu nascimento? Use os dados de Almuten, Hyleg e Estado Operacional Natal para personalizar o conselho. O planeta da eleição respeita a hierarquia do seu mapa?

🏗️ III. A Fortaleza do Operador (Casas e Ângulos)
Em qual casa do seu mapa natal a operação está ocorrendo? (Ex: "A Lua da eleição transita sua Casa XI natal, mobilizando seus aliados e redes").

🕯️ IV. A Liturgia Sob Medida (Cores, Metais e Incensos)
Instruções ritualísticas baseadas na mistura das energias. Se a eleição é de Sol, mas seu Sol natal precisa de força, sugira o uso de pedras ou metais que façam essa ponte.

⚖️ V. O Veredito do Mestre
Conselho final: Prosseguir, Adaptar ou Abortar. Use um tom de autoridade técnica e espiritual.

REGRAS DE OURO:

Tom de Voz: Solene, técnico, profundo e personalizado. Use "Tu" ou o tratamento formal.

Terminologia: Hyleg, Alcocoden, Senhor da Genitura, Almuten Figuris, Estado Operacional, Radix.

Extensão: Entre 1200 e 2000 palavras. Explore a filosofia da "Simpatia Universal".

Aviso: Se houver um aspecto perigoso para a saúde ou integridade do operador no cruzamento, o alerta deve ser enfático.`;

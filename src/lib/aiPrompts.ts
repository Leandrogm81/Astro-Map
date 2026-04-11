import { NatalChart, PlanetPosition } from '@/types';
import { getDignity, getDomicileRuler, calculateDispositorChain, getInterceptedSigns, getHouseForPlanet, calculateCrossAspects } from './astrology';

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
  result += `Regente do Ascendente: ${getDomicileRuler(getZodiacSign(ascendant) as any)}\n`;
  
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
    const p = planets.find(pl => pl.name === c.planet);
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
  
  const majorAspects = aspects.filter(a => 
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
    .sort((a: any, b: any) => a.orb - b.orb)
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
  
  const srMajorAspects = srAspects.filter(a => 
    ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type)
  ).slice(0, 15);
  
  for (const aspect of srMajorAspects) {
    const typePT = ASPECT_NAMES_PT[aspect.type] || aspect.type;
    result += `${aspect.planet1} ${typePT} ${aspect.planet2} (Órbita: ${aspect.orb.toFixed(1)}°)\n`;
  }
  
  // === Casas da RS ===
  result += `\nCÚSPIDES DAS CASAS DA RS (Placidus):\n`;
  result += `-`.repeat(60) + '\n';
  
  for (const house of srHouses) {/**
 * Prompt do Sistema para Relatório Natal
 * 
 * Estrutura rígida para segmentação do PDF de 15 páginas.
 * Usa tags [[TAG]]...[[/TAG]] para parser seguro.
 */
export const NATAL_PROMPT_SYSTEM = `Você é um mestre astrólogo sênior. Sua tarefa é gerar um relatório astrológico estruturado em blocos rigorosos para um livro de 15 páginas.

REGRAS CRÍTICAS DE FORMATO:
1. Você DEVE usar exatamente as tags [[TAG]] e [[/TAG]] para abrir e fechar cada seção.
2. NÃO escreva NADA fora das tags.
3. Use markdown (negrito, listas) dentro dos blocos, mas evite h1 ou h2 (use apenas h3 se necessário).
4. Respeite os limites de caracteres (incluindo espaços) para cada bloco.
5. Seja incisivo, profundo e prático.

ESTRUTURA OBRIGATÓRIA:

[[SINTESE_EXECUTIVA_NATAL]]
(Limite: 900-1400 caracteres)
Resumo de alto impacto: 3 forças centrais, 3 desafios, vocação dominante e frase-resumo do mapa.
[[/SINTESE_EXECUTIVA_NATAL]]

[[NUCLEO_PERSONALIDADE]]
(Limite: 1800-2600 caracteres)
Análise profunda da tríade Sol, Lua e Ascendente. Como eles interagem na psique do indivíduo.
[[/NUCLEO_PERSONALIDADE]]

[[ARQUITETURA_INTERNA]]
(Limite: 1200-1800 caracteres)
Regente do ascendente, equilíbrio de elementos/modalidades e a mensagem do dispositor final. Explique como a "máquina" do mapa opera. Inclua menção a signos interceptados se houver.
[[/ARQUITETURA_INTERNA]]

[[VOCACAO_TRABALHO_DINHEIRO]]
(Limite: 1200-1800 caracteres)
Casas 2, 6 e 10. Talentos, caminhos de prosperidade e o Meio do Céu. Seja concreto.
[[/VOCACAO_TRABALHO_DINHEIRO]]

[[AMOR_DESEJO_VINCULOS]]
(Limite: 1200-1800 caracteres)
Vênus, Marte e Casa 7. Padrões afetivos, o que atrai e como se relaciona.
[[/AMOR_DESEJO_VINCULOS]]

[[SOMBRA_MATURIDADE_PROPOSITO]]
(Limite: 1400-2000 caracteres)
Lilith (a sombra e poder), Saturno (limites e maturidade), Nodos (caminho da alma) e Quíron (a ferida/cura).
[[/SOMBRA_MATURIDADE_PROPOSITO]]

[[SINTESE_NATAL_FINAL]]
(Limite: 700-1100 caracteres)
Mensagem final de integração. O conselho mestre para a evolução desta pessoa.
[[/SINTESE_NATAL_FINAL]]`;

/**
 * Prompt do Sistema para Revolução Solar
 */
export const SOLAR_RETURN_PROMPT_SYSTEM = `Você é um astrólogo especializado em Revolução Solar. Gere a análise segmentada para o PDF usando tags [[TAG]]...[[/TAG]].

REGRAS:
1. Use APENAS as tags solicitadas.
2. NADA de texto fora das tags.
3. Foco em interposição de casas e aspectos cruzados RS/Natal.

ESTRUTURA:

[[ABERTURA_RS]]
(Limite: 900-1400 caracteres)
Título do ano, palavra-chave, Ascendente da RS na casa natal e o grande tema de vitalidade (Sol da RS).
[[/ABERTURA_RS]]

[[GUIA_PRATICO_ANO]]
(Limite: 2200-3400 caracteres)
Análise detalhada das áreas ativadas. Inclua obrigatoriamente um PLANO PRÁTICO POR SEMESTRES ao final deste bloco (1º e 2º semestre), com conselhos objetivos.
[[/GUIA_PRATICO_ANO]]`;

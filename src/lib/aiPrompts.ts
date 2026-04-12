import { NatalChart, PlanetPosition } from '@/types';
import { TraditionalAssessment } from './traditional/scoring';
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
  
  for (const house of srHouses) {
    result += `Casa ${house.number}: ${house.sign} ${formatDegree(house.degree)}\n`;
  }
  
  return result;
}

/**
 * Formata os dados técnicos tradicionais para a IA
 */
export function formatTraditionalChartForAI(chart: NatalChart, assessments: TraditionalAssessment[]): string {
  const { birthData, planets, housesPlacidus, aspects } = chart;
  
  let result = `DADOS TÉCNICOS DE ASTROLOGIA TRADICIONAL\n`;
  result += `=========================================\n\n`;
  result += `NOME: ${birthData.name}\n`;
  result += `DADOS: ${birthData.date} às ${birthData.time}\n`;
  result += `LOCAL: ${birthData.location}\n\n`;

  // === Seita e Temperamento ===
  const sun = planets.find(p => p.name === 'Sol' || p.name === 'Sun');
  const asc = chart.ascendant;
  const isDay = sun ? (sun.house >= 7 && sun.house <= 12) : true;
  result += `SEITA DO MAPA: ${isDay ? 'DIURNO' : 'NOTURNO'}\n`;
  result += `-`.repeat(60) + '\n\n';

  // === Condição dos Planetas Clássicos (Dignidades e Pontuação) ===
  result += `ESTADO DOS 7 PLANETAS CLÁSSICOS:\n`;
  result += `-`.repeat(60) + '\n';
  
  const classicPlanets = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
  
  for (const planeName of classicPlanets) {
    const assessment = assessments.find(a => a.planetId.toLowerCase() === planeName.toLowerCase());
    if (!assessment) continue;

    const retro = assessment.isRetrograde ? ' (Retrógrado)' : '';
    const score = assessment.totalScore;
    const condition = score >= 5 ? 'Forte (Essencial)' : score <= -5 ? 'Debilitado' : 'Moderado';
    
    result += `${planeName.toUpperCase()}:\n`;
    result += `  - Signo/Casa: ${assessment.sign} na Casa ${assessment.house}${retro}\n`;
    result += `  - Dignidade Essencial: ${assessment.dignity}\n`;
    result += `  - Pontuação Técnica (Almuten Figuris): ${score} pts [${condition}]\n`;
    result += `  - Regentes: Domicílio (${assessment.dignities.domicile}), Exaltação (${assessment.dignities.exaltation}), Triplicidade (${assessment.dignities.triplicity})\n`;
    result += `  - Condição Adicional: ${assessment.sectStatus === 'In-Sect' ? 'Em Seita (Hayz/Halb)' : 'Fora de Seita'}\n\n`;
  }

  // === Lotes Herméticos ===
  result += `LOTES HERMÉTICOS PRINCIPAIS:\n`;
  result += `-`.repeat(60) + '\n';
  if (chart.lots) {
    for (const lot of chart.lots) {
      result += `${lot.name}: ${lot.sign} ${formatDegree(lot.degree % 30)} na Casa ${getHouseForPlanet(lot.degree, housesPlacidus)}\n`;
    }
  }

  return result;
}

/**
 * Prompt do Sistema para Relatório Tradicional (Clássico/Medieval)
 */
export const TRADITIONAL_PROMPT_SYSTEM = `Você é um Grão-Mestre de Astrologia Tradicional e Helenística, especializado nas técnicas de Dorotheus de Sidon, Ptolomeu, Abu Ma'shar e Guido Bonatti.

Sua abordagem é focado na OPERACIONALIDADE e EFETIVIDADE dos planetas. Você não faz análise psicológica moderna (Junguiana); você analisa o destino, a força vital, a capacidade de agir e a qualidade dos eventos na vida do nativo.

TONALIDADE:
Séria, erudita, precisa e direta. Use termos técnicos clássicos fundamentais. Seus textos devem soar como um "Tratado Tradicional" personalizado.

OBJETIVOS DA ANÁLISE:
1. **Dignidades Essenciais:** Analise quem comanda o signo. Um planeta em domicílio é o "dono da casa"; um peregrino é um "estrangeiro sem recursos".
2. **Seita (Sect):** Considere se o mapa é Diurno ou Noturno. Planetas da seita (Sol, Júpiter, Saturno no dia; Lua, Vênus, Marte na noite) agem com mais benefício.
3. **Pontuação Técnica:** Use os pontos fornecidos (Almuten) para determinar qual planeta realmente manda no mapa.
4. **Lotes Herméticos:** Interprete o Lote da Fortuna (corpo, prosperidade física) e o Lote do Espírito (alma, intenção, carreira intelectual).
5. **Delineação de Resultados:** Seja concreto. Se Marte está debilitado e é regente da Casa 2, fale sobre dificuldades financeiras concretas, não apenas "tensões internas".

ESTRUTURA DO RELATÓRIO (Markdown com H3):

### 📜 A Seita e o Governo do Mapa
Defina se o nativo é diurno ou noturno e como isso altera a percepção de Benéficos e Maléficos. Identifique o regente do Ascendente e o Almuten Figuris (o planeta mais forte tecnicamente).

### 🏛️ As Condições Planetares (Os Sete Governadores)
Analise os 7 planetas clássicos com base nas dignidades fornecidas. Fale sobre Domicílio, Exaltação, Queda e Exílio. Use os pontos para mostrar quais planetas são "ajudantes" e quais são "obstáculos" na vida do nativo.

### 💰 Fortuna e Destino (Lotes Herméticos)
Análise profunda do Lote da Fortuna (Ponto de Fortuna) e Lote do Espírito. O que eles dizem sobre a saúde, as posses e a direção da vontade do nativo?

### 🛡️ Força e Vitalidade
Como está a Lua (estado do corpo) e o Sol (estado da autoridade)? Planetas combustos ou sob os raios do Sol devem ser mencionados como enfraquecidos.

### 🏛️ Casas e Áreas da Vida
Selecione as 3 casas mais fortes tecnicamente e descreva os resultados concretos prometidos pelos seus regentes clássicos.

### ⚖️ Síntese Final - O Juízo do Mapa
Um parágrafo final resumindo a promessa geral do mapa: é um mapa de ascensão rápida, de luta constante ou de estabilidade silenciosa?

REGRAS:
- Ignore Urano, Netuno e Plutão, a menos que estejam em conjunção exata com um ângulo ou planeta clássico (e mesmo assim, trate-os como influências externas/transpessoais).
- Use Markdown rico.
- Seja técnico e elegante.
- Escreva entre 2000 e 3500 palavras.`;

export const NATAL_PROMPT_SYSTEM = `Você é um mestre astrólogo com 30 anos de experiência...

Você escreve em Português Brasileiro impecável, com voz empática, elegante e profunda.

OBJETIVO:
Gerar um relatório astrológico profundo, detalhado e personalizado. Os dados fornecidos incluem DIGNIDADES, CADEIA DE DISPOSIÇÃO e SIGNOS INTERCEPTADOS — use-os ativamente na interpretação. Planetas em Domicílio ou Exaltação são forças do mapa; planetas em Exílio ou Queda representam desafios de integração.

ESTRUTURA DO RELATÓRIO (Use Markdown com H3 para seções):

### 🌟 O Núcleo da Personalidade (Sol, Lua e Ascendente)
Analise a tríade fundamental. Como a essência (Sol), as emoções e necessidades instintivas (Lua) e a máscara social (Ascendente) interagem? Identifique se há harmonia ou tensão entre esses três pilares. Mencione as casas onde cada um se encontra.

### 🏛️ Arquitetura do Mapa (Regente, Elementos e Disposição)
- Qual é o regente do Ascendente? Em que signo e casa está? Essa é a "bússola" do mapa.
- Analise o equilíbrio dos 4 elementos (Fogo, Terra, Ar, Água) e das modalidades (Cardinal, Fixo, Mutável).
- Use a CADEIA DE DISPOSIÇÃO fornecida: quem é o dispositor final? Ele revela onde toda a energia do mapa converge.

### 💼 Vocação, Carreira e Abundância
Combine a Casa 2 (recursos), Casa 6 (trabalho diário) e Casa 10 (MC — carreira pública). Que planetas e signos os habitam? Há dignidades fortes nestas casas? Seja concreto sobre talentos profissionais e caminhos de prosperidade.

### ❤️ Amor, Desejo e Relacionamentos
Analise Vênus (como a pessoa ama e atrai), Marte (como deseja e compete), e a Casa 7 (o que busca no outro). Inclua aspectos relevantes entre Vênus/Marte e outros planetas. Se houver planetas em Exílio ou Queda na Casa 7, explique o desafio relacional.

### 🌑 Lilith — A Sombra e o Poder Oculto
Analise a posição de Lilith (Lua Negra). Em que signo e casa ela se encontra? Lilith revela onde a pessoa carrega rebeldia, poder reprimido, sexualidade não integrada e temas tabu. É uma energia de libertação quando consciente, e de autossabotagem quando inconsciente.

### 🚧 Desafios e Maturidade (Saturno e Aspectos Tensos)
Saturno mostra onde o crescimento exige disciplina e paciência. Quadraturas e oposições revelam tensões internas que geram evolução. Trate as dificuldades com sabedoria, indicando caminhos práticos de superação.

### 🔮 Propósito Evolutivo (Nodos Lunares e Quíron)
- O Nodo Norte indica a direção de crescimento da alma; o Nodo Sul, os padrões herdados que devem ser transcendidos.
- Quíron revela a ferida primordial e, ao mesmo tempo, o dom de cura que a pessoa carrega para os outros.
- Sempre mencione as casas e os signos envolvidos.

### ✨ Síntese e Integração
Ofereça uma visão panorâmica do mapa: qual é a mensagem central? Como os diferentes temas se conectam? Qual é o fio condutor que une personalidade, vocação, relacionamentos e propósito? Se houver signos interceptados, explique como eles representam potenciais que demoram a se manifestar.

REGRAS FUNDAMENTAIS:
- Use Markdown com formatação rica (negrito, itálico, listas).
- Seja ESPECÍFICO: cite signos, casas, graus e dignidades dos dados fornecidos. Nunca generalize.
- Use as dignidades ativamente: "Seu Marte em Capricórnio está em Exaltação, conferindo disciplina excepcional" é melhor que "Marte traz energia".
- Mencione o dispositor final e sua importância.
- Cada seção deve incluir uma orientação prática ao final.
- Não limite o tamanho do relatório. Seja tão detalhado quanto os dados permitirem.
- Escreva entre 2500 e 4000 palavras para um relatório verdadeiramente completo.`;

/**
 * Prompt do Sistema para Revolução Solar
 * 
 * Otimizado para receber aspectos cruzados e interposição de casas.
 */
export const SOLAR_RETURN_PROMPT_SYSTEM = `Você é um astrólogo especializado em técnicas preditivas, com domínio profundo da técnica de Revolução Solar (Retorno Solar).

Sua tarefa é analisar o mapa do Retorno Solar em diálogo constante com o Mapa Natal da pessoa. Os dados fornecidos incluem ASPECTOS CRUZADOS (RS ↔ Natal) e INTERPOSIÇÃO DE CASAS — use-os como base central da análise.

TONALIDADE:
Equilibre o psicológico (como a pessoa tende a se sentir) e o preditivo (o que tende a acontecer nas diversas áreas da vida). Seja acolhedor mas objetivo.

CONCEITOS-CHAVE QUE VOCÊ DEVE USAR:
1. **Interposição de Casas**: Onde cada planeta da RS cai no Mapa Natal é mais importante do que a casa da RS em si. Exemplo: "Júpiter da RS está na sua Casa 2 natal — isso indica expansão financeira este ano."
2. **Aspectos Cruzados**: São as conexões entre planetas da RS e planetas do Natal. Eles ativam promessas natais. Exemplo: "Vênus (RS) em Trígono com Júpiter (Natal) sugere sorte em relacionamentos."
3. **Ascendente da RS**: O signo no ASC da Revolução define o "tom emocional" do ano. Em qual casa natal ele cai determina o "cenário" principal.

ESTRUTURA DO RELATÓRIO (Markdown com H3):

### 📅 O Grande Tema do Ano
Comece pelo Ascendente da RS: em que signo está e em qual casa natal ele cai? Este é o tema central. Compare com o Ascendente natal — se forem iguais, é um ano de "retorno profundo à essência".

### ☀️ Onde Sua Energia Vital se Concentra
Analise o Sol da RS: em que casa (RS e natal) ele está? Que aspectos cruzados ele faz com planetas natais? Este é o foco de vitalidade do ano.

### 🌙 O Ritmo Emocional do Ano
A Lua da RS revela as necessidades emocionais predominantes. Em que signo e casa (natal) ela está? Aspectos da Lua com planetas natais indicam flutuações emocionais.

### 🔥 Ativações Planetárias (Aspectos Cruzados)
Esta é a seção mais técnica e valiosa. Analise os ASPECTOS CRUZADOS fornecidos nos dados:
- Conjunções e Trígonos RS↔Natal = facilitadores e oportunidades.
- Quadraturas e Oposições RS↔Natal = desafios que exigem ação consciente.
- Priorize os aspectos mais apertados (menor órbita).

### 🏛️ Áreas da Vida em Destaque
Usando a INTERPOSIÇÃO DE CASAS, identifique as casas natais mais ativadas este ano (com mais planetas da RS). Explique o que cada concentração significa na prática.

### 🔄 Promessas Natais Ativadas
Onde a RS confirma ou ativa temas do Mapa Natal. Exemplo: "Saturno natal está na Casa 10 e este ano Júpiter (RS) passa por ali — é um ano de colheita profissional."

### 💡 Orientações para o Ano
Conselhos práticos organizados por semestre:
- **Primeiro semestre**: Quais energias dominam e como aproveitá-las.
- **Segundo semestre**: O que muda e como se preparar.

REGRAS:
- Seja sempre comparativo: "Diferente do seu natal onde X está em Y, este ano..."
- Use Markdown com formatação rica.
- Cite sempre os dados específicos: signos, casas, graus e órbitas dos aspectos.
- Não limite o tamanho do relatório. Priorize profundidade e utilidade prática.
- Escreva entre 2000 e 3500 palavras.`;

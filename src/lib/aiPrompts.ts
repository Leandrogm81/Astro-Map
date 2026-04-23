import { NatalChart, ZodiacSign } from '@/types';
import { TraditionalAssessment } from './traditional/types';
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
  }
  result += `-`.repeat(60) + '\n\n';

  // === Condição dos Planetas Clássicos (Dignidades e Pontuação) ===
  result += `OS SETE GOVERNADORES (ESTADO OPERACIONAL):\n`;
  result += `-`.repeat(60) + '\n';
  
  const classicPlanets = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
  
  for (const planeName of classicPlanets) {
    const assessment = assessments.find(a => a?.planetId?.toLowerCase() === planeName.toLowerCase());
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
  const classicIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const traditionalAspects = (chart.aspects || []).filter(a =>
    a?.planet1 && a?.planet2 &&
    classicIds.includes(a.planet1.toLowerCase()) &&
    classicIds.includes(a.planet2.toLowerCase()) &&
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
export const TRADITIONAL_PROMPT_SYSTEM = `Você é um Grão-Mestre de Astrologia Tradicional e Helenística, especializado nas técnicas de Dorotheus de Sidon, Ptolomeu, Abu Ma'shar e Guido Bonatti.

Sua abordagem é rigorosamente técnica e focada na OPERACIONALIDADE e EFETIVIDADE dos planetas no mundo sublunar. Você não faz análise psicológica moderna ou subjetiva; você analisa o destino, a prontidão de recursos, a vitalidade e a autoridade do nativo.

TONALIDADE:
Séria, erudita, técnica e autoritária. Use termos como "Regência", "Dignidade Essencial", "Peregrinação", "Planeta Combusto" e "Recepção Mútua". Seu texto deve ser um "Tratado" que transparece conhecimento ancestral de alta classe.

OBJETIVOS DA ANÁLISE:
1. **Dignidades Essenciais:** Analise a força intrínseca. Um planeta em domicílio é um "Rei em seu castelo"; exaltado é um "Convidado de honra"; peregrino é um "Errante sem apoio".
2. **Seita (Sect):** O mapa é Diurno ou Noturno? Isso é crucial. Os planetas fora de sua seita agem com dificuldade ou malícia. Mencione o estado de Hayz quando presente.
3. **Almuten Figuris:** Identifique o "Vencedor" do mapa. O planeta mais forte tecnicamente dita a tônica da alma e da proteção do nativo.
4. **Hyleg e Alcocoden:** Analise a vitalidade (Hyleg) e a resiliência física (Alcocoden). Se o Sol é Hyleg e está forte, a vida é vigorosa; se debilitado, a saúde exige cautela técnica.
5. **Lotes Herméticos:** Interprete a Roda da Fortuna (corpo/riqueza) e o Lote do Espírito (vontade/carreira). Onde cai a Fortuna é onde a sorte favorece o plano material.
6. **Termos e Faces:** Use as descrições de "Qualidade do Termo" e "Face" para refinar a conduta do planeta.

ESTRUTURA DO RELATÓRIO (Markdown com H3):

### 📜 A Seita e o Governo da Natividade
Estabeleça o governo do mapa. Defina a Seita e apresente o **Almuten Figuris** como a inteligência governante. Fale sobre o regente do Ascendente como o "leme do barco".

### 🏛️ O Estado dos Sete Governadores
Análise individual dos 7 planetas clássicos. Não use clichês modernos. Fale sobre quem está no comando, quem está em exílio (debilitado) e quem é o benfeitor (Almuten Figuris). Explique como a pontuação técnica (pontos Almuten) se traduz em poder de ação na vida real.

### 🛡️ O Hyleg e o Alcocoden (Força e Substância)
Uma seção dedicada à fundação da vida. Qual planeta protege a vitalidade? Como o Alcocoden promete a preservação dessa vida? Analise a dignidade desses pontos.

### 💰 As Partes de Fortuna e Espírito
Delineação dos Lotes. Como a Fortuna promete recursos materiais e como o Espírito guia as intenções e a carreira? Considere os signos e as casas onde esses lotes "pousaram".

### 🏛️ Áreas de Operacionalidade Máxima
Identifique os planetas angulares (Casas 1, 4, 7, 10) e explique por que eles são os motores dos eventos mais visíveis na história do nativo.

### ⚖️ Síntese - O Juízo Final do Mapa
Um encerramento magistral. O mapa é de proeminência, de serviço, de obstáculos severos ou de fortuna estável? Como o nativo deve "navegar" seu destino usando seus planetas mais fortes (os benfeitores)?

REGRAS:
- PROIBIDO usar terminologia moderna como "evolução da consciência", "energias", "vibrações" (no sentido new age). Use "influência", "emanação", "corrupção" ou "perfeição".
- Ignore planetas geracionais (Urano, Netuno e Plutão) completamente, a menos que estejam exatamente sobre um ângulo ou luminar.
- Escreva entre 2500 e 4000 palavras em Português Brasileiro Erudito.`;

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

/**
 * Formata os dados de Eletiva Mágica para a IA
 */
export function formatElectiveForAI(veredict: ElectiveVeredict, chart: NatalChart): string {
  const { purpose, planetHour, lunarMansion, moonStatus, rulerCondition, score } = veredict;
  const { birthData } = chart;

  let result = `SOLICITAÇÃO DE ANÁLISE DE ELETIVA MÁGICA\n`;
  result += `========================================\n\n`;
  result += `PROPÓSITO MÁGICO: ${purpose.toUpperCase()}\n`;
  result += `VEREDITO TÉCNICO: ${score.toUpperCase()}\n\n`;

  result += `DADOS DO CÉU ELEITO:\n`;
  result += `- Data/Hora: ${birthData.date} às ${birthData.time}\n`;
  result += `- Hora Planetária: ${planetHour.planetId.toUpperCase()} (${planetHour.hourNumber}ª hora do ${planetHour.isDaytime ? 'Dia' : 'Noite'})\n`;
  result += `- Período da Hora: ${planetHour.startTime} até ${planetHour.endTime}\n`;
  result += `- Mansão Lunar: ${lunarMansion.number} - ${lunarMansion.name} (${lunarMansion.sign})\n`;
  result += `- Fase da Lua: ${moonStatus.phase}\n\n`;

  result += `CONDIÇÃO DO REGENTE DO PROPÓSITO (${rulerCondition.planetId.toUpperCase()}):\n`;
  result += `- Dignidade Essencial: ${rulerCondition.dignity}\n`;
  result += `- Pontuação Almuten: ${rulerCondition.totalScore} pts\n\n`;

  result += `CONTEXTO DO CÉU COMPLETO:\n`;
  result += `-`.repeat(40) + '\n';
  chart.planets.forEach(p => {
    if (['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(p.id)) {
      result += `${p.name}: ${p.sign} ${Math.floor(p.degree)}°\n`;
    }
  });

  return result;
}

/**
 * Prompt do Sistema para Magia Astrológica (Eletivas)
 */
export const ELECTIVE_MAGIC_PROMPT_SYSTEM = `Você é um Mestre de Magia Astrológica e Teurgia, versado no Picatrix, nas Clavículas de Salomão e na tradição de Cornélio Agrippa.

Sua missão é analisar uma janela de tempo (eletiva) para uma operação mágica específica. Sua voz deve ser mística, técnica e profunda, tratando o céu como um organismo vivo cujas emanações podem ser capturadas em talismãs ou rituais.

OBJETIVOS DA ANÁLISE:
1. **Auspiciosidade:** Confirme se a hora é realmente propícia para o propósito.
2. **Regência:** Explique por que a Hora Planetária e o Regente do Propósito são fundamentais para o sucesso.
3. **Mansão Lunar:** Interprete a Mansão Lunar como a "estação" pela qual a influência desce à Terra.
4. **Instruções de Operação:** Sugira cores, incensos e o tom do ritual (Ex: Rigoroso para Marte, Festivo para Vênus).
5. **Veredito Final:** Dê um conselho claro se o magista deve prosseguir, esperar ou adaptar a operação.

TONALIDADE:
Solenidade oculta. Use termos como "Emanações", "Captura de Luz", "Virtudes Planetárias", "Sublunar" e "Consagração".

ESTRUTURA (Markdown):
### 🔮 Veredito de Auspiciosidade
### 🕰️ A Hora e a Virtude Planetária
### 🌙 A Mansão e o Fluxo Lunar
### 🕯️ Recomendações para o Ritual (Cores, Ervas, Incensos)
### ⚖️ O Conselho do Mestre

REGRAS:
- Não faça promessas de resultados; fale de "potencialidades" e "alinhamento".
- Mantenha o rigor tradicional. Se o regente está combusto, avise sobre o perigo de "cegueira" na operação.
- Escreva entre 1000 e 2000 palavras em Português Brasileiro Solene.`;

import { ElectiveVeredict } from './traditional/types';

export const TERM_DESCRIPTORS: Record<string, string> = {
  mercury: "Intelectual, versátil e analítico. O planeta expressa sua natureza de forma curiosa e adaptável.",
  venus: "Harmonioso, estético e sociável. O planeta busca prazer, equilíbrio e expressão artística.",
  jupiter: "Expansivo, sábio e filosófico. O planeta opera com benevolência e busca crescimento.",
  mars: "Dinâmico, corajoso e assertivo. O planeta age com ímpeto, força de vontade e iniciativa.",
  saturn: "Estruturado, disciplinado e cauteloso. O planeta atua com realismo, limites e perseverança."
};

export const DECAN_DESCRIPTORS: Record<string, string> = {
  sun: "Vitalidade e clareza. Traz uma expressão solar, radiante e centralizada para o planeta.",
  moon: "Sensibilidade e instinto. Traz uma expressão lunar, receptiva e emocionalmente conectada.",
  mercury: "Agilidade e comunicação. Traz uma expressão mercurial, lógica e multifacetada.",
  venus: "Charme e valor. Traz uma expressão venusiana, apreciativa e harmonizadora.",
  mars: "Energia e conflito. Traz uma expressão marciana, competitiva e decidida.",
  jupiter: "Otimismo e justiça. Traz uma expressão jupiteriana, generosa e inspiradora.",
  saturn: "Resistência e sobriedade. Traz uma expressão saturnina, madura e endurecida."
};

/**
 * Gera uma breve explicação fundamentada na dignidade tradicional
 */
export function getDignityVibe(type: 'term' | 'decan', ruler: string): string {
  const descriptors = type === 'term' ? TERM_DESCRIPTORS : DECAN_DESCRIPTORS;
  return descriptors[ruler.toLowerCase()] || "Influência tradicional equilibrada.";
}

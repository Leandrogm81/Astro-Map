// src/lib/traditional/magic-correspondences.ts

export type PlanetKey = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn';

export interface PlanetaryCorrespondence {
  intentions: string[];
  colors: string[];
  incense: string[];
  metals: string[];
  charity: string;
}

export const PLANETARY_CORRESPONDENCES: Record<PlanetKey, PlanetaryCorrespondence> = {
  Sun: {
    intentions: ['Brilho', 'Sucesso', 'Iluminação', 'Cura Vital', 'Honras', 'Liderança'],
    colors: ['Dourado', 'Amarelo'],
    incense: ['Olíbano', 'Canela', 'Sândalo Amarelo'],
    metals: ['Ouro'],
    charity: 'Doações a líderes espirituais, órfãos ou incentivo à música e às artes solares.'
  },
  Moon: {
    intentions: ['Intuição', 'Vidência', 'Sonhos', 'Cura Emocional', 'Mudanças', 'Maternidade'],
    colors: ['Prata', 'Branco', 'Pérola'],
    incense: ['Jasmim', 'Cânfora', 'Sândalo Branco', 'Mirra Branca'],
    metals: ['Prata'],
    charity: 'Doações a mulheres em necessidade, proteção à maternidade e auxílio em refúgios ou oceanos.'
  },
  Mercury: {
    intentions: ['Comunicação', 'Acordos', 'Estudos', 'Comércio', 'Magia Mental', 'Viagens'],
    colors: ['Laranja', 'Multicolorido', 'Matizes mistas'],
    incense: ['Anis Estrelado', 'Lavanda', 'Mástique'],
    metals: ['Mercúrio', 'Liga de moedas'],
    charity: 'Doações voltadas à educação, compra de livros para estudantes ou ajuda a mensageiros e professores.'
  },
  Venus: {
    intentions: ['Amor', 'Atração', 'Amizade', 'Arte', 'Paz', 'Beleza'],
    colors: ['Verde-esmeralda', 'Rosa', 'Azul-claro'],
    incense: ['Rosa', 'Sândalo', 'Baunilha', 'Maçã'],
    metals: ['Cobre'],
    charity: 'Apoio a mulheres vulneráveis, incentivo a artistas ou doação de alimentos doces e roupas bonitas.'
  },
  Mars: {
    intentions: ['Coragem', 'Defesa e Proteção', 'Retribuição', 'Quebra de Feitiços', 'Energia Física', 'Conflito'],
    colors: ['Vermelho', 'Escarlate'],
    incense: ['Sangue de Dragão', 'Pimenta', 'Tabaco', 'Alho'],
    metals: ['Ferro'],
    charity: 'Apoio a veteranos, socorristas, ou auxílio a instituições que trabalham com resgate e bravura.'
  },
  Jupiter: {
    intentions: ['Expansão Financeira', 'Sorte', 'Justiça Legal', 'Crescimento', 'Mecenato', 'Favores de Poderosos'],
    colors: ['Azul-celeste', 'Púrpura', 'Violeta'],
    incense: ['Cedro', 'Cravo', 'Noz-moscada', 'Pinho'],
    metals: ['Estanho'],
    charity: 'Doações a magistrados, instituições de caridade de grande porte, e ajuda generosa para aliviar fome ou miséria extrema.'
  },
  Saturn: {
    intentions: ['Banimento', 'Proteção Ancestral', 'Tempo', 'Disciplina', 'Limitações', 'Sabedoria Oculta'],
    colors: ['Preto', 'Chumbo', 'Azul Marinho Escuro'],
    incense: ['Mirra', 'Patchouli', 'Cipreste', 'Arruda'],
    metals: ['Chumbo'],
    charity: 'Doações a idosos, asilos, pessoas que vivem em reclusão, ou trabalho com agricultura sustentável (terra e ossos).'
  }
};
export type RitualCategoryId = 'love' | 'prosperity' | 'protection' | 'conflict' | 'wisdom' | 'health';

export interface RitualIntention {
  id: string;
  label: string;
  ruler: PlanetKey;
  category: RitualCategoryId;
}

export interface RitualCategory {
  id: RitualCategoryId;
  label: string;
  icon: string; // Lucide icon name, mapped in UI
}

export const RITUAL_CATEGORIES: RitualCategory[] = [
  { id: 'love', label: 'Amor e Relações', icon: 'Heart' },
  { id: 'prosperity', label: 'Prosperidade', icon: 'Coins' },
  { id: 'protection', label: 'Proteção e Defesa', icon: 'Shield' },
  { id: 'conflict', label: 'Conflito e Retribuição', icon: 'Sword' },
  { id: 'wisdom', label: 'Sabedoria e Mente', icon: 'Brain' },
  { id: 'health', label: 'Saúde e Vitalidade', icon: 'Sun' },
];

export const RITUAL_INTENTIONS: RitualIntention[] = [
  // ❤️ Amor e Relações (Venus)
  { id: 'love', label: 'Amor e Relacionamentos', ruler: 'Venus', category: 'love' },
  { id: 'reconciliation', label: 'Reconciliação e Perdão', ruler: 'Venus', category: 'love' },
  { id: 'seduction', label: 'Sedução e Magnetismo', ruler: 'Venus', category: 'love' },
  { id: 'friendship', label: 'Amizade e Laços Sociais', ruler: 'Venus', category: 'love' },

  // 💰 Prosperidade (Jupiter / Sun / Mercury)
  { id: 'finance', label: 'Expansão Financeira e Sorte', ruler: 'Jupiter', category: 'prosperity' },
  { id: 'success', label: 'Sucesso, Iluminação e Brilho', ruler: 'Sun', category: 'prosperity' },
  { id: 'contracts', label: 'Acordos e Contratos Favoráveis', ruler: 'Mercury', category: 'prosperity' },
  { id: 'gambling', label: 'Jogos de Azar e Fortuna', ruler: 'Jupiter', category: 'prosperity' },

  // 🛡️ Proteção e Defesa (Mars / Saturn)
  { id: 'protection', label: 'Defesa e Proteção', ruler: 'Mars', category: 'protection' },
  { id: 'banishing', label: 'Banimento e Limitação', ruler: 'Saturn', category: 'protection' },
  { id: 'hex_breaking', label: 'Quebra de Feitiços e Malefícios', ruler: 'Mars', category: 'protection' },
  { id: 'home_ward', label: 'Proteção do Lar e Propriedades', ruler: 'Saturn', category: 'protection' },

  // ⚔️ Conflito e Retribuição (Mars / Jupiter)
  { id: 'revenge', label: 'Retribuição e Justiça Pessoal', ruler: 'Mars', category: 'conflict' },
  { id: 'domination', label: 'Domínio e Controle', ruler: 'Mars', category: 'conflict' },
  { id: 'legal_victory', label: 'Vitória em Disputas Legais', ruler: 'Jupiter', category: 'conflict' },

  // 🧠 Sabedoria e Mente (Mercury / Moon / Saturn)
  { id: 'wisdom', label: 'Sabedoria Ancestral e Disciplina', ruler: 'Saturn', category: 'wisdom' },
  { id: 'communication', label: 'Acordos, Estudos e Comércio', ruler: 'Mercury', category: 'wisdom' },
  { id: 'intuition', label: 'Vidência e Sonhos', ruler: 'Moon', category: 'wisdom' },
  { id: 'study', label: 'Aprovação em Exames e Concursos', ruler: 'Mercury', category: 'wisdom' },
  { id: 'divination', label: 'Divinação e Oráculos', ruler: 'Moon', category: 'wisdom' },

  // ☀️ Saúde e Vitalidade (Sun / Moon)
  { id: 'healing', label: 'Cura e Recuperação', ruler: 'Sun', category: 'health' },
  { id: 'fertility', label: 'Fertilidade e Maternidade', ruler: 'Moon', category: 'health' },
  { id: 'vitality', label: 'Energia Vital e Vigor', ruler: 'Sun', category: 'health' },
];

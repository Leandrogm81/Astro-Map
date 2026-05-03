// src/lib/traditional/magic-correspondences.ts
import type { SephirahName } from '../kabbalah/types';

export type PlanetKey = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn';

export interface PlanetaryCorrespondence {
  intentions: string[];
  colors: string[];
  incense: string[];
  metals: string[];
  charity: string;
  olympicSpirit: {
    name: string;
    description: string;
  };
  angel: string;
  intelligence: {
    name: string;
    description: string;
  };
  spirit: {
    name: string;
    description: string;
  };
  remedies: {
    stones: string[];
    plants: string[];
    baths: string[];
  };
  orphicHymn: {
    title: string;
    theme: string;
  };
  sephirah: SephirahName;
}

export const PLANETARY_CORRESPONDENCES: Record<PlanetKey, PlanetaryCorrespondence> = {
  Sun: {
    intentions: ['Brilho', 'Sucesso', 'Iluminação', 'Cura Vital', 'Honras', 'Liderança'],
    colors: ['Dourado', 'Amarelo'],
    incense: ['Olíbano', 'Canela', 'Sândalo Amarelo'],
    metals: ['Ouro'],
    charity: 'Doações a líderes espirituais, órfãos ou incentivo à música e às artes solares.',
    olympicSpirit: {
      name: 'Och',
      description: 'Governa as coisas solares. Dá grande sabedoria, ensina medicina e transmuta coisas em ouro puríssimo. Concede dignidade e brilho pessoal.'
    },
    angel: 'Michael',
    intelligence: {
      name: 'Nakhiel',
      description: 'Inteligência Solar. Traz iluminação intelectual, clareza de propósito, autoridade legítima e sucesso baseado no mérito e sabedoria.'
    },
    spirit: {
      name: 'Sorath',
      description: 'Espírito Solar. Manifesta fama, brilho pessoal avassalador, vitalidade física e a acumulação de riqueza e reconhecimento material.'
    },
    remedies: {
      stones: ['Citrino', 'Âmbar', 'Olho de Tigre', 'Pedra do Sol'],
      plants: ['Girassol', 'Alecrim', 'Louro', 'Açafrão'],
      baths: ['Alecrim com Louro', 'Pétalas de calêndula']
    },
    orphicHymn: {
      title: 'Hino Órfico ao Sol (Helios)',
      theme: 'Vitalidade, clareza mental e dissipação de sombras.'
    },
    sephirah: 'Tiphereth'
  },
  Moon: {
    intentions: ['Intuição', 'Vidência', 'Sonhos', 'Cura Emocional', 'Mudanças', 'Maternidade'],
    colors: ['Prata', 'Branco', 'Pérola'],
    incense: ['Jasmim', 'Cânfora', 'Sândalo Branco', 'Mirra Branca'],
    metals: ['Prata'],
    charity: 'Doações a mulheres em necessidade, proteção à maternidade e auxílio em refúgios ou oceanos.',
    olympicSpirit: {
      name: 'Phul',
      description: 'Governa as coisas lunares. Transmuta metais em prata, cura hidropisia e concede os espíritos da água em serviço. Governa a vida e o crescimento.'
    },
    angel: 'Gabriel',
    intelligence: {
      name: 'Malkah be-Tarshishim',
      description: 'Rainha das Estrelas. Governa a intuição profética, sonhos lúcidos, estabilidade emocional e ciclos de crescimento ordenados.'
    },
    spirit: {
      name: 'Shad Barschemoth',
      description: 'Manifestador das Águas. Provoca mudanças rápidas de circunstância, protege em viagens marítimas e governa a fertilidade física e ocultação.'
    },
    remedies: {
      stones: ['Pedra da Lua', 'Pérola', 'Quartzo Leitoso', 'Selenita'],
      plants: ['Lírio Branco', 'Jasmim', 'Alface', 'Cânfora'],
      baths: ['Jasmim e Rosa Branca', 'Banho de leite (simbólico)']
    },
    orphicHymn: {
      title: 'Hino Órfico à Lua (Selene)',
      theme: 'Equilíbrio emocional, intuição e sonhos proféticos.'
    },
    sephirah: 'Yesod'
  },
  Mercury: {
    intentions: ['Comunicação', 'Acordos', 'Estudos', 'Comércio', 'Magia Mental', 'Viagens'],
    colors: ['Laranja', 'Multicolorido', 'Matizes mistas'],
    incense: ['Anis Estrelado', 'Lavanda', 'Mástique'],
    metals: ['Mercúrio', 'Liga de moedas'],
    charity: 'Doações voltadas à educação, compra de livros para estudantes ou ajuda a mensageiros e professores.',
    olympicSpirit: {
      name: 'Ophiel',
      description: 'Governa as coisas mercuriais. Ensina todas as artes, ciência e escrita. Concede a habilidade de transmutar mercúrio em pedra filosofal.'
    },
    angel: 'Raphael',
    intelligence: {
      name: 'Tiriel',
      description: 'Mensageiro Intelectual. Governa a eloquência, lógica, sucesso em estudos complexos e a compreensão profunda de ciências e línguas.'
    },
    spirit: {
      name: 'Taphthartharath',
      description: 'O Adaptável. Manifesta rapidez em negócios, sucesso em viagens, agilidade mental e lucro comercial imediato.'
    },
    remedies: {
      stones: ['Ágata', 'Opala', 'Sodalita', 'Hematita'],
      plants: ['Lavanda', 'Anis', 'Funcho', 'Hortelã'],
      baths: ['Lavanda e Alecrim', 'Hortelã para agilidade mental']
    },
    orphicHymn: {
      title: 'Hino Órfico a Hermes',
      theme: 'Eloquência, sucesso comercial e proteção em viagens.'
    },
    sephirah: 'Hod'
  },
  Venus: {
    intentions: ['Amor', 'Atração', 'Amizade', 'Arte', 'Paz', 'Beleza'],
    colors: ['Verde-esmeralda', 'Rosa', 'Azul-claro'],
    incense: ['Rosa', 'Sândalo', 'Baunilha', 'Maçã'],
    metals: ['Cobre'],
    charity: 'Apoio a mulheres vulneráveis, incentivo a artistas ou doação de alimentos doces e roupas bonitas.',
    olympicSpirit: {
      name: 'Hagith',
      description: 'Governa as coisas venéreas. Torna o homem digno e amado por todos. Transmuta cobre em ouro e ouro em cobre. Concede beleza e harmonia.'
    },
    angel: 'Haniel',
    intelligence: {
      name: 'Hagiel',
      description: 'Graça de Deus. Governa o amor espiritual, inspiração artística, paz, reconciliação e a elevação dos sentimentos mais puros.'
    },
    spirit: {
      name: 'Kedemel',
      description: 'O Atrator. Manifesta atração física, magnetismo social, prazeres materiais, fertilidade e encantamento no mundo denso.'
    },
    remedies: {
      stones: ['Esmeralda', 'Quartzo Rosa', 'Aventurina', 'Jade'],
      plants: ['Rosa', 'Murta', 'Violeta', 'Verbena'],
      baths: ['Rosas cor-de-rosa com mel', 'Verbena para atração']
    },
    orphicHymn: {
      title: 'Hino Órfico a Afrodite',
      theme: 'Graça, harmonia nos relacionamentos e magnetismo.'
    },
    sephirah: 'Netzach'
  },
  Mars: {
    intentions: ['Coragem', 'Defesa e Proteção', 'Retribuição', 'Quebra de Feitiços', 'Energia Física', 'Conflito'],
    colors: ['Vermelho', 'Escarlate'],
    incense: ['Sangue de Dragão', 'Pimenta', 'Tabaco', 'Alho'],
    metals: ['Ferro'],
    charity: 'Apoio a veteranos, socorristas, ou auxílio a instituições que trabalham com resgate e bravura.',
    olympicSpirit: {
      name: 'Phaleg',
      description: 'Governa as coisas marciais. Concede glória militar, força e coragem. Protege contra inimigos e governa os assuntos de guerra e disputa.'
    },
    angel: 'Samael',
    intelligence: {
      name: 'Graphiel',
      description: 'Estrategista de Deus. Provê coragem controlada, vitória estratégica, força de vontade e a contenção de impulsos destrutivos.'
    },
    spirit: {
      name: 'Barzabel',
      description: 'O Conquistador. Manifesta vitória física em conflitos, vigor extremo, destruição de obstáculos e proteção ativa em atividades de risco.'
    },
    remedies: {
      stones: ['Rubi', 'Granada', 'Jaspe Vermelho', 'Magnetita'],
      plants: ['Alho', 'Pimenta', 'Urtiga', 'Absinto'],
      baths: ['Banho de ervas amargas (arruda, guiné)', 'Pinho para força']
    },
    orphicHymn: {
      title: 'Hino Órfico a Ares',
      theme: 'Coragem inabalável, defesa contra agressões e vitória.'
    },
    sephirah: 'Geburah'
  },
  Jupiter: {
    intentions: ['Expansão Financeira', 'Sorte', 'Justiça Legal', 'Crescimento', 'Mecenato', 'Favores de Poderosos'],
    colors: ['Azul-celeste', 'Púrpura', 'Violeta'],
    incense: ['Cedro', 'Cravo', 'Noz-moscada', 'Pinho'],
    metals: ['Estanho'],
    charity: 'Doações a magistrados, instituições de caridade de grande porte, e ajuda generosa para aliviar fome ou miséria extrema.',
    olympicSpirit: {
      name: 'Bethor',
      description: 'Governa as coisas joviais. Concede grandes dignidades, tesouros ocultos e a amizade dos poderosos. Governa a abundância e o sucesso.'
    },
    angel: 'Sachiel',
    intelligence: {
      name: 'Jophiel',
      description: 'Sabedoria de Deus. Governa a justiça cósmica, expansão intelectual e espiritual, filosofia e a harmonia social.'
    },
    spirit: {
      name: 'Hismael',
      description: 'O Multiplicador. Manifesta riqueza material rápida, honras públicas, abundância física e sucesso em empreendimentos comerciais.'
    },
    remedies: {
      stones: ['Ametista', 'Lapislázuli', 'Safira', 'Turquesa'],
      plants: ['Carvalho', 'Sálvia', 'Dente-de-leão', 'Cedro'],
      baths: ['Manjericão com Canela', 'Sálvia para sabedoria e sorte']
    },
    orphicHymn: {
      title: 'Hino Órfico a Zeus',
      theme: 'Justiça, expansão de horizontes e prosperidade divina.'
    },
    sephirah: 'Chesed'
  },
  Saturn: {
    intentions: ['Banimento', 'Proteção Ancestral', 'Tempo', 'Disciplina', 'Limitações', 'Sabedoria Oculta'],
    colors: ['Preto', 'Chumbo', 'Azul Marinho Escuro'],
    incense: ['Mirra', 'Patchouli', 'Cipreste', 'Arruda'],
    metals: ['Chumbo'],
    charity: 'Doações a idosos, asilos, pessoas que vivem em reclusão, ou trabalho com agricultura sustentável (terra e ossos).',
    olympicSpirit: {
      name: 'Aratron',
      description: 'Governa as coisas saturninas. Transmuta qualquer coisa viva em pedra, transforma carvão em tesouro e ensina alquimia, magia e física.'
    },
    angel: 'Cassiel',
    intelligence: {
      name: 'Agiel',
      description: 'O Estruturador. Traz sabedoria ancestral, disciplina, compreensão de limites e leis universais e longevidade.'
    },
    spirit: {
      name: 'Zazel',
      description: 'O Limitador. Manifesta o banimento de influências densas, proteção de propriedades, término de ciclos e restrição de oposição.'
    },
    remedies: {
      stones: ['Ônix', 'Obsidiana', 'Turmalina Negra', 'Quartzo Fumê'],
      plants: ['Cipreste', 'Arruda', 'Salgueiro', 'Helleborus'],
      baths: ['Arruda e sal grosso (limpeza)', 'Mirra para introspecção']
    },
    orphicHymn: {
      title: 'Hino Órfico a Cronos',
      theme: 'Estabilidade, tempo, fim de ciclos e disciplina.'
    },
    sephirah: 'Binah'
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

import type { SephirahName } from './types';

export interface GoldenDawnData {
  readonly divineName: {
    readonly hebrew: string;
    readonly transliteration: string;
  };
  readonly archangel: {
    readonly hebrew: string;
    readonly transliteration: string;
  };
  readonly choir: {
    readonly pt: string;
    readonly he?: string;
  };
  readonly chakra: {
    readonly pt: string;
    readonly he?: string;
  };
  readonly psalm: {
    readonly reference: string;
    readonly text: string;
  };
  readonly spiritualExperience: string;
  readonly virtue: string;
  readonly vice: string;
  readonly colors: {
    readonly king: string;
    readonly queen: string;
    readonly prince: string;
    readonly princess: string;
  };
}

export const GOLDEN_DAWN_CORRESPONDENCES: Record<SephirahName, GoldenDawnData> = {
  Kether: {
    divineName: { hebrew: 'אהיה', transliteration: 'Eheieh' },
    archangel: { hebrew: 'מטטרון', transliteration: 'Metatron' },
    choir: { pt: 'Chaioth ha-Qadesh', he: 'חיות הקדש' },
    chakra: { pt: 'Rashith ha-Gilgalim (Primum Mobile)', he: 'ראשית הגלגלים' },
    psalm: {
      reference: 'Salmo 3:4',
      text: 'Mas tu, Senhor, és um escudo ao meu redor, a minha glória e o que exalta a minha cabeça.',
    },
    spiritualExperience: 'União com Deus',
    virtue: 'Realização (Attainment)',
    vice: '-',
    colors: {
      king: '#FFFFFF',      // Brilho Branco
      queen: '#FFFFFF',     // Brilho Branco
      prince: '#FFFFFF',    // Brilho Branco
      princess: '#FFFFFF',  // Branco, pontilhado de ouro
    },
  },
  Chokmah: {
    divineName: { hebrew: 'יה', transliteration: 'Yah' },
    archangel: { hebrew: 'רזיאל', transliteration: 'Raziel' },
    choir: { pt: 'Auphanim', he: 'אופנים' },
    chakra: { pt: 'Mazloth (Zodíaco)', he: 'מזלות' },
    psalm: {
      reference: 'Salmo 19:2',
      text: 'Os céus declaram a glória de Deus e o firmamento anuncia a obra das suas mãos.',
    },
    spiritualExperience: 'Visão de Deus face a face',
    virtue: 'Devoção',
    vice: '-',
    colors: {
      king: '#ADD8E6',      // Azul suave puro
      queen: '#A9A9A9',     // Cinza
      prince: '#B0C4DE',    // Azul cinza perolado
      princess: '#F5F5F5',  // Branco pontilhado de vermelho, azul e amarelo
    },
  },
  Binah: {
    divineName: { hebrew: 'יהוה אלהים', transliteration: 'YHVH Elohim' },
    archangel: { hebrew: 'צפקיאל', transliteration: 'Tzaphkiel' },
    choir: { pt: 'Aralim', he: 'אראלים' },
    chakra: { pt: 'Shabbathai (Saturno)', he: 'שבתאי' },
    psalm: {
      reference: 'Salmo 130:1',
      text: 'Das profundezas clamo a ti, ó Senhor.',
    },
    spiritualExperience: 'Visão do Pesar',
    virtue: 'Silêncio',
    vice: 'Avareza',
    colors: {
      king: '#DC143C',      // Carmesim
      queen: '#000000',     // Preto
      prince: '#4B2C20',    // Marrom escuro
      princess: '#808080',  // Cinza pontilhado de rosa
    },
  },
  Daath: {
    divineName: { hebrew: 'יהוה אלהים', transliteration: 'YHVH Eloah va-Daath' },
    archangel: { hebrew: '-', transliteration: '-' },
    choir: { pt: '-', he: '-' },
    chakra: { pt: 'Abismo (Plutão)', he: '-' },
    psalm: {
      reference: 'Salmo 97:2',
      text: 'Nuvens e escuridão estão ao redor dele; justiça e juízo são a habitação do seu trono.',
    },
    spiritualExperience: 'Visão do Conhecimento',
    virtue: 'Desprendimento',
    vice: 'Orgulho (Soberba Intelectual)',
    colors: {
      king: '#D8BFD8',      // Lavanda
      queen: '#D8BFD8',     // Lavanda
      prince: '#D8BFD8',    // Lavanda
      princess: '#D8BFD8',  // Lavanda
    },
  },
  Chesed: {
    divineName: { hebrew: 'אל', transliteration: 'El' },
    archangel: { hebrew: 'צדקיאל', transliteration: 'Tzadkiel' },
    choir: { pt: 'Chashmalim', he: 'חשמלים' },
    chakra: { pt: 'Tzedek (Júpiter)', he: 'צדק' },
    psalm: {
      reference: 'Salmo 145:17',
      text: 'Justo é o Senhor em todos os seus caminhos, e santo em todas as suas obras.',
    },
    spiritualExperience: 'Visão do Amor',
    virtue: 'Obediência',
    vice: 'Tirania, Bigotismo',
    colors: {
      king: '#8A2BE2',      // Violeta
      queen: '#0000FF',     // Azul
      prince: '#483D8B',    // Púrpura profundo
      princess: '#007FFF',  // Azure profundo pontilhado de amarelo
    },
  },
  Geburah: {
    divineName: { hebrew: 'אלהים גבור', transliteration: 'Elohim Gibor' },
    archangel: { hebrew: 'כמאל', transliteration: 'Khamael' },
    choir: { pt: 'Seraphim', he: 'שרפים' },
    chakra: { pt: 'Madim (Marte)', he: 'מאדים' },
    psalm: {
      reference: 'Salmo 24:8',
      text: 'Quem é este Rei da Glória? O Senhor forte e poderoso, o Senhor poderoso na guerra.',
    },
    spiritualExperience: 'Visão do Poder',
    virtue: 'Energia, Coragem',
    vice: 'Crueldade, Destruição',
    colors: {
      king: '#FFA500',      // Laranja
      queen: '#FF0000',     // Escarlate
      prince: '#FF4500',    // Vermelho brilhante
      princess: '#8B0000',  // Vermelho pontilhado de preto
    },
  },
  Tiphereth: {
    divineName: { hebrew: 'יהוה אלוה ודעת', transliteration: 'YHVH Eloah va-Daath' },
    archangel: { hebrew: 'רפאל', transliteration: 'Raphael' },
    choir: { pt: 'Melekim', he: 'מלכים' },
    chakra: { pt: 'Shemesh (Sol)', he: 'שמש' },
    psalm: {
      reference: 'Salmo 19:5',
      text: 'Em que ele pôs uma tenda para o sol, o qual é como um noivo que sai do seu tálamo.',
    },
    spiritualExperience: 'Visão da Harmonia',
    virtue: 'Devoção ao Grande Trabalho',
    vice: 'Orgulho',
    colors: {
      king: '#FFC0CB',      // Rosa claro
      queen: '#FFD700',     // Ouro/Amarelo
      prince: '#FF8C69',    // Salmão rico
      princess: '#FFBF00',  // Âmbar dourado
    },
  },
  Netzach: {
    divineName: { hebrew: 'יהוה צבאות', transliteration: 'YHVH Tzabaoth' },
    archangel: { hebrew: 'הניאל', transliteration: 'Haniel' },
    choir: { pt: 'Elohim', he: 'אלהים' },
    chakra: { pt: 'Nogah (Vênus)', he: 'נוגה' },
    psalm: {
      reference: 'Salmo 18:35',
      text: 'Também me deste o escudo da tua salvação; a tua mão direita me susteve, e a tua mansidão me engrandeceu.',
    },
    spiritualExperience: 'Visão da Beleza Triunfante',
    virtue: 'Desprendimento (Unselfishness)',
    vice: 'Luxúria',
    colors: {
      king: '#FFBF00',      // Âmbar
      queen: '#008000',     // Esmeralda
      prince: '#ADFF2F',    // Verde-amarelo brilhante
      princess: '#808000',  // Oliva pontilhado de ouro
    },
  },
  Hod: {
    divineName: { hebrew: 'אלהים צבאות', transliteration: 'Elohim Tzabaoth' },
    archangel: { hebrew: 'מיכאל', transliteration: 'Michael' },
    choir: { pt: 'Beni Elohim', he: 'בני אלהים' },
    chakra: { pt: 'Kokab (Mercúrio)', he: 'כוכב' },
    psalm: {
      reference: 'Salmo 48:2',
      text: 'Grande é o Senhor e mui digno de louvor, na cidade do nosso Deus, no seu monte santo.',
    },
    spiritualExperience: 'Visão do Esplendor',
    virtue: 'Veracidade',
    vice: 'Falsidade, Desonestidade',
    colors: {
      king: '#A020F0',      // Violeta-púrpura
      queen: '#FFA500',     // Laranja
      prince: '#BA4A00',    // Vermelho-ferrugem
      princess: '#8B4513',  // Marrom amarelado pontilhado de branco
    },
  },
  Yesod: {
    divineName: { hebrew: 'שדי אל חי', transliteration: 'Shaddai El Chai' },
    archangel: { hebrew: 'גבריאל', transliteration: 'Gabriel' },
    choir: { pt: 'Kerubim', he: 'כרובים' },
    chakra: { pt: 'Levanah (Lua)', he: 'לבנה' },
    psalm: {
      reference: 'Salmo 91:1',
      text: 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.',
    },
    spiritualExperience: 'Visão do Maquinário do Universo',
    virtue: 'Independência',
    vice: 'Ociosidade',
    colors: {
      king: '#4B0082',      // Índigo
      queen: '#8A2BE2',     // Violeta
      prince: '#2F004F',    // Púrpura muito escuro
      princess: '#E4D00A',  // Citrino pontilhado de azure
    },
  },
  Malkuth: {
    divineName: { hebrew: 'אדני הארץ', transliteration: 'Adonai ha-Aretz' },
    archangel: { hebrew: 'סנדלفون', transliteration: 'Sandalphon' },
    choir: { pt: 'Ashim', he: 'אשים' },
    chakra: { pt: 'Cholem ha-Yesodoth (Elementos)', he: 'חולם היסודות' },
    psalm: {
      reference: 'Salmo 24:1',
      text: 'Do Senhor é a terra e a sua plenitude, o mundo e aqueles que nele habitam.',
    },
    spiritualExperience: 'Visão do Santo Anjo Guardião',
    virtue: 'Discriminação',
    vice: 'Inércia',
    colors: {
      king: '#FFFF00',      // Amarelo
      queen: '#1A1A1A',     // Citrino, Oliva, Ferrugem e Preto (usando Preto como base)
      prince: '#2E1A0F',    // Cores da Rainha pontilhadas de ouro
      princess: '#000000',  // Preto rajado de amarelo
    },
  },
};

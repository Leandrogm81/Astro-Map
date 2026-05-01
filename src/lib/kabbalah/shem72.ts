import type { Angel72 } from './types';
import { getZodiacSignFromLongitude, normalizeLongitude } from './constants';

const ANGEL_BASE_DATA = [
  ['Vehuiah', 'והו', 3],
  ['Jeliel', 'ילי', 21],
  ['Sitael', 'סיט', 90],
  ['Elemiah', 'עלם', 6],
  ['Mahasiah', 'מהש', 33],
  ['Lehahel', 'ללה', 9],
  ['Achaiah', 'עכא', 102],
  ['Cahetel', 'כתת', 94],
  ['Haziel', 'הזי', 24],
  ['Aladiah', 'אלד', 32],
  ['Lauviah', 'לאו', 17],
  ['Hahaiah', 'ההע', 9],
  ['Iezalel', 'יזל', 97],
  ['Mehahel', 'מבה', 9],
  ['Hariel', 'הרי', 93],
  ['Hakamiah', 'הקם', 87],
  ['Lauviah', 'לאו', 8],
  ['Caliel', 'כלי', 7],
  ['Leuviah', 'לוו', 39],
  ['Pahaliah', 'פהל', 119],
  ['Nelchael', 'נלך', 30],
  ['Ieiaiel', 'ייי', 120],
  ['Melahel', 'מלה', 120],
  ['Hahuiah', 'חהו', 32],
  ['Nith-Haiah', 'נתה', 9],
  ['Haaiah', 'האא', 118],
  ['Ierathel', 'ירת', 139],
  ['Seehiah', 'שאה', 70],
  ['Reiiel', 'ריי', 53],
  ['Omael', 'אום', 71],
  ['Lecahel', 'לכב', 71],
  ['Yasariah', 'ושר', 33],
  ['Ieuiah', 'יחו', 92],
  ['Lehahaiah', 'להח', 131],
  ['Chavakiah', 'כוק', 116],
  ['Menadel', 'מנד', 25],
  ['Aniel', 'חעם', 79],
  ['Haamiah', 'רעה', 90],
  ['Rehael', 'יז', 29],
  ['Ieiazel', 'והו', 87],
  ['Hahael', 'ההה', 119],
  ['Mikael', 'מיכ', 120],
  ['Veualiah', 'וול', 87],
  ['Yelahiah', 'ילה', 118],
  ['Sealiah', 'סאל', 93],
  ['Ariel', 'ערי', 144],
  ['Asaliah', 'עשל', 104],
  ['Mihael', 'מיה', 97],
  ['Vehuel', 'והו', 144],
  ['Daniel', 'דני', 102],
  ['Hahasiah', 'החש', 103],
  ['Imamiah', 'עמם', 7],
  ['Nanael', 'ננא', 118],
  ['Nithael', 'נית', 102],
  ['Mebahiah', 'מבה', 101],
  ['Poiel', 'פוי', 144],
  ['Nemamiah', 'נמם', 113],
  ['Ieialel', 'ייל', 6],
  ['Harael', 'הרח', 112],
  ['Mitzrael', 'מער', 144],
  ['Umabel', 'ומב', 112],
  ['Iah-Hel', 'יהה', 118],
  ['Anauel', 'ענו', 2],
  ['Mehiel', 'מחי', 32],
  ['Damabiah', 'דמב', 89],
  ['Manakel', 'מנק', 37],
  ['Eyael', 'איה', 36],
  ['Habuhiah', 'חבו', 105],
  ['Rochel', 'ראה', 15],
  ['Jabamiah', 'יבם', 91],
  ['Haiaiel', 'היי', 108],
  ['Mumiah', 'מום', 114],
] as const;

function buildAngel([name, hebrew, psalmNumber]: readonly [string, string, number], index: number): Angel72 {
  const number = index + 1;
  const degreesStart = index * 5;
  const degreesEnd = index === 71 ? 360 : degreesStart + 5;
  const sign = getZodiacSignFromLongitude(degreesStart);

  return {
    number,
    name,
    hebrew,
    sign,
    degreesStart,
    degreesEnd,
    virtues: `Influência do segmento de ${sign} entre ${degreesStart}° e ${degreesEnd}°.`,
    psalm: `Psalm ${psalmNumber}`,
  };
}

export const ANGELS_72: readonly Angel72[] = ANGEL_BASE_DATA.map((entry, index) => buildAngel(entry, index));

export function getAngelIndex(longitude: number): number {
  const normalized = normalizeLongitude(longitude);
  return Math.floor(normalized / 5) % ANGELS_72.length;
}

export function getAngelByDegree(longitude: number): Angel72 {
  return ANGELS_72[getAngelIndex(longitude)];
}

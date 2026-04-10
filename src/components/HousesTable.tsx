import { NatalChart, ZODIAC_SIGNS } from '@/types';
import { getElementColor } from '@/lib/astrology';

interface HousesTableProps {
  chart: NatalChart;
  system?: 'placidus' | 'whole';
}

export default function HousesTable({ chart, system = 'placidus' }: HousesTableProps) {
  const houses = system === 'placidus' ? chart.housesPlacidus : chart.housesWhole;

  const formatDegree = (degree: number): string => {
    const d = Math.floor(degree);
    const m = Math.floor((degree - d) * 60);
    return `${d}°${m.toString().padStart(2, '0')}'`;
  };

  const getElementFromSign = (sign: string): 'fire' | 'earth' | 'air' | 'water' => {
    const signData = ZODIAC_SIGNS.find(s => s.name === sign);
    return signData?.element || 'fire';
  };

  const houseMeanings: Record<number, string> = {
    1: 'Ascendente, Ego',
    2: 'Recursos, Valores',
    3: 'Mente, Comunicação',
    4: 'Raízes, Família',
    5: 'Prazer, Expressão',
    6: 'Rotina, Saúde',
    7: 'Outros, Parceria',
    8: 'Profundidade, Crise',
    9: 'Expansão, Fé',
    10: 'Zênite, Destino',
    11: 'Coletivo, Futuro',
    12: 'Sombra, Mistério',
  };

  const getRulerSymbol = (sign: string): string => {
    const rulers: Record<string, string> = {
      'Áries': '♂', 'Touro': '♀', 'Gêmeos': '☿', 'Câncer': '☽',
      'Leão': '☉', 'Virgem': '☿', 'Libra': '♀', 'Escorpião': '♂',
      'Sagitário': '♃', 'Capricórnio': '♄', 'Aquário': '♄', 'Peixes': '♃'
    };
    return rulers[sign] || '';
  };

  const getRulerName = (sign: string): string => {
    const rulers: Record<string, string> = {
      'Áries': 'Marte', 'Touro': 'Vênus', 'Gêmeos': 'Mercúrio', 'Câncer': 'Lua',
      'Leão': 'Sol', 'Virgem': 'Mercúrio', 'Libra': 'Vênus', 'Escorpião': 'Marte',
      'Sagitário': 'Júpiter', 'Capricórnio': 'Saturno', 'Aquário': 'Saturno', 'Peixes': 'Júpiter'
    };
    return rulers[sign] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-serif font-bold text-white tracking-tight">
          Estrutura de <span className="text-gold-500">Casas</span>
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-gold-500/60 bg-gold-500/5 px-4 py-1.5 rounded-full border border-gold-500/10">
          {system === 'placidus' ? 'Placidus' : 'Signos Inteiros'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {houses.map((house) => (
          <div
            key={house.number}
            className="group p-5 glass rounded-2xl border border-white/5 hover:border-gold-500/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950/50 border border-white/10 flex items-center justify-center text-gold-400 font-serif font-bold text-lg shadow-inner">
                  {house.number}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Casa
                  </h4>
                  <p className="text-sm font-medium text-slate-200">
                    {houseMeanings[house.number]}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gold-500 uppercase tracking-tighter">
                  Regente
                </p>
                <p className="text-xs text-slate-300">
                  {getRulerSymbol(house.sign)} {getRulerName(house.sign)}
                </p>
              </div>
            </div>

            <div className={`flex items-end justify-between border-t border-white/5 pt-3 element-${getElementFromSign(house.sign)}`}>
              <div className="flex flex-col">
                <div className="text-xs font-mono text-slate-500">
                  {formatDegree(house.degree)}
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-element-soft text-element w-fit">
                  {house.sign}
                </span>
              </div>
              
              <div className="flex gap-1 flex-wrap justify-end max-w-[60%]">
                {chart.planets
                  .filter(p => Number(p.house) === house.number)
                  .map(p => (
                    <div 
                      key={p.name}
                      title={`${p.name} em ${p.sign}`}
                      className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gold-200"
                    >
                      {p.name === 'Sol' ? '☉' :
                       p.name === 'Lua' ? '☽' :
                       p.name === 'Mercúrio' ? '☿' :
                       p.name === 'Vênus' ? '♀' :
                       p.name === 'Marte' ? '♂' :
                       p.name === 'Júpiter' ? '♃' :
                       p.name === 'Saturno' ? '♄' :
                       p.name === 'Urano' ? '♅' :
                       p.name === 'Netuno' ? '♆' :
                       p.name === 'Plutão' ? '♇' :
                       p.name === 'Quíron' ? '⚷' :
                       p.name === 'Lilith' ? '⚸' :
                       p.name === 'Nodo Norte' ? '☊' : p.name[0]}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

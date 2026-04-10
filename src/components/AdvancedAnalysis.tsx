import React from 'react';
import { NatalChart, PLANETS } from '@/types';
import { calculateDispositorChain, getInterceptedSigns, getDomicileRuler } from '@/lib/astrology';
import { ArrowRight, Info } from 'lucide-react';

interface AdvancedAnalysisProps {
  chart: NatalChart;
}

export default function AdvancedAnalysis({ chart }: AdvancedAnalysisProps) {
  const chain = calculateDispositorChain(chart.planets);
  const intercepted = getInterceptedSigns(chart.housesPlacidus);

  // Encontrar o planeta em domicílio (Dispositor Final ou em Mútua Recepção)
  const atHome = chart.planets.filter(p => getDomicileRuler(p.sign) === p.name);

  return (
    <div className="space-y-12 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Signos Interceptados */}
      {intercepted.length > 0 && (
        <div className="glass p-6 rounded-3xl border border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-3 mb-4">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gold-500/80">Signos Interceptados</h4>
            <div className="group relative">
              <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-950 border border-white/10 rounded-xl text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                Signos que não aparecem em nenhuma cúspide de casa. Representam potenciais que levam mais tempo para serem acessados conscientemente.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {intercepted.map(sign => (
              <span key={sign} className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold text-xs">
                {sign}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cadeia de Disposição */}
      <div className="glass p-8 rounded-3xl border border-white/5 bg-slate-950/40 relative">
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />
        </div>
        
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gold-500/80">Cadeia de Disposição Final</h4>
          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-950 border border-white/10 rounded-xl text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
              Mostra quem rege quem. Planetas que estão em seu próprio domicílio são o desfecho final da força do mapa.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {chart.planets.map(p => {
            const rulerName = getDomicileRuler(p.sign);
            const rulerSymbol = PLANETS.find(info => info.name === rulerName)?.symbol || '●';
            const isAtHome = rulerName === p.name;

            return (
              <div key={`chain-${p.name}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                <div className="flex flex-col items-center">
                  <span className="text-xl text-white">{p.symbol}</span>
                  <span className="text-[8px] uppercase font-bold text-slate-500">{p.name.substring(0,3)}</span>
                </div>
                
                <ArrowRight className={`w-4 h-4 ${isAtHome ? 'text-gold-500' : 'text-slate-700'}`} />

                <div className="flex flex-col items-center">
                  <span className={`text-xl ${isAtHome ? 'text-gold-400' : 'text-slate-400'}`}>{rulerSymbol}</span>
                  <span className={`text-[8px] uppercase font-bold ${isAtHome ? 'text-gold-500' : 'text-slate-500'}`}>
                    {isAtHome ? 'DOMÍNIO' : rulerName.substring(0,3)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {atHome.length > 0 && (
          <div className="mt-10 p-4 rounded-2xl bg-gold-500/5 border border-gold-500/20 text-center">
            <p className="text-xs text-gold-300">
              <span className="font-black uppercase mr-2">Foco de Poder:</span>
              {atHome.map(p => p.name).join(', ')} {atHome.length > 1 ? 'são os desfechos' : 'é o desfecho'} final da cadeia de disposição. 
              {atHome.length === 1 ? ' Este planeta tem autoridade máxima no mapa.' : ''}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

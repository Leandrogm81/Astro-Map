import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Star } from 'lucide-react';
import SalmoDoDia from '@/components/salmos/SalmoDoDia';
import BuscaSalmos from '@/components/salmos/BuscaSalmos';

export const metadata = {
  title: 'Salmos - AstroMap',
  description: 'Descubra a sabedoria cabalística e astrológica dos Salmos',
};

export default function SalmosPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-gold-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-gold-500/10 border border-gold-500/20">
                <Image
                  src="/assets/logo-premium.png"
                  alt="AstroMap Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-serif font-black tracking-tight text-white">
                  Astro<span className="gradient-text-gold">Map</span>
                </h1>
                <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-gold-500/60">Os Salmos</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Título Principal */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-500/10 mb-6 border border-gold-500/20 shadow-lg shadow-gold-500/5">
            <BookOpen className="w-8 h-8 text-gold-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 tracking-tight">
            Magia dos <span className="gradient-text-gold">Salmos</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            A sabedoria milenar conectando os astros e as esferas cabalísticas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <SalmoDoDia />
            
            {/* Busca de Salmos */}
            <BuscaSalmos />
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* Informações adicionais */}
            <div className="bg-slate-900/50 border border-gold-500/20 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-5 h-5 text-gold-400" />
                <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wider">Conexão Astral</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Cada salmo possui uma correspondência astrológica e cabalística. 
                Os nomes divinos e a energia dos planetas atuam em conjunto para manifestar intenções.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

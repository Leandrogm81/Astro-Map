'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { NatalChart } from '@/types';
import { TraditionalAssessment } from '@/lib/traditional/types';
import { Loader2, Download } from 'lucide-react';
import {
  MyPDFDocument,
  TraditionalTreatisePDF
} from './ExportPDF';

interface PDFDownloadButtonInternalProps {
  chart: NatalChart;
  solarRevolution?: NatalChart | null;
  solarYear?: number;
  reportText?: string;
  solarReportText?: string;
  variant?: 'full' | 'compact';
  isTraditional?: boolean;
  traditionalAssessments?: TraditionalAssessment[];
}

export default function PDFDownloadButtonInternal({
  chart,
  solarRevolution,
  solarYear,
  reportText,
  solarReportText,
  variant = 'full',
  isTraditional = false,
  traditionalAssessments = []
}: PDFDownloadButtonInternalProps) {
  const isCompact = variant === 'compact';

  const document = isTraditional ? (
    <TraditionalTreatisePDF
      chart={chart}
      reportText={reportText}
      traditionalAssessments={traditionalAssessments}
      isTraditional={true}
    />
  ) : (
    <MyPDFDocument
      chart={chart}
      solarRevolution={solarRevolution}
      solarYear={solarYear}
      reportText={reportText}
      solarReportText={solarReportText}
    />
  );

  const fileName = isTraditional
    ? `Tratado_Tradicional_${chart.birthData.name}.pdf`
    : `AstroMap_Exclusivo_${chart.birthData.name}.pdf`;

  if (isCompact) {
    return (
      <PDFDownloadLink
        document={document}
        fileName={fileName}
      >
        {({ loading }) => (
          <button
            disabled={loading}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${
              loading
                ? 'bg-slate-800 text-slate-500 cursor-wait'
                : 'bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500/20 shadow-lg shadow-gold-500/5 active:scale-95'
            }`}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {loading ? '...' : (isTraditional ? 'TRATADO' : 'PDF')}
          </button>
        )}
      </PDFDownloadLink>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PDFDownloadLink
        document={document}
        fileName={fileName}
        className="w-full"
      >
        {({ loading }) => (
          <button
            disabled={loading}
            className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all text-sm ${
              loading
                ? 'bg-slate-800 text-slate-500 cursor-wait'
                : isTraditional
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 hover:from-amber-500 hover:to-yellow-400'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 shadow-lg shadow-indigo-500/25 active:scale-95'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {loading ? 'Preparando Dossiê...' : (isTraditional ? 'BAIXAR TRATADO TRADICIONAL' : 'BAIXAR LIVRO DA VIDA (PDF)')}
          </button>
        )}
      </PDFDownloadLink>

      <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">
        {isTraditional ? 'Inclui Mandala Clássica, Tabela de Dignidades e Relatório de IA' : 'Inclui 2 Mapas, 6 Tabelas Analíticas e Relatórios Profundos'}
      </p>
    </div>
  );
}

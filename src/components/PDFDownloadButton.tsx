'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Download } from 'lucide-react';
import { NatalChart } from '@/types';
import { TraditionalAssessment } from '@/lib/traditional/types';

// O componente que realmente contém o PDFDownloadLink
// é carregado dinamicamente com ssr: false
const PDFDownloadButtonInternal = dynamic(
  () => import('./PDFDownloadButtonInternal'),
  { 
    ssr: false,
    loading: () => (
      <button
        disabled
        className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-slate-800 text-slate-500 cursor-wait"
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Carregando...
      </button>
    )
  }
);

interface PDFDownloadButtonProps {
  chart: NatalChart;
  solarRevolution?: NatalChart | null;
  solarYear?: number;
  reportText?: string;
  solarReportText?: string;
  variant?: 'full' | 'compact';
  isTraditional?: boolean;
  traditionalAssessments?: TraditionalAssessment[];
}

export default function PDFDownloadButton(props: PDFDownloadButtonProps) {
  return <PDFDownloadButtonInternal {...props} />;
}

'use client';

import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink, 
  Font,
  Image as PDFImage
} from '@react-pdf/renderer';
import { NatalChart, PlanetPosition } from '@/types';
import ChartSimplePDF from './ChartSimplePDF';
import { Download, FileText, Loader2 } from 'lucide-react';

// Registrar fontes para um ar mais premium
Font.register({
  family: 'Helvetica-Bold',
  src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica/Helvetica-Bold.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 35,
    height: 35,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4f46e5', // Indigo
  },
  subtitle: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 20,
  },
  infoCard: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    border: 1,
    borderColor: '#f0f0f0',
    flex: 1,
    minWidth: '45%',
  },
  infoLabel: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  table: {
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    padding: 6,
  },
  tableCell: {
    fontSize: 9,
    flex: 1,
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
  },
  aiReport: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  aiText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#333333',
    textAlign: 'justify',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  }
});

interface PDFDocumentProps {
  chart: NatalChart;
  solarRevolution?: NatalChart | null;
  solarYear?: number;
  aiReportText?: string;
}

const MyPDFDocument = ({ chart, solarRevolution, solarYear, aiReportText }: PDFDocumentProps) => {
  const isSolar = !!(solarRevolution && solarYear);
  const data = chart.birthData;

  const formatDeg = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    return `${d}°${m}'`;
  };

  return (
    <Document title={`AstroMap - ${data.name}`}>
      {/* Página 1: Mapa e Dados */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <PDFImage src="/assets/logo-clean.png" style={styles.logo} />
            <View>
              <Text style={styles.title}>AstroMap</Text>
              <Text style={styles.subtitle}>Relatório Astrológico Profissional</Text>
            </View>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 9, color: '#666666' }}>Documento oficial gerado em</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{new Date().toLocaleDateString('pt-BR')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados de Nascimento</Text>
          <View style={styles.grid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Consultante</Text>
              <Text style={styles.infoValue}>{data.name}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Data e Hora</Text>
              <Text style={styles.infoValue}>{data.date} às {data.time}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Localidade</Text>
              <Text style={styles.infoValue}>{data.location}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Coordenadas</Text>
              <Text style={styles.infoValue}>{data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartWrapper}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>
            {isSolar ? `Revolução Solar ${solarYear}` : 'Mapa Natal (Roda de Radix)'}
          </Text>
          <ChartSimplePDF chart={isSolar && solarRevolution ? solarRevolution : chart} size={380} />
        </View>

        <View style={styles.footer}>
          <Text>Gerado por AstroMap AI - Tecnologia de Precisão Astrológica</Text>
          <Text style={{ marginTop: 2 }}>Página 1</Text>
        </View>
      </Page>

      {/* Página 2: Tabelas e AI Report */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posições Planetárias</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Planeta</Text>
              <Text style={styles.tableCellBold}>Signo</Text>
              <Text style={styles.tableCellBold}>Grau</Text>
              <Text style={styles.tableCellBold}>Casa</Text>
              <Text style={styles.tableCellBold}>Estado</Text>
            </View>
            {(isSolar && solarRevolution ? solarRevolution : chart).planets.map((p, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1.5, fontWeight: 'bold' }]}>{p.name}</Text>
                <Text style={styles.tableCell}>{p.sign}</Text>
                <Text style={styles.tableCell}>{formatDeg(p.degree)}</Text>
                <Text style={styles.tableCell}>{p.house}</Text>
                <Text style={[styles.tableCell, { color: p.retrograde ? '#ef4444' : '#10b981' }]}>
                  {p.retrograde ? 'Retrógrado' : 'Direto'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {aiReportText && (
          <View style={styles.aiReport}>
            <Text style={styles.sectionTitle}>Interpretação da Inteligência Artificial</Text>
            <View style={{ marginTop: 10 }}>
              {/* Nota: react-pdf não renderiza markdown automaticamente, 
                  então limpamos as marcações para o texto corrido elegante */}
              <Text style={styles.aiText}>
                {aiReportText.replace(/[#*`]/g, '')}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Gerado por AstroMap AI - Tecnologia de Precisão Astrológica</Text>
          <Text style={{ marginTop: 2 }}>Página 2</Text>
        </View>
      </Page>
    </Document>
  );
};

interface ExportPDFProps {
  chart: NatalChart;
  solarRevolution?: NatalChart | null;
  solarYear?: number;
  reportText?: string;
}

export default function ExportPDF({ chart, solarRevolution, solarYear, reportText }: ExportPDFProps) {
  return (
    <div className="flex flex-col gap-4">
      <PDFDownloadLink
        document={
          <MyPDFDocument 
            chart={chart} 
            solarRevolution={solarRevolution} 
            solarYear={solarYear}
            aiReportText={reportText}
          />
        }
        fileName={`AstroMap_${chart.birthData.name}_${new Date().toISOString().split('T')[0]}.pdf`}
        className="w-full"
      >
        {({ loading }) => (
          <button
            disabled={loading}
            className={`w-full py-3 px-6 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all ${
              loading 
                ? 'bg-slate-800 text-slate-500 cursor-wait' 
                : 'bg-white text-slate-900 hover:bg-slate-100 shadow-lg active:scale-95'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {loading ? 'Preparando PDF...' : 'EXPORTAR PDF PREMIUM'}
          </button>
        )}
      </PDFDownloadLink>
      
      <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">
        Inclui Gráfico Radix, Tabelas e Relatório IA
      </p>
    </div>
  );
}

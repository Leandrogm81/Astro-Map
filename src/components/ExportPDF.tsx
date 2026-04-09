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
import { Download, Loader2 } from 'lucide-react';

// Registrar fontes para um ar mais premium e garantir glifos astrológicos
Font.register({
  family: 'Helvetica-Bold',
  src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica/Helvetica-Bold.ttf'
});

Font.register({
  family: 'DejaVu Sans',
  src: 'https://unpkg.com/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf'
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
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
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
    color: '#4f46e5',
  },
  subtitle: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
    pageBreakInside: 'avoid',
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
    gap: 10,
    marginBottom: 20,
  },
  infoCard: {
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
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
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    padding: 6,
    alignItems: 'center'
  },
  tableCell: {
    fontSize: 8,
    flex: 1,
  },
  tableCellBold: {
    fontSize: 8,
    fontWeight: 'bold',
    flex: 1,
  },
  aiReport: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  aiText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333333',
    textAlign: 'justify',
    marginBottom: 8,
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
  },
  symbol: {
    fontFamily: 'DejaVu Sans',
    fontSize: 10,
  }
});

interface PDFDocumentProps {
  chart: NatalChart;
  solarRevolution?: NatalChart | null;
  solarYear?: number;
  reportText?: string;
  solarReportText?: string;
}

const formatDeg = (deg: number) => {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${m}'`;
};

// Componente utilitário para renderizar as tabelas de um mapa
const ChartTables = ({ chart, title }: { chart: NatalChart, title: string }) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={[styles.sectionTitle, { fontSize: 12, backgroundColor: '#4f46e5', color: '#fff', padding: 4 }]}>
      {title} - Tabelas Astrológicas
    </Text>
    
    <View style={styles.grid}>
      {/* Tabela de Planetas */}
      <View style={{ flex: 1, minWidth: '45%' }}>
        <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5 }]}>Símbolos e Planetas</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellBold, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.tableCellBold, { flex: 1 }]}>Planeta</Text>
            <Text style={[styles.tableCellBold, { flex: 1 }]}>Signo</Text>
            <Text style={styles.tableCellBold}>Grau</Text>
            <Text style={styles.tableCellBold}>Casa</Text>
          </View>
          {chart.planets.map((p, i) => (
            <View wrap={false} key={i} style={styles.tableRow}>
              <Text style={[styles.symbol, { flex: 0.5 }]}>{getPlanetSymbol(p.name)}</Text>
              <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>{p.name}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{p.sign}</Text>
              <Text style={styles.tableCell}>{formatDeg(p.degree)}</Text>
              <Text style={styles.tableCell}>{p.house}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tabela de Casas Placidus */}
      <View style={{ flex: 1, minWidth: '45%' }}>
        <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5 }]}>Casas (Placidus)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellBold, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.tableCellBold, { flex: 1 }]}>Casa</Text>
            <Text style={[styles.tableCellBold, { flex: 1 }]}>Signo</Text>
            <Text style={styles.tableCellBold}>Grau</Text>
          </View>
          {chart.housesPlacidus.map((h, i) => (
            <View wrap={false} key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>{h.number}</Text>
              <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>
                {h.number === 1 ? 'Ascendente (AC)' : h.number === 10 ? 'Meio do Céu (MC)' : `Casa ${h.number}`}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{h.sign}</Text>
              <Text style={styles.tableCell}>{formatDeg(h.degree)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>

    {/* Tabela de Aspectos Principais (Orb < 8) */}
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5 }]}>Aspectos Principais</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCellBold}>Planeta 1</Text>
          <Text style={styles.tableCellBold}>Aspecto</Text>
          <Text style={styles.tableCellBold}>Planeta 2</Text>
          <Text style={styles.tableCellBold}>Orbe</Text>
          <Text style={styles.tableCellBold}>Natureza</Text>
        </View>
        {chart.aspects.filter(a => a.orb <= 8).slice(0, 15).map((a, i) => {
          const isHarmonic = a.type === 'trine' || a.type === 'sextile';
          const typeLabels: Record<string, string> = {
            'conjunction': 'Conjunção', 'sextile': 'Sextil', 'square': 'Quadratura',
            'trine': 'Trígono', 'opposition': 'Oposição'
          };
          return (
            <View wrap={false} key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>{a.planet1}</Text>
              <Text style={styles.tableCellBold}>{typeLabels[a.type] || a.type}</Text>
              <Text style={styles.tableCell}>{a.planet2}</Text>
              <Text style={styles.tableCell}>{a.orb.toFixed(2)}°</Text>
              <Text style={[styles.tableCell, { color: isHarmonic ? '#10b981' : (a.type === 'conjunction' ? '#3b82f6' : '#ef4444') }]}>
                {isHarmonic ? 'Harmônico' : (a.type === 'conjunction' ? 'Neutro' : 'Tensão')}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  </View>
);


const getPlanetSymbol = (name: string) => {
  const symbols: Record<string, string> = {
    'Sol': '☉', 'Lua': '☽', 'Mercúrio': '☿', 'Vênus': '♀',
    'Marte': '♂', 'Júpiter': '♃', 'Saturno': '♄', 'Urano': '♅',
    'Netuno': '♆', 'Plutão': '♇', 'North Node': '☊', 'Chiron': '⚷',
  };
  return symbols[name] || name[0];
};

const Header = () => (
  <View style={styles.header}>
    <View style={styles.logoContainer}>
      <PDFImage src="/assets/logo-clean.png" style={styles.logo} />
      <View>
        <Text style={styles.title}>AstroMap</Text>
        <Text style={styles.subtitle}>O Livro da sua Vida Astrológica</Text>
      </View>
    </View>
    <View style={{ textAlign: 'right' }}>
      <Text style={{ fontSize: 9, color: '#666666' }}>Documento oficial gerado em</Text>
      <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{new Date().toLocaleDateString('pt-BR')}</Text>
    </View>
  </View>
);

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text>Gerado por AstroMap AI - Tecnologia de Precisão Astrológica</Text>
    <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} style={{ marginTop: 2 }} />
  </View>
);

const stripEmojis = (text: string) => {
  if (!text) return text;
  // Expressão regular moderna para remover a maioria dos emojis e pictogramas estendidos
  // Mantém letras acentuadas da língua portuguesa e pontuações comuns
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
};

const MarkdownParagraphs = ({ text }: { text: string }) => {
  const cleanFullText = stripEmojis(text);
  const paragraphs = cleanFullText.split('\n').filter(p => p.trim() !== '');
  return (
    <View style={{ marginTop: 10 }}>
      {paragraphs.map((p, i) => {
        const cleanP = p.replace(/[#*`]/g, '').trim();
        if (p.startsWith('#')) {
          return <Text key={i} style={[styles.sectionTitle, { fontSize: 13, marginTop: 10, color: '#312e81' }]}>{cleanP}</Text>;
        }
        return <Text key={i} style={styles.aiText}>{cleanP}</Text>;
      })}
    </View>
  );
};


const MyPDFDocument = ({ chart, solarRevolution, solarYear, reportText, solarReportText }: PDFDocumentProps) => {
  const data = chart.birthData;

  return (
    <Document title={`AstroMap - ${data.name}`}>
      {/* SEÇÃO 1: MAPA NATAL (Gráfico e Dados) */}
      <Page size="A4" style={styles.page}>
        <Header />
        
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
            Mapa Natal (Roda de Radix)
          </Text>
          <ChartSimplePDF chart={chart} size={350} />
        </View>
        <Footer />
      </Page>

      {/* SEÇÃO 2: TABELAS DO MAPA NATAL */}
      <Page size="A4" style={styles.page}>
        <Footer />
        <ChartTables chart={chart} title="Mapa Natal" />
      </Page>

      {/* SEÇÃO 3: RELATÓRIO IA DO MAPA NATAL */}
      {reportText && (
        <Page size="A4" style={styles.page}>
          <Footer />
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 16, backgroundColor: '#4f46e5', color: '#fff', padding: 8, borderRadius: 4 }]}>
              Análise e Interpretação Natal Integral
            </Text>
            <MarkdownParagraphs text={reportText} />
          </View>
        </Page>
      )}

      {/* SEÇÃO 4: REVOLUÇÃO SOLAR E TABELAS (Se Houver) */}
      {solarRevolution && solarYear && (
        <Page size="A4" style={styles.page}>
          <Footer />
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 16, backgroundColor: '#f59e0b', color: '#fff', padding: 8, borderRadius: 4 }]}>
              Ciclo Anual: Revolução Solar {solarYear}
            </Text>
            <View style={styles.chartWrapper}>
              <ChartSimplePDF chart={solarRevolution} size={350} />
            </View>
          </View>
          <ChartTables chart={solarRevolution} title={`Revolução ${solarYear}`} />
        </Page>
      )}

      {/* SEÇÃO 5: RELATÓRIO IA DA REVOLUÇÃO SOLAR */}
      {solarReportText && (
        <Page size="A4" style={styles.page}>
          <Footer />
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 16, backgroundColor: '#f59e0b', color: '#fff', padding: 8, borderRadius: 4 }]}>
              Guia Anual e Previsões ({solarYear})
            </Text>
            <MarkdownParagraphs text={solarReportText} />
          </View>
        </Page>
      )}
    </Document>
  );
};

interface ExportPDFProps {
  chart: NatalChart;
  solarRevolution?: NatalChart | null;
  solarYear?: number;
  reportText?: string;
  solarReportText?: string;
}

export default function ExportPDF({ chart, solarRevolution, solarYear, reportText, solarReportText }: ExportPDFProps) {
  return (
    <div className="flex flex-col gap-4">
      <PDFDownloadLink
        document={
          <MyPDFDocument 
            chart={chart} 
            solarRevolution={solarRevolution} 
            solarYear={solarYear}
            reportText={reportText}
            solarReportText={solarReportText}
          />
        }
        fileName={`AstroMap_Dossie_${chart.birthData.name}_${new Date().toISOString().split('T')[0]}.pdf`}
        className="w-full"
      >
        {({ loading }) => (
          <button
            disabled={loading}
            className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all text-sm ${
              loading 
                ? 'bg-slate-800 text-slate-500 cursor-wait' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 shadow-lg shadow-indigo-500/25 active:scale-95'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {loading ? 'Compilando Livro Astrológico...' : 'BAIXAR DOSSIÊ COMPLETO (PDF)'}
          </button>
        )}
      </PDFDownloadLink>
      
      <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">
        Inclui Mapas, Tabelas Completas e Relatórios Gerados
      </p>
    </div>
  );
}

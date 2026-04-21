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
import { NatalChart, ZODIAC_SIGNS } from '@/types';
import { TraditionalAssessment } from '@/lib/traditional/types';
import ChartSimplePDF from './ChartSimplePDF';
import TraditionalChartPDF from './TraditionalChartPDF';
import { Download, Loader2 } from 'lucide-react';
import {
  formatPdfAspectRow,
} from '@/lib/traditional/pdfFormatting';
import { 
  getDignity, 
  calculateDispositorChain, 
  getInterceptedSigns, 
  calculateCrossAspects, 
  getHouseForPlanet
} from '@/lib/astrology';

// Registrar fontes para um ar mais premium e garantir glifos astrológicos

Font.register({
  family: 'DejaVu Sans',
  fonts: [
    { src: '/fonts/DejaVuSans.ttf', fontWeight: 'normal' },
    { src: '/fonts/DejaVuSans-Bold.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 128,
    backgroundColor: '#ffffff',
    fontFamily: 'DejaVu Sans',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomStyle: 'solid',
    borderBottomColor: '#1e1b4b',
    paddingBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1b4b',
    letterSpacing: 1,
    fontFamily: 'DejaVu Sans',
  },
  subtitle: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 25,
    pageBreakInside: 'avoid',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e1b4b',
    textTransform: 'uppercase',
    letterSpacing: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37',
    paddingBottom: 4,
    width: '100%',
    fontFamily: 'DejaVu Sans',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 15,
  },
  infoCard: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    flex: 1,
    minWidth: '45%',
  },
  infoLabel: {
    fontSize: 7,
    color: '#64748b',
    marginBottom: 3,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    padding: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 8,
  },
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E1B4B',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8,
    alignItems: 'center'
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  tableRowOdd: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 8,
    flex: 1,
    color: '#334155',
  },
  tableCellBold: {
    fontSize: 8,
    fontWeight: 'bold',
    flex: 1,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 7,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  symbol: {
    fontFamily: 'DejaVu Sans',
    fontSize: 10,
  },
  mdH3: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 10,
    color: '#1e1b4b',
    borderLeftWidth: 3,
    borderLeftColor: '#d4af37',
    paddingLeft: 10,
    backgroundColor: '#f8fafc',
    padding: 6,
    fontFamily: 'DejaVu Sans',
  },
  aiText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#334155',
    textAlign: 'justify',
    marginBottom: 10,
  },
  mdBold: {
    fontWeight: 'bold',
    color: '#0f172a',
    fontFamily: 'DejaVu Sans',
  },
  mdListItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 10,
  },
  mdBullet: {
    width: 12,
    fontSize: 10,
    color: '#d4af37',
  },
  mdSeparator: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 15,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 7,
    fontWeight: 'bold',
  },
  summaryTitle: {
    fontSize: 24,
    color: '#1e1b4b',
    marginBottom: 30,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 3,
    fontFamily: 'DejaVu Sans',
    fontWeight: 'bold',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#1e1b4b',
    fontWeight: 'bold',
  },
  summaryPage: {
    fontSize: 10,
    color: '#64748b',
  }
});

interface PDFDocumentProps {
  chart: NatalChart;
  solarRevolution?: NatalChart | null;
  solarYear?: number;
  reportText?: string;
  solarReportText?: string;
  isTraditional?: boolean;
  traditionalAssessments?: TraditionalAssessment[];
  pdfMode?: 'ai_rs_only' | 'traditional' | 'full';
}

const formatDeg = (deg: number) => {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${m.toString().padStart(2, '0')}'`;
};

const getPlanetSymbol = (name: string) => {
  const symbols: Record<string, string> = {
    'Sol': '☉', 'Lua': '☽', 'Mercúrio': '☿', 'Vênus': '♀',
    'Marte': '♂', 'Júpiter': '♃', 'Saturno': '♄', 'Urano': '♅',
    'Netuno': '♆', 'Plutão': '♇', 'Nodo Norte': '☊', 'Quíron': '⚷',
    'Lilith': '⚸', 'Roda da Fortuna': '⊗',
    'North Node': '☊', 'Chiron': '⚷'
  };
  return symbols[name] || name[0];
};

const getPlanetLabel = (id: string): string => {
  const map: Record<string, string> = {
    sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio',
    venus: 'Vênus', mars: 'Marte', jupiter: 'Júpiter', saturn: 'Saturno'
  };
  return map[id] || id;
};

const getPlanetSymbolTrad = (id: string): string => {
  const map: Record<string, string> = {
    sun: '☉', moon: '☽', mercury: '☿',
    venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄'
  };
  return map[id] || '';
};

// Auxiliares de Tradução Tradicional
const translateSectStatus = (status: string) => {
  const norm = status.toUpperCase().replace(/-/g, '_');
  const map: Record<string, string> = {
    'IN_SECT': 'EM SEITA',
    'OUT_OF_SECT': 'FORA DE SEITA',
    'HAYZ': 'HAYZ (IDEAL)',
    'EX_CONDITION': 'EXCELENTE',
    'BENEFIC': 'BENÉFICO',
    'MALEFIC_OUT_OF_SECT': 'MALÉFICO/FORA',
    'MALEFIC': 'MALÉFICO'
  };
  return map[norm] || status;
};

const translateDignity = (dignity: string) => {
  if (dignity.includes('Afligido')) return dignity.replace('Afligido', 'Debilitado');
  return dignity;
};

// Componente utilitário para renderizar as tabelas de um mapa
const ChartTables = ({ chart, title }: { chart: NatalChart, title: string }) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={[styles.sectionTitle, { fontSize: 12, backgroundColor: '#4f46e5', color: '#fff', padding: 6, borderRadius: 4 }]}> 
      {title} - Dados Técnicos de Precisão
    </Text>

    <View style={{ flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
      {/* Tabela de Planetas */}
      <View style={{ width: '58%', marginRight: 12 }}>
        <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5 }]}>Planetas e Dignidades</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellBold, { flex: 0.3 }]}>#</Text>
            <Text style={[styles.tableCellBold, { flex: 1.2 }]}>Planeta</Text>
            <Text style={[styles.tableCellBold, { flex: 1.2 }]}>Signo</Text>
            <Text style={styles.tableCellBold}>Grau</Text>
            <Text style={[styles.tableCellBold, { flex: 0.5 }]}>Casa</Text>
            <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Dignidade</Text>
          </View>
          {chart.planets.map((p, i) => {
            const dignity = getDignity(p.name, p.sign);
            const isDignified = dignity === 'Domicílio' || dignity === 'Exaltação';
            const isCritical = dignity === 'Exílio' || dignity === 'Queda';

            return (
              <View wrap={false} key={i} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
                <Text style={[styles.symbol, { flex: 0.3 }]}>{getPlanetSymbol(p.name)}</Text>
                <Text style={[styles.tableCell, { flex: 1.2, fontWeight: 'bold' }]}>{p.name}{p.retrograde ? ' ℞' : ''}</Text>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>{p.sign}</Text>
                <Text style={styles.tableCell}>{formatDeg(p.degree)}</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{p.house}</Text>
                <Text style={[styles.tableCell, {
                  flex: 1.5,
                  color: isDignified ? '#10b981' : (isCritical ? '#ef4444' : '#64748b'),
                  fontWeight: isDignified || isCritical ? 'bold' : 'normal'
                }]}>
                  {dignity}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Tabela de Casas Placidus */}
      <View style={{ width: '40%' }}>
        <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5 }]}>Arco de Casas (Placidus)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellBold, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Casa / Ângulo</Text>
            <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Cúspide</Text>
            <Text style={styles.tableCellBold}>Grau</Text>
          </View>
          {chart.housesPlacidus.map((h, i) => (
            <View wrap={false} key={i} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>{h.number}</Text>
              <Text style={[styles.tableCell, { flex: 1.5, fontWeight: h.number % 3 === 1 ? 'bold' : 'normal' }]}>
                {h.number === 1 ? 'Ascendente' : h.number === 10 ? 'Meio do Céu' : (h.number === 4 ? 'Fundo do Céu' : (h.number === 7 ? 'Descendente' : `Casa ${h.number}`))}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{h.sign}</Text>
              <Text style={styles.tableCell}>{formatDeg(h.degree)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  </View>
);

const AnalyticsSummary = ({ chart }: { chart: NatalChart }) => {
  const elementColors: Record<string, string> = {
    fire: '#ef4444', earth: '#84cc16', air: '#0ea5e9', water: '#6366f1'
  };
  
  const elementLabels: Record<string, string> = {
    fire: 'Fogo', earth: 'Terra', air: 'Ar', water: 'Água'
  };

  const getElement = (sign: string) => {
    const s = ZODIAC_SIGNS.find(zs => zs.name === sign);
    return s?.element || 'fire';
  };

  const elements = chart.planets.reduce((acc, p) => {
    const el = getElement(p.sign);
    acc[el] = (acc[el] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chain = calculateDispositorChain(chart.planets);
  const intercepted = getInterceptedSigns(chart.housesPlacidus);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 8 }]}>Resumo Analítico e Dinâmicas de Força</Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Elementos */}
        <View style={{ flex: 1, marginRight: 8, backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
          <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 5, color: '#64748b' }}>DISTRIBUIÇÃO ELEMENTAL</Text>
          <View>
            {['fire', 'earth', 'air', 'water'].map(el => (
              <View key={el} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={{ width: (elements[el] || 0) * 10, height: 6, backgroundColor: elementColors[el], borderRadius: 3 }} />
                <Text style={{ fontSize: 7, fontWeight: 'bold' }}>{elementLabels[el]}: {elements[el] || 0}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cadeia de Disposição */}
        <View style={{ flex: 1.5, marginLeft: 8, backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
          <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 5, color: '#64748b' }}>REGÊNCIA E DISPOSIÇÃO FINAL</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {chain.slice(0, 10).map((link, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 7 }}>{link.planet} → {link.isRuledBy}</Text>
                {i < chain.slice(0, 10).length - 1 && <Text style={{ fontSize: 7, color: '#94a3b8' }}> | </Text>}
              </View>
            ))}
          </View>
          {intercepted.length > 0 && (
            <View style={{ marginTop: 5, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 3 }}>
              <Text style={{ fontSize: 7, color: '#ef4444', fontWeight: 'bold' }}>Sinais Interceptados: {intercepted.join(', ')}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const Header = () => (
  <View style={styles.header}>
    <View style={[styles.logoContainer, { flex: 1, paddingRight: 15 }]}>
      <PDFImage src="/assets/logo-premium.png" style={styles.logo} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>AstroMap</Text>
        <Text style={styles.subtitle}>O Livro de Destino e Autoconhecimento Astrológico</Text>
      </View>
    </View>
    <View style={{ textAlign: 'right', minWidth: 120 }}>
      <Text style={{ fontSize: 9, color: '#666666' }}>Dossiê exclusivo gerado em</Text>
      <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{new Date().toLocaleDateString('pt-BR')}</Text>
    </View>
  </View>
);

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text>Copyright © {new Date().getFullYear()} AstroMap AI - Tecnologia de Precisão Astrológica</Text>
    <Text render={({ pageNumber, totalPages }) => `Documento Confidencial | Página ${pageNumber} de ${totalPages}`} style={{ marginTop: 2 }} />
  </View>
);

const stripUnsupportedEmoji = (text: string) => {
  if (!text) return text;
  return text
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/\uFE0F/g, '');
};

const MarkdownParagraphs = ({ text }: { text: string }) => {
  if (!text) return null;
  
  const cleanFullText = stripUnsupportedEmoji(text);
  const lines = cleanFullText.split('\n');
  
  return (
    <View style={{ marginTop: 10 }}>
      {lines.map((line, i) => {
        const content = line.trim();
        if (!content) return <View key={i} style={{ height: 10 }} />;
        
        // Separadores
        if (content.startsWith('---') || content.startsWith('===')) {
          return <View key={i} style={styles.mdSeparator} />;
        }
        
        // Títulos
        if (content.startsWith('###')) {
          const title = content.replace(/^###\s*/, '');
          return <Text key={i} style={styles.mdH3}>{title}</Text>;
        }
        if (content.startsWith('##')) {
          const title = content.replace(/^##\s*/, '');
          return <Text key={i} style={[styles.mdH3, { fontSize: 14, backgroundColor: '#eef2ff' }]}>{title}</Text>;
        }
        if (content.startsWith('#')) {
          const title = content.replace(/^#\s*/, '');
          return <Text key={i} style={[styles.mdH3, { fontSize: 16, backgroundColor: '#4f46e5', color: '#fff', borderRadius: 4 }]}>{title}</Text>;
        }
        
        // Listas
        if (content.startsWith('- ') || content.startsWith('* ') || content.match(/^\d+\.\s/)) {
          const isOrdered = content.match(/^\d+\.\s/);
          const itemText = content.replace(/^([-*]|\d+\.)\s*/, '');
          
          return (
            <View key={i} style={styles.mdListItem}>
              <Text style={styles.mdBullet}>{isOrdered ? content.split('.')[0] + '.' : '•'}</Text>
              <Text style={[styles.aiText, { flex: 1, marginBottom: 4 }]}>
                {parseBoldText(itemText)}
              </Text>
            </View>
          );
        }
        
        // Parágrafo Normal
        return (
          <Text key={i} style={styles.aiText}>
            {parseBoldText(content)}
          </Text>
        );
      })}
    </View>
  );
};

// Função simples para detectar **bold** e retornar fragmentos formatados
function parseBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={styles.mdBold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return part;
  });
}

const SolarAnalysisTables = ({ natal, solar, year }: { natal: NatalChart, solar: NatalChart, year: number }) => {
  const crossAspects = calculateCrossAspects(solar.planets, natal.planets)
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 15);

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.sectionTitle, { fontSize: 12, backgroundColor: '#f59e0b', color: '#fff', padding: 6, borderRadius: 4 }]}>
        Análise Dinâmica: Revolução Solar {year}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
        {/* Ativação de Casas (Interposição) */}
        <View style={{ width: '58%', marginRight: 12 }}>
          <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5 }]}>Interposição: Planetas RS no seu Natal</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>Planeta (RS)</Text>
              <Text style={styles.tableCellBold}>Casa (RS)</Text>
              <Text style={[styles.tableCellBold, { color: '#d4af37' }]}>Casa (Natal)</Text>
              <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Área Ativada</Text>
            </View>
            {solar.planets.map((p, i) => {
              const natalHouse = getHouseForPlanet(p.longitude, natal.housesPlacidus);
              const areaLabels: Record<number, string> = {
                1: 'Personalidade / Identidade', 2: 'Finanças / Valores', 3: 'Comunicação / Aprendizado',
                4: 'Família / Intimidade', 5: 'Criatividade / Romance', 6: 'Saúde / Trabalho Diário',
                7: 'Relacionamentos / Parcerias', 8: 'Transformação / Crises', 9: 'Expansão / Viagens',
                10: 'Carreira / Status Público', 11: 'Projetos / Amizades', 12: 'Espiritualidade / Retiro'
              };
              return (
                <View wrap={false} key={i} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
                  <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>{p.name}</Text>
                  <Text style={styles.tableCell}>{p.house}</Text>
                  <Text style={[styles.tableCell, { fontWeight: 'bold', color: '#1E1B4B' }]}>{natalHouse}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5, fontSize: 7 }]}>{areaLabels[natalHouse]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Aspectos Cruzados */}
        <View style={{ width: '40%' }}>
          <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5 }]}>Aspectos Cruzados (RS ↔ Natal)</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellBold}>RS</Text>
              <Text style={styles.tableCellBold}>Aspecto</Text>
              <Text style={styles.tableCellBold}>Natal</Text>
              <Text style={styles.tableCellBold}>Orbe</Text>
            </View>
            {crossAspects.map((a, i) => (
              <View wrap={false} key={i} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
                <Text style={styles.tableCell}>{a.planet1}</Text>
                <Text style={[styles.tableCell, { fontWeight: 'bold', color: '#1E1B4B' }]}>{a.type.toUpperCase()}</Text>
                <Text style={styles.tableCell}>{a.planet2}</Text>
                <Text style={styles.tableCell}>{a.orb.toFixed(1)}°</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export const MyPDFDocument = ({ 
  chart, 
  solarRevolution, 
  solarYear, 
  reportText, 
  solarReportText,
  pdfMode = 'ai_rs_only' 
}: PDFDocumentProps) => {
  const data = chart.birthData;
  const isAIRSOnly = pdfMode === 'ai_rs_only';
  const natalReportText = reportText?.trim() ?? '';
  const solarReportTextNormalized = solarReportText?.trim() ?? '';
  const aspectRows = (chart.aspects || []).slice(0, 30).map(formatPdfAspectRow);

  return (
    <Document title={`AstroMap - Dossiê Astrológico - ${data.name}`}>
      {/* PÁGINA 1: CAPA PREMIUM INFINITY */}
      <Page size="A4" style={[styles.page, { backgroundColor: '#0f172a', color: '#fff', justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <View style={{ 
          position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, 
          borderWidth: 1.5, borderColor: '#d4af3733', borderRadius: 4 
        }} />
        
        <View style={{ alignItems: 'center', width: '100%', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#d4af37', paddingVertical: 40 }}>
          <PDFImage src="/assets/logo-premium.png" style={{ width: 90, height: 90, marginBottom: 20 }} />
          <Text style={{ fontSize: 36, fontFamily: 'DejaVu Sans', fontWeight: 'bold', color: '#d4af37', letterSpacing: 6, textTransform: 'uppercase' }}>ASTROMAP</Text>
          <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 8, marginTop: 12, color: '#94a3b8' }}>O Livro da Vida</Text>
        </View>

        <View style={{ marginTop: 60, alignItems: 'center' }}>
          <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 3, color: '#d4af37', marginBottom: 10 }}>Dossiê Exclusivo de</Text>
          <Text style={{ fontSize: 32, fontFamily: 'DejaVu Sans', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>{data.name}</Text>
          <View style={{ height: 1, width: 80, backgroundColor: '#d4af37', marginTop: 20 }} />
        </View>

        <View style={{ position: 'absolute', bottom: 60, alignItems: 'center' }}>
          <Text style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2 }}>Codificado por AstroMap AI</Text>
          <Text style={{ fontSize: 8, color: '#475569', marginTop: 5 }}>{new Date().toLocaleDateString('pt-BR')}</Text>
        </View>
      </Page>

      {/* PÁGINA 2: SUMÁRIO INTEGRADO */}
      <Page size="A4" style={styles.page}>
        <Header />
        <View style={{ paddingTop: 20, paddingHorizontal: 30 }}>
          <Text style={styles.summaryTitle}>Conteúdo do Dossiê</Text>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>1. O Mapa do Nascimento (Radix)</Text>
            <Text style={styles.summaryPage}>03</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>2. Planetas, Dignidades e Casas</Text>
            <Text style={styles.summaryPage}>04</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>3. Geometria de Aspectos</Text>
            <Text style={styles.summaryPage}>06</Text>
          </View>

          {natalReportText ? (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>4. Tratado Interpretativo Natal (IA)</Text>
              <Text style={styles.summaryPage}>07</Text>
            </View>
          ) : null}

          {solarRevolution && (
            <View style={{ marginTop: 20 }}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>5. Mapa da Revolução Solar ({solarYear})</Text>
                <Text style={styles.summaryPage}>10</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>6. Interposição e Dados Técnicos</Text>
                <Text style={styles.summaryPage}>11</Text>
              </View>
              {solarReportText && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>7. Prognóstico Anual Estratégico (IA)</Text>
                  <Text style={styles.summaryPage}>12</Text>
                </View>
              )}
            </View>
          )}
        </View>
        <Footer />
      </Page>

      {/* PÁGINA 1: IDENTIDADE E RADIX */}
      <Page size="A4" style={styles.page}>
        <Header />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Radix: A Promessa do Nascimento</Text>
          <View style={styles.grid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Nativus</Text>
              <Text style={styles.infoValue}>{data.name}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Encarnação</Text>
              <Text style={styles.infoValue}>{data.date} | {data.time}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Coordenadas</Text>
              <Text style={styles.infoValue}>{data.location}</Text>
            </View>
          </View>
        </View>
        <View style={styles.chartWrapper}>
          <ChartSimplePDF chart={chart} size={380} />
          <Text style={{ fontSize: 7, marginTop: 8, color: '#94a3b8', textTransform: 'uppercase' }}>Mandala de Radix - Domificação Placidus</Text>
        </View>
        <Footer />
      </Page>

      {/* PÁGINA 4: PLANETAS E DIGNIDADES */}
      <Page size="A4" style={styles.page}>
          <Header />
          <Text style={styles.sectionTitle}>Geometria Planetária e Dignidades</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Corpo Celeste</Text>
              <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Signo</Text>
              <Text style={styles.tableCellBold}>Grau</Text>
              <Text style={[styles.tableCellBold, { flex: 0.5 }]}>Casa</Text>
              <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Dignidade</Text>
            </View>
            {chart.planets.map((p, i) => (
              <View wrap={false} key={i} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
                <Text style={[styles.tableCell, { flex: 1.5, fontWeight: 'bold' }]}>{p.name}{p.retrograde ? ' ℞' : ''}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{p.sign}</Text>
                <Text style={styles.tableCell}>{formatDeg(p.degree)}</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{p.house}</Text>
                <Text style={[styles.tableCell, { 
                  flex: 1.5, 
                  color: getDignity(p.name, p.sign).includes('Domicílio') ? '#10b981' : (getDignity(p.name, p.sign).includes('Exílio') ? '#ef4444' : '#334155'),
                  fontWeight: getDignity(p.name, p.sign).includes('Domicílio') || getDignity(p.name, p.sign).includes('Exílio') ? 'bold' : 'normal'
                }]}>
                  {getDignity(p.name, p.sign)}
                </Text>
              </View>
            ))}
          </View>
          <Footer />
        </Page>

      {/* PÁGINA 4: LOTES HERMÉTICOS E PONTOS TRADICIONAIS */}
      {!isAIRSOnly && (
        <Page size="A4" style={styles.page}>
          <Header />
          <Text style={styles.sectionTitle}>Lotes Herméticos e Pontos de Poder</Text>
          
          {chart.traditionalPoints && (
            <View style={[styles.grid, { marginBottom: 20 }]}>
              <View style={[styles.infoCard, { borderLeftWidth: 3, borderLeftColor: '#d4af37' }]}>
                <Text style={styles.infoLabel}>Senhor da Natividade</Text>
                <Text style={styles.infoValue}>{chart.traditionalPoints.lordOfNativity.name}</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Hyleg (Portador da Vida)</Text>
                <Text style={styles.infoValue}>{chart.traditionalPoints.hyleg.name}</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Almuten Figuris</Text>
                <Text style={styles.infoValue}>{chart.traditionalPoints.almutenFiguris.name}</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Alcocoden</Text>
                <Text style={styles.infoValue}>{chart.traditionalPoints.alcocoden.name}</Text>
              </View>
            </View>
          )}

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Lote Hermético</Text>
              <Text style={[styles.tableCellBold, { flex: 1.2 }]}>Signo</Text>
              <Text style={styles.tableCellBold}>Grau</Text>
              <Text style={[styles.tableCellBold, { flex: 0.5 }]}>Casa</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>Essência</Text>
            </View>
            {chart.lots?.map((lot, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]} wrap={false}>
                <Text style={[styles.tableCell, { flex: 1.5, fontWeight: 'bold' }]}>{lot.name}</Text>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>{lot.sign}</Text>
                <Text style={styles.tableCell}>{formatDeg(lot.degree)}</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{lot.house}</Text>
                <Text style={[styles.tableCell, { flex: 2, fontSize: 7, color: '#64748b' }]}>{lot.description}</Text>
              </View>
            ))}
          </View>
          <Footer />
        </Page>
      )}

      {/* PÁGINA 6: CASAS ASTROLÓGICAS (SISTEMAS) */}
      <Page size="A4" style={styles.page}>
          <Header />
          <Text style={styles.sectionTitle}>Domificação Placidus: Arquitetura do Destino</Text>
          <View style={{ width: '100%' }}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellBold, { flex: 0.5 }]}>#</Text>
                <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Casa / Ângulo</Text>
                <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Signo na Cúspide</Text>
                <Text style={styles.tableCellBold}>Grau Exato</Text>
              </View>
              {chart.housesPlacidus.map((h, i) => (
                <View key={i} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
                  <Text style={{ fontSize: 8, flex: 0.5 }}>{h.number}</Text>
                  <Text style={{ fontSize: 8, flex: 1.5, fontWeight: h.number % 3 === 1 ? 'bold' : 'normal' }}>
                    {h.number === 1 ? 'Ascendente' : h.number === 10 ? 'Meio do Céu' : (h.number === 4 ? 'Fundo do Céu' : (h.number === 7 ? 'Descendente' : `Casa ${h.number}`))}
                  </Text>
                  <Text style={{ fontSize: 8, flex: 1.5 }}>{h.sign}</Text>
                  <Text style={{ fontSize: 8, flex: 1 }}>{formatDeg(h.degree)}</Text>
                </View>
              ))}
            </View>
          </View>
          <AnalyticsSummary chart={chart} />
          <Footer />
        </Page>

      {/* PÁGINA 7: ASPECTOS NATAL */}
      <Page size="A4" style={styles.page}>
          <Header />
          <Text style={styles.sectionTitle}>Dinâmica de Aspectos: Conversas do Céu</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>Planeta A</Text>
              <Text style={[styles.tableCellBold, { flex: 1.2 }]}>Aspecto</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>Planeta B</Text>
              <Text style={styles.tableCellBold}>Orbe</Text>
              <Text style={[styles.tableCellBold, { flex: 1.2 }]}>Dinâmica</Text>
            </View>
            {aspectRows.map((a, i) => (
              <View wrap={false} key={i} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
                <Text style={[styles.tableCell, { flex: 1 }]}>{a.planet1}</Text>
                <Text style={[styles.tableCell, { flex: 1.2, fontWeight: 'bold', color: '#1E1B4B' }]}>{a.aspect}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{a.planet2}</Text>
                <Text style={styles.tableCell}>{a.orb.toFixed(1)}°</Text>
                <Text style={[styles.tableCell, { flex: 1.2, color: a.applying ? '#d4af37' : '#94a3b8', fontWeight: a.applying ? 'bold' : 'normal' }]}>
                  {a.applying ? 'Aplicativo' : 'Separativo'}
                </Text>
              </View>
            ))}
          </View>
          <Footer />
        </Page>

      {/* PÁGINAS 7-10: TRATADO NATAL (IA) */}
      <Page size="A4" style={styles.page}>
          <Header />
          <View style={{
            backgroundColor: '#1e1b4b',
            padding: 20,
            borderRadius: 4,
            marginBottom: 20,
            borderBottomWidth: 4,
            borderBottomColor: '#d4af37'
          }}>
            <Text style={{ fontSize: 16, fontFamily: 'DejaVu Sans', fontWeight: 'bold', color: '#fff', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2 }}>
              Tratado de Interpretação Natal Integral
            </Text>
            <Text style={{ fontSize: 8, color: '#d4af37', textAlign: 'center', marginTop: 5, letterSpacing: 4, textTransform: 'uppercase' }}>
              Codificado pela Inteligência Artificial AstroMap
            </Text>
          </View>
          {natalReportText ? (
            <MarkdownParagraphs text={natalReportText} />
          ) : (
            <View style={{ padding: 18, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, backgroundColor: '#f8fafc' }}>
              <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                O relatório de IA não foi encontrado para este mapa. Gere o relatório no app para incluí-lo neste PDF.
              </Text>
            </View>
          )}
          <Footer />
        </Page>

      {/* PÁGINA 11-13: REVOLUÇÃO SOLAR (Se Houver) */}
      {solarRevolution && solarYear && (
        <>
          <Page size="A4" style={styles.page}>
            <Header />
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: 16, backgroundColor: '#f59e0b', color: '#fff', padding: 10, borderRadius: 8, textAlign: 'center' }]}>
                Retorno Solar: Ciclo de {solarYear} a {solarYear + 1}
              </Text>
              <View style={styles.chartWrapper}>
                <ChartSimplePDF chart={solarRevolution} size={420} />
              </View>
            </View>
            <Footer />
          </Page>
          <Page size="A4" style={styles.page}>
            <Header />
            <SolarAnalysisTables natal={chart} solar={solarRevolution} year={solarYear} />
            <ChartTables chart={solarRevolution} title={`Dados Técnicos: RS ${solarYear}`} />
            <Footer />
          </Page>
        </>
      )}

      {/* PÁGINA 14-16: RELATÓRIO PREDITIVO (IA) */}
      {solarReportTextNormalized && (
        <Page size="A4" style={styles.page}>
          <Header />
          <Text style={[styles.sectionTitle, { fontSize: 16, letterSpacing: 1, backgroundColor: '#d97706', color: '#fff', padding: 12, borderRadius: 8, textAlign: 'center' }]}>
            Arquétipos e Tendências do Ano ({solarYear})
          </Text>
          <MarkdownParagraphs text={solarReportTextNormalized} />
          <Footer />
        </Page>
      )}
    </Document>
  );
};

export const TraditionalTreatisePDF = ({ chart, reportText, traditionalAssessments }: PDFDocumentProps) => {
  const data = chart.birthData;
  const sun = chart.planets.find(p => p.name === 'Sol');
  const isDay = (sun?.house || 1) >= 7;
  const traditionalReportText = reportText?.trim() ?? '';

  return (
    <Document title={`AstroMap - Tratado Tradicional - ${data.name}`}>
      {/* CAPA CLÁSSICA */}
      <Page size="A4" style={[styles.page, { backgroundColor: '#020617', color: '#fff', justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        {/* Border Decorativo Externo */}
        <View style={{ 
          position: 'absolute', 
          top: 20, left: 20, right: 20, bottom: 20, 
          borderWidth: 1, borderColor: '#fbbf2455', borderRadius: 4 
        }} />
        
        {/* Moldura Central */}
        <View style={{ 
          alignItems: 'center', 
          borderWidth: 1.5, 
          borderColor: '#fbbf24', 
          padding: 50, 
          borderRadius: 2,
          backgroundColor: '#020617',
          width: '100%'
        }}>
          {/* Símbolo Decorativo Superior */}
          <View style={{ width: 60, height: 1.5, backgroundColor: '#fbbf24', marginBottom: 20 }} />
          
          <View style={{ width: 40, height: 1, backgroundColor: '#fbbf24', marginBottom: 15 }} />
          
          <Text style={{ 
            fontSize: 24, 
            fontFamily: 'DejaVu Sans',
            fontWeight: 'bold',
            color: '#fbbf24', 
            letterSpacing: 2.5, 
            textAlign: 'center',
            textTransform: 'uppercase',
            lineHeight: 1.2,
            width: '100%'
          }}>
            Tratado de Astrologia Tradicional
          </Text>
          
          <View style={{ width: 100, height: 1, backgroundColor: '#fbbf24', marginVertical: 25 }} />
          
          <Text style={{ 
            fontSize: 11, 
            textTransform: 'uppercase', 
            letterSpacing: 3, 
            color: '#94a3b8',
            textAlign: 'center' 
          }}>
            Estudo de Dignidades e Operacionalidade{"\n"}das Esferas Celestes
          </Text>
          
          <View style={{ marginTop: 80, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Nativus</Text>
            <Text style={{ 
              fontSize: 36, 
              fontFamily: 'DejaVu Sans',
              fontWeight: 'bold',
              color: '#fff',
              letterSpacing: 1
            }}>{data.name}</Text>
          </View>

          <View style={{ marginTop: 120, alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: '#64748b', letterSpacing: 1 }}>
              Codificado por AstroMap AI | {new Date().toLocaleDateString('pt-BR')}
            </Text>
            <Text style={{ fontSize: 8, color: '#444', marginTop: 5, letterSpacing: 1 }}>
              BIBLIOTHECA ASTROMAPICA • MMXXVI
            </Text>
          </View>
        </View>
      </Page>

      {/* MANDALA TRADICIONAL */}
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={[styles.sectionTitle, { color: '#b45309' }]}>Radix Tradicional (O Septenário)</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
          <View style={[styles.infoCard, { borderLeftWidth: 4, borderLeftColor: isDay ? '#fbbf24' : '#1e1b4b' }]}>
            <Text style={styles.infoLabel}>Seita do Mapa</Text>
            <Text style={styles.infoValue}>{isDay ? 'DIURNO (Sol acima do Horizonte)' : 'NOTURNO (Sol abaixo do Horizonte)'}</Text>
          </View>
        </View>
        <View style={styles.chartWrapper}>
          <TraditionalChartPDF chart={chart} size={380} />
          <Text style={{ fontSize: 8, marginTop: 5, color: '#64748b' }}>Mandala Tradicional - 7 Planetas Clássicos e Lotes Herméticos</Text>
        </View>
        <Footer />
      </Page>

      {/* TABELA DE DIGNIDADES E FORÇA (ALMUTEN) */}
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={[styles.sectionTitle, { color: '#b45309' }]}>Dignidade Essencial e Força Operacional</Text>
        
        {/* Bloco de Destaque para Pontos de Poder */}
        {chart.traditionalPoints && (
          <View style={{ marginBottom: 20 }}>
            {/* Primeira Linha: Soberanos */}
            <View style={[styles.grid, { marginBottom: 10 }]}>
              <View style={[styles.infoCard, { borderTopWidth: 3, borderTopColor: '#b45309', backgroundColor: '#fffcf5' }]}>
                <Text style={[styles.infoLabel, { color: '#b45309' }]}>Senhor da Natividade</Text>
                <Text style={[styles.infoValue, { fontSize: 13, color: '#1e293b' }]}>
                  {chart.traditionalPoints.lordOfNativity.name}
                </Text>
              </View>
              <View style={[styles.infoCard, { borderTopWidth: 3, borderTopColor: '#b45309', backgroundColor: '#fffcf5' }]}>
                <Text style={[styles.infoLabel, { color: '#b45309' }]}>Almuten Figuris</Text>
                <Text style={[styles.infoValue, { fontSize: 13, color: '#1e293b' }]}>
                  {chart.traditionalPoints.almutenFiguris.name}
                </Text>
              </View>
            </View>

            {/* Segunda Linha: Vitalidade */}
            <View style={styles.grid}>
              <View style={[styles.infoCard, { borderTopWidth: 3, borderTopColor: '#0369a1', backgroundColor: '#f0f9ff' }]}>
                <Text style={[styles.infoLabel, { color: '#0369a1' }]}>Hyleg</Text>
                <Text style={[styles.infoValue, { fontSize: 13, color: '#1e293b', textTransform: 'capitalize' }]}>
                  {chart.traditionalPoints.hyleg.name}
                </Text>
              </View>
              <View style={[styles.infoCard, { borderTopWidth: 3, borderTopColor: '#0369a1', backgroundColor: '#f0f9ff' }]}>
                <Text style={[styles.infoLabel, { color: '#0369a1' }]}>Alcocoden</Text>
                <Text style={[styles.infoValue, { fontSize: 13, color: '#1e293b' }]}>
                  {chart.traditionalPoints.alcocoden.name}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.table}>
          <View style={[styles.tableHeader, { backgroundColor: '#1e293b' }]}>
            <Text style={[styles.tableCellBold, { flex: 1.2, color: '#fff' }]}>Governador</Text>
            <Text style={[styles.tableCellBold, { color: '#fff' }]}>Signo/Grau</Text>
            <Text style={[styles.tableCellBold, { flex: 1.8, color: '#fff' }]}>Dignidades Essenciais</Text>
            <Text style={[styles.tableCellBold, { color: '#fff', textAlign: 'center' }]}>Seita</Text>
            <Text style={[styles.tableCellBold, { color: '#fff', textAlign: 'right' }]}>Score</Text>
          </View>
          {traditionalAssessments?.map((a, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { flex: 1.2, flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={[styles.symbol, { marginRight: 4 }]}>{getPlanetSymbolTrad(a.planetId)}</Text>
                <Text style={{ fontWeight: 'bold' }}>{getPlanetLabel(a.planetId)}</Text>
              </View>
              <Text style={styles.tableCell}>{a.sign} {formatDeg(a.degree)}</Text>
              <View style={[styles.tableCell, { flex: 1.8, paddingVertical: 2 }]}>
                 <Text style={{ fontSize: 7, color: '#1e293b', fontWeight: 'bold', marginBottom: 1 }}>{translateDignity(a.dignity)}</Text>
                 <Text style={{ fontSize: 6, color: '#64748b' }}>
                   {a.score.breakdown.essential['Termo'] ? 'Termo ' : ''}
                   {a.score.breakdown.essential['Face'] ? 'Face ' : ''}
                   {a.score.breakdown.essential['Triplicidade'] ? 'Triplicidade ' : ''}
                 </Text>
              </View>
              <Text style={[styles.tableCell, { textAlign: 'center', fontSize: 7, color: a.condition.sectStatus === 'benefic' ? '#10b981' : (a.condition.sectStatus === 'malefic' ? '#ef4444' : '#1e293b') }]}>
                {translateSectStatus(a.sectStatus)}
              </Text>
              <Text style={[styles.tableCellBold, { textAlign: 'right', color: a.totalScore > 0 ? '#10b981' : (a.totalScore < 0 ? '#ef4444' : '#1e1b4b'), fontSize: 10 }]}>
                {a.totalScore > 0 ? `+${a.totalScore}` : a.totalScore}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: '#b45309', marginTop: 25 }]}>Lotes Herméticos (Pontos de Destino)</Text>
        <View style={styles.table}>
          <View style={[styles.tableHeader, { backgroundColor: '#1e293b' }]}>
            <Text style={[styles.tableCellBold, { color: '#fff' }]}>Lote</Text>
            <Text style={[styles.tableCellBold, { color: '#fff' }]}>Signo/Grau</Text>
            <Text style={[styles.tableCellBold, { flex: 2, color: '#fff' }]}>Natureza do Ponto</Text>
          </View>
          {chart.lots?.map((lot, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{lot.name}</Text>
              <Text style={styles.tableCell}>{lot.sign} {formatDeg(lot.degree % 30)}</Text>
              <Text style={[styles.tableCell, { flex: 2, fontSize: 7, color: '#64748b' }]}>{lot.description}</Text>
            </View>
          ))}
        </View>
        <Footer />
      </Page>

      {/* RELATÓRIO DE IA TRADICIONAL */}
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={[styles.sectionTitle, { fontSize: 18, backgroundColor: '#0f172a', color: '#fbbf24', padding: 12, borderRadius: 8, textAlign: 'center' }]}>
          Tratado de Interpretação Clássica
        </Text>
        {traditionalReportText ? (
          <MarkdownParagraphs text={traditionalReportText} />
        ) : (
          <View style={{ padding: 18, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, backgroundColor: '#f8fafc' }}>
            <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
              O relatório de IA tradicional não foi encontrado para este mapa. Gere o tratado no app para incluí-lo neste PDF.
            </Text>
          </View>
        )}
        <Footer />
      </Page>
    </Document>
  );
};

interface ExportPDFProps {
  chart: NatalChart;
  solarRevolution?: NatalChart | null;
  solarYear?: number;
  reportText?: string;
  solarReportText?: string;
  variant?: 'full' | 'compact';
  isTraditional?: boolean;
  traditionalAssessments?: TraditionalAssessment[];
  pdfMode?: 'ai_rs_only' | 'traditional' | 'full';
}

export default function ExportPDF({ 
  chart, 
  solarRevolution, 
  solarYear, 
  reportText, 
  solarReportText, 
  variant = 'full',
  isTraditional = false,
  traditionalAssessments = [],
  pdfMode = 'ai_rs_only'
}: ExportPDFProps) {
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
      pdfMode={isTraditional ? 'traditional' : pdfMode}
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



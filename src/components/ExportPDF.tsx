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
  Image as PDFImage,
  Svg,
  Line,
  Circle
} from '@react-pdf/renderer';
import { NatalChart, ZODIAC_SIGNS } from '@/types';
import { TraditionalAssessment } from '@/lib/traditional/types';
import ChartSimplePDF from './ChartSimplePDF';
import { Download, Loader2 } from 'lucide-react';
import { 
  getDignity, 
  getDomicileRuler, 
  calculateDispositorChain, 
  getInterceptedSigns, 
  calculateCrossAspects, 
  getHouseForPlanet,
  getZodiacSign 
} from '@/lib/astrology';

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
    paddingBottom: 85,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
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
    marginBottom: 15,
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
  },
  // Novos estilos para o Markdown melhorado
  mdH3: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#312e81',
    borderLeftWidth: 3,
    borderLeftColor: '#4f46e5',
    paddingLeft: 8,
    backgroundColor: '#f5f7ff',
    padding: 4,
  },
  mdPara: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333333',
    textAlign: 'justify',
    marginBottom: 8,
  },
  aiText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333333',
    textAlign: 'justify',
    marginBottom: 8,
  },
  mdBold: {
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  mdList: {
    marginLeft: 15,
    marginBottom: 8,
  },
  mdListItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  mdBullet: {
    width: 10,
    fontSize: 10,
  },
  mdSeparator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 15,
  },
  // Estilos analíticos
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 7,
    fontWeight: 'bold',
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
    
    <View style={styles.grid}>
      {/* Tabela de Planetas */}
      <View style={{ flex: 1.5, minWidth: '60%' }}>
        <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5 }]}>Planetas e Dignidades</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellBold, { flex: 0.3 }]}>#</Text>
            <Text style={[styles.tableCellBold, { flex: 1.2 }]}>Planeta</Text>
            <Text style={[styles.tableCellBold, { flex: 1.2 }]}>Signo</Text>
            <Text style={styles.tableCellBold}>Grau</Text>
            <Text style={[styles.tableCellBold, { flex: 0.5 }]}>Casa</Text>
            <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Dignidade / Regência</Text>
          </View>
          {chart.planets.map((p, i) => {
            const dignity = getDignity(p.name, p.sign);
            const isDignified = dignity === 'Domicílio' || dignity === 'Exaltação';
            const isCritical = dignity === 'Exílio' || dignity === 'Queda';
            
            return (
              <View wrap={false} key={i} style={styles.tableRow}>
                <Text style={[styles.symbol, { flex: 0.3 }]}>{getPlanetSymbol(p.name)}</Text>
                <Text style={[styles.tableCell, { flex: 1.2, fontWeight: 'bold' }]}>{p.name}{p.retrograde ? ' ℞' : ''}</Text>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>{p.sign}</Text>
                <Text style={styles.tableCell}>{formatDeg(p.degree)}</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{p.house}</Text>
                <Text style={[styles.tableCell, { 
                  flex: 1.5, 
                  color: isDignified ? '#10b981' : (isCritical ? '#ef4444' : '#666666'),
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
      <View style={{ flex: 1, minWidth: '35%' }}>
        <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5 }]}>Arco de Casas (Placidus)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellBold, { flex: 0.5 }]}>#</Text>
            <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Casa / Ângulo</Text>
            <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Cúspide</Text>
            <Text style={styles.tableCellBold}>Grau</Text>
          </View>
          {chart.housesPlacidus.map((h, i) => (
            <View wrap={false} key={i} style={styles.tableRow}>
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
    const s = ZODIAC_SIGNS.find((zs: any) => zs.name === sign);
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
      
      <View style={{ flexDirection: 'row', gap: 15 }}>
        {/* Elementos */}
        <View style={{ flex: 1, backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
          <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 5, color: '#64748b' }}>DISTRIBUIÇÃO ELEMENTAL</Text>
          <View style={{ gap: 4 }}>
            {['fire', 'earth', 'air', 'water'].map(el => (
              <View key={el} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: (elements[el] || 0) * 10, height: 6, backgroundColor: elementColors[el], borderRadius: 3 }} />
                <Text style={{ fontSize: 7, fontWeight: 'bold' }}>{elementLabels[el]}: {elements[el] || 0}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Cadeia de Disposição */}
        <View style={{ flex: 1.5, backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
          <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 5, color: '#64748b' }}>REGÊNCIA E DISPOSIÇÃO FINAL</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
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
    <View style={styles.logoContainer}>
      <PDFImage src="/assets/logo-premium.png" style={styles.logo} />
      <View>
        <Text style={styles.title}>AstroMap</Text>
        <Text style={styles.subtitle}>O Livro de Destino e Autoconhecimento Astrológico</Text>
      </View>
    </View>
    <View style={{ textAlign: 'right' }}>
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

const stripEmojis = (text: string) => {
  if (!text) return text;
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
};

const MarkdownParagraphs = ({ text }: { text: string }) => {
  if (!text) return null;
  
  const cleanFullText = stripEmojis(text);
  const lines = cleanFullText.split('\n');
  
  return (
    <View style={{ marginTop: 10 }}>
      {lines.map((line, i) => {
        let content = line.trim();
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

      <View style={styles.grid}>
        {/* Ativação de Casas (Interposição) */}
        <View style={{ flex: 1.2, minWidth: '55%' }}>
          <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5 }]}>Interposição: Planetas RS no seu Natal</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>Planeta (RS)</Text>
              <Text style={styles.tableCellBold}>Casa (RS)</Text>
              <Text style={[styles.tableCellBold, { color: '#f59e0b' }]}>Casa (Natal)</Text>
              <Text style={[styles.tableCellBold, { flex: 1.5 }]}>Área Ativada</Text>
            </View>
            {solar.planets.map((p, i) => {
              const natalHouse = getHouseForPlanet(p.longitude, natal.housesPlacidus);
              const areaLabels: Record<number, string> = {
                1: 'Personalidade / Identidade', 2: 'Finanças / Valores', 3: 'Comunicação / Aprendizado',
                4: 'Família / Intimidade', 5: 'Criatividade / Romance', 6: 'Saúde / Trabalho Diário',
                7: 'Relacionos / Parcerias', 8: 'Transformação / Crises', 9: 'Espansão / Viagens',
                10: 'Carreira / Status Público', 11: 'Projetos / Amizades', 12: 'Espiritualidade / Retiro'
              };
              return (
                <View wrap={false} key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>{p.name}</Text>
                  <Text style={styles.tableCell}>{p.house}</Text>
                  <Text style={[styles.tableCell, { fontWeight: 'bold', color: '#d97706' }]}>{natalHouse}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5, fontSize: 7 }]}>{areaLabels[natalHouse]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Aspectos Cruzados */}
        <View style={{ flex: 1, minWidth: '40%' }}>
          <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5 }]}>Pincipais Aspectos Cruzados (RS ↔ Natal)</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellBold}>RS</Text>
              <Text style={styles.tableCellBold}>Aspecto</Text>
              <Text style={styles.tableCellBold}>Natal</Text>
              <Text style={styles.tableCellBold}>Orbe</Text>
            </View>
            {crossAspects.map((a, i) => (
              <View wrap={false} key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{a.planet1}</Text>
                <Text style={styles.tableCellBold}>{a.type.toUpperCase()}</Text>
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


const MyPDFDocument = ({ 
  chart, 
  solarRevolution, 
  solarYear, 
  reportText, 
  solarReportText,
  pdfMode = 'ai_rs_only' 
}: PDFDocumentProps) => {
  const data = chart.birthData;
  const isAIRSOnly = pdfMode === 'ai_rs_only';

  return (
    <Document title={`AstroMap - Dossier Astrológico - ${data.name}`}>
      {/* PÁGINA 1: CAPA PREMIUM */}
      <Page size="A4" style={[styles.page, { backgroundColor: '#111827', color: '#fff', justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ alignItems: 'center' }}>
          <PDFImage src="/assets/logo-premium.png" style={{ width: 120, height: 120, marginBottom: 20 }} />
          <Text style={{ fontSize: 42, fontFamily: 'Helvetica-Bold', color: '#fbbf24', letterSpacing: 4 }}>ASTROMAP</Text>
          <Text style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 8, marginTop: 10, color: '#94a3b8' }}>O Livro da Vida</Text>
          <View style={{ height: 2, width: 200, backgroundColor: '#fbbf24', marginVertical: 30 }} />
          <Text style={{ fontSize: 24, fontFamily: 'Helvetica-Bold' }}>{data.name}</Text>
          <Text style={{ fontSize: 10, marginTop: 100, color: '#64748b' }}>Gerado em {new Date().toLocaleDateString('pt-BR')}</Text>
        </View>
      </Page>

      {/* PÁGINA 2: IDENTIDADE E RADIX */}
      <Page size="A4" style={styles.page}>
        <Header />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Radix: O Mapa do Nascimento</Text>
          <View style={styles.grid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{data.name}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Encarnação</Text>
              <Text style={styles.infoValue}>{data.date} às {data.time}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Local</Text>
              <Text style={styles.infoValue}>{data.location}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Coordenadas</Text>
              <Text style={styles.infoValue}>{data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.chartWrapper}>
          <ChartSimplePDF chart={chart} size={380} />
          <Text style={{ fontSize: 8, marginTop: 5, color: '#94a3b8' }}>Mandala de Radix - Sistema Placidus</Text>
        </View>
        <Footer />
      </Page>

      {/* PÁGINA 3: PLANETAS E DIGNIDADES */}
      {!isAIRSOnly && (
        <Page size="A4" style={styles.page}>
          <Header />
          <Text style={styles.sectionTitle}>Geometria Planetária e Dignidades</Text>
          <View style={styles.table}>
            <View style={[styles.tableHeader, { backgroundColor: '#f97316' }]}>
              <Text style={[styles.tableCellBold, { flex: 1.5, color: '#fff' }]}>Corpo Celeste</Text>
              <Text style={[styles.tableCellBold, { flex: 1.5, color: '#fff' }]}>Signo</Text>
              <Text style={[styles.tableCellBold, { color: '#fff' }]}>Grau</Text>
              <Text style={[styles.tableCellBold, { flex: 0.5, color: '#fff' }]}>Casa</Text>
              <Text style={[styles.tableCellBold, { flex: 1.5, color: '#fff' }]}>Dignidade</Text>
            </View>
            {chart.planets.map((p, i) => (
              <View key={i} style={styles.tableRow} wrap={false}>
                <Text style={[styles.tableCell, { flex: 1.5, fontWeight: 'bold' }]}>{p.name}{p.retrograde ? ' ℞' : ''}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{p.sign}</Text>
                <Text style={styles.tableCell}>{formatDeg(p.degree)}</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{p.house}</Text>
                <Text style={[styles.tableCell, { flex: 1.5, color: getDignity(p.name, p.sign).includes('Exílio') ? '#ef4444' : (getDignity(p.name, p.sign).includes('Domicílio') ? '#10b981' : '#1a1a1a') }]}>
                  {getDignity(p.name, p.sign)}
                </Text>
              </View>
            ))}
          </View>
          <Footer />
        </Page>
      )}

      {/* PÁGINA 4: LOTES HERMÉTICOS E PONTOS TRADICIONAIS */}
      {!isAIRSOnly && (
        <Page size="A4" style={styles.page}>
          <Header />
          <Text style={styles.sectionTitle}>Lotes Herméticos e Pontos de Poder</Text>
          
          {chart.traditionalPoints && (
            <View style={[styles.grid, { marginBottom: 20 }]}>
              <View style={[styles.infoCard, { borderColor: '#fbbf24' }]}>
                <Text style={styles.infoLabel}>Senhor da Natividade</Text>
                <Text style={[styles.infoValue, { color: '#d97706' }]}>{chart.traditionalPoints.lordOfNativity.name}</Text>
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
            <View style={[styles.tableHeader, { backgroundColor: '#8b5cf6' }]}>
              <Text style={[styles.tableCellBold, { flex: 1.5, color: '#fff' }]}>Lote Hermético</Text>
              <Text style={[styles.tableCellBold, { flex: 1.2, color: '#fff' }]}>Signo</Text>
              <Text style={[styles.tableCellBold, { color: '#fff' }]}>Grau</Text>
              <Text style={[styles.tableCellBold, { flex: 0.5, color: '#fff' }]}>Casa</Text>
              <Text style={[styles.tableCellBold, { flex: 2, color: '#fff' }]}>Essência</Text>
            </View>
            {chart.lots?.map((lot, i) => (
              <View key={i} style={styles.tableRow} wrap={false}>
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

      {/* PÁGINA 5: CASAS ASTROLÓGICAS (SISTEMAS) */}
      {!isAIRSOnly && (
        <Page size="A4" style={styles.page}>
          <Header />
          <Text style={styles.sectionTitle}>Domificação: Arquitetura do Destino</Text>
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>Placidus (Arco de Tempo)</Text>
              <View style={styles.table}>
                {chart.housesPlacidus.map((h, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={{ fontSize: 8, flex: 0.5 }}>{h.number}</Text>
                    <Text style={{ fontSize: 8, flex: 1.5 }}>{h.sign}</Text>
                    <Text style={{ fontSize: 8, flex: 1 }}>{formatDeg(h.degree)}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>Whole Signs (Signos Inteiros)</Text>
              <View style={styles.table}>
                {chart.housesWhole.map((h, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={{ fontSize: 8, flex: 0.5 }}>{h.number}</Text>
                    <Text style={{ fontSize: 8, flex: 1.5 }}>{h.sign}</Text>
                    <Text style={{ fontSize: 8, flex: 1 }}>{formatDeg(h.degree)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <AnalyticsSummary chart={chart} />
          <Footer />
        </Page>
      )}

      {/* PÁGINA 6: ASPECTOS NATAL */}
      {!isAIRSOnly && (
        <Page size="A4" style={styles.page}>
          <Header />
          <Text style={styles.sectionTitle}>Dinâmica de Aspectos: Conversas do Céu</Text>
          <View style={styles.table}>
            <View style={[styles.tableHeader, { backgroundColor: '#3b82f6' }]}>
              <Text style={[styles.tableCellBold, { color: '#fff' }]}>Corpo 1</Text>
              <Text style={[styles.tableCellBold, { color: '#fff' }]}>Relacionamento</Text>
              <Text style={[styles.tableCellBold, { color: '#fff' }]}>Corpo 2</Text>
              <Text style={[styles.tableCellBold, { color: '#fff' }]}>Orbe</Text>
              <Text style={[styles.tableCellBold, { color: '#fff' }]}>Fase</Text>
            </View>
            {chart.aspects.slice(0, 25).map((a, i) => (
              <View key={i} style={styles.tableRow} wrap={false}>
                <Text style={styles.tableCell}>{a.planet1}</Text>
                <Text style={[styles.tableCell, { fontWeight: 'bold', textTransform: 'uppercase' }]}>{a.type}</Text>
                <Text style={styles.tableCell}>{a.planet2}</Text>
                <Text style={styles.tableCell}>{a.orb.toFixed(2)}°</Text>
                <Text style={[styles.tableCell, { color: a.applying ? '#10b981' : '#94a3b8' }]}>{a.applying ? 'Aplicativo' : 'Separativo'}</Text>
              </View>
            ))}
          </View>
          <Footer />
        </Page>
      )}

      {/* PÁGINAS 7-10: TRATADO NATAL (IA) */}
      {reportText && (
        <Page size="A4" style={styles.page}>
          <Header />
          <Text style={[styles.sectionTitle, { fontSize: 18, backgroundColor: '#1e1b4b', color: '#fff', padding: 12, borderRadius: 8, textAlign: 'center' }]}>
            Tratado de Interpretação Natal Integral
          </Text>
          <MarkdownParagraphs text={reportText} />
          <Footer />
        </Page>
      )}

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
      {solarReportText && (
        <Page size="A4" style={styles.page}>
          <Header />
          <Text style={[styles.sectionTitle, { fontSize: 18, backgroundColor: '#d97706', color: '#fff', padding: 12, borderRadius: 8, textAlign: 'center' }]}>
            Arquétipos e Tendências do Ano ({solarYear})
          </Text>
          <MarkdownParagraphs text={solarReportText} />
          <Footer />
        </Page>
      )}
    </Document>
  );
};

const TraditionalTreatisePDF = ({ chart, reportText, traditionalAssessments }: PDFDocumentProps) => {
  const data = chart.birthData;
  const isDay = (chart.planets.find(p => p.name === 'Sol')?.house ?? 1) >= 7;

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
            fontFamily: 'Helvetica-Bold', 
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
              fontFamily: 'Helvetica-Bold', 
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
          <ChartSimplePDF chart={chart} size={380} isTraditional={true} />
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
      {reportText && (
        <Page size="A4" style={styles.page}>
          <Header />
          <Text style={[styles.sectionTitle, { fontSize: 18, backgroundColor: '#0f172a', color: '#fbbf24', padding: 12, borderRadius: 8, textAlign: 'center' }]}>
            Tratado de Interpretação Clássica
          </Text>
          <MarkdownParagraphs text={reportText} />
          <Footer />
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

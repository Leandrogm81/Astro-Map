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
} from '@react-pdf/renderer';
import { NatalChart, PlanetPosition, ZODIAC_SIGNS } from '@/types';
import ChartSimplePDF from './ChartSimplePDF';
import { Download, Loader2 } from 'lucide-react';
import { 
  getDignity, 
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
    padding: 50,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  coverPage: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  titleCover: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f8fafc',
    letterSpacing: 2,
    marginBottom: 5,
  },
  subtitleCover: {
    fontSize: 14,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 40,
  },
  clientNameCover: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginTop: 25,
  },
  signatureCover: {
    fontSize: 10,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 2,
    borderBottomColor: '#fbbf24',
    paddingBottom: 5,
  },
  aiSectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 10,
    marginTop: 15,
  },
  mdPara: {
    fontSize: 10.5,
    lineHeight: 1.6,
    color: '#334155',
    textAlign: 'justify',
    marginBottom: 12,
  },
  mdBold: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  mdListItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 10,
  },
  mdBullet: {
    width: 12,
    fontSize: 10,
    color: '#fbbf24',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTopWidth: 0.5,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  table: {
    marginVertical: 15,
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    padding: 8,
    alignItems: 'center'
  },
  tableCell: {
    fontSize: 8.5,
    flex: 1,
  },
  tableCellBold: {
    fontSize: 8.5,
    fontWeight: 'bold',
    flex: 1,
  },
  symbol: {
    fontFamily: 'DejaVu Sans',
    fontSize: 11,
  },
  fallbackBox: {
    padding: 20,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 8,
    marginTop: 20,
  },
  fallbackText: {
    fontSize: 10,
    color: '#92400e',
    fontStyle: 'italic',
    textAlign: 'center',
  }
});

interface PDFDocumentProps {
  chart: NatalChart;
  solarRevolution?: NatalChart | null;
  solarYear?: number;
  reportText?: string;
  solarReportText?: string;
}

const extractSectionWithFallback = (text: string, tagName: string, headingKeywords: string[]): string | null => {
  if (!text) return null;
  const tagRegex = new RegExp(`\\[\\[${tagName}\\]\\]([\\s\\S]*?)\\[\\[\\/${tagName}\\]\\]`, 'i');
  const tagMatch = text.match(tagRegex);
  if (tagMatch && tagMatch[1].trim()) return tagMatch[1].trim();
  for (const keyword of headingKeywords) {
    const headingRegex = new RegExp(`(?:###|##).*?${keyword}.*?\\n([\\s\\S]*?)(?=\\n(?:###|##|\\[\\[))`, 'i');
    const headingMatch = text.match(headingRegex);
    if (headingMatch && headingMatch[1].trim()) return headingMatch[1].trim();
  }
  return null;
};

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
    'Lilith': '⚸', 'Roda da Fortuna': '⊗'
  };
  return symbols[name] || name[0];
};

const MarkdownRenderer = ({ text, fallback }: { text: string | null, fallback?: string }) => {
  if (!text) return (
    <View style={styles.fallbackBox}>
      <Text style={styles.fallbackText}>{fallback || "Esta seção está sendo processada. Consulte os dados técnicos para detalhes imediatos."}</Text>
    </View>
  );
  const lines = text.split('\n');
  return (
    <View>
      {lines.map((line, i) => {
        const content = line.trim();
        if (!content) return <View key={i} style={{ height: 8 }} />;
        if (content.startsWith('###') || content.startsWith('##')) return <Text key={i} style={styles.aiSectionHeader}>{content.replace(/^[#\s]+/, '')}</Text>;
        if (content.startsWith('- ') || content.startsWith('* ')) return (
          <View key={i} style={styles.mdListItem}><Text style={styles.mdBullet}>•</Text><Text style={[styles.mdPara, { flex: 1, marginBottom: 4 }]}>{parseBoldText(content.replace(/^[-*\s]+/, ''))}</Text></View>
        );
        return <Text key={i} style={styles.mdPara}>{parseBoldText(content)}</Text>;
      })}
    </View>
  );
};

function parseBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => part.startsWith('**') && part.endsWith('**') ? <Text key={i} style={styles.mdBold}>{part.slice(2, -2)}</Text> : part);
}

const MyPDFDocument = ({ chart, solarRevolution, solarYear, reportText, solarReportText }: PDFDocumentProps) => {
  const data = chart.birthData;
  const intercepted = getInterceptedSigns(chart.housesPlacidus);
  const chain = calculateDispositorChain(chart.planets);

  return (
    <Document title={`AstroMap - Livro da Vida - ${data.name}`}>
      
      {/* PÁGINA 1: CAPA PREMIUM */}
      <Page size="A4" style={styles.coverPage}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.titleCover}>AstroMap</Text>
          <Text style={styles.subtitleCover}>Livro da Vida</Text>
          <View style={{ height: 2, width: 60, backgroundColor: '#fbbf24', marginTop: -20 }} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <ChartSimplePDF chart={chart} variant="cover" size={320} />
          <Text style={styles.clientNameCover}>{data.name}</Text>
          <Text style={styles.signatureCover}>Mapa Natal e Revolução Solar — Leitura Técnica e Interpretativa</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 9, color: '#94a3b8' }}>{data.location}</Text>
          <Text style={{ fontSize: 8, color: '#64748b', marginTop: 4 }}>{data.latitude.toFixed(4)}°N, {data.longitude.toFixed(4)}°E | {new Date().toLocaleDateString('pt-BR')}</Text>
        </View>
      </Page>

      {/* PÁGINA 2: SÍNTESE EXECUTIVA NATAL */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Síntese Executiva</Text>
        <MarkdownRenderer text={extractSectionWithFallback(reportText || '', 'SINTESE_EXECUTIVA_NATAL', ['Síntese', 'Executiva', 'Resumo'])} />
        <View style={{ position: 'absolute', bottom: 100, left: 50, right: 50, padding: 20, backgroundColor: '#f8fafc', borderRadius: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>Destaque Evolutivo</Text>
          <Text style={{ fontSize: 9, lineHeight: 1.4, color: '#475569' }}>Seu destino é uma composição única de influências celestes. Esta síntese foca nas energias de maior impacto para o seu desenvolvimento pessoal agora.</Text>
        </View>
        <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
      </Page>

      {/* PÁGINA 3: IDENTIDADE ASTROLÓGICA */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Identidade Astrológica</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
          {chart.planets.filter(p => ['Sol', 'Lua'].includes(p.name)).concat([
            { name: 'Ascendente', sign: getZodiacSign(chart.ascendant), degree: chart.ascendant % 30 } as any
          ]).map((p, i) => (
            <View key={i} style={{ flex: 1, minWidth: '30%', padding: 20, backgroundColor: '#f8fafc', borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#fbbf24' }}>
              <Text style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>{p.name}</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 4 }}>{p.sign}</Text>
              <Text style={{ fontSize: 11, color: '#475569' }}>{formatDeg(p.degree)}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 40 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 20 }}>Equilíbrio dos Elementos</Text>
          {['Fogo', 'Terra', 'Ar', 'Água'].map(el => {
            const count = chart.planets.filter(p => ZODIAC_SIGNS.find(s => s.name === p.sign)?.element === (el === 'Fogo' ? 'fire' : el === 'Terra' ? 'earth' : el === 'Ar' ? 'air' : 'water')).length;
            return (
              <View key={el} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ width: 80, fontSize: 10 }}>{el}</Text>
                <View style={{ flex: 1, height: 10, backgroundColor: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                  <View style={{ width: `${(count / 10) * 100}%`, height: '100%', backgroundColor: el === 'Fogo' ? '#ef4444' : el === 'Terra' ? '#84cc16' : el === 'Ar' ? '#0ea5e9' : '#6366f1' }} />
                </View>
                <Text style={{ width: 30, textAlign: 'right', fontSize: 10, fontWeight: 'bold', marginLeft: 10 }}>{count}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
      </Page>

      {/* PÁGINA 4: RODA NATAL MÁSTER */}
      <Page size="A4" style={[styles.page, { padding: 0 }]}>
        <View style={{ height: '85%', alignItems: 'center', justifyContent: 'center' }}>
          <ChartSimplePDF chart={chart} variant="full-page" size={520} />
        </View>
        <View style={{ padding: 40, backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1e293b' }}>Análise Visual do Radix</Text>
          <Text style={{ fontSize: 9, color: '#64748b', marginTop: 10, lineHeight: 1.6 }}>Esta é a representação astronômica fiel do céu no instante de sua origem. Cada linha, ângulo e posição planetária compõe a partitura única de sua vida. O Ascendente à esquerda é o ponto de partida desta encarnação.</Text>
        </View>
        <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
      </Page>

      {/* PÁGINA 5: DADOS TÉCNICOS NATAL */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Dossiê Científico</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellBold, { flex: 0.4 }]}>#</Text>
            <Text style={[styles.tableCellBold, { flex: 1 }]}>Planeta</Text>
            <Text style={[styles.tableCellBold, { flex: 1.2 }]}>Posição</Text>
            <Text style={styles.tableCellBold}>Casa</Text>
            <Text style={[styles.tableCellBold, { flex: 2.2 }]}>Dignidade Dominante</Text>
          </View>
          {chart.planets.map((p, i) => (
            <View wrap={false} key={i} style={styles.tableRow}>
              <Text style={[styles.symbol, { flex: 0.4 }]}>{getPlanetSymbol(p.name)}</Text>
              <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold' }]}>{p.name}{p.retrograde ? ' ℞' : ''}</Text>
              <Text style={[styles.tableCell, { flex: 1.2 }]}>{p.sign} {formatDeg(p.degree)}</Text>
              <Text style={styles.tableCell}>{p.house}</Text>
              <Text style={[styles.tableCell, { flex: 2.2 }]}>{getDignity(p.name, p.sign)}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
      </Page>

      {/* PÁGINAS 6-10: ANÁLISE IA SEGMENTADA */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>I. O Tecido da Alma</Text>
        <MarkdownRenderer text={extractSectionWithFallback(reportText || '', 'NUCLEO_PERSONALIDADE', ['Núcleo', 'Personalidade'])} />
        <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>II. Engrenagens Cósmicas</Text>
        <View style={{ padding: 15, backgroundColor: '#f8fafc', borderRadius: 8, marginBottom: 20 }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#64748b', marginBottom: 8 }}>CADEIA DE COMANDO (DISPOSIÇÃO)</Text>
          <Text style={{ fontSize: 8 }}>{chain.map(l => `${l.planet} → ${l.isRuledBy}`).join(' | ')}</Text>
          {intercepted.length > 0 && <Text style={{ fontSize: 8, color: '#ef4444', marginTop: 5 }}>Signos Interceptados: {intercepted.join(', ')}</Text>}
        </View>
        <MarkdownRenderer text={extractSectionWithFallback(reportText || '', 'ARQUITETURA_INTERNA', ['Arquitetura', 'Disposição'])} />
        <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>III. Ambição e Abundância</Text>
        <MarkdownRenderer text={extractSectionWithFallback(reportText || '', 'VOCACAO_TRABALHO_DINHEIRO', ['Vocação', 'Prosperidade'])} />
        <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>IV. O Altar dos Encontros</Text>
        <MarkdownRenderer text={extractSectionWithFallback(reportText || '', 'AMOR_DESEJO_VINCULOS', ['Amor', 'Relacionamentos'])} />
        <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>V. Sombras e Transmutação</Text>
        <MarkdownRenderer text={extractSectionWithFallback(reportText || '', 'SOMBRA_MATURIDADE_PROPOSITO', ['Sombra', 'Propósito'])} />
        <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
      </Page>

      {/* PÁGINA 11: MENSAGEM FINAL NATAL */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>O Veredito Estelar</Text>
        <MarkdownRenderer text={extractSectionWithFallback(reportText || '', 'SINTESE_NATAL_FINAL', ['Síntese Final', 'Conclusão'])} />
        <View style={{ marginTop: 60, alignItems: 'center', padding: 40, borderTopWidth: 2, borderTopColor: '#f1f5f9' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Sua Vontade é o Destino Final</Text>
          <Text style={{ fontSize: 9, color: '#64748b', marginTop: 10 }}>Este livro não prevê o inevitável, mas cartografa o possível.</Text>
        </View>
        <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
      </Page>

      {/* PÁGINAS 12-15: REVOLUÇÃO SOLAR (SE HOUVER) */}
      {solarRevolution && solarYear && (
        <>
          <Page size="A4" style={[styles.page, { backgroundColor: '#fffbeb' }]}>
            <Text style={[styles.sectionTitle, { color: '#b45309', borderBottomColor: '#f59e0b' }]}>Revolução Solar {solarYear}</Text>
            <MarkdownRenderer text={extractSectionWithFallback(solarReportText || '', 'ABERTURA_RS', ['Abertura', 'Tema do Ano'])} />
            <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
          </Page>

          <Page size="A4" style={styles.page}>
            <Text style={styles.sectionTitle}>Dashboard Solar</Text>
            <View style={{ alignItems: 'center' }}><ChartSimplePDF chart={solarRevolution} variant="cover" size={300} /></View>
            <View style={{ flexDirection: 'row', gap: 15, marginTop: 30 }}>
              <View style={{ flex: 1, padding: 15, backgroundColor: '#fef3c7', borderRadius: 8 }}>
                <Text style={{ fontSize: 8, fontWeight: 'bold' }}>ASC RS NO NATAL</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#b45309' }}>Casa {getHouseForPlanet(solarRevolution.ascendant, chart.housesPlacidus)}</Text>
              </View>
              <View style={{ flex: 1, padding: 15, backgroundColor: '#ecfdf5', borderRadius: 8 }}>
                <Text style={{ fontSize: 8, fontWeight: 'bold' }}>PROXIMIDADE MC</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#059669' }}>Casa {getHouseForPlanet(solarRevolution.mc, chart.housesPlacidus)}</Text>
              </View>
            </View>
            <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
          </Page>

          <Page size="A4" style={styles.page}>
            <Text style={styles.sectionTitle}>Ativações e Dados RS</Text>
            <View style={styles.table}>
              {calculateCrossAspects(solarRevolution.planets, chart.planets).slice(0, 10).map((a, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{a.planet1} (RS)</Text>
                  <Text style={styles.tableCellBold}>{a.type.toUpperCase()}</Text>
                  <Text style={styles.tableCell}>{a.planet2} (Natal)</Text>
                  <Text style={styles.tableCell}>{a.orb.toFixed(1)}°</Text>
                </View>
              ))}
            </View>
            <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
          </Page>

          <Page size="A4" style={styles.page}>
            <Text style={styles.sectionTitle}>Cronograma e Conselhos</Text>
            <MarkdownRenderer text={extractSectionWithFallback(solarReportText || '', 'GUIA_PRATICO_ANO', ['Guia', 'Semestres'])} />
            <Text style={styles.footer} fixed render={({ pageNumber }) => `AstroMap Premium | Página ${pageNumber}`} />
          </Page>
        </>
      )}
    </Document>
  );
};

export default function ExportPDF({ chart, solarRevolution, solarYear, reportText, solarReportText, params }: ExportPDFProps & { params?: { isHeader?: boolean } }) {
  const isHeader = params?.isHeader;
  return (
    <div className="flex flex-col gap-2">
      <PDFDownloadLink
        document={<MyPDFDocument chart={chart} solarRevolution={solarRevolution} solarYear={solarYear} reportText={reportText} solarReportText={solarReportText} />}
        fileName={`AstroMap_Book_${chart.birthData.name.replace(/\s+/g, '_')}.pdf`}
      >
        {({ loading }) => (
          <div className={`flex items-center gap-2 font-bold cursor-pointer transition-all ${isHeader ? 'px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 text-xs shadow-lg' : 'px-6 py-4 bg-slate-800 text-white rounded-2xl hover:bg-slate-700'}`}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{loading ? 'Preparando Livro...' : 'GERAR PDF'}</span>
          </div>
        )}
      </PDFDownloadLink>
      {!isHeader && <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">Dossiê Exclusivo de 15 Páginas</p>}
    </div>
  );
}

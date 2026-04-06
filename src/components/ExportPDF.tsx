'use client';

import React from 'react';
import { NatalChart, AIReport } from '@/types';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Download, FileText } from 'lucide-react';
import ChartSimplePDF from './ChartSimplePDF';

interface ExportPDFProps {
  chart: NatalChart;
  report?: AIReport | null;
  solarReport?: AIReport | null;
  solarRevolution?: NatalChart | null;
  solarYear?: number;
}

// Styles for PDF - Light theme for printing
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    color: '#7c3aed',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#7c3aed',
    marginBottom: 8,
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 4,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 10,
    color: '#1e293b',
    marginBottom: 4,
    lineHeight: 1.4,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e2e8f0',
    paddingVertical: 4,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#1e293b',
  },
  headerCell: {
    flex: 1,
    fontSize: 9,
    color: '#7c3aed',
    fontWeight: 'bold',
  },
  highlight: {
    color: '#7c3aed',
    fontWeight: 'bold',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    fontSize: 8,
    color: '#94a3b8',
  },
});

// Helper functions
function getZodiacSign(longitude: number): string {
  const signs = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
                 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  return signs[Math.floor(longitude / 30) % 12];
}

function formatDegree(degree: number): string {
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  return `${d}°${m}'`;
}

function translateAspectType(type: string): string {
  const translations: Record<string, string> = {
    conjunction: 'Conjunção',
    sextile: 'Sextil',
    square: 'Quadratura',
    trine: 'Trígono',
    opposition: 'Oposição',
    semisextile: 'Semisextil',
    semisquare: 'Semiquadratura',
    quintile: 'Quintil',
    sesquiquadrate: 'Sesquiquadratura',
    biquintile: 'Biquintil',
    quincunx: 'Quincúncio',
  };
  return translations[type] || type;
}

function translatePlanetName(name: string): string {
  const translations: Record<string, string> = {
    'Sun': 'Sol',
    'Moon': 'Lua',
    'Mercury': 'Mercúrio',
    'Venus': 'Vênus',
    'Mars': 'Marte',
    'Jupiter': 'Júpiter',
    'Saturn': 'Saturno',
    'Uranus': 'Urano',
    'Neptune': 'Netuno',
    'Pluto': 'Plutão',
    'North Node': 'Nodo Norte',
    'Chiron': 'Quíron',
  };
  return translations[name] || name;
}

// PDF Document Component
const AstroPDF = ({ 
  chart, 
  report,
  solarReport,
  solarRevolution,
  solarYear
}: { 
  chart: NatalChart; 
  report?: AIReport | null;
  solarReport?: AIReport | null;
  solarRevolution?: NatalChart | null;
  solarYear?: number;
}) => {
  // Calculate dynamic page count
  const hasNatalReport = report && report.sections.length > 0;
  const hasSolarData = solarRevolution && solarYear;
  const hasSolarReport = solarReport && solarReport.sections.length > 0;
  const totalPages = 3 + (hasNatalReport ? 1 : 0) + (hasSolarData ? 1 : 0) + (hasSolarReport ? 1 : 0);

  return (
    <Document>
      {/* Page 1: Cover with Zodiac Wheel and Summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Mapa Astral</Text>
        <Text style={styles.subtitle}>
          {chart.birthData.name}
        </Text>
        <Text style={styles.subtitle}>
          {chart.birthData.date} às {chart.birthData.time} • {chart.birthData.location}
        </Text>

        {/* Zodiac Wheel Chart */}
        <View style={{ alignSelf: 'center', marginBottom: 15 }}>
          <ChartSimplePDF chart={chart} size={300} />
        </View>

        {/* Summary Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Mapa</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.headerCell}>Ponto</Text>
              <Text style={styles.headerCell}>Signo</Text>
              <Text style={styles.headerCell}>Grau</Text>
              <Text style={styles.headerCell}>Casa</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Ascendente</Text>
              <Text style={styles.tableCell}>{getZodiacSign(chart.ascendant)}</Text>
              <Text style={styles.tableCell}>{formatDegree(chart.ascendant % 30)}</Text>
              <Text style={styles.tableCell}>1</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Meio do Céu</Text>
              <Text style={styles.tableCell}>{getZodiacSign(chart.mc)}</Text>
              <Text style={styles.tableCell}>{formatDegree(chart.mc % 30)}</Text>
              <Text style={styles.tableCell}>10</Text>
            </View>
            {chart.planets.slice(0, 6).map(planet => (
              <View key={planet.name} style={styles.tableRow}>
                <Text style={styles.tableCell}>{translatePlanetName(planet.name)}</Text>
                <Text style={styles.tableCell}>{planet.sign}</Text>
                <Text style={styles.tableCell}>{formatDegree(planet.degree)}</Text>
                <Text style={styles.tableCell}>{planet.house}{planet.retrograde ? ' R' : ''}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.pageNumber}>Página 1 de {totalPages}</Text>
      </Page>

      {/* Page 2: All Planetary Positions */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Posições Planetárias Completas</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.headerCell}>Planeta</Text>
            <Text style={styles.headerCell}>Signo</Text>
            <Text style={styles.headerCell}>Grau</Text>
            <Text style={styles.headerCell}>Casa</Text>
            <Text style={styles.headerCell}>Retrógrado</Text>
          </View>
          {chart.planets.map((planet) => (
            <View key={planet.name} style={styles.tableRow}>
              <Text style={styles.tableCell}>{translatePlanetName(planet.name)}</Text>
              <Text style={styles.tableCell}>{planet.sign}</Text>
              <Text style={styles.tableCell}>{formatDegree(planet.degree)}</Text>
              <Text style={styles.tableCell}>{planet.house}</Text>
              <Text style={styles.tableCell}>{planet.retrograde ? 'Sim' : 'Não'}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Casas Astrológicas (Placidus)</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.headerCell}>Casa</Text>
              <Text style={styles.headerCell}>Signo</Text>
              <Text style={styles.headerCell}>Grau</Text>
            </View>
            {chart.housesPlacidus.map((house) => (
              <View key={house.number} style={styles.tableRow}>
                <Text style={styles.tableCell}>{house.number}</Text>
                <Text style={styles.tableCell}>{house.sign}</Text>
                <Text style={styles.tableCell}>{formatDegree(house.degree)}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.pageNumber}>Página 2</Text>
      </Page>

      {/* Page 3: Aspects */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Aspectos Principais</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.headerCell}>Planeta 1</Text>
            <Text style={styles.headerCell}>Aspecto</Text>
            <Text style={styles.headerCell}>Planeta 2</Text>
            <Text style={styles.headerCell}>Órbita</Text>
            <Text style={styles.headerCell}>Estado</Text>
          </View>
          {chart.aspects.slice(0, 20).map((aspect, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{translatePlanetName(aspect.planet1)}</Text>
              <Text style={styles.tableCell}>{translateAspectType(aspect.type)}</Text>
              <Text style={styles.tableCell}>{translatePlanetName(aspect.planet2)}</Text>
              <Text style={styles.tableCell}>{aspect.orb.toFixed(1)}°</Text>
              <Text style={styles.tableCell}>{aspect.applying ? 'Aplicando' : 'Separando'}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.pageNumber}>Página 3</Text>
      </Page>

      {/* Page 4: AI Report (Natal) */}
      {report && report.sections.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Interpretação Astrológica</Text>
          <Text style={styles.subtitle}>Mapa Natal • Gerado por Inteligência Artificial</Text>

          {report.sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.text}>{section.content}</Text>
            </View>
          ))}

          <Text style={styles.pageNumber}>Página 4</Text>
        </Page>
      )}

      {/* Page 5: Solar Revolution Data */}
      {solarRevolution && solarYear && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Revolução Solar {solarYear}</Text>
          <Text style={styles.subtitle}>
            Data: {solarRevolution.birthData.date} às {solarRevolution.birthData.time}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comparação com Mapa Natal</Text>
            
            <Text style={[styles.text, { marginTop: 10 }]}>
              <Text style={styles.highlight}>Ascendente da Revolução:</Text> {getZodiacSign(solarRevolution.ascendant)} {formatDegree(solarRevolution.ascendant % 30)}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.highlight}>Ascendente Natal:</Text> {getZodiacSign(chart.ascendant)} {formatDegree(chart.ascendant % 30)}
            </Text>
            {getZodiacSign(solarRevolution.ascendant) === getZodiacSign(chart.ascendant) && (
              <Text style={styles.text}>→ Mesmo signo ascendente - ano de grande importância pessoal</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Planetas na Revolução</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.headerCell}>Planeta</Text>
                <Text style={styles.headerCell}>Natal</Text>
                <Text style={styles.headerCell}>RS {solarYear}</Text>
                <Text style={styles.headerCell}>Mudança</Text>
              </View>
              {['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'].map((planetName) => {
                const natalPlanet = chart.planets.find(p => translatePlanetName(p.name) === planetName);
                const srPlanet = solarRevolution.planets.find(p => translatePlanetName(p.name) === planetName);
                if (!natalPlanet || !srPlanet) return null;
                const signChange = natalPlanet.sign !== srPlanet.sign;
                const houseChange = natalPlanet.house !== srPlanet.house;
                return (
                  <View key={planetName} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{planetName}</Text>
                    <Text style={styles.tableCell}>{natalPlanet.sign} ({natalPlanet.house}ª)</Text>
                    <Text style={styles.tableCell}>{srPlanet.sign} ({srPlanet.house}ª)</Text>
                    <Text style={styles.tableCell}>
                      {(signChange || houseChange) ? 'Sim' : 'Não'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tendências do Ano</Text>
            <Text style={styles.text}>
              <Text style={styles.highlight}>Sol na Casa {solarRevolution.planets.find(p => translatePlanetName(p.name) === 'Sol')?.house}:</Text> Área de destaque este ano
            </Text>
            <Text style={styles.text}>
              <Text style={styles.highlight}>Lua em {solarRevolution.planets.find(p => translatePlanetName(p.name) === 'Lua')?.sign}:</Text> Tom emocional predominante
            </Text>
            {solarRevolution.planets.filter(p => p.retrograde).length > 0 && (
              <Text style={styles.text}>
                <Text style={styles.highlight}>Planetas Retrógrados:</Text> {solarRevolution.planets.filter(p => p.retrograde).map(p => translatePlanetName(p.name)).join(', ')}
              </Text>
            )}
          </View>

          <Text style={styles.pageNumber}>Página 5</Text>
        </Page>
      )}

      {/* Page 6: AI Report (Solar Revolution) */}
      {solarReport && solarReport.sections.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Interpretação da Revolução Solar</Text>
          <Text style={styles.subtitle}>
            Ano {solarYear} • Gerado por Inteligência Artificial
          </Text>

          {solarReport.sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.text}>{section.content}</Text>
            </View>
          ))}

          <Text style={styles.pageNumber}>Página 6</Text>
        </Page>
      )}
    </Document>
  );
};

export default function ExportPDF({ chart, report, solarReport, solarRevolution, solarYear }: ExportPDFProps) {
  const fileName = `mapa-astral-${chart.birthData.name.replace(/\s+/g, '-').toLowerCase()}-${chart.birthData.date}.pdf`;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-900/50 border border-purple-500/20 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-purple-200">
            Exportar PDF Completo
          </h3>
        </div>

        <p className="text-sm text-slate-400 mb-4">
          Baixe seu mapa astral completo em formato PDF para consulta offline.
          {report && ' Inclui relatório natal.'}
          {solarReport && ' Inclui relatório solar.'}
        </p>

        <PDFDownloadLink
          document={
            <AstroPDF 
              chart={chart} 
              report={report}
              solarReport={solarReport}
              solarRevolution={solarRevolution} 
              solarYear={solarYear} 
            />
          }
          fileName={fileName}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all"
        >
          {({ loading, error }) =>
            loading ? (
              <>
                <Download className="w-5 h-5 animate-pulse" />
                Gerando PDF...
              </>
            ) : error ? (
              <>
                <span>Erro ao gerar PDF</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Baixar PDF Completo
              </>
            )
          }
        </PDFDownloadLink>
      </div>
    </div>
  );
}

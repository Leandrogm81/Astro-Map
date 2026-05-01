'use client';

import { PDFDownloadLink, Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Download, Loader2 } from 'lucide-react';
import type { NatalChart } from '@/types';
import { calculateGematria } from '@/lib/kabbalah/gematria';
import { mapChartToSephiroth } from '@/lib/kabbalah/sephiroth';

Font.register({
  family: 'DejaVu Sans',
  fonts: [
    { src: '/fonts/DejaVuSans.ttf', fontWeight: 'normal' },
    { src: '/fonts/DejaVuSans-Bold.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: '#ffffff',
    fontFamily: 'DejaVu Sans',
    color: '#0f172a',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1e1b4b',
  },
  subtitle: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 8,
    marginTop: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    fontSize: 9,
    color: '#334155',
  },
  value: {
    fontSize: 9,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e1b4b',
    padding: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    padding: 6,
  },
  tableCell: {
    fontSize: 8,
    color: '#1e293b',
    flex: 1,
  },
});

interface KabbalahPDFProps {
  readonly chart: NatalChart;
}

function KabbalahDocument({ chart }: KabbalahPDFProps) {
  const gematria = calculateGematria(chart.birthData.name, 'latin');
  const mappings = mapChartToSephiroth(chart);

  return (
    <Document title={`AstroMap_Kabbalah_${chart.birthData.name}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>AstroMap · Kabbalah Hermética</Text>
        <Text style={styles.subtitle}>
          Relatório técnico de Gematria e Árvore Sephirótica · {chart.birthData.name}
        </Text>

        <Text style={styles.sectionTitle}>Módulo A · Gematria do Nome</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Nome analisado</Text>
            <Text style={styles.value}>{chart.birthData.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sistema</Text>
            <Text style={styles.value}>Latina (A-Z)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Valor total</Text>
            <Text style={styles.value}>{String(gematria.totalValue)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Redução</Text>
            <Text style={styles.value}>{String(gematria.reducedValue)} · {gematria.sephirah}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Módulo B · Projeções Sephiróticas</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Sephirah</Text>
          <Text style={styles.tableHeaderCell}>Planeta</Text>
          <Text style={styles.tableHeaderCell}>Signo/Grau</Text>
          <Text style={styles.tableHeaderCell}>Anjo</Text>
        </View>
        {mappings.map((mapping) => (
          <View style={styles.tableRow} key={mapping.sephirah.name}>
            <Text style={styles.tableCell}>{mapping.sephirah.name}</Text>
            <Text style={styles.tableCell}>{'planetName' in mapping ? mapping.planetName : 'Ascendente'}</Text>
            <Text style={styles.tableCell}>{mapping.sign} {mapping.degree.toFixed(1)}°</Text>
            <Text style={styles.tableCell}>{mapping.angel.name}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export default function KabbalahPDF({ chart }: KabbalahPDFProps) {
  const canRenderPdfLink = typeof window !== 'undefined' && process.env.NODE_ENV !== 'test';

  if (!canRenderPdfLink) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold uppercase tracking-[0.2em] bg-slate-800 text-slate-500 cursor-wait"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Exportar PDF Kabbalah
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<KabbalahDocument chart={chart} />}
      fileName={`Kabbalah_${chart.birthData.name}.pdf`}
    >
      {({ loading }) => (
        <button
          type="button"
          disabled={loading}
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold uppercase tracking-[0.2em] transition-all ${
            loading
              ? 'bg-slate-800 text-slate-500 cursor-wait'
              : 'border border-gold-500/30 bg-gold-500/10 text-gold-200 hover:bg-gold-500/20'
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {loading ? 'Gerando...' : 'Exportar PDF Kabbalah'}
        </button>
      )}
    </PDFDownloadLink>
  );
}

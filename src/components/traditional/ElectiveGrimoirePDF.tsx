'use client';

import React, { useMemo } from 'react';
import { PDFDownloadLink, Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Download, Loader2 } from 'lucide-react';
import type { NatalChart } from '@/types';
import type { ElectiveVeredict } from '@/lib/traditional/types';
import { translatePlanetNamePt } from '@/lib/traditional/constants';

interface ElectiveGrimoirePDFProps {
  chart: NatalChart;
  skyChart: NatalChart | null;
  veredict: ElectiveVeredict | null;
  protocolText?: string | null;
  intentionLabel: string;
  purposeLabel: string;
  generatedAt?: string;
  disabled?: boolean;
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: '#f5efe3',
    color: '#2c2116',
    fontFamily: 'Times-Roman',
  },
  header: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccb79a',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5b422a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#6d5842',
  },
  section: {
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d8c7b0',
    borderRadius: 8,
    backgroundColor: '#fffaf2',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#5b422a',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
  },
  label: {
    fontSize: 8.5,
    color: '#7a6550',
    width: '42%',
  },
  value: {
    fontSize: 8.5,
    color: '#2c2116',
    width: '58%',
    fontWeight: 'bold',
  },
  bodyText: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: '#3b2d20',
  },
  smallText: {
    fontSize: 8,
    lineHeight: 1.35,
    color: '#4b3a2a',
  },
  pill: {
    fontSize: 8,
    color: '#5b422a',
    backgroundColor: '#efe1cf',
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
});

function formatList(values?: string[] | null): string {
  if (!values || values.length === 0) {
    return 'Dado não fornecido';
  }

  return values.join(', ');
}

function ElectiveGrimoireDocument({
  chart,
  skyChart,
  veredict,
  protocolText,
  intentionLabel,
  purposeLabel,
  generatedAt,
}: Omit<ElectiveGrimoirePDFProps, 'disabled'>) {
  const ritualContext = veredict?.ritualContext;
  const materials = ritualContext?.materials ?? veredict?.ritualCorrespondences ?? null;
  const remedies = veredict?.remedyRecommendations ?? ritualContext?.remedies ?? null;
  const materialSummary = [
    materials?.colors ? `Cores: ${formatList(materials.colors)}` : null,
    materials?.metals ? `Metais: ${formatList(materials.metals)}` : null,
    materials?.incenses ? `Incensos: ${formatList(materials.incenses)}` : null,
  ].filter((item): item is string => item !== null).join(' · ') || 'Dado não fornecido';
  const hourAngel = ritualContext?.hourAngel ?? 'Dado não fornecido';
  const sephirah = ritualContext?.sephirah ?? 'Dado não fornecido';
  const angel = ritualContext?.angel ?? 'Dado não fornecido';
  const olympicSpirit = ritualContext?.olympicSpirit;
  const intelligence = ritualContext?.intelligence;
  const spirit = ritualContext?.spirit;
  const hymn = ritualContext?.orphicHymn;

  return (
    <Document title={`Grimório_Vivo_${chart.birthData.name}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Grimório Vivo · Eletiva Magística</Text>
          <Text style={styles.subtitle}>
            {chart.birthData.name} · {intentionLabel} · Regente {purposeLabel}
          </Text>
          <Text style={styles.subtitle}>
            Gerado em {generatedAt ? new Date(generatedAt).toLocaleString('pt-BR') : 'Dado não fornecido'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veredito Técnico</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Classificação</Text>
            <Text style={styles.value}>{veredict?.score ?? 'Dado não fornecido'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Score bruto</Text>
            <Text style={styles.value}>{veredict?.rawScore ?? 'Dado não fornecido'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Score normalizado</Text>
            <Text style={styles.value}>{veredict?.normalizedScore ?? 'Dado não fornecido'}/100</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Hora planetária</Text>
            <Text style={styles.value}>{veredict ? translatePlanetNamePt(veredict.planetHour.planetId) : 'Dado não fornecido'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mansão lunar</Text>
            <Text style={styles.value}>{veredict ? `${veredict.lunarMansion.number} · ${veredict.lunarMansion.name}` : 'Dado não fornecido'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Regente</Text>
            <Text style={styles.value}>{veredict ? `${translatePlanetNamePt(veredict.rulerCondition.planetId)} · ${veredict.rulerCondition.dignity}` : 'Dado não fornecido'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparação</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Sephirah</Text>
            <Text style={styles.value}>{sephirah}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Materiais</Text>
            <Text style={styles.value}>{materialSummary}</Text>
          </View>
          {remedies ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Pedras</Text>
                <Text style={styles.value}>{formatList(remedies.stones)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Plantas</Text>
                <Text style={styles.value}>{formatList(remedies.plants)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Banhos</Text>
                <Text style={styles.value}>{formatList(remedies.baths)}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invocação</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Anjo</Text>
            <Text style={styles.value}>{angel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Anjo da hora</Text>
            <Text style={styles.value}>{hourAngel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Espírito Olímpico</Text>
            <Text style={styles.value}>{olympicSpirit ? olympicSpirit.name : 'Dado não fornecido'}</Text>
          </View>
          <Text style={styles.smallText}>{olympicSpirit?.description ?? 'Dado não fornecido'}</Text>
          <View style={[styles.row, { marginTop: 6 }]}>
            <Text style={styles.label}>Inteligência</Text>
            <Text style={styles.value}>{intelligence?.name ?? 'Dado não fornecido'}</Text>
          </View>
          {intelligence?.description ? <Text style={styles.smallText}>{intelligence.description}</Text> : null}
          <View style={[styles.row, { marginTop: 6 }]}>
            <Text style={styles.label}>Espírito</Text>
            <Text style={styles.value}>{spirit?.name ?? 'Dado não fornecido'}</Text>
          </View>
          {spirit?.description ? <Text style={styles.smallText}>{spirit.description}</Text> : null}
          <View style={styles.row}>
            <Text style={styles.label}>Hino Órfico</Text>
            <Text style={styles.value}>{hymn ? hymn.title : 'Dado não fornecido'}</Text>
          </View>
          <Text style={styles.smallText}>{hymn?.theme ?? 'Dado não fornecido'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ação Mágica</Text>
          <Text style={styles.bodyText}>
            {protocolText || 'Protocolo ritual não fornecido.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finalização</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Caridade</Text>
            <Text style={styles.value}>{ritualContext?.charity ?? veredict?.ritualCorrespondences?.charity ?? 'Dado não fornecido'}</Text>
          </View>
          <Text style={styles.smallText}>
            {remedies?.disclaimer || 'Estas recomendações são de caráter simbólico e tradicional. Não substituem aconselhamento médico ou terapêutico profissional.'}
          </Text>
          <Text style={[styles.smallText, { marginTop: 6 }]}>
            O documento preserva o mesmo veredito exibido na interface e não adiciona correspondências fora do contexto fornecido pelo AstroMap.
          </Text>
          <View style={[styles.row, { marginTop: 6 }]}>
            <Text style={styles.label}>Local do céu</Text>
            <Text style={styles.value}>{skyChart ? skyChart.birthData.location : 'Dado não fornecido'}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default function ElectiveGrimoirePDF({
  chart,
  skyChart,
  veredict,
  protocolText,
  intentionLabel,
  purposeLabel,
  generatedAt,
  disabled = false,
}: ElectiveGrimoirePDFProps) {
  const canRender = typeof window !== 'undefined' && !disabled && !!skyChart && !!veredict;

  const document = useMemo(() => (
    <ElectiveGrimoireDocument
      chart={chart}
      skyChart={skyChart}
      veredict={veredict}
      protocolText={protocolText}
      intentionLabel={intentionLabel}
      purposeLabel={purposeLabel}
      generatedAt={generatedAt}
    />
  ), [chart, skyChart, veredict, protocolText, intentionLabel, purposeLabel, generatedAt]);

  if (!canRender) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 cursor-not-allowed"
      >
        <Download className="h-3.5 w-3.5" />
        PDF
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={document}
      fileName={`Grimorio_Vivo_${chart.birthData.name}.pdf`}
    >
      {({ loading }) => (
        <button
          type="button"
          disabled={loading}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
            loading
              ? 'cursor-wait border-white/10 bg-white/5 text-slate-500'
              : 'border-amber-400/20 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20'
          }`}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {loading ? 'Gerando' : 'PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}

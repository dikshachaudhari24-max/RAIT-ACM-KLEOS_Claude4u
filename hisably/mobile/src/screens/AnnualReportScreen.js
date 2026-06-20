import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { Screen, Skeleton } from '../components';
import { api, getAuthToken } from '../services/api';
import { formatINR, getFinancialYears, currentFinancialYear } from '../utils/format';

const MISMATCH_LABEL = {
  gstin_mismatch: 'gstin mismatch',
  amount_mismatch: 'amount mismatch',
  missing_invoice: 'missing invoice',
  hsn_mismatch: 'hsn mismatch',
};

const recoveryColor = (rate) => {
  if (rate > 85) return colors.success;
  if (rate >= 75) return colors.warning;
  return colors.danger;
};

const rankColors = ['#C62828', '#EF6C00', '#F9A825', '#90A4AE', '#90A4AE'];

export const AnnualReportScreen = ({ navigation, route }) => {
  const years = getFinancialYears();
  const [fy, setFy] = useState(route.params?.financialYear || currentFinancialYear());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async (year) => {
    setLoading(true);
    setError(false);
    setData(null);
    setSelectedMonth(null);
    try {
      const res = await api.getAnnualReport(year);
      setData(res);
    } catch (e) {
      setData(null);
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(fy); }, [fy, load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = getAuthToken();
      const url = api.getAnnualReportExportUrl(fy);
      const fileName = `Hisably_Annual_ITC_Report_FY${fy}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;
      const result = await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      if (result.status !== 200) throw new Error('Export failed');
      await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf', dialogTitle: 'Share Annual Report' });
    } catch (e) {
      Alert.alert('', 'Could not generate report. Please try again.');
    }
    setExporting(false);
  };

  const yearSelector = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
      {years.map((y) => {
        const active = y === fy;
        return (
          <TouchableOpacity
            key={y}
            style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
            onPress={() => setFy(y)}
            activeOpacity={0.85}
          >
            <Text style={[typography.labelBold, active ? styles.pillTextActive : styles.pillTextInactive]}>
              FY {y}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <Screen
      title="Annual ITC Report"
      subtitle={`FY ${fy}`}
      subtitleMono
      heroHeight={120}
      leftIcon="arrow-back"
      onLeftPress={() => navigation.goBack()}
    >
      {yearSelector}

      {loading ? (
        <LoadingState />
      ) : error || !data ? (
        <EmptyYear fy={fy} onGoReconcile={() => navigation.navigate('Tabs', { screen: 'GSTR2B' })} />
      ) : (
        <>
          <SummaryRow summary={data.summary} />
          <RecoveryLine rate={data.summary.recovery_rate} />
          <MonthlyChart
            fy={fy}
            monthly={data.monthly_data}
            selectedMonth={selectedMonth}
            onSelect={setSelectedMonth}
          />
          <Leaderboard
            suppliers={data.supplier_leaderboard}
            onPress={(s) => navigation.navigate('SupplierDetail', {
              supplierGstin: s.supplier_gstin,
              supplierName: s.supplier_name,
              financialYear: fy,
            })}
          />
          <MonthTable monthly={data.monthly_data} summary={data.summary} />

          <TouchableOpacity
            style={styles.exportBtn}
            onPress={handleExport}
            disabled={exporting}
            activeOpacity={0.85}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={[typography.labelBold, { color: '#fff', marginLeft: 8, fontSize: 16 }]}>
                  Export Annual Report (PDF)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}
    </Screen>
  );
};

// ──────────────── Sub-components ────────────────

const LoadingState = () => (
  <View>
    <View style={styles.summaryRow}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.summaryCard, { paddingVertical: 22 }]}>
          <Skeleton height={20} width="80%" />
          <Skeleton height={10} width="60%" style={{ marginTop: 10 }} />
        </View>
      ))}
    </View>
    <Skeleton height={180} radius={radius.card} style={{ marginTop: 16 }} />
    <Skeleton height={120} radius={radius.card} style={{ marginTop: 16 }} />
  </View>
);

const EmptyYear = ({ fy, onGoReconcile }) => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}>
      <Ionicons name="calendar-outline" size={36} color={colors.primary} />
    </View>
    <Text style={[typography.section, { color: colors.textPrimary, textAlign: 'center' }]}>
      No reconciliation data for FY {fy}
    </Text>
    <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 6 }]}>
      Upload your invoices and GSTR-2B each month to build your annual report automatically.
    </Text>
    <TouchableOpacity style={styles.goReconcileBtn} onPress={onGoReconcile} activeOpacity={0.85}>
      <Text style={[typography.labelBold, { color: '#fff' }]}>Go to Reconciliation</Text>
    </TouchableOpacity>
  </View>
);

const SummaryRow = ({ summary }) => {
  const cards = [
    { label: 'ITC Entitled', value: summary.total_entitled, color: '#455A64' },
    { label: 'ITC Claimed', value: summary.total_claimed, color: colors.primary },
    { label: 'ITC Missed', value: summary.total_missed, color: colors.danger },
  ];
  return (
    <View style={styles.summaryRow}>
      {cards.map((c, i) => (
        <View key={i} style={styles.summaryCard}>
          <Text style={[typography.amount, { color: c.color, fontSize: 18 }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatINR(c.value)}
          </Text>
          <Text style={[typography.monoCaption, { color: colors.textSecondary, marginTop: 6, textAlign: 'center' }]}>
            {c.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const RecoveryLine = ({ rate }) => (
  <View style={styles.recoveryLine}>
    <Text style={[typography.labelBold, { color: colors.textSecondary }]}>Recovery Rate: </Text>
    <Text style={[typography.labelBold, { color: recoveryColor(rate), fontSize: 16 }]}>{rate}%</Text>
  </View>
);

const MonthlyChart = ({ fy, monthly, selectedMonth, onSelect }) => {
  const CHART_H = 140;
  const maxVal = Math.max(
    1,
    ...monthly.filter((m) => m.has_data).flatMap((m) => [m.itc_entitled, m.itc_claimed]),
  );
  const selected = monthly.find((m) => m.month_number === selectedMonth && m.has_data);

  return (
    <View style={styles.card}>
      <Text style={[typography.section, { color: colors.textPrimary }]}>Monthly Breakdown</Text>
      <Text style={[typography.monoCaption, { color: colors.textSecondary, marginTop: 2, marginBottom: 12 }]}>
        FY {fy}
      </Text>

      {selected ? (
        <View style={styles.tooltip}>
          <Text style={[typography.caption, { color: '#fff' }]}>{selected.month} {selected.year}</Text>
          <Text style={[typography.monoCaption, styles.tooltipRow]}>Entitled: {formatINR(selected.itc_entitled)}</Text>
          <Text style={[typography.monoCaption, styles.tooltipRow]}>Claimed: {formatINR(selected.itc_claimed)}</Text>
          <Text style={[typography.monoCaption, styles.tooltipRow]}>Missed: {formatINR(selected.itc_missed)}</Text>
        </View>
      ) : (
        <View style={styles.legendRow}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#90A4AE' }]} /><Text style={styles.legendText}>Entitled</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.primary }]} /><Text style={styles.legendText}>Claimed</Text></View>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScroll}>
        {monthly.map((m) => {
          const isSel = m.month_number === selectedMonth && m.has_data;
          const entH = m.has_data ? Math.max(2, (m.itc_entitled / maxVal) * CHART_H) : 0;
          const claimH = m.has_data ? Math.max(2, (m.itc_claimed / maxVal) * CHART_H) : 0;
          return (
            <TouchableOpacity
              key={`${m.month}-${m.year}`}
              style={[styles.monthCol, isSel && styles.monthColSel]}
              activeOpacity={m.has_data ? 0.7 : 1}
              onPress={() => m.has_data && onSelect(isSel ? null : m.month_number)}
            >
              <View style={[styles.barArea, { height: CHART_H }]}>
                {m.has_data ? (
                  <View style={styles.barPair}>
                    <View style={[styles.bar, { height: entH, backgroundColor: '#90A4AE' }]} />
                    <View style={styles.barGap} />
                    <View style={[styles.bar, { height: claimH, backgroundColor: colors.primary }]} />
                  </View>
                ) : (
                  <Text style={styles.noDataDash}>—</Text>
                )}
              </View>
              <Text style={[styles.monthLabel, isSel && { color: colors.primary }]}>{m.month.slice(0, 3)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const Leaderboard = ({ suppliers, onPress }) => {
  if (!suppliers || suppliers.length === 0) return null;
  return (
    <View style={styles.card}>
      <Text style={[typography.section, { color: colors.textPrimary }]}>Top Mismatch Suppliers</Text>
      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2, marginBottom: 12 }]}>
        Suppliers causing most blocked ITC this year
      </Text>
      {suppliers.map((s, i) => (
        <TouchableOpacity
          key={s.supplier_gstin || s.supplier_name || i}
          style={[styles.lbRow, i < suppliers.length - 1 && styles.lbBorder]}
          onPress={() => onPress(s)}
          activeOpacity={0.7}
        >
          <View style={[styles.rankBadge, { backgroundColor: rankColors[i] || '#90A4AE' }]}>
            <Text style={styles.rankText}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[typography.labelBold, { color: colors.textPrimary }]} numberOfLines={1}>
              {s.supplier_name || 'Unknown Supplier'}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {s.mismatch_count} mismatch{s.mismatch_count === 1 ? '' : 'es'} this year
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[typography.labelBold, { color: colors.danger }]}>{formatINR(s.total_itc_blocked)}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{MISMATCH_LABEL[s.most_common_mismatch_type] || s.most_common_mismatch_type || '—'}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const MonthTable = ({ monthly, summary }) => (
  <View style={styles.card}>
    <Text style={[typography.section, { color: colors.textPrimary, marginBottom: 12 }]}>Month-wise Summary</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={[styles.tr, styles.trHead]}>
          <Text style={[styles.th, styles.colMonth]}>Month</Text>
          <Text style={[styles.th, styles.colNum]}>Invoices</Text>
          <Text style={[styles.th, styles.colAmt]}>Entitled</Text>
          <Text style={[styles.th, styles.colAmt]}>Claimed</Text>
          <Text style={[styles.th, styles.colAmt]}>Missed</Text>
        </View>
        {monthly.map((m, idx) => (
          <View key={`${m.month}-${m.year}`} style={[styles.tr, idx % 2 === 1 && styles.trAlt]}>
            <Text style={[styles.td, styles.colMonth]}>{m.month.slice(0, 3)} {String(m.year).slice(2)}</Text>
            <Text style={[styles.td, styles.colNum]}>{m.has_data ? m.invoices_count : '—'}</Text>
            <Text style={[styles.td, styles.colAmt]}>{m.has_data ? formatINR(m.itc_entitled) : '—'}</Text>
            <Text style={[styles.td, styles.colAmt]}>{m.has_data ? formatINR(m.itc_claimed) : '—'}</Text>
            <Text style={[styles.td, styles.colAmt]}>{m.has_data ? formatINR(m.itc_missed) : '—'}</Text>
          </View>
        ))}
        <View style={[styles.tr, styles.trTotal]}>
          <Text style={[styles.td, styles.colMonth, styles.tdBold]}>Total</Text>
          <Text style={[styles.td, styles.colNum, styles.tdBold]}></Text>
          <Text style={[styles.td, styles.colAmt, styles.tdBold]}>{formatINR(summary.total_entitled)}</Text>
          <Text style={[styles.td, styles.colAmt, styles.tdBold]}>{formatINR(summary.total_claimed)}</Text>
          <Text style={[styles.td, styles.colAmt, styles.tdBold]}>{formatINR(summary.total_missed)}</Text>
        </View>
      </View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  pillRow: { paddingVertical: 4, gap: 10, marginBottom: 8 },
  pill: { paddingHorizontal: 16, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: colors.primary },
  pillInactive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  pillTextActive: { color: '#fff' },
  pillTextInactive: { color: colors.textSecondary },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 10 },
  summaryCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.card, paddingVertical: 18, paddingHorizontal: 8, alignItems: 'center', ...shadow.card },

  recoveryLine: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginTop: 14 },

  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, marginTop: spacing.cardGap, ...shadow.card },

  legendRow: { flexDirection: 'row', gap: 18, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { ...typography.caption, color: colors.textSecondary },

  tooltip: { backgroundColor: colors.primaryDeep, borderRadius: 12, padding: 12, marginBottom: 12 },
  tooltipRow: { color: '#fff', marginTop: 4 },

  chartScroll: { alignItems: 'flex-end', paddingTop: 4 },
  monthCol: { alignItems: 'center', width: 46, paddingVertical: 4, borderRadius: 10 },
  monthColSel: { backgroundColor: colors.primaryLight },
  barArea: { justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(211,47,47,0.06)', borderRadius: 6, width: 34, paddingHorizontal: 2 },
  barPair: { flexDirection: 'row', alignItems: 'flex-end' },
  bar: { width: 11, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  barGap: { width: 4 },
  noDataDash: { ...typography.monoLabel, color: colors.outline, marginBottom: 4 },
  monthLabel: { ...typography.monoCaption, color: colors.textSecondary, marginTop: 6 },

  lbRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  lbBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rankBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rankText: { color: '#fff', fontFamily: typography.labelBold.fontFamily, fontSize: 13 },
  tag: { backgroundColor: colors.neutralBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  tagText: { ...typography.monoCaption, color: colors.textSecondary },

  tr: { flexDirection: 'row', alignItems: 'center' },
  trHead: { borderBottomWidth: 2, borderBottomColor: colors.primary, paddingBottom: 8 },
  trAlt: { backgroundColor: '#F9F9F9' },
  trTotal: { borderTopWidth: 2, borderTopColor: colors.primary, marginTop: 2 },
  th: { ...typography.monoCaption, color: colors.textSecondary, paddingVertical: 8, paddingHorizontal: 6 },
  td: { ...typography.caption, color: colors.textPrimary, paddingVertical: 10, paddingHorizontal: 6 },
  tdBold: { fontFamily: typography.labelBold.fontFamily, color: colors.textPrimary },
  colMonth: { width: 64 },
  colNum: { width: 64, textAlign: 'center' },
  colAmt: { width: 80, textAlign: 'right' },

  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, height: 52, borderRadius: radius.button, marginTop: 24,
  },

  empty: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  goReconcileBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, height: 48, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
});

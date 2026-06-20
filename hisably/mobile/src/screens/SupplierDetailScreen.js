import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { Screen, Skeleton } from '../components';
import { api } from '../services/api';
import { formatINR } from '../utils/format';

const MISMATCH_LABEL = {
  gstin_mismatch: 'gstin mismatch',
  amount_mismatch: 'amount mismatch',
  missing_invoice: 'missing invoice',
  hsn_mismatch: 'hsn mismatch',
};

// Supplier health tiers (mirrors the existing health-scoring feature's bands).
const healthTier = (score) => {
  if (score >= 70) return { label: 'Green', color: colors.success, bg: colors.successLight };
  if (score >= 40) return { label: 'Yellow', color: colors.warning, bg: colors.warningLight };
  return { label: 'Red', color: colors.danger, bg: colors.dangerLight };
};

export const SupplierDetailScreen = ({ navigation, route }) => {
  const { supplierGstin, supplierName, financialYear } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.getSupplierAnnualDetail(supplierGstin, financialYear);
      setData(res);
    } catch (e) {
      setData(null);
      setError(true);
    }
    setLoading(false);
  }, [supplierGstin, financialYear]);

  useEffect(() => { load(); }, [load]);

  const summary = data?.summary;
  const tier = summary ? healthTier(summary.health_score) : null;

  return (
    <Screen
      title={supplierName || data?.supplier_name || 'Supplier'}
      subtitle={`FY ${financialYear}`}
      subtitleMono
      heroHeight={120}
      leftIcon="arrow-back"
      onLeftPress={() => navigation.goBack()}
    >
      {loading ? (
        <View>
          <Skeleton height={90} radius={radius.card} />
          <Skeleton height={140} radius={radius.card} style={{ marginTop: 16 }} />
        </View>
      ) : error || !data ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cube-outline" size={34} color={colors.primary} />
          </View>
          <Text style={[typography.section, { color: colors.textPrimary, textAlign: 'center' }]}>
            No mismatches for this supplier
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 6 }]}>
            This supplier had no blocked ITC in FY {financialYear}.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={[typography.amount, { color: colors.danger, fontSize: 18 }]} numberOfLines={1} adjustsFontSizeToFit>
                {formatINR(summary.total_itc_blocked)}
              </Text>
              <Text style={[typography.monoCaption, styles.summaryLabel]}>ITC Blocked</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[typography.amount, { color: colors.primary, fontSize: 18 }]}>
                {summary.months_with_mismatch}
              </Text>
              <Text style={[typography.monoCaption, styles.summaryLabel]}>Months Affected</Text>
            </View>
          </View>

          <View style={styles.tagCard}>
            <Text style={[typography.monoCaption, { color: colors.textSecondary }]}>Most common issue</Text>
            <Text style={[typography.labelBold, { color: colors.textPrimary, marginTop: 4 }]}>
              {MISMATCH_LABEL[summary.most_common_mismatch_type] || summary.most_common_mismatch_type || '—'}
            </Text>
          </View>

          {tier && (
            <View style={styles.healthRow}>
              <Text style={[typography.section, { color: colors.textPrimary }]}>Supplier Health</Text>
              <View style={[styles.healthBadge, { backgroundColor: tier.bg }]}>
                <View style={[styles.healthDot, { backgroundColor: tier.color }]} />
                <Text style={[typography.labelBold, { color: tier.color }]}>
                  {tier.label} · {summary.health_score}
                </Text>
              </View>
            </View>
          )}

          <Text style={[typography.section, { color: colors.textPrimary, marginTop: spacing.cardGap, marginBottom: 4 }]}>
            Monthly Mismatches
          </Text>
          {data.monthly_mismatches.map((m, i) => (
            <View key={i} style={styles.mmCard}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.labelBold, { color: colors.textPrimary }]}>{m.month} {m.year}</Text>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{MISMATCH_LABEL[m.mismatch_type] || m.mismatch_type}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[typography.labelBold, { color: colors.danger }]}>{formatINR(m.itc_blocked)}</Text>
                {m.invoice_id ? (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('InvoiceDetail', { data: { invoice_id: m.invoice_id } })}
                    activeOpacity={0.7}
                  >
                    <Text style={[typography.caption, { color: colors.primary, marginTop: 4 }]}>View Invoice ›</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ))}
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 10 },
  summaryCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.card, paddingVertical: 18, paddingHorizontal: 8, alignItems: 'center', ...shadow.card },
  summaryLabel: { color: colors.textSecondary, marginTop: 6, textAlign: 'center' },

  tagCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, marginTop: spacing.cardGap, ...shadow.card },

  healthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, marginTop: spacing.cardGap, ...shadow.card },
  healthBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  healthDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },

  mmCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, marginTop: 12, ...shadow.card },
  tag: { alignSelf: 'flex-start', backgroundColor: colors.neutralBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  tagText: { ...typography.monoCaption, color: colors.textSecondary },

  empty: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
});

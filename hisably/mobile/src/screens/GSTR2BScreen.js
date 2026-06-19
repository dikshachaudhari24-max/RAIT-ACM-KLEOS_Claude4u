import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { Screen, PrimaryButton, EmptyState, StatusChip, DonutChart, MiniBars } from '../components';
import { api } from '../services/api';
import { useT } from '../i18n';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const filterKeys = [null, 'gstin_mismatch', 'amount_mismatch', 'missing_invoice'];

export const GSTR2BScreen = () => {
  const [mismatches, setMismatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState(0);
  const t = useT();

  const filterLabels = [t('filter.all'), t('filter.gstinError'), t('filter.valueMismatch'), t('filter.missing')];

  useEffect(() => { loadMismatches(); }, []);

  const loadMismatches = async () => {
    try {
      const data = await api.getMismatches();
      setMismatches(data.mismatches || []);
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'application/vnd.ms-excel'] });
    if (result.canceled) return;
    setUploading(true);
    try {
      await api.uploadGstr2b(result.assets[0].uri, result.assets[0].name);
      await loadMismatches();
      Alert.alert('', t('gstr.uploadSuccess'));
    } catch (e) {
      Alert.alert(t('common.error'), t('gstr.uploadError'));
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <Screen title={t('gstr.title')} titleAlign="left" heroHeight={130} rightIcons={[{ name: 'notifications-outline' }]}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (mismatches.length === 0) {
    return (
      <Screen title={t('gstr.title')} titleAlign="left" heroHeight={130} rightIcons={[{ name: 'notifications-outline' }]}>
        <EmptyState icon="bar-chart-outline" title={t('gstr.uploadPrompt')} />
        <PrimaryButton title={t('gstr.uploadFile')} icon="cloud-upload-outline" onPress={handleUpload} loading={uploading} />
      </Screen>
    );
  }

  const resolved = mismatches.filter((m) => m.resolved).length;
  const missing = mismatches.filter((m) => m.mismatch_type === 'missing_invoice').length;
  const mismatched = mismatches.filter((m) => !m.resolved && m.mismatch_type !== 'missing_invoice').length;
  const total = mismatches.length + resolved;
  const matchPct = total ? Math.round((resolved / total) * 100) : 0;

  const byType = {};
  mismatches.forEach((m) => {
    const k = (m.mismatch_type || 'other').replace(/_/g, ' ');
    byType[k] = (byType[k] || 0) + (m.amount_difference || 0);
  });
  const bars = Object.entries(byType).map(([label, value]) => ({ label, value }));

  const filtered = activeFilter === 0 ? mismatches : mismatches.filter((m) => m.mismatch_type === filterKeys[activeFilter]);

  const counters = [
    { label: t('gstr.totalInvoices'), value: total, color: colors.textPrimary, amount: formatINR(mismatches.reduce((s, m) => s + (m.amount_difference || 0), 0)) },
    { label: t('gstr.matched'), value: resolved, color: colors.success },
    { label: t('gstr.mismatched'), value: mismatched, color: colors.danger },
    { label: t('gstr.missingIn2b'), value: missing, color: colors.warning },
  ];

  return (
    <Screen wordmark subtitle={t('gstr.title')} heroHeight={120}>
      <Text style={[typography.body, { color: colors.textSecondary, marginBottom: 16 }]}>{t('gstr.subtitle')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {filterLabels.map((label, i) => (
          <TouchableOpacity key={i} style={[styles.filterChip, activeFilter === i && styles.filterChipActive]} onPress={() => setActiveFilter(i)}>
            <Text style={[typography.caption, { color: activeFilter === i ? '#fff' : colors.textPrimary }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.counterGrid}>
        {counters.map((c, i) => (
          <View key={i} style={styles.counterCard}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{c.label}</Text>
            <Text style={[typography.display, { color: c.color, marginTop: 2 }]}>{c.value}</Text>
            {c.amount && <Text style={[typography.caption, { color: colors.textSecondary }]}>{c.amount}</Text>}
          </View>
        ))}
      </View>

      <View style={[styles.card, { alignItems: 'center' }]}>
        <Text style={[typography.section, styles.cardTitle]}>{t('gstr.matchStatus')}</Text>
        <DonutChart
          segments={[
            { value: resolved, color: colors.success },
            { value: mismatched, color: colors.danger },
            { value: missing, color: colors.outline },
          ]}
          centerLabel={`${matchPct}%`}
          centerSub={t('gstr.matched')}
        />
      </View>

      {bars.length > 0 && (
        <View style={styles.card}>
          <Text style={[typography.section, styles.cardTitle]}>{t('gstr.blockedByType')}</Text>
          <MiniBars data={bars} color={colors.primary} />
        </View>
      )}

      <Text style={[typography.section, styles.sectionTitle]}>{t('gstr.actionRequired')}</Text>
      {filtered.map((m, i) => (
        <View key={i} style={styles.mismatchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.labelBold, { color: colors.textPrimary }]} numberOfLines={1}>{m.supplier_name || t('common.unknown')}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{formatINR(m.amount_difference)}</Text>
          </View>
          <StatusChip label={(m.mismatch_type || '').replace(/_/g, ' ')} tone={m.mismatch_type === 'missing_invoice' ? 'warning' : 'danger'} />
        </View>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, height: 36, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.surface, marginRight: 8, borderWidth: 1, borderColor: colors.outlineVariant },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  counterGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  counterCard: { width: '48%', backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, marginBottom: spacing.cardGap, ...shadow.card },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, marginBottom: spacing.cardGap, ...shadow.card },
  cardTitle: { color: colors.textPrimary, marginBottom: 12, alignSelf: 'flex-start' },
  sectionTitle: { color: colors.textPrimary, marginTop: spacing.sectionGap - 12, marginBottom: spacing.sectionHeaderGap },
  mismatchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    paddingVertical: spacing.rowPaddingV, paddingHorizontal: spacing.rowPaddingH,
    borderRadius: radius.card, marginBottom: 12, ...shadow.card,
  },
});

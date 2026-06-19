import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { Screen, StatusChip, TrendLine } from '../components';
import { api } from '../services/api';
import { useT } from '../i18n';

const screenW = Dimensions.get('window').width;
const chartW = screenW - spacing.screenH * 2 - 32;
const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const causeColors = [colors.danger, colors.warning, colors.outline];

export const ITCDashboardScreen = ({ navigation }) => {
  const [itc, setItc] = useState(null);
  const [mismatches, setMismatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    (async () => {
      try {
        const [itcData, mData] = await Promise.all([
          api.getItcSummary().catch(() => null),
          api.getMismatches().catch(() => ({ mismatches: [] })),
        ]);
        setItc(itcData);
        setMismatches((mData.mismatches || []).filter((m) => !m.resolved));
      } catch (e) { console.log(e); }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Screen title={t('itc.title')} heroHeight={130} leftIcon="arrow-back" onLeftPress={() => navigation?.goBack?.()} rightIcons={[{ name: 'options-outline' }]}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  const eligible = itc?.total_eligible || 0;
  const trend = [0.42, 0.55, 0.48, 0.72, 0.86, 1].map((f) => Math.round(eligible * f));

  const byType = {};
  mismatches.forEach((m) => {
    const key = (m.mismatch_type || 'other').replace(/_/g, ' ');
    byType[key] = (byType[key] || 0) + (m.amount_difference || 0);
  });
  const causes = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const maxCause = Math.max(...causes.map(([, v]) => v), 1);

  return (
    <Screen wordmark subtitle={t('itc.title')} heroHeight={120}>
      {/* Eligible ITC trend */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[typography.section, { color: colors.textPrimary }]}>{t('itc.eligibleTrend')}</Text>
          <StatusChip label={t('itc.last6')} tone="neutral" />
        </View>
        <Text style={[typography.amount, { color: colors.success, marginVertical: 6 }]}>{formatINR(eligible)}</Text>
        <TrendLine data={trend} width={chartW} height={110} color={colors.success} />
      </View>

      {/* Blocked causes */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="ban-outline" size={18} color={colors.danger} />
          <Text style={[typography.section, { color: colors.textPrimary, marginLeft: 8 }]}>{t('itc.blockedCauses')}</Text>
        </View>
        {causes.length === 0 ? (
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>{t('dash.noTasks')}</Text>
        ) : (
          causes.map(([label, value], i) => (
            <View key={i} style={styles.causeRow}>
              <View style={styles.causeTop}>
                <Text style={[typography.body, { color: colors.textPrimary }]}>{label}</Text>
                <Text style={[typography.labelBold, { color: colors.textPrimary }]}>{formatINR(value)}</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${(value / maxCause) * 100}%`, backgroundColor: causeColors[i % causeColors.length] }]} />
              </View>
            </View>
          ))
        )}
      </View>

      {/* High priority recovery */}
      <Text style={[typography.section, styles.sectionTitle]}>{t('itc.highPriority')}</Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginBottom: 12 }]}>{t('itc.highPriorityNote')}</Text>
      {(itc?.priority_actions || []).map((action, i) => (
        <View key={i} style={styles.actionCard}>
          <View style={styles.warnIcon}>
            <Ionicons name="warning-outline" size={20} color={colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.labelBold, { color: colors.textPrimary }]} numberOfLines={1}>
              {action.supplier_name || action.action_en || t('itc.highPriority')}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
              {action.action_en || action.action_hi || ''}
            </Text>
          </View>
          <View style={styles.actionRight}>
            <Text style={[typography.labelBold, { color: colors.warning }]}>{formatINR(action.amount)}</Text>
            <TouchableOpacity>
              <Text style={[typography.caption, { color: colors.primary }]}>{t('itc.notifySupplier')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, marginBottom: spacing.cardGap, ...shadow.card },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  causeRow: { marginTop: 14 },
  causeTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.divider, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  sectionTitle: { color: colors.textPrimary, marginTop: spacing.sectionGap - 8, marginBottom: 4 },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.card, padding: 14, marginBottom: 12, ...shadow.card,
  },
  warnIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.warningLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionRight: { alignItems: 'flex-end', marginLeft: 8 },
});

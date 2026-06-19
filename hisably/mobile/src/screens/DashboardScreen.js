import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { Screen, ITCAmountCard, RiskScoreChip, AlertRow } from '../components';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n';

const screenW = Dimensions.get('window').width;
const cardW = screenW * 0.66;
const monthLabel = () => new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

export const DashboardScreen = ({ navigation }) => {
  const [itc, setItc] = useState(null);
  const [risk, setRisk] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const t = useT();

  const firstName = (user?.name || user?.email?.split('@')[0] || 'there');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const timeout = (p, ms = 8000) =>
      Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
    const [itcData, riskData, taskData] = await Promise.all([
      timeout(api.getItcSummary()).catch(() => ({ total_eligible: 0, total_recoverable: 0, total_blocked: 0 })),
      timeout(api.getRiskScore()).catch(() => ({ score: 0 })),
      timeout(api.getTasks()).catch(() => ({ tasks: [] })),
    ]);
    setItc(itcData);
    setRisk(riskData);
    setTasks((taskData?.tasks || []).filter((x) => x.status !== 'completed').slice(0, 3));
    setLoading(false);
  };

  const eligible = itc?.total_eligible || 0;
  const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const heroExtra = (
    <View style={styles.heroBlock}>
      <View style={styles.greetRow}>
        <Text style={[typography.heroTitle, styles.greeting]}>{t('dash.greeting', { name: firstName })}</Text>
        {risk && <RiskScoreChip score={risk.score} />}
      </View>
      <Text style={[typography.caption, styles.statusLine]}>{t('dash.itcStatus', { month: monthLabel() })}</Text>
      <View style={styles.amountRow}>
        <Text style={[typography.amountLg, styles.amount]}>{formatINR(eligible)}</Text>
        <Text style={[typography.caption, styles.amountSub]}>{t('itc.eligible')}</Text>
      </View>
    </View>
  );

  return (
    <Screen
      title="Dashboard"
      heroHeight={236}
      leftIcon="notifications-outline"
      avatar={(firstName[0] || 'U').toUpperCase() + (firstName[1] || '').toUpperCase()}
      onAvatarPress={() => navigation.navigate('Profile')}
      heroExtra={heroExtra}
    >
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itcScroll}
            style={styles.itcRow}
          >
            <ITCAmountCard
              amount={itc?.total_eligible || 0}
              label={t('itc.eligible')}
              sublabel={t('dash.readyToClaim')}
              type="eligible"
              style={{ width: cardW, marginRight: 12 }}
              onPress={() => navigation.navigate('ITCDashboard')}
            />
            <ITCAmountCard
              amount={itc?.total_recoverable || 0}
              label={t('itc.recoverable')}
              sublabel={t('itc.pendingAction')}
              type="recoverable"
              style={{ width: cardW, marginRight: 12 }}
              onPress={() => navigation.navigate('ITCDashboard')}
            />
            <ITCAmountCard
              amount={itc?.total_blocked || 0}
              label={t('itc.blocked')}
              sublabel={t('itc.disputed')}
              type="blocked"
              style={{ width: cardW }}
              onPress={() => navigation.navigate('ITCDashboard')}
            />
          </ScrollView>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={[typography.section, { color: colors.textPrimary }]}>{t('dash.openTasks')}</Text>
              {tasks.length > 0 && (
                <View style={styles.countBadge}><Text style={styles.countText}>{tasks.length}</Text></View>
              )}
            </View>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Tasks')}>
              <Text style={[typography.labelBold, { color: colors.primary }]}>{t('common.viewAll')}</Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <Text style={[typography.body, styles.muted]}>{t('dash.noTasks')}</Text>
          ) : (
            tasks.map((task, i) => (
              <TouchableOpacity
                key={i}
                style={styles.taskRow}
                onPress={() => navigation.getParent()?.navigate('Tasks')}
                activeOpacity={0.85}
              >
                <View style={[styles.taskDot, { backgroundColor: i === 0 ? colors.danger : colors.warning }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.labelBold, { color: colors.textPrimary }]}>
                    {(task.task_type || 'Task').replace(/_/g, ' ')}
                  </Text>
                  <Text style={[typography.monoCaption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {task.supplier_name || t('common.general')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.outline} />
              </TouchableOpacity>
            ))
          )}

          <Text style={[typography.section, styles.sectionTitle]}>{t('dash.recentAlerts')}</Text>
          <AlertRow type="success" title={t('dash.connected')} subtitle={t('common.now')} />
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  heroBlock: { marginTop: 14 },
  greetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#fff', flex: 1 },
  statusLine: { color: 'rgba(255,255,255,0.78)', marginTop: 14 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  amount: { color: '#fff' },
  amountSub: { color: 'rgba(255,255,255,0.7)', marginLeft: 10 },
  itcRow: { marginHorizontal: -spacing.screenH, marginTop: 4 },
  itcScroll: { paddingHorizontal: spacing.screenH, paddingVertical: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sectionGap - 4, marginBottom: spacing.sectionHeaderGap },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  countBadge: { backgroundColor: colors.danger, minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 8, paddingHorizontal: 5 },
  countText: { color: '#fff', fontSize: 11, fontFamily: typography.labelBold.fontFamily },
  sectionTitle: { color: colors.textPrimary, marginTop: spacing.sectionGap - 6, marginBottom: spacing.sectionHeaderGap },
  muted: { color: colors.textSecondary, paddingVertical: 8 },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    paddingVertical: spacing.rowPaddingV + 2, paddingHorizontal: spacing.rowPaddingH,
    borderRadius: radius.card, marginBottom: 12, ...shadow.card,
  },
  taskDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.iconTextGap },
});

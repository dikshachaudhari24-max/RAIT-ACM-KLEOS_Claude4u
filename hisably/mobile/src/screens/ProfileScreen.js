import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { ComplianceCalendar } from '../components';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n';

const formatINR = (n) => {
  const v = Number(n || 0);
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

export const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const t = useT();
  const [stats, setStats] = useState({ invoices: 0, itc: 0, tasks: 0 });

  const name = user?.name || 'Rajesh Kumar';
  const phone = user?.phone || '+91 98765 43210';

  useEffect(() => {
    (async () => {
      const [inv, itc, tasks] = await Promise.all([
        api.getInvoices(1, 1).catch(() => ({ total: 0 })),
        api.getItcSummary().catch(() => ({ total_eligible: 0 })),
        api.getTasks().catch(() => ({ tasks: [] })),
      ]);
      setStats({
        invoices: inv?.total || 0,
        itc: itc?.total_eligible || 0,
        tasks: (tasks?.tasks || []).filter((x) => x.status !== 'completed').length,
      });
    })();
  }, []);

  const menu = [
    { icon: 'settings-outline', key: 'profile.accountSettings' },
    { icon: 'notifications-outline', key: 'profile.notifications' },
    { icon: 'shield-checkmark-outline', key: 'profile.security' },
    { icon: 'help-circle-outline', key: 'profile.help' },
  ];

  return (
    <View style={styles.root}>
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <View style={styles.heroTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={hit}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[typography.wordmark, { color: '#fff' }]}>Hisably</Text>
          <TouchableOpacity style={styles.editBtn} hitSlop={hit}>
            <Ionicons name="pencil" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.avatarBig}>
          <Ionicons name="person" size={42} color={colors.primaryDeep} />
        </View>
        <Text style={[typography.title, { color: '#fff', marginTop: 12 }]}>{name}</Text>
        <Text style={[typography.monoCaption, { color: 'rgba(255,255,255,0.8)', marginTop: 2 }]}>{phone}</Text>
      </View>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
              <Ionicons name="receipt-outline" size={18} color={colors.success} />
            </View>
            <Text style={[typography.monoCaption, styles.statLabel]}>{t('profile.totalInvoices')}</Text>
            <Text style={[typography.amount, { color: colors.textPrimary }]}>{stats.invoices.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.neutralBg }]}>
              <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[typography.monoCaption, styles.statLabel]}>{t('profile.itcClaimed')}</Text>
            <Text style={[typography.amount, { color: colors.textPrimary }]}>{formatINR(stats.itc)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.pendingCard} onPress={() => navigation.navigate('Tabs', { screen: 'Tasks' })} activeOpacity={0.85}>
          <View style={[styles.statIcon, { backgroundColor: colors.dangerLight }]}>
            <Ionicons name="alarm-outline" size={18} color={colors.danger} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[typography.monoCaption, { color: colors.textSecondary }]}>{t('profile.pendingTasks')}</Text>
            <Text style={[typography.labelBold, { color: colors.textPrimary, marginTop: 2 }]}>
              {t('profile.actionsRequired', { n: stats.tasks })}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.outline} />
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.calHeader}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[typography.section, { color: colors.textPrimary, marginLeft: 8 }]}>{t('profile.complianceCalendar')}</Text>
          </View>
          <View style={styles.alertBanner}>
            <Ionicons name="warning-outline" size={18} color={colors.warning} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[typography.labelBold, { color: colors.warning }]}>{t('profile.gstr1Due')}</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>{t('profile.gstr1DueNote')}</Text>
            </View>
          </View>
          <ComplianceCalendar />
        </View>

        <View style={styles.card}>
          {menu.map((m, i) => (
            <TouchableOpacity key={i} style={[styles.menuRow, i < menu.length - 1 && styles.menuBorder]} activeOpacity={0.7}>
              <View style={styles.menuIcon}><Ionicons name={m.icon} size={20} color={colors.textPrimary} /></View>
              <Text style={[typography.bodyMd, { flex: 1, color: colors.textPrimary }]}>{t(m.key)}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.outline} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.menuRow, styles.logoutRow]} onPress={logout} activeOpacity={0.7}>
            <View style={styles.menuIcon}><Ionicons name="log-out-outline" size={20} color={colors.danger} /></View>
            <Text style={[typography.bodyMd, { flex: 1, color: colors.danger }]}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const hit = { top: 10, bottom: 10, left: 10, right: 10 };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  hero: { paddingHorizontal: spacing.screenH, paddingBottom: 36, alignItems: 'center' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch' },
  editBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  avatarBig: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  sheet: { flex: 1, backgroundColor: colors.bg, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, marginTop: -20 },
  scroll: { paddingHorizontal: spacing.screenH, paddingTop: 24, paddingBottom: 40 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, ...shadow.card },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statLabel: { color: colors.textSecondary, marginBottom: 4 },
  pendingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, marginTop: spacing.cardGap, ...shadow.card },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, marginTop: spacing.cardGap, ...shadow.card },
  calHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  alertBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.warningLight, borderRadius: radius.card, padding: 12, marginBottom: 18, borderLeftWidth: 3, borderLeftColor: colors.warning },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.neutralBg, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  logoutRow: { borderTopWidth: 1, borderTopColor: colors.divider, marginTop: 4 },
});

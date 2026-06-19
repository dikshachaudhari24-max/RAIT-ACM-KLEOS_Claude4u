import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { Screen, SupplierBadge, EmptyState } from '../components';
import { api } from '../services/api';
import { useT } from '../i18n';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const SupplierScreen = ({ navigation }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getSuppliers();
        setSuppliers(data.suppliers || []);
      } catch (e) { console.log(e); }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Screen title={t('supplier.title')} heroHeight={130} leftIcon="arrow-back" onLeftPress={() => navigation?.goBack?.()}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (suppliers.length === 0) {
    return (
      <Screen title={t('supplier.title')} heroHeight={130} leftIcon="arrow-back" onLeftPress={() => navigation?.goBack?.()}>
        <EmptyState icon="storefront-outline" title={t('supplier.empty')} subtitle={t('supplier.emptySub')} />
      </Screen>
    );
  }

  const stats = [
    { key: 'supplier.score', field: 'reliability_score', color: colors.textPrimary },
    { key: 'supplier.invoices', field: 'invoice_count', color: colors.textPrimary },
    { key: 'supplier.errors', field: 'error_count', color: colors.danger },
  ];

  return (
    <Screen wordmark subtitle={t('supplier.title')} heroHeight={120}>
      {suppliers.map((s, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[typography.labelBold, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>{s.name}</Text>
            <SupplierBadge tier={s.reliability_tier} />
          </View>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>GSTIN: {s.gstin}</Text>

          <View style={styles.statsRow}>
            {stats.map((st, k) => (
              <View key={k} style={styles.stat}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{t(st.key)}</Text>
                <Text style={[typography.labelBold, { color: st.color, marginTop: 2 }]}>{s[st.field]}</Text>
              </View>
            ))}
            <View style={styles.stat}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('supplier.blocked')}</Text>
              <Text style={[typography.labelBold, { color: colors.danger, marginTop: 2 }]}>{formatINR(s.total_itc_blocked)}</Text>
            </View>
          </View>

          {s.suggested_action ? (
            <Text style={[typography.caption, { color: colors.primary, marginTop: 10 }]}>{s.suggested_action}</Text>
          ) : null}
        </View>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, marginBottom: 12, ...shadow.card },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  stat: { alignItems: 'center', flex: 1 },
});

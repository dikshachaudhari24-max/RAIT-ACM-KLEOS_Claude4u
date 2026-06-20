import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { api } from '../services/api';

const formatINR = (n) => `Rs.${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const RiskBadge = ({ score, color }) => {
  const bg = color === 'green' ? colors.successLight : color === 'yellow' ? colors.warningLight : colors.dangerLight;
  const fg = color === 'green' ? colors.success : color === 'yellow' ? colors.warning : colors.danger;
  return (
    <View style={[styles.riskBadge, { backgroundColor: bg }]}>
      <Text style={[typography.labelBold, { color: fg, fontSize: 13 }]}>{score}/100 {color.toUpperCase()}</Text>
    </View>
  );
};

const StatCard = ({ icon, label, value, color: c }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={22} color={c || colors.primary} />
    <Text style={[typography.monoCaption, { color: colors.textSecondary, marginTop: 4 }]}>{label}</Text>
    <Text style={[typography.labelBold, { color: colors.textPrimary, fontSize: 16, marginTop: 2 }]}>{value}</Text>
  </View>
);

const ActionItem = ({ item }) => {
  const priorityColor = {
    critical: colors.danger,
    high: colors.warning,
    medium: colors.primary,
    low: colors.textSecondary,
  }[item.priority] || colors.textSecondary;

  return (
    <View style={styles.actionRow}>
      <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { color: colors.textPrimary }]}>{item.action}</Text>
        <Text style={[typography.monoCaption, { color: colors.textSecondary, marginTop: 2 }]}>
          ITC Impact: {formatINR(item.itc_impact)} | {item.deadline_suggestion?.replace(/_/g, ' ')}
        </Text>
      </View>
    </View>
  );
};

const SupplierCard = ({ supplier }) => {
  const scoreColor = supplier.color_status === 'green' ? colors.success
    : supplier.color_status === 'yellow' ? colors.warning : colors.danger;

  return (
    <View style={styles.supplierCard}>
      <View style={styles.supplierHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.labelBold, { color: colors.textPrimary }]} numberOfLines={1}>
            {supplier.supplier_name}
          </Text>
          <Text style={[typography.monoCaption, { color: colors.textSecondary }]}>
            {supplier.supplier_gstin}
          </Text>
        </View>
        <View style={[styles.scorePill, { backgroundColor: scoreColor + '20' }]}>
          <Text style={[typography.labelBold, { color: scoreColor, fontSize: 12 }]}>
            {supplier.reliability_score}%
          </Text>
        </View>
      </View>
      <View style={styles.supplierStats}>
        <Text style={[typography.monoCaption, { color: colors.textSecondary }]}>
          {supplier.total_invoices} invoices | {formatINR(supplier.total_value)}
        </Text>
        {supplier.issues_count > 0 && (
          <Text style={[typography.monoCaption, { color: colors.danger }]}>
            {supplier.issues_count} issues | ITC at risk: {formatINR(supplier.itc_at_risk)}
          </Text>
        )}
      </View>
    </View>
  );
};

export const CADashboardScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadDashboard = useCallback(async () => {
    try {
      const result = await api.getCaDashboard();
      setData(result);
    } catch (e) {
      console.log('CA Dashboard error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const onRefresh = () => { setRefreshing(true); loadDashboard(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 12 }]}>Loading CA Dashboard...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 12 }]}>Unable to load dashboard</Text>
        <TouchableOpacity onPress={loadDashboard} style={styles.retryBtn}>
          <Text style={[typography.labelBold, { color: colors.primary }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const es = data.executive_summary || {};
  const cs = es.compliance_status || {};
  const fs = es.financial_snapshot || {};
  const km = es.key_metrics || {};
  const fr = data.filing_readiness || {};
  const ra = data.risk_assessment || {};
  const actions = data.ca_action_items || [];
  const suppliers = data.supplier_scorecards || [];
  const rec = data.ca_recommendations || {};
  const recon = data.gstr2b_reconciliation || {};

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'grid-outline' },
    { key: 'suppliers', label: 'Suppliers', icon: 'people-outline' },
    { key: 'actions', label: 'Actions', icon: 'checkmark-circle-outline' },
    { key: 'filing', label: 'Filing', icon: 'document-text-outline' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textOnHero} />
        </TouchableOpacity>
        <Text style={[typography.title, { color: colors.textOnHero, flex: 1, marginLeft: 12 }]}>CA Dashboard</Text>
        <RiskBadge score={cs.overall_risk_score || 0} color={cs.color || 'green'} />
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons name={tab.icon} size={18} color={activeTab === tab.key ? colors.primary : colors.textSecondary} />
            <Text style={[typography.monoCaption, { color: activeTab === tab.key ? colors.primary : colors.textSecondary, marginLeft: 4 }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {activeTab === 'overview' && (
          <>
            <View style={styles.statGrid}>
              <StatCard icon="receipt-outline" label="Invoices" value={fs.invoice_count || 0} />
              <StatCard icon="cash-outline" label="Total Amount" value={formatINR(fs.total_invoice_amount)} />
              <StatCard icon="checkmark-circle-outline" label="Eligible ITC" value={formatINR(fs.total_eligible_itc)} color={colors.success} />
              <StatCard icon="close-circle-outline" label="Blocked ITC" value={formatINR(fs.total_blocked_itc)} color={colors.danger} />
              <StatCard icon="people-outline" label="Suppliers" value={fs.supplier_count || 0} />
              <StatCard icon="trending-up-outline" label="Quality" value={`${km.data_quality_score || 0}%`} />
            </View>

            <View style={styles.card}>
              <Text style={[typography.section, { color: colors.textPrimary, marginBottom: 10 }]}>GSTR-2B Reconciliation</Text>
              <View style={styles.reconRow}>
                <View style={[styles.reconItem, { backgroundColor: colors.successLight }]}>
                  <Text style={[typography.labelBold, { color: colors.success, fontSize: 20 }]}>{recon.matched || 0}</Text>
                  <Text style={[typography.monoCaption, { color: colors.success }]}>Matched</Text>
                </View>
                <View style={[styles.reconItem, { backgroundColor: colors.warningLight }]}>
                  <Text style={[typography.labelBold, { color: colors.warning, fontSize: 20 }]}>{recon.mismatched || 0}</Text>
                  <Text style={[typography.monoCaption, { color: colors.warning }]}>Mismatched</Text>
                </View>
                <View style={[styles.reconItem, { backgroundColor: colors.dangerLight }]}>
                  <Text style={[typography.labelBold, { color: colors.danger, fontSize: 20 }]}>{recon.missing || 0}</Text>
                  <Text style={[typography.monoCaption, { color: colors.danger }]}>Missing</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={[typography.section, { color: colors.textPrimary, marginBottom: 10 }]}>Risk Assessment</Text>
              <View style={styles.riskRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>Compliance</Text>
                <Text style={[typography.labelBold, { color: ra.compliance_status === 'compliant' ? colors.success : colors.warning }]}>
                  {(ra.compliance_status || 'N/A').toUpperCase()}
                </Text>
              </View>
              <View style={styles.riskRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>Fraud Risk</Text>
                <Text style={[typography.labelBold, { color: colors.success }]}>
                  {(ra.fraud_risk_level || 'N/A').replace(/_/g, ' ').toUpperCase()}
                </Text>
              </View>
              <View style={styles.riskRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>Mismatches</Text>
                <Text style={[typography.labelBold, { color: ra.total_mismatches > 0 ? colors.warning : colors.success }]}>
                  {ra.total_mismatches || 0}
                </Text>
              </View>
            </View>

            {rec.filing_strategy && (
              <View style={styles.card}>
                <Text style={[typography.section, { color: colors.textPrimary, marginBottom: 8 }]}>CA Recommendations</Text>
                <Text style={[typography.body, { color: colors.textSecondary, marginBottom: 6 }]}>{rec.filing_strategy}</Text>
                <Text style={[typography.body, { color: colors.textSecondary, marginBottom: 6 }]}>{rec.supplier_engagement}</Text>
                <Text style={[typography.body, { color: colors.textSecondary }]}>{rec.data_quality_improvements}</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'suppliers' && (
          <>
            <Text style={[typography.section, { color: colors.textPrimary, marginBottom: 12 }]}>
              Supplier Scorecards ({suppliers.length})
            </Text>
            {suppliers.length === 0 ? (
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 40 }]}>
                No suppliers found. Upload invoices to see supplier analysis.
              </Text>
            ) : (
              suppliers.map((s, i) => <SupplierCard key={i} supplier={s} />)
            )}
          </>
        )}

        {activeTab === 'actions' && (
          <>
            <Text style={[typography.section, { color: colors.textPrimary, marginBottom: 12 }]}>
              Action Items ({actions.length})
            </Text>
            {actions.length === 0 ? (
              <View style={styles.emptyActions}>
                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                <Text style={[typography.body, { color: colors.success, marginTop: 8 }]}>All clear! No action items.</Text>
              </View>
            ) : (
              actions.map((a, i) => <ActionItem key={i} item={a} />)
            )}
          </>
        )}

        {activeTab === 'filing' && (
          <>
            <View style={styles.card}>
              <Text style={[typography.section, { color: colors.textPrimary, marginBottom: 12 }]}>Filing Readiness</Text>
              <View style={styles.readinessBar}>
                <View style={[styles.readinessFill, { width: `${fr.readiness_percent || 0}%` }]} />
              </View>
              <Text style={[typography.labelBold, { color: colors.primary, textAlign: 'center', marginTop: 6 }]}>
                {fr.readiness_percent || 0}% Ready
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.filingRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>Processed</Text>
                <Text style={[typography.labelBold, { color: colors.textPrimary }]}>{fr.total_invoices_processed || 0}</Text>
              </View>
              <View style={styles.filingRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>Validated</Text>
                <Text style={[typography.labelBold, { color: colors.success }]}>{fr.invoices_validated || 0}</Text>
              </View>
              <View style={styles.filingRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>With Issues</Text>
                <Text style={[typography.labelBold, { color: colors.danger }]}>{fr.invoices_with_issues || 0}</Text>
              </View>
              <View style={[styles.filingRow, { borderBottomWidth: 0 }]}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>Net Claimable ITC</Text>
                <Text style={[typography.labelBold, { color: colors.primary, fontSize: 16 }]}>{formatINR(fr.net_claimable_itc)}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={[typography.section, { color: colors.textPrimary, marginBottom: 8 }]}>Filing Strategy</Text>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                {rec.filing_strategy || 'Upload invoices and GSTR-2B data to get filing recommendations.'}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary,
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10,
  },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  body: { flex: 1, padding: 16 },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statCard: {
    width: '48%', backgroundColor: colors.surface, borderRadius: radius.card,
    padding: 14, marginBottom: 10, ...shadow.card, alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.card,
    padding: 16, marginBottom: 16, ...shadow.card,
  },
  reconRow: { flexDirection: 'row', justifyContent: 'space-between' },
  reconItem: { flex: 1, borderRadius: 8, padding: 12, marginHorizontal: 4, alignItems: 'center' },
  riskRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.surface,
    borderRadius: radius.card, padding: 14, marginBottom: 10, ...shadow.card,
  },
  priorityDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5, marginRight: 12 },
  supplierCard: {
    backgroundColor: colors.surface, borderRadius: radius.card,
    padding: 14, marginBottom: 10, ...shadow.card,
  },
  supplierHeader: { flexDirection: 'row', alignItems: 'center' },
  scorePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  supplierStats: { marginTop: 8 },
  emptyActions: { alignItems: 'center', marginTop: 40 },
  retryBtn: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 20 },
  readinessBar: { height: 12, backgroundColor: colors.neutralBg, borderRadius: 6, overflow: 'hidden' },
  readinessFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 6 },
  filingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
});

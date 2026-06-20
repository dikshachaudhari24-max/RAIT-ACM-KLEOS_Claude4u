import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { Screen } from '../components';
import { SupplierMessageSheet } from '../components/SupplierMessageSheet';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

const ValidationCard = ({ passed, title, detail, timestamp, children }) => (
  <View style={[styles.card, !passed && styles.cardFailed]}>
    <View style={[styles.iconCircle, { backgroundColor: passed ? colors.successLight : colors.dangerLight }]}>
      <Ionicons name={passed ? 'checkmark-circle' : 'alert-circle'} size={24} color={passed ? colors.success : colors.danger} />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDetail}>{detail}</Text>
    {timestamp && (
      <View style={styles.timestampRow}>
        <View style={[styles.timestampDot, { backgroundColor: passed ? colors.success : colors.danger }]} />
        <Text style={styles.timestampText}>Checked just now</Text>
      </View>
    )}
    {children}
  </View>
);

export const InvoiceValidationScreen = ({ navigation, route }) => {
  const invoice = route.params?.invoice || {};
  const mismatches = route.params?.mismatches || [];
  const { user } = useAuthStore();
  const [generating, setGenerating] = useState(null);
  const [sheetMessage, setSheetMessage] = useState(null);

  const gstinValid = !mismatches.some((m) => m.mismatch_type === 'gstin_mismatch');
  const amountMatch = !mismatches.some((m) => m.mismatch_type === 'amount_mismatch');
  const notMissing = !mismatches.some((m) => m.mismatch_type === 'missing_invoice');
  const noAnomaly = (parseFloat(invoice.anomaly_score) || 0) < 0.5;

  const checks = [
    {
      key: 'math',
      passed: amountMatch,
      title: 'Mathematical Accuracy',
      detail: amountMatch
        ? 'Line items total matches invoice total.'
        : `Amount mismatch: Books ₹${Number(invoice.taxable_value || 0).toLocaleString('en-IN')} vs 2B ₹${Number(mismatches.find((m) => m.mismatch_type === 'amount_mismatch')?.gstr2b_amount || 0).toLocaleString('en-IN')}`,
      mismatch: mismatches.find((m) => m.mismatch_type === 'amount_mismatch'),
    },
    {
      key: 'gstin',
      passed: gstinValid,
      title: 'GSTIN Verification',
      detail: gstinValid
        ? 'Supplier GSTIN is valid and active.'
        : `Supplier GSTIN (${invoice.supplier_gstin}) is invalid or inactive according to current portal records.`,
      mismatch: mismatches.find((m) => m.mismatch_type === 'gstin_mismatch'),
    },
    {
      key: 'dup',
      passed: notMissing,
      title: 'Duplicate Check',
      detail: notMissing
        ? 'No previous invoice recorded with this number for this supplier.'
        : 'Invoice not found in GSTR-2B records.',
      mismatch: mismatches.find((m) => m.mismatch_type === 'missing_invoice'),
    },
  ];

  const handleNotify = async (check) => {
    const m = check.mismatch || {};
    setGenerating(check.key);
    try {
      const res = await api.generateSupplierMessage({
        supplier_name: invoice.supplier_name || m.supplier_name || '',
        invoice_number: invoice.invoice_number || m.invoice_number || '',
        invoice_date: invoice.date || '',
        mismatch_type: m.mismatch_type || check.title,
        mismatch_detail: check.detail,
        blocked_itc_amount: parseFloat(m.itc_at_risk || invoice.gst_amount || 0),
        buyer_gstin: user?.gstin || user?.email || '',
      });
      setSheetMessage(res.message);
    } catch (e) {
      Alert.alert('Error', 'Could not generate message. Please try again.');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Screen
      title="Invoice Validation Center"
      subtitle={`Reviewing Invoice #${invoice.invoice_number || ''}`}
      subtitleMono
      heroHeight={130}
      leftIcon="arrow-back"
      onLeftPress={() => navigation.goBack()}
    >
      {checks.map((check) => (
        <ValidationCard
          key={check.key}
          passed={check.passed}
          title={check.title}
          detail={check.detail}
          timestamp
        >
          {!check.passed && (
            <View style={styles.actionArea}>
              <Text style={styles.actionLabel}>Action required to claim ITC.</Text>
              <TouchableOpacity
                style={styles.notifyBtn}
                onPress={() => handleNotify(check)}
                disabled={generating === check.key}
                activeOpacity={0.85}
              >
                {generating === check.key ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.notifyText}>Generating message...</Text>
                  </>
                ) : (
                  <Text style={styles.notifyText}>Notify Supplier</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ValidationCard>
      ))}

      <TouchableOpacity
        style={styles.gstr2bLink}
        onPress={() => navigation.navigate('Tabs', { screen: 'GSTR2B' })}
        activeOpacity={0.85}
      >
        <Ionicons name="swap-horizontal-outline" size={22} color={colors.primary} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[typography.labelBold, { color: colors.textPrimary }]}>Go to GSTR-2B Matching</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Cross-verify this invoice against portal data.</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={colors.primary} />
      </TouchableOpacity>

      <SupplierMessageSheet
        visible={sheetMessage !== null}
        message={sheetMessage}
        onClose={() => setSheetMessage(null)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: 16,
    marginBottom: spacing.cardGap, borderLeftWidth: 3, borderLeftColor: colors.success,
    ...shadow.card,
  },
  cardFailed: { borderLeftColor: colors.danger },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  cardDetail: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 },
  timestampRow: { flexDirection: 'row', alignItems: 'center' },
  timestampDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  timestampText: { fontSize: 12, color: colors.textSecondary },
  actionArea: {
    backgroundColor: colors.dangerLight, borderRadius: 8, padding: 14, marginTop: 12,
  },
  actionLabel: { fontSize: 13, color: colors.textPrimary, marginBottom: 10, textAlign: 'center' },
  notifyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, height: 44, borderRadius: 8,
  },
  notifyText: { color: '#fff', fontSize: 14, fontWeight: '500', marginLeft: 6 },
  gstr2bLink: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successLight,
    borderRadius: radius.card, padding: 16, marginTop: 8,
  },
});

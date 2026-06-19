import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { Screen, StatusChip } from '../components';
import { useT } from '../i18n';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const statusTone = (s) => {
  if (['validated', 'processed', 'ok', 'clean', 'completed'].includes(s)) return { tone: 'success', key: 'status.completed' };
  if (['pending', 'processing'].includes(s)) return { tone: 'info', key: 'status.processing' };
  return { tone: 'danger', key: null };
};

const FieldRow = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={[typography.monoCaption, { color: colors.textSecondary, width: 118 }]}>{label}</Text>
    <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]} numberOfLines={2}>{value || '—'}</Text>
  </View>
);

export const InvoiceDetailScreen = ({ navigation, route }) => {
  const data = route.params?.data || {};
  const t = useT();
  const st = statusTone(data.status);

  return (
    <Screen
      title={t('verify.extracted')}
      heroHeight={130}
      leftIcon="arrow-back"
      onLeftPress={() => navigation.goBack()}
    >
      <View style={styles.resultHeader}>
        <Ionicons name="checkmark-circle" size={28} color={colors.success} />
        <Text style={[typography.title, { color: colors.success, marginLeft: 10 }]}>{t('verify.extracted')}</Text>
      </View>

      <StatusChip label={(data.status || 'processing').replace(/_/g, ' ')} tone={st.tone} uppercase />

      <View style={styles.resultCard}>
        <Text style={[typography.section, { color: colors.textPrimary, marginBottom: 12 }]}>{t('verify.details')}</Text>
        <FieldRow label="Vendor Name" value={data.supplier_name} />
        <FieldRow label="GSTIN" value={data.supplier_gstin} />
        <FieldRow label="Invoice No." value={data.invoice_number} />
        <FieldRow label="Date" value={data.date} />
        <FieldRow label="HSN Code" value={data.hsn_code} />
        <FieldRow label="Description" value={data.product_description} />
      </View>

      <View style={styles.resultCard}>
        <Text style={[typography.section, { color: colors.textPrimary, marginBottom: 12 }]}>{t('verify.amounts')}</Text>
        <FieldRow label="Taxable Value" value={formatINR(data.taxable_value)} />
        <FieldRow label="CGST" value={formatINR(data.cgst_amount)} />
        <FieldRow label="SGST" value={formatINR(data.sgst_amount)} />
        <FieldRow label="IGST" value={formatINR(data.igst_amount)} />
        <FieldRow label="Total GST" value={formatINR(data.gst_amount)} />
        <View style={styles.totalRow}>
          <Text style={[typography.labelBold, { color: colors.textPrimary }]}>{t('verify.total')}</Text>
          <Text style={[typography.amount, { color: colors.primary }]}>{formatINR(data.total_amount)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="checkmark" size={20} color="#fff" />
        <Text style={[typography.labelBold, { color: '#fff', marginLeft: 8 }]}>{t('verify.saveAndContinue')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadAnother} onPress={() => navigation.goBack()}>
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        <Text style={[typography.labelBold, { color: colors.primary, marginLeft: 8 }]}>{t('verify.uploadAnother')}</Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  resultCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, marginTop: 16, ...shadow.card },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, marginTop: 6, borderTopWidth: 2, borderTopColor: colors.primary },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, height: 52, borderRadius: radius.button, marginTop: 24,
  },
  uploadAnother: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingVertical: 14 },
});

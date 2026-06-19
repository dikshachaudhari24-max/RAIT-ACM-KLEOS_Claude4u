import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { Screen, PrimaryButton, StatusChip } from '../components';
import { api, getAuthToken, API_BASE } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const FILTERS = [
  { key: null, label: 'All' },
  { key: 'error_gstin', label: 'GSTIN Error' },
  { key: 'error_hsn', label: 'HSN Error' },
  { key: 'anomalous', label: 'Anomalous' },
  { key: 'validated', label: 'Validated' },
];

const statusTone = (s) => {
  if (['validated', 'processed'].includes(s)) return 'success';
  if (['pending', 'processing'].includes(s)) return 'info';
  return 'danger';
};

export const InvoiceListScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const t = useT();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [summary, setSummary] = useState({ total_invoices: 0, total_amount: 0, total_itc: 0, needs_review: 0 });

  const loadSummary = useCallback(async () => {
    try {
      const data = await api.getInvoiceSummary();
      setSummary(data);
    } catch (e) { /* ignore */ }
  }, []);

  const loadInvoices = useCallback(async (p = 1, append = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const data = await api.searchInvoices({
        page: p, per_page: 20, status: activeFilter, search: search || undefined,
      });
      setInvoices(append ? (prev) => [...prev, ...(data.invoices || [])] : data.invoices || []);
      setTotalPages(data.total_pages || 0);
      setPage(p);
    } catch (e) { /* ignore */ }
    setLoading(false);
    setLoadingMore(false);
  }, [activeFilter, search]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadInvoices(1); }, [loadInvoices]);

  const handleEndReached = () => {
    if (!loadingMore && page < totalPages) loadInvoices(page + 1, true);
  };

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const token = getAuthToken();
      const url = api.getExportUrl(format, { status: activeFilter, search });
      const today = new Date().toISOString().slice(0, 10);
      const ext = format === 'excel' ? 'xlsx' : 'pdf';
      const fileName = `Hisably_${today}.${ext}`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const result = await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });

      if (result.status !== 200) throw new Error('Export failed');

      const mimeType = format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      await Sharing.shareAsync(result.uri, { mimeType, dialogTitle: `Share ${format.toUpperCase()}` });
    } catch (e) {
      Alert.alert('Export Error', e.message || 'Failed to export');
    }
    setExporting(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('InvoiceDetail', {
        data: { ...item, invoice_id: item.id },
      })}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.labelBold, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.supplier_name || 'Unknown Supplier'}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {item.invoice_number || ''} {item.date ? `• ${item.date}` : ''}
        </Text>
        {item.is_duplicate && (
          <View style={styles.dupBadge}>
            <Ionicons name="copy-outline" size={12} color={colors.warning} />
            <Text style={[typography.caption, { color: colors.warning, marginLeft: 4 }]}>Duplicate</Text>
          </View>
        )}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[typography.labelBold, { color: colors.primary }]}>{formatINR(item.total_amount)}</Text>
        {item.gst_amount > 0 && (
          <Text style={[typography.caption, { color: colors.success, marginTop: 2 }]}>
            ITC {formatINR(item.gst_amount)}
          </Text>
        )}
        <StatusChip
          label={(item.status || '').replace(/_/g, ' ')}
          tone={statusTone(item.status)}
        />
      </View>
    </TouchableOpacity>
  );

  const statCards = [
    { label: 'Total Invoices', value: summary.total_invoices, color: colors.textPrimary },
    { label: 'Total Amount', value: formatINR(summary.total_amount), color: colors.primary },
    { label: 'ITC Eligible', value: formatINR(summary.total_itc), color: colors.success },
    { label: 'Needs Review', value: summary.needs_review, color: summary.needs_review > 0 ? colors.warning : colors.textSecondary },
  ];

  if (loading && invoices.length === 0) {
    return (
      <Screen title="My Invoices" titleAlign="left" heroHeight={120}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  return (
    <Screen title="My Invoices" titleAlign="left" heroHeight={120}>
      {/* Stats */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={statCards}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ marginBottom: 16 }}
        renderItem={({ item: c }) => (
          <View style={styles.statCard}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{c.label}</Text>
            <Text style={[typography.display, { color: c.color, marginTop: 2 }]}>
              {typeof c.value === 'number' ? c.value : c.value}
            </Text>
          </View>
        )}
      />

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={colors.outline} style={{ marginRight: 8 }} />
        <TextInput
          style={[typography.body, styles.searchInput]}
          placeholder="Search supplier or invoice..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => loadInvoices(1)}
          returnKeyType="search"
        />
      </View>

      {/* Filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(f) => f.key || 'all'}
        style={styles.filterRow}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.key)}
          >
            <Text style={[typography.caption, { color: activeFilter === f.key ? '#fff' : colors.textPrimary }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Invoice List */}
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 40 }]}>
            No invoices found
          </Text>
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={{ padding: 16 }} /> : null}
        style={{ marginBottom: 8 }}
      />

      {/* Export buttons */}
      <View style={styles.exportRow}>
        <TouchableOpacity
          style={[styles.exportBtn, { borderColor: colors.primary }]}
          onPress={() => handleExport('excel')}
          disabled={!!exporting}
        >
          {exporting === 'excel' ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons name="document-outline" size={18} color={colors.primary} />
              <Text style={[typography.labelBold, { color: colors.primary, marginLeft: 6 }]}>Excel</Text>
            </>
          )}
        </TouchableOpacity>
        <View style={{ width: 12 }} />
        <TouchableOpacity
          style={[styles.exportBtn, { borderColor: colors.danger }]}
          onPress={() => handleExport('pdf')}
          disabled={!!exporting}
        >
          {exporting === 'pdf' ? (
            <ActivityIndicator size="small" color={colors.danger} />
          ) : (
            <>
              <Ionicons name="document-text-outline" size={18} color={colors.danger} />
              <Text style={[typography.labelBold, { color: colors.danger, marginLeft: 6 }]}>PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: 16,
    marginRight: 12, minWidth: 130, ...shadow.card,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.fieldBg,
    borderRadius: radius.pill, paddingHorizontal: 16, height: 44, marginBottom: 12,
  },
  searchInput: { flex: 1, color: colors.textPrimary, padding: 0 },
  filterRow: { flexDirection: 'row', marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 16, height: 36, justifyContent: 'center', borderRadius: radius.pill,
    backgroundColor: colors.surface, marginRight: 8, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    paddingVertical: spacing.rowPaddingV, paddingHorizontal: spacing.rowPaddingH,
    borderRadius: radius.card, marginBottom: 12, ...shadow.card,
  },
  dupBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  exportRow: {
    flexDirection: 'row', paddingVertical: 12,
  },
  exportBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 48, borderRadius: radius.button, borderWidth: 1.5,
  },
});

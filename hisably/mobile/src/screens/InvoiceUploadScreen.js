import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { Screen, StatusChip } from '../components';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const statusTone = (s) => {
  if (['validated', 'processed', 'ok', 'clean', 'completed'].includes(s)) return { tone: 'success', key: 'status.completed' };
  if (['pending', 'processing'].includes(s)) return { tone: 'info', key: 'status.processing' };
  return { tone: 'danger', key: null };
};

export const InvoiceUploadScreen = ({ navigation }) => {
  const [processing, setProcessing] = useState(false);
  const [recent, setRecent] = useState([]);
  const { user } = useAuthStore();
  const t = useT();
  const initials = ((user?.name?.[0] || user?.email?.[0] || 'U') + (user?.name?.[1] || '')).toUpperCase();

  const tiles = [
    { icon: 'camera', labelKey: 'upload.scan', type: 'camera', bg: colors.accent, fg: colors.primaryDeep },
    { icon: 'image', labelKey: 'upload.gallery', type: 'gallery', bg: colors.accentSoft, fg: colors.primaryDeep },
    { icon: 'document-text', labelKey: 'upload.pdf', type: 'pdf', bg: colors.dangerLight, fg: colors.danger },
  ];

  useEffect(() => { loadRecent(); }, []);

  const loadRecent = async () => {
    try {
      const data = await api.getInvoices(1, 5);
      setRecent(data.invoices || data.items || []);
    } catch (e) { /* none yet */ }
  };

  const handleUpload = async (type) => {
    let fileUri, fileName;
    try {
      if (type === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return Alert.alert('', t('upload.cameraPerm'));
        const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        if (result.canceled) return;
        fileUri = result.assets[0].uri; fileName = 'invoice_photo.jpg';
      } else if (type === 'gallery') {
        const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
        if (result.canceled) return;
        fileUri = result.assets[0].uri; fileName = 'invoice_gallery.jpg';
      } else if (type === 'pdf') {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
        if (result.canceled) return;
        fileUri = result.assets[0].uri; fileName = result.assets[0].name;
      } else {
        return;
      }

      setProcessing(true);
      const res = await api.uploadInvoice(fileUri, fileName);
      setProcessing(false);

      if (res.error) return Alert.alert(t('common.error'), res.error);
      if (res.extracted) {
        navigation.navigate('InvoiceDetail', {
          data: { ...res.extracted, status: res.status, invoice_id: res.invoice_id },
        });
      } else {
        Alert.alert(t('upload.uploaded'), `Status: ${res.status}`);
      }
      loadRecent();
    } catch (e) {
      setProcessing(false);
      Alert.alert(t('common.error'), e.message || t('upload.error'));
    }
  };

  return (
    <Screen title={t('upload.title')} heroHeight={150} avatar={initials} onAvatarPress={() => navigation.navigate('Profile')}>
      {tiles.map((tile, i) => (
        <TouchableOpacity key={i} style={styles.tile} onPress={() => handleUpload(tile.type)} activeOpacity={0.85}>
          <View style={[styles.tileIcon, { backgroundColor: tile.bg }]}>
            <Ionicons name={tile.icon} size={28} color={tile.fg} />
          </View>
          <Text style={[typography.title, styles.tileLabel]}>{t(tile.labelKey)}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={[typography.monoLabel, styles.dividerText]}>{t('upload.unreadable')}</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.manualBtn} activeOpacity={0.85} onPress={() => Alert.alert(t('upload.manual'), t('upload.manualSoon'))}>
        <Ionicons name="create-outline" size={20} color={colors.primary} />
        <Text style={[typography.labelBold, { color: colors.primary, marginLeft: 10, fontSize: 16 }]}>{t('upload.manual')}</Text>
      </TouchableOpacity>

      {recent.length > 0 && (
        <>
          <Text style={[typography.section, styles.sectionTitle]}>{t('upload.recent')}</Text>
          {recent.map((inv, i) => {
            const st = statusTone(inv.status);
            return (
              <View key={i} style={styles.recentRow}>
                <View style={styles.recentIcon}>
                  <Ionicons name="document-text-outline" size={20} color={colors.outline} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.labelBold, { color: colors.textPrimary }]} numberOfLines={1}>
                    {inv.invoice_number || 'Invoice'}
                  </Text>
                  <Text style={[typography.monoCaption, { color: colors.textSecondary }]} numberOfLines={1}>
                    {inv.supplier_name || inv.date || ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {inv.amount > 0 && <Text style={[typography.labelBold, { color: colors.textPrimary, marginBottom: 2 }]}>{formatINR(inv.amount)}</Text>}
                  <StatusChip label={st.key ? t(st.key) : (inv.status || '').replace(/_/g, ' ')} tone={st.tone} />
                </View>
              </View>
            );
          })}
        </>
      )}

      <Modal visible={processing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[typography.section, styles.processingText]}>{t('upload.processing')}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('upload.processingSub')}</Text>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.surface, borderRadius: radius.card, paddingVertical: 28,
    alignItems: 'center', marginBottom: spacing.cardGap, ...shadow.card,
  },
  tileIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  tileLabel: { color: colors.textPrimary, textAlign: 'center' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.outlineVariant },
  dividerText: { color: colors.textSecondary, marginHorizontal: 12 },
  manualBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 54,
    borderRadius: radius.button, borderWidth: 1.5, borderColor: colors.primary,
  },
  sectionTitle: { color: colors.textPrimary, marginTop: spacing.sectionGap - 6, marginBottom: spacing.sectionHeaderGap },
  recentRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    paddingVertical: spacing.rowPaddingV, paddingHorizontal: spacing.rowPaddingH,
    borderRadius: radius.card, marginBottom: 12, ...shadow.card,
  },
  recentIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.neutralBg, alignItems: 'center', justifyContent: 'center', marginRight: spacing.iconTextGap },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 36, alignItems: 'center', marginHorizontal: 40 },
  processingText: { color: colors.textPrimary, marginTop: 16, marginBottom: 6 },
});

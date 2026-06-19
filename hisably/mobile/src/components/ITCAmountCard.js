import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius, shadow } from '../theme';

const typeStyles = {
  eligible: { color: colors.success, bg: colors.successLight, icon: 'checkmark-circle' },
  recoverable: { color: colors.warning, bg: colors.warningLight, icon: 'time' },
  blocked: { color: colors.danger, bg: colors.dangerLight, icon: 'alert-circle' },
  // legacy aliases
  success: { color: colors.success, bg: colors.successLight, icon: 'checkmark-circle' },
  warning: { color: colors.warning, bg: colors.warningLight, icon: 'time' },
  danger: { color: colors.danger, bg: colors.dangerLight, icon: 'alert-circle' },
};

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const ITCAmountCard = ({ amount, label, sublabel, type = 'eligible', onPress, style }) => {
  const s = typeStyles[type] || typeStyles.eligible;
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: s.bg }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
    >
      <View style={styles.headRow}>
        <Ionicons name={s.icon} size={18} color={s.color} />
        <Text style={[typography.labelBold, styles.label, { color: s.color }]} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={[typography.amount, { color: s.color }]}>{formatINR(amount)}</Text>
      {sublabel ? <Text style={[typography.caption, { color: s.color, opacity: 0.8, marginTop: 4 }]}>{sublabel}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: 16,
    ...shadow.card,
  },
  headRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label: { marginLeft: 8 },
});

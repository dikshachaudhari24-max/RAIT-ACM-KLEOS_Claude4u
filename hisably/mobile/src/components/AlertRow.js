import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radius, shadow } from '../theme';

const dotColors = {
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  info: colors.primary,
};

export const AlertRow = ({ type = 'info', title, subtitle, message, timestamp }) => (
  <View style={styles.card}>
    <View style={[styles.dot, { backgroundColor: dotColors[type] || colors.primary }]} />
    <View style={styles.content}>
      <Text style={[typography.labelBold, { color: colors.textPrimary }]}>{title || message}</Text>
      {(subtitle || timestamp) && (
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {subtitle || timestamp}
        </Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 12,
    ...shadow.card,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 12 },
  content: { flex: 1 },
});

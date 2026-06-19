import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';

export const EmptyState = ({ icon = 'document-text-outline', title, subtitle }) => (
  <View style={styles.container}>
    <View style={styles.iconCircle}>
      <Ionicons name={icon} size={32} color={colors.primary} />
    </View>
    <Text style={[typography.section, styles.title]}>{title}</Text>
    {subtitle ? <Text style={[typography.body, styles.subtitle]}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, minHeight: 280 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { color: colors.textPrimary, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, textAlign: 'center', marginTop: 6 },
});

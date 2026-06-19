import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radius } from '../theme';

const tones = {
  success: { bg: colors.successLight, text: colors.success },
  warning: { bg: colors.warningLight, text: colors.warning },
  danger: { bg: colors.dangerLight, text: colors.danger },
  info: { bg: colors.primaryLight, text: colors.primary },
  neutral: { bg: colors.neutralBg, text: colors.textSecondary },
};

export const StatusChip = ({ label, tone = 'neutral', style, mono = true, uppercase = false }) => {
  const t = tones[tone] || tones.neutral;
  const text = uppercase ? String(label).toUpperCase() : label;
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }, style]}>
      <Text style={[mono ? typography.monoCaption : typography.caption, { color: t.text }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});

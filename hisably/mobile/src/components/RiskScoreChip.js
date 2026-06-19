import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '../theme';
import { useT } from '../i18n';

const getTier = (score) => {
  if (score <= 40) return { key: 'risk.low', color: colors.accent };
  if (score <= 70) return { key: 'risk.medium', color: '#FFD180' };
  if (score <= 85) return { key: 'risk.high', color: '#FFAB91' };
  return { key: 'risk.critical', color: '#FF8A80' };
};

// Translucent pill rendered on the dark green hero (e.g. "High Risk").
export const RiskScoreChip = ({ score = 0, onHero = true }) => {
  const t = useT();
  const tier = getTier(score);
  return (
    <View style={[styles.chip, onHero ? styles.onHero : styles.onLight]}>
      <Ionicons name="warning-outline" size={13} color={onHero ? '#fff' : tier.color} />
      <Text style={[typography.monoCaption, { color: onHero ? '#fff' : colors.textPrimary, marginLeft: 5 }]}>
        {t(tier.key)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  onHero: { backgroundColor: 'rgba(0,0,0,0.22)' },
  onLight: { backgroundColor: colors.surface },
});

import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '../theme';
import { LANGUAGES, useLang, useSetLang } from '../i18n';

export const LanguageChips = () => {
  const lang = useLang();
  const setLang = useSetLang();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {LANGUAGES.map((l) => {
        const active = l.code === lang;
        return (
          <TouchableOpacity
            key={l.code}
            style={[styles.chip, active ? styles.active : styles.idle]}
            onPress={() => setLang(l.code)}
            activeOpacity={0.8}
          >
            {active && <Ionicons name="checkmark" size={14} color="#fff" style={styles.check} />}
            <Text style={[typography.labelBold, { color: active ? '#fff' : colors.primary }]}>
              {l.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: { paddingVertical: 2, paddingRight: 8 },
  chip: {
    height: 32,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  active: { backgroundColor: colors.primary },
  idle: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  check: { marginRight: 6 },
});

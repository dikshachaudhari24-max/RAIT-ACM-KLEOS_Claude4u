import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius, shadow } from '../theme';
import { LANGUAGES, useLang, useSetLang } from '../i18n';

// Globe + current-language chip (used in the Login header). Opens a bottom
// sheet so the user can switch language before signing in.
export const GlobeButton = ({ color }) => {
  const [open, setOpen] = useState(false);
  const lang = useLang();
  const setLang = useSetLang();
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const onHero = !!color;
  const fg = color || colors.primary;

  return (
    <>
      <TouchableOpacity
        style={[styles.button, onHero && styles.buttonHero]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="globe-outline" size={16} color={fg} />
        <Text style={[typography.caption, styles.label, { color: fg }]}>{current.label}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <View style={styles.handle} />
            {LANGUAGES.map((l) => {
              const active = l.code === lang;
              return (
                <TouchableOpacity
                  key={l.code}
                  style={styles.option}
                  onPress={() => { setLang(l.code); setOpen(false); }}
                >
                  <Text style={[typography.bodyMd, { color: colors.textPrimary }]}>{l.label}</Text>
                  {active && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: radius.pill,
  },
  buttonHero: { backgroundColor: 'rgba(255,255,255,0.18)' },
  label: { marginLeft: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 10,
    ...shadow.nav,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: 16 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
});

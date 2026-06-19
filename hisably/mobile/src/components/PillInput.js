import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '../theme';

export const PillInput = ({ prefix, icon, style, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.wrap, focused && styles.focused, style]}>
      {icon && <Ionicons name={icon} size={20} color={colors.outline} style={styles.leftIcon} />}
      {prefix ? (
        <View style={styles.prefix}>
          <Text style={[typography.bodyMd, { color: colors.textPrimary }]}>{prefix}</Text>
        </View>
      ) : null}
      <TextInput
        style={[styles.input, typography.bodyMd]}
        placeholderTextColor={colors.outline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.fieldBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  focused: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  leftIcon: { marginRight: 10 },
  prefix: {
    marginRight: 10,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: colors.outlineVariant,
  },
  input: { flex: 1, color: colors.textPrimary, paddingVertical: 0 },
});

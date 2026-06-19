import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '../theme';

export const PrimaryButton = ({ title, onPress, loading, disabled, variant = 'primary', icon, iconLeft }) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const textColor = isPrimary ? '#fff' : colors.primary;
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        variant === 'secondary' && styles.secondary,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.inner}>
          {iconLeft && <Ionicons name={iconLeft} size={18} color={textColor} style={styles.iconL} />}
          <Text style={[typography.labelBold, { color: textColor, fontSize: 16 }]}>{title}</Text>
          {icon && <Ionicons name={icon} size={18} color={textColor} style={styles.icon} />}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: radius.button,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  inner: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginLeft: 8 },
  iconL: { marginRight: 8 },
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  secondary: { backgroundColor: colors.primaryLight },
  disabled: { opacity: 0.5 },
});

import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

/**
 * Animated grey placeholder block. Compose several to build a skeleton screen
 * while data loads (spinners are reserved for the PDF export button).
 */
export const Skeleton = ({ width = '100%', height = 16, radius: r = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: r, backgroundColor: colors.outlineVariant, opacity }, style]}
    />
  );
};

/** A card-shaped cluster of skeleton lines. */
export const SkeletonCard = ({ lines = 3, style }) => (
  <View style={[styles.card, style]}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={14}
        width={i === lines - 1 ? '60%' : '100%'}
        style={{ marginBottom: i === lines - 1 ? 0 : 12 }}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 16,
  },
});

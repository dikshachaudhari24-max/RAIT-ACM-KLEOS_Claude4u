import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

export const ConfidenceDot = ({ score }) => {
  let color = colors.danger;
  if (score > 0.85) color = colors.success;
  else if (score >= 0.6) color = colors.warning;

  return <View style={[styles.dot, { backgroundColor: color }]} />;
};

const styles = StyleSheet.create({
  dot: { width: 10, height: 10, borderRadius: 5 },
});

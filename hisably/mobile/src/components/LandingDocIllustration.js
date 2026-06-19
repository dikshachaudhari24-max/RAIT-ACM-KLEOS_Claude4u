import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

const Bar = ({ w, h = 6, style }) => (
  <View style={[{ width: w, height: h, borderRadius: 3, backgroundColor: 'rgba(26,35,126,0.20)' }, style]} />
);

// Decorative, translucent document stack behind the landing hero text.
export const LandingDocIllustration = () => (
  <View style={styles.container} pointerEvents="none">
    {/* Back card — GST invoice */}
    <View style={[styles.card, styles.back]}>
      <View style={styles.headerBar} />
      <Bar w={70} style={styles.mt} />
      <Bar w={88} style={styles.mt} />
      <Bar w={60} style={styles.mt} />
      <View style={styles.spacer} />
      <Bar w={44} h={10} style={{ backgroundColor: 'rgba(26,35,126,0.28)' }} />
    </View>

    {/* Front card — GSTR-2B snippet */}
    <View style={[styles.card, styles.front]}>
      <Text style={[typography.caption, styles.tag]}>GSTR-2B</Text>
      <Bar w={64} style={styles.mt} />
      <Bar w={80} style={styles.mt} />
      <Bar w={54} style={styles.mt} />
    </View>

    {/* Middle card — receipt, peeking from the bottom */}
    <View style={[styles.card, styles.middle]}>
      <Bar w={50} h={8} style={{ backgroundColor: 'rgba(26,35,126,0.26)' }} />
      <Bar w={84} style={styles.mt} />
      <Bar w={70} style={styles.mt} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  card: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 1,
  },
  back: { width: 120, height: 150, top: 18, left: 8, transform: [{ rotate: '-8deg' }] },
  front: { width: 116, height: 140, top: 30, right: 6, transform: [{ rotate: '4deg' }] },
  middle: { width: 116, height: 120, top: 118, alignSelf: 'center', left: '30%', transform: [{ rotate: '-3deg' }] },
  headerBar: { height: 12, borderRadius: 4, backgroundColor: 'rgba(26,35,126,0.28)' },
  tag: { color: 'rgba(26,35,126,0.55)' },
  mt: { marginTop: 8 },
  spacer: { flex: 1 },
});

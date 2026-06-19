import { StyleSheet } from 'react-native';

// Two font families drive the ledger aesthetic:
//  - Poppins  → headings, body, buttons (rounded geometric sans)
//  - Space Mono → ledger accents: field labels, status tags, dates, amounts
// Loaded via @expo-google-fonts/* in App.js. If not yet loaded, RN falls back
// to the system font gracefully (we set only fontFamily, never fontWeight).
export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extrabold: 'Poppins_800ExtraBold',
  mono: 'SpaceMono_400Regular',
  monoBold: 'SpaceMono_700Bold',
};

export const typography = StyleSheet.create({
  // Ultra-bold hero screen titles ("Dashboard", "Task Manager", "Hello, it's Hisably!")
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  // "Hisably" wordmark
  wordmark: {
    fontFamily: fonts.extrabold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  // display — large numbers (non-mono contexts)
  display: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  // ledger amounts — monospace tabular figures (₹2,45,000 / 1,248 / 90%)
  amount: {
    fontFamily: fonts.monoBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  amountLg: {
    fontFamily: fonts.monoBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -1,
  },
  // screen / card titles
  title: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 26,
  },
  // section headers
  section: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  // card labels / button text
  labelBold: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  // ledger label — monospace ("Vendor Name", "Due Today", "Checked just now")
  monoLabel: {
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  monoCaption: {
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: -0.2,
  },
  // body / description
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyMd: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  // captions / timestamps / sub-labels
  caption: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  // Backwards-compatible alias
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 26,
  },
});

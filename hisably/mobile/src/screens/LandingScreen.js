import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { PrimaryButton, LanguageChips, RobotIllustration } from '../components';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n';

export const LandingScreen = ({ navigation }) => {
  const { loginDemo } = useAuthStore();
  const insets = useSafeAreaInsets();
  const t = useT();

  return (
    <View style={styles.root}>
      {/* Dark green hero — seamless surface, white-outline robot, no inner box */}
      <View style={[styles.hero, { paddingTop: insets.top + 20 }]}>
        <View style={styles.illoWrap}>
          <RobotIllustration size={260} />
        </View>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Cream content area */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={[typography.heroTitle, styles.title]}>{t('landing.heroTitle')}</Text>
        <Text style={[typography.bodyMd, styles.subtitle]}>{t('landing.heroSubtitle')}</Text>

        <View style={styles.langRow}>
          <LanguageChips />
        </View>

        <PrimaryButton title={t('common.getStarted')} onPress={() => navigation.navigate('Login')} />

        <Text style={styles.signInRow}>
          <Text style={[typography.labelBold, { color: colors.textPrimary }]}>{t('landing.haveAccount')} </Text>
          <Text style={[typography.labelBold, styles.signIn]} onPress={() => navigation.navigate('Login')}>
            {t('landing.signIn')}
          </Text>
        </Text>

        <Text style={[typography.caption, styles.demoLink]} onPress={loginDemo}>
          {t('landing.demoMode')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  hero: {
    height: '50%',
    paddingHorizontal: spacing.screenH,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: radius.sheet,
    borderBottomRightRadius: radius.sheet,
  },
  illoWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 4 },
  dotActive: { width: 22, backgroundColor: '#fff' },
  sheet: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.screenH,
    paddingTop: 28,
  },
  title: { color: colors.primary, textAlign: 'center', fontSize: 34, lineHeight: 42 },
  subtitle: { color: colors.textSecondary, textAlign: 'center', marginTop: 12, paddingHorizontal: 10 },
  langRow: { marginTop: 26, marginBottom: 8, alignItems: 'center' },
  signInRow: { textAlign: 'center', marginTop: 16 },
  signIn: { color: colors.primary },
  demoLink: { color: colors.textSecondary, textAlign: 'center', marginTop: 14 },
});

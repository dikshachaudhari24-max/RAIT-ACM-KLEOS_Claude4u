import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Alert, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { PrimaryButton, PillInput, GlobeButton } from '../components';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n';

const OTP_LENGTH = 6;

const OtpBoxes = ({ value, onChange, editable, inputRef }) => (
  <View style={styles.otpRow}>
    {Array.from({ length: OTP_LENGTH }).map((_, i) => {
      const active = i === value.length;
      return (
        <View key={i} style={[styles.otpBox, active && editable && styles.otpBoxActive]}>
          <Text style={[typography.title, { color: colors.textPrimary }]}>{value[i] || ''}</Text>
        </View>
      );
    })}
    <TextInput
      ref={inputRef}
      style={styles.otpHidden}
      keyboardType="number-pad"
      maxLength={OTP_LENGTH}
      value={value}
      editable={editable}
      onChangeText={onChange}
      caretHidden
    />
  </View>
);

export const LoginScreen = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const otpRef = useRef(null);
  const t = useT();
  const { sendOtp, verifyOtp } = useAuthStore();

  const masked = phone ? `${phone.slice(0, 2)}XXX-XX${phone.slice(-3)}` : 'XXXXX-XXXXX';

  const handleSendOtp = async () => {
    if (phone.length !== 10) return Alert.alert('', t('login.invalidPhone'));
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      if (res?.message?.startsWith('Dev OTP:')) {
        Alert.alert('OTP Sent', res.message);
      }
      setStep('otp');
      setTimeout(() => otpRef.current?.focus(), 150);
    } catch (e) {
      Alert.alert(t('common.error'), e.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) return Alert.alert('', t('login.invalidOtp'));
    setLoading(true);
    try {
      await verifyOtp(phone, otp);
    } catch (e) {
      Alert.alert(t('common.error'), e.message);
    }
    setLoading(false);
  };

  const onOtpChange = (v) => {
    setOtp(v);
    if (v.length === OTP_LENGTH) handleVerifyOtp();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.hero, { paddingTop: insets.top + 24 }]}>
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.wordmark, styles.wordmark]}>Hisably</Text>
            <Text style={[typography.body, styles.tagline]}>{t('login.tagline')}</Text>
          </View>
          <GlobeButton color="#fff" />
        </View>
      </View>

      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={[typography.heroTitle, styles.title]}>{t('login.welcome')}</Text>
          <Text style={[typography.body, styles.subtitle]}>{t('login.subtitle')}</Text>

          {step === 'phone' && (
            <>
              <Text style={[typography.monoLabel, styles.label]}>{t('login.fullName')}</Text>
              <PillInput
                placeholder={t('login.fullNamePlaceholder')}
                value={name}
                onChangeText={setName}
              />
            </>
          )}

          <Text style={[typography.monoLabel, styles.label]}>{t('login.mobileNumber')}</Text>
          <PillInput
            prefix="IN +91"
            placeholder={t('login.phonePlaceholder')}
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
            editable={step === 'phone'}
          />

          {step === 'otp' && (
            <>
              <Text style={[typography.monoLabel, styles.label]}>{t('login.enterOtp')}</Text>
              <Text style={[typography.caption, styles.sentTo]}>{t('login.otpSentTo', { masked })}</Text>
              <OtpBoxes value={otp} onChange={onOtpChange} editable inputRef={otpRef} />
              <TouchableOpacity onPress={handleSendOtp}>
                <Text style={[typography.caption, styles.resend]}>{t('login.resendOtp')}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        <View style={[styles.cta, { paddingBottom: insets.bottom + 16 }]}>
          <PrimaryButton
            title={step === 'phone' ? t('common.sendOtp') : t('common.verify')}
            onPress={step === 'phone' ? handleSendOtp : handleVerifyOtp}
            loading={loading}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  hero: { paddingHorizontal: spacing.screenH, paddingBottom: 40 },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  wordmark: { color: '#fff', fontSize: 34, lineHeight: 40 },
  tagline: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    marginTop: -24,
  },
  scroll: { paddingHorizontal: spacing.screenH, paddingTop: 28 },
  title: { color: colors.textPrimary },
  subtitle: { color: colors.textSecondary, marginTop: 6, marginBottom: 12 },
  label: { color: colors.textSecondary, marginBottom: 8, marginTop: 18 },
  sentTo: { color: colors.textSecondary, marginBottom: 14 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  otpBox: {
    width: 48, height: 52, borderRadius: 12, backgroundColor: colors.fieldBg,
    alignItems: 'center', justifyContent: 'center',
  },
  otpBoxActive: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryLight },
  otpHidden: { position: 'absolute', width: '100%', height: 52, opacity: 0 },
  resend: { color: colors.primary, textAlign: 'right', marginTop: 14 },
  cta: { paddingHorizontal: spacing.screenH, paddingTop: 8 },
});

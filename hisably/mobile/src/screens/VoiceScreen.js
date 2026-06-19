import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { Screen, PillInput } from '../components';
import { api } from '../services/api';
import { useT } from '../i18n';

const Waveform = () => (
  <View style={styles.wave}>
    {[10, 18, 28, 18, 10].map((h, i) => (
      <View key={i} style={[styles.waveBar, { height: h }]} />
    ))}
  </View>
);

export const VoiceScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const t = useT();

  const suggested = [t('voice.q1'), t('voice.q2'), t('voice.q3')];

  const handleSend = async (text) => {
    const q = (text || query).trim();
    if (!q) return;
    setHistory((prev) => [...prev, { role: 'user', content: q }]);
    setQuery('');
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      const res = await api.chatQuery(q);
      setHistory((prev) => [...prev, { role: 'assistant', content: res.response_text }]);
    } catch (e) {
      setHistory((prev) => [...prev, { role: 'assistant', content: t('voice.error') }]);
    }
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const idle = history.length === 0;

  return (
    <Screen title={t('voice.title')} heroHeight={118} leftIcon="notifications-outline" avatar="RK" onAvatarPress={() => navigation.navigate('Profile')} scroll={false} contentStyle={styles.sheetReset}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {idle && (
            <View style={styles.micArea}>
              <View style={styles.pulse}>
                <View style={styles.mic}>
                  <Ionicons name="mic" size={28} color="#fff" />
                </View>
              </View>
              <Waveform />
              <Text style={[typography.title, styles.listening]}>{t('voice.placeholder')}</Text>

              <View style={styles.assistantCard}>
                <View style={styles.assistantHead}>
                  <Ionicons name="hardware-chip-outline" size={18} color={colors.primary} />
                  <Text style={[typography.labelBold, { color: colors.primary, marginLeft: 8 }]}>{t('voice.assistant')}</Text>
                </View>
                <Text style={[typography.body, { color: colors.textPrimary, marginTop: 6 }]}>
                  {t('voice.greeting', { name: '' })}
                </Text>
              </View>
            </View>
          )}

          {history.map((msg, i) => (
            <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              <Text style={[typography.body, { color: msg.role === 'user' ? '#fff' : colors.textPrimary }]}>{msg.content}</Text>
            </View>
          ))}

          {loading && (
            <View style={[styles.bubble, styles.assistantBubble]}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>{t('voice.thinking')}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={[typography.caption, styles.suggestLabel]}>{t('voice.suggested')}</Text>
          <View style={styles.chipsRow}>
            {suggested.map((q, i) => (
              <TouchableOpacity key={i} style={styles.chip} onPress={() => handleSend(q)}>
                <Text style={[typography.caption, { color: colors.primary }]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <PillInput
                placeholder={t('voice.placeholder')}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => handleSend()}
                returnKeyType="send"
              />
            </View>
            <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
              <Ionicons name="arrow-up" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  sheetReset: { paddingHorizontal: 0, paddingTop: 8 },
  scroll: { paddingHorizontal: spacing.screenH, paddingTop: 8, paddingBottom: 8, flexGrow: 1 },
  micArea: { alignItems: 'center', paddingTop: 12 },
  pulse: { width: 180, height: 180, borderRadius: 90, backgroundColor: colors.hero, alignItems: 'center', justifyContent: 'center', opacity: 0.9 },
  mic: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  wave: { flexDirection: 'row', alignItems: 'center', height: 32, marginTop: 16 },
  waveBar: { width: 5, borderRadius: 3, backgroundColor: colors.primary, marginHorizontal: 3 },
  listening: { color: colors.primary, marginTop: 12, fontStyle: 'italic' },
  assistantCard: { backgroundColor: colors.neutralBg, borderRadius: radius.card, padding: 16, marginTop: 24, alignSelf: 'stretch' },
  assistantHead: { flexDirection: 'row', alignItems: 'center' },
  bubble: { padding: 14, borderRadius: radius.card, marginBottom: 10, maxWidth: '85%' },
  userBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 6 },
  assistantBubble: { backgroundColor: colors.neutralBg, alignSelf: 'flex-start', borderBottomLeftRadius: 6 },
  footer: { paddingHorizontal: spacing.screenH, paddingBottom: 100 },
  suggestLabel: { color: colors.textSecondary, marginBottom: 8, textAlign: 'center' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 },
  chip: { backgroundColor: colors.primaryLight, paddingHorizontal: 14, height: 34, justifyContent: 'center', borderRadius: radius.pill, marginRight: 8, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  sendBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
});

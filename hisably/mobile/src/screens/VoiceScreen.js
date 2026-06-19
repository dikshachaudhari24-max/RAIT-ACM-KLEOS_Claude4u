import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { colors, typography, spacing, radius, shadow } from '../theme';
import { Screen, PillInput } from '../components';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n';

const Waveform = ({ active }) => (
  <View style={styles.wave}>
    {[10, 18, 28, 18, 10].map((h, i) => (
      <View key={i} style={[styles.waveBar, { height: active ? h + 8 : h, backgroundColor: active ? colors.danger : colors.primary }]} />
    ))}
  </View>
);

export const VoiceScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermission, setMicPermission] = useState(false);
  const recordingRef = useRef(null);
  const scrollRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { user } = useAuthStore();
  const t = useT();

  const initials = user?.initials || 'U';
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  const suggested = [t('voice.q1'), t('voice.q2'), t('voice.q3')];

  useEffect(() => {
    (async () => {
      const { granted } = await Audio.requestPermissionsAsync();
      setMicPermission(granted);
      if (!granted) {
        Alert.alert('Permission Needed', 'Microphone access is required for voice input.');
      }
    })();
    return () => { Speech.stop(); };
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const startRecording = async () => {
    if (!micPermission) {
      Alert.alert('Permission Denied', 'Please enable microphone access in settings.');
      return;
    }
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    setIsRecording(false);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (uri) {
        setHistory((prev) => [...prev, { role: 'user', content: '🎤 Voice message sent...' }]);
        setLoading(true);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
        try {
          const res = await api.voiceQuery(uri);
          const userText = res.transcribed_text || 'Voice input';
          setHistory((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'user', content: userText };
            return [...updated, { role: 'assistant', content: res.response_text }];
          });
          speakResponse(res.response_text);
        } catch (e) {
          setHistory((prev) => [...prev, { role: 'assistant', content: t('voice.error') }]);
        }
        setLoading(false);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
      }
    } catch (err) {
      recordingRef.current = null;
    }
  };

  const speakResponse = (text) => {
    if (!text) return;
    Speech.stop();
    setIsSpeaking(true);
    Speech.speak(text, {
      language: 'hi-IN',
      rate: 0.9,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const toggleSpeech = (text) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      speakResponse(text);
    }
  };

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
      speakResponse(res.response_text);
    } catch (e) {
      setHistory((prev) => [...prev, { role: 'assistant', content: t('voice.error') }]);
    }
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const idle = history.length === 0;

  return (
    <Screen title={t('voice.title')} heroHeight={118} leftIcon="notifications-outline" avatar={initials} onAvatarPress={() => navigation.navigate('Profile')} scroll={false} contentStyle={styles.sheetReset}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {idle && (
            <View style={styles.micArea}>
              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.7}
                disabled={!micPermission}
              >
                <Animated.View style={[styles.pulse, isRecording && styles.pulseRecording, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={[styles.mic, isRecording && styles.micRecording, !micPermission && styles.micDisabled]}>
                    <Ionicons name={isRecording ? 'stop' : 'mic'} size={28} color="#fff" />
                  </View>
                </Animated.View>
              </TouchableOpacity>
              <Waveform active={isRecording} />
              <Text style={[typography.title, styles.listening]}>
                {isRecording ? t('voice.listening') || 'Listening...' : t('voice.placeholder')}
              </Text>

              <View style={styles.assistantCard}>
                <View style={styles.assistantHead}>
                  <Ionicons name="hardware-chip-outline" size={18} color={colors.primary} />
                  <Text style={[typography.labelBold, { color: colors.primary, marginLeft: 8 }]}>{t('voice.assistant')}</Text>
                </View>
                <Text style={[typography.body, { color: colors.textPrimary, marginTop: 6 }]}>
                  {t('voice.greeting', { name: firstName })}
                </Text>
              </View>
            </View>
          )}

          {history.map((msg, i) => (
            <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              <Text style={[typography.body, { color: msg.role === 'user' ? '#fff' : colors.textPrimary }]}>{msg.content}</Text>
              {msg.role === 'assistant' && (
                <TouchableOpacity style={styles.speakerBtn} onPress={() => toggleSpeech(msg.content)}>
                  <Ionicons name={isSpeaking ? 'volume-mute' : 'volume-high'} size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {loading && (
            <View style={[styles.bubble, styles.assistantBubble]}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>{t('voice.thinking')}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {!idle && (
            <TouchableOpacity
              style={[styles.floatingMic, isRecording && styles.floatingMicRecording]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={!micPermission}
            >
              <Ionicons name={isRecording ? 'stop' : 'mic'} size={22} color="#fff" />
            </TouchableOpacity>
          )}
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
  pulseRecording: { backgroundColor: 'rgba(198,40,40,0.15)' },
  mic: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  micRecording: { backgroundColor: '#C62828' },
  micDisabled: { backgroundColor: '#9E9E9E' },
  wave: { flexDirection: 'row', alignItems: 'center', height: 32, marginTop: 16 },
  waveBar: { width: 5, borderRadius: 3, backgroundColor: colors.primary, marginHorizontal: 3 },
  listening: { color: colors.primary, marginTop: 12, fontStyle: 'italic' },
  assistantCard: { backgroundColor: colors.neutralBg, borderRadius: radius.card, padding: 16, marginTop: 24, alignSelf: 'stretch' },
  assistantHead: { flexDirection: 'row', alignItems: 'center' },
  bubble: { padding: 14, borderRadius: radius.card, marginBottom: 10, maxWidth: '85%' },
  userBubble: { backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 6 },
  assistantBubble: { backgroundColor: colors.neutralBg, alignSelf: 'flex-start', borderBottomLeftRadius: 6 },
  speakerBtn: { marginTop: 8, alignSelf: 'flex-end' },
  floatingMic: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12 },
  floatingMicRecording: { backgroundColor: '#C62828' },
  footer: { paddingHorizontal: spacing.screenH, paddingBottom: 100 },
  suggestLabel: { color: colors.textSecondary, marginBottom: 8, textAlign: 'center' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 },
  chip: { backgroundColor: colors.primaryLight, paddingHorizontal: 14, height: 34, justifyContent: 'center', borderRadius: radius.pill, marginRight: 8, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  sendBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
});

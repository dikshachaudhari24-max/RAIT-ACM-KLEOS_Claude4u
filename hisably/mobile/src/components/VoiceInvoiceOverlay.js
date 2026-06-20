import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { colors, typography, spacing, radius, shadow } from '../theme';

const GUIDED_PROMPT = 'Please tell me: Who is the supplier? What did you buy? How much did it cost? And what is the invoice date?';
const MAX_FOLLOWUPS = 3;

const FIELDS = [
  { key: 'supplier_name', label: 'Supplier Name' },
  { key: 'supplier_gstin', label: 'GSTIN' },
  { key: 'invoice_number', label: 'Invoice No.' },
  { key: 'invoice_date', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'hsn_code', label: 'HSN Code' },
  { key: 'gst_rate', label: 'GST Rate (%)' },
  { key: 'taxable_value', label: 'Taxable Value' },
  { key: 'total_amount', label: 'Total Amount' },
];

export const VoiceInvoiceOverlay = ({ visible, onClose, onConfirm, api }) => {
  const [stage, setStage] = useState('prompt'); // prompt | recording | processing | preview
  const [recording, setRecording] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [data, setData] = useState({});
  const [followupCount, setFollowupCount] = useState(0);
  const [followupQuestion, setFollowupQuestion] = useState('');
  const recordingRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setStage('prompt');
      setTranscript('');
      setData({});
      setFollowupCount(0);
      setFollowupQuestion('');
      Speech.speak(GUIDED_PROMPT, { language: 'en-IN', rate: 0.9 });
    }
    return () => { Speech.stop(); };
  }, [visible]);

  const startRecording = async () => {
    try {
      Speech.stop();
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return Alert.alert('Permission needed', 'Microphone access is required.');
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = rec;
      setRecording(rec);
      setStage('recording');
    } catch (e) {
      Alert.alert('Error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    const rec = recordingRef.current;
    if (!rec) return;
    setStage('processing');
    try {
      await rec.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = rec.getURI();
      recordingRef.current = null;
      setRecording(null);

      const tr = await api.transcribeAudio(uri);
      const spoken = tr.text || '';
      const combined = transcript ? `${transcript}. ${spoken}` : spoken;
      setTranscript(combined);

      const res = await api.voiceInvoice(combined);
      if (res.needs_followup && followupCount < MAX_FOLLOWUPS) {
        setData(res.partial_data || {});
        setFollowupQuestion(res.question);
        setFollowupCount((c) => c + 1);
        setStage('prompt');
        Speech.speak(res.question, { language: 'en-IN', rate: 0.9 });
      } else {
        setData(res.data || res.partial_data || {});
        setStage('preview');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not process your invoice.');
      setStage('prompt');
    }
  };

  const updateField = (key, value) => setData((d) => ({ ...d, [key]: value }));

  const handleConfirm = () => {
    Speech.stop();
    onConfirm(data);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={[typography.title, { color: '#fff' }]}>Speak Invoice</Text>
          <TouchableOpacity onPress={() => { Speech.stop(); onClose(); }} hitSlop={hit}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {(stage === 'prompt' || stage === 'recording') && (
          <View style={styles.center}>
            <Text style={[typography.body, styles.promptText]}>
              {followupQuestion || GUIDED_PROMPT}
            </Text>
            <TouchableOpacity
              style={[styles.micBtn, stage === 'recording' && styles.micBtnRec]}
              onPress={stage === 'recording' ? stopRecording : startRecording}
              activeOpacity={0.8}
            >
              <Ionicons name={stage === 'recording' ? 'stop' : 'mic'} size={40} color="#fff" />
            </TouchableOpacity>
            <Text style={[typography.caption, styles.hint]}>
              {stage === 'recording' ? 'Tap to stop when done speaking' : 'Tap the mic and describe your invoice'}
            </Text>
            {transcript ? <Text style={[typography.caption, styles.transcript]}>"{transcript}"</Text> : null}
          </View>
        )}

        {stage === 'processing' && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[typography.section, { color: colors.textPrimary, marginTop: 16 }]}>Reading your invoice...</Text>
          </View>
        )}

        {stage === 'preview' && (
          <ScrollView contentContainerStyle={styles.previewScroll} showsVerticalScrollIndicator={false}>
            <Text style={[typography.section, { color: colors.textPrimary, marginBottom: 4 }]}>Review & Edit</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 16 }]}>
              Tap any field to correct it.
            </Text>
            {FIELDS.map((f) => (
              <View key={f.key} style={styles.fieldRow}>
                <Text style={[typography.monoCaption, { color: colors.textSecondary, marginBottom: 4 }]}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={data[f.key] != null ? String(data[f.key]) : ''}
                  onChangeText={(v) => updateField(f.key, v)}
                  placeholder="—"
                  placeholderTextColor={colors.outline}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={[typography.labelBold, { color: '#fff', marginLeft: 8 }]}>Save & Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retryBtn} onPress={() => { setStage('prompt'); setTranscript(''); }}>
              <Text style={[typography.labelBold, { color: colors.primary }]}>Re-record</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const hit = { top: 10, bottom: 10, left: 10, right: 10 };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary, paddingTop: 56, paddingBottom: 20, paddingHorizontal: spacing.screenH },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.screenH },
  promptText: { color: colors.textPrimary, textAlign: 'center', marginBottom: 40, fontSize: 17, lineHeight: 26 },
  micBtn: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  micBtnRec: { backgroundColor: '#C62828' },
  hint: { color: colors.textSecondary, marginTop: 20, textAlign: 'center' },
  transcript: { color: colors.textSecondary, marginTop: 24, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 20 },
  previewScroll: { padding: spacing.screenH, paddingBottom: 40 },
  fieldRow: { marginBottom: 14 },
  input: { backgroundColor: colors.surface, borderRadius: radius.button, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: colors.textPrimary, borderWidth: 1, borderColor: colors.outlineVariant },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, height: 52, borderRadius: radius.button, marginTop: 24 },
  retryBtn: { alignItems: 'center', paddingVertical: 16, marginTop: 4 },
});

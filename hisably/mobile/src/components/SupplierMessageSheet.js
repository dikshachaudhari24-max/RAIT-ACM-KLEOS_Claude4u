import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  Animated, PanResponder, Dimensions, ScrollView, Share,
  Linking, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, radius } from '../theme';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_MAX = SCREEN_H * 0.65;
const DISMISS_THRESHOLD = 80;

export const SupplierMessageSheet = ({ visible, message, onClose }) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_MAX)).current;
  const [copied, setCopied] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS_THRESHOLD) {
          dismiss();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  React.useEffect(() => {
    if (visible) {
      setCopied(false);
      translateY.setValue(SHEET_MAX);
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.timing(translateY, { toValue: SHEET_MAX, duration: 250, useNativeDriver: true }).start(() => {
      onClose();
    });
  };

  const handleCopy = async () => {
    try {
      await Share.share({ message });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // share cancelled
    }
  };

  const handleWhatsApp = async () => {
    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/?text=${encoded}`;
    try {
      if (Platform.OS !== 'web') {
        await Share.share({ message });
      } else {
        Linking.openURL(waUrl);
      }
    } catch {
      Linking.openURL(waUrl);
    }
  };

  if (!visible || !message) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} onPress={dismiss} />
        <Animated.View style={[styles.sheet, { maxHeight: SHEET_MAX, paddingBottom: insets.bottom + 16, transform: [{ translateY }] }]}>
          <View {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Supplier Message</Text>
            <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{message}</Text>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.btn, styles.copyBtn]}
              onPress={handleCopy}
              activeOpacity={0.85}
            >
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={copied ? colors.success : '#1B4332'} />
              <Text style={[styles.copyText, copied && { color: colors.success }]}>
                {copied ? 'Copied ✓' : 'Copy Message'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.waBtn]}
              onPress={handleWhatsApp}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={styles.waText}>Share via WhatsApp</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  overlayTouch: { flex: 1 },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0',
    alignSelf: 'center', marginTop: 12, marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16, fontWeight: '500', color: colors.textPrimary,
  },
  body: { flexGrow: 0 },
  messageBox: {
    backgroundColor: '#F5F5F5', borderRadius: 8, padding: 16,
  },
  messageText: {
    fontSize: 14, color: colors.textPrimary, lineHeight: 22.4,
  },
  divider: {
    height: 0.5, backgroundColor: '#EEEEEE', marginVertical: 20,
  },
  btn: {
    height: 48, borderRadius: 8, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  copyBtn: {
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#1B4332',
  },
  copyText: {
    fontSize: 15, fontWeight: '500', color: '#1B4332', marginLeft: 8,
  },
  waBtn: {
    backgroundColor: '#1B4332',
  },
  waText: {
    fontSize: 15, fontWeight: '500', color: '#fff', marginLeft: 8,
  },
});

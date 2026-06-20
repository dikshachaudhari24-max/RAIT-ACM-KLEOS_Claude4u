import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  Animated, PanResponder, Dimensions, Linking, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, radius } from '../theme';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_MAX = SCREEN_H * 0.65;
const DISMISS_THRESHOLD = 80;

const CONFIGS = {
  11: {
    icon: 'warning',
    iconColor: '#E65100',
    title: 'GSTR-1 Filing Due',
    message:
      'Today is the last date to file your GSTR-1 for last month\'s sales. ' +
      'Filing after the 11th attracts a late fee of ₹50 per day (CGST) + ' +
      '₹50 per day (SGST). Your supplier\'s timely GSTR-1 filing directly ' +
      'affects your buyers\' ITC claims.',
    buttonText: 'File GSTR-1 on Portal',
    buttonColor: '#E65100',
    note: 'You will be redirected to the GST portal login page. Use your GSTIN and password to log in.',
  },
  14: {
    icon: 'download-outline',
    iconColor: '#1B4332',
    title: 'GSTR-2B Available Today',
    message:
      'Your GSTR-2B for last month is now available on the GST portal. ' +
      'Download it today and upload it into Hisably to run your ITC ' +
      'reconciliation. You have 6 days before your GSTR-3B filing deadline ' +
      'on the 20th — start early to resolve any mismatches in time.',
    buttonText: 'Download GSTR-2B from Portal',
    buttonColor: '#1B4332',
    note: 'After downloading, come back to Hisably and upload the file on the Reconciliation page to check your ITC.',
  },
  20: {
    icon: 'calendar',
    iconColor: '#C62828',
    title: 'GSTR-3B Filing Due',
    message:
      'Today is the deadline to file your GSTR-3B and pay your net GST ' +
      'liability. Missing this deadline attracts interest at 18% per annum ' +
      'on unpaid tax plus a late fee. Make sure your ITC reconciliation in ' +
      'Hisably is complete before filing so you claim the correct credit.',
    buttonText: 'File GSTR-3B on Portal',
    buttonColor: '#C62828',
    note: 'You will be redirected to the GST portal login page. The portal will ask for your OTP to verify before filing.',
  },
};

export const GSTBottomSheet = ({ visible, day, onClose }) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_MAX)).current;
  const config = CONFIGS[day];

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
      translateY.setValue(SHEET_MAX);
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.timing(translateY, { toValue: SHEET_MAX, duration: 250, useNativeDriver: true }).start(() => {
      onClose();
    });
  };

  const openPortal = () => {
    Linking.openURL('https://www.gst.gov.in');
  };

  if (!visible || !config) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} onPress={dismiss} />
        <Animated.View style={[styles.sheet, { maxHeight: SHEET_MAX, paddingBottom: insets.bottom + 16, transform: [{ translateY }] }]}>
          <View {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <View style={styles.headerRow}>
            <View style={[styles.headerIcon, { backgroundColor: config.iconColor + '18' }]}>
              <Ionicons name={config.icon} size={22} color={config.iconColor} />
            </View>
            <Text style={styles.headerTitle}>{config.title}</Text>
            <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.message}>{config.message}</Text>
            <View style={styles.divider} />
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: config.buttonColor }]} onPress={openPortal} activeOpacity={0.85}>
              <Text style={styles.actionText}>{config.buttonText}</Text>
            </TouchableOpacity>
            <Text style={styles.note}>{config.note}</Text>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
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
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
  },
  headerIcon: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  headerTitle: {
    flex: 1, fontSize: 16, fontWeight: '500', color: colors.textPrimary,
  },
  body: { flexGrow: 0 },
  message: {
    fontSize: 14, color: '#555555', lineHeight: 22.4, paddingHorizontal: 0,
  },
  divider: {
    height: 0.5, backgroundColor: '#EEEEEE', marginVertical: 20,
  },
  actionBtn: {
    height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
  },
  actionText: {
    color: '#fff', fontSize: 15, fontWeight: '500',
  },
  note: {
    fontSize: 12, color: '#888888', textAlign: 'center', paddingHorizontal: 16, paddingTop: 12,
  },
});

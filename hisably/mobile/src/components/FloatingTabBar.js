import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '../theme';

// Fixed order per design: Home, Invoice, Reconciliation, Tasks, Voice.
// [inactiveIcon, activeIcon]
const icons = {
  Home: ['home-outline', 'home'],
  Invoice: ['document-text-outline', 'document-text'],
  GSTR2B: ['card-outline', 'card'],
  Tasks: ['clipboard-outline', 'clipboard'],
  Voice: ['mic-outline', 'mic'],
};

export const FloatingTabBar = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 16 }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const [inactive, active] = icons[route.name] || ['ellipse-outline', 'ellipse'];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab} activeOpacity={0.8}>
              <View style={[styles.iconWrap, focused && styles.activeWrap]}>
                <Ionicons
                  name={focused ? active : inactive}
                  size={22}
                  color={focused ? colors.primaryDeep : '#fff'}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 62,
    paddingHorizontal: 10,
    ...shadow.nav,
  },
  tab: { width: 58, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  activeWrap: { backgroundColor: colors.accent },
});

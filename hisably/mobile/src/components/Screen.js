import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';

/**
 * Forest-green hero header + cream content sheet pulled up over it (rounded top
 * corners). White cards float on the cream sheet. Shared by every tab screen so
 * the header treatment stays identical.
 */
export const Screen = ({
  children,
  heroHeight = 150,
  title,                    // big white hero title ("Dashboard", "Upload Invoice")
  titleAlign = 'center',
  wordmark,                 // render "Hisably" wordmark top-left instead of title
  subtitle,                 // line under the title inside the hero
  subtitleMono = false,
  leftIcon,                 // Ionicons name ('arrow-back', 'notifications-outline', 'menu')
  onLeftPress,
  rightIcons = [],          // [{ name, onPress, badge }]
  avatar,                   // initials string ("RK") → circle top-right
  onAvatarPress,
  heroExtra,                // custom node in the hero below the title (filter chips, greeting)
  scroll = true,
  contentStyle,
  sheetBg = colors.bg,
}) => {
  const insets = useSafeAreaInsets();
  const Body = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? { contentContainerStyle: [styles.sheetContent, contentStyle], showsVerticalScrollIndicator: false }
    : { style: [styles.sheetStatic, contentStyle] };

  const hasTopRow = leftIcon || wordmark || rightIcons.length > 0 || avatar;

  return (
    <View style={[styles.root, { backgroundColor: colors.primary }]}>
      <View style={[styles.hero, { paddingTop: insets.top + 12, height: heroHeight + insets.top }]}>
        {hasTopRow && (
          <View style={styles.topRow}>
            <View style={styles.topLeft}>
              {leftIcon ? (
                <TouchableOpacity onPress={onLeftPress} hitSlop={hit} style={styles.iconBtn}>
                  <Ionicons name={leftIcon} size={24} color={colors.white} />
                </TouchableOpacity>
              ) : wordmark ? (
                <Text style={[typography.wordmark, styles.wordmark]}>Hisably</Text>
              ) : <View />}
            </View>
            <View style={styles.topRight}>
              {rightIcons.map((ic, i) => (
                <TouchableOpacity key={i} onPress={ic.onPress} hitSlop={hit} style={styles.iconBtn}>
                  <Ionicons name={ic.name} size={22} color={colors.white} />
                  {ic.badge != null && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{ic.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {avatar != null && (
                <TouchableOpacity onPress={onAvatarPress} style={styles.avatar} activeOpacity={0.8}>
                  <Text style={styles.avatarText}>{avatar}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {title ? (
          <Text style={[typography.heroTitle, styles.title, { textAlign: titleAlign }]}>{title}</Text>
        ) : null}
        {subtitle ? (
          <Text style={[subtitleMono ? typography.monoLabel : typography.body, styles.subtitle, { textAlign: titleAlign }]}>
            {subtitle}
          </Text>
        ) : null}
        {heroExtra}
      </View>

      <View style={[styles.sheet, { backgroundColor: sheetBg }]}>
        <Body {...bodyProps}>{children}</Body>
      </View>
    </View>
  );
};

const hit = { top: 10, bottom: 10, left: 10, right: 10 };

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: spacing.screenH },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 40 },
  topLeft: { flexDirection: 'row', alignItems: 'center' },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 14, padding: 2 },
  wordmark: { color: colors.white },
  title: { color: colors.white, marginTop: 10 },
  subtitle: { color: 'rgba(255,255,255,0.82)', marginTop: 6 },
  avatar: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center', marginLeft: 14,
  },
  avatarText: { color: colors.white, fontFamily: typography.labelBold.fontFamily, fontSize: 13 },
  badge: {
    position: 'absolute', top: -4, right: -6, minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontFamily: typography.caption.fontFamily },
  sheet: {
    flex: 1,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    marginTop: -24,
  },
  sheetContent: { paddingHorizontal: spacing.screenH, paddingTop: spacing.sheetTop, paddingBottom: 120 },
  sheetStatic: { flex: 1, paddingHorizontal: spacing.screenH, paddingTop: spacing.sheetTop },
});

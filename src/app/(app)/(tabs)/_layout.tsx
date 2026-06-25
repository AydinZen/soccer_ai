import Ionicons from '@expo/vector-icons/Ionicons';
import { Slot, usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { BRAND } from '@/constants/ui';
import { useTheme } from '@/hooks/use-theme';

type NavItem = { href: string; label: string; icon: keyof typeof Ionicons.glyphMap };

const NAV: NavItem[] = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/upload', label: 'Upload', icon: 'cloud-upload' },
  { href: '/progress', label: 'Progress', icon: 'stats-chart' },
  { href: '/profile', label: 'Profile', icon: 'person-circle' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname === '/index';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Wide screens (desktop) get a left sidebar; narrow screens get a bottom bar. */
export default function TabsLayout() {
  const { width } = useWindowDimensions();
  return width >= 760 ? <SidebarLayout /> : <BottomBarLayout />;
}

function SidebarLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();

  return (
    <ThemedView style={styles.rowRoot}>
      <View style={[styles.sidebar, { borderRightColor: theme.backgroundElement }]}>
        <View style={styles.brand}>
          <ThemedText style={styles.brandEmoji}>⚽</ThemedText>
          <ThemedText style={styles.brandText}>PitchIQ</ThemedText>
        </View>

        <View style={styles.navList}>
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Pressable
                key={item.href}
                onPress={() => router.navigate(item.href as never)}
                style={({ pressed }) => [
                  styles.navItem,
                  active && { backgroundColor: BRAND },
                  pressed && !active && { backgroundColor: theme.backgroundElement },
                ]}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={active ? '#fff' : theme.textSecondary}
                />
                <ThemedText
                  style={[styles.navLabel, { color: active ? '#fff' : theme.text }]}>
                  {item.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sidebarFooter}>
          <ThemedText type="small" themeColor="textSecondary">
            Powered by Claude
          </ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <Slot />
      </View>
    </ThemedView>
  );
}

function BottomBarLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();

  return (
    <ThemedView style={styles.colRoot}>
      <View style={styles.content}>
        <Slot />
      </View>
      <View style={[styles.bottomBar, { borderTopColor: theme.backgroundElement, backgroundColor: theme.background }]}>
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Pressable
              key={item.href}
              onPress={() => router.navigate(item.href as never)}
              style={styles.bottomItem}>
              <Ionicons
                name={item.icon}
                size={24}
                color={active ? BRAND : theme.textSecondary}
              />
              <ThemedText
                style={[styles.bottomLabel, { color: active ? BRAND : theme.textSecondary }]}>
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  rowRoot: { flex: 1, flexDirection: 'row' },
  colRoot: { flex: 1, flexDirection: 'column' },
  content: { flex: 1 },

  sidebar: {
    width: 244,
    borderRightWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.two },
  brandEmoji: { fontSize: 26 },
  brandText: { fontSize: 20, fontWeight: '800' },

  navList: { gap: 6, marginTop: Spacing.four },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderRadius: 12,
  },
  navLabel: { fontSize: 15, fontWeight: '700' },

  sidebarFooter: { marginTop: 'auto', paddingHorizontal: Spacing.two },

  bottomBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: Spacing.two,
    paddingBottom: Spacing.three,
  },
  bottomItem: { flex: 1, alignItems: 'center', gap: 3 },
  bottomLabel: { fontSize: 11, fontWeight: '700' },
});

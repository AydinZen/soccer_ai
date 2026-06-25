import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { BRAND } from '@/constants/ui';
import { useAuth } from '@/contexts/AuthProvider';
import { useTheme } from '@/hooks/use-theme';
import { POSITION_LABELS } from '@/types/profile';

export default function Home() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Player';
  const theme = useTheme();

  return (
    <Screen>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: BRAND }]}>
        <ThemedText style={styles.heroEmoji}>⚽</ThemedText>
        <ThemedText style={styles.heroTitle}>AI Soccer Coach</ThemedText>
        <ThemedText style={styles.heroSub}>
          Upload a match clip and get an instant breakdown of your game — strengths, weaknesses, and
          a personalized drill plan.
        </ThemedText>
        <Pressable style={styles.heroBtn} onPress={() => router.navigate('/upload')}>
          <ThemedText style={[styles.heroBtnText, { color: BRAND }]}>Analyze my game →</ThemedText>
        </Pressable>
      </View>

      {/* Welcome */}
      <View style={styles.welcome}>
        <ThemedText type="subtitle">Hey {firstName} 👋</ThemedText>
        {profile?.position ? (
          <ThemedText type="small" themeColor="textSecondary">
            {POSITION_LABELS[profile.position]}
          </ThemedText>
        ) : null}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {(['Clips', 'Avg Rating', 'Drills'] as const).map((label, i) => (
          <ThemedView key={label} type="backgroundElement" style={styles.statCard}>
            <ThemedText style={styles.statNum}>{i === 1 ? '—' : '0'}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {label}
            </ThemedText>
          </ThemedView>
        ))}
      </View>

      {/* How it works */}
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold" style={styles.cardTitle}>
          How it works
        </ThemedText>
        <Step n="1" text="Film yourself during a real match or training session" />
        <Step n="2" text="Tell us your jersey color, number, and position" />
        <Step n="3" text="Get AI coaching feedback and a custom drill plan in minutes" />
      </ThemedView>
    </Screen>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepBadge}>
        <ThemedText style={styles.stepNum}>{n}</ThemedText>
      </View>
      <ThemedText type="small" style={{ flex: 1 }}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  heroEmoji: { fontSize: 44 },
  heroTitle: { fontSize: 26, fontWeight: '700', color: '#fff', lineHeight: 32 },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
  heroBtn: {
    marginTop: Spacing.one,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroBtnText: { fontWeight: '700', fontSize: 15 },
  welcome: { gap: 2, marginTop: Spacing.one },
  statsRow: { flexDirection: 'row', gap: Spacing.two },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 2,
  },
  statNum: { fontSize: 26, fontWeight: '700', lineHeight: 32 },
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.three },
  cardTitle: { marginBottom: -Spacing.one },
  step: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNum: { color: '#fff', fontWeight: '700', fontSize: 14, lineHeight: 18 },
});

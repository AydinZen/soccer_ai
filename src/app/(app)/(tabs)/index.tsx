import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PopCard } from '@/components/ui/pop-card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { ACCENTS, HERO_GRADIENT, SHADOW } from '@/constants/ui';
import { useAuth } from '@/contexts/AuthProvider';
import { useAnalyses } from '@/hooks/use-analyses';
import { POSITION_LABELS } from '@/types/profile';

const FEATURES = [
  { icon: '🎯', title: 'Skill Scores', text: 'Rated on finishing, movement, first touch & more', accent: ACCENTS.blue },
  { icon: '💪', title: 'Strengths', text: 'See what you already do well on the pitch', accent: ACCENTS.green },
  { icon: '🔍', title: 'Weak Spots', text: 'Honest, specific areas to work on next', accent: ACCENTS.orange },
  { icon: '🏋️', title: 'Drill Plan', text: 'Custom drills built around your game', accent: ACCENTS.violet },
] as const;

export default function Home() {
  const { profile } = useAuth();
  const { stats } = useAnalyses();
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Player';

  return (
    <Screen maxWidth={1100}>
      {/* Hero */}
      <PopCard style={[styles.hero, SHADOW]}>
        <LinearGradient
          colors={HERO_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroInner}>
          <View style={styles.heroBadge}>
            <ThemedText style={styles.heroBadgeText}>⚽ PITCHIQ</ThemedText>
          </View>
          <ThemedText style={styles.heroTitle}>Level up your game</ThemedText>
          <ThemedText style={styles.heroSub}>
            Upload a match clip and get an instant pro-style breakdown — scores, strengths, and a
            personalized drill plan.
          </ThemedText>
          <Pressable style={styles.heroBtn} onPress={() => router.navigate('/upload')}>
            <ThemedText style={styles.heroBtnText}>Analyze my game →</ThemedText>
          </Pressable>
        </LinearGradient>
      </PopCard>

      {/* Welcome */}
      <View style={styles.welcome}>
        <ThemedText type="subtitle">Hey {firstName} 👋</ThemedText>
        {profile?.position ? (
          <View style={[styles.posChip, { backgroundColor: ACCENTS.green.tint }]}>
            <ThemedText style={[styles.posChipText, { color: ACCENTS.green.deep }]}>
              {POSITION_LABELS[profile.position]}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard num={String(stats.clipCount)} label="Clips" accent={ACCENTS.blue} delay={60} />
        <StatCard
          num={stats.avgRating != null ? stats.avgRating.toFixed(1) : '—'}
          label="Avg Rating"
          accent={ACCENTS.orange}
          delay={120}
        />
        <StatCard num={String(stats.drillCount)} label="Drills" accent={ACCENTS.violet} delay={180} />
      </View>

      {/* Feature grid */}
      <ThemedText type="smallBold" style={styles.sectionLabel}>
        WHAT YOU&apos;LL GET
      </ThemedText>
      <View style={styles.grid}>
        {FEATURES.map((f, i) => (
          <PopCard
            key={f.title}
            interactive
            delay={220 + i * 70}
            style={[styles.featureCard, { backgroundColor: f.accent.tint }, SHADOW]}>
            <ThemedText style={styles.featureIcon}>{f.icon}</ThemedText>
            <ThemedText style={[styles.featureTitle, { color: f.accent.deep }]}>
              {f.title}
            </ThemedText>
            <ThemedText style={[styles.featureText, { color: f.accent.deep }]}>{f.text}</ThemedText>
          </PopCard>
        ))}
      </View>

      {/* CTA banner */}
      <PopCard delay={500} style={[styles.ctaBanner, SHADOW]}>
        <LinearGradient
          colors={[ACCENTS.green.base, ACCENTS.cyan.base]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ctaInner}>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.ctaTitle}>Ready when you are</ThemedText>
            <ThemedText style={styles.ctaSub}>One clip is all it takes to start.</ThemedText>
          </View>
          <Pressable style={styles.ctaBtn} onPress={() => router.navigate('/upload')}>
            <ThemedText style={styles.ctaBtnText}>Upload</ThemedText>
          </Pressable>
        </LinearGradient>
      </PopCard>
    </Screen>
  );
}

function StatCard({
  num,
  label,
  accent,
  delay,
}: {
  num: string;
  label: string;
  accent: { base: string; tint: string; deep: string };
  delay: number;
}) {
  return (
    <PopCard interactive delay={delay} style={[styles.statCard, { backgroundColor: accent.tint }, SHADOW]}>
      <ThemedText style={[styles.statNum, { color: accent.base }]}>{num}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: accent.deep }]}>{label}</ThemedText>
    </PopCard>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 24, overflow: 'hidden' },
  heroInner: { padding: Spacing.four, gap: Spacing.two },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  heroBadgeText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#fff', lineHeight: 38 },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.9)', lineHeight: 22 },
  heroBtn: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.four,
    paddingVertical: 13,
    borderRadius: 14,
  },
  heroBtnText: { fontWeight: '800', fontSize: 15, color: '#2563EB' },

  welcome: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.one },
  posChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  posChipText: { fontWeight: '700', fontSize: 13 },

  statsRow: { flexDirection: 'row', gap: Spacing.two },
  statCard: { flex: 1, borderRadius: 18, paddingVertical: Spacing.three, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 30, fontWeight: '800', lineHeight: 36 },
  statLabel: { fontSize: 13, fontWeight: '600' },

  sectionLabel: { letterSpacing: 0.5, opacity: 0.6, marginTop: Spacing.one },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  featureCard: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 150,
    borderRadius: 18,
    padding: Spacing.three,
    gap: 4,
  },
  featureIcon: { fontSize: 28 },
  featureTitle: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  featureText: { fontSize: 13, lineHeight: 18, opacity: 0.85 },

  ctaBanner: { borderRadius: 20, overflow: 'hidden', marginTop: Spacing.one },
  ctaInner: {
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  ctaTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
  ctaSub: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  ctaBtn: { backgroundColor: '#fff', paddingHorizontal: Spacing.three, paddingVertical: 11, borderRadius: 12 },
  ctaBtnText: { color: '#16A34A', fontWeight: '800', fontSize: 14 },
});

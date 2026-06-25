import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { PopCard } from '@/components/ui/pop-card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { ACCENTS, BRAND, PITCH_GRADIENT, SHADOW } from '@/constants/ui';
import { useAuth } from '@/contexts/AuthProvider';
import { useAnalyses } from '@/hooks/use-analyses';
import { useTheme } from '@/hooks/use-theme';
import {
  SKILL_KEYS_BY_POSITION,
  SKILL_KEY_LABELS,
  type Analysis,
  type AnalysisResult,
} from '@/types/analysis';
import { POSITION_LABELS } from '@/types/profile';

export default function Progress() {
  const theme = useTheme();
  const { profile } = useAuth();
  const { analyses, stats } = useAnalyses();

  // Show real averaged skill axes once we have them; otherwise list the
  // player's position-specific skills as empty placeholders.
  const skillRows =
    stats.skillAverages.length > 0
      ? stats.skillAverages.map((s) => ({ label: s.label, value: s.value as number | null }))
      : (SKILL_KEYS_BY_POSITION[profile?.position ?? 'forward'] ?? []).map((key) => ({
          label: SKILL_KEY_LABELS[key] ?? key,
          value: null as number | null,
        }));

  const recent = analyses.filter(
    (a): a is Analysis & { result: AnalysisResult } => a.status === 'complete' && !!a.result,
  );

  return (
    <Screen maxWidth={1100}>
      {/* Header card */}
      <LinearGradient
        colors={PITCH_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <ThemedText style={styles.headerLabel}>📈 YOUR PROGRESS</ThemedText>
        <ThemedText style={styles.headerTitle}>Track every match</ThemedText>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <ThemedText style={styles.headerStatNum}>{stats.clipCount}</ThemedText>
            <ThemedText style={styles.headerStatLabel}>Analyses</ThemedText>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <ThemedText style={styles.headerStatNum}>
              {stats.avgRating != null ? stats.avgRating.toFixed(1) : '—'}
            </ThemedText>
            <ThemedText style={styles.headerStatLabel}>Overall</ThemedText>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <ThemedText style={styles.headerStatNum}>{stats.drillCount}</ThemedText>
            <ThemedText style={styles.headerStatLabel}>Drills</ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Skill ratings */}
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Skill Ratings</ThemedText>
        {skillRows.map((skill) => (
          <View key={skill.label} style={styles.barRow}>
            <ThemedText type="small" style={styles.barLabel}>
              {skill.label}
            </ThemedText>
            <View style={[styles.barTrack, { backgroundColor: theme.backgroundSelected }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${skill.value != null ? Math.min(100, Math.max(0, skill.value * 10)) : 0}%`,
                    backgroundColor: ACCENTS.blue.base,
                  },
                ]}
              />
            </View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.barVal}>
              {skill.value != null ? skill.value.toFixed(1) : '—'}
            </ThemedText>
          </View>
        ))}
      </ThemedView>

      {/* Recent analyses */}
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Recent Analyses</ThemedText>
        {recent.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: ACCENTS.violet.tint }]}>
              <ThemedText style={styles.emptyIcon}>🎬</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
              No analyses yet. Upload a match clip and your performance history will build up here.
            </ThemedText>
          </View>
        ) : (
          recent.map((a, i) => (
            <PopCard
              key={a.id}
              delay={60 + i * 50}
              style={[styles.recentRow, { backgroundColor: theme.background }, SHADOW]}>
              <View style={[styles.ratingBadge, { backgroundColor: BRAND }]}>
                <ThemedText style={styles.ratingBadgeText}>
                  {a.result.overall_rating.toFixed(1)}
                </ThemedText>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <ThemedText type="smallBold">
                  {POSITION_LABELS[a.result.player.position] ?? 'Clip'} · {formatDate(a.created_at)}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                  {a.result.overall_summary}
                </ThemedText>
              </View>
            </PopCard>
          ))
        )}
      </ThemedView>

      <Button title="Upload a clip" onPress={() => router.navigate('/upload')} />
    </Screen>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  header: { borderRadius: 24, padding: Spacing.four, gap: Spacing.one },
  headerLabel: { color: 'rgba(255,255,255,0.9)', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '800', lineHeight: 32 },
  headerStats: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.three },
  headerStat: { flex: 1, alignItems: 'center', gap: 2 },
  headerStatNum: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerStatLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  headerDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.3)' },

  card: { borderRadius: 18, padding: Spacing.three, gap: Spacing.two },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  barLabel: { width: 120 },
  barTrack: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  barVal: { width: 28, textAlign: 'right' },

  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 14,
  },
  ratingBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBadgeText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  emptyState: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.three },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: { fontSize: 32 },
});

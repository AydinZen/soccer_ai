import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { BRAND } from '@/constants/ui';
import { useTheme } from '@/hooks/use-theme';

const SKILL_LABELS: Record<string, string> = {
  Finishing: '—',
  'First Touch': '—',
  Movement: '—',
  Dribbling: '—',
  Pressing: '—',
};

export default function Progress() {
  const theme = useTheme();

  return (
    <Screen>
      <ThemedText type="subtitle">Your Progress</ThemedText>

      {/* Skill ratings card */}
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.cardHeader}>
          <ThemedText type="smallBold">Skill Ratings</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            per analysis
          </ThemedText>
        </View>
        {Object.entries(SKILL_LABELS).map(([skill, val]) => (
          <View key={skill} style={styles.barRow}>
            <ThemedText type="small" style={styles.barLabel}>
              {skill}
            </ThemedText>
            <View style={[styles.barTrack, { backgroundColor: theme.backgroundSelected }]}>
              <View style={[styles.barFill, { width: '0%', backgroundColor: BRAND }]} />
            </View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.barVal}>
              {val}
            </ThemedText>
          </View>
        ))}
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Upload your first clip to unlock your ratings.
        </ThemedText>
      </ThemedView>

      {/* Recent analyses */}
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Recent Analyses</ThemedText>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyIcon}>🎬</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
            No analyses yet. Upload a match clip and the AI coach will break down your performance.
          </ThemedText>
        </View>
      </ThemedView>

      <Button title="Upload a clip" onPress={() => router.navigate('/upload')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  barLabel: { width: 88 },
  barTrack: { flex: 1, height: 8, borderRadius: 4 },
  barFill: { height: 8, borderRadius: 4 },
  barVal: { width: 20, textAlign: 'right' },
  hint: { marginTop: Spacing.one },
  emptyState: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.three },
  emptyIcon: { fontSize: 40 },
});

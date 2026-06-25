import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { ACCENTS, PITCH_GRADIENT } from '@/constants/ui';
import { useTheme } from '@/hooks/use-theme';

const SKILLS = ['Finishing', 'First Touch', 'Movement', 'Dribbling', 'Pressing'];

export default function Progress() {
  const theme = useTheme();

  return (
    <Screen>
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
            <ThemedText style={styles.headerStatNum}>0</ThemedText>
            <ThemedText style={styles.headerStatLabel}>Analyses</ThemedText>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <ThemedText style={styles.headerStatNum}>—</ThemedText>
            <ThemedText style={styles.headerStatLabel}>Overall</ThemedText>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <ThemedText style={styles.headerStatNum}>0</ThemedText>
            <ThemedText style={styles.headerStatLabel}>Drills done</ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Skill ratings */}
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Skill Ratings</ThemedText>
        {SKILLS.map((skill) => (
          <View key={skill} style={styles.barRow}>
            <ThemedText type="small" style={styles.barLabel}>
              {skill}
            </ThemedText>
            <View style={[styles.barTrack, { backgroundColor: theme.backgroundSelected }]}>
              <View style={[styles.barFill, { width: '0%', backgroundColor: ACCENTS.blue.base }]} />
            </View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.barVal}>
              —
            </ThemedText>
          </View>
        ))}
      </ThemedView>

      {/* Recent analyses empty state */}
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Recent Analyses</ThemedText>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: ACCENTS.violet.tint }]}>
            <ThemedText style={styles.emptyIcon}>🎬</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
            No analyses yet. Upload a match clip and your performance history will build up here.
          </ThemedText>
        </View>
      </ThemedView>

      <Button title="Upload a clip" onPress={() => router.navigate('/upload')} />
    </Screen>
  );
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
  barLabel: { width: 88 },
  barTrack: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  barVal: { width: 24, textAlign: 'right' },

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

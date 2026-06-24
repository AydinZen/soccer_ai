import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { BRAND, DANGER } from '@/constants/ui';
import { useTheme } from '@/hooks/use-theme';
import { SKILL_KEY_LABELS, type AnalysisResult, type Severity } from '@/types/analysis';

const SEVERITY_COLOR: Record<Severity, string> = {
  minor: '#60646C',
  moderate: BRAND,
  major: DANGER,
};

/**
 * A first look at the AI breakdown, shown right after analysis completes. The
 * full, polished results screen (with the clip, per-drill detail, etc.) is
 * Step 4 — this proves the engine end-to-end and surfaces the real data.
 */
export function AnalysisResultPreview({
  result,
  onUploadAnother,
}: {
  result: AnalysisResult;
  onUploadAnother: () => void;
}) {
  const theme = useTheme();
  const card = { backgroundColor: theme.backgroundElement };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Your breakdown 🎯</ThemedText>
        <View style={[styles.ratingPill, { backgroundColor: BRAND }]}>
          <ThemedText type="smallBold" style={styles.ratingText}>
            {result.overall_rating.toFixed(1)}/10
          </ThemedText>
        </View>
      </View>

      <ThemedText type="default">{result.overall_summary}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Confidence: {result.confidence} · player clearly visible in {result.frames_analyzed} frame
        {result.frames_analyzed === 1 ? '' : 's'}
      </ThemedText>

      {/* Strengths */}
      <ThemedText type="smallBold" style={styles.sectionLabel}>
        STRENGTHS
      </ThemedText>
      {result.strengths.map((s, i) => (
        <View key={`str-${i}`} style={[styles.item, card]}>
          <ThemedText type="smallBold">✅ {s.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {s.detail}
          </ThemedText>
        </View>
      ))}

      {/* Weaknesses */}
      <ThemedText type="smallBold" style={styles.sectionLabel}>
        AREAS TO IMPROVE
      </ThemedText>
      {result.weaknesses.map((w, i) => (
        <View key={`wk-${i}`} style={[styles.item, card]}>
          <View style={styles.rowBetween}>
            <ThemedText type="smallBold">🎯 {w.title}</ThemedText>
            <ThemedText type="small" style={{ color: SEVERITY_COLOR[w.severity] }}>
              {w.severity}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {w.detail}
          </ThemedText>
        </View>
      ))}

      {/* Skill ratings */}
      {Object.keys(result.skill_ratings).length > 0 && (
        <>
          <ThemedText type="smallBold" style={styles.sectionLabel}>
            SKILL RATINGS
          </ThemedText>
          <View style={[styles.item, card]}>
            {Object.entries(result.skill_ratings).map(([key, value]) => (
              <View key={key} style={styles.skillRow}>
                <ThemedText type="small" style={styles.skillLabel}>
                  {SKILL_KEY_LABELS[key] ?? key}
                </ThemedText>
                <View style={[styles.barTrack, { backgroundColor: theme.backgroundSelected }]}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.min(100, Math.max(0, value * 10))}%`, backgroundColor: BRAND },
                    ]}
                  />
                </View>
                <ThemedText type="smallBold" style={styles.skillValue}>
                  {value.toFixed(1)}
                </ThemedText>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Drills */}
      <ThemedText type="smallBold" style={styles.sectionLabel}>
        YOUR DRILLS
      </ThemedText>
      {result.drills.map((d, i) => (
        <View key={`dr-${i}`} style={[styles.item, card]}>
          <View style={styles.rowBetween}>
            <ThemedText type="smallBold">⚽ {d.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {d.reps_or_duration}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {d.description}
          </ThemedText>
          <ThemedText type="small" style={{ color: BRAND }}>
            Why it helps: {d.why_it_helps}
          </ThemedText>
        </View>
      ))}

      {result.caveats.length > 0 && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.caveats}>
          Note: {result.caveats.join(' ')}
        </ThemedText>
      )}
      <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
        AI observations from still frames — a helpful guide, not a substitute for a human coach.
      </ThemedText>

      <Button title="Upload another clip" onPress={onUploadAnother} />
      <Button title="Back to home" variant="secondary" onPress={() => router.navigate('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two, paddingBottom: Spacing.five },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingPill: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: 999 },
  ratingText: { color: '#ffffff' },
  sectionLabel: { marginTop: Spacing.two, letterSpacing: 0.5 },
  item: { gap: Spacing.one, padding: Spacing.three, borderRadius: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  skillLabel: { flex: 1 },
  skillValue: { width: 32, textAlign: 'right' },
  barTrack: { flex: 1.2, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  caveats: { marginTop: Spacing.two, fontStyle: 'italic' },
  disclaimer: { marginTop: Spacing.one },
});

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { BRAND } from '@/constants/ui';
import { useTheme } from '@/hooks/use-theme';

export function UploadProgress({ progress }: { progress: number }) {
  const theme = useTheme();
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <View style={styles.wrap}>
      <ThemedText style={styles.icon}>☁️</ThemedText>
      <View style={styles.textBlock}>
        <ThemedText type="subtitle" style={styles.center}>
          Uploading your clip…
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.center}>
          Keep the app open while your clip uploads.
        </ThemedText>
      </View>

      <View style={styles.progressWrap}>
        <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
          <View style={[styles.fill, { width: `${pct}%` as `${number}%`, backgroundColor: BRAND }]} />
        </View>
        <ThemedText type="smallBold" style={{ color: BRAND }}>
          {pct}%
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.three },
  icon: { fontSize: 56 },
  textBlock: { gap: Spacing.one, width: '100%' },
  center: { textAlign: 'center' },
  progressWrap: { width: '100%', gap: Spacing.one },
  track: { height: 10, borderRadius: 5, overflow: 'hidden', width: '100%' },
  fill: { height: '100%', borderRadius: 5 },
});

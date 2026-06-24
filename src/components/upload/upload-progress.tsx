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
      <ThemedText type="title" style={styles.center}>
        Uploading…
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.center}>
        Keep the app open while your clip uploads.
      </ThemedText>

      <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: BRAND }]} />
      </View>
      <ThemedText type="smallBold" style={styles.center}>
        {pct}%
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: Spacing.three },
  center: { textAlign: 'center' },
  track: { height: 12, borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
});

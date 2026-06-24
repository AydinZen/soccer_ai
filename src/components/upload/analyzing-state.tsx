import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { BRAND } from '@/constants/ui';

/** Shown while the analyze-video Edge Function runs Claude over the frames (~10–40s). */
export function AnalyzingState() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={BRAND} />
      <ThemedText type="title" style={styles.center}>
        Analyzing your performance…
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.center}>
        Our AI coach is studying key moments from your clip. This takes about half
        a minute — keep the app open.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.three },
  center: { textAlign: 'center' },
});

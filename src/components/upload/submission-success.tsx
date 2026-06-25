import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { BRAND } from '@/constants/ui';

export function SubmissionSuccess({ onUploadAnother }: { onUploadAnother: () => void }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <ThemedText style={styles.icon}>✅</ThemedText>
      </View>

      <View style={styles.textBlock}>
        <ThemedText type="subtitle" style={styles.center}>
          Clip uploaded!
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.center}>
          Your clip is being analyzed. Add your Anthropic API key to get your full coaching
          breakdown.
        </ThemedText>
      </View>

      <ThemedView type="backgroundElement" style={styles.infoCard}>
        <Row icon="⚽" text="Video saved to your account" />
        <Row icon="🤖" text="AI coach will score your performance" />
        <Row icon="🏋️" text="Personalized drill plan coming soon" />
      </ThemedView>

      <Button title="Upload another clip" onPress={onUploadAnother} />
      <Button title="Back to home" variant="secondary" onPress={() => router.navigate('/')} />
    </View>
  );
}

function Row({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.rowIcon}>{icon}</ThemedText>
      <ThemedText type="small" style={{ flex: 1 }}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: Spacing.three },
  iconWrap: { alignItems: 'center' },
  icon: { fontSize: 64 },
  textBlock: { gap: Spacing.one },
  center: { textAlign: 'center' },
  infoCard: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  rowIcon: { fontSize: 20, width: 28, textAlign: 'center' },
});

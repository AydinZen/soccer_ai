import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

export function SubmissionSuccess({ onUploadAnother }: { onUploadAnother: () => void }) {
  return (
    <View style={styles.wrap}>
      <ThemedText type="title" style={styles.center}>
        You&apos;re all set 🎯
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.center}>
        Your clip is uploaded and queued for analysis. We&apos;ll break down your performance soon.
      </ThemedText>

      <Button title="Upload another clip" onPress={onUploadAnother} />
      <Button title="Back to home" variant="secondary" onPress={() => router.navigate('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: Spacing.three },
  center: { textAlign: 'center' },
});

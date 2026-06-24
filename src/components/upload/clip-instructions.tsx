import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { MAX_VIDEO_MB, RECORD_MAX_SECONDS } from '@/lib/videos';

const TIPS = [
  'Upload a clip where YOU are clearly visible and involved.',
  'Trim out moments where you are off screen.',
  `Keep it short — around ${RECORD_MAX_SECONDS} seconds of your best involvement.`,
  'Steady camera and decent lighting help the AI track you.',
];

/** Step 2, Part B — sets expectations so every second of footage features the user. */
export function ClipInstructions({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <View style={{ gap: Spacing.three }}>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="title">Pick a good clip</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Every second the AI analyzes should feature you.
        </ThemedText>
      </View>

      <ThemedView type="backgroundElement" style={{ borderRadius: 16, padding: Spacing.three, gap: Spacing.two }}>
        {TIPS.map((tip) => (
          <View key={tip} style={{ flexDirection: 'row', gap: Spacing.two }}>
            <ThemedText type="default">•</ThemedText>
            <ThemedText type="default" style={{ flex: 1 }}>
              {tip}
            </ThemedText>
          </View>
        ))}
      </ThemedView>

      <ThemedText type="small" themeColor="textSecondary">
        Clips must be under {MAX_VIDEO_MB} MB for now (about a minute of phone video). Support for
        longer matches is coming.
      </ThemedText>

      <Button title="Choose video" onPress={onContinue} />
      <Button title="Back" variant="secondary" onPress={onBack} />
    </View>
  );
}

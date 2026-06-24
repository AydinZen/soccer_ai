import { router } from 'expo-router';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthProvider';
import { POSITION_LABELS } from '@/types/profile';

export default function Home() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  return (
    <Screen>
      <View style={{ gap: Spacing.one, marginBottom: Spacing.two }}>
        <ThemedText type="small" themeColor="textSecondary">
          Welcome back
        </ThemedText>
        <ThemedText type="title">Hi {firstName} 👋</ThemedText>
        {profile?.position ? (
          <ThemedText type="default" themeColor="textSecondary">
            Playing as {POSITION_LABELS[profile.position]}
          </ThemedText>
        ) : null}
      </View>

      <ThemedView type="backgroundElement" style={{ borderRadius: 16, padding: Spacing.four, gap: Spacing.two }}>
        <ThemedText type="subtitle">Get your first breakdown</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Upload a clip of yourself in a match and the AI coach will score your game and build a
          training plan.
        </ThemedText>
        <Button
          title="Upload a match"
          onPress={() => router.navigate('/upload')}
          style={{ marginTop: Spacing.two }}
        />
      </ThemedView>

      <ThemedText
        type="small"
        themeColor="textSecondary"
        style={{ textAlign: 'center', marginTop: Spacing.two }}>
        Coming soon: match analysis, drills, and progress tracking.
      </ThemedText>
    </Screen>
  );
}

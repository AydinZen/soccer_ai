import { router } from 'expo-router';
import { View } from 'react-native';

import { ProfileForm } from '@/components/profile-form';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthProvider';

export default function ProfileSetup() {
  const { profile } = useAuth();

  return (
    <Screen>
      <View style={{ gap: Spacing.one, marginBottom: Spacing.two }}>
        <ThemedText type="title">Set up your profile</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Tell us about your game so the AI coach can tailor its analysis to you.
        </ThemedText>
      </View>

      <ProfileForm
        initial={profile}
        submitLabel="Continue"
        onSaved={() => router.replace('/')}
      />
    </Screen>
  );
}

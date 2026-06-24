import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

/**
 * Shown when `.env` has no real Supabase credentials yet, so the app gives clear
 * setup instructions instead of failing silently on the first network call.
 */
export function SetupRequired() {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title">Connect Supabase</ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            The app needs your Supabase project credentials before it can run.
          </ThemedText>

          <ThemedText type="subtitle">1. Add your keys</ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            Open the <ThemedText type="code">.env</ThemedText> file in the project root and set:
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.code}>
            <ThemedText type="code">
              EXPO_PUBLIC_SUPABASE_URL=...{'\n'}EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
            </ThemedText>
          </ThemedView>
          <ThemedText type="default" themeColor="textSecondary">
            Find both in your Supabase dashboard → Project Settings → API.
          </ThemedText>

          <ThemedText type="subtitle">2. Create the database</ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            Run <ThemedText type="code">supabase/migrations/0001_profiles.sql</ThemedText> in the
            Supabase SQL editor.
          </ThemedText>

          <ThemedText type="subtitle">3. Restart</ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            Stop the dev server and run <ThemedText type="code">npx expo start -c</ThemedText>.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  code: {
    borderRadius: 12,
    padding: Spacing.three,
  },
});

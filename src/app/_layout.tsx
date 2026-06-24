import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { SetupRequired } from '@/components/setup-required';
import { AuthProvider, useAuth } from '@/contexts/AuthProvider';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

// Child of AuthProvider so useAuth() resolves. Per React Compiler / Rules of
// Hooks: call every hook first, then branch.
function RootNavigator() {
  const { isLoading } = useAuth();

  if (!isSupabaseConfigured) return <SetupRequired />;
  if (isLoading) return null; // brief; native splash still covers cold start

  // DEV: skip auth gating; always show app. Remove this when you want auth back.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

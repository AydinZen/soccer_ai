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
  const { session, isLoading } = useAuth();

  if (!isSupabaseConfigured) return <SetupRequired />;
  if (isLoading) return null; // brief; native splash still covers cold start

  const isSignedIn = !!session;

  // Signed-in users get the app; everyone else gets the login/signup screens.
  // Guarded screens are removed from the nav state entirely (no manual redirects).
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

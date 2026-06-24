import { Stack } from 'expo-router';

import { useAuth } from '@/contexts/AuthProvider';

// Inside the app, gate on whether the one-time profile setup is done. Users
// without a complete profile (name + position + skill) are routed to
// profile-setup; everyone else goes straight to the tabs.
export default function AppLayout() {
  const hasProfile = true; // DEV BYPASS

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasProfile}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!hasProfile}>
        <Stack.Screen name="profile-setup" />
      </Stack.Protected>
    </Stack>
  );
}

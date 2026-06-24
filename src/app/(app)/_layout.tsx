import { Stack } from 'expo-router';

// DEV: auth/profile gating removed so you can browse the app without logging in.
// Land on the tabs by default. Restore the gated version (Stack.Protected on
// hasProfile) when you want the real signup → profile-setup flow back.
export const unstable_settings = { initialRouteName: '(tabs)' };

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile-setup" />
    </Stack>
  );
}

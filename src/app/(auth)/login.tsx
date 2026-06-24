import { Link } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { BRAND, DANGER } from '@/constants/ui';
import { Spacing } from '@/constants/theme';
import { friendlyAuthError } from '@/lib/auth-errors';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) setError(friendlyAuthError(signInError, 'login'));
    // On success the AuthProvider's onAuthStateChange flips the route automatically.
  }

  return (
    <Screen contentStyle={styles.centered}>
      <View style={styles.header}>
        <ThemedText type="title">Welcome back</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Log in to your Soccer AI Coach account.
        </ThemedText>
      </View>

      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        inputMode="email"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        autoComplete="current-password"
      />

      {error ? <ThemedText type="small" style={{ color: DANGER }}>{error}</ThemedText> : null}

      <Button title="Log in" onPress={handleLogin} loading={loading} />

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          No account?
        </ThemedText>
        <Link href="/signup">
          <ThemedText type="small" style={{ color: BRAND }}>
            Sign up
          </ThemedText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = {
  centered: { flexGrow: 1, justifyContent: 'center' as const },
  header: { gap: Spacing.one, marginBottom: Spacing.three },
  footer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
};

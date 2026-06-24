import { Link, router } from 'expo-router';
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

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSignup() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter an email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signUpError) {
      setError(friendlyAuthError(signUpError, 'signup'));
      return;
    }
    // Supabase returns a user with an empty `identities` array when the email
    // is already registered.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('That email is already registered. Try logging in.');
      return;
    }
    // Email confirmation ON (default): no session yet → ask them to confirm.
    if (!data.session) {
      setEmailSent(true);
      return;
    }
    // Confirmation OFF: a session exists → AuthProvider routes to profile setup.
  }

  if (emailSent) {
    return (
      <Screen contentStyle={styles.centered}>
        <ThemedText type="title">Check your email</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          We sent a confirmation link to {email.trim()}. Tap it to verify your account, then log in.
        </ThemedText>
        <Button title="Back to log in" variant="secondary" onPress={() => router.replace('/login')} />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.centered}>
      <View style={styles.header}>
        <ThemedText type="title">Create account</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Start getting AI breakdowns of your game.
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
        placeholder="At least 6 characters"
        secureTextEntry
        autoComplete="new-password"
      />
      <TextField
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Re-enter password"
        secureTextEntry
        autoComplete="new-password"
      />

      {error ? <ThemedText type="small" style={{ color: DANGER }}>{error}</ThemedText> : null}

      <Button title="Sign up" onPress={handleSignup} loading={loading} />

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          Have an account?
        </ThemedText>
        <Link href="/login">
          <ThemedText type="small" style={{ color: BRAND }}>
            Log in
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

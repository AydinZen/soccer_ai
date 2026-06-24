import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

/**
 * True only once real Supabase credentials have been provided in `.env`.
 * Until then the app shows a friendly setup screen instead of crashing on
 * every network call. (See `SetupRequired` + the root layout.)
 */
export const isSupabaseConfigured =
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  !supabaseUrl.includes('YOUR_PROJECT_REF') &&
  supabasePublishableKey.length > 0 &&
  !supabasePublishableKey.startsWith('your_');

// `createClient` throws on an empty URL, so fall back to a harmless placeholder
// when unconfigured. Every real call is gated behind `isSupabaseConfigured`.
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabasePublishableKey : 'placeholder-anon-key',
  {
    auth: {
      // MVP: the session is stored in AsyncStorage (plaintext on device). This
      // keeps the app runnable in Expo Go. For production, swap `storage` for an
      // encrypted adapter (expo-secure-store + aes-js "LargeSecureStore"); see
      // SETUP.md → "Production hardening".
      ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // must be false on native
      lock: processLock,
    },
  },
);

// Keep the auth token fresh while the app is foregrounded (native only).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

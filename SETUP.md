# Soccer AI Coach — Setup (Step 1: Auth & Profiles)

A React Native (Expo SDK 56) + Supabase app. Step 1 implements email/password
authentication and user profiles. The app **runs in Expo Go** — no native build
required.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Open **Project Settings → API** and copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **Publishable key** (a.k.a. anon key) → `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## 2. Add your credentials

Edit `.env` in the project root (it is git-ignored):

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_or_anon_key
```

> Never put the `service_role` key here — it bypasses Row Level Security and
> would ship inside the app bundle.

## 3. Create the database

In the Supabase dashboard, open the **SQL Editor** and run each migration in
`supabase/migrations/` in order:

1. [`0001_profiles.sql`](supabase/migrations/0001_profiles.sql) — the `profiles`
   table, RLS policies, auto-create-profile trigger, and public `avatars` bucket.
2. [`0002_videos.sql`](supabase/migrations/0002_videos.sql) — the `videos` table,
   RLS policies, and the private `videos` storage bucket for match uploads.

> **Video size limit:** the `videos` bucket is capped at **50 MB/file** — the
> Supabase **free-tier** ceiling (≈1 minute of phone video). On a Pro plan, raise
> the bucket's `file_size_limit` in `0002_videos.sql` *and* the global limit under
> Storage → Settings, then bump `MAX_VIDEO_MB` in `src/lib/videos.ts`. True
> client-side compression isn't possible in Expo Go (it needs a native module /
> dev build), so we size-guard instead.

## 4. (Optional) Email confirmation

By default Supabase requires email confirmation. With it **on**, signing up shows
a "check your email" screen; the user confirms via the emailed link, then logs
in. To skip this while developing, turn it off under **Authentication →
Providers → Email → "Confirm email"**.

## 5. Run the app

```bash
npm install        # if you haven't already
npx expo start     # then scan the QR code with Expo Go (iOS/Android)
```

If you change a value in `.env`, restart with a clear cache: `npx expo start -c`.

---

## What you can do in Step 1

- **Sign up / log in** with email + password.
- **Profile setup** (required once): name, age, position, skill level, bio, and
  an optional profile photo.
- **Home / Upload / Progress / Profile** tabs (Upload & Progress are Step 2/6
  placeholders).
- **Edit profile** and **sign out** from the Profile tab.

## Architecture notes

- `src/lib/supabase.ts` — Supabase client (session persisted in AsyncStorage).
- `src/contexts/AuthProvider.tsx` — session + profile state via `onAuthStateChange`.
- `src/app/_layout.tsx` — auth gate using `Stack.Protected` (signed-out → `(auth)`,
  signed-in → `(app)`; within `(app)`, incomplete profile → `profile-setup`).
- `src/components/profile-form.tsx` — shared by profile-setup and profile editing.

## Production hardening (later)

These were intentionally deferred to keep the app running in Expo Go:

1. **Encrypted session storage.** Sessions are currently stored in AsyncStorage
   (plaintext on device). For production, swap the `storage` adapter in
   `src/lib/supabase.ts` for an encrypted `LargeSecureStore`
   (`expo-secure-store` + `aes-js` + `react-native-get-random-values`). This
   requires a development build (those modules aren't in Expo Go).
2. **Better keyboard handling.** The forms use `KeyboardAvoidingView`. For a
   polished multi-field experience, add `react-native-keyboard-controller`
   (also requires a development build).
3. **Social SSO** (Google/Apple) — the plan mentions it; can be added with
   Supabase OAuth + `expo-web-browser` and the `socceraicoach://` scheme.

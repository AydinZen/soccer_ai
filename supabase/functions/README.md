# Supabase Edge Functions

## `analyze-video` (Step 3 — AI Analysis Engine)

The secure server-side broker that turns a set of client-extracted frames into a
structured coaching analysis. It is the **only** place the Anthropic API key is
ever read — the key lives as a Supabase secret, never in the app bundle.

### What it does
1. Verifies the caller's JWT and that they own the video.
2. Reads the player-ID context from the `videos` row + `skill_level` from their `profiles` row.
3. Creates an `analyses` row (`status = 'processing'`) and sets `videos.status = 'analyzing'`.
4. Sends the frames + a coaching system prompt to Claude, forcing one structured tool call.
5. Stores the result (`status = 'complete'`) and returns the row to the app.

---

## One-time setup

### 0. Prerequisites
- Run the SQL migrations first (in the Supabase SQL editor), in order:
  `0001_profiles.sql`, `0002_videos.sql`, `0003_analyses.sql`.
- Install the Supabase CLI: `brew install supabase/tap/supabase` (or see supabase.com/docs/guides/cli).

### 1. Link the project
```sh
supabase login
supabase link --project-ref owsxtedurmkrdehlsbid   # your project ref
```

### 2. Set the secret (NEVER commit this; NEVER use EXPO_PUBLIC_)
```sh
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are injected
automatically — you do **not** set those.

### 3. Deploy
```sh
supabase functions deploy analyze-video
```

> Don't have the CLI? You can also paste `analyze-video/index.ts` into
> Dashboard → Edge Functions → Create a function, and set the secret under
> Edge Functions → Manage secrets.

---

## Local development
```sh
# put ANTHROPIC_API_KEY in supabase/functions/.env  (git-ignored)
supabase functions serve analyze-video --env-file supabase/functions/.env
```

## Notes
- Model is set by `ANALYSIS_MODEL` in `index.ts` (default `claude-sonnet-4-6`;
  swap to `claude-opus-4-8` for the highest-fidelity vision).
- The call is synchronous (~10–40s) and well within the Edge wall-clock budget
  (150s free / 400s pro). Frames are extracted on the client because Edge
  Functions cannot run ffmpeg.
- Requires an authenticated user — it cannot run in the app's no-login preview mode.

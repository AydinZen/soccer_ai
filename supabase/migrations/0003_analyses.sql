-- =========================================================
-- 0003_analyses.sql
-- Step 3 — AI analysis results for Soccer AI Coach.
-- Paste this whole file into the Supabase SQL editor and run it once
-- (after 0001_profiles.sql and 0002_videos.sql).
-- =========================================================

-- 1. Analyses table (one row per analysis run; a video may be re-analyzed).
--    `result` holds the full structured JSON the Edge Function gets back from
--    Claude (see src/types/analysis.ts). We keep it as jsonb rather than
--    normalized child tables because the Step 4 results screen renders the whole
--    shape and Step 6 reads the numeric ratings straight out of it.
create table public.analyses (
  id            uuid primary key default gen_random_uuid(),
  video_id      uuid not null references public.videos (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  status        text not null default 'pending'
    check (status in ('pending', 'processing', 'complete', 'failed')),
  result        jsonb,                 -- the SoccerCoachingAnalysis object, when complete
  model_used    text,                  -- e.g. 'claude-sonnet-4-6' — recorded for auditing
  error         text,                  -- failure reason, when status = 'failed'
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

create index analyses_video_id_idx on public.analyses (video_id);
create index analyses_user_id_idx  on public.analyses (user_id);
-- Fast "latest analysis for this video" lookups (Step 4 results screen).
create index analyses_video_recent_idx
  on public.analyses (video_id, created_at desc);

grant select, insert, update, delete on public.analyses to authenticated;

-- 2. Row Level Security — a user may read/write only their own rows.
--    The Edge Function writes via the service_role key, which BYPASSES RLS,
--    so these policies only constrain the client.
alter table public.analyses enable row level security;

create policy "Users can view their own analyses."
  on public.analyses for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own analyses."
  on public.analyses for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own analyses."
  on public.analyses for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own analyses."
  on public.analyses for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 3. (OPTIONAL) Realtime — only needed if you later switch from the synchronous
--    Edge Function call to a fire-and-forget + live-subscribe pattern. The RLS
--    above already scopes which rows a client may receive. Left commented for v1
--    because the analyze-video function returns the result inline.
-- alter publication supabase_realtime add table public.analyses;

-- =========================================================
-- 0002_videos.sql
-- Step 2 — match videos + player identification for Soccer AI Coach.
-- Paste this whole file into the Supabase SQL editor and run it once
-- (after 0001_profiles.sql).
-- =========================================================

-- 1. Videos table (one row per uploaded clip / submission)
create table public.videos (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  storage_path    text not null,                       -- bucket-relative, '<uid>/<ts>.mp4'
  duration        integer,                             -- seconds
  file_size       bigint,                              -- bytes (best-effort from picker)
  status          text not null default 'pending'
    check (status in ('pending', 'analyzing', 'complete', 'error')),
  -- player identification (Step 2, Part A)
  jersey_color    text,
  jersey_number   integer,
  position_played text
    check (position_played in ('gk', 'defender', 'midfielder', 'forward')),
  pitch_side      text not null
    check (pitch_side in ('left', 'center', 'right')),
  created_at      timestamptz not null default now()
);

create index videos_user_id_idx on public.videos (user_id);
create index videos_status_idx on public.videos (status); -- Step 3 will poll pending rows

grant select, insert, update, delete on public.videos to authenticated;

-- 2. Row Level Security — a user may read/write only their own rows.
alter table public.videos enable row level security;

create policy "Users can view their own videos."
  on public.videos for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own videos."
  on public.videos for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own videos."
  on public.videos for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own videos."
  on public.videos for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 3. Private 'videos' storage bucket.
--    file_size_limit is in BYTES. 52428800 = 50 MB = the Supabase FREE-tier
--    per-file ceiling. On a Pro plan you can raise this (and the global limit
--    under Storage → Settings) — also bump MAX_VIDEO_MB in src/lib/videos.ts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', false, 52428800, array['video/mp4', 'video/quicktime'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 4. Storage object RLS — the path's first folder must equal the user id.
create policy "Users can upload to their own video folder."
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can read their own videos."
  on storage.objects for select to authenticated
  using (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can delete their own videos."
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
-- The SELECT policy is what lets createSignedUrl resolve objects in a private
-- bucket. No UPDATE policy: uploads use unique timestamped paths (x-upsert=false).

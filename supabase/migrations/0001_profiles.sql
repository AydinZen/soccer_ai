-- =========================================================
-- 0001_profiles.sql
-- Step 1 — user profiles for Soccer AI Coach.
-- Paste this whole file into the Supabase SQL editor and run it once.
-- =========================================================

-- 1. Profile table (one row per auth user)
create table public.profiles (
  id          uuid not null references auth.users (id) on delete cascade,
  full_name   text,
  age         integer check (age is null or (age >= 0 and age < 120)),
  position    text check (position in ('gk', 'defender', 'midfielder', 'forward')),
  skill_level text check (skill_level in ('beginner', 'intermediate', 'advanced')),
  bio         text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (id)
);

grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;

-- 2. Keep updated_at fresh on every update
create function public.handle_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_profile_updated_at();

-- 3. Auto-create a profile row when a new auth user signs up.
--    SECURITY DEFINER + empty search_path => every reference is schema-qualified.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Row Level Security — a user may read/write only their own row.
--    auth.uid() is wrapped in a sub-select for initPlan caching.
alter table public.profiles enable row level security;

create policy "Users can view their own profile."
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert their own profile."
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile."
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 5. Avatars storage bucket (public read) + per-user-folder write policies.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Users can upload their own avatar."
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can update their own avatar."
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can delete their own avatar."
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
-- Public bucket => files are served without needing a SELECT policy.

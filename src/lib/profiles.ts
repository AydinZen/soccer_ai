import { supabase } from '@/lib/supabase';
import type { Position, Profile, SkillLevel } from '@/types/profile';

/** Fetch the current user's profile row, or null if it doesn't exist yet. */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export type ProfileInput = {
  full_name: string;
  age: number | null;
  position: Position | null;
  skill_level: SkillLevel | null;
  bio: string | null;
  avatar_url?: string | null;
};

/**
 * Insert or update the user's profile. Uses upsert so it works whether or not
 * the `handle_new_user` trigger already seeded a row. RLS guarantees a user can
 * only write their own row (id = auth.uid()).
 */
export async function saveProfile(userId: string, input: ProfileInput): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    full_name: input.full_name,
    age: input.age,
    position: input.position,
    skill_level: input.skill_level,
    bio: input.bio,
    ...(input.avatar_url !== undefined ? { avatar_url: input.avatar_url } : {}),
  });
  if (error) throw error;
}

/**
 * Upload a picked image to the public `avatars` bucket and return its public
 * URL. The path MUST start with the user id (top-level folder) or the storage
 * RLS policy rejects it. A cache-busting query param ensures re-uploads show
 * immediately.
 */
export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  const ext = (uri.split('.').pop()?.split('?')[0] ?? 'jpg').toLowerCase();
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { contentType, upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

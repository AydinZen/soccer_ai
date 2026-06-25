import { supabase } from '@/lib/supabase';

const BUCKET = 'videos';

/**
 * Wipes the current user's analysis history and uploaded clips so every
 * dashboard returns to a clean slate. RLS already scopes each table to the
 * signed-in user; we also pass an explicit `user_id` filter because PostgREST
 * rejects unfiltered deletes. Storage files are removed best-effort last.
 */
export async function clearAllUserData(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You need to be signed in to reset your data.');
  const userId = user.id;

  // Analyses first. (They'd also cascade when their video is deleted, but
  // clearing them explicitly keeps this correct even if a row is orphaned.)
  const { error: aErr } = await supabase.from('analyses').delete().eq('user_id', userId);
  if (aErr) throw new Error(`Could not clear ratings: ${aErr.message}`);

  // Then the video rows.
  const { error: vErr } = await supabase.from('videos').delete().eq('user_id', userId);
  if (vErr) throw new Error(`Could not clear clips: ${vErr.message}`);

  // Finally the stored video files under the user's folder.
  const { data: files } = await supabase.storage.from(BUCKET).list(userId);
  if (files && files.length > 0) {
    await supabase.storage.from(BUCKET).remove(files.map((f) => `${userId}/${f.name}`));
  }
}

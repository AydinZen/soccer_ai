import { supabase } from '@/lib/supabase';
import type { ExtractedFrame } from '@/lib/frame-utils';
import type { Analysis } from '@/types/analysis';

/**
 * Kicks off AI analysis for an uploaded clip: sends the extracted frames to the
 * analyze-video Edge Function, which calls Claude (server-side, with the secret
 * API key), writes the structured result to the `analyses` table, and returns
 * the completed row inline.
 *
 * The call is synchronous — it resolves once Claude is done (~10–40s) — so the
 * UI can show an "Analyzing…" state and then the result. The row is also
 * persisted, so getLatestAnalysisForVideo can recover it if the request drops.
 */
export async function analyzeVideo(
  videoId: string,
  frames: ExtractedFrame[],
): Promise<Analysis> {
  const { data, error } = await supabase.functions.invoke('analyze-video', {
    body: { video_id: videoId, frames },
  });

  if (error) {
    // FunctionsHttpError carries the function's response; surface its message.
    let detail = error.message;
    try {
      const body = await (error as { context?: Response }).context?.json();
      if (body?.error) detail = body.error;
    } catch {
      // keep the generic message
    }
    throw new Error(detail);
  }
  return data as Analysis;
}

/** The most recent analysis for a clip (RLS scopes to the owner). */
export async function getLatestAnalysisForVideo(videoId: string): Promise<Analysis | null> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as Analysis) ?? null;
}

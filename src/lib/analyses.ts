import { supabase } from '@/lib/supabase';
import type { ExtractedFrame } from '@/lib/frame-utils';
import { SKILL_KEY_LABELS, type Analysis, type AnalysisResult } from '@/types/analysis';

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

/**
 * All of the current user's analyses, newest first (RLS scopes to the owner).
 * Powers the Home stat tiles and the Progress dashboard so an upload's grades
 * and ratings persist across every tab, not just the upload flow.
 */
export async function listUserAnalyses(): Promise<Analysis[]> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Analysis[];
}

/** One averaged skill axis for the progress bars. */
export type SkillAverage = { key: string; label: string; value: number };

/** Cross-clip totals derived from a list of analyses. */
export type AnalysisStats = {
  /** Completed analyses (a clip only counts once it has a result). */
  clipCount: number;
  /** Mean overall_rating across completed analyses, or null if none. */
  avgRating: number | null;
  /** Total drills recommended across every analysis. */
  drillCount: number;
  /** Per-skill averages across every analysis, in the order first seen. */
  skillAverages: SkillAverage[];
};

/**
 * Folds the raw analysis rows into the numbers the dashboards show. Only
 * `complete` rows with a result contribute; everything degrades gracefully to
 * zero / null / [] when the player hasn't analyzed anything yet.
 */
export function computeStats(analyses: Analysis[]): AnalysisStats {
  const results = analyses
    .filter((a) => a.status === 'complete' && a.result)
    .map((a) => a.result as AnalysisResult);

  const ratings = results
    .map((r) => r.overall_rating)
    .filter((n): n is number => typeof n === 'number');
  const avgRating = ratings.length
    ? ratings.reduce((sum, n) => sum + n, 0) / ratings.length
    : null;

  const drillCount = results.reduce((sum, r) => sum + (r.drills?.length ?? 0), 0);

  // Average each skill axis across every clip it appears in.
  const acc = new Map<string, { sum: number; n: number }>();
  for (const r of results) {
    for (const [key, value] of Object.entries(r.skill_ratings ?? {})) {
      if (typeof value !== 'number') continue;
      const cur = acc.get(key) ?? { sum: 0, n: 0 };
      cur.sum += value;
      cur.n += 1;
      acc.set(key, cur);
    }
  }
  const skillAverages: SkillAverage[] = [...acc.entries()].map(([key, { sum, n }]) => ({
    key,
    label: SKILL_KEY_LABELS[key] ?? key,
    value: sum / n,
  }));

  return { clipCount: results.length, avgRating, drillCount, skillAverages };
}

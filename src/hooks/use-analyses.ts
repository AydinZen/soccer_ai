import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { computeStats, listUserAnalyses, type AnalysisStats } from '@/lib/analyses';
import type { Analysis } from '@/types/analysis';

const EMPTY_STATS: AnalysisStats = {
  clipCount: 0,
  avgRating: null,
  drillCount: 0,
  skillAverages: [],
};

/**
 * Loads the user's analyses and derived stats, refetching whenever the screen
 * regains focus. That way grades from an upload appear on Home and Progress the
 * moment the player navigates back, without a manual refresh.
 */
export function useAnalyses() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState<AnalysisStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const rows = await listUserAnalyses();
      setAnalyses(rows);
      setStats(computeStats(rows));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your analyses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { analyses, stats, loading, error, reload: load };
}

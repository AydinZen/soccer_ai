import type { PitchSide, Position } from '@/types/video';
import type { SkillLevel } from '@/types/profile';

/**
 * The structured coaching analysis Claude returns for one clip. This is the
 * single source of truth shared by:
 *   - the analyze-video Edge Function (forces Claude to emit exactly this shape),
 *   - the Step 4 results screen (renders it), and
 *   - the Step 6 progress dashboard (charts overall_rating + skill_ratings).
 *
 * Keep this in sync with ANALYSIS_TOOL_SCHEMA in
 * supabase/functions/analyze-video/index.ts.
 */

export type Severity = 'minor' | 'moderate' | 'major';
export type Confidence = 'low' | 'medium' | 'high';

export type Strength = {
  title: string;
  detail: string;
};

export type Weakness = {
  title: string;
  detail: string;
  severity: Severity;
};

export type Drill = {
  name: string;
  description: string;
  why_it_helps: string;
  reps_or_duration: string;
  difficulty: SkillLevel;
  /** Title of the weakness this drill targets, or null for a general drill. */
  targets_weakness: string | null;
};

/** 0–10 ratings keyed by position-specific skill (e.g. finishing, marking). */
export type SkillRatings = Record<string, number>;

export type AnalysisResult = {
  schema_version: string;
  player: {
    position: Position;
    skill_level: SkillLevel;
    jersey_number: number | null;
    jersey_color: string | null;
    pitch_side: PitchSide;
  };
  overall_summary: string;
  /** Holistic 0–10, calibrated to the player's own skill level (not vs pros). */
  overall_rating: number;
  /** How confidently the target player was identifiable across the frames. */
  confidence: Confidence;
  /** How many supplied frames the player was clearly visible in. */
  frames_analyzed: number;
  strengths: Strength[];
  weaknesses: Weakness[];
  drills: Drill[];
  skill_ratings: SkillRatings;
  /** Honest, clip-specific limitations (e.g. "player hard to see after frame 4"). */
  caveats: string[];
};

export const ANALYSIS_STATUSES = ['pending', 'processing', 'complete', 'failed'] as const;
export type AnalysisStatus = (typeof ANALYSIS_STATUSES)[number];

/** A row of the `public.analyses` table (see supabase/migrations/0003_analyses.sql). */
export type Analysis = {
  id: string;
  video_id: string;
  user_id: string;
  status: AnalysisStatus;
  result: AnalysisResult | null;
  model_used: string | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
};

/**
 * The position-tuned skill axes Claude rates. Defined on the client too so the
 * UI can label them; the Edge Function tells Claude which set to fill for the
 * player's position so Step 6 can compare like-for-like over time.
 */
export const SKILL_KEYS_BY_POSITION: Record<Position, string[]> = {
  gk: ['positioning', 'handling', 'shot_stopping_setup', 'distribution', 'command_of_area'],
  defender: ['positioning', 'marking', 'tackling', 'aerial_duels', 'distribution'],
  midfielder: ['passing_range', 'positioning', 'ball_retention', 'vision_scanning', 'work_rate'],
  forward: ['finishing', 'movement_off_ball', 'first_touch', 'dribbling', 'pressing'],
};

/** Human-friendly labels for the skill keys above (for the results/progress UI). */
export const SKILL_KEY_LABELS: Record<string, string> = {
  positioning: 'Positioning',
  handling: 'Handling',
  shot_stopping_setup: 'Shot-stopping setup',
  distribution: 'Distribution',
  command_of_area: 'Command of area',
  marking: 'Marking',
  tackling: 'Tackling',
  aerial_duels: 'Aerial duels',
  passing_range: 'Passing range',
  ball_retention: 'Ball retention',
  vision_scanning: 'Vision & scanning',
  work_rate: 'Work rate',
  finishing: 'Finishing',
  movement_off_ball: 'Movement off the ball',
  first_touch: 'First touch',
  dribbling: 'Dribbling',
  pressing: 'Pressing',
};

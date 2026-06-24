import type { Position } from '@/types/profile';

export type { Position };

export const PITCH_SIDES = ['left', 'center', 'right'] as const;
export type PitchSide = (typeof PITCH_SIDES)[number];

export const PITCH_SIDE_LABELS: Record<PitchSide, string> = {
  left: 'Left',
  center: 'Center',
  right: 'Right',
};

export const VIDEO_STATUSES = ['pending', 'analyzing', 'complete', 'error'] as const;
export type VideoStatus = (typeof VIDEO_STATUSES)[number];

export const VIDEO_STATUS_LABELS: Record<VideoStatus, string> = {
  pending: 'Queued',
  analyzing: 'Analyzing',
  complete: 'Complete',
  error: 'Error',
};

/** A row of the `public.videos` table (see supabase/migrations/0002_videos.sql). */
export type Video = {
  id: string;
  user_id: string;
  storage_path: string;
  duration: number | null; // seconds
  file_size: number | null; // bytes
  status: VideoStatus;
  jersey_color: string | null;
  jersey_number: number | null;
  position_played: Position | null;
  pitch_side: PitchSide;
  created_at: string;
};

/** Player-identification data collected before upload (Step 2, Part A). */
export type PlayerIdentification = {
  jersey_color: string;
  jersey_number: number | null;
  position_played: Position;
  pitch_side: PitchSide;
};

/** Everything needed to insert a `videos` row after a successful upload. */
export type CreateVideoInput = PlayerIdentification & {
  storage_path: string;
  duration: number | null;
  file_size: number | null;
};

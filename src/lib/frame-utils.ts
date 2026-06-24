/**
 * Shared, platform-agnostic helpers for client-side frame extraction.
 *
 * Why frames at all: Claude reads images, not .mp4, and Supabase Edge Functions
 * physically cannot run ffmpeg (no native binaries, no subprocesses). So the
 * clip is turned into a handful of still JPEGs ON THE DEVICE and those frames
 * are sent to the analyze-video Edge Function. See extractFrames.ts (native) and
 * extractFrames.web.ts (browser) for the per-platform capture code.
 */

/** How many frames we sample from a clip. 6 keeps us well under Claude's
 *  many-image limits while giving enough coverage of the moment. */
export const FRAME_COUNT = 6;

/** A captured still: its timestamp in the clip and raw base64 JPEG (NO data: prefix). */
export type ExtractedFrame = { tSeconds: number; base64: string };

/** Thrown when no frames could be produced, so callers can fail gracefully
 *  (mark the analysis failed) instead of calling Claude with zero images. */
export class FrameExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FrameExtractionError';
  }
}

/**
 * Evenly spaced timestamps across the clip, skipping the very start and end
 * (which are often black/blurry). For a 30s clip and count=6 → ~4.3s, 8.6s, …, 25.7s.
 * Falls back to assuming 30s when the duration is unknown.
 */
export function frameTimestamps(durationSec: number | null | undefined, count = FRAME_COUNT): number[] {
  const dur = durationSec && durationSec > 0 ? durationSec : 30;
  return Array.from({ length: count }, (_, i) => Number(((dur * (i + 1)) / (count + 1)).toFixed(2)));
}

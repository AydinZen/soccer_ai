// NATIVE (iOS / Android — Expo Go and dev builds).
// Metro automatically uses extractFrames.web.ts on web instead of this file.
import * as FileSystem from 'expo-file-system/legacy';
import * as VideoThumbnails from 'expo-video-thumbnails';

import { ExtractedFrame, FRAME_COUNT, FrameExtractionError, frameTimestamps } from '@/lib/frame-utils';

/**
 * Extracts evenly spaced JPEG frames from a local video using
 * expo-video-thumbnails (works in Expo Go + native; deprecated in SDK 56 but
 * still the only uri-producing thumbnail API). Each frame is read off disk as
 * raw base64 for the analyze-video Edge Function.
 *
 * NOTE: getThumbnailAsync's `time` is in MILLISECONDS (frameTimestamps is in seconds).
 */
export async function extractFrames(
  localUri: string,
  durationSec: number | null | undefined,
  count = FRAME_COUNT,
): Promise<ExtractedFrame[]> {
  const times = frameTimestamps(durationSec, count);
  const frames: ExtractedFrame[] = [];

  for (const t of times) {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(localUri, {
        time: Math.round(t * 1000), // seconds → ms
        quality: 0.6,
      });
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (base64) frames.push({ tSeconds: t, base64 });
    } catch {
      // Skip an individual frame (e.g. timestamp past the end); keep the rest.
    }
  }

  if (frames.length === 0) {
    throw new FrameExtractionError('Could not read any frames from this clip.');
  }
  return frames;
}

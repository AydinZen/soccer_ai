// WEB (react-native-web / Claude preview pane).
// No native frame API works in the browser, so we use the standard
// HTMLVideoElement + <canvas> approach: load the locally-picked clip, seek to
// each timestamp, draw the frame, and read it back as base64 JPEG.
import { ExtractedFrame, FRAME_COUNT, FrameExtractionError, frameTimestamps } from '@/lib/frame-utils';

const MAX_EDGE_PX = 1024; // downscale long edge to cap Claude image-token cost

export async function extractFrames(
  localUri: string,
  durationSec: number | null | undefined,
  count = FRAME_COUNT,
): Promise<ExtractedFrame[]> {
  const video = document.createElement('video');
  video.src = localUri; // a blob:/object URL from the picker — same-origin, no CORS taint
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new FrameExtractionError('Could not load this clip in the browser.'));
  });

  const realDuration =
    Number.isFinite(video.duration) && video.duration > 0 ? video.duration : (durationSec ?? null);
  const times = frameTimestamps(realDuration, count);

  const scale = video.videoWidth > MAX_EDGE_PX ? MAX_EDGE_PX / video.videoWidth : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new FrameExtractionError('Canvas is unavailable in this browser.');

  const frames: ExtractedFrame[] = [];
  for (const t of times) {
    try {
      await new Promise<void>((resolve) => {
        const target = realDuration ? Math.min(t, realDuration - 0.05) : t;
        // Seeking to a position we're already at won't re-fire 'seeked' in most
        // browsers, so resolve immediately to avoid hanging.
        if (Math.abs(video.currentTime - target) < 1e-3) {
          resolve();
          return;
        }
        let settled = false;
        const finish = () => {
          if (!settled) {
            settled = true;
            resolve();
          }
        };
        video.onseeked = finish;
        video.onerror = finish; // skip this frame rather than wedge the whole run
        // Hard fallback: a missing 'seeked' event must never hang the upload flow.
        setTimeout(finish, 3000);
        video.currentTime = target;
      });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1]; // strip "data:image/jpeg;base64,"
      if (base64) frames.push({ tSeconds: t, base64 });
    } catch {
      // Skip this timestamp; keep whatever we captured.
    }
  }

  if (frames.length === 0) {
    throw new FrameExtractionError('Could not capture frames from this clip.');
  }
  return frames;
}

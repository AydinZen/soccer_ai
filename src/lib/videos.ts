import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { CreateVideoInput, Video } from '@/types/video';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
const BUCKET = 'videos';

/**
 * Supabase's free tier hard-caps storage at 50 MB per file. We guard just at
 * that ceiling. On a Pro plan, raise both this constant and the bucket's
 * `file_size_limit` in supabase/migrations/0002_videos.sql.
 */
export const MAX_VIDEO_MB = 50;
export const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;
/** Recording-length cap passed to the picker (only limits in-app recording). */
export const RECORD_MAX_SECONDS = 60;

function inferExtAndType(localUri: string, mimeType?: string | null): {
  ext: string;
  contentType: string;
} {
  const lower = localUri.toLowerCase();
  const isMov = mimeType === 'video/quicktime' || lower.endsWith('.mov');
  return isMov
    ? { ext: 'mov', contentType: 'video/quicktime' }
    : { ext: 'mp4', contentType: 'video/mp4' };
}

/**
 * Streams a local video file to the Supabase Storage REST endpoint with real
 * upload progress. Expo Go safe: uses the legacy expo-file-system upload task,
 * which streams from disk (no loading the whole file into JS memory).
 * Returns the bucket-relative storage path to persist in the videos row.
 */
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function uploadVideo(
  localUri: string,
  onProgress: (fraction: number) => void,
  mimeType?: string | null,
): Promise<{ path: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user.id ?? DEV_USER_ID;

  const { ext, contentType } = inferExtAndType(localUri, mimeType);
  const path = `${userId}/${Date.now()}.${ext}`;

  if (Platform.OS === 'web') {
    onProgress(0.1);
    const response = await fetch(localUri);
    if (!response.ok) throw new Error(`Could not read video file (${response.status})`);
    const blob = await response.blob();
    onProgress(0.4);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType, upsert: false });
    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    onProgress(1);
    return { path };
  }

  // Native: stream via expo-file-system for real progress.
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  const task = FileSystem.createUploadTask(
    url,
    localUri,
    {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': contentType,
        'x-upsert': 'false',
        'cache-control': '3600',
      },
    },
    ({ totalBytesSent, totalBytesExpectedToSend }) => {
      if (totalBytesExpectedToSend > 0) {
        onProgress(totalBytesSent / totalBytesExpectedToSend);
      }
    },
  );

  const result = await task.uploadAsync();
  if (!result || result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed (${result?.status ?? 'no response'}). ${result?.body ?? ''}`.trim());
  }
  return { path };
}

/**
 * Inserts the videos row (status defaults to 'pending' in the DB), bundling the
 * player-identification data with the uploaded file's storage path.
 */
export async function createVideoRecord(input: CreateVideoInput): Promise<Video> {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? DEV_USER_ID;

  const { data, error } = await supabase
    .from('videos')
    .insert({
      user_id: userId,
      storage_path: input.storage_path,
      duration: input.duration,
      file_size: input.file_size,
      jersey_color: input.jersey_color,
      jersey_number: input.jersey_number,
      position_played: input.position_played,
      pitch_side: input.pitch_side,
      // status omitted -> DB default 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data as Video;
}

/** Short-lived signed URL for playback from the private bucket. */
export async function getSignedVideoUrl(
  storagePath: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

/** Lists the current user's videos, newest first (RLS scopes to the user). */
export async function listUserVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Video[];
}

import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Platform, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { VideoPreview } from '@/components/upload/video-preview';
import { Spacing } from '@/constants/theme';
import { MAX_VIDEO_BYTES, MAX_VIDEO_MB, RECORD_MAX_SECONDS } from '@/lib/videos';

export type PickedVideo = {
  uri: string;
  durationSec: number | null;
  fileSize: number | null;
  mimeType: string | null;
};

function formatSize(bytes: number | null): string {
  if (bytes == null) return 'unknown size';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(sec: number | null): string {
  if (sec == null) return 'unknown length';
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

/** Step 2, Part C (pick + preview). Hands a validated clip to the uploader. */
export function VideoPickerPreview({
  onConfirm,
  onBack,
}: {
  onConfirm: (video: PickedVideo) => void;
  onBack: () => void;
}) {
  const [picked, setPicked] = useState<PickedVideo | null>(null);

  async function pick() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo/video access to choose a clip.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: false,
      videoMaxDuration: RECORD_MAX_SECONDS,
      quality: 1,
      // iOS-only: opt into a lighter export. Android keeps the original.
      videoExportPreset:
        Platform.OS === 'ios' ? ImagePicker.VideoExportPreset.MediumQuality : undefined,
    });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const fileSize = asset.fileSize ?? null;

    if (fileSize != null && fileSize > MAX_VIDEO_BYTES) {
      Alert.alert(
        'Video too large',
        `That clip is ${formatSize(fileSize)}. Please choose one under ${MAX_VIDEO_MB} MB (about a minute of video).`,
      );
      return;
    }

    setPicked({
      uri: asset.uri,
      durationSec: asset.duration != null ? asset.duration / 1000 : null,
      fileSize,
      mimeType: asset.mimeType ?? null,
    });
  }

  return (
    <View style={{ gap: Spacing.three }}>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="title">Your clip</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Pick the video, check it looks right, then upload.
        </ThemedText>
      </View>

      {picked ? (
        <View style={{ gap: Spacing.two }}>
          <VideoPreview uri={picked.uri} />
          <ThemedText type="small" themeColor="textSecondary">
            {formatDuration(picked.durationSec)} · {formatSize(picked.fileSize)}
          </ThemedText>
          <Button title="Upload this clip" onPress={() => onConfirm(picked)} />
          <Button title="Choose a different clip" variant="secondary" onPress={pick} />
        </View>
      ) : (
        <Button title="Choose video from library" onPress={pick} />
      )}

      <Button title="Back" variant="secondary" onPress={onBack} />
    </View>
  );
}

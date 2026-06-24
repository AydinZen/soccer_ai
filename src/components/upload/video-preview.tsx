import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet } from 'react-native';

/**
 * Plays the picked local clip. Rendered only once a video exists, so the
 * useVideoPlayer hook is always called with a real uri (React Compiler safe).
 */
export function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });

  return <VideoView style={styles.video} player={player} nativeControls contentFit="contain" />;
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: '#000',
  },
});

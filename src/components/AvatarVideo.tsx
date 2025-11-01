import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { AvatarVideoProps } from '../utils/types';

/**
 * AvatarVideo Component
 * Looping, muted avatar video player for lesson screen header
 */
export const AvatarVideo: React.FC<AvatarVideoProps> = ({
  videoUrl,
  isLooping = true,
  isMuted = true,
  shouldPlay = true,
  onFinish,
  style,
}) => {
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (shouldPlay) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [shouldPlay]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      if (status.didJustFinish) {
        if (isLooping) {
          videoRef.current?.replayAsync();
        } else if (onFinish) {
          // Video bittiğinde callback'i çağır
          onFinish();
        }
      }
    } else if (status.error) {
      setIsLoading(false);
      setError(`Video error: ${status.error}`);
      console.error('Video playback error:', status.error);
    }
  };

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading avatar...</Text>
        </View>
      )}
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping={isLooping}
        isMuted={isMuted}
        shouldPlay={shouldPlay}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});

export default AvatarVideo;

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface AvatarPlayerProps {
  videoUrl?: string;
  isLoading?: boolean;
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
}

const AvatarPlayer: React.FC<AvatarPlayerProps> = ({
  videoUrl,
  isLoading = false,
  onPlaybackStatusUpdate,
}) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      // Video URL değiştiğinde otomatik oynat
      videoRef.current.playAsync();
    }
  }, [videoUrl]);

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (status?.isLoaded && status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const handleReplay = async () => {
    if (!videoRef.current) return;
    await videoRef.current.replayAsync();
  };

  const handleStatusUpdate = (newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);
    onPlaybackStatusUpdate?.(newStatus);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Avatar video oluşturuluyor...</Text>
        <Text style={styles.loadingSubtext}>Bu işlem 30-60 saniye sürebilir</Text>
      </View>
    );
  }

  if (!videoUrl) {
    return (
      <View style={styles.placeholderContainer}>
        <Ionicons name="videocam-outline" size={64} color="#94a3b8" />
        <Text style={styles.placeholderText}>
          Metni girin ve "Konuştur" butonuna basın
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handleStatusUpdate}
        useNativeControls={false}
      />
      
      {showControls && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePlayPause}
            activeOpacity={0.7}
          >
            <Ionicons
              name={status?.isLoaded && status.isPlaying ? 'pause' : 'play'}
              size={32}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleReplay}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={28} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {status?.isLoaded && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${
                  (status.positionMillis / (status.durationMillis || 1)) * 100
                }%`,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  placeholderContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
});

export default AvatarPlayer;

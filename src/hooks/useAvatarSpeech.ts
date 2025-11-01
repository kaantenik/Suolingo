import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { speakAvatar, waitForVideoCompletion } from '../api/heygenClient';

export interface UseAvatarSpeechResult {
  videoUrl: string | undefined;
  isLoading: boolean;
  error: string | undefined;
  speak: (avatarId: string, text: string) => Promise<void>;
  reset: () => void;
}

/**
 * Avatar konuşturma işlemlerini yöneten custom hook
 */
export const useAvatarSpeech = (): UseAvatarSpeechResult => {
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const speak = useCallback(async (avatarId: string, text: string) => {
    if (!text.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir metin girin.');
      return;
    }

    setIsLoading(true);
    setError(undefined);
    setVideoUrl(undefined);

    try {
      // HeyGen API'yi çağır
      const response = await speakAvatar(avatarId, text.trim());

      if (response.success && response.videoId) {
        // Video oluşturulmasını bekle
        const result = await waitForVideoCompletion(response.videoId);

        if (result.status === 'completed' && result.videoUrl) {
          setVideoUrl(result.videoUrl);
          Alert.alert('Başarılı', 'Video hazır!');
        } else {
          const errorMsg = 'Video oluşturulamadı. Lütfen tekrar deneyin.';
          setError(errorMsg);
          Alert.alert('Hata', errorMsg);
        }
      } else {
        const errorMsg = response.error || 'Video oluşturma isteği başarısız oldu.';
        setError(errorMsg);
        Alert.alert('Hata', errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Bir hata oluştu.';
      setError(errorMsg);
      Alert.alert('Hata', errorMsg);
      console.error('useAvatarSpeech - speak error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setVideoUrl(undefined);
    setError(undefined);
    setIsLoading(false);
  }, []);

  return {
    videoUrl,
    isLoading,
    error,
    speak,
    reset,
  };
};

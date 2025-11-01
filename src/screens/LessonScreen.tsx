import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';

// Components
import AvatarVideo from '../components/AvatarVideo';
import VoiceRecorder from '../components/VoiceRecorder';
import TextArea from '../components/TextArea';

// Utils & API
import { LESSONS, getNextLesson, getPreviousLesson } from '../utils/lessonData';
import { analyzePronunciation } from '../api/theFluentClient';
import { Lesson, WordFeedback } from '../utils/types';

/**
 * LessonScreen Component
 * Main screen for English learning with avatar video, text display, 
 * voice recording, and pronunciation analysis
 */
export const LessonScreen: React.FC = () => {
  // State management
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentLesson, setCurrentLesson] = useState<Lesson>(LESSONS[0]);
  const [wordFeedback, setWordFeedback] = useState<WordFeedback[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const [overallScore, setOverallScore] = useState<number | null>(null);

  // Update current lesson when index changes
  useEffect(() => {
    setCurrentLesson(LESSONS[currentLessonIndex]);
    // Reset feedback when changing lessons
    setWordFeedback([]);
    setOverallScore(null);
    setRecordedAudioUri(null);
  }, [currentLessonIndex]);

  /**
   * Handle recording completion
   * Automatically analyze pronunciation after recording
   */
  const handleRecordingComplete = async (audioUri: string) => {
    console.log('Recording completed:', audioUri);
    setRecordedAudioUri(audioUri);

    // Automatically analyze pronunciation
    await analyzePronunciationFromRecording(audioUri);
  };

  /**
   * Analyze pronunciation from recorded audio
   */
  const analyzePronunciationFromRecording = async (audioUri: string) => {
    if (!audioUri) {
      Alert.alert('Hata', 'Lütfen önce ses kaydı yapın.');
      return;
    }

    setIsAnalyzing(true);
    setWordFeedback([]);
    setOverallScore(null);

    try {
      const result = await analyzePronunciation(audioUri, currentLesson.text);

      if (result.success) {
        // Convert TheFluent words to WordFeedback format
        const feedback: WordFeedback[] = result.words.map((w) => ({
          word: w.word,
          isCorrect: w.status === 'correct',
          score: w.score,
        }));

        setWordFeedback(feedback);
        setOverallScore(result.overall_score);

        // Show success message
        const scoreEmoji = result.overall_score >= 80 ? '🎉' : result.overall_score >= 60 ? '👍' : '💪';
        Alert.alert(
          'Analiz Tamamlandı!',
          `${scoreEmoji} Genel Puan: ${result.overall_score}%\n\n` +
            `Doğru kelimeler yeşil, hatalı kelimeler kırmızı ile işaretlendi.`,
          [{ text: 'Tamam' }]
        );
      } else {
        Alert.alert('Hata', result.error || 'Analiz yapılamadı. Lütfen tekrar deneyin.');
      }
    } catch (error: any) {
      console.error('Pronunciation analysis error:', error);
      Alert.alert('Hata', 'Telaffuz analizi sırasında bir hata oluştu.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Make avatar speak - play video with sound
   */
  const handleAvatarSpeak = () => {
    setIsAvatarSpeaking(!isAvatarSpeaking);
  };

  /**
   * Handle video playback finished
   */
  const handleVideoFinished = () => {
    setIsAvatarSpeaking(false);
  };

  /**
   * Navigate to next lesson
   */
  const handleNextLesson = () => {
    if (currentLessonIndex < LESSONS.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else {
      Alert.alert('Tebrikler!', 'Tüm dersleri tamamladınız! 🎉');
    }
  };

  /**
   * Navigate to previous lesson
   */
  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else {
      Alert.alert('Bilgi', 'Bu ilk derstir.');
    }
  };

  /**
   * Test upload with MP3 file from assets
   */
  const testUploadWithMP3 = async () => {
    try {
      setIsAnalyzing(true);
      console.log('🧪 Testing upload with MP3 file...');
      
      // Load the test MP3 file from assets
      const asset = Asset.fromModule(require('../../assets/m-20251025-222036-43521-generated.mp3'));
      await asset.downloadAsync();
      
      const audioUri = asset.localUri || asset.uri;
      console.log('🧪 Test MP3 URI:', audioUri);
      
      // Analyze with TheFluent API
      const result = await analyzePronunciation(audioUri, currentLesson.text);
      
      if (result.success) {
        const feedback: WordFeedback[] = result.words.map((w) => ({
          word: w.word,
          isCorrect: w.status === 'correct',
          score: w.score,
        }));
        
        setWordFeedback(feedback);
        setOverallScore(result.overall_score);
        
        Alert.alert(
          '✅ Test Başarılı!',
          `MP3 dosyası başarıyla upload edildi ve analiz edildi!\n\nPuan: ${result.overall_score}%`,
          [{ text: 'Tamam' }]
        );
      } else {
        Alert.alert('Test Sonucu', 'Mock data döndü: ' + (result.error || 'API çalışmıyor'));
      }
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      Alert.alert('Test Hatası', error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#34c759'; // Green
      case 'intermediate':
        return '#ff9500'; // Orange
      case 'advanced':
        return '#ff3b30'; // Red
      default:
        return '#007AFF'; // Blue
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{currentLesson.title}</Text>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(currentLesson.difficulty || 'beginner') }
          ]}>
            <Text style={styles.difficultyText}>
              {currentLesson.difficulty || 'beginner'}
            </Text>
          </View>
        </View>

        {/* Avatar Video */}
        <AvatarVideo
          videoUrl={currentLesson.avatarVideoUrl}
          isLooping={false}
          isMuted={false}
          shouldPlay={isAvatarSpeaking}
          onFinish={handleVideoFinished}
          style={styles.avatarVideo}
        />

        {/* Text Area with Feedback and Navigation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ders Metni</Text>
          <View style={styles.textWithNavigation}>
            {/* Previous Button */}
            <TouchableOpacity
              style={[styles.arrowButton, currentLessonIndex === 0 && styles.arrowButtonDisabled]}
              onPress={handlePreviousLesson}
              disabled={currentLessonIndex === 0}
            >
              <Ionicons 
                name="chevron-back" 
                size={28} 
                color={currentLessonIndex === 0 ? '#ccc' : '#007AFF'} 
              />
            </TouchableOpacity>

            {/* Text Area */}
            <View style={styles.textAreaWrapper}>
              <TextArea text={currentLesson.text} />
            </View>

            {/* Next Button */}
            <TouchableOpacity
              style={[
                styles.arrowButton,
                currentLessonIndex === LESSONS.length - 1 && styles.arrowButtonDisabled,
              ]}
              onPress={handleNextLesson}
              disabled={currentLessonIndex === LESSONS.length - 1}
            >
              <Ionicons 
                name="chevron-forward" 
                size={28} 
                color={currentLessonIndex === LESSONS.length - 1 ? '#ccc' : '#007AFF'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar Speak Button */}
        <TouchableOpacity
          style={[styles.speakButton, isAvatarSpeaking && styles.speakButtonActive]}
          onPress={handleAvatarSpeak}
        >
          <Ionicons
            name={isAvatarSpeaking ? 'pause-circle' : 'play-circle'}
            size={24}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            {isAvatarSpeaking ? 'Durdur' : 'Avatarı Konuştur'}
          </Text>
        </TouchableOpacity>

        {/* Voice Recorder */}
        <View style={styles.section}>
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            disabled={isAnalyzing}
          />
        </View>

        {/* Analysis Loading */}
        {isAnalyzing && (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.analyzingText}>Telaffuz analiz ediliyor...</Text>
          </View>
        )}

        {/* Analysis Result */}
        {overallScore !== null && !isAnalyzing && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Ionicons 
                name={overallScore >= 80 ? 'checkmark-circle' : overallScore >= 60 ? 'alert-circle' : 'close-circle'} 
                size={32} 
                color={overallScore >= 80 ? '#34c759' : overallScore >= 60 ? '#ff9500' : '#ff3b30'} 
              />
              <Text style={styles.resultTitle}>Analiz Sonucu</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Genel Puan</Text>
              <Text style={[
                styles.scoreValue,
                { color: overallScore >= 80 ? '#34c759' : overallScore >= 60 ? '#ff9500' : '#ff3b30' }
              ]}>
                {overallScore}%
              </Text>
            </View>
            <Text style={styles.resultMessage}>
              {overallScore >= 80 
                ? '🎉 Harika! Telaffuzunuz mükemmel!' 
                : overallScore >= 60 
                ? '👍 İyi! Biraz daha pratik yapın.' 
                : '💪 Devam edin! Pratik yaparak gelişeceksiniz.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#24292e',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  avatarVideo: {
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#586069',
    fontWeight: '500',
  },
  scoreContainer: {
    backgroundColor: '#34c759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24292e',
    marginBottom: 12,
  },
  textWithNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  arrowButtonDisabled: {
    borderColor: '#ccc',
    opacity: 0.5,
  },
  textAreaWrapper: {
    flex: 1,
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    color: '#586069',
    marginBottom: 12,
    lineHeight: 20,
  },
  speakButton: {
    backgroundColor: '#5856d6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  speakButtonActive: {
    backgroundColor: '#4a48b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e1e4e8',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24292e',
  },
  scoreBox: {
    backgroundColor: '#f6f8fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#586069',
    marginBottom: 8,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  resultMessage: {
    fontSize: 16,
    color: '#24292e',
    textAlign: 'center',
    lineHeight: 24,
  },
  analyzingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: '#ff9500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LessonScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AvatarPlayer from '../components/AvatarPlayer';
import { getAvatarAgent } from '../utils/codeAgent';
import { getAvailableAvatars } from '../api/heygenClient';
import { Ionicons } from '@expo/vector-icons';

// Code Agent instance'ını oluştur
const avatarAgent = getAvatarAgent({
  autoRetry: true,
  maxRetries: 3,
  enableLogging: true,
});

const HomeScreen: React.FC = () => {
  const [text, setText] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarId, setAvatarId] = useState('');
  
  // Component mount olduğunda avatar listesini al
  useEffect(() => {
    const fetchAvatars = async () => {
      const avatars = await getAvailableAvatars();
      if (avatars && avatars.length > 0) {
        // İlk avatar'ı varsayılan olarak seç
        setAvatarId(avatars[0].avatar_id);
        console.log('✅ İlk avatar seçildi:', avatars[0].avatar_name, '(ID:', avatars[0].avatar_id + ')');
      }
    };
    fetchAvatars();
  }, []);

  const handleSpeak = async () => {
    if (!text.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir metin girin.');
      return;
    }

    setIsLoading(true);
    setVideoUrl(undefined);

    try {
      // Code Agent kullanarak otomatik işlem
      Alert.alert('Bilgi', 'Video oluşturuluyor, lütfen bekleyin...');
      
      const result = await avatarAgent.processUserInput(avatarId, text.trim());

      if (result.success && result.videoUrl) {
        setVideoUrl(result.videoUrl);
        Alert.alert(
          'Başarılı', 
          `Video hazır! ${result.attempts ? `(${result.attempts} denemede)` : ''}`
        );
      } else {
        Alert.alert('Hata', result.error || 'Video oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch (error: any) {
      console.error('HomeScreen - handleSpeak error:', error);
      Alert.alert('Hata', error.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Video Avatar</Text>
              <Text style={styles.subtitle}>Metinden konuşan video oluştur</Text>
            </View>
            <Ionicons name="videocam" size={32} color="#007AFF" />
          </View>

          {/* Video Player */}
          <View style={styles.playerContainer}>
            <AvatarPlayer videoUrl={videoUrl} isLoading={isLoading} />
          </View>

          {/* Text Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Konuşma Metni</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={text}
              onChangeText={setText}
              placeholder="Metni girin, Konuştur butonuna basın"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isLoading}
            />
            <Text style={styles.characterCount}>{text.length} karakter</Text>
          </View>

          {/* Speak Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSpeak}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isLoading ? 'hourglass-outline' : 'play-circle'}
              size={24}
              color="white"
            />
            <Text style={styles.buttonText}>
              {isLoading ? 'İşleniyor...' : 'Konuştur'}
            </Text>
          </TouchableOpacity>

          {/* Info Card */}
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
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
  subtitle: {
    fontSize: 14,
    color: '#586069',
    marginTop: 4,
  },
  playerContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24292e',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    color: '#24292e',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  hint: {
    fontSize: 12,
    color: '#586069',
    marginTop: 6,
  },
  characterCount: {
    fontSize: 12,
    color: '#586069',
    textAlign: 'right',
    marginTop: 6,
  },
  button: {
    backgroundColor: '#5856d6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonDisabled: {
    backgroundColor: '#c7c7cc',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  infoText: {
    flex: 1,
    color: '#586069',
    fontSize: 14,
    lineHeight: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  modeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modeButtonText: {
    color: '#586069',
    fontSize: 15,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  voiceInputContainer: {
    marginBottom: 20,
  },
  voiceDisplay: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    marginBottom: 16,
  },
  voiceStatus: {
    color: '#24292e',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  voiceTextPreview: {
    width: '100%',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f6f8fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  voiceTextLabel: {
    color: '#586069',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  voiceText: {
    color: '#24292e',
    fontSize: 15,
    lineHeight: 22,
  },
  voiceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  voiceControlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  voiceStartButton: {
    backgroundColor: '#34c759',
  },
  voiceStopButton: {
    backgroundColor: '#ff3b30',
  },
  voiceControlButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default HomeScreen;

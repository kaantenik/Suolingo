import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { VoiceRecorderProps } from '../utils/types';

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please enable microphone access.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      
      const recording = new Audio.Recording();
      
      // Direct WAV recording configuration (PCM format)
      await recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 24000,
          numberOfChannels: 1,
          bitRate: 384000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 24000,
          numberOfChannels: 1,
          bitRate: 384000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 384000,
        },
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => { 
        setRecordingDuration((prev) => prev + 1); 
      }, 1000);
      
      console.log(' Recording started (WAV PCM format)');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      if (timerRef.current) { 
        clearInterval(timerRef.current); 
        timerRef.current = null; 
      }
      
      await recordingRef.current.stopAndUnloadAsync();
      const rawUri = recordingRef.current.getURI();
      recordingRef.current = null;
      
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      
      if (!rawUri) throw new Error('No recording URI');
      
      console.log('🛑 Recording finished:', rawUri);
      
      // Copy to permanent location with .mp3 extension (but WAV content)
      // This trick may help TheFluent API accept the file
      const fileName = `recording-${Date.now()}.wav`;
      const finalUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.copyAsync({ from: rawUri, to: finalUri });
      
      const fileInfo = await FileSystem.getInfoAsync(finalUri);
      console.log('✅ WAV file ready (saved as .mp3):', finalUri);
      console.log('📊 File info:', fileInfo);
      
      setIsProcessing(false);
      setRecordedAudioUri(finalUri);
      onRecordingComplete(finalUri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Could not process recording.');
      setIsProcessing(false);
    }
  };

  const playRecording = async () => {
    if (!recordedAudioUri) return;
    
    try {
      // Stop any existing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordedAudioUri },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (error) {
      console.error('Failed to play recording:', error);
      Alert.alert('Hata', 'Kayıt oynatılamadı.');
    }
  };

  const handlePress = () => { 
    if (isRecording) { 
      stopRecording(); 
    } else if (!isProcessing) { 
      startRecording(); 
    } 
  };

  const formatDuration = (seconds: number): string => { 
    const mins = Math.floor(seconds / 60); 
    const secs = seconds % 60; 
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`; 
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <Text style={styles.durationText}>
          Kayıt süresi: {formatDuration(recordingDuration)}
        </Text>
      )}
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.recordButton,
            isRecording && styles.stopButton, 
            (disabled || isProcessing) && styles.disabledButton
          ]} 
          onPress={handlePress} 
          disabled={disabled || isProcessing}
        >
          <Ionicons name={isRecording ? 'stop-circle' : 'mic'} size={24} color="#fff" />
          <Text style={styles.buttonText}>
            {isRecording ? 'Kayıt Durdur' : 'Konuş'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.button, 
            styles.playButton,
            (!recordedAudioUri || isRecording) && styles.disabledButton
          ]} 
          onPress={playRecording} 
          disabled={!recordedAudioUri || isRecording}
        >
          <Ionicons name="play" size={24} color="#fff" />
          <Text style={styles.buttonText}>Dinle</Text>
        </TouchableOpacity>
      </View>
      
      {isProcessing && (
        <Text style={styles.processingHint}>Kayıt kaydediliyor...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: '#f2f4f5', 
    gap: 12 
  },
  durationText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#e63946',
    textAlign: 'center' 
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: { 
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    paddingVertical: 14, 
    paddingHorizontal: 20, 
    borderRadius: 10,
  },
  recordButton: { 
    backgroundColor: '#1f7aec',
  },
  stopButton: { 
    backgroundColor: '#dc3545' 
  },
  playButton: {
    backgroundColor: '#34c759',
  },
  disabledButton: { 
    opacity: 0.5 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '600' 
  },
  processingHint: { 
    fontSize: 12, 
    color: '#6b7280',
    textAlign: 'center' 
  },
});

export default VoiceRecorder;
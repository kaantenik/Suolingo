/**
 * HeyGen API tip tanımları
 */
export interface HeyGenAvatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url?: string;
  preview_video_url?: string;
}

export interface HeyGenVoice {
  voice_id: string;
  voice_name: string;
  language: string;
  gender: 'male' | 'female';
}

export interface VideoGenerationRequest {
  video_inputs: VideoInput[];
  dimension?: {
    width: number;
    height: number;
  };
  test?: boolean;
}

export interface VideoInput {
  character: {
    type: 'avatar';
    avatar_id: string;
    avatar_style?: string;
  };
  voice: {
    type: 'text';
    input_text: string;
    voice_id?: string;
  };
}

export interface VideoGenerationResponse {
  code: number;
  data: {
    video_id: string;
  };
  message?: string;
}

export interface VideoStatusResponse {
  code: number;
  data: {
    video_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    video_url?: string;
    thumbnail_url?: string;
    error?: string;
  };
}

/**
 * TheFluent API tip tanımları
 */
export interface TheFluentWord {
  word: string;
  score: number; // 0-100 arası
  status: 'correct' | 'incorrect' | 'mispronounced';
  phonemes?: string;
  expected?: string;
}

export interface TheFluentPronunciationResponse {
  success: boolean;
  overall_score: number;
  words: TheFluentWord[];
  fluency_score?: number;
  pronunciation_score?: number;
  error?: string;
}

/**
 * tmpfiles.org upload response
 */
export interface TmpFilesUploadResponse {
  status: string;
  data: {
    url: string;
  };
}

export interface TheFluentTTSRequest {
  text: string;
  voice?: string;
  speed?: number;
  language?: string;
}

export interface TheFluentTTSResponse {
  success: boolean;
  audio_url?: string;
  audio_base64?: string;
  error?: string;
}

/**
 * Ders (Lesson) tip tanımları
 */
export interface Lesson {
  id: number;
  title: string;
  text: string;
  avatarVideoUrl: string; // Looped avatar video URL
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface WordFeedback {
  word: string;
  isCorrect: boolean;
  score?: number;
}

/**
 * Komponent prop tipleri
 */
export interface AvatarVideoProps {
  videoUrl: string;
  isLooping?: boolean;
  isMuted?: boolean;
  shouldPlay?: boolean;
  onFinish?: () => void;
  style?: any;
}

export interface VoiceRecorderProps {
  onRecordingComplete: (audioUri: string) => void;
  disabled?: boolean;
}

export interface TextAreaProps {
  text: string;
  feedback?: WordFeedback[];
  style?: any;
}

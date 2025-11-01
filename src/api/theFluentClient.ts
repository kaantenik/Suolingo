import axios, { AxiosInstance } from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import { TheFluentPronunciationResponse, TheFluentTTSResponse, TheFluentWord } from '../utils/types';

/**
 * TheFluent API Client
 * Handles pronunciation analysis according to thefluent.me API documentation
 * API Docs: https://thefluent.me/api/docs
 */

// TheFluent API Configuration
const THEFLUENT_API_BASE_URL = 'https://thefluent.me/api';
const THEFLUENT_API_KEY = process.env.EXPO_PUBLIC_THEFLUENT_API_KEY || 'YOUR_API_KEY_HERE';

// RapidAPI Configuration (TheFluent is hosted on RapidAPI)
const RAPIDAPI_HOST = 'thefluentme.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || process.env.EXPO_PUBLIC_THEFLUENT_API_KEY || 'YOUR_API_KEY_HERE';

console.log('TheFluent/RapidAPI Key:', RAPIDAPI_KEY ? `${RAPIDAPI_KEY.substring(0, 10)}...` : 'NOT FOUND');

// Create axios instance for direct API
const thefluentApi: AxiosInstance = axios.create({
  baseURL: THEFLUENT_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${THEFLUENT_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Create axios instance for RapidAPI
const rapidApi: AxiosInstance = axios.create({
  baseURL: `https://${RAPIDAPI_HOST}`,
  headers: {
    'X-RapidAPI-Key': RAPIDAPI_KEY,
    'X-RapidAPI-Host': RAPIDAPI_HOST,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Analyze pronunciation from audio recording
 * Uses TheFluent API: https://thefluent.me/api/docs
 * 
 * IMPORTANT: TheFluent API requires:
 * 1. First create a "post" with the text
 * 2. Then upload audio to a publicly accessible URL
 * 3. Call /score/{post_id} endpoint with the audio URL
 * 
 * @param audioUri - Local audio file URI (file://)
 * @param referenceText - The expected text that was spoken
 * @returns Pronunciation analysis with word-level feedback
 */
export const analyzePronunciation = async (
  audioUri: string,
  referenceText: string
): Promise<TheFluentPronunciationResponse> => {
  try {
    console.log('🎤 [TheFluent] Starting pronunciation analysis...');
    console.log('Audio URI:', audioUri);
    console.log('Reference text:', referenceText);

    // Step 1: Create a post (TheFluent requirement)
    console.log('📝 [TheFluent] Step 1/3: Creating post...');
    const postResponse = await createPost(referenceText);
    
    if (!postResponse.post_id) {
      throw new Error('Failed to create post');
    }

    const postId = postResponse.post_id;
    console.log('✅ Post created:', postId);

    // Step 2: Upload audio (trying Google Cloud with fallback to tmpfiles)
    console.log('📤 [TheFluent] Step 2/3: Uploading audio...');
    
    let audioUrl: string;
    try {
      // Try Google Cloud first (if properly configured)
      console.log('🔄 [1/2] Trying Google Cloud Storage...');
      audioUrl = await uploadToGoogleCloud(audioUri);
      console.log('✅ Audio uploaded to Google Cloud:', audioUrl);
    } catch (gcsError: any) {
      console.warn('⚠️ Google Cloud failed:', gcsError.message);
      console.log('🔄 [2/2] Trying tmpfiles.org as fallback...');
      audioUrl = await uploadToTmpFiles(audioUri);
      console.log('✅ Audio uploaded to tmpfiles.org:', audioUrl);
    }
    
    try {
      // Step 3: Score the recording
      console.log('🎯 [TheFluent] Step 3/3: Scoring pronunciation...');
      const scoreResponse = await scoreRecording(postId, audioUrl, 100);
      
      // TheFluent returns an array with 3 objects: provided_data, overall_result_data, word_result_data
      let overallData, wordData;
      
      if (Array.isArray(scoreResponse)) {
        // Response is an array
        const overallResult = scoreResponse.find((item: any) => item.overall_result_data);
        const wordResult = scoreResponse.find((item: any) => item.word_result_data);
        
        if (!overallResult || !wordResult) {
          throw new Error('Invalid score response format');
        }
        
        overallData = overallResult.overall_result_data[0];
        wordData = wordResult.word_result_data;
      } else {
        // Response is an object (legacy format)
        if (!scoreResponse.overall_result_data || !scoreResponse.word_result_data) {
          throw new Error('Invalid score response');
        }
        
        overallData = scoreResponse.overall_result_data[0];
        wordData = scoreResponse.word_result_data;
      }

      const words: TheFluentWord[] = wordData.map((w: any) => ({
        word: w.word,
        score: parseFloat(w.points) || 0,
        status: getWordStatus(parseFloat(w.points) || 0),
        phonemes: w.speed, // TheFluent uses "speed" for word-level feedback
        expected: '',
      }));

      console.log('✅ [TheFluent] Analysis complete!');
      console.log('📊 Overall score:', overallData.overall_points);
      console.log('📊 Words analyzed:', words.length);
      
      return {
        success: true,
        overall_score: parseFloat(overallData.overall_points) || 0,
        words,
        fluency_score: undefined, // TheFluent doesn't provide separate fluency score
        pronunciation_score: parseFloat(overallData.overall_points) || 0,
      };
    } catch (uploadError: any) {
      console.error('⚠️ [TheFluent] Upload/Scoring failed:', uploadError.message);
      throw uploadError;
    }
  } catch (error: any) {
    console.error('❌ [TheFluent] Pronunciation analysis error:', error.response?.data || error.message);
    
    return {
      success: false,
      overall_score: 0,
      words: [],
      error: error.response?.data?.message || error.message || 'Analysis failed',
    };
  }
};

/**
 * Create a post in TheFluent API
 * Required before scoring a recording
 * API Doc: https://thefluent.me/api/docs (Add post section)
 * 
 * @param text - The text content (3-1000 characters)
 * @param title - Optional title (default: auto-generated)
 * @param languageId - Language ID (default: 22 for English)
 */
const createPost = async (
  text: string,
  title?: string,
  languageId: number = 22
): Promise<any> => {
  try {
    const postTitle = title || `Lesson ${Date.now()}`;
    
    // Use RapidAPI endpoint
    const response = await rapidApi.post('/post', {
      post_language_id: languageId.toString(),
      post_title: postTitle.substring(0, 100), // Max 100 characters
      post_content: text.substring(0, 1000), // Max 1000 characters
    });

    console.log('✅ Post created:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Post creation error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Score a recording against a post
 * API Doc: https://thefluent.me/api/docs (Score section)
 * 
 * @param postId - The post ID (e.g., "P123456")
 * @param audioUrl - Public URL to the audio file
 * @param scale - Scoring scale (default: 100, can be 90, 100, etc.)
 */
const scoreRecording = async (
  postId: string,
  audioUrl: string,
  scale: number = 100
): Promise<any> => {
  try {
    console.log('🎯 [TheFluent] Scoring request:', {
      postId,
      audioUrl,
      scale,
      endpoint: `/score/${postId}?scale=${scale}`,
    });
    
    // Use RapidAPI endpoint
    const response = await rapidApi.post(`/score/${postId}?scale=${scale}`, {
      audio_provided: audioUrl,
    });

    console.log('✅ Scoring complete:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Scoring error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    
    // TheFluent API has issues with public file hosting services
    // This is a known limitation - for production, use AWS S3 or Google Cloud Storage
    console.warn('⚠️ TheFluent API cannot access files from public hosting services.');
    
    throw error;
  }
};

/**
 * Upload audio file to a public URL using free hosting services
 * Tries multiple methods in order:
 * 1. tmpfiles.org (primary)
 * 2. Google Cloud Storage (if configured)
 * 
 * @param audioUri - Local audio file URI
 * @returns Public URL to the uploaded audio
 */
const uploadAudioToPublicUrl = async (audioUri: string): Promise<string> => {
  try {
    console.log('📤 [Upload] Uploading audio to public URL...');
    console.log('📤 [Upload] Audio URI:', audioUri);
    
    // Try tmpfiles.org first
    try {
      const tmpUrl = await uploadToTmpFiles(audioUri);
      console.log('✅ [tmpfiles.org] Success:', tmpUrl);
      return tmpUrl;
    } catch (tmpError: any) {
      console.warn('⚠️ [tmpfiles.org] Failed:', tmpError.message);
      console.log('🔄 Trying Google Cloud Storage...');
    }
    
    // Try Google Cloud Storage as fallback
    try {
      const gcsUrl = await uploadToGoogleCloud(audioUri);
      console.log('✅ [Google Cloud] Success:', gcsUrl);
      return gcsUrl;
    } catch (gcsError: any) {
      console.error('❌ [Google Cloud] Failed:', gcsError.message);
      throw new Error('All upload methods failed');
    }
  } catch (error: any) {
    console.error('❌ [Upload] Error:', error.message);
    throw new Error(`Failed to upload audio: ${error.message}`);
  }
};

/**
 * Upload to tmpfiles.org
 */
const uploadToTmpFiles = async (audioUri: string): Promise<string> => {
  // Determine MIME type based on file extension
  let mimeType = 'audio/wav';
  let fileName = `recording-${Date.now()}.mp3`;
  
  if (audioUri.includes('.mp3')) {
    mimeType = 'audio/mpeg';
    fileName = fileName.replace('.wav', '.mp3');
  }
  
  // Create FormData with proper binary file upload
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: mimeType,
    name: fileName,
  } as any);
  
  console.log('📤 [tmpfiles.org] Uploading with FormData...');
  console.log('📤 [tmpfiles.org] MIME type:', mimeType);
  
  // Upload using axios with FormData
  const uploadResponse = await axios.post(
    'https://tmpfiles.org/api/v1/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
      timeout: 60000,
    }
  );
  
  console.log('📤 [tmpfiles.org] Response status:', uploadResponse.status);
  console.log('📤 [tmpfiles.org] Response body:', JSON.stringify(uploadResponse.data));
  
  if (uploadResponse.status === 200 && uploadResponse.data) {
    const response = uploadResponse.data;
    
    if (response.status === 'success' && response.data?.url) {
      // Convert to direct download link
      const publicUrl = response.data.url
        .replace('http://', 'https://')
        .replace('tmpfiles.org/', 'tmpfiles.org/dl/');
      
      return publicUrl;
    }
  }
  
  throw new Error(`tmpfiles.org upload failed with status ${uploadResponse.status}`);
};

/**
 * Upload to Google Cloud Storage
 * Uses resumable upload with proper authentication
 */
const uploadToGoogleCloud = async (audioUri: string): Promise<string> => {
  const GOOGLE_CLOUD_BUCKET = process.env.EXPO_PUBLIC_GCS_BUCKET || '';
  const GOOGLE_CLOUD_API_KEY = process.env.EXPO_PUBLIC_GCS_API_KEY || '';
  
  if (!GOOGLE_CLOUD_BUCKET || !GOOGLE_CLOUD_API_KEY) {
    throw new Error('Google Cloud Storage not configured. Set EXPO_PUBLIC_GCS_BUCKET and EXPO_PUBLIC_GCS_API_KEY in .env');
  }
  
  console.log('📤 [Google Cloud] Uploading to bucket:', GOOGLE_CLOUD_BUCKET);
  
  // Determine file name and content type
  const fileName = `recordings/recording-${Date.now()}.wav`;
  const contentType = audioUri.includes('.mp3') ? 'audio/mpeg' : 'audio/wav';
  
  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: contentType,
    name: fileName,
  } as any);
  
  // Upload to Google Cloud Storage using resumable upload
  // Note: This requires the bucket to have "allUsers" with "Storage Object Creator" role
  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${GOOGLE_CLOUD_BUCKET}/o?uploadType=multipart&name=${encodeURIComponent(fileName)}`;
  
  console.log('📤 [Google Cloud] Upload URL:', uploadUrl);
  
  const uploadResponse = await axios.post(
    uploadUrl,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/related',
        'X-Goog-Api-Key': GOOGLE_CLOUD_API_KEY,
      },
      timeout: 60000,
    }
  );
  
  if (uploadResponse.status === 200 && uploadResponse.data) {
    // Return public URL
    const publicUrl = `https://storage.googleapis.com/${GOOGLE_CLOUD_BUCKET}/${fileName}`;
    console.log('✅ [Google Cloud] Upload successful:', publicUrl);
    return publicUrl;
  }
  
  throw new Error(`Google Cloud Storage upload failed: ${uploadResponse.status}`);
};

/**
 * Generate speech audio from text using TheFluent API
 * TheFluent automatically generates an ai_reading when you create a post
 * 
 * @param text - Text to convert to speech
 * @param languageId - Language ID (default: 22 for English)
 * @returns Audio URL from TheFluent API
 */
export const generateTTS = async (
  text: string,
  languageId: number = 22
): Promise<TheFluentTTSResponse> => {
  try {
    console.log('🔊 [TheFluent] Generating TTS...');

    // Create a post - TheFluent automatically generates ai_reading
    const postResponse = await createPost(text, 'TTS Request', languageId);

    if (postResponse.ai_reading) {
      return {
        success: true,
        audio_url: postResponse.ai_reading,
      };
    }

    return {
      success: false,
      error: 'No ai_reading in response',
    };
  } catch (error: any) {
    console.error('❌ [TheFluent] TTS generation error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'TTS generation failed',
    };
  }
};

/**
 * Determine word status based on score
 * @param score - Pronunciation score (0-100)
 */
const getWordStatus = (score: number): 'correct' | 'incorrect' | 'mispronounced' => {
  if (score >= 80) return 'correct';
  if (score >= 50) return 'mispronounced';
  return 'incorrect';
};

/**
 * Generate mock pronunciation response for demo/testing
 * This simulates TheFluent API response when the actual API is not available
 */
const generateMockPronunciationResponse = (referenceText: string): TheFluentPronunciationResponse => {
  const words = referenceText.split(/\s+/).map((word) => {
    // Clean punctuation
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    
    // Random score between 60-100 for demo
    const score = Math.floor(Math.random() * 40) + 60;
    
    return {
      word: cleanWord,
      score,
      status: getWordStatus(score),
    };
  });

  const overallScore = Math.floor(
    words.reduce((sum, w) => sum + w.score, 0) / words.length
  );

  console.log('🧪 Mock pronunciation data generated:', { overallScore, wordCount: words.length });

  return {
    success: true,
    overall_score: overallScore,
    words,
    fluency_score: overallScore - 5,
    pronunciation_score: overallScore,
  };
};

/**
 * Get available languages from TheFluent API
 * API Doc: https://thefluent.me/api/docs (Get all languages)
 */
export const getSupportedLanguages = async (): Promise<any[]> => {
  try {
    // Use RapidAPI endpoint
    const response = await rapidApi.get('/language');
    return response.data.supported_languages || [];
  } catch (error: any) {
    console.error('❌ Get languages error:', error.response?.data || error.message);
    return [];
  }
};

export default {
  analyzePronunciation,
  generateTTS,
  getSupportedLanguages,
};

/**
 * Code Agent Integration
 * 
 * Bu modül, kullanıcı etkileşimlerini izleyerek otomatik API çağrılarını yönetir.
 * Code Agent pattern'i kullanarak akıllı karar verme mekanizması sağlar.
 */

import { speakAvatar, waitForVideoCompletion, SpeakAvatarResponse, AvatarJob } from '../api/heygenClient';

export interface AgentConfig {
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableLogging?: boolean;
}

export interface AgentResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
  attempts?: number;
}

/**
 * Code Agent sınıfı - Avatar konuşturma işlemlerini otomatik yönetir
 */
export class AvatarCodeAgent {
  private config: AgentConfig;
  private requestQueue: Array<{ avatarId: string; text: string }> = [];
  private isProcessing: boolean = false;

  constructor(config: AgentConfig = {}) {
    this.config = {
      autoRetry: config.autoRetry ?? true,
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 2000,
      enableLogging: config.enableLogging ?? true,
    };
  }

  /**
   * Kullanıcı metnini otomatik olarak işler ve video oluşturur
   */
  async processUserInput(avatarId: string, text: string, isPhotoAvatar: boolean = false): Promise<AgentResponse> {
    this.log(`Processing user input: "${text.substring(0, 50)}..."`);

    // Metin validasyonu
    const validationError = this.validateInput(text);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Metin optimizasyonu (opsiyonel)
    const optimizedText = this.optimizeText(text);

    // Avatar konuşturma işlemini başlat
    return await this.executeWithRetry(avatarId, optimizedText, isPhotoAvatar);
  }

  /**
   * Retry mekanizması ile API çağrısı yapar
   */
  private async executeWithRetry(
    avatarId: string,
    text: string,
    isPhotoAvatar: boolean = false,
    attempt: number = 1
  ): Promise<AgentResponse> {
    try {
      this.log(`Attempt ${attempt}/${this.config.maxRetries}`);

      // HeyGen API çağrısı
      const response: SpeakAvatarResponse = await speakAvatar(avatarId, text, undefined, isPhotoAvatar);

      if (!response.success || !response.videoId) {
        throw new Error(response.error || 'Video generation failed');
      }

      // Video hazır olana kadar bekle
      const result: AvatarJob = await waitForVideoCompletion(response.videoId);

      if (result.status === 'completed' && result.videoUrl) {
        this.log('Video successfully created');
        return {
          success: true,
          videoUrl: result.videoUrl,
          attempts: attempt,
        };
      }

      throw new Error('Video processing failed');
    } catch (error: any) {
      this.log(`Error on attempt ${attempt}: ${error.message}`);

      // Retry mekanizması
      if (this.config.autoRetry && attempt < (this.config.maxRetries || 3)) {
        this.log(`Retrying after ${this.config.retryDelay}ms...`);
        await this.delay(this.config.retryDelay || 2000);
        return await this.executeWithRetry(avatarId, text, isPhotoAvatar, attempt + 1);
      }

      return {
        success: false,
        error: error.message,
        attempts: attempt,
      };
    }
  }

  /**
   * Input validasyonu
   */
  private validateInput(text: string): string | null {
    if (!text || text.trim().length === 0) {
      return 'Metin boş olamaz';
    }

    if (text.length > 5000) {
      return 'Metin çok uzun (maksimum 5000 karakter)';
    }

    return null;
  }

  /**
   * Metin optimizasyonu - Gereksiz boşlukları temizler
   */
  private optimizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Birden fazla boşluğu tek boşluğa indir
      .replace(/\n{3,}/g, '\n\n'); // Birden fazla satır atlamasını iki satıra indir
  }

  /**
   * Queue'ya ekleme (gelecekte kullanım için)
   */
  addToQueue(avatarId: string, text: string): void {
    this.requestQueue.push({ avatarId, text });
    this.log(`Added to queue. Queue size: ${this.requestQueue.length}`);
    this.processQueue();
  }

  /**
   * Queue işleme (gelecekte kullanım için)
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await this.processUserInput(request.avatarId, request.text);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Logging helper
   */
  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[AvatarCodeAgent] ${message}`);
    }
  }

  /**
   * Queue durumunu döndür
   */
  getQueueStatus(): { size: number; isProcessing: boolean } {
    return {
      size: this.requestQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}

// Singleton instance
let agentInstance: AvatarCodeAgent | null = null;

/**
 * Code Agent instance'ını al veya oluştur
 */
export const getAvatarAgent = (config?: AgentConfig): AvatarCodeAgent => {
  if (!agentInstance) {
    agentInstance = new AvatarCodeAgent(config);
  }
  return agentInstance;
};

export default AvatarCodeAgent;

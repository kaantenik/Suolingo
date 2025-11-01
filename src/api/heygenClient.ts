import axios, { AxiosInstance } from 'axios';

// HeyGen API yapılandırması
const HEYGEN_API_BASE_URL = 'https://api.heygen.com/v2';
const HEYGEN_API_KEY = process.env.EXPO_PUBLIC_HEYGEN_API_KEY || 'YOUR_API_KEY_HERE';

// Debug: API anahtarını kontrol et
console.log('HeyGen API Key:', HEYGEN_API_KEY ? `${HEYGEN_API_KEY.substring(0, 10)}...` : 'NOT FOUND');

// Axios instance oluştur
const heygenApi: AxiosInstance = axios.create({
  baseURL: HEYGEN_API_BASE_URL,
  headers: {
    'x-api-key': HEYGEN_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 saniye timeout
});

// API yanıt tipleri
export interface SpeakAvatarResponse {
  success: boolean;
  videoUrl?: string;
  videoId?: string;
  message?: string;
  error?: string;
}

export interface AvatarJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
}

/**
 * Avatar'ı konuşturma fonksiyonu
 * @param avatarId - HeyGen avatar ID (örn: "Angela-insuit-20220820")
 * @param text - Avatar'ın söyleyeceği metin
 * @param voice - Ses ID (opsiyonel)
 * @param isPhotoAvatar - Photo avatar mı kullanılıyor? (default: false)
 * @returns Video URL veya job ID
 */
export const speakAvatar = async (
  avatarId: string,
  text: string,
  voice?: string,
  isPhotoAvatar: boolean = false
): Promise<SpeakAvatarResponse> => {
  try {
    // HeyGen API v2 video generate endpoint
    console.log('Generating video with avatar:', avatarId, isPhotoAvatar ? '(Photo Avatar)' : '(Regular Avatar)');
    
    // Photo avatar için TalkingPhotoSettings, normal avatar için AvatarSettings
    const characterSettings = isPhotoAvatar ? {
      type: 'talking_photo' as const,
      talking_photo_id: avatarId,
      talking_style: 'expressive' as const,
    } : {
      type: 'avatar' as const,
      avatar_id: avatarId,
      avatar_style: 'normal' as const,
    };
    
    const response = await heygenApi.post('/video/generate', {
      video_inputs: [
        {
          character: characterSettings,
          voice: {
            type: 'text',
            input_text: text,
            voice_id: voice || '1bd001e7e50f421d891986aad5158bc8',
          },
        },
      ],
      dimension: {
        width: 1280,
        height: 720,
      },
      test: true, // ✅ TEST MODE: Kredi harcamaz, sadece test videoları oluşturur
    });

    if (response.data && response.data.data) {
      const videoId = response.data.data.video_id;
      console.log('✅ Video oluşturuldu! Video ID:', videoId);
      return {
        success: true,
        videoId: videoId,
        message: 'Video oluşturma işlemi başlatıldı',
      };
    }

    return {
      success: false,
      error: 'Beklenmeyen API yanıtı',
    };
  } catch (error: any) {
    console.error('HeyGen API Hatası:', error.response?.data || error.message);
    
    let errorMessage = error.message || 'Bilinmeyen hata';
    
    if (error.response?.status === 401) {
      errorMessage = 'API anahtarı geçersiz veya eksik. Lütfen .env dosyanızı kontrol edin.';
    } else if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Video durumunu kontrol etme
 * @param videoId - Video job ID
 * @returns Video durumu ve URL
 */
export const checkVideoStatus = async (videoId: string): Promise<AvatarJob> => {
  try {
    // HeyGen API v1 video status endpoint (v1 kullanıyor!)
    const response = await axios.get('https://api.heygen.com/v1/video_status.get', {
      params: {
        video_id: videoId
      },
      headers: {
        'x-api-key': HEYGEN_API_KEY,
        'accept': 'application/json',
      }
    });
    
    console.log('Video status response:', response.data);
    
    if (response.data && response.data.data) {
      const { status, video_url } = response.data.data;
      
      return {
        id: videoId,
        status: status as AvatarJob['status'],
        videoUrl: video_url,
      };
    }

    return {
      id: videoId,
      status: 'failed',
    };
  } catch (error: any) {
    console.error('Video durumu kontrol hatası:', error.response?.data || error.message);
    console.error('Video ID:', videoId);
    return {
      id: videoId,
      status: 'failed',
    };
  }
};

/**
 * Avatar listesini getir (opsiyonel)
 */
export const getAvailableAvatars = async (): Promise<any[]> => {
  try {
    const response = await heygenApi.get('/avatars');
    console.log('Available avatars:', response.data?.data?.avatars?.slice(0, 5)); // İlk 5'i göster
    return response.data?.data?.avatars || [];
  } catch (error: any) {
    console.error('Avatar listesi getirme hatası:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Polling ile video hazır olana kadar bekle
 * @param videoId - Video job ID
 * @param maxAttempts - Maksimum deneme sayısı (varsayılan: 60)
 * @param intervalMs - Kontrol aralığı ms cinsinden (varsayılan: 3000)
 */
export const waitForVideoCompletion = async (
  videoId: string,
  maxAttempts: number = 60,
  intervalMs: number = 3000
): Promise<AvatarJob> => {
  console.log(`⏳ Video işleniyor... (Maks ${maxAttempts} deneme, ${intervalMs}ms aralık)`);
  
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkVideoStatus(videoId);
    
    console.log(`Deneme ${i + 1}/${maxAttempts}: ${status.status}`);
    
    if (status.status === 'completed' || status.status === 'failed') {
      return status;
    }
    
    // Belirtilen süre kadar bekle
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  console.log('⚠️ Timeout: Video işleme süresi doldu');
  
  return {
    id: videoId,
    status: 'failed',
  };
};

// ============================================
// PHOTO AVATAR API - INSTANT AVATAR (Tek Fotoğraftan Avatar)
// ============================================

export interface UploadAssetResponse {
  success: boolean;
  asset_id?: string;
  image_key?: string;
  error?: string;
}

export interface InstantAvatarResponse {
  success: boolean;
  avatar_id?: string;
  message?: string;
  error?: string;
}

export interface PhotoAvatarRequest {
  name: string;
  photo_url: string;
  age?: 'Young Adult' | 'Early Middle Age' | 'Late Middle Age' | 'Senior' | 'Unspecified';
  gender?: 'Woman' | 'Man' | 'Unspecified';
  ethnicity?: string;
  orientation?: 'square' | 'horizontal' | 'vertical';
  pose?: 'half_body' | 'close_up' | 'full_body';
  style?: 'Realistic' | 'Pixar' | 'Cinematic' | 'Vintage' | 'Noir' | 'Cyberpunk' | 'Unspecified';
  appearance?: string;
}

export interface PhotoAvatarResponse {
  success: boolean;
  job_id?: string;
  message?: string;
  error?: string;
}

export interface PhotoJobStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  photo_urls?: string[];
  photo_keys?: string[]; // image_key_list
  error?: string;
}

/**
 * INSTANT AVATAR: Fotoğraf yükle ve direkt konuşan avatar oluştur
 * @param imageSource - Local image URI (file://) veya HTTP URL
 * @returns Avatar ID
 */
export const uploadImageAndCreateAvatar = async (imageSource: string): Promise<InstantAvatarResponse> => {
  try {
    // 🧪 TEST MODE: Mevcut group ID'yi kullan (kredi tasarrufu için)
    const TEST_MODE = true; // ← MEVCUT GROUP KULLAN
    const TEST_GROUP_ID = '287c77273d72408b96674909e494717b'; // Yeni oluşturulan group (fotoğraflar hazır)
    
    if (TEST_MODE) {
      console.log('🧪 TEST MODE: Mevcut group ID kullanılıyor:', TEST_GROUP_ID);
      
      // Önce training durumunu kontrol et
      console.log('🔍 Training durumu kontrol ediliyor...');
      const currentStatus = await checkTrainingStatus(TEST_GROUP_ID);
      console.log('📊 Mevcut training durumu:', currentStatus.status);
      
      let avatarId = currentStatus.avatar_id;
      
      // Eğer training zaten tamamlanmışsa, avatar ID'yi al
      if (currentStatus.status === 'ready' || currentStatus.status === 'completed') {
        console.log('✅ Training zaten tamamlanmış!');
        
        // Avatar ID yoksa group'tan al
        if (!avatarId) {
          console.log('🔍 Avatar ID training\'den gelmedi, group avatarlarını kontrol ediliyor...');
          try {
            // Doğru endpoint: /avatar_group/{group_id}/avatars
            const avatarsResponse = await heygenApi.get(`/avatar_group/${TEST_GROUP_ID}/avatars`);
            console.log('📋 Group avatars response:', JSON.stringify(avatarsResponse.data, null, 2));
            
            // İlk avatar'ı al - response.data.data.avatar_list[0].id
            if (avatarsResponse.data?.data?.avatar_list && avatarsResponse.data.data.avatar_list.length > 0) {
              avatarId = avatarsResponse.data.data.avatar_list[0].id;
              console.log('✅ Avatar ID bulundu:', avatarId);
            }
          } catch (error: any) {
            console.error('Avatar listesi alınamadı:', error.response?.data || error.message);
          }
        }
        
        if (!avatarId) {
          return {
            success: false,
            error: 'Avatar ID bulunamadı. Training tamamlanmış ama group\'ta avatar yok.',
          };
        }
        
        // Direkt motion eklemeye geç
        console.log('🎬 Avatar ID:', avatarId, '- Motion ekleniyor...');
        
        const motionResponse = await heygenApi.post('/photo_avatar/add_motion', {
          id: avatarId,
          motion_type: 'consistent',
        });

        console.log('Motion response:', motionResponse.data);

        // Motion response'dan yeni avatar ID'yi al
        // Response ya direkt avatar_id verir ya da mevcut ID'yi kullanmaya devam ederiz
        const motionAvatarId = motionResponse.data?.data?.avatar_id || 
                               motionResponse.data?.data?.id || 
                               avatarId;
        
        console.log('Motion Avatar ID:', motionAvatarId);
        
        // Motion ekleme işlemi asenkron olabilir, avatar detaylarını kontrol et
        console.log('⏳ Motion işlemi tamamlanması bekleniyor...');
        
        // Avatar detaylarını kontrol et (is_motion: true olana kadar bekle)
        for (let i = 0; i < 30; i++) {
          try {
            const detailsResponse = await heygenApi.get(`/photo_avatar/${motionAvatarId}`);
            console.log(`Motion check ${i + 1}/30:`, detailsResponse.data?.data?.is_motion ? 'completed' : 'pending');
            
            if (detailsResponse.data?.data?.is_motion === true) {
              console.log('✅ Motion tamamlandı! Avatar ID:', motionAvatarId);
              console.log('⏳ Avatar video sisteminde kullanılabilir mi test ediliyor...');
              
              // Avatar'ın video generation sisteminde kullanılabilir olup olmadığını kontrol et
              // Birkaç deneme yap (max 60 saniye = 12 x 5 saniye)
              for (let j = 0; j < 12; j++) {
                try {
                  // Test video oluşturmayı dene (gerçekten oluşturma, sadece validation kontrolü)
                  await heygenApi.post('/video/generate', {
                    video_inputs: [{
                      character: {
                        type: 'talking_photo',
                        talking_photo_id: motionAvatarId,
                      },
                      voice: {
                        type: 'text',
                        input_text: 'Test',
                        voice_id: '1bd001e7e50f421d891986aad5158bc8',
                      },
                    }],
                    dimension: { width: 1280, height: 720 },
                    test: true,
                  });
                  
                  console.log('🎉 Avatar video sisteminde kullanılabilir! Final Avatar ID:', motionAvatarId);
                  return {
                    success: true,
                    avatar_id: motionAvatarId,
                    message: 'Avatar başarıyla oluşturuldu ve kullanıma hazır!',
                  };
                } catch (testError: any) {
                  const errorCode = testError.response?.data?.error?.code;
                  console.log(`Test ${j + 1}/12:`, errorCode || 'unknown error');
                  
                  if (errorCode === 'avatar_not_found') {
                    // Avatar henüz sistemde kayıtlı değil, bekle
                    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 saniye bekle
                    continue;
                  } else {
                    // Başka bir hata, avatar kullanılabilir (test mode hatası olabilir)
                    console.log('🎉 Avatar hazır! Final Avatar ID:', motionAvatarId);
                    return {
                      success: true,
                      avatar_id: motionAvatarId,
                      message: 'Avatar başarıyla oluşturuldu!',
                    };
                  }
                }
              }
              
              // Timeout ama yine de avatar ID'yi dön
              console.warn('⚠️ Video sistemi timeout ama avatar ID döndürülüyor');
              return {
                success: true,
                avatar_id: motionAvatarId,
                message: 'Avatar oluşturuldu ama video sisteminde aktif olması 5-10 dakika sürebilir',
              };
            }
          } catch (error: any) {
            console.warn('Avatar details check error:', error.response?.data || error.message);
          }
          
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 saniye bekle
        }
        
        // Timeout olsa bile avatar ID'yi dön (motion hala işlenebilir)
        console.warn('⚠️ Motion timeout ama avatar ID döndürülüyor');
        return {
          success: true,
          avatar_id: motionAvatarId,
          message: 'Avatar oluşturuldu ama motion işlemi devam ediyor',
        };
      }
      
      // Eğer training henüz tamamlanmadıysa, training başlat
      console.log('🎯 Training başlatılıyor...');
      
      // Direkt training'e geç
      const trainResponse = await trainPhotoAvatarGroup(TEST_GROUP_ID);

      if (!trainResponse.success) {
        return {
          success: false,
          error: 'Training başlatılamadı: ' + trainResponse.error,
        };
      }

      console.log('⏳ Training tamamlanması bekleniyor (bu 10-20 dakika sürebilir)...');

      // Training tamamlanana kadar bekle
      const trainingStatus = await waitForTrainingCompletion(TEST_GROUP_ID, 120, 5000);

      if (trainingStatus.status !== 'completed') {
        return {
          success: false,
          error: 'Training tamamlanamadı. Status: ' + trainingStatus.status + ', Error: ' + trainingStatus.error,
        };
      }

      console.log('✅ Training tamamlandı!');
      
      // Avatar ID training'den gelmiyorsa, group'tan avatar listesini al
      let finalAvatarId = trainingStatus.avatar_id;
      
      if (!finalAvatarId) {
        console.log('🔍 Avatar ID training\'den gelmedi, group avatarlarını kontrol ediliyor...');
        try {
          // Doğru endpoint: /avatar_group/{group_id}/avatars
          const avatarsResponse = await heygenApi.get(`/avatar_group/${TEST_GROUP_ID}/avatars`);
          console.log('📋 Group avatars:', JSON.stringify(avatarsResponse.data, null, 2));
          
          // İlk avatar'ı al - response.data.data.avatar_list[0].id
          if (avatarsResponse.data?.data?.avatar_list && avatarsResponse.data.data.avatar_list.length > 0) {
            finalAvatarId = avatarsResponse.data.data.avatar_list[0].id;
            console.log('✅ Avatar ID bulundu:', finalAvatarId);
          }
        } catch (error: any) {
          console.error('Avatar listesi alınamadı:', error.response?.data || error.message);
        }
      }
      
      if (!finalAvatarId) {
        return {
          success: false,
          error: 'Avatar ID bulunamadı. Training tamamlandı ama avatar oluşturulmadı.',
        };
      }

      console.log('🎬 Avatar ID:', finalAvatarId, '- Motion ekleniyor...');

      // Avatar'a hareket ekle
      const motionResponse = await heygenApi.post('/photo_avatar/add_motion', {
        id: finalAvatarId,
        motion_type: 'consistent',
      });

      console.log('Motion response:', motionResponse.data);

      if (motionResponse.data?.data?.avatar_id) {
        console.log('🎉 Avatar hazır! Final Avatar ID:', motionResponse.data.data.avatar_id);
        return {
          success: true,
          avatar_id: motionResponse.data.data.avatar_id,
          message: 'Test mode: Avatar başarıyla oluşturuldu!',
        };
      }

      return {
        success: false,
        error: 'Avatar\'a hareket eklenemedi',
      };
    }
    
    // NORMAL MODE (kredi tüketir)
    console.log('🚀 [INSTANT AVATAR] 1/3: Fotoğraf yükleniyor...');
    
    let photoUrl = imageSource;
    
    // Eğer local file ise, önce upload et
    if (imageSource.startsWith('file://') || imageSource.startsWith('content://')) {
      const uploadResponse = await uploadImageAsset(imageSource);
      
      if (!uploadResponse.success || !uploadResponse.asset_id) {
        return {
          success: false,
          error: uploadResponse.error || 'Fotoğraf yüklenemedi',
        };
      }
      
      console.log('✅ Fotoğraf yüklendi! Asset ID:', uploadResponse.asset_id);
      photoUrl = `asset://${uploadResponse.asset_id}`;
    } else {
      console.log('✅ HTTP URL kullanılıyor:', imageSource);
    }

    console.log('🎨 [INSTANT AVATAR] 2/3: Photo avatar oluşturuluyor...');

    // 2. Photo avatar oluştur (tek fotoğraftan, hareketsiz)
    const photoResponse = await heygenApi.post('/photo_avatar/photo/generate', {
      name: `Instant Avatar ${Date.now()}`,
      photo_url: photoUrl,
      age: 'Young Adult', // ✅ Zorunlu parametre
      gender: 'Unspecified', // ✅ Zorunlu parametre
      ethnicity: 'Unspecified', // ✅ Geçerli değerler: 'White', 'Black', 'Asian American', 'East Asian', 'South East Asian', 'South Asian', 'Middle Eastern', 'Pacific', 'Hispanic', 'Unspecified'
      appearance: 'A professional looking person with a friendly expression', // ✅ Zorunlu parametre - Açıklama/prompt
      orientation: 'square',
      pose: 'half_body',
      style: 'Realistic',
    });

    console.log('Photo avatar response:', photoResponse.data);

    if (!photoResponse.data?.data?.generation_id) {
      return {
        success: false,
        error: 'Photo avatar oluşturulamadı',
      };
    }

    const generationId = photoResponse.data.data.generation_id;
    
    // 3. Photo generation tamamlanana kadar bekle
    console.log('⏳ [INSTANT AVATAR] 2.5/3: Photo avatar işleniyor...');
    const photoStatus = await waitForPhotoCompletion(generationId);
    
    if (photoStatus.status !== 'completed' || !photoStatus.photo_keys || photoStatus.photo_keys.length === 0) {
      return {
        success: false,
        error: 'Photo avatar hazırlanamadı',
      };
    }

    console.log('✅ Photo avatar hazır!');
    console.log('🎬 [INSTANT AVATAR] 3/3: İlk photo\'ya motion ekleniyor...');

    // 3. İlk photo'ya direkt motion ekle (group/training olmadan - daha hızlı!)
    // Not: add_motion endpoint'i photo_key yerine "photo avatar id" bekliyor olabilir
    // O yüzden önce photo avatar detaylarını alalım
    
    try {
      const motionResponse = await heygenApi.post('/photo_avatar/add_motion', {
        id: photoStatus.photo_keys[0], // İlk photo key'i dene
        motion_type: 'consistent', // Runway Gen4
      });

      console.log('Motion response:', motionResponse.data);

      if (motionResponse.data?.data?.avatar_id) {
        console.log('🎉 Avatar hazır! Avatar ID:', motionResponse.data.data.avatar_id);
        return {
          success: true,
          avatar_id: motionResponse.data.data.avatar_id,
          message: 'Instant avatar başarıyla oluşturuldu!',
        };
      }

      // Eğer direkt motion ekleme başarısız olduysa, eski yöntemi dene (group + training)
      console.warn('⚠️ Direkt motion ekleme başarısız, group + training yöntemi deneniyor...');
      
    } catch (motionError: any) {
      console.warn('⚠️ Direkt motion hatası:', motionError.response?.data || motionError.message);
      console.log('🔄 Alternatif yöntem deneniyor: Group + Training...');
    }

    // ALTERNATİF YÖNTEM: Photo avatar group + training
    console.log('🎬 [INSTANT AVATAR] 3/6: Photo avatar group oluşturuluyor...');

    // Photo avatar group oluştur (ilk fotoğraf ile)
    const groupResponse = await createPhotoAvatarGroup(
      `Instant Avatar Group ${Date.now()}`,
      generationId,
      photoStatus.photo_keys[0]
    );

    if (!groupResponse.success || !groupResponse.group_id) {
      return {
        success: false,
        error: 'Photo avatar group oluşturulamadı',
      };
    }

    console.log('✅ Group oluşturuldu! Group ID:', groupResponse.group_id);
    
    // İlk fotoğrafın hazır olmasını bekle
    console.log('⏳ İlk fotoğrafın yüklenmesi bekleniyor...');
    for (let i = 0; i < 20; i++) {
      try {
        const avatarsResponse = await heygenApi.get(`/avatar_group/${groupResponse.group_id}/avatars`);
        const avatarList = avatarsResponse.data?.data?.avatar_list || [];
        const firstAvatar = avatarList.find((avatar: any) => avatar.id === groupResponse.group_id);
        
        console.log(`First photo check ${i + 1}/20:`, firstAvatar?.status || 'not found');
        
        if (firstAvatar && (firstAvatar.status === 'completed' || firstAvatar.status === 'ready')) {
          console.log('✅ İlk fotoğraf hazır!');
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniye bekle
      } catch (error: any) {
        console.warn('First photo check error:', error.response?.data || error.message);
      }
    }
    
    // Kalan fotoğrafları da group'a ekle (training için en az 2-3 fotoğraf gerekiyor)
    if (photoStatus.photo_keys.length > 1) {
      console.log(`📸 [INSTANT AVATAR] 3.5/6: Kalan ${photoStatus.photo_keys.length - 1} fotoğraf group'a ekleniyor...`);
      
      const remainingKeys = photoStatus.photo_keys.slice(1); // İlk hariç hepsini al
      const addPhotosResponse = await heygenApi.post('/photo_avatar/avatar_group/add', {
        group_id: groupResponse.group_id,
        image_keys: remainingKeys,
        generation_id: generationId,
        name: 'Additional Looks',
      });

      console.log('Add photos response:', addPhotosResponse.data);
      
      if (addPhotosResponse.data?.error) {
        console.warn('⚠️ Kalan fotoğraflar eklenirken uyarı:', addPhotosResponse.data.error);
      } else {
        console.log('✅ Kalan fotoğraflar eklendi!');
      }
    }

    console.log('⏳ [INSTANT AVATAR] 3.75/6: Fotoğrafların hazır olması bekleniyor...');
    
    // Fotoğrafların hazır olmasını bekle (status: "completed")
    for (let i = 0; i < 30; i++) {
      try {
        const avatarsResponse = await heygenApi.get(`/avatar_group/${groupResponse.group_id}/avatars`);
        const avatarList = avatarsResponse.data?.data?.avatar_list || [];
        
        // Tüm avatarların status'ünü kontrol et
        const allCompleted = avatarList.length > 0 && avatarList.every((avatar: any) => 
          avatar.status === 'completed' || avatar.status === 'ready'
        );
        
        const pendingCount = avatarList.filter((avatar: any) => avatar.status === 'pending').length;
        
        console.log(`Photo upload check ${i + 1}/30: ${avatarList.length} photos, ${pendingCount} pending`);
        
        if (allCompleted) {
          console.log('✅ Tüm fotoğraflar hazır!');
          break;
        }
        
        if (i === 29) {
          console.warn('⚠️ Fotoğraflar 90 saniyede hazır olmadı, devam ediliyor...');
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 saniye bekle
      } catch (error: any) {
        console.warn('Photo status check error:', error.response?.data || error.message);
      }
    }

    console.log('🎯 [INSTANT AVATAR] 4/6: Avatar training başlatılıyor...');

    console.log('🎯 [INSTANT AVATAR] 4/6: Avatar training başlatılıyor...');

    // 4. Group'u train et
    const trainResponse = await trainPhotoAvatarGroup(groupResponse.group_id);

    if (!trainResponse.success) {
      return {
        success: false,
        error: 'Training başlatılamadı',
      };
    }

    console.log('⏳ [INSTANT AVATAR] 4.5/6: Training tamamlanması bekleniyor...');

    // 5. Training tamamlanana kadar bekle
    const trainingStatus = await waitForTrainingCompletion(groupResponse.group_id);

    if (trainingStatus.status !== 'completed' || !trainingStatus.avatar_id) {
      return {
        success: false,
        error: 'Training tamamlanamadı',
      };
    }

    console.log('✅ Training tamamlandı! Avatar ID:', trainingStatus.avatar_id);
    console.log('🎬 [INSTANT AVATAR] 6/6: Avatar\'a hareket ekleniyor...');

    // 6. Photo avatar'a hareket ekle (konuşabilir hale getir)
    const motionResponse = await heygenApi.post('/photo_avatar/add_motion', {
      id: trainingStatus.avatar_id, // Training'den gelen avatar_id'yi kullan
      motion_type: 'consistent', // Runway Gen4
    });

    console.log('Motion response:', motionResponse.data);

    if (motionResponse.data?.data?.avatar_id) {
      console.log('🎉 Avatar hazır! Avatar ID:', motionResponse.data.data.avatar_id);
      return {
        success: true,
        avatar_id: motionResponse.data.data.avatar_id,
        message: 'Instant avatar başarıyla oluşturuldu!',
      };
    }

    return {
      success: false,
      error: 'Avatar\'a hareket eklenemedi',
    };
  } catch (error: any) {
    console.error('❌ Instant Avatar Hatası:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Unknown error',
    };
  }
};

/**
 * Fotoğraf Asset Upload (internal helper)
 * @param imageUri - Local image URI
 */
const uploadImageAsset = async (imageUri: string): Promise<UploadAssetResponse> => {
  try {
    // React Native'de fetch ile binary upload
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const uploadResponse = await axios.post(
      'https://upload.heygen.com/v1/asset',
      blob,
      {
        headers: {
          'x-api-key': HEYGEN_API_KEY,
          'Content-Type': 'image/jpeg',
        },
        timeout: 60000,
      }
    );

    if (uploadResponse.data?.data) {
      return {
        success: true,
        asset_id: uploadResponse.data.data.id,
        image_key: uploadResponse.data.data.image_key,
      };
    }

    return { success: false, error: 'Asset upload failed' };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Photo generation tamamlanana kadar bekle
 */
const waitForPhotoCompletion = async (
  generationId: string,
  maxAttempts: number = 60,
  intervalMs: number = 3000
): Promise<PhotoJobStatus> => {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkPhotoAvatarStatus(generationId);
    
    console.log(`Photo check ${i + 1}/${maxAttempts}: ${status.status}`);
    
    if (status.status === 'completed' || status.status === 'failed') {
      return status;
    }
    
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  return {
    job_id: generationId,
    status: 'failed',
    error: 'Timeout',
  };
};

/**
 * Photo Avatar oluşturma (ESKİ YÖNTEM - 4 fotoğraf generate eder)
 * @param photoUrl - Fotoğraf URL'i
 * @param name - Avatar adı
 * @param options - Opsiyonel parametreler
 */
export const generatePhotoAvatar = async (
  photoUrl: string,
  name: string,
  options?: Partial<PhotoAvatarRequest>
): Promise<PhotoAvatarResponse> => {
  try {
    console.log('Generating photo avatar:', name);
    const response = await heygenApi.post('/photo_avatar/photo/generate', {
      name,
      photo_url: photoUrl,
      age: options?.age || 'Unspecified',
      gender: options?.gender || 'Unspecified',
      ethnicity: options?.ethnicity,
      orientation: options?.orientation || 'square',
      pose: options?.pose || 'half_body',
      style: options?.style || 'Realistic',
      appearance: options?.appearance,
    });

    console.log('Photo avatar response:', response.data);

    if (response.data && response.data.data) {
      return {
        success: true,
        job_id: response.data.data.generation_id || response.data.data.job_id,
        message: 'Photo avatar generation started',
      };
    }

    return {
      success: false,
      error: 'Unexpected API response',
    };
  } catch (error: any) {
    console.error('Photo Avatar API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Unknown error',
    };
  }
};

/**
 * Photo Avatar durum kontrolü
 * @param jobId - Generation ID
 */
export const checkPhotoAvatarStatus = async (jobId: string): Promise<PhotoJobStatus> => {
  try {
    const response = await heygenApi.get(`/photo_avatar/generation/${jobId}`);
    
    console.log('Photo status response:', response.data);
    
    if (response.data && response.data.data) {
      const data = response.data.data;
      
      // Status mapping: "success" -> "completed"
      let status = data.status || data.state || 'pending';
      if (status === 'success') {
        status = 'completed';
      }
      
      // Photo URLs'i al
      const photos = data.image_url_list || data.photos || data.photo_urls || [];
      const keys = data.image_key_list || [];
      
      return {
        job_id: jobId,
        status: status as PhotoJobStatus['status'],
        photo_urls: Array.isArray(photos) ? photos : [],
        photo_keys: Array.isArray(keys) ? keys : [],
      };
    }

    return {
      job_id: jobId,
      status: 'failed',
    };
  } catch (error: any) {
    console.error('Photo status check error:', error.response?.data || error.message);
    return {
      job_id: jobId,
      status: 'failed',
      error: error.message,
    };
  }
};

// ============================================
// PHOTO AVATAR GROUP & TRAINING
// ============================================

export interface PhotoAvatarGroupResponse {
  success: boolean;
  group_id?: string;
  error?: string;
}

export interface TrainingJobResponse {
  success: boolean;
  job_id?: string;
  error?: string;
}

export interface TrainingJobStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'ready' | 'failed';
  avatar_id?: string;
  error?: string;
}

/**
 * Photo Avatar Group oluştur
 * @param name - Group adı
 * @param generationId - Generation ID (photo generation'dan)
 * @param imageKey - Image key (photo generation'dan)
 */
export const createPhotoAvatarGroup = async (
  name: string, 
  generationId: string, 
  imageKey: string
): Promise<PhotoAvatarGroupResponse> => {
  try {
    console.log('Creating photo avatar group:', name, generationId, imageKey);
    const response = await heygenApi.post('/photo_avatar/avatar_group/create', { 
      name,
      generation_id: generationId,
      image_key: imageKey,
    });

    console.log('Group creation response:', response.data);

    if (response.data && response.data.data) {
      return {
        success: true,
        group_id: response.data.data.group_id || response.data.data.avatar_group_id,
      };
    }

    return {
      success: false,
      error: 'Unexpected API response',
    };
  } catch (error: any) {
    console.error('Group creation error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Unknown error',
    };
  }
};

/**
 * Photo Avatar Group'a fotoğraf ekle
 * @param groupId - Group ID
 * @param photoUrls - Fotoğraf URL'leri (generation ID'lerden alınan)
 */
export const addPhotosToGroup = async (groupId: string, photoUrls: string[]): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Adding photos to group:', groupId, photoUrls.length);
    const response = await heygenApi.post('/photo_avatar/group/photo/add', {
      group_id: groupId,
      photo_ids: photoUrls, // API belki photo_urls bekliyor, dökümanı kontrol et
    });

    console.log('Add photos response:', response.data);

    if (response.data && !response.data.error) {
      return { success: true };
    }

    return {
      success: false,
      error: 'Failed to add photos',
    };
  } catch (error: any) {
    console.error('Add photos error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Unknown error',
    };
  }
};

/**
 * Photo Avatar Group'u train et
 * @param groupId - Group ID
 */
export const trainPhotoAvatarGroup = async (groupId: string): Promise<TrainingJobResponse> => {
  try {
    console.log('Training photo avatar group:', groupId);
    const response = await heygenApi.post('/photo_avatar/train', {
      group_id: groupId,
    });

    console.log('Training response:', response.data);

    if (response.data && response.data.data) {
      return {
        success: true,
        job_id: response.data.data.job_id || groupId, // Group ID'yi job_id olarak kullan
      };
    }

    return {
      success: false,
      error: 'Unexpected API response',
    };
  } catch (error: any) {
    console.error('Training error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Unknown error',
    };
  }
};

/**
 * Training job durumunu kontrol et
 * @param groupId - Avatar Group ID (not job_id!)
 */
export const checkTrainingStatus = async (groupId: string): Promise<TrainingJobStatus> => {
  try {
    const response = await heygenApi.get(`/photo_avatar/train/status/${groupId}`);
    
    console.log('Training status response:', response.data);
    
    if (response.data && response.data.data) {
      const data = response.data.data;
      
      return {
        job_id: groupId,
        status: data.status as TrainingJobStatus['status'],
        avatar_id: data.avatar_id,
      };
    }

    return {
      job_id: groupId,
      status: 'failed',
    };
  } catch (error: any) {
    console.error('Training status check error:', error.response?.data || error.message);
    return {
      job_id: groupId,
      status: 'failed',
      error: error.message,
    };
  }
};

/**
 * Training tamamlanana kadar bekle
 * @param groupId - Avatar Group ID
 * @param maxAttempts - Maksimum deneme sayısı (varsayılan: 120, training uzun sürebilir)
 * @param intervalMs - Kontrol aralığı ms cinsinden (varsayılan: 5000)
 */
export const waitForTrainingCompletion = async (
  groupId: string,
  maxAttempts: number = 120,
  intervalMs: number = 5000
): Promise<TrainingJobStatus> => {
  console.log(`⏳ Training işleniyor... (Maks ${maxAttempts} deneme, ${intervalMs}ms aralık)`);
  
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkTrainingStatus(groupId);
    
    console.log(`Training deneme ${i + 1}/${maxAttempts}: ${status.status}`);
    
    // 'completed', 'ready', veya 'failed' durumlarında dur
    if (status.status === 'completed' || status.status === 'ready' || status.status === 'failed') {
      // 'ready' durumunu 'completed' olarak değiştir
      if (status.status === 'ready') {
        console.log('✅ Training hazır! Status: ready -> completed olarak işleniyor');
        return {
          ...status,
          status: 'completed',
        };
      }
      return status;
    }
    
    // Belirtilen süre kadar bekle
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  console.log('⚠️ Timeout: Training süresi doldu');
  
  return {
    job_id: groupId,
    status: 'failed',
    error: 'Training timeout',
  };
};

export default {
  speakAvatar,
  checkVideoStatus,
  getAvailableAvatars,
  waitForVideoCompletion,
  // Instant Avatar (Yeni - Önerilen)
  uploadImageAndCreateAvatar,
  // Eski yöntemler (4 fotoğraf + training)
  generatePhotoAvatar,
  checkPhotoAvatarStatus,
  createPhotoAvatarGroup,
  addPhotosToGroup,
  trainPhotoAvatarGroup,
  checkTrainingStatus,
};

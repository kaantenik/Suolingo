# 🎓 AI Avatar English Learning App

React Native + Expo ile geliştirilmiş, yapay zeka destekli İngilizce telaffuz öğrenme uygulaması. HeyGen AI avatarları ve TheFluent telaffuz analizi kullanır.

## ✨ Özellikler

- 🎥 **AI Avatar Öğretmen** - HeyGen API ile gerçekçi avatar videoları
- 🎤 **Telaffuz Analizi** - TheFluent API ile kelime bazlı geri bildirim
- 📚 **5 Hazır Ders** - Günlük konuşma pratikleri
- 📊 **Anlık Puanlama** - 0-100 arası telaffuz skoru
- 🎯 **İnteraktif Öğrenme** - Dinle, tekrar et, öğren
- 🔊 **Sesli Kayıt** - WAV formatında yüksek kalite ses kaydı
- ☁️ **Cloud Storage** - Google Cloud Storage ile ses dosyası yönetimi

## 📱 Ekranlar

### 1. Video Avatar (Ana Sayfa)
- Metni AI avatar videosuna dönüştürme
- Özel metin girişi
- Video oynatıcı

### 2. Lesson (Ders Ekranı)
- 5 hazır ders içeriği
- Avatar video gösterimi
- Ses kaydı ve telaffuz analizi
- Kelime bazlı puanlama
- İleri/geri navigasyon

## 🛠️ Kurulum

### Gereksinimler

- Node.js 20.x veya üzeri
- npm veya yarn
- Expo Go uygulaması (test için)
- Android Studio (Android için) veya Xcode (iOS için)

### API Anahtarları

Aşağıdaki servislere kaydolup API anahtarlarını alın:

1. **HeyGen** - [app.heygen.com/settings](https://app.heygen.com/settings)
2. **RapidAPI (TheFluent)** - [rapidapi.com/TheFluentMe/api/thefluent](https://rapidapi.com/TheFluentMe/api/thefluent)
3. **Google Cloud Storage** (opsiyonel) - [console.cloud.google.com](https://console.cloud.google.com)

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd AvatarApp
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment dosyasını oluşturun:**
```bash
# .env.example'ı kopyalayın
copy .env.example .env
```

4. **API anahtarlarını ekleyin (.env):**
```env
EXPO_PUBLIC_HEYGEN_API_KEY=sk_V2_hgu_your_key_here
EXPO_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key_here

# Opsiyonel - Google Cloud Storage
EXPO_PUBLIC_GCS_BUCKET=your-bucket-name
EXPO_PUBLIC_GCS_API_KEY=your-gcs-api-key
```

5. **Uygulamayı başlatın:**
```bash
npm start
```

6. **Platform seçin:**
```bash
# Android
npm run android

# iOS (sadece macOS)
npm run ios

# Web (sınırlı özellikler)
npm run web
```

## � Proje Yapısı

```
AvatarApp/
├── src/
│   ├── api/
│   │   ├── heygenClient.ts          # HeyGen API (video oluşturma)
│   │   └── theFluentClient.ts       # TheFluent API (telaffuz analizi)
│   ├── components/
│   │   ├── AvatarVideo.tsx          # Video oynatıcı
│   │   ├── TextArea.tsx             # Ders metni gösterimi
│   │   └── VoiceRecorder.tsx        # Ses kaydedici
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Ana sayfa (text-to-video)
│   │   └── LessonScreen.tsx         # Ders ekranı
│   ├── hooks/
│   │   └── useAvatarSpeech.ts       # Video oluşturma hook
│   └── utils/
│       ├── lessonData.ts            # 5 ders içeriği
│       └── types.ts                 # TypeScript tipleri
├── App.tsx                          # Tab navigasyon
├── .env                            # API anahtarları (git'e eklenmez)
└── package.json
```

## 🎯 Kullanım Rehberi

### Video Avatar Ekranı

1. İstediğiniz metni girin
2. **"Generate Video"** butonuna basın
3. Video oluşması 30-60 saniye sürer
4. Video hazır olunca otomatik oynatılır

### Lesson (Ders) Ekranı

1. **Lesson 1-5** arası seçin (← → okları ile)
2. **"Speak"** butonuna basarak avatar videosunu başlatın
3. Video bitince metni okuyun
4. **"Start Recording"** ile kaydı başlatın
5. **"Stop Recording"** ile durdurun
6. Telaffuz analizi otomatik yapılır
7. Puanınızı ve kelime bazlı geri bildirimi görün

## 🔧 Teknik Detaylar

### HeyGen API

**Avatar Video Oluşturma:**
```typescript
import { speakAvatar } from './src/api/heygenClient';

const response = await speakAvatar(
  'Kristin-inSuit-20220812', 
  'Hello, how are you today?'
);
```

**Kullanılabilir Avatar ID'leri:**
- `Kristin-inSuit-20220812` 
- `Angela-insuit-20220820`
- `Josh-incasualsuit-20220721`
- `Anna-inblackskirt-20220820`

### TheFluent API

**Telaffuz Analizi:**
```typescript
import { analyzePronunciation } from './src/api/theFluentClient';

const result = await analyzePronunciation(
  'file:///path/to/recording.wav',
  'Hello, how are you today?'
);

console.log('Skor:', result.overall_score);
console.log('Kelimeler:', result.words);
```

**Response Formatı:**
```typescript
{
  success: true,
  overall_score: 85,
  words: [
    { word: 'Hello', score: 90, status: 'correct' },
    { word: 'how', score: 85, status: 'correct' },
    { word: 'are', score: 75, status: 'mispronounced' }
  ]
}
```

### Ses Kaydı

**Kayıt Özellikleri:**
- Format: WAV (PCM)
- Sample Rate: 24000 Hz
- Channels: Mono (1 kanal)
- Bit Depth: 16-bit
- Dosya uzantısı: `.mp3` (ama içerik WAV)

**Kayıt Konumu:**
- Android: `/data/user/0/host.exp.exponent/files/`
- iOS: `<App>/Documents/`

### Cloud Storage

**Upload Sırası:**
1. ✅ Google Cloud Storage dene
2. ❌ Başarısız olursa → tmpfiles.org dene
3. ❌ Her ikisi de başarısız → Hata göster

**Google Cloud Storage Kurulumu:**
```bash
# 1. Google Cloud Console'da bucket oluştur
# 2. Bucket'ı public yap (allUsers → Storage Object Viewer)
# 3. API Key oluştur
# 4. .env dosyasına ekle
```

## 📚 Ders İçerikleri

### Lesson 1: Greetings
"Hello, how are you today? I hope you're having a great day. Welcome to our English learning journey together."

### Lesson 2: Introduction
"My name is Sarah, and I'm here to help you improve your English pronunciation. Let's practice speaking together."

### Lesson 3: Daily Activities
"I wake up early every morning. Then I have breakfast and go to work. I enjoy reading books in my free time."

### Lesson 4: Weather Talk
"The weather today is beautiful and sunny. It's a perfect day to go outside and enjoy nature. What's the weather like where you are?"

### Lesson 5: Hobbies
"I love playing music and singing songs. My favorite hobby is learning new languages. What do you like to do for fun?"

## 🐛 Sorun Giderme

### "API Key eksik" hatası
✅ `.env` dosyasını oluşturup API anahtarlarını ekleyin

### "Video oluşturulamadı" hatası
- HeyGen API anahtarınızı kontrol edin
- Hesap kredinizi kontrol edin
- İnternet bağlantınızı kontrol edin

### "Telaffuz analizi başarısız" hatası
- RapidAPI anahtarınızı kontrol edin
- Google Cloud Storage ayarlarını kontrol edin
- tmpfiles.org engellenmiş olabilir (VPN deneyin)

### "Recording permission denied" hatası
```bash
# Android için
adb shell pm grant host.exp.exponent android.permission.RECORD_AUDIO

# iOS için - Settings > AvatarApp > Microphone > Allow
```

### Metro bundler hatası
```bash
npm start -- --clear
```

## 📦 Kullanılan Teknolojiler

### Core
- `expo` (~54.0.20) - React Native framework
- `react-native` (0.81.5) - Mobil framework
- `typescript` (~5.9.2) - Tip güvenliği

### API & Network
- `axios` (^1.12.2) - HTTP client
- HeyGen API - AI avatar videoları
- TheFluent API (RapidAPI) - Telaffuz analizi
- Google Cloud Storage - Ses dosyası hosting

### Media & Audio
- `expo-av` (^16.0.7) - Video/audio oynatma
- `expo-file-system` (^19.0.17) - Dosya yönetimi
- `expo-speech` (^14.0.7) - TTS (kullanılmıyor şu an)

### Navigation & UI
- `@react-navigation/native` (^7.1.18)
- `@react-navigation/bottom-tabs` (^7.5.0)
- `@expo/vector-icons` (^15.0.3)
- `react-native-safe-area-context` (^5.6.1)

## 🚀 Production Build

### EAS Build Kurulumu
```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Android APK
```bash
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production
```

### iOS IPA
```bash
# Development build
eas build --platform ios --profile development

# Production build (Apple Developer account gerekli)
eas build --platform ios --profile production
```

## 🎨 Özelleştirme

### Avatar Değiştirme
`src/utils/lessonData.ts` dosyasında `videoUrl` alanlarını güncelleyin.

### Ders Ekleme
```typescript
// src/utils/lessonData.ts
export const lessons: Lesson[] = [
  // Mevcut dersler...
  {
    id: 6,
    title: 'Lesson 6: Your Topic',
    text: 'Your lesson text here...',
    videoUrl: 'https://your-heygen-video-url.mp4'
  }
];
```

### Renk Teması
`src/screens/LessonScreen.tsx` ve `HomeScreen.tsx` dosyalarındaki `StyleSheet` objelerini düzenleyin.

## 📊 Performans Optimizasyonu

- ✅ Video preloading (ilk yüklemede cache)
- ✅ Ses dosyası sıkıştırma (WAV → 24kHz mono)
- ✅ Lazy loading (bileşenler sadece gerektiğinde yüklenir)
- ✅ Debounced API calls (gereksiz istek önleme)

## 🔐 Güvenlik

- ❌ API anahtarları Git'e commit edilmez (.env)
- ✅ HTTPS üzerinden tüm istekler
- ✅ Timeout mekanizmaları (30-60 saniye)
- ✅ Error handling (tüm API çağrılarında)

## 📄 Lisans

MIT License - Özgürce kullanabilir, değiştirebilir ve dağıtabilirsiniz.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/new-lesson`)
3. Commit edin (`git commit -m 'feat: Add new lesson content'`)
4. Push edin (`git push origin feature/new-lesson`)
5. Pull Request açın

## 📞 Destek

Sorularınız için GitHub Issues kullanabilirsiniz.

## 🙏 Teşekkürler

- [HeyGen](https://heygen.com) - AI Avatar teknolojisi
- [TheFluent](https://thefluent.me) - Telaffuz analizi API
- [Expo](https://expo.dev) - React Native framework
- [Google Cloud](https://cloud.google.com) - Cloud storage

---

**Not:** Bu uygulama eğitim amaçlıdır. Production kullanımı için uygun backend altyapısı ve güvenlik önlemleri gereklidir.
#   S u o l i n g o  
 
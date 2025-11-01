# 🎓 AI Avatar English Learning App# 🎓 AI Avatar English Learning App



React Native + Expo ile geliştirilmiş, yapay zeka destekli İngilizce telaffuz öğrenme uygulaması. HeyGen AI avatarları ve TheFluent telaffuz analizi kullanır.React Native + Expo ile geliştirilmiş, yapay zeka destekli İngilizce telaffuz öğrenme uygulaması. HeyGen AI avatarları ve TheFluent telaffuz analizi kullanır.



## ✨ Özellikler## ✨ Özellikler



- 🎥 **AI Avatar Öğretmen** - HeyGen API ile gerçekçi avatar videoları- 🎥 **AI Avatar Öğretmen** - HeyGen API ile gerçekçi avatar videoları

- 🎤 **Telaffuz Analizi** - TheFluent API ile kelime bazlı geri bildirim- 🎤 **Telaffuz Analizi** - TheFluent API ile kelime bazlı geri bildirim

- 📚 **5 Hazır Ders** - Günlük konuşma pratikleri- 📚 **5 Hazır Ders** - Günlük konuşma pratikleri

- 📊 **Anlık Puanlama** - 0-100 arası telaffuz skoru- 📊 **Anlık Puanlama** - 0-100 arası telaffuz skoru

- 🎯 **İnteraktif Öğrenme** - Dinle, tekrar et, öğren- 🎯 **İnteraktif Öğrenme** - Dinle, tekrar et, öğren

- 🔊 **Sesli Kayıt** - WAV formatında yüksek kalite ses kaydı- 🔊 **Sesli Kayıt** - WAV formatında yüksek kalite ses kaydı

- ☁️ **Cloud Storage** - Google Cloud Storage ile ses dosyası yönetimi- ☁️ **Cloud Storage** - Google Cloud Storage ile ses dosyası yönetimi



## 📱 Ekranlar## 📱 Ekranlar



### 1. Video Avatar (Ana Sayfa)### 1. Video Avatar (Ana Sayfa)

- Metni AI avatar videosuna dönüştürme

- Metni AI avatar videosuna dönüştürme- Özel metin girişi

- Özel metin girişi- Video oynatıcı

- Video oynatıcı

### 2. Lesson (Ders Ekranı)

### 2. Lesson (Ders Ekranı)- 5 hazır ders içeriği

- Avatar video gösterimi

- 5 hazır ders içeriği- Ses kaydı ve telaffuz analizi

- Avatar video gösterimi- Kelime bazlı puanlama

- Ses kaydı ve telaffuz analizi- İleri/geri navigasyon

- Kelime bazlı puanlama

- İleri/geri navigasyon## 🛠️ Kurulum



## 🛠️ Kurulum### Gereksinimler



### Gereksinimler- Node.js 20.x veya üzeri

- npm veya yarn

- Node.js 20.x veya üzeri- Expo Go uygulaması (test için)

- npm veya yarn- Android Studio (Android için) veya Xcode (iOS için)

- Expo Go uygulaması (test için)

- Android Studio (Android için) veya Xcode (iOS için)### API Anahtarları



### API AnahtarlarıAşağıdaki servislere kaydolup API anahtarlarını alın:



Aşağıdaki servislere kaydolup API anahtarlarını alın:1. **HeyGen** - [app.heygen.com/settings](https://app.heygen.com/settings)

2. **RapidAPI (TheFluent)** - [rapidapi.com/TheFluentMe/api/thefluent](https://rapidapi.com/TheFluentMe/api/thefluent)

1. **HeyGen** - [app.heygen.com/settings](https://app.heygen.com/settings)3. **Google Cloud Storage** (opsiyonel) - [console.cloud.google.com](https://console.cloud.google.com)

2. **RapidAPI (TheFluent)** - [rapidapi.com/TheFluentMe/api/thefluent](https://rapidapi.com/TheFluentMe/api/thefluent)

3. **Google Cloud Storage** (opsiyonel) - [console.cloud.google.com](https://console.cloud.google.com)### Adımlar



### Adımlar1. **Projeyi klonlayın:**

```bash

1. **Projeyi klonlayın:**git clone <repository-url>

cd Soulingo

```bash```

git clone <repository-url>

cd Soulingo. **Bağımlılıkları yükleyin:**

``````bash

npm install

2. **Bağımlılıkları yükleyin:**```



```bash3. **Environment dosyasını oluşturun:**

npm install```bash

```# .env.example'ı kopyalayın

copy .env.example .env

3. **Environment dosyasını oluşturun:**```



```bash4. **API anahtarlarını ekleyin (.env):**

# .env.example'ı kopyalayın```env

copy .env.example .envEXPO_PUBLIC_HEYGEN_API_KEY=sk_V2_hgu_your_key_here

```EXPO_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key_here



4. **API anahtarlarını ekleyin (.env):**# Opsiyonel - Google Cloud Storage

EXPO_PUBLIC_GCS_BUCKET=your-bucket-name

```envEXPO_PUBLIC_GCS_API_KEY=your-gcs-api-key

EXPO_PUBLIC_HEYGEN_API_KEY=sk_V2_hgu_your_key_here```

EXPO_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key_here

5. **Uygulamayı başlatın:**

# Opsiyonel - Google Cloud Storage```bash

EXPO_PUBLIC_GCS_BUCKET=your-bucket-namenpm start

EXPO_PUBLIC_GCS_API_KEY=your-gcs-api-key```

```

6. **Platform seçin:**

5. **Uygulamayı başlatın:**```bash

# Android

```bashnpm run android

npm start

```# iOS (sadece macOS)

npm run ios

6. **Platform seçin:**

# Web (sınırlı özellikler)

```bashnpm run web

# Android```

npm run android

## � Proje Yapısı

# iOS (sadece macOS)

npm run ios```

Soulingo/

# Web (sınırlı özellikler)├── src/

npm run web│   ├── api/

```│   │   ├── heygenClient.ts          # HeyGen API (video oluşturma)

│   │   └── theFluentClient.ts       # TheFluent API (telaffuz analizi)

## 📂 Proje Yapısı│   ├── components/

│   │   ├── AvatarVideo.tsx          # Video oynatıcı

```│   │   ├── TextArea.tsx             # Ders metni gösterimi

Soulingo/│   │   └── VoiceRecorder.tsx        # Ses kaydedici

├── src/│   ├── screens/

│   ├── api/│   │   ├── HomeScreen.tsx           # Ana sayfa (text-to-video)

│   │   ├── heygenClient.ts          # HeyGen API (video oluşturma)│   │   └── LessonScreen.tsx         # Ders ekranı

│   │   └── theFluentClient.ts       # TheFluent API (telaffuz analizi)│   ├── hooks/

│   ├── components/│   │   └── useAvatarSpeech.ts       # Video oluşturma hook

│   │   ├── AvatarVideo.tsx          # Video oynatıcı│   └── utils/

│   │   ├── TextArea.tsx             # Ders metni gösterimi│       ├── lessonData.ts            # 5 ders içeriği

│   │   └── VoiceRecorder.tsx        # Ses kaydedici│       └── types.ts                 # TypeScript tipleri

│   ├── screens/├── App.tsx                          # Tab navigasyon

│   │   ├── HomeScreen.tsx           # Ana sayfa (text-to-video)├── .env                            # API anahtarları (git'e eklenmez)

│   │   └── LessonScreen.tsx         # Ders ekranı└── package.json

│   ├── hooks/```

│   │   └── useAvatarSpeech.ts       # Video oluşturma hook

│   └── utils/## 🎯 Kullanım Rehberi

│       ├── lessonData.ts            # 5 ders içeriği

│       └── types.ts                 # TypeScript tipleri### Video Avatar Ekranı

├── App.tsx                          # Tab navigasyon

├── .env                            # API anahtarları (git'e eklenmez)1. İstediğiniz metni girin

└── package.json2. **"Generate Video"** butonuna basın

```3. Video oluşması 30-60 saniye sürer

4. Video hazır olunca otomatik oynatılır

## 🎯 Kullanım Rehberi

### Lesson (Ders) Ekranı

### Video Avatar Ekranı

1. **Lesson 1-5** arası seçin (← → okları ile)

1. İstediğiniz metni girin2. **"Speak"** butonuna basarak avatar videosunu başlatın

2. **"Generate Video"** butonuna basın3. Video bitince metni okuyun

3. Video oluşması 30-60 saniye sürer4. **"Start Recording"** ile kaydı başlatın

4. Video hazır olunca otomatik oynatılır5. **"Stop Recording"** ile durdurun

6. Telaffuz analizi otomatik yapılır

### Lesson (Ders) Ekranı7. Puanınızı ve kelime bazlı geri bildirimi görün



1. **Lesson 1-5** arası seçin (← → okları ile)## 🔧 Teknik Detaylar

2. **"Speak"** butonuna basarak avatar videosunu başlatın

3. Video bitince metni okuyun### HeyGen API

4. **"Start Recording"** ile kaydı başlatın

5. **"Stop Recording"** ile durdurun**Avatar Video Oluşturma:**

6. Telaffuz analizi otomatik yapılır```typescript

7. Puanınızı ve kelime bazlı geri bildirimi görünimport { speakAvatar } from './src/api/heygenClient';



## 🔧 Teknik Detaylarconst response = await speakAvatar(

  'Kristin-inSuit-20220812', 

### HeyGen API  'Hello, how are you today?'

);

**Avatar Video Oluşturma:**```



```typescript**Kullanılabilir Avatar ID'leri:**

import { speakAvatar } from './src/api/heygenClient';- `Kristin-inSuit-20220812` 

- `Angela-insuit-20220820`

const response = await speakAvatar(- `Josh-incasualsuit-20220721`

  'Kristin-inSuit-20220812', - `Anna-inblackskirt-20220820`

  'Hello, how are you today?'

);### TheFluent API

```

**Telaffuz Analizi:**

**Kullanılabilir Avatar ID'leri:**```typescript

import { analyzePronunciation } from './src/api/theFluentClient';

- `Kristin-inSuit-20220812` 

- `Angela-insuit-20220820`const result = await analyzePronunciation(

- `Josh-incasualsuit-20220721`  'file:///path/to/recording.wav',

- `Anna-inblackskirt-20220820`  'Hello, how are you today?'

);

### TheFluent API

console.log('Skor:', result.overall_score);

**Telaffuz Analizi:**console.log('Kelimeler:', result.words);

```

```typescript

import { analyzePronunciation } from './src/api/theFluentClient';**Response Formatı:**

```typescript

const result = await analyzePronunciation({

  'file:///path/to/recording.wav',  success: true,

  'Hello, how are you today?'  overall_score: 85,

);  words: [

    { word: 'Hello', score: 90, status: 'correct' },

console.log('Skor:', result.overall_score);    { word: 'how', score: 85, status: 'correct' },

console.log('Kelimeler:', result.words);    { word: 'are', score: 75, status: 'mispronounced' }

```  ]

}

**Response Formatı:**```



```typescript### Ses Kaydı

{

  success: true,**Kayıt Özellikleri:**

  overall_score: 85,- Format: WAV (PCM)

  words: [- Sample Rate: 24000 Hz

    { word: 'Hello', score: 90, status: 'correct' },- Channels: Mono (1 kanal)

    { word: 'how', score: 85, status: 'correct' },- Bit Depth: 16-bit

    { word: 'are', score: 75, status: 'mispronounced' }- Dosya uzantısı: `.mp3` (ama içerik WAV)

  ]

}**Kayıt Konumu:**

```- Android: `/data/user/0/host.exp.exponent/files/`

- iOS: `<App>/Documents/`

### Ses Kaydı

### Cloud Storage

**Kayıt Özellikleri:**

**Upload Sırası:**

- Format: WAV (PCM)1. ✅ Google Cloud Storage dene

- Sample Rate: 24000 Hz2. ❌ Başarısız olursa → tmpfiles.org dene

- Channels: Mono (1 kanal)3. ❌ Her ikisi de başarısız → Hata göster

- Bit Depth: 16-bit

- Dosya uzantısı: `.mp3` (ama içerik WAV)**Google Cloud Storage Kurulumu:**

```bash

**Kayıt Konumu:**# 1. Google Cloud Console'da bucket oluştur

# 2. Bucket'ı public yap (allUsers → Storage Object Viewer)

- Android: `/data/user/0/host.exp.exponent/files/`# 3. API Key oluştur

- iOS: `<App>/Documents/`# 4. .env dosyasına ekle

```

### Cloud Storage

## 📚 Ders İçerikleri

**Upload Sırası:**

### Lesson 1: Greetings

1. ✅ Google Cloud Storage dene"Hello, how are you today? I hope you're having a great day. Welcome to our English learning journey together."

2. ❌ Başarısız olursa → tmpfiles.org dene

3. ❌ Her ikisi de başarısız → Hata göster### Lesson 2: Introduction

"My name is Sarah, and I'm here to help you improve your English pronunciation. Let's practice speaking together."

**Google Cloud Storage Kurulumu:**

### Lesson 3: Daily Activities

```bash"I wake up early every morning. Then I have breakfast and go to work. I enjoy reading books in my free time."

# 1. Google Cloud Console'da bucket oluştur

# 2. Bucket'ı public yap (allUsers → Storage Object Viewer)### Lesson 4: Weather Talk

# 3. API Key oluştur"The weather today is beautiful and sunny. It's a perfect day to go outside and enjoy nature. What's the weather like where you are?"

# 4. .env dosyasına ekle

```### Lesson 5: Hobbies

"I love playing music and singing songs. My favorite hobby is learning new languages. What do you like to do for fun?"

## 📚 Ders İçerikleri

## 🐛 Sorun Giderme

### Lesson 1: Greetings

### "API Key eksik" hatası

"Hello, how are you today? I hope you're having a great day. Welcome to our English learning journey together."✅ `.env` dosyasını oluşturup API anahtarlarını ekleyin



### Lesson 2: Introduction### "Video oluşturulamadı" hatası

- HeyGen API anahtarınızı kontrol edin

"My name is Sarah, and I'm here to help you improve your English pronunciation. Let's practice speaking together."- Hesap kredinizi kontrol edin

- İnternet bağlantınızı kontrol edin

### Lesson 3: Daily Activities

### "Telaffuz analizi başarısız" hatası

"I wake up early every morning. Then I have breakfast and go to work. I enjoy reading books in my free time."- RapidAPI anahtarınızı kontrol edin

- Google Cloud Storage ayarlarını kontrol edin

### Lesson 4: Weather Talk- tmpfiles.org engellenmiş olabilir (VPN deneyin)



"The weather today is beautiful and sunny. It's a perfect day to go outside and enjoy nature. What's the weather like where you are?"### "Recording permission denied" hatası

```bash

### Lesson 5: Hobbies# Android için

adb shell pm grant host.exp.exponent android.permission.RECORD_AUDIO

"I love playing music and singing songs. My favorite hobby is learning new languages. What do you like to do for fun?"

# iOS için - Settings > Soulingo > Microphone > Allow

## 🐛 Sorun Giderme```



### "API Key eksik" hatası### Metro bundler hatası

```bash

✅ `.env` dosyasını oluşturup API anahtarlarını ekleyinnpm start -- --clear

```

### "Video oluşturulamadı" hatası

## 📦 Kullanılan Teknolojiler

- HeyGen API anahtarınızı kontrol edin

- Hesap kredinizi kontrol edin### Core

- İnternet bağlantınızı kontrol edin- `expo` (~54.0.20) - React Native framework

- `react-native` (0.81.5) - Mobil framework

### "Telaffuz analizi başarısız" hatası- `typescript` (~5.9.2) - Tip güvenliği



- RapidAPI anahtarınızı kontrol edin### API & Network

- Google Cloud Storage ayarlarını kontrol edin- `axios` (^1.12.2) - HTTP client

- tmpfiles.org engellenmiş olabilir (VPN deneyin)- HeyGen API - AI avatar videoları

- TheFluent API (RapidAPI) - Telaffuz analizi

### "Recording permission denied" hatası- Google Cloud Storage - Ses dosyası hosting



```bash### Media & Audio

# Android için- `expo-av` (^16.0.7) - Video/audio oynatma

adb shell pm grant host.exp.exponent android.permission.RECORD_AUDIO- `expo-file-system` (^19.0.17) - Dosya yönetimi

- `expo-speech` (^14.0.7) - TTS (kullanılmıyor şu an)

# iOS için - Settings > Soulingo > Microphone > Allow

```### Navigation & UI

- `@react-navigation/native` (^7.1.18)

### Metro bundler hatası- `@react-navigation/bottom-tabs` (^7.5.0)

- `@expo/vector-icons` (^15.0.3)

```bash- `react-native-safe-area-context` (^5.6.1)

npm start -- --clear

```## 🚀 Production Build



## 📦 Kullanılan Teknolojiler### EAS Build Kurulumu

```bash

### Corenpm install -g eas-cli

eas login

- `expo` (~54.0.20) - React Native frameworkeas build:configure

- `react-native` (0.81.5) - Mobil framework```

- `typescript` (~5.9.2) - Tip güvenliği

### Android APK

### API & Network```bash

# Development build

- `axios` (^1.12.2) - HTTP clienteas build --platform android --profile development

- HeyGen API - AI avatar videoları

- TheFluent API (RapidAPI) - Telaffuz analizi# Production build

- Google Cloud Storage - Ses dosyası hostingeas build --platform android --profile production

```

### Media & Audio

### iOS IPA

- `expo-av` (^16.0.7) - Video/audio oynatma```bash

- `expo-file-system` (^19.0.17) - Dosya yönetimi# Development build

- `expo-speech` (^14.0.7) - TTS (kullanılmıyor şu an)eas build --platform ios --profile development



### Navigation & UI# Production build (Apple Developer account gerekli)

eas build --platform ios --profile production

- `@react-navigation/native` (^7.1.18)```

- `@react-navigation/bottom-tabs` (^7.5.0)

- `@expo/vector-icons` (^15.0.3)## 🎨 Özelleştirme

- `react-native-safe-area-context` (^5.6.1)

### Avatar Değiştirme

## 🚀 Production Build`src/utils/lessonData.ts` dosyasında `videoUrl` alanlarını güncelleyin.



### EAS Build Kurulumu### Ders Ekleme

```typescript

```bash// src/utils/lessonData.ts

npm install -g eas-cliexport const lessons: Lesson[] = [

eas login  // Mevcut dersler...

eas build:configure  {

```    id: 6,

    title: 'Lesson 6: Your Topic',

### Android APK    text: 'Your lesson text here...',

    videoUrl: 'https://your-heygen-video-url.mp4'

```bash  }

# Development build];

eas build --platform android --profile development```



# Production build### Renk Teması

eas build --platform android --profile production`src/screens/LessonScreen.tsx` ve `HomeScreen.tsx` dosyalarındaki `StyleSheet` objelerini düzenleyin.

```

## 📊 Performans Optimizasyonu

### iOS IPA

- ✅ Video preloading (ilk yüklemede cache)

```bash- ✅ Ses dosyası sıkıştırma (WAV → 24kHz mono)

# Development build- ✅ Lazy loading (bileşenler sadece gerektiğinde yüklenir)

eas build --platform ios --profile development- ✅ Debounced API calls (gereksiz istek önleme)



# Production build (Apple Developer account gerekli)## 🔐 Güvenlik

eas build --platform ios --profile production

```- ❌ API anahtarları Git'e commit edilmez (.env)

- ✅ HTTPS üzerinden tüm istekler

## 🎨 Özelleştirme- ✅ Timeout mekanizmaları (30-60 saniye)

- ✅ Error handling (tüm API çağrılarında)

### Avatar Değiştirme

## 📄 Lisans

`src/utils/lessonData.ts` dosyasında `videoUrl` alanlarını güncelleyin.

MIT License - Özgürce kullanabilir, değiştirebilir ve dağıtabilirsiniz.

### Ders Ekleme

## 🤝 Katkıda Bulunma

```typescript

// src/utils/lessonData.ts1. Fork yapın

export const lessons: Lesson[] = [2. Feature branch oluşturun (`git checkout -b feature/new-lesson`)

  // Mevcut dersler...3. Commit edin (`git commit -m 'feat: Add new lesson content'`)

  {4. Push edin (`git push origin feature/new-lesson`)

    id: 6,5. Pull Request açın

    title: 'Lesson 6: Your Topic',

    text: 'Your lesson text here...',## 📞 Destek

    videoUrl: 'https://your-heygen-video-url.mp4'

  }Sorularınız için GitHub Issues kullanabilirsiniz.

];

```## 🙏 Teşekkürler



### Renk Teması- [HeyGen](https://heygen.com) - AI Avatar teknolojisi

- [TheFluent](https://thefluent.me) - Telaffuz analizi API

`src/screens/LessonScreen.tsx` ve `HomeScreen.tsx` dosyalarındaki `StyleSheet` objelerini düzenleyin.- [Expo](https://expo.dev) - React Native framework

- [Google Cloud](https://cloud.google.com) - Cloud storage

## 📊 Performans Optimizasyonu

---

- ✅ Video preloading (ilk yüklemede cache)

- ✅ Ses dosyası sıkıştırma (WAV → 24kHz mono)**Not:** Bu uygulama eğitim amaçlıdır. Production kullanımı için uygun backend altyapısı ve güvenlik önlemleri gereklidir.

- ✅ Lazy loading (bileşenler sadece gerektiğinde yüklenir)#


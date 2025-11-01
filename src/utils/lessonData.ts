import { Lesson } from '../utils/types';

/**
 * Predefined lesson data with texts and avatar videos
 * Replace avatar video URLs with actual URLs from your avatar generation service
 */
export const LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Lesson 1: Greetings',
    text: 'Hello! My name is Sarah. Nice to meet you. How are you today?',
    avatarVideoUrl: 'https://files2.heygen.ai/aws_pacific/avatar_tmp/c69dde3abe474a2398cdf77154d948f9/0bfc0bfb98d5493da4e26b4c47ff4733.mp4?Expires=1762605114&Signature=de6Y98Pd5wWbAhbEskd5Sl-cKtclV0NfTUJKLiCYKMwDD60kIxWtrrqpQBRJ-WAX8YxzMCex7VtpP3BaurEA8nrBwzaSIoZFaWh0vFZrkbFR5FzSNr4qd6vyBx8JkFwCCeeTyJhLenXvu2T0X6HRLkt7SKx08adf0psYKwveQJyY4S0VDa1Wb3KfEfeI6WoM2zrUKa0Rgj1EPMPfvDy7HXhqrrzhrttRMi2OCmh9Fj4wXb1MPlmi8fR9SxpRRfS9ae0E5AkYn1DrL2EEeMtaEp2CuuI~x7WRepmM6I7NWNDZYLoCdpHEYxHDMXyed64SOJfYQuJdEBJLn5LFq~InNQ__&Key-Pair-Id=K38HBHX5LX3X2H',
    difficulty: 'beginner',
  },
  {
    id: 2,
    title: 'Lesson 2: Daily Routine',
    text: 'I wake up at seven o\'clock every morning. I have breakfast and then I go to work.',
    avatarVideoUrl: 'https://files2.heygen.ai/aws_pacific/avatar_tmp/c69dde3abe474a2398cdf77154d948f9/19f2ca9cc32e48cba1b3b9e5ab5ac91a.mp4?Expires=1762606774&Signature=Ie6PimRpqkmGT~99mtR7vaWBHE6K0-eHZ0-3Df-7788YOvuj4Imt8X8XRa19wWN3eWQn0dy9GtzkV7j4yCW0RV~ApnI5ymRbn-UHgHtK4UBx93HvTnEzRtXvUsoT1rbdLUHtK~pXXWkh126eTTtCdlyheYDqZWE6L8nlYpfekEFG~sehkyoCp7sCOF-jMFi-5HTuUOiIt8NWQFcCVDv6jj7yxXDtYdeb4Cw~nWHFdEvflA1K-khxt3AQc3yodybxwOs4ZpWE95DFMI8qxQ7JKzjBU4bSpefbn52zCnLvHCQeE4DgKm26MlyeEBFF3umVvbRrNpx8o1MMJk0qyhV3tA__&Key-Pair-Id=K38HBHX5LX3X2H', 
    difficulty: 'beginner',
  },
  {
    id: 3,
    title: 'Lesson 3: Shopping',
    text: 'Excuse me, how much does this cost? Can I pay by credit card? Thank you very much.',
    avatarVideoUrl: 'https://files2.heygen.ai/aws_pacific/avatar_tmp/c69dde3abe474a2398cdf77154d948f9/304c9523ca4d4dc0b3b6f533560abc98.mp4?Expires=1762606957&Signature=OBI0du7GhKmUJM3bXWd-5LlnF-CDhu6APImjiZQSdErrgxTmyE2NeNmgZ9A7zLOSFihkuTVyPG5xUBzmeJZmI83P-8xrorxK05ttCHXg~9M~nxWvwhOC4vYR3YdkQtyMtUEA1t0KilfzarQ8V5MCPm1b-A2yV2xnsqP2jmNGs5IhDOaXe8BLt2yH0nybBOxs8oCKWC8MRAWrsFGk1Uo1c~LIpDcNhS1DwoO2vCPHmucUNUdBP0Y-QN85fRAKkTJwnHF84eG1AdSOJgyyJhFDYyifF2jnXtoUC9wCjTRh6x~xWXsWUWB0DU6jY~2Q2hfCB~GnpAzCBq0IoPZqhUfA3w__&Key-Pair-Id=K38HBHX5LX3X2H', 
    difficulty: 'intermediate',
  },
  {
    id: 4,
    title: 'Lesson 4: Weather',
    text: 'The weather is beautiful today. It\'s sunny and warm. Perfect for a walk in the park.',
    avatarVideoUrl: 'https://files2.heygen.ai/aws_pacific/avatar_tmp/b04373fa04af4f7cb56f91affb2538e4/34e6060fa7974155bc1b4c8b9c79cdbe.mp4?Expires=1762607348&Signature=OXuKKe-Bt6D6OwRrFzHR9JV5eFi88Ja9kUJUTvUQEr5ss7hfxneAKKpgTzbzULDZ4m3RWeM-NvNwCeVfsMKL5jj36vhQ-Lr2F-30UTpTcZ2TiwIha7nP6ahDsQ7uiWs8PExYPGEnO9b1e5HB~l-LSmlay-6P2pV7Gdzs-8RKUTc9bTpjnsDu9FlxVZyRAYnFaoixHpn3LdH6tjvs6nT~iJoYn8Rilm~3PRPHH6ADzUtkVq6e89fmt~IXJ5-40s4rq3zt9ayEUswXR8h8sIrJm7asJEiqLlDolsGeD-Djl-MR8-BPJ-1E-a5~4Slp6DccmBYKEyBq~95exZnY1he~kg__&Key-Pair-Id=K38HBHX5LX3X2H', 
    difficulty: 'intermediate',
  },
  {
    id: 5,
    title: 'Lesson 5: Travel',
    text: 'I love traveling to different countries. Last summer I visited Paris and saw the Eiffel Tower.',
    avatarVideoUrl: 'https://files2.heygen.ai/aws_pacific/avatar_tmp/b04373fa04af4f7cb56f91affb2538e4/fc058c909d774cbf8cd98418b84a9650.mp4?Expires=1762607817&Signature=EbUgVARIKAwWOJsaq~XP6kVz76V3avM8N~NLCG0boFmN5JHhj5bKn2ZiwuZ5wtxEN~CFeL82GHKxsZD~7aGA2Z9gb0kakxWZKKhBT2QXSMROS52~p0MULBKiEwgMEemmFdkTWbPZdbwXOBqpwFpAyPWfzKYhjfwDJW5u4iWj4miLQTUOmZMyo9wUA80s3-ChhaPwqvpjUs-5mw38eWlyEzXs3Xe-nvv2wnR-QcrXaSHRLTKPQIIY~P-TMWY-KI2qQxS4Xiy~MMQ6Vqkd2rr~rZQKm36HyO4ERXlSQl57YnBmLJu4~tPlLAYgzFgZe8Z6jBTy510dAxbMrSoUm4YpxA__&Key-Pair-Id=K38HBHX5LX3X2H', 
    difficulty: 'advanced',
  },
];

/**
 * Get lesson by ID
 */
export const getLessonById = (id: number): Lesson | undefined => {
  return LESSONS.find((lesson) => lesson.id === id);
};

/**
 * Get next lesson
 */
export const getNextLesson = (currentId: number): Lesson | undefined => {
  const currentIndex = LESSONS.findIndex((lesson) => lesson.id === currentId);
  if (currentIndex === -1 || currentIndex === LESSONS.length - 1) {
    return undefined;
  }
  return LESSONS[currentIndex + 1];
};

/**
 * Get previous lesson
 */
export const getPreviousLesson = (currentId: number): Lesson | undefined => {
  const currentIndex = LESSONS.findIndex((lesson) => lesson.id === currentId);
  if (currentIndex === -1 || currentIndex === 0) {
    return undefined;
  }
  return LESSONS[currentIndex - 1];
};

export default LESSONS;

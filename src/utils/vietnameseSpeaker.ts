// High-Fidelity Vietnamese Speech Engine for Smart Agricultural Loudspeaker

let activeAudioElement: HTMLAudioElement | null = null;

// Normalize abbreviations for natural Vietnamese speech
export function normalizeVietnameseText(text: string): string {
  if (!text) return '';
  return text
    .replace(/TDP\s+/gi, 'Tổ dân phố ')
    .replace(/TDP/gi, 'Tổ dân phố')
    .replace(/\bha\b/gi, 'héc ta')
    .replace(/\bkg\b/gi, 'ki lô gam')
    .replace(/\bpH\b/gi, 'độ pê hát')
    .replace(/VietGAP/gi, 'Việt Gáp')
    .replace(/GlobalGAP/gi, 'Gờ-lô-bơn Gáp')
    .replace(/MKP\s*\(0-52-34\)/gi, 'M K P không năm mươi hai ba mươi bốn')
    .replace(/MKP/gi, 'M K P')
    .replace(/\bPHI\b/gi, 'thời gian cách ly P H I')
    .replace(/Lô V1\b/gi, 'Lô V một')
    .replace(/Lô V2\b/gi, 'Lô V hai')
    .replace(/Lô C1\b/gi, 'Lô C một')
    .replace(/Lô C2\b/gi, 'Lô C hai')
    .replace(/Lô B1\b/gi, 'Lô B một')
    .replace(/Lô B2\b/gi, 'Lô B hai')
    .replace(/Lô T1\b/gi, 'Lô T một')
    .replace(/Lô O1\b/gi, 'Lô O một')
    .replace(/Lô N1\b/gi, 'Lô N một')
    .replace(/Lô H1\b/gi, 'Lô H một')
    .replace(/06:00/g, '6 giờ sáng')
    .replace(/06:30/g, '6 giờ 30 phút sáng')
    .replace(/07:00/g, '7 giờ sáng')
    .replace(/08:00/g, '8 giờ sáng')
    .replace(/16:00/g, '4 giờ chiều')
    .replace(/17:00/g, '5 giờ chiều')
    .replace(/18:00/g, '6 giờ chiều');
}

// Find genuine Vietnamese voice in browser SpeechSynthesis
function findVietnameseVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(
      (v) =>
        v.lang === 'vi-VN' ||
        v.lang.toLowerCase().startsWith('vi') ||
        v.name.toLowerCase().includes('vietnam') ||
        v.name.toLowerCase().includes('vietnamese') ||
        v.name.toLowerCase().includes('hoaimy') ||
        v.name.toLowerCase().includes('namminh') ||
        v.name.toLowerCase().includes('tiếng việt')
    ) || null
  );
}

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
  rate?: number;
}

export function stopVietnameseSpeech(): void {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Phát âm thanh tiếng Việt chuẩn qua hệ thống loa thông minh:
 * 1. Ưu tiên giọng tiếng Việt bản địa của trình duyệt nếu hệ thống có cài đặt (Hoài My, Nam Minh, Google tiếng Việt).
 * 2. Tự động fallback sang luồng âm thanh tiếng Việt tiêu chuẩn (/api/speaker/vietnamese-audio) nếu máy tính không có sẵn giọng đọc tiếng Việt.
 */
export async function speakVietnamese(text: string, options?: SpeakOptions): Promise<void> {
  const normalizedText = normalizeVietnameseText(text);
  if (!normalizedText.trim()) return;

  stopVietnameseSpeech();
  options?.onStart?.();

  // 1. Thử kiểm tra giọng đọc tiếng Việt có sẵn trong trình duyệt
  const viVoice = findVietnameseVoice();

  if (viVoice && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(normalizedText);
    utterance.voice = viVoice;
    utterance.lang = 'vi-VN';
    utterance.rate = options?.rate || 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error, falling back to Vietnamese audio stream:', e);
      fallbackToAudioStream(normalizedText, options);
    };

    window.speechSynthesis.speak(utterance);
    return;
  }

  // 2. Fallback sang luồng âm thanh tiếng Việt chất lượng cao từ server
  fallbackToAudioStream(normalizedText, options);
}

function fallbackToAudioStream(text: string, options?: SpeakOptions): void {
  try {
    const audioUrl = `/api/speaker/vietnamese-audio?text=${encodeURIComponent(text)}`;
    const audio = new Audio(audioUrl);
    activeAudioElement = audio;

    audio.onended = () => {
      activeAudioElement = null;
      options?.onEnd?.();
    };

    audio.onerror = (err) => {
      console.error('Lỗi khi phát âm thanh tiếng Việt:', err);
      activeAudioElement = null;
      options?.onError?.(err);
      options?.onEnd?.();
    };

    audio.play().catch((playErr) => {
      console.warn('Tự động phát âm thanh bị chặn bởi chính sách trình duyệt:', playErr);
      options?.onError?.(playErr);
      options?.onEnd?.();
    });
  } catch (err) {
    options?.onError?.(err);
    options?.onEnd?.();
  }
}

// Lắng nghe sự kiện nạp giọng đọc của trình duyệt khi vừa tải trang
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Kích hoạt nạp cache voices
    findVietnameseVoice();
  };
}

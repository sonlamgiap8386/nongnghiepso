import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image as ImageIcon,
  Mic,
  Volume2,
  FileText,
  AlertTriangle,
  Calendar,
  Sprout,
  Bug,
  TrendingUp,
  ChevronRight,
  ExternalLink,
  Plus,
  MessageSquare,
  Sparkles,
  CheckCheck,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { speakVietnamese, stopVietnameseSpeech } from '../utils/vietnameseSpeaker';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  image?: string;
  time: string;
  steps?: string[];
  warning?: string;
  references?: Array<{ title: string; source: string }>;
}

export const AiChatView: React.FC = () => {
  const toast = useToast();

  // Exactly matching conversations from demo Image 1
  const [conversations, setConversations] = useState([
    {
      id: 'c1',
      title: 'Lá lúa xuất hiện đốm nâu',
      snippet: 'Lá lúa xuất hiện đốm nâu, tôi nên ...',
      time: '10:24',
      active: true,
    },
    {
      id: 'c2',
      title: 'Bón phân cho lúa giai đoạn đẻ nh...',
      snippet: 'Nên bón loại phân nào và liều lượ...',
      time: 'Hôm qua',
      active: false,
    },
    {
      id: 'c3',
      title: 'Phòng trừ sâu cuốn lá',
      snippet: 'Các biện pháp phòng trừ hiệu quả?',
      time: '12/04',
      active: false,
    },
    {
      id: 'c4',
      title: 'Thời điểm gieo sạ vụ Hè Thu',
      snippet: 'Khi nào là thời điểm thích hợp?',
      time: '10/04',
      active: false,
    },
    {
      id: 'c5',
      title: 'Giá lúa hôm nay',
      snippet: 'Cập nhật giá lúa mới nhất',
      time: '08/04',
      active: false,
    },
    {
      id: 'c6',
      title: 'Kỹ thuật trồng cây ăn quả',
      snippet: 'Hướng dẫn chăm sóc sầu riêng',
      time: '05/04',
      active: false,
    },
  ]);

  const [activeConvId, setActiveConvId] = useState('c1');

  // Messages matching demo Screenshot 1 exactly
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'Lá cây ăn quả xuất hiện đốm nâu, tôi nên kiểm tra gì trước?',
      image: '/src/assets/images/cam_duong_canh_1791794891255.jpg',
      time: '10:24',
    },
    {
      id: 'm2',
      sender: 'ai',
      text: 'Lá lúa xuất hiện đốm nâu có thể do nhiều nguyên nhân như bệnh đạo ôn, bệnh đốm nâu, hoặc do thiếu dinh dưỡng. Bạn nên kiểm tra theo các bước sau đây:',
      time: '10:25',
      steps: [
        'Quan sát đặc điểm đốm nâu: hình dạng, kích thước, màu sắc và vị trí trên lá (lá già hay lá non).',
        'Kiểm tra mức độ lan rộng: đốm có lan nhanh không, tỷ lệ lá bị bệnh trên ruộng.',
        'Xem điều kiện ruộng: độ ẩm, mực nước, mật độ gieo sạ và tình trạng bón phân.',
        'Đối chiếu với một số bệnh thường gặp trên lúa (đạo ôn, đốm nâu, bạc lá) để nhận diện chính xác hơn.',
      ],
      warning:
        'Lưu ý: Nếu tỷ lệ lá bệnh cao (> 5-10%) hoặc lan nhanh, bạn nên liên hệ cán bộ khuyến nông tại địa phương để được hướng dẫn xử lý kịp thời.',
      references: [
        {
          title: 'Hướng dẫn nhận biết bệnh đạo ôn trên lúa',
          source: 'Cục Trồng trọt',
        },
        {
          title: 'Quy trình quản lý bệnh hại tổng hợp (IPM)',
          source: 'Trung tâm Khuyến nông Quốc gia',
        },
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSpeak = (text: string, msgId: string) => {
    if (speakingMessageId === msgId) {
      stopVietnameseSpeech();
      setSpeakingMessageId(null);
      return;
    }
    stopVietnameseSpeech();
    speakVietnamese(text, {
      onStart: () => setSpeakingMessageId(msgId),
      onEnd: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const prompt = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      const replyText = data.reply || 'Đang cập nhật câu trả lời từ chuyên gia nông nghiệp.';

      const aiMsg: ChatMessage = {
        id: `m-ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        warning: 'Lưu ý: Luôn tuân thủ thời gian cách ly PHI và hướng dẫn trên nhãn thuốc bảo vệ thực vật.',
        references: [
          { title: 'Sổ tay kỹ thuật canh tác cây trồng bền vững', source: 'Cục Trồng trọt' },
        ],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackAiMsg: ChatMessage = {
        id: `m-ai-${Date.now()}`,
        sender: 'ai',
        text: `Cảm ơn bà con đã gửi câu hỏi về "${prompt}". Kỹ thuật khuyến cáo: Cần kiểm tra kỹ vết bệnh, bón cân đối N-P-K và liên hệ cán bộ khuyến nông gần nhất.`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (title: string) => {
    setInputText(`Xin hướng dẫn chi tiết về: ${title}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner Matching Demo Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Circular dark green badge with light green leaf inside */}
          <div className="w-12 h-12 rounded-full bg-[#0f5132] text-white flex items-center justify-center shrink-0 shadow-md">
            <svg
              className="w-6 h-6 text-emerald-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl lg:text-[28px] font-black tracking-tight text-slate-900 leading-tight">
              Trợ lý nông nghiệp AI
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Hỏi đáp mọi vấn đề về cây trồng, kỹ thuật, sâu bệnh, thời tiết và thị trường nông sản.
            </p>
          </div>
        </div>

        {/* Right pill badge matching demo 1 */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e6f4ea] border border-emerald-200 text-[#0f5132] text-xs font-bold shadow-2xs self-start sm:self-auto shrink-0">
          <svg
            className="w-4 h-4 text-emerald-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          </svg>
          <span>Tri thức nông nghiệp trong tầm tay</span>
        </div>
      </div>

      {/* 3-Column Layout Matching Demo Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Cuộc trò chuyện (3 cols) */}
        <div className="lg:col-span-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h2 className="text-xs font-black text-slate-900">Cuộc trò chuyện</h2>

            {/* + Cuộc trò chuyện mới button */}
            <button
              onClick={() => {
                setMessages([
                  {
                    id: `m-init-${Date.now()}`,
                    sender: 'ai',
                    text: 'Xin chào bà con! Tôi là Trợ lý AI nông nghiệp. Bà con cần tư vấn kỹ thuật cây trồng gì hôm nay?',
                    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
                toast.success('Đã tạo cuộc trò chuyện mới');
              }}
              className="w-full py-2.5 rounded-xl bg-[#0f5132] hover:bg-[#0d4731] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cuộc trò chuyện mới</span>
            </button>

            {/* Conversation list matching Image 1 */}
            <div className="space-y-1.5 pt-1">
              {conversations.map((c) => {
                const isSelected = activeConvId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#e6f4ea] border-l-4 border-[#0f5132]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0 font-bold text-slate-900">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1 font-medium">
                        {c.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-1 pl-5.5">
                      {c.snippet}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column: Chat Messages & Input (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 min-h-[460px] flex flex-col justify-between">
            {/* Messages Area */}
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  {msg.sender === 'user' ? (
                    /* User Bubble on right matching Demo 1 */
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-[#e6f4ea] text-slate-900 p-3 rounded-2xl rounded-tr-xs border border-emerald-100 space-y-2">
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Ảnh đính kèm"
                            className="w-24 h-16 rounded-lg object-cover ring-1 ring-emerald-300"
                          />
                        )}
                        <p className="text-xs font-semibold leading-relaxed">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-medium">
                          <span>{msg.time}</span>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* AI Message on left matching Demo 1 */
                    <div className="flex items-start gap-3">
                      {/* Leaf Avatar */}
                      <div className="w-8 h-8 rounded-full bg-[#0f5132] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <svg
                          className="w-4 h-4 text-emerald-300"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                        </svg>
                      </div>

                      <div className="flex-1 space-y-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
                        {/* Audio read button */}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-800 leading-relaxed font-normal">
                            {msg.text}
                          </p>
                          <button
                            onClick={() => handleSpeak(msg.text, msg.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 cursor-pointer"
                            title="Nghe bằng tiếng Việt"
                          >
                            <Volume2
                              className={`w-3.5 h-3.5 ${
                                speakingMessageId === msg.id ? 'text-emerald-600 animate-pulse' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* Numbered Steps matching Image 1 */}
                        {msg.steps && (
                          <div className="space-y-2 pt-1">
                            {msg.steps.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-2.5 text-xs">
                                <div className="w-5 h-5 rounded-full bg-[#0f5132] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </div>
                                <p className="text-slate-700 leading-tight">{step}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Warning Box Matching Image 1 */}
                        {msg.warning && (
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="leading-relaxed font-medium">{msg.warning}</p>
                          </div>
                        )}

                        {/* References matching Image 1 */}
                        {msg.references && (
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[11px] font-bold text-slate-500">
                              Tài liệu tham khảo:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {msg.references.map((ref, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                                >
                                  <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                                  <div className="min-w-0">
                                    <div className="text-[11px] font-bold text-slate-900 leading-tight truncate">
                                      {ref.title}
                                    </div>
                                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                                      {ref.source}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 text-right font-medium">
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar Matching Demo Screenshot 1 */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Gửi ảnh cây trồng"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={() => toast.info('Đã nhận diện ảnh lá cây')}
                />

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập câu hỏi về cây trồng, vật tư, kỹ thuật..."
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                />

                <button
                  type="button"
                  onClick={() => toast.info('Tính năng nhận diện giọng nói đã sẵn sàng')}
                  className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Ghi âm câu hỏi"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-9 h-9 rounded-xl bg-[#0f5132] hover:bg-[#0d4731] text-white flex items-center justify-center shrink-0 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Disclaimer text matching Demo 1 */}
              <p className="text-[10px] text-slate-400 text-center">
                Khuyến nghị mang tính hỗ trợ, cần đối chiếu điều kiện thực tế.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Gợi ý nhanh (3 cols) Matching Demo 1 */}
        <div className="lg:col-span-3 space-y-5">
          {/* Card: Gợi ý nhanh */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div>
              <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="text-amber-500">💡</span>
                <span>Gợi ý nhanh</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Chọn chủ đề để hỏi nhanh</p>
            </div>

            <div className="space-y-2">
              <div
                onClick={() => handleQuickPrompt('Lịch mùa vụ')}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">Lịch mùa vụ</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Thời vụ, giống, kế hoạch canh tác
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </div>

              <div
                onClick={() => handleQuickPrompt('Liều lượng phân bón')}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sprout className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      Liều lượng phân bón
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Hướng dẫn bón phân theo từng giai đoạn
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </div>

              <div
                onClick={() => handleQuickPrompt('Sâu bệnh thường gặp')}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Bug className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      Sâu bệnh thường gặp
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Nhận biết và phòng trừ hiệu quả
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </div>

              <div
                onClick={() => handleQuickPrompt('Giá nông sản')}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">Giá nông sản</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Cập nhật giá cả thị trường
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </div>
            </div>
          </div>

          {/* Decorative Card Matching Demo Screenshot 1 */}
          <div className="bg-[#eef8f2] p-4 rounded-2xl border border-emerald-100 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/10 text-emerald-700 flex items-center justify-center shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">Câu hỏi hôm nay</div>
                <div className="text-[10px] text-emerald-800 leading-tight mt-0.5">
                  Cho một nền nông nghiệp tốt hơn ngày mai!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

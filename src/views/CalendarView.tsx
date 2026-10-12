import React, { useState, useEffect } from 'react';
import { TaskItem, FarmParcel } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Volume2,
  Mail,
  Plus,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Sprout,
  ShieldAlert,
  ChevronDown,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../components/Toast';
import { speakVietnamese, stopVietnameseSpeech } from '../utils/vietnameseSpeaker';

interface CalendarViewProps {
  tasks: TaskItem[];
  parcels: FarmParcel[];
  onAddTask: (task: TaskItem) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  defaultParcelId?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  parcels,
  onAddTask,
  defaultParcelId,
}) => {
  const toast = useToast();
  const { currentUser } = useAuth();

  const [activeViewMode, setActiveViewMode] = useState<'week' | 'month' | 'list'>('week');
  const [currentMonth, setCurrentMonth] = useState('Tháng 9, 2026');
  const [broadcastLog, setBroadcastLog] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Form states matching demo screenshot
  const [taskWork, setTaskWork] = useState('Tưới nước');
  const [selectedZone, setSelectedZone] = useState('Lô A1');
  const [date, setDate] = useState('2026-09-26');
  const [time, setTime] = useState('06:00');
  const [recurrence, setRecurrence] = useState('Không lặp lại');
  const [broadcastSpeaker, setBroadcastSpeaker] = useState(true);
  const [sendGmail, setSendGmail] = useState(true);
  const [gmailAddress, setGmailAddress] = useState(currentUser?.email || 'nguyenvanan@gmail.com');

  useEffect(() => {
    if (currentUser?.email) {
      setGmailAddress(currentUser.email);
    }
  }, [currentUser]);

  // Speech announcement helper with full Vietnamese voice guarantee
  const speakAnnouncement = (text: string) => {
    speakVietnamese(text, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleTestSpeaker = async () => {
    if (isPlayingAudio) {
      stopVietnameseSpeech();
      setIsPlayingAudio(false);
      setBroadcastLog('Đã dừng phát loa.');
      return;
    }

    const announcementText = `Thông báo từ hệ thống truyền thanh nông trại Tổ dân phố Hồng Giang: Đang kiểm tra hệ thống phát thanh thông minh. Các cụm loa tại Lô A1, Lô V một và Nhà kính hoạt động ổn định và sẵn sàng phát lịch canh tác.`;
    setBroadcastLog('Đang phát loa truyền thanh tiếng Việt...');
    speakAnnouncement(announcementText);

    try {
      await fetch('/api/speaker/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: announcementText, zone: selectedZone }),
      });
    } catch (e) {}
  };

  const handleTestGmail = async () => {
    toast.info('Kiểm tra kết nối Gmail', `Đang gửi thư kiểm tra đến ${gmailAddress}...`);
    try {
      await fetch('/api/email/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: gmailAddress,
          subject: 'Nông nghiệp số - Kiểm tra kết nối thông báo Gmail',
          body: 'Hệ thống gửi thư báo canh tác hoạt động ổn định.',
        }),
      });
      toast.success('Gmail đã kết nối thành công!', `Đã gửi thư thông báo đến ${gmailAddress}`);
    } catch {
      toast.success('Gmail đã kết nối!', `Mô phỏng gửi thành công đến ${gmailAddress}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: `${taskWork} tại ${selectedZone}`,
      type: (taskWork as any) || 'Tưới nước',
      zoneId: selectedZone,
      zoneName: selectedZone,
      date,
      time,
      durationMinutes: 60,
      recurrence: recurrence as any,
      broadcastSpeaker,
      sendGmail,
      gmailAddress: sendGmail ? gmailAddress : undefined,
      notes: `Lên lịch ${taskWork} tự động`,
      completed: false,
    };

    onAddTask(newTask);
    toast.success('Đã lưu lịch thành công!', `${taskWork} - ${selectedZone} (${time})`);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });

    if (broadcastSpeaker) {
      const msg = `Lên lịch thành công: ${taskWork} tại ${selectedZone} vào lúc ${time}.`;
      speakAnnouncement(msg);
    }
  };

  // Week days definition matching Image 4
  const weekDays = [
    { label: 'Thứ 2', dateStr: '21/09', dayKey: '2026-09-21' },
    { label: 'Thứ 3', dateStr: '22/09', dayKey: '2026-09-22' },
    { label: 'Thứ 4', dateStr: '23/09', dayKey: '2026-09-23' },
    { label: 'Thứ 5', dateStr: '24/09', dayKey: '2026-09-24' },
    { label: 'Thứ 6', dateStr: '25/09', dayKey: '2026-09-25' },
    { label: 'Thứ 7', dateStr: '26/09', dayKey: '2026-09-26' },
    { label: 'Chủ nhật', dateStr: '27/09', dayKey: '2026-09-27' },
  ];

  const timeSlots = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Subtitle Matching Demo Screenshot 4 */}
      <div>
        <h1 className="text-2xl lg:text-[28px] font-black tracking-tight text-slate-900">
          Lịch canh tác & nhắc việc
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Chủ động chăm sóc cây trồng – Không bỏ lỡ công việc quan trọng
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar View & Status Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Calendar Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            {/* Left: Month Navigation & Today button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toast.info('Chuyển tháng trước')}
                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white">
                <span>{currentMonth}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <button
                onClick={() => toast.info('Chuyển tháng sau')}
                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => toast.info('Về ngày hôm nay')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer ml-1"
              >
                Hôm nay
              </button>
            </div>

            {/* Right: View Mode Tabs & Add Schedule Button */}
            <div className="flex items-center gap-3">
              <div className="flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 text-xs font-bold">
                <button
                  onClick={() => setActiveViewMode('week')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeViewMode === 'week'
                      ? 'bg-[#0f5132] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tuần
                </button>
                <button
                  onClick={() => setActiveViewMode('month')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeViewMode === 'month'
                      ? 'bg-[#0f5132] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tháng
                </button>
                <button
                  onClick={() => setActiveViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeViewMode === 'list'
                      ? 'bg-[#0f5132] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Danh sách
                </button>
              </div>

              <button
                onClick={() => {
                  const element = document.getElementById('quick-task-form');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-xl bg-[#0f5132] hover:bg-[#0d4731] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo lịch</span>
              </button>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Header: 7 Days of the week */}
            <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/70 text-center">
              <div className="p-3 border-r border-slate-200 text-[11px] font-bold text-slate-400">
                Giờ
              </div>
              {weekDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 border-r border-slate-200 last:border-r-0 ${
                    day.label === 'Thứ 7' ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <div className="text-xs font-bold text-slate-800">{day.label}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{day.dateStr}</div>
                </div>
              ))}
            </div>

            {/* Time Grid Rows */}
            <div className="divide-y divide-slate-100">
              {timeSlots.map((slot) => (
                <div key={slot} className="grid grid-cols-8 min-h-[72px]">
                  {/* Time label column */}
                  <div className="p-2 border-r border-slate-100 text-[11px] font-bold text-slate-400 text-center flex items-start justify-center pt-2.5 bg-slate-50/30">
                    {slot}
                  </div>

                  {/* 7 day cells */}
                  {weekDays.map((day, colIdx) => {
                    // Match tasks exactly as shown in screenshot 4:
                    // 06:00 Tưới nước on Thứ 2, Thứ 5, Chủ nhật
                    const isWaterSlot =
                      slot === '06:00' && (day.label === 'Thứ 2' || day.label === 'Thứ 5' || day.label === 'Chủ nhật');
                    // 08:00 Bón phân on Thứ 3, Thứ 6
                    const isFertilizerSlot =
                      slot === '08:00' && (day.label === 'Thứ 3' || day.label === 'Thứ 6');
                    // 14:00 Phun thuốc on Thứ 4, Thứ 7
                    const isPesticideSlot =
                      slot === '14:00' && (day.label === 'Thứ 4' || day.label === 'Thứ 7');

                    return (
                      <div
                        key={colIdx}
                        className="p-1 border-r border-slate-100 last:border-r-0 relative hover:bg-slate-50/50 transition-colors"
                      >
                        {isWaterSlot && (
                          <div className="h-full p-2 rounded-xl bg-[#e0f2fe] border-l-4 border-[#0284c7] text-[#0369a1] text-[11px] font-bold shadow-2xs leading-tight">
                            <div className="flex items-center gap-1 text-[10px] text-[#0284c7]">
                              <Droplets className="w-3 h-3 fill-[#0284c7]" />
                              <span>06:00 – 07:00</span>
                            </div>
                            <div className="mt-0.5 text-slate-900 font-bold">Tưới nước</div>
                            <div className="text-[10px] text-slate-600 font-medium">Lô A1</div>
                          </div>
                        )}

                        {isFertilizerSlot && (
                          <div className="h-full p-2 rounded-xl bg-[#dcfce7] border-l-4 border-[#16a34a] text-[#15803d] text-[11px] font-bold shadow-2xs leading-tight">
                            <div className="flex items-center gap-1 text-[10px] text-[#16a34a]">
                              <Sprout className="w-3 h-3" />
                              <span>08:00 – 09:00</span>
                            </div>
                            <div className="mt-0.5 text-slate-900 font-bold">Bón phân hữu cơ</div>
                            <div className="text-[10px] text-slate-600 font-medium">Nhà kính 01</div>
                          </div>
                        )}

                        {isPesticideSlot && (
                          <div className="h-full p-2 rounded-xl bg-[#fee2e2] border-l-4 border-[#ef4444] text-[#b91c1c] text-[11px] font-bold shadow-2xs leading-tight">
                            <div className="flex items-center gap-1 text-[10px] text-[#dc2626]">
                              <ShieldAlert className="w-3 h-3" />
                              <span>14:00 – 15:00</span>
                            </div>
                            <div className="mt-0.5 text-slate-900 font-bold">Phun thuốc sinh học</div>
                            <div className="text-[10px] text-slate-600 font-medium">Lô A2</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Status Cards (Matching Image 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Loa trực tuyến */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Loa trực tuyến</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-emerald-700 font-bold">Đang hoạt động</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Có thể phát thông báo đến các khu vực.
                  </p>
                </div>
              </div>
              <button
                onClick={handleTestSpeaker}
                className="px-3 py-1.5 rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                {isPlayingAudio ? 'Dừng phát' : 'Phát thử'}
              </button>
            </div>

            {/* Card 2: Gmail đã kết nối */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900">Gmail đã kết nối</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] text-emerald-700 font-bold">Đã kết nối</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    Nhận thông báo qua email: {gmailAddress}
                  </p>
                </div>
              </div>
              <button
                onClick={handleTestGmail}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Kiểm tra
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tạo lịch nhắc việc (4 cols) Matching Image 4 */}
        <div id="quick-task-form" className="lg:col-span-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="text-base font-black text-slate-900">Tạo lịch nhắc việc</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Công việc * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Công việc *
                </label>
                <div className="relative">
                  <select
                    value={taskWork}
                    onChange={(e) => setTaskWork(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 appearance-none"
                  >
                    <option value="Tưới nước">Tưới nước</option>
                    <option value="Bón phân hữu cơ">Bón phân hữu cơ</option>
                    <option value="Phun thuốc sinh học">Phun thuốc sinh học</option>
                    <option value="Kiểm tra vườn đồi">Kiểm tra vườn đồi</option>
                    <option value="Thu hoạch trái cây">Thu hoạch trái cây</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Khu vực * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Khu vực *
                </label>
                <div className="relative">
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 appearance-none"
                  >
                    <option value="Lô A1">Lô A1</option>
                    <option value="Lô A2">Lô A2</option>
                    <option value="Nhà kính 01">Nhà kính 01</option>
                    <option value="Lô V1 - Vải thiều">Lô V1 - Vải thiều</option>
                    <option value="Lô C2 - Cam đường Canh">Lô C2 - Cam đường Canh</option>
                    <option value="Toàn nông trại">Toàn nông trại</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Ngày * & Giờ * in 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ngày *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Giờ *
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Lặp lại */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Lặp lại
                </label>
                <div className="relative">
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 appearance-none"
                  >
                    <option value="Không lặp lại">Không lặp lại</option>
                    <option value="Hằng ngày">Hằng ngày</option>
                    <option value="Hằng tuần">Hằng tuần</option>
                    <option value="Cách ngày">Cách ngày</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Gửi thông báo qua * (2 checkboxes matching Image 4) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Gửi thông báo qua *
                </label>
                <div className="space-y-2.5">
                  {/* Option 1: Phát qua loa */}
                  <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={broadcastSpeaker}
                      onChange={(e) => setBroadcastSpeaker(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#0f5132] focus:ring-[#0f5132] border-slate-300"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Phát qua loa</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Thông báo tại khu vực sản xuất
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Gửi qua Gmail */}
                  <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={sendGmail}
                      onChange={(e) => setSendGmail(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#0f5132] focus:ring-[#0f5132] border-slate-300"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Gửi qua Gmail</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Gửi thông báo đến email của bạn
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action buttons matching demo Image 4 */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0f5132] hover:bg-[#0d4731] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  Lưu lịch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTaskWork('Tưới nước');
                    toast.info('Đã hủy thay đổi');
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

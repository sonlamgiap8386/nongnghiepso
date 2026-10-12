import React from 'react';
import { FarmParcel, TaskItem, WeatherData } from '../types';
import { FarmMap3D } from '../components/FarmMap3D';
import { NavTab } from '../components/Sidebar';
import {
  Calendar,
  Layers,
  Droplets,
  AlertTriangle,
  CloudRain,
  Bot,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  Sparkles,
  Sprout,
  Activity,
  Radio,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

interface OverviewViewProps {
  parcels: FarmParcel[];
  tasks: TaskItem[];
  weather: WeatherData;
  onNavigateTab: (tab: NavTab) => void;
  onSelectParcel: (parcel: FarmParcel) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onOpenCreateTaskModal: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  parcels,
  tasks,
  weather,
  onNavigateTab,
  onSelectParcel,
  onToggleTaskComplete,
  onOpenCreateTaskModal,
}) => {
  const { currentUser } = useAuth();
  const attentionParcels = parcels.filter((p) => p.needsAttention);
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const todayTasks = tasks.slice(0, 5);
  const avgMoisture = Math.round(
    parcels.reduce((sum, p) => sum + p.soilMoisture, 0) / (parcels.length || 1)
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* 1. Executive Hero Dashboard Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0a2717] via-[#0f3d23] to-[#124b2b] text-white p-6 sm:p-8 shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-24 w-60 h-60 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>HỆ THỐNG VẬN HÀNH NÔNG TRẠI THÔNG MINH · LỤC NGẠN</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Xin chào, {currentUser ? currentUser.fullName : 'Lương Thị Khánh Chi'}!
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal">
              {currentUser ? currentUser.farmName : 'Vườn đồi Thung Lũng Xanh'} ({currentUser?.totalAreaHa || 5.68} ha) đang trong chu kỳ{' '}
              <strong className="text-emerald-300 font-semibold">
                Khống chế lộc đông & Chuẩn bị phân hóa mầm hoa xuân
              </strong>
              . Mọi cảm biến IoT và trạm loa thông minh đang duy trì kết nối ổn định.
            </p>

            {/* Quick telemetry chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-emerald-200/90 font-medium">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-900/50 border border-emerald-700/50 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                11 Trạm IoT Hoạt động
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-900/50 border border-emerald-700/50 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                {weather.temp}°C · {weather.condition}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-900/50 border border-emerald-700/50 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Tiêu chuẩn VietGAP / GlobalGAP
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenCreateTaskModal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 hover:shadow-xl transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Tạo lịch canh tác</span>
            </button>
            <button
              onClick={() => onNavigateTab('diagnosis')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-300" />
              <span>Chẩn đoán AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four High-Performance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Diện tích */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs hover-card-elevate transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Diện tích canh tác</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">5,68</span>
            <span className="text-xs font-bold text-slate-500">hecta</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">11 phân khu chuyên canh</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">100% Phủ kín</span>
          </div>
        </div>

        {/* Metric 2: Lịch công việc */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs hover-card-elevate transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Công việc hôm nay</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {tasks.length}
            </span>
            <span className="text-xs font-bold text-slate-500">nhiệm vụ</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Đã xong {completedTasksCount}/{tasks.length}</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
              {Math.round((completedTasksCount / (tasks.length || 1)) * 100)}% Tiến độ
            </span>
          </div>
        </div>

        {/* Metric 3: Độ ẩm đất IoT */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs hover-card-elevate transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Độ ẩm đất trung bình</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {avgMoisture}
            </span>
            <span className="text-xs font-bold text-slate-500">%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Cảm biến tầng rễ 20-40cm</span>
            <span className="font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded-md">Ổn định</span>
          </div>
        </div>

        {/* Metric 4: Cảnh báo cần kiểm tra */}
        <div
          onClick={() => {
            const warningParcel = parcels.find((p) => p.needsAttention);
            if (warningParcel) onSelectParcel(warningParcel);
          }}
          className={`p-4.5 rounded-2xl border shadow-xs hover-card-elevate transition-all cursor-pointer ${
            attentionParcels.length > 0
              ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400'
              : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cảnh báo kỹ thuật</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
              0{attentionParcels.length}
            </span>
            <span className="text-xs font-bold text-slate-500">lô đất</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-amber-800 font-medium truncate">Lô C2 - Cam Canh đồi</span>
            <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md shrink-0">
              Kiểm tra ngay
            </span>
          </div>
        </div>
      </div>

      {/* 3. Interactive 3D Digital Twin Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                Bản đồ 3D Nông trại thực địa
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Digital Twin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tái tạo trực quan 11 phân khu trồng trọt · Click vào từng khối để xem tình trạng ẩm độ và cây trồng
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('map3d')}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-xs font-bold text-slate-700 hover:text-emerald-800 border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Phóng to bản đồ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3D Canvas */}
        <FarmMap3D
          parcels={parcels}
          onSelectParcel={onSelectParcel}
          onScheduleTask={() => onNavigateTab('calendar')}
        />
      </div>

      {/* 4. Middle Dual Section (Weather & Smart AI Agronomist) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weather Card */}
        <div
          onClick={() => onNavigateTab('weather')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover-card-elevate transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CloudRain className="w-4 h-4 text-emerald-600" />
                <span>Thời tiết nông vụ & Cửa sổ phun thuốc</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="flex items-center justify-between mt-2">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 flex items-baseline tracking-tight">
                  {weather.temp}°<span className="text-base text-slate-400 font-semibold ml-0.5">C</span>
                </div>
                <div className="text-xs font-bold text-emerald-800 mt-1">{weather.condition}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{weather.locationName}</div>
              </div>

              <div className="space-y-1.5 text-right text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  Độ ẩm: <span className="font-bold text-slate-800">{weather.humidity}%</span>
                </div>
                <div>
                  Tốc độ gió: <span className="font-bold text-slate-800">{weather.windSpeed} km/h</span>
                </div>
                <div className="text-blue-600 font-bold text-[11px]">
                  Xác suất mưa {weather.rainChance}%
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-medium">
              Cửa sổ xử lý: <strong className="text-emerald-700">Thuận lợi cho khoanh vỏ hãm lộc</strong>
            </span>
            <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-1 text-[11px]">
              Chi tiết dự báo <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* AI Agronomist Card */}
        <div
          onClick={() => onNavigateTab('ai-chat')}
          className="bg-gradient-to-br from-emerald-50/70 via-green-50/40 to-white p-5 rounded-2xl border border-emerald-200/90 shadow-xs hover-card-elevate transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Trợ lý AI Nông nghiệp 4 Xã Lục Ngạn</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </div>

            <h4 className="text-base font-extrabold text-slate-900 leading-snug mt-2">
              Hỏi đáp kỹ thuật thâm canh & Phòng trừ sâu bệnh
            </h4>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Cập nhật quy trình hãm lộc đông Vải thiều, bón phân Kali cam Canh, quản lý ruồi vàng đục quả ổi lê và táo xuân theo tiêu chuẩn VietGAP.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-emerald-600" />
              Sẵn sàng giải đáp 24/7
            </span>
            <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-1 text-[11px]">
              Trò chuyện ngay <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Tasks & Urgent Inspection Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Tasks Deck */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Nhiệm vụ canh tác hôm nay
              </h3>
              <p className="text-[11px] text-slate-500">Được đồng bộ qua loa truyền thanh và hộp thư</p>
            </div>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Xem lịch đầy đủ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {todayTasks.map((t) => (
              <div
                key={t.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onToggleTaskComplete(t.id)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      t.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'border-slate-300 hover:border-emerald-500 bg-white'
                    }`}
                  >
                    {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-bold text-slate-800 truncate ${
                        t.completed ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {t.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-medium text-emerald-700">{t.zoneName}</span>
                      <span>·</span>
                      <span>{t.type}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-slate-700">{t.time}</div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t.completed ? 'Đã hoàn thành' : 'Đang chờ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Action Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Sức khỏe khu vực trồng trọt
              </h3>
              <button
                onClick={() => onNavigateTab('diagnosis')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Soi bệnh AI
              </button>
            </div>

            {/* Warning Card */}
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-950 text-xs">
                    Lô C2 · Cam đường Canh đồi dốc
                  </div>
                  <p className="text-amber-800 text-[11px] mt-1 leading-relaxed">
                    Độ ẩm đất giảm xuống 32% do sườn đồi dốc thoát nước nhanh. Cần kích hoạt hệ thống tưới nhỏ giọt và kiểm tra van cấp nước.
                  </p>
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-amber-200/80">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Mức ưu tiên: Khẩn
                </span>
                <button
                  onClick={() => {
                    const c2 = parcels.find((p) => p.id === 'C2');
                    if (c2) onSelectParcel(c2);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs cursor-pointer transition-colors"
                >
                  Đến vị trí lô đất
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Tổng số lô an toàn:</span>
            <span className="font-extrabold text-emerald-700">10 / 11 Đạt chuẩn</span>
          </div>
        </div>
      </div>
    </div>
  );
};

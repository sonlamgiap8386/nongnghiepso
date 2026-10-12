import React, { useState } from 'react';
import { WeatherData } from '../types';
import {
  CloudRain,
  Sun,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  RefreshCw,
  AlertTriangle,
  Calendar,
  MapPin,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';

interface WeatherViewProps {
  weather: WeatherData;
  onRefreshWeather?: () => void;
  onOpenSchedule?: () => void;
  onLocationChangeClick?: () => void;
}

export const WeatherView: React.FC<WeatherViewProps> = ({
  weather,
  onRefreshWeather,
  onOpenSchedule,
  onLocationChangeClick,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefreshWeather) onRefreshWeather();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header matching Screenshot 4 / Video */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Theo dõi điều kiện canh tác
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Thời tiết nông trại
          </h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{weather.locationName}</span>
            {onLocationChangeClick && (
              <button
                onClick={onLocationChangeClick}
                className="text-emerald-700 hover:underline font-bold"
              >
                Đổi vị trí
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Cập nhật</span>
        </button>
      </div>

      {/* Main Weather Card matching Video */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{weather.locationName}</span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
                {weather.temp}
              </span>
              <span className="text-2xl font-bold text-slate-400">°C</span>
            </div>

            <div className="text-lg font-bold text-slate-800 mt-1">{weather.condition}</div>

            <div className="text-xs text-slate-500 mt-1">
              Cao nhất {weather.highTemp}° · Thấp nhất {weather.lowTemp}°
            </div>

            <div className="text-[10px] text-slate-400 mt-3 font-medium">
              Nguồn dự báo: Open-Meteo & Trạm quan trắc nông nghiệp 4 xã Lục Ngạn (cũ)
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="w-36 h-36 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shadow-inner">
              <CloudRain className="w-20 h-20" />
            </div>
          </div>
        </div>

        {/* 4 Stat Tiles matching Screenshot 4 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          {/* 1. Độ ẩm */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Độ ẩm không khí</span>
              <Droplets className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{weather.humidity}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tại thời điểm hiện tại</div>
          </div>

          {/* 2. Tốc độ gió */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Tốc độ gió</span>
              <Wind className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{weather.windSpeed} km/h</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Ở độ cao 10 m</div>
          </div>

          {/* 3. Khả năng mưa */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Khả năng mưa</span>
              <CloudRain className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-600 mt-2">{weather.rainChance}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {weather.rainVolumeMm} mm dự báo hôm nay
            </div>
          </div>

          {/* 4. Mặt trời mọc / lặn */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Mặt trời mọc / lặn</span>
              <Sunrise className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-2">
              {weather.sunrise} / {weather.sunset}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Giờ Việt Nam</div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Cards matching Video */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900">Dự báo 7 ngày</h3>
          <span className="text-[11px] text-slate-400">Nguồn: Open-Meteo</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weather.dailyForecast.map((day, idx) => (
            <div
              key={day.day}
              className={`p-3.5 rounded-2xl text-center border transition-all ${
                idx === 0
                  ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold text-xs text-slate-900">{day.day}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{day.date}</div>

              <div className="my-2.5 flex justify-center text-blue-500">
                <CloudRain className="w-7 h-7" />
              </div>

              <div className="text-xs font-black text-slate-900">
                {day.tempHigh}° <span className="text-slate-400 font-semibold">{day.tempLow}°</span>
              </div>

              <div className="text-[10px] text-blue-600 font-bold mt-1 flex items-center justify-center gap-0.5">
                <Droplets className="w-3 h-3" />
                <span>{day.rainChance}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Forecast Chart matching Video */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900">Dự báo theo giờ</h3>
          <span className="text-xs text-slate-400 font-medium">12/10/2026</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pt-2">
          {weather.hourlyForecast.map((item) => (
            <div key={item.time} className="text-center space-y-2">
              <div className="text-xs font-bold text-slate-800">{item.temp}°</div>

              {/* Bar visualization */}
              <div className="h-28 w-full bg-slate-100 rounded-xl relative overflow-hidden flex flex-col justify-end p-1">
                <div
                  className="w-full bg-emerald-600 rounded-lg transition-all duration-500"
                  style={{ height: `${Math.min(100, (item.temp / 35) * 100)}%` }}
                />
              </div>

              <div className="text-[11px] font-semibold text-slate-600">{item.time}</div>
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
                <Droplets className="w-2.5 h-2.5 text-cyan-600" />
                <span>{item.humidity}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Natural Disaster & Farming Advisory Card matching Video */}
      <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-200 shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-sm text-amber-950">Lưu ý canh tác & Cảnh báo thời tiết</h4>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed">{weather.advisory}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-amber-200/60 text-xs">
          <span className="text-amber-800/80 text-[11px]">Dự báo có thể thay đổi theo thời điểm thực tế.</span>
          <button
            onClick={onOpenSchedule}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Lên lịch chăm sóc</span>
          </button>
        </div>
      </div>
    </div>
  );
};

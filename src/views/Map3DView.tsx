import React, { useState } from 'react';
import { FarmParcel } from '../types';
import { FarmMap3D } from '../components/FarmMap3D';
import {
  Layers,
  Droplets,
  Calendar,
  AlertTriangle,
  Compass,
  Maximize2,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface Map3DViewProps {
  parcels: FarmParcel[];
  selectedParcelId: string | null;
  onSelectParcel: (parcel: FarmParcel) => void;
  onScheduleTask: (parcel: FarmParcel) => void;
}

export const Map3DView: React.FC<Map3DViewProps> = ({
  parcels,
  selectedParcelId,
  onSelectParcel,
  onScheduleTask,
}) => {
  const selected = parcels.find((p) => p.id === selectedParcelId) || parcels[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Tái tạo không gian canh tác thực địa
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Bản đồ 3D Nông trại An Nhiên
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Mô phỏng 11 phân khu trồng trọt với độ phân giải cao, tích hợp dữ liệu cảm biến IoT thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/60 w-fit">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Interactive WebGL 3D Twin</span>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <FarmMap3D
          parcels={parcels}
          selectedParcelId={selectedParcelId}
          onSelectParcel={onSelectParcel}
          onScheduleTask={onScheduleTask}
        />
      </div>

      {/* Parcels Grid Overview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900">
            Danh sách 11 phân khu canh tác (Tổng diện tích 5,68 ha)
          </h3>
          <span className="text-xs text-slate-500">Nhấp chọn lô để xem vị trí trên bản đồ 3D</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {parcels.map((parcel) => (
            <div
              key={parcel.id}
              onClick={() => onSelectParcel(parcel)}
              className={`p-3.5 rounded-2xl border text-xs transition-all cursor-pointer ${
                selectedParcelId === parcel.id
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30'
                  : 'border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: parcel.color }}
                  />
                  <h4 className="font-bold text-slate-900 truncate">{parcel.name}</h4>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                  {parcel.area} ha
                </span>
              </div>

              <div className="mt-2 space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Cây trồng:</span>
                  <span className="font-semibold text-slate-800">{parcel.cropType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Độ ẩm đất:</span>
                  <span
                    className={`font-bold ${
                      parcel.soilMoisture < 40 ? 'text-amber-600' : 'text-emerald-700'
                    }`}
                  >
                    {parcel.soilMoisture}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sức khỏe:</span>
                  <span className="font-semibold text-emerald-700">{parcel.healthScore}/100</span>
                </div>
              </div>

              {parcel.needsAttention && (
                <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">Cần kiểm tra độ ẩm đất!</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

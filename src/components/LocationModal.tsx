import React from 'react';
import { MapPin, X, Check } from 'lucide-react';

interface LocationModalProps {
  currentLocation: string;
  onSelectLocation: (loc: string) => void;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  currentLocation,
  onSelectLocation,
  onClose,
}) => {
  const regions = [
    {
      id: 'hong-giang',
      name: 'TDP Hồng Giang, Lục Ngạn (cũ)',
      commune: 'Hồng Giang',
      zone: 'Vùng lõi Vải thiều & Cam Canh',
      crop: 'Vải thiều chính vụ, Cam đường canh đồi dốc, Táo xuân Đài Loan, Ổi lê, Bưởi Diễn',
      coords: '21.3120°N, 106.6200°E',
      temp: '24.0°C',
      soil: 'Đất Fersalit đỏ vàng đồi dốc thoải',
    },
    {
      id: 'thanh-hai',
      name: 'Thanh Hải, Lục Ngạn (cũ)',
      commune: 'Thanh Hải',
      zone: 'Vùng Vải thiều GlobalGAP & Cam Canh',
      crop: 'Vải thiều xuất khẩu, Cam đường canh VietGAP, Bưởi da xanh ruột hồng, Táo xuân',
      coords: '21.3280°N, 106.5750°E',
      temp: '25.0°C',
      soil: 'Gò đồi thoải ven hồ Cấm Sơn, đất phù sa cổ',
    },
    {
      id: 'quy-son',
      name: 'Quý Sơn, Lục Ngạn (cũ)',
      commune: 'Quý Sơn',
      zone: 'Thủ phủ Bưởi ngọt & Cam Canh',
      crop: 'Bưởi Diễn cây cổ, Bưởi da xanh, Cam đường Canh, Vải thiều đồi cao, Ổi',
      coords: '21.2850°N, 106.6350°E',
      temp: '24.5°C',
      soil: 'Thung lũng đồi trù phú, thoát nước tốt',
    },
    {
      id: 'phi-dien',
      name: 'Phì Điền, Lục Ngạn (cũ)',
      commune: 'Phì Điền',
      zone: 'Cửa ngõ đồi cao Táo & Vải muộn',
      crop: 'Táo xuân Đài Loan giàn lưới, Vải thiều đồi đá, Bưởi Diễn, Cam Canh',
      coords: '21.3520°N, 106.6710°E',
      temp: '23.5°C',
      soil: 'Vùng đồi cao thoáng khí, vi khí hậu mát mẻ',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Khu vực canh tác (Huyện Lục Ngạn cũ)</h3>
              <p className="text-[11px] text-emerald-700 font-semibold">Chuyên canh: Vải thiều, Cam Canh, Táo, Ổi, Bưởi</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Thu hẹp trọng tâm vào 4 tiểu vùng nông nghiệp đặc sản: <span className="font-semibold text-slate-700">Hồng Giang, Thanh Hải, Quý Sơn, Phì Điền</span>. Dữ liệu vi khí hậu và gợi ý canh tác sẽ tự động cập nhật tương ứng.
        </p>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {regions.map((reg) => {
            const isSelected = currentLocation.includes(reg.name.split(' ·')[0]);
            return (
              <button
                key={reg.name}
                onClick={() => {
                  onSelectLocation(reg.name);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                    : 'border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>{reg.name}</span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {reg.zone}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Cây trồng chính: {reg.crop}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{reg.coords}</div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Save,
  ShieldCheck,
  Sprout,
  Camera,
  Check,
  Calendar,
  Layers,
  Award,
  QrCode,
  ExternalLink,
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
];

const CROP_OPTIONS = [
  'Vải thiều',
  'Cam đường Canh',
  'Táo xuân Đài Loan',
  'Ổi lê',
  'Bưởi Diễn',
  'Bưởi da xanh',
];

export const ProfileModal: React.FC = () => {
  const {
    currentUser,
    isProfileModalOpen,
    closeProfileModal,
    updateProfile,
    isLoading,
    openAuthModal,
  } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [farmName, setFarmName] = useState('');
  const [location, setLocation] = useState('');
  const [totalAreaHa, setTotalAreaHa] = useState(0);
  const [crops, setCrops] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
      setRoleTitle(currentUser.roleTitle);
      setFarmName(currentUser.farmName);
      setLocation(currentUser.location);
      setTotalAreaHa(currentUser.totalAreaHa);
      setCrops(currentUser.crops || []);
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar);
    }
  }, [currentUser, isProfileModalOpen]);

  if (!isProfileModalOpen || !currentUser) return null;

  const handleToggleCrop = (crop: string) => {
    if (crops.includes(crop)) {
      setCrops(crops.filter((c) => c !== crop));
    } else {
      setCrops([...crops, crop]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      fullName,
      email,
      phone,
      roleTitle,
      farmName,
      location,
      totalAreaHa: Number(totalAreaHa),
      crops,
      bio,
      avatar,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Hồ sơ Nhà nông & Trang trại</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Đã xác thực
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Quản lý định danh số và hồ sơ canh tác 4 tiểu vùng Lục Ngạn cũ
              </p>
            </div>
          </div>
          <button
            onClick={closeProfileModal}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Avatar & Farm Identity Badge */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/30 border border-slate-200/80">
            <div className="relative">
              <img
                src={avatar}
                alt={fullName}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md"
              />
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer transition-colors"
                title="Đổi ảnh đại diện"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-base font-extrabold text-slate-900">{fullName}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {roleTitle}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">{farmName}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {location}
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Mã số: {currentUser.farmCode || 'LN-084'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                closeProfileModal();
                openAuthModal();
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-bold text-xs shrink-0 cursor-pointer transition-colors"
            >
              Chuyển tài khoản
            </button>
          </div>

          {/* Avatar selector popup */}
          {showAvatarPicker && (
            <div className="p-3 bg-slate-100 rounded-2xl space-y-2 animate-in fade-in">
              <span className="text-xs font-bold text-slate-700">Chọn ảnh chân dung đại diện:</span>
              <div className="flex items-center gap-3 overflow-x-auto py-1">
                {AVATAR_PRESETS.map((p, idx) => (
                  <img
                    key={idx}
                    src={p}
                    alt="Preset"
                    onClick={() => {
                      setAvatar(p);
                      setShowAvatarPicker(false);
                    }}
                    className={`w-12 h-12 rounded-xl object-cover cursor-pointer hover:scale-105 transition-transform ring-2 ${
                      avatar === p ? 'ring-emerald-600' : 'ring-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Thông tin liên hệ cá nhân
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ và tên</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Chức danh / Vai trò</label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Số điện thoại</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Hộp thư điện tử (Email)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Farm Information */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Quy mô & Định danh cơ sở canh tác
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên trang trại / Cơ sở</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Khu vực địa giới hành chính</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
                >
                  <option value="TDP Hồng Giang, Lục Ngạn (cũ)">TDP Hồng Giang, Lục Ngạn (cũ)</option>
                  <option value="Xã Thanh Hải, Lục Ngạn (cũ)">Xã Thanh Hải, Lục Ngạn (cũ)</option>
                  <option value="Xã Quý Sơn, Lục Ngạn (cũ)">Xã Quý Sơn, Lục Ngạn (cũ)</option>
                  <option value="Xã Phì Điền, Lục Ngạn (cũ)">Xã Phì Điền, Lục Ngạn (cũ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tổng diện tích đất vườn đồi (héc ta)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalAreaHa}
                  onChange={(e) => setTotalAreaHa(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mã định danh vùng trồng số</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.farmCode || 'HG-VG-084 (Chuẩn VietGAP)'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            {/* Crops selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Cây trồng thế mạnh đang canh tác
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CROP_OPTIONS.map((crop) => {
                  const isSelected = crops.includes(crop);
                  return (
                    <button
                      type="button"
                      key={crop}
                      onClick={() => handleToggleCrop(crop)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {crop} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Giới thiệu kinh nghiệm & phương thức canh tác
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mô tả kinh nghiệm, chứng nhận VietGAP/GlobalGAP hoặc quy trình kỹ thuật nông trại..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeProfileModal}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

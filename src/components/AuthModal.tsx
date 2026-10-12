import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Sprout,
  ShieldCheck,
  Building2,
  MapPin,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Layers,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
    demoAccounts,
    switchDemoAccount,
    isLoading,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form
  const [loginUsername, setLoginUsername] = useState('sonlamgiap@gmail.com');
  const [loginPassword, setLoginPassword] = useState('123');

  // Register form
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('123');
  const [regRole, setRegRole] = useState<'farmer' | 'engineer' | 'officer' | 'trader'>('farmer');
  const [regFarmName, setRegFarmName] = useState('');
  const [regLocation, setRegLocation] = useState('TDP Hồng Giang, Lục Ngạn (cũ)');
  const [regArea, setRegArea] = useState('2.5');
  const [regSelectedCrops, setRegSelectedCrops] = useState<string[]>(['Vải thiều', 'Cam đường Canh']);

  const cropOptions = [
    'Vải thiều',
    'Cam đường Canh',
    'Táo xuân Đài Loan',
    'Ổi lê',
    'Bưởi Diễn',
    'Bưởi da xanh',
  ];

  if (!isAuthModalOpen) return null;

  const handleToggleCrop = (crop: string) => {
    if (regSelectedCrops.includes(crop)) {
      setRegSelectedCrops(regSelectedCrops.filter((c) => c !== crop));
    } else {
      setRegSelectedCrops([...regSelectedCrops, crop]);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginUsername, loginPassword);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({
      fullName: regFullName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      role: regRole,
      farmName: regFarmName || `Vườn cây ${regFullName}`,
      location: regLocation,
      totalAreaHa: parseFloat(regArea) || 1.0,
      crops: regSelectedCrops,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Tài khoản Nông Nghiệp Số</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                  Chính chủ
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Đăng nhập hoặc đăng ký tài khoản để định danh nhà vườn & lưu trữ dữ liệu
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('login')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng nhập tài khoản
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng ký tài khoản nhà vườn mới
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email hoặc Số điện thoại
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="ví dụ: sonlamgiap@gmail.com hoặc 0988123456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (tài khoản mẫu: 123)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                  <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                </label>
                <span className="text-emerald-700 font-semibold cursor-pointer hover:underline">
                  Quên mật khẩu?
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Họ và tên nhà nông *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="ví dụ: Nguyễn Văn Toàn"
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số điện thoại liên hệ *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0988xxxxxx"
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Địa chỉ Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="toan.nguyen@honggiang.farm"
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mật khẩu khởi tạo *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vai trò trong hệ sinh thái
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
                  >
                    <option value="farmer">Chủ nhà vườn / Chủ trang trại</option>
                    <option value="engineer">Kỹ sư nông nghiệp BVTV</option>
                    <option value="officer">Cán bộ khuyến nông địa phương</option>
                    <option value="trader">Thương lái thu mua / Hợp tác xã</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tên nông trại / Cơ sở canh tác
                  </label>
                  <input
                    type="text"
                    value={regFarmName}
                    onChange={(e) => setRegFarmName(e.target.value)}
                    placeholder="ví dụ: Vườn Đồi Mai Hoa"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vùng canh tác (4 xã Lục Ngạn cũ)
                  </label>
                  <select
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
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
                    Quy mô diện tích (héc ta - ha)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cây trồng chủ lực canh tác
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {cropOptions.map((crop) => {
                    const isSelected = regSelectedCrops.includes(crop);
                    return (
                      <button
                        type="button"
                        key={crop}
                        onClick={() => handleToggleCrop(crop)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {crop} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Đang đăng ký...' : 'Hoàn tất đăng ký & Mở trang trại'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Switcher Section */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Hoặc đăng nhập nhanh bằng tài khoản mẫu:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Bấm 1 chạm để chuyển</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => switchDemoAccount(account.id)}
                  type="button"
                  className="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
                >
                  <img
                    src={account.avatar}
                    alt={account.fullName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-800">
                      {account.fullName}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium truncate">
                      {account.roleTitle}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {account.location}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

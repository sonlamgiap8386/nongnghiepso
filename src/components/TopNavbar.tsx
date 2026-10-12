import React, { useState } from 'react';
import { NavTab } from './Sidebar';
import {
  Home,
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  ShieldCheck,
  UserCheck,
  LogOut,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface TopNavbarProps {
  currentTab: NavTab;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onOpenMobileMenu: () => void;
  locationName: string;
  onLocationChangeClick: () => void;
  onResetData?: () => void;
  unreadCount?: number;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
  locationName,
  onLocationChangeClick,
  onResetData,
  unreadCount = 3,
}) => {
  const toast = useToast();
  const { currentUser, openAuthModal, openProfileModal, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const tabBreadcrumbTitles: Record<NavTab, string> = {
    overview: 'Tổng quan',
    map3d: 'Bản đồ 3D',
    calendar: 'Lịch canh tác',
    community: 'Cộng đồng',
    marketplace: 'Sạp nông sản',
    'ai-chat': 'Trợ lý AI',
    weather: 'Thời tiết',
    diagnosis: 'Chẩn đoán bệnh',
  };

  const currentTabTitle = tabBreadcrumbTitles[currentTab] || 'Tổng quan';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumb Matching Demo */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Breadcrumb: Trang chủ > TabName */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5 hover:text-slate-700 transition-colors cursor-pointer">
            <Home className="w-4 h-4 text-slate-400" />
            <span>Trang chủ</span>
          </div>
          <span className="text-slate-300 font-normal">›</span>
          <span className="text-slate-900 font-bold">{currentTabTitle}</span>
        </div>
      </div>

      {/* Right: Search, Notifications, User Profile */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Rounded Pill Search Bar Matching Demo */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm thông tin, cây trồng, kỹ thuật..."
            className="w-full pl-4 pr-9 py-2 rounded-full border border-slate-200/90 bg-white text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Notification Bell with Red Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Thông báo"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                <span>Thông báo hệ thống</span>
                <span className="text-[10px] text-emerald-700 font-medium">3 tin mới</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 rounded-xl bg-emerald-50/60 hover:bg-emerald-50 transition-colors cursor-pointer">
                  <p className="font-bold text-slate-900 text-xs">Lịch tưới Lô V1 lúc 06:00</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Hệ thống đã phát loa tự động bằng tiếng Việt.</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer">
                  <p className="font-bold text-slate-900 text-xs">Cảnh báo độ ẩm đất Lô C2</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Độ ẩm 52% - Cần bổ sung nước tưới cho Cam đường Canh.</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer">
                  <p className="font-bold text-slate-900 text-xs">Đơn đặt hàng Vải thiều mới</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Khách hàng đặt 50 kg nhận tại nông hộ.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Matching Demo Screenshot */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 py-1 pl-1 pr-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-left"
          >
            <img
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
              }
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shadow-2xs"
            />
            <span className="text-xs font-bold text-slate-800 hidden sm:inline">
              {currentUser?.fullName || 'Lương Thị Khánh Chi'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Profile Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="px-3 py-2.5 border-b border-slate-100 mb-1.5 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-slate-900">{currentUser?.fullName || 'Lương Thị Khánh Chi'}</p>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {currentUser?.roleTitle || 'Chủ trang trại'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] truncate mt-0.5">
                  {currentUser?.farmName || 'Nông trại Thung Lũng Xanh'}
                </p>
                <p className="text-emerald-700 text-[11px] font-semibold truncate mt-0.5">
                  {currentUser?.email || 'sonlamgiap@gmail.com'}
                </p>
              </div>

              <button
                onClick={() => {
                  openProfileModal();
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Hồ sơ cá nhân & Nông trại</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  openAuthModal();
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Đổi tài khoản / Đăng nhập khác</span>
              </button>

              <button
                onClick={() => {
                  onLocationChangeClick();
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Đổi khu vực canh tác ({locationName})</span>
              </button>

              {onResetData && (
                <button
                  onClick={() => {
                    onResetData();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-600 font-medium transition-colors cursor-pointer"
                >
                  Đặt lại dữ liệu mẫu ban đầu
                </button>
              )}

              <div className="pt-1 mt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

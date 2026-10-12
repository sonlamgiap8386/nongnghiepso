import React from 'react';
import {
  Home,
  Map,
  Calendar,
  Users,
  Store,
  Bot,
  Sun,
  Activity,
  X,
  Sprout,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'map3d'
  | 'calendar'
  | 'community'
  | 'marketplace'
  | 'ai-chat'
  | 'weather'
  | 'diagnosis';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'overview', label: 'Tổng quan', icon: <Home className="w-5 h-5 stroke-[1.8]" /> },
    { id: 'map3d', label: 'Bản đồ 3D', icon: <Map className="w-5 h-5 stroke-[1.8]" /> },
    { id: 'calendar', label: 'Lịch canh tác', icon: <Calendar className="w-5 h-5 stroke-[1.8]" /> },
    { id: 'community', label: 'Cộng đồng', icon: <Users className="w-5 h-5 stroke-[1.8]" /> },
    { id: 'marketplace', label: 'Sạp nông sản', icon: <Store className="w-5 h-5 stroke-[1.8]" /> },
    { id: 'ai-chat', label: 'Trợ lý AI', icon: <Bot className="w-5 h-5 stroke-[1.8]" /> },
    { id: 'weather', label: 'Thời tiết', icon: <Sun className="w-5 h-5 stroke-[1.8]" /> },
    { id: 'diagnosis', label: 'Chẩn đoán bệnh', icon: <Activity className="w-5 h-5 stroke-[1.8]" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 w-60 bg-[#0f5132] text-white flex flex-col justify-between shrink-0 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Header */}
          <div className="px-5 pt-6 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
                {/* Custom Leaf Icon Matching Demo */}
                <svg
                  className="w-6 h-6 text-emerald-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-[17px] font-black tracking-tight text-white leading-tight">
                  Nông nghiệp số
                </h1>
                <p className="text-[10px] text-emerald-200/80 font-medium tracking-tight mt-0.5 truncate">
                  Kết nối tri thức - Kiến tạo mùa vàng
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5 flex-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#1b6b47] text-white shadow-sm border border-emerald-400/20'
                      : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-emerald-200/90'}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Terraced Hill Graphic & Slogan Matching Demo */}
        <div className="relative pt-6 pb-5 px-5 mt-auto overflow-hidden">
          {/* Subtle terraced field hills SVG background */}
          <div className="absolute inset-0 pointer-events-none opacity-25">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 100"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M0 100 C 40 60, 80 80, 120 50 C 160 20, 180 40, 200 10 L 200 100 Z"
                fill="#07301e"
              />
              <path
                d="M0 100 C 30 75, 70 85, 110 65 C 150 45, 170 55, 200 35 L 200 100 Z"
                fill="#0a3d27"
              />
            </svg>
          </div>

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <Sprout className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-100 leading-tight">
                Vì một nền nông nghiệp
              </p>
              <p className="text-[10px] text-emerald-300/80 leading-tight">
                xanh và bền vững
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { NavTab, Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { LocationModal } from './components/LocationModal';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';

import {
  INITIAL_PARCELS,
  INITIAL_TASKS,
  INITIAL_PRODUCTS,
  INITIAL_POSTS,
  INITIAL_WEATHER,
  LUC_NGAN_COMMUNES_WEATHER,
} from './data/mockData';
import { FarmParcel, TaskItem, ProductItem, CommunityPost, WeatherData } from './types';

// Code-splitting / Lazy loading for high performance & fast initial paint
const OverviewView = lazy(() =>
  import('./views/OverviewView').then((m) => ({ default: m.OverviewView }))
);
const Map3DView = lazy(() =>
  import('./views/Map3DView').then((m) => ({ default: m.Map3DView }))
);
const CalendarView = lazy(() =>
  import('./views/CalendarView').then((m) => ({ default: m.CalendarView }))
);
const CommunityView = lazy(() =>
  import('./views/CommunityView').then((m) => ({ default: m.CommunityView }))
);
const MarketplaceView = lazy(() =>
  import('./views/MarketplaceView').then((m) => ({ default: m.MarketplaceView }))
);
const AiChatView = lazy(() =>
  import('./views/AiChatView').then((m) => ({ default: m.AiChatView }))
);
const WeatherView = lazy(() =>
  import('./views/WeatherView').then((m) => ({ default: m.WeatherView }))
);
const DiagnosisView = lazy(() =>
  import('./views/DiagnosisView').then((m) => ({ default: m.DiagnosisView }))
);

// Fallback skeleton loader
const ViewLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-3 text-slate-400 animate-in fade-in">
    <div className="w-9 h-9 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
    <span className="text-xs font-semibold tracking-wide text-slate-500">
      Đang tải dữ liệu khu vực nông trại...
    </span>
  </div>
);

// Safe LocalStorage loader
function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`LocalStorage read error for ${key}:`, err);
    return fallback;
  }
}

function MainApp() {
  const toast = useToast();
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>(() =>
    loadStorage('nongnghiep_location', 'TDP Hồng Giang, Lục Ngạn (cũ)')
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Core state with LocalStorage persistence
  const [parcels] = useState<FarmParcel[]>(INITIAL_PARCELS);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>('C2');
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    loadStorage('nongnghiep_tasks', INITIAL_TASKS)
  );
  const [products, setProducts] = useState<ProductItem[]>(() =>
    loadStorage('nongnghiep_products', INITIAL_PRODUCTS)
  );
  const [posts, setPosts] = useState<CommunityPost[]>(() =>
    loadStorage('nongnghiep_posts', INITIAL_POSTS)
  );
  const [weather, setWeather] = useState<WeatherData>(INITIAL_WEATHER);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('nongnghiep_tasks', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('nongnghiep_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('nongnghiep_posts', JSON.stringify(posts));
    } catch {}
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem('nongnghiep_location', JSON.stringify(currentLocation));
    } catch {}
  }, [currentLocation]);

  // Parcel selection
  const handleSelectParcel = (parcel: FarmParcel | null) => {
    setSelectedParcelId(parcel ? parcel.id : null);
  };

  // Task actions
  const handleAddTask = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          if (nextState) {
            toast.success('Đã hoàn thành công việc!', t.title);
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (target) {
        toast.info('Đã xóa công việc khỏi lịch', target.title);
      }
      return prev.filter((t) => t.id !== taskId);
    });
  };

  // Product actions
  const handleAddProduct = (newProd: ProductItem) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updated: ProductItem) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Community actions
  const handleAddPost = (newPost: CommunityPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  };

  const handleToggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextSaved = !p.saved;
          toast.info(
            nextSaved ? 'Đã lưu bài viết vào mục yêu thích' : 'Đã bỏ lưu bài viết',
            p.tags.join(' ')
          );
          return { ...p, saved: nextSaved };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment = {
            id: `c-${Date.now()}`,
            author: currentUser ? currentUser.fullName : 'Nguyễn Văn An',
            time: 'Vừa xong',
            text,
          };
          toast.success('Đã gửi phản hồi của bạn');
          return {
            ...p,
            commentsCount: (p.commentsCount || 0) + 1,
            comments: [...(p.comments || []), newComment],
          };
        }
        return p;
      })
    );
  };

  // Location switch
  const handleSelectLocation = (newLoc: string) => {
    setCurrentLocation(newLoc);
    let matchedWeather: WeatherData | null = null;
    for (const [communeKey, weatherData] of Object.entries(LUC_NGAN_COMMUNES_WEATHER)) {
      if (newLoc.includes(communeKey)) {
        matchedWeather = weatherData;
        break;
      }
    }
    if (matchedWeather) {
      setWeather(matchedWeather);
    } else {
      setWeather((prev) => ({
        ...prev,
        locationName: newLoc,
      }));
    }
    toast.success('Đã chuyển đổi khu vực canh tác', newLoc);
  };

  // Reset to default mock data
  const handleResetData = () => {
    setTasks(INITIAL_TASKS);
    setProducts(INITIAL_PRODUCTS);
    setPosts(INITIAL_POSTS);
    setCurrentLocation('TDP Hồng Giang, Lục Ngạn (cũ)');
    localStorage.removeItem('nongnghiep_tasks');
    localStorage.removeItem('nongnghiep_products');
    localStorage.removeItem('nongnghiep_posts');
    localStorage.removeItem('nongnghiep_location');
    toast.info('Đã khôi phục dữ liệu ban đầu của nông trại');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 flex">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <TopNavbar
          currentTab={currentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          locationName={currentLocation}
          onLocationChangeClick={() => setIsLocationModalOpen(true)}
          onResetData={handleResetData}
        />

        {/* View Router with Suspense */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <Suspense fallback={<ViewLoadingFallback />}>
            {currentTab === 'overview' && (
              <OverviewView
                parcels={parcels}
                tasks={tasks}
                weather={weather}
                onNavigateTab={setCurrentTab}
                onSelectParcel={(parcel) => {
                  setSelectedParcelId(parcel.id);
                  setCurrentTab('map3d');
                }}
                onToggleTaskComplete={handleToggleTaskComplete}
                onOpenCreateTaskModal={() => setCurrentTab('calendar')}
              />
            )}

            {currentTab === 'map3d' && (
              <Map3DView
                parcels={parcels}
                selectedParcelId={selectedParcelId}
                onSelectParcel={handleSelectParcel}
                onScheduleTask={(parcel) => {
                  setSelectedParcelId(parcel.id);
                  setCurrentTab('calendar');
                }}
              />
            )}

            {currentTab === 'calendar' && (
              <CalendarView
                tasks={tasks}
                parcels={parcels}
                onAddTask={handleAddTask}
                onToggleTaskComplete={handleToggleTaskComplete}
                onDeleteTask={handleDeleteTask}
                defaultParcelId={selectedParcelId || undefined}
              />
            )}

            {currentTab === 'community' && (
              <CommunityView
                posts={posts}
                onAddPost={handleAddPost}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onAddComment={handleAddComment}
                searchQuery={searchQuery}
              />
            )}

            {currentTab === 'marketplace' && (
              <MarketplaceView
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                searchQuery={searchQuery}
              />
            )}

            {currentTab === 'ai-chat' && <AiChatView />}

            {currentTab === 'weather' && (
              <WeatherView
                weather={weather}
                onOpenSchedule={() => setCurrentTab('calendar')}
                onLocationChangeClick={() => setIsLocationModalOpen(true)}
              />
            )}

            {currentTab === 'diagnosis' && (
              <DiagnosisView
                onAddScheduleTask={handleAddTask}
                onNavigateToChat={() => {
                  setCurrentTab('ai-chat');
                }}
              />
            )}
          </Suspense>
        </main>
      </div>

      {/* Location Selector Modal */}
      {isLocationModalOpen && (
        <LocationModal
          currentLocation={currentLocation}
          onSelectLocation={handleSelectLocation}
          onClose={() => setIsLocationModalOpen(false)}
        />
      )}

      {/* User Authentication & Profile Modals */}
      <AuthModal />
      <ProfileModal />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}

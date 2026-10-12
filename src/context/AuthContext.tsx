import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { useToast } from '../components/Toast';

interface AuthContextType {
  currentUser: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isProfileModalOpen: boolean;
  demoAccounts: UserProfile[];
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  login: (username: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    role?: 'farmer' | 'engineer' | 'officer' | 'trader';
    farmName?: string;
    location?: string;
    totalAreaHa?: number;
    crops?: string[];
    bio?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoAccount: (userId: string) => Promise<boolean>;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-1',
  fullName: 'Lương Thị Khánh Chi',
  email: 'sonlamgiap@gmail.com',
  phone: '0988123456',
  role: 'farmer',
  roleTitle: 'Chủ trang trại',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  farmName: 'Nông trại Thung Lũng Xanh',
  location: 'TDP Hồng Giang, Lục Ngạn (cũ)',
  totalAreaHa: 5.68,
  crops: ['Vải thiều', 'Cam đường Canh', 'Táo xuân Đài Loan', 'Ổi lê'],
  bio: 'Nhà vườn chuyên canh cây ăn quả đặc sản tại Hồng Giang theo tiêu chuẩn VietGAP. 15 năm kinh nghiệm trồng vải thiều và cam đường Canh đồi dốc.',
  joinedDate: '2023-03-15',
  verified: true,
  farmCode: 'HG-VG-084',
};

const DEFAULT_DEMO_ACCOUNTS: UserProfile[] = [
  DEFAULT_USER,
  {
    id: 'usr-2',
    fullName: 'ThS. Trần Thị Loan',
    email: 'loan.tran@bvtv.lucngan.gov.vn',
    phone: '0912345678',
    role: 'engineer',
    roleTitle: 'Kỹ sư nông nghiệp BVTV',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    farmName: 'Trạm Khuyến nông & BVTV Thanh Hải',
    location: 'Xã Thanh Hải, Lục Ngạn (cũ)',
    totalAreaHa: 20.0,
    crops: ['Vải thiều GlobalGAP', 'Cam Canh', 'Bưởi da xanh'],
    bio: 'Kỹ sư Trồng trọt & BVTV phụ trách hướng dẫn mã số vùng trồng xuất khẩu sang Nhật Bản & Hoa Kỳ.',
    joinedDate: '2022-08-10',
    verified: true,
    farmCode: 'TH-ENG-012',
  },
  {
    id: 'usr-3',
    fullName: 'Bác Hoàng Văn Thắng',
    email: 'thang.hoang@htxquyson.vn',
    phone: '0977889900',
    role: 'farmer',
    roleTitle: 'Giám đốc HTX Nông nghiệp',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    farmName: 'HTX Cây ăn quả Quý Sơn',
    location: 'Xã Quý Sơn, Lục Ngạn (cũ)',
    totalAreaHa: 12.5,
    crops: ['Bưởi ngọt Quý Sơn', 'Bưởi Diễn', 'Cam đường Canh'],
    bio: 'Chủ nhiệm Hợp tác xã Bưởi ngọt Quý Sơn với hơn 35 xã viên liên kết vùng trồng bưởi đặc sản.',
    joinedDate: '2021-11-20',
    verified: true,
    farmCode: 'QS-HTX-005',
  },
  {
    id: 'usr-4',
    fullName: 'Lê Văn Hòa',
    email: 'hoa.le@nongsanhoaphat.com',
    phone: '0903456789',
    role: 'farmer',
    roleTitle: 'Chủ vườn đồi Phì Điền',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    farmName: 'Vườn đồi Táo & Ổi Hòa Phát',
    location: 'Xã Phì Điền, Lục Ngạn (cũ)',
    totalAreaHa: 4.2,
    crops: ['Táo xuân Đài Loan giàn lưới', 'Ổi lê giòn ngọt'],
    bio: 'Mô hình tiên phong làm giàn nhà lưới chắn côn trùng cho Táo Đài Loan và bao trái ổi lê đồi dốc.',
    joinedDate: '2023-05-18',
    verified: true,
    farmCode: 'PD-FRM-022',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('nongnghiep_auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.fullName === 'Nguyễn Văn An' || parsed.id === 'usr-1')) {
          const updated = { ...parsed, fullName: 'Lương Thị Khánh Chi' };
          localStorage.setItem('nongnghiep_auth_user', JSON.stringify(updated));
          return updated;
        }
        return parsed;
      }
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('nongnghiep_auth_token') || 'jwt_token_usr-1_default';
    } catch {
      return 'jwt_token_usr-1_default';
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<UserProfile[]>(DEFAULT_DEMO_ACCOUNTS);

  // Load demo accounts list from API
  useEffect(() => {
    fetch('/api/auth/demo-accounts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Normalize any legacy cached accounts
          const normalized = data.map((acc) =>
            acc.id === 'usr-1' || acc.fullName === 'Nguyễn Văn An'
              ? { ...acc, fullName: 'Lương Thị Khánh Chi' }
              : acc
          );
          setDemoAccounts(normalized);
        }
      })
      .catch((err) => {
        console.warn('Cannot fetch demo accounts:', err);
      });
  }, []);

  // Sync state to LocalStorage
  const saveSession = (user: UserProfile | null, sessionToken: string | null) => {
    setCurrentUser(user);
    setToken(sessionToken);
    try {
      if (user) {
        localStorage.setItem('nongnghiep_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('nongnghiep_auth_user');
      }
      if (sessionToken) {
        localStorage.setItem('nongnghiep_auth_token', sessionToken);
      } else {
        localStorage.removeItem('nongnghiep_auth_token');
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const login = async (username: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: password || '123' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Đăng nhập thất bại', data.error || 'Vui lòng kiểm tra lại thông tin.');
        return { success: false, error: data.error };
      }

      saveSession(data.user, data.token);
      toast.success('Đăng nhập thành công!', `Chào mừng ${data.user.fullName} (${data.user.roleTitle})`);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      toast.error('Lỗi kết nối', err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    role?: 'farmer' | 'engineer' | 'officer' | 'trader';
    farmName?: string;
    location?: string;
    totalAreaHa?: number;
    crops?: string[];
    bio?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Đăng ký thất bại', data.error || 'Không thể tạo tài khoản.');
        return { success: false, error: data.error };
      }

      saveSession(data.user, data.token);
      toast.success('Đăng ký tài khoản thành công!', `Chào mừng ${data.user.fullName} gia nhập Nông nghiệp số.`);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      toast.error('Lỗi đăng ký', err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!currentUser) return { success: false, error: 'Chưa đăng nhập' };
    setIsLoading(true);
    try {
      const payload = { ...currentUser, ...updated };
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Cập nhật thất bại', data.error);
        return { success: false, error: data.error };
      }

      saveSession(data.user, token);
      toast.success('Đã lưu hồ sơ cá nhân!', 'Thông tin nông trại của bạn đã được đồng bộ.');
      setIsProfileModalOpen(false);
      return { success: true };
    } catch (err: any) {
      toast.error('Lỗi khi lưu hồ sơ', err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoAccount = async (userId: string) => {
    return (await login(userId, '123')).success;
  };

  const logout = () => {
    saveSession(null, null);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    toast.info('Đã đăng xuất tài khoản.', 'Bạn hiện đang xem hệ thống ở chế độ Khách tham quan.');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser,
        isLoading,
        isAuthModalOpen,
        isProfileModalOpen,
        demoAccounts,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false),
        login,
        register,
        updateProfile,
        logout,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

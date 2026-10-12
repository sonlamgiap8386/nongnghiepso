export interface FarmParcel {
  id: string;
  name: string;
  cropType: 'Vải thiều' | 'Cam đường canh' | 'Táo' | 'Ổi' | 'Bưởi da xanh' | 'Bưởi Diễn' | 'Nhà kính' | 'Mặt nước' | string;
  area: number; // in hectares
  plantedDate: string;
  growthStage: string;
  soilMoisture: number; // percentage
  temperature: number; // Celsius
  ph: number;
  healthScore: number; // 0 - 100
  needsAttention: boolean;
  attentionReason?: string;
  color: string;
  threeCoordinates: { x: number; z: number; width: number; depth: number };
}

export interface TaskItem {
  id: string;
  title: string;
  type: 'Tưới nước' | 'Bón phân' | 'Phun thuốc' | 'Kiểm tra' | 'Thu hoạch' | 'Khác';
  zoneId: string;
  zoneName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  recurrence: 'Không lặp lại' | 'Hằng ngày' | 'Hằng tuần' | 'Cách ngày';
  broadcastSpeaker: boolean;
  sendGmail: boolean;
  gmailAddress?: string;
  notes?: string;
  completed: boolean;
  statusText?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: 'Rau củ' | 'Trái cây' | 'Gạo' | 'Đặc sản';
  price: number;
  unit: string;
  stockKg: number;
  location: string;
  farmerName: string;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  isMyProduct?: boolean;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorLocation: string;
  authorAvatar?: string;
  timeAgo: string;
  content: string;
  tags: string[];
  image?: string;
  images?: string[];
  likes: number;
  liked?: boolean;
  commentsCount: number;
  saved?: boolean;
  category: 'Bảng tin' | 'Hỏi đáp' | 'Kinh nghiệm';
  comments?: Array<{
    id: string;
    author: string;
    time: string;
    text: string;
  }>;
}

export interface WeatherData {
  locationName: string;
  temp: number;
  condition: string;
  highTemp: number;
  lowTemp: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  rainVolumeMm: number;
  sunrise: string;
  sunset: string;
  advisory: string;
  hourlyForecast: Array<{ time: string; temp: number; humidity: number }>;
  dailyForecast: Array<{
    day: string;
    date: string;
    tempHigh: number;
    tempLow: number;
    rainChance: number;
    condition: string;
  }>;
}

export interface DiagnosisResult {
  diseaseName: string;
  scientificName?: string;
  cropType: string;
  confidence: number;
  severityLevel: string;
  symptoms: string[];
  causes: string;
  regimen: {
    immediateAction: string;
    chemicalTreatment: {
      activeIngredients: string;
      dosage: string;
      safetyInterval: string;
    };
    biologicalTreatment: string;
    prevention: string[];
    followUpSchedule: string;
  };
}

export type UserRole = 'farmer' | 'engineer' | 'officer' | 'trader';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  farmName: string;
  location: string;
  totalAreaHa: number;
  crops: string[];
  bio?: string;
  joinedDate: string;
  verified: boolean;
  farmCode?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

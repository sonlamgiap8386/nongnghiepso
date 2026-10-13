import React, { useState } from 'react';
import { ProductItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Star,
  CheckCircle,
  Truck,
  Phone,
  MessageCircle,
  X,
  Trash2,
  Send,
  ShieldCheck,
  ChevronDown,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MarketplaceViewProps {
  products: ProductItem[];
  onAddProduct: (product: ProductItem) => void;
  onUpdateProduct: (product: ProductItem) => void;
  searchQuery?: string;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  products: initialProducts,
  onAddProduct,
  searchQuery: propSearchQuery = '',
}) => {
  const toast = useToast();
  const { currentUser } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = propSearchQuery || internalSearchQuery;
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  const effectiveProducts = initialProducts && initialProducts.length > 0 ? initialProducts : [
    {
      id: 'p-1',
      name: 'Vải thiều Lục Ngạn (chính vụ)',
      price: 38000,
      unit: 'kg',
      category: 'Trái cây',
      description: 'Vải thiều Lục Ngạn chính gốc quả đỏ au, cùi dày hạt nhỏ ngọt lịm thơm nức, đạt chuẩn xuất khẩu & VietGAP.',
      location: 'TDP Hồng Giang, Lục Ngạn (cũ)',
      farmerName: 'Lương Thị Khánh Chi (Nông trại Thung Lũng Xanh)',
      rating: 5.0,
      reviewCount: 48,
      image: 'nongnghiepso/src/assets/images/vai_thieu_chu_1791794876673.jpg',
      isMyProduct: true,
    },
    {
      id: 'p-camvinh',
      name: 'Cam Vinh lòng vàng mọng nước',
      price: 42000,
      unit: 'kg',
      category: 'Trái cây',
      description: 'Cam Vinh vỏ mỏng, tép vàng ươm mọng nước, vị ngọt thanh mát đậm đà thơm ngát, thu hái tươi tại vườn đồi.',
      location: 'Xã Thanh Hải, Lục Ngạn (cũ)',
      farmerName: 'Trần Thị Loan',
      rating: 5.0,
      reviewCount: 32,
      image: '/src/assets/images/cam_duong_canh_1791794891255.jpg',
      isMyProduct: false,
    },
    {
      id: 'p-2',
      name: 'Cam đường canh đồi dốc VietGAP',
      price: 55000,
      unit: 'kg',
      category: 'Trái cây',
      description: 'Cam đường canh quả đỏ au, vỏ mỏng dính, tép mọng ngọt đậm đà tan trong miệng, chuẩn chất đất đồi Hồng Giang.',
      location: 'TDP Hồng Giang, Lục Ngạn (cũ)',
      farmerName: 'Lương Thị Khánh Chi',
      rating: 5.0,
      reviewCount: 36,
      image: '/src/assets/images/cam_duong_canh_1791794891255.jpg',
      isMyProduct: true,
    },
    {
      id: 'p-3',
      name: 'Bưởi Diễn cây cổ thụ Quý Sơn',
      price: 35000,
      unit: 'quả',
      category: 'Trái cây',
      description: 'Bưởi Diễn Quý Sơn cây cổ thụ trên 15 năm tuổi, vỏ mỏng vàng ươm, róc tép, ngọt sắc không the đắng.',
      location: 'Quý Sơn, Lục Ngạn (cũ)',
      farmerName: 'Bác Hoàng Văn Thắng',
      rating: 5.0,
      reviewCount: 42,
      image: '/src/assets/images/buoi_dien_chu_1791794953100.jpg',
      isMyProduct: false,
    },
    {
      id: 'p-4',
      name: 'Bưởi da xanh ruột hồng Thanh Hải',
      price: 32000,
      unit: 'kg',
      category: 'Trái cây',
      description: 'Bưởi da xanh Thanh Hải tép hồng đều, ngọt thanh mát mọng nước, vỏ mỏng dính thu hái tại vườn đồi ven hồ.',
      location: 'Thanh Hải, Lục Ngạn (cũ)',
      farmerName: 'Trần Thị Loan',
      rating: 5.0,
      reviewCount: 28,
      image: '/src/assets/images/buoi_dien_chu_1791794953100.jpg',
      isMyProduct: false,
    },
    {
      id: 'p-5',
      name: 'Táo lê Đài Loan giàn lưới Phì Điền',
      price: 28000,
      unit: 'kg',
      category: 'Trái cây',
      description: 'Táo lê quả to đều, thịt trắng ngần giòn tan nhiều nước, trồng trong giàn màn lưới chắn côn trùng tại đồi cao Phì Điền.',
      location: 'Phì Điền, Lục Ngạn (cũ)',
      farmerName: 'Lê Văn Hòa',
      rating: 5.0,
      reviewCount: 35,
      image: '/src/assets/images/tao_xuan_dailoan_1791794902514.jpg',
      isMyProduct: false,
    },
    {
      id: 'p-6',
      name: 'Ổi lê giòn ngọt bọc túi xốp Hồng Giang',
      price: 18000,
      unit: 'kg',
      category: 'Trái cây',
      description: 'Ổi lê bọc túi xốp từ nhỏ, da sáng bóng, giòn ngọt ít hạt, thu hái tươi mới mỗi buổi sáng tại TDP Hồng Giang.',
      location: 'TDP Hồng Giang, Lục Ngạn (cũ)',
      farmerName: 'Lương Thị Khánh Chi',
      rating: 5.0,
      reviewCount: 45,
      image: '/src/assets/images/oi_le_chu_1791794939350.jpg',
      isMyProduct: true,
    },
  ];

  const [cartProduct, setCartProduct] = useState(effectiveProducts[0]);
  const [orderQuantity, setOrderQuantity] = useState<number>(5);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [orderNotes, setOrderNotes] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);

  // New post form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Rau củ' | 'Trái cây' | 'Gạo' | 'Đặc sản'>('Trái cây');
  const [formPrice, setFormPrice] = useState(35000);
  const [formLocation, setFormLocation] = useState('TDP Hồng Giang, Lục Ngạn (cũ)');
  const [formDescription, setFormDescription] = useState('Nông sản tươi ngon đạt chuẩn VietGAP');

  const categories = ['Tất cả', 'Trái cây', 'Đặc sản', 'Rau củ', 'Gạo'];

  // Filter products
  const displayProducts = effectiveProducts.filter((p) => {
    const matchCat = selectedCategory === 'Tất cả' || p.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSendOrder = () => {
    if (!cartProduct) return;
    toast.success(
      'Đã gửi yêu cầu đặt hàng thành công!',
      `Đặt ${orderQuantity} kg ${cartProduct.name} (${(orderQuantity * cartProduct.price).toLocaleString('vi-VN')} đ). Nông hộ sẽ liên hệ sớm.`
    );
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    setOrderNotes('');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      name: formName,
      category: formCategory,
      price: Number(formPrice),
      unit: 'kg',
      stockKg: 100,
      location: formLocation || (currentUser ? currentUser.location : 'Lục Ngạn (cũ)'),
      farmerName: currentUser ? `${currentUser.fullName} (${currentUser.farmName})` : 'Lương Thị Khánh Chi',
      rating: 5.0,
      reviewCount: 1,
      description: formDescription,
      image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80',
      isMyProduct: true,
    };
    onAddProduct(newProd);
    toast.success('Đã đăng nông sản lên sạp thành công!', `${formName} - ${formPrice.toLocaleString('vi-VN')} đ/kg`);
    setShowPostModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner Matching Demo Screenshot 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-black tracking-tight text-slate-900">
            Sạp nông sản trực tiếp
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Nông sản sạch từ người nông dân, đến trực tiếp tay người tiêu dùng
          </p>
        </div>

        {/* Right Badge Matching Demo */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#ecfdf5] border border-emerald-200/80 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 leading-tight">
              Giao dịch trực tiếp với nông hộ
            </div>
            <div className="text-[11px] text-emerald-800 font-medium leading-tight mt-0.5">
              Nông sản thật - Người thật - Giá trị thật
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Action Bar Matching Demo 2 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative w-52 md:w-60">
            <input
              type="text"
              value={internalSearchQuery}
              onChange={(e) => setInternalSearchQuery(e.target.value)}
              placeholder="Tìm nông sản..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#0f5132] text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Right dropdowns & Post Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => toast.info('Bộ lọc nâng cao theo tiêu chuẩn VietGAP/Hữu cơ')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Bộ lọc</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white">
            <span>Sắp xếp: Mới nhất</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
          </div>

          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0f5132] hover:bg-[#0d4731] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Đăng bán</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Products (8 cols) & Order Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Product Cards (8 cols) - 3 cols per row */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {displayProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image Container with 'Tươi mới' Badge */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold shadow-xs backdrop-blur-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    <span>Tươi mới</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#0f5132] transition-colors">
                      {prod.name}
                    </h3>
                    <div className="text-sm font-black text-[#0f5132] mt-0.5">
                      {prod.price.toLocaleString('vi-VN')} đ/kg
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {prod.description}
                    </p>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{prod.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold truncate">{prod.farmerName}</span>
                      <div className="flex items-center gap-0.5 text-amber-500 text-[10px] shrink-0">
                        <span>★★★★★</span>
                        <span className="text-slate-400">({prod.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Liên hệ mua Button */}
                  <button
                    onClick={() => {
                      setCartProduct(prod);
                      toast.info(`Đã chọn mua ${prod.name}`, 'Bạn có thể chỉnh số lượng bên bảng yêu cầu.');
                    }}
                    className="w-full py-2 rounded-xl border border-emerald-600/40 hover:bg-emerald-50/60 text-[#0f5132] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Liên hệ mua</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Order Panel Matching Image 2 (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            {/* Header: Cart Icon + Yêu cầu mua hàng + Trash Icon */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <span>Yêu cầu mua hàng</span>
              </div>
              <button
                onClick={() => {
                  setOrderQuantity(1);
                  toast.info('Đã làm mới yêu cầu');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Xóa lựa chọn"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Product Card */}
            {cartProduct && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <img
                  src={cartProduct.image}
                  alt={cartProduct.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {cartProduct.name}
                  </div>
                  <div className="text-xs font-black text-[#0f5132] mt-0.5">
                    {cartProduct.price.toLocaleString('vi-VN')} đ/kg
                  </div>
                </div>
                <button
                  onClick={() => toast.info('Sản phẩm mặc định')}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quantity Selector: Số lượng: – 5 + kg */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Số lượng
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-sm font-bold cursor-pointer transition-colors"
                  >
                    –
                  </button>
                  <span className="w-12 text-center text-xs font-black text-slate-900">
                    {orderQuantity}
                  </span>
                  <button
                    onClick={() => setOrderQuantity(orderQuantity + 1)}
                    className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-sm font-bold cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-semibold">kg</span>
              </div>
            </div>

            {/* Hình thức nhận hàng (2 radio options matching demo 2) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hình thức nhận hàng
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'pickup'}
                    onChange={() => setDeliveryMethod('pickup')}
                    className="mt-0.5 text-[#0f5132] focus:ring-[#0f5132]"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">Nhận tại nông hộ</div>
                    <div className="text-[11px] text-slate-500">
                      Đến trực tiếp địa chỉ nông hộ
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === 'delivery'}
                    onChange={() => setDeliveryMethod('delivery')}
                    className="mt-0.5 text-[#0f5132] focus:ring-[#0f5132]"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">Giao tận nơi</div>
                    <div className="text-[11px] text-slate-500">
                      Nông hộ sẽ liên hệ xác nhận phí vận chuyển
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Ghi chú (tùy chọn) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Ví dụ: Liên hệ trước khi giao, giao vào buổi sáng..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
              />
            </div>

            {/* Gửi yêu cầu Button */}
            <button
              onClick={handleSendOrder}
              className="w-full py-2.5 rounded-xl bg-[#0f5132] hover:bg-[#0d4731] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi yêu cầu</span>
            </button>

            {/* Bottom Security Guarantee Matching Image 2 */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Giao dịch trực tiếp với nông hộ
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Không qua trung gian, minh bạch, an toàn
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Đăng bán nông sản */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Đăng bán nông sản mới</h2>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên nông sản *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ví dụ: Vải thiều chính vụ Chũ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Danh mục</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Trái cây">Trái cây</option>
                    <option value="Rau củ">Rau củ</option>
                    <option value="Gạo">Gạo</option>
                    <option value="Đặc sản">Đặc sản</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giá bán (đ/kg)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ / Vùng trồng</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả chất lượng</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0f5132] text-white text-xs font-bold hover:bg-[#0d4731]"
                >
                  Xác nhận đăng bán
                </button>
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

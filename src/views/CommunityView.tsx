import React, { useState } from 'react';
import { CommunityPost } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  Users,
  Image as ImageIcon,
  Video,
  Send,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Plus,
  FileText,
  HelpCircle,
  Lightbulb,
  UserCheck,
  ChevronRight,
  MoreHorizontal,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CommunityViewProps {
  posts: CommunityPost[];
  onAddPost: (post: CommunityPost) => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  searchQuery?: string;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  onAddPost,
  onToggleLike,
  onToggleSave,
  onAddComment,
}) => {
  const toast = useToast();
  const { currentUser } = useAuth();

  const [activeNav, setActiveNav] = useState<'feed' | 'qa' | 'tips' | 'groups'>('feed');
  const [newPostText, setNewPostText] = useState('');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Popular tags focusing on regional specialty fruits
  const popularTags = [
    { tag: '# vải thiều', count: '1.2K' },
    { tag: '# cam đường canh', count: '856' },
    { tag: '# cam vinh', count: '742' },
    { tag: '# bưởi diễn', count: '521' },
    { tag: '# bưởi da xanh', count: '498' },
    { tag: '# táo lê đài loan', count: '430' },
    { tag: '# ổi lê', count: '398' },
    { tag: '# kỹ thuật canh tác', count: '356' },
  ];

  // Exact experts from demo Image 3
  const experts = [
    {
      id: 'e1',
      name: 'TS. Lê Minh Tuấn',
      title: 'Chuyên gia cây trồng',
      org: 'ĐH Nông nghiệp Hà Nội',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 'e2',
      name: 'ThS. Phạm Thị Lan',
      title: 'Chuyên gia bảo vệ thực vật',
      org: 'Viện BVTV',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 'e3',
      name: 'KS. Trần Quốc Dũng',
      title: 'Chuyên gia nông nghiệp số',
      org: 'Trung tâm Khuyến nông',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 'e4',
      name: 'PGS. Nguyễn Văn Hòa',
      title: 'Chuyên gia chăn nuôi',
      org: 'ĐH Nông Lâm TP.HCM',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    },
  ];

  // Hot topics focusing on regional specialty fruit crops
  const hotTopics = [
    { rank: 1, title: 'Kỹ thuật khoanh cành hãm lộc Vải thiều', count: '328 bài viết' },
    { rank: 2, title: 'Bón thúc Kali cho Cam đường Canh vào đường', count: '287 bài viết' },
    { rank: 3, title: 'Bao trái chống ruồi vàng Bưởi Diễn & Ổi', count: '265 bài viết' },
    { rank: 4, title: 'Giá thu mua Vải thiều & Cam Canh hôm nay', count: '198 bài viết' },
    { rank: 5, title: 'Ứng dụng tưới nhỏ giọt cho cây ăn quả đồi dốc', count: '176 bài viết' },
  ];

  // Feed posts for community focusing on regional fruits
  const initialDemoPosts: CommunityPost[] = [
    {
      id: 'demo-post-1',
      authorName: 'Trần Văn Hùng',
      authorLocation: 'TDP Hồng Giang, Lục Ngạn (cũ)',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      timeAgo: '2 giờ trước',
      content:
        'Vườn Vải thiều chính vụ và Cam Canh nhà tôi phát triển rất đều sau khi bón phân hữu cơ vi sinh. Chia sẻ để bà con cùng tham khảo!',
      tags: ['#vảithiều', '#camđườngcanh', '#kỹthuậtcanhtác'],
      image: '/src/assets/images/vai_thieu_chu_1791794876673.jpg',
      images: [
        '/src/assets/images/vai_thieu_chu_1791794876673.jpg',
        '/src/assets/images/cam_duong_canh_1791794891255.jpg',
      ],
      likes: 56,
      commentsCount: 12,
      category: 'Kinh nghiệm',
    },
    {
      id: 'demo-post-2',
      authorName: 'Nguyễn Thị Mai',
      authorLocation: 'Quý Sơn, Lục Ngạn (cũ)',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      timeAgo: '5 giờ trước',
      content:
        'Bưởi Diễn và Bưởi da xanh năm nay quả rất đều, vỏ căng mọng. Nhờ bao trái và xử lý vi lượng đúng quy trình nên ruồi vàng không gây hại!',
      tags: ['#bưởidiễn', '#bưởidaxanh', '#kinhnghiệm'],
      image: '/src/assets/images/buoi_dien_chu_1791794953100.jpg',
      images: [
        '/src/assets/images/buoi_dien_chu_1791794953100.jpg',
        '/src/assets/images/tao_xuan_dailoan_1791794902514.jpg',
      ],
      likes: 24,
      commentsCount: 18,
      category: 'Kinh nghiệm',
    },
  ];

  const allPosts = [...posts.filter((p) => !p.id.startsWith('demo-')), ...initialDemoPosts];

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: currentUser ? currentUser.fullName : 'Lương Thị Khánh Chi',
      authorLocation: currentUser ? `${currentUser.location}` : 'TDP Hồng Giang, Lục Ngạn (cũ)',
      authorAvatar: currentUser?.avatar,
      timeAgo: 'Vừa xong',
      content: newPostText,
      tags: ['#nông nghiệp', '#nhà nông'],
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      likes: 1,
      liked: true,
      commentsCount: 0,
      saved: false,
      category: 'Kinh nghiệm',
      comments: [],
    };

    onAddPost(newPost);
    toast.success('Đã đăng bài viết lên cộng đồng!', 'Cảm ơn bà con đã chia sẻ kinh nghiệm.');
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 } });
    setNewPostText('');
  };

  const toggleFollow = (id: string, name: string) => {
    const next = !followingMap[id];
    setFollowingMap({ ...followingMap, [id]: next });
    if (next) {
      toast.success(`Đã theo dõi ${name}`);
    } else {
      toast.info(`Đã bỏ theo dõi ${name}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner Matching Demo Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-black tracking-tight text-slate-900">
            Cộng đồng nhà nông
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Chia sẻ kinh nghiệm, hỏi đáp, cùng nhau phát triển nền nông nghiệp Việt Nam
          </p>
        </div>

        <button
          onClick={() => setShowJoinModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#0f5132] hover:bg-[#0d4731] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tham gia nhóm</span>
        </button>
      </div>

      {/* 3-Column Layout Matching Demo Screenshot 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Khám phá & Chủ đề phổ biến (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Card: Khám phá */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <h2 className="text-xs font-black text-slate-900 pb-1">Khám phá</h2>
            <div className="space-y-1">
              <button
                onClick={() => setActiveNav('feed')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                  activeNav === 'feed'
                    ? 'bg-[#e6f4ea] text-[#0f5132]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Bảng tin</span>
              </button>

              <button
                onClick={() => setActiveNav('qa')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                  activeNav === 'qa'
                    ? 'bg-[#e6f4ea] text-[#0f5132]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Hỏi đáp</span>
              </button>

              <button
                onClick={() => setActiveNav('tips')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                  activeNav === 'tips'
                    ? 'bg-[#e6f4ea] text-[#0f5132]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-slate-400" />
                <span>Kinh nghiệm</span>
              </button>

              <button
                onClick={() => setActiveNav('groups')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                  activeNav === 'groups'
                    ? 'bg-[#e6f4ea] text-[#0f5132]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 text-slate-400" />
                <span>Nhóm của tôi</span>
              </button>
            </div>
          </div>

          {/* Card: Chủ đề phổ biến */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h2 className="text-xs font-black text-slate-900">Chủ đề phổ biến</h2>
            <div className="space-y-2 text-xs">
              {popularTags.map((t) => (
                <div
                  key={t.tag}
                  onClick={() => toast.info(`Lọc theo thẻ ${t.tag}`)}
                  className="flex items-center justify-between text-slate-700 hover:text-[#0f5132] transition-colors cursor-pointer py-0.5"
                >
                  <span className="font-semibold">{t.tag}</span>
                  <span className="text-[11px] text-slate-400 font-medium">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Feed (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Create Post Card Matching Demo Screenshot 3 */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                }
                alt="User"
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
              />
              <input
                type="text"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Chia sẻ kinh nghiệm hoặc đặt câu hỏi..."
                className="w-full px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => toast.info('Đã mở tải ảnh lên')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Ảnh</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Đã mở tải video lên')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  <Video className="w-4 h-4 text-emerald-600" />
                  <span>Video</span>
                </button>
              </div>

              <button
                onClick={handleCreatePost}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0f5132] hover:bg-[#0d4731] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Đăng bài</span>
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {allPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        post.authorAvatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                      }
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="text-xs font-black text-slate-900 leading-tight">
                        {post.authorName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                        {post.authorLocation} • {post.timeAgo}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toast.info('Tùy chọn bài viết')}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-800 leading-relaxed font-normal">
                  {post.content}
                </p>

                {/* Hashtags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-[#e6f4ea] text-[#0f5132] text-[10px] font-bold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Images matching 2-image layout in Demo 3 with authentic fruit images */}
                {post.image && (
                  <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden aspect-16/9 bg-slate-100">
                    <img
                      src={post.images?.[0] || post.image}
                      alt="Ảnh nông sản 1"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <img
                      src={post.images?.[1] || '/src/assets/images/cam_duong_canh_1791794891255.jpg'}
                      alt="Ảnh nông sản 2"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Action Bar: Like, Comment, Save matching Demo 3 */}
                <div className="flex items-center gap-6 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-500">
                  <button
                    onClick={() => onToggleLike(post.id)}
                    className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <ThumbsUp
                      className={`w-4 h-4 ${post.liked ? 'text-emerald-600 fill-emerald-600' : ''}`}
                    />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    onClick={() => {
                      const comment = prompt('Nhập bình luận của bạn:');
                      if (comment) onAddComment(post.id, comment);
                    }}
                    className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentsCount || 0} bình luận</span>
                  </button>

                  <button
                    onClick={() => onToggleSave(post.id)}
                    className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors cursor-pointer ml-auto"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${post.saved ? 'text-amber-500 fill-amber-500' : ''}`}
                    />
                    <span>Lưu</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Chuyên gia nổi bật & Chủ đề đang quan tâm (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Card: Chuyên gia nổi bật */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-900">Chuyên gia nổi bật</h2>
              <span
                onClick={() => toast.info('Xem toàn bộ danh sách chuyên gia')}
                className="text-[11px] text-slate-400 hover:text-emerald-700 cursor-pointer font-medium"
              >
                Xem tất cả
              </span>
            </div>

            <div className="space-y-3">
              {experts.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={exp.avatar}
                      alt={exp.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate">
                        {exp.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{exp.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{exp.org}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFollow(exp.id, exp.name)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors shrink-0 cursor-pointer ${
                      followingMap[exp.id]
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {followingMap[exp.id] ? 'Đã theo dõi' : 'Theo dõi'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Chủ đề đang quan tâm (Numbered 1 -> 5) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-900">Chủ đề đang quan tâm</h2>
              <span
                onClick={() => toast.info('Xem tất cả các chủ đề')}
                className="text-[11px] text-slate-400 hover:text-emerald-700 cursor-pointer font-medium"
              >
                Xem tất cả
              </span>
            </div>

            <div className="space-y-3">
              {hotTopics.map((topic) => (
                <div
                  key={topic.rank}
                  onClick={() => toast.info(`Tìm kiếm chủ đề: ${topic.title}`)}
                  className="flex items-start gap-2.5 cursor-pointer group"
                >
                  <div className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-[#e6f4ea] group-hover:text-[#0f5132] text-slate-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                    {topic.rank}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-[#0f5132] transition-colors leading-tight">
                      {topic.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {topic.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Tham gia nhóm cộng đồng Matching Demo 3 */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#e6f4ea] text-[#0f5132] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 leading-tight">
                  Tham gia nhóm cộng đồng
                </h3>
                <p className="text-[11px] text-slate-500 leading-tight mt-1">
                  Tham gia các nhóm theo cây trồng, vật nuôi và khu vực của bạn để trao đổi sâu hơn.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full py-2 rounded-xl bg-[#0f5132] hover:bg-[#0d4731] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Tìm nhóm phù hợp</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Tham gia nhóm */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Các nhóm nhà nông đề xuất</h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Hội Làm Vườn Cây Ăn Quả Hồng Giang</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">1.8K thành viên • Bắc Giang cũ</div>
                </div>
                <button
                  onClick={() => {
                    toast.success('Đã gửi yêu cầu tham gia');
                    setShowJoinModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0f5132] text-white font-bold text-xs"
                >
                  Tham gia
                </button>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">CLB Vải Thiều Xuất Khẩu Thanh Hải</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">1.4K thành viên • GlobalGAP</div>
                </div>
                <button
                  onClick={() => {
                    toast.success('Đã gửi yêu cầu tham gia');
                    setShowJoinModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0f5132] text-white font-bold text-xs"
                >
                  Tham gia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

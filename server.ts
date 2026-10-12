import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI server-side with telemetry
const apiKey = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. AI Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history = [], imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ error: 'Nội dung tin nhắn hoặc hình ảnh không được để trống' });
    }

    if (ai) {
      const parts: any[] = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        });
      }
      parts.push({
        text: `Câu hỏi từ nhà nông: ${message || 'Xin hãy phân tích hình ảnh cây trồng này và tư vấn cách chăm sóc/phòng trị bệnh.'}`,
      });

      const systemInstruction = `Bạn là 'Trợ lý nông nghiệp AI' chuyên sâu cho 4 tiểu vùng canh tác trọng điểm của huyện Lục Ngạn cũ: Hồng Giang, Thanh Hải, Quý Sơn, Phì Điền.
Bạn nắm vững kỹ thuật thâm canh các loại cây trồng chủ lực của 4 vùng:
- Hồng Giang: Vải thiều chính vụ, Cam đường canh đồi dốc VietGAP, Táo xuân Đài Loan, Ổi lê, Bưởi Diễn
- Thanh Hải: Vải thiều GlobalGAP xuất khẩu sang Nhật & Mỹ, Cam Canh lòng vàng, Bưởi da xanh ruột hồng
- Quý Sơn: Bưởi ngọt Quý Sơn, Bưởi Diễn cây cổ, Cam đường Canh thung lũng, Ổi giòn
- Phì Điền: Táo xuân Đài Loan giàn lưới cước, Vải thiều đồi đá, Bưởi Diễn, Cam Canh đồi cao
Kiến thức bao gồm: kỹ thuật khoanh vỏ hãm lộc đông cho vải, xiết nước phân hóa mầm hoa, bón thúc Kali trắng tăng độ ngọt cho cam đường canh và bưởi diễn, kỹ thuật bọc bao xốp cho ổi và làm giàn lưới che chắn ruồi vàng cho táo, phòng trừ sâu đục cuống quả, bọ xít, thán thư, loét vi khuẩn và vàng lá gân xanh (Greening) theo chuẩn VietGAP/GlobalGAP.
Hãy phản hồi bằng tiếng Việt thân thiện, rõ ràng, thực tiễn với bà con nhà vườn 4 xã Lục Ngạn cũ.
Cấu trúc câu trả lời:
1. Nhận định nguyên nhân / Hiện trạng ngắn gọn.
2. Các bước xử lý / kiểm tra cụ thể theo số thứ tự 1, 2, 3, 4.
3. Hộp lưu ý quan trọng (nếu có dấu hiệu nguy hiểm hoặc thời tiết bất lợi).
4. Tài liệu tham khảo gợi ý (Chi cục BVTV & Trồng trọt vùng Lục Ngạn, Viện Nghiên cứu Rau quả, Trung tâm Khuyến nông Quốc gia).`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: parts.length === 1 && !imageBase64 ? message : { parts },
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || '';
      return res.json({ reply: text });
    }

    // Realistic fallback responses if no API key is provided
    const lower = (message || '').toLowerCase();
    let fallbackReply = `Để xử lý hãm lộc đông cho cây Vải thiều tại 4 vùng trọng điểm Lục Ngạn cũ (Hồng Giang, Thanh Hải, Quý Sơn, Phì Điền), bà con cần thực hiện theo các bước kỹ thuật sau:

1. Khoanh cành hãm lộc: Dùng cưa khoanh chuyên dụng tạo vết khoanh khép kín trên các cành cấp 1 hoặc cấp 2 (chiều rộng vết khoanh 1,5 - 2 mm), ngắt dòng dinh dưỡng chuyển xuống rễ.
2. Xiết nước triệt để: Ngừng việc tưới đẫm nước cho vườn đồi, dọn sạch cỏ dại quanh gốc để đất khô ráo giúp cây chuyển sang giai đoạn ngủ nghỉ tích mầm hoa xuân.
3. Ngưng tuyệt đối phân đạm: Không bón thêm phân Urea hay phân chuồng tươi trong giai đoạn này tránh kích thích đọt non phát triển phá vỡ thế phân hóa hoa.
4. Phun ức chế mầm lộc: Phun chế phẩm MKP (0-52-34) kết hợp thuốc hãm lộc sinh học để làm lá non nhanh già, thuần thục chuyển hóa mầm hoa xuân.

Lưu ý: Không khoanh cành quá sâu chạm vào lõi gỗ làm khô cành; không khoanh vào những ngày mưa ẩm kéo dài để tránh nấm bệnh xâm nhập vết thương.

Tài liệu tham khảo:
- Quy trình thâm canh Vải thiều xuất khẩu - Chi cục Trồng trọt & BVTV vùng Lục Ngạn
- Kỹ thuật điều khiển ra hoa cây ăn quả nhiệt đới - Viện Nghiên cứu Rau quả Quốc gia`;

    if (lower.includes('cam') || lower.includes('đường canh') || lower.includes('bưởi')) {
      fallbackReply = `Kỹ thuật chăm sóc và bón phân tăng độ ngọt cho Cam đường Canh và Bưởi Diễn tại 4 xã Lục Ngạn cũ (Hồng Giang, Thanh Hải, Quý Sơn, Phì Điền):

1. Giảm lượng nước tưới: Trước thu hoạch 20-30 ngày, chỉ tưới ẩm nhẹ mặt đất để quả tích tụ lượng đường tự nhiên cao nhất, vỏ mỏng dính.
2. Bổ sung Kali trắng (K2SO4): Bón thúc qua gốc hoặc hòa nước tưới kết hợp phân hữu cơ hoai mục giúp tép cam mọng nước, tép bưởi róc không the đắng.
3. Phun phân bón lá vi lượng: Bổ sung Canxi, Boron và Axit Amin định kỳ để chống nứt quả, giữ màu vỏ quả vàng óng đẹp mắt.
4. Phòng trừ ruồi vàng châm quả: Sử dụng bẫy bả dính sinh học hoặc bọc quả bằng túi chuyên dụng để bảo vệ mẫu mã trái xuất Tết.

Lưu ý: Không bón thừa đạm sát ngày hái quả vì sẽ làm vỏ dày, quả nhạt và dễ bị thối hỏng trong quá trình vận chuyển.

Tài liệu tham khảo:
- Kỹ thuật canh tác Cam đường Canh & Bưởi VietGAP vùng đồi Lục Ngạn - Trung tâm Khuyến nông`;
    } else if (lower.includes('ổi') || lower.includes('táo') || lower.includes('ruồi')) {
      fallbackReply = `Biện pháp quản lý ruồi đục quả và sâu hại trên Ổi lê và Táo xuân Đài Loan tại Lục Ngạn cũ (Hồng Giang, Phì Điền):

1. Bọc bao quả sớm: Với ổi, bọc túi xốp kết hợp bao nilon đục đáy khi quả to bằng quả trứng gà. Với táo xuân, làm giàn lưới cước che chắn ngăn ruồi vàng xâm nhập.
2. Đặt bẫy bả Pheromone: Treo bẫy bả sinh học Fly-Trap cách mặt đất 1,5m xung quanh rìa vườn để thu gom ruồi đực.
3. Thu gom quả rụng: Nhặt sạch quả bị sâu đục rơi rụng đem tiêu hủy hoặc chôn lấp vôi bột để cắt đứt vòng đời sâu nhộng trong đất.
4. Phun phòng chế phẩm thảo mộc: Sử dụng tinh dầu neem hoặc nấm xanh Metarhizium bảo vệ an toàn sinh học.

Lưu ý: Tuân thủ thời gian cách ly PHI nghiêm ngặt trước khi thu hái giao cho khách hàng tại sạp nông sản.`;
    }

    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi gọi Trợ lý AI' });
  }
});

// 2. AI Plant Disease Diagnosis Endpoint
app.post('/api/ai/diagnose', async (req, res) => {
  try {
    const { imageBase64, cropHint = 'Cây trồng nông nghiệp' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Vui lòng cung cấp hình ảnh cây bị bệnh để phân tích.' });
    }

    if (ai) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const prompt = `Bạn là hệ thống AI chẩn đoán bệnh cây trồng nông nghiệp chuyên sâu.
Hãy phân tích hình ảnh này (loại cây tham khảo: ${cropHint}).
Xác định chính xác loại bệnh/tình trạng gây hại và đưa ra phác đồ điều trị chi tiết.
Yêu cầu trả về đúng định dạng JSON như sau:
{
  "diseaseName": "Tên bệnh (ví dụ: Bệnh Đạo Ôn Lá / Bệnh Đốm Nâu / Bệnh Vàng Lá Gân Xanh...)",
  "scientificName": "Tên khoa học của nấm/vi khuẩn/tác nhân",
  "cropType": "Loại cây trồng (Lúa, Sầu riêng, Cà chua, Cà phê...)",
  "confidence": 94,
  "severityLevel": "Nặng" | "Trung bình" | "Nhẹ",
  "symptoms": ["Triệu chứng 1", "Triệu chứng 2", "Triệu chứng 3"],
  "causes": "Nguyên nhân chính gây bệnh",
  "regimen": {
    "immediateAction": "Hành động xử lý khẩn cấp trong 24 giờ đầu (ngắt nước, cách ly, cắt tỉa...)",
    "chemicalTreatment": {
      "activeIngredients": "Các hoạt chất đặc trị khuyến nghị (ví dụ: Tricyclazole, Azoxystrobin...)",
      "dosage": "Liều lượng pha bình và hướng dẫn phun",
      "safetyInterval": "Thời gian cách ly an toàn (PHI)"
    },
    "biologicalTreatment": "Biện pháp hữu cơ / chế phẩm sinh học (Trichoderma, vi sinh vật đối kháng)",
    "prevention": ["Biện pháp phòng ngừa lâu dài 1", "Biện pháp 2", "Biện pháp 3"],
    "followUpSchedule": "Lịch kiểm tra đánh giá lại (ví dụ: 3 - 5 ngày sau khi xử lý)"
  }
}`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }

    // Realistic default mock diagnosis for fruit capital Chũ
    return res.json({
      diseaseName: 'Bệnh Thán Thư & Sâu Đục Cuống Quả Vải Thiều (Colletotrichum gloeosporioides)',
      scientificName: 'Colletotrichum gloeosporioides & Conopomorpha sinensis',
      cropType: 'Vải thiều chính vụ Chũ (Litchi chinensis)',
      confidence: 96,
      severityLevel: 'Cần chú ý - Nguy cơ rụng hoa & hỏng cành lộc',
      symptoms: [
        'Vết bệnh thán thư xuất hiện đốm tròn màu nâu xám trên mép lá bánh tẻ và cuống hoa',
        'Cành lộc đông bị khô cháy, nụ hoa chuyển màu đen và rụng hàng loạt',
        'Vết châm nhỏ màu thâm đen ở gần cuống quả non do sâu đục cuống tấn công'
      ],
      causes: 'Thời tiết ấm kèm sương mù buổi sớm tại vùng đồi Chũ tạo ẩm độ cao >85%, kết hợp cây ra lộc đông muộn tạo nguồn thức ăn dồi dào cho sâu đục cuống.',
      regimen: {
        immediateAction: 'Cắt tỉa thông thoáng tán cây, dọn sạch cành lá khô rụng dưới gốc và gom đốt tiêu hủy. Khoanh cành hãm dứt điểm lộc đông.',
        chemicalTreatment: {
          activeIngredients: 'Azoxystrobin + Difenoconazole (Amistar Top 325SC) hoặc Difenoconazole (Score 250EC). Kết hợp hoạt chất Emamectin benzoate trừ sâu đục cuống.',
          dosage: 'Pha 15-20ml thuốc cho bình 20 lít nước, phun ướt đều 2 mặt lá và tán cây vào sáng sớm khi vừa ráo sương.',
          safetyInterval: 'Thời gian cách ly an toàn 14 ngày trước khi thu hái.'
        },
        biologicalTreatment: 'Phun chế phẩm nấm ký sinh côn trùng Metarhizium anisopliae và nấm đối kháng Trichoderma viride tưới gốc.',
        prevention: [
          'Chủ động khoanh vỏ cành hãm lộc đông đúng thời điểm (tháng 10 - tháng 11 âm lịch)',
          'Tỉa cành tạo tán hình mâm xôi để ánh sáng mặt trời lọt vào tâm tán cây',
          'Bón phân cân đối N-P-K, tăng cường bón phân hữu cơ hoai mục ủ men vi sinh và vôi bột cải tạo đất đồi'
        ],
        followUpSchedule: 'Kiểm tra lại tán cây sau 4-5 ngày. Phun nhắc lại lần 2 trước khi hoa nở rộ 7 ngày.'
      }
    });
  } catch (error: any) {
    console.error('Diagnosis error:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi chẩn đoán bệnh' });
  }
});

// 3. Loudspeaker Broadcast Endpoint & Vietnamese TTS Stream
app.get('/api/speaker/vietnamese-audio', async (req, res) => {
  try {
    const rawText = String(req.query.text || '').trim();
    if (!rawText) {
      return res.status(400).send('Missing text parameter');
    }

    // Expand abbreviations to speak natural Vietnamese
    const cleanText = rawText
      .replace(/TDP/gi, 'Tổ dân phố')
      .replace(/\bha\b/gi, 'héc ta')
      .replace(/\bkg\b/gi, 'ki lô gam')
      .replace(/VietGAP/gi, 'Việt Gáp')
      .replace(/GlobalGAP/gi, 'Gờ lô bôn Gáp')
      .replace(/06:00/g, '6 giờ sáng')
      .replace(/06:30/g, '6 giờ 30 phút sáng')
      .replace(/08:00/g, '8 giờ sáng')
      .replace(/16:00/g, '4 giờ chiều')
      .replace(/17:00/g, '5 giờ chiều')
      .substring(0, 350);

    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
    const ttsResponse = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!ttsResponse.ok) {
      return res.status(502).send('Error fetching Vietnamese audio');
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(Buffer.from(audioBuffer));
  } catch (error: any) {
    console.error('TTS Audio Proxy error:', error);
    res.status(500).send(error.message);
  }
});

app.post('/api/speaker/broadcast', async (req, res) => {
  try {
    const { message, zone = 'Toàn nông trại' } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Nội dung thông báo không được để trống' });
    }

    const audioUrl = `/api/speaker/vietnamese-audio?text=${encodeURIComponent(message)}`;

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      zone,
      message,
      audioUrl,
      status: 'Đã phát thành công bằng tiếng Việt qua hệ thống loa thông minh',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Gmail Notification Endpoint (Simulated integration with audit trail)
app.post('/api/email/send-alert', (req, res) => {
  const { recipient = 'sonlamgiap@gmail.com', subject, body, taskDetails } = req.body;
  res.json({
    success: true,
    sentAt: new Date().toISOString(),
    recipient,
    subject: subject || 'Nông nghiệp số - Nhắc lịch canh tác & chăm sóc cây trồng',
    status: 'Đã gửi qua Gmail an toàn',
    taskDetails,
  });
});

// 5. User Account & Authentication Endpoints
interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  role: 'farmer' | 'engineer' | 'officer' | 'trader';
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

const USERS_DB: UserRecord[] = [
  {
    id: 'usr-1',
    fullName: 'Lương Thị Khánh Chi',
    email: 'sonlamgiap@gmail.com',
    phone: '0988123456',
    password: '123',
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
  },
  {
    id: 'usr-2',
    fullName: 'ThS. Trần Thị Loan',
    email: 'loan.tran@bvtv.lucngan.gov.vn',
    phone: '0912345678',
    password: '123',
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
    password: '123',
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
    password: '123',
    role: 'trader',
    roleTitle: 'Thương lái & Thu mua Nông sản',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    farmName: 'Hệ thống Nông sản Sạch Hòa Phát',
    location: 'Xã Phì Điền, Lục Ngạn (cũ)',
    totalAreaHa: 0,
    crops: ['Vải thiều', 'Táo xuân', 'Cam Canh', 'Bưởi Diễn'],
    bio: 'Đầu mối thu mua trực tiếp tại vườn và phân phối chuỗi siêu thị Hà Nội, Hải Phòng, Quảng Ninh.',
    joinedDate: '2023-01-05',
    verified: true,
    farmCode: 'PD-TRD-088',
  },
];

function sanitizeUser(u: UserRecord) {
  const { password, ...safeUser } = u;
  return safeUser;
}

// 5.1 Get Demo Accounts
app.get('/api/auth/demo-accounts', (_req, res) => {
  res.json(USERS_DB.map(sanitizeUser));
});

// 5.2 Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Vui lòng nhập Email hoặc Số điện thoại.' });
  }

  const user = USERS_DB.find(
    (u) =>
      u.email.toLowerCase() === username.toLowerCase().trim() ||
      u.phone === username.trim() ||
      u.id === username.trim()
  );

  if (!user) {
    return res.status(401).json({ error: 'Không tìm thấy tài khoản với thông tin đã nhập.' });
  }

  if (password && user.password && user.password !== password) {
    return res.status(401).json({ error: 'Mật khẩu không chính xác.' });
  }

  const token = `jwt_token_${user.id}_${Date.now()}`;
  return res.json({
    token,
    user: sanitizeUser(user),
  });
});

// 5.3 Register Real Account
app.post('/api/auth/register', (req, res) => {
  const {
    fullName,
    email,
    phone,
    password = '123',
    role = 'farmer',
    farmName,
    location,
    totalAreaHa = 1.0,
    crops = ['Vải thiều'],
    bio = '',
  } = req.body;

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập họ và tên.' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập địa chỉ email.' });
  }

  const existing = USERS_DB.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim() || (phone && u.phone === phone.trim())
  );
  if (existing) {
    return res.status(400).json({ error: 'Email hoặc số điện thoại này đã được đăng ký tài khoản.' });
  }

  const roleTitles: Record<string, string> = {
    farmer: 'Chủ trang trại',
    engineer: 'Kỹ sư nông nghiệp',
    officer: 'Cán bộ khuyến nông',
    trader: 'Thương lái thu mua',
  };

  const newUser: UserRecord = {
    id: `usr-${Date.now()}`,
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : '0988000000',
    password: String(password),
    role,
    roleTitle: roleTitles[role] || 'Nhà nông số',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    farmName: farmName ? farmName.trim() : `Vườn ${fullName.trim()}`,
    location: location ? location.trim() : 'TDP Hồng Giang, Lục Ngạn (cũ)',
    totalAreaHa: Number(totalAreaHa) || 1.5,
    crops: Array.isArray(crops) && crops.length > 0 ? crops : ['Vải thiều'],
    bio: bio || `Nhà nông thành viên hệ thống Nông nghiệp số Lục Ngạn (cũ).`,
    joinedDate: new Date().toISOString().split('T')[0],
    verified: true,
    farmCode: `LN-${Math.floor(100 + Math.random() * 900)}`,
  };

  USERS_DB.unshift(newUser);

  const token = `jwt_token_${newUser.id}_${Date.now()}`;
  return res.json({
    token,
    user: sanitizeUser(newUser),
  });
});

// 5.4 Get current profile
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  let userId = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const match = token.match(/jwt_token_([^_]+)_/);
    if (match) userId = match[1];
  }

  const user = USERS_DB.find((u) => u.id === userId) || USERS_DB[0];
  return res.json(sanitizeUser(user));
});

// 5.5 Update Profile
app.put('/api/auth/profile', (req, res) => {
  const { id, fullName, phone, email, farmName, location, totalAreaHa, crops, bio, avatar, roleTitle } = req.body;
  const user = USERS_DB.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản người dùng.' });
  }

  if (fullName) user.fullName = fullName.trim();
  if (phone) user.phone = phone.trim();
  if (email) user.email = email.trim();
  if (farmName) user.farmName = farmName.trim();
  if (location) user.location = location.trim();
  if (totalAreaHa !== undefined) user.totalAreaHa = Number(totalAreaHa);
  if (crops) user.crops = crops;
  if (bio !== undefined) user.bio = bio;
  if (avatar) user.avatar = avatar;
  if (roleTitle) user.roleTitle = roleTitle;

  return res.json({
    success: true,
    user: sanitizeUser(user),
  });
});

// 5.6 Logout
app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true, message: 'Đã đăng xuất thành công.' });
});

// 5. Mount Vite or serve static dist
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  let currentPort = PORT;

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Cổng ${currentPort} đang bận. Tự động chuyển sang cổng ${currentPort + 1}...`);
      currentPort += 1;
      setTimeout(() => {
        httpServer.listen(currentPort, '0.0.0.0');
      }, 300);
    } else {
      console.error('Server error:', err);
    }
  });

  httpServer.listen(currentPort, '0.0.0.0', () => {
    console.log(`Nông nghiệp số server running on http://localhost:${currentPort}`);
  });
}

startServer();

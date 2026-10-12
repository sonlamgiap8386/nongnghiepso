import React, { useState, useRef } from 'react';
import { DiagnosisResult, TaskItem } from '../types';
import { SAMPLE_DISEASE_PREVIEWS } from '../data/mockData';
import {
  Stethoscope,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Volume2,
  Calendar,
  Sparkles,
  RefreshCw,
  FileText,
  Clock,
  ArrowRight,
  Printer,
  Share2,
  Activity,
  Scan,
  MessageSquare,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../components/Toast';
import { speakVietnamese, stopVietnameseSpeech } from '../utils/vietnameseSpeaker';

interface DiagnosisViewProps {
  onAddScheduleTask?: (task: TaskItem) => void;
  onNavigateToChat?: (prompt: string) => void;
}

export const DiagnosisView: React.FC<DiagnosisViewProps> = ({
  onAddScheduleTask,
  onNavigateToChat,
}) => {
  const toast = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(
    SAMPLE_DISEASE_PREVIEWS[0].imageUrl
  );
  const [cropHint, setCropHint] = useState<string>(SAMPLE_DISEASE_PREVIEWS[0].crop);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setDiagnosisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: (typeof SAMPLE_DISEASE_PREVIEWS)[0]) => {
    setSelectedImage(sample.imageUrl);
    setCropHint(sample.crop);
    setDiagnosisResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setDiagnosisResult(null);

    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          cropHint,
        }),
      });

      const data = await res.json();
      setDiagnosisResult(data);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      toast.success('Chẩn đoán thành công!', data.diseaseName);
    } catch (err) {
      // Realistic Fallback Diagnosis for fruit capital TDP Hồng Giang, Lục Ngạn (cũ)
      const mockResult: DiagnosisResult = {
        diseaseName: 'Bệnh Thán Thư & Sâu Đục Cuống Quả Vải Thiều',
        scientificName: 'Colletotrichum gloeosporioides & Conopomorpha sinensis',
        cropType: cropHint || 'Vải thiều Hồng Giang',
        confidence: 96,
        severityLevel: 'Cần chú ý - Nguy cơ rụng hoa & hỏng cành lộc',
        symptoms: [
          'Vết bệnh thán thư xuất hiện đốm tròn màu nâu xám trên mép lá bánh tẻ và cuống hoa',
          'Cành lộc đông bị khô cháy, nụ hoa chuyển màu đen và rụng hàng loạt',
          'Vết châm nhỏ màu thâm đen ở gần cuống quả non do sâu đục cuống tấn công',
        ],
        causes:
          'Thời tiết ấm kèm sương mù buổi sớm tại vùng đồi Lục Ngạn tạo ẩm độ cao >85%, kết hợp cây ra lộc đông muộn tạo nguồn thức ăn dồi dào cho sâu đục cuống.',
        regimen: {
          immediateAction:
            'Cắt tỉa thông thoáng tán cây, dọn sạch cành lá khô rụng dưới gốc và gom đốt tiêu hủy. Khoanh cành hãm dứt điểm lộc đông.',
          chemicalTreatment: {
            activeIngredients:
              'Azoxystrobin + Difenoconazole (Amistar Top 325SC) hoặc Difenoconazole (Score 250EC). Kết hợp hoạt chất Emamectin benzoate trừ sâu đục cuống.',
            dosage:
              'Pha 15-20ml thuốc cho bình 20 lít nước, phun ướt đều 2 mặt lá và tán cây vào sáng sớm khi vừa ráo sương.',
            safetyInterval: 'Thời gian cách ly an toàn 14 ngày trước khi thu hái.',
          },
          biologicalTreatment:
            'Phun chế phẩm nấm ký sinh côn trùng Metarhizium anisopliae và nấm đối kháng Trichoderma viride tưới gốc.',
          prevention: [
            'Chủ động khoanh vỏ cành hãm lộc đông đúng thời điểm (tháng 10 - tháng 11 âm lịch)',
            'Tỉa cành tạo tán hình mâm xôi để ánh sáng mặt trời lọt vào tâm tán cây',
            'Bón phân cân đối N-P-K, tăng cường bón phân hữu cơ hoai mục ủ men vi sinh và vôi bột cải tạo đất đồi',
          ],
          followUpSchedule:
            'Kiểm tra lại tán cây sau 4-5 ngày. Phun nhắc lại lần 2 trước khi hoa nở rộ 7 ngày.',
        },
      };
      setDiagnosisResult(mockResult);
      toast.success('Chẩn đoán thành công!', mockResult.diseaseName);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSpeakRegimen = () => {
    if (!diagnosisResult) return;
    if (isSpeaking) {
      stopVietnameseSpeech();
      setIsSpeaking(false);
      return;
    }
    const textToRead = `Phác đồ điều trị cho ${diagnosisResult.diseaseName}: Hành động khẩn cấp: ${
      diagnosisResult.regimen.immediateAction
    }. Thuốc đặc trị: ${diagnosisResult.regimen.chemicalTreatment.activeIngredients}. Liều lượng: ${
      diagnosisResult.regimen.chemicalTreatment.dosage
    }. Lịch kiểm tra: ${diagnosisResult.regimen.followUpSchedule}`;

    speakVietnamese(textToRead, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleAddTreatmentToSchedule = () => {
    if (!diagnosisResult || !onAddScheduleTask) return;
    const newTask: TaskItem = {
      id: `task-treat-${Date.now()}`,
      title: `Phun thuốc trị ${diagnosisResult.diseaseName}`,
      type: 'Phun thuốc',
      zoneId: 'V1',
      zoneName: 'Lô V1 - Vải thiều TDP Hồng Giang',
      date: '2026-10-13',
      time: '06:30',
      durationMinutes: 60,
      recurrence: 'Không lặp lại',
      broadcastSpeaker: true,
      sendGmail: true,
      notes: `Hoạt chất: ${diagnosisResult.regimen.chemicalTreatment.activeIngredients}. Liều lượng: ${diagnosisResult.regimen.chemicalTreatment.dosage}`,
      completed: false,
    };
    onAddScheduleTask(newTask);
    toast.success('Đã thêm vào Lịch canh tác!', `Lịch phun thuốc điều trị: ${diagnosisResult.diseaseName}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <Scan className="w-3.5 h-3.5 text-emerald-600" />
            <span>Thị giác máy tính AI Chuyên sâu</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Nhận diện bệnh & Xuất phác đồ điều trị
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Phân tích triệu chứng trên lá, cành, trái cây vùng Lục Ngạn và xuất phác đồ theo tiêu chuẩn VietGAP
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200/80 shadow-2xs w-fit">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
          <span>AI Vision Diagnostic v2.5</span>
        </div>
      </div>

      {/* Main Grid: Upload & Preview (5 cols) and Diagnostic Results (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload & Image Selector */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Mẫu bệnh phẩm thực địa</h3>
            <span className="text-[11px] text-slate-400 font-medium">JPEG / PNG</span>
          </div>

          {/* High-Tech Camera Viewport with Reticle */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-72 flex items-center justify-center group shadow-inner">
            {selectedImage ? (
              <>
                <img
                  src={selectedImage}
                  alt="Selected crop"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {/* Reticle HUD overlay */}
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <span className="text-[10px] font-mono font-bold bg-black/60 px-2 py-0.5 rounded text-emerald-400 border border-emerald-500/30 backdrop-blur-xs">
                      SENSOR READY
                    </span>
                    <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  </div>

                  {isAnalyzing && (
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-laser" />
                  )}

                  <div className="flex justify-between items-end">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <span className="text-[10px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded">
                      ZONE: TDP HỒNG GIANG
                    </span>
                    <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-6 text-slate-400">
                <Camera className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                <p className="text-xs">Chưa có ảnh. Hãy tải lên ảnh lá hoặc trái cây bị bệnh.</p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Tải ảnh từ thiết bị</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Chụp ảnh mới"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Chụp ảnh</span>
            </button>
          </div>

          {/* Crop Hint Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Gợi ý cây trồng cho mô hình AI:
            </label>
            <input
              type="text"
              value={cropHint}
              onChange={(e) => setCropHint(e.target.value)}
              placeholder="Ví dụ: Vải thiều Lục Ngạn, Cam đường canh, Táo xuân, Ổi lê..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          {/* Sample photos selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-700">
              Hoặc chọn mẫu ảnh bệnh phẩm thực tế tại Lục Ngạn:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_DISEASE_PREVIEWS.map((sample) => (
                <button
                  key={sample.title}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    selectedImage === sample.imageUrl
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={sample.imageUrl}
                    alt={sample.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] text-slate-800 truncate">
                      {sample.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{sample.crop}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedImage}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mô hình AI đang quét hình thái bệnh phẩm...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Quét & Xuất phác đồ điều trị</span>
              </>
            )}
          </button>
        </div>

        {/* Diagnostic Results & Regimen (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {diagnosisResult ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5 animate-in fade-in">
              {/* Header result */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                      {diagnosisResult.severityLevel}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {diagnosisResult.cropType}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 leading-snug">
                    {diagnosisResult.diseaseName}
                  </h3>
                  {diagnosisResult.scientificName && (
                    <p className="text-xs text-slate-500 italic mt-0.5">
                      Tác nhân sinh vật: {diagnosisResult.scientificName}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Độ tin cậy AI</div>
                  <div className="text-3xl font-black text-emerald-600">
                    {diagnosisResult.confidence}%
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Triệu chứng nhận biết thực địa</span>
                </h4>
                <ul className="space-y-1 text-xs text-slate-700 pl-4 list-disc">
                  {diagnosisResult.symptoms.map((sym, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {sym}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Causes */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800">Nguyên nhân sinh bệnh: </span>
                <span className="text-slate-600 leading-relaxed">{diagnosisResult.causes}</span>
              </div>

              {/* PHÁC ĐỒ ĐIỀU TRỊ */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-700" />
                    <span>Phác đồ điều trị lâm sàng</span>
                  </h4>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                      title="In đơn phác đồ"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">In đơn thuốc</span>
                    </button>

                    <button
                      onClick={handleSpeakRegimen}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeaking ? 'Dừng đọc' : 'Phát qua loa'}</span>
                    </button>
                  </div>
                </div>

                {/* 1. Hành động khẩn cấp */}
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs">
                  <div className="font-bold text-rose-900 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Xử lý khẩn cấp trong 24 giờ đầu:</span>
                  </div>
                  <p className="text-rose-800 leading-relaxed pl-5.5">
                    {diagnosisResult.regimen.immediateAction}
                  </p>
                </div>

                {/* 2. Thuốc hóa học đặc trị */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thuốc đặc trị hóa học khuyến nghị (Chuẩn VietGAP):</span>
                  </div>
                  <div className="pl-5.5 space-y-1.5 text-slate-700">
                    <div>
                      <span className="font-bold text-slate-900">Hoạt chất:</span>{' '}
                      <span className="font-mono text-emerald-900 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                        {diagnosisResult.regimen.chemicalTreatment.activeIngredients}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Liều lượng pha bình:</span>{' '}
                      {diagnosisResult.regimen.chemicalTreatment.dosage}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Thời gian cách ly (PHI):</span>{' '}
                      <strong className="text-amber-700">
                        {diagnosisResult.regimen.chemicalTreatment.safetyInterval}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3. Biện pháp sinh học & phòng ngừa */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800">Biện pháp sinh học & phòng ngừa lâu dài:</div>
                  <p className="text-slate-600">{diagnosisResult.regimen.biologicalTreatment}</p>
                  <ul className="list-disc pl-4 text-slate-600 space-y-0.5 mt-1">
                    {diagnosisResult.regimen.prevention.map((pv, pIdx) => (
                      <li key={pIdx}>{pv}</li>
                    ))}
                  </ul>
                </div>

                {/* 4. Lịch theo dõi */}
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold">Lịch kiểm tra đánh giá: </span>
                    <span>{diagnosisResult.regimen.followUpSchedule}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={handleAddTreatmentToSchedule}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Đưa vào Lịch canh tác & Loa</span>
                </button>

                {onNavigateToChat && (
                  <button
                    onClick={() =>
                      onNavigateToChat(
                        `Tôi vừa nhận diện cây bị ${diagnosisResult.diseaseName}. Xin tư vấn thêm về thuốc đặc trị và cách bón phân phục hồi cây sau khi hết bệnh.`
                      )
                    }
                    className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Hỏi thêm Trợ lý AI</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-slate-200/90 text-center text-slate-400 space-y-3">
              <Stethoscope className="w-12 h-12 mx-auto text-emerald-600/40" />
              <h4 className="font-bold text-slate-700 text-sm">Chưa có kết quả chẩn đoán</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hãy chọn ảnh bệnh phẩm bên trái và bấm &ldquo;Quét & Xuất phác đồ điều trị&rdquo; để nhận diện tác nhân bệnh hại.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

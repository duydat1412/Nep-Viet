export interface GeminiModelOption {
  id: string;
  name: string;
  badge: string;
  desc: string;
  isDefault?: boolean;
}

export const AVAILABLE_GEMINI_MODELS: GeminiModelOption[] = [
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    badge: "Khuyên Dùng (Ổn Định)",
    desc: "Cực nhanh, quota dồi dào, phản hồi chuẩn xác cho cổ phục",
    isDefault: true,
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    badge: "Mới Nhất (Tối Tân)",
    desc: "Mô hình Flash mới nhất từ Google AI, suy luận ngữ cảnh xuất sắc",
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    badge: "Siêu Nhẹ (Tiết Kiệm Quota)",
    desc: "Tốc độ xử lý siêu tốc, tải nhẹ, phù hợp bóc tách hàng loạt",
  },
  {
    id: "gemini-flash-lite-latest",
    name: "Gemini Flash Lite Latest",
    badge: "Dự Phòng Cao Tốc",
    desc: "Luôn trỏ về bản Lite mới nhất, giảm tối đa lỗi 429",
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    badge: "Tư Duy Nâng Cao",
    desc: "Phân tích tỉ mỉ (Free tier giới hạn 20 yêu cầu/ngày)",
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    badge: "Bản Tiêu Chuẩn",
    desc: "Mô hình tiền nhiệm (có thể gặp 429 nếu hết hạn mức ngày)",
  },
];

export const FALLBACK_MODEL_CHAIN = [
  "gemini-3.6-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
];

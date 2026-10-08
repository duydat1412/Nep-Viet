import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini/client';

export const maxDuration = 15;

const INTERPRET_SYSTEM_PROMPT = `Bạn là "Nếp", trợ lý giám tuyển cổ phục Việt Nam đương đại.
Nhiệm vụ: Người dùng vừa tự tay phối một bộ trang phục (gồm Áo, Quần, Giày và tùy chọn Phụ kiện).
Hãy viết lời nhận xét trang nhã, đúng mực về bộ phối này:
1. "ly_do_phoi_do": Lời bình thẩm mỹ về sự kết hợp giữa các món đồ (tối đa 40 từ).
2. "dien_giai_van_hoa": Diễn giải ý nghĩa văn hóa, lịch sử và giá trị di sản của trang phục đối với dịp mặc đã chọn (tối đa 45 từ).
Yêu cầu: Giọng văn trang trọng, gợi mở tinh thần tôn vinh bản sắc Việt Nam.`;

const INTERPRET_SCHEMA = {
  type: "object",
  properties: {
    ly_do_phoi_do: { type: "string" },
    dien_giai_van_hoa: { type: "string" },
  },
  required: ["ly_do_phoi_do", "dien_giai_van_hoa"],
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { occasion, items, harmony, rules } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing outfit items" }, { status: 400 });
    }

    const itemNames = items.map((i: any) => `${i.slot}: ${i.name_vi} (${i.material || ''})`).join(', ');
    const userPrompt = `DỊP MẶC: ${occasion || 'di_le'}
CÁC MÓN PHỐI: ${itemNames}
ĐIỂM MÀU SẮC: ${harmony?.score || 9.0}/10 (${harmony?.label || 'Hài hòa'})
MỨC VĂN HÓA: ${rules?.level || 'XANH'}`;

    try {
      const result = await callGemini(INTERPRET_SYSTEM_PROMPT, userPrompt, INTERPRET_SCHEMA);
      return NextResponse.json({
        success: true,
        ly_do_phoi_do: result.ly_do_phoi_do,
        dien_giai_van_hoa: result.dien_giai_van_hoa,
      });
    } catch (aiErr: any) {
      console.warn("AI interpretation failed, using graceful fallback:", aiErr.message);
      // Graceful fallback from item lore
      const topItem = items.find((i: any) => i.slot === 'top') || items[0];
      return NextResponse.json({
        success: true,
        ly_do_phoi_do: `Bộ phối kết hợp nhịp nhàng giữa ${topItem.name_vi} và các thành phần phụ kiện tạo nên tổng thể trang nhã, đạt ${harmony?.score || 9.2} điểm hài hòa màu sắc.`,
        dien_giai_van_hoa: topItem.craftsmanship_lore || `Phom dáng lưu giữ phong vị truyền thống Việt Nam, thích ứng linh hoạt và đoan trang cho dịp ${occasion || 'lễ nghi'}.`,
        is_fallback: true,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Lỗi xử lý" }, { status: 500 });
  }
}

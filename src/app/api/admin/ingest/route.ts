import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini/client';

export const maxDuration = 20;

const INGEST_SYSTEM_PROMPT = `Bạn là Trợ lý Giám tuyển Di sản Nếp Việt (AI Heritage Ingestion Agent).
Nhiệm vụ: Phân tích bài viết hoặc thông tin mô tả sản phẩm Việt phục thô, chuẩn hóa thành dữ liệu có cấu trúc cho hệ sinh thái Nếp Việt.
Quy tắc:
1. Xác định đúng nhóm trang phục (group: ao_ngu_than, ao_dai, ao_tac, ao_tu_than, ao_nhat_binh, phu_kien) và vị trí mặc (slot: top, bottom, outer, footwear, bag, jewelry).
2. Ước lượng mã màu HEX đại diện cho sản phẩm (ví dụ: xanh chàm #26466D, trắng ngà #F8F9FA, đỏ son #B5362B...).
3. Bóc tách thông tin giá bán (buy_price) và giá thuê (rental_price) tính bằng VNĐ nếu có trong bài, hoặc ước tính khoảng giá hợp lý cho cổ phục Việt Nam.
4. Viết đoạn lore văn hóa ngắn (1-2 câu) trang trọng, nêu bật giá trị di sản và kỹ thuật dệt may.`;

const INGEST_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string" },
    slot: { type: "string", enum: ["top", "bottom", "outer", "headwear", "footwear", "bag", "jewelry"] },
    group: { type: "string", enum: ["ao_ngu_than", "ao_dai", "ao_tac", "ao_tu_than", "ao_nhat_binh", "phu_kien"] },
    name_vi: { type: "string" },
    gender: { type: "string", enum: ["nam", "nu", "unisex"] },
    colors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          hex: { type: "string" }
        },
        required: ["name", "hex"]
      }
    },
    formality: { type: "number" },
    occasions: {
      type: "array",
      items: { type: "string", enum: ["tet", "ky_yeu", "dao_pho", "di_le", "bieu_dien"] }
    },
    style_levels: {
      type: "array",
      items: { type: "string", enum: ["truyen_thong", "cach_tan_nhe", "phoi_hien_dai"] }
    },
    tags: { type: "array", items: { type: "string" } },
    brand: {
      type: "object",
      properties: {
        name: { type: "string" },
        location: { type: "string" },
        url: { type: "string" },
        contact: { type: "string" }
      },
      required: ["name"]
    },
    pricing: {
      type: "object",
      properties: {
        buy_price: { type: "number" },
        rental_price: { type: "number" },
        currency: { type: "string" }
      }
    },
    material: { type: "string" },
    craftsmanship_lore: { type: "string" },
    image_url: { type: "string" }
  },
  required: ["id", "slot", "group", "name_vi", "gender", "colors", "formality", "occasions", "style_levels", "brand", "material"]
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, content, image_url } = body;

    if (!url && !content) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp URL bài viết hoặc đoạn văn bản mô tả sản phẩm' },
        { status: 400 }
      );
    }

    let rawText = content || '';

    // Nếu người dùng cung cấp URL, thử cào nội dung text cơ bản
    if (url && !content) {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NepVietAgent/1.0)' } });
        if (res.ok) {
          const html = await res.text();
          // Lược bỏ HTML tags để lấy văn bản thuần
          rawText = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .slice(0, 4000);
        }
      } catch (fetchErr) {
        console.warn('Không thể fetch trực tiếp URL, sử dụng URL làm gợi ý ngữ cảnh:', fetchErr);
        rawText = `Thông tin sản phẩm từ liên kết: ${url}`;
      }
    }

    const userPrompt = `DỮ LIỆU ĐẦU VÀO ĐỂ BÓC TÁCH:
- Nguồn / URL: ${url || 'Không có'}
- Ảnh sản phẩm: ${image_url || 'Chưa cung cấp'}
- Nội dung mô tả / bài đăng:
${rawText || 'Hãy tạo một sản phẩm mẫu theo thông tin từ URL.'}`;

    // Gọi Gemini trích xuất có cấu trúc
    const extractedItem = await callGemini(INGEST_SYSTEM_PROMPT, userPrompt, INGEST_RESPONSE_SCHEMA);

    return NextResponse.json({
      success: true,
      extracted_item: {
        ...extractedItem,
        asset: image_url || extractedItem.image_url || '/assets/items/ao_ngu_than_nam_xanh_01.png',
        source_ids: ['N1'],
        status: 'draft'
      }
    });
  } catch (error: any) {
    console.error('Lỗi Ingest API:', error);
    return NextResponse.json(
      { error: 'Không thể trích xuất dữ liệu sản phẩm', message: error.message },
      { status: 500 }
    );
  }
}

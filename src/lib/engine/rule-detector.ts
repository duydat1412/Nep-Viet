import rulesData from '@/../data/cultural_rules.json';
import { getSlotName } from '@/lib/constants/sources';

export interface OffendingItemDetail {
  id: string;
  name: string;
  slot: string;
  slotLabel: string;
  reason: string;
  asset?: string;
  image_url?: string;
}

export interface RuleInsight {
  ruleId: string;
  title: string;
  cleanMessage: string;
  level: string;
  offendingItems: OffendingItemDetail[];
  affectedSlots: string[];
  suggestedAction: string;
}

// Bảng tra cứu quy tắc văn hóa gốc
const ruleMap = new Map<string, any>(
  ((rulesData as any)?.rules || []).map((r: any) => [r.id, r])
);

/**
 * Xóa bỏ mã quy tắc kỹ thuật (như R_DILE_03, A_FORMAL_01) khỏi chuỗi hiển thị
 */
export function sanitizeRuleMessage(rawMessage?: string): string {
  if (!rawMessage) return "Quy tắc văn hóa cần lưu ý khi phối trang phục.";
  return rawMessage
    .replace(/\s*\([Ll]uật\s+[A-Za-z0-9_]+\)/g, "")
    .replace(/\s*\([A-Za-z0-9_]+\)/g, "")
    .replace(/^R_[A-Za-z0-9_]+:\s*/g, "")
    .replace(/^A_[A-Za-z0-9_]+:\s*/g, "")
    .trim();
}

/**
 * Gợi ý giải pháp điều chỉnh thân thiện cho từng quy tắc văn hóa
 */
function getActionSuggestion(ruleId: string): string {
  switch (ruleId) {
    case "R_DILE_03":
      return "Nên đổi sang Guốc mộc hoặc Hài truyền thống, và tháo bớt túi tote đường phố khi chiêm bái chốn thờ tự trang nghiêm.";
    case "R_DILE_01":
      return "Nên đổi sang trang phục cổ truyền kín đáo, dài qua gối và che kín vai khi vào nơi tôn nghiêm.";
    case "R_DILE_02":
      return "Nên ưu tiên áo ngũ thân hoặc áo dài tay kín, tránh chất liệu vải quá mỏng hoặc xuyên thấu khi đi lễ.";
    case "R_TRON_01":
      return "Áo ngũ thân và áo tấc truyền thống nên phối cùng quần lụa ống suông thay vì chân váy cách tân.";
    case "R_MAU_01":
      return "Sắc vàng chính hoàng theo điển chế dành riêng cho vua chúa; bạn có thể chọn sắc xanh chàm, lam, tía hoặc bạch.";
    case "R_MAU_02":
      return "Họa tiết rồng 5 móng thuộc về hoàng đế; nên chọn hoa văn tứ thời, hoa sen, bát bửu hoặc mây nước trang nhã.";
    case "R_MAU_03":
      return "Đầu năm Tết cổ truyền nên thêm điểm nhấn màu sắc tươi sáng (đỏ, vàng, xanh) thay vì trang phục thuần trắng/đen.";
    case "A_FORMAL_01":
      return "Cân nhắc chọn lại phụ kiện hoặc y phục để có cùng mức độ trang trọng, tạo tổng thể hài hòa.";
    default:
      return "Cân nhắc thay đổi các món đồ được đánh dấu để trang phục chuẩn mực và đoan chính hơn.";
  }
}

/**
 * Phân tích và phát hiện chính xác món đồ / slot nào trên outfit đang gây ra lưu ý văn hóa
 */
export function detectOffendingItems(
  ruleInput: any,
  items: any[] = [],
  occasion?: string,
  styleLevel?: string
): RuleInsight {
  const ruleId = typeof ruleInput === "string" ? ruleInput : ruleInput?.id || "UNKNOWN_RULE";
  const ruleDef = ruleMap.get(ruleId);

  // 1. Tiêu đề thân thiện, không chứa mã code
  let title = "Lưu ý quy tắc văn hóa";
  if (ruleDef?.title) {
    title = sanitizeRuleMessage(ruleDef.title);
  } else if (typeof ruleInput === "object" && ruleInput?.title) {
    title = sanitizeRuleMessage(ruleInput.title);
  }

  // 2. Nội dung giải nghĩa sạch, trang trọng
  let rawMsg = "";
  if (typeof ruleInput === "object" && ruleInput?.message_vi) {
    rawMsg = ruleInput.message_vi;
  } else if (ruleDef?.message_vi) {
    rawMsg = ruleDef.message_vi;
  } else if (typeof ruleInput === "string" && !ruleInput.startsWith("R_") && !ruleInput.startsWith("A_")) {
    rawMsg = ruleInput;
  }
  const cleanMessage = sanitizeRuleMessage(rawMsg) || "Trang phục cần lưu ý một số chuẩn mực văn hóa truyền thống.";

  const level = (typeof ruleInput === "object" ? ruleInput.level : null) || ruleDef?.level || "VANG";
  const when = ruleDef?.when || {};

  // 3. Quét các item gây ra vi phạm
  const offendingItems: OffendingItemDetail[] = [];
  const affectedSlotsSet = new Set<string>();

  for (const item of items) {
    let isOffending = false;
    let reason = "";

    // A. Kiểm tra tags (như phu_kien_duong_pho, ho_hang, ngan, tay_ngan, xuyen_thau, vang_hoang_gia...)
    if (when.item_tags_any && item.tags?.some((t: string) => when.item_tags_any.includes(t))) {
      isOffending = true;
      if (item.tags.includes("phu_kien_duong_pho")) {
        reason = "Phụ kiện phong cách đường phố hiện đại chưa phù hợp nơi thờ tự trang nghiêm";
      } else if (item.tags.includes("ho_hang") || item.tags.includes("ngan")) {
        reason = "Thiết kế hở hoặc ngắn chưa chuẩn mực khi chiêm bái";
      } else if (item.tags.includes("tay_ngan") || item.tags.includes("xuyen_thau")) {
        reason = "Tay áo ngắn hoặc chất vải mỏng";
      } else if (item.tags.includes("vang_hoang_gia")) {
        reason = "Sắc vàng chính hoàng theo điển chế triều Nguyễn";
      } else if (item.tags.includes("rong_5_mong")) {
        reason = "Họa tiết rồng 5 móng theo điển chế cung đình";
      } else {
        reason = "Món đồ mang đặc điểm chưa tương thích bối cảnh";
      }
    }

    // B. Kiểm tra bottom tags (như váy phối cùng ngũ thân/áo tấc)
    if (when.bottom_tags_any && item.slot === "bottom" && item.tags?.some((t: string) => when.bottom_tags_any.includes(t))) {
      isOffending = true;
      reason = "Váy cách tân khi phối cùng áo ngũ thân/áo tấc truyền thống";
    }

    // C. Kiểm tra formality gap (chênh lệch trang trọng)
    if (when.formality_gap_gte !== undefined) {
      const formalities = items.map((i) => i.formality || 3);
      const minF = Math.min(...formalities);
      if (item.formality === minF) {
        isOffending = true;
        reason = "Món có mức độ trang trọng quá thấp so với trang phục chính";
      }
    }

    // D. Kiểm tra đặc thù ruleId R_DILE_03 (phụ kiện đường phố khi đi lễ)
    if (ruleId === "R_DILE_03") {
      const isStreetFootwear = item.slot === "footwear" && (item.tags?.includes("phu_kien_duong_pho") || item.id?.includes("sneaker"));
      const isStreetBag = ["bag", "jewelry"].includes(item.slot) && (item.tags?.includes("phu_kien_duong_pho") || item.id?.includes("tote"));
      if (isStreetFootwear) {
        isOffending = true;
        reason = "Giày sneaker thể thao hiện đại";
      }
      if (isStreetBag) {
        isOffending = true;
        reason = "Túi canvas đường phố";
      }
    }

    // E. Kiểm tra đặc thù ruleId R_TRON_01
    if (ruleId === "R_TRON_01" && item.slot === "bottom" && item.tags?.includes("vay")) {
      isOffending = true;
      reason = "Chân váy cách tân";
    }

    if (isOffending) {
      offendingItems.push({
        id: item.id,
        name: item.name_vi || item.name || "Món đồ",
        slot: item.slot,
        slotLabel: getSlotName(item.slot),
        reason,
        asset: item.asset || item.image_url,
        image_url: item.image_url || item.asset,
      });
      affectedSlotsSet.add(item.slot);
    }
  }

  // Nếu không quét được item cụ thể theo tag nhưng có affected_slots từ trước
  if (offendingItems.length === 0 && ruleInput?.affected_slots?.length > 0) {
    for (const slot of ruleInput.affected_slots) {
      affectedSlotsSet.add(slot);
      const item = items.find((i) => i.slot === slot);
      if (item) {
        offendingItems.push({
          id: item.id,
          name: item.name_vi || item.name || "Món đồ",
          slot: item.slot,
          slotLabel: getSlotName(item.slot),
          reason: "Thuộc vị trí trang phục cần lưu ý",
          asset: item.asset || item.image_url,
          image_url: item.image_url || item.asset,
        });
      }
    }
  }

  const suggestedAction = getActionSuggestion(ruleId);

  return {
    ruleId,
    title,
    cleanMessage,
    level,
    offendingItems,
    affectedSlots: Array.from(affectedSlotsSet),
    suggestedAction,
  };
}

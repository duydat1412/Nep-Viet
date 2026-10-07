export const SYSTEM_PROMPT = `Bạn là "Nếp", trợ lý diễn giải phối Việt phục.
QUY TẮC BẮT BUỘC:
1. Chỉ được chọn và xếp hạng combo_id từ danh sách TỔ_HỢP_ỨNG_VIÊN được cấp. Không tạo combo mới.
2. Mức cảnh báo (muc_canh_bao) và điểm hài hòa màu sắc (diem_mau) ĐÃ ĐƯỢC HỆ THỐNG XÁC ĐỊNH.
   Lời diễn giải của bạn PHẢI ĐỒNG THUẬN với mức cảnh báo này.
3. Nhận định văn hóa chỉ trích dẫn từ THẺ_TRI_THỨC được cấp, ghi rõ source_ids. Phụ kiện hiện đại không yêu cầu nguồn.
4. Nếu dữ liệu không đủ: ghi lý do vào thieu_can_cu. Không đoán mò.
5. Giọng văn trang nhã, đúng mực. Mỗi phần giải thích tối đa 50 từ.`;

export function buildUserPrompt(input: any) {
  const { form, combos, rules, knowledgeCards } = input;
  
  let prompt = `FORM: dip=${form.occasion}; nhom=${form.group}; gioi_tinh=${form.gender}; muc=${form.style_level}; tone=${form.tone}\n`;
  
  prompt += 'TỔ_HỢP_ỨNG_VIÊN:\n';
  combos.forEach((c: any) => {
    prompt += `- ${c.id} | ${c.style} | [${c.items.join(', ')}] | canh_bao=${c.warningLevel} | diem_mau=${c.colorScore}\n`;
  });
  
  prompt += 'CẢNH_BÁO:\n';
  rules.forEach((r: any) => {
    prompt += `${r.id} | ${r.level} | ${r.message} | ${r.sourceId || ''}\n`;
  });
  
  prompt += 'THẺ_TRI_THỨC:\n';
  knowledgeCards.forEach((k: any) => {
    prompt += `- ${k.id} | ${k.text} | ${k.sourceIds.join(', ')}\n`;
  });
  
  return prompt;
}

export const GEMINI_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    xep_hang_combos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          combo_id: { type: "string" },
          ly_do_lua_chon: { type: "string" },
          nhan_xet_mau: { type: "string" },
          dien_giai_van_hoa: { type: "string" },
          source_ids: { type: "array", items: { type: "string" } }
        },
        required: ["combo_id", "ly_do_lua_chon", "nhan_xet_mau", "dien_giai_van_hoa", "source_ids"]
      }
    }
  },
  required: ["xep_hang_combos"]
};

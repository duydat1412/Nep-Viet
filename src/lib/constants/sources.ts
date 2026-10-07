export interface SourceMetadata {
  id: string;
  short_name: string;
  badge_label: string;
  category_name: string;
}

export const SOURCE_DISPLAY_MAP: Record<string, SourceMetadata> = {
  S_HN1665: {
    id: "S_HN1665",
    short_name: "UBND TP. Hà Nội (QĐ 1665)",
    badge_label: "Quy tắc ứng xử nơi thờ tự",
    category_name: "Quy chuẩn ứng xử & Pháp lý",
  },
  S_VNNEWS_NGOCSON: {
    id: "S_VNNEWS_NGOCSON",
    short_name: "Quy định Đền Ngọc Sơn",
    badge_label: "Nội quy di tích linh thiêng",
    category_name: "Quy chuẩn ứng xử & Pháp lý",
  },
  S_THUVIENLAMDONG: {
    id: "S_THUVIENLAMDONG",
    short_name: "Thư viện Lâm Đồng",
    badge_label: "Tư liệu trang phục dân tộc",
    category_name: "Nghiên cứu & Bảo tàng",
  },
  S_HCMUSSH: {
    id: "S_HCMUSSH",
    short_name: "ĐH KHXH&NV TP.HCM",
    badge_label: "Khảo cứu áo ngũ thân",
    category_name: "Nghiên cứu & Bảo tàng",
  },
  S_VJOL_CUNGDINH: {
    id: "S_VJOL_CUNGDINH",
    short_name: "Khâm Định Đại Nam Hội Điển",
    badge_label: "Điển chế triều Nguyễn",
    category_name: "Điển chế Hoàng triều",
  },
  S_BAOPL_NAMPHUONG: {
    id: "S_BAOPL_NAMPHUONG",
    short_name: "Tư liệu Nam Phương Hoàng Hậu",
    badge_label: "Sắc vàng hoàng gia",
    category_name: "Điển chế Hoàng triều",
  },
  S_DANVIET_RONG: {
    id: "S_DANVIET_RONG",
    short_name: "Bảo tàng Cổ vật Cung đình Huế",
    badge_label: "Điển chế hoa văn rồng",
    category_name: "Điển chế Hoàng triều",
  },
  S_BAOPL_TET: {
    id: "S_BAOPL_TET",
    short_name: "Phong tục Tết Cổ truyền",
    badge_label: "Màu sắc may mắn đầu năm",
    category_name: "Phong tục & Tập quán",
  },
  S_HOANGTHANH: {
    id: "S_HOANGTHANH",
    short_name: "Hoàng thành Thăng Long",
    badge_label: "Nội quy di sản thế giới",
    category_name: "Quy chuẩn ứng xử & Pháp lý",
  },
  S_VINWONDERS_QUANHO: {
    id: "S_VINWONDERS_QUANHO",
    short_name: "Dân ca Quan họ Bắc Ninh",
    badge_label: "Trang phục diễn xướng dân gian",
    category_name: "Phong tục & Tập quán",
  },
  S_BAOVANHOA_QUANHO: {
    id: "S_BAOVANHOA_QUANHO",
    short_name: "Báo Văn Hóa (Bộ VHTTDL)",
    badge_label: "Bảo tồn di sản phi vật thể",
    category_name: "Phong tục & Tập quán",
  },
  S_BTHN_TUTHAN: {
    id: "S_BTHN_TUTHAN",
    short_name: "Bảo tàng Hà Nội",
    badge_label: "Hiện vật áo tứ thân Bắc Bộ",
    category_name: "Nghiên cứu & Bảo tàng",
  },
  S_VNNEWS_NHATBINH: {
    id: "S_VNNEWS_NHATBINH",
    short_name: "Trung tâm Bảo tồn Cố đô Huế",
    badge_label: "Lễ phục áo Nhật bình",
    category_name: "Điển chế Hoàng triều",
  },
  N1: {
    id: "N1",
    short_name: "Khảo cứu Cổ phục Ỷ Vân Hiên",
    badge_label: "Nghiên cứu phục dựng thực nghiệm",
    category_name: "Nghiên cứu & Bảo tàng",
  },
};

export function getSourceShortName(sourceId: string): string {
  return SOURCE_DISPLAY_MAP[sourceId]?.short_name || sourceId;
}

export function getSourceBadgeLabel(sourceId: string): string {
  return SOURCE_DISPLAY_MAP[sourceId]?.badge_label || "Tư liệu tham khảo";
}

export function getSourceCategoryName(sourceId: string): string {
  return SOURCE_DISPLAY_MAP[sourceId]?.category_name || "Tư liệu chung";
}

export const SLOT_NAME_MAP: Record<string, string> = {
  top: "Áo Chính",
  bottom: "Quần / Váy",
  footwear: "Guốc / Giày",
  bag: "Túi Xách",
  jewelry: "Trang Sức",
  headwear: "Khăn / Nón",
  outer: "Áo Khoác",
};

export const GROUP_NAME_MAP: Record<string, string> = {
  ao_ngu_than: "Áo Ngũ Thân",
  ao_tac: "Áo Tấc",
  ao_dai: "Áo Dài",
  ao_tu_than: "Áo Tứ Thân",
  ao_nhat_binh: "Áo Nhật Bình",
  phu_kien: "Phụ Kiện",
};

export function getSlotName(slot: string): string {
  return SLOT_NAME_MAP[slot] || slot;
}

export function getGroupName(group: string): string {
  return GROUP_NAME_MAP[group] || group;
}


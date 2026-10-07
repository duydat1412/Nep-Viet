export interface SavedLook {
  combo_id: string;
  saved_at: string;
  result: any;
}

const STORAGE_KEY = "nep_viet_saved_looks";

export function getSavedLooks(): SavedLook[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Lỗi khi đọc Tủ đồ đã lưu từ localStorage:", e);
    return [];
  }
}

export function saveLook(result: any): boolean {
  if (typeof window === "undefined" || !result?.combo_id) return false;
  try {
    const list = getSavedLooks();
    const existingIndex = list.findIndex((item) => item.combo_id === result.combo_id);
    
    if (existingIndex >= 0) {
      // Đã lưu -> gỡ khỏi danh sách (toggle)
      list.splice(existingIndex, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event("nep_viet_favorites_updated"));
      return false; // Trả về false nghĩa là un-saved
    } else {
      // Thêm mới
      list.unshift({
        combo_id: result.combo_id,
        saved_at: new Date().toISOString(),
        result,
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event("nep_viet_favorites_updated"));
      return true; // Trả về true nghĩa là saved
    }
  } catch (e) {
    console.error("Lỗi khi lưu vào Tủ đồ:", e);
    return false;
  }
}

export function isLookSaved(comboId: string): boolean {
  if (typeof window === "undefined" || !comboId) return false;
  const list = getSavedLooks();
  return list.some((item) => item.combo_id === comboId);
}

export function removeSavedLook(comboId: string): void {
  if (typeof window === "undefined" || !comboId) return;
  const list = getSavedLooks().filter((item) => item.combo_id !== comboId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("nep_viet_favorites_updated"));
}

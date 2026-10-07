"use client";

import { useEffect, useState } from "react";
import { Bookmark, Trash2, X, Sparkles, ExternalLink, ArrowRight } from "lucide-react";
import { getSavedLooks, removeSavedLook, SavedLook } from "@/lib/storage/favorites";

interface SavedLooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLook: (lookResult: any) => void;
}

export default function SavedLooksModal({
  isOpen,
  onClose,
  onSelectLook,
}: SavedLooksModalProps) {
  const [savedList, setSavedList] = useState<SavedLook[]>([]);

  const refreshList = () => {
    setSavedList(getSavedLooks());
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-nep-ink/10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-nep-ink/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-nep-red/10 text-nep-red flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-nep-ink">
                Tủ Đồ Di Sản Của Bạn ({savedList.length})
              </h3>
              <p className="text-xs text-nep-ink/60">
                Các bản phối Lookbook đã lưu trong bộ nhớ máy (Local Storage)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-nep-paper flex items-center justify-center text-xs text-nep-ink/60 hover:text-nep-ink transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {savedList.length === 0 ? (
            <div className="py-16 text-center text-nep-ink/40">
              <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-30 text-nep-red" />
              <p className="text-sm font-bold text-nep-ink">Chưa có bản phối nào được lưu</p>
              <p className="text-xs text-nep-ink/60 mt-1 max-w-xs mx-auto">
                Khi tạo phối đồ ở Lookbook Atelier, bấm vào biểu tượng "Lưu Tủ Đồ" để lưu lại những bộ trang phục bạn yêu thích.
              </p>
            </div>
          ) : (
            savedList.map((item) => {
              const res = item.result;
              const topItem = res.items?.find((i: any) => i.slot === "top");
              const savedDate = new Date(item.saved_at).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.combo_id}
                  className="p-3.5 rounded-2xl bg-nep-paper/40 border border-nep-ink/5 hover:border-nep-red/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-16 bg-white rounded-xl border border-nep-ink/5 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                      {topItem ? (
                        <img
                          src={topItem.image_url || topItem.asset}
                          alt={topItem.name_vi}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Sparkles className="w-5 h-5 text-secondary" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-heading text-sm font-bold text-nep-ink truncate">
                          {topItem?.name_vi || item.combo_id}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            res.muc_canh_bao === "XANH"
                              ? "bg-emerald-100 text-emerald-800"
                              : res.muc_canh_bao === "VANG"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {res.muc_canh_bao === "XANH" ? "Chuẩn Mực" : "Lưu Ý"}
                        </span>
                      </div>

                      <p className="text-[11px] text-nep-ink/70 line-clamp-1 italic">
                        "{res.ly_do_phoi_do}"
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-nep-ink/40 mt-1 font-mono">
                        <span>Hòa sắc: {res.diem_hai_hoa_mau}/10</span>
                        <span>•</span>
                        <span>{savedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectLook(res);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary text-xs font-bold hover:bg-primary transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem Lại</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        removeSavedLook(item.combo_id);
                        refreshList();
                      }}
                      className="p-1.5 rounded-full text-nep-ink/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa khỏi tủ đồ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-nep-ink/10 flex items-center justify-between text-[11px] text-nep-ink/50">
          <span>Dữ liệu lưu an toàn trên trình duyệt của bạn (không yêu cầu tài khoản).</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container text-nep-ink font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

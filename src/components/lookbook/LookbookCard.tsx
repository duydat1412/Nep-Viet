"use client";

import { useRef } from "react";
import ExportButton from "./ExportButton";

export interface ComboResult {
  combo_id: string;
  outfit_item_ids: string[];
  muc_canh_bao: "XANH" | "VANG" | "DO" | "CHUA_DU_CAN_CU";
  diem_hai_hoa_mau: number;
  ly_do_phoi_do: string;
  nhan_xet_mau: string;
  dien_giai_van_hoa: string;
  source_ids: string[];
  triggered_rules: any[];
  items: any[];
}

interface LookbookCardProps {
  result: ComboResult;
}

export default function LookbookCard({ result }: LookbookCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const badgeConfig = {
    XANH: { bg: "bg-emerald-100", text: "text-emerald-800", icon: "✓", label: "Phù hợp văn hóa" },
    VANG: { bg: "bg-amber-100", text: "text-amber-800", icon: "⚠", label: "Cần lưu ý" },
    DO: { bg: "bg-rose-100", text: "text-rose-800", icon: "✕", label: "Không phù hợp" },
    CHUA_DU_CAN_CU: { bg: "bg-gray-100", text: "text-gray-800", icon: "?", label: "Chưa đủ căn cứ" },
  };

  const badge = badgeConfig[result.muc_canh_bao] || badgeConfig.CHUA_DU_CAN_CU;

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={cardRef} 
        className="relative bg-nep-paper w-[360px] min-h-[640px] shadow-2xl overflow-hidden rounded-2xl border border-nep-ink/10 flex flex-col p-6"
      >
        {/* Header */}
        <div className="text-center mb-3">
          <h2 className="font-heading text-2xl font-bold text-nep-red tracking-wider">NẾP VIỆT</h2>
          <p className="text-[10px] text-nep-ink/60 uppercase tracking-widest mt-0.5">Nếp Việt, nét riêng.</p>
        </div>

        {/* Warning Badge */}
        <div className="flex justify-center mb-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
            <span>{badge.icon}</span>
            {badge.label}
          </span>
        </div>

        {/* Outfit Breakdown Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-3 flex-1">
          {result.items?.map((item: any, idx: number) => {
            const imgSrc = item.image_url || item.asset;
            const name = item.name_vi || item.name;
            return (
              <div key={idx} className="bg-white/70 rounded-xl p-2 flex flex-col items-center justify-center shadow-sm border border-nep-ink/5">
                {imgSrc ? (
                  <img src={imgSrc} alt={name} className="w-full h-24 object-contain mb-1 drop-shadow-sm" />
                ) : (
                  <div className="w-full h-24 bg-gray-100 rounded mb-1 flex items-center justify-center text-gray-400 text-xs">No image</div>
                )}
                <span className="text-[10px] text-center font-medium leading-tight text-nep-ink line-clamp-1">{name}</span>
              </div>
            );
          })}
        </div>

        {/* Score Bar */}
        <div className="mb-3 bg-white/50 p-2.5 rounded-xl border border-nep-ink/5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-medium text-nep-ink/80">Điểm hài hòa màu sắc</span>
            <span className="text-xs font-bold text-nep-gold">{result.diem_hai_hoa_mau} / 10</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-nep-gold rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(0, (result.diem_hai_hoa_mau / 10) * 100))}%` }}
            />
          </div>
          {result.nhan_xet_mau && (
            <p className="text-[9px] text-nep-ink/70 mt-1 line-clamp-1 italic">{result.nhan_xet_mau}</p>
          )}
        </div>

        {/* Cultural Explanation */}
        <div className="bg-white/60 p-3 rounded-xl border border-nep-ink/5 mb-2.5">
          <p className="text-[11px] leading-relaxed text-nep-ink/90 italic">
            "{result.dien_giai_van_hoa || result.ly_do_phoi_do}"
          </p>
        </div>

        {/* Warning Details for VANG */}
        {result.muc_canh_bao === "VANG" && result.triggered_rules?.length > 0 && (
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-2.5">
            <p className="text-[10px] text-amber-900 leading-tight">
              <span className="font-bold">⚠️ Lưu ý văn hóa:</span>{" "}
              {typeof result.triggered_rules[0] === "string"
                ? result.triggered_rules[0]
                : result.triggered_rules[0]?.message_vi || result.triggered_rules[0]?.id}
            </p>
          </div>
        )}

        {/* Citations */}
        {result.source_ids?.length > 0 && (
          <div className="mt-auto flex flex-wrap items-center gap-1 pt-1 border-t border-nep-ink/5">
            <span className="text-[8px] text-nep-ink/50 uppercase font-semibold">Căn cứ:</span>
            {result.source_ids.map((source: string) => (
              <span key={source} className="text-[8px] bg-nep-ink/5 text-nep-ink/70 px-1.5 py-0.5 rounded font-mono">
                {source}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 w-full max-w-[360px] flex justify-center">
        <ExportButton cardRef={cardRef} comboId={result.combo_id} />
      </div>
    </div>
  );
}

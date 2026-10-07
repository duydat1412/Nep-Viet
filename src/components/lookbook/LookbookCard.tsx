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

  // Sắp xếp items theo thứ tự trục cơ thể: Áo -> Quần -> Giày & Phụ kiện
  const topItem = result.items?.find((i: any) => i.slot === "top");
  const bottomItem = result.items?.find((i: any) => i.slot === "bottom");
  const footwearItem = result.items?.find((i: any) => i.slot === "footwear");
  const accessories = result.items?.filter(
    (i: any) => !["top", "bottom", "footwear"].includes(i.slot)
  ) || [];

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={cardRef} 
        className="relative bg-nep-paper w-[360px] min-h-[660px] shadow-2xl overflow-hidden rounded-2xl border border-nep-ink/10 flex flex-col p-5"
      >
        {/* Header */}
        <div className="text-center mb-2">
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

        {/* Body Lineup Layout (Áo -> Quần -> Giày theo trục đứng) */}
        <div className="relative bg-white/75 rounded-2xl p-3 border border-nep-ink/5 shadow-sm mb-3 flex flex-col items-center">
          {/* Phụ kiện nổi ở góc (nếu có, e.g. Túi tote) */}
          {accessories.map((acc: any, idx: number) => {
            const accImg = acc.image_url || acc.asset;
            const accName = acc.name_vi || acc.name;
            return (
              <div 
                key={idx}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-xl p-1.5 shadow-md border border-nep-ink/10 flex flex-col items-center z-10 max-w-[76px]"
              >
                <span className="text-[8px] uppercase tracking-wider font-semibold text-nep-indigo mb-0.5">Phụ kiện</span>
                {accImg && (
                  <img src={accImg} alt={accName} className="w-12 h-12 object-contain drop-shadow-sm" />
                )}
                <span className="text-[8px] text-center font-medium text-nep-ink leading-tight line-clamp-1 mt-0.5">
                  {accName}
                </span>
              </div>
            );
          })}

          {/* 1. Áo chính (Top) */}
          {topItem && (
            <div className="flex flex-col items-center w-full group -mb-3 z-0">
              <img 
                src={topItem.image_url || topItem.asset} 
                alt={topItem.name_vi || topItem.name} 
                className="h-36 w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
              <span className="text-[10px] font-semibold text-nep-ink/80 bg-white/80 px-2 py-0.5 rounded-full border border-nep-ink/5 shadow-2xs mt-0.5">
                {topItem.name_vi || topItem.name}
              </span>
            </div>
          )}

          {/* 2. Quần (Bottom) */}
          {bottomItem && (
            <div className="flex flex-col items-center w-full group -mb-2 z-0">
              <img 
                src={bottomItem.image_url || bottomItem.asset} 
                alt={bottomItem.name_vi || bottomItem.name} 
                className="h-32 w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
              <span className="text-[10px] font-semibold text-nep-ink/80 bg-white/80 px-2 py-0.5 rounded-full border border-nep-ink/5 shadow-2xs mt-0.5">
                {bottomItem.name_vi || bottomItem.name}
              </span>
            </div>
          )}

          {/* 3. Giày / Guốc (Footwear) */}
          {footwearItem && (
            <div className="flex flex-col items-center w-full group mt-1 z-0">
              <img 
                src={footwearItem.image_url || footwearItem.asset} 
                alt={footwearItem.name_vi || footwearItem.name} 
                className="h-16 w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
              <span className="text-[10px] font-semibold text-nep-ink/80 bg-white/80 px-2 py-0.5 rounded-full border border-nep-ink/5 shadow-2xs mt-1">
                {footwearItem.name_vi || footwearItem.name}
              </span>
            </div>
          )}
        </div>

        {/* Score Bar */}
        <div className="mb-2.5 bg-white/50 p-2.5 rounded-xl border border-nep-ink/5">
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
        <div className="bg-white/60 p-2.5 rounded-xl border border-nep-ink/5 mb-2">
          <p className="text-[11px] leading-relaxed text-nep-ink/90 italic">
            "{result.dien_giai_van_hoa || result.ly_do_phoi_do}"
          </p>
        </div>

        {/* Warning Details for VANG */}
        {result.muc_canh_bao === "VANG" && result.triggered_rules?.length > 0 && (
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-2">
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

      <div className="mt-4 w-full max-w-[360px] flex justify-center">
        <ExportButton cardRef={cardRef} comboId={result.combo_id} />
      </div>
    </div>
  );
}

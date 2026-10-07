"use client";

import { useRef, useState } from "react";
import ExportButton from "./ExportButton";
import { Store, Tag, Sparkles } from "lucide-react";

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

export interface LookbookCardProps {
  result: ComboResult;
  onOpenSource?: (sourceId: string) => void;
}

function ExpandableText({
  text,
  maxChars = 65,
  className = "",
  italic = false,
}: {
  text: string;
  maxChars?: number;
  className?: string;
  italic?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > maxChars;

  return (
    <div className={className}>
      <span className={italic ? "italic" : ""}>
        {expanded || !isLong ? text : `${text.slice(0, maxChars)}...`}
      </span>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="ml-1.5 inline-flex items-center text-[9px] font-bold text-nep-indigo hover:text-nep-red transition-colors underline cursor-pointer"
        >
          {expanded ? "Thu gọn ▲" : "Xem thêm ▼"}
        </button>
      )}
    </div>
  );
}

export default function LookbookCard({ result, onOpenSource }: LookbookCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

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

  // Tính tổng giá từ các sản phẩm thật (theo Stitch design)
  const totalBuyPrice = result.items?.reduce((sum: number, item: any) => sum + (item.pricing?.buy_price || 0), 0) || 0;
  const totalRentalPrice = result.items?.reduce((sum: number, item: any) => sum + (item.pricing?.rental_price || 0), 0) || 0;

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={cardRef} 
        className="relative bg-nep-paper w-[360px] min-h-[690px] shadow-2xl overflow-hidden rounded-2xl border border-nep-ink/10 flex flex-col p-5 transition-all duration-300"
      >
        {/* Dấu Triện (Imperial Seal Stamp) Accent - Ước lệ mỹ thuật */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-center select-none pointer-events-none" title="Mô phỏng đồ họa ấn triện truyền thống">
          <div className="w-9 h-9 rounded-md bg-nep-red text-white flex flex-col items-center justify-center shadow-md leading-none border border-amber-300/40">
            <span className="font-heading text-[8px] font-black tracking-widest uppercase">NẾP</span>
            <span className="font-heading text-[8px] font-black tracking-widest uppercase mt-0.5">VIỆT</span>
          </div>
          <span className="text-[7px] uppercase tracking-tighter text-nep-red font-mono mt-0.5 font-bold">NẾP PHÊ</span>
        </div>

        {/* Header */}
        <div className="text-left mb-2 pr-12">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-nep-gold">LOOK NO. 01</span>
            <span className="text-[9px] text-nep-ink/30">•</span>
            <span className="text-[9px] text-nep-ink/60 uppercase">DI SẢN ĐƯƠNG ĐẠI</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-nep-red tracking-wider">NẾP VIỆT</h2>
          <p className="text-[10px] text-nep-ink/70 italic mt-0.5">"Nếp Việt, nét riêng" — Giám tuyển bởi AI Nếp</p>
        </div>

        {/* Warning Badge */}
        <div className="flex justify-start mb-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
            <span>{badge.icon}</span>
            {badge.label}
          </span>
        </div>

        {/* Body Lineup Layout (Áo -> Quần -> Giày theo trục đứng) */}
        <div className="relative bg-white/80 rounded-2xl p-3 border border-nep-ink/5 shadow-sm mb-3 flex flex-col items-center">
          {/* Phụ kiện nổi ở góc (Túi tote / nón) */}
          {accessories.map((acc: any, idx: number) => {
            const accImg = acc.image_url || acc.asset;
            const accName = acc.name_vi || acc.name;
            return (
              <div 
                key={idx}
                onClick={() => setSelectedItem(acc)}
                className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-xl p-1.5 shadow-md border border-nep-ink/10 flex flex-col items-center z-10 max-w-[82px] cursor-pointer hover:scale-105 transition-transform"
              >
                <span className="text-[7px] uppercase tracking-wider font-bold text-nep-indigo mb-0.5">Phụ kiện</span>
                {accImg && (
                  <img src={accImg} alt={accName} className="w-11 h-11 object-contain drop-shadow-sm" />
                )}
                <span className="text-[8px] text-center font-semibold text-nep-ink leading-tight line-clamp-1 mt-0.5">
                  {accName}
                </span>
                {acc.pricing?.buy_price ? (
                  <span className="text-[8px] font-mono font-bold text-nep-gold">
                    {acc.pricing.buy_price.toLocaleString()}₫
                  </span>
                ) : null}
              </div>
            );
          })}

          {/* 1. Áo chính (Top) */}
          {topItem && (
            <div 
              onClick={() => setSelectedItem(topItem)}
              className="flex flex-col items-center w-full group -mb-3 z-0 cursor-pointer"
            >
              <img 
                src={topItem.image_url || topItem.asset} 
                alt={topItem.name_vi || topItem.name} 
                className="h-36 w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
              <div className="flex items-center gap-1.5 bg-white/90 px-2.5 py-0.5 rounded-full border border-nep-ink/10 shadow-2xs mt-0.5">
                <span className="text-[10px] font-bold text-nep-ink">
                  {topItem.name_vi || topItem.name}
                </span>
                {topItem.pricing?.buy_price ? (
                  <span className="text-[9px] font-mono font-bold text-nep-gold border-l border-nep-ink/10 pl-1.5">
                    {topItem.pricing.buy_price.toLocaleString()}₫
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {/* 2. Quần (Bottom) */}
          {bottomItem && (
            <div 
              onClick={() => setSelectedItem(bottomItem)}
              className="flex flex-col items-center w-full group -mb-2 z-0 cursor-pointer"
            >
              <img 
                src={bottomItem.image_url || bottomItem.asset} 
                alt={bottomItem.name_vi || bottomItem.name} 
                className="h-32 w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
              <div className="flex items-center gap-1.5 bg-white/90 px-2.5 py-0.5 rounded-full border border-nep-ink/10 shadow-2xs mt-0.5">
                <span className="text-[10px] font-bold text-nep-ink">
                  {bottomItem.name_vi || bottomItem.name}
                </span>
                {bottomItem.pricing?.buy_price ? (
                  <span className="text-[9px] font-mono font-bold text-nep-gold border-l border-nep-ink/10 pl-1.5">
                    {bottomItem.pricing.buy_price.toLocaleString()}₫
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {/* 3. Giày / Guốc (Footwear) */}
          {footwearItem && (
            <div 
              onClick={() => setSelectedItem(footwearItem)}
              className="flex flex-col items-center w-full group mt-1 z-0 cursor-pointer"
            >
              <img 
                src={footwearItem.image_url || footwearItem.asset} 
                alt={footwearItem.name_vi || footwearItem.name} 
                className="h-16 w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
              <div className="flex items-center gap-1.5 bg-white/90 px-2.5 py-0.5 rounded-full border border-nep-ink/10 shadow-2xs mt-1">
                <span className="text-[10px] font-bold text-nep-ink">
                  {footwearItem.name_vi || footwearItem.name}
                </span>
                {footwearItem.pricing?.buy_price ? (
                  <span className="text-[9px] font-mono font-bold text-nep-gold border-l border-nep-ink/10 pl-1.5">
                    {footwearItem.pricing.buy_price.toLocaleString()}₫
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Total Set Pricing Bar (From Stitch design) */}
        {totalBuyPrice > 0 && (
          <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-white/60 border border-nep-ink/5 flex items-center justify-between text-xs">
            <span className="text-[10px] font-semibold text-nep-ink/60 uppercase">Ước tính trọn bộ:</span>
            <div className="flex items-center gap-2">
              {totalRentalPrice > 0 && (
                <span className="text-[11px] font-bold text-nep-indigo">
                  Thuê ~{totalRentalPrice.toLocaleString()}₫
                </span>
              )}
              <span className="text-[11px] font-bold text-nep-red">
                May ~{totalBuyPrice.toLocaleString()}₫
              </span>
            </div>
          </div>
        )}

        {/* Score Bar with Expandable Comment */}
        <div className="mb-2 bg-white/50 p-2.5 rounded-xl border border-nep-ink/5">
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
            <ExpandableText
              text={result.nhan_xet_mau}
              maxChars={60}
              italic={true}
              className="text-[9px] text-nep-ink/70 mt-1.5 leading-relaxed"
            />
          )}
        </div>

        {/* Cultural Explanation with Expandable Text */}
        <div className="bg-white/60 p-2.5 rounded-xl border border-nep-ink/5 mb-2">
          <ExpandableText
            text={`"${result.dien_giai_van_hoa || result.ly_do_phoi_do}"`}
            maxChars={85}
            italic={true}
            className="text-[11px] leading-relaxed text-nep-ink/90"
          />
        </div>

        {/* Warning Details for VANG with Expandable Text */}
        {result.muc_canh_bao === "VANG" && result.triggered_rules?.length > 0 && (
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-2">
            <p className="text-[10px] text-amber-900 leading-tight mb-0.5">
              <span className="font-bold">⚠️ Lưu ý văn hóa:</span>
            </p>
            <ExpandableText
              text={
                typeof result.triggered_rules[0] === "string"
                  ? result.triggered_rules[0]
                  : result.triggered_rules[0]?.message_vi || result.triggered_rules[0]?.id
              }
              maxChars={75}
              className="text-[10px] text-amber-900/90 leading-snug"
            />
          </div>
        )}

        {/* Citations */}
        {result.source_ids?.length > 0 && (
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2 border-t border-nep-ink/5">
            <span className="text-[8px] text-nep-ink/50 uppercase font-semibold">Căn cứ:</span>
            {result.source_ids.map((source: string) => (
              <button
                key={source}
                type="button"
                onClick={() => onOpenSource?.(source)}
                className="text-[8px] bg-nep-indigo/10 text-nep-indigo hover:bg-nep-indigo hover:text-white px-1.5 py-0.5 rounded font-mono font-bold transition-colors cursor-pointer flex items-center gap-0.5"
                title={`Tra cứu văn bản / tài liệu căn cứ [${source}]`}
              >
                <span>{source}</span>
                <span className="text-[7px]">↗</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal / Popup Chi Tiết Món Đồ Khi Nhấn Vào */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-nep-ink/10 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-nep-red">
                  {selectedItem.slot} · {selectedItem.group}
                </span>
                <h3 className="font-heading text-lg font-bold text-nep-ink">
                  {selectedItem.name_vi || selectedItem.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-7 h-7 rounded-full bg-nep-paper flex items-center justify-center text-xs text-nep-ink/60 hover:text-nep-ink cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center p-2 mb-3 bg-nep-paper/40 rounded-xl">
              <img
                src={selectedItem.image_url || selectedItem.asset}
                alt={selectedItem.name_vi}
                className="h-32 object-contain"
              />
            </div>

            {/* Thông tin nghệ nhân & giá */}
            <div className="space-y-2 text-xs mb-4">
              {selectedItem.brand && (
                <div className="p-2.5 rounded-lg bg-nep-paper/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-nep-ink/50 block">Thương hiệu / Làng nghề</span>
                    <span className="font-bold text-nep-ink">{selectedItem.brand.name}</span>
                    <span className="text-[10px] text-nep-ink/60 block">{selectedItem.brand.location}</span>
                  </div>
                  <Store className="w-4 h-4 text-nep-indigo" />
                </div>
              )}

              {selectedItem.pricing && (
                <div className="p-2.5 rounded-lg bg-nep-paper/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-nep-ink/50 block">Giá tham khảo</span>
                    {selectedItem.pricing.rental_price ? (
                      <span className="font-bold text-nep-indigo block">
                        Thuê: {selectedItem.pricing.rental_price.toLocaleString()}₫
                      </span>
                    ) : null}
                    {selectedItem.pricing.buy_price ? (
                      <span className="font-bold text-nep-red block">
                        May: {selectedItem.pricing.buy_price.toLocaleString()}₫
                      </span>
                    ) : null}
                  </div>
                  <Tag className="w-4 h-4 text-nep-gold" />
                </div>
              )}

              {selectedItem.material && (
                <p className="text-[11px] text-nep-ink/80">
                  <span className="font-semibold">Chất liệu:</span> {selectedItem.material}
                </p>
              )}

              {selectedItem.craftsmanship_lore && (
                <p className="text-[11px] text-nep-ink/70 italic bg-nep-paper/30 p-2 rounded">
                  "{selectedItem.craftsmanship_lore}"
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-2.5 rounded-full bg-nep-indigo text-white text-xs font-semibold hover:bg-nep-indigo/90 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 w-full max-w-[360px] flex justify-center">
        <ExportButton cardRef={cardRef} comboId={result.combo_id} />
      </div>
    </div>
  );
}

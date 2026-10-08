"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import ExportButton from "./ExportButton";
import { Store, Tag, Sparkles, ExternalLink, Phone, Bookmark, AlertTriangle } from "lucide-react";
import { getSourceShortName, getSlotName, getGroupName } from "@/lib/constants/sources";
import { saveLook, isLookSaved } from "@/lib/storage/favorites";
import { detectOffendingItems } from "@/lib/engine/rule-detector";

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
  const [isSaved, setIsSaved] = useState(false);
  const [showOffendingDetails, setShowOffendingDetails] = useState(false);

  // Phân tích quy tắc văn hóa để chỉ rõ món đồ gây ra
  const ruleInsight = useMemo(() => {
    if (!result.triggered_rules || result.triggered_rules.length === 0) return null;
    return detectOffendingItems(result.triggered_rules[0], result.items || []);
  }, [result.triggered_rules, result.items]);

  const highlightedItemIds = useMemo(() => {
    return ruleInsight?.offendingItems.map((i) => i.id) || [];
  }, [ruleInsight]);

  const highlightedSlots = useMemo(() => {
    return ruleInsight?.affectedSlots || [];
  }, [ruleInsight]);

  useEffect(() => {
    setIsSaved(isLookSaved(result.combo_id));
  }, [result.combo_id]);

  const handleToggleSave = () => {
    const saved = saveLook(result);
    setIsSaved(saved);
  };

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
        className="relative bg-nep-paper w-full max-w-[360px] min-h-[690px] shadow-2xl overflow-hidden rounded-2xl border border-nep-ink/10 flex flex-col p-5 transition-all duration-300"
      >
        {/* Dấu Triện (Imperial Seal Stamp) Accent - Ước lệ mỹ thuật */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-center select-none pointer-events-none" title="Ấn triện thương hiệu Nếp Việt">
          <div className="w-10 h-10 drop-shadow-sm">
            <img src="/favicon.png" alt="Nếp Việt Triện" className="w-full h-full object-contain" />
          </div>
          <span className="text-[7px] uppercase tracking-tighter text-nep-red font-mono mt-0.5 font-bold">NẾP PHÊ</span>
        </div>

        {/* Header */}
        <div className="text-left mb-2 pr-12">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-nep-gold">
              LOOK NO. {result.combo_id ? (result.combo_id.match(/\d+$/)?.[0] || "01").padStart(2, "0") : "01"}
            </span>
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
            const isOffendingAcc = showOffendingDetails && (
              highlightedItemIds.includes(acc.id) ||
              highlightedSlots.includes(acc.slot) ||
              highlightedSlots.includes("bag") ||
              highlightedSlots.includes("jewelry")
            );
            return (
              <div 
                key={idx}
                onClick={() => setSelectedItem(acc)}
                className={`absolute top-2 right-2 rounded-xl p-1.5 shadow-md flex flex-col items-center z-10 max-w-[88px] cursor-pointer hover:scale-105 transition-all ${
                  isOffendingAcc
                    ? "bg-amber-100 border-2 border-amber-500 ring-2 ring-amber-400/80 animate-pulse"
                    : "bg-white/95 backdrop-blur-sm border border-nep-ink/10"
                }`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[7px] uppercase tracking-wider font-bold text-nep-indigo">Phụ kiện</span>
                  {isOffendingAcc && (
                    <span className="text-[7px] font-bold text-amber-950 bg-amber-300 px-1 rounded">⚠️ Lưu ý</span>
                  )}
                </div>
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
          {topItem && (() => {
            const isOffendingTop = showOffendingDetails && (
              highlightedItemIds.includes(topItem.id) ||
              highlightedSlots.includes("top")
            );
            return (
              <div 
                onClick={() => setSelectedItem(topItem)}
                className="flex flex-col items-center w-full group -mb-3 z-0 cursor-pointer"
              >
                <img 
                  src={topItem.image_url || topItem.asset} 
                  alt={topItem.name_vi || topItem.name} 
                  className={`h-36 w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300 ${
                    isOffendingTop ? "scale-105 filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.4)]" : ""
                  }`}
                />
                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full shadow-2xs mt-0.5 transition-all ${
                  isOffendingTop
                    ? "bg-amber-100 border-2 border-amber-500 ring-2 ring-amber-400/80 animate-pulse"
                    : "bg-white/90 border border-nep-ink/10"
                }`}>
                  {isOffendingTop && <span className="text-[9px]">⚠️</span>}
                  <span className="text-[10px] font-bold text-nep-ink">
                    {topItem.name_vi || topItem.name}
                  </span>
                  {topItem.pricing?.buy_price ? (
                    <span className="text-[9px] font-mono font-bold text-nep-gold border-l border-nep-ink/10 pl-1.5" title={topItem.pricing?.is_estimate ? "Giá tham khảo may đo" : "Giá bán lẻ"}>
                      {topItem.pricing.is_estimate ? "~" : ""}{topItem.pricing.buy_price.toLocaleString()}₫{topItem.pricing.is_estimate ? "*" : ""}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })()}

          {/* 2. Quần (Bottom) */}
          {bottomItem && (() => {
            const isOffendingBottom = showOffendingDetails && (
              highlightedItemIds.includes(bottomItem.id) ||
              highlightedSlots.includes("bottom")
            );
            return (
              <div 
                onClick={() => setSelectedItem(bottomItem)}
                className="flex flex-col items-center w-full group -mb-2 z-0 cursor-pointer"
              >
                <img 
                  src={bottomItem.image_url || bottomItem.asset} 
                  alt={bottomItem.name_vi || bottomItem.name} 
                  className={`h-32 w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300 ${
                    isOffendingBottom ? "scale-105 filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.4)]" : ""
                  }`}
                />
                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full shadow-2xs mt-0.5 transition-all ${
                  isOffendingBottom
                    ? "bg-amber-100 border-2 border-amber-500 ring-2 ring-amber-400/80 animate-pulse"
                    : "bg-white/90 border border-nep-ink/10"
                }`}>
                  {isOffendingBottom && <span className="text-[9px]">⚠️</span>}
                  <span className="text-[10px] font-bold text-nep-ink">
                    {bottomItem.name_vi || bottomItem.name}
                  </span>
                  {bottomItem.pricing?.buy_price ? (
                    <span className="text-[9px] font-mono font-bold text-nep-gold border-l border-nep-ink/10 pl-1.5" title={bottomItem.pricing?.is_estimate ? "Giá tham khảo may đo" : "Giá bán lẻ"}>
                      {bottomItem.pricing.is_estimate ? "~" : ""}{bottomItem.pricing.buy_price.toLocaleString()}₫{bottomItem.pricing.is_estimate ? "*" : ""}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })()}

          {/* 3. Giày / Guốc (Footwear) */}
          {footwearItem && (() => {
            const isOffendingFootwear = showOffendingDetails && (
              highlightedItemIds.includes(footwearItem.id) ||
              highlightedSlots.includes("footwear")
            );
            return (
              <div 
                onClick={() => setSelectedItem(footwearItem)}
                className="flex flex-col items-center w-full group mt-1 z-0 cursor-pointer"
              >
                <img 
                  src={footwearItem.image_url || footwearItem.asset} 
                  alt={footwearItem.name_vi || footwearItem.name} 
                  className={`h-16 w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300 ${
                    isOffendingFootwear ? "scale-105 filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.4)]" : ""
                  }`}
                />
                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full shadow-2xs mt-1 transition-all ${
                  isOffendingFootwear
                    ? "bg-amber-100 border-2 border-amber-500 ring-2 ring-amber-400/80 animate-pulse"
                    : "bg-white/90 border border-nep-ink/10"
                }`}>
                  {isOffendingFootwear && <span className="text-[9px]">⚠️</span>}
                  <span className="text-[10px] font-bold text-nep-ink">
                    {footwearItem.name_vi || footwearItem.name}
                  </span>
                  {footwearItem.pricing?.buy_price ? (
                    <span className="text-[9px] font-mono font-bold text-nep-gold border-l border-nep-ink/10 pl-1.5" title={footwearItem.pricing?.is_estimate ? "Giá tham khảo" : "Giá bán lẻ"}>
                      {footwearItem.pricing.is_estimate ? "~" : ""}{footwearItem.pricing.buy_price.toLocaleString()}₫{footwearItem.pricing.is_estimate ? "*" : ""}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })()}
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

        {/* Warning Details for VANG or DO with Interactive Offending Parts Highlighting */}
        {(result.muc_canh_bao === "VANG" || result.muc_canh_bao === "DO") && ruleInsight && (
          <div 
            onClick={() => setShowOffendingDetails(!showOffendingDetails)}
            className={`p-2.5 rounded-xl border mb-2 cursor-pointer transition-all ${
              result.muc_canh_bao === "DO" 
                ? "bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100/70" 
                : "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100/60"
            }`}
            title="Nhấn để xem phần trang phục gây ra lưu ý trên Lookbook"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[10px] flex items-center gap-1">
                <span>{result.muc_canh_bao === "DO" ? "🛑 Cảnh báo văn hóa:" : "⚠️ Lưu ý văn hóa:"}</span>
                <span className="font-normal opacity-85">{ruleInsight.title}</span>
              </span>
              <span className="text-[9px] underline font-bold text-nep-indigo flex items-center gap-0.5">
                {showOffendingDetails ? "Thu gọn ▲" : "Xem phần gây lưu ý 🔍"}
              </span>
            </div>

            <p className="text-[10px] leading-snug opacity-95">
              {ruleInsight.cleanMessage}
            </p>

            {/* Chi tiết phần gây ra lưu ý khi ấn vào */}
            {showOffendingDetails && (
              <div className="mt-2 pt-2 border-t border-amber-300/60 flex flex-col gap-1.5 animate-in fade-in">
                <span className="text-[9px] font-bold text-nep-ink flex items-center gap-1">
                  <span>📍</span> Món đồ đang gây lưu ý trên Lookbook:
                </span>
                <div className="flex flex-wrap gap-1">
                  {ruleInsight.offendingItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="px-2 py-0.5 bg-white border border-amber-300 hover:border-nep-red text-nep-ink rounded-md text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Nhấn để xem thông tin chi tiết món đồ"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      <span>{item.name}</span>
                      <span className="opacity-60 text-[8px]">({item.slotLabel}) ↗</span>
                    </button>
                  ))}
                </div>

                {ruleInsight.suggestedAction && (
                  <p className="text-[9px] text-amber-900 italic mt-0.5 leading-tight">
                    💡 <strong>Gợi ý:</strong> {ruleInsight.suggestedAction}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Citations */}
        {result.source_ids?.length > 0 && (
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2 border-t border-nep-ink/5">
            <span className="text-[8px] text-nep-ink/50 uppercase font-bold tracking-wider">Căn cứ khảo cứu:</span>
            {result.source_ids.map((source: string) => (
              <button
                key={source}
                type="button"
                onClick={() => onOpenSource?.(source)}
                className="text-[9px] bg-nep-indigo/10 text-nep-indigo hover:bg-nep-indigo hover:text-white px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1"
                title={`Tra cứu văn bản / tài liệu: ${getSourceShortName(source)}`}
              >
                <span>{getSourceShortName(source)}</span>
                <span className="text-[8px] opacity-70">↗</span>
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
                  {getSlotName(selectedItem.slot)} · {getGroupName(selectedItem.group)}
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
            {/* Cảnh báo văn hóa riêng cho món này nếu có */}
            {ruleInsight?.offendingItems.some((i) => i.id === selectedItem.id) && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 mb-3 flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block text-[11px]">⚠️ Món đồ này đang nhận lưu ý văn hóa:</span>
                  <p className="text-[10px] text-amber-800 leading-snug">
                    {ruleInsight.offendingItems.find((i) => i.id === selectedItem.id)?.reason || ruleInsight.cleanMessage}
                  </p>
                  {ruleInsight.suggestedAction && (
                    <p className="text-[10px] text-amber-900 italic font-medium mt-1">
                      💡 {ruleInsight.suggestedAction}
                    </p>
                  )}
                </div>
              </div>
            )}

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

              {selectedItem.pricing && (() => {
                const isShopee = selectedItem.channel === "san_tmdt_shopee" || Boolean(selectedItem.brand?.url?.includes("shopee"));
                return (
                  <div className="p-3 rounded-xl bg-nep-paper/60 border border-nep-ink/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-nep-gold" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-nep-ink/70">
                          {isShopee ? "Mức giá niêm yết trên Shopee" : (selectedItem.pricing.is_estimate ? "Khoảng giá tham khảo may đo" : "Mức giá niêm yết")}
                        </span>
                      </div>
                      {isShopee ? (
                        <span className="text-[9px] bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded font-mono font-bold">
                          🛍️ Shopee May Sẵn
                        </span>
                      ) : selectedItem.pricing.is_estimate ? (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
                          Khảo sát thị trường
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs pt-0.5">
                      {selectedItem.pricing.buy_price ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-[11px] text-nep-ink/60">{isShopee ? "Giá mua:" : "May/Mua:"}</span>
                          <span className="font-bold text-nep-red text-sm font-mono">
                            {!isShopee && selectedItem.pricing.is_estimate ? "~" : ""}{selectedItem.pricing.buy_price.toLocaleString()}₫
                          </span>
                        </div>
                      ) : null}

                      {!isShopee && selectedItem.pricing.reference_range && (
                        <span className="text-[11px] text-nep-ink/60 font-mono">
                          (Phổ thông: {selectedItem.pricing.reference_range})
                        </span>
                      )}

                      {!isShopee && selectedItem.pricing.rental_price ? (
                        <div className="flex items-baseline gap-1 border-l border-nep-ink/10 pl-2">
                          <span className="text-[11px] text-nep-ink/60">Thuê:</span>
                          <span className="font-bold text-nep-indigo font-mono">
                            ~{selectedItem.pricing.rental_price.toLocaleString()}₫/ngày
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {selectedItem.pricing.note && (
                      <p className="text-[10px] text-nep-ink/60 leading-relaxed italic pt-1 border-t border-nep-ink/5">
                        *{selectedItem.pricing.note}
                      </p>
                    )}

                    {/* Nút liên hệ nhà may trực tiếp hoặc Mua trên Shopee */}
                    {(selectedItem.brand?.url || selectedItem.brand?.contact) && (
                      <div className="pt-2 flex items-center gap-2">
                        {selectedItem.brand.url && (
                          <a
                            href={selectedItem.brand.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors ${
                              isShopee
                                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
                                : "bg-nep-red/10 hover:bg-nep-red/15 text-nep-red"
                            }`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{isShopee ? "Đặt mua ngay trên Shopee" : "Liên hệ nhà may để nhận báo giá"}</span>
                          </a>
                        )}
                        {selectedItem.brand.contact && (
                          <a
                            href={`tel:${selectedItem.brand.contact.replace(/\s+/g, '')}`}
                            className="py-1.5 px-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-nep-ink font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            title={`Hotline: ${selectedItem.brand.contact}`}
                          >
                            <Phone className="w-3 h-3 text-secondary" />
                            <span className="font-mono text-[10px]">{selectedItem.brand.contact}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

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

      <div className="mt-4 w-full max-w-[360px] flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={handleToggleSave}
          className={`flex-1 py-3 px-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer border ${
            isSaved
              ? "bg-amber-100 border-amber-300 text-amber-900"
              : "bg-white hover:bg-nep-paper border-nep-ink/15 text-nep-ink"
          }`}
          title={isSaved ? "Gỡ khỏi tủ đồ đã lưu" : "Lưu vào tủ đồ yêu thích"}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-amber-600 text-amber-600" : "text-nep-ink/60"}`} />
          <span>{isSaved ? "Đã Lưu Tủ Đồ" : "Lưu Tủ Đồ"}</span>
        </button>

        <div className="flex-1">
          <ExportButton cardRef={cardRef} comboId={result.combo_id} />
        </div>
      </div>
    </div>
  );
}

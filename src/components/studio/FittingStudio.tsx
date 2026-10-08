"use client";

import { useState, useMemo } from "react";
import { 
  Check, 
  Shuffle, 
  RotateCcw, 
  Scissors, 
  ShoppingBag, 
  Store, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  Info, 
  X,
  Filter,
  Eye,
  SlidersHorizontal
} from "lucide-react";
import { TriggeredRule } from "@/lib/engine/rules";

function getVietnameseBadge(group?: string, slot?: string): string {
  const groupMap: Record<string, string> = {
    ao_ngu_than: "Ngũ Thân",
    ao_tac: "Áo Tấc",
    ao_dai: "Áo Dài",
    ao_tu_than: "Tứ Thân",
    ao_nhat_binh: "Nhật Bình",
    phu_kien: "Phụ Kiện",
  };
  const slotMap: Record<string, string> = {
    top: "Áo Chính",
    bottom: "Quần",
    footwear: "Giày/Guốc",
    bag: "Túi Xách",
    headwear: "Khăn/Mũ",
    jewelry: "Trang Sức",
  };
  const g = group ? (groupMap[group] || group) : "";
  const s = slot ? (slotMap[slot] || slot) : "";
  return g && s ? `${g} · ${s}` : g || s;
}

export interface FittingStudioProps {
  items: any[];
  selectedTop: any;
  selectedBottom: any;
  selectedFootwear: any;
  selectedAccessory: any | null;
  hasAccessory: boolean;
  onSelectTop: (item: any) => void;
  onSelectBottom: (item: any) => void;
  onSelectFootwear: (item: any) => void;
  onSelectAccessory: (item: any | null) => void;
  onToggleAccessory: (enabled: boolean) => void;
  onShuffle: () => void;
  onReset: () => void;
  occasion: string;
  onChangeOccasion: (occ: string) => void;
  harmonyResult: { score: number; label: string; description: string };
  rulesResult: { level: string; triggered_rules: TriggeredRule[] };
  onRequestAiLore: () => void;
  aiLoreLoading: boolean;
  customLore?: string;
}

export default function FittingStudio({
  items,
  selectedTop,
  selectedBottom,
  selectedFootwear,
  selectedAccessory,
  hasAccessory,
  onSelectTop,
  onSelectBottom,
  onSelectFootwear,
  onSelectAccessory,
  onToggleAccessory,
  onShuffle,
  onReset,
  occasion,
  onChangeOccasion,
  harmonyResult,
  rulesResult,
  onRequestAiLore,
  aiLoreLoading,
  customLore,
}: FittingStudioProps) {
  // Active part tab: "top" | "bottom" | "footwear" | "accessory"
  const [activeSlot, setActiveSlot] = useState<"top" | "bottom" | "footwear" | "accessory">("top");

  // Filters within slot
  const [topGroupFilter, setTopGroupFilter] = useState("all");
  const [topGenderFilter, setTopGenderFilter] = useState("all");
  const [footwearFilter, setFootwearFilter] = useState("all");

  const occasionsList = [
    { id: "di_le", name: "Đi Lễ / Viếng Chùa", icon: "🛕" },
    { id: "tet", name: "Tết Cổ Truyền", icon: "🧧" },
    { id: "ky_yeu", name: "Chụp Kỷ Yếu", icon: "📸" },
    { id: "dao_pho", name: "Dạo Phố / Check-in", icon: "🏙️" },
    { id: "bieu_dien", name: "Biểu Diễn / Sự Kiện", icon: "🎭" },
  ];

  // Filter items for active slot
  const displayedItems = useMemo(() => {
    if (activeSlot === "top") {
      return items.filter((i) => {
        if (i.slot !== "top") return false;
        if (topGroupFilter !== "all" && i.group !== topGroupFilter) return false;
        if (topGenderFilter !== "all" && i.gender !== topGenderFilter && i.gender !== "unisex") return false;
        return true;
      });
    }

    if (activeSlot === "bottom") {
      return items.filter((i) => i.slot === "bottom");
    }

    if (activeSlot === "footwear") {
      return items.filter((i) => {
        if (i.slot !== "footwear") return false;
        if (footwearFilter === "guoc" && !i.tags?.includes("co_dien") && !i.id.includes("guoc")) return false;
        if (footwearFilter === "sneaker" && !i.id.includes("sneaker")) return false;
        return true;
      });
    }

    if (activeSlot === "accessory") {
      return items.filter((i) => !["top", "bottom", "footwear"].includes(i.slot));
    }

    return [];
  }, [items, activeSlot, topGroupFilter, topGenderFilter, footwearFilter]);

  const slotsMeta = [
    {
      id: "top",
      name: "Áo Chính",
      slot: "top",
      icon: "👕",
      current: selectedTop,
    },
    {
      id: "bottom",
      name: "Quần Lụa",
      slot: "bottom",
      icon: "👖",
      current: selectedBottom,
    },
    {
      id: "footwear",
      name: "Giày / Guốc",
      slot: "footwear",
      icon: "👞",
      current: selectedFootwear,
    },
    {
      id: "accessory",
      name: "Phụ Kiện",
      slot: "bag",
      icon: "👜",
      current: hasAccessory ? selectedAccessory : null,
      optional: true,
    },
  ];

  return (
    <div className="space-y-5 animate-scene-enter">
      {/* 1. TOP HEADER & QUICK TOOLBAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-nep-ink/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-nep-red/10 text-nep-red">
              <Scissors className="w-4 h-4" />
            </span>
            <h2 className="font-heading text-lg font-bold text-nep-ink">
              Xưởng Ướm Thử Tự Do
            </h2>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live Preview
            </span>
          </div>
          <p className="text-xs text-nep-ink/65 mt-1 leading-relaxed">
            Tự tay ghép riêng từng Áo, Quần, Guốc &amp; Phụ kiện từ Kho Album. Diện mạo Lookbook bên phải cập nhật tức thời theo thời gian thực.
          </p>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onShuffle}
            className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-nep-ink text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Ngẫu nhiên chọn một bộ phối khác"
          >
            <Shuffle className="w-3.5 h-3.5 text-nep-red" />
            <span>Xáo Trộn</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="p-2 rounded-xl border border-nep-ink/15 hover:bg-white text-nep-ink/60 hover:text-nep-ink text-xs transition-colors cursor-pointer"
            title="Khôi phục bộ mẫu ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. OCCASION CONTEXT BAR (FOR REAL-TIME CULTURAL EVALUATION) */}
      <div className="p-3.5 rounded-2xl bg-nep-paper/70 border border-nep-ink/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-nep-ink font-mono uppercase tracking-wider">
            Ướm Thử Cho Dịp:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {occasionsList.map((occ) => (
              <button
                key={occ.id}
                type="button"
                onClick={() => onChangeOccasion(occ.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  occasion === occ.id
                    ? "bg-nep-red text-white shadow-xs"
                    : "bg-white/80 hover:bg-white text-nep-ink/75 border border-nep-ink/10"
                }`}
              >
                <span>{occ.icon}</span>
                <span>{occ.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
            rulesResult.level === "XANH"
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : rulesResult.level === "VANG"
              ? "bg-amber-50 text-amber-900 border-amber-300"
              : "bg-rose-50 text-rose-800 border-rose-300"
          }`}>
            <span>{rulesResult.level === "XANH" ? "✓ Chuẩn Mực" : rulesResult.level === "VANG" ? "⚠ Cần Lưu Ý" : "✕ Chưa Phù Hợp"}</span>
          </span>
          <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded-full bg-white border border-nep-ink/10 text-nep-indigo">
            🎨 {harmonyResult.score}/10
          </span>
        </div>
      </div>

      {/* Rule Warning Callout (If VANG or DO) */}
      {rulesResult.level === "VANG" && rulesResult.triggered_rules.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5 animate-scene-enter">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              Lưu ý quy tắc văn hóa ({rulesResult.triggered_rules[0]?.id}):
            </span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              {rulesResult.triggered_rules[0]?.message_vi}
            </p>
          </div>
        </div>
      )}

      {/* 3. SLOT NAVIGATION TABS (4 PARTS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {slotsMeta.map((slotItem) => {
          const isActive = activeSlot === slotItem.id;
          const currentImg = slotItem.current?.asset || slotItem.current?.image_url;
          return (
            <div
              key={slotItem.id}
              onClick={() => setActiveSlot(slotItem.id as any)}
              className={`p-3 rounded-2xl transition-all cursor-pointer relative border flex flex-col justify-between ${
                isActive
                  ? "bg-white border-nep-red ring-2 ring-nep-red/30 shadow-md scale-[1.01]"
                  : "bg-white/70 hover:bg-white border-nep-ink/10 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-nep-ink flex items-center gap-1.5">
                  <span>{slotItem.icon}</span>
                  <span>{slotItem.name}</span>
                </span>
                {slotItem.optional && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-nep-indigo bg-nep-indigo/10 px-1.5 py-0.2 rounded-md">
                    Tùy chọn
                  </span>
                )}
              </div>

              {/* Current Selected Thumbnail & Label */}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-9 h-9 rounded-lg bg-nep-paper/60 border border-nep-ink/5 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                  {currentImg ? (
                    <img
                      src={currentImg}
                      alt={slotItem.current?.name_vi || "Món đồ"}
                      className="w-full h-full object-contain drop-shadow-xs"
                    />
                  ) : (
                    <span className="text-[10px] text-nep-ink/40">✕</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-nep-ink block truncate leading-tight">
                    {slotItem.current?.name_vi || (slotItem.optional ? "Không dùng phụ kiện" : "Chưa chọn")}
                  </span>
                  {slotItem.current?.brand?.name && (
                    <span className="text-[9px] text-nep-ink/50 block truncate">
                      {slotItem.current.brand.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. SUB-FILTERS & TOGGLE BAR FOR ACTIVE SLOT */}
      <div className="p-3 rounded-xl bg-white border border-nep-ink/10 flex flex-wrap items-center justify-between gap-3">
        {activeSlot === "top" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-nep-ink/70 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-nep-red" />
              <span>Dáng Áo:</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {[
                { id: "all", label: "Tất cả" },
                { id: "ao_ngu_than", label: "Áo Ngũ Thân" },
                { id: "ao_tac", label: "Áo Tấc" },
                { id: "ao_dai", label: "Áo Dài" },
                { id: "ao_tu_than", label: "Áo Tứ Thân" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTopGroupFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    topGroupFilter === f.id
                      ? "bg-nep-red text-white"
                      : "bg-surface-container-high hover:bg-surface-container text-nep-ink"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-nep-ink/70 ml-2">Phái:</span>
            <div className="flex gap-1">
              {[
                { id: "all", label: "Tất cả" },
                { id: "nam", label: "Nam" },
                { id: "nu", label: "Nữ" },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setTopGenderFilter(g.id)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    topGenderFilter === g.id
                      ? "bg-nep-indigo text-white"
                      : "bg-surface-container-high hover:bg-surface-container text-nep-ink"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSlot === "bottom" && (
          <span className="text-xs text-nep-ink/70">
            Quần lụa ống suông truyền thống cạp cao, phù hợp phối với mọi phom áo cổ truyền.
          </span>
        )}

        {activeSlot === "footwear" && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-nep-ink/70">Phân loại:</span>
            <div className="flex gap-1">
              {[
                { id: "all", label: "Tất cả" },
                { id: "guoc", label: "Guốc Mộc Cổ Điển" },
                { id: "sneaker", label: "Sneaker Hiện Đại" },
              ].map((fw) => (
                <button
                  key={fw.id}
                  type="button"
                  onClick={() => setFootwearFilter(fw.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    footwearFilter === fw.id
                      ? "bg-nep-red text-white"
                      : "bg-surface-container-high hover:bg-surface-container text-nep-ink"
                  }`}
                >
                  {fw.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSlot === "accessory" && (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-nep-ink/70">
              Phụ kiện mang tính điểm xuyết. Bạn có thể phối thêm túi xách hoặc bỏ qua.
            </span>
            <div className="flex items-center gap-1.5 bg-nep-paper p-1 rounded-xl border border-nep-ink/10 shrink-0">
              <button
                type="button"
                onClick={() => onToggleAccessory(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !hasAccessory
                    ? "bg-nep-red text-white shadow-2xs"
                    : "text-nep-ink/60 hover:text-nep-ink"
                }`}
              >
                ✕ Không Dùng Phụ Kiện
              </button>
              <button
                type="button"
                onClick={() => onToggleAccessory(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  hasAccessory
                    ? "bg-emerald-700 text-white shadow-2xs"
                    : "text-nep-ink/60 hover:text-nep-ink"
                }`}
              >
                ✓ Có Mang Phụ Kiện
              </button>
            </div>
          </div>
        )}

        <span className="text-[11px] font-mono text-nep-ink/50 ml-auto">
          {displayedItems.length} mẫu trong album
        </span>
      </div>

      {/* 5. PRODUCT ALBUM GRID */}
      {activeSlot === "accessory" && !hasAccessory ? (
        <div className="p-10 rounded-2xl bg-white/70 border border-dashed border-nep-ink/20 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-nep-paper flex items-center justify-center text-xl mb-3">
            👜
          </div>
          <h4 className="font-heading text-sm font-bold text-nep-ink mb-1">
            Đang Tắt Phụ Kiện
          </h4>
          <p className="text-xs text-nep-ink/65 max-w-sm mb-4 leading-relaxed">
            Bộ phối của bạn hiện chỉ gồm Áo + Quần + Giày, giúp tôn trọn vẻ tối giản thanh thoát nguyên bản của cổ phục.
          </p>
          <button
            type="button"
            onClick={() => onToggleAccessory(true)}
            className="px-4 py-2 rounded-full bg-nep-red text-white text-xs font-bold shadow-xs hover:bg-nep-red/90 transition-colors cursor-pointer"
          >
            Bật Phụ Kiện &amp; Chọn Túi
          </button>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white/60 border border-nep-ink/10 text-center text-nep-ink/60 text-xs">
          Không tìm thấy món đồ nào phù hợp với bộ lọc.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {displayedItems.map((item) => {
            const isSelected = 
              (activeSlot === "top" && selectedTop?.id === item.id) ||
              (activeSlot === "bottom" && selectedBottom?.id === item.id) ||
              (activeSlot === "footwear" && selectedFootwear?.id === item.id) ||
              (activeSlot === "accessory" && hasAccessory && selectedAccessory?.id === item.id);

            const imgUrl = item.asset || item.image_url;
            const isShopee = item.channel === "san_tmdt_shopee" || Boolean(item.brand?.url?.includes("shopee"));

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (activeSlot === "top") onSelectTop(item);
                  else if (activeSlot === "bottom") onSelectBottom(item);
                  else if (activeSlot === "footwear") onSelectFootwear(item);
                  else if (activeSlot === "accessory") {
                    onToggleAccessory(true);
                    onSelectAccessory(item);
                  }
                }}
                className={`p-3.5 rounded-2xl transition-all cursor-pointer relative flex flex-col justify-between group ${
                  isSelected
                    ? "bg-white border-2 border-nep-red ring-2 ring-nep-red/25 shadow-md scale-[1.01]"
                    : "bg-white/80 hover:bg-white border border-nep-ink/10 shadow-xs hover:shadow-sm"
                }`}
              >
                {/* Selected Indicator Checkmark */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 z-10 bg-nep-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Check className="w-3 h-3" />
                    <span>Đang ướm thử</span>
                  </div>
                )}

                <div>
                  {/* Image Presentation */}
                  <div className="w-full h-36 rounded-xl bg-nep-paper/50 border border-nep-ink/5 p-2 mb-3 flex items-center justify-center overflow-hidden relative">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.name_vi}
                        className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xs text-nep-ink/30">Không có ảnh</span>
                    )}

                    {/* Color Swatch Dot */}
                    {item.colors && item.colors[0] && (
                      <div 
                        className="absolute bottom-2 left-2 w-4 h-4 rounded-full border border-black/15 shadow-2xs"
                        style={{ backgroundColor: item.colors[0].hex }}
                        title={`Màu: ${item.colors[0].name}`}
                      />
                    )}
                  </div>

                  {/* Title & Group */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider font-mono text-nep-red">
                      {getVietnameseBadge(item.group, item.slot)}
                    </span>
                    {isShopee ? (
                      <span className="text-[9px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                        🛍️ Shopee
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium text-nep-indigo bg-nep-indigo/10 px-1.5 py-0.2 rounded">
                        🧵 May đo
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading text-xs font-bold text-nep-ink line-clamp-2 leading-tight mb-1">
                    {item.name_vi}
                  </h4>

                  {item.brand?.name && (
                    <div className="flex items-center gap-1 text-[10px] text-nep-ink/60 truncate">
                      <Store className="w-3 h-3 text-secondary shrink-0" />
                      <span className="truncate">{item.brand.name}</span>
                    </div>
                  )}
                </div>

                {/* Price Display */}
                <div className="mt-2.5 pt-2 border-t border-nep-ink/5 flex items-center justify-between">
                  <span className="text-[10px] text-nep-ink/50 uppercase font-semibold">
                    {isShopee ? "Mua Shopee" : "Giá tham khảo"}
                  </span>
                  <span className="font-mono text-xs font-bold text-nep-red">
                    {item.pricing?.buy_price ? `${item.pricing.buy_price.toLocaleString()}₫` : "Xem chi tiết"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. AI CULTURAL LORE GENERATION CALLOUT */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-nep-indigo/5 via-amber-500/5 to-nep-red/5 border border-nep-ink/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-nep-gold" />
            <h4 className="font-heading text-xs font-bold text-nep-ink">
              Khám Phá Chiều Sâu Văn Hóa Riêng Cho Bộ Phối Của Bạn
            </h4>
          </div>
          <p className="text-[11px] text-nep-ink/70 leading-relaxed">
            Bạn vừa tự do ghép phối trang phục. Nhấn để AI Nếp phân tích ý nghĩa thẩm mỹ và diễn giải văn hóa độc bản.
          </p>
        </div>

        <button
          type="button"
          disabled={aiLoreLoading}
          onClick={onRequestAiLore}
          className="px-4 py-2 rounded-full bg-nep-indigo hover:bg-nep-indigo/90 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-60"
        >
          {aiLoreLoading ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin text-nep-gold" />
              <span>AI Đang Phân Tích...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-nep-gold" />
              <span>Nhờ AI Viết Lời Bình</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

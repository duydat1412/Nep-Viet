"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Check, 
  ExternalLink, 
  Bookmark, 
  Share2, 
  Volume2, 
  VolumeX,
  Store,
  RotateCcw,
  Tag,
  Palette,
  Sliders,
  ShieldCheck,
  Eye,
  Camera,
  BookOpen,
  Scissors
} from "lucide-react";
import LookbookCard from "@/components/lookbook/LookbookCard";
import { LoadingSkeleton, ErrorCard, ChuaDuCanCuCard, FallbackBanner } from "@/components/lookbook/CardStates";
import HeritageSourcesModal from "@/components/codex/HeritageSourcesModal";
import SavedLooksModal from "@/components/lookbook/SavedLooksModal";
import { getSavedLooks } from "@/lib/storage/favorites";
import FittingStudio from "@/components/studio/FittingStudio";
import { calculateHarmony } from "@/lib/engine/harmony";
import { evaluateRules } from "@/lib/engine/rules";
import itemsData from "@/../data/items.json";

export default function Home() {
  // Styling Studio States
  const [occasion, setOccasion] = useState("di_le"); // di_le, tet, ky_yeu, dao_pho, bieu_dien
  const [silhouette, setSilhouette] = useState("ao_ngu_than"); // ao_ngu_than, ao_tac, ao_dai, ao_tu_than
  const [gender, setGender] = useState<"nam" | "nu">("nam"); // nam, nu
  const [styleLevel, setStyleLevel] = useState("truyen_thong"); // truyen_thong, cach_tan_nhe, phoi_hien_dai
  const [colorway, setColorway] = useState("tram"); // tram, tuoi, pastel, ngu_hanh
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [activeMode, setActiveMode] = useState("ceremonial");

  // Codex & Source References State
  const [codexOpen, setCodexOpen] = useState(false);
  const [focusedSourceId, setFocusedSourceId] = useState<string | null>(null);

  // Recommendation Result State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Saved Looks (Tủ đồ yêu thích trên máy) State
  const [savedLooksOpen, setSavedLooksOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Mode Switcher: Fitting Studio vs AI Wizard
  const [creationMode, setCreationMode] = useState<"fitting" | "wizard">("fitting");
  const [catalogItems, setCatalogItems] = useState<any[]>(itemsData as any[]);
  const [fittingTop, setFittingTop] = useState<any>(() => 
    (itemsData as any[]).find((i) => i.id === "ao_ngu_than_nam_xanh_01") ||
    (itemsData as any[]).find((i) => i.slot === "top")
  );
  const [fittingBottom, setFittingBottom] = useState<any>(() => 
    (itemsData as any[]).find((i) => i.id === "quan_trang_01") ||
    (itemsData as any[]).find((i) => i.slot === "bottom")
  );
  const [fittingFootwear, setFittingFootwear] = useState<any>(() => 
    (itemsData as any[]).find((i) => i.id === "guoc_moc_01") ||
    (itemsData as any[]).find((i) => i.slot === "footwear")
  );
  const [fittingAccessory, setFittingAccessory] = useState<any>(() => 
    (itemsData as any[]).find((i) => i.id === "tote_kem_01") ||
    (itemsData as any[]).find((i) => !["top", "bottom", "footwear"].includes(i.slot))
  );
  const [hasAccessory, setHasAccessory] = useState(true);
  const [customLyDo, setCustomLyDo] = useState<string | null>(null);
  const [customLore, setCustomLore] = useState<string | null>(null);
  const [aiLoreLoading, setAiLoreLoading] = useState(false);

  // Sync catalog with newly ingested products from Shopee/Admin
  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          setCatalogItems(data.products);
        }
      })
      .catch(() => {});
  }, []);

  // Fitting Studio real-time calculations
  const fittingItems = useMemo(() => {
    const list = [fittingTop, fittingBottom, fittingFootwear].filter(Boolean);
    if (hasAccessory && fittingAccessory) {
      list.push(fittingAccessory);
    }
    return list;
  }, [fittingTop, fittingBottom, fittingFootwear, fittingAccessory, hasAccessory]);

  const fittingHarmony = useMemo(() => {
    const colors = fittingItems.flatMap((i) => i.colors || []);
    if (colors.length === 0) return { score: 9.0, label: "Hài hòa", description: "Bảng màu cân đối tự nhiên" };
    return calculateHarmony(colors);
  }, [fittingItems]);

  const fittingRules = useMemo(() => {
    const fakeCombo = {
      combo_id: "custom_fitting",
      item_ids: fittingItems.map((i) => i.id),
      items: fittingItems,
      style_level: styleLevel,
    };
    return evaluateRules(fakeCombo, occasion, styleLevel);
  }, [fittingItems, occasion, styleLevel]);

  const fittingResult = useMemo(() => {
    return {
      combo_id: `custom_fitting_${fittingTop?.id || "top"}_${fittingBottom?.id || "bot"}`,
      outfit_item_ids: fittingItems.map((i) => i.id),
      muc_canh_bao: fittingRules.level as any,
      diem_hai_hoa_mau: fittingHarmony.score,
      ly_do_phoi_do: customLyDo || `Bộ phối tự do từ Kho Di Sản kết hợp hài hòa ${fittingItems.map(i => i.name_vi).join(" + ")}.`,
      nhan_xet_mau: fittingHarmony.description || `Đạt ${fittingHarmony.score}/10 điểm hòa sắc (${fittingHarmony.label}).`,
      dien_giai_van_hoa: customLore || fittingTop?.craftsmanship_lore || "Trang phục giữ gìn nếp xưa đoan chính kết hợp nét tân thời trang nhã.",
      source_ids: fittingTop?.source_ids || ["N1", "S_HN1665"],
      triggered_rules: fittingRules.triggered_rules || [],
      items: fittingItems,
    };
  }, [fittingItems, fittingRules, fittingHarmony, customLyDo, customLore, fittingTop, fittingBottom]);

  const handleShuffle = () => {
    const tops = catalogItems.filter((i) => i.slot === "top");
    const bottoms = catalogItems.filter((i) => i.slot === "bottom");
    const shoes = catalogItems.filter((i) => i.slot === "footwear");
    const accessories = catalogItems.filter((i) => !["top", "bottom", "footwear"].includes(i.slot));

    if (tops.length > 0) setFittingTop(tops[Math.floor(Math.random() * tops.length)]);
    if (bottoms.length > 0) setFittingBottom(bottoms[Math.floor(Math.random() * bottoms.length)]);
    if (shoes.length > 0) setFittingFootwear(shoes[Math.floor(Math.random() * shoes.length)]);
    if (accessories.length > 0 && hasAccessory) setFittingAccessory(accessories[Math.floor(Math.random() * accessories.length)]);
    setCustomLyDo(null);
    setCustomLore(null);
  };

  const handleResetFitting = () => {
    const defaultTop = catalogItems.find((i) => i.id === "ao_ngu_than_nam_xanh_01") || catalogItems.find((i) => i.slot === "top");
    const defaultBottom = catalogItems.find((i) => i.id === "quan_trang_01") || catalogItems.find((i) => i.slot === "bottom");
    const defaultShoes = catalogItems.find((i) => i.id === "guoc_moc_01") || catalogItems.find((i) => i.slot === "footwear");
    const defaultAcc = catalogItems.find((i) => i.id === "tote_kem_01") || catalogItems.find((i) => !["top", "bottom", "footwear"].includes(i.slot));
    setFittingTop(defaultTop);
    setFittingBottom(defaultBottom);
    setFittingFootwear(defaultShoes);
    setFittingAccessory(defaultAcc);
    setHasAccessory(true);
    setCustomLyDo(null);
    setCustomLore(null);
  };

  const handleRequestAiLore = async () => {
    setAiLoreLoading(true);
    try {
      const res = await fetch("/api/recommend/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          items: fittingItems,
          harmony: fittingHarmony,
          rules: fittingRules,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.ly_do_phoi_do) setCustomLyDo(data.ly_do_phoi_do);
        if (data.dien_giai_van_hoa) setCustomLore(data.dien_giai_van_hoa);
      }
    } catch (err) {
      console.error("AI lore error:", err);
    } finally {
      setAiLoreLoading(false);
    }
  };

  useEffect(() => {
    const updateCount = () => {
      setSavedCount(getSavedLooks().length);
    };
    updateCount();
    window.addEventListener("nep_viet_favorites_updated", updateCount);
    return () => window.removeEventListener("nep_viet_favorites_updated", updateCount);
  }, []);

  // Form submit trigger
  const handleGenerate = async (
    customOccasion?: string, 
    customGroup?: string, 
    customStyle?: string, 
    customGender?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: customOccasion || occasion,
          group: customGroup || silhouette,
          gender: customGender || gender,
          style_level: customStyle || styleLevel,
          tone: colorway,
        }),
      });

      if (!res.ok) throw new Error("Không thể kết nối đến máy chủ.");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tạo gợi ý.");
    } finally {
      setLoading(false);
    }
  };

  const occasions = [
    {
      id: "di_le",
      name: "Đi Lễ / Viếng Chùa",
      en: "Sacred Temple Visit",
      desc: "Chốn tôn nghiêm, kiểm soát trang phục đoan trang, nghiêm cẩn và kín đáo.",
      badge: "Nghi Lễ Tôn Nghiêm",
      icon: "🛕",
    },
    {
      id: "tet",
      name: "Khai Xuân Tết Cổ Truyền",
      en: "Lunar New Year Gathering",
      desc: "Du xuân chúc phúc đầu năm, chuộng sắc màu tươi sáng, kiêng kỵ toàn đen trắng.",
      badge: "Hỷ Khí Cát Tường",
      icon: "🧧",
    },
    {
      id: "ky_yeu",
      name: "Chụp Kỷ Yếu / Học Đường",
      en: "Graduation Youth Album",
      desc: "Lưu giữ thanh xuân học trò, tự do thể hiện phong cách trẻ trung năng động.",
      badge: "Thanh Xuân Tự Do",
      icon: "📸",
    },
    {
      id: "dao_pho",
      name: "Dạo Phố / Check-in Di Tích",
      en: "Urban Stroll & Check-in",
      desc: "Chuyển động nhẹ nhàng thoải mái, giao thoa hơi thở đô thị và nét di sản.",
      badge: "Thường Phục Đô Thị",
      icon: "🏙️",
    },
    {
      id: "bieu_dien",
      name: "Biểu Diễn Nghệ Thuật",
      en: "Stage & Cultural Performance",
      desc: "Sân khấu diễn xướng di sản, tôn vinh nghệ thuật truyền thống Bắc - Trung - Nam.",
      badge: "Diễn Xướng Di Sản",
      icon: "🎭",
    },
  ];

  const silhouettes = [
    {
      id: "ao_ngu_than",
      name: "Áo Ngũ Thân Tay Chẽn",
      en: "Fitted Mandarin Cut",
      desc: "Năm thân biểu trưng tứ thân phụ mẫu và chính mình, ôm gọn cổ đứng trang nhã.",
      era: "Chúa Vũ Vương (1744) & Vua Minh Mạng (1827)",
      group: "ao_ngu_than",
    },
    {
      id: "ao_tac",
      name: "Áo Tấc Đương Đại",
      en: "Wide-Sleeve Imperial Robe",
      desc: "Tay thụng rộng xẻ tà phóng khoáng, lễ phục chuẩn mực triều Nguyễn trong khánh tiết.",
      era: "Triều Nguyễn (1802 – 1945)",
      group: "ao_tac",
    },
    {
      id: "ao_dai",
      name: "Áo Dài Truyền Thống",
      en: "Heritage Long Tunic",
      desc: "Cổ đứng hai phân thanh nhã, hai tà bay bổng tôn vinh dáng vẻ đoan trang.",
      era: "Thời Lê Sơ (1428) – TK XIX-XX",
      group: "ao_dai",
    },
    {
      id: "ao_tu_than",
      name: "Áo Tứ Thân Bắc Bộ",
      en: "Four-Panel Kinh Bac Robe",
      desc: "Bốn vạt mộc mạc duyên dáng, đậm đà hồn quê dân ca quan họ Bắc Ninh.",
      era: "Dân Gian Bắc Bộ",
      group: "ao_tu_than",
    },
  ];

  const styleLevels = [
    {
      id: "truyen_thong",
      name: "Truyền Thống Nguyên Bản",
      en: "Heritage Canonical",
      desc: "Giữ trọn nếp xưa đoan chính, tuân thủ nguyên bản quy thức cổ phục, phối cùng guốc mộc và quần lụa suông.",
      badge: "Phù Hợp Điển Chế (Xanh)",
      badgeColor: "bg-emerald-100 text-emerald-800",
      icon: "🏛️",
    },
    {
      id: "cach_tan_nhe",
      name: "Cách Tân Nhẹ Nhàng",
      en: "Refined Contemporary",
      desc: "Tiết chế các lớp áo gò bó, phom dáng buông suông thoải mái, phù hợp cho nhịp sống thường nhật.",
      badge: "Thoải Mái & Tối Giản",
      badgeColor: "bg-sky-100 text-sky-800",
      icon: "✨",
    },
    {
      id: "phoi_hien_dai",
      name: "Phối Hiện Đại (Gen Z)",
      en: "Neo-Heritage Streetwear",
      desc: "Giao thoa táo bạo cùng sneaker trắng, túi canvas đường phố; tạo ấn tượng trẻ trung cá tính.",
      badge: "Cần Lưu Ý Khi Đi Lễ (Vàng)",
      badgeColor: "bg-amber-100 text-amber-800",
      icon: "🔥",
    },
  ];

  const colors = [
    { id: "tram", name: "Chàm Đại Thanh", hex: "#26466D", role: "Chủ Đạo", desc: "Thủy Sinh Mộc · Vững Chãi" },
    { id: "tuoi", name: "Bạch Ngà Giấy Dó", hex: "#FFF8F5", role: "Tương Hỗ", desc: "Bạch Ngà Tinh Khiết · Kim" },
    { id: "pastel", name: "Vàng Hoàng Cúc", hex: "#FDC668", role: "Điểm Xuyết", desc: "Quang Minh Chính Đại · Thổ" },
    { id: "ngu_hanh", name: "Đỏ Chu Sa", hex: "#B5362B", role: "Dấu Triện", desc: "Hỷ Khí Khai Xuân · Hỏa" },
  ];

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      {/* 1. TOP EDITORIAL APP HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(43,33,24,0.04)]">
        <div className="h-20 max-w-[1440px] mx-auto px-5 lg:px-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            {/* Seal Emblem */}
            <a href="/" className="relative group block shrink-0">
              <img 
                src="/favicon.png" 
                alt="Nếp Việt" 
                className="w-11 h-11 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              />
            </a>
            <div className="flex flex-col">
              <a className="font-heading text-lg font-bold tracking-wider uppercase text-on-surface hover:text-primary transition-colors leading-tight" href="#">
                NẾP VIỆT
              </a>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
                AI Heritage Stylist · Nét Riêng
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1.5 bg-surface-container-low/90 p-1 rounded-full border border-nep-ink/10 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setCreationMode("fitting");
                const el = document.getElementById("studio-workspace");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                creationMode === "fitting"
                  ? "bg-primary-container text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <Scissors className="w-3.5 h-3.5 text-nep-gold" />
              <span>Ướm Thử Từng Part</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-nep-gold/20 text-nep-gold rounded font-mono uppercase font-bold">Live</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCreationMode("wizard");
                const el = document.getElementById("studio-workspace");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                creationMode === "wizard"
                  ? "bg-primary-container text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-nep-gold" />
              <span>Thiết Kế Tạo Nhu Cầu</span>
            </button>

            <div className="w-px h-4 bg-nep-ink/10 mx-0.5" />

            <button
              onClick={() => { setFocusedSourceId(null); setCodexOpen(true); }}
              type="button"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-primary hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Điển Thư Khảo Cứu</span>
            </button>
            <a 
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors" 
              href="/admin/ingest"
            >
              Admin Ingest
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setAudioPlaying(!audioPlaying)}
              type="button"
              className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant text-xs transition-colors cursor-pointer"
            >
              {audioPlaying ? <Volume2 className="w-3.5 h-3.5 text-secondary animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{audioPlaying ? "Đang phát: Lưu Thủy" : "Nhã Nhạc Ambience"}</span>
            </button>

            <button
              onClick={() => setSavedLooksOpen(true)}
              type="button"
              className="px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 font-mono text-[11px] font-bold text-amber-900 border border-amber-300/60 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              title="Xem tủ đồ các bản phối đã lưu"
            >
              <Bookmark className={`w-3 h-3 ${savedCount > 0 ? "fill-amber-700 text-amber-700" : "text-amber-800"}`} />
              <span>Tủ Đồ ({savedCount})</span>
            </button>

            <button
              onClick={() => { setFocusedSourceId(null); setCodexOpen(true); }}
              type="button"
              className="px-3.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high font-mono text-[11px] font-bold text-nep-red border border-nep-red/20 flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3 h-3" />
              <span>Nguồn Tư Liệu</span>
            </button>

            <a 
              href="/admin/ingest"
              className="px-3.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high font-mono text-[11px] font-bold text-nep-indigo border border-nep-indigo/20 flex items-center gap-1"
            >
              <Store className="w-3 h-3" />
              <span>Admin Studio</span>
            </a>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full pt-24 bg-surface pb-16">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10">
          
          {/* 2. EDITORIAL HERO BANNER */}
          <header className="mb-10 relative pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-container inline-block animate-pulse"></span>
                <span className="text-[11px] uppercase tracking-widest text-primary-container font-bold font-mono">
                  BỘ ĐÔI DI SẢN &amp; ĐƯƠNG ĐẠI · THE HERITAGE ATELIER
                </span>
                <span className="text-secondary text-xs">✦</span>
                <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Phòng Giám Tuyển Số 04
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setFocusedSourceId(null); setCodexOpen(true); }}
                className="flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-container-highest px-3 py-1 rounded-full shadow-2xs transition-colors cursor-pointer group"
                title="Nhấn để xem Điển Thư & Danh Mục Nguồn Khảo Cứu"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-secondary group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold text-on-surface">Đối Chiếu Điển Chế &amp; Quy Tắc Văn Hóa</span>
                <span className="text-[10px] text-primary font-mono font-bold">↗</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              <div className="lg:col-span-6">
                <h1 className="font-heading text-4xl lg:text-5xl text-on-surface tracking-tight font-extrabold leading-tight">
                  Nếp Áo Thời Gian <span className="italic font-normal text-secondary font-heading text-3xl lg:text-4xl">— Giám Tuyển Cổ Phục</span>
                </h1>
                <p className="text-sm lg:text-base text-on-surface-variant max-w-2xl mt-2 leading-relaxed">
                  Lựa chọn ướm thử từng bộ phận từ album di sản hoặc điền form nhu cầu để AI tự động phối theo điển chế và bảng màu chuẩn mực.
                </p>
              </div>

              {/* 2 Cách Tạo Lookbook: Ướm Thử Từng Part vs Thiết Kế Tạo Nhu Cầu */}
              <div className="lg:col-span-6 flex lg:justify-end">
                <div className="inline-flex p-1.5 bg-surface-container-low rounded-2xl gap-1.5 shadow-sm border border-nep-ink/10 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      setCreationMode("fitting");
                      const el = document.getElementById("studio-workspace");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    type="button"
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      creationMode === "fitting" 
                        ? "bg-primary-container text-on-primary shadow-xs ring-1 ring-primary-container" 
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <Scissors className="w-4 h-4 text-nep-gold" />
                    <span>Cách 1: Chọn Từng Part (Ướm Thử)</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-nep-gold/20 text-nep-gold rounded font-mono uppercase font-bold">Live 0ms</span>
                  </button>
                  <button 
                    onClick={() => {
                      setCreationMode("wizard");
                      const el = document.getElementById("studio-workspace");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    type="button"
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      creationMode === "wizard" 
                        ? "bg-primary-container text-on-primary shadow-xs ring-1 ring-primary-container" 
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-nep-gold" />
                    <span>Cách 2: Thiết Kế Tạo Nhu Cầu (Điền Form)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-surface-container-highest mt-6 flex items-center justify-center">
              <span className="bg-surface px-4 text-secondary text-[10px] tracking-widest font-mono">❖ DẤU ẤN VĂN HIẾN ❖</span>
            </div>
          </header>

          {/* 3. MAIN SPLIT ATELIER GRID (Two Columns Layout) */}
          <div id="studio-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* CỘT TRÁI: Interactive Styling Studio / Fitting Room (~58%) */}
            <section className="lg:col-span-7 flex flex-col gap-6">
              
              {/* CHUYỂN ĐỔI CHẾ ĐỘ TẠO LOOKBOOK */}
              <div className="bg-surface-container-lowest p-2 rounded-2xl shadow-sm border border-nep-ink/10 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setCreationMode("fitting")}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      creationMode === "fitting"
                        ? "bg-primary-container text-on-primary shadow-xs ring-1 ring-primary-container"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <Scissors className="w-4 h-4 text-nep-gold" />
                    <span>Cách 1: Chọn Từng Part (Ướm Thử)</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-nep-gold/20 text-nep-gold rounded font-mono uppercase font-bold">Mới</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreationMode("wizard")}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      creationMode === "wizard"
                        ? "bg-primary-container text-on-primary shadow-xs ring-1 ring-primary-container"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-nep-gold" />
                    <span>Cách 2: Thiết Kế Tạo Nhu Cầu (Điền Form AI)</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-on-surface-variant px-3 py-1 bg-surface-container-low rounded-xl">
                  {creationMode === "fitting" ? (
                    <span>💡 Ướm thử trực tiếp từng món &amp; xem thẻ Lookbook song song</span>
                  ) : (
                    <span>🤖 AI tự động phối theo ngữ cảnh &amp; quy chuẩn</span>
                  )}
                </div>
              </div>

              {creationMode === "fitting" ? (
                <FittingStudio
                  items={catalogItems}
                  selectedTop={fittingTop}
                  selectedBottom={fittingBottom}
                  selectedFootwear={fittingFootwear}
                  selectedAccessory={fittingAccessory}
                  hasAccessory={hasAccessory}
                  onSelectTop={(item) => {
                    setFittingTop(item);
                    setCustomLyDo(null);
                    setCustomLore(null);
                  }}
                  onSelectBottom={(item) => {
                    setFittingBottom(item);
                    setCustomLyDo(null);
                    setCustomLore(null);
                  }}
                  onSelectFootwear={(item) => {
                    setFittingFootwear(item);
                    setCustomLyDo(null);
                    setCustomLore(null);
                  }}
                  onSelectAccessory={(item) => {
                    setFittingAccessory(item);
                    setCustomLyDo(null);
                    setCustomLore(null);
                  }}
                  onToggleAccessory={(enabled) => {
                    setHasAccessory(enabled);
                    setCustomLyDo(null);
                    setCustomLore(null);
                  }}
                  onShuffle={handleShuffle}
                  onReset={handleResetFitting}
                  occasion={occasion}
                  onChangeOccasion={(occ) => setOccasion(occ)}
                  harmonyResult={fittingHarmony}
                  rulesResult={fittingRules}
                  onRequestAiLore={handleRequestAiLore}
                  aiLoreLoading={aiLoreLoading}
                  customLore={customLore || undefined}
                />
              ) : (
                <>
                  {/* Step Navigation Progress Tabs */}
                  <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-nep-ink/5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-primary tracking-wider uppercase font-mono">01. NGỮ CẢNH DỊP</span>
                    <span className="text-xs text-on-surface font-semibold truncate">
                      {occasions.find(o => o.id === occasion)?.name}
                    </span>
                    <div className="h-1 w-full bg-primary-container rounded-full mt-1.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-secondary tracking-wider uppercase font-mono">02. PHOM &amp; GIỚI TÍNH</span>
                    <span className="text-xs text-on-surface font-semibold truncate">
                      {gender === "nam" ? "Nam" : "Nữ"} · {silhouettes.find(s => s.id === silhouette)?.name.split(" ")[0]}
                    </span>
                    <div className="h-1 w-full bg-secondary-container rounded-full mt-1.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-nep-indigo tracking-wider uppercase font-mono">03. PHONG CÁCH</span>
                    <span className="text-xs text-on-surface font-semibold truncate">
                      {styleLevels.find(s => s.id === styleLevel)?.name}
                    </span>
                    <div className="h-1 w-full bg-nep-indigo/60 rounded-full mt-1.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase font-mono">04. NGŨ SẮC</span>
                    <span className="text-xs text-on-surface font-semibold truncate">
                      {colors.find(c => c.id === colorway)?.name}
                    </span>
                    <div className="h-1 w-full bg-primary-container/40 rounded-full mt-1.5" />
                  </div>
                </div>
              </div>

              {/* BƯỚC 01: DỊP XUẤT HIỆN & NGỮ CẢNH */}
              <article className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-nep-ink/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading text-lg font-bold text-on-surface">Bước 01: Ngữ Cảnh &amp; Dịp Xuất Hiện</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold font-mono">
                        YẾU TỐ QUYẾT ĐỊNH QUY TẮC
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Quy chuẩn văn hóa được hệ thống Rule Engine áp dụng dựa trên không gian và mục đích diện y phục.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {occasions.map((occ) => {
                    const isSelected = occasion === occ.id;
                    return (
                      <div
                        key={occ.id}
                        onClick={() => {
                          setOccasion(occ.id);
                        }}
                        className={`p-3.5 rounded-xl transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-surface-container-low shadow-md ring-2 ring-primary-container scale-[1.01]"
                            : "bg-surface-container-lowest hover:bg-surface-container-low border border-nep-ink/10"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">
                            ✓
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{occ.icon}</span>
                            <h3 className="font-heading text-sm font-bold text-on-surface">
                              {occ.name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-on-surface-variant leading-relaxed">
                            {occ.desc}
                          </p>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-nep-ink/5 flex items-center justify-between">
                          <span className="text-[9px] font-bold tracking-wider text-secondary uppercase font-mono">
                            {occ.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>

              {/* BƯỚC 02: PHOM DÁNG CỔ PHỤC & GIỚI TÍNH */}
              <article className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-nep-ink/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-on-surface">Bước 02: Kiến Trúc Phom Dáng &amp; Giới Tính</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Khảo cứu phom dáng truyền thống theo điển chế triều đại kết hợp đối tượng mặc.
                    </p>
                  </div>

                  {/* Gender Selector Toggle */}
                  <div className="inline-flex p-1 bg-surface-container-high rounded-full gap-1 border border-nep-ink/10 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setGender("nam")}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        gender === "nam" ? "bg-primary-container text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span>👨 Quý Nam</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("nu")}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        gender === "nu" ? "bg-primary-container text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span>👩 Quý Cô</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {silhouettes.map((s) => {
                    const isSelected = silhouette === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => { setSilhouette(s.id); }}
                        className={`p-3.5 rounded-xl transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-surface-container-low shadow-md ring-2 ring-primary-container scale-[1.01]"
                            : "bg-surface-container-lowest hover:bg-surface-container-low border border-nep-ink/10"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">
                            ✓
                          </div>
                        )}
                        <div>
                          <h3 className="font-heading text-sm font-bold text-on-surface">
                            {s.name}
                          </h3>
                          <p className="text-[10px] text-secondary mt-0.5 font-medium">{s.en}</p>
                          <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed">
                            {s.desc}
                          </p>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-nep-ink/5">
                          <span className="text-[9px] font-bold tracking-wider text-secondary uppercase font-mono line-clamp-1">
                            {s.era}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>

              {/* BƯỚC 03: MỨC ĐỘ PHONG CÁCH & DIỄN GIẢI */}
              <article className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-nep-ink/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-on-surface">Bước 03: Mức Độ Phong Cách &amp; Diễn Giải</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Quyết định mức độ nguyên bản hay phá cách hiện đại, trực tiếp định đoạt các phụ kiện đi kèm.
                    </p>
                  </div>
                  <span className="text-[10px] text-secondary font-mono tracking-wider font-bold">STYLE CODEX</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {styleLevels.map((lvl) => {
                    const isSelected = styleLevel === lvl.id;
                    return (
                      <div
                        key={lvl.id}
                        onClick={() => setStyleLevel(lvl.id)}
                        className={`p-4 rounded-xl transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-surface-container-low shadow-md ring-2 ring-primary-container scale-[1.01]"
                            : "bg-surface-container-lowest hover:bg-surface-container-low border border-nep-ink/10"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">
                            ✓
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xl">{lvl.icon}</span>
                            <div>
                              <h3 className="font-heading text-sm font-bold text-on-surface">
                                {lvl.name}
                              </h3>
                              <span className="text-[10px] text-secondary font-medium">{lvl.en}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-on-surface-variant leading-relaxed mt-1">
                            {lvl.desc}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-nep-ink/5 flex items-center justify-between">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${lvl.badgeColor}`}>
                            {lvl.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>

              {/* BƯỚC 04: BẢNG MÀU NGŨ SẮC TƯƠNG SINH */}
              <article className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-nep-ink/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-on-surface">Bước 04: Bảng Màu &amp; Ngũ Sắc Tương Sinh Âm Dương</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Bảng màu ứng dụng thuật đối ngẫu sắc chàm truyền thống và ngà mộc giấy dó.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-secondary uppercase font-bold block font-mono">Thước Đo Ngũ Hành</span>
                    <span className="font-heading text-base font-bold text-primary">Thủy Sinh Mộc · Hòa Hợp</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {colors.map((c) => {
                    const isSelected = colorway === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setColorway(c.id)}
                        className={`p-3 rounded-xl flex flex-col items-center text-center cursor-pointer transition-all ${
                          isSelected
                            ? "bg-surface-container-low ring-2 ring-primary-container shadow-sm"
                            : "bg-surface-container-lowest hover:bg-surface-container-low border border-nep-ink/10"
                        }`}
                      >
                        <div 
                          className="w-10 h-10 rounded-full shadow-inner mb-2 border border-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs font-bold text-on-surface">{c.name}</span>
                        <span className="text-[9px] text-on-surface-variant font-mono mt-0.5">{c.role}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-surface-container-high p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <span className="font-medium text-on-surface">Phối thức: Chàm Sâu Lắng (Thủy) dưỡng Bạch Ngà Tinh Khiết (Kim)</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-secondary font-bold font-mono">
                    Thủy Sinh Mộc · Vững Chãi
                  </span>
                </div>
              </article>

                {/* Big Action CTA */}
                <div className="mt-6 pt-4 border-t border-nep-ink/10 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleGenerate()}
                    disabled={loading}
                    type="button"
                    className="flex-1 min-w-[240px] py-3.5 px-6 rounded-full bg-primary-container text-on-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-md shadow-primary/25 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Hệ thống đang đối chiếu quy chuẩn văn hóa...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-nep-gold" />
                        <span>TÁI TẠO PHỐI ĐỒ AI (GENERATE ENSEMBLE)</span>
                      </>
                    )}
                  </button>

                  <a
                    href="/admin/ingest"
                    className="px-5 py-3.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Store className="w-4 h-4 text-secondary" />
                    <span>Nạp Sản Phẩm Thật</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => { setFocusedSourceId(null); setCodexOpen(true); }}
                    className="px-5 py-3.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Tra Cứu Điển Thư</span>
                  </button>
                </div>
              </>
            )}
          </section>

          {/* CỘT PHẢI: 9:16 Editorial Lookbook Card (~42% Sticky) */}
          <aside id="lookbook" className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">
            {creationMode === "fitting" ? (
              <div className="flex flex-col items-center w-full">
                <div className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-semibold text-center py-1.5 px-3 rounded-full mb-2 flex items-center justify-center gap-2 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span className="font-bold">ƯỚM THỬ TRỰC TIẾP · LIVE PREVIEW SONG SONG (0ms)</span>
                </div>
                <LookbookCard
                  onOpenSource={(srcId) => {
                    setFocusedSourceId(srcId);
                    setCodexOpen(true);
                  }}
                  result={fittingResult}
                />
              </div>
            ) : loading ? (
              <LoadingSkeleton />
            ) : error ? (
                <ErrorCard message={error} onRetry={() => handleGenerate()} />
              ) : result ? (
                result.trang_thai === "CHUA_DU_CAN_CU" ? (
                  <ChuaDuCanCuCard
                    message="Dữ liệu biên tập của Nếp Việt hiện tại chưa bao quát sự kết hợp này. Hệ thống không đưa ra phỏng đoán."
                    thieu_can_cu={result.thieu_can_cu || []}
                  />
                ) : result.phuong_an?.[0] ? (
                  <div className="flex flex-col items-center w-full">
                    <FallbackBanner visible={result.fallback_used} />
                    <LookbookCard 
                      result={result.phuong_an[0]} 
                      onOpenSource={(srcId) => {
                        setFocusedSourceId(srcId);
                        setCodexOpen(true);
                      }}
                    />
                  </div>
                ) : null
              ) : (
                /* Default Fallback Editorial Card */
                <div className="flex flex-col items-center w-full">
                  <div className="w-full bg-nep-indigo/10 text-nep-indigo text-[11px] font-semibold text-center py-1 rounded-full mb-2">
                    ✦ BẢN GIÁM TUYỂN MẪU · SẮC CHÀM PHỐ CỔ
                  </div>
                  <LookbookCard
                    onOpenSource={(srcId) => {
                      setFocusedSourceId(srcId);
                      setCodexOpen(true);
                    }}
                    result={{
                      combo_id: "combo_stitch_editorial",
                      outfit_item_ids: ["ao_ngu_than_nam_xanh_01", "quan_trang_01", "guoc_moc_01"],
                      muc_canh_bao: "XANH",
                      diem_hai_hoa_mau: 9.8,
                      ly_do_phoi_do: "Bộ phối chuẩn mực kết hợp giữa áo ngũ thân tay chẽn xanh chàm và quần lụa ngà giấy dó.",
                      nhan_xet_mau: "Sự kết hợp giữa gam màu xanh chàm thâm trầm của chiếc áo và vẻ bay bổng của quần lụa tạo nên vẻ trang nhã tuyệt đối.",
                      dien_giai_van_hoa: "Áo ngũ thân tay chẽn cổ đứng kín đáo lưu giữ lễ nghi cung đình triều Nguyễn, thích ứng hoàn hảo cho nhịp sống hiện đại.",
                      source_ids: ["N1", "S_HN1665"],
                      triggered_rules: [],
                      items: [
                        {
                          id: "ao_ngu_than_nam_xanh_01",
                          slot: "top",
                          group: "ao_ngu_than",
                          name_vi: "Áo Ngũ Thân Indigo Thụng Rộng",
                          asset: "/assets/items/ao_ngu_than_nam_xanh_01.png",
                          brand: { name: "Ỷ Vân Hiên", location: "Hà Nội" },
                          pricing: { buy_price: 3450000, rental_price: 350000 },
                          material: "Lụa tơ tằm Vạn Phúc thêu họa tiết liên hoa viền cổ",
                          craftsmanship_lore: "Khuy đồng đúc thủ công tượng trưng ngũ thường."
                        },
                        {
                          id: "quan_trang_01",
                          slot: "bottom",
                          group: "ao_ngu_than",
                          name_vi: "Quần Lụa Ống Rộng Ngà Mộc",
                          asset: "/assets/items/quan_trang_01.png",
                          brand: { name: "Lụa Vạn Phúc", location: "Hà Đông" },
                          pricing: { buy_price: 1890000, rental_price: 150000 },
                          material: "Lụa tơ tằm ngà mộc tự nhiên dệt thủ công",
                          craftsmanship_lore: "Phom dáng cạp cao xếp ly, chuyển động sóng sánh tự nhiên."
                        },
                        {
                          id: "guoc_moc_01",
                          slot: "footwear",
                          group: "phu_kien",
                          name_vi: "Guốc Mộc Gỗ Xoan Sơn Mài",
                          asset: "/assets/items/guoc_moc_01.png",
                          brand: { name: "Guốc Bạch Đằng", location: "Bình Dương" },
                          pricing: { buy_price: 920000, rental_price: 80000 },
                          material: "Gỗ xoan đào phủ sơn mài bóng bẩy, quai gấm vàng",
                          craftsmanship_lore: "Đế lượn ôm lòng bàn chân êm ái khi chiêm bái."
                        },
                        {
                          id: "tote_kem_01",
                          slot: "bag",
                          group: "phu_kien",
                          name_vi: "Túi Canvas Ngà Mộc Cổ Phong",
                          asset: "/assets/items/tote_kem_01.png",
                          brand: { name: "Tiệm Cổ Phong", location: "Hà Nội" },
                          pricing: { buy_price: 180000, rental_price: 0 },
                          material: "Vải bố dệt thô mộc mạc",
                          craftsmanship_lore: "Phụ kiện tối giản cho học sinh sinh viên."
                        }
                      ]
                    }}
                  />
                </div>
              )}
            </aside>
          </div>

          {/* 4. BOTTOM CULTURAL FOOTNOTE RIBBON */}
          <footer className="mt-16 p-6 lg:p-8 rounded-2xl bg-surface-container-low border border-nep-ink/5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-primary font-bold font-mono">
                      CHÚ GIẢI LỊCH SỬ · CULTURAL FOOTNOTE
                    </span>
                    <span className="text-secondary">✦</span>
                    <span className="text-[11px] text-on-surface-variant">Khảo Dị Điển Chế</span>
                  </div>
                  <p className="text-xs text-on-surface mt-1.5 leading-relaxed">
                    <strong>Áo Ngũ Thân &amp; Áo Tấc</strong> vốn là y phục chuẩn mực của mọi tầng lớp từ vua chúa đến thứ dân thời Nguyễn trong các nghi lễ gia tiên, khánh tiết và đời sống thường nhật. Phiên bản đương đại tại Nếp Việt được ứng dụng công nghệ giám sát quy tắc văn hóa (Rule-based Guardrails) kết hợp cùng thuật toán hòa sắc quang học, nhằm tôn vinh nét riêng của người trẻ nhưng vẫn giữ trọn nếp xưa đoan chính.
                  </p>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col sm:items-end justify-center bg-surface-container-lowest/60 p-4 rounded-xl backdrop-blur-sm border border-nep-ink/5">
                <div className="flex items-center gap-1.5 text-secondary mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">Âm Thanh Không Gian</span>
                </div>
                <span className="text-xs text-on-surface font-semibold text-right">Đàn Tranh x Lo-fi Beat: Tiếng Thu Hà Nội</span>
                <span className="text-[10px] text-on-surface-variant mt-0.5">Bản phối độc quyền cho Nếp Việt Atelier</span>
              </div>
            </div>
          </footer>

        </div>
      </main>

      {/* 5. EDITORIAL FOOTER */}
      <footer className="w-full bg-surface-container-low border-t border-nep-ink/5 py-10">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
            <div className="md:col-span-5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold uppercase tracking-wider text-on-surface">NẾP VIỆT</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary font-mono font-bold">Giấy Dó &amp; Tơ Lụa</span>
              </div>
              <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">
                Nền tảng trí tuệ nhân tạo giám tuyển và thiết kế phong cách cổ phục Việt Nam đương đại. Tôn vinh gấm vóc, lụa Vạn Phúc, sa Lã Khê và phom dáng triều Nguyễn trong nhịp thở thời trang quốc tế.
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5 text-xs">
              <span className="uppercase tracking-wider font-bold text-on-surface mb-1 font-mono text-[11px]">Tạo Lookbook</span>
              <button
                type="button"
                onClick={() => {
                  setCreationMode("fitting");
                  const el = document.getElementById("studio-workspace");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-left text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Ướm Thử Từng Part
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreationMode("wizard");
                  const el = document.getElementById("studio-workspace");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-left text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Thiết Kế Tạo Nhu Cầu
              </button>
              <a href="/admin/ingest" className="text-on-surface-variant hover:text-primary transition-colors">Admin Ingest Sản Phẩm</a>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5 text-xs">
              <span className="uppercase tracking-wider font-bold text-on-surface mb-1 font-mono text-[11px]">Di Sản &amp; Làng Nghề</span>
              <button
                type="button"
                onClick={() => { setFocusedSourceId(null); setCodexOpen(true); }}
                className="text-left text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                Điển Thư &amp; Nguồn Khảo Cứu
              </button>
              <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Nghệ Nhân Dệt May</a>
              <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Triết Lý Giấy Dó</a>
            </div>

            <div className="md:col-span-3 flex flex-col gap-1.5 text-xs">
              <span className="uppercase tracking-wider font-bold text-on-surface mb-1 font-mono text-[11px]">Dự Án Di Sản</span>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Bài thi tham dự Cuộc thi <strong>AI Arena Vietnam 2026</strong>. Phát triển bởi Đội ngũ Nếp Việt.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-nep-ink/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-on-surface-variant gap-2">
            <span>© 2026 Nếp Việt Editorial Atelier. Bản quyền thuộc về Dự án Di sản Thời trang Việt.</span>
            <span className="font-mono text-[10px]">Hà Nội · Huế · Sài Gòn</span>
          </div>
        </div>
      </footer>

      {/* 6. HERITAGE SOURCES & CODEX MODAL */}
      <HeritageSourcesModal
        isOpen={codexOpen}
        onClose={() => setCodexOpen(false)}
        focusedSourceId={focusedSourceId}
      />

      {/* 7. SAVED LOOKS (TỦ ĐỒ YÊU THÍCH) MODAL */}
      <SavedLooksModal
        isOpen={savedLooksOpen}
        onClose={() => setSavedLooksOpen(false)}
        onSelectLook={(savedResult) => {
          setResult({
            trang_thai: "DU_CAN_CU",
            phuong_an: [savedResult],
            fallback_used: false,
          });
          const el = document.getElementById("lookbook");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </div>
  );
}

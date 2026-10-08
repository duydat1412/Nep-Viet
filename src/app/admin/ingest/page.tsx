"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  ArrowLeft, 
  Check, 
  Copy, 
  ExternalLink, 
  Tag, 
  MapPin, 
  Store, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  CloudUpload, 
  Image as ImageIcon, 
  Filter, 
  Search, 
  AlertCircle,
  RefreshCw,
  Eye,
  Info
} from "lucide-react";

export default function AdminStudioPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "manual" | "ai">("catalog");

  // --- CATALOG LIST STATES ---
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSlot, setFilterSlot] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- MANUAL / EDIT FORM STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [formId, setFormId] = useState("");
  const [formNameVi, setFormNameVi] = useState("");
  const [formSlot, setFormSlot] = useState("top");
  const [formGroup, setFormGroup] = useState("ao_ngu_than");
  const [formGender, setFormGender] = useState("nam");
  const [formFormality, setFormFormality] = useState(4);
  const [formOccasions, setFormOccasions] = useState<string[]>(["di_le", "tet"]);
  const [formStyles, setFormStyles] = useState<string[]>(["truyen_thong"]);
  const [formTags, setFormTags] = useState<string>("kin_dao, mau_tram");
  const [formAsset, setFormAsset] = useState("");
  const [formColorName, setFormColorName] = useState("Xanh Chàm");
  const [formColorHex, setFormColorHex] = useState("#26466D");
  
  // Brand & Pricing
  const [formBrandName, setFormBrandName] = useState("");
  const [formBrandLocation, setFormBrandLocation] = useState("");
  const [formBrandUrl, setFormBrandUrl] = useState("");
  const [formBrandContact, setFormBrandContact] = useState("");
  const [formBuyPrice, setFormBuyPrice] = useState<number | "">("");
  const [formRentalPrice, setFormRentalPrice] = useState<number | "">("");
  const [formIsEstimate, setFormIsEstimate] = useState(true);
  const [formRefRange, setFormRefRange] = useState("");
  const [formPriceNote, setFormPriceNote] = useState("");
  const [formMaterial, setFormMaterial] = useState("");
  const [formCraftLore, setFormCraftLore] = useState("");
  const [formSources, setFormSources] = useState<string>("N1");

  // Upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form submit state
  const [savingProduct, setSavingProduct] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  // --- AI INGEST STATES ---
  const [aiUrl, setAiUrl] = useState("");
  const [aiContent, setAiContent] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [appOrigin, setAppOrigin] = useState("http://localhost:3000");

  // Function to execute Ingestion (called directly or from Bookmarklet)
  const executeIngest = async (targetUrl: string, targetContent: string, targetImg?: string) => {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const res = await fetch("/api/admin/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl,
          content: targetContent,
          image_url: targetImg,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Lỗi khi trích xuất");
      setAiResult(data.extracted_item);
    } catch (err: any) {
      setAiError(err.message || "Đã xảy ra lỗi");
    } finally {
      setAiLoading(false);
    }
  };

  // Load products catalog
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (res.ok && data.items) {
        setProducts(data.items);
      }
    } catch (err) {
      console.error("Không thể tải danh sách sản phẩm:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    if (typeof window !== "undefined") {
      setAppOrigin(window.location.origin);
      const params = new URLSearchParams(window.location.search);
      const incomingUrl = params.get("shopee_url") || params.get("url");
      const incomingContent = params.get("content");
      const incomingImg = params.get("image_url");

      if (incomingUrl || incomingContent) {
        setActiveTab("ai");
        if (incomingUrl) setAiUrl(incomingUrl);
        if (incomingContent) setAiContent(incomingContent);
        executeIngest(incomingUrl || "", incomingContent || "", incomingImg || "");
      }
    }
  }, []);

  // Handle Image Upload to Cloudflare R2
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadNotice(null);
    setUploadWarning(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi khi tải ảnh");

      setFormAsset(data.url);
      setUploadNotice(`Ảnh đã được tải lên thành công (${data.storage === "r2" ? "Cloudflare R2" : "Local Storage"})!`);
      if (data.warning) {
        setUploadWarning(data.warning);
      }
    } catch (err: any) {
      setUploadWarning(err.message || "Tải ảnh thất bại");
    } finally {
      setUploadingImage(false);
    }
  };

  // Reset form to blank
  const resetForm = () => {
    setIsEditing(false);
    setFormId("");
    setFormNameVi("");
    setFormSlot("top");
    setFormGroup("ao_ngu_than");
    setFormGender("nam");
    setFormFormality(4);
    setFormOccasions(["di_le", "tet"]);
    setFormStyles(["truyen_thong"]);
    setFormTags("kin_dao, mau_tram");
    setFormAsset("");
    setFormColorName("Xanh Chàm");
    setFormColorHex("#26466D");
    setFormBrandName("");
    setFormBrandLocation("");
    setFormBrandUrl("");
    setFormBrandContact("");
    setFormBuyPrice("");
    setFormRentalPrice("");
    setFormIsEstimate(true);
    setFormRefRange("");
    setFormPriceNote("");
    setFormMaterial("");
    setFormCraftLore("");
    setFormSources("N1");
    setFormSuccessMessage(null);
    setFormErrorMessage(null);
    setUploadNotice(null);
    setUploadWarning(null);
  };

  // Populate form with existing product for editing
  const handleEditProduct = (item: any) => {
    setIsEditing(true);
    setFormId(item.id || "");
    setFormNameVi(item.name_vi || "");
    setFormSlot(item.slot || "top");
    setFormGroup(item.group || "ao_ngu_than");
    setFormGender(item.gender || "nam");
    setFormFormality(item.formality || 3);
    setFormOccasions(item.occasions || []);
    setFormStyles(item.style_levels || []);
    setFormTags((item.tags || []).join(", "));
    setFormAsset(item.asset || item.image_url || "");
    
    if (item.colors && item.colors[0]) {
      setFormColorName(item.colors[0].name || "Màu sắc");
      setFormColorHex(item.colors[0].hex || "#26466D");
    }

    setFormBrandName(item.brand?.name || "");
    setFormBrandLocation(item.brand?.location || "");
    setFormBrandUrl(item.brand?.url || "");
    setFormBrandContact(item.brand?.contact || "");

    setFormBuyPrice(item.pricing?.buy_price !== undefined ? item.pricing.buy_price : "");
    setFormRentalPrice(item.pricing?.rental_price !== undefined ? item.pricing.rental_price : "");
    setFormIsEstimate(item.pricing?.is_estimate !== undefined ? item.pricing.is_estimate : true);
    setFormRefRange(item.pricing?.reference_range || "");
    setFormPriceNote(item.pricing?.note || "");

    setFormMaterial(item.material || "");
    setFormCraftLore(item.craftsmanship_lore || "");
    setFormSources((item.source_ids || []).join(", ") || "N1");

    setActiveTab("manual");
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm '${id}' khỏi kho cổ phục?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể xóa sản phẩm");
      await fetchProducts();
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa");
    }
  };

  // Submit manual form (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    setFormSuccessMessage(null);
    setFormErrorMessage(null);

    try {
      const payload: any = {
        id: formId.trim() || undefined,
        name_vi: formNameVi.trim(),
        slot: formSlot,
        group: formGroup,
        gender: formGender,
        formality: Number(formFormality),
        occasions: formOccasions,
        style_levels: formStyles,
        tags: formTags.split(",").map((t) => t.trim()).filter(Boolean),
        asset: formAsset.trim() || "/assets/items/ao_ngu_than_nam_xanh_01.png",
        source_ids: formSources.split(",").map((s) => s.trim()).filter(Boolean),
        status: "draft",
        colors: [{ name: formColorName.trim(), hex: formColorHex.trim() }],
      };

      if (formBrandName.trim()) {
        payload.brand = {
          name: formBrandName.trim(),
          location: formBrandLocation.trim() || undefined,
          url: formBrandUrl.trim() || undefined,
          contact: formBrandContact.trim() || undefined,
        };
      }

      if (formBuyPrice !== "" || formRentalPrice !== "" || formRefRange) {
        payload.pricing = {
          buy_price: formBuyPrice !== "" ? Number(formBuyPrice) : undefined,
          rental_price: formRentalPrice !== "" ? Number(formRentalPrice) : undefined,
          currency: "VND",
          is_estimate: Boolean(formIsEstimate),
          reference_range: formRefRange.trim() || undefined,
          contact_for_quote: Boolean(formIsEstimate),
          note: formPriceNote.trim() || undefined,
        };
      }

      if (formMaterial.trim()) payload.material = formMaterial.trim();
      if (formCraftLore.trim()) payload.craftsmanship_lore = formCraftLore.trim();

      const method = isEditing ? "PUT" : "POST";
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu sản phẩm");
      }

      setFormSuccessMessage(
        isEditing
          ? `Đã cập nhật sản phẩm '${data.item.name_vi}' thành công!`
          : `Đã thêm mới sản phẩm '${data.item.name_vi}' vào kho!`
      );
      await fetchProducts();

      if (!isEditing) {
        resetForm();
      }
    } catch (err: any) {
      setFormErrorMessage(err.message || "Đã xảy ra lỗi");
    } finally {
      setSavingProduct(false);
    }
  };

  // AI Ingestion Handler
  const handleAiIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeIngest(aiUrl, aiContent);
  };

  // Transfer AI Result to Manual Edit Form
  const handleApplyAiResultToForm = () => {
    if (!aiResult) return;
    handleEditProduct(aiResult);
    setActiveTab("manual");
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.name_vi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchSlot = filterSlot === "all" || p.slot === filterSlot;
    const matchGroup = filterGroup === "all" || p.group === filterGroup;

    return matchSearch && matchSlot && matchGroup;
  });

  return (
    <div className="min-h-screen bg-[#F6EFE0] bg-[radial-gradient(#E8DFC8_1px,transparent_1px)] [background-size:24px_24px] p-4 sm:p-6 lg:p-8 text-nep-ink">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-nep-ink/10">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-2.5 rounded-full bg-white/80 hover:bg-white text-nep-ink border border-nep-ink/10 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-2xl text-nep-red tracking-wide">
                  NẾP VIỆT
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-nep-red/10 text-nep-red px-2.5 py-0.5 rounded-full border border-nep-red/20">
                  Admin Heritage Curator Studio
                </span>
              </div>
              <p className="text-xs text-nep-ink/60 mt-0.5">
                Quản lý kho sản phẩm thật, tải ảnh lên Cloudflare R2 và bóc tách dữ liệu AI
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="inline-flex p-1 bg-white/80 backdrop-blur-sm rounded-full border border-nep-ink/10 shadow-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "catalog"
                  ? "bg-nep-red text-white shadow-xs"
                  : "text-nep-ink/70 hover:text-nep-ink"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Kho Sản Phẩm ({products.length})</span>
            </button>
            <button
              onClick={() => {
                if (activeTab !== "manual") resetForm();
                setActiveTab("manual");
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "manual"
                  ? "bg-nep-red text-white shadow-xs"
                  : "text-nep-ink/70 hover:text-nep-ink"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isEditing ? "Chỉnh Sửa Sản Phẩm" : "Thêm Mới Thủ Công & R2"}</span>
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "ai"
                  ? "bg-nep-red text-white shadow-xs"
                  : "text-nep-ink/70 hover:text-nep-ink"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-nep-gold" />
              <span>Trích Xuất AI</span>
            </button>
          </div>
        </header>

        {/* ================= TAB 1: CATALOG INVENTORY ================= */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-nep-ink/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-nep-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên sản phẩm, thương hiệu, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-nep-ink/15 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-nep-red/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={filterSlot}
                  onChange={(e) => setFilterSlot(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-nep-ink/15 text-xs bg-white focus:outline-none"
                >
                  <option value="all">Tất cả vị trí (Slots)</option>
                  <option value="top">Áo chính (Top)</option>
                  <option value="bottom">Quần (Bottom)</option>
                  <option value="footwear">Giày/Guốc (Footwear)</option>
                  <option value="bag">Túi xách (Bag)</option>
                  <option value="outer">Áo khoác ngoài (Outer)</option>
                </select>

                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-nep-ink/15 text-xs bg-white focus:outline-none"
                >
                  <option value="all">Tất cả nhóm phục trang</option>
                  <option value="ao_ngu_than">Áo Ngũ Thân</option>
                  <option value="ao_tac">Áo Tấc</option>
                  <option value="ao_dai">Áo Dài</option>
                  <option value="ao_tu_than">Áo Tứ Thân</option>
                  <option value="phu_kien">Phụ Kiện</option>
                </select>

                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab("manual");
                  }}
                  className="px-4 py-2 rounded-xl bg-nep-red text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-nep-red/90 cursor-pointer ml-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Sản Phẩm Mới</span>
                </button>
              </div>
            </div>

            {/* Product Grid */}
            {loadingProducts ? (
              <div className="py-20 flex flex-col items-center justify-center text-nep-ink/60">
                <RefreshCw className="w-6 h-6 animate-spin text-nep-red mb-2" />
                <span className="text-xs">Đang tải kho sản phẩm...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white/60 rounded-2xl border border-nep-ink/10">
                <Store className="w-10 h-10 text-nep-ink/30 mx-auto mb-2" />
                <p className="text-sm font-bold text-nep-ink">Không tìm thấy sản phẩm nào</p>
                <p className="text-xs text-nep-ink/60 mt-1">
                  Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm Thêm Mới Thủ Công.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((p) => {
                  const imgUrl = p.asset || p.image_url;
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-nep-ink/10 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-nep-red/10 text-nep-red px-2 py-0.5 rounded-md font-mono">
                              {p.slot} · {p.group}
                            </span>
                            <span className="text-[10px] font-semibold text-nep-indigo bg-nep-indigo/10 px-2 py-0.5 rounded-md">
                              {p.gender === "nam" ? "Nam" : p.gender === "nu" ? "Nữ" : "Unisex"}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-nep-ink/50" title={p.id}>
                            #{p.id.slice(0, 14)}...
                          </span>
                        </div>

                        {/* Image Preview & Details */}
                        <div className="flex gap-3 mb-3">
                          <div className="w-20 h-24 bg-nep-paper/50 rounded-xl border border-nep-ink/5 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={p.name_vi}
                                className="w-full h-full object-contain drop-shadow-xs"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-nep-ink/20" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading text-sm font-bold text-nep-ink line-clamp-2">
                              {p.name_vi}
                            </h3>
                            <div className="text-[11px] text-nep-ink/60 mt-1 flex items-center gap-1">
                              <Store className="w-3 h-3 text-secondary" />
                              <span className="truncate">{p.brand?.name || "Chưa gán thương hiệu"}</span>
                            </div>
                            {p.brand?.location && (
                              <div className="text-[10px] text-nep-ink/40 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 text-nep-red" />
                                <span className="truncate">{p.brand.location}</span>
                              </div>
                            )}

                            {/* Color Dot */}
                            {p.colors && p.colors[0] && (
                              <div className="flex items-center gap-1.5 mt-2">
                                <div
                                  className="w-3 h-3 rounded-full border border-black/10"
                                  style={{ backgroundColor: p.colors[0].hex }}
                                />
                                <span className="text-[10px] text-nep-ink/60">
                                  {p.colors[0].name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pricing Transparency */}
                        <div className="p-2.5 rounded-xl bg-nep-paper/60 border border-nep-ink/5 text-xs mb-3 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-nep-ink/60">
                              {p.pricing?.is_estimate ? "Giá tham khảo:" : "Giá niêm yết:"}
                            </span>
                            {p.pricing?.is_estimate && (
                              <span className="text-[8px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-mono">
                                Ước tính
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline justify-between">
                            {p.pricing?.buy_price ? (
                              <span className="font-bold text-nep-red font-mono">
                                {p.pricing?.is_estimate ? "~" : ""}{p.pricing.buy_price.toLocaleString()}₫
                              </span>
                            ) : (
                              <span className="text-[10px] text-nep-ink/40">Liên hệ báo giá</span>
                            )}

                            {p.pricing?.rental_price ? (
                              <span className="text-[10px] font-mono text-nep-indigo font-semibold">
                                Thuê: ~{p.pricing.rental_price.toLocaleString()}₫
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-nep-ink/5 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditProduct(p)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container text-nep-ink text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Chỉnh Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: MANUAL ADD / EDIT (WITH R2 UPLOAD) ================= */}
        {activeTab === "manual" && (
          <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-nep-ink/10 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-nep-ink/10">
              <div>
                <h2 className="font-heading text-xl font-bold text-nep-ink flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-nep-red" />
                  <span>{isEditing ? `Cập Nhật Sản Phẩm: ${formNameVi}` : "Thêm Sản Phẩm Mới & Tải Ảnh Lên R2"}</span>
                </h2>
                <p className="text-xs text-nep-ink/60 mt-1">
                  Điền đầy đủ thông tin chuẩn hóa. Dữ liệu sẽ được lưu trực tiếp vào cơ sở dữ liệu hệ sinh thái Nếp Việt.
                </p>
              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container text-xs font-semibold text-nep-ink transition-colors cursor-pointer"
                >
                  Huỷ Chế Độ Sửa (Tạo Mới)
                </button>
              )}
            </div>

            {formSuccessMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccessMessage}</span>
              </div>
            )}

            {formErrorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* SECTION 1: ẢNH SẢN PHẨM & UPLOAD CLOUDFLARE R2 */}
              <div className="p-5 rounded-2xl bg-nep-paper/50 border border-nep-ink/10">
                <h3 className="font-heading text-sm font-bold text-nep-ink mb-2 flex items-center gap-2">
                  <CloudUpload className="w-4 h-4 text-secondary" />
                  <span>1. Hình Ảnh Sản Phẩm (Lưu trữ Cloudflare R2)</span>
                </h3>
                <p className="text-xs text-nep-ink/60 mb-4">
                  Chọn ảnh tách nền (PNG) hoặc ảnh chụp thực tế từ máy tính của bạn để tải lên Cloudflare R2 bucket.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4 flex items-center justify-center p-3 bg-white rounded-xl border border-nep-ink/10 h-36">
                    {formAsset ? (
                      <img
                        src={formAsset}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain drop-shadow-sm"
                      />
                    ) : (
                      <div className="text-center text-nep-ink/30">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[11px]">Chưa có hình ảnh</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-8 space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-4 py-2.5 rounded-xl bg-nep-indigo text-white text-xs font-bold flex items-center gap-1.5 hover:bg-nep-indigo/90 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {uploadingImage ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang tải lên Cloudflare R2...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Chọn File Từ Máy Tính Để Upload</span>
                          </>
                        )}
                      </button>

                      {formAsset && (
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-mono">
                          ✓ Đã gắn URL ảnh
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-nep-ink/70 mb-1">
                        Hoặc nhập trực tiếp URL CDN / Đường dẫn hình ảnh:
                      </label>
                      <input
                        type="text"
                        value={formAsset}
                        onChange={(e) => setFormAsset(e.target.value)}
                        placeholder="https://pub-xxxx.r2.dev/items/ten_ao.png hoặc /assets/items/..."
                        className="w-full px-3.5 py-2 rounded-xl border border-nep-ink/15 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-nep-red/20 font-mono"
                      />
                    </div>

                    {uploadNotice && (
                      <p className="text-[11px] text-emerald-700 font-medium">
                        {uploadNotice}
                      </p>
                    )}
                    {uploadWarning && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        {uploadWarning}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: THÔNG TIN CƠ BẢN & PHÂN LOẠI */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-nep-ink mb-1">
                    Tên sản phẩm tiếng Việt (*):
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameVi}
                    onChange={(e) => setFormNameVi(e.target.value)}
                    placeholder="Ví dụ: Áo ngũ thân tay chẽn lụa Vạn Phúc hoa cúc"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-nep-red/20 font-medium"
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-nep-ink mb-1">
                    Mã định danh (ID Hệ thống):
                  </label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    disabled={isEditing}
                    placeholder="Để trống hệ thống sẽ tự sinh ID theo tên"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-nep-red/20 font-mono disabled:bg-nep-ink/5"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-nep-ink mb-1">
                    Vị trí mặc (Slot):
                  </label>
                  <select
                    value={formSlot}
                    onChange={(e) => setFormSlot(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white focus:outline-none"
                  >
                    <option value="top">Áo chính (Top)</option>
                    <option value="bottom">Quần (Bottom)</option>
                    <option value="footwear">Giày/Guốc (Footwear)</option>
                    <option value="bag">Túi xách (Bag)</option>
                    <option value="outer">Áo khoác ngoài (Outer)</option>
                    <option value="headwear">Khăn/Mũ (Headwear)</option>
                    <option value="jewelry">Trang sức (Jewelry)</option>
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-nep-ink mb-1">
                    Nhóm cổ phục (Group):
                  </label>
                  <select
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white focus:outline-none"
                  >
                    <option value="ao_ngu_than">Áo Ngũ Thân</option>
                    <option value="ao_tac">Áo Tấc</option>
                    <option value="ao_dai">Áo Dài</option>
                    <option value="ao_tu_than">Áo Tứ Thân</option>
                    <option value="ao_nhat_binh">Áo Nhật Bình</option>
                    <option value="phu_kien">Phụ Kiện</option>
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-nep-ink mb-1">
                    Giới tính phù hợp:
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white focus:outline-none"
                  >
                    <option value="nam">Quý Nam</option>
                    <option value="nu">Quý Nữ</option>
                    <option value="unisex">Unisex (Dùng chung)</option>
                  </select>
                </div>
              </div>

              {/* SECTION 3: MÀU SẮC & THẺ ĐẶC TÍNH */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-nep-ink mb-1">
                    Tên màu sắc:
                  </label>
                  <input
                    type="text"
                    value={formColorName}
                    onChange={(e) => setFormColorName(e.target.value)}
                    placeholder="Chàm Đại Thanh, Vàng Hoàng Cúc..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-nep-ink mb-1">
                    Mã màu Hex:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formColorHex}
                      onChange={(e) => setFormColorHex(e.target.value)}
                      className="w-10 h-10 p-0 rounded-lg border border-nep-ink/15 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formColorHex}
                      onChange={(e) => setFormColorHex(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="md:col-span-5">
                  <label className="block text-xs font-bold text-nep-ink mb-1">
                    Độ trang nghiêm (Formality 1-5):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={formFormality}
                      onChange={(e) => setFormFormality(Number(e.target.value))}
                      className="flex-1 accent-nep-red cursor-pointer"
                    />
                    <span className="font-mono font-bold text-xs bg-nep-paper px-2.5 py-1 rounded-lg border border-nep-ink/10">
                      Mức {formFormality}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: THƯƠNG HIỆU & GIÁ CẢ MINH BẠCH */}
              <div className="p-5 rounded-2xl bg-white border border-nep-ink/10 space-y-4">
                <h3 className="font-heading text-sm font-bold text-nep-ink flex items-center gap-2">
                  <Store className="w-4 h-4 text-nep-red" />
                  <span>2. Thông Tin Thương Hiệu &amp; Báo Giá Minh Bạch</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-nep-ink/80 mb-1">
                      Tên thương hiệu / Nghệ nhân / Xưởng may:
                    </label>
                    <input
                      type="text"
                      value={formBrandName}
                      onChange={(e) => setFormBrandName(e.target.value)}
                      placeholder="Ỷ Vân Hiên, Hợp tác xã Lụa Vạn Phúc..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-nep-ink/80 mb-1">
                      Địa chỉ / Tỉnh thành:
                    </label>
                    <input
                      type="text"
                      value={formBrandLocation}
                      onChange={(e) => setFormBrandLocation(e.target.value)}
                      placeholder="Hà Nội, Huế, TP.HCM..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-nep-ink/80 mb-1">
                      Website / Fanpage liên hệ:
                    </label>
                    <input
                      type="url"
                      value={formBrandUrl}
                      onChange={(e) => setFormBrandUrl(e.target.value)}
                      placeholder="https://yvanhien.com..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-nep-ink/80 mb-1">
                      Giá may đo / mua (VNĐ):
                    </label>
                    <input
                      type="number"
                      value={formBuyPrice}
                      onChange={(e) => setFormBuyPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="3500000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white font-mono"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-nep-ink/80 mb-1">
                      Giá thuê / ngày (VNĐ):
                    </label>
                    <input
                      type="number"
                      value={formRentalPrice}
                      onChange={(e) => setFormRentalPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="350000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white font-mono"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-nep-ink/80 mb-1">
                      Khoảng giá tham khảo hiển thị:
                    </label>
                    <input
                      type="text"
                      value={formRefRange}
                      onChange={(e) => setFormRefRange(e.target.value)}
                      placeholder="~3.0M – 4.2M ₫"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white font-mono"
                    />
                  </div>

                  <div className="md:col-span-3 flex items-center h-full pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-nep-ink">
                      <input
                        type="checkbox"
                        checked={formIsEstimate}
                        onChange={(e) => setFormIsEstimate(e.target.checked)}
                        className="w-4 h-4 accent-nep-red rounded"
                      />
                      <span>Đánh dấu là "Giá khảo sát ước tính"</span>
                    </label>
                  </div>

                  <div className="md:col-span-12">
                    <label className="block text-[11px] font-semibold text-nep-ink/60 mb-1">
                      Ghi chú minh bạch về giá:
                    </label>
                    <input
                      type="text"
                      value={formPriceNote}
                      onChange={(e) => setFormPriceNote(e.target.value)}
                      placeholder="Mức giá tham khảo khảo sát từ các xưởng may thủ công. Giá thực tế phụ thuộc chất liệu gấm/lụa và may đo riêng."
                      className="w-full px-3.5 py-2 rounded-xl border border-nep-ink/15 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: CHẤT LIỆU, ĐIỂN TÍCH & NGUỒN */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-nep-ink mb-1">
                    Chất liệu may dệt:
                  </label>
                  <input
                    type="text"
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    placeholder="Lụa tơ tằm Vạn Phúc dệt hoa mây, Sa Lã Khê..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white"
                  />
                </div>

                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-nep-ink mb-1">
                    Nguồn khảo cứu thư tịch (Source IDs):
                  </label>
                  <input
                    type="text"
                    value={formSources}
                    onChange={(e) => setFormSources(e.target.value)}
                    placeholder="N1, S_HN1665, S_VJOL_CUNGDINH..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white font-mono"
                  />
                </div>

                <div className="md:col-span-12">
                  <label className="block text-xs font-bold text-nep-ink mb-1">
                    Điển tích chế tác / Lore văn hóa:
                  </label>
                  <textarea
                    rows={2}
                    value={formCraftLore}
                    onChange={(e) => setFormCraftLore(e.target.value)}
                    placeholder="May thủ công phom áo năm thân tay chẽn thời Nguyễn, cài 5 khuy đồng đúc tượng trưng cho Ngũ thường..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-nep-ink/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-full border border-nep-ink/20 text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                >
                  Đặt Lại Form
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-6 py-2.5 rounded-full bg-nep-red text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-nep-red/20 hover:bg-nep-red/90 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {savingProduct ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu sản phẩm...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isEditing ? "CẬP NHẬT SẢN PHẨM" : "LƯU SẢN PHẨM VÀO KHO"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 3: AI QUICK INGESTION ================= */}
        {activeTab === "ai" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-nep-ink/10 shadow-sm">
              <h2 className="font-heading text-lg font-bold text-nep-ink mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-nep-red" />
                <span>Trích xuất thông minh từ Shopee / website / bài viết</span>
              </h2>
              <p className="text-xs text-nep-ink/60 mb-5">
                Dán đường dẫn sản phẩm Shopee hoặc bài viết xưởng may, Gemini 2.5 Flash sẽ tự động nhận diện phom dáng, giá tiền thật và xuất thành thông tin có cấu trúc.
              </p>

              {/* SHOPEE BOOKMARKLET CARD */}
              <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛍️</span>
                    <span className="font-heading text-xs font-bold text-amber-950 uppercase tracking-wider">
                      Shopee 1-Click Bookmarklet
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                    Vượt Chặn Shopee 100%
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80 leading-relaxed">
                  Kéo nút màu cam dưới đây thả lên <strong>Thanh Dấu Trang (Bookmark Bar)</strong> của trình duyệt (Ctrl+Shift+B). Khi bạn đang xem sản phẩm trên Shopee, chỉ cần bấm vào Bookmark này là toàn bộ Tên, Giá, Ảnh và Mô tả sẽ tự động gửi về Nếp Việt!
                </p>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {(() => {
                    const bookmarkletHref = `javascript:(function(){try{var u=window.location.href;var cleanTitle=document.title.replace(/\\s*\\|\\s*Shopee.*$/i,'').trim();var titleEl=document.querySelector('div.V3HquR, h1, [class*="attire-title"], [class*="product-title"]');var t=(titleEl&&titleEl.innerText)?titleEl.innerText.trim():cleanTitle;var priceEl=document.querySelector('.pqTWkA, .G274Sr, [class*="price"], [class*="Price"]');var p=priceEl?priceEl.innerText.trim():'';if(!p){var priceMatch=document.body.innerText.match(/₫\\s*[\\d\\.,]+/);if(priceMatch) p=priceMatch[0];}var ogImg=document.querySelector('meta[property="og:image"]');var imgEl=document.querySelector('.Y5q01b img, img[src*="susercontent.com"]');var img=(ogImg&&ogImg.content)?ogImg.content:(imgEl?imgEl.src:'');var descEl=document.querySelector('div.f7VU2S, div.e8duaM, [class*="product-detail"], [class*="description"]');var d=descEl?descEl.innerText.trim():'';if(!d){var bodyText=document.body.innerText;var idx=bodyText.indexOf('MÔ TẢ SẢN PHẨM');if(idx!==-1) d=bodyText.slice(idx, idx+1500);}var endpoint='${appOrigin}/admin/ingest?source=bookmarklet&shopee_url='+encodeURIComponent(u)+'&content='+encodeURIComponent(t+(p?('\\nGiá: '+p):'')+(d?('\\n'+d.slice(0,1800)):''))+(img?('&image_url='+encodeURIComponent(img)):'');window.open(endpoint,'_blank');}catch(e){alert('Lỗi Bookmarklet: '+e.message);}})();`;
                    return (
                      <>
                        <a
                          href={bookmarkletHref}
                          onClick={(e) => {
                            alert('💡 Hướng dẫn: Bạn hãy KÉO THẢ nút này lên thanh Bookmark (Dấu trang) của trình duyệt. Sau đó khi lướt sản phẩm Shopee trên web, chỉ cần bấm vào Bookmark này là Nếp Việt sẽ tự mở ra và lưu sản phẩm!');
                          }}
                          className="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-grab active:cursor-grabbing transition-transform select-none"
                          title="Kéo nút này thả lên thanh Bookmark của trình duyệt"
                        >
                          <span>🛍️ Kéo Lên Bookmark: Lưu Vào Nếp Việt</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(bookmarkletHref);
                            setCopiedBookmarklet(true);
                            setTimeout(() => setCopiedBookmarklet(false), 2500);
                          }}
                          className="px-3.5 py-2 rounded-full bg-white hover:bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-300 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {copiedBookmarklet ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Đã sao chép mã!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-amber-800" />
                              <span>Sao chép mã Javascript</span>
                            </>
                          )}
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>

              <form onSubmit={handleAiIngest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-nep-ink mb-1">
                    Đường dẫn sản phẩm / bài viết (URL):
                  </label>
                  <input
                    type="url"
                    value={aiUrl}
                    onChange={(e) => setAiUrl(e.target.value)}
                    placeholder="https://yvanhien.com/ao-ngu-than-tay-chen..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-nep-red/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nep-ink mb-1">
                    Hoặc dán nội dung bài viết mô tả:
                  </label>
                  <textarea
                    rows={6}
                    value={aiContent}
                    onChange={(e) => setAiContent(e.target.value)}
                    placeholder="Áo tấc gấm đỏ hoa sen tay thụng may đo triều Nguyễn. Giá thuê 450.000đ/ngày, giá may đo 3.800.000đ tại Hoa Niên Huế..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs bg-white leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={aiLoading || (!aiUrl && !aiContent)}
                  className="w-full py-3 rounded-full bg-nep-red text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-nep-red/25 hover:bg-nep-red/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Gemini đang đọc hiểu & trích xuất...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-nep-gold" />
                      <span>Bóc Tách Bằng Gemini AI</span>
                    </>
                  )}
                </button>
              </form>

              {aiError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {aiError}
                </div>
              )}
            </div>

            {/* AI Preview Result */}
            <div className="lg:col-span-6 bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-nep-ink/10 shadow-sm min-h-[420px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-nep-ink/10">
                  <h3 className="font-heading text-base font-bold text-nep-ink flex items-center gap-2">
                    <Store className="w-4 h-4 text-nep-indigo" />
                    <span>Hồ sơ trích xuất được</span>
                  </h3>
                  {aiResult && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ Đạt chuẩn Schema
                    </span>
                  )}
                </div>

                {aiResult ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-nep-paper/60 border border-nep-ink/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-nep-red font-mono">
                          {aiResult.group} · {aiResult.slot}
                        </span>
                        <span className="text-[10px] text-nep-ink/60 font-mono">
                          Trang nghiêm: {aiResult.formality}/5
                        </span>
                      </div>
                      <h4 className="font-heading text-base font-bold text-nep-ink">
                        {aiResult.name_vi}
                      </h4>
                      <p className="text-xs text-nep-ink/70 mt-1 italic">
                        "{aiResult.craftsmanship_lore}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white border border-nep-ink/10">
                        <span className="text-[10px] text-nep-ink/50 uppercase font-semibold block mb-0.5">
                          Thương hiệu
                        </span>
                        <span className="font-semibold text-xs text-nep-ink block">
                          {aiResult.brand?.name || "Chưa rõ"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-nep-ink/10">
                        <span className="text-[10px] text-nep-ink/50 uppercase font-semibold block mb-0.5">
                          Giá ước tính
                        </span>
                        <span className="font-bold text-nep-red text-xs block font-mono">
                          {aiResult.pricing?.buy_price ? `${aiResult.pricing.buy_price.toLocaleString()}₫` : "Chưa rõ"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-nep-ink/40">
                    <Sparkles className="w-8 h-8 mb-2 opacity-30 text-nep-gold" />
                    <p className="text-xs">Chưa có kết quả trích xuất.</p>
                  </div>
                )}
              </div>

              {aiResult && (
                <div className="pt-4 border-t border-nep-ink/10 mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleApplyAiResultToForm}
                    className="flex-1 py-2 px-4 rounded-full bg-nep-red text-white text-xs font-bold hover:bg-nep-red/90 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chuyển Sang Form Điền &amp; Tải Ảnh R2</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(aiResult, null, 2));
                      setCopiedJSON(true);
                      setTimeout(() => setCopiedJSON(false), 2000);
                    }}
                    className="p-2 rounded-full border border-nep-ink/15 hover:bg-white text-xs cursor-pointer"
                    title="Copy JSON"
                  >
                    {copiedJSON ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

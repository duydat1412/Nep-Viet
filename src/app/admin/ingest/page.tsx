"use client";

import { useState } from "react";
import { Sparkles, ArrowLeft, Check, Copy, ExternalLink, Tag, MapPin, Store } from "lucide-react";

export default function AdminIngestPage() {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi khi trích xuất");
      setResult(data.extracted_item);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJSON = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6EFE0] bg-[radial-gradient(#E8DFC8_1px,transparent_1px)] [background-size:24px_24px] p-6 text-nep-ink">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-nep-ink/10">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-2 rounded-full bg-white/70 hover:bg-white text-nep-ink border border-nep-ink/10 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-2xl text-nep-red tracking-wide">
                  NẾP VIỆT
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-nep-indigo/10 text-nep-indigo px-2 py-0.5 rounded-full">
                  Admin AI Ingestion Studio
                </span>
              </div>
              <p className="text-xs text-nep-ink/60 mt-0.5">
                Tự động bóc tách sản phẩm thật từ website / bài viết thương hiệu cổ phục
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Input Form */}
          <div className="lg:col-span-6 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-nep-ink/10 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-nep-ink mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-nep-red" />
              <span>Nạp thông tin sản phẩm</span>
            </h2>
            <p className="text-xs text-nep-ink/60 mb-5">
              Dán liên kết web hoặc nội dung bài viết từ các xưởng may / thương hiệu phục dựng
            </p>

            <form onSubmit={handleIngest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-nep-ink mb-1">
                  Đường dẫn sản phẩm / bài viết (URL):
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yvanhien.com/ao-ngu-than-tay-chen..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs focus:outline-none focus:ring-2 focus:ring-nep-red/30 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-nep-ink mb-1">
                  Hoặc dán nội dung mô tả sản phẩm:
                </label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ví dụ: Áo ngũ thân tay chẽn lụa tơ tằm Vạn Phúc dệt hoa văn chữ Thọ. Giá thuê 350.000đ/ngày, giá may đo 3.200.000đ. Thương hiệu Ỷ Vân Hiên, địa chỉ tại Hoàn Kiếm, Hà Nội..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-nep-ink/15 text-xs focus:outline-none focus:ring-2 focus:ring-nep-red/30 bg-white leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading || (!url && !content)}
                className="w-full py-3 rounded-full bg-nep-red text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-nep-red/25 hover:bg-nep-red/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Gemini đang đọc hiểu & trích xuất...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-nep-gold" />
                    <span>Trích xuất bằng Gemini 2.5 Flash</span>
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {error}
              </div>
            )}
          </div>

          {/* Right: Live Extraction Preview */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-nep-ink/10 shadow-sm min-h-[420px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-nep-ink/10">
                  <h3 className="font-heading text-base font-bold text-nep-ink flex items-center gap-2">
                    <Store className="w-4 h-4 text-nep-indigo" />
                    <span>Kết quả giám tuyển có cấu trúc</span>
                  </h3>
                  {result && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Đạt chuẩn Schema
                    </span>
                  )}
                </div>

                {result ? (
                  <div className="space-y-4">
                    {/* Item Main Info */}
                    <div className="p-3.5 rounded-xl bg-nep-paper/60 border border-nep-ink/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-nep-red">
                          {result.group} · {result.slot}
                        </span>
                        <span className="text-[10px] text-nep-ink/60 font-mono">
                          Trang nghiêm: {result.formality}/5
                        </span>
                      </div>
                      <h4 className="font-heading text-lg font-bold text-nep-ink">
                        {result.name_vi}
                      </h4>
                      <p className="text-xs text-nep-ink/70 mt-1 italic">
                        "{result.craftsmanship_lore}"
                      </p>
                    </div>

                    {/* Brand & Price breakdown (from Stitch design) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white border border-nep-ink/10">
                        <span className="text-[10px] text-nep-ink/50 uppercase font-semibold block mb-0.5">
                          Thương hiệu / Nghệ nhân
                        </span>
                        <span className="font-semibold text-xs text-nep-ink block">
                          {result.brand?.name || "Chưa rõ"}
                        </span>
                        <span className="text-[10px] text-nep-ink/60 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-nep-red" />
                          {result.brand?.location || "Việt Nam"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-nep-ink/10">
                        <span className="text-[10px] text-nep-ink/50 uppercase font-semibold block mb-0.5">
                          Giá tham khảo
                        </span>
                        <div className="text-xs">
                          {result.pricing?.rental_price ? (
                            <span className="font-bold text-nep-indigo block">
                              Thuê: {result.pricing.rental_price.toLocaleString()}₫
                            </span>
                          ) : null}
                          {result.pricing?.buy_price ? (
                            <span className="font-bold text-nep-red block">
                              May: {result.pricing.buy_price.toLocaleString()}₫
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Colors & Materials */}
                    <div className="p-3 rounded-xl bg-white border border-nep-ink/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-nep-ink/50 uppercase font-semibold block">Chất liệu</span>
                        <span className="text-xs font-medium text-nep-ink">{result.material}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {result.colors?.map((c: any, idx: number) => (
                          <div
                            key={idx}
                            title={`${c.name} (${c.hex})`}
                            className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-nep-ink/40">
                    <Sparkles className="w-8 h-8 mb-2 opacity-30 text-nep-gold" />
                    <p className="text-xs">Chưa có dữ liệu trích xuất.</p>
                    <p className="text-[11px] text-nep-ink/30 mt-1 max-w-xs">
                      Hãy nhập liên kết hoặc mô tả ở cột bên trái để Gemini tự động phân tích và tạo hồ sơ sản phẩm.
                    </p>
                  </div>
                )}
              </div>

              {result && (
                <div className="pt-4 border-t border-nep-ink/10 mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleCopyJSON}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-nep-ink/20 text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Đã copy JSON!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép JSON</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-nep-ink/50 font-mono">
                    ID: {result.id}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { 
  BookOpen, 
  ExternalLink, 
  Search, 
  ShieldCheck, 
  X, 
  Check, 
  Copy, 
  Filter, 
  Sparkles,
  BookmarkCheck,
  Scale
} from "lucide-react";
import sourcesData from "../../../data/sources.json";
import rulesData from "../../../data/cultural_rules.json";
import { 
  getSourceBadgeLabel, 
  getSourceCategoryName, 
  getSourceShortName 
} from "@/lib/constants/sources";

interface HeritageSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  focusedSourceId?: string | null;
}

export default function HeritageSourcesModal({
  isOpen,
  onClose,
  focusedSourceId = null,
}: HeritageSourcesModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const rules = (rulesData as any).rules || [];

  // Categorize sources
  const getCategory = (id: string) => {
    if (["S_HN1665", "S_VNNEWS_NGOCSON", "S_HOANGTHANH"].includes(id)) return "legal";
    if (["S_VJOL_CUNGDINH", "S_BAOPL_NAMPHUONG", "S_DANVIET_RONG", "S_VNNEWS_NHATBINH"].includes(id)) return "dynasty";
    if (["S_THUVIENLAMDONG", "S_HCMUSSH", "S_BTHN_TUTHAN", "N1"].includes(id)) return "academic";
    return "folk";
  };

  const enrichedSources = useMemo(() => {
    return sourcesData.map((src: any) => {
      const citedRules = rules
        .filter((r: any) => r.source_ids?.includes(src.id))
        .map((r: any) => ({
          id: r.id,
          title: r.title,
          level: r.level,
          message_vi: r.message_vi,
          confidence: r.confidence,
        }));

      return {
        ...src,
        category: getCategory(src.id),
        cited_rules: citedRules,
      };
    });
  }, [rules]);

  const filteredSources = useMemo(() => {
    return enrichedSources.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.author_or_org.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === "all" || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [enrichedSources, search, selectedCategory]);

  const handleCopyCitation = (item: any) => {
    const text = `${item.author_or_org} (${new Date().getFullYear()}). "${item.title}". Trích lục ngày ${item.accessed}. Nguồn: ${item.url}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-nep-paper w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-nep-ink/15 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-surface-container-low border-b border-nep-ink/10 flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-primary">
                  CULTURAL CODEX &amp; BIBLIOGRAPHY
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                  100% ĐÃ ĐỐI CHIẾU
                </span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-nep-ink">
                Điển Thư &amp; Danh Mục Nguồn Khảo Cứu
              </h2>
              <p className="text-xs text-nep-ink/70 mt-0.5 max-w-xl">
                Căn cứ lịch sử, văn bản pháp quy và tư liệu nghiên cứu phục dựng được Rule Engine của Nếp Việt dùng làm cơ sở thẩm định.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-nep-ink/60 hover:text-nep-ink transition-colors cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 bg-surface-container-lowest border-b border-nep-ink/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-nep-ink/40" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu, cơ quan, di tích, chủ đề..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-surface-container-low border border-nep-ink/10 text-xs text-nep-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: "all", label: "Tất cả" },
              { id: "legal", label: "Pháp lý & Quy tắc nơi công cộng" },
              { id: "dynasty", label: "Điển chế Triều Nguyễn" },
              { id: "academic", label: "Khảo cứu & Bảo tàng" },
              { id: "folk", label: "Phong tục & Diễn xướng" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-nep-red text-white shadow-2xs"
                    : "bg-surface-container-low hover:bg-surface-container-high text-nep-ink/70 hover:text-nep-ink"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sources List Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredSources.length === 0 ? (
            <div className="text-center py-12 text-nep-ink/60">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Không tìm thấy nguồn tư liệu phù hợp với từ khóa.</p>
            </div>
          ) : (
            filteredSources.map((item) => {
              const isFocused = focusedSourceId === item.id;
              return (
                <article
                  key={item.id}
                  id={`source-${item.id}`}
                  className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all ${
                    isFocused 
                      ? "border-primary ring-2 ring-primary/20 shadow-md bg-amber-50/20" 
                      : "border-nep-ink/10 hover:border-nep-ink/20 shadow-2xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-nep-indigo/10 text-nep-indigo font-bold shrink-0">
                        {getSourceBadgeLabel(item.id)}
                      </span>
                      <div>
                        <h3 className="font-heading text-base font-bold text-nep-ink leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs font-semibold text-nep-gold mt-0.5">
                          {item.author_or_org}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => handleCopyCitation(item)}
                        className="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-nep-ink/80 text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        title="Sao chép trích dẫn học thuật"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Trích dẫn</span>
                          </>
                        )}
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-nep-indigo text-white hover:bg-nep-indigo/90 text-[10px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <span>Xem nguồn</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Rules using this source */}
                  {item.cited_rules && item.cited_rules.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-nep-ink/5 bg-nep-paper/40 p-3 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Scale className="w-3.5 h-3.5 text-secondary" />
                        <span className="text-[10px] uppercase font-bold tracking-wider text-nep-ink/70">
                          Quy tắc văn hóa đối chiếu trực tiếp ({item.cited_rules.length} tiêu chuẩn):
                        </span>
                      </div>
                      <div className="space-y-2">
                        {item.cited_rules.map((rule: any) => (
                          <div key={rule.id} className="text-xs flex flex-col gap-0.5">
                            <span className="font-semibold text-nep-ink">
                              • {rule.title}
                            </span>
                            <p className="text-[11px] text-nep-ink/75 leading-relaxed italic pl-3">
                              "{rule.message_vi}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-nep-ink/55">
                    <span>Nhóm tư liệu: <strong className="text-nep-ink/80">{getSourceCategoryName(item.id)}</strong></span>
                    <span>Ngày thẩm định: {item.accessed}</span>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-low border-t border-nep-ink/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-nep-ink/70">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cam kết minh bạch: Mọi gợi ý phong cách đều gắn với nguồn tra cứu xác thực.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-full bg-nep-ink text-white text-xs font-semibold hover:bg-nep-ink/80 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

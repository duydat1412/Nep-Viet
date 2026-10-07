"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2, Check } from "lucide-react";

interface ExportButtonProps {
  cardRef: React.RefObject<HTMLDivElement>;
  comboId: string;
}

export default function ExportButton({ cardRef, comboId }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleExport = async () => {
    if (!cardRef.current) return;
    try {
      setLoading(true);
      // First pass for Safari issue (warm up image cache)
      await toPng(cardRef.current, { cacheBust: true, pixelRatio: 1 });
      
      // Second pass: full high-res 1080x1920 export
      const dataUrl = await toPng(cardRef.current, { 
        pixelRatio: 3, 
        quality: 0.95,
        cacheBust: true 
      });
      
      const link = document.createElement("a");
      link.download = `lookbook-nep-viet-${comboId || "export"}.png`;
      link.href = dataUrl;
      link.click();
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error("Failed to export image:", err);
      alert("Đã có lỗi xảy ra khi xuất ảnh. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      type="button"
      className="w-full sm:w-auto px-7 py-3 rounded-full bg-nep-red text-white text-sm font-semibold shadow-lg shadow-nep-red/25 hover:bg-nep-red/90 hover:shadow-xl transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang tạo ảnh 1080×1920...</span>
        </>
      ) : downloaded ? (
        <>
          <Check className="w-4 h-4 text-emerald-300" />
          <span>Đã tải thẻ thành công!</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Lưu Thẻ Lookbook (9:16)</span>
        </>
      )}
    </button>
  );
}

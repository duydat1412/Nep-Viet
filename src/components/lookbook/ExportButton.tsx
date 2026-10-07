"use client";

import { useState } from "react";
import { toPng } from "html-to-image";

interface ExportButtonProps {
  cardRef: React.RefObject<HTMLDivElement>;
  comboId: string;
}

export default function ExportButton({ cardRef, comboId }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!cardRef.current) return;
    try {
      setLoading(true);
      // First pass for Safari issue
      await toPng(cardRef.current, { cacheBust: true, pixelRatio: 1 });
      
      // Second actual pass
      const dataUrl = await toPng(cardRef.current, { 
        pixelRatio: 3, 
        quality: 0.95,
        cacheBust: true 
      });
      
      const link = document.createElement("a");
      link.download = `lookbook-nep-viet-${comboId || "export"}.png`;
      link.href = dataUrl;
      link.click();
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
      className="px-6 py-2.5 rounded-full bg-nep-indigo text-white font-medium shadow-sm hover:bg-nep-indigo/90 transition-colors disabled:opacity-70 flex items-center gap-2"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          Đang xuất ảnh...
        </>
      ) : (
        <>
          <span>📥</span> Lưu Lookbook
        </>
      )}
    </button>
  );
}

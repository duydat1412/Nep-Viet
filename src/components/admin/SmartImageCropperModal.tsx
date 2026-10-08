"use client";

import { useState, useEffect, useRef } from "react";
import { Scissors, Check, X, RefreshCw, ZoomIn, Eye, Sparkles, Image as ImageIcon } from "lucide-react";

export interface CropCoords {
  x: number;      // 0 - 100 (%)
  y: number;      // 0 - 100 (%)
  width: number;  // 0 - 100 (%)
  height: number; // 0 - 100 (%)
}

export const SLOT_PRESETS: Record<string, { label: string; icon: string; coords: CropCoords }> = {
  top: {
    label: "Áo / Nửa thân trên",
    icon: "👔",
    coords: { x: 10, y: 12, width: 80, height: 55 }
  },
  outer: {
    label: "Áo Tấc / Áo Dài Lễ",
    icon: "🧥",
    coords: { x: 5, y: 15, width: 90, height: 70 }
  },
  bottom: {
    label: "Quần / Nửa thân dưới",
    icon: "👖",
    coords: { x: 15, y: 48, width: 70, height: 48 }
  },
  footwear: {
    label: "Giày / Guốc mộc",
    icon: "👞",
    coords: { x: 15, y: 75, width: 70, height: 25 }
  },
  headwear: {
    label: "Khăn đóng / Nón",
    icon: "👑",
    coords: { x: 20, y: 0, width: 60, height: 30 }
  },
  bag: {
    label: "Túi xách / Phụ kiện",
    icon: "👜",
    coords: { x: 20, y: 35, width: 60, height: 45 }
  },
  full: {
    label: "Giữ nguyên ảnh gốc",
    icon: "🔄",
    coords: { x: 0, y: 0, width: 100, height: 100 }
  }
};

interface SmartImageCropperModalProps {
  isOpen: boolean;
  imageUrl: string;
  initialSlot?: string;
  initialCoords?: CropCoords;
  onClose: () => void;
  onApplyCrop: (croppedUrl: string, coords: CropCoords) => void;
}

export default function SmartImageCropperModal({
  isOpen,
  imageUrl,
  initialSlot = "top",
  initialCoords,
  onClose,
  onApplyCrop
}: SmartImageCropperModalProps) {
  const [coords, setCoords] = useState<CropCoords>(
    initialCoords || SLOT_PRESETS[initialSlot]?.coords || SLOT_PRESETS.top.coords
  );
  const [activePreset, setActivePreset] = useState<string>(initialSlot);
  const [processing, setProcessing] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine proxy URL to bypass CORS if needed
  const proxyUrl = imageUrl.startsWith("data:") 
    ? imageUrl 
    : `/api/admin/proxy-image?url=${encodeURIComponent(imageUrl)}`;

  // Update preset when slot changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      const presetKey = SLOT_PRESETS[initialSlot] ? initialSlot : "top";
      const newCoords = initialCoords || SLOT_PRESETS[presetKey].coords;
      setCoords(newCoords);
      setActivePreset(presetKey);
      setImageLoaded(false);
      setLoadError(null);
    }
  }, [isOpen, initialSlot]);

  // Generate cropped preview on Canvas
  const updateCropPreview = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !imageLoaded) return;

    try {
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;
      if (!naturalW || !naturalH) return;

      const sx = Math.max(0, (coords.x / 100) * naturalW);
      const sy = Math.max(0, (coords.y / 100) * naturalH);
      const sWidth = Math.min(naturalW - sx, (coords.width / 100) * naturalW);
      const sHeight = Math.min(naturalH - sy, (coords.height / 100) * naturalH);

      canvas.width = sWidth;
      canvas.height = sHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, sWidth, sHeight);
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

      const dataUrl = canvas.toDataURL("image/png", 0.95);
      setPreviewDataUrl(dataUrl);
    } catch (err: any) {
      console.warn("Lỗi khi render preview canvas:", err);
    }
  };

  useEffect(() => {
    if (imageLoaded) {
      updateCropPreview();
    }
  }, [coords, imageLoaded]);

  // Apply preset button click
  const handleSelectPreset = (key: string) => {
    setActivePreset(key);
    if (SLOT_PRESETS[key]) {
      setCoords(SLOT_PRESETS[key].coords);
    }
  };

  // Upload cropped image to Cloudflare R2 / Server storage
  const handleConfirmAndUpload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setProcessing(true);
    try {
      // Convert canvas to Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png", 0.95);
      });

      if (!blob) throw new Error("Không thể tạo dữ liệu ảnh đã cắt");

      const file = new File([blob], `cropped_${activePreset}_${Date.now()}.png`, {
        type: "image/png",
      });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi tải ảnh lên");

      onApplyCrop(data.url, coords);
      onClose();
    } catch (err: any) {
      console.error("Lỗi khi upload ảnh đã cắt:", err);
      // Fallback: Nếu upload lỗi, dùng data URL
      if (previewDataUrl) {
        onApplyCrop(previewDataUrl, coords);
        onClose();
      } else {
        alert(err.message || "Không thể cắt và lưu ảnh");
      }
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF6EE] text-nep-ink rounded-3xl border border-nep-ink/15 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white/80 border-b border-nep-ink/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-nep-red/10 text-nep-red">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-nep-ink">
                Tự Động Cắt Ảnh Theo Phân Loại Sản Phẩm (Smart Crop)
              </h3>
              <p className="text-[11px] text-nep-ink/60">
                Lấy chính xác phần trang phục cần thiết từ ảnh người mẫu Shopee mà không làm méo tỉ lệ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-nep-ink/5 text-nep-ink/60 hover:text-nep-ink transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-nep-ink mb-2">
              1. Chọn vị trí trang phục cần trích xuất (Tự động thiết lập tọa độ):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {Object.entries(SLOT_PRESETS).map(([key, item]) => {
                const isActive = activePreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPreset(key)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isActive
                        ? "bg-nep-red text-white border-nep-red shadow-xs font-bold"
                        : "bg-white hover:bg-white/80 text-nep-ink/80 border-nep-ink/10"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[11px] leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dual Preview Box: Source with Crop Box + Cropped Result */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Original Image with Visual Crop Box */}
            <div className="md:col-span-7 bg-white p-4 rounded-2xl border border-nep-ink/10 flex flex-col items-center">
              <span className="text-xs font-bold text-nep-ink/70 mb-2 flex items-center gap-1.5 self-start">
                <ImageIcon className="w-3.5 h-3.5 text-nep-indigo" />
                <span>Ảnh Gốc &amp; Khung Cắt Tọa Độ</span>
              </span>

              <div className="relative max-h-80 w-full flex items-center justify-center bg-nep-paper/40 rounded-xl overflow-hidden border border-nep-ink/5 p-2">
                <img
                  ref={imgRef}
                  src={proxyUrl}
                  alt="Ảnh gốc"
                  crossOrigin="anonymous"
                  onLoad={() => {
                    setImageLoaded(true);
                    setLoadError(null);
                  }}
                  onError={() => {
                    setLoadError("Không thể tải ảnh. Có thể do đường dẫn ảnh bị lỗi.");
                  }}
                  className="max-h-72 max-w-full object-contain select-none"
                />

                {/* Crop Box Overlay */}
                {imageLoaded && (
                  <div
                    className="absolute border-2 border-nep-red bg-nep-red/20 pointer-events-none transition-all duration-150 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                    style={{
                      left: `${coords.x}%`,
                      top: `${coords.y}%`,
                      width: `${coords.width}%`,
                      height: `${coords.height}%`,
                    }}
                  >
                    <span className="absolute top-1 left-1 bg-nep-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                      {Math.round(coords.width)}% × {Math.round(coords.height)}%
                    </span>
                  </div>
                )}

                {loadError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-rose-50/90 text-rose-700 text-xs p-4 text-center">
                    {loadError}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Real-time Cropped Result */}
            <div className="md:col-span-5 bg-white p-4 rounded-2xl border border-nep-ink/10 flex flex-col items-center justify-between h-full">
              <span className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5 self-start">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ảnh Đã Tách Riêng (Xem trước thực tế)</span>
              </span>

              <div className="w-full flex-1 min-h-[220px] bg-nep-paper/40 rounded-xl border border-nep-ink/5 p-2 flex items-center justify-center overflow-hidden">
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Kết quả cắt"
                    className="max-h-64 max-w-full object-contain drop-shadow-md rounded-lg"
                  />
                ) : (
                  <div className="text-center text-nep-ink/40">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-1 text-nep-red" />
                    <span className="text-xs">Đang xử lý khung cắt...</span>
                  </div>
                )}
              </div>

              {/* Hidden Canvas used for cropping calculation */}
              <canvas ref={canvasRef} className="hidden" />

              <p className="text-[10px] text-nep-ink/50 text-center mt-2 italic">
                Ảnh kết quả sẽ được dùng làm ảnh đại diện món đồ trong bộ phối Lookbook
              </p>
            </div>
          </div>

          {/* Manual Coordinate Sliders for Fine-Tuning */}
          <div className="bg-white p-4 rounded-2xl border border-nep-ink/10 space-y-3">
            <span className="text-xs font-bold text-nep-ink block">
              2. Tinh chỉnh tọa độ cắt thủ công:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-nep-ink/70">Vị trí Dọc (Y - Cao):</span>
                  <span className="font-mono font-bold text-nep-red">{coords.y}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={80}
                  value={coords.y}
                  onChange={(e) => {
                    setActivePreset("custom");
                    setCoords((prev) => ({ ...prev, y: Number(e.target.value) }));
                  }}
                  className="w-full accent-nep-red cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-nep-ink/70">Chiều cao khung (Height):</span>
                  <span className="font-mono font-bold text-nep-red">{coords.height}%</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={100}
                  value={coords.height}
                  onChange={(e) => {
                    setActivePreset("custom");
                    setCoords((prev) => ({ ...prev, height: Number(e.target.value) }));
                  }}
                  className="w-full accent-nep-red cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-nep-ink/70">Vị trí Ngang (X - Trái):</span>
                  <span className="font-mono font-bold text-nep-indigo">{coords.x}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={70}
                  value={coords.x}
                  onChange={(e) => {
                    setActivePreset("custom");
                    setCoords((prev) => ({ ...prev, x: Number(e.target.value) }));
                  }}
                  className="w-full accent-nep-indigo cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-nep-ink/70">Chiều rộng khung (Width):</span>
                  <span className="font-mono font-bold text-nep-indigo">{coords.width}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={coords.width}
                  onChange={(e) => {
                    setActivePreset("custom");
                    setCoords((prev) => ({ ...prev, width: Number(e.target.value) }));
                  }}
                  className="w-full accent-nep-indigo cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white/80 border-t border-nep-ink/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-nep-ink/20 text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleConfirmAndUpload}
            disabled={processing || !imageLoaded}
            className="px-6 py-2.5 rounded-full bg-nep-red text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-nep-red/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {processing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang tải lên Cloudflare R2...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Cắt &amp; Lưu Làm Ảnh Món Đồ</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

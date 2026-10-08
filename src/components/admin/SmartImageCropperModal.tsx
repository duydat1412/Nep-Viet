"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Scissors, 
  Check, 
  X, 
  RefreshCw, 
  RotateCcw,
  Eye, 
  Sparkles, 
  Image as ImageIcon,
  Move,
  Maximize2,
  Sliders
} from "lucide-react";

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

type DragHandle = "nw" | "ne" | "se" | "sw" | "n" | "s" | "e" | "w" | "move" | "draw";

interface DragState {
  handle: DragHandle;
  startX: number;
  startY: number;
  startCoords: CropCoords;
}

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
  const [showSliders, setShowSliders] = useState(false);

  // Manual interactive dragging state
  const [dragState, setDragState] = useState<DragState | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine proxy URL to bypass CORS if needed
  const proxyUrl = imageUrl.startsWith("data:") 
    ? imageUrl 
    : `/api/admin/proxy-image?url=${encodeURIComponent(imageUrl)}`;

  // Reset preset when slot changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      const presetKey = SLOT_PRESETS[initialSlot] ? initialSlot : "top";
      const newCoords = initialCoords || SLOT_PRESETS[presetKey].coords;
      setCoords(newCoords);
      setActivePreset(presetKey);
      setImageLoaded(false);
      setLoadError(null);
      setDragState(null);
    }
  }, [isOpen, initialSlot]);

  // Generate cropped preview on Canvas
  const updateCropPreview = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !imageLoaded) return;

    try {
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;
      if (!naturalW || !naturalH) return;

      const sx = Math.max(0, (coords.x / 100) * naturalW);
      const sy = Math.max(0, (coords.y / 100) * naturalH);
      const sWidth = Math.max(1, Math.min(naturalW - sx, (coords.width / 100) * naturalW));
      const sHeight = Math.max(1, Math.min(naturalH - sy, (coords.height / 100) * naturalH));

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
  }, [coords, imageLoaded]);

  useEffect(() => {
    if (imageLoaded) {
      updateCropPreview();
    }
  }, [coords, imageLoaded, updateCropPreview]);

  // Apply preset button click
  const handleSelectPreset = (key: string) => {
    setActivePreset(key);
    if (SLOT_PRESETS[key]) {
      setCoords(SLOT_PRESETS[key].coords);
    }
  };

  // Quick aspect ratio setters
  const handleSetAspectRatio = (ratio: "1:1" | "3:4" | "4:5" | "full") => {
    setActivePreset("custom");
    if (ratio === "full") {
      setCoords({ x: 0, y: 0, width: 100, height: 100 });
      return;
    }

    const img = imgRef.current;
    if (!img || !img.naturalWidth || !img.naturalHeight) return;

    const naturalRatio = img.naturalWidth / img.naturalHeight; // W/H
    let targetRatio = 1; // W/H
    if (ratio === "1:1") targetRatio = 1;
    if (ratio === "3:4") targetRatio = 3 / 4;
    if (ratio === "4:5") targetRatio = 4 / 5;

    // Calculate width & height in % based on image natural aspect ratio
    let width = 70;
    let height = (width * naturalRatio) / targetRatio;
    if (height > 90) {
      height = 90;
      width = (height * targetRatio) / naturalRatio;
    }

    const x = Math.max(0, (100 - width) / 2);
    const y = Math.max(0, (100 - height) / 2);
    setCoords({ x, y, width, height });
  };

  // --- MANUAL DRAG & CROP HANDLERS ---
  const handleStartDrag = (e: React.PointerEvent, handle: DragHandle) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setDragState({
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startCoords: { ...coords }
    });
  };

  const handleContainerPointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Click outside crop box: start drawing a new crop box
    const clickX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const clickY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const initialDrawCoords = { x: clickX, y: clickY, width: 0, height: 0 };
    setCoords(initialDrawCoords);
    setActivePreset("custom");

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    setDragState({
      handle: "draw",
      startX: e.clientX,
      startY: e.clientY,
      startCoords: initialDrawCoords
    });
  };

  // Window pointer move and pointer up for smooth, continuous dragging
  useEffect(() => {
    if (!dragState) return;

    const onPointerMove = (e: PointerEvent) => {
      if (!dragState || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dxPercent = ((e.clientX - dragState.startX) / rect.width) * 100;
      const dyPercent = ((e.clientY - dragState.startY) / rect.height) * 100;
      const start = dragState.startCoords;

      let newCoords = { ...start };

      if (dragState.handle === "move") {
        let nx = start.x + dxPercent;
        let ny = start.y + dyPercent;
        nx = Math.max(0, Math.min(100 - start.width, nx));
        ny = Math.max(0, Math.min(100 - start.height, ny));
        newCoords = { ...start, x: nx, y: ny };
      } else if (dragState.handle === "draw") {
        const curX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const curY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        const originX = start.x;
        const originY = start.y;

        const x = Math.min(originX, curX);
        const y = Math.min(originY, curY);
        const width = Math.abs(curX - originX);
        const height = Math.abs(curY - originY);
        newCoords = { x, y, width, height };
      } else {
        // Resizing with 8 handles
        let { x, y, width, height } = start;

        // Horizontal resizing
        if (dragState.handle.includes("e")) {
          width = Math.max(4, Math.min(100 - x, start.width + dxPercent));
        }
        if (dragState.handle.includes("w")) {
          const maxX = start.x + start.width - 4;
          const targetX = Math.max(0, Math.min(maxX, start.x + dxPercent));
          width = start.width + (start.x - targetX);
          x = targetX;
        }

        // Vertical resizing
        if (dragState.handle.includes("s")) {
          height = Math.max(4, Math.min(100 - y, start.height + dyPercent));
        }
        if (dragState.handle.includes("n")) {
          const maxY = start.y + start.height - 4;
          const targetY = Math.max(0, Math.min(maxY, start.y + dyPercent));
          height = start.height + (start.y - targetY);
          y = targetY;
        }

        newCoords = { x, y, width, height };
      }

      setCoords(newCoords);
      setActivePreset("custom");
    };

    const onPointerUp = () => {
      // Enforce minimum box dimensions if too small
      setCoords((prev) => {
        if (prev.width < 5 || prev.height < 5) {
          return {
            x: Math.max(0, Math.min(80, prev.x)),
            y: Math.max(0, Math.min(80, prev.y)),
            width: Math.max(20, prev.width),
            height: Math.max(20, prev.height)
          };
        }
        return prev;
      });
      setDragState(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragState]);

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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="bg-[#FAF6EE] text-nep-ink rounded-3xl border border-nep-ink/15 shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-3.5 bg-white/90 border-b border-nep-ink/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-nep-red/10 text-nep-red">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base text-nep-ink">
                  Cắt Ảnh Bằng Tay &amp; Khung Tọa Độ (Interactive Crop)
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  ✨ Kéo Thả Trực Tiếp
                </span>
              </div>
              <p className="text-[11px] text-nep-ink/60">
                Nhấp và kéo các góc để thu phóng, kéo giữa khung để di chuyển, hoặc rê chuột để vẽ vùng chọn mới.
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
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* Quick Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-nep-ink flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-nep-red" />
                <span>Mẫu Khung Gợi Ý Sẵn Theo Loại Đồ (Bấm để đặt nhanh, sau đó kéo tay tinh chỉnh):</span>
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetAspectRatio("1:1")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-nep-ink/10 hover:bg-nep-paper text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Đặt tỷ lệ khung 1:1 vuông"
                >
                  Vuông 1:1
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAspectRatio("3:4")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-nep-ink/10 hover:bg-nep-paper text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Đặt tỷ lệ khung đứng 3:4"
                >
                  Đứng 3:4
                </button>
                <button
                  type="button"
                  onClick={() => handleSetAspectRatio("full")}
                  className="px-2.5 py-1 rounded-lg bg-white border border-nep-ink/10 hover:bg-nep-paper text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Chọn toàn bộ ảnh"
                >
                  Toàn Ảnh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {Object.entries(SLOT_PRESETS).map(([key, item]) => {
                const isActive = activePreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPreset(key)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isActive
                        ? "bg-nep-red text-white border-nep-red shadow-xs font-bold"
                        : "bg-white hover:bg-white/80 text-nep-ink/80 border-nep-ink/10"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[11px] leading-tight truncate w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dual Preview Box: Interactive Source Image (Left) + Realtime Cropped Canvas (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Left: Original Image with Direct Mouse/Touch Dragging */}
            <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-nep-ink/10 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-nep-ink flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-nep-indigo" />
                  <span>Kéo Cắt Trực Tiếp Trên Ảnh Gốc:</span>
                </span>
                <span className="text-[10px] text-nep-ink/50 font-mono">
                  {Math.round(coords.width)}% × {Math.round(coords.height)}% (X:{Math.round(coords.x)}%, Y:{Math.round(coords.y)}%)
                </span>
              </div>

              {/* Main Cropping Viewport Container */}
              <div className="flex-1 min-h-[340px] max-h-[460px] bg-neutral-900/90 rounded-xl overflow-hidden flex items-center justify-center p-3 relative select-none">
                
                {/* Image + Crop Box Overlay Wrapper */}
                <div 
                  ref={containerRef}
                  onPointerDown={handleContainerPointerDown}
                  className="relative inline-block select-none max-w-full max-h-full cursor-crosshair touch-none overflow-hidden rounded shadow-lg"
                >
                  <img
                    ref={imgRef}
                    src={proxyUrl}
                    alt="Ảnh sản phẩm gốc"
                    crossOrigin="anonymous"
                    onLoad={() => {
                      setImageLoaded(true);
                      setLoadError(null);
                    }}
                    onError={() => {
                      setLoadError("Không thể tải ảnh. Có thể đường dẫn ảnh bị chặn hoặc URL bị lỗi.");
                    }}
                    className="max-h-[420px] max-w-full block object-contain select-none pointer-events-none"
                  />

                  {/* Crop Box Overlay with Dimmed Mask */}
                  {imageLoaded && (
                    <div
                      className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move z-10"
                      style={{
                        left: `${coords.x}%`,
                        top: `${coords.y}%`,
                        width: `${coords.width}%`,
                        height: `${coords.height}%`,
                      }}
                      onPointerDown={(e) => handleStartDrag(e, "move")}
                    >
                      {/* 3x3 Rule-of-Thirds Grid */}
                      <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-35">
                        <div className="border-r border-b border-white"></div>
                        <div className="border-r border-b border-white"></div>
                        <div className="border-b border-white"></div>
                        <div className="border-r border-b border-white"></div>
                        <div className="border-r border-b border-white"></div>
                        <div className="border-b border-white"></div>
                        <div className="border-r border-white"></div>
                        <div className="border-r border-white"></div>
                        <div></div>
                      </div>

                      {/* Dimensions Label Tag */}
                      <div className="absolute top-1.5 left-1.5 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm font-mono pointer-events-none flex items-center gap-1">
                        <Move className="w-2.5 h-2.5 opacity-70" />
                        <span>Kéo di chuyển</span>
                      </div>

                      {/* 8 Resize Handles */}
                      {/* 4 Corners */}
                      <div
                        className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-nep-red rounded-full shadow-md cursor-nwse-resize z-20 hover:scale-125 transition-transform"
                        onPointerDown={(e) => handleStartDrag(e, "nw")}
                        title="Kéo co giãn góc trên trái"
                      />
                      <div
                        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-nep-red rounded-full shadow-md cursor-nesw-resize z-20 hover:scale-125 transition-transform"
                        onPointerDown={(e) => handleStartDrag(e, "ne")}
                        title="Kéo co giãn góc trên phải"
                      />
                      <div
                        className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-nep-red rounded-full shadow-md cursor-nwse-resize z-20 hover:scale-125 transition-transform"
                        onPointerDown={(e) => handleStartDrag(e, "se")}
                        title="Kéo co giãn góc dưới phải"
                      />
                      <div
                        className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-nep-red rounded-full shadow-md cursor-nesw-resize z-20 hover:scale-125 transition-transform"
                        onPointerDown={(e) => handleStartDrag(e, "sw")}
                        title="Kéo co giãn góc dưới trái"
                      />

                      {/* 4 Edges */}
                      <div
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-nep-red rounded-full shadow-xs cursor-ns-resize z-20 hover:scale-110 transition-transform"
                        onPointerDown={(e) => handleStartDrag(e, "n")}
                        title="Kéo co giãn cạnh trên"
                      />
                      <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-nep-red rounded-full shadow-xs cursor-ns-resize z-20 hover:scale-110 transition-transform"
                        onPointerDown={(e) => handleStartDrag(e, "s")}
                        title="Kéo co giãn cạnh dưới"
                      />
                      <div
                        className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-6 bg-white border border-nep-red rounded-full shadow-xs cursor-ew-resize z-20 hover:scale-110 transition-transform"
                        onPointerDown={(e) => handleStartDrag(e, "w")}
                        title="Kéo co giãn cạnh trái"
                      />
                      <div
                        className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-6 bg-white border border-nep-red rounded-full shadow-xs cursor-ew-resize z-20 hover:scale-110 transition-transform"
                        onPointerDown={(e) => handleStartDrag(e, "e")}
                        title="Kéo co giãn cạnh phải"
                      />
                    </div>
                  )}

                  {loadError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-rose-900/90 text-white text-xs p-4 text-center">
                      {loadError}
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions banner */}
              <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-nep-paper/70 border border-nep-ink/10 flex items-center justify-between text-[11px] text-nep-ink/70">
                <span className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-nep-red shrink-0" />
                  <span>Kéo 8 chấm neo để co giãn • Kéo giữa để di chuyển • Nhấp &amp; rê ngoài ảnh để vẽ vùng mới</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(initialSlot)}
                  className="font-bold text-nep-indigo hover:text-nep-red transition-colors flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Đặt lại</span>
                </button>
              </div>
            </div>

            {/* Right: Live Preview of Cropped Result */}
            <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-nep-ink/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ảnh Xem Trước Thực Tế (Món đồ đã bóc tách):</span>
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold border border-emerald-200">
                    Live Preview
                  </span>
                </div>

                <div className="w-full min-h-[300px] max-h-[380px] bg-[#FAF6EE] rounded-xl border border-nep-ink/10 p-3 flex items-center justify-center overflow-hidden shadow-inner">
                  {previewDataUrl ? (
                    <img
                      src={previewDataUrl}
                      alt="Kết quả cắt"
                      className="max-h-72 max-w-full object-contain drop-shadow-md rounded-lg"
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

                <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                  💡 <strong>Gợi ý:</strong> Bạn nên cắt bỏ khuôn mặt của mẫu và phần chân nếu chỉ muốn lấy áo. Ảnh này sẽ đại diện trực tiếp cho món đồ trong tủ đồ cổ phục.
                </div>
              </div>

              {/* Toggle Sliders Option */}
              <div className="pt-2 border-t border-nep-ink/10 mt-3">
                <button
                  type="button"
                  onClick={() => setShowSliders(!showSliders)}
                  className="text-[11px] font-bold text-nep-ink/70 hover:text-nep-ink flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-nep-indigo" />
                  <span>{showSliders ? "Thu gọn thanh trượt tọa độ ▲" : "Mở thanh trượt tọa độ chi tiết (Sliders) ▼"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Optional Fine-Tuning Coordinate Sliders */}
          {showSliders && (
            <div className="bg-white p-4 rounded-2xl border border-nep-ink/10 space-y-3 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-nep-ink block">
                Tinh chỉnh tọa độ theo phần trăm số (%):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-nep-ink/70">Vị trí Dọc (Y - Trên):</span>
                    <span className="font-mono font-bold text-nep-red">{Math.round(coords.y)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={85}
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
                    <span className="font-mono font-bold text-nep-red">{Math.round(coords.height)}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
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
                    <span className="font-mono font-bold text-nep-indigo">{Math.round(coords.x)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={85}
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
                    <span className="font-mono font-bold text-nep-indigo">{Math.round(coords.width)}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
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
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-white/90 border-t border-nep-ink/10 flex items-center justify-between">
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

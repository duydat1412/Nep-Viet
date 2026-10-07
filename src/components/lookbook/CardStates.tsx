"use client";

import { Sparkles, AlertTriangle, BookOpen, RotateCcw } from "lucide-react";

export function LoadingSkeleton() {
  return (
    <div className="w-[360px] min-h-[640px] bg-nep-paper/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-nep-ink/10 p-6 flex flex-col items-center justify-between">
      <div className="animate-pulse flex flex-col items-center w-full">
        {/* Header skeleton */}
        <div className="h-6 w-32 bg-nep-ink/10 rounded-full mb-2"></div>
        <div className="h-3 w-20 bg-nep-ink/5 rounded-full mb-6"></div>

        {/* Badge skeleton */}
        <div className="h-6 w-28 bg-nep-ink/10 rounded-full mb-6"></div>

        {/* Outfit Lineup Skeleton */}
        <div className="w-full bg-white/60 rounded-2xl p-4 flex flex-col items-center gap-3 border border-nep-ink/5 mb-4">
          <div className="h-32 w-28 bg-nep-ink/10 rounded-xl"></div>
          <div className="h-28 w-24 bg-nep-ink/10 rounded-xl"></div>
          <div className="h-12 w-20 bg-nep-ink/10 rounded-xl"></div>
        </div>

        {/* Score & Text skeleton */}
        <div className="w-full h-8 bg-white/40 rounded-xl mb-2"></div>
        <div className="w-full h-12 bg-white/40 rounded-xl"></div>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-nep-ink/70 py-2">
        <Sparkles className="w-4 h-4 text-nep-gold animate-spin" />
        <span>Đang nẹp tà, đối chiếu quy tắc văn hóa...</span>
      </div>
    </div>
  );
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="w-[360px] min-h-[500px] bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl border border-rose-200 p-6 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100 shadow-xs">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="font-heading text-lg font-bold text-nep-ink mb-1">Đã có lỗi xảy ra</h3>
      <p className="text-xs text-nep-ink/70 mb-6 max-w-[260px] leading-relaxed">{message}</p>
      <button 
        onClick={onRetry}
        type="button"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-nep-red text-white rounded-full text-xs font-semibold shadow-md hover:bg-nep-red/90 transition-all cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Thử lại ngay
      </button>
    </div>
  );
}

export function ChuaDuCanCuCard({ message, thieu_can_cu }: { message: string; thieu_can_cu: string[] }) {
  return (
    <div className="w-[360px] min-h-[560px] bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl border border-nep-ink/10 p-6 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-nep-paper text-nep-ink/70 flex items-center justify-center mb-4 border border-nep-ink/10 shadow-xs">
        <BookOpen className="w-6 h-6 text-nep-gold" />
      </div>
      <h3 className="font-heading text-lg font-bold text-nep-ink mb-2">Chưa đủ căn cứ xác thực</h3>
      <p className="text-xs text-nep-ink/70 mb-5 leading-relaxed">{message}</p>
      
      {thieu_can_cu?.length > 0 && (
        <div className="text-left w-full bg-nep-paper/60 p-3.5 rounded-xl border border-nep-ink/5 mb-2">
          <p className="text-[11px] font-semibold text-nep-ink mb-1.5">Nguyên tắc bảo lưu:</p>
          <ul className="text-[11px] text-nep-ink/70 space-y-1 list-disc list-inside">
            {thieu_can_cu.map((item, i) => (
              <li key={i} className="leading-snug">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function FallbackBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nep-indigo/10 text-nep-indigo text-[11px] font-medium border border-nep-indigo/20 mb-3 shadow-2xs backdrop-blur-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-nep-indigo animate-pulse" />
      Phương án gợi ý biên tập chuẩn (Chế độ tin cậy)
    </div>
  );
}

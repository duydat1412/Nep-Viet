"use client";

export function LoadingSkeleton() {
  return (
    <div className="w-[360px] h-[640px] bg-nep-paper shadow-xl rounded-xl border border-nep-ink/10 p-6 flex flex-col items-center justify-center">
      <div className="animate-pulse flex flex-col items-center w-full">
        <div className="h-8 w-32 bg-gray-200 rounded mb-8"></div>
        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
      </div>
      <p className="mt-8 text-sm text-nep-ink/60 animate-bounce">Đang nẹp tà, đối chiếu quy tắc văn hóa...</p>
    </div>
  );
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="w-[360px] h-[640px] bg-red-50 shadow-xl rounded-xl border border-red-100 p-6 flex flex-col items-center justify-center text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-bold text-red-800 mb-2">Đã có lỗi xảy ra</h3>
      <p className="text-sm text-red-600 mb-8">{message}</p>
      <button 
        onClick={onRetry}
        className="px-6 py-2 bg-red-600 text-white rounded-full font-medium shadow-sm hover:bg-red-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
}

export function ChuaDuCanCuCard({ message, thieu_can_cu }: { message: string; thieu_can_cu: string[] }) {
  return (
    <div className="w-[360px] h-[640px] bg-gray-50 shadow-xl rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
      <div className="text-4xl mb-4">📚</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa đủ căn cứ</h3>
      <p className="text-sm text-gray-600 mb-4">{message}</p>
      <div className="text-left w-full bg-white p-3 rounded border border-gray-100">
        <p className="text-xs font-semibold mb-1">Thiếu thông tin về:</p>
        <ul className="text-xs text-gray-500 list-disc list-inside">
          {thieu_can_cu.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function FallbackBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="w-full bg-nep-indigo text-white text-xs text-center py-1.5 font-medium shadow-sm">
      Đang hiển thị phương án gợi ý biên tập chuẩn
    </div>
  );
}

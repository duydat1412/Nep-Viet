"use client";

import { useState } from "react";
import Step1 from "@/components/form/Step1";
import Step2 from "@/components/form/Step2";
import Step3 from "@/components/form/Step3";
import LookbookCard from "@/components/lookbook/LookbookCard";
import {
  LoadingSkeleton,
  ErrorCard,
  ChuaDuCanCuCard,
  FallbackBanner
} from "@/components/lookbook/CardStates";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    occasion: "di_le",
    group: "ao_ngu_than",
    gender: "nam",
    style_level: "truyen_thong",
    tone: "tram",
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(4);
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Không thể kết nối đến máy chủ.");
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi khi tạo gợi ý.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setResult(null);
  };

  return (
    <main className="max-w-md mx-auto p-4 flex flex-col min-h-screen">
      <header className="mb-6 text-center mt-6">
        <h1 className="font-heading text-4xl font-bold text-nep-red tracking-wide">
          NẾP VIỆT
        </h1>
        <p className="text-nep-ink/80 text-sm mt-1">
          Nếp Việt, nét riêng.
        </p>
      </header>

      {/* Progress Indicators */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === currentStep
                ? "w-8 bg-nep-red"
                : step < currentStep
                ? "w-4 bg-nep-gold"
                : "w-4 bg-nep-ink/15"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {currentStep === 1 && (
          <Step1
            value={formData.occasion}
            onChange={(v) => setFormData({ ...formData, occasion: v })}
          />
        )}
        {currentStep === 2 && (
          <Step2
            group={formData.group}
            styleLevel={formData.style_level}
            onGroupChange={(v) => setFormData({ ...formData, group: v })}
            onStyleChange={(v) => setFormData({ ...formData, style_level: v })}
          />
        )}
        {currentStep === 3 && (
          <Step3
            value={formData.tone}
            onChange={(v) => setFormData({ ...formData, tone: v })}
          />
        )}
        {currentStep === 4 && (
          <div className="flex flex-col items-center justify-center flex-1">
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <ErrorCard message={error} onRetry={() => handleNext()} />
            ) : result ? (
              result.trang_thai === "CHUA_DU_CAN_CU" ? (
                <div className="flex flex-col items-center">
                  <ChuaDuCanCuCard
                    message="Dữ liệu biên tập của Nếp Việt hiện tại chưa bao quát sự kết hợp này. Hệ thống không đưa ra phỏng đoán để đảm bảo tính chuẩn xác văn hóa."
                    thieu_can_cu={result.thieu_can_cu || []}
                  />
                  <button
                    onClick={handleReset}
                    className="mt-4 px-6 py-2 bg-nep-indigo text-white rounded-full text-sm font-medium shadow-sm hover:opacity-90"
                  >
                    Chọn lại bối cảnh khác
                  </button>
                </div>
              ) : result.phuong_an?.[0] ? (
                <div className="flex flex-col items-center w-full">
                  <FallbackBanner visible={result.fallback_used} />
                  <LookbookCard result={result.phuong_an[0]} />
                  <button
                    onClick={handleReset}
                    className="mt-4 text-xs text-nep-ink/60 underline hover:text-nep-red"
                  >
                    ← Thử phương án phối đồ khác
                  </button>
                </div>
              ) : (
                <ErrorCard
                  message="Không tìm thấy phương án phối đồ phù hợp."
                  onRetry={() => handleNext()}
                />
              )
            ) : null}
          </div>
        )}
      </div>

      {currentStep < 4 && (
        <div className="mt-8 flex justify-between items-center pt-4 border-t border-nep-ink/10">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-2 rounded-full border border-nep-ink/20 text-sm font-medium disabled:opacity-40"
          >
            Quay lại
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-full bg-nep-red text-white text-sm font-medium shadow-md hover:bg-nep-red/90 transition-colors"
          >
            {currentStep === 3 ? "Phối đồ ngay ✨" : "Tiếp tục →"}
          </button>
        </div>
      )}
    </main>
  );
}

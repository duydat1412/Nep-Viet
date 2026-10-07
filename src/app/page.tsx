"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Share2, Check } from "lucide-react";
import Step1 from "@/components/form/Step1";
import Step2 from "@/components/form/Step2";
import Step3 from "@/components/form/Step3";
import LookbookCard from "@/components/lookbook/LookbookCard";
import {
  LoadingSkeleton,
  ErrorCard,
  ChuaDuCanCuCard,
  FallbackBanner,
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
  const [copied, setCopied] = useState(false);

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

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6EFE0] bg-[radial-gradient(#E8DFC8_1px,transparent_1px)] [background-size:24px_24px] text-nep-ink flex flex-col justify-between py-6 px-4 selection:bg-nep-red/20 selection:text-nep-red">
      <main className="max-w-md mx-auto w-full flex flex-col flex-1">
        {/* App Header with Cultural Seal */}
        <header className="mb-6 text-center mt-2 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-nep-red/40 bg-nep-red/5 mb-2 shadow-2xs">
            <span className="font-heading font-black text-nep-red text-base">N</span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-nep-red tracking-wider">
            NẾP VIỆT
          </h1>
          <p className="text-nep-ink/70 text-xs font-medium tracking-widest uppercase mt-0.5">
            Nếp Việt, nét riêng.
          </p>
        </header>

        {/* Stepper Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[
            { step: 1, label: "Dịp" },
            { step: 2, label: "Áo & Mức" },
            { step: 3, label: "Màu sắc" },
            { step: 4, label: "Lookbook" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  item.step === currentStep
                    ? "w-8 bg-nep-red shadow-xs"
                    : item.step < currentStep
                    ? "w-3 bg-nep-gold"
                    : "w-3 bg-nep-ink/15"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step Views */}
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
                  <div className="flex flex-col items-center w-full">
                    <ChuaDuCanCuCard
                      message="Dữ liệu biên tập của Nếp Việt hiện tại chưa bao quát sự kết hợp này. Hệ thống không đưa ra phỏng đoán để đảm bảo tính chuẩn xác văn hóa."
                      thieu_can_cu={result.thieu_can_cu || []}
                    />
                    <button
                      onClick={handleReset}
                      type="button"
                      className="mt-4 px-6 py-2.5 bg-nep-indigo text-white rounded-full text-xs font-semibold shadow-md hover:opacity-90 cursor-pointer"
                    >
                      ← Chọn lại bối cảnh khác
                    </button>
                  </div>
                ) : result.phuong_an?.[0] ? (
                  <div className="flex flex-col items-center w-full">
                    <FallbackBanner visible={result.fallback_used} />
                    <LookbookCard result={result.phuong_an[0]} />

                    {/* Secondary Actions */}
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={handleReset}
                        type="button"
                        className="text-xs text-nep-ink/70 hover:text-nep-red font-medium transition-colors cursor-pointer"
                      >
                        ← Thử phương án khác
                      </button>
                      <span className="text-nep-ink/20">|</span>
                      <button
                        onClick={handleShareLink}
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-nep-indigo hover:underline font-medium cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Đã sao chép link!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Chia sẻ link</span>
                          </>
                        )}
                      </button>
                    </div>
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

        {/* Footer Navigation */}
        {currentStep < 4 && (
          <div className="mt-8 flex justify-between items-center pt-4 border-t border-nep-ink/10">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              type="button"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-nep-ink/20 text-xs font-semibold text-nep-ink disabled:opacity-30 cursor-pointer hover:bg-white/60 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-nep-red text-white text-xs font-semibold shadow-md shadow-nep-red/20 hover:bg-nep-red/90 transition-all cursor-pointer active:scale-95"
            >
              {currentStep === 3 ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-nep-gold" />
                  <span>Phối đồ ngay</span>
                </>
              ) : (
                <>
                  <span>Tiếp tục</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </main>

      <footer className="text-center mt-6 text-[10px] text-nep-ink/40 font-mono">
        Nếp Việt © 2026 • AI Arena Vietnam
      </footer>
    </div>
  );
}

"use client";

import { Scroll, Sparkles, Zap, ShieldCheck } from "lucide-react";

interface Step2Props {
  group: string;
  styleLevel: string;
  onGroupChange: (v: string) => void;
  onStyleChange: (v: string) => void;
}

export default function Step2({ group, styleLevel, onGroupChange, onStyleChange }: Step2Props) {
  const groups = [
    {
      id: "ao_ngu_than",
      label: "Áo ngũ thân tay chẽn",
      desc: "Thường phục thanh lịch, gọn gàng",
      badge: "Phổ biến",
    },
    {
      id: "ao_dai",
      label: "Áo dài truyền thống",
      desc: "Tôn dáng, kinh điển học đường",
      badge: "Kỷ yếu",
    },
    {
      id: "ao_tac",
      label: "Áo tấc (tay thụng)",
      desc: "Lễ phục trang trọng, khiêm cung",
      badge: "Lễ Tết",
    },
    {
      id: "ao_tu_than",
      label: "Áo tứ thân",
      desc: "Văn hóa đồng bằng Bắc Bộ",
      badge: "Biểu diễn",
    },
  ];

  const styles = [
    {
      id: "truyen_thong",
      label: "Truyền thống nguyên bản",
      desc: "Áo ngũ thân, quần lụa, guốc mộc/hài chuẩn quy thức",
      icon: Scroll,
      color: "text-nep-indigo",
    },
    {
      id: "cach_tan_nhe",
      label: "Cách tân nhẹ",
      desc: "Giữ form áo chuẩn, mix phụ kiện trang nhã tối giản",
      icon: Sparkles,
      color: "text-nep-gold",
    },
    {
      id: "phoi_hien_dai",
      label: "Phối hiện đại (Gen Z Accent)",
      desc: "Phối cùng sneaker, kính mát, túi tote năng động",
      icon: Zap,
      color: "text-nep-red",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Nhóm Việt Phục */}
      <section>
        <div className="mb-2.5">
          <h2 className="font-heading text-xl font-bold text-nep-ink tracking-tight">
            1. Chọn nhóm Việt phục
          </h2>
          <p className="text-xs text-nep-ink/60">
            Nền tảng trang phục cốt lõi bạn muốn khám phá
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {groups.map((opt) => {
            const isSelected = group === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onGroupChange(opt.id)}
                type="button"
                className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[92px] ${
                  isSelected
                    ? "border-nep-red/60 bg-white shadow-md ring-2 ring-nep-red/20 scale-[1.02]"
                    : "border-nep-ink/10 bg-white/50 hover:bg-white hover:border-nep-ink/20"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-nep-red bg-nep-red/10 px-1.5 py-0.5 rounded-md">
                    {opt.badge}
                  </span>
                  {isSelected && (
                    <ShieldCheck className="w-4 h-4 text-nep-red" strokeWidth={2} />
                  )}
                </div>
                <div>
                  <span className="font-semibold text-xs text-nep-ink block leading-snug">
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-nep-ink/60 block mt-0.5 line-clamp-1">
                    {opt.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Mức độ diễn giải */}
      <section>
        <div className="mb-2.5">
          <h2 className="font-heading text-xl font-bold text-nep-ink tracking-tight">
            2. Mức độ diễn giải
          </h2>
          <p className="text-xs text-nep-ink/60">
            Độ phá cách của phụ kiện và trang phục phối cùng
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {styles.map((opt) => {
            const Icon = opt.icon;
            const isSelected = styleLevel === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onStyleChange(opt.id)}
                type="button"
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-nep-red/60 bg-white shadow-md ring-2 ring-nep-red/20 translate-x-1"
                    : "border-nep-ink/10 bg-white/50 hover:bg-white hover:border-nep-ink/20"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected ? "bg-nep-red text-white" : "bg-nep-paper text-nep-ink/70"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="flex-1">
                  <span className="block font-semibold text-sm text-nep-ink">
                    {opt.label}
                  </span>
                  <span className="block text-[11px] text-nep-ink/60 mt-0.5">
                    {opt.desc}
                  </span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? "border-nep-red bg-nep-red" : "border-nep-ink/30"
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

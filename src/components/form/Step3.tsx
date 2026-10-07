"use client";

import { Palette } from "lucide-react";

interface Step3Props {
  value: string;
  onChange: (v: string) => void;
}

export default function Step3({ value, onChange }: Step3Props) {
  const tones = [
    {
      id: "tram",
      label: "Trầm nhã / Điềm đạm",
      desc: "Xanh chàm, nâu trầm, xám ngà tối giản",
      swatches: ["#26466D", "#2B2118", "#5D4037", "#F8F9FA"],
    },
    {
      id: "tuoi",
      label: "Tươi sáng / Khai xuân",
      desc: "Đỏ son, vàng hoàng yến, hồng cánh sen",
      swatches: ["#B5362B", "#C8963E", "#E8909C", "#FFFFFF"],
    },
    {
      id: "pastel",
      label: "Pastel thanh tân",
      desc: "Xanh thiên thanh, hồng phấn, trắng kem",
      swatches: ["#A5D6A7", "#90CAF9", "#F48FB1", "#FFF9C4"],
    },
    {
      id: "ngu_hanh",
      label: "Ngũ hành tương sinh",
      desc: "Kim - Mộc - Thủy - Hỏa - Thổ (tham khảo dân gian)",
      swatches: ["#FFFFFF", "#2E7D32", "#1565C0", "#C62828"],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-1">
        <h2 className="font-heading text-2xl font-bold text-nep-ink tracking-tight">
          Tone màu bạn yêu thích?
        </h2>
        <p className="text-xs text-nep-ink/60 mt-1">
          Hệ thống sẽ tính điểm hài hòa theo lý thuyết màu sắc quang học
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tones.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              type="button"
              className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-nep-red/60 bg-white shadow-md ring-2 ring-nep-red/20 scale-[1.02]"
                  : "border-nep-ink/10 bg-white/50 hover:bg-white hover:border-nep-ink/20"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-3">
                {opt.swatches.map((hex, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full shadow-xs border border-black/10 transition-transform duration-200"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
              <div>
                <span className="font-semibold text-sm text-nep-ink block">
                  {opt.label}
                </span>
                <span className="text-[11px] text-nep-ink/60 block mt-0.5 leading-snug">
                  {opt.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

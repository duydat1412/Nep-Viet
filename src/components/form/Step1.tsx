"use client";

import { Landmark, Sparkles, Camera, Footprints, Music2 } from "lucide-react";

interface Step1Props {
  value: string;
  onChange: (v: string) => void;
}

export default function Step1({ value, onChange }: Step1Props) {
  const options = [
    {
      id: "di_le",
      label: "Đi lễ / Viếng chùa",
      sub: "Không gian trang nghiêm, thanh tịnh",
      icon: Landmark,
      color: "text-nep-indigo",
    },
    {
      id: "tet",
      label: "Tết Nguyên Đán",
      sub: "Du xuân, chúc Tết đầu năm",
      icon: Sparkles,
      color: "text-nep-red",
    },
    {
      id: "ky_yeu",
      label: "Chụp ảnh kỷ yếu",
      sub: "Kỷ niệm học đường, thanh xuân",
      icon: Camera,
      color: "text-nep-gold",
    },
    {
      id: "dao_pho",
      label: "Dạo phố / Check-in",
      sub: "Cuối tuần cà phê, di tích",
      icon: Footprints,
      color: "text-nep-ink",
    },
    {
      id: "bieu_dien",
      label: "Biểu diễn nghệ thuật",
      sub: "Sân khấu học đường, văn nghệ",
      icon: Music2,
      color: "text-nep-lotus",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-1">
        <h2 className="font-heading text-2xl font-bold text-nep-ink tracking-tight">
          Bạn muốn mặc Việt phục dịp nào?
        </h2>
        <p className="text-xs text-nep-ink/70 mt-1">
          Chọn bối cảnh giúp Nếp Việt đối chiếu quy tắc văn hóa phù hợp
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              type="button"
              className={`flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-nep-red/60 bg-white shadow-md ring-2 ring-nep-red/20 translate-x-1"
                  : "border-nep-ink/10 bg-white/50 hover:bg-white hover:border-nep-ink/20 hover:shadow-xs"
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
                  {opt.sub}
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
    </div>
  );
}

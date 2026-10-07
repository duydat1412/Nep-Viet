"use client";

interface Step3Props {
  value: string;
  onChange: (v: string) => void;
}

export default function Step3({ value, onChange }: Step3Props) {
  const tones = [
    { id: "tram", label: "Trầm / Tối giản", desc: "Màu tối, nhã nhặn", colors: ["bg-slate-800", "bg-stone-600"] },
    { id: "tuoi", label: "Tươi sáng / Rực rỡ", desc: "Màu nóng, nổi bật", colors: ["bg-rose-500", "bg-yellow-400"] },
    { id: "pastel", label: "Pastel nhẹ nhàng", desc: "Màu phấn, ngọt ngào", colors: ["bg-pink-200", "bg-blue-200"] },
    { id: "ngu_hanh", label: "Ngũ hành", desc: "Tham khảo dân gian", colors: ["bg-red-600", "bg-emerald-600"] },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold mb-2">Tone màu bạn thích?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tones.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex flex-col gap-2 p-4 rounded-xl border text-left transition-colors ${
              value === opt.id
                ? "border-nep-red bg-nep-red/5"
                : "border-nep-ink/10 hover:border-nep-ink/30"
            }`}
          >
            <div className="flex gap-2 mb-1">
              {opt.colors.map((color, i) => (
                <div key={i} className={`w-6 h-6 rounded-full ${color} shadow-sm border border-black/10`} />
              ))}
            </div>
            <div>
              <div className="font-medium">{opt.label}</div>
              <div className="text-xs text-nep-ink/60">{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

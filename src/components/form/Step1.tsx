"use client";

interface Step1Props {
  value: string;
  onChange: (v: string) => void;
}

export default function Step1({ value, onChange }: Step1Props) {
  const options = [
    { id: "di_le", label: "Đi lễ / Viếng chùa", emoji: "🛕" },
    { id: "tet", label: "Tết Nguyên Đán", emoji: "🧧" },
    { id: "ky_yeu", label: "Chụp kỷ yếu", emoji: "📸" },
    { id: "dao_pho", label: "Dạo phố / Check-in", emoji: "🏙️" },
    { id: "bieu_dien", label: "Biểu diễn", emoji: "🎭" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold mb-2">Bạn muốn mặc Việt phục dịp nào?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
              value === opt.id
                ? "border-nep-red bg-nep-red/5"
                : "border-nep-ink/10 hover:border-nep-ink/30"
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

interface Step2Props {
  group: string;
  styleLevel: string;
  onGroupChange: (v: string) => void;
  onStyleChange: (v: string) => void;
}

export default function Step2({ group, styleLevel, onGroupChange, onStyleChange }: Step2Props) {
  const groups = [
    { id: "ao_ngu_than", label: "Áo ngũ thân tay chẽn" },
    { id: "ao_dai", label: "Áo dài" },
    { id: "ao_tac", label: "Áo tấc" },
    { id: "ao_tu_than", label: "Áo tứ thân" },
  ];

  const styles = [
    { id: "truyen_thong", label: "Truyền thống nguyên bản", emoji: "🏛️" },
    { id: "cach_tan_nhe", label: "Cách tân nhẹ", emoji: "✨" },
    { id: "phoi_hien_dai", label: "Phối hiện đại (Gen Z)", emoji: "🔥" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="font-heading text-xl font-semibold mb-4">Nhóm Việt phục</h2>
        <div className="grid grid-cols-2 gap-3">
          {groups.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onGroupChange(opt.id)}
              className={`p-3 rounded-xl border text-center transition-colors ${
                group === opt.id
                  ? "border-nep-red bg-nep-red/5"
                  : "border-nep-ink/10 hover:border-nep-ink/30"
              }`}
            >
              <span className="font-medium text-sm">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold mb-4">Mức độ diễn giải</h2>
        <div className="flex flex-col gap-3">
          {styles.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onStyleChange(opt.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                styleLevel === opt.id
                  ? "border-nep-red bg-nep-red/5"
                  : "border-nep-ink/10 hover:border-nep-ink/30"
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

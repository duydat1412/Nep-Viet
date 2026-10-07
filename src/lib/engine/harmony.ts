export function hexToHsl(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function isNeutral(hsl: { h: number, s: number, l: number }) {
  return hsl.s <= 12 || hsl.l <= 15 || hsl.l >= 90;
}

export function getHarmonyBand(deltaH: number) {
  if (deltaH <= 45) return { score: 9.0, label: 'Tương đồng', description: 'Các màu sắc nằm gần nhau trên vòng tròn màu, tạo cảm giác hài hòa.' };
  if (deltaH <= 90) return { score: 7.5, label: 'Tương phản liền kề', description: 'Các màu sắc có khoảng cách vừa phải, cần cẩn thận khi kết hợp.' };
  if (deltaH <= 150) return { score: 8.0, label: 'Tương phản chữ Y', description: 'Một màu kết hợp với hai màu kề bên của màu bổ túc.' };
  return { score: 8.6, label: 'Tương phản bổ túc', description: 'Các màu sắc đối diện nhau trên vòng tròn màu, tạo sự nổi bật.' };
}

export function calculateHarmony(colors: Array<{hex: string}>) {
  const hslColors = colors.map(c => hexToHsl(c.hex));
  const chromatic = hslColors.filter(c => !isNeutral(c));
  const neutral = hslColors.filter(c => isNeutral(c));

  if (chromatic.length <= 1) {
    return { score: 9.2, label: 'Trung tính hài hòa', description: 'Phối màu trung tính hoặc đơn sắc, an toàn và tinh tế.' };
  }

  let totalScore = 0;
  let count = 0;
  let label = '';
  let description = '';

  for (let i = 0; i < chromatic.length; i++) {
    for (let j = i + 1; j < chromatic.length; j++) {
      const diff = Math.abs(chromatic[i].h - chromatic[j].h);
      const deltaH = Math.min(diff, 360 - diff);
      const band = getHarmonyBand(deltaH);
      totalScore += band.score;
      label = band.label;
      description = band.description;
      count++;
    }
  }

  let avgScore = totalScore / count;
  if (neutral.length > 0) {
    avgScore += 0.4;
  }
  avgScore = Math.min(avgScore, 9.8);
  avgScore = Math.round(avgScore * 10) / 10;

  return { score: avgScore, label, description };
}

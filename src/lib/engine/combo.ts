export interface Item {
  id: string;
  slot: string;
  group: string;
  name_vi: string;
  gender: string;
  colors: Array<{ name: string; hex: string; ngu_hanh?: string }>;
  formality: number;
  occasions: string[];
  style_levels: string[];
  tags: string[];
  asset: string;
  source_ids: string[];
  status: string;
}

export interface Combo {
  combo_id: string;
  item_ids: string[];
  items: Item[];
  style_level: string;
}

export function buildCombos(items: Item[], occasion: string, group: string, gender: string, styleLevel: string): Combo[] {
  const validItems = items.filter(item => 
    (item.status === 'reviewed' || item.status === 'draft') &&
    item.occasions?.includes(occasion) &&
    (item.gender === gender || item.gender === 'unisex') &&
    item.style_levels?.includes(styleLevel)
  );

  const tops = validItems.filter(i => i.slot === 'top' && i.group === group);
  const bottoms = validItems.filter(i => i.slot === 'bottom');
  const footwears = validItems.filter(i => i.slot === 'footwear');
  const bags = validItems.filter(i => i.slot === 'bag');

  const combos: Combo[] = [];
  let comboIndex = 1;

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const footwear of footwears) {
        if (bags.length > 0 && styleLevel !== 'truyen_thong') {
          for (const bag of bags) {
            const comboItems = [top, bottom, footwear, bag];
            combos.push({
              combo_id: `combo_${occasion}_${comboIndex.toString().padStart(2, '0')}`,
              item_ids: comboItems.map(i => i.id),
              items: comboItems,
              style_level: styleLevel
            });
            comboIndex++;
          }
        } else {
          const comboItems = [top, bottom, footwear];
          combos.push({
            combo_id: `combo_${occasion}_${comboIndex.toString().padStart(2, '0')}`,
            item_ids: comboItems.map(i => i.id),
            items: comboItems,
            style_level: styleLevel
          });
          comboIndex++;
        }
      }
    }
  }

  return combos;
}

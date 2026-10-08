import rulesData from '@/../data/cultural_rules.json';
import { Combo } from './combo';

export interface TriggeredRule {
  id: string;
  level: string;
  title?: string;
  message_vi: string;
  source_ids: string[];
  confidence: string;
  affected_item_ids?: string[];
  affected_slots?: string[];
}

export function evaluateRules(combo: Combo, occasion: string, styleLevel: string) {
  const rules = rulesData?.rules || [];
  const triggered_rules: TriggeredRule[] = [];
  let excluded = false;
  let finalLevel = 'XANH';

  const formalities = combo.items.map(i => i.formality);
  const maxFormality = Math.max(...formalities);
  const minFormality = Math.min(...formalities);
  const gap = maxFormality - minFormality;

  for (const rule of rules) {
    if (rule.type === 'A' && rule.enforcement === 'combo_builder') continue;

    let match = true;
    const when = rule.when as any;
    if (!when) continue;

    if (when.occasion && !when.occasion.includes(occasion)) match = false;
    if (when.style_level && !when.style_level.includes(styleLevel)) match = false;
    
    if (when.item_tags_any) {
      const hasAny = combo.items.some(i => i.tags?.some(t => when.item_tags_any.includes(t)));
      if (!hasAny) match = false;
    }

    if (when.item_tags_all) {
      const hasAll = when.item_tags_all.every((t: string) => combo.items.some(i => i.tags?.includes(t)));
      if (!hasAll) match = false;
    }

    if (when.group_any) {
      const hasGroup = combo.items.some(i => when.group_any.includes(i.group));
      if (!hasGroup) match = false;
    }

    if (when.bottom_tags_any) {
      const bottomItem = combo.items.find(i => i.slot === 'bottom');
      const hasBottomTag = bottomItem?.tags?.some((t: string) => when.bottom_tags_any.includes(t));
      if (!hasBottomTag) match = false;
    }

    if (when.outfit_tags_any) {
      const hasOutfitTag = combo.items.some(i => i.tags?.some(t => when.outfit_tags_any.includes(t)));
      if (!hasOutfitTag) match = false;
    }

    if (when.outfit_missing_tags_any) {
      const missingTag = when.outfit_missing_tags_any.some((t: string) => !combo.items.some(i => i.tags?.includes(t)));
      if (!missingTag) match = false;
    }

    if (when.formality_gap_gte !== undefined && gap < when.formality_gap_gte) match = false;

    if (match) {
      const affectedItems = combo.items.filter((item) => {
        if (when.item_tags_any && item.tags?.some((t: string) => when.item_tags_any.includes(t))) return true;
        if (when.item_tags_all && when.item_tags_all.every((t: string) => item.tags?.includes(t))) return true;
        if (when.bottom_tags_any && item.slot === 'bottom' && item.tags?.some((t: string) => when.bottom_tags_any.includes(t))) return true;
        if (when.group_any && when.group_any.includes(item.group)) return true;
        if (rule.id === 'R_DILE_03' && (item.tags?.includes('phu_kien_duong_pho') || item.id?.includes('sneaker') || item.id?.includes('tote'))) return true;
        return false;
      });

      triggered_rules.push({
        id: rule.id,
        level: rule.level || 'XANH',
        title: (rule as any).title || 'Lưu ý quy tắc văn hóa',
        message_vi: rule.message_vi,
        source_ids: rule.source_ids || [],
        confidence: rule.confidence || 'high',
        affected_item_ids: affectedItems.map((i) => i.id),
        affected_slots: Array.from(new Set(affectedItems.map((i) => i.slot)))
      });

      if (rule.action === 'exclude' && rule.level === 'DO') excluded = true;
      if (rule.level === 'DO') finalLevel = 'DO';
      else if (rule.level === 'VANG' && finalLevel !== 'DO') finalLevel = 'VANG';
      else if (rule.level === 'CHUA_DU_CAN_CU' && finalLevel === 'XANH') finalLevel = 'CHUA_DU_CAN_CU';
    }
  }

  return {
    level: finalLevel as 'XANH' | 'VANG' | 'DO' | 'CHUA_DU_CAN_CU',
    triggered_rules,
    excluded
  };
}

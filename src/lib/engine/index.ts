import { checkCoverage } from './matrix';
import { buildCombos, Combo } from './combo';
import { evaluateRules } from './rules';
import { calculateHarmony } from './harmony';
import itemsData from '@/../data/items.json';
import kbData from '@/../data/knowledge_base.json';

export interface EngineResult {
  trang_thai: string;
  combos_with_scores: Array<{
    combo: Combo;
    rules_result: any;
    harmony_result: any;
  }>;
  thieu_can_cu: boolean;
  kb_cards: any[];
}

export function runEngine(input: { occasion: string, group: string, gender: string, style_level: string, tone?: string }): EngineResult {
  const coverage = checkCoverage(input.occasion, input.group);
  if (!coverage.supported && coverage.status !== 'no_cultural_rules' && coverage.status !== 'info_only') {
    return {
      trang_thai: 'CHUA_DU_CAN_CU',
      combos_with_scores: [],
      thieu_can_cu: true,
      kb_cards: []
    };
  }

  const items = (itemsData as any[]) || [];
  const combos = buildCombos(items, input.occasion, input.group, input.gender, input.style_level);
  
  const combos_with_scores = [];
  for (const combo of combos) {
    const rules_result = evaluateRules(combo, input.occasion, input.style_level);
    if (rules_result.excluded) continue;

    const colors = combo.items.flatMap(i => i.colors || []);
    const harmony_result = calculateHarmony(colors);

    combos_with_scores.push({
      combo,
      rules_result,
      harmony_result
    });
  }

  combos_with_scores.sort((a, b) => {
    if (a.rules_result.level === 'XANH' && b.rules_result.level !== 'XANH') return -1;
    if (a.rules_result.level !== 'XANH' && b.rules_result.level === 'XANH') return 1;
    if (a.rules_result.level === 'VANG' && b.rules_result.level !== 'VANG') return -1;
    if (a.rules_result.level !== 'VANG' && b.rules_result.level === 'VANG') return 1;
    return b.harmony_result.score - a.harmony_result.score;
  });

  const kb_cards = (kbData as any[]).filter((c: any) => c.id === 'kb_' + input.group || c.id.includes(input.group)) || [];

  return {
    trang_thai: combos_with_scores.length > 0 ? combos_with_scores[0].rules_result.level : 'CHUA_DU_CAN_CU',
    combos_with_scores,
    thieu_can_cu: combos_with_scores.length === 0,
    kb_cards
  };
}

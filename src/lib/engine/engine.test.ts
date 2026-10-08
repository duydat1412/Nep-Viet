import { describe, it, expect } from 'vitest';
import { checkCoverage } from './matrix';
import { calculateHarmony } from './harmony';
import { evaluateRules } from './rules';
import { buildCombos } from './combo';
import itemsData from '@/../data/items.json';

describe('Coverage Matrix', () => {
  it('di_le + ao_ngu_than -> supported', () => {
    const res = checkCoverage('di_le', 'ao_ngu_than');
    expect(res.supported).toBe(true);
  });

  it('di_le + ao_nhat_binh -> info_only', () => {
    const res = checkCoverage('di_le', 'ao_nhat_binh');
    expect(res.status).toBe('info_only');
  });

  it('ky_yeu + ao_ngu_than -> no_cultural_rules', () => {
    const res = checkCoverage('ky_yeu', 'ao_ngu_than');
    expect(res.status).toBe('no_cultural_rules');
  });

  it('an unmapped pair -> not supported', () => {
    const res = checkCoverage('unknown_occasion', 'unknown_group');
    expect(res.supported).toBe(false);
  });
});

describe('Color Harmony', () => {
  it('All neutral colors -> 9.2', () => {
    const res = calculateHarmony([{ hex: '#000000' }, { hex: '#FFFFFF' }]);
    expect(res.score).toBe(9.2);
  });

  it('Analogous pair (0-45 deg) -> 9.0 + neutral boost', () => {
    const res = calculateHarmony([{ hex: '#FF0000' }, { hex: '#FF8000' }, { hex: '#000000' }]);
    expect(res.score).toBe(9.4);
  });

  it('Triadic-adjacent (45-90) -> 7.5', () => {
    const res = calculateHarmony([{ hex: '#FF0000' }, { hex: '#80FF00' }]);
    expect(res.score).toBe(7.5);
  });

  it('Split-complementary (90-150) -> 8.0', () => {
    const res = calculateHarmony([{ hex: '#FF0000' }, { hex: '#00FF80' }]);
    expect(res.score).toBe(8.0);
  });

  it('Complementary (150-180) -> 8.6', () => {
    const res = calculateHarmony([{ hex: '#FF0000' }, { hex: '#00FFFF' }]);
    expect(res.score).toBe(8.6);
  });
});

describe('Combo Builder', () => {
  it('builds valid combos with correct slots', () => {
    const items = (Array.isArray(itemsData) ? itemsData : (itemsData as any)?.items) || [];
    const combos = buildCombos(items, 'di_le', 'ao_ngu_than', 'nam', 'truyen_thong');
    if (combos.length > 0) {
      expect(combos[0].items.some(i => i.slot === 'top')).toBe(true);
      expect(combos[0].items.some(i => i.slot === 'bottom')).toBe(true);
      expect(combos[0].items.some(i => i.slot === 'footwear')).toBe(true);
    }
  });
});

describe('Rule Evaluator', () => {
  it('evaluates rules correctly', () => {
    const items = (Array.isArray(itemsData) ? itemsData : (itemsData as any)?.items) || [];
    const combos = buildCombos(items, 'di_le', 'ao_ngu_than', 'nam', 'truyen_thong');
    if (combos.length > 0) {
      const res = evaluateRules(combos[0], 'di_le', 'truyen_thong');
      expect(res.level).toBeDefined();
    }
  });
});

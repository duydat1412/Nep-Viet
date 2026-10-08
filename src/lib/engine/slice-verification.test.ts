import { describe, it, expect } from 'vitest';
import { runEngine } from './index';

describe('Vertical Slice 3 Mandatory Outcomes', () => {
  it('Outcome 1: XANH (Đi lễ + Ngũ thân nam + Truyền thống)', () => {
    const res = runEngine({
      occasion: 'di_le',
      group: 'ao_ngu_than',
      gender: 'nam',
      style_level: 'truyen_thong',
      tone: 'tram'
    });
    expect(res.trang_thai).toBe('XANH');
    expect(res.combos_with_scores.length).toBeGreaterThan(0);
    const top = res.combos_with_scores[0];
    expect(top.rules_result.level).toBe('XANH');
    expect(top.rules_result.triggered_rules.length).toBe(0);
    expect(top.harmony_result.score).toBeGreaterThanOrEqual(8.0);
    expect(top.combo.item_ids).toContain('ao_ngu_than_nam_xanh_01');
    expect(top.combo.item_ids).toContain('quan_trang_01');
    expect(top.combo.item_ids).toContain('guoc_moc_01');
  });

  it('Outcome 2: VANG (Đi lễ + Ngũ thân nam + Phối hiện đại kích hoạt R_DILE_03)', () => {
    const res = runEngine({
      occasion: 'di_le',
      group: 'ao_ngu_than',
      gender: 'nam',
      style_level: 'phoi_hien_dai',
      tone: 'tram'
    });
    expect(res.trang_thai).toBe('VANG');
    expect(res.combos_with_scores.length).toBeGreaterThan(0);
    const top = res.combos_with_scores[0];
    expect(top.rules_result.level).toBe('VANG');
    expect(top.rules_result.triggered_rules.some((r: any) => r.id === 'R_DILE_03')).toBe(true);
    expect(top.combo.item_ids).toContain('sneaker_trang_01');
  });

  it('Outcome 3: CHUA_DU_CAN_CU (Uncovered combination trả về ngay từ code, không gọi AI)', () => {
    const res = runEngine({
      occasion: 'ky_yeu',
      group: 'ao_tu_than',
      gender: 'nam',
      style_level: 'phoi_hien_dai',
      tone: 'tuoi'
    });
    expect(res.trang_thai).toBe('CHUA_DU_CAN_CU');
    expect(res.thieu_can_cu).toBe(true);
    expect(res.combos_with_scores.length).toBe(0);
  });
});

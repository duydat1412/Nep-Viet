import rulesData from '@/../data/cultural_rules.json';

export function checkCoverage(occasion: string, group: string) {
  // Special cases from rules
  if (occasion === 'ky_yeu') {
    return { supported: true, status: 'no_cultural_rules', basis: 'R_KYYEU_01', message: 'Kỷ yếu không áp dụng quy tắc văn hóa khắt khe.' };
  }
  if (group === 'ao_nhat_binh') {
    return { supported: true, status: 'info_only', basis: 'R_NHATBINH_01', message: 'Áo Nhật Bình chỉ mang tính chất thông tin.' };
  }
  if (group === 'ao_dai' && occasion === 'phoi_hien_dai') {
    return { supported: false, status: 'CHUA_DU_CAN_CU', basis: 'R_AODAI_01', message: 'Áo dài phối hiện đại chưa đủ căn cứ.' };
  }

  const coverage = rulesData?.coverage || [];
  for (const item of coverage) {
    if (item.occasion === occasion && item.groups.includes(group)) {
      if (item.status === 'supported' || item.status === 'info_only' || item.status === 'no_cultural_rules') {
        return { supported: true, status: item.status, basis: item.basis };
      }
      return { supported: false, status: item.status, basis: item.basis, message: 'Chưa được hỗ trợ' };
    }
  }

  return { supported: false, status: 'unsupported', basis: '', message: 'Không có thông tin hỗ trợ cho sự kiện và nhóm trang phục này.' };
}

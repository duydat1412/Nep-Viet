export function validateGeminiResponse(
  response: any,
  validComboIds: string[],
  validSourceIds: string[],
  comboWarningLevels: Record<string, string>
) {
  const errors: string[] = [];
  const sanitized = { xep_hang_combos: [] as any[] };
  
  if (!response || !Array.isArray(response.xep_hang_combos)) {
    errors.push('Missing xep_hang_combos array');
    return { valid: false, errors, sanitized: null };
  }
  
  for (const combo of response.xep_hang_combos) {
    if (!validComboIds.includes(combo.combo_id)) {
      errors.push(`Invalid combo_id: ${combo.combo_id}`);
      continue;
    }
    
    let validSources = true;
    for (const sid of (combo.source_ids || [])) {
      if (!validSourceIds.includes(sid)) {
        errors.push(`Invalid source_id: ${sid} for combo ${combo.combo_id}`);
        validSources = false;
      }
    }
    if (!validSources) continue;
    
    const warningLevel = comboWarningLevels[combo.combo_id];
    if (warningLevel === 'VANG') {
      const lowerText = (combo.dien_giai_van_hoa || '').toLowerCase();
      if (lowerText.includes('hoàn toàn phù hợp') || lowerText.includes('không có vấn đề gì')) {
        errors.push(`Contradictory cultural explanation for combo ${combo.combo_id} with VANG warning`);
        continue;
      }
    }
    
    sanitized.xep_hang_combos.push(combo);
  }
  
  return {
    valid: errors.length === 0 && sanitized.xep_hang_combos.length > 0,
    errors,
    sanitized
  };
}

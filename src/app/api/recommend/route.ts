import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { runEngine } from '@/lib/engine';
import { callGemini } from '@/lib/gemini/client';
import { SYSTEM_PROMPT, buildUserPrompt, GEMINI_RESPONSE_SCHEMA } from '@/lib/gemini/prompt';
import { validateGeminiResponse } from '@/lib/gemini/validator';
import { RecommendRequestSchema, RecommendResponse } from '@/lib/schema/api.schema';
import itemsData from '@/../data/items.json';
import fallbackPresetsData from '@/../data/fallback_presets.json';

export const maxDuration = 15;

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { allowed } = checkRateLimit(ip, 10, 60000);

  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  try {
    const rawBody = await request.json();
    const parseResult = RecommendRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input parameters', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const form = parseResult.data;

    // 1. Run Rule Engine
    const engineResult = runEngine({
      occasion: form.occasion,
      group: form.group,
      gender: form.gender,
      style_level: form.style_level,
      tone: form.tone
    });

    // 2. Handle unmapped or insufficient evidence
    if (engineResult.trang_thai === 'CHUA_DU_CAN_CU' || engineResult.combos_with_scores.length === 0) {
      const response: RecommendResponse = {
        trang_thai: 'CHUA_DU_CAN_CU',
        phuong_an: [],
        thieu_can_cu: [
          'Dữ liệu biên tập của Nếp Việt hiện tại chưa bao quát sự kết hợp này. Hệ thống không đưa ra phỏng đoán.'
        ],
        fallback_used: false
      };
      return NextResponse.json(response);
    }

    // Prepare items lookup
    const allItems: any[] = Array.isArray(itemsData) ? itemsData : [];
    const itemMap = new Map<string, any>(allItems.map((item) => [item.id, item]));

    // 3. Fallback Presets matching check
    const normalizedInput = {
      occasion: form.occasion,
      group: form.group,
      gender: form.gender,
      style_level: form.style_level
    };

    const matchingPreset = (fallbackPresetsData as any[]).find((preset: any) => {
      const p = preset.input;
      return (
        p.occasion === normalizedInput.occasion &&
        p.group === normalizedInput.group &&
        p.gender === normalizedInput.gender &&
        p.style_level === normalizedInput.style_level
      );
    });

    let geminiResponse: any = null;
    let fallbackUsed = false;

    // Build context for Gemini
    const candidateCombos = engineResult.combos_with_scores.map((c) => ({
      id: c.combo.combo_id,
      style: c.combo.style_level,
      items: c.combo.items.map((i) => i.name_vi),
      warningLevel: c.rules_result.level,
      colorScore: c.harmony_result.score
    }));

    const triggeredRules = engineResult.combos_with_scores.flatMap((c) =>
      c.rules_result.triggered_rules.map((r: any) => ({
        id: r.id,
        level: r.level,
        message: r.message_vi,
        sourceId: r.source_ids?.[0] || ''
      }))
    );

    const knowledgeCards = (engineResult.kb_cards || []).flatMap((k: any) =>
      (k.points || []).map((pt: any) => ({
        id: k.id,
        text: pt.text,
        sourceIds: pt.source_ids || []
      }))
    );

    const prompt = buildUserPrompt({
      form,
      combos: candidateCombos,
      rules: triggeredRules,
      knowledgeCards
    });

    // 4. Try calling Gemini
    try {
      const rawAiResponse = await callGemini(SYSTEM_PROMPT, prompt, GEMINI_RESPONSE_SCHEMA);
      const validComboIds = candidateCombos.map((c) => c.id);
      const validSourceIds = Array.from(
        new Set([
          ...knowledgeCards.flatMap((k) => k.sourceIds),
          'N1',
          'S_HN1665',
          'S_VNNEWS_NGOCSON',
          'S_THUVIENLAMDONG',
          'S_HCMUSSH',
          'S_VNNEWS_NHATBINH'
        ])
      );
      const warningLevels = candidateCombos.reduce((acc: any, c) => {
        acc[c.id] = c.warningLevel;
        return acc;
      }, {});

      const validation = validateGeminiResponse(
        rawAiResponse,
        validComboIds,
        validSourceIds,
        warningLevels
      );

      if (validation.valid && validation.sanitized) {
        geminiResponse = validation.sanitized;
      } else {
        console.warn('Gemini validation failed, falling back to preset');
        fallbackUsed = true;
      }
    } catch (err) {
      console.warn('Gemini call failed or timed out:', err);
      fallbackUsed = true;
    }

    // 5. Construct Final Output
    const phuong_an: any[] = [];

    if (geminiResponse && geminiResponse.xep_hang_combos?.length > 0) {
      for (const gCombo of geminiResponse.xep_hang_combos) {
        const matchedEngineCombo = engineResult.combos_with_scores.find(
          (c) => c.combo.combo_id === gCombo.combo_id
        );
        if (!matchedEngineCombo) continue;

        const comboItems = matchedEngineCombo.combo.items.map((i) => ({
          ...i,
          image_url: i.asset,
          name: i.name_vi
        }));

        phuong_an.push({
          combo_id: gCombo.combo_id,
          outfit_item_ids: matchedEngineCombo.combo.item_ids,
          muc_canh_bao: matchedEngineCombo.rules_result.level, // Code ALWAYS overrides
          diem_hai_hoa_mau: matchedEngineCombo.harmony_result.score, // Code ALWAYS overrides
          ly_do_phoi_do: gCombo.ly_do_lua_chon || 'Phối đồ hài hòa theo chuẩn mực văn hóa.',
          nhan_xet_mau: gCombo.nhan_xet_mau || matchedEngineCombo.harmony_result.description,
          dien_giai_van_hoa: gCombo.dien_giai_van_hoa || '',
          source_ids: gCombo.source_ids || ['N1'],
          triggered_rules: matchedEngineCombo.rules_result.triggered_rules.map((r: any) => ({
            id: r.id,
            level: r.level,
            message_vi: r.message_vi
          })),
          kb_cards: engineResult.kb_cards || [],
          items: comboItems
        });
      }
    }

    // If Gemini failed or produced no valid combos, use fallback preset or first engine combo
    if (phuong_an.length === 0) {
      fallbackUsed = true;
      const topEngineCombo = engineResult.combos_with_scores[0];

      if (matchingPreset && matchingPreset.result) {
        const pr = matchingPreset.result;
        const comboItems = (pr.outfit_item_ids || []).map((id: string) => {
          const item = itemMap.get(id);
          return item
            ? { ...item, image_url: item.asset, name: item.name_vi }
            : { id, name: id, image_url: '' };
        });

        phuong_an.push({
          combo_id: pr.combo_id,
          outfit_item_ids: pr.outfit_item_ids,
          muc_canh_bao: topEngineCombo ? topEngineCombo.rules_result.level : pr.muc_canh_bao,
          diem_hai_hoa_mau: topEngineCombo ? topEngineCombo.harmony_result.score : pr.diem_hai_hoa_mau,
          ly_do_phoi_do: pr.ly_do_phoi_do,
          nhan_xet_mau: pr.nhan_xet_mau,
          dien_giai_van_hoa: pr.dien_giai_van_hoa,
          source_ids: pr.source_ids || ['N1'],
          triggered_rules: topEngineCombo
            ? topEngineCombo.rules_result.triggered_rules.map((r: any) => ({
                id: r.id,
                level: r.level,
                message_vi: r.message_vi
              }))
            : [],
          kb_cards: engineResult.kb_cards || [],
          items: comboItems
        });
      } else if (topEngineCombo) {
        const comboItems = topEngineCombo.combo.items.map((i) => ({
          ...i,
          image_url: i.asset,
          name: i.name_vi
        }));

        phuong_an.push({
          combo_id: topEngineCombo.combo.combo_id,
          outfit_item_ids: topEngineCombo.combo.item_ids,
          muc_canh_bao: topEngineCombo.rules_result.level,
          diem_hai_hoa_mau: topEngineCombo.harmony_result.score,
          ly_do_phoi_do: 'Gợi ý phối đồ truyền thống chuẩn mực của Nếp Việt.',
          nhan_xet_mau: topEngineCombo.harmony_result.description,
          dien_giai_van_hoa:
            'Trang phục tuân thủ các quy tắc đoan trang, lịch thiệp phù hợp với bối cảnh.',
          source_ids: ['N1'],
          triggered_rules: topEngineCombo.rules_result.triggered_rules.map((r: any) => ({
            id: r.id,
            level: r.level,
            message_vi: r.message_vi
          })),
          kb_cards: engineResult.kb_cards || [],
          items: comboItems
        });
      }
    }

    const responsePayload: RecommendResponse = {
      trang_thai: 'DU_CAN_CU',
      phuong_an,
      thieu_can_cu: [],
      fallback_used: fallbackUsed
    };

    const headers = new Headers();
    if (fallbackUsed) {
      headers.set('X-Fallback-Used', 'true');
    }

    return NextResponse.json(responsePayload, { headers });
  } catch (error) {
    console.error('API /recommend error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: (error as Error).message },
      { status: 500 }
    );
  }
}

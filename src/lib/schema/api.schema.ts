import { z } from 'zod';
import { WarningLevelsEnum, ItemSchema, KnowledgeCardSchema } from './data.schema';

export const RecommendRequestSchema = z.object({
  occasion: z.string(),
  group: z.string(),
  gender: z.string(),
  style_level: z.string(),
  tone: z.string().optional()
});

export const TriggeredRuleSchema = z.object({
  id: z.string(),
  level: WarningLevelsEnum.nullable().optional(),
  message_vi: z.string()
});

export const ComboResultSchema = z.object({
  combo_id: z.string(),
  outfit_item_ids: z.array(z.string()),
  muc_canh_bao: WarningLevelsEnum,
  diem_hai_hoa_mau: z.number(),
  ly_do_phoi_do: z.string(),
  nhan_xet_mau: z.string(),
  dien_giai_van_hoa: z.string(),
  source_ids: z.array(z.string()),
  triggered_rules: z.array(TriggeredRuleSchema),
  kb_cards: z.array(KnowledgeCardSchema),
  items: z.array(ItemSchema)
});

export const RecommendResponseSchema = z.object({
  trang_thai: z.enum(['DU_CAN_CU', 'CHUA_DU_CAN_CU']),
  phuong_an: z.array(ComboResultSchema),
  thieu_can_cu: z.array(z.string()),
  fallback_used: z.boolean()
});

export const SharePayloadSchema = z.object({
  result: ComboResultSchema,
  created_at: z.string()
});

export type RecommendRequest = z.infer<typeof RecommendRequestSchema>;
export type ComboResult = z.infer<typeof ComboResultSchema>;
export type RecommendResponse = z.infer<typeof RecommendResponseSchema>;
export type SharePayload = z.infer<typeof SharePayloadSchema>;
export type TriggeredRule = z.infer<typeof TriggeredRuleSchema>;

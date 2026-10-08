import { z } from 'zod';

export const SlotsEnum = z.enum(['top', 'bottom', 'outer', 'headwear', 'footwear', 'bag', 'jewelry']);
export const GroupsEnum = z.enum(['ao_ngu_than', 'ao_dai', 'ao_tac', 'ao_tu_than', 'ao_nhat_binh', 'phu_kien']);
export const GendersEnum = z.enum(['nam', 'nu', 'unisex']);
export const OccasionsEnum = z.enum(['tet', 'ky_yeu', 'dao_pho', 'di_le', 'bieu_dien']);
export const StyleLevelsEnum = z.enum(['truyen_thong', 'cach_tan_nhe', 'phoi_hien_dai']);
export const WarningLevelsEnum = z.enum(['XANH', 'VANG', 'DO', 'CHUA_DU_CAN_CU']);
export const ActionsEnum = z.enum(['allow', 'warn', 'exclude', 'info_only']);
export const ConfidenceEnum = z.enum(['chuan_muc_pho_bien', 'thong_le_truyen_thong', 'dien_che_lich_su', 'quan_niem_dan_gian', 'goi_y_cua_nep', 'chua_co_tu_lieu', 'da_doi_chieu', 'chua_xac_minh']);

export const ColorSchema = z.object({
  name: z.string(),
  hex: z.string()
});

export const BrandSchema = z.object({
  name: z.string(),
  location: z.string().optional(),
  url: z.string().optional(),
  contact: z.string().optional()
});

export const ChannelEnum = z.enum(['may_do_thu_cong', 'san_tmdt_shopee', 'hang_san_co']);

export const PricingSchema = z.object({
  buy_price: z.number().optional(),
  rental_price: z.number().optional(),
  currency: z.string().default('VND'),
  is_estimate: z.boolean().optional(),
  reference_range: z.string().optional(),
  contact_for_quote: z.boolean().optional(),
  note: z.string().optional(),
  pricing_type: z.enum(['may_san_tmdt', 'may_do_rieng', 'thue_va_ban']).optional()
});

export const CropCoordsSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const ItemSchema = z.object({
  id: z.string(),
  slot: SlotsEnum,
  group: GroupsEnum,
  name_vi: z.string(),
  gender: GendersEnum,
  colors: z.array(ColorSchema),
  formality: z.number(),
  occasions: z.array(OccasionsEnum),
  style_levels: z.array(StyleLevelsEnum),
  tags: z.array(z.string()),
  asset: z.string(),
  source_ids: z.array(z.string()),
  status: z.enum(['draft', 'reviewed']),
  brand: BrandSchema.optional(),
  pricing: PricingSchema.optional(),
  material: z.string().optional(),
  craftsmanship_lore: z.string().optional(),
  channel: ChannelEnum.optional(),
  origin_url: z.string().optional(),
  crop_coords: CropCoordsSchema.optional(),
});

export const RuleSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  enforcement: z.string().optional(),
  level: WarningLevelsEnum.nullable().optional(),
  action: ActionsEnum,
  when: z.record(z.any()),
  message_vi: z.string(),
  source_ids: z.array(z.string()),
  confidence: ConfidenceEnum,
  status: z.string(),
  occasion_scope: z.array(z.string()).optional(),
  scope: z.string().optional(),
  not_covered: z.string().optional(),
  tests: z.record(z.string()).optional()
});

export const KnowledgePointSchema = z.object({
  text: z.string(),
  source_ids: z.array(z.string())
});

export const KnowledgeCardSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  points: z.array(KnowledgePointSchema),
  scope: z.string(),
  not_covered: z.string(),
  confidence: ConfidenceEnum
});

export const SourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  author_or_org: z.string(),
  url: z.string(),
  accessed: z.string()
});

export const FallbackPresetInputSchema = z.object({
  occasion: OccasionsEnum.or(z.string()),
  group: GroupsEnum.or(z.string()),
  gender: GendersEnum.or(z.string()),
  style_level: StyleLevelsEnum.or(z.string()),
  tone: z.string().optional()
});

export const FallbackPresetResultSchema = z.object({
  combo_id: z.string(),
  outfit_item_ids: z.array(z.string()),
  muc_canh_bao: WarningLevelsEnum,
  diem_hai_hoa_mau: z.number(),
  ly_do_phoi_do: z.string(),
  nhan_xet_mau: z.string(),
  dien_giai_van_hoa: z.string(),
  source_ids: z.array(z.string()),
  triggered_rules: z.array(z.string()),
  kb_ids: z.array(z.string())
});

export const FallbackPresetSchema = z.object({
  input: FallbackPresetInputSchema,
  result: FallbackPresetResultSchema
});

export const CoveragePairSchema = z.object({
  occasion: z.string(),
  groups: z.array(z.string()),
  status: z.string(),
  basis: z.string()
});

export type Item = z.infer<typeof ItemSchema>;
export type Rule = z.infer<typeof RuleSchema>;
export type KnowledgeCard = z.infer<typeof KnowledgeCardSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type FallbackPreset = z.infer<typeof FallbackPresetSchema>;
export type CoveragePair = z.infer<typeof CoveragePairSchema>;

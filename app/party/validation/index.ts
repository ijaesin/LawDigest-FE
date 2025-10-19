import { z } from 'zod';
import { FeedSchema } from '@/app/bill/validation';

/* --------------------------------- Detail -------------------------------- */
// TODO(lawdigest): 임시 완화 — 응답 계약 확정 후 엄격화 필요
export const PartyDetailSchema = z
  .object({
    party_id: z.coerce.number(),
    party_name: z.string().optional().default(''),
    party_img_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    total_congressman_count: z.coerce.number().optional().default(0),
    proportional_congressman_count: z.coerce.number().optional().default(0),
    district_congressman_count: z.coerce.number().optional().default(0),
    representative_bill_count: z.coerce.number().optional().default(0),
    public_bill_count: z.coerce.number().optional().default(0),
    follow_count: z.coerce.number().optional().default(0),
    website_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    followed: z
      .boolean()
      .optional()
      .transform((v) => !!v),
  })
  .strict();

/* ---------------------------- Congressman list --------------------------- */
export const PartyCongressmanSchema = z
  .object({
    congressman_id: z.coerce.string(),
    congressman_name: z.string().optional().default(''),
    congressman_image_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
  })
  .strict();

export const PartyCongressmanResponseSchema = z.object({ party_congressman: z.array(PartyCongressmanSchema) }).strict();

export const PartyFollowResponseSchema = z
  .object({
    party_id: z.coerce.number(),
    follow_checked: z
      .boolean()
      .optional()
      .transform((v) => !!v),
  })
  .strict();

/* ------------------------------- Bill feed ------------------------------- */
export const PartyBillFeedSchema = FeedSchema;

/* --------------------------------- Types -------------------------------- */
export type PartyDetail = z.infer<typeof PartyDetailSchema>;
export type PartyCongressman = z.infer<typeof PartyCongressmanSchema>;
export type PartyCongressmanResponse = z.infer<typeof PartyCongressmanResponseSchema>;
export type PartyFollowResponse = z.infer<typeof PartyFollowResponseSchema>;
export type PartyBillFeed = z.infer<typeof PartyBillFeedSchema>;

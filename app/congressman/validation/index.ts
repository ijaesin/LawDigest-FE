import { z } from 'zod';
import { FeedSchema } from '@/app/bill/validation';

/**
 * Congressman 상세 정보 스키마
 */
// TODO(lawdigest): 임시 완화 — 응답 계약 확정 후 엄격화 필요
export const CongressmanDetailSchema = z
  .object({
    congressman_id: z.coerce.string(),
    congressman_name: z.string().optional().default(''),
    party_id: z.coerce.number(),
    party_name: z.string().optional().default(''),
    party_image_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    elect_sort: z.string().optional().default(''),
    district: z.string().optional().default(''),
    commits: z.string().optional().default(''),
    elected: z.string().optional().default(''),
    homepage: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    represent_count: z.coerce.number().optional().default(0),
    public_count: z.coerce.number().optional().default(0),
    congressman_image_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    like_checked: z
      .boolean()
      .optional()
      .transform((v) => !!v),
    office: z.string().optional().default(''),
    email: z.string().optional().default(''),
    age: z.coerce.number().optional().default(0),
    gender: z.string().optional().default(''),
    follow_count: z.coerce.number().optional().default(0),
    brief_history: z.string().optional().default(''),
    telephone: z.string().optional().default(''),
  })
  .strict();

/**
 * Congressman 팔로우 토글 응답 스키마
 */
export const CongressmanFollowResponseSchema = z
  .object({ congressman_id: z.string(), like_checked: z.boolean() })
  .strict();

// Bill 피드 재사용 (법안 목록)
export const CongressmanBillFeedSchema = FeedSchema;

// Types
export type CongressmanDetail = z.infer<typeof CongressmanDetailSchema>;
export type CongressmanFollowResponse = z.infer<typeof CongressmanFollowResponseSchema>;
export type CongressmanBillFeed = z.infer<typeof CongressmanBillFeedSchema>;

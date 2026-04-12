import { z } from 'zod';
import { PaginationSchema } from '@/app/bill/validation';

// Party info reused
// TODO(lawdigest): 임시 완화 — 응답 계약 확정 후 엄격화 필요
export const PartyInfoSchema = z
  .object({
    party_id: z.coerce.number(),
    party_name: z.string().optional().default(''),
    party_image_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
  })
  .strict();

// Bill outline (simple)
export const BillOutlineSchema = z
  .object({
    bill_id: z.coerce.string(),
    bill_name: z.string().optional().default(''),
    bill_stage: z.string().optional().default(''),
    bill_proposers: z.string().optional().default(''),
    bill_brief_summary: z.string().optional().default(''),
    bill_result: z
      .union([z.string(), z.null()])
      .optional()
      .transform((v) => v ?? ''),
    party_info: z.array(PartyInfoSchema).optional().default([]),
  })
  .strict();

// Plenary item
export const PlenaryItemSchema = z
  .object({
    bill_info: BillOutlineSchema,
    approval_vote_count: z.coerce.number().optional().default(0),
    total_vote_count: z.coerce.number().optional().default(0),
    party_vote_list: z
      .array(z.object({ party_info: PartyInfoSchema, party_approval_count: z.coerce.number() }).strict())
      .optional()
      .default([]),
  })
  .strict();

export const CommitteeAuditSchema = z
  .object({
    committee_name: z.string().optional().default(''),
    bill_count: z.coerce.number().optional().default(0),
    bill_outline_dto_list: z.array(BillOutlineSchema).optional().default([]),
  })
  .strict();

export const TimelineResponseListSchema = z
  .object({
    date: z.string().optional().default(''),
    bill_count: z.coerce.number().optional().default(0),
    plenary_list: z.array(PlenaryItemSchema).optional().default([]),
    promulgation_list: z.array(BillOutlineSchema).optional().default([]),
    committee_audit_list: z.array(CommitteeAuditSchema).optional().default([]),
    submitted_list: z.array(BillOutlineSchema).optional().default([]),
  })
  .strict();

export const TimelineFeedSchema = z
  .object({
    pagination_response: PaginationSchema,
    timeline_response_list: z.array(TimelineResponseListSchema).optional().default([]),
  })
  .strict();

export const TimelineBillStateSchema = z
  .object({
    days_since_opening: z.coerce.number().optional().default(0),
    receipt_count: z.coerce.number().optional().default(0),
    treatment_count: z.coerce.number().optional().default(0),
    passed_count: z.coerce.number().optional().default(0),
  })
  .strict();

// Types
export type PartyInfo = z.infer<typeof PartyInfoSchema>;
export type BillOutline = z.infer<typeof BillOutlineSchema>;
export type PlenaryItem = z.infer<typeof PlenaryItemSchema>;
export type CommitteeAudit = z.infer<typeof CommitteeAuditSchema>;
export type TimelineFeed = z.infer<typeof TimelineFeedSchema>;
export type TimelineResponseList = z.infer<typeof TimelineResponseListSchema>;
export type TimelineBillState = z.infer<typeof TimelineBillStateSchema>;

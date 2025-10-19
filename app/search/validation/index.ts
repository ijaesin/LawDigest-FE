import { z } from 'zod';
import { PaginationSchema, BillResponseSchema } from '@/app/bill/validation/bill.schema';

// TODO(lawdigest): 임시 완화 — 응답 계약 확정 후 엄격화 필요
export const SearchCongressmanPartySchema = z
  .object({
    party_id: z.coerce.number(),
    party_name: z.string().optional().default(''),
    party_image_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    search_type: z.string().optional().default(''),
    congressman_id: z.coerce.string(),
    congressman_image_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    congressman_name: z.string().optional().default(''),
  })
  .strict();

export const SearchCongressmanPartyResponseSchema = z
  .object({ search_response: z.array(SearchCongressmanPartySchema).optional().default([]) })
  .strict();

export const SearchBillResponseSchema = z
  .object({
    search_response: z.array(BillResponseSchema).optional().default([]),
    pagination_response: PaginationSchema,
  })
  .strict();

export type SearchCongressmanParty = z.infer<typeof SearchCongressmanPartySchema>;
export type SearchCongressmanPartyResponse = z.infer<typeof SearchCongressmanPartyResponseSchema>;
export type SearchBillResponse = z.infer<typeof SearchBillResponseSchema>;

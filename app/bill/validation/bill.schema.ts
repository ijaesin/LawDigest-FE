import { z } from 'zod';

// TODO(lawdigest): Zod 스키마는 임시로 완화했습니다.
// - API 응답에 null/미존재/타입 불일치가 섞여 들어오는 사례가 있어
//   런타임 오류를 피하기 위해 optional/nullable/coerce/default 등을 적용했습니다.
// - 백엔드 응답 계약이 확정되면 필수 필드를 다시 엄격하게 되돌리세요.

// Pagination
export const PaginationSchema = z
  .object({
    page_number: z.coerce.number().int().min(0),
    last_page: z.coerce.boolean(),
  })
  .strict();

// Proposers
export const RepresentativeProposerSchema = z
  .object({
    representative_proposer_id: z.coerce.string(),
    representative_proposer_name: z.string().optional().default(''),
    represent_proposer_img_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    party_id: z.coerce.number().optional().default(0),
    party_image_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    party_name: z.string().optional().default(''),
  })
  .strict();

export const PublicProposerSchema = z
  .object({
    public_proposer_id: z.coerce.string(),
    public_proposer_name: z.string().optional().default(''),
    public_proposer_img_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    public_proposer_party_id: z.coerce.number().optional().default(0),
    public_proposer_party_image_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    public_proposer_party_name: z.string().optional().default(''),
  })
  .strict();

// Vote
export const PartyInfoSchema = z
  .object({
    party_id: z.coerce.number().optional().default(0),
    party_name: z.string().optional().default(''),
    party_image_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
  })
  .strict();

export const PartyVoteSchema = z.object({ party_info: PartyInfoSchema, party_approval_count: z.number() }).strict();

export const VoteResultSchema = z
  .object({
    approval_count: z.coerce.number().optional().default(0),
    total_vote_count: z.coerce.number().optional().default(0),
    party_vote_list: z.array(PartyVoteSchema).optional().default([]),
  })
  .strict();

// Similar bill
export const SimilarBillSchema = z
  .object({
    billBriefSummary: z.string().optional().default(''),
    billId: z.coerce.string(),
    billName: z.string().optional().default(''),
    billProposers: z.string().optional().default(''),
    billStage: z.string().optional().default(''),
    party: z.array(PartyInfoSchema).optional().default([]),
  })
  .strict();

// Bill info
export const BillInfoSchema = z
  .object({
    bill_id: z.coerce.string(),
    bill_name: z.string().optional().default(''),
    propose_date: z.string().optional().default(''),
    summary: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    gpt_summary: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    view_count: z.coerce.number().optional().default(0),
    bill_like_count: z.coerce.number().optional().default(0),
    bill_stage: z.string().optional().default(''),
    brief_summary: z.string().optional().default(''),
    bill_link: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    bill_result: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
  })
  .strict();

// Bill detail (as used across UI)
export const BillResponseSchema = z
  .object({
    bill_info_dto: BillInfoSchema,
    representative_proposer_dto_list: z
      .array(RepresentativeProposerSchema)
      .nullable()
      .optional()
      .transform((v) => v ?? []),
    public_proposer_dto_list: z
      .array(PublicProposerSchema)
      .nullable()
      .optional()
      .transform((v) => v ?? []),
    is_book_mark: z
      .boolean()
      .optional()
      .transform((v) => !!v),
    similar_bills: z.array(SimilarBillSchema).optional().default([]),
    vote_result_response: VoteResultSchema.optional().default({
      approval_count: 0,
      total_vote_count: 0,
      party_vote_list: [],
    }),
  })
  .strict();

// Collections
export const FeedSchema = z
  .object({
    bill_list: z.array(BillResponseSchema).optional().default([]),
    pagination_response: PaginationSchema,
  })
  .strict();

export const PopularFeedSchema = z.array(BillResponseSchema);

// Mutations
export const BookmarkResponseSchema = z.object({ bill_id: z.string(), like_checked: z.boolean() }).strict();
export const ViewCountResponseSchema = z.object({ bill_id: z.string(), view_count: z.number().int().min(0) }).strict();

// Types
export type Feed = z.infer<typeof FeedSchema>;
export type PopularFeed = z.infer<typeof PopularFeedSchema>;
export const BillDetailSchema = BillResponseSchema;
export type BillDetail = z.infer<typeof BillDetailSchema>;
export type BillResponse = z.infer<typeof BillResponseSchema>;
export type BookmarkResponse = z.infer<typeof BookmarkResponseSchema>;
export type ViewCountResponse = z.infer<typeof ViewCountResponseSchema>;

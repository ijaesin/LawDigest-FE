import { z } from 'zod';

// TODO(lawdigest): 임시 완화 스키마
// - 운영 API 응답의 null/누락/타입 불일치에 의한 런타임 오류를 피하기 위해
//   optional/nullable/coerce/default 등을 적용했습니다.
// - 백엔드 응답 계약이 확정되면 각 필드를 다시 엄격하게 되돌리세요.

/**
 * 유저 기본 정보 스키마
 */
export const UserInfoSchema = z
  .object({
    user_id: z.coerce.number().int().min(0),
    user_name: z.string().optional().default(''),
    user_image_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    user_email: z.string().optional().default(''),
  })
  .strict();

export type UserInfo = z.infer<typeof UserInfoSchema>;

/**
 * 팔로잉 정당 스키마
 */
export const FollowingPartySchema = z
  .object({
    party_id: z.coerce.number().int().min(0),
    party_name: z.string().optional().default(''),
    party_image_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
  })
  .strict();

export const FollowingPartyListSchema = z.array(FollowingPartySchema);
export type FollowingParty = z.infer<typeof FollowingPartySchema>;
export type FollowingPartyList = z.infer<typeof FollowingPartyListSchema>;

/**
 * 팔로잉 의원 스키마
 */
export const FollowingCongressmanSchema = z
  .object({
    congressman_id: z.coerce.string(),
    congressman_name: z.string().optional().default(''),
    congressman_image_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
    party_id: z.coerce.number().int().min(0),
    party_name: z.string().optional().default(''),
    party_image_url: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? ''),
  })
  .strict();

export const FollowingCongressmanListSchema = z.array(FollowingCongressmanSchema);
export type FollowingCongressman = z.infer<typeof FollowingCongressmanSchema>;
export type FollowingCongressmanList = z.infer<typeof FollowingCongressmanListSchema>;

/**
 * 북마크한 법안 카운트 스키마
 */
export const BillBookmarkedCountSchema = z
  .object({
    count: z.coerce.number().int().min(0),
  })
  .strict();

export type BillBookmarkedCount = z.infer<typeof BillBookmarkedCountSchema>;

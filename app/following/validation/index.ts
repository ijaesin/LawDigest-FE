import { z } from 'zod';
import { FeedSchema } from '@/app/bill/validation';

/**
 * @description 팔로잉 의원 스키마
 */
export const FollowingCongressmanSchema = z
  .object({
    congressman_id: z.string(),
    congressman_name: z.string(),
    congressman_image_url: z.string(),
    party_id: z.number(),
    party_name: z.string(),
    party_image_url: z.string().nullable(),
  })
  .strict();

/**
 * @description 팔로잉 의원 목록 스키마
 */
export const FollowingCongressmanListSchema = z.array(FollowingCongressmanSchema);

/**
 * @description 팔로잉 탭 법안 피드 스키마 (Bill Feed 재사용)
 */
export const FollowingBillFeedSchema = FeedSchema;

// Types
export type FollowingCongressman = z.infer<typeof FollowingCongressmanSchema>;
export type FollowingCongressmanList = z.infer<typeof FollowingCongressmanListSchema>;
export type FollowingBillFeed = z.infer<typeof FollowingBillFeedSchema>;

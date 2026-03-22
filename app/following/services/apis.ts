import { apiClient } from '@/app/common/lib/api';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import {
  FollowingCongressmanListSchema,
  FollowingBillFeedSchema,
  type FollowingCongressmanList,
  type FollowingBillFeed,
} from '@/app/following/validation';
import { FOLLOWING_BILL_PAGE_SIZE } from '@/app/following/constants';

/**
 * @description 팔로우한 의원 목록 조회
 * @returns FollowingCongressmanList
 * @see GET /following-tab/congressman
 */
export const getFollowingCongressman = async (): Promise<FollowingCongressmanList> => {
  try {
    const data = await apiClient.get<FollowingCongressmanList>('/following-tab/congressman');
    return FollowingCongressmanListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 팔로우한 법안 무한스크롤 피드 조회
 * @param page - 페이지 번호 (0부터 시작)
 * @returns FollowingBillFeed
 * @see GET /following-tab/bill
 */
export const getFollowingBill = async (page: number): Promise<FollowingBillFeed> => {
  try {
    const data = await apiClient.get<FollowingBillFeed>('/following-tab/bill', {
      params: { page, size: FOLLOWING_BILL_PAGE_SIZE },
    });
    return FollowingBillFeedSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

import { apiClient } from '@/app/common/lib/api';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import {
  UserInfoSchema,
  FollowingPartyListSchema,
  FollowingCongressmanListSchema,
  BillBookmarkedCountSchema,
  CongressmanLikeCountSchema,
  type UserInfo,
  type FollowingPartyList,
  type FollowingCongressmanList,
  type BillBookmarkedCount,
  type CongressmanLikeCount,
} from '@/app/user/validation';
import { FeedSchema, type Feed } from '@/app/bill/validation';

/**
 * @description 유저 정보 조회
 * @see GET /user/info
 */
export const getUserInfo = async (): Promise<UserInfo> => {
  try {
    const data = await apiClient.get<UserInfo>('/user/info');
    return UserInfoSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 팔로우한 정당 목록 조회
 * @see GET /user/following/party
 */
export const getFollowingParty = async (): Promise<FollowingPartyList> => {
  try {
    const data = await apiClient.get<FollowingPartyList>('/user/following/party');
    return FollowingPartyListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 팔로우한 의원 목록 조회
 * @see GET /user/liking/congressman
 */
export const getFollowingCongressman = async (): Promise<FollowingCongressmanList> => {
  try {
    const data = await apiClient.get<FollowingCongressmanList>('/user/liking/congressman');
    return FollowingCongressmanListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

export { postLogout } from '@/app/auth/services';

/**
 * @description 북마크한 법안 목록(무한스크롤)
 * @param page 페이지 번호 (0부터 시작)
 * @see GET /user/bookmarking/bill
 */
export const getBillBookmarked = async (page: number): Promise<Feed> => {
  try {
    const data = await apiClient.get<Feed>('/user/bookmarking/bill', { params: { page, size: 3 } });
    return FeedSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 북마크한 법안 개수 조회
 * @see GET /user/bookmarking/bill/count
 */
export const getBillBookmarkedCount = async (): Promise<BillBookmarkedCount> => {
  try {
    const data = await apiClient.get<BillBookmarkedCount>('/user/bookmarking/bill/count');
    return BillBookmarkedCountSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 팔로우한 의원 수 조회
 * @see GET /user/liking/congressman/count
 */
export const getLikingCongressmanCount = async (): Promise<CongressmanLikeCount> => {
  try {
    const data = await apiClient.get<CongressmanLikeCount>('/user/liking/congressman/count');
    return CongressmanLikeCountSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

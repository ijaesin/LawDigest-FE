import { apiClient } from '@/app/common/lib';
import { z } from 'zod';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import {
  FeedSchema,
  PopularFeedSchema,
  BillDetailSchema,
  ViewCountResponseSchema,
  BookmarkResponseSchema,
  type Feed,
  type PopularFeed,
  type BillDetail,
  type ViewCountResponse,
  type BookmarkResponse,
} from '@/app/bill/validation';

/**
 * @description 법안 메인 피드를 페이지네이션으로 조회합니다.
 * @param page - 페이지 번호 (0부터 시작)
 * @param stage - 단계 필터(옵션). 예: '접수', '위원회 심사' 등
 * @returns Feed (bill_list, pagination_response)
 * @see GET /bill/mainfeed
 */
export const getBillByStage = async (page: number, stage?: string): Promise<Feed> => {
  try {
    const data = await apiClient.get<Feed>('/bill/mainfeed', { params: { page, size: 3, stage } });
    return FeedSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 인기 있는 법안 목록을 조회합니다.
 * @returns PopularFeed (bill_list[])
 * @see GET /bill/popular
 */
export const getBillPopular = async (): Promise<PopularFeed> => {
  try {
    const data = await apiClient.get<PopularFeed>('/bill/popular');
    return PopularFeedSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 법안 상세 정보를 조회합니다.
 * @param billId - 법안 ID
 * @returns BillDetail
 * @see GET /bill/detail/{billId}
 */
export const getBillDetail = async (billId: string): Promise<BillDetail> => {
  try {
    const data = await apiClient.get<BillDetail>(`/bill/detail/${billId}`);
    return BillDetailSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 법안 상세 페이지 진입 시 조회수를 1 증가시킵니다.
 * @param billId - 법안 ID
 * @returns ViewCountResponse
 * @remarks 서버 규약에 따라 body에 { params: { bill_id } } 형태로 전달합니다.
 * @see PATCH /bill/view_count
 */
export const patchViewCount = async (billId: string): Promise<ViewCountResponse> => {
  try {
    const data = await apiClient.patch<ViewCountResponse>('/bill/view_count', { params: { bill_id: billId } });
    return ViewCountResponseSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 법안 북마크 상태를 토글합니다.
 * @param input.billId - 법안 ID
 * @param input.likeChecked - true면 북마크, false면 해제
 * @returns BookmarkResponse
 * @remarks 서버 규약에 따라 body에 { params: { bill_id, likeChecked } } 형태로 전달합니다.
 * @see PATCH /bill/user/bookmark
 */
const PatchBookmarkInputSchema = z
  .object({ billId: z.string(), likeChecked: z.boolean() })
  .strict()
  .transform((v) => ({ params: { bill_id: v.billId, likeChecked: v.likeChecked } }));

export const patchBookmark = async (input: { billId: string; likeChecked: boolean }): Promise<BookmarkResponse> => {
  try {
    const body = PatchBookmarkInputSchema.parse(input);
    const data = await apiClient.patch<BookmarkResponse>('/bill/user/bookmark', body);
    return BookmarkResponseSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

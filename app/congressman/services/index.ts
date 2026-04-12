import { apiClient } from '@/app/common/lib/api';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import {
  CongressmanBillFeedSchema,
  CongressmanDetailSchema,
  CongressmanFollowResponseSchema,
  type CongressmanBillFeed,
  type CongressmanDetail,
  type CongressmanFollowResponse,
} from '@/app/congressman/validation';
import { BILL_TAB } from '@/app/bill/constants';
import type { ValueOf } from '@/app/common/types';

/**
 * @description 특정 의원이 발의/참여한 법안 목록(무한스크롤) 조회
 * @param page - 페이지 번호 (0부터 시작)
 * @param congressmanId - 의원 ID
 * @param type - 법안 타입(represent_proposer | public_proposer 등)
 * @returns CongressmanBillFeed (bill_list, pagination_response)
 * @see GET /congressman/bill_info
 */
export const getBillByCongressman = async (
  page: number,
  congressmanId: string,
  type: ValueOf<typeof BILL_TAB>,
): Promise<CongressmanBillFeed> => {
  try {
    const data = await apiClient.get<CongressmanBillFeed>('/congressman/bill_info', {
      params: { congressman_id: congressmanId, type, page, size: 3 },
    });
    return CongressmanBillFeedSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 의원 상세 정보 조회
 * @param congressmanId - 의원 ID
 * @returns CongressmanDetail
 * @see GET /congressman/detail
 */
export const getCongressmanDetail = async (congressmanId: string): Promise<CongressmanDetail> => {
  try {
    const data = await apiClient.get<CongressmanDetail>('/congressman/detail', {
      params: { congressman_id: congressmanId },
    });
    return CongressmanDetailSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 의원 팔로우 토글
 * @param congressmanId - 의원 ID
 * @param likeChecked - true: 팔로우, false: 해제
 * @returns CongressmanFollowResponse
 * @see PATCH /congressman/user/like
 */
export const patchCongressmanFollow = async (
  congressmanId: string,
  likeChecked: boolean,
): Promise<CongressmanFollowResponse> => {
  try {
    const data = await apiClient.patch<CongressmanFollowResponse>('/congressman/user/like', null, {
      params: { congressman_id: congressmanId, like_checked: likeChecked },
    });
    return CongressmanFollowResponseSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

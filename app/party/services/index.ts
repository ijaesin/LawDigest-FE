import { apiClient } from '@/app/common/lib/api';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import {
  PartyBillFeedSchema,
  PartyDetailSchema,
  PartyCongressmanResponseSchema,
  PartyFollowResponseSchema,
  type PartyBillFeed,
  type PartyDetail,
  type PartyCongressmanResponse,
  type PartyFollowResponse,
} from '@/app/party/validation';
import type { ValueOf } from '@/app/common/types';
import { BILL_TAB } from '@/app/bill/constants/';

/**
 * @description 해당 정당의 법안 목록(무한스크롤)
 */
export const getBillByParty = async (
  partyId: number,
  type: ValueOf<typeof BILL_TAB>,
  page: number,
): Promise<PartyBillFeed> => {
  try {
    const data = await apiClient.get<PartyBillFeed>('/party/bill', {
      params: { party_id: partyId, type, page, size: 3 },
    });
    return PartyBillFeedSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 정당 상세 조회
 */
export const getPartyDetail = async (partyId: number): Promise<PartyDetail> => {
  try {
    const data = await apiClient.get<PartyDetail>('/party/detail', {
      params: { party_id: partyId },
    });
    return PartyDetailSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 정당 소속 의원 목록 조회
 */
export const getPartyCongressman = async (partyId: number): Promise<PartyCongressmanResponse> => {
  try {
    const data = await apiClient.get<PartyCongressmanResponse>('/party/congressman', {
      params: { party_id: partyId },
    });
    return PartyCongressmanResponseSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 정당 팔로우 토글
 */
export const patchPartyFollow = async (partyId: number, followChecked: boolean): Promise<PartyFollowResponse> => {
  try {
    const data = await apiClient.patch<PartyFollowResponse>('/party/user/follow', {
      party_id: partyId,
      follow_checked: followChecked,
    });
    return PartyFollowResponseSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

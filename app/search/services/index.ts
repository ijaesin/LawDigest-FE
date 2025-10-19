import { apiClient } from '@/app/common/lib/api';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import {
  SearchCongressmanPartyResponseSchema,
  SearchBillResponseSchema,
  type SearchCongressmanPartyResponse,
  type SearchBillResponse,
} from '@/app/search/validation';

/**
 * @description 의원/정당 검색 API
 */
export const getSearchCongressmanParty = async (searchWord: string): Promise<SearchCongressmanPartyResponse> => {
  try {
    const data = await apiClient.get<SearchCongressmanPartyResponse>('/search/congressman/party', {
      params: { search_word: searchWord },
    });
    return SearchCongressmanPartyResponseSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 법안 검색 API (페이지네이션)
 */
export const getSearchBill = async (searchWord: string, page: number): Promise<SearchBillResponse> => {
  try {
    const data = await apiClient.get<SearchBillResponse>('/search/bill', {
      params: { search_word: searchWord, page },
    });
    return SearchBillResponseSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

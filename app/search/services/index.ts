import { apiClient } from '@/app/common/lib/api';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import {
  SearchCongressmanPartyResponseSchema,
  SearchBillResponseSchema,
  SearchKeywordListSchema,
  type SearchCongressmanPartyResponse,
  type SearchBillResponse,
  type SearchKeywordList,
} from '@/app/search/validation';

/**
 * @description 최근 검색어 저장
 */
export const postRecentKeyword = async (searchWord: string): Promise<void> => {
  try {
    await apiClient.post('/search/recent-keword', null, { params: { search_word: searchWord } });
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 최근 검색어 목록 조회 (최대 10개)
 */
export const getRecentKeywords = async (): Promise<SearchKeywordList> => {
  try {
    const data = await apiClient.get<SearchKeywordList>('/search/recent-keword');
    return SearchKeywordListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 최근 검색어 삭제
 */
export const deleteRecentKeyword = async (searchWord: string): Promise<void> => {
  try {
    await apiClient.delete('/search/recent-keword', { params: { search_word: searchWord } });
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

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

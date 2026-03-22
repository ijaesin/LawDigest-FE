'use client';

import {
  useQuery,
  useMutation,
  useSuspenseInfiniteQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type UseSuspenseInfiniteQueryOptions,
  type InfiniteData,
} from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import { ACCESS_TOKEN } from '@/app/common/constants';
import type { SearchCongressmanPartyResponse, SearchBillResponse, SearchKeywordList } from '@/app/search/validation';
import {
  getSearchCongressmanParty,
  getSearchBill,
  getRecentKeywords,
  postRecentKeyword,
  deleteRecentKeyword,
} from './apis';
import { searchKeys } from './query-keys';

export { searchKeys };

/**
 * @description 의원/정당 검색 훅
 */
export const useGetSearchCongressmanParty = <TData = SearchCongressmanPartyResponse, TError = unknown>(
  searchWord: string,
  options?: Omit<
    UseQueryOptions<SearchCongressmanPartyResponse, TError, TData, ReturnType<typeof searchKeys.congressmanParty>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: searchKeys.congressmanParty(searchWord),
    queryFn: () => getSearchCongressmanParty(searchWord),
    ...options,
  });

/**
 * @description 법안 검색 무한스크롤 훅
 */
export const useInfiniteSearchBill = (
  searchWord: string,
  options?: Omit<
    UseSuspenseInfiniteQueryOptions<
      SearchBillResponse,
      unknown,
      InfiniteData<SearchBillResponse>,
      ReturnType<typeof searchKeys.bill>,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) =>
  useSuspenseInfiniteQuery({
    queryKey: searchKeys.bill(searchWord),
    queryFn: ({ pageParam = 0 }) => getSearchBill(searchWord, pageParam),
    initialPageParam: 0,
    getNextPageParam: (data) =>
      data.pagination_response.last_page ? undefined : data.pagination_response.page_number + 1,
    ...options,
  });

/**
 * @description 최근 검색어 목록 조회 훅
 */
export const useGetRecentKeywords = (
  options?: Omit<
    UseQueryOptions<SearchKeywordList, unknown, SearchKeywordList, ReturnType<typeof searchKeys.recentKeywords>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: searchKeys.recentKeywords(),
    queryFn: getRecentKeywords,
    enabled: !!getCookie(ACCESS_TOKEN),
    ...options,
  });

/**
 * @description 최근 검색어 저장 훅
 */
export const usePostRecentKeyword = (options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postRecentKeyword,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recentKeywords() });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

/**
 * @description 최근 검색어 삭제 훅
 */
export const useDeleteRecentKeyword = (options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRecentKeyword,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recentKeywords() });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

'use client';

import {
  useQuery,
  useSuspenseInfiniteQuery,
  type UseQueryOptions,
  type UseSuspenseInfiniteQueryOptions,
  type InfiniteData,
} from '@tanstack/react-query';
import type { SearchBillResponse, SearchCongressmanPartyResponse } from '@/app/search/validation';
import { getSearchBill, getSearchCongressmanParty } from '@/app/search/services';

export const searchKeys = {
  root: () => ['search'] as const,
  congressmanParty: (searchWord: string) => [...searchKeys.root(), 'congressmanParty', searchWord] as const,
  bill: (searchWord: string) => [...searchKeys.root(), 'bill', searchWord] as const,
};

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

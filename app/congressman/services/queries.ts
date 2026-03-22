'use client';

import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  type UseSuspenseQueryOptions,
  type UseSuspenseInfiniteQueryOptions,
  type InfiniteData,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import type { CongressmanBillFeed, CongressmanDetail, CongressmanFollowResponse } from '@/app/congressman/validation';
import type { ValueOf } from '@/app/common/types';
import { BILL_TAB } from '@/app/bill/constants';
import { getBillByCongressman, getCongressmanDetail, patchCongressmanFollow } from './apis';
import { congressmanKeys } from './query-keys';

/**
 * @description 의원 발의/참여 법안 무한스크롤 훅
 */
export const useInfiniteCongressmanBills = (
  congressmanId: string,
  type: ValueOf<typeof BILL_TAB>,
  options?: Omit<
    UseSuspenseInfiniteQueryOptions<
      CongressmanBillFeed,
      unknown,
      InfiniteData<CongressmanBillFeed>,
      ReturnType<typeof congressmanKeys.billFeed>,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) =>
  useSuspenseInfiniteQuery({
    queryKey: congressmanKeys.billFeed(congressmanId, type),
    queryFn: ({ pageParam = 0 }) => getBillByCongressman(pageParam, congressmanId, type),
    initialPageParam: 0,
    getNextPageParam: (data) =>
      data.pagination_response.last_page ? undefined : data.pagination_response.page_number + 1,
    ...options,
  });

/**
 * @description 의원 상세 쿼리 훅
 */
export const useGetCongressmanDetail = <TData = CongressmanDetail, TError = unknown>(
  congressmanId: string,
  options?: Omit<
    UseSuspenseQueryOptions<CongressmanDetail, TError, TData, ReturnType<typeof congressmanKeys.detail>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useSuspenseQuery({
    queryKey: congressmanKeys.detail(congressmanId),
    queryFn: () => getCongressmanDetail(congressmanId),
    ...options,
  });

/**
 * @description 의원 팔로우 토글 뮤테이션 훅
 */
export const useMutateCongressmanFollow = (
  congressmanId: string,
  options?: Omit<UseMutationOptions<CongressmanFollowResponse, Error, boolean, unknown>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation<CongressmanFollowResponse, Error, boolean, unknown>({
    mutationFn: (likeChecked: boolean) => patchCongressmanFollow(congressmanId, likeChecked),
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: congressmanKeys.detail(congressmanId) });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(extractApiMessage(error));
      options?.onError?.(error, variables, context);
    },
  });
};

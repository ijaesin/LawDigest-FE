'use client';

import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type UseSuspenseQueryOptions,
  type UseSuspenseInfiniteQueryOptions,
  type InfiniteData,
  useQuery,
} from '@tanstack/react-query';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import type { PopularFeed, BillDetail, BookmarkResponse, ViewCountResponse, Feed } from '@/app/bill/validation';
import { billKeys } from './query-keys';
import { getBillByStage, getBillDetail, getBillPopular, patchBookmark, patchViewCount } from './apis';

/**
 * @description 법안 메인 피드 무한스크롤 훅
 * @param stage - 단계 필터(옵션)
 * @param options - React Query options (staleTime, gcTime, select 등)
 * @returns useSuspenseInfiniteQuery 결과
 */
export const useInfiniteBillMainfeed = (
  stage?: string,
  options?: Omit<
    UseSuspenseInfiniteQueryOptions<Feed, unknown, InfiniteData<Feed>, ReturnType<typeof billKeys.mainfeed>, number>,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) =>
  useSuspenseInfiniteQuery({
    queryKey: billKeys.mainfeed(stage),
    queryFn: ({ pageParam = 0 }) => getBillByStage(pageParam, stage),
    initialPageParam: 0,
    getNextPageParam: (data) =>
      data.pagination_response.last_page ? undefined : data.pagination_response.page_number + 1,
    ...options,
  });

/**
 * @description 인기 있는 법안 목록을 조회합니다.
 * @param options - React Query options (select 등)
 * @returns useQuery 결과
 */
export const useGetBillPopular = <TData = PopularFeed, TError = unknown>(
  options?: Omit<
    UseQueryOptions<PopularFeed, TError, TData, ReturnType<typeof billKeys.popular>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: billKeys.popular(),
    queryFn: () => getBillPopular(),
    ...options,
  });

/**
 * @description 법안 상세 쿼리 훅 (Suspense)
 * @param billId - 법안 ID
 * @param options - React Query options (select 등)
 * @returns useSuspenseQuery 결과
 */
export const useGetBillDetail = <TData = BillDetail, TError = unknown>(
  billId: string,
  options?: Omit<
    UseSuspenseQueryOptions<BillDetail, TError, TData, ReturnType<typeof billKeys.detail>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useSuspenseQuery({
    queryKey: billKeys.detail(billId),
    queryFn: () => getBillDetail(billId),
    ...options,
  });

/**
 * @description 조회수 증가 뮤테이션 훅
 * @param billId - 법안 ID
 * @param options - Mutation options (onSuccess/onError 외 콜백 포함)
 * @returns useMutation 결과
 */
export const useMutateViewCount = <TError = unknown, TContext = unknown>(
  billId: string,
  options?: Omit<UseMutationOptions<ViewCountResponse, TError, void, TContext>, 'mutationFn'>,
) =>
  useMutation({
    mutationFn: () => patchViewCount(billId),
    ...options,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context as any);
    },
    onError: (error, variables, context) => {
      console.error(extractApiMessage(error));
      options?.onError?.(error as any, variables as any, context as any);
    },
  });

/**
 * @description 법안 북마크 토글 뮤테이션 훅
 * @param billId - 법안 ID
 * @param options - Mutation options (onSuccess/onError 외 콜백 포함)
 * @returns useMutation 결과
 */
export const useMutateBookmark = <TError = unknown, TContext = unknown>(
  billId: string,
  options?: Omit<UseMutationOptions<BookmarkResponse, TError, boolean, TContext>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation<BookmarkResponse, TError, boolean, TContext>({
    mutationFn: (likeChecked: boolean) => patchBookmark({ billId, likeChecked }),
    ...options,
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: billKeys.detail(billId) });
      qc.invalidateQueries({ queryKey: billKeys.mainfeed() });
      qc.invalidateQueries({ queryKey: ['user', 'bookmark', 'bill'] });
      qc.invalidateQueries({ queryKey: ['user', 'bookmark', 'bill', 'count'] });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(extractApiMessage(error));
      options?.onError?.(error, variables, context);
    },
  });
};

'use client';

import {
  useSuspenseInfiniteQuery,
  useQuery,
  type UseSuspenseInfiniteQueryOptions,
  type InfiniteData,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { TimelineFeed, TimelineBillState } from '@/app/timeline/validation';
import { getTimelineFeed, getTimelineBillState } from '@/app/timeline/services';

export const timelineKeys = {
  root: () => ['timeline'] as const,
  feed: () => [...timelineKeys.root(), 'feed'] as const,
  billState: () => [...timelineKeys.root(), 'billState'] as const,
};

/**
 * 타임라인 피드 무한스크롤 훅
 */
export const useInfiniteTimelineFeed = (
  options?: Omit<
    UseSuspenseInfiniteQueryOptions<
      TimelineFeed,
      unknown,
      InfiniteData<TimelineFeed>,
      ReturnType<typeof timelineKeys.feed>,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) =>
  useSuspenseInfiniteQuery({
    queryKey: timelineKeys.feed(),
    queryFn: ({ pageParam = 0 }) => getTimelineFeed(pageParam),
    initialPageParam: 0,
    getNextPageParam: (data) =>
      data.pagination_response.last_page ? undefined : data.pagination_response.page_number + 1,
    ...options,
  });

/**
 * 타임라인 법안 통계 조회 훅
 */
export const useGetTimelineBillState = <TData = TimelineBillState, TError = unknown>(
  options?: Omit<
    UseQueryOptions<TimelineBillState, TError, TData, ReturnType<typeof timelineKeys.billState>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: timelineKeys.billState(),
    queryFn: () => getTimelineBillState(),
    ...options,
  });

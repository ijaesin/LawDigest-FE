'use client';

import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
  type UseSuspenseInfiniteQueryOptions,
  type InfiniteData,
  type UseSuspenseQueryOptions,
} from '@tanstack/react-query';
import type { FollowingCongressmanList, FollowingBillFeed } from '@/app/following/validation';
import { getFollowingCongressman, getFollowingBill } from '@/app/following/services/apis';
import { followingKeys } from '@/app/following/services/query-keys';

export const useGetFollowingCongressman = <TData = FollowingCongressmanList, TError = unknown>(
  options?: Omit<
    UseSuspenseQueryOptions<FollowingCongressmanList, TError, TData, ReturnType<typeof followingKeys.congressmanList>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useSuspenseQuery({
    queryKey: followingKeys.congressmanList(),
    queryFn: () => getFollowingCongressman(),
    ...options,
  });

export const useInfiniteFollowingBill = (
  options?: Omit<
    UseSuspenseInfiniteQueryOptions<
      FollowingBillFeed,
      unknown,
      InfiniteData<FollowingBillFeed>,
      ReturnType<typeof followingKeys.billFeed>,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) =>
  useSuspenseInfiniteQuery({
    queryKey: followingKeys.billFeed(),
    queryFn: ({ pageParam = 0 }) => getFollowingBill(pageParam),
    initialPageParam: 0,
    getNextPageParam: (data) =>
      data.pagination_response.last_page ? undefined : data.pagination_response.page_number + 1,
    ...options,
  });

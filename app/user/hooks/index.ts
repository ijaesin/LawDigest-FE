import {
  useSuspenseQuery,
  useSuspenseInfiniteQuery,
  type UseSuspenseQueryOptions,
  type UseSuspenseInfiniteQueryOptions,
  type InfiniteData,
  type QueryClient,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import type {
  FollowingPartyList,
  FollowingCongressmanList,
  BillBookmarkedCount,
  UserInfo,
} from '@/app/user/validation';
import type { Feed } from '@/app/bill/validation';
import {
  getUserInfo,
  getFollowingParty,
  getFollowingCongressman,
  getBillBookmarked,
  getBillBookmarkedCount,
  postLogout,
} from '@/app/user/services';

export const userKeys = {
  root: () => ['user'] as const,
  info: () => [...userKeys.root(), 'info'] as const,
  followingParty: () => [...userKeys.root(), 'followingParty'] as const,
  followingCongressman: () => [...userKeys.root(), 'followingCongressman'] as const,
  billBookmarkFeed: () => [...userKeys.root(), 'billBookmarkFeed'] as const,
  billBookmarkCount: () => [...userKeys.root(), 'billBookmarkCount'] as const,
};

/**
 * @description SSR/서버 컴포넌트에서 유저 정보 프리패치를 위한 유틸
 */
export const useGetUserInfo = <TData = UserInfo, TError = unknown>(
  options?: Omit<
    UseSuspenseQueryOptions<UserInfo, TError, TData, ReturnType<typeof userKeys.info>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useSuspenseQuery({
    queryKey: userKeys.info(),
    queryFn: () => getUserInfo(),
    ...options,
  });

/**
 * @description 클라이언트에서 팔로우한 정당 목록 조회 훅
 */
export const useGetFollowingParty = <TData = FollowingPartyList, TError = unknown>(
  options?: Omit<
    UseSuspenseQueryOptions<FollowingPartyList, TError, TData, ReturnType<typeof userKeys.followingParty>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useSuspenseQuery({
    queryKey: userKeys.followingParty(),
    queryFn: () => getFollowingParty(),
    ...options,
  });

/**
 * @description 클라이언트에서 팔로우한 의원 목록 조회 훅
 */
export const useGetFollowingCongressman = <TData = FollowingCongressmanList, TError = unknown>(
  options?: Omit<
    UseSuspenseQueryOptions<FollowingCongressmanList, TError, TData, ReturnType<typeof userKeys.followingCongressman>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useSuspenseQuery({
    queryKey: userKeys.followingCongressman(),
    queryFn: () => getFollowingCongressman(),
    ...options,
  });

/**
 * @description 북마크한 법안 무한스크롤 훅
 */
export const useInfiniteBillBookmarked = (
  options?: Omit<
    UseSuspenseInfiniteQueryOptions<
      Feed,
      unknown,
      InfiniteData<Feed>,
      ReturnType<typeof userKeys.billBookmarkFeed>,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) =>
  useSuspenseInfiniteQuery({
    queryKey: userKeys.billBookmarkFeed(),
    queryFn: ({ pageParam = 0 }) => getBillBookmarked(pageParam),
    initialPageParam: 0,
    getNextPageParam: (data) =>
      data.pagination_response.last_page ? undefined : data.pagination_response.page_number + 1,
    ...options,
  });

/**
 * @description 북마크한 법안 개수 조회 훅
 */
export const useGetBillBookmarkedCount = <TData = BillBookmarkedCount, TError = unknown>(
  options?: Omit<
    UseSuspenseQueryOptions<BillBookmarkedCount, TError, TData, ReturnType<typeof userKeys.billBookmarkCount>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useSuspenseQuery({
    queryKey: userKeys.billBookmarkCount(),
    queryFn: () => getBillBookmarkedCount(),
    ...options,
  });

export const fetchFollowingParty = (queryClient: QueryClient) =>
  queryClient.fetchQuery({
    queryKey: userKeys.followingParty(),
    queryFn: () => getFollowingParty(),
  });

export const usePostLogout = (options?: UseMutationOptions<void, Error, void, unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postLogout(),
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.info() });
      queryClient.invalidateQueries({ queryKey: userKeys.followingParty() });
      queryClient.invalidateQueries({ queryKey: userKeys.followingCongressman() });
      queryClient.invalidateQueries({ queryKey: userKeys.billBookmarkFeed() });
      queryClient.invalidateQueries({ queryKey: userKeys.billBookmarkCount() });
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};

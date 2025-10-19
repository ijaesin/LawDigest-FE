'use client';

import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
  useQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type UseSuspenseInfiniteQueryOptions,
  type UseSuspenseQueryOptions,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import type { PartyBillFeed, PartyDetail, PartyCongressmanResponse, PartyFollowResponse } from '@/app/party/validation';
import type { ValueOf } from '@/app/common/types';
import { BILL_TAB } from '@/app/bill/constants';
import { getBillByParty, getPartyCongressman, getPartyDetail, patchPartyFollow } from '@/app/party/services';

export const partyKeys = {
  root: () => ['party'] as const,
  detail: (partyId: number) => [...partyKeys.root(), 'detail', partyId] as const,
  billFeed: (partyId: number, type: string) => [...partyKeys.root(), 'billFeed', partyId, type] as const,
  congressman: (partyId: number) => [...partyKeys.root(), 'congressman', partyId] as const,
};

export const useInfinitePartyBills = (
  partyId: number,
  type: ValueOf<typeof BILL_TAB>,
  options?: Omit<
    UseSuspenseInfiniteQueryOptions<
      PartyBillFeed,
      unknown,
      InfiniteData<PartyBillFeed>,
      ReturnType<typeof partyKeys.billFeed>,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) =>
  useSuspenseInfiniteQuery({
    queryKey: partyKeys.billFeed(partyId, type),
    queryFn: ({ pageParam = 0 }) => getBillByParty(partyId, type, pageParam),
    initialPageParam: 0,
    getNextPageParam: (data) =>
      data.pagination_response.last_page ? undefined : data.pagination_response.page_number + 1,
    ...options,
  });

export const useGetPartyDetail = <TData = PartyDetail, TError = unknown>(
  partyId: number,
  options?: Omit<
    UseSuspenseQueryOptions<PartyDetail, TError, TData, ReturnType<typeof partyKeys.detail>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useSuspenseQuery({
    queryKey: partyKeys.detail(partyId),
    queryFn: () => getPartyDetail(partyId),
    ...options,
  });

export const useGetPartyCongressman = <TData = PartyCongressmanResponse, TError = unknown>(
  partyId: number,
  options?: Omit<
    UseQueryOptions<PartyCongressmanResponse, TError, TData, ReturnType<typeof partyKeys.congressman>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: partyKeys.congressman(partyId),
    queryFn: () => getPartyCongressman(partyId),
    ...options,
  });

export const useMutatePartyFollow = <TError = unknown, TContext = unknown>(
  partyId: number,
  options?: Omit<UseMutationOptions<PartyFollowResponse, TError, boolean, TContext>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checked: boolean) => patchPartyFollow(partyId, checked),
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: partyKeys.detail(partyId) });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(extractApiMessage(error));
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

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
} from '@tanstack/react-query';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import type {
  PartyBillFeed,
  PartyDetail,
  PartyCongressmanResponse,
  PartyFollowResponse,
  PartyExecutive,
} from '@/app/party/validation';
import type { ValueOf } from '@/app/common/types';
import { BILL_TAB } from '@/app/bill/constants';
import {
  getBillByParty,
  getPartyCongressman,
  getPartyDetail,
  getPartyExecutive,
  patchPartyFollow,
} from '@/app/party/services/apis';
import { partyKeys } from '@/app/party/services/query-keys';

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

export const useGetPartyExecutive = <TData = PartyExecutive, TError = unknown>(
  partyId: number,
  options?: Omit<
    UseQueryOptions<PartyExecutive, TError, TData, ReturnType<typeof partyKeys.executive>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: partyKeys.executive(partyId),
    queryFn: () => getPartyExecutive(partyId),
    ...options,
  });

export const useMutatePartyFollow = (partyId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checked: boolean) => patchPartyFollow(partyId, checked),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: partyKeys.detail(partyId) });
    },
    onError: (error) => {
      console.error(extractApiMessage(error));
    },
  });
};

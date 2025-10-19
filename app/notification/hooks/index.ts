'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import type { NotificationList, NotificationCount } from '@/app/notification/validation';
import {
  getNotification,
  getNotificationCount,
  getNotificationTopThree,
  putNotificationRead,
  putNotificationReadAll,
  deleteNotification,
  deleteNotificationAll,
} from '@/app/notification/services';

export const notificationKeys = {
  root: () => ['notifications'] as const,
  list: () => [...notificationKeys.root()] as const, // alias for list
  count: () => [...notificationKeys.root(), 'count'] as const,
  topThree: () => [...notificationKeys.root(), 'top3'] as const,
};

/**
 * 알림 목록 조회 훅
 */
export const useGetNotification = <TData = NotificationList, TError = unknown>(
  options?: Omit<
    UseQueryOptions<NotificationList, TError, TData, ReturnType<typeof notificationKeys.list>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => getNotification(),
    ...options,
  });

/**
 * 읽지 않은 알림 개수 조회 훅
 */
export const useGetNotificationCount = <TData = NotificationCount, TError = unknown>(
  options?: Omit<
    UseQueryOptions<NotificationCount, TError, TData, ReturnType<typeof notificationKeys.count>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: notificationKeys.count(),
    queryFn: () => getNotificationCount(),
    ...options,
  });

/**
 * 읽지 않은 알림 Top3 조회 훅
 */
export const useGetNotificationTopThree = <TData = NotificationList, TError = unknown>(
  options?: Omit<
    UseQueryOptions<NotificationList, TError, TData, ReturnType<typeof notificationKeys.topThree>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: notificationKeys.topThree(),
    queryFn: () => getNotificationTopThree(),
    ...options,
  });

// ----------------- Mutations -----------------

const invalidateNotificationQueries = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: notificationKeys.list() });
  qc.invalidateQueries({ queryKey: notificationKeys.count() });
  qc.invalidateQueries({ queryKey: notificationKeys.topThree() });
};

/**
 * 개별 알림 읽음 처리 훅
 */
export const usePutNotificationRead = <TError = unknown, TContext = unknown>(
  options?: Omit<UseMutationOptions<NotificationList, TError, number, TContext>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) => putNotificationRead(notificationId),
    onSuccess: (data, variables, context) => {
      invalidateNotificationQueries(qc);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * 모든 알림 읽음 처리 훅
 */
export const usePutNotificationReadAll = <TError = unknown, TContext = unknown>(
  options?: Omit<UseMutationOptions<NotificationList, TError, void, TContext>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => putNotificationReadAll(),
    onSuccess: (data, variables, context) => {
      invalidateNotificationQueries(qc);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * 개별 알림 삭제 훅
 */
export const useDeleteNotification = <TError = unknown, TContext = unknown>(
  options?: Omit<UseMutationOptions<NotificationList, TError, number, TContext>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) => deleteNotification(notificationId),
    onSuccess: (data, variables, context) => {
      invalidateNotificationQueries(qc);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * 모든 알림 삭제 훅
 */
export const useDeleteNotificationAll = <TError = unknown, TContext = unknown>(
  options?: Omit<UseMutationOptions<NotificationList, TError, void, TContext>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteNotificationAll(),
    onSuccess: (data, variables, context) => {
      invalidateNotificationQueries(qc);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

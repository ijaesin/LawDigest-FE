# Notification 도메인 코드 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Notification 도메인의 코드 품질, 타입 안전성, Next.js/React 패턴을 프로젝트 표준에 맞게 개선한다.

**Architecture:** services 구조를 프로젝트 표준(apis.ts + queries.ts + query-keys.ts)으로 분리하고, mutation 훅의 `...options` 스프레드 순서 버그를 수정한다. NotificationList의 파생 상태 안티패턴을 `useMemo`로 전환하고, 반복 JSX를 map 기반으로 추출한다. page.tsx를 서버 컴포넌트 auth guard로 전환하고, 콜백 시그니처를 통일하며, 불필요한 useCallback과 내부 barrel export를 정리한다.

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, TypeScript strict, Tailwind CSS, shadcn/ui

---

## File Structure

### 수정 대상 파일

| 파일                                                   | 책임                     | 변경 내용                                                                        |
| ------------------------------------------------------ | ------------------------ | -------------------------------------------------------------------------------- |
| `app/notification/hooks/index.ts`                      | React Query 훅 re-export | `services/queries.ts` + `services/query-keys.ts`로 분리, re-export 전용으로 변경 |
| `app/notification/components/NotificationList.tsx`     | 알림 목록 UI             | 파생 상태 제거, 반복 JSX 추출, useCallback 제거, 콜백 시그니처 변경              |
| `app/notification/components/NotificationItem.tsx`     | 알림 단일 항목 UI        | 콜백 Props 시그니처 통일 (`onRead`, `onNavigateRead`, `onDelete`)                |
| `app/notification/components/NotificationTopThree.tsx` | 최근 알림 Top3 UI        | 콜백 시그니처 변경, useCallback 제거                                             |
| `app/notification/components/index.tsx`                | 배럴 export              | 내부 컴포넌트 export 제거                                                        |
| `app/notification/page.tsx`                            | 페이지 엔트리            | 서버 컴포넌트 auth guard 전환, `notificationKeys` import 경로 변경               |

### 신규 생성 파일

| 파일                                                  | 책임                                                     |
| ----------------------------------------------------- | -------------------------------------------------------- |
| `app/notification/services/apis.ts`                   | API 호출 함수 (Zod 검증 포함)                            |
| `app/notification/services/queries.ts`                | React Query 훅 (query + mutation)                        |
| `app/notification/services/query-keys.ts`             | 쿼리 키 팩토리 (`'use client'` 없음, 서버 컴포넌트 호환) |
| `app/notification/components/NotificationContent.tsx` | 클라이언트 사이드 레이아웃 (page.tsx에서 분리)           |

### 삭제 파일

| 파일                                 | 사유                      |
| ------------------------------------ | ------------------------- |
| `app/notification/services/index.ts` | `services/apis.ts`로 이동 |

---

## Task 1: services 구조 분리 (apis.ts + queries.ts + query-keys.ts)

**Files:**

- Create: `app/notification/services/query-keys.ts`
- Create: `app/notification/services/apis.ts`
- Create: `app/notification/services/queries.ts`
- Delete: `app/notification/services/index.ts`
- Modify: `app/notification/hooks/index.ts`

**배경:** 프로젝트 표준(bill, following 모듈)은 `services/apis.ts` + `services/queries.ts` + `services/query-keys.ts`로 분리한다. notification은 hooks/index.ts에 쿼리 키와 훅이 함께 있고, services/index.ts에 API 호출이 있어 일관성이 떨어진다. 동시에 mutation 훅의 `...options` 스프레드 순서 버그를 수정한다.

- [ ] **Step 1: query-keys.ts 생성**

`'use client'` 없이 생성하여 서버 컴포넌트(`page.tsx`)에서 직접 import 가능하게 한다.

```ts
// app/notification/services/query-keys.ts
export const notificationKeys = {
  root: () => ['notifications'] as const,
  list: () => [...notificationKeys.root()] as const,
  count: () => [...notificationKeys.root(), 'count'] as const,
  topThree: () => [...notificationKeys.root(), 'top3'] as const,
};
```

- [ ] **Step 2: apis.ts 생성 (services/index.ts 내용 이동)**

```ts
// app/notification/services/apis.ts
import { apiClient } from '@/app/common/lib/api';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import {
  NotificationListSchema,
  NotificationCountSchema,
  type NotificationList,
  type NotificationCount,
} from '@/app/notification/validation';

/**
 * @description 전체 알림 목록 조회
 * @see GET /notification/user
 */
export const getNotification = async (): Promise<NotificationList> => {
  try {
    const data = await apiClient.get<NotificationList>('/notification/user');
    return NotificationListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 읽지 않은 알림 개수 조회
 * @see GET /notification/user/count
 */
export const getNotificationCount = async (): Promise<NotificationCount> => {
  try {
    const data = await apiClient.get<NotificationCount>('/notification/user/count');
    return NotificationCountSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 읽지 않은 알림 Top3 조회
 * @see GET /notification/user/top3-unread
 */
export const getNotificationTopThree = async (): Promise<NotificationList> => {
  try {
    const data = await apiClient.get<NotificationList>('/notification/user/top3-unread');
    return NotificationListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 특정 알림 읽음 처리
 * @param notificationId - 알림 ID
 * @see PUT /notification/user/read
 */
export const putNotificationRead = async (notificationId: number): Promise<NotificationList> => {
  try {
    const data = await apiClient.put<NotificationList>('/notification/user/read', undefined, {
      params: { notification_id: notificationId },
    });
    return NotificationListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 모든 알림 읽음 처리
 * @see PUT /notification/user/read/all
 */
export const putNotificationReadAll = async (): Promise<NotificationList> => {
  try {
    const data = await apiClient.put<NotificationList>('/notification/user/read/all');
    return NotificationListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 특정 알림 삭제
 * @param notificationId - 알림 ID
 * @see DELETE /notification/user/delete
 */
export const deleteNotification = async (notificationId: number): Promise<NotificationList> => {
  try {
    const data = await apiClient.delete<NotificationList>('/notification/user/delete', {
      params: { notification_id: notificationId },
    });
    return NotificationListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 모든 알림 삭제
 * @see DELETE /notification/user/delete/all
 */
export const deleteNotificationAll = async (): Promise<NotificationList> => {
  try {
    const data = await apiClient.delete<NotificationList>('/notification/user/delete/all');
    return NotificationListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};
```

- [ ] **Step 3: queries.ts 생성 (hooks/index.ts에서 훅 이동 + mutation 스프레드 버그 수정)**

핵심 변경: 모든 mutation 훅에서 `...options`를 `mutationFn`/`onSuccess`/`onError` **앞에** 스프레드하여 내부 콜백이 소비자 옵션에 덮어씌워지지 않도록 수정.

```ts
// app/notification/services/queries.ts
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
} from '@/app/notification/services/apis';
import { notificationKeys } from '@/app/notification/services/query-keys';

// ─── Queries ────────────────────────────────────────

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

// ─── Mutations ──────────────────────────────────────

const invalidateNotificationQueries = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: notificationKeys.list() });
  qc.invalidateQueries({ queryKey: notificationKeys.count() });
  qc.invalidateQueries({ queryKey: notificationKeys.topThree() });
};

export const usePutNotificationRead = <TError = unknown, TContext = unknown>(
  options?: Omit<UseMutationOptions<NotificationList, TError, number, TContext>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (notificationId: number) => putNotificationRead(notificationId),
    onSuccess: (data, variables, context) => {
      invalidateNotificationQueries(qc);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};

export const usePutNotificationReadAll = <TError = unknown, TContext = unknown>(
  options?: Omit<UseMutationOptions<NotificationList, TError, void, TContext>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: () => putNotificationReadAll(),
    onSuccess: (data, variables, context) => {
      invalidateNotificationQueries(qc);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};

export const useDeleteNotification = <TError = unknown, TContext = unknown>(
  options?: Omit<UseMutationOptions<NotificationList, TError, number, TContext>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (notificationId: number) => deleteNotification(notificationId),
    onSuccess: (data, variables, context) => {
      invalidateNotificationQueries(qc);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};

export const useDeleteNotificationAll = <TError = unknown, TContext = unknown>(
  options?: Omit<UseMutationOptions<NotificationList, TError, void, TContext>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: () => deleteNotificationAll(),
    onSuccess: (data, variables, context) => {
      invalidateNotificationQueries(qc);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
```

- [ ] **Step 4: hooks/index.ts를 re-export로 교체**

```ts
// app/notification/hooks/index.ts
'use client';

export {
  useGetNotification,
  useGetNotificationCount,
  useGetNotificationTopThree,
  usePutNotificationRead,
  usePutNotificationReadAll,
  useDeleteNotification,
  useDeleteNotificationAll,
} from '@/app/notification/services/queries';

export { notificationKeys } from '@/app/notification/services/query-keys';
```

- [ ] **Step 5: services/index.ts 삭제**

```bash
rm app/notification/services/index.ts
```

- [ ] **Step 6: page.tsx import 경로 변경**

`page.tsx`는 서버 컴포넌트이므로 `notificationKeys`를 `services/query-keys.ts`에서, API 함수를 `services/apis.ts`에서 직접 import:

```tsx
// app/notification/page.tsx — import 변경만
import { getNotification, getNotificationCount } from '@/app/notification/services/apis';
import { notificationKeys } from '@/app/notification/services/query-keys';
```

나머지 코드는 그대로 유지.

- [ ] **Step 7: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS — 기존 `@/app/notification/hooks` import 경로는 re-export를 통해 호환 유지. `@/app/notification/services` import는 `page.tsx`에서만 사용되며 `services/apis`로 변경 완료.

- [ ] **Step 8: Commit**

```bash
git add app/notification/services/query-keys.ts app/notification/services/apis.ts app/notification/services/queries.ts app/notification/hooks/index.ts app/notification/page.tsx
git rm app/notification/services/index.ts
git commit -m "refactor: notification services 구조를 프로젝트 표준(apis/queries/query-keys)으로 분리, mutation 스프레드 버그 수정"
```

---

## Task 2: 컴포넌트 리팩토링 (콜백 시그니처 + 파생 상태 + useCallback 일괄 수정)

**Files:**

- Modify: `app/notification/components/NotificationItem.tsx`
- Modify: `app/notification/components/NotificationList.tsx`
- Modify: `app/notification/components/NotificationTopThree.tsx`

**배경:** NotificationItem의 콜백 시그니처, NotificationList의 파생 상태 안티패턴, NotificationTopThree의 useCallback을 한 커밋에서 일괄 수정한다. 세 파일은 prop 의존성이 있으므로 따로 커밋하면 중간에 빌드가 깨진다.

**UX 변경 사항:** NotificationTopThree의 성공 스낵바가 mutation 성공 후가 아닌 클릭 즉시 표시되도록 변경 (NotificationList와 동일한 패턴으로 통일).

- [ ] **Step 1: NotificationItem.tsx 콜백 시그니처 변경**

```tsx
// app/notification/components/NotificationItem.tsx
'use client';

import Link from 'next/link';
import getTimeRemaining from '@/app/common/utils/getTimeRemaining';
import type { Notification } from '@/app/notification/validation';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/common/components/ui/dropdown-menu';
import { Button } from '@/app/common/components/ui/button';
import { IconAlert, IconKebab } from '@/public/svgs';

export default function NotificationItem({
  title,
  content,
  created_date,
  type,
  notification_image_url_list,
  target,
  read,
  notification_id,
  onRead,
  onNavigateRead,
  onDelete,
}: Notification & {
  onRead: (notificationId: number) => void;
  onNavigateRead: (notificationId: number) => void;
  onDelete: (notificationId: number) => void;
}) {
  const imageUrlList = notification_image_url_list
    .filter((str): str is string => typeof str === 'string' && str.length > 0)
    .map((str) => {
      const [party = '', url = ''] = str.split(':');
      return { party, url };
    });
  const isRepresentativeSolo = imageUrlList.length === 1;
  const linkUrl = `${type === 'congressman_party_update' ? 'congressman' : 'bill'}/${target}`;

  return (
    <section className="flex items-center gap-[10px] lg:gap-4">
      <div className="flex gap-1 items-center">
        <div className={read ? 'invisible' : ''}>
          <IconAlert />
        </div>

        {isRepresentativeSolo ? (
          <Avatar
            className={`w-[50px] h-[50px] border ${imageUrlList[0].party} ${
              type === 'bill_stage_update' || type === 'bill_result_update' ? 'bg-white dark:bg-dark-pb p-1' : ''
            }`}>
            {imageUrlList[0].url ? (
              <>
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${imageUrlList[0].url}`}
                  className={`${
                    type === 'bill_stage_update' || type === 'bill_result_update' ? 'object-contain' : ''
                  } dark:hidden`}
                />
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${imageUrlList[0].url.replace('wide', 'dark')}`}
                  className={`${
                    type === 'bill_stage_update' || type === 'bill_result_update' ? 'object-contain' : ''
                  } hidden dark:block`}
                />
              </>
            ) : null}
            <AvatarFallback>{imageUrlList[0].party?.[0] ?? '?'}</AvatarFallback>
          </Avatar>
        ) : (
          <div className={`flex -space-x-4 w-[50px] ${imageUrlList.length >= 3 ? 'gap-0' : ''}`}>
            {imageUrlList.slice(0, 3).map(({ party, url }) => (
              <Avatar key={`${party}-${url}`} className="p-1 bg-white border shrink-0 dark:bg-dark-pb">
                {url ? (
                  <>
                    <AvatarImage
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${url}`}
                      className="object-contain dark:hidden"
                    />
                    <AvatarImage
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${url.replace('wide', 'dark')}`}
                      className="hidden object-contain dark:block"
                    />
                  </>
                ) : null}
                <AvatarFallback>{party?.[0] ?? '?'}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col gap-1 w-full">
          <Link href={linkUrl} onClick={() => onNavigateRead(notification_id)}>
            <p className="text-xs font-bold md:text-base">
              {title} &nbsp;
              <span className="text-[10px] md:text-sm font-medium text-gray-2 dark:text-gray-3">
                {getTimeRemaining(created_date)}
              </span>
            </p>
          </Link>
          <p className="text-gray-3 dark:text-gray-2 text-[10px] md:text-sm">{content}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <IconKebab isPassed />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRead(notification_id)}>읽음 표시</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(notification_id)}>삭제</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: NotificationList.tsx 전체 리팩토링**

```tsx
// app/notification/components/NotificationList.tsx
'use client';

import { Fragment, useMemo } from 'react';
import { getDateStatus } from '@/app/common/utils';
import { Separator } from '@/app/common/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/common/components/ui/dropdown-menu';
import { Button } from '@/app/common/components/ui/button';
import { IconKebab } from '@/public/svgs';
import { useSnackbarStore } from '@/app/common/store';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import {
  useGetNotificationCount,
  useGetNotification,
  usePutNotificationRead,
  usePutNotificationReadAll,
  useDeleteNotification,
  useDeleteNotificationAll,
} from '@/app/notification/hooks';
import NotificationItem from './NotificationItem';

const DATE_SECTIONS = ['지난 한 주', '지난 한 달', '지난 알림'] as const;

export default function NotificationList() {
  const { data: notificationCount } = useGetNotificationCount();
  const { data: notifications } = useGetNotification();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const mutateRead = usePutNotificationRead();
  const mutateDelete = useDeleteNotification();
  const mutateReadAll = usePutNotificationReadAll();
  const mutateDeleteAll = useDeleteNotificationAll();

  const groupedNotifications = useMemo(
    () => DATE_SECTIONS.map((label) => (notifications ?? []).filter((n) => getDateStatus(n.created_date) === label)),
    [notifications],
  );

  const handleRead = (notificationId: number) => {
    mutateRead.mutate(notificationId);
    setSnackbar({
      show: true,
      type: SNACKBAR_TYPE.SUCCESS,
      message: '해당 알림을 읽었습니다.',
      duration: 3000,
    });
  };

  const handleNavigateRead = (notificationId: number) => {
    mutateRead.mutate(notificationId);
  };

  const handleDelete = (notificationId: number) => {
    mutateDelete.mutate(notificationId);
    setSnackbar({
      show: true,
      type: SNACKBAR_TYPE.CANCEL,
      message: '해당 알림을 삭제했습니다.',
      duration: 3000,
    });
  };

  const handleReadAll = () => {
    mutateReadAll.mutate();
    setSnackbar({
      show: true,
      type: SNACKBAR_TYPE.SUCCESS,
      message: '알림을 모두 읽었습니다.',
      duration: 3000,
    });
  };

  const handleDeleteAll = () => {
    mutateDeleteAll.mutate();
    setSnackbar({
      show: true,
      type: SNACKBAR_TYPE.CANCEL,
      message: '알림을 모두 삭제했습니다.',
      duration: 3000,
    });
  };

  return (
    <section className="flex flex-col px-5 mt-6 mb-10">
      <div className="mb-[18px] ml-3">
        <div className="flex justify-between items-center">
          {notificationCount?.notification_count === 0 ? (
            <p className="text-sm md:text-base text-gray-2 dark:text-gray-3">알림이 없습니다.</p>
          ) : (
            <p className="text-sm md:text-base text-gray-2 dark:text-gray-3">
              <span className="text-black dark:text-gray-2">{notificationCount?.notification_count}개</span>의 읽지 않은
              알림이 있습니다.
            </p>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IconKebab isPassed />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleReadAll}>모두 읽음 표시</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteAll}>모두 삭제</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <section className="flex flex-col gap-[14px]">
        {DATE_SECTIONS.map((label, idx) => (
          <Fragment key={label}>
            {idx > 0 && <Separator className="my-6" />}
            <h2 className="text-xl font-semibold">{label}</h2>
            <div className="flex flex-col gap-3 md:gap-4">
              {notifications &&
                (groupedNotifications[idx].length === 0 ? (
                  <p className="text-sm md:text-base text-gray-2 dark:text-gray-3">{label} 알림이 없습니다.</p>
                ) : (
                  groupedNotifications[idx].map((notification) => (
                    <NotificationItem
                      key={notification.notification_id}
                      {...notification}
                      onRead={handleRead}
                      onNavigateRead={handleNavigateRead}
                      onDelete={handleDelete}
                    />
                  ))
                ))}
            </div>
          </Fragment>
        ))}
      </section>
    </section>
  );
}
```

- [ ] **Step 3: NotificationTopThree.tsx 리팩토링**

```tsx
// app/notification/components/NotificationTopThree.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/app/common/components/ui/button';
import { Separator } from '@/app/common/components/ui/separator';
import { useSnackbarStore } from '@/app/common/store';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import {
  useGetNotificationTopThree,
  usePutNotificationRead,
  useDeleteNotification,
  useGetNotificationCount,
} from '@/app/notification/hooks';
import NotificationItem from './NotificationItem';

export default function NotificationTopThree() {
  const { data: notifications, isLoading } = useGetNotificationTopThree();
  const { data: notificationCount } = useGetNotificationCount();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);

  const mutateRead = usePutNotificationRead({
    onError: () => {
      setSnackbar({
        show: true,
        type: SNACKBAR_TYPE.ERROR,
        message: '알림 읽기에 실패했습니다.',
        duration: 3000,
      });
    },
  });

  const mutateDelete = useDeleteNotification({
    onError: () => {
      setSnackbar({
        show: true,
        type: SNACKBAR_TYPE.ERROR,
        message: '알림 삭제에 실패했습니다.',
        duration: 3000,
      });
    },
  });

  const handleRead = (notificationId: number) => {
    mutateRead.mutate(notificationId);
    setSnackbar({
      show: true,
      type: SNACKBAR_TYPE.SUCCESS,
      message: '해당 알림을 읽었습니다.',
      duration: 3000,
    });
  };

  const handleNavigateRead = (notificationId: number) => {
    mutateRead.mutate(notificationId);
  };

  const handleDelete = (notificationId: number) => {
    mutateDelete.mutate(notificationId);
    setSnackbar({
      show: true,
      type: SNACKBAR_TYPE.CANCEL,
      message: '해당 알림을 삭제했습니다.',
      duration: 3000,
    });
  };

  if (isLoading) return <p className="text-sm text-center text-gray-2 dark:text-gray-3">불러오는 중...</p>;

  return (
    <section className="flex flex-col gap-4 px-3 py-2 mx-5 mt-6 mb-10 rounded-3xl border shadow-2xl backdrop-blur-md bg-white/20 border-white/60 shadow-black/20">
      <h2 className="text-xl font-semibold">최근 알림</h2>
      <Separator />

      {notifications && notifications.length > 0 ? (
        <div className="flex flex-col gap-3 md:gap-4">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.notification_id}
              {...notification}
              onRead={handleRead}
              onNavigateRead={handleNavigateRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm md:text-base text-gray-2 dark:text-gray-3">최근 알림이 없습니다.</p>
      )}

      <div className="flex justify-between items-center">
        {notificationCount && (
          <p className="text-xs md:text-sm text-gray-2 dark:text-gray-3">
            <span className="text-black dark:text-gray-2">{notificationCount.notification_count}개</span>의 읽지 않은
            알림이 있습니다.
          </p>
        )}
        <Button asChild variant="link" size="sm" className="text-xs md:text-sm">
          <Link href="/notification">알림 더 보기</Link>
        </Button>
      </div>
    </section>
  );
}
```

핵심 변경 (3파일 일괄):

- **NotificationItem:** `onClickRead(id, isClickByButton)` → `onRead(id)` + `onNavigateRead(id)` 분리, `onClickDelete` → `onDelete`
- **NotificationList:** `useState`+`useEffect`+`initialData` 66줄 → `useMemo`+`DATE_SECTIONS`, 3개 섹션 복붙→map, `useCallback` 4개 제거, ESLint suppress 제거
- **NotificationTopThree:** `useCallback` 2개 제거, `React` import 제거, mutation `onSuccess` 스낵바 → 핸들러에서 직접 호출 (UX 통일), mutation에는 `onError`만 전달

- [ ] **Step 4: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS — 모든 컴포넌트가 새 콜백 시그니처 사용.

- [ ] **Step 5: Commit**

```bash
git add app/notification/components/NotificationItem.tsx app/notification/components/NotificationList.tsx app/notification/components/NotificationTopThree.tsx
git commit -m "refactor: notification 컴포넌트 콜백 시그니처 통일, 파생 상태 제거, useCallback 정리"
```

---

## Task 3: page.tsx 서버 컴포넌트 auth guard + barrel file 정리

**Files:**

- Create: `app/notification/components/NotificationContent.tsx`
- Modify: `app/notification/page.tsx`
- Modify: `app/notification/components/index.tsx`

**배경:** page.tsx에 서버 사이드 auth guard를 추가하고, 기존 JSX를 NotificationContent 클라이언트 컴포넌트로 분리한다. barrel file에서 내부 전용 컴포넌트 export를 제거한다.

- [ ] **Step 1: NotificationContent 클라이언트 컴포넌트 생성**

```tsx
// app/notification/components/NotificationContent.tsx
'use client';

import NotificationList from './NotificationList';

export default function NotificationContent() {
  return (
    <section className="lg:max-w-[840px] mx-auto">
      <NotificationList />
    </section>
  );
}
```

- [ ] **Step 2: page.tsx를 서버 컴포넌트 auth guard로 전환**

```tsx
// app/notification/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { ACCESS_TOKEN } from '@/app/common/constants';
import { getNotification, getNotificationCount } from '@/app/notification/services/apis';
import { notificationKeys } from '@/app/notification/services/query-keys';
import NotificationContent from './components/NotificationContent';

export const dynamic = 'force-dynamic';

export default async function NotificationPage() {
  const token = (await cookies()).get(ACCESS_TOKEN)?.value;
  if (!token) redirect('/auth/login');

  const qc = new QueryClient();
  await Promise.all([
    qc.prefetchQuery({ queryKey: notificationKeys.list(), queryFn: () => getNotification() }),
    qc.prefetchQuery({ queryKey: notificationKeys.count(), queryFn: () => getNotificationCount() }),
  ]).catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotificationContent />
    </HydrationBoundary>
  );
}
```

핵심 변경:

- `cookies()` + `redirect('/auth/login')` auth guard 추가
- `NotificationList` 직접 렌더링 → `NotificationContent` 클라이언트 컴포넌트로 분리
- `notificationKeys` import: `hooks` → `services/query-keys` (서버 컴포넌트 호환)
- API import: `services` → `services/apis`

- [ ] **Step 3: barrel file 정리**

```tsx
// app/notification/components/index.tsx
export { default as NotificationList } from './NotificationList';
export { default as NotificationTopThree } from './NotificationTopThree';
```

변경 사항:

- `NotificationItem` export 제거 — 모듈 내부에서만 사용
- `NotificationContent`는 배럴에 추가하지 않음 — `page.tsx`에서 직접 import하는 내부 컴포넌트

- [ ] **Step 4: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: lint 확인**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/notification/components/NotificationContent.tsx app/notification/page.tsx app/notification/components/index.tsx
git commit -m "refactor: notification page 서버 컴포넌트 auth guard 전환, 내부 컴포넌트 export 제거"
```

---

## Task 4: ESLint/Prettier 수정

**Files:**

- Modify: 모든 변경된 파일

- [ ] **Step 1: fix 실행**

Run: `npm run fix`

- [ ] **Step 2: lint + typecheck 확인**

Run: `npm run lint && npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit (필요 시)**

```bash
git add -A
git commit -m "style: notification 모듈 ESLint/Prettier 수정"
```

---

## 적용된 규칙 매핑

| Task   | 적용 규칙                                                                   |
| ------ | --------------------------------------------------------------------------- |
| Task 1 | 프로젝트 표준 모듈 구조 일관성, mutation `...options` 스프레드 버그 수정    |
| Task 2 | 콜백 시그니처 통일, 파생 상태 안티패턴 제거, DRY, 불필요한 useCallback 제거 |
| Task 3 | Next.js 서버 컴포넌트 auth guard, 배럴 파일 정리                            |
| Task 4 | 코드 스타일 일관성                                                          |

## 요약 — 개선 효과

| 영역              | Before                                       | After                                          |
| ----------------- | -------------------------------------------- | ---------------------------------------------- |
| **인증 처리**     | auth guard 없음                              | `cookies()` + `redirect('/auth/login')`        |
| **데이터 흐름**   | `useState` + `useEffect` + 66줄 initialData  | `useMemo` 직접 계산                            |
| **JSX 구조**      | 3개 날짜 섹션 복붙 (~60줄)                   | `DATE_SECTIONS.map()` (~15줄)                  |
| **콜백 타입**     | `(id, isClickByButton)` 플래그               | `onRead`, `onNavigateRead`, `onDelete` 분리    |
| **모듈 구조**     | hooks에 키+훅 혼재, services에 API만         | apis.ts + queries.ts + query-keys.ts 표준 분리 |
| **Mutation 버그** | `...options` 스프레드가 `onSuccess` 덮어씌움 | 스프레드 순서 수정, 콜백 체이닝                |
| **배럴 파일**     | 내부 컴포넌트 포함 3개 export                | 공개 컴포넌트 2개만 export                     |
| **메모이제이션**  | 효과 없는 useCallback 6개                    | 불필요한 래핑 제거                             |

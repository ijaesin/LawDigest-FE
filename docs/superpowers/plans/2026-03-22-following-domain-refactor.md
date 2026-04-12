# Following 도메인 코드 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Following 도메인의 코드 품질, 타입 안전성, Next.js/React 패턴을 프로젝트 표준에 맞게 개선한다.

**Architecture:** page.tsx를 서버 컴포넌트 auth guard로 전환(mypage 패턴 일관성), BillContainer의 파생 상태 안티패턴 제거, CongressmanItem의 router.push를 Link로 교체, hooks/services 구조를 프로젝트 표준(apis.ts + queries.ts + query-keys.ts)으로 분리, 배럴 파일에서 내부 컴포넌트 export 제거, 하드코딩된 페이지 사이즈 상수화.

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, TypeScript strict, Tailwind CSS, shadcn/ui

---

## File Structure

### 수정 대상 파일

| 파일                                           | 책임                     | 변경 내용                                                                 |
| ---------------------------------------------- | ------------------------ | ------------------------------------------------------------------------- |
| `app/following/page.tsx`                       | 페이지 엔트리            | 서버 컴포넌트 전환, auth guard 서버 사이드 처리                           |
| `app/following/components/BillContainer.tsx`   | 법안 무한스크롤 컨테이너 | `useState`+`useEffect` 제거 → `useMemo` 파생 계산                         |
| `app/following/components/CongressmanItem.tsx` | 의원 카드                | `router.push` → `Link`, `useRouter` 제거                                  |
| `app/following/components/index.tsx`           | 배럴 export              | 내부 컴포넌트 export 제거                                                 |
| `app/following/services/index.ts`              | API 호출                 | `services/apis.ts`로 이동, 상수 추출                                      |
| `app/following/hooks/index.ts`                 | React Query 훅           | `services/queries.ts` + `services/query-keys.ts`로 분리, re-export로 변경 |

### 신규 생성 파일

| 파일                                            | 책임                                           |
| ----------------------------------------------- | ---------------------------------------------- |
| `app/following/services/apis.ts`                | API 호출 함수 (Zod 검증 포함)                  |
| `app/following/services/queries.ts`             | React Query 훅                                 |
| `app/following/services/query-keys.ts`          | 쿼리 키 팩토리                                 |
| `app/following/components/FollowingContent.tsx` | 클라이언트 사이드 레이아웃 (page.tsx에서 분리) |
| `app/following/constants/index.ts`              | 페이지 사이즈 등 상수                          |

### 삭제 파일

| 파일                              | 사유                      |
| --------------------------------- | ------------------------- |
| `app/following/services/index.ts` | `services/apis.ts`로 이동 |

---

## Task 1: services 구조 분리 (apis.ts + queries.ts + query-keys.ts)

**Files:**

- Create: `app/following/constants/index.ts`
- Create: `app/following/services/query-keys.ts`
- Create: `app/following/services/apis.ts`
- Create: `app/following/services/queries.ts`
- Delete: `app/following/services/index.ts`
- Modify: `app/following/hooks/index.ts`

**배경:** 프로젝트 표준(bill 모듈)은 `services/apis.ts` + `services/queries.ts` + `services/query-keys.ts`로 분리한다. following은 hooks/index.ts에 쿼리 키와 훅이 함께 있고, services/index.ts에 API 호출이 있어 일관성이 떨어진다.

- [ ] **Step 1: 상수 파일 생성**

```ts
// app/following/constants/index.ts
export const FOLLOWING_BILL_PAGE_SIZE = 3;
```

- [ ] **Step 2: query-keys.ts 생성**

```ts
// app/following/services/query-keys.ts
export const followingKeys = {
  root: () => ['following'] as const,
  congressmanList: () => [...followingKeys.root(), 'congressmanList'] as const,
  billFeed: () => [...followingKeys.root(), 'billFeed'] as const,
};
```

- [ ] **Step 3: apis.ts 생성 (services/index.ts 내용 이동 + 상수 적용)**

```ts
// app/following/services/apis.ts
import { apiClient } from '@/app/common/lib/api';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import {
  FollowingCongressmanListSchema,
  FollowingBillFeedSchema,
  type FollowingCongressmanList,
  type FollowingBillFeed,
} from '@/app/following/validation';
import { FOLLOWING_BILL_PAGE_SIZE } from '@/app/following/constants';

/**
 * @description 팔로우한 의원 목록 조회
 * @returns FollowingCongressmanList
 * @see GET /following-tab/congressman
 */
export const getFollowingCongressman = async (): Promise<FollowingCongressmanList> => {
  try {
    const data = await apiClient.get<FollowingCongressmanList>('/following-tab/congressman');
    return FollowingCongressmanListSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 팔로우한 법안 무한스크롤 피드 조회
 * @param page - 페이지 번호 (0부터 시작)
 * @returns FollowingBillFeed
 * @see GET /following-tab/bill
 */
export const getFollowingBill = async (page: number): Promise<FollowingBillFeed> => {
  try {
    const data = await apiClient.get<FollowingBillFeed>('/following-tab/bill', {
      params: { page, size: FOLLOWING_BILL_PAGE_SIZE },
    });
    return FollowingBillFeedSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};
```

- [ ] **Step 4: queries.ts 생성 (hooks/index.ts에서 훅 이동)**

```ts
// app/following/services/queries.ts
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
```

- [ ] **Step 5: hooks/index.ts를 re-export로 교체**

```ts
// app/following/hooks/index.ts
'use client';

export { useGetFollowingCongressman, useInfiniteFollowingBill } from '@/app/following/services/queries';

export { followingKeys } from '@/app/following/services/query-keys';
```

- [ ] **Step 6: services/index.ts 삭제**

```bash
rm app/following/services/index.ts
```

- [ ] **Step 7: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS — `@/app/following/hooks` 경로가 re-export를 통해 기존대로 동작. `@/app/following/services` 직접 import는 이제 `services/apis`, `services/queries`, `services/query-keys`로 개별 참조.

- [ ] **Step 8: Commit**

```bash
git add app/following/constants/index.ts app/following/services/query-keys.ts app/following/services/apis.ts app/following/services/queries.ts app/following/hooks/index.ts
git rm app/following/services/index.ts
git commit -m "refactor: following services 구조를 프로젝트 표준(apis/queries/query-keys)으로 분리"
```

---

## Task 2: BillContainer 파생 상태 제거

**Files:**

- Modify: `app/following/components/BillContainer.tsx`

**배경:** `useState` + `useEffect`로 React Query `data`를 복사하는 것은 파생 상태 안티패턴이다 (main-feed-refactor Task 2와 동일). `useMemo`로 직접 계산한다.

- [ ] **Step 1: BillContainer.tsx 리팩토링**

```tsx
// app/following/components/BillContainer.tsx
'use client';

import { useMemo } from 'react';
import { useIntersect } from '@/app/common/hooks';
import { useInfiniteFollowingBill } from '@/app/following/hooks';
import type { BillResponse } from '@/app/bill/validation';
import BillFollowedList from './BillFollowedList';

const EMPTY_BILLS: BillResponse[] = [];

export default function BillContainer() {
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteFollowingBill();

  const bills = useMemo(() => data?.pages.flatMap((p) => p.bill_list) ?? EMPTY_BILLS, [data]);

  const fetchRef = useIntersect((entry, observer) => {
    observer.unobserve(entry.target);
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  });

  return (
    <section className="flex flex-col gap-6">
      <BillFollowedList bills={bills} isFetching={isFetching} fetchRef={fetchRef} />
    </section>
  );
}
```

핵심 변경:

- `useState` + `useEffect` 제거 → `useMemo` 파생 계산
- 빈 배열 참조 안정화 (`EMPTY_BILLS` 모듈 레벨 상수)
- `useIntersect` 콜백에서 `observer.unobserve(entry.target)` 추가 (중복 호출 방지)

- [ ] **Step 2: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/following/components/BillContainer.tsx
git commit -m "refactor: BillContainer 파생 상태 안티패턴 제거, useMemo 직접 계산으로 전환"
```

---

## Task 3: CongressmanItem — router.push → Link

**Files:**

- Modify: `app/following/components/CongressmanItem.tsx`

**배경:** `useRouter` + `router.push`는 클라이언트 사이드 네비게이션에 불필요한 JS 번들을 추가하고, Link의 prefetch 최적화를 누리지 못한다. bill-domain-refactor의 AnotherBill.tsx와 동일한 이슈.

- [ ] **Step 1: CongressmanItem.tsx에서 router.push를 Link로 교체**

```tsx
// app/following/components/CongressmanItem.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';
import Link from 'next/link';
import Image from 'next/image';
import { PartyLogoReplacement } from '@/app/party/components';
import type { FollowingCongressman } from '@/app/following/validation';

export default function CongressmanItem({
  congressman_id,
  congressman_name,
  congressman_image_url,
  party_id,
  party_name,
  party_image_url,
}: FollowingCongressman) {
  return (
    <div className="flex flex-col gap-2 items-center xl:flex-row xl:justify-between">
      <div className="gap-5 xl:flex xl:flex-row">
        <Link href={`/congressman/${congressman_id}`}>
          <Avatar className="w-14 h-14">
            <AvatarImage src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${congressman_image_url}`} />
            <AvatarFallback>{congressman_name[0]}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex flex-col items-center shrink-0 xl:items-start">
          <Link href={`/congressman/${congressman_id}`} className="text-xs font-semibold xl:text-xl">
            {congressman_name} <span className="font-normal xl:text-lg xl:dark:text-gray-1">의원</span>
          </Link>
          <p className="text-gray-2 text-[10px] font-medium xl:text-sm">{party_name}</p>
        </div>
      </div>

      {party_image_url !== null ? (
        <Link href={`/party/${party_id}`} className="hidden xl:block">
          <Image
            className="dark:hidden"
            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url}`}
            width={60}
            height={20}
            alt={`${party_name} 로고 이미지`}
          />
          <Image
            className="hidden dark:block"
            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url.replace('wide', 'dark')}`}
            width={60}
            height={20}
            alt={`${party_name} 로고 이미지`}
          />
        </Link>
      ) : (
        <div className="hidden xl:block">
          <PartyLogoReplacement partyName={party_name} circle={false} />
        </div>
      )}
    </div>
  );
}
```

핵심 변경:

- `useRouter` import 제거
- `Button` + `onClick` + `router.push` → `Link` 교체
- `e.preventDefault()` / `e.stopPropagation()` 제거
- `party_image_url === null`일 때 비활성 로고는 Link 없이 `div`로 래핑 (클릭 불가 유지)

- [ ] **Step 2: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/following/components/CongressmanItem.tsx
git commit -m "refactor: CongressmanItem router.push를 Link로 교체, prefetch 최적화 활용"
```

---

## Task 4: page.tsx 서버 컴포넌트 auth guard 전환

**Files:**

- Create: `app/following/components/FollowingContent.tsx`
- Modify: `app/following/page.tsx`
- Modify: `app/following/components/index.tsx`

**배경:** 현재 page.tsx는 `'use client'` + `getCookie` + `useEffect` redirect로 인증을 처리한다. 이는 hydration 전까지 빈 화면이 표시되고, 비인증 사용자에게 JS 번들이 전송된다. mypage 패턴(`cookies()` + `redirect()`)으로 전환하여 서버에서 즉시 리다이렉트한다.

- [ ] **Step 1: FollowingContent 클라이언트 컴포넌트 생성**

기존 page.tsx의 JSX를 FollowingContent로 추출:

```tsx
// app/following/components/FollowingContent.tsx
'use client';

import { SearchBarButton } from '@/app/search/components';
import FollowingNav from './FollowingNav';
import BillContainer from './BillContainer';

export default function FollowingContent() {
  return (
    <section className="flex flex-col mx-auto lg:flex-row lg:justify-center">
      <FollowingNav />
      <div className="mt-4 md:mt-0 lg:border-l-1 lg:dark:border-dark-l">
        <div className="hidden mt-11 lg:block">
          <SearchBarButton />
        </div>
        <BillContainer />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: page.tsx를 서버 컴포넌트로 전환**

```tsx
// app/following/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_TOKEN } from '@/app/common/constants';
import FollowingContent from './components/FollowingContent';

export default async function Following() {
  const token = (await cookies()).get(ACCESS_TOKEN)?.value;
  if (!token) redirect('/auth/login');

  return <FollowingContent />;
}
```

핵심 변경:

- `'use client'` 제거 → 서버 컴포넌트
- `getCookie` + `useEffect` + `useRouter` → `cookies()` + `redirect()`
- 스낵바 알림 제거 — 서버 리다이렉트는 즉시 이동하므로 사용자에게 메시지를 보여줄 틈이 없음
- 비인증 사용자에게 JS 번들 전송 방지

- [ ] **Step 3: 배럴 파일 업데이트 (내부 컴포넌트 제거 + FollowingContent 추가)**

```tsx
// app/following/components/index.tsx
export { default as FollowingNav } from './FollowingNav';
export { default as BillContainer } from './BillContainer';
```

변경 사항:

- `'use client'` 제거 — 각 컴포넌트가 자체 `'use client'` 보유
- `FollowingContent`는 배럴에 추가하지 않음 — page.tsx에서만 직접 import하는 내부 컴포넌트
- 내부 전용 컴포넌트 export 제거:
  - `CongressmanList` — `FollowingNav` 내부에서만 사용
  - `CongressmanItem` — `CongressmanList` 내부에서만 사용
  - `BillFollowedList` — `BillContainer` 내부에서만 사용

- [ ] **Step 4: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/following/page.tsx app/following/components/FollowingContent.tsx app/following/components/index.tsx
git commit -m "refactor: following page 서버 컴포넌트 auth guard 전환, 내부 컴포넌트 export 제거"
```

---

## 적용된 규칙 매핑

| Task   | 적용 규칙                                                     |
| ------ | ------------------------------------------------------------- |
| Task 1 | 프로젝트 표준 모듈 구조 일관성 (apis/queries/query-keys 분리) |
| Task 2 | `rerender-derived-state-no-effect` — 파생 상태 안티패턴 제거  |
| Task 3 | Next.js `Link` prefetch 최적화, `useRouter` 불필요 사용 제거  |
| Task 4 | Next.js 서버 컴포넌트 auth guard, 배럴 파일 public API 정리   |

## 요약 — 개선 효과

| 영역            | Before                                                 | After                                          |
| --------------- | ------------------------------------------------------ | ---------------------------------------------- |
| **인증 처리**   | 클라이언트 `getCookie` + `useEffect` redirect (깜빡임) | 서버 `cookies()` + `redirect()` (즉시 이동)    |
| **데이터 흐름** | `useState` + `useEffect` 동기화                        | `useMemo` 파생 계산                            |
| **네비게이션**  | `useRouter` + `router.push`                            | `Link` (prefetch 최적화)                       |
| **모듈 구조**   | hooks에 쿼리 키+훅 혼재, services에 API만              | apis.ts + queries.ts + query-keys.ts 표준 분리 |
| **배럴 파일**   | 내부 컴포넌트 5개 전체 export                          | 공개 컴포넌트 3개만 export                     |
| **상수**        | `size: 3` 하드코딩                                     | `FOLLOWING_BILL_PAGE_SIZE` 상수                |

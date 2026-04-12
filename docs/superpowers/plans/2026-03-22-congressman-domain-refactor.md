# Congressman 도메인 리팩터링 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Congressman 도메인의 서비스 레이어 표준화, 코드 품질, 타입 안전성, 접근성, React/Next.js 최신 패턴 준수를 개선한다.

**Architecture:** 서비스 계층을 프로젝트 표준(apis/queries/query-keys)으로 분리하고, React Query 데이터를 `useMemo`로 직접 파생하여 불필요한 상태 동기화를 제거한다. FollowBoard에 optimistic update rollback을 추가하고, Suspense/ErrorBoundary를 적용한다.

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, Vitest, MSW, TypeScript strict, Tailwind CSS, shadcn/ui

**Spec:** `docs/superpowers/specs/2026-03-22-congressman-domain-refactor-design.md`

---

## File Structure

### 신규 생성

| 파일                                                       | 역할                                            |
| ---------------------------------------------------------- | ----------------------------------------------- |
| `app/congressman/services/query-keys.ts`                   | Query key 팩토리                                |
| `app/congressman/services/apis.ts`                         | API 호출 (기존 `services/index.ts` rename)      |
| `app/congressman/services/queries.ts`                      | React Query 훅 (기존 `hooks/index.ts`에서 이동) |
| `app/common/utils/decodeHtmlEntities.ts`                   | HTML entity 디코딩 유틸                         |
| `app/congressman/components/CongressmanDetailSkeleton.tsx` | 스켈레톤 UI                                     |
| `tests/congressman/services/apis.test.ts`                  | API 함수 테스트                                 |
| `tests/congressman/components/FollowBoard.test.tsx`        | FollowBoard 테스트                              |

### 수정

| 파일                                               | 변경 요약                           |
| -------------------------------------------------- | ----------------------------------- |
| `app/congressman/hooks/index.ts`                   | re-export only                      |
| `app/congressman/services/index.ts`                | 삭제 (apis.ts로 대체)               |
| `app/congressman/components/BillContainer.tsx`     | `useMemo`, 타입 캐스트 제거, 상수화 |
| `app/congressman/components/FollowBoard.tsx`       | rollback, 접근성                    |
| `app/congressman/components/CongressmanDetail.tsx` | HTML entity, homepage, 접근성       |
| `app/congressman/components/PartyLogo.tsx`         | falsy guard, 다크모드 URL 변수      |
| `app/congressman/components/index.tsx`             | 배럴 정리                           |
| `app/congressman/[id]/page.tsx`                    | Suspense + ErrorBoundary            |
| `app/common/utils/index.ts`                        | `decodeHtmlEntities` export 추가    |

---

### Task 1: 서비스 레이어 3파일 분리

**Files:**

- Create: `app/congressman/services/query-keys.ts`
- Create: `app/congressman/services/apis.ts`
- Create: `app/congressman/services/queries.ts`
- Modify: `app/congressman/hooks/index.ts`
- Delete: `app/congressman/services/index.ts`

- [ ] **Step 1: `services/query-keys.ts` 생성**

```ts
export const congressmanKeys = {
  root: () => ['congressman'] as const,
  detail: (congressmanId: string) => [...congressmanKeys.root(), 'detail', congressmanId] as const,
  billFeed: (congressmanId: string, type: string) =>
    [...congressmanKeys.root(), 'billFeed', congressmanId, type] as const,
};
```

- [ ] **Step 2: `services/index.ts`를 `services/apis.ts`로 rename**

```bash
git mv app/congressman/services/index.ts app/congressman/services/apis.ts
```

`apis.ts` 내부 import 경로는 변경 없음 (validation 등 외부 import만 사용).

매직넘버 상수 추가:

```ts
export const BILL_PAGE_SIZE = 3;
```

`getBillByCongressman`에서 `size: 3` -> `size: BILL_PAGE_SIZE`로 변경.

- [ ] **Step 3: `services/queries.ts` 생성**

기존 `hooks/index.ts`의 내용을 이동. import 경로 변경:

```ts
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

// useInfiniteCongressmanBills — 기존 동일

// useGetCongressmanDetail — 기존 동일

// useMutateCongressmanFollow — 개선:
// 1. 제네릭 concrete 타입 명시: useMutation<CongressmanFollowResponse, Error, boolean, unknown>
// 2. ...options spread 제거, 콜백 수동 포워딩
// 3. onSuccess에서 invalidateQueries 유지 (setQueryData 아님)
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
```

- [ ] **Step 4: `hooks/index.ts`를 re-export로 변환**

```ts
export { congressmanKeys } from '@/app/congressman/services/query-keys';
export {
  useInfiniteCongressmanBills,
  useGetCongressmanDetail,
  useMutateCongressmanFollow,
} from '@/app/congressman/services/queries';
```

`'use client'` 지시문 제거 (re-export에는 불필요).

- [ ] **Step 5: import 경로 확인 및 업데이트**

`app/congressman/[id]/page.tsx`에서:

- `congressmanKeys` import: `@/app/congressman/hooks` -> `@/app/congressman/services/query-keys`
- `getCongressmanDetail` import: `@/app/congressman/services` -> `@/app/congressman/services/apis`

`app/congressman/components/BillContainer.tsx`에서:

- `useInfiniteCongressmanBills` import: 기존 `@/app/congressman/hooks` 유지 (re-export)

`app/congressman/components/CongressmanDetail.tsx`에서:

- `useGetCongressmanDetail` import: `@/app/congressman/services` -> `@/app/congressman/services/queries`로 변경

`app/congressman/components/FollowBoard.tsx`에서:

- `useMutateCongressmanFollow` import: `@/app/congressman/services` -> `@/app/congressman/services/queries`로 변경

- [ ] **Step 6: 빌드 확인**

```bash
npm run typecheck
```

Expected: 에러 없음

- [ ] **Step 7: 커밋**

```bash
git add app/congressman/services/ app/congressman/hooks/index.ts app/congressman/components/BillContainer.tsx app/congressman/components/FollowBoard.tsx app/congressman/components/CongressmanDetail.tsx app/congressman/[id]/page.tsx
git commit -m "refactor: congressman 서비스 레이어 3파일 분리 (query-keys/apis/queries)"
```

---

### Task 2: BillContainer 파생 상태 안티패턴 제거

**Files:**

- Modify: `app/congressman/components/BillContainer.tsx`

- [ ] **Step 1: `useState + useEffect` -> `useMemo`로 변환**

```tsx
'use client';

import { useMemo } from 'react';
import { BillList, BillTab } from '@/app/bill/components';
import { useIntersect, useTabType } from '@/app/common/hooks';
import { useInfiniteCongressmanBills } from '@/app/congressman/hooks';
import { BILL_TAB } from '@/app/bill/constants';

export default function BillContainer({ id }: { id: string }) {
  const [billType, setBillType] = useTabType<typeof BILL_TAB>('represent_proposer');
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteCongressmanBills(id, billType);

  const bills = useMemo(() => data?.pages.flatMap(({ bill_list }) => bill_list) ?? [], [data]);

  const fetchRef = useIntersect(() => {
    if (hasNextPage && !isFetching) fetchNextPage();
  });

  return (
    <section>
      <BillTab type={billType} clickHandler={setBillType} />
      <BillList bills={bills} isFetching={isFetching} fetchRef={fetchRef} />
      {bills.length === 0 && !isFetching && (
        <p className="flex justify-center my-8 text-sm text-gray-2 dark:text-gray-3">
          발의한 법안이 존재하지 않습니다.
        </p>
      )}
    </section>
  );
}
```

변경 요약:

- `useState`, `useEffect` import 제거, `useMemo` 추가
- `bills` 로컬 상태 -> `useMemo` 파생
- `billType` 변경 시 수동 `refetch()` 제거 (queryKey에 billType 포함)
- `billType as ValueOf<typeof BILL_TAB>` 캐스트 제거
- `ValueOf` 타입 import 제거

- [ ] **Step 2: 타입체크 확인**

```bash
npm run typecheck
```

`useTabType`이 제네릭을 지원하여 `billType`이 `ValueOf<typeof BILL_TAB>`으로 추론되는지 확인. 또한 `BillTab`의 `clickHandler` prop 타입이 `setBillType`과 호환되는지 확인. `BillTab.clickHandler`가 `(value: string) => void`를 기대하면 타입 불일치가 발생할 수 있으므로, 필요 시 어댑터 함수 사용:

```ts
// 타입 불일치 시:
<BillTab type={billType} clickHandler={(value: string) => setBillType(value as ValueOf<typeof BILL_TAB>)} />
```

- [ ] **Step 3: 커밋**

```bash
git add app/congressman/components/BillContainer.tsx
git commit -m "refactor: BillContainer useState+useEffect -> useMemo 파생 상태 전환"
```

---

### Task 3: FollowBoard Optimistic Update Rollback + 접근성

**Files:**

- Modify: `app/congressman/components/FollowBoard.tsx`

- [ ] **Step 1: FollowBoard 리팩터링**

```tsx
'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/app/common/components/ui/button';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import { useSnackbarStore } from '@/app/common/store';
import { useAuthGuard } from '@/app/auth/hooks';
import { IconCheck, IconPlus } from '@/public/svgs';
import { useMutateCongressmanFollow } from '@/app/congressman/services/queries';

export default function FollowBoard({
  id,
  likeChecked,
  follow_count,
  represent_count,
  public_count,
}: {
  id: string;
  likeChecked: boolean;
  follow_count: number;
  represent_count: number;
  public_count: number;
}) {
  const [isFollowed, setIsFollowed] = useState(likeChecked);
  const [followCount, setFollowCount] = useState(follow_count);
  const mutationFollow = useMutateCongressmanFollow(id);
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const { requireLogin } = useAuthGuard();

  const onClickFollow = useCallback(() => {
    if (!requireLogin()) return;

    const prevFollowed = isFollowed;
    const prevCount = followCount;
    const nextFollowed = !isFollowed;

    setIsFollowed(nextFollowed);
    setFollowCount(nextFollowed ? followCount + 1 : followCount - 1);
    setSnackbar({
      show: true,
      type: nextFollowed ? SNACKBAR_TYPE.SUCCESS : SNACKBAR_TYPE.CANCEL,
      message: nextFollowed ? '해당 의원을 팔로우했습니다.' : '해당 의원의 팔로우를 취소했습니다.',
      duration: 3000,
    });

    mutationFollow.mutate(nextFollowed, {
      onError: () => {
        setIsFollowed(prevFollowed);
        setFollowCount(prevCount);
        setSnackbar({
          show: true,
          type: SNACKBAR_TYPE.ERROR,
          message: '팔로우 처리에 실패했습니다. 다시 시도해주세요.',
          duration: 3000,
        });
      },
    });
  }, [isFollowed, followCount, setSnackbar, requireLogin, mutationFollow]);

  return (
    <div className="flex flex-col gap-5 w-full">
      <dl className="flex justify-between w-full">
        <div className="flex flex-col items-center basis-1/3">
          <dd className="text-2xl font-semibold">{followCount}</dd>
          <dt className="text-sm font-medium text-gray-2">팔로워</dt>
        </div>
        <div className="flex flex-col items-center basis-1/3">
          <dd className="text-2xl font-semibold">{represent_count}</dd>
          <dt className="text-sm font-medium text-gray-2">대표발의법안</dt>
        </div>
        <div className="flex flex-col items-center basis-1/3">
          <dd className="text-2xl font-semibold">{public_count}</dd>
          <dt className="text-sm font-medium text-gray-2">공동발의법안</dt>
        </div>
      </dl>

      <Button
        onClick={onClickFollow}
        aria-pressed={isFollowed}
        aria-label={isFollowed ? '팔로우 취소' : '팔로우 하기'}
        className={`w-full h-12 text-lg font-medium flex justify-between px-6 rounded-full ${isFollowed ? 'bg-gray-1 text-gray-3' : 'bg-primary-3 text-white dark:bg-gray-4 dark:text-gray-2'} `}>
        {isFollowed ? '팔로우 중' : '팔로우 하기'}
        {isFollowed ? <IconCheck /> : <IconPlus />}
      </Button>
    </div>
  );
}
```

변경 요약:

- `mutate()` 인라인 `onError`로 stale closure 방지 롤백 구현
- `!isFollowed` 중복 -> `nextFollowed` 로컬 변수
- `<div>` -> `<dl>/<dt>/<dd>` 시맨틱 마크업
- Button에 `aria-pressed`, `aria-label` 추가
- `SNACKBAR_TYPE.ERROR` 사용 (프로젝트 `app/common/constants/snackbar.ts`에 존재 확인됨)

- [ ] **Step 2: `SNACKBAR_TYPE.ERROR` 존재 여부 확인**

```bash
grep -r "ERROR" app/common/constants/ --include="*.ts"
```

없으면 `SNACKBAR_TYPE.CANCEL`로 대체하고, snackbar message로 에러임을 전달.

- [ ] **Step 3: 타입체크**

```bash
npm run typecheck
```

- [ ] **Step 4: 커밋**

```bash
git add app/congressman/components/FollowBoard.tsx
git commit -m "fix: FollowBoard optimistic update rollback 구현 + 접근성 개선"
```

---

### Task 4: CongressmanDetail — HTML Entity + Homepage + 접근성

**Files:**

- Create: `app/common/utils/decodeHtmlEntities.ts`
- Modify: `app/common/utils/index.ts`
- Modify: `app/congressman/components/CongressmanDetail.tsx`

- [ ] **Step 1: `decodeHtmlEntities` 유틸 생성**

```ts
// app/common/utils/decodeHtmlEntities.ts
export default function decodeHtmlEntities(html: string): string {
  // &amp;는 반드시 마지막에 치환해야 이중 디코딩 방지 (e.g., &amp;lt; -> &lt; -> <)
  return html
    .replaceAll('&middot;', '\u00B7')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&');
}
```

- [ ] **Step 2: `app/common/utils/index.ts`에 export 추가**

```ts
import decodeHtmlEntities from './decodeHtmlEntities';
// ... 기존 imports

export {
  getTimeRemaining,
  copyClipBoard,
  sortByParty,
  getMetadata,
  getDateStatus,
  getDDay,
  convertDateFormat,
  decodeHtmlEntities,
};
```

- [ ] **Step 3: CongressmanDetail.tsx 수정**

주요 변경:

1. `brief_history` 수동 replaceAll -> `decodeHtmlEntities()` 호출
2. homepage 빈 문자열 시 버튼 미렌더링 + `target="_blank"` + `rel="noopener noreferrer"` + `aria-label`
3. Avatar에 `alt` prop 추가
4. 기본정보 `<div>` -> `<dl>/<dt>/<dd>` 시맨틱 마크업

```tsx
// import 추가
import { decodeHtmlEntities } from '@/app/common/utils';

// brief_history 부분 변경:
// Before:
//   brief_history.replaceAll('&middot;', '·').replaceAll('&nbsp;', '').replaceAll('&#39;', `'`)
// After:
//   decodeHtmlEntities(brief_history)

// Avatar 변경:
<Avatar className="w-[100px] h-[100px] border-1.5 shadow-lg shrink-0 rounded-full">
  <AvatarImage src={process.env.NEXT_PUBLIC_IMAGE_URL + congressman_image_url} alt={`${congressman_name} 의원`} />
  <AvatarFallback>{congressman_name[0]}</AvatarFallback>
</Avatar>

// 기본정보 섹션 <div> -> <dl>:
<dl className="ml-3 w-full">
  <div className="flex gap-2 justify-between items-center">
    <dt className="font-medium text-gray-2 dark:text-gray-3 shrink-0">나이</dt>
    <dd className="text-sm font-medium dark:text-gray-1 w-[80%] break-words text-end">
      {age ? `${age} 세` : '-'}
    </dd>
  </div>
  {/* 성별, 번호, 이메일, 의원실 동일 패턴으로 변환 */}
</dl>

// homepage 링크:
// Before: <Link href={homepage}>
// After:
{homepage ? (
  <Button
    asChild
    variant="outline"
    className="w-[135px] h-8 text-gray-2 mx-auto border-gray-1 dark:border-gray-2 dark:text-gray-3 rounded-full">
    <Link href={homepage} target="_blank" rel="noopener noreferrer" aria-label="홈페이지 방문 (새 창에서 열림)">
      홈페이지 방문
      <IconWeb />
    </Link>
  </Button>
) : null}
```

- [ ] **Step 4: 타입체크**

```bash
npm run typecheck
```

- [ ] **Step 5: 커밋**

```bash
git add app/common/utils/decodeHtmlEntities.ts app/common/utils/index.ts app/congressman/components/CongressmanDetail.tsx
git commit -m "refactor: CongressmanDetail HTML entity 안전 처리, homepage 검증, 접근성 개선"
```

---

### Task 5: PartyLogo 내부 정리

**Files:**

- Modify: `app/congressman/components/PartyLogo.tsx`

- [ ] **Step 1: PartyLogo 수정**

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { PartyLogoReplacement } from '@/app/party/components';

export default function PartyLogo({
  party_id,
  party_name,
  party_image_url,
}: {
  party_id: number;
  party_name: string;
  party_image_url: string;
}) {
  if (!party_image_url) {
    return <PartyLogoReplacement partyName={party_name} circle={false} />;
  }

  const darkImageUrl = party_image_url.replace('wide', 'dark');

  return (
    <Link href={`/party/${party_id}`}>
      <Image
        className="dark:hidden object-contain w-[64px] h-[30px]"
        src={process.env.NEXT_PUBLIC_IMAGE_URL + party_image_url}
        width={64}
        height={30}
        alt={`${party_name} 로고`}
      />
      <Image
        className="hidden dark:block object-contain w-[64px] h-[30px]"
        src={process.env.NEXT_PUBLIC_IMAGE_URL + darkImageUrl}
        width={64}
        height={30}
        alt={`${party_name} 로고`}
      />
    </Link>
  );
}
```

변경:

- `!== null` -> falsy 체크 (`!party_image_url`)로 빈 문자열도 처리
- fallback 시 빈 href `<Link>` 제거 (PartyLogoReplacement만 렌더링)
- 다크모드 URL을 `darkImageUrl` 변수로 추출

- [ ] **Step 2: 타입체크**

```bash
npm run typecheck
```

- [ ] **Step 3: 커밋**

```bash
git add app/congressman/components/PartyLogo.tsx
git commit -m "fix: PartyLogo falsy guard 강화, 빈 href Link 제거"
```

---

### Task 6: page.tsx — Suspense + ErrorBoundary + Skeleton

**Files:**

- Create: `app/congressman/components/CongressmanDetailSkeleton.tsx`
- Modify: `app/congressman/[id]/page.tsx`

- [ ] **Step 1: CongressmanDetailSkeleton 생성**

```tsx
// app/congressman/components/CongressmanDetailSkeleton.tsx
export default function CongressmanDetailSkeleton() {
  return (
    <div className="xl:flex xl:items-start xl:justify-center xl:gap-10">
      {/* Profile card skeleton */}
      <div className="mx-5 md:mx-auto xl:mx-0 mt-5 py-4 px-7 border-1.5 flex flex-col items-center gap-5 mb-4 dark:bg-dark-b xl:h-min md:w-[430px] xl:w-[320px] shrink-0 shadow-md rounded-md">
        <div className="w-[64px] h-[30px] bg-gray-1 dark:bg-dark-l rounded animate-pulse" />
        <div className="flex gap-5 justify-between w-full">
          <div className="w-[100px] h-[100px] rounded-full bg-gray-1 dark:bg-dark-l animate-pulse" />
          <div className="flex flex-col justify-between py-3 w-[65%] items-end gap-2">
            <div className="h-7 w-32 bg-gray-1 dark:bg-dark-l rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-1 dark:bg-dark-l rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-1 dark:bg-dark-l rounded animate-pulse" />
          </div>
        </div>
        <div className="w-full h-px bg-gray-1 dark:bg-dark-l" />
        <div className="flex justify-between w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 basis-1/3">
              <div className="h-7 w-10 bg-gray-1 dark:bg-dark-l rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-1 dark:bg-dark-l rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="w-full h-12 bg-gray-1 dark:bg-dark-l rounded-full animate-pulse" />
      </div>

      {/* Bill list skeleton */}
      <div className="flex-1 max-w-[640px]">
        <div className="h-10 w-full bg-gray-1 dark:bg-dark-l rounded animate-pulse mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full bg-gray-1 dark:bg-dark-l rounded animate-pulse mb-2" />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: page.tsx에 Suspense + ErrorBoundary 추가**

```tsx
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { SubHeader } from '@/app/common/components/Layout';
import { getMetadata } from '@/app/common/utils';
import { Metadata } from 'next';
import { getCongressmanDetail } from '@/app/congressman/services/apis';
import { congressmanKeys } from '@/app/congressman/services/query-keys';
import { CongressmanContainer } from '@/app/congressman/components';
import CongressmanDetailSkeleton from '@/app/congressman/components/CongressmanDetailSkeleton';

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> => {
  const { id } = await params;
  const queryClient = new QueryClient();
  const detail = await queryClient.fetchQuery({
    queryKey: congressmanKeys.detail(id),
    queryFn: () => getCongressmanDetail(id),
  });

  return getMetadata({
    title: `${detail.congressman_name} 의원`,
    description: `${detail.party_name} ${detail.congressman_name} 의원의 상세 프로필 페이지, ${detail.district} ${detail.elected}, ${detail.commits}`,
    asPath: `/congressman/${id}`,
  });
};

export default async function Congressman({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: congressmanKeys.detail(id),
    queryFn: () => getCongressmanDetail(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="flex flex-col gap-10">
        <SubHeader title="의원 프로필" />
        <ErrorBoundary fallback={<p className="text-center py-10 text-gray-2">의원 정보를 불러올 수 없습니다.</p>}>
          <Suspense fallback={<CongressmanDetailSkeleton />}>
            <CongressmanContainer id={id} />
          </Suspense>
        </ErrorBoundary>
      </section>
    </HydrationBoundary>
  );
}
```

- [ ] **Step 3: 타입체크**

```bash
npm run typecheck
```

- [ ] **Step 4: 커밋**

```bash
git add app/congressman/components/CongressmanDetailSkeleton.tsx app/congressman/[id]/page.tsx
git commit -m "feat: congressman 페이지 Suspense/ErrorBoundary 추가, 스켈레톤 UI 구현"
```

---

### Task 7: 배럴 파일 정리

**Files:**

- Modify: `app/congressman/components/index.tsx`

- [ ] **Step 1: 외부 사용 컴포넌트만 export**

```tsx
export { default as CongressmanContainer } from './CongressmanContainer';
```

`BillContainer`, `CongressmanDetail`, `FollowBoard`, `PartyLogo`는 CongressmanContainer 내부에서만 사용되므로 배럴에서 제거.

- [ ] **Step 2: 다른 모듈에서 import 확인**

```bash
grep -r "from '@/app/congressman/components'" --include="*.tsx" --include="*.ts" app/
```

`CongressmanContainer`만 외부에서 import되는지 확인. 만약 다른 컴포넌트가 외부에서 사용되면 해당 export 유지.

- [ ] **Step 3: 타입체크**

```bash
npm run typecheck
```

- [ ] **Step 4: 커밋**

```bash
git add app/congressman/components/index.tsx
git commit -m "refactor: congressman 배럴 파일 정리, 내부 전용 컴포넌트 export 제거"
```

---

### Task 8: 테스트 — API 함수 + FollowBoard

**Files:**

- Create: `tests/congressman/services/apis.test.ts`
- Create: `tests/congressman/components/FollowBoard.test.tsx`

- [ ] **Step 1: MSW 핸들러 추가**

`tests/msw/handlers.ts`에 congressman API 핸들러 추가:

```ts
import { http, HttpResponse } from 'msw';

export const congressmanHandlers = [
  http.get('*/congressman/detail', ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('congressman_id');
    return HttpResponse.json({
      status: 200,
      code: 'SUCCESS',
      message: '',
      data: {
        congressman_id: id ?? '1',
        congressman_name: '홍길동',
        party_id: 1,
        party_name: '테스트당',
        party_image_url: '/images/test.png',
        elect_sort: '지역구',
        district: '서울 강남구',
        commits: '22대',
        elected: '초선',
        homepage: 'https://example.com',
        represent_count: 5,
        public_count: 10,
        congressman_image_url: '/images/congressman.png',
        like_checked: false,
        office: '의원회관 101호',
        email: 'test@assembly.go.kr',
        age: 50,
        gender: '남',
        follow_count: 100,
        brief_history: '서울대학교 졸업&middot;변호사',
        telephone: '02-1234-5678',
      },
    });
  }),

  http.patch('*/congressman/user/like', () => {
    return HttpResponse.json({
      status: 200,
      code: 'SUCCESS',
      message: '',
      data: { congressman_id: '1', like_checked: true },
    });
  }),

  http.get('*/congressman/bill_info', () => {
    return HttpResponse.json({
      status: 200,
      code: 'SUCCESS',
      message: '',
      data: {
        bill_list: [],
        pagination_response: { page_number: 0, last_page: true },
      },
    });
  }),
];
```

별도 파일 `tests/msw/congressman-handlers.ts`로 생성하고 `handlers.ts`에서 import + spread:

```ts
// tests/msw/handlers.ts
import { congressmanHandlers } from './congressman-handlers';

export const handlers = [...congressmanHandlers];
```

**Note:** API 함수 테스트가 동작하려면 `apiClient`의 Axios 인터셉터가 활성화되어야 하며, `NEXT_PUBLIC_URL` 환경변수가 필요하다. `.env.test` 파일에 `NEXT_PUBLIC_URL=http://localhost:3000`을 설정하거나, vitest.config.ts의 `define` 옵션으로 주입한다.

- [ ] **Step 2: API 함수 테스트 작성**

```ts
// tests/congressman/services/apis.test.ts
import { describe, it, expect } from 'vitest';
import { getCongressmanDetail, patchCongressmanFollow, getBillByCongressman } from '@/app/congressman/services/apis';

describe('congressman API 함수', () => {
  describe('getCongressmanDetail', () => {
    it('의원 상세 정보를 반환하고 Zod 스키마를 통과한다', async () => {
      const result = await getCongressmanDetail('1');
      expect(result.congressman_id).toBe('1');
      expect(result.congressman_name).toBe('홍길동');
      expect(result.party_name).toBe('테스트당');
    });
  });

  describe('patchCongressmanFollow', () => {
    it('팔로우 토글 결과를 반환한다', async () => {
      const result = await patchCongressmanFollow('1', true);
      expect(result.congressman_id).toBe('1');
      expect(result.like_checked).toBe(true);
    });
  });

  describe('getBillByCongressman', () => {
    it('법안 목록을 반환한다', async () => {
      const result = await getBillByCongressman(0, '1', 'represent_proposer');
      expect(result.bill_list).toEqual([]);
      expect(result.pagination_response.last_page).toBe(true);
    });
  });
});
```

- [ ] **Step 3: 테스트 실행**

```bash
npm test -- tests/congressman/services/apis.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 4: FollowBoard 테스트 작성**

```tsx
// tests/congressman/components/FollowBoard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FollowBoard from '@/app/congressman/components/FollowBoard';

// Mock dependencies
vi.mock('@/app/auth/hooks', () => ({
  useAuthGuard: () => ({ requireLogin: () => true }),
}));

vi.mock('@/app/common/store', () => ({
  useSnackbarStore: () => vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('FollowBoard', () => {
  const defaultProps = {
    id: '1',
    likeChecked: false,
    follow_count: 100,
    represent_count: 5,
    public_count: 10,
  };

  it('팔로우 클릭 시 UI가 즉시 갱신된다', () => {
    render(<FollowBoard {...defaultProps} />, { wrapper: createWrapper() });

    const button = screen.getByRole('button', { name: /팔로우 하기/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('101')).toBeInTheDocument(); // followCount + 1
  });

  it('비로그인 시 팔로우가 차단된다', async () => {
    // useAuthGuard mock을 비로그인으로 재설정
    const { useAuthGuard } = await import('@/app/auth/hooks');
    vi.mocked(useAuthGuard).mockReturnValue({ requireLogin: () => false });

    render(<FollowBoard {...defaultProps} />, { wrapper: createWrapper() });

    const button = screen.getByRole('button', { name: /팔로우 하기/i });
    fireEvent.click(button);

    // 비로그인이면 상태가 변경되지 않아야 함
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('100')).toBeInTheDocument(); // followCount 변경 없음
  });

  it('시맨틱 dl/dt/dd 마크업이 적용된다', () => {
    render(<FollowBoard {...defaultProps} />, { wrapper: createWrapper() });

    expect(screen.getByText('팔로워')).toBeInTheDocument();
    expect(screen.getByText('대표발의법안')).toBeInTheDocument();
    expect(screen.getByText('공동발의법안')).toBeInTheDocument();
  });
});
```

Note: 실제 mock 구조는 프로젝트의 auth/store 구조에 맞춰 조정 필요. 위는 기본 골격.

- [ ] **Step 5: 테스트 실행**

```bash
npm test -- tests/congressman/
```

Expected: 모든 테스트 PASS

- [ ] **Step 6: 커밋**

```bash
git add tests/congressman/ tests/msw/
git commit -m "test: congressman API 함수 + FollowBoard 테스트 추가"
```

---

### Task 9: 최종 검증 + PartyLogo common 추출 판단

- [ ] **Step 1: 전체 타입체크 + 린트**

```bash
npm run typecheck && npm run lint
```

- [ ] **Step 2: 전체 테스트**

```bash
npm test
```

- [ ] **Step 3: PartyLogo common 추출 여부 확인**

```bash
grep -r "from '@/app/congressman/components/PartyLogo\|from '@/app/congressman/components'" --include="*.tsx" app/ | grep -v "app/congressman/"
```

다른 에이전트가 이미 common PartyLogo를 추출했는지 확인:

```bash
ls app/common/components/PartyLogo.tsx 2>/dev/null && echo "EXISTS" || echo "NOT_EXISTS"
```

- `EXISTS`: congressman의 PartyLogo를 삭제하고 common 것을 import
- `NOT_EXISTS`: 현재 상태 유지 (다른 에이전트 또는 추후 작업)

- [ ] **Step 4: 최종 커밋 (필요시)**

PartyLogo 변경이 있었을 경우에만:

```bash
git add app/congressman/components/PartyLogo.tsx app/congressman/components/CongressmanDetail.tsx
git commit -m "refactor: congressman PartyLogo를 common 공유 컴포넌트로 전환"
```

- [ ] **Step 5: 빌드 확인**

```bash
npm run build
```

Expected: 빌드 성공

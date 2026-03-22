# Party 도메인 리팩토링 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** party 도메인의 서비스 레이어, 상태 관리, 타입 안전성, 컴포넌트 구조를 bill/timeline 리팩토링 수준으로 개선

**Architecture:** 서비스 레이어 3파일 분리 → 상수/타입 정리 → 파생 상태 제거 + optimistic update → PartyLogo 통합 → API 전환 → 에러 바운더리 순서로 바텀업 진행. 각 단계가 다음 단계의 기반이 됨.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, TanStack React Query v5, Zod, react-error-boundary, shadcn/ui, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-22-party-domain-refactor-design.md`

---

## 파일 구조

### 생성
- `app/party/services/query-keys.ts` — 쿼리 키 팩토리
- `app/party/services/queries.ts` — React Query 훅
- `app/party/components/PartyErrorFallback.tsx` — 에러 fallback UI
- `app/party/components/PartySkeleton.tsx` — 로딩 스켈레톤
- `app/common/components/PartyLogo.tsx` — 통합 PartyLogo
- `app/common/utils/getPartyConstant.ts` — 타입 안전 상수 조회 유틸

### 변경
- `app/party/services/index.ts` → `app/party/services/apis.ts` (rename)
- `app/party/hooks/index.ts` — re-export만 유지
- `app/party/components/BillContainer.tsx` — 파생 상태 → useMemo
- `app/party/components/FollowBoard.tsx` — optimistic update with rollback
- `app/party/components/PartyDetail.tsx` — API 전환, 타입 단언 제거
- `app/party/components/PartyCongressmanList.tsx` — useCallback 수정
- `app/party/components/PartyContainer.tsx` — props 타입 변경
- `app/party/components/index.tsx` — barrel export 정리
- `app/party/constants/index.ts` — 간부 상수 제거, PARTY_COLOR 제거
- `app/party/[id]/page.tsx` — ErrorBoundary, Suspense, Number 검증, import 경로
- `app/common/constants/theme.ts` — PARTY_COLOR 통합
- `app/common/utils/index.ts` — getPartyConstant export 추가

### 삭제
- `app/party/components/PartyLogo.tsx`
- `app/party/components/PartyLogoReplacement.tsx`

### 외부 import 업데이트
- `app/search/components/SearchParty.tsx` (inline Image + PartyLogoReplacement → 통합 PartyLogo)
- `app/congressman/components/PartyLogo.tsx` (PartyLogoReplacement import → 통합 PartyLogo)
- `app/following/components/CongressmanItem.tsx`
- `app/bill/components/BillProposerSection.tsx`
- `app/bill/components/AnotherBill.tsx`
- `app/user/components/BillBookmarked.tsx`
- `app/bill/components/HalfDonutChart.tsx` (COLOR → PARTY_COLOR)
- `app/common/utils/sortByParty.ts` (COLOR → PARTY_COLOR, 필요 시)

---

## Task 1: 서비스 레이어 3파일 분리

**Files:**
- Create: `app/party/services/query-keys.ts`
- Create: `app/party/services/queries.ts`
- Rename: `app/party/services/index.ts` → `app/party/services/apis.ts`
- Modify: `app/party/hooks/index.ts`
- Modify: `app/party/[id]/page.tsx` (import 경로만)

- [ ] **Step 1: query-keys.ts 생성**

```typescript
// app/party/services/query-keys.ts
export const partyKeys = {
  root: () => ['party'] as const,
  detail: (partyId: number) => [...partyKeys.root(), 'detail', partyId] as const,
  billFeed: (partyId: number, type: string) => [...partyKeys.root(), 'billFeed', partyId, type] as const,
  congressman: (partyId: number) => [...partyKeys.root(), 'congressman', partyId] as const,
  executive: (partyId: number) => [...partyKeys.root(), 'executive', partyId] as const,
};
```

- [ ] **Step 2: services/index.ts → services/apis.ts rename**

```bash
git mv app/party/services/index.ts app/party/services/apis.ts
```

- [ ] **Step 3: queries.ts 생성**

기존 `hooks/index.ts`의 React Query 훅들을 이동. `useMutatePartyFollow`는 기존 로직 유지 (optimistic update는 Task 4에서 적용). `useGetPartyExecutive` 추가.

```typescript
// app/party/services/queries.ts
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
```

- [ ] **Step 4: hooks/index.ts를 re-export 전용으로 변경**

```typescript
// app/party/hooks/index.ts
'use client';

export {
  useInfinitePartyBills,
  useGetPartyDetail,
  useGetPartyCongressman,
  useGetPartyExecutive,
  useMutatePartyFollow,
} from '@/app/party/services/queries';

export { partyKeys } from '@/app/party/services/query-keys';
```

- [ ] **Step 5: page.tsx import 경로 변경**

`app/party/[id]/page.tsx`에서:
```typescript
// Before
import { getPartyDetail } from '@/app/party/services';
import { partyKeys } from '@/app/party/hooks';

// After
import { getPartyDetail } from '@/app/party/services/apis';
import { partyKeys } from '@/app/party/services/query-keys';
```

- [ ] **Step 6: 빌드 확인**

```bash
npm run typecheck
```
Expected: 에러 없음

- [ ] **Step 7: 커밋**

```bash
git add app/party/services/ app/party/hooks/index.ts app/party/\[id\]/page.tsx
git commit -m "refactor: party 서비스 레이어 3파일 분리 (query-keys, apis, queries)"
```

---

## Task 2: 타입/상수 정리

**Files:**
- Create: `app/common/utils/getPartyConstant.ts`
- Modify: `app/common/utils/index.ts`
- Modify: `app/common/constants/theme.ts`
- Modify: `app/party/constants/index.ts`
- Modify: `app/party/[id]/page.tsx`
- Modify: `app/bill/components/HalfDonutChart.tsx` (COLOR → PARTY_COLOR)
- Modify: `app/common/utils/sortByParty.ts` (COLOR → PARTY_COLOR, 필요 시)

- [ ] **Step 1: getPartyConstant 유틸 생성**

```typescript
// app/common/utils/getPartyConstant.ts

/**
 * 타입 안전한 정당 상수 조회.
 * `as keyof typeof` 단언 없이 런타임 키 검증 후 값을 반환한다.
 */
export function getPartyConstant<T extends Record<string, string>>(
  map: T,
  key: string,
  fallback = '',
): string {
  return key in map ? map[key as keyof T] : fallback;
}
```

- [ ] **Step 2: app/common/utils/index.ts에 export 추가**

```typescript
export * from './getPartyConstant';
```

- [ ] **Step 3: PARTY_COLOR를 common/constants/theme.ts로 통합**

`app/common/constants/theme.ts`의 `COLOR`를 `PARTY_COLOR`로 교체:

```typescript
// app/common/constants/theme.ts

export const PARTY_COLOR = {
  더불어민주당: '#152484',
  국민의힘: '#E61E2B',
  더불어민주연합: '#152484',
  국민의미래: '#E4002B',
  녹새정의당: '#007C36',
  새로운미래: '#45BABD',
  개혁신당: '#FF7210',
  자유통일당: '#0958A7',
  진보당: '#D6001C',
  조국혁신당: '#0073CF',
  무소속: '#797C85',
} as const;

export const PARTY_NAME_MAP = {
  더불어민주당: '더불어민주당',
  국민의힘: '국민의힘',
  더불어민주연합: '더불어민주연합',
  국민의미래: '국민의미래',
  녹새정의당: '녹새정의당',
  새로운미래: '새로운미래',
  개혁신당: '개혁신당',
  자유통일당: '자유통일당',
  진보당: '진보당',
  조국혁신당: '조국혁신당',
  무소속: '무소속',
} as const;
```

- [ ] **Step 4: 기존 COLOR 소비자 import 업데이트**

`COLOR`를 import하는 파일들을 검색하여 `PARTY_COLOR`로 변경. `app/common/utils/sortByParty.ts` 등에서 사용 중일 수 있음.

```bash
# COLOR 소비자 검색
grep -r "import.*COLOR.*from.*theme" app/ --include="*.ts" --include="*.tsx"
```

- [ ] **Step 5: party/constants/index.ts에서 간부 상수 + PARTY_COLOR 제거**

제거 대상:
- `PARTY_LEADER`
- `PARTY_FLOOR_LEADER`
- `PARTY_SECRETARY_GENERAL`
- `PARTY_POLISY_COMMITTEE_CHAIRMAN`
- `PARTY_COLOR`

유지 대상:
- `PARTY_NAME_EN`
- `PARTY_NAME_KO`
- `PARTY_POSITION`

- [ ] **Step 6: page.tsx에 Number 유효성 검증 추가**

```typescript
// app/party/[id]/page.tsx
import { notFound } from 'next/navigation';

// generateMetadata 내부
const partyId = Number(id);
if (Number.isNaN(partyId)) notFound();

// Party 컴포넌트 내부도 동일
const partyId = Number(id);
if (Number.isNaN(partyId)) notFound();
```

- [ ] **Step 7: page.tsx generateMetadata에서 타입 단언 제거**

```typescript
// Before
PARTY_POSITION[detail.party_name as keyof typeof PARTY_NAME_KO]

// After
import { getPartyConstant } from '@/app/common/utils';
getPartyConstant(PARTY_POSITION, detail.party_name)
```

- [ ] **Step 8: 빌드 확인**

```bash
npm run typecheck
```

- [ ] **Step 9: 커밋**

```bash
git add app/common/utils/getPartyConstant.ts app/common/utils/index.ts app/common/constants/theme.ts app/party/constants/index.ts app/party/\[id\]/page.tsx
git commit -m "refactor: PARTY_COLOR common 통합, 간부 상수 제거, getPartyConstant 유틸 추가"
```

---

## Task 3: BillContainer 파생 상태 제거

**Files:**
- Modify: `app/party/components/BillContainer.tsx`

- [ ] **Step 1: useState + useEffect → useMemo 변환**

```typescript
// app/party/components/BillContainer.tsx
'use client';

import { useMemo } from 'react';
import { useIntersect, useTabType } from '@/app/common/hooks';
import { BILL_TAB } from '@/app/bill/constants';
import type { ValueOf } from '@/app/common/types';
import { BillList, BillTab } from '@/app/bill/components';
import { useInfinitePartyBills } from '@/app/party/hooks';

export default function BillContainer({ id }: { id: number }) {
  const [billType, setBillType] = useTabType<typeof BILL_TAB>('represent_proposer');
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfinitePartyBills(
    id,
    billType as ValueOf<typeof BILL_TAB>,
  );

  const bills = useMemo(
    () => data?.pages.flatMap(({ bill_list }) => bill_list) ?? [],
    [data],
  );

  const fetchRef = useIntersect(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  });

  return (
    <section>
      <BillTab type={billType as ValueOf<typeof BILL_TAB>} clickHandler={setBillType as (value: string) => void} />
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
- `useState(bills)` + 2개 `useEffect` → `useMemo` 1줄
- `refetch()` 수동 호출 제거
- props `id` 유지 (Task 7에서 PartyContainer와 함께 `partyId`로 일괄 변경)

- [ ] **Step 2: 빌드 확인**

```bash
npm run typecheck
```

- [ ] **Step 3: 커밋**

```bash
git add app/party/components/BillContainer.tsx
git commit -m "refactor: BillContainer 파생 상태 안티패턴 제거, useMemo 직접 도출"
```

---

## Task 4: FollowBoard optimistic update with rollback

**Files:**
- Modify: `app/party/services/queries.ts` (useMutatePartyFollow)
- Modify: `app/party/components/FollowBoard.tsx`

- [ ] **Step 1: useMutatePartyFollow에 optimistic update 적용**

`app/party/services/queries.ts`의 `useMutatePartyFollow`를 교체:

```typescript
export const useMutatePartyFollow = (partyId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checked: boolean) => patchPartyFollow(partyId, checked),
    onMutate: async (checked) => {
      await qc.cancelQueries({ queryKey: partyKeys.detail(partyId) });
      const previous = qc.getQueryData<PartyDetail>(partyKeys.detail(partyId));
      qc.setQueryData<PartyDetail>(partyKeys.detail(partyId), (old) => {
        if (!old) return old;
        return {
          ...old,
          followed: checked,
          follow_count: checked ? old.follow_count + 1 : old.follow_count - 1,
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(partyKeys.detail(partyId), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: partyKeys.detail(partyId) });
    },
  });
};
```

- [ ] **Step 2: FollowBoard 컴포넌트 리팩토링**

```typescript
// app/party/components/FollowBoard.tsx
'use client';

import { useCallback } from 'react';
import { Button } from '@/app/common/components/ui/button';
import { useSnackbarStore } from '@/app/common/store';
import { IconCheck, IconPlus } from '@/public/svgs';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import { useAuthGuard } from '@/app/auth/hooks';
import { useGetPartyDetail, useMutatePartyFollow } from '@/app/party/hooks';

export default function FollowBoard({ partyId }: { partyId: number }) {
  const { data: party } = useGetPartyDetail(partyId);
  const { followed, follow_count, representative_bill_count, public_bill_count } = party;
  const mutationFollow = useMutatePartyFollow(partyId);
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const { requireLogin } = useAuthGuard();

  const onClickFollow = useCallback(() => {
    if (!requireLogin()) return;
    const nextFollowed = !followed;
    setSnackbar({
      show: true,
      type: nextFollowed ? SNACKBAR_TYPE.SUCCESS : SNACKBAR_TYPE.CANCEL,
      message: nextFollowed ? '해당 정당을 팔로우했습니다.' : '해당 정당의 팔로우를 취소했습니다.',
      duration: 3000,
    });
    mutationFollow.mutate(nextFollowed);
  }, [followed, setSnackbar, requireLogin, mutationFollow]);

  return (
    <section className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-10">
        <div className="flex flex-col items-center gap-[10px]">
          <p className="text-2xl font-semibold">{follow_count}</p>
          <p className="text-sm font-medium text-gray-2 dark:text-gray-3">팔로워</p>
        </div>
        <div className="flex flex-col items-center gap-[10px]">
          <p className="text-2xl font-semibold"> {representative_bill_count}</p>
          <p className="text-sm font-medium text-gray-2 dark:text-gray-3">대표발의법안</p>
        </div>
        <div className="flex flex-col items-center gap-[10px]">
          <p className="text-2xl font-semibold"> {public_bill_count}</p>
          <p className="text-sm font-medium text-gray-2 dark:text-gray-3">공동발의법안</p>
        </div>
      </div>

      <Button
        onClick={onClickFollow}
        className={`w-full h-12 text-lg font-medium flex justify-between px-6 rounded-full ${followed ? 'bg-gray-1 text-gray-3' : 'bg-primary-3 text-white dark:bg-gray-4 dark:text-gray-2'} `}>
        {followed ? '팔로우 취소' : '팔로우'}
        {followed ? <IconCheck /> : <IconPlus />}
      </Button>
    </section>
  );
}
```

변경 요약:
- `useState(followed)`, `useState(follow_count)` 제거
- `useGetPartyDetail(partyId)`에서 직접 읽기
- props: `partyId: number`만 받음
- `useAuthGuard` + `requireLogin()` 유지
- 스낵바 알림 컴포넌트 핸들러에 유지

- [ ] **Step 3: PartyDetail에서 FollowBoard props 변경**

```typescript
// app/party/components/PartyDetail.tsx에서
// Before
<FollowBoard
  id={partyId}
  followed={followed}
  follow_count={follow_count}
  representative_bill_count={representative_bill_count}
  public_bill_count={public_bill_count}
/>

// After
<FollowBoard partyId={partyId} />
```

- [ ] **Step 4: 빌드 확인**

```bash
npm run typecheck
```

- [ ] **Step 5: 커밋**

```bash
git add app/party/services/queries.ts app/party/components/FollowBoard.tsx app/party/components/PartyDetail.tsx
git commit -m "refactor: FollowBoard optimistic update with rollback, React Query 캐시 기반 상태 관리"
```

---

## Task 5: PartyLogo 통합 + common 이동

**Files:**
- Create: `app/common/components/PartyLogo.tsx`
- Delete: `app/party/components/PartyLogo.tsx`
- Delete: `app/party/components/PartyLogoReplacement.tsx`
- Modify: `app/party/components/PartyDetail.tsx`
- Modify: `app/party/components/index.tsx`
- Modify: `app/search/components/SearchParty.tsx` (inline Image + PartyLogoReplacement → 통합 PartyLogo)
- Modify: `app/congressman/components/PartyLogo.tsx` (PartyLogoReplacement → 통합 PartyLogo)
- Modify: `app/following/components/CongressmanItem.tsx`
- Modify: `app/bill/components/BillProposerSection.tsx`
- Modify: `app/bill/components/AnotherBill.tsx`
- Modify: `app/user/components/BillBookmarked.tsx`

- [ ] **Step 1: 통합 PartyLogo 컴포넌트 생성**

`variant` prop으로 기존 `circle` prop의 두 가지 모드를 대체:
- `'badge'` (default): 원형 컨테이너 안에 이미지 또는 텍스트 (기존 PartyLogo + `circle={true}` PartyLogoReplacement)
- `'text'`: 텍스트만 표시, 컨테이너 없음 (기존 `circle={false}` PartyLogoReplacement)

```typescript
// app/common/components/PartyLogo.tsx
import Image from 'next/image';
import { cn } from '@/app/common/lib/utils';

const SIZE_CONFIG = {
  sm: { container: 'w-[54px] h-[54px]', image: 'w-[36px] h-[16px]', imgWidth: 72, imgHeight: 32, textClass: 'text-[10px]' },
  md: { container: 'w-[80px] h-[80px]', image: 'w-[60px] h-[27px]', imgWidth: 120, imgHeight: 54, textClass: 'text-xs' },
  lg: { container: 'w-[130px] h-[130px]', image: 'w-[100px] h-[45px]', imgWidth: 200, imgHeight: 90, textClass: 'text-sm' },
} as const;

interface PartyLogoProps {
  partyName: string;
  partyImgUrl?: string;
  size?: keyof typeof SIZE_CONFIG;
  variant?: 'badge' | 'text';
  className?: string;
}

export default function PartyLogo({ partyName, partyImgUrl, size = 'lg', variant = 'badge', className }: PartyLogoProps) {
  const hasImage = partyImgUrl && partyImgUrl.length > 0;

  // variant='text': 이미지 없을 때 텍스트만 표시 (기존 circle={false})
  if (variant === 'text' && !hasImage) {
    return (
      <div className={cn('text-lg font-semibold text-center text-gray-3', className)}>
        {partyName}
      </div>
    );
  }

  const config = SIZE_CONFIG[size];

  // 이미지 없을 때 원형 텍스트 fallback (기존 circle={true})
  if (!hasImage) {
    return (
      <div
        className={cn(
          'rounded-full border flex justify-center items-center overflow-hidden text-center font-semibold text-gray-3 dark:border-dark-l dark:text-white',
          config.container,
          config.textClass,
          className,
        )}>
        {partyName}
      </div>
    );
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}${partyImgUrl}`;
  const darkImageUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}${partyImgUrl.replace('wide', 'dark')}`;

  // variant='text': 이미지 있을 때 컨테이너 없이 이미지만
  if (variant === 'text') {
    return (
      <div className={className}>
        <Image
          className={cn('dark:hidden object-contain', config.image)}
          src={imageUrl}
          width={config.imgWidth}
          height={config.imgHeight}
          alt={`${partyName} 로고 이미지`}
        />
        <Image
          className={cn('hidden dark:block object-contain', config.image)}
          src={darkImageUrl}
          width={config.imgWidth}
          height={config.imgHeight}
          alt={`${partyName} 로고 이미지`}
        />
      </div>
    );
  }

  // variant='badge' (default): 원형 컨테이너 + 이미지
  return (
    <div
      className={cn(
        'shadow-lg rounded-full flex justify-center items-center border',
        config.container,
        className,
      )}>
      <Image
        className={cn('dark:hidden object-contain', config.image)}
        src={imageUrl}
        width={config.imgWidth}
        height={config.imgHeight}
        alt={`${partyName} 로고 이미지`}
      />
      <Image
        className={cn('hidden dark:block object-contain', config.image)}
        src={darkImageUrl}
        width={config.imgWidth}
        height={config.imgHeight}
        alt={`${partyName} 로고 이미지`}
      />
    </div>
  );
}
```

- [ ] **Step 2: 기존 PartyLogo, PartyLogoReplacement 삭제**

```bash
rm app/party/components/PartyLogo.tsx app/party/components/PartyLogoReplacement.tsx
```

- [ ] **Step 3: party/components/index.tsx barrel export 정리**

`PartyLogo`, `PartyLogoReplacement` export 제거.

- [ ] **Step 4: PartyDetail.tsx import 변경**

```typescript
// Before
import PartyLogo from './PartyLogo';

// After
import PartyLogo from '@/app/common/components/PartyLogo';

// JSX — props 이름 변경
<PartyLogo partyName={party_name} partyImgUrl={party_img_url} size="lg" />
```

- [ ] **Step 5: 외부 소비자 import 업데이트**

각 파일을 읽고 현재 사용 패턴을 확인한 후 변경. `circle` prop → `variant` + `size` 매핑:
- `circle={true}` → `variant="badge" size="sm"` (또는 `size="sm"`, badge가 기본값)
- `circle={false}` → `variant="text"`

**`circle={true}` 소비자 (badge variant):**
```typescript
// app/search/components/SearchParty.tsx — circle={true} fallback + inline Image
// Before: inline Image 로직 + <PartyLogoReplacement partyName={name} circle />
// After: 전체를 <PartyLogo partyName={name} partyImgUrl={url} size="sm" /> 로 교체

// app/congressman/components/PartyLogo.tsx — Image + circle={false} fallback
// Before: inline Image + <PartyLogoReplacement partyName={name} circle={false} />
// After: <PartyLogo partyName={name} partyImgUrl={url} variant="text" size="md" />
// 주의: 이 파일은 Link 래퍼가 있으므로 Link는 유지하고 내부만 교체
```

**`circle={false}` 소비자 (text variant):**
```typescript
// Before (공통 패턴)
import { PartyLogoReplacement } from '@/app/party/components';
<PartyLogoReplacement partyName={name} circle={false} />

// After
import PartyLogo from '@/app/common/components/PartyLogo';
<PartyLogo partyName={name} variant="text" />
```

대상 파일:
- `app/following/components/CongressmanItem.tsx` — `circle={false}` → `variant="text"`
- `app/bill/components/BillProposerSection.tsx` — `circle={false}` → `variant="text"`
- `app/bill/components/AnotherBill.tsx` — `circle={false}` → `variant="text"`
- `app/user/components/BillBookmarked.tsx` — `circle={false}` → `variant="text"`

**주의:** 각 파일의 실제 사용 패턴을 읽고 확인한 후 변경할 것. `SearchParty.tsx`는 inline Image 로직이 있으므로 단순 import 변경이 아닌 전체 교체 필요.

- [ ] **Step 6: 빌드 확인**

```bash
npm run typecheck
```

- [ ] **Step 7: 커밋**

```bash
git add app/common/components/PartyLogo.tsx app/party/components/ app/search/components/SearchParty.tsx app/congressman/components/PartyLogo.tsx app/following/components/CongressmanItem.tsx app/bill/components/BillProposerSection.tsx app/bill/components/AnotherBill.tsx app/user/components/BillBookmarked.tsx
git commit -m "refactor: PartyLogo + PartyLogoReplacement 통합, common 이동"
```

---

## Task 6: PartyDetail 간부 정보 API 전환

**Files:**
- Modify: `app/party/components/PartyDetail.tsx`

- [ ] **Step 1: PartyDetail 리팩토링**

```typescript
// app/party/components/PartyDetail.tsx
'use client';

import { Button } from '@/app/common/components/ui/button';
import Link from 'next/link';
import { Card } from '@/app/common/components/ui/card';
import { Separator } from '@/app/common/components/ui/separator';
import { IconWeb } from '@/public/svgs';
import { PARTY_POSITION } from '@/app/party/constants';
import { useGetPartyDetail, useGetPartyExecutive } from '@/app/party/hooks';
import { getPartyConstant } from '@/app/common/utils';
import PartyLogo from '@/app/common/components/PartyLogo';
import FollowBoard from './FollowBoard';

export default function PartyDetail({ partyId }: { partyId: number }) {
  const { data: party } = useGetPartyDetail(partyId);
  const { data: executive } = useGetPartyExecutive(partyId);
  const {
    party_name,
    party_img_url,
    total_congressman_count,
    proportional_congressman_count,
    district_congressman_count,
  } = party;
  const whole_representative_count = proportional_congressman_count + district_congressman_count;
  const seatRatio = ((100 * whole_representative_count) / total_congressman_count).toFixed(2);

  return (
    <section className="flex flex-col items-center mx-5 xl:mx-0 mt-5 gap-7 xl:w-[320px]">
      <Card className="flex flex-col gap-5 items-center pt-1 w-full bg-transparent border-none dark:bg-dark-b lg:dark:bg-dark-pb">
        <PartyLogo partyName={party_name} partyImgUrl={party_img_url} size="lg" />

        <div className="flex flex-col gap-1 items-center">
          <h2 className="text-2xl font-semibold">{party_name}</h2>
          <h3 className="text-gray-3 dark:text-gray-2">{getPartyConstant(PARTY_POSITION, party_name)}</h3>
        </div>

        <div className="text-sm">
          <p>
            의석수: {whole_representative_count}석 / {total_congressman_count}석{' '}
            <span className="text-gray-2 dark:text-gray-3">{seatRatio}%</span>
          </p>
          <p>
            지역구 {district_congressman_count}석, 비례대표 {proportional_congressman_count}석
          </p>
        </div>
      </Card>

      <Separator className="dark:bg-dark-l" />

      <FollowBoard partyId={partyId} />

      <Separator className="dark:bg-dark-l" />

      <div className="grid grid-cols-4 justify-items-center w-full">
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-3 dark:text-gray-2">당대표</p>
          <p className="font-medium">{executive?.party_leader || '없음'}</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-3 dark:text-gray-2">원내대표</p>
          <p className="font-medium">{executive?.parliamentary_leader || '없음'}</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-3 dark:text-gray-2">사무총장</p>
          <p className="font-medium">{executive?.secretary_general || '없음'}</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-3 dark:text-gray-2">정책위의장</p>
          <p className="font-medium">{executive?.policy_committee_chairman || '없음'}</p>
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        className="w-[135px] h-8 bg-transparent text-gray-2 border-gray-1 dark:border-gray-3 rounded-full">
        <Link href={party.website_url}>
          웹사이트 방문
          <IconWeb />
        </Link>
      </Button>
    </section>
  );
}
```

변경 요약:
- 간부 상수 import 제거 → `useGetPartyExecutive` API 사용
- `as keyof typeof` 단언 → `getPartyConstant` 유틸
- `FollowBoard` props 단순화 (Task 4에서 완료)
- `PartyLogo` import 경로 변경 (Task 5에서 완료)

- [ ] **Step 2: 빌드 확인**

```bash
npm run typecheck
```

- [ ] **Step 3: 커밋**

```bash
git add app/party/components/PartyDetail.tsx
git commit -m "refactor: PartyDetail 간부 정보 API 전환, 타입 단언 제거"
```

---

## Task 7: 에러 바운더리 + 컴포넌트 정리

**Files:**
- Create: `app/party/components/PartyErrorFallback.tsx`
- Create: `app/party/components/PartySkeleton.tsx`
- Modify: `app/party/[id]/page.tsx`
- Modify: `app/party/components/PartyContainer.tsx`
- Modify: `app/party/components/PartyCongressmanList.tsx`
- Modify: `app/party/components/index.tsx`

- [ ] **Step 1: PartyErrorFallback 생성**

```typescript
// app/party/components/PartyErrorFallback.tsx
'use client';

import { Button } from '@/app/common/components/ui/button';
import type { FallbackProps } from 'react-error-boundary';

export default function PartyErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-lg font-semibold">정당 정보를 불러오지 못했습니다.</p>
      <p className="text-sm text-gray-2">{error.message}</p>
      <Button onClick={resetErrorBoundary} variant="outline">
        다시 시도
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: PartySkeleton 생성**

```typescript
// app/party/components/PartySkeleton.tsx
export default function PartySkeleton() {
  return (
    <div className="flex flex-col items-center mx-5 mt-5 gap-7 animate-pulse">
      <div className="w-[130px] h-[130px] rounded-full bg-gray-200 dark:bg-dark-l" />
      <div className="flex flex-col gap-2 items-center">
        <div className="w-32 h-6 bg-gray-200 dark:bg-dark-l rounded" />
        <div className="w-20 h-4 bg-gray-200 dark:bg-dark-l rounded" />
      </div>
      <div className="w-full h-px bg-gray-200 dark:bg-dark-l" />
      <div className="grid grid-cols-3 gap-10 w-full">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-12 h-6 bg-gray-200 dark:bg-dark-l rounded" />
            <div className="w-16 h-4 bg-gray-200 dark:bg-dark-l rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: PartyCongressmanList useCallback 수정**

```typescript
// app/party/components/PartyCongressmanList.tsx — 변경 부분만
// Before
const onClickButton = useCallback(() => {
  setIsOpened(!isOpened);
}, [isOpened]);

// After
const onClickButton = useCallback(() => {
  setIsOpened((prev) => !prev);
}, []);
```

또한 key 수정:
```typescript
// Before
key={`${congressman.congressman_id + index}`}

// After
key={congressman.congressman_id}
```

props 변경: `id` → `partyId`

- [ ] **Step 4: PartyContainer props 변경**

```typescript
// app/party/components/PartyContainer.tsx
'use client';

import PartyDetail from './PartyDetail';
import PartyCongressmanList from './PartyCongressmanList';
import BillContainer from './BillContainer';

export default function PartyContainer({ partyId }: { partyId: number }) {
  return (
    <div className="xl:flex xl:justify-center xl:gap-10">
      <div>
        <PartyDetail partyId={partyId} />
        <PartyCongressmanList partyId={partyId} />
      </div>
      <div className="">
        <BillContainer partyId={partyId} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: page.tsx에 ErrorBoundary + Suspense 적용**

```typescript
// app/party/[id]/page.tsx
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { notFound } from 'next/navigation';
import { SubHeader } from '@/app/common/components/Layout';
import { getMetadata, getPartyConstant } from '@/app/common/utils';
import { Metadata } from 'next';
import { PARTY_POSITION } from '@/app/party/constants';
import { getPartyDetail } from '@/app/party/services/apis';
import { partyKeys } from '@/app/party/services/query-keys';
import { PartyContainer } from '@/app/party/components';
import PartyErrorFallback from '@/app/party/components/PartyErrorFallback';
import PartySkeleton from '@/app/party/components/PartySkeleton';

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> => {
  const { id } = await params;
  const partyId = Number(id);
  if (Number.isNaN(partyId)) notFound();

  const queryClient = new QueryClient();
  const detail = await queryClient.fetchQuery({
    queryKey: partyKeys.detail(partyId),
    queryFn: () => getPartyDetail(partyId),
  });

  return getMetadata({
    title: `${detail.party_name}`,
    description: `${detail.party_name} 상세 페이지, ${getPartyConstant(PARTY_POSITION, detail.party_name)}, 지역구 ${detail.district_congressman_count} 석, 비례대표 ${detail.proportional_congressman_count} 석`,
    asPath: `/party/${id}`,
  });
};

export default async function Party({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partyId = Number(id);
  if (Number.isNaN(partyId)) notFound();

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: partyKeys.detail(partyId),
    queryFn: () => getPartyDetail(partyId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="flex flex-col gap-10">
        <SubHeader title="정당 프로필" />
        <ErrorBoundary FallbackComponent={PartyErrorFallback}>
          <Suspense fallback={<PartySkeleton />}>
            <PartyContainer partyId={partyId} />
          </Suspense>
        </ErrorBoundary>
      </section>
    </HydrationBoundary>
  );
}
```

- [ ] **Step 6: barrel export 정리**

```typescript
// app/party/components/index.tsx
import BillContainer from './BillContainer';
import FollowBoard from './FollowBoard';
import PartyCongressmanList from './PartyCongressmanList';
import PartyContainer from './PartyContainer';
import PartyDetail from './PartyDetail';
import PartyErrorFallback from './PartyErrorFallback';
import PartySkeleton from './PartySkeleton';

export {
  BillContainer,
  FollowBoard,
  PartyCongressmanList,
  PartyContainer,
  PartyDetail,
  PartyErrorFallback,
  PartySkeleton,
};
```

제거: `PartyCongressmanItem` (내부 전용), `PartyLogo`, `PartyLogoReplacement` (common으로 이동)

- [ ] **Step 7: 빌드 확인**

```bash
npm run typecheck
```

- [ ] **Step 8: 커밋**

```bash
git add app/party/components/ app/party/\[id\]/page.tsx
git commit -m "refactor: ErrorBoundary/Suspense 추가, PartyContainer props 정리, useCallback 수정"
```

---

## Task 8: 최종 검증

- [ ] **Step 1: 전체 타입 체크**

```bash
npm run typecheck
```

- [ ] **Step 2: 린트 체크**

```bash
npm run lint
```

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 4: 린트 자동 수정 (필요 시)**

```bash
npm run fix
```

- [ ] **Step 5: 최종 커밋 (fix 적용 시)**

```bash
git add -A
git commit -m "fix: party 도메인 리팩토링 린트/포맷 수정"
```

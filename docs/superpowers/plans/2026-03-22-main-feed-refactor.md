# 메인 피드 코드 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 메인 피드의 코드 품질, 타입 안전성, 보안, 안정성을 최신 React/Next.js 패턴에 맞게 개선한다.

**Architecture:** React Query의 데이터를 직접 파생 계산하여 불필요한 상태 동기화를 제거하고, 북마크 optimistic update를 정식 구현하며, Bill 컴포넌트를 책임 단위로 분리한다. XSS 취약점(unsafe innerHTML)을 제거하고, 중복 코드를 통합하며, ErrorBoundary를 추가한다.

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, TypeScript strict, Tailwind CSS, shadcn/ui

---

## File Structure

### 수정 대상 파일

| 파일                                    | 책임                   | 변경 내용                                                   |
| --------------------------------------- | ---------------------- | ----------------------------------------------------------- |
| `app/bill/components/Feed.tsx`          | 피드 오케스트레이터    | 로컬 상태 제거, React Query data 직접 사용, `as any` 제거   |
| `app/bill/components/Bill.tsx`          | 법안 카드 (268줄→분리) | unsafe innerHTML 제거, 로컬 북마크 상태 제거, 컴포넌트 분리 |
| `app/bill/components/BillList.tsx`      | 리스트 렌더러          | key 수정                                                    |
| `app/bill/components/FeedTab.tsx`       | 탭 전환                | props 타입 개선                                             |
| `app/bill/components/StageDropdown.tsx` | 필터 드롭다운          | Set→string 상태 단순화에 맞춰 props 타입 수정               |
| `app/bill/services/queries.ts`          | React Query 훅 (정본)  | 북마크 optimistic update 구현                               |
| `app/bill/hooks/index.ts`               | 훅 re-export           | 중복 코드 제거, services/queries.ts re-export로 변경        |
| `app/bill/services/query-keys.ts`       | 쿼리 키 팩토리 (정본)  | 변경 없음 (이미 올바름)                                     |
| `app/home/ClientHomeSection.tsx`        | 홈 레이아웃            | ErrorBoundary 추가                                          |
| `app/common/hooks/useIntersect.ts`      | Intersection Observer  | 콜백 안정성 개선 (ref 패턴)                                 |
| `app/common/hooks/useTabType.ts`        | 탭 상태 훅             | 반환 타입 튜플 명시                                         |

### 영향 받는 소비자 파일 (변경 없이 호환성 확인 필요)

| 파일                                            | Bill 사용 방식                                  | 확인 사항                            |
| ----------------------------------------------- | ----------------------------------------------- | ------------------------------------ |
| `app/bill/components/BillDetail.tsx`            | `<Bill {...data} detail viewCount={viewCount}>` | `detail`, `viewCount` prop 유지 필수 |
| `app/following/components/BillFollowedList.tsx` | `<Bill {...bill} />` (피드 모드)                | 기본 props 인터페이스 유지 필수      |

### 신규 생성 파일

| 파일                                          | 책임                                             |
| --------------------------------------------- | ------------------------------------------------ |
| `app/bill/components/BillCardFooter.tsx`      | 카드 하단 (스크랩, 조회수, 링크복사, 자세히보기) |
| `app/bill/components/BillProposerSection.tsx` | 발의자 아바타 및 정당 정보 표시                  |
| `app/bill/components/BillSummaryContent.tsx`  | GPT/일반 요약 본문 렌더링 (XSS-safe)             |
| `app/bill/components/FeedErrorFallback.tsx`   | 피드 전용 에러 폴백 UI                           |

---

## Task 1: 중복 훅/키 코드 통합

**Files:**

- Modify: `app/bill/hooks/index.ts` (전체 교체)
- Reference: `app/bill/services/queries.ts` (정본, 변경 없음)
- Reference: `app/bill/services/query-keys.ts` (정본, 변경 없음)

**배경:** `hooks/index.ts`와 `services/queries.ts`에 동일한 React Query 훅과 `billKeys`가 중복 정의되어 있다. `services/queries.ts`를 정본으로 삼고, `hooks/index.ts`는 re-export만 한다.

- [ ] **Step 1: hooks/index.ts를 re-export 파일로 교체**

```tsx
// app/bill/hooks/index.ts
export {
  useInfiniteBillMainfeed,
  useGetBillPopular,
  useGetBillDetail,
  useMutateViewCount,
  useMutateBookmark,
} from '@/app/bill/services/queries';

export { billKeys } from '@/app/bill/services/query-keys';
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run typecheck`
Expected: 에러 없음. 기존 import 경로(`@/app/bill/hooks`)가 모두 그대로 동작.

- [ ] **Step 3: Commit**

```bash
git add app/bill/hooks/index.ts
git commit -m "refactor: bill hooks를 services/queries re-export로 통합"
```

---

## Task 2: Feed.tsx 및 하위 컴포넌트 일괄 리팩토링

**Files:**

- Modify: `app/common/hooks/useTabType.ts`
- Modify: `app/bill/components/Feed.tsx`
- Modify: `app/bill/components/FeedTab.tsx`
- Modify: `app/bill/components/StageDropdown.tsx`
- Modify: `app/bill/components/BillList.tsx`

**배경:**

- `useTabType`의 반환 타입이 `(ValueOf<T> | Dispatch<...>)[]`로 추론되어 `as any`를 유발한다. 튜플 타입을 명시한다.
- `rerender-derived-state-no-effect` 규칙: React Query `data`를 `useState`+`useEffect`로 복사하는 것은 파생 상태 안티패턴이다. `useMemo`로 직접 계산한다.
- queryKey에 `stage`가 포함되어 있으므로 `stage` 변경 시 자동 refetch된다. 수동 `refetch()` + `setBills([])` 불필요.
- `Set` 기반 stageType을 단순 `string`으로 변경.
- `as any` 4건 제거.
- **주의:** StageDropdown, FeedTab의 props 변경과 Feed.tsx의 사용처 변경을 원자적으로 수행해야 typecheck가 깨지지 않는다.

- [ ] **Step 1: useTabType 반환 타입을 튜플로 명시**

```tsx
// app/common/hooks/useTabType.ts
import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { ValueOf } from '@/app/common/types';

export function useTabType<T>(defaultValue: ValueOf<T>): [ValueOf<T>, Dispatch<SetStateAction<ValueOf<T>>>] {
  return useState<ValueOf<T>>(defaultValue);
}
```

- [ ] **Step 2: FeedTab props 타입 개선**

props를 `value`/`onValueChange`로 변경하여 shadcn Tabs API와 일관성을 맞춘다.

- [ ] **Step 3: StageDropdown props를 string 기반으로 수정**

props를 `selectedStage`/`onStageChange`로 변경.

- [ ] **Step 4: BillList key 수정 — index 제거**

`bill_id`가 유니크하므로 `key={bill.bill_info_dto.bill_id}`로 변경.

- [ ] **Step 5: Feed.tsx 전체 리팩토링**

핵심 변경:

- `useState` + `useEffect` 동기화 3건 → `useMemo` 파생 계산 2건
- `Set` 기반 stageType → 단순 `string` 상태
- 수동 `refetch()` + `setBills([])` 제거 — queryKey 자동 refetch에 위임
- `as any` 제거 — `useTabType` 튜플 반환 덕분에 캐스트 불필요
- `popularBills`는 모듈 레벨 `const EMPTY: BillResponse[] = []`로 빈 배열 참조 안정화

```tsx
'use client';

import { useMemo, useState } from 'react';
import { useIntersect, useTabType } from '@/app/common/hooks';
import { useInfiniteBillMainfeed, useGetBillPopular } from '@/app/bill/hooks';
import { FEED_TAB } from '@/app/bill/constants';
import type { BillResponse } from '@/app/bill/validation';
import BillList from './BillList';
import StageDropdown from './StageDropdown';
import FeedTab from './FeedTab';

const EMPTY_BILLS: BillResponse[] = [];

export default function Feed() {
  const [feedType, setFeedType] = useTabType<typeof FEED_TAB>('sorted_by_latest');
  const [selectedStage, setSelectedStage] = useState('전체');

  const stageParam = selectedStage === '전체' ? '' : selectedStage;
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteBillMainfeed(stageParam);
  const { data: popularFeed } = useGetBillPopular();

  const bills = useMemo(() => data?.pages.flatMap((p) => p.bill_list) ?? EMPTY_BILLS, [data]);
  const popularBills = popularFeed ?? EMPTY_BILLS;

  const isLatest = feedType === FEED_TAB.sortedByLatest;
  const displayBills = isLatest ? bills : popularBills;

  const fetchRef = useIntersect((entry, observer) => {
    observer.unobserve(entry.target);
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  });

  return (
    <section>
      <section className="flex justify-between items-center mx-5 mt-5">
        <FeedTab value={feedType} onValueChange={setFeedType} />
        {isLatest && <StageDropdown selectedStage={selectedStage} onStageChange={setSelectedStage} />}
      </section>
      <BillList bills={displayBills} isFetching={isFetching} fetchRef={fetchRef} feedType={feedType} />
    </section>
  );
}
```

- [ ] **Step 6: typecheck 및 lint 확인**

Run: `npm run typecheck && npm run lint`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/common/hooks/useTabType.ts app/bill/components/Feed.tsx app/bill/components/FeedTab.tsx app/bill/components/StageDropdown.tsx app/bill/components/BillList.tsx
git commit -m "refactor: Feed 로컬 상태 동기화 제거, 타입 안전성 개선, as any 제거"
```

---

## Task 3: useIntersect 콜백 안정성 개선

**Files:**

- Modify: `app/common/hooks/useIntersect.ts`

**배경:** 현재 `onIntersect`가 `useCallback` 의존성에 있어 매 렌더마다 Observer가 재생성될 수 있다. `useRef`로 최신 콜백을 추적하여 Observer 재생성을 방지한다. (`advanced-event-handler-refs` 규칙 적용)

**주의:** `options` 파라미터도 객체이므로 매 렌더마다 새 참조가 생성될 수 있다. `options`도 ref로 추적하여 Observer가 불필요하게 재생성되지 않도록 한다. Observer 생성은 마운트 시 1회만 수행된다.

- [ ] **Step 1: useIntersect에 ref 패턴 적용 (onIntersect + options 모두)**

```tsx
'use client';

import { useRef, useEffect } from 'react';
import type { IntersectHandler } from '@/app/common/types';

export const useIntersect = (onIntersect: IntersectHandler, options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const onIntersectRef = useRef(onIntersect);
  const optionsRef = useRef(options);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
    optionsRef.current = options;
  });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersectRef.current(entry, obs);
        }
      });
    }, optionsRef.current);

    observer.observe(ref.current);
    return () => observer.disconnect();
    // Observer는 마운트 시 1회 생성. options 변경 후 재생성이 필요하면
    // 컴포넌트를 key prop으로 리마운트한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
};
```

- [ ] **Step 2: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/common/hooks/useIntersect.ts
git commit -m "perf: useIntersect 콜백/옵션 ref 패턴으로 Observer 재생성 방지"
```

---

## Task 4: Bill.tsx에서 unsafe innerHTML 제거 (XSS 수정)

**Files:**

- Create: `app/bill/components/BillSummaryContent.tsx`
- Modify: `app/bill/components/Bill.tsx`

**배경:** GPT 요약의 `**bold**` 마크다운을 unsafe innerHTML로 처리하고 있어, 서버 응답에 악의적 스크립트가 포함되면 XSS 공격이 가능하다. React 컴포넌트로 안전하게 파싱하여 이 취약점을 제거한다.

- [ ] **Step 1: BillSummaryContent 컴포넌트 생성**

`**bold**` 마크다운을 `<strong>` React 엘리먼트로 변환하는 순수 컴포넌트. innerHTML 미사용.

```tsx
// app/bill/components/BillSummaryContent.tsx
import type { ReactNode } from 'react';

function parseBoldMarkdown(text: string): ReactNode[] {
  return text.split('**').map((segment, index) => (index % 2 === 0 ? segment : <strong key={index}>{segment}</strong>));
}

export default function BillSummaryContent({
  gptSummary,
  summary,
  isCollapsed,
}: {
  gptSummary: string;
  summary: string;
  isCollapsed: boolean;
}) {
  const clampClass = isCollapsed ? 'line-clamp-[8]' : '';

  return <p className={clampClass}>{gptSummary ? parseBoldMarkdown(gptSummary) : summary}</p>;
}
```

- [ ] **Step 2: Bill.tsx에서 innerHTML 부분을 BillSummaryContent로 교체**

기존 `formattedGptSummary` 변수와 innerHTML 사용 코드를 제거하고 `<BillSummaryContent />` 사용.
"더 보기" 버튼은 Bill.tsx에 유지하며, `<BillSummaryContent />` 바로 아래에 위치시킨다:

```tsx
<CardContent className={`p-0 leading-normal whitespace-pre-wrap ${detail ? '' : 'text-sm md:text-base'}`}>
  <BillSummaryContent gptSummary={gpt_summary} summary={summary} isCollapsed={!detail && !toggleMore} />
  {!detail && !toggleMore && (
    <Button variant="link" onClick={onClickToggleMore} className="p-0 text-gray-2 dark:text-gray-3">
      더 보기
    </Button>
  )}
</CardContent>
```

- [ ] **Step 3: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/bill/components/BillSummaryContent.tsx app/bill/components/Bill.tsx
git commit -m "fix: unsafe innerHTML 제거하여 XSS 취약점 수정"
```

---

## Task 5: Bill.tsx 컴포넌트 분리 — BillCardFooter, BillProposerSection

**Files:**

- Create: `app/bill/components/BillCardFooter.tsx`
- Create: `app/bill/components/BillProposerSection.tsx`
- Modify: `app/bill/components/Bill.tsx`
- Modify: `app/bill/components/index.tsx`
- Reference (호환성 확인): `app/bill/components/BillDetail.tsx`, `app/following/components/BillFollowedList.tsx`

**배경:**

- `architecture-avoid-boolean-props` / `patterns-explicit-variants` 규칙: Bill.tsx가 `detail` boolean으로 피드용/상세용 푸터를 두 벌 렌더링한다.
- 268줄 단일 컴포넌트에 카드 헤더, 본문, 푸터(2벌), 발의자 섹션이 모두 포함.
- 각 책임을 분리하여 가독성과 재사용성을 높인다.
- **중요:** `BillProps` 인터페이스의 public API(`detail`, `viewCount`, `children`)는 유지해야 한다. `BillDetail.tsx`와 `BillFollowedList.tsx`가 이에 의존한다.

- [ ] **Step 1: BillCardFooter 컴포넌트 생성**

내부에 `FeedFooter`, `DetailFooter` 두 하위 컴포넌트로 분리. `detail` prop에 따라 선택적 렌더링.

- [ ] **Step 2: BillProposerSection 컴포넌트 생성**

발의자 아바타, 정당 정보, Popover를 포함하는 독립 컴포넌트.

- [ ] **Step 3: Bill.tsx를 분리된 컴포넌트를 사용하도록 리팩토링**

Bill.tsx에서:

- 두 벌 `CardFooter` → `<BillCardFooter />`
- 발의자 섹션 → `<BillProposerSection />`
- 이전 Task에서 이미 요약 부분은 `<BillSummaryContent />`로 교체됨

- [ ] **Step 4: index.tsx 배럴 파일에 신규 컴포넌트 추가**

- [ ] **Step 5: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/bill/components/BillCardFooter.tsx app/bill/components/BillProposerSection.tsx app/bill/components/Bill.tsx app/bill/components/index.tsx
git commit -m "refactor: Bill.tsx에서 Footer, ProposerSection 컴포넌트 분리"
```

---

## Task 6: 북마크 Optimistic Update 구현

**Files:**

- Modify: `app/bill/services/queries.ts` (`useMutateBookmark`)
- Modify: `app/bill/components/Bill.tsx` (로컬 `isLiked`/`likeCount` 상태 제거)
- Reference (호환성 확인): `app/bill/components/BillDetail.tsx`

**배경:** 현재 Bill.tsx에서 `useState`로 북마크 상태를 로컬 관리하며, mutation 실패 시 롤백이 없다. React Query의 정식 optimistic update 패턴을 적용한다:

- `onMutate`: 캐시를 낙관적으로 갱신 + 이전 데이터 스냅샷
- `onError`: 스냅샷으로 롤백
- `onSettled`: 서버와 재동기화

**중요 — viewCount prop 호환:**

- `BillDetail.tsx`는 `<Bill {...data} detail viewCount={viewCount}>`로 사용한다.
- `viewCount`는 `useMutateViewCount`의 별도 mutation 결과이며, 북마크와 무관하다.
- Bill.tsx에서 `viewCount` optional prop을 유지하고, 피드 모드에서는 `bill_info_dto.view_count`를, 상세 모드에서는 prop으로 전달받은 `viewCount`를 사용한다.
- **삭제 대상은 `isLiked`/`likeCount` 로컬 상태만.** `viewCount` prop은 그대로 유지.

**스낵바 위치:** `onClickScrap` 핸들러는 Bill.tsx(또는 Task 5 이후 BillCardFooter.tsx)에 유지. `mutate()` 호출 전에 스낵바를 표시한다 (optimistic UI).

- [ ] **Step 1: useMutateBookmark에 optimistic update 로직 추가**

`InfiniteData<Feed>` 페이지 구조를 순회하며 매칭 bill의 `is_book_mark`과 `bill_like_count`를 갱신:

```tsx
export const useMutateBookmark = (billId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (likeChecked: boolean) => patchBookmark({ billId, likeChecked }),
    onMutate: async (likeChecked) => {
      // 1. 진행 중인 쿼리 취소
      await qc.cancelQueries({ queryKey: billKeys.root() });

      // 2. 이전 데이터 스냅샷
      const previousData = qc.getQueriesData<InfiniteData<Feed>>({ queryKey: billKeys.root() });

      // 3. InfiniteData<Feed> 페이지 구조 순회하며 낙관적 갱신
      qc.setQueriesData<InfiniteData<Feed>>({ queryKey: billKeys.root() }, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            bill_list: page.bill_list.map((bill) =>
              bill.bill_info_dto.bill_id === billId
                ? {
                    ...bill,
                    is_book_mark: likeChecked,
                    bill_info_dto: {
                      ...bill.bill_info_dto,
                      bill_like_count: bill.bill_info_dto.bill_like_count + (likeChecked ? 1 : -1),
                    },
                  }
                : bill,
            ),
          })),
        };
      });

      // 4. 상세 페이지 캐시도 갱신
      const detailKey = billKeys.detail(billId);
      const previousDetail = qc.getQueryData(detailKey);
      qc.setQueryData(detailKey, (old: BillDetail | undefined) => {
        if (!old) return old;
        return {
          ...old,
          is_book_mark: likeChecked,
          bill_info_dto: {
            ...old.bill_info_dto,
            bill_like_count: old.bill_info_dto.bill_like_count + (likeChecked ? 1 : -1),
          },
        };
      });

      return { previousData, previousDetail };
    },
    onError: (_error, _variables, context) => {
      // 롤백
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          if (data) qc.setQueryData(key, data);
        });
      }
      if (context?.previousDetail) {
        qc.setQueryData(billKeys.detail(billId), context.previousDetail);
      }
    },
    onSettled: () => {
      // 타겟 invalidation — billKeys.root()는 모든 bill 쿼리를 무효화하므로 피한다
      qc.invalidateQueries({ queryKey: billKeys.detail(billId) });
      qc.invalidateQueries({ queryKey: billKeys.mainfeed() });
      qc.invalidateQueries({ queryKey: ['user', 'bookmark', 'bill'] });
      qc.invalidateQueries({ queryKey: ['user', 'bookmark', 'bill', 'count'] });
    },
  });
};
```

- [ ] **Step 2: Bill.tsx에서 로컬 북마크 상태 제거**

변경 전:

```tsx
const [isLiked, setIsLiked] = useState(is_book_mark);
const [likeCount, setLikeCount] = useState(bill_like_count);
```

변경 후: `is_book_mark`과 `bill_like_count`를 props에서 직접 사용. `onClickScrap`에서 `setIsLiked`/`setLikeCount` 호출 제거, `mutate(!is_book_mark)`만 호출. 스낵바는 유지.

`viewCount` prop은 그대로 유지 (BillDetail.tsx 호환성):

```tsx
// 피드: bill_info_dto.view_count 사용
// 상세: viewCount prop 사용
const displayViewCount = viewCount ?? view_count;
```

- [ ] **Step 3: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: 테스트 실행**

Run: `npm test`
Expected: PASS (기존 테스트 회귀 없음 확인)

- [ ] **Step 5: Commit**

```bash
git add app/bill/services/queries.ts app/bill/components/Bill.tsx
git commit -m "feat: 북마크 React Query optimistic update 구현 및 로컬 상태 제거"
```

---

## Task 7: ErrorBoundary 추가

**Files:**

- Create: `app/bill/components/FeedErrorFallback.tsx`
- Modify: `app/home/ClientHomeSection.tsx`

**배경:** Next.js `error.tsx` 규칙 + `useSuspenseInfiniteQuery` 사용 시 에러가 throw되므로, Suspense와 함께 ErrorBoundary가 필수. 현재 ClientHomeSection에 Suspense만 있고 ErrorBoundary가 없어 피드 로딩 실패 시 전체 앱이 깨진다.

- [ ] **Step 1: FeedErrorFallback 컴포넌트 생성**

"피드를 불러올 수 없습니다" + 에러 메시지 + "다시 시도" 버튼.

- [ ] **Step 2: react-error-boundary 설치 (미설치 시)**

```bash
npm install react-error-boundary
```

- [ ] **Step 3: ClientHomeSection에 ErrorBoundary 래핑**

`<ErrorBoundary FallbackComponent={FeedErrorFallback}>` + `<Suspense>` 감싸기.

- [ ] **Step 4: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/bill/components/FeedErrorFallback.tsx app/home/ClientHomeSection.tsx package.json package-lock.json
git commit -m "feat: 메인 피드에 ErrorBoundary 추가"
```

---

## 적용된 스킬/규칙 매핑

| Task   | 적용 규칙                                                                             |
| ------ | ------------------------------------------------------------------------------------- |
| Task 1 | DRY 원칙, 코드 중복 제거                                                              |
| Task 2 | `rerender-derived-state-no-effect`, `rerender-functional-setstate`, TypeScript strict |
| Task 3 | `advanced-event-handler-refs`                                                         |
| Task 4 | OWASP XSS 방지, React 안전 렌더링                                                     |
| Task 5 | `architecture-avoid-boolean-props`, `patterns-explicit-variants`                      |
| Task 6 | React Query optimistic update 패턴, `rerender-derived-state-no-effect`                |
| Task 7 | Next.js `error.tsx` 규칙, Suspense + ErrorBoundary 필수 조합                          |

## 요약 — 개선 효과

| 영역              | Before                                          | After                                     |
| ----------------- | ----------------------------------------------- | ----------------------------------------- |
| **데이터 흐름**   | React Query → useState → useEffect 동기화 (3건) | React Query → useMemo 파생 계산           |
| **보안**          | unsafe innerHTML XSS 취약                       | React 컴포넌트 기반 안전한 파싱           |
| **북마크**        | 로컬 useState, 실패 시 롤백 없음                | React Query optimistic update + 자동 롤백 |
| **에러 처리**     | Suspense만, ErrorBoundary 없음                  | ErrorBoundary + 사용자 친화적 폴백        |
| **코드 중복**     | hooks/index.ts ≈ services/queries.ts            | hooks/index.ts = re-export only           |
| **타입 안전성**   | `as any` 4건, Set 기반 불필요 복잡성            | 정확한 타입, 단순 string 상태             |
| **컴포넌트 크기** | Bill.tsx 268줄 단일 컴포넌트                    | Bill.tsx + 3개 하위 컴포넌트              |
| **성능**          | useIntersect 매 렌더 Observer 재생성            | ref 패턴으로 Observer 안정 유지           |

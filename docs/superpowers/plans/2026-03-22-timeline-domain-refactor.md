# Timeline 도메인 전면 리팩토링 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Timeline 도메인의 서비스 계층, 컴포넌트 구조, 타입 안전성, 에러 처리를 프로젝트 표준과 최신 React/Next.js 패턴에 맞게 전면 개선한다.

**Architecture:** 서비스 계층을 프로젝트 표준(apis/queries/query-keys)으로 분리하고, React Query 데이터를 직접 파생 계산하여 불필요한 상태 동기화를 제거한다. 9회 중복되는 정당 로고 렌더링과 4회 중복되는 반응형 페이지네이션을 공유 컴포넌트/훅으로 추출한다. SubmittedList/PromulgationList를 variant 기반 BillOutlineList로 통합한다. Suspense + ErrorBoundary를 추가하고 기존 버그를 수정한다.

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, TypeScript strict, Tailwind CSS, shadcn/ui

**Spec:** `docs/superpowers/specs/2026-03-22-timeline-domain-refactor-design.md`

---

## File Structure

### 수정 대상 파일

| 파일                                             | 책임                | 변경 내용                                              |
| ------------------------------------------------ | ------------------- | ------------------------------------------------------ |
| `app/timeline/hooks/index.ts`                    | 훅 re-export        | 전체 교체 → services re-export only                    |
| `app/timeline/components/ListContainer.tsx`      | 피드 오케스트레이터 | useState+useEffect → useMemo, convertDateFormat 최적화 |
| `app/timeline/components/TimelineModal.tsx`      | 모달 래퍼           | title prop 추가, onOpenChange 패턴 정렬                |
| `app/timeline/components/TimelineBoard.tsx`      | 통계 헤더           | optional chaining 개선                                 |
| `app/timeline/components/PlenaryList.tsx`        | 본회의 심사         | 공유 컴포넌트 사용으로 축소                            |
| `app/timeline/components/CommitteeAuditList.tsx` | 위원회 심사         | 공유 컴포넌트 사용, 멀티모달 버그 수정                 |
| `app/timeline/components/index.tsx`              | 배럴 파일           | 신규 컴포넌트 추가, 삭제된 컴포넌트 제거               |
| `app/timeline/page.tsx`                          | 페이지 엔트리       | Suspense + ErrorBoundary 추가                          |

### 신규 생성 파일

| 파일                                                | 책임                                     |
| --------------------------------------------------- | ---------------------------------------- |
| `app/timeline/services/query-keys.ts`               | timelineKeys 팩토리                      |
| `app/timeline/services/apis.ts`                     | API 호출 (기존 services/index.ts 리네임) |
| `app/timeline/services/queries.ts`                  | React Query 훅                           |
| `app/timeline/hooks/useResponsivePagination.ts`     | 반응형 페이지네이션 훅                   |
| `app/timeline/components/PartyLogo.tsx`             | 정당 로고 공유 컴포넌트                  |
| `app/timeline/components/TimelinePagination.tsx`    | 페이지네이션 UI 공유 컴포넌트            |
| `app/timeline/components/BillOutlineList.tsx`       | Submitted + Promulgation 통합            |
| `app/timeline/components/TimelineErrorFallback.tsx` | 에러 폴백 UI                             |
| `app/timeline/components/TimelineSkeleton.tsx`      | 로딩 스켈레톤 UI                         |
| `app/timeline/components/TimelineContent.tsx`       | ErrorBoundary+Suspense 클라이언트 래퍼   |

### 삭제 파일

| 파일                                           | 사유                   |
| ---------------------------------------------- | ---------------------- |
| `app/timeline/components/SubmittedList.tsx`    | BillOutlineList로 통합 |
| `app/timeline/components/PromulgationList.tsx` | BillOutlineList로 통합 |
| `app/timeline/services/index.ts`               | apis.ts로 리네임       |

### 영향 받는 소비자 파일 (변경 없이 호환성 확인 필요)

| 파일                                        | 사용 방식                   | 확인 사항                 |
| ------------------------------------------- | --------------------------- | ------------------------- |
| `app/timeline/components/ListContainer.tsx` | `useInfiniteTimelineFeed()` | hooks re-export 경로 유지 |
| `app/timeline/components/TimelineBoard.tsx` | `useGetTimelineBillState()` | hooks re-export 경로 유지 |

---

## Task 1: 서비스 계층 분리

**Files:**

- Create: `app/timeline/services/query-keys.ts`
- Create: `app/timeline/services/apis.ts`
- Create: `app/timeline/services/queries.ts`
- Modify: `app/timeline/hooks/index.ts`
- Delete: `app/timeline/services/index.ts`

**배경:** `hooks/index.ts`와 `services/index.ts`에 query keys, React Query 훅, API 호출이 혼재. 프로젝트 표준(bill 도메인 참고: `app/bill/services/`)에 맞게 3파일로 분리하고, `hooks/index.ts`는 re-export만 한다.

- [ ] **Step 1: query-keys.ts 생성**

```tsx
// app/timeline/services/query-keys.ts
export const timelineKeys = {
  root: () => ['timeline'] as const,
  feed: () => [...timelineKeys.root(), 'feed'] as const,
  billState: () => [...timelineKeys.root(), 'billState'] as const,
};
```

- [ ] **Step 2: services/index.ts를 apis.ts로 리네임**

기존 `services/index.ts`의 내용을 `apis.ts`로 이동. import 경로를 `query-keys.ts`에서 가져오도록 수정하지 않아도 됨 (apis.ts는 query keys를 사용하지 않음).

```tsx
// app/timeline/services/apis.ts
import { apiClient } from '@/app/common/lib/api';
import { extractApiMessage } from '@/app/common/validation/api.schema';
import {
  TimelineFeedSchema,
  TimelineBillStateSchema,
  type TimelineFeed,
  type TimelineBillState,
} from '@/app/timeline/validation';

/**
 * @description 타임라인 피드 조회 (무한스크롤)
 * @param page - 페이지 번호 (0부터 시작)
 * @see GET /time-line/feed/paging
 */
export const getTimelineFeed = async (page: number): Promise<TimelineFeed> => {
  try {
    const data = await apiClient.get<TimelineFeed>('/time-line/feed/paging', { params: { page, size: 3 } });
    return TimelineFeedSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 타임라인 전체 법안 현황 통계 조회
 * @see GET /time-line/bill-state
 */
export const getTimelineBillState = async (): Promise<TimelineBillState> => {
  try {
    const data = await apiClient.get<TimelineBillState>('/time-line/bill-state', { params: { size: 3 } });
    return TimelineBillStateSchema.parse(data);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};
```

- [ ] **Step 3: queries.ts 생성**

```tsx
// app/timeline/services/queries.ts
'use client';

import {
  useSuspenseInfiniteQuery,
  useQuery,
  type UseSuspenseInfiniteQueryOptions,
  type InfiniteData,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { TimelineFeed, TimelineBillState } from '@/app/timeline/validation';
import { getTimelineFeed, getTimelineBillState } from '@/app/timeline/services/apis';
import { timelineKeys } from '@/app/timeline/services/query-keys';

/**
 * 타임라인 피드 무한스크롤 훅
 */
export const useInfiniteTimelineFeed = (
  options?: Omit<
    UseSuspenseInfiniteQueryOptions<
      TimelineFeed,
      unknown,
      InfiniteData<TimelineFeed>,
      ReturnType<typeof timelineKeys.feed>,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) =>
  useSuspenseInfiniteQuery({
    queryKey: timelineKeys.feed(),
    queryFn: ({ pageParam = 0 }) => getTimelineFeed(pageParam),
    initialPageParam: 0,
    getNextPageParam: (data) =>
      data.pagination_response.last_page ? undefined : data.pagination_response.page_number + 1,
    ...options,
  });

/**
 * 타임라인 법안 통계 조회 훅
 */
export const useGetTimelineBillState = <TData = TimelineBillState, TError = unknown>(
  options?: Omit<
    UseQueryOptions<TimelineBillState, TError, TData, ReturnType<typeof timelineKeys.billState>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: timelineKeys.billState(),
    queryFn: () => getTimelineBillState(),
    ...options,
  });
```

- [ ] **Step 4: hooks/index.ts를 re-export 파일로 교체**

```tsx
// app/timeline/hooks/index.ts
export { useInfiniteTimelineFeed, useGetTimelineBillState } from '@/app/timeline/services/queries';
export { timelineKeys } from '@/app/timeline/services/query-keys';
```

- [ ] **Step 5: services/index.ts 삭제**

```bash
rm app/timeline/services/index.ts
```

- [ ] **Step 6: 빌드 확인**

Run: `npm run typecheck`
Expected: 에러 없음. 기존 import 경로 `@/app/timeline/hooks`가 그대로 동작.

- [ ] **Step 7: Commit**

```bash
git add app/timeline/services/ app/timeline/hooks/index.ts
git commit -m "refactor: timeline 서비스 계층을 프로젝트 표준(apis/queries/query-keys)으로 분리"
```

---

## Task 2: 공유 훅/컴포넌트 생성 — useResponsivePagination, PartyLogo, TimelinePagination, TimelineModal

**Files:**

- Create: `app/timeline/hooks/useResponsivePagination.ts`
- Create: `app/timeline/components/PartyLogo.tsx`
- Create: `app/timeline/components/TimelinePagination.tsx`
- Modify: `app/timeline/components/TimelineModal.tsx`

**배경:** 4개 리스트 컴포넌트에서 반복되는 로직(반응형 페이지네이션, 정당 로고, 페이지 인디케이터)을 공유 훅/컴포넌트로 추출. TimelineModal은 title prop 추가 + onOpenChange 패턴 수정.

- [ ] **Step 1: useResponsivePagination 훅 생성**

```tsx
// app/timeline/hooks/useResponsivePagination.ts
'use client';

import { useState, useEffect, useMemo } from 'react';

interface UseResponsivePaginationReturn<T> {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  currentItems: T[];
  totalPages: number;
  itemsPerPage: number;
}

export function useResponsivePagination<T>(
  items: T[],
  breakpoints: { md?: number; lg?: number } = {},
): UseResponsivePaginationReturn<T> {
  const { md = 2, lg = 3 } = breakpoints;
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(lg);
      } else if (window.innerWidth >= 768) {
        setItemsPerPage(md);
      } else {
        setItemsPerPage(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [md, lg]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  // 페이지 범위 초과 시 마지막 페이지로 보정
  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  return { currentPage, setCurrentPage, currentItems, totalPages, itemsPerPage };
}
```

- [ ] **Step 2: PartyLogo 컴포넌트 생성**

```tsx
// app/timeline/components/PartyLogo.tsx
import Link from 'next/link';
import Image from 'next/image';
import type { PartyInfo } from '@/app/timeline/validation';

interface PartyLogoProps {
  partyInfo: PartyInfo;
  size?: number;
  linkEnabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function PartyLogo({ partyInfo, size = 22, linkEnabled = true, className = '', style }: PartyLogoProps) {
  const containerClass = `flex items-center justify-center w-7 h-7 rounded-full shadow-lg shrink-0 border-1.5 ${partyInfo.party_name} ${className}`;

  const content =
    partyInfo.party_name === '무소속' ? (
      <span className="text-xs font-bold text-black dark:text-white">무</span>
    ) : (
      <>
        <Image
          className="dark:hidden"
          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${partyInfo.party_image_url}`}
          alt={`${partyInfo.party_name} 로고 이미지`}
          width={size}
          height={size}
        />
        <Image
          className="hidden dark:block"
          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${partyInfo.party_image_url.replace('wide', 'dark')}`}
          alt={`${partyInfo.party_name} 로고 이미지`}
          width={size}
          height={size}
        />
      </>
    );

  if (!linkEnabled) {
    return (
      <div className={containerClass} style={style}>
        {content}
      </div>
    );
  }

  return (
    <Link href={`/party/${partyInfo.party_id}`} className={containerClass} style={style}>
      {content}
    </Link>
  );
}
```

- [ ] **Step 3: TimelinePagination 컴포넌트 생성**

```tsx
// app/timeline/components/TimelinePagination.tsx
import { Button } from '@/app/common/components/ui/button';
import { IconNext, IconPrev } from '@/public/svgs';

interface TimelinePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function TimelinePagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: TimelinePaginationProps) {
  if (totalPages <= 1) return null;

  const goToPrev = () => onPageChange(currentPage > 0 ? currentPage - 1 : totalPages - 1);
  const goToNext = () => onPageChange(currentPage < totalPages - 1 ? currentPage + 1 : 0);

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <Button variant="ghost" size="sm" className="p-0" onClick={goToPrev}>
        <IconPrev />
      </Button>
      <div className="flex gap-1 items-center">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            type="button"
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${currentPage === i ? 'bg-gray-3' : 'bg-gray-1'}`}
            onClick={() => onPageChange(i)}
            aria-label={`${i + 1}페이지로 이동`}
          />
        ))}
      </div>
      <Button variant="ghost" size="sm" className="p-0" onClick={goToNext}>
        <IconNext />
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: TimelineModal 개선 — title prop + onOpenChange 수정**

```tsx
// app/timeline/components/TimelineModal.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/common/components/ui/dialog';

interface TimelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export default function TimelineModal({ open, onOpenChange, title, children }: TimelineModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-h-[40%] max-h-[80%] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-scroll">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 5: hooks/index.ts에 useResponsivePagination re-export 추가**

```tsx
// app/timeline/hooks/index.ts
export { useInfiniteTimelineFeed, useGetTimelineBillState } from '@/app/timeline/services/queries';
export { timelineKeys } from '@/app/timeline/services/query-keys';
export { useResponsivePagination } from '@/app/timeline/hooks/useResponsivePagination';
```

- [ ] **Step 6: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/timeline/hooks/useResponsivePagination.ts app/timeline/hooks/index.ts app/timeline/components/PartyLogo.tsx app/timeline/components/TimelinePagination.tsx app/timeline/components/TimelineModal.tsx
git commit -m "refactor: timeline 공유 훅/컴포넌트 추출 (PartyLogo, useResponsivePagination, TimelinePagination, TimelineModal)"
```

---

## Task 3: BillOutlineList — SubmittedList + PromulgationList 통합

**Files:**

- Create: `app/timeline/components/BillOutlineList.tsx`
- Modify: `app/timeline/components/ListContainer.tsx` (import 경로만)
- Delete: `app/timeline/components/SubmittedList.tsx`
- Delete: `app/timeline/components/PromulgationList.tsx`

**배경:** SubmittedList와 PromulgationList는 구조가 거의 동일 (제목, 카운트 텍스트, 빈 상태 메시지만 다름). variant 기반으로 통합한다. PromulgationList의 링크 버그(`promulgation_list[currentPage].bill_id`)도 자동 수정된다.

- [ ] **Step 1: BillOutlineList 컴포넌트 생성**

```tsx
// app/timeline/components/BillOutlineList.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/app/common/components/ui/card';
import { Badge } from '@/app/common/components/ui/badge';
import { Button } from '@/app/common/components/ui/button';
import type { BillOutline } from '@/app/timeline/validation';
import { useResponsivePagination } from '@/app/timeline/hooks';
import { IconEnter } from '@/public/svgs';
import PartyLogo from './PartyLogo';
import TimelinePagination from './TimelinePagination';
import TimelineModal from './TimelineModal';

type BillOutlineListVariant = 'submitted' | 'promulgation';

const VARIANT_CONFIG = {
  submitted: {
    title: '법안 접수',
    countLabel: '접수된 법안',
    emptyLabel: '접수된 법안이 없습니다.',
    modalTitle: '접수된 법안',
  },
  promulgation: {
    title: '법안 공포',
    countLabel: '공포한 법안',
    emptyLabel: '공포된 법안이 없습니다.',
    modalTitle: '공포된 법안',
  },
} as const;

interface BillOutlineListProps {
  variant: BillOutlineListVariant;
  bills: BillOutline[];
}

export default function BillOutlineList({ variant, bills }: BillOutlineListProps) {
  const config = VARIANT_CONFIG[variant];
  const [isOpen, setIsOpen] = useState(false);
  const { currentPage, setCurrentPage, currentItems, totalPages } = useResponsivePagination(bills);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <div className="bg-gray-3 dark:bg-gray-4 w-[10px] h-[10px] rounded-full border border-black absolute -left-[30px] top-4" />
        <div className="flex items-center justify-between md:w-[280px]">
          <h3 className="text-[26px] font-extralight">{config.title}</h3>
          {bills.length > 0 && (
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-2 dark:text-gray-3">
                {config.countLabel} <span className="text-black dark:text-white">{bills.length}개</span>
              </p>
              <Button variant="ghost" size="icon" className="p-0 w-4 h-4" onClick={() => setIsOpen(true)}>
                <IconEnter />
              </Button>
              <TimelineModal open={isOpen} onOpenChange={setIsOpen} title={config.modalTitle}>
                <div className="flex flex-col gap-3">
                  {bills.map(({ party_info, bill_id, bill_proposers, bill_brief_summary }) => (
                    <div key={bill_id} className="flex gap-[18px] items-center">
                      <PartyLogo partyInfo={party_info[0]} />
                      <div className="flex flex-col gap-1">
                        <Link href={`/bill/${bill_id}`}>
                          <p className="text-xs font-bold">{bill_brief_summary}</p>
                        </Link>
                        <p className="text-xs font-semibold text-gray-2 dark:text-gray-3">{bill_proposers}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TimelineModal>
            </div>
          )}
        </div>
      </div>
      <div>
        {bills.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:gap-2 md:grid-cols-2 lg:grid-cols-3">
            {currentItems.map((item) => (
              <Card key={item.bill_id} className="overflow-visible z-10 md:shadow-none md:border">
                <CardContent className="overflow-visible py-3">
                  <PartyLogo
                    partyInfo={item.party_info[0]}
                    className="absolute -left-[39px] bg-white dark:bg-dark-b md:hidden"
                  />
                  <div className="flex flex-col gap-2 w-full md:h-full md:justify-between">
                    <Link href={`/bill/${item.bill_id}`}>
                      <p className="text-sm font-bold">{item.bill_brief_summary}</p>
                    </Link>
                    <div className="flex items-center gap-[6px]">
                      <Badge variant="outline" className="text-xs">
                        {item.bill_stage}
                      </Badge>
                      <p className="text-xs font-semibold text-gray-2 dark:text-gray-3">{item.bill_proposers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-visible z-10">
            <CardContent className="overflow-visible py-3">
              <p className="text-sm font-bold text-center">{config.emptyLabel}</p>
            </CardContent>
          </Card>
        )}
        <Card className="w-[calc(100%-20px)] mx-auto -top-[14px] z-[5] md:hidden">
          <CardContent />
        </Card>
        <Card className="w-[calc(100%-40px)] mx-auto -top-[28px] md:hidden">
          <CardContent />
        </Card>
      </div>

      <TimelinePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
```

- [ ] **Step 2: ListContainer에서 import 교체**

`ListContainer.tsx`에서 `SubmittedList`, `PromulgationList` import를 `BillOutlineList`로 교체. JSX 부분 변경:

변경 전:

```tsx
{promulgation_list.length !== 0 && <PromulgationList promulgation_list={promulgation_list} />}
...
{submitted_list.length !== 0 && <SubmittedList submitted_list={submitted_list} />}
```

변경 후:

```tsx
{promulgation_list.length !== 0 && <BillOutlineList variant="promulgation" bills={promulgation_list} />}
...
{submitted_list.length !== 0 && <BillOutlineList variant="submitted" bills={submitted_list} />}
```

- [ ] **Step 3: SubmittedList.tsx, PromulgationList.tsx 삭제**

```bash
rm app/timeline/components/SubmittedList.tsx app/timeline/components/PromulgationList.tsx
```

- [ ] **Step 4: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/timeline/components/BillOutlineList.tsx app/timeline/components/ListContainer.tsx
git rm app/timeline/components/SubmittedList.tsx app/timeline/components/PromulgationList.tsx
git commit -m "refactor: SubmittedList/PromulgationList를 BillOutlineList variant로 통합"
```

---

## Task 4: ListContainer 리팩토링 — 파생 상태 + convertDateFormat

**Files:**

- Modify: `app/timeline/components/ListContainer.tsx`

**배경:** `useState` + `useEffect`로 React Query data를 복사하는 파생 상태 안티패턴 제거. `convertDateFormat(date)` 3회 호출을 1회로 최적화.

- [ ] **Step 1: ListContainer 전체 리팩토링**

```tsx
// app/timeline/components/ListContainer.tsx
'use client';

import { useMemo } from 'react';
import { useIntersect } from '@/app/common/hooks';
import { Loader2 } from 'lucide-react';
import { convertDateFormat } from '@/app/common/utils';
import { Separator } from '@/app/common/components/ui/separator';
import { useInfiniteTimelineFeed } from '@/app/timeline/hooks';
import PlenaryList from './PlenaryList';
import BillOutlineList from './BillOutlineList';
import CommitteeAuditList from './CommitteeAuditList';

export default function ListContainer() {
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteTimelineFeed();

  const timeline = useMemo(
    () => data?.pages.flatMap(({ timeline_response_list }) => timeline_response_list) ?? [],
    [data],
  );

  const fetchRef = useIntersect(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  });

  return (
    <section className="px-5 my-6 md:w-[640px] lg:w-[840px] xl:w-[1200px] mx-auto">
      <div className="flex flex-col">
        <div className="absolute w-[2px] h-5 bg-white dark:bg-dark-b dark:lg:bg-dark-pb" />
        {timeline.map(({ date, plenary_list, promulgation_list, committee_audit_list, submitted_list }) => {
          const [month, day, dayName] = convertDateFormat(date);
          return (
            <div key={date} className="flex gap-6">
              <Separator orientation="vertical" className="w-[2px] h-auto" />
              <div className="pb-10 w-full">
                <div className="relative">
                  <div className="w-[25px] h-[25px] bg-gray-1 dark:bg-gray-3 absolute rounded-full border-black border top-5 -left-[38px]" />
                  <h2 className="flex gap-2 items-baseline">
                    <span className="text-[42px]">
                      {month}.{day}
                    </span>
                    <span className="text-[22px]">{dayName}</span>
                  </h2>
                </div>
                <div className="flex flex-col gap-5">
                  {plenary_list.length > 0 && <PlenaryList plenary_list={plenary_list} />}
                  {promulgation_list.length > 0 && <BillOutlineList variant="promulgation" bills={promulgation_list} />}
                  {committee_audit_list.length > 0 && (
                    <CommitteeAuditList committee_audit_list={committee_audit_list} />
                  )}
                  {submitted_list.length > 0 && <BillOutlineList variant="submitted" bills={submitted_list} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {isFetching && (
        <div className="flex justify-center my-4 w-full">
          <Loader2 className="animate-spin" />
        </div>
      )}
      <div ref={fetchRef} />
    </section>
  );
}
```

- [ ] **Step 2: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/timeline/components/ListContainer.tsx
git commit -m "refactor: ListContainer 파생 상태 안티패턴 제거, convertDateFormat 호출 최적화"
```

---

## Task 5: PlenaryList 리팩토링 — 공유 컴포넌트 적용

**Files:**

- Modify: `app/timeline/components/PlenaryList.tsx`

**배경:** PlenaryList에서 중복된 정당 로고 렌더링(2곳), 페이지네이션 로직, 페이지네이션 UI를 공유 컴포넌트로 교체. 기존 기능(ProcessResult 투표 결과 표시)은 유지.

- [ ] **Step 1: PlenaryList 리팩토링**

```tsx
// app/timeline/components/PlenaryList.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/app/common/components/ui/card';
import { Badge } from '@/app/common/components/ui/badge';
import { Button } from '@/app/common/components/ui/button';
import { ProcessResult } from '@/app/bill/components';
import type { PlenaryItem } from '@/app/timeline/validation';
import { useResponsivePagination } from '@/app/timeline/hooks';
import { IconEnter } from '@/public/svgs';
import PartyLogo from './PartyLogo';
import TimelinePagination from './TimelinePagination';
import TimelineModal from './TimelineModal';

export default function PlenaryList({ plenary_list }: { plenary_list: PlenaryItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentPage, setCurrentPage, currentItems, totalPages } = useResponsivePagination(plenary_list);

  return (
    <section className="flex flex-col gap-5">
      <div className="relative">
        <div className="bg-gray-3 dark:bg-gray-4 w-[10px] h-[10px] rounded-full border border-black absolute -left-[30px] top-4" />
        <div className="flex items-center justify-between md:w-[280px]">
          <h3 className="text-[26px] font-extralight">본회의 심사</h3>
          {plenary_list.length > 0 && (
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-2 dark:text-gray-3">
                심의한 법안 <span className="text-black dark:text-white">{plenary_list.length}개</span>
              </p>
              <Button variant="ghost" size="icon" className="p-0 w-4 h-4" onClick={() => setIsOpen(true)}>
                <IconEnter />
              </Button>
              <TimelineModal open={isOpen} onOpenChange={setIsOpen} title="심의한 법안">
                <div className="flex flex-col gap-4">
                  {plenary_list.map(({ bill_info }) => (
                    <div key={bill_info.bill_id} className="flex flex-col gap-2">
                      <p className="text-lg font-bold">{bill_info.bill_name}</p>
                      <div className="flex gap-[18px] items-center">
                        <PartyLogo partyInfo={bill_info.party_info[0]} />
                        <div className="flex flex-col gap-1">
                          <Link href={`/bill/${bill_info.bill_id}`}>
                            <p className="text-xs font-bold">{bill_info.bill_brief_summary}</p>
                          </Link>
                          <p className="text-xs font-semibold text-gray-2 dark:text-gray-3">
                            {bill_info.bill_proposers}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TimelineModal>
            </div>
          )}
        </div>
      </div>
      <div>
        {plenary_list.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:gap-2 md:grid-cols-2 lg:grid-cols-3">
            {currentItems.map((item, index) => (
              <Card key={item.bill_info.bill_id} className="overflow-visible z-10 md:shadow-none md:border">
                <CardContent className="overflow-visible py-3">
                  <PartyLogo
                    partyInfo={item.bill_info.party_info[0]}
                    className="absolute -left-[39px] bg-white dark:bg-dark-b md:hidden"
                    style={index > 0 ? { top: `${index * 50}px` } : undefined}
                  />
                  <div className="flex flex-col gap-2 w-full md:h-full md:justify-between">
                    <Link href={`/bill/${item.bill_info.bill_id}`}>
                      <p className="text-sm font-bold">{item.bill_info.bill_brief_summary}</p>
                    </Link>
                    <div className="flex items-center gap-[6px]">
                      <Badge variant="outline" className="text-xs">
                        {item.bill_info.bill_stage}
                      </Badge>
                      <p className="text-xs font-semibold text-gray-2 dark:text-gray-3">
                        {item.bill_info.bill_proposers}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm font-bold text-center">심사한 법안이 없습니다.</p>
        )}
        <Card className="w-[calc(100%-20px)] mx-auto -top-[14px] z-[5] md:hidden">
          <CardContent />
        </Card>
        <Card className="w-[calc(100%-40px)] mx-auto -top-[28px] md:hidden">
          <CardContent />
        </Card>
      </div>

      {plenary_list.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:gap-2 md:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((item) => (
            <ProcessResult
              bill_result={item.bill_info.bill_result}
              key={item.bill_info.bill_id}
              approval_count={item.approval_vote_count}
              total_vote_count={item.total_vote_count}
              party_vote_list={item.party_vote_list}
            />
          ))}
        </div>
      )}

      <TimelinePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="w-full md:w-[calc(100%-40px)] mx-auto"
      />
    </section>
  );
}
```

**참고:** PartyLogo의 `style` prop은 Task 2에서 이미 포함되어 있다.

- [ ] **Step 2: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/timeline/components/PlenaryList.tsx app/timeline/components/PartyLogo.tsx
git commit -m "refactor: PlenaryList 공유 컴포넌트 적용으로 중복 제거"
```

---

## Task 6: CommitteeAuditList 리팩토링 — 공유 컴포넌트 + 버그 수정

**Files:**

- Modify: `app/timeline/components/CommitteeAuditList.tsx`

**배경:** CommitteeAuditList에서 공유 컴포넌트를 적용하고, 3가지 버그를 수정한다:

1. `isOpenIndividual` 단일 상태로 N개 모달이 동시 열리는 멀티모달 버그 → 개별 위원회 이름 기반 상태
2. `.map()` 내부의 불필요한 `committee_audit_list.length !== 0` 가드 제거
3. prev 버튼 `Math.ceil` 누락 → useResponsivePagination 훅 사용으로 자동 수정

- [ ] **Step 1: CommitteeAuditList 리팩토링**

```tsx
// app/timeline/components/CommitteeAuditList.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/app/common/components/ui/card';
import { Button } from '@/app/common/components/ui/button';
import type { CommitteeAudit } from '@/app/timeline/validation';
import { useResponsivePagination } from '@/app/timeline/hooks';
import { IconEnter } from '@/public/svgs';
import PartyLogo from './PartyLogo';
import TimelinePagination from './TimelinePagination';
import TimelineModal from './TimelineModal';

export default function CommitteeAuditList({ committee_audit_list }: { committee_audit_list: CommitteeAudit[] }) {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [isOpenAll, setIsOpenAll] = useState(false);
  const { currentPage, setCurrentPage, currentItems, totalPages } = useResponsivePagination(committee_audit_list);

  const totalBillCount = committee_audit_list.reduce((pre, cur) => pre + cur.bill_outline_dto_list.length, 0);

  return (
    <section className="flex flex-col gap-5">
      <div className="relative">
        <div className="bg-gray-3 dark:bg-gray-4 w-[10px] h-[10px] rounded-full border border-black absolute -left-[30px] top-4" />
        <div className="flex items-center justify-between md:w-[280px]">
          <h3 className="text-[26px] font-extralight">위원회 심사</h3>
          {committee_audit_list.length > 0 && (
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-2 dark:text-gray-3">
                심의한 법안 <span className="text-black dark:text-white">{totalBillCount}개</span>
              </p>
              <Button variant="ghost" size="icon" className="p-0 w-4 h-4" onClick={() => setIsOpenAll(true)}>
                <IconEnter />
              </Button>
              <TimelineModal open={isOpenAll} onOpenChange={setIsOpenAll} title="심사한 법안">
                <div className="flex flex-col gap-4">
                  {committee_audit_list.map(({ committee_name, bill_outline_dto_list }) => (
                    <div key={committee_name} className="flex flex-col gap-2">
                      <p className="text-lg font-bold">{committee_name}</p>
                      <div className="flex flex-col gap-3">
                        {bill_outline_dto_list.map(({ party_info, bill_id, bill_proposers, bill_brief_summary }) => (
                          <div key={bill_id} className="flex gap-[18px] items-center">
                            <PartyLogo partyInfo={party_info[0]} />
                            <div className="flex flex-col gap-1">
                              <Link href={`/bill/${bill_id}`}>
                                <p className="text-xs font-bold">{bill_brief_summary}</p>
                              </Link>
                              <p className="text-xs font-semibold text-gray-2 dark:text-gray-3">{bill_proposers}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TimelineModal>
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="grid grid-cols-1 gap-5 md:gap-2 md:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((item) => (
            <Card key={item.committee_name} className="z-10 px-2 md:shadow-none md:border">
              <CardHeader>
                <p className="text-[22px] font-bold">{item.committee_name}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-5 w-full">
                  <div className="flex items-center">
                    <p className="text-xs font-medium text-gray-2 dark:text-gray-3">
                      심사한 법안 <span className="text-black dark:text-white">{item.bill_count}개</span>
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-0 w-4 h-4"
                      onClick={() => setOpenModal(item.committee_name)}>
                      <IconEnter />
                    </Button>
                    <TimelineModal
                      open={openModal === item.committee_name}
                      onOpenChange={(open) => setOpenModal(open ? item.committee_name : null)}
                      title={`${item.committee_name} 심사 법안`}>
                      <div className="flex flex-col gap-3">
                        {item.bill_outline_dto_list.map(
                          ({ party_info, bill_id, bill_proposers, bill_brief_summary }) => (
                            <div key={bill_id} className="flex gap-[18px] items-center">
                              <PartyLogo partyInfo={party_info[0]} />
                              <div className="flex flex-col gap-1">
                                <Link href={`/bill/${bill_id}`}>
                                  <p className="text-xs font-bold">{bill_brief_summary}</p>
                                </Link>
                                <p className="text-xs font-semibold text-gray-2 dark:text-gray-3">{bill_proposers}</p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </TimelineModal>
                  </div>
                  <div className="flex flex-col gap-3">
                    {item.bill_outline_dto_list
                      .slice(0, 5)
                      .map(({ party_info, bill_id, bill_proposers, bill_brief_summary }) => (
                        <div key={bill_id} className="flex gap-[18px] items-center">
                          <PartyLogo partyInfo={party_info[0]} />
                          <div className="flex flex-col gap-1">
                            <Link href={`/bill/${bill_id}`}>
                              <p className="text-xs font-bold">{bill_brief_summary}</p>
                            </Link>
                            <p className="text-xs font-semibold text-gray-2 dark:text-gray-3">{bill_proposers}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="w-[calc(100%-20px)] mx-auto -top-[14px] z-[5] md:hidden">
          <CardContent />
        </Card>
        <Card className="w-[calc(100%-40px)] mx-auto -top-[28px] md:hidden">
          <CardContent />
        </Card>
      </div>

      <TimelinePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </section>
  );
}
```

- [ ] **Step 2: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/timeline/components/CommitteeAuditList.tsx
git commit -m "fix: CommitteeAuditList 멀티모달/페이지네이션 버그 수정, 공유 컴포넌트 적용"
```

---

## Task 7: TimelineBoard 개선 + Suspense/ErrorBoundary 추가

**Files:**

- Modify: `app/timeline/components/TimelineBoard.tsx`
- Create: `app/timeline/components/TimelineErrorFallback.tsx`
- Create: `app/timeline/components/TimelineSkeleton.tsx`
- Create: `app/timeline/components/TimelineContent.tsx`
- Modify: `app/timeline/page.tsx`

**배경:** TimelineBoard의 `&&` 패턴을 optional chaining으로 개선. page.tsx에 Suspense + ErrorBoundary를 추가하여 useSuspenseInfiniteQuery 에러를 안전하게 처리.

- [ ] **Step 1: TimelineBoard optional chaining 개선**

```tsx
// app/timeline/components/TimelineBoard.tsx
'use client';

import { Card, CardContent } from '@/app/common/components/ui/card';
import { Separator } from '@/app/common/components/ui/separator';
import { getDDay } from '@/app/common/utils';
import { useGetTimelineBillState } from '@/app/timeline/hooks';

export default function TimelineBoard() {
  const { data: billState } = useGetTimelineBillState();

  return (
    <Card className="shadow-[0_4px_6px_-2px_rgba(0,_0,_0,_0.1)] md:shadow-none w-full border-b md:border-none dark:border-dark-l mx-auto bg-transparent md:dark:bg-primary-3 md:mt-10 md:mb-6 md:w-[708px] md:pt-3 md:rounded-xl">
      <CardContent className="flex flex-col items-center gap-1 md:flex-row md:justify-center md:gap-[50px] md:shadow-none">
        <div className="flex flex-col gap-3 items-center md:flex-row md:gap-6">
          <h2 className="font-semibold text-[26px] md:text-[48px] md:font-bold">타임라인</h2>
          <div className="flex gap-3 justify-center items-center md:flex-col md:gap-1">
            <p className="text-xs font-semibold text-gray-2 md:text-[20px] md:font-normal">제 22대 국회</p>
            <Separator className="h-4 w-[1px] bg-black md:hidden" />
            <p className="text-lg font-semibold">{`D-${getDDay('2028-04-11')}`}</p>
          </div>
        </div>
        <Separator className="h-[82px] w-px bg-gray-2 hidden md:block" />
        <div className="flex gap-10">
          <div className="flex flex-col gap-2 items-center">
            <span className="text-2xl font-semibold">{billState?.receipt_count}</span>
            <span className="text-sm font-medium text-gray-2">접수법안</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-2xl font-semibold">{billState?.treatment_count}</span>
            <span className="text-sm font-medium text-gray-2">처리법안</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-2xl font-semibold">{billState?.passed_count}</span>
            <span className="text-sm font-medium text-gray-2">가결법안</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: TimelineErrorFallback 생성**

```tsx
// app/timeline/components/TimelineErrorFallback.tsx
'use client';

import { Button } from '@/app/common/components/ui/button';
import type { FallbackProps } from 'react-error-boundary';

export default function TimelineErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-5">
      <p className="text-lg font-semibold">타임라인을 불러올 수 없습니다</p>
      <p className="text-sm text-gray-2 dark:text-gray-3 text-center">{error.message}</p>
      <Button variant="outline" onClick={resetErrorBoundary}>
        다시 시도
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: TimelineSkeleton 생성**

```tsx
// app/timeline/components/TimelineSkeleton.tsx
import { Loader2 } from 'lucide-react';

export default function TimelineSkeleton() {
  return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="animate-spin w-8 h-8 text-gray-2" />
    </div>
  );
}
```

- [ ] **Step 4: TimelineContent 클라이언트 래퍼 생성**

`page.tsx`는 Server Component여야 `export const dynamic`이 동작한다. ErrorBoundary는 클라이언트 컴포넌트이므로 별도 래퍼로 분리.

```tsx
// app/timeline/components/TimelineContent.tsx
'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import TimelineBoard from './TimelineBoard';
import ListContainer from './ListContainer';
import TimelineErrorFallback from './TimelineErrorFallback';
import TimelineSkeleton from './TimelineSkeleton';

export default function TimelineContent() {
  return (
    <ErrorBoundary FallbackComponent={TimelineErrorFallback}>
      <TimelineBoard />
      <Suspense fallback={<TimelineSkeleton />}>
        <ListContainer />
      </Suspense>
    </ErrorBoundary>
  );
}
```

- [ ] **Step 5: page.tsx 수정 (Server Component 유지)**

```tsx
// app/timeline/page.tsx
import { TimelineContent } from './components';

// 타임라인 페이지는 런타임 데이터(외부 API)에 의존하므로
// 정적 프리렌더를 강제하지 않고 요청마다 동적으로 렌더링합니다.
export const dynamic = 'force-dynamic';

export default function Timeline() {
  return (
    <section>
      <TimelineContent />
    </section>
  );
}
```

- [ ] **Step 6: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/timeline/components/TimelineBoard.tsx app/timeline/components/TimelineErrorFallback.tsx app/timeline/components/TimelineSkeleton.tsx app/timeline/components/TimelineContent.tsx app/timeline/page.tsx
git commit -m "feat: timeline에 Suspense/ErrorBoundary 추가, TimelineBoard optional chaining 개선"
```

---

## Task 8: 배럴 파일 정리 + 최종 검증

**Files:**

- Modify: `app/timeline/components/index.tsx`

**배경:** 신규/삭제된 컴포넌트를 반영하여 배럴 파일 업데이트. 최종 빌드 + lint 확인.

- [ ] **Step 1: index.tsx 업데이트**

```tsx
// app/timeline/components/index.tsx
'use client';

import BillOutlineList from './BillOutlineList';
import CommitteeAuditList from './CommitteeAuditList';
import PlenaryList from './PlenaryList';
import ListContainer from './ListContainer';
import TimelineBoard from './TimelineBoard';
import TimelineContent from './TimelineContent';
import TimelineModal from './TimelineModal';
import TimelinePagination from './TimelinePagination';
import TimelineErrorFallback from './TimelineErrorFallback';
import TimelineSkeleton from './TimelineSkeleton';
import PartyLogo from './PartyLogo';

export {
  BillOutlineList,
  CommitteeAuditList,
  PlenaryList,
  ListContainer,
  TimelineBoard,
  TimelineContent,
  TimelineModal,
  TimelinePagination,
  TimelineErrorFallback,
  TimelineSkeleton,
  PartyLogo,
};
```

- [ ] **Step 2: 최종 typecheck + lint 확인**

Run: `npm run typecheck && npm run lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/timeline/components/index.tsx
git commit -m "chore: timeline 배럴 파일 정리, 최종 검증 완료"
```

---

## 적용된 규칙/패턴 매핑

| Task   | 적용 규칙                                                             |
| ------ | --------------------------------------------------------------------- |
| Task 1 | 프로젝트 표준 (apis/queries/query-keys), DRY                          |
| Task 2 | DRY, 커스텀 훅 추출, `advanced-event-handler-refs`                    |
| Task 3 | `architecture-avoid-boolean-props`, `patterns-explicit-variants`, DRY |
| Task 4 | `rerender-derived-state-no-effect`, 성능 최적화                       |
| Task 5 | DRY, 컴포넌트 합성                                                    |
| Task 6 | 버그 수정, DRY, 컴포넌트 합성                                         |
| Task 7 | Next.js Suspense/ErrorBoundary 필수 조합, optional chaining           |
| Task 8 | 코드 정리, 최종 검증                                                  |

## 개선 효과 요약

| 영역                  | Before                                             | After                        |
| --------------------- | -------------------------------------------------- | ---------------------------- |
| **데이터 흐름**       | useState + useEffect 동기화                        | useMemo 파생 계산            |
| **정당 로고**         | 9회 ~30줄 중복                                     | PartyLogo 단일 컴포넌트      |
| **페이지네이션 로직** | 4곳 ~25줄 중복                                     | useResponsivePagination 훅   |
| **페이지네이션 UI**   | 4곳 ~30줄 중복                                     | TimelinePagination 컴포넌트  |
| **컴포넌트 수**       | Submitted + Promulgation 별도                      | BillOutlineList variant 통합 |
| **에러 처리**         | Suspense/ErrorBoundary 없음                        | ErrorBoundary + Skeleton     |
| **서비스 구조**       | hooks/services 혼재                                | 표준 3파일 분리              |
| **버그**              | 링크 참조 오류, key 버그, 멀티모달, Math.ceil 누락 | 모두 수정                    |

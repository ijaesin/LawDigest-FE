# 페이지 교체 구현 계획 (Plan 4/4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 10개 페이지의 기존 컴포넌트를 새 아토믹 컴포넌트로 교체한다. 각 모듈에 Container 컴포넌트를 만들어 hooks를 호출하고, Templates/Organisms에 데이터를 전달한다.

**Architecture:** Page(서버 컴포넌트) → Container('use client', hooks 호출) → Template + Organisms(렌더링). Container는 도메인 모듈(`app/{module}/components/`)에, UI는 공통 아토믹(`atoms/molecules/organisms/templates/`)에서 import.

**Tech Stack:** Next.js 15 App Router, React 19, TanStack React Query, 아토믹 컴포넌트 from `atoms/molecules/organisms/templates/`

**Spec:** `docs/superpowers/specs/2026-03-24-atomic-design-rebuild.md` 섹션 6-7

---

## Tasks

### Task 1: 홈 피드 페이지 교체

**Files:**
- Create: `app/bill/components/NewFeedContainer.tsx`
- Modify: `app/page.tsx`

Container가 `useInfiniteBillMainfeed`, `useTabType`, `useMutateBookmark`, `copyClipBoard`를 호출하고 FeedTemplate + FeedList + BillCard로 조합.

```tsx
// app/bill/components/NewFeedContainer.tsx
'use client';

import { useMemo, useCallback } from 'react';
import { useIntersect } from '@/app/common/hooks';
import { useInfiniteBillMainfeed } from '@/app/bill/hooks';
import { useMutateBookmark } from '@/app/bill/hooks';
import { useTabType } from '@/app/common/hooks';
import { useSnackbarStore } from '@/app/common/store';
import { useAuthGuard } from '@/app/auth/hooks';
import { FEED_TAB, SNACKBAR_TYPE } from '@/app/bill/constants';
import { siteConfig } from '@/app/common/config/site';
import { copyClipBoard } from '@/app/common/utils';
import { FeedTemplate } from '@/app/common/components/templates';
import { FeedList, BillCard } from '@/app/common/components/organisms';
import type { BillResponse } from '@/app/bill/validation/bill.schema';

function HomeSidebar() {
  // 기존 NotificationTopThree를 여기에 렌더링 (Suspense 래핑)
  // 이 부분은 기존 NotificationTopThree를 import해서 사용
  return null; // TODO: 추후 NotificationTopThree를 organism으로 리빌드
}

export default function NewFeedContainer() {
  const [tab, setTab] = useTabType<typeof FEED_TAB>(FEED_TAB.sortedByLatest);
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteBillMainfeed(tab);
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const { requireLogin } = useAuthGuard();

  const bills = useMemo(() => data?.pages.flatMap((p) => p.bill_list) ?? [], [data]);

  const handleBookmark = useCallback((billId: string) => {
    if (!requireLogin()) return;
    // useMutateBookmark는 개별 빌 단위로 호출해야 하므로 BillCard 내부에서 처리하거나
    // 여기서는 snackbar만 표시
    setSnackbar({ show: true, type: SNACKBAR_TYPE.SUCCESS, message: '스크랩 처리했습니다.', duration: 3000 });
  }, [requireLogin, setSnackbar]);

  const handleShare = useCallback((billId: string) => {
    copyClipBoard(`${process.env.NEXT_PUBLIC_DOMAIN}/bill/${billId}`);
    setSnackbar({ show: true, type: SNACKBAR_TYPE.SUCCESS, message: '링크를 복사했습니다.', duration: 3000 });
  }, [setSnackbar]);

  return (
    <FeedTemplate
      tabs={siteConfig.feedTabs.map((t) => ({ label: t.label, value: FEED_TAB[t.value as keyof typeof FEED_TAB] }))}
      activeTab={tab}
      onTabChange={(v) => setTab(v as typeof tab)}
      sidebar={<HomeSidebar />}
    >
      <FeedList onLoadMore={fetchNextPage} hasMore={!!hasNextPage} isLoading={isFetching}>
        {bills.map((bill) => (
          <BillCard key={bill.bill_info_dto.bill_id} bill={bill} onBookmark={handleBookmark} onShare={handleShare} />
        ))}
      </FeedList>
    </FeedTemplate>
  );
}
```

Page:
```tsx
// app/page.tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Loading } from '@/app/common/components/Loading';
import NewFeedContainer from '@/app/bill/components/NewFeedContainer';
import FeedErrorFallback from '@/app/bill/components/FeedErrorFallback';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <ErrorBoundary FallbackComponent={FeedErrorFallback}>
      <Suspense fallback={<Loading />}>
        <NewFeedContainer />
      </Suspense>
    </ErrorBoundary>
  );
}
```

Tests: 빌드 확인 (`npm run build`에서 search 에러는 기존).
Commit: `feat(pages): 홈 피드 페이지 아토믹 컴포넌트로 교체`

---

### Task 2: 법안 상세 페이지 교체

**Files:**
- Create: `app/bill/components/NewBillDetailContainer.tsx`
- Modify: `app/bill/[id]/page.tsx`

Container가 `useGetBillDetail`, `useMutateViewCount`, `useMutateBookmark`를 호출하고 DetailTemplate + BillDetailHero + ProgressSteps + VoteResultGrid + ProposerGrid로 조합.

Commit: `feat(pages): 법안 상세 페이지 아토믹 컴포넌트로 교체`

---

### Task 3: 타임라인 페이지 교체

**Files:**
- Create: `app/timeline/components/NewTimelineContainer.tsx`
- Modify: `app/timeline/page.tsx`

Container가 `useInfiniteTimelineFeed`, `useGetTimelineBillState`를 호출하고 AppLayout + StatCard(x3) + FeedList + TimelineEntry로 조합.

Commit: `feat(pages): 타임라인 페이지 아토믹 컴포넌트로 교체`

---

### Task 4: 검색 페이지 교체

**Files:**
- Create: `app/search/components/NewSearchContainer.tsx`
- Modify: `app/search/[id]/page.tsx`

Container가 `useInfiniteSearchBill`, `useGetSearchCongressmanParty`를 호출하고 AppLayout + TabBar + FeedList + BillCard/CongressmanCard로 조합.

Commit: `feat(pages): 검색 페이지 아토믹 컴포넌트로 교체`

---

### Task 5: 팔로잉 페이지 교체

**Files:**
- Create: `app/following/components/NewFollowingContainer.tsx`
- Modify: `app/following/page.tsx`

Commit: `feat(pages): 팔로잉 페이지 아토믹 컴포넌트로 교체`

---

### Task 6: 마이페이지 교체

**Files:**
- Create: `app/user/mypage/NewMyPageContainer.tsx`
- Modify: `app/user/mypage/page.tsx` + `app/user/mypage/layout.tsx`

Commit: `feat(pages): 마이페이지 아토믹 컴포넌트로 교체`

---

### Task 7: 의원 상세 페이지 교체

**Files:**
- Create: `app/congressman/components/NewCongressmanDetailContainer.tsx`
- Modify: `app/congressman/[id]/page.tsx`

Commit: `feat(pages): 의원 상세 페이지 아토믹 컴포넌트로 교체`

---

### Task 8: 정당 상세 페이지 교체

**Files:**
- Create: `app/party/components/NewPartyDetailContainer.tsx`
- Modify: `app/party/[id]/page.tsx`

Commit: `feat(pages): 정당 상세 페이지 아토믹 컴포넌트로 교체`

---

### Task 9: 알림 페이지 교체

**Files:**
- Create: `app/notification/components/NewNotificationContainer.tsx`
- Modify: `app/notification/page.tsx`

Commit: `feat(pages): 알림 페이지 아토믹 컴포넌트로 교체`

---

### Task 10: 로그인 페이지 교체

**Files:**
- Modify: `app/auth/login/page.tsx`

AuthTemplate + GlassCard + Logo + GlassButton.

Commit: `feat(pages): 로그인 페이지 아토믹 컴포넌트로 교체`

---

### Task 11: 최종 검증 + ClientOnlyWidgets 업데이트

- Snackbar, SearchModal을 organisms에서 import하도록 `ClientOnlyWidgets` 업데이트
- 전체 테스트 + 빌드 확인
- Commit: `feat(pages): ClientOnlyWidgets 아토믹 organism으로 교체 + 최종 검증`

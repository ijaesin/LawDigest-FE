# Organisms + Templates 구현 계획 (Plan 3/4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Molecules를 조합한 Organism 15개 + Template 4개를 Storybook에서 완성한다.

**Architecture:** Organisms는 `app/common/components/organisms/`에 생성. 도메인 타입(`BillResponse`, `CongressmanDetail` 등)을 props로 받아 Molecules로 분해/렌더링. Templates는 `app/common/components/templates/`에 생성. 기존 SideNav/RightSidebar/AppLayout은 organisms/templates로 이동 개선.

**Tech Stack:** React 19, TypeScript strict, Atoms from `atoms/`, Molecules from `molecules/`, 도메인 타입 from `app/*/validation/`

**Spec:** `docs/superpowers/specs/2026-03-24-atomic-design-rebuild.md` 섹션 4-5

---

## Tasks Overview

| Task | Components | 설명 |
|------|-----------|------|
| 1 | BillCard | 핵심 법안 카드 (피드용) |
| 2 | BillDetailHero | 법안 상세 히어로 |
| 3 | ProgressSteps + VoteResultGrid | 법안 진행/투표 |
| 4 | ProposerGrid | 발의자 그리드 |
| 5 | SideNav + BottomNav 이동/개선 | 네비게이션 |
| 6 | RightSidebar + SearchModal | 사이드바/검색 |
| 7 | FeedList + Snackbar | 피드 래퍼/토스트 |
| 8 | NotificationList + TimelineEntry | 알림/타임라인 |
| 9 | CongressmanCard + PartyCard | 프로필 카드 |
| 10 | AppLayout + FeedTemplate + DetailTemplate + AuthTemplate | 4개 Templates |
| 11 | 최종 검증 | barrel export, 전체 테스트 |

각 Task의 상세 구현은 서브에이전트에게 스펙 + 타입 정보와 함께 전달. 여기서는 인터페이스만 명시.

---

### Task 1: BillCard

```tsx
interface BillCardProps {
  bill: BillResponse;  // from app/bill/validation/bill.schema.ts
  onBookmark: (billId: string) => void;
  onShare: (billId: string) => void;
  variant?: 'default' | 'compact';
}
```

조합: GlassCard(hover) > BillMeta + heading + summary(line-clamp-2) + ProposerAvatar + ActionBar.
compact: 제목 + 배지만. 사이드바용.
Tests: 렌더링, 북마크 콜백, 공유 콜백, compact 변형.
Story: Default, Compact, Bookmarked.

---

### Task 2: BillDetailHero

```tsx
interface BillDetailHeroProps {
  bill: BillResponse;
  onBookmark: () => void;
  onShare: () => void;
}
```

조합: GlassCard(medium) > GlassBadge(stage) + display 타이틀 + 법안명 + 메타(발의일, 조회수) + ActionBar.
Tests: 렌더링, 제목, 배지.

---

### Task 3: ProgressSteps + VoteResultGrid

**ProgressSteps:**
```tsx
interface ProgressStepsProps { currentStage: string; }
```
수직 스텝: 완료=primary+check, 현재=primary+point, 미래=muted+number.

**VoteResultGrid:**
```tsx
interface VoteResultGridProps {
  approvalCount: number;
  totalVoteCount: number;
  partyVoteList: { party_info: { party_id: number; party_name: string; party_image_url: string }; party_approval_count: number }[];
  billResult?: string;
}
```
조합: GlassCard > VoteBar(전체) + 정당별 그리드(GlassAvatar + 이름 + 투표수).

---

### Task 4: ProposerGrid

```tsx
interface ProposerGridProps {
  representativeProposers: RepresentativeProposer[];
  publicProposers: PublicProposer[];
}
```
대표발의자(상단, lg) + 공동발의자(하단, sm 그리드, 접을 수 있음).

---

### Task 5: SideNav + BottomNav

기존 `Layout/SideNav/SideNav.tsx`를 `organisms/SideNav.tsx`로 이동 + NavItem molecule 사용으로 리팩터링.
새로 `organisms/BottomNav.tsx` 생성 — 기존 `Layout/Nav/Nav.tsx` 대체.

---

### Task 6: RightSidebar + SearchModal

기존 `Layout/RightSidebar/RightSidebar.tsx`를 `organisms/RightSidebar.tsx`로 이동.
새로 `organisms/SearchModal.tsx` — 글래스 Dialog + SearchBar + KeywordChip[].

---

### Task 7: FeedList + Snackbar

**FeedList:**
```tsx
interface FeedListProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onRefresh?: () => Promise<void>;
  emptyMessage?: string;
}
```
useIntersect + usePullToRefresh + animate-fade-in-up + GlassSkeleton/EmptyState/ErrorState.

**Snackbar:**
useSnackbarStore에서 상태 읽음. glass-medium + 타입별 컬러.

---

### Task 8: NotificationList + TimelineEntry

**NotificationList:**
```tsx
interface NotificationListProps {
  notifications: Notification[];
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}
```

**TimelineEntry:**
```tsx
interface TimelineEntryProps {
  entry: TimelineResponseList;
}
```

---

### Task 9: CongressmanCard + PartyCard

**CongressmanCard:**
```tsx
interface CongressmanCardProps {
  congressman: CongressmanDetail;
  onFollow: (id: string) => void;
  variant?: 'full' | 'compact';
}
```

**PartyCard:**
```tsx
interface PartyCardProps {
  party: PartyDetail;
  onFollow: (id: number) => void;
  variant?: 'full' | 'compact';
}
```

---

### Task 10: Templates (4개)

**AppLayout** — 기존 개선, organisms/SideNav + BottomNav 사용.
**FeedTemplate** — AppLayout + TabBar + children + sidebar.
**DetailTemplate** — AppLayout + hero + children + sidebar.
**AuthTemplate** — 네비 없음, 중앙 정렬.

---

### Task 11: 최종 검증

barrel export 정리, 전체 테스트, Storybook 확인.

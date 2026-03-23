# 모두의입법 아토믹 디자인 UI 리빌드 스펙

## 개요

기존 프레젠테이션 레이어를 아토믹 디자인 패턴으로 완전히 새로 만든다. 기능 코드(hooks, services, APIs, stores, types)는 그대로 재사용하고, UI 컴포넌트만 Atoms → Molecules → Organisms → Templates 순서로 Storybook에서 선행 구축한 후 페이지에 조합한다.

### 목표

- 아토믹 디자인 패턴으로 일관된 컴포넌트 계층 구조
- 각 컴포넌트가 독립적으로 완성 — 재사용성 극대화
- Storybook에서 완성도를 시각적으로 확인하며 개발
- 기존 디자인 토큰(CSS 변수, Tailwind, 글래스 유틸리티) 활용
- Twitter/X 피드 구조 + Linear 클린 글래스 디자인

### 접근 방식

**Bottom-Up: Storybook 선행 구축**

1. Atoms(10개) → Storybook 완성
2. Molecules(12개) → Storybook 완성
3. Organisms(15개) → Storybook 완성
4. Templates(4개) → Storybook 완성
5. 핵심 페이지부터 점진적 교체

### 기존 자산 활용

- **디자인 토큰**: `styles/globals.css` CSS 변수, `tailwind.config.js` 시멘틱 컬러 (이전 Phase 1에서 구축)
- **글래스 유틸리티**: `.glass-subtle`, `.glass-medium`, `.glass-heavy`, `.glass-text-safe`
- **애니메이션**: `skeleton-pulse`, `fade-in-up`, `prefers-reduced-motion` 미디어 쿼리
- **훅**: `useScrollDirection`, `useSwipeNavigation`, `usePullToRefresh`, `useIntersect`, `useTabType`
- **shadcn/ui 원본**: `app/common/components/ui/` — 수정하지 않고 래핑

### Props 네이밍 컨벤션

- **Organisms/Containers**: Zod 추론 타입을 그대로 사용 (snake_case 필드). 불필요한 camelCase 변환 없음.
- **Molecules/Atoms**: camelCase props. Container/Organism에서 데이터 추출 시 변환.
- 예: `BillCard`는 `bill: BillResponse`를 받고 내부에서 `bill.bill_info_dto.bill_id` 접근. `BillMeta`는 `stage: string`, `proposeDate: string`을 받음 (BillCard가 추출해서 전달).

### 기술 스택

- Next.js 15 (App Router) / React 19
- Tailwind CSS 3.4 + CSS 변수 기반 디자인 토큰
- shadcn/ui (커스텀 래핑)
- Storybook (컴포넌트 개발 및 문서화)
- `@use-gesture/react` (모바일 제스처)
- next-themes (다크 모드)
- Vitest + @testing-library/react (테스트)

---

## 1. 디렉토리 구조

```
app/common/components/
├── atoms/                          # shadcn 래핑 + 기본 요소
│   ├── GlassButton.tsx
│   ├── GlassBadge.tsx
│   ├── GlassInput.tsx
│   ├── GlassAvatar.tsx
│   ├── GlassCard.tsx               # 기존 이동
│   ├── GlassSkeleton.tsx           # 기존 이동
│   ├── Icon.tsx
│   ├── Logo.tsx
│   ├── Separator.tsx
│   └── StatusDot.tsx
│
├── molecules/                      # Atoms 조합
│   ├── NavItem.tsx
│   ├── TabBar.tsx
│   ├── SearchBar.tsx
│   ├── BillMeta.tsx
│   ├── ProposerAvatar.tsx
│   ├── VoteBar.tsx
│   ├── StatCard.tsx
│   ├── NotificationBadge.tsx
│   ├── KeywordChip.tsx
│   ├── FollowButton.tsx
│   ├── ActionBar.tsx
│   └── EmptyState.tsx              # 기존 이동
│
├── organisms/                      # Molecules + 도메인 데이터
│   ├── BillCard.tsx
│   ├── BillDetailHero.tsx
│   ├── ProgressSteps.tsx
│   ├── VoteResultGrid.tsx
│   ├── ProposerGrid.tsx
│   ├── SideNav.tsx                 # 기존 개선
│   ├── BottomNav.tsx
│   ├── RightSidebar.tsx            # 기존 개선
│   ├── SearchModal.tsx
│   ├── NotificationList.tsx
│   ├── CongressmanCard.tsx
│   ├── PartyCard.tsx
│   ├── TimelineEntry.tsx
│   ├── FeedList.tsx
│   └── Snackbar.tsx
│
├── templates/                      # 페이지 레이아웃 골격
│   ├── AppLayout.tsx               # 기존 개선
│   ├── FeedTemplate.tsx
│   ├── DetailTemplate.tsx
│   └── AuthTemplate.tsx
│
└── ui/                             # shadcn 원본 (수정 안 함)
    ├── button.tsx
    ├── badge.tsx
    ├── input.tsx
    ├── avatar.tsx
    ├── dialog.tsx
    ├── tabs.tsx
    ├── separator.tsx
    ├── dropdown-menu.tsx
    ├── accordion.tsx
    ├── card.tsx
    ├── popover.tsx
    └── tooltip.tsx
```

### 도메인 모듈 — Container만 유지

```
app/{module}/components/
├── {Module}Container.tsx     # hooks 호출 → organisms/templates에 데이터 전달
└── index.tsx                 # barrel export
```

기존 컴포넌트 파일들은 새 Container가 대체할 때까지 유지. 교체 완료 후 삭제.

---

## 2. Atoms (10개)

### 2.1 GlassButton

shadcn Button 래핑. 글래스 변형 추가.

```typescript
interface GlassButtonProps extends ButtonProps {
  variant?: 'primary' | 'glass' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}
```

| Variant | 라이트 모드 | 다크 모드 |
|---------|-----------|----------|
| `primary` | bg-primary, text-primary-foreground | CSS 변수 자동 전환 |
| `glass` | glass-subtle, text-foreground | glass-subtle (다크 토큰) |
| `outline` | border-border, text-foreground | CSS 변수 자동 전환 |
| `ghost` | transparent, text-muted-foreground | CSS 변수 자동 전환 |
| `danger` | bg-danger, text-danger-foreground | CSS 변수 자동 전환 |

호버: `primary` → bg-primary-hover, `glass` → glass-medium 전환.
트랜지션: `duration-[var(--duration-fast)] ease-[var(--easing-default)]`

### 2.2 GlassBadge

shadcn Badge 래핑. 법안 상태별 반투명 컬러 변형.

```typescript
interface GlassBadgeProps extends BadgeProps {
  variant?: 'primary' | 'accent' | 'warning' | 'danger' | 'glass' | 'outline';
}
```

| Variant | 배경 | 텍스트 |
|---------|------|--------|
| `primary` | primary/15% opacity | primary |
| `accent` | accent/15% opacity | accent |
| `warning` | warning/15% opacity | warning |
| `danger` | danger/15% opacity | danger |
| `glass` | glass-subtle | foreground |
| `outline` | transparent + border | foreground |

### 2.3 GlassInput

shadcn Input 래핑. 글래스 배경 + 아이콘 슬롯.

```typescript
interface GlassInputProps extends InputProps {
  icon?: React.ReactNode;
}
```

- 기본 스타일: `glass-subtle rounded-md`
- 포커스: `ring-2 ring-primary`
- 아이콘: 왼쪽에 위치, 패딩 자동 조정

### 2.4 GlassAvatar

shadcn Avatar 래핑. 정당 컬러 보더 지원.

```typescript
interface GlassAvatarProps extends AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  partyName?: string;     // 정당명 → PARTY_COLOR에서 보더 컬러 매핑
  src?: string;
  fallback?: string;      // 이름 첫 글자
}
```

| Size | 크기 | 보더 |
|------|------|------|
| `sm` | 28px | 1.5px |
| `md` | 40px | 2px |
| `lg` | 56px | 2px |
| `xl` | 80px | 3px |

### 2.5 GlassCard

✅ 이미 구현됨. `atoms/`로 이동.

```typescript
interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  level?: 'subtle' | 'medium' | 'heavy';
  hover?: boolean;
}
```

### 2.6 GlassSkeleton

✅ 이미 구현됨. `atoms/`로 이동.

```typescript
interface GlassSkeletonProps {
  lines?: number;
  variant?: 'line' | 'card';
}
```

### 2.7 Icon

lucide-react 래퍼. 통일된 사이즈/컬러. 타입 안전성을 위해 컴포넌트 레퍼런스를 받는다.

```typescript
interface IconProps {
  icon: LucideIcon;        // lucide 컴포넌트 레퍼런스 (e.g., Home, Search)
  size?: 'sm' | 'md' | 'lg';  // 16px | 20px | 24px
  className?: string;
}
```

> **참고**: `name: string`이 아닌 `icon: LucideIcon`을 사용하여 NavItem과 동일한 패턴 유지. 동적 아이콘이 필요한 경우는 별도 lookup map으로 처리.

### 2.8 Logo

라이트/다크 모드 로고.

```typescript
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';  // 32px | 140x28 | 222x37
}
```

### 2.9 Separator

shadcn Separator + 디자인 토큰.

```typescript
// shadcn Separator를 그대로 re-export. 스타일만 통일.
// bg-border 기본, orientation="horizontal"|"vertical"
```

### 2.10 StatusDot

알림 읽음/안읽음 인디케이터.

```typescript
interface StatusDotProps {
  active?: boolean;   // true → primary 색상 dot
  size?: 'sm' | 'md'; // 6px | 8px
}
```

---

## 3. Molecules (12개)

### 3.1 NavItem

Icon + Label + 활성 상태. SideNav와 BottomNav에서 공유.

```typescript
interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  compact?: boolean;    // true → 아이콘만 표시, 호버 시 툴팁
  onClick?: () => void; // 검색 버튼 등 커스텀 액션
}
```

- 활성: `bg-primary text-primary-foreground`
- 비활성: `text-muted-foreground hover:bg-primary-subtle hover:text-foreground`
- 트랜지션: `duration-fast`

### 3.2 TabBar

탭 그룹. pill/underline 변형 + 슬라이딩 인디케이터.

```typescript
interface TabBarProps {
  tabs: { label: string; value: string }[];
  activeValue: string;
  onChange: (value: string) => void;
  variant?: 'pill' | 'underline';
}
```

- `pill`: glass-subtle 배경 + 활성 탭에 primary 배경, rounded-md
- `underline`: 하단 보더 인디케이터 슬라이드
- 트랜지션: `duration-normal`, 인디케이터 `transform` 애니메이션

### 3.3 SearchBar

GlassInput + 검색 아이콘 + 제출 처리.

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}
```

### 3.4 BillMeta

법안 카드 상단 메타 정보. GlassBadge + 시간.

```typescript
interface BillMetaProps {
  stage: string;         // bill_stage → GlassBadge variant 자동 매핑
  proposeDate: string;   // → getTimeRemaining()으로 변환
}
```

스테이지-배지 매핑:
- 접수 → `primary`
- 위원회 심사 → `warning`
- 본회의 심의 → `warning`
- 공포 → `accent`
- 부결/폐기 → `danger`

### 3.5 ProposerAvatar

GlassAvatar + 이름 + 정당명.

```typescript
interface ProposerAvatarProps {
  name: string;
  imageUrl: string;
  partyName: string;
  partyId?: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;    // false → 아바타만
}
```

### 3.6 VoteBar

찬성/반대 비율 프로그레스 바.

```typescript
interface VoteBarProps {
  approvalCount: number;
  totalCount: number;
  showLabel?: boolean;
}
```

- 찬성: `bg-primary`, 반대: `bg-danger`, 비어있음: `bg-muted`
- 라벨: "128/200 (64%)"

### 3.7 StatCard

글래스 통계 카드. 숫자 + 라벨.

```typescript
interface StatCardProps {
  value: number | string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}
```

- GlassCard(subtle) 래핑
- 숫자: `text-display`(lg) 또는 `text-heading-lg`(md)
- 라벨: `text-caption text-muted-foreground`

### 3.8 NotificationBadge

아이콘 위 카운트 뱃지.

```typescript
interface NotificationBadgeProps {
  count: number;
  icon?: React.ReactNode;   // 기본: Bell 아이콘
}
```

- count > 0: primary 배경 dot/숫자, count > 99: "99+"
- count === 0: 뱃지 숨김

### 3.9 KeywordChip

검색 키워드 칩. 클릭 + 삭제.

```typescript
interface KeywordChipProps {
  keyword: string;
  onClick: (keyword: string) => void;
  onRemove: (keyword: string) => void;
}
```

- GlassBadge(glass) + X 버튼
- 호버: glass-medium 전환

### 3.10 FollowButton

팔로우/언팔로우 토글.

```typescript
interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
  count?: number;           // 팔로워 수 — 버튼 옆에 "N명" 표시
  size?: 'sm' | 'md';
}
```

- 팔로우(false): GlassButton(primary), rounded-full
- 팔로잉(true): GlassButton(outline), rounded-full, "팔로잉 ✓"
- 트랜지션: `easing-spring` (바운스 효과)

### 3.11 ActionBar

법안 카드 하단 액션 버튼 그룹.

```typescript
interface ActionBarProps {
  likeCount: number;
  viewCount?: number;
  isBookmarked: boolean;
  onBookmark: () => void;
  onShare: () => void;
}
```

- 좋아요: Icon + count (읽기 전용)
- 조회수: Icon + count (읽기 전용, optional)
- 북마크: 토글 (활성 시 primary fill)
- 공유: 클릭 → `copyClipBoard()`

### 3.12 EmptyState

✅ 이미 구현됨. `molecules/`로 이동.

```typescript
interface EmptyStateProps {
  message: string;
  ctaText?: string;
  ctaHref?: string;
  icon?: React.ReactNode;
}
```

---

## 4. Organisms (15개)

### 4.1 BillCard

피드용 법안 카드 완전체. 홈, 팔로잉, 검색, 북마크에서 재사용.

```typescript
interface BillCardProps {
  bill: BillResponse;
  onBookmark: (billId: string) => void;
  onShare: (billId: string) => void;
  variant?: 'default' | 'compact';  // compact: 사이드바용 작은 카드
}
```

> **참고**: `BillResponse`와 `BillDetail`은 현재 동일한 타입 (`BillDetailSchema = BillResponseSchema`). bill 내부의 `bill_info_dto.bill_id`를 추출하여 콜백에 전달. `compact` 변형은 우측 사이드바의 관련 법안 표시용 — 제목 + 배지만 표시.

**조합**: GlassCard(hover) > BillMeta + 제목(heading-sm) + 요약(body, 2줄 clamp) + ProposerAvatar + ActionBar

**구조**:
```
GlassCard(hover)
├── BillMeta (stage + time)
├── h3 (brief_summary)
├── p (gpt_summary || summary, line-clamp-2)
├── ProposerAvatar (대표 발의자)
└── ActionBar (like + view + bookmark + share)
```

### 4.2 BillDetailHero

법안 상세 상단 히어로.

```typescript
interface BillDetailHeroProps {
  bill: BillResponse;      // BillDetail === BillResponse (동일 타입)
  onBookmark: () => void;
  onShare: () => void;
}
```

> **참고**: `viewCount`는 `bill.bill_info_dto.view_count`에서 직접 읽음 — 별도 prop 불필요.

**조합**: GlassCard(medium) > GlassBadge(stage + 대수) + 제목(display) + 법안명(caption) + 메타(발의일, 조회수, 좋아요) + ActionBar

### 4.3 ProgressSteps

법안 진행 단계 시각화.

```typescript
interface ProgressStepsProps {
  currentStage: string;    // bill_stage
}
```

**디자인**: 수직 스텝 인디케이터
- 완료 단계: primary + 체크 아이콘
- 현재 단계: primary + 포인트 아이콘 + 텍스트 bold
- 미래 단계: muted + 숫자
- 각 단계 사이 연결선 (완료: primary, 미완료: muted)

### 4.4 VoteResultGrid

정당별 투표 결과 그리드.

```typescript
interface VoteResultGridProps {
  approvalCount: number;
  totalVoteCount: number;
  partyVoteList: PartyVote[];
  billResult?: string;
}
```

**조합**: GlassCard > VoteBar(전체) + 정당별 그리드(GlassAvatar + 정당명 + 투표수)

### 4.5 ProposerGrid

발의자 아바타 그리드.

```typescript
interface ProposerGridProps {
  representativeProposers: RepresentativeProposer[];
  publicProposers: PublicProposer[];
}
```

**디자인**: 대표발의자(상단, lg) + 공동발의자(하단, sm 그리드, 정당별 그룹)

### 4.6 SideNav

✅ 기존 개선. NavItem 조합으로 리팩터링.

```typescript
interface SideNavProps {
  compact?: boolean;
}
```

**조합**: Logo + NavItem[] + 검색 NavItem + 테마 토글
- full(lg+): 240px, 라벨 표시
- compact(md): 72px, 아이콘만 + 호버 툴팁

### 4.7 BottomNav

모바일 하단 글래스 네비.

```typescript
// Props 없음 — siteConfig에서 navItems 읽음
```

**조합**: glass-medium pill + NavItem[] + 슬라이딩 활성 인디케이터 + 무지개 검색 버튼
- `useScrollDirection` → 스크롤 다운 시 `translateY(100%)` 숨김
- 활성 인디케이터: `transition: left 500ms ease-out`

### 4.8 RightSidebar

✅ 기존 개선. children 슬롯.

```typescript
interface RightSidebarProps {
  children: React.ReactNode;
}
```

- sticky, 300px, lg+에서만 표시

### 4.9 SearchModal

글래스 모달 + 검색 + 키워드.

```typescript
// Props 없음 — useSearchModalStore에서 상태 읽음
```

**조합**: Dialog(glass-heavy overlay) > SearchBar + KeywordChip[] + "모두 지우기"
- 검색 결과는 `/search/:query` 페이지로 라우팅

### 4.10 NotificationList

알림 리스트. 날짜별 그룹핑 + 스와이프 삭제.

```typescript
interface NotificationListProps {
  notifications: Notification[];
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}
```

**디자인**:
- 그룹 헤더: "지난 한 주" / "지난 한 달" / "지난 알림" (getDateStatus)
- 아이템: GlassCard + StatusDot(읽음/안읽음) + 제목 + 내용 + 시간
- 모바일: `useSwipeNavigation`으로 좌측 스와이프 → 삭제 버튼 노출

### 4.11 CongressmanCard

의원 프로필 카드.

```typescript
interface CongressmanCardProps {
  congressman: CongressmanDetail;
  onFollow: (congressmanId: string) => void;
  variant?: 'full' | 'compact';  // full: 상세 페이지, compact: 리스트용
}
```

- full: GlassCard(medium) + GlassAvatar(xl) + 이름/정당/선거구 + StatCard(대표발의, 공동발의) + FollowButton
- compact: GlassCard(subtle, hover) + GlassAvatar(md) + 이름/정당

### 4.12 PartyCard

정당 프로필 카드.

```typescript
interface PartyCardProps {
  party: PartyDetail;
  onFollow: (partyId: number) => void;
  variant?: 'full' | 'compact';
}
```

- full: GlassCard(medium) + 정당 로고 + 정당 컬러 보더 + StatCard(의석수, 법안 발의수) + FollowButton
- compact: GlassCard(subtle, hover) + 정당 로고 + 정당명

### 4.13 TimelineEntry

타임라인 날짜별 엔트리.

```typescript
interface TimelineEntryProps {
  entry: TimelineResponseList;  // Zod 추론 타입 직접 사용 (snake_case 필드)
}
```

> **참고**: Container에서 `TimelineResponseList` 타입을 그대로 전달. Organism 내부에서 `entry.plenary_list`, `entry.committee_audit_list` 등 snake_case 필드에 직접 접근. 불필요한 camelCase 변환 없음.

**디자인**: 날짜 헤더(대형 타이포 M.DD + 요일) + 수직 타임라인 라인 + 각 섹션(본회의/위원회/접수)

### 4.14 FeedList

무한 스크롤 피드 래퍼.

```typescript
interface FeedListProps {
  children: React.ReactNode;    // BillCard[] 등
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onRefresh?: () => Promise<void>;  // 풀투리프레시
  emptyMessage?: string;
}
```

**내부**:
- `useIntersect` → 하단 감지 시 `onLoadMore`
- `usePullToRefresh` → 상단 당기기 시 `onRefresh`
- 스태거 페이드인: `animate-fade-in-up` + `animation-delay`
- 로딩: GlassSkeleton(card) 표시
- 에러: ErrorState 표시 (`isError` + `onRetry`)
- 빈 상태: EmptyState 표시 (`emptyMessage`)

### 4.15 Snackbar

토스트 알림.

```typescript
// Props 없음 — useSnackbarStore에서 상태 읽음
```

- 하단 중앙 고정, z-toast
- 타입별 컬러(success → accent, error → danger, info → primary)
- glass-medium 배경
- 자동 닫힘(duration), 선택적 액션 링크

---

## 5. Templates (4개)

### 5.1 AppLayout

3단/2단/모바일 반응형 레이아웃.

```typescript
interface AppLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}
```

**구조**:
- Desktop(lg+): SideNav(240px) + main(flex-1, max-640px) + RightSidebar(300px)
- Tablet(md): SideNav(compact, 72px) + main
- Mobile(<md): main + BottomNav(fixed bottom, 스크롤 반응)

### 5.2 FeedTemplate

피드 페이지 공통 골격.

```typescript
interface FeedTemplateProps {
  tabs?: { label: string; value: string }[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  sidebar?: React.ReactNode;
  children: React.ReactNode;     // FeedList 등
}
```

**구조**: AppLayout > TabBar(상단, optional) + children(중앙) + sidebar → rightSidebar

### 5.3 DetailTemplate

상세 페이지 공통 골격.

```typescript
interface DetailTemplateProps {
  hero: React.ReactNode;           // BillDetailHero, CongressmanCard(full) 등
  children: React.ReactNode;       // 콘텐츠 섹션들
  sidebar?: React.ReactNode;
}
```

**구조**: AppLayout > hero(상단) + Separator + children + sidebar → rightSidebar

### 5.4 AuthTemplate

로그인/온보딩 레이아웃.

```typescript
interface AuthTemplateProps {
  children: React.ReactNode;
}
```

**구조**: 네비 없음. 중앙 정렬, min-h-screen, 배경 그라데이션.

---

## 6. 페이지 조합표

| 페이지 | Template | Organisms | Container |
|--------|----------|-----------|-----------|
| 홈 (`/`) | FeedTemplate | TabBar + FeedList > BillCard[] | `FeedContainer` — useInfiniteBillMainfeed |
| 법안 상세 (`/bill/:id`) | DetailTemplate | BillDetailHero + ProgressSteps + VoteResultGrid + ProposerGrid | `BillDetailContainer` — useGetBillDetail, useMutateViewCount, useMutateBookmark |
| 타임라인 (`/timeline`) | AppLayout | StatCard(x3) + TimelineEntry[] (FeedList 래핑) | `TimelineContainer` — useInfiniteTimelineFeed, useGetTimelineBillState |
| 검색 (`/search/:id`) | AppLayout | TabBar + FeedList > BillCard[] / CongressmanCard(compact)[] | `SearchContainer` — useInfiniteSearchBill, useGetSearchCongressmanParty |
| 팔로잉 (`/following`) | FeedTemplate | CongressmanCard(compact)[] + FeedList > BillCard[] | `FollowingContainer` — useGetFollowingCongressman, useInfiniteFollowingBill |
| 마이페이지 (`/user/mypage`) | AppLayout | CongressmanCard(compact)[] + PartyCard(compact)[] + FeedList > BillCard[] | `MyPageContainer` — useGetUserInfo, useInfiniteBillBookmarked 등 |
| 의원 상세 (`/congressman/:id`) | DetailTemplate | CongressmanCard(full) + TabBar + FeedList > BillCard[] | `CongressmanDetailContainer` — useGetCongressmanDetail, useInfiniteCongressmanBills |
| 정당 상세 (`/party/:id`) | DetailTemplate | PartyCard(full) + CongressmanCard(compact) 그리드 + FeedList > BillCard[] | `PartyDetailContainer` — useGetPartyDetail, useGetPartyCongressman, useInfinitePartyBills |
| 알림 (`/notification`) | AppLayout | NotificationList | `NotificationContainer` — useGetNotification, usePutNotificationRead, useDeleteNotification |
| 로그인 (`/auth/login`) | AuthTemplate | GlassCard + Logo + GlassButton | 없음 (정적) |

### 우측 사이드바 구성

| 페이지 | 우측 사이드바 콘텐츠 |
|--------|---------------------|
| 홈 피드 | SearchBar + NotificationBadge 위젯 + 인기 법안 BillCard(compact)[] |
| 법안 상세 | 관련 법안 BillCard(compact)[] |
| 타임라인 | StatCard(회기 통계) |
| 의원/정당 상세 | 관련 의원/정당 카드 |
| 기타 | SearchBar + 인기 법안 |

---

## 7. Container 패턴

각 도메인 모듈에 Container 컴포넌트를 두어 hooks를 호출하고 organisms에 데이터를 전달한다.

```typescript
// app/bill/components/FeedContainer.tsx
'use client';

export default function FeedContainer() {
  const [tab, setTab] = useTabType(FEED_TAB.sortedByLatest);
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteBillMainfeed(tab);
  const bills = useMemo(() => data?.pages.flatMap(p => p.bill_list) ?? [], [data]);

  const handleBookmark = useCallback((billId: string) => { /* ... */ }, []);
  const handleShare = useCallback((billId: string) => { /* ... */ }, []);

  return (
    <FeedTemplate
      tabs={siteConfig.feedTabs}
      activeTab={tab}
      onTabChange={setTab}
      sidebar={<HomeSidebar />}
    >
      <FeedList onLoadMore={fetchNextPage} hasMore={hasNextPage} isLoading={isFetching}>
        {bills.map(bill => (
          <BillCard key={bill.bill_info_dto.bill_id} bill={bill} onBookmark={handleBookmark} onShare={handleShare} />
        ))}
      </FeedList>
    </FeedTemplate>
  );
}
```

**원칙**:
- Container는 `'use client'` (hooks 사용)
- Container는 UI를 직접 렌더링하지 않음 — organisms/templates에 위임
- Container는 데이터 변환/이벤트 핸들러만 담당
- Page(서버 컴포넌트)는 Container를 Suspense/ErrorBoundary로 감싸기만 함

---

## 8. 모바일 인터랙션

### 8.1 스크롤 반응 네비

- `useScrollDirection` 훅 (이미 구현됨)
- BottomNav: 스크롤 다운 → `translateY(100%)`, 스크롤 업 → `translateY(0)`
- 트랜지션: `duration-normal ease-default`

### 8.2 스와이프 탭 전환

- `useSwipeNavigation` 훅 (이미 구현됨)
- FeedTemplate: 좌우 스와이프 → `onTabChange` 호출
- 탭 콘텐츠: `transform: translateX` 슬라이드 애니메이션

### 8.3 풀투리프레시

- `usePullToRefresh` 훅 (이미 구현됨)
- FeedList: 상단에서 당기기 → 로딩 인디케이터 → `onRefresh` (React Query refetch)
- 시각 피드백: 당기는 거리에 비례한 인디케이터 표시

### 8.4 스와이프 삭제

- `useSwipeNavigation` 활용 (좌측 스와이프만)
- NotificationList 아이템: 좌측 스와이프 → 삭제 버튼 노출 (GlassButton danger)

---

## 9. Storybook 구성

```
stories/
├── design-tokens/           # ✅ 이미 구축 (Colors, Typography, Spacing, Glass)
├── atoms/
│   ├── GlassButton.stories.tsx
│   ├── GlassBadge.stories.tsx
│   ├── GlassInput.stories.tsx
│   ├── GlassAvatar.stories.tsx
│   ├── GlassCard.stories.tsx      # ✅ 이미 존재
│   ├── GlassSkeleton.stories.tsx  # ✅ 이미 존재
│   ├── Icon.stories.tsx
│   ├── Logo.stories.tsx
│   └── StatusDot.stories.tsx
├── molecules/
│   ├── NavItem.stories.tsx
│   ├── TabBar.stories.tsx
│   ├── SearchBar.stories.tsx
│   ├── BillMeta.stories.tsx
│   ├── StatCard.stories.tsx
│   ├── FollowButton.stories.tsx
│   ├── ActionBar.stories.tsx
│   └── ... (나머지)
├── organisms/
│   ├── BillCard.stories.tsx
│   ├── BillDetailHero.stories.tsx
│   ├── SideNav.stories.tsx        # ✅ 이미 존재
│   ├── BottomNav.stories.tsx
│   ├── FeedList.stories.tsx
│   └── ... (나머지)
└── templates/
    ├── AppLayout.stories.tsx      # ✅ 이미 존재
    ├── FeedTemplate.stories.tsx
    ├── DetailTemplate.stories.tsx
    └── AuthTemplate.stories.tsx
```

각 스토리는:
- Default + 주요 Variant 스토리
- 다크 모드 스토리
- 모바일 뷰포트 스토리 (스토리북 viewport addon 활용)

---

## 10. 구현 순서

### Phase 1: Atoms (10개)

GlassButton → GlassBadge → GlassInput → GlassAvatar → Icon → Logo → Separator → StatusDot → GlassCard(이동) → GlassSkeleton(이동)

### Phase 2: Molecules (12개)

NavItem → TabBar → SearchBar → BillMeta → ProposerAvatar → VoteBar → StatCard → NotificationBadge → KeywordChip → FollowButton → ActionBar → EmptyState(이동)

### Phase 3: Organisms (15개)

BillCard → BillDetailHero → ProgressSteps → VoteResultGrid → ProposerGrid → SideNav(개선) → BottomNav → RightSidebar(개선) → SearchModal → NotificationList → CongressmanCard → PartyCard → TimelineEntry → FeedList → Snackbar

### Phase 4: Templates (4개)

AppLayout(개선) → FeedTemplate → DetailTemplate → AuthTemplate

### Phase 5: 페이지 교체 (10개)

홈 피드 → 법안 상세 → 타임라인 → 검색 → 팔로잉 → 마이페이지 → 의원 상세 → 정당 상세 → 알림 → 로그인

---

## 11. 테스트 전략

각 계층별 테스트 접근:

| 계층 | 테스트 방식 | 검증 내용 |
|------|-----------|----------|
| Atoms | 유닛 테스트 | 렌더링, props 전달, 이벤트, 접근성(role, aria) |
| Molecules | 유닛 테스트 | Atoms 조합 동작, 상태 변화, 콜백 호출 |
| Organisms | 통합 테스트 | 데이터 바인딩, 사용자 인터랙션 플로우 |
| Templates | 스냅샷/시각 테스트 | 레이아웃 구조, 반응형 |
| Pages | E2E (Playwright) | 전체 플로우, 라우팅, 데이터 로딩 |

**TDD**: Atoms/Molecules는 테스트 선행 작성. Organisms/Templates는 Storybook 시각 확인 병행.

---

## 12. 접근성

- 모든 인터랙티브 요소: `focus-visible` 스타일 (primary 컬러 outline)
- 버튼/링크: 최소 44x44px 터치 타겟 (모바일)
- 시멘틱 HTML: `nav`, `main`, `aside`, `section`, `article` 적절 사용
- ARIA: `aria-current="page"` (네비), `aria-label` (아이콘 버튼), `role="tablist"` (탭)
- `prefers-reduced-motion`: 애니메이션 비활성화
- `prefers-contrast: more`: 글래스 효과 → 불투명 배경 폴백
- 글래스 위 텍스트: `glass-text-safe` 또는 최소 `glass-bg-medium` 보장

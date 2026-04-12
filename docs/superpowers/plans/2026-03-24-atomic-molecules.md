# Molecules 구현 계획 (Plan 2/4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Atoms를 조합한 Molecule 컴포넌트 12개를 Storybook에서 완성한다.

**Architecture:** 각 Molecule은 `app/common/components/atoms/`에서 Atoms를 import하여 조합. `app/common/components/molecules/` 디렉토리에 생성. 기존 EmptyState는 이동. 모든 Molecule은 순수 프레젠테이션 — hooks나 stores를 직접 호출하지 않음.

**Tech Stack:** React 19, TypeScript strict, Tailwind CSS, Atoms from `@/app/common/components/atoms`, Vitest, Storybook

**Spec:** `docs/superpowers/specs/2026-03-24-atomic-design-rebuild.md` 섹션 3

**Depends on:** Plan 1 (Atoms) — 완료됨

---

## File Structure

```
app/common/components/molecules/
├── NavItem.tsx
├── TabBar.tsx
├── SearchBar.tsx
├── BillMeta.tsx
├── ProposerAvatar.tsx
├── VoteBar.tsx
├── StatCard.tsx
├── NotificationBadge.tsx
├── KeywordChip.tsx
├── FollowButton.tsx
├── ActionBar.tsx
├── EmptyState.tsx          # 기존 이동
└── index.tsx

stories/molecules/
├── NavItem.stories.tsx
├── TabBar.stories.tsx
├── SearchBar.stories.tsx
├── BillMeta.stories.tsx
├── ProposerAvatar.stories.tsx
├── VoteBar.stories.tsx
├── StatCard.stories.tsx
├── NotificationBadge.stories.tsx
├── KeywordChip.stories.tsx
├── FollowButton.stories.tsx
├── ActionBar.stories.tsx
└── EmptyState.stories.tsx

tests/molecules/
├── nav-item.test.tsx
├── tab-bar.test.tsx
├── search-bar.test.tsx
├── bill-meta.test.tsx
├── proposer-avatar.test.tsx
├── vote-bar.test.tsx
├── stat-card.test.tsx
├── notification-badge.test.tsx
├── keyword-chip.test.tsx
├── follow-button.test.tsx
├── action-bar.test.tsx
└── empty-state.test.tsx
```

---

### Task 1: molecules 디렉토리 + EmptyState 이동

- [ ] Create `app/common/components/molecules/` directory
- [ ] Move `app/common/components/EmptyState/EmptyState.tsx` → `app/common/components/molecules/EmptyState.tsx`
- [ ] Move `app/common/components/ErrorState/ErrorState.tsx` → `app/common/components/molecules/ErrorState.tsx`
- [ ] Create barrel export `molecules/index.tsx`
- [ ] Re-export from old locations for backward compat
- [ ] Run `npm test`, verify pass
- [ ] Commit: `refactor(molecules): EmptyState, ErrorState를 molecules/ 디렉토리로 이동`

---

### Task 2: NavItem

```tsx
// app/common/components/molecules/NavItem.tsx
'use client';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Icon } from '@/app/common/components/atoms';
import { cn } from '@/app/common/lib/utils';

export interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export function NavItem({ icon, label, href, active = false, compact = false, onClick }: NavItemProps) {
  const classes = cn(
    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
    'duration-[var(--duration-fast)] ease-[var(--easing-default)]',
    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-primary-subtle hover:text-foreground',
    compact && 'justify-center px-0',
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes} title={compact ? label : undefined}>
        <Icon icon={icon} />
        {!compact && <span>{label}</span>}
      </button>
    );
  }

  return (
    <Link href={href ?? '/'} className={classes} aria-current={active ? 'page' : undefined} title={compact ? label : undefined}>
      <Icon icon={icon} />
      {!compact && <span>{label}</span>}
    </Link>
  );
}
```

Tests (5): renders label+icon, active state (bg-primary), compact mode (no label), aria-current on active, onClick mode (button not link).
Story: `Molecules/NavItem`, Active, Inactive, Compact, AsButton.
Commit: `feat(molecules): NavItem 컴포넌트 구현`

---

### Task 3: TabBar

```tsx
// app/common/components/molecules/TabBar.tsx
'use client';
import { cn } from '@/app/common/lib/utils';

export interface TabBarProps {
  tabs: { label: string; value: string }[];
  activeValue: string;
  onChange: (value: string) => void;
  variant?: 'pill' | 'underline';
}

export function TabBar({ tabs, activeValue, onChange, variant = 'pill' }: TabBarProps) {
  const activeIndex = tabs.findIndex((t) => t.value === activeValue);

  return (
    <div className={cn('relative flex', variant === 'pill' ? 'glass-subtle rounded-md p-1' : 'border-b border-border')}>
      {tabs.map((tab) => {
        const isActive = tab.value === activeValue;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex-1 text-center py-2 text-sm font-medium transition-all',
              'duration-[var(--duration-normal)] ease-[var(--easing-default)]',
              variant === 'pill' && isActive && 'bg-primary text-primary-foreground rounded-sm',
              variant === 'pill' && !isActive && 'text-muted-foreground hover:text-foreground',
              variant === 'underline' && isActive && 'text-foreground border-b-2 border-primary',
              variant === 'underline' && !isActive && 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
```

Tests (5): renders all tabs, active tab (aria-selected=true), onChange called on click, pill variant (bg-primary on active), underline variant (border-b-2 on active).
Story: `Molecules/TabBar`, Pill, Underline, ThreeTabs.
Commit: `feat(molecules): TabBar 컴포넌트 구현`

---

### Task 4: SearchBar

```tsx
// app/common/components/molecules/SearchBar.tsx
'use client';
import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { GlassInput } from '@/app/common/components/atoms';

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

export function SearchBar({ onSearch, placeholder = '법안, 의원, 정당 검색...', defaultValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim()) onSearch(value.trim());
    },
    [value, onSearch],
  );

  return (
    <form onSubmit={handleSubmit} role="search">
      <GlassInput
        icon={<Search className="h-4 w-4" />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
```

Tests (4): renders input with placeholder, calls onSearch on submit, doesn't call onSearch for empty input, renders search icon.
Story: `Molecules/SearchBar`, Default, WithValue.
Commit: `feat(molecules): SearchBar 컴포넌트 구현`

---

### Task 5: BillMeta

```tsx
// app/common/components/molecules/BillMeta.tsx
import { GlassBadge } from '@/app/common/components/atoms';
import { getTimeRemaining } from '@/app/common/utils';

const stageVariantMap: Record<string, 'primary' | 'accent' | 'warning' | 'danger'> = {
  접수: 'primary',
  '위원회 심사': 'warning',
  '본회의 심의': 'warning',
  공포: 'accent',
  가결: 'accent',
  부결: 'danger',
  폐기: 'danger',
};

export interface BillMetaProps {
  stage: string;
  proposeDate: string;
}

export function BillMeta({ stage, proposeDate }: BillMetaProps) {
  const variant = stageVariantMap[stage] ?? 'glass';
  return (
    <div className="flex items-center justify-between">
      <GlassBadge variant={variant}>{stage}</GlassBadge>
      <span className="text-xs text-muted-foreground">{getTimeRemaining(proposeDate)}</span>
    </div>
  );
}
```

Tests (3): renders stage badge, renders time, maps stage to correct variant.
Story: `Molecules/BillMeta`, Reception, Committee, Passed, Rejected.
Commit: `feat(molecules): BillMeta 컴포넌트 구현`

---

### Task 6: ProposerAvatar, VoteBar, StatCard

3개를 한 태스크로 묶어 구현.

**ProposerAvatar**: GlassAvatar + name label + party name.
```tsx
export interface ProposerAvatarProps {
  name: string; imageUrl: string; partyName: string; partyId?: number;
  size?: 'sm' | 'md'; showLabel?: boolean;
}
```

**VoteBar**: 찬성/반대 비율 바.
```tsx
export interface VoteBarProps {
  approvalCount: number; totalCount: number; showLabel?: boolean;
}
```

**StatCard**: GlassCard + 숫자 + 라벨.
```tsx
export interface StatCardProps {
  value: number | string; label: string; size?: 'sm' | 'md' | 'lg';
}
```

Tests: 3+3+3 = 9 tests.
Stories: 3 story files.
Commit: `feat(molecules): ProposerAvatar, VoteBar, StatCard 구현`

---

### Task 7: NotificationBadge, KeywordChip, FollowButton

3개를 한 태스크로 묶어 구현.

**NotificationBadge**: Icon + count badge.
```tsx
export interface NotificationBadgeProps { count: number; icon?: React.ReactNode; }
```

**KeywordChip**: GlassBadge + X button.
```tsx
export interface KeywordChipProps {
  keyword: string; onClick: (keyword: string) => void; onRemove: (keyword: string) => void;
}
```

**FollowButton**: 팔로우/팔로잉 토글.
```tsx
export interface FollowButtonProps {
  isFollowing: boolean; onToggle: () => void; count?: number; size?: 'sm' | 'md';
}
```

Tests: 3+3+4 = 10 tests.
Stories: 3 story files.
Commit: `feat(molecules): NotificationBadge, KeywordChip, FollowButton 구현`

---

### Task 8: ActionBar

```tsx
// app/common/components/molecules/ActionBar.tsx
'use client';
import { ThumbsUp, Eye, Bookmark, Share2 } from 'lucide-react';
import { GlassButton, Icon } from '@/app/common/components/atoms';
import { cn } from '@/app/common/lib/utils';

export interface ActionBarProps {
  likeCount: number;
  viewCount?: number;
  isBookmarked: boolean;
  onBookmark: () => void;
  onShare: () => void;
}

export function ActionBar({ likeCount, viewCount, isBookmarked, onBookmark, onShare }: ActionBarProps) {
  return (
    <div className="flex items-center gap-4 pt-3 border-t border-border">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon icon={ThumbsUp} size="sm" /> {likeCount}
      </span>
      {viewCount !== undefined && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Icon icon={Eye} size="sm" /> {viewCount}
        </span>
      )}
      <div className="ml-auto flex items-center gap-2">
        <GlassButton variant="ghost" size="icon" onClick={onBookmark} aria-label={isBookmarked ? '북마크 해제' : '북마크'}>
          <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-primary text-primary')} />
        </GlassButton>
        <GlassButton variant="ghost" size="icon" onClick={onShare} aria-label="공유">
          <Share2 className="h-4 w-4" />
        </GlassButton>
      </div>
    </div>
  );
}
```

Tests (5): renders like count, renders view count when provided, bookmark toggle (fill-primary when bookmarked), calls onBookmark, calls onShare.
Story: `Molecules/ActionBar`, Default, Bookmarked, WithViewCount.
Commit: `feat(molecules): ActionBar 컴포넌트 구현`

---

### Task 9: 최종 검증

- [ ] Final barrel export `molecules/index.tsx` with all 12+1 (EmptyState, ErrorState) exports
- [ ] Run `npm test` — all tests pass
- [ ] Storybook build check
- [ ] Commit: `feat(molecules): Molecules 계층 완성 — barrel export 정리`

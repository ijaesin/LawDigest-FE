# 모두의입법 디자인 시스템 전면 개선 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 글래스모피즘 기반 디자인 시스템을 Storybook에서 선행 구축하고, 3단 레이아웃 + 반응형 + 다크 모드를 적용하여 전체 서비스를 리디자인한다.

**Architecture:** CSS 변수 기반 디자인 토큰을 `globals.css`에 정의하고, Tailwind 설정과 연동. 글래스모피즘 컴포넌트(`GlassCard`, `GlassSkeleton`)를 공통 컴포넌트로 구축. 3단 레이아웃(`AppLayout`)을 새로 만들어 기존 `Layout` 컴포넌트를 대체. 모든 새 컴포넌트는 Storybook에서 먼저 개발/문서화한 후 페이지에 적용.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS 3.4, shadcn/ui, Storybook, `@use-gesture/react`, next-themes

**Spec:** `docs/superpowers/specs/2026-03-23-design-system-overhaul.md`

---

## File Structure

### 새로 생성할 파일

```
app/common/components/
├── ui/
│   └── glass-card.tsx                    # GlassCard 컴포넌트 (글래스 레벨별)
├── GlassSkeleton/
│   └── GlassSkeleton.tsx                 # 글래스 스켈레톤 로딩 컴포넌트
├── EmptyState/
│   └── EmptyState.tsx                    # 통합 빈 상태 컴포넌트
├── ErrorState/
│   └── ErrorState.tsx                    # 통합 에러 상태 컴포넌트
├── Layout/
│   ├── AppLayout/
│   │   └── AppLayout.tsx                 # 새 3단/2단/모바일 반응형 레이아웃
│   ├── SideNav/
│   │   └── SideNav.tsx                   # 좌측 사이드바 네비게이션
│   └── RightSidebar/
│       └── RightSidebar.tsx              # 우측 사이드바
app/common/hooks/
└── useScrollDirection.ts                 # 스크롤 방향 감지 훅
stories/
├── design-tokens/
│   ├── Colors.stories.tsx                # 컬러 토큰 문서화
│   ├── Typography.stories.tsx            # 타이포 토큰 문서화
│   ├── Spacing.stories.tsx               # 스페이싱 토큰 문서화
│   └── GlassEffects.stories.tsx          # 글래스 효과 문서화
├── primitives/
│   ├── Button.stories.tsx                # 버튼 새 테마 스토리
│   └── Badge.stories.tsx                 # 배지 새 테마 스토리
├── components/
│   ├── GlassCard.stories.tsx             # 글래스 카드 스토리
│   ├── GlassSkeleton.stories.tsx         # 스켈레톤 스토리
│   ├── EmptyState.stories.tsx            # 빈 상태 스토리
│   └── ErrorState.stories.tsx            # 에러 상태 스토리
└── patterns/
    ├── AppLayout.stories.tsx             # 레이아웃 패턴 스토리
    ├── SideNav.stories.tsx               # 사이드 네비 스토리
    └── RightSidebar.stories.tsx          # 우측 사이드바 스토리
tests/
├── components/
│   ├── glass-card.test.tsx
│   ├── glass-skeleton.test.tsx
│   ├── empty-state.test.tsx
│   └── error-state.test.tsx
├── hooks/
│   └── useScrollDirection.test.ts
└── layout/
    ├── app-layout.test.tsx
    ├── side-nav.test.tsx
    └── right-sidebar.test.tsx
```

### 수정할 파일

```
styles/globals.css                        # 디자인 토큰 (CSS 변수) 전면 재정의
tailwind.config.js                        # 테마 확장, 레거시 컬러 제거
.storybook/preview.ts                     # 글로벌 CSS 임포트, 다크 모드 데코레이터
app/layout.tsx                            # AppLayout 적용
app/page.tsx                              # 홈 피드 3단 레이아웃 적용
app/bill/components/Bill.tsx              # 글래스 카드 스타일 적용
app/bill/[id]/page.tsx                    # 법안 상세 리디자인
app/common/components/Layout/Nav/Nav.tsx  # 글래스 개선 + 스크롤 반응
app/common/components/Loading/Loading.tsx # GlassSkeleton으로 교체
app/notification/components/NotificationTopThree.tsx  # 우측 사이드바 이동
app/search/components/SearchModal.tsx     # 글래스 오버레이 적용
package.json                              # @use-gesture/react 추가
```

---

## Phase 1: 기반 구축

### Task 1: 디자인 토큰 정의 — CSS 변수

**Files:**
- Modify: `styles/globals.css`
- Test: Storybook 시각 확인

- [ ] **Step 1: 라이트 모드 CSS 변수 업데이트**

`styles/globals.css`의 `:root` 블록에서 기존 shadcn 변수 값을 스펙의 새 HSL 값으로 교체하고, 신규 시멘틱 변수를 추가한다.

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 9%;
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;
    --primary-hover: 239 84% 57%;
    --primary-subtle: 226 100% 97%;
    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 45%;
    --tertiary-foreground: 0 0% 64%;
    --accent: 160 84% 39%;
    --accent-foreground: 0 0% 100%;
    --accent-subtle: 152 81% 96%;
    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 100%;
    --danger: 0 84% 60%;
    --danger-foreground: 0 0% 100%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --surface: 0 0% 100%;
    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: 239 84% 67%;
    --radius: 0.625rem;

    /* Glass tokens */
    --glass-bg-subtle: rgba(255, 255, 255, 0.4);
    --glass-bg-medium: rgba(255, 255, 255, 0.6);
    --glass-bg-heavy: rgba(255, 255, 255, 0.8);
    --glass-border: rgba(255, 255, 255, 0.2);

    /* Animation tokens */
    --duration-fast: 150ms;
    --duration-normal: 200ms;
    --duration-slow: 300ms;
    --easing-default: ease-out;
    --easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

    /* Z-index tokens */
    --z-base: 0;
    --z-sticky: 50;
    --z-nav: 100;
    --z-header: 150;
    --z-dropdown: 200;
    --z-modal: 300;
    --z-toast: 400;

    /* Radius tokens */
    --radius-sm: 0.375rem;
    --radius-md: 0.625rem;
    --radius-lg: 1rem;
    --radius-full: 9999px;
  }
}
```

- [ ] **Step 2: 다크 모드 CSS 변수 업데이트**

`.dark` 블록의 변수를 스펙에 맞게 교체한다.

```css
  .dark {
    --background: 0 0% 4%;
    --foreground: 0 0% 98%;
    --card: 0 0% 9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 9%;
    --popover-foreground: 0 0% 98%;
    --primary: 235 82% 75%;
    --primary-foreground: 0 0% 9%;
    --primary-hover: 235 82% 82%;
    --primary-subtle: 239 84% 67% / 0.15;
    --secondary: 0 0% 15%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 64%;
    --tertiary-foreground: 0 0% 32%;
    --accent: 160 67% 52%;
    --accent-foreground: 0 0% 9%;
    --accent-subtle: 160 84% 39% / 0.15;
    --warning: 45 93% 56%;
    --warning-foreground: 0 0% 9%;
    --danger: 0 91% 71%;
    --danger-foreground: 0 0% 9%;
    --destructive: 0 91% 71%;
    --destructive-foreground: 0 0% 9%;
    --surface: 0 0% 9%;
    --border: 0 0% 15%;
    --input: 0 0% 15%;
    --ring: 235 82% 75%;

    /* Glass tokens (dark) */
    --glass-bg-subtle: rgba(23, 23, 23, 0.4);
    --glass-bg-medium: rgba(23, 23, 23, 0.6);
    --glass-bg-heavy: rgba(23, 23, 23, 0.8);
    --glass-border: rgba(255, 255, 255, 0.1);
  }
```

- [ ] **Step 3: 글래스/애니메이션/접근성 유틸리티 CSS 추가**

`globals.css`에 글래스모피즘 유틸리티 클래스, 스켈레톤 애니메이션, 접근성 미디어 쿼리를 추가한다.

```css
@layer utilities {
  /* Glass levels */
  .glass-subtle {
    background: var(--glass-bg-subtle);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--glass-border);
  }
  .glass-medium {
    background: var(--glass-bg-medium);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border);
  }
  .glass-heavy {
    background: var(--glass-bg-heavy);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
  }

  /* Glass text safety */
  .glass-text-safe {
    text-shadow: 0 0 8px hsl(var(--background));
  }
}

/* Skeleton animation */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

/* Accessibility: reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Accessibility: high contrast — disable glass */
@media (prefers-contrast: more) {
  .glass-subtle, .glass-medium, .glass-heavy {
    background: hsl(var(--surface));
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border: 1px solid hsl(var(--border));
  }
  .glass-text-safe {
    text-shadow: none;
  }
}

/* Accessibility: reduced transparency */
@media (prefers-reduced-transparency: reduce) {
  .glass-subtle, .glass-medium, .glass-heavy {
    background: hsl(var(--surface));
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

- [ ] **Step 4: 타이포/스페이싱 토큰 메모**

> **참고**: 타이포그래피(`--text-display` 등)와 스페이싱(`--space-*`) 토큰은 CSS 변수로 별도 정의하지 않는다. Tailwind의 기존 유틸리티 클래스(`text-[28px]`, `gap-4` 등)를 직접 사용하며, Storybook 문서에서 권장 값을 가이드한다. 이렇게 하면 불필요한 추상화 없이 Tailwind 에코시스템과 자연스럽게 통합된다.

- [ ] **Step 5: 레거시 다크 모드 body 클래스 정리**

`globals.css`의 body 스타일에서 레거시 `dark:bg-dark-b lg:dark:bg-dark-pb` 등을 제거하고 시멘틱 변수 사용으로 통일한다.

- [ ] **Step 5: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공, CSS 변수 정상 적용

- [ ] **Step 6: 커밋**

```bash
git add styles/globals.css
git commit -m "feat(design-tokens): CSS 변수 기반 디자인 토큰 전면 재정의"
```

---

### Task 2: Tailwind 설정 업데이트

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: 시멘틱 컬러 확장 추가**

`tailwind.config.js`의 `theme.extend.colors`에 새 시멘틱 토큰을 추가한다. 기존 shadcn 색상과 `borderColor`(정당 컬러)는 유지.

```js
colors: {
  // shadcn 기본 (기존 유지)
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
    hover: 'hsl(var(--primary-hover))',
    subtle: 'hsl(var(--primary-subtle))',
  },
  secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
  destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
  muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
  accent: {
    DEFAULT: 'hsl(var(--accent))',
    foreground: 'hsl(var(--accent-foreground))',
    subtle: 'hsl(var(--accent-subtle))',
  },
  popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
  card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
  // 신규 시멘틱
  surface: 'hsl(var(--surface))',
  warning: { DEFAULT: 'hsl(var(--warning))', foreground: 'hsl(var(--warning-foreground))' },
  danger: { DEFAULT: 'hsl(var(--danger))', foreground: 'hsl(var(--danger-foreground))' },
  'tertiary-foreground': 'hsl(var(--tertiary-foreground))',
  // 글래스
  glass: {
    subtle: 'var(--glass-bg-subtle)',
    medium: 'var(--glass-bg-medium)',
    heavy: 'var(--glass-bg-heavy)',
    border: 'var(--glass-border)',
  },
},
```

- [ ] **Step 2: borderRadius 토큰 업데이트**

```js
borderRadius: {
  lg: 'var(--radius-lg)',
  md: 'var(--radius-md)',
  sm: 'var(--radius-sm)',
  full: 'var(--radius-full)',
},
```

- [ ] **Step 3: z-index 토큰 추가**

```js
zIndex: {
  base: 'var(--z-base)',
  sticky: 'var(--z-sticky)',
  nav: 'var(--z-nav)',
  header: 'var(--z-header)',
  dropdown: 'var(--z-dropdown)',
  modal: 'var(--z-modal)',
  toast: 'var(--z-toast)',
},
```

- [ ] **Step 4: 레거시 컬러 제거 (점진적)**

`gray`, `primary-1/2/3`, `dark-b/l/pb`, `theme-alert/info` 등 레거시 컬러를 일단 유지하되, 코드에서 사용하는 곳이 없으면 제거. 사용처가 있으면 `@deprecated` 주석 추가.

> **주의**: 레거시 컬러는 Phase 2~5에서 각 페이지 마이그레이션 시 점진적으로 제거. Task 2에서는 새 토큰 추가만 하고 기존은 그대로 둔다.

- [ ] **Step 5: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공

- [ ] **Step 6: 커밋**

```bash
git add tailwind.config.js
git commit -m "feat(tailwind): 시멘틱 컬러, 글래스, z-index 토큰 추가"
```

---

### Task 3: GlassCard 컴포넌트

**Files:**
- Create: `app/common/components/ui/glass-card.tsx`
- Test: `tests/components/glass-card.test.tsx`
- Story: `stories/components/GlassCard.stories.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/components/glass-card.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlassCard } from '@/app/common/components/ui/glass-card';

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Hello</GlassCard>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies subtle glass level by default', () => {
    const { container } = render(<GlassCard>Content</GlassCard>);
    expect(container.firstChild).toHaveClass('glass-subtle');
  });

  it('applies medium glass level', () => {
    const { container } = render(<GlassCard level="medium">Content</GlassCard>);
    expect(container.firstChild).toHaveClass('glass-medium');
  });

  it('applies heavy glass level', () => {
    const { container } = render(<GlassCard level="heavy">Content</GlassCard>);
    expect(container.firstChild).toHaveClass('glass-heavy');
  });

  it('supports hover effect', () => {
    const { container } = render(<GlassCard hover>Content</GlassCard>);
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });

  it('merges custom className', () => {
    const { container } = render(<GlassCard className="custom">Content</GlassCard>);
    expect(container.firstChild).toHaveClass('custom');
    expect(container.firstChild).toHaveClass('glass-subtle');
  });

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<GlassCard ref={ref}>Content</GlassCard>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- tests/components/glass-card.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: GlassCard 구현**

```tsx
// app/common/components/ui/glass-card.tsx
import * as React from 'react';
import { cn } from '@/app/common/lib/utils';

const glassLevelMap = {
  subtle: 'glass-subtle',
  medium: 'glass-medium',
  heavy: 'glass-heavy',
} as const;

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: keyof typeof glassLevelMap;
  hover?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, level = 'subtle', hover = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        glassLevelMap[level],
        'rounded-md p-4 md:p-6 transition-all',
        'duration-[var(--duration-normal)] ease-[var(--easing-default)]',
        hover && 'hover:-translate-y-0.5 hover:bg-[var(--glass-bg-medium)] cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- tests/components/glass-card.test.tsx`
Expected: PASS

- [ ] **Step 5: Storybook 스토리 작성**

```tsx
// stories/components/GlassCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { GlassCard } from '@/app/common/components/ui/glass-card';

const meta: Meta<typeof GlassCard> = {
  title: 'Components/GlassCard',
  component: GlassCard,
  argTypes: {
    level: { control: 'select', options: ['subtle', 'medium', 'heavy'] },
    hover: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof GlassCard>;

export const Subtle: Story = { args: { level: 'subtle', children: 'Subtle glass card content' } };
export const Medium: Story = { args: { level: 'medium', children: 'Medium glass card content' } };
export const Heavy: Story = { args: { level: 'heavy', children: 'Heavy glass card content' } };
export const Hoverable: Story = { args: { level: 'subtle', hover: true, children: 'Hover me' } };
export const DarkMode: Story = {
  args: { level: 'subtle', children: 'Dark mode glass card' },
  parameters: { backgrounds: { default: 'dark' } },
};
```

- [ ] **Step 6: Storybook 확인**

Run: `npm run storybook`
Expected: GlassCard 스토리가 3단계 글래스 레벨로 표시

- [ ] **Step 7: 커밋**

```bash
git add app/common/components/ui/glass-card.tsx tests/components/glass-card.test.tsx stories/components/GlassCard.stories.tsx
git commit -m "feat(ui): GlassCard 컴포넌트 구현 (subtle/medium/heavy)"
```

---

### Task 4: GlassSkeleton 로딩 컴포넌트

**Files:**
- Create: `app/common/components/GlassSkeleton/GlassSkeleton.tsx`
- Test: `tests/components/glass-skeleton.test.tsx`
- Story: `stories/components/GlassSkeleton.stories.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/components/glass-skeleton.test.tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlassSkeleton } from '@/app/common/components/GlassSkeleton/GlassSkeleton';

describe('GlassSkeleton', () => {
  it('renders a single skeleton line by default', () => {
    const { container } = render(<GlassSkeleton />);
    expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(1);
  });

  it('renders multiple lines', () => {
    const { container } = render(<GlassSkeleton lines={3} />);
    expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(3);
  });

  it('applies glass-subtle class', () => {
    const { container } = render(<GlassSkeleton />);
    const skeleton = container.querySelector('[data-skeleton]');
    expect(skeleton).toHaveClass('glass-subtle');
  });

  it('renders card variant with action bar', () => {
    const { container } = render(<GlassSkeleton variant="card" />);
    expect(container.querySelector('[data-skeleton-actions]')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- tests/components/glass-skeleton.test.tsx`
Expected: FAIL

- [ ] **Step 3: GlassSkeleton 구현**

```tsx
// app/common/components/GlassSkeleton/GlassSkeleton.tsx
import { cn } from '@/app/common/lib/utils';

interface GlassSkeletonProps {
  lines?: number;
  variant?: 'line' | 'card';
  className?: string;
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      data-skeleton
      className={cn(
        'glass-subtle rounded-sm h-4 animate-[skeleton-pulse_1.5s_ease-in-out_infinite]',
        className,
      )}
    />
  );
}

export function GlassSkeleton({ lines = 1, variant = 'line', className }: GlassSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn('glass-subtle rounded-md p-4 md:p-6 space-y-3', className)}>
        <SkeletonLine className="h-5 w-3/4" />
        <SkeletonLine className="h-4 w-full" />
        <SkeletonLine className="h-4 w-5/6" />
        <div data-skeleton-actions className="flex gap-2 pt-2">
          <SkeletonLine className="h-8 w-16 rounded-md" />
          <SkeletonLine className="h-8 w-16 rounded-md" />
          <SkeletonLine className="h-8 w-16 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonLine key={i} className={i === lines - 1 ? 'w-3/4' : 'w-full'} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- tests/components/glass-skeleton.test.tsx`
Expected: PASS

- [ ] **Step 5: Storybook 스토리 작성**

```tsx
// stories/components/GlassSkeleton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { GlassSkeleton } from '@/app/common/components/GlassSkeleton/GlassSkeleton';

const meta: Meta<typeof GlassSkeleton> = {
  title: 'Components/GlassSkeleton',
  component: GlassSkeleton,
};
export default meta;

type Story = StoryObj<typeof GlassSkeleton>;

export const SingleLine: Story = { args: { lines: 1 } };
export const MultipleLines: Story = { args: { lines: 3 } };
export const CardVariant: Story = { args: { variant: 'card' } };
export const CardList: Story = {
  render: () => (
    <div className="space-y-4">
      <GlassSkeleton variant="card" />
      <GlassSkeleton variant="card" />
      <GlassSkeleton variant="card" />
    </div>
  ),
};
```

- [ ] **Step 6: 커밋**

```bash
git add app/common/components/GlassSkeleton/ tests/components/glass-skeleton.test.tsx stories/components/GlassSkeleton.stories.tsx
git commit -m "feat(ui): GlassSkeleton 로딩 컴포넌트 구현"
```

---

### Task 5: EmptyState & ErrorState 컴포넌트

**Files:**
- Create: `app/common/components/EmptyState/EmptyState.tsx`
- Create: `app/common/components/ErrorState/ErrorState.tsx`
- Test: `tests/components/empty-state.test.tsx`
- Test: `tests/components/error-state.test.tsx`

- [ ] **Step 1: EmptyState 테스트 작성**

```tsx
// tests/components/empty-state.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from '@/app/common/components/EmptyState/EmptyState';

describe('EmptyState', () => {
  it('renders message', () => {
    render(<EmptyState message="아직 법안이 없습니다" />);
    expect(screen.getByText('아직 법안이 없습니다')).toBeInTheDocument();
  });

  it('renders CTA when provided', () => {
    render(<EmptyState message="비었습니다" ctaText="법안 보기" ctaHref="/bills" />);
    expect(screen.getByRole('link', { name: '법안 보기' })).toHaveAttribute('href', '/bills');
  });

  it('does not render CTA when not provided', () => {
    render(<EmptyState message="비었습니다" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: ErrorState 테스트 작성**

```tsx
// tests/components/error-state.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ErrorState } from '@/app/common/components/ErrorState/ErrorState';

describe('ErrorState', () => {
  it('renders error message', () => {
    render(<ErrorState message="네트워크 오류가 발생했습니다" />);
    expect(screen.getByText('네트워크 오류가 발생했습니다')).toBeInTheDocument();
  });

  it('renders retry button and calls onRetry', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="오류" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `npm test -- tests/components/empty-state.test.tsx tests/components/error-state.test.tsx`
Expected: FAIL

- [ ] **Step 4: EmptyState 구현**

```tsx
// app/common/components/EmptyState/EmptyState.tsx
import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { GlassCard } from '@/app/common/components/ui/glass-card';
import { cn } from '@/app/common/lib/utils';

interface EmptyStateProps {
  message: string;
  ctaText?: string;
  ctaHref?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ message, ctaText, ctaHref, icon, className }: EmptyStateProps) {
  return (
    <GlassCard className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 text-muted-foreground">{icon ?? <Inbox className="h-12 w-12" />}</div>
      <p className="text-muted-foreground">{message}</p>
      {ctaText && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {ctaText}
        </Link>
      )}
    </GlassCard>
  );
}
```

- [ ] **Step 5: ErrorState 구현**

```tsx
// app/common/components/ErrorState/ErrorState.tsx
import { AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/app/common/components/ui/glass-card';
import { cn } from '@/app/common/lib/utils';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <GlassCard className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <AlertTriangle className="mb-4 h-12 w-12 text-danger" />
      <p className="text-foreground">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          다시 시도
        </button>
      )}
    </GlassCard>
  );
}
```

- [ ] **Step 6: 테스트 통과 확인**

Run: `npm test -- tests/components/empty-state.test.tsx tests/components/error-state.test.tsx`
Expected: PASS

- [ ] **Step 7: 커밋**

```bash
git add app/common/components/EmptyState/ app/common/components/ErrorState/ tests/components/empty-state.test.tsx tests/components/error-state.test.tsx
git commit -m "feat(ui): EmptyState, ErrorState 공통 컴포넌트 구현"
```

---

### Task 6: useScrollDirection 훅

**Files:**
- Create: `app/common/hooks/useScrollDirection.ts`
- Test: `tests/hooks/useScrollDirection.test.ts`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/hooks/useScrollDirection.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useScrollDirection } from '@/app/common/hooks/useScrollDirection';

describe('useScrollDirection', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  it('returns "up" by default', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toBe('up');
  });

  it('returns "down" after scrolling down', () => {
    const { result } = renderHook(() => useScrollDirection({ threshold: 0 }));
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe('down');
  });

  it('returns "up" after scrolling up', () => {
    const { result } = renderHook(() => useScrollDirection({ threshold: 0 }));
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe('up');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- tests/hooks/useScrollDirection.test.ts`
Expected: FAIL

- [ ] **Step 3: useScrollDirection 구현**

```ts
// app/common/hooks/useScrollDirection.ts
'use client';

import { useState, useEffect, useRef } from 'react';

interface UseScrollDirectionOptions {
  threshold?: number;
}

export function useScrollDirection({ threshold = 10 }: UseScrollDirectionOptions = {}) {
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateDirection = () => {
      const scrollY = window.scrollY;
      const diff = scrollY - lastScrollY.current;

      if (Math.abs(diff) >= threshold) {
        setDirection(diff > 0 ? 'down' : 'up');
        lastScrollY.current = scrollY;
      }

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return direction;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- tests/hooks/useScrollDirection.test.ts`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add app/common/hooks/useScrollDirection.ts tests/hooks/useScrollDirection.test.ts
git commit -m "feat(hooks): useScrollDirection 스크롤 방향 감지 훅 구현"
```

---

### Task 7: SideNav 좌측 사이드바 컴포넌트

**Files:**
- Create: `app/common/components/Layout/SideNav/SideNav.tsx`
- Test: `tests/layout/side-nav.test.tsx`
- Story: `stories/patterns/SideNav.stories.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/layout/side-nav.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SideNav } from '@/app/common/components/Layout/SideNav/SideNav';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

describe('SideNav', () => {
  it('renders navigation items', () => {
    render(<SideNav />);
    expect(screen.getByText('피드')).toBeInTheDocument();
    expect(screen.getByText('타임라인')).toBeInTheDocument();
    expect(screen.getByText('팔로잉')).toBeInTheDocument();
    expect(screen.getByText('마이페이지')).toBeInTheDocument();
  });

  it('renders logo', () => {
    render(<SideNav />);
    expect(screen.getByAltText(/모두의입법/i)).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    render(<SideNav />);
    expect(screen.getByRole('button', { name: /테마/i })).toBeInTheDocument();
  });

  it('highlights active nav item', () => {
    render(<SideNav />);
    const homeLink = screen.getByText('홈').closest('a');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('renders compact mode for tablet', () => {
    const { container } = render(<SideNav compact />);
    expect(container.querySelector('[data-compact]')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- tests/layout/side-nav.test.tsx`
Expected: FAIL

- [ ] **Step 3: SideNav 구현**

```tsx
// app/common/components/Layout/SideNav/SideNav.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Search } from 'lucide-react';
import { siteConfig } from '@/app/common/config/site';
import { cn } from '@/app/common/lib/utils';
import { useSearchModalStore } from '@/app/common/store/search-modal';

interface SideNavProps {
  compact?: boolean;
}

export function SideNav({ compact = false }: SideNavProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const openSearch = useSearchModalStore((s) => s.open);

  return (
    <nav
      data-compact={compact || undefined}
      className={cn(
        'glass-medium sticky top-0 flex h-screen flex-col justify-between py-6',
        compact ? 'w-[72px] items-center px-2' : 'w-[240px] px-4',
      )}
      style={{ zIndex: 'var(--z-nav)' }}
    >
      <div className="flex flex-col gap-2">
        {/* Logo */}
        <Link href="/" className={cn('mb-6', compact ? 'px-0' : 'px-3')}>
          <Image
            src="/svgs/logo.svg"
            alt="모두의입법"
            width={compact ? 32 : 140}
            height={compact ? 32 : 28}
            className="dark:hidden"
          />
          <Image
            src="/svgs/logo-dark.svg"
            alt="모두의입법"
            width={compact ? 32 : 140}
            height={compact ? 32 : 28}
            className="hidden dark:block"
          />
        </Link>

        {/* Nav Items */}
        {siteConfig.navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.IconComponent;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              title={compact ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                'duration-[var(--duration-fast)] ease-[var(--easing-default)]',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-primary-subtle hover:text-foreground',
                compact && 'justify-center px-0',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!compact && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Search */}
        <button
          type="button"
          onClick={openSearch}
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
            'text-muted-foreground transition-colors hover:bg-primary-subtle hover:text-foreground',
            compact && 'justify-center px-0',
          )}
        >
          <Search className="h-5 w-5 shrink-0" />
          {!compact && <span>검색</span>}
        </button>
      </div>

      {/* Theme Toggle */}
      <button
        type="button"
        aria-label="테마 전환"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
          'text-muted-foreground transition-colors hover:bg-primary-subtle hover:text-foreground',
          compact && 'justify-center px-0',
        )}
      >
        <Sun className="h-5 w-5 dark:hidden" />
        <Moon className="hidden h-5 w-5 dark:block" />
        {!compact && <span>테마</span>}
      </button>
    </nav>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- tests/layout/side-nav.test.tsx`
Expected: PASS

- [ ] **Step 5: Storybook 스토리 작성**

```tsx
// stories/patterns/SideNav.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SideNav } from '@/app/common/components/Layout/SideNav/SideNav';

const meta: Meta<typeof SideNav> = {
  title: 'Patterns/SideNav',
  component: SideNav,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof SideNav>;

export const Full: Story = { args: { compact: false } };
export const Compact: Story = { args: { compact: true } };
```

- [ ] **Step 6: 커밋**

```bash
git add app/common/components/Layout/SideNav/ tests/layout/side-nav.test.tsx stories/patterns/SideNav.stories.tsx
git commit -m "feat(layout): SideNav 좌측 사이드바 네비게이션 구현"
```

---

### Task 8: RightSidebar 우측 사이드바 컴포넌트

**Files:**
- Create: `app/common/components/Layout/RightSidebar/RightSidebar.tsx`
- Test: `tests/layout/right-sidebar.test.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/layout/right-sidebar.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RightSidebar } from '@/app/common/components/Layout/RightSidebar/RightSidebar';

describe('RightSidebar', () => {
  it('renders children', () => {
    render(<RightSidebar>Sidebar content</RightSidebar>);
    expect(screen.getByText('Sidebar content')).toBeInTheDocument();
  });

  it('is sticky', () => {
    const { container } = render(<RightSidebar>Content</RightSidebar>);
    expect(container.firstChild).toHaveClass('sticky');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- tests/layout/right-sidebar.test.tsx`
Expected: FAIL

- [ ] **Step 3: RightSidebar 구현**

```tsx
// app/common/components/Layout/RightSidebar/RightSidebar.tsx
import { cn } from '@/app/common/lib/utils';

interface RightSidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function RightSidebar({ children, className }: RightSidebarProps) {
  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen w-[300px] shrink-0 overflow-y-auto py-6 pl-4 lg:block',
        className,
      )}
    >
      <div className="flex flex-col gap-4">{children}</div>
    </aside>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- tests/layout/right-sidebar.test.tsx`
Expected: PASS

- [ ] **Step 5: Storybook 스토리 작성**

```tsx
// stories/patterns/RightSidebar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { RightSidebar } from '@/app/common/components/Layout/RightSidebar/RightSidebar';

const meta: Meta<typeof RightSidebar> = {
  title: 'Patterns/RightSidebar',
  component: RightSidebar,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof RightSidebar>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <div className="glass-subtle rounded-md p-4">검색바</div>
        <div className="glass-subtle rounded-md p-4">인기 법안</div>
        <div className="glass-subtle rounded-md p-4">트렌딩 키워드</div>
      </div>
    ),
  },
};
```

- [ ] **Step 6: 커밋**

```bash
git add app/common/components/Layout/RightSidebar/ tests/layout/right-sidebar.test.tsx stories/patterns/RightSidebar.stories.tsx
git commit -m "feat(layout): RightSidebar 우측 사이드바 컴포넌트 구현"
```

---

### Task 9: AppLayout 3단 반응형 레이아웃

**Files:**
- Create: `app/common/components/Layout/AppLayout/AppLayout.tsx`
- Test: `tests/layout/app-layout.test.tsx`
- Story: `stories/patterns/AppLayout.stories.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/layout/app-layout.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppLayout } from '@/app/common/components/Layout/AppLayout/AppLayout';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light', setTheme: vi.fn() }) }));

describe('AppLayout', () => {
  it('renders main content', () => {
    render(<AppLayout>Main content</AppLayout>);
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('renders SideNav', () => {
    render(<AppLayout>Content</AppLayout>);
    expect(screen.getByText('피드')).toBeInTheDocument();
  });

  it('renders right sidebar when provided', () => {
    render(<AppLayout rightSidebar={<div>Right sidebar</div>}>Content</AppLayout>);
    expect(screen.getByText('Right sidebar')).toBeInTheDocument();
  });

  it('renders mobile bottom nav', () => {
    render(<AppLayout>Content</AppLayout>);
    // Nav component should be present (hidden md:)
    expect(document.querySelector('nav')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- tests/layout/app-layout.test.tsx`
Expected: FAIL

- [ ] **Step 3: AppLayout 구현**

```tsx
// app/common/components/Layout/AppLayout/AppLayout.tsx
'use client';

import { cn } from '@/app/common/lib/utils';
import { SideNav } from '@/app/common/components/Layout/SideNav/SideNav';
import { RightSidebar } from '@/app/common/components/Layout/RightSidebar/RightSidebar';
import Nav from '@/app/common/components/Layout/Nav/Nav';
import { useScrollDirection } from '@/app/common/hooks/useScrollDirection';

interface AppLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export function AppLayout({ children, rightSidebar }: AppLayoutProps) {
  const scrollDirection = useScrollDirection();

  return (
    <div className="flex min-h-screen justify-center">
      {/* Left SideNav — desktop: full, tablet: compact, mobile: hidden */}
      <div className="hidden md:block lg:hidden">
        <SideNav compact />
      </div>
      <div className="hidden lg:block">
        <SideNav />
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 max-w-[640px] px-4 pb-20 md:pb-0">
        {children}
      </main>

      {/* Right Sidebar — desktop only */}
      {rightSidebar && <RightSidebar>{rightSidebar}</RightSidebar>}

      {/* Mobile Bottom Nav */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 md:hidden transition-transform',
          'duration-[var(--duration-normal)] ease-[var(--easing-default)]',
          scrollDirection === 'down' ? 'translate-y-full' : 'translate-y-0',
        )}
        style={{ zIndex: 'var(--z-nav)' }}
      >
        <Nav />
      </div>

      {/* Mobile Header (scroll-reactive) */}
      {/* Note: Mobile header is handled by existing Header or will be added in Phase 2 page tasks */}
    </div>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test -- tests/layout/app-layout.test.tsx`
Expected: PASS

- [ ] **Step 5: Storybook 스토리 작성**

```tsx
// stories/patterns/AppLayout.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AppLayout } from '@/app/common/components/Layout/AppLayout/AppLayout';

const meta: Meta<typeof AppLayout> = {
  title: 'Patterns/AppLayout',
  component: AppLayout,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof AppLayout>;

export const WithRightSidebar: Story = {
  args: {
    children: <div className="space-y-4 p-4">{Array.from({ length: 10 }, (_, i) => <div key={i} className="glass-subtle rounded-md p-6">Card {i + 1}</div>)}</div>,
    rightSidebar: <div className="space-y-4"><div className="glass-subtle rounded-md p-4">검색바</div><div className="glass-subtle rounded-md p-4">인기 법안</div></div>,
  },
};

export const WithoutRightSidebar: Story = {
  args: {
    children: <div className="p-4">콘텐츠만 표시</div>,
  },
};
```

- [ ] **Step 6: 커밋**

```bash
git add app/common/components/Layout/AppLayout/ tests/layout/app-layout.test.tsx stories/patterns/AppLayout.stories.tsx
git commit -m "feat(layout): AppLayout 3단 반응형 레이아웃 구현"
```

---

### Task 10: Storybook 디자인 토큰 문서화

**Files:**
- Create: `stories/design-tokens/Colors.stories.tsx`
- Create: `stories/design-tokens/Typography.stories.tsx`
- Create: `stories/design-tokens/GlassEffects.stories.tsx`
- Modify: `.storybook/preview.ts` (다크 모드 데코레이터 추가)

- [ ] **Step 1: Storybook preview에 글로벌 CSS + 다크 모드 데코레이터 추가**

`.storybook/preview.ts`에 `@/styles/globals.css` 임포트 확인, 다크 모드 토글 데코레이터 추가.

```ts
// .storybook/preview.ts 에 추가
import '../styles/globals.css';

const preview: Preview = {
  parameters: {
    // ... 기존 설정
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0a0a0a' },
      ],
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals.backgrounds?.value === '#0a0a0a'
        || context.parameters.backgrounds?.default === 'dark';
      return (
        <div className={isDark ? 'dark' : ''}>
          <div className="bg-background text-foreground min-h-screen p-4">
            <Story />
          </div>
        </div>
      );
    },
  ],
};
```

- [ ] **Step 2: Colors 스토리 작성**

```tsx
// stories/design-tokens/Colors.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

function ColorSwatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-md border" style={{ background: `hsl(var(${cssVar}))` }} />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{cssVar}</p>
      </div>
    </div>
  );
}

function ColorsPage() {
  const colors = [
    { name: 'Primary', cssVar: '--primary' },
    { name: 'Primary Hover', cssVar: '--primary-hover' },
    { name: 'Primary Subtle', cssVar: '--primary-subtle' },
    { name: 'Accent', cssVar: '--accent' },
    { name: 'Warning', cssVar: '--warning' },
    { name: 'Danger', cssVar: '--danger' },
    { name: 'Background', cssVar: '--background' },
    { name: 'Surface', cssVar: '--surface' },
    { name: 'Foreground', cssVar: '--foreground' },
    { name: 'Muted Foreground', cssVar: '--muted-foreground' },
    { name: 'Border', cssVar: '--border' },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {colors.map((c) => <ColorSwatch key={c.cssVar} {...c} />)}
    </div>
  );
}

const meta: Meta = { title: 'Design Tokens/Colors' };
export default meta;
export const AllColors: StoryObj = { render: () => <ColorsPage /> };
```

- [ ] **Step 3: Typography 스토리 작성**

```tsx
// stories/design-tokens/Typography.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

function TypographyPage() {
  return (
    <div className="space-y-6">
      <div><p className="text-xs text-muted-foreground">display (28/32px, 700)</p><h1 className="text-[28px] md:text-[32px] font-bold leading-[1.2]">페이지 타이틀</h1></div>
      <div><p className="text-xs text-muted-foreground">heading-lg (22/24px, 600)</p><h2 className="text-[22px] md:text-[24px] font-semibold leading-[1.3]">섹션 제목</h2></div>
      <div><p className="text-xs text-muted-foreground">heading-sm (18/20px, 600)</p><h3 className="text-[18px] md:text-[20px] font-semibold leading-[1.3]">카드 제목, 법안명</h3></div>
      <div><p className="text-xs text-muted-foreground">body (15/16px, 400)</p><p className="text-[15px] md:text-base leading-[1.6]">본문 텍스트입니다. AI가 요약한 법안 내용이 여기에 표시됩니다.</p></div>
      <div><p className="text-xs text-muted-foreground">caption (13px, 400)</p><p className="text-[13px] leading-[1.4] text-muted-foreground">메타데이터, 2025.03.23</p></div>
      <div><p className="text-xs text-muted-foreground">micro (11px, 500)</p><p className="text-[11px] leading-[1.3] font-medium">배지 텍스트</p></div>
    </div>
  );
}

const meta: Meta = { title: 'Design Tokens/Typography' };
export default meta;
export const TypeScale: StoryObj = { render: () => <TypographyPage /> };
```

- [ ] **Step 4: Spacing 스토리 작성**

```tsx
// stories/design-tokens/Spacing.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

function SpacingPage() {
  const spaces = [
    { name: 'space-1', value: '4px', tw: 'gap-1 / p-1' },
    { name: 'space-2', value: '8px', tw: 'gap-2 / p-2' },
    { name: 'space-3', value: '12px', tw: 'gap-3 / p-3' },
    { name: 'space-4', value: '16px', tw: 'gap-4 / p-4' },
    { name: 'space-6', value: '24px', tw: 'gap-6 / p-6' },
    { name: 'space-8', value: '32px', tw: 'gap-8 / p-8' },
    { name: 'space-12', value: '48px', tw: 'gap-12 / p-12' },
    { name: 'space-16', value: '64px', tw: 'gap-16 / p-16' },
  ];
  return (
    <div className="space-y-3">
      {spaces.map((s) => (
        <div key={s.name} className="flex items-center gap-4">
          <div className="w-24 text-sm font-medium">{s.name}</div>
          <div className="bg-primary rounded-sm" style={{ width: s.value, height: '16px' }} />
          <div className="text-sm text-muted-foreground">{s.value} — <code>{s.tw}</code></div>
        </div>
      ))}
    </div>
  );
}

const meta: Meta = { title: 'Design Tokens/Spacing' };
export default meta;
export const SpacingScale: StoryObj = { render: () => <SpacingPage /> };
```

- [ ] **Step 5: GlassEffects 스토리 작성**

```tsx
// stories/design-tokens/GlassEffects.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

function GlassEffectsPage() {
  return (
    <div className="space-y-8" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))', padding: '2rem', borderRadius: '1rem' }}>
      <div className="glass-subtle rounded-md p-6"><h3 className="font-semibold glass-text-safe">Glass Subtle</h3><p className="text-sm glass-text-safe">40% opacity, 8px blur</p></div>
      <div className="glass-medium rounded-md p-6"><h3 className="font-semibold glass-text-safe">Glass Medium</h3><p className="text-sm glass-text-safe">60% opacity, 16px blur</p></div>
      <div className="glass-heavy rounded-md p-6"><h3 className="font-semibold glass-text-safe">Glass Heavy</h3><p className="text-sm glass-text-safe">80% opacity, 24px blur</p></div>
    </div>
  );
}

const meta: Meta = { title: 'Design Tokens/Glass Effects' };
export default meta;
export const AllLevels: StoryObj = { render: () => <GlassEffectsPage /> };
```

- [ ] **Step 5: Storybook 확인**

Run: `npm run storybook`
Expected: Design Tokens 카테고리에 Colors, Typography, Spacing, Glass Effects 스토리 표시

- [ ] **Step 6: 커밋**

```bash
git add stories/design-tokens/ .storybook/preview.ts
git commit -m "feat(storybook): 디자인 토큰 문서화 (Colors, Typography, Glass)"
```

---

### Task 11: @use-gesture/react 설치

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 패키지 설치**

Run: `npm install @use-gesture/react`

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공

- [ ] **Step 3: 커밋**

```bash
git add package.json package-lock.json
git commit -m "chore: @use-gesture/react 설치"
```

---

## Phase 2: 핵심 페이지 (1순위)

### Task 12: 홈 피드 — AppLayout 적용 + 우측 사이드바

**Files:**
- Modify: `app/page.tsx` — AppLayout으로 감싸고, NotificationTopThree를 rightSidebar로 이동
- Modify: `app/layout.tsx` — 기존 Layout 대신 AppLayout 사용 가능하도록 구조 조정

- [ ] **Step 1: `app/page.tsx`에서 기존 Layout을 AppLayout으로 교체**
- [ ] **Step 2: NotificationTopThree를 rightSidebar prop으로 이동**
- [ ] **Step 3: 빌드 확인** — `npm run build`
- [ ] **Step 4: 시각 확인** — `npm run dev`로 3단 레이아웃 동작 확인
- [ ] **Step 5: 커밋**

---

### Task 13: 홈 피드 — 법안 카드 글래스 리디자인

**Files:**
- Modify: `app/bill/components/Bill.tsx` — GlassCard 적용, 새 컬러/타이포 토큰 사용

- [ ] **Step 1: Bill 컴포넌트에서 기존 bg/border 클래스를 GlassCard로 교체**
- [ ] **Step 2: 타이포그래피를 스펙 타입 스케일에 맞게 조정**
- [ ] **Step 3: 카드 호버 애니메이션 추가**
- [ ] **Step 4: 다크 모드 확인** — 라이트/다크 전환 시 글래스 효과 확인
- [ ] **Step 5: 기존 테스트 통과 확인** — `npm test`
- [ ] **Step 6: 커밋**

---

### Task 14: 홈 피드 — 피드 탭 리디자인

**Files:**
- Modify: 피드 탭 컴포넌트 (FeedTab) — 프라이머리 컬러 활성 상태, 슬라이드 애니메이션

- [ ] **Step 1: 탭 활성 상태를 프라이머리 컬러로 변경**
- [ ] **Step 2: 언더라인/배경 슬라이드 트랜지션 추가**
- [ ] **Step 3: 시각 확인**
- [ ] **Step 4: 커밋**

---

### Task 15: 하단 네비게이션 글래스 개선 + 스크롤 반응

**Files:**
- Modify: `app/common/components/Layout/Nav/Nav.tsx` — 글래스 토큰 적용, 스크롤 반응은 AppLayout에서 처리

- [ ] **Step 1: Nav 컴포넌트의 기존 인라인 글래스 스타일을 `glass-medium` 클래스로 교체**
- [ ] **Step 2: 다크 모드 글래스 보더 하이라이트 추가**
- [ ] **Step 3: 시각 확인** — 모바일 뷰에서 스크롤 시 네비 숨김/표시 동작 확인
- [ ] **Step 4: 커밋**

---

### Task 16: 법안 상세 리디자인

**Files:**
- Modify: `app/bill/[id]/page.tsx`
- Modify: `app/bill/components/BillDetail.tsx` (또는 관련 컴포넌트들)

- [ ] **Step 1: 법안 상세 페이지에 AppLayout 적용 + 우측 사이드바 (관련 법안)**
- [ ] **Step 2: 히어로 섹션 (법안명 + 카테고리 + 진행 상태 배지) 글래스 카드로**
- [ ] **Step 3: 진행 단계 인디케이터 리디자인 — 글래스 카드 + 프라이머리 활성**
- [ ] **Step 4: GPT 요약 섹션 글래스 카드 적용**
- [ ] **Step 5: 투표 결과 글래스 카드 그리드로 재구성**
- [ ] **Step 6: 발의자 아바타 그리드 + 호버 미니 프로필**
- [ ] **Step 7: 다크 모드 + 반응형 확인**
- [ ] **Step 8: 커밋**

---

## Phase 3: 보조 페이지 (2순위)

### Task 17: 타임라인 리디자인

- [ ] **Step 1: AppLayout 적용 + 우측 사이드바 (회기 통계)**
- [ ] **Step 2: D-Day 카운트다운 — display 타이포 + 글래스 카드**
- [ ] **Step 3: 통계 카드 — 3열 글래스 카드 그리드**
- [ ] **Step 4: 회기 드롭다운 글래스 스타일**
- [ ] **Step 5: 법안 리스트 카드 스타일 통일**
- [ ] **Step 6: 커밋**

### Task 18: 검색 UI 개선

- [ ] **Step 1: 데스크톱 — SearchBar를 RightSidebar에 상시 노출**
- [ ] **Step 2: 모바일 — SearchModal에 글래스 오버레이 적용**
- [ ] **Step 3: 검색 결과 카드 스타일 통일**
- [ ] **Step 4: 최근 검색어 글래스 배지 스타일**
- [ ] **Step 5: 커밋**

---

## Phase 4: 나머지 페이지 (3순위)

### Task 19: 팔로잉 페이지 리디자인

- [ ] **Step 1: AppLayout 적용**
- [ ] **Step 2: 탭 UI 슬라이드 애니메이션**
- [ ] **Step 3: 법안/의원 카드 글래스 스타일 통일**
- [ ] **Step 4: 빈 상태 EmptyState 적용**
- [ ] **Step 5: 커밋**

### Task 20: 마이페이지 리디자인

- [ ] **Step 1: AppLayout 적용**
- [ ] **Step 2: 프로필 헤더 글래스 카드**
- [ ] **Step 3: 북마크 리스트 카드 스타일 통일**
- [ ] **Step 4: 설정 메뉴 글래스 카드**
- [ ] **Step 5: 커밋**

### Task 21: 의원/정당 상세 리디자인

- [ ] **Step 1: 의원 상세 — 프로필 헤더 + 정당 컬러 액센트 + 글래스 카드**
- [ ] **Step 2: 의정활동 통계 글래스 카드 그리드**
- [ ] **Step 3: 정당 상세 — 정당 헤더 + 소속 의원 아바타 그리드**
- [ ] **Step 4: 팔로우 버튼 프라이머리 CTA**
- [ ] **Step 5: 커밋**

---

## Phase 5: 마무리 (4순위)

### Task 22: 알림/로그인 페이지

- [ ] **Step 1: 알림 — 읽음/안읽음 구분 + 글래스 카드 + EmptyState**
- [ ] **Step 2: 로그인 — 중앙 글래스 카드 + 로고 + 카카오 버튼**
- [ ] **Step 3: 커밋**

### Task 23: 모바일 제스처 (스와이프, 풀투리프레시)

- [ ] **Step 1: `@use-gesture/react`의 `useDrag`로 스와이프 탭 전환 훅 구현**
- [ ] **Step 2: 홈/타임라인/팔로잉 탭에 스와이프 적용**
- [ ] **Step 3: 풀투리프레시 훅 구현 + 피드에 적용**
- [ ] **Step 4: 알림 스와이프 삭제**
- [ ] **Step 5: 테스트 + 커밋**

### Task 24: 애니메이션 폴리싱 + 접근성 검수

- [ ] **Step 1: 리스트 로딩 순차 페이드인 적용**
- [ ] **Step 2: `prefers-reduced-motion` 테스트**
- [ ] **Step 3: `prefers-contrast: more` 글래스 폴백 테스트**
- [ ] **Step 4: 키보드 네비게이션 전체 흐름 테스트**
- [ ] **Step 5: 포커스 링 프라이머리 컬러 적용 확인**
- [ ] **Step 6: WCAG AA 대비율 검사 (글래스 위 텍스트)**
- [ ] **Step 7: 최종 빌드 + 전체 테스트** — `npm run build && npm test`
- [ ] **Step 8: 커밋**

### Task 25: 레거시 클린업

- [ ] **Step 1: 미사용 레거시 컬러 토큰 제거 (tailwind.config.js)**
- [ ] **Step 2: 미사용 기존 Layout 컴포넌트 제거 또는 deprecated 마킹**
- [ ] **Step 3: 기존 `dark:bg-dark-*` 하드코딩 클래스 전체 검색 후 시멘틱 변수로 교체**
- [ ] **Step 4: 전체 빌드 + 테스트 확인**
- [ ] **Step 5: 커밋**

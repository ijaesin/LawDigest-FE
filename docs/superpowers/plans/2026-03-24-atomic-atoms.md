# Atoms 구현 계획 (Plan 1/4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** shadcn/ui를 래핑한 글래스 디자인 시스템의 Atom 컴포넌트 10개를 Storybook에서 완성한다.

**Architecture:** 각 Atom은 shadcn/ui 원본을 import하여 글래스 디자인 토큰으로 래핑. `app/common/components/atoms/` 디렉토리에 생성. 기존 GlassCard/GlassSkeleton은 이동만. 모든 컴포넌트는 forwardRef + displayName 패턴.

**Tech Stack:** React 19, TypeScript strict, Tailwind CSS, shadcn/ui, class-variance-authority, Storybook, Vitest + @testing-library/react

**Spec:** `docs/superpowers/specs/2026-03-24-atomic-design-rebuild.md` 섹션 2

---

## File Structure

### 생성할 파일

```
app/common/components/atoms/
├── GlassButton.tsx
├── GlassBadge.tsx
├── GlassInput.tsx
├── GlassAvatar.tsx
├── GlassCard.tsx          # 기존 ui/glass-card.tsx에서 이동
├── GlassSkeleton.tsx      # 기존 GlassSkeleton/GlassSkeleton.tsx에서 이동
├── Icon.tsx
├── Logo.tsx
├── Separator.tsx
├── StatusDot.tsx
└── index.tsx              # barrel export

stories/atoms/
├── GlassButton.stories.tsx
├── GlassBadge.stories.tsx
├── GlassInput.stories.tsx
├── GlassAvatar.stories.tsx
├── GlassCard.stories.tsx
├── GlassSkeleton.stories.tsx
├── Icon.stories.tsx
├── Logo.stories.tsx
├── StatusDot.stories.tsx
└── Separator.stories.tsx

tests/atoms/
├── glass-button.test.tsx
├── glass-badge.test.tsx
├── glass-input.test.tsx
├── glass-avatar.test.tsx
├── icon.test.tsx
├── logo.test.tsx
├── status-dot.test.tsx
└── separator.test.tsx
```

### 참고할 기존 파일

```
app/common/components/ui/button.tsx     # shadcn Button (cva, Slot, forwardRef)
app/common/components/ui/badge.tsx      # shadcn Badge (cva)
app/common/components/ui/input.tsx      # shadcn Input (forwardRef)
app/common/components/ui/avatar.tsx     # shadcn Avatar (Radix, forwardRef)
app/common/components/ui/separator.tsx  # shadcn Separator (Radix)
app/common/components/ui/glass-card.tsx # 기존 GlassCard
app/common/components/GlassSkeleton/GlassSkeleton.tsx # 기존 GlassSkeleton
app/common/lib/utils.ts                # cn() 유틸리티
app/common/constants/theme.ts          # PARTY_COLOR 상수
styles/globals.css                     # 디자인 토큰, 글래스 유틸리티
```

---

### Task 1: atoms 디렉토리 생성 + GlassCard/GlassSkeleton 이동

**Files:**

- Create: `app/common/components/atoms/index.tsx`
- Move: `app/common/components/ui/glass-card.tsx` → `app/common/components/atoms/GlassCard.tsx`
- Move: `app/common/components/GlassSkeleton/GlassSkeleton.tsx` → `app/common/components/atoms/GlassSkeleton.tsx`
- Update: 기존 import 경로 수정

- [ ] **Step 1: atoms 디렉토리 생성 및 기존 파일 이동**

```bash
mkdir -p app/common/components/atoms
cp app/common/components/ui/glass-card.tsx app/common/components/atoms/GlassCard.tsx
cp app/common/components/GlassSkeleton/GlassSkeleton.tsx app/common/components/atoms/GlassSkeleton.tsx
```

- [ ] **Step 2: barrel export 생성**

```tsx
// app/common/components/atoms/index.tsx
export { GlassCard, type GlassCardProps } from './GlassCard';
export { GlassSkeleton } from './GlassSkeleton';
```

- [ ] **Step 3: 기존 import 경로에서도 동작하도록 re-export 추가**

기존 `app/common/components/ui/glass-card.tsx`와 `app/common/components/GlassSkeleton/GlassSkeleton.tsx`를 새 위치에서 re-export하도록 수정:

```tsx
// app/common/components/ui/glass-card.tsx (기존 파일 → re-export로 변경)
export { GlassCard, type GlassCardProps } from '@/app/common/components/atoms/GlassCard';
```

```tsx
// app/common/components/GlassSkeleton/GlassSkeleton.tsx (기존 파일 → re-export로 변경)
export { GlassSkeleton } from '@/app/common/components/atoms/GlassSkeleton';
```

- [ ] **Step 4: Storybook 스토리 이동**

기존 `stories/components/GlassCard.stories.tsx`와 `stories/components/GlassSkeleton.stories.tsx`의 import 경로를 `@/app/common/components/atoms`로 변경하고, `stories/atoms/`로 복사:

```bash
mkdir -p stories/atoms
cp stories/components/GlassCard.stories.tsx stories/atoms/GlassCard.stories.tsx
cp stories/components/GlassSkeleton.stories.tsx stories/atoms/GlassSkeleton.stories.tsx
```

각 파일에서 import 경로와 title 변경:

- import: `from '@/app/common/components/atoms'`
- title: `'Atoms/GlassCard'`, `'Atoms/GlassSkeleton'`

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm test`
Expected: 기존 39개 테스트 모두 PASS

- [ ] **Step 6: 커밋**

```bash
git add app/common/components/atoms/ app/common/components/ui/glass-card.tsx app/common/components/GlassSkeleton/ stories/atoms/
git commit -m "refactor(atoms): GlassCard, GlassSkeleton을 atoms/ 디렉토리로 이동"
```

---

### Task 2: GlassButton

**Files:**

- Create: `app/common/components/atoms/GlassButton.tsx`
- Test: `tests/atoms/glass-button.test.tsx`
- Story: `stories/atoms/GlassButton.stories.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/atoms/glass-button.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { GlassButton } from '@/app/common/components/atoms';

describe('GlassButton', () => {
  it('renders children', () => {
    render(<GlassButton>Click me</GlassButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<GlassButton>Primary</GlassButton>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('bg-primary');
  });

  it('applies glass variant', () => {
    render(<GlassButton variant="glass">Glass</GlassButton>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('glass-subtle');
  });

  it('applies danger variant', () => {
    render(<GlassButton variant="danger">Delete</GlassButton>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('bg-danger');
  });

  it('handles click events', async () => {
    const onClick = vi.fn();
    render(<GlassButton onClick={onClick}>Click</GlassButton>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('supports disabled state', () => {
    render(<GlassButton disabled>Disabled</GlassButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('supports asChild with Slot', () => {
    render(
      <GlassButton asChild>
        <a href="/test">Link Button</a>
      </GlassButton>,
    );
    expect(screen.getByRole('link', { name: 'Link Button' })).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<GlassButton ref={ref}>Ref</GlassButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('applies size variants', () => {
    const { rerender } = render(<GlassButton size="sm">Small</GlassButton>);
    expect(screen.getByRole('button')).toHaveClass('h-8');
    rerender(<GlassButton size="lg">Large</GlassButton>);
    expect(screen.getByRole('button')).toHaveClass('h-10');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- tests/atoms/glass-button.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: GlassButton 구현**

```tsx
// app/common/components/atoms/GlassButton.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/app/common/lib/utils';

const glassButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 duration-[var(--duration-fast)] ease-[var(--easing-default)]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover',
        glass: 'glass-subtle text-foreground hover:bg-[var(--glass-bg-medium)]',
        outline: 'border border-border bg-transparent text-foreground shadow-sm hover:bg-primary-subtle',
        ghost: 'text-muted-foreground hover:bg-primary-subtle hover:text-foreground',
        danger: 'bg-danger text-danger-foreground shadow-sm hover:bg-danger/90',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 rounded-md px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(glassButtonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);

GlassButton.displayName = 'GlassButton';

export { GlassButton, glassButtonVariants };
```

- [ ] **Step 4: barrel export 업데이트**

```tsx
// app/common/components/atoms/index.tsx 에 추가:
export { GlassButton, type GlassButtonProps } from './GlassButton';
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm test -- tests/atoms/glass-button.test.tsx`
Expected: 9/9 PASS

- [ ] **Step 6: Storybook 스토리 작성**

```tsx
// stories/atoms/GlassButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { GlassButton } from '@/app/common/components/atoms';

const meta: Meta<typeof GlassButton> = {
  title: 'Atoms/GlassButton',
  component: GlassButton,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'glass', 'outline', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof GlassButton>;

export const Primary: Story = { args: { children: 'Primary Button' } };
export const Glass: Story = { args: { variant: 'glass', children: 'Glass Button' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Outline Button' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Ghost Button' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Danger Button' } };
export const Small: Story = { args: { size: 'sm', children: 'Small' } };
export const Large: Story = { args: { size: 'lg', children: 'Large' } };
export const Disabled: Story = { args: { disabled: true, children: 'Disabled' } };
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <GlassButton variant="primary">Primary</GlassButton>
      <GlassButton variant="glass">Glass</GlassButton>
      <GlassButton variant="outline">Outline</GlassButton>
      <GlassButton variant="ghost">Ghost</GlassButton>
      <GlassButton variant="danger">Danger</GlassButton>
    </div>
  ),
};
```

- [ ] **Step 7: 커밋**

```bash
git add app/common/components/atoms/GlassButton.tsx app/common/components/atoms/index.tsx tests/atoms/glass-button.test.tsx stories/atoms/GlassButton.stories.tsx
git commit -m "feat(atoms): GlassButton 컴포넌트 구현"
```

---

### Task 3: GlassBadge

**Files:**

- Create: `app/common/components/atoms/GlassBadge.tsx`
- Test: `tests/atoms/glass-badge.test.tsx`
- Story: `stories/atoms/GlassBadge.stories.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/atoms/glass-badge.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlassBadge } from '@/app/common/components/atoms';

describe('GlassBadge', () => {
  it('renders children', () => {
    render(<GlassBadge>접수</GlassBadge>);
    expect(screen.getByText('접수')).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    const { container } = render(<GlassBadge>Badge</GlassBadge>);
    expect(container.firstChild).toHaveClass('bg-primary-subtle');
    expect(container.firstChild).toHaveClass('text-primary');
  });

  it('applies warning variant', () => {
    const { container } = render(<GlassBadge variant="warning">심사중</GlassBadge>);
    expect(container.firstChild).toHaveClass('text-warning');
  });

  it('applies danger variant', () => {
    const { container } = render(<GlassBadge variant="danger">부결</GlassBadge>);
    expect(container.firstChild).toHaveClass('text-danger');
  });

  it('applies glass variant', () => {
    const { container } = render(<GlassBadge variant="glass">Glass</GlassBadge>);
    expect(container.firstChild).toHaveClass('glass-subtle');
  });

  it('merges custom className', () => {
    const { container } = render(<GlassBadge className="custom">Badge</GlassBadge>);
    expect(container.firstChild).toHaveClass('custom');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- tests/atoms/glass-badge.test.tsx`

- [ ] **Step 3: GlassBadge 구현**

```tsx
// app/common/components/atoms/GlassBadge.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/app/common/lib/utils';

const glassBadgeVariants = cva(
  'inline-flex items-center rounded-sm border-none px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary-subtle text-primary',
        accent: 'bg-accent-subtle text-accent',
        warning: 'bg-[hsl(var(--warning)/0.15)] text-warning',
        danger: 'bg-[hsl(var(--danger)/0.15)] text-danger',
        glass: 'glass-subtle text-foreground',
        outline: 'border border-border bg-transparent text-foreground',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

export interface GlassBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof glassBadgeVariants> {}

const GlassBadge = React.forwardRef<HTMLSpanElement, GlassBadgeProps>(({ className, variant, ...props }, ref) => (
  <span ref={ref} className={cn(glassBadgeVariants({ variant, className }))} {...props} />
));

GlassBadge.displayName = 'GlassBadge';

export { GlassBadge, glassBadgeVariants };
```

- [ ] **Step 4: barrel export 업데이트**

```tsx
// atoms/index.tsx에 추가:
export { GlassBadge, type GlassBadgeProps } from './GlassBadge';
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm test -- tests/atoms/glass-badge.test.tsx`
Expected: 6/6 PASS

- [ ] **Step 6: Storybook 스토리 작성**

```tsx
// stories/atoms/GlassBadge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { GlassBadge } from '@/app/common/components/atoms';

const meta: Meta<typeof GlassBadge> = {
  title: 'Atoms/GlassBadge',
  component: GlassBadge,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'accent', 'warning', 'danger', 'glass', 'outline'] },
  },
};
export default meta;

type Story = StoryObj<typeof GlassBadge>;

export const Primary: Story = { args: { children: '접수' } };
export const Accent: Story = { args: { variant: 'accent', children: '가결' } };
export const Warning: Story = { args: { variant: 'warning', children: '위원회 심사' } };
export const Danger: Story = { args: { variant: 'danger', children: '부결' } };
export const Glass: Story = { args: { variant: 'glass', children: '제22대' } };
export const Outline: Story = { args: { variant: 'outline', children: '태그' } };
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <GlassBadge variant="primary">접수</GlassBadge>
      <GlassBadge variant="accent">가결</GlassBadge>
      <GlassBadge variant="warning">심사중</GlassBadge>
      <GlassBadge variant="danger">부결</GlassBadge>
      <GlassBadge variant="glass">Glass</GlassBadge>
      <GlassBadge variant="outline">Outline</GlassBadge>
    </div>
  ),
};
```

- [ ] **Step 7: 커밋**

```bash
git add app/common/components/atoms/GlassBadge.tsx app/common/components/atoms/index.tsx tests/atoms/glass-badge.test.tsx stories/atoms/GlassBadge.stories.tsx
git commit -m "feat(atoms): GlassBadge 컴포넌트 구현"
```

---

### Task 4: GlassInput

**Files:**

- Create: `app/common/components/atoms/GlassInput.tsx`
- Test: `tests/atoms/glass-input.test.tsx`
- Story: `stories/atoms/GlassInput.stories.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/atoms/glass-input.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { GlassInput } from '@/app/common/components/atoms';

describe('GlassInput', () => {
  it('renders input element', () => {
    render(<GlassInput placeholder="검색..." />);
    expect(screen.getByPlaceholderText('검색...')).toBeInTheDocument();
  });

  it('applies glass-subtle class', () => {
    render(<GlassInput data-testid="input" />);
    // The wrapper div should have glass-subtle
    expect(screen.getByTestId('input').closest('[class*="glass-subtle"]')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<GlassInput icon={<span data-testid="icon">🔍</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('handles input changes', async () => {
    const onChange = vi.fn();
    render(<GlassInput onChange={onChange} placeholder="Type..." />);
    await userEvent.type(screen.getByPlaceholderText('Type...'), 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<GlassInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- tests/atoms/glass-input.test.tsx`

- [ ] **Step 3: GlassInput 구현**

```tsx
// app/common/components/atoms/GlassInput.tsx
import * as React from 'react';
import { cn } from '@/app/common/lib/utils';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(({ className, icon, ...props }, ref) => (
  <div className={cn('glass-subtle flex items-center gap-2 rounded-md px-3 py-2', className)}>
    {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
    <input
      ref={ref}
      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  </div>
));

GlassInput.displayName = 'GlassInput';

export { GlassInput };
```

- [ ] **Step 4: barrel export 업데이트 + 테스트 통과 확인**

Run: `npm test -- tests/atoms/glass-input.test.tsx`
Expected: 5/5 PASS

- [ ] **Step 5: Storybook 스토리 작성**

```tsx
// stories/atoms/GlassInput.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Search } from 'lucide-react';
import { GlassInput } from '@/app/common/components/atoms';

const meta: Meta<typeof GlassInput> = {
  title: 'Atoms/GlassInput',
  component: GlassInput,
};
export default meta;

type Story = StoryObj<typeof GlassInput>;

export const Default: Story = { args: { placeholder: '검색어를 입력하세요...' } };
export const WithIcon: Story = {
  args: { placeholder: '법안, 의원, 정당 검색...', icon: <Search className="h-4 w-4" /> },
};
export const Disabled: Story = { args: { placeholder: 'Disabled', disabled: true } };
```

- [ ] **Step 6: 커밋**

```bash
git add app/common/components/atoms/GlassInput.tsx app/common/components/atoms/index.tsx tests/atoms/glass-input.test.tsx stories/atoms/GlassInput.stories.tsx
git commit -m "feat(atoms): GlassInput 컴포넌트 구현"
```

---

### Task 5: GlassAvatar

**Files:**

- Create: `app/common/components/atoms/GlassAvatar.tsx`
- Test: `tests/atoms/glass-avatar.test.tsx`
- Story: `stories/atoms/GlassAvatar.stories.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/atoms/glass-avatar.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlassAvatar } from '@/app/common/components/atoms';

describe('GlassAvatar', () => {
  it('renders fallback text', () => {
    render(<GlassAvatar fallback="김" />);
    expect(screen.getByText('김')).toBeInTheDocument();
  });

  it('applies default md size', () => {
    const { container } = render(<GlassAvatar fallback="이" />);
    expect(container.firstChild).toHaveClass('h-10', 'w-10');
  });

  it('applies sm size', () => {
    const { container } = render(<GlassAvatar size="sm" fallback="박" />);
    expect(container.firstChild).toHaveClass('h-7', 'w-7');
  });

  it('applies lg size', () => {
    const { container } = render(<GlassAvatar size="lg" fallback="최" />);
    expect(container.firstChild).toHaveClass('h-14', 'w-14');
  });

  it('applies xl size', () => {
    const { container } = render(<GlassAvatar size="xl" fallback="정" />);
    expect(container.firstChild).toHaveClass('h-20', 'w-20');
  });

  it('applies party color border when partyName is provided', () => {
    const { container } = render(<GlassAvatar fallback="김" partyName="더불어민주당" />);
    // Should have inline border-color style
    expect(container.firstChild).toHaveStyle({ borderColor: '#152484' });
  });

  it('renders without party border when no partyName', () => {
    const { container } = render(<GlassAvatar fallback="김" />);
    expect(container.firstChild).not.toHaveStyle({ borderColor: '#152484' });
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- tests/atoms/glass-avatar.test.tsx`

- [ ] **Step 3: GlassAvatar 구현**

```tsx
// app/common/components/atoms/GlassAvatar.tsx
'use client';

import * as React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/common/components/ui/avatar';
import { cn } from '@/app/common/lib/utils';
import { PARTY_COLOR } from '@/app/common/constants/theme';

const sizeMap = {
  sm: { container: 'h-7 w-7', border: '1.5px', text: 'text-[10px]' },
  md: { container: 'h-10 w-10', border: '2px', text: 'text-xs' },
  lg: { container: 'h-14 w-14', border: '2px', text: 'text-sm' },
  xl: { container: 'h-20 w-20', border: '3px', text: 'text-lg' },
} as const;

export interface GlassAvatarProps {
  size?: keyof typeof sizeMap;
  partyName?: string;
  src?: string;
  fallback?: string;
  className?: string;
}

const GlassAvatar = React.forwardRef<HTMLSpanElement, GlassAvatarProps>(
  ({ size = 'md', partyName, src, fallback, className }, ref) => {
    const sizeConfig = sizeMap[size];
    const partyColor = partyName ? PARTY_COLOR[partyName as keyof typeof PARTY_COLOR] : undefined;

    return (
      <Avatar
        ref={ref}
        className={cn(sizeConfig.container, className)}
        style={{
          borderWidth: partyColor ? sizeConfig.border : undefined,
          borderColor: partyColor,
          borderStyle: partyColor ? 'solid' : undefined,
        }}>
        {src && <AvatarImage src={src} alt={fallback ?? ''} />}
        <AvatarFallback className={cn(sizeConfig.text, 'font-semibold')}>{fallback}</AvatarFallback>
      </Avatar>
    );
  },
);

GlassAvatar.displayName = 'GlassAvatar';
```

- [ ] **Step 4: barrel export 업데이트 + 테스트 통과 확인**

Run: `npm test -- tests/atoms/glass-avatar.test.tsx`
Expected: 7/7 PASS

- [ ] **Step 5: Storybook 스토리 작성**

```tsx
// stories/atoms/GlassAvatar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { GlassAvatar } from '@/app/common/components/atoms';

const meta: Meta<typeof GlassAvatar> = {
  title: 'Atoms/GlassAvatar',
  component: GlassAvatar,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    partyName: { control: 'select', options: ['더불어민주당', '국민의힘', '조국혁신당', '무소속', undefined] },
  },
};
export default meta;

type Story = StoryObj<typeof GlassAvatar>;

export const Default: Story = { args: { fallback: '김' } };
export const WithParty: Story = { args: { fallback: '이', partyName: '더불어민주당' } };
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <GlassAvatar size="sm" fallback="S" partyName="국민의힘" />
      <GlassAvatar size="md" fallback="M" partyName="더불어민주당" />
      <GlassAvatar size="lg" fallback="L" partyName="조국혁신당" />
      <GlassAvatar size="xl" fallback="XL" partyName="무소속" />
    </div>
  ),
};
```

- [ ] **Step 6: 커밋**

```bash
git add app/common/components/atoms/GlassAvatar.tsx app/common/components/atoms/index.tsx tests/atoms/glass-avatar.test.tsx stories/atoms/GlassAvatar.stories.tsx
git commit -m "feat(atoms): GlassAvatar 컴포넌트 구현 (정당 컬러 보더)"
```

---

### Task 6: Icon

**Files:**

- Create: `app/common/components/atoms/Icon.tsx`
- Test: `tests/atoms/icon.test.tsx`
- Story: `stories/atoms/Icon.stories.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/atoms/icon.test.tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Home } from 'lucide-react';
import { Icon } from '@/app/common/components/atoms';

describe('Icon', () => {
  it('renders lucide icon', () => {
    const { container } = render(<Icon icon={Home} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies md size by default (20px)', () => {
    const { container } = render(<Icon icon={Home} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-5', 'w-5');
  });

  it('applies sm size (16px)', () => {
    const { container } = render(<Icon icon={Home} size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('applies lg size (24px)', () => {
    const { container } = render(<Icon icon={Home} size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-6', 'w-6');
  });

  it('merges custom className', () => {
    const { container } = render(<Icon icon={Home} className="text-primary" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-primary');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인 → Step 3: 구현**

```tsx
// app/common/components/atoms/Icon.tsx
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/app/common/lib/utils';

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const;

export interface IconProps {
  icon: LucideIcon;
  size?: keyof typeof sizeMap;
  className?: string;
}

export function Icon({ icon: LucideIcon, size = 'md', className }: IconProps) {
  return <LucideIcon className={cn(sizeMap[size], className)} />;
}

Icon.displayName = 'Icon';
```

- [ ] **Step 4: barrel export + 테스트 통과 확인**

Run: `npm test -- tests/atoms/icon.test.tsx`
Expected: 5/5 PASS

- [ ] **Step 5: Storybook + 커밋**

```tsx
// stories/atoms/Icon.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Home, Search, Heart, Calendar, User, Bell, Bookmark, Share2 } from 'lucide-react';
import { Icon } from '@/app/common/components/atoms';

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg'] } },
};
export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = { args: { icon: Home } };
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon icon={Home} size="sm" />
      <Icon icon={Home} size="md" />
      <Icon icon={Home} size="lg" />
    </div>
  ),
};
export const CommonIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      {[Home, Search, Heart, Calendar, User, Bell, Bookmark, Share2].map((IconComp, i) => (
        <Icon key={i} icon={IconComp} className="text-muted-foreground" />
      ))}
    </div>
  ),
};
```

```bash
git add app/common/components/atoms/Icon.tsx app/common/components/atoms/index.tsx tests/atoms/icon.test.tsx stories/atoms/Icon.stories.tsx
git commit -m "feat(atoms): Icon 컴포넌트 구현 (lucide 래퍼)"
```

---

### Task 7: Logo

**Files:**

- Create: `app/common/components/atoms/Logo.tsx`
- Test: `tests/atoms/logo.test.tsx`
- Story: `stories/atoms/Logo.stories.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/atoms/logo.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from '@/app/common/components/atoms';

describe('Logo', () => {
  it('renders logo image with alt text', () => {
    render(<Logo />);
    expect(screen.getAllByAltText(/모두의입법/i).length).toBeGreaterThan(0);
  });

  it('renders md size by default', () => {
    const { container } = render(<Logo />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('width', '140');
  });

  it('renders sm size', () => {
    const { container } = render(<Logo size="sm" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('width', '32');
  });

  it('renders lg size', () => {
    const { container } = render(<Logo size="lg" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('width', '222');
  });
});
```

- [ ] **Step 2: 테스트 실패 → Step 3: 구현**

```tsx
// app/common/components/atoms/Logo.tsx
import Image from 'next/image';
import { cn } from '@/app/common/lib/utils';

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 140, height: 28 },
  lg: { width: 222, height: 37 },
} as const;

export interface LogoProps {
  size?: keyof typeof sizeMap;
  className?: string;
}

export function Logo({ size = 'md', className }: LogoProps) {
  const { width, height } = sizeMap[size];

  return (
    <span className={cn('inline-flex', className)}>
      <Image src="/svgs/logo.svg" alt="모두의입법" width={width} height={height} className="dark:hidden" priority />
      <Image
        src="/svgs/logo-dark.svg"
        alt="모두의입법"
        width={width}
        height={height}
        className="hidden dark:block"
        priority
      />
    </span>
  );
}
```

- [ ] **Step 4: barrel export + 테스트 + Storybook + 커밋**

```bash
git add app/common/components/atoms/Logo.tsx app/common/components/atoms/index.tsx tests/atoms/logo.test.tsx stories/atoms/Logo.stories.tsx
git commit -m "feat(atoms): Logo 컴포넌트 구현 (라이트/다크)"
```

---

### Task 8: Separator

**Files:**

- Create: `app/common/components/atoms/Separator.tsx`
- Test: `tests/atoms/separator.test.tsx`
- Story: `stories/atoms/Separator.stories.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/atoms/separator.test.tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlassSeparator } from '@/app/common/components/atoms';

describe('GlassSeparator', () => {
  it('renders horizontal separator by default', () => {
    const { container } = render(<GlassSeparator />);
    expect(container.firstChild).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('renders vertical separator', () => {
    const { container } = render(<GlassSeparator orientation="vertical" />);
    expect(container.firstChild).toHaveAttribute('data-orientation', 'vertical');
  });

  it('applies bg-border class', () => {
    const { container } = render(<GlassSeparator />);
    expect(container.firstChild).toHaveClass('bg-border');
  });
});
```

- [ ] **Step 2: 테스트 실패 → Step 3: 구현**

```tsx
// app/common/components/atoms/Separator.tsx
// shadcn Separator를 디자인 토큰 스타일로 re-export
export { Separator as GlassSeparator } from '@/app/common/components/ui/separator';
```

> **참고**: shadcn Separator는 이미 `bg-border` 스타일을 사용. 별도 래핑 불필요, re-export로 일관된 import 경로 제공.

- [ ] **Step 4: barrel export + 테스트 + Storybook + 커밋**

```bash
git add app/common/components/atoms/Separator.tsx app/common/components/atoms/index.tsx tests/atoms/separator.test.tsx stories/atoms/Separator.stories.tsx
git commit -m "feat(atoms): GlassSeparator 컴포넌트 구현"
```

---

### Task 9: StatusDot

**Files:**

- Create: `app/common/components/atoms/StatusDot.tsx`
- Test: `tests/atoms/status-dot.test.tsx`
- Story: `stories/atoms/StatusDot.stories.tsx`

- [ ] **Step 1: 테스트 작성**

```tsx
// tests/atoms/status-dot.test.tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusDot } from '@/app/common/components/atoms';

describe('StatusDot', () => {
  it('renders invisible when not active', () => {
    const { container } = render(<StatusDot />);
    expect(container.firstChild).toHaveClass('opacity-0');
  });

  it('renders visible with primary color when active', () => {
    const { container } = render(<StatusDot active />);
    expect(container.firstChild).toHaveClass('bg-primary');
    expect(container.firstChild).not.toHaveClass('opacity-0');
  });

  it('applies sm size by default (6px)', () => {
    const { container } = render(<StatusDot active />);
    expect(container.firstChild).toHaveClass('h-1.5', 'w-1.5');
  });

  it('applies md size (8px)', () => {
    const { container } = render(<StatusDot active size="md" />);
    expect(container.firstChild).toHaveClass('h-2', 'w-2');
  });
});
```

- [ ] **Step 2: 테스트 실패 → Step 3: 구현**

```tsx
// app/common/components/atoms/StatusDot.tsx
import { cn } from '@/app/common/lib/utils';

const sizeMap = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
} as const;

export interface StatusDotProps {
  active?: boolean;
  size?: keyof typeof sizeMap;
  className?: string;
}

export function StatusDot({ active = false, size = 'sm', className }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full bg-primary transition-opacity',
        sizeMap[size],
        !active && 'opacity-0',
        className,
      )}
      aria-hidden="true"
    />
  );
}

StatusDot.displayName = 'StatusDot';
```

- [ ] **Step 4: barrel export + 테스트 + Storybook + 커밋**

```bash
git add app/common/components/atoms/StatusDot.tsx app/common/components/atoms/index.tsx tests/atoms/status-dot.test.tsx stories/atoms/StatusDot.stories.tsx
git commit -m "feat(atoms): StatusDot 컴포넌트 구현 (읽음/안읽음 인디케이터)"
```

---

### Task 10: 최종 검증 + barrel export 정리

- [ ] **Step 1: 최종 barrel export 확인**

```tsx
// app/common/components/atoms/index.tsx (최종)
export { GlassCard, type GlassCardProps } from './GlassCard';
export { GlassSkeleton } from './GlassSkeleton';
export { GlassButton, type GlassButtonProps } from './GlassButton';
export { GlassBadge, type GlassBadgeProps } from './GlassBadge';
export { GlassInput, type GlassInputProps } from './GlassInput';
export { GlassAvatar, type GlassAvatarProps } from './GlassAvatar';
export { Icon, type IconProps } from './Icon';
export { Logo, type LogoProps } from './Logo';
export { GlassSeparator } from './Separator';
export { StatusDot, type StatusDotProps } from './StatusDot';
```

- [ ] **Step 2: 전체 테스트 실행**

Run: `npm test`
Expected: 모든 테스트 PASS (기존 39 + 신규 ~45 = ~84개)

- [ ] **Step 3: Storybook 빌드 확인**

Run: `npm run storybook -- --smoke-test` 또는 `npx storybook build`
Expected: 빌드 성공, Atoms/ 카테고리에 10개 스토리

- [ ] **Step 4: 최종 커밋**

```bash
git add app/common/components/atoms/index.tsx
git commit -m "feat(atoms): Atoms 계층 완성 — 10개 컴포넌트 barrel export"
```

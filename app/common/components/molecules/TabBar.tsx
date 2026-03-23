'use client';

import { cn } from '@/app/common/lib/utils';

export interface TabBarProps {
  tabs: { label: string; value: string }[];
  activeValue: string;
  onChange: (value: string) => void;
  variant?: 'pill' | 'underline';
}

export function TabBar({ tabs, activeValue, onChange, variant = 'pill' }: TabBarProps) {
  return (
    <div
      role="tablist"
      className={cn('relative flex', variant === 'pill' ? 'glass-subtle rounded-md p-1' : 'border-b border-border')}>
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
            )}>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

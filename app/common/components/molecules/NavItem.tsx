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
    active
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-primary-subtle hover:text-foreground',
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
    <Link
      href={href ?? '/'}
      className={classes}
      aria-current={active ? 'page' : undefined}
      title={compact ? label : undefined}>
      <Icon icon={icon} />
      {!compact && <span>{label}</span>}
    </Link>
  );
}

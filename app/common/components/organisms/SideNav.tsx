'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Search } from 'lucide-react';
import { siteConfig } from '@/app/common/config/site';
import { cn } from '@/app/common/lib/utils';
import { useSearchModalStore } from '@/app/common/store/search-modal';
import { Logo } from '@/app/common/components/atoms';
import { NavItem } from '@/app/common/components/molecules';

export interface SideNavProps {
  compact?: boolean;
}

export function SideNav({ compact = false }: SideNavProps) {
  const pathname = usePathname() ?? '/';
  const { theme, setTheme } = useTheme();
  const openSearch = useSearchModalStore((s) => s.open);

  return (
    <nav
      data-compact={compact || undefined}
      className={cn(
        'glass-medium sticky top-0 flex h-screen flex-col justify-between py-6',
        compact ? 'w-[72px] items-center px-2' : 'w-[240px] px-4',
      )}
      style={{ zIndex: 'var(--z-nav)' }}>
      <div className="flex flex-col gap-2">
        {/* Logo */}
        <Link href="/" className={cn('mb-6', compact ? 'px-0' : 'px-3')}>
          <Logo size={compact ? 'sm' : 'md'} />
        </Link>

        {/* Nav Items */}
        {siteConfig.navItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.IconComponent}
            label={item.label}
            href={item.href}
            active={pathname === item.href}
            compact={compact}
          />
        ))}

        {/* Search */}
        <NavItem icon={Search} label="검색" onClick={openSearch} compact={compact} />
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
        )}>
        <Sun className="h-5 w-5 dark:hidden" />
        <Moon className="hidden h-5 w-5 dark:block" />
        {!compact && <span>테마</span>}
      </button>
    </nav>
  );
}

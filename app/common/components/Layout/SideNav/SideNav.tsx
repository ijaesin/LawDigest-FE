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
      style={{ zIndex: 'var(--z-nav)' }}>
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
              )}>
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
          )}>
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
        )}>
        <Sun className="h-5 w-5 dark:hidden" />
        <Moon className="hidden h-5 w-5 dark:block" />
        {!compact && <span>테마</span>}
      </button>
    </nav>
  );
}

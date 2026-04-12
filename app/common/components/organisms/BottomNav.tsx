'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { siteConfig } from '@/app/common/config/site';
import { cn } from '@/app/common/lib/utils';
import { Button } from '@/app/common/components/ui/button';
import { useSearchModalStore } from '@/app/common/store/search-modal';
import { Icon } from '@/app/common/components/atoms';

function isNavActive(pathname: string, href: string): boolean {
  return pathname === '/' ? pathname.endsWith(href) : href !== '/' && pathname.startsWith(href);
}

export function BottomNav() {
  const { navItems } = siteConfig;
  const pathname = usePathname() ?? '/';
  const openSearch = useSearchModalStore((s) => s.open);

  const activeIndex = navItems.findIndex(({ href }) => isNavActive(pathname, href));

  return (
    <section className="pointer-events-none fixed bottom-0 left-0 z-50 w-full px-2 pb-2 md:hidden">
      <div className="pointer-events-auto mx-auto flex w-full max-w-md items-end gap-2">
        {/* Nav pill */}
        <div className="glass-medium relative flex-1 rounded-full shadow-2xl">
          <ul className="relative z-10 flex items-center justify-between gap-1 px-1 py-1">
            {navItems.map(({ label, href, IconComponent }) => {
              const isActive = isNavActive(pathname, href);

              return (
                <li key={label} className="w-full">
                  <Link
                    href={href}
                    className="group relative flex flex-col items-center gap-1 rounded-full py-1 text-[10px] font-medium transition-all duration-[var(--duration-slow)]">
                    <Icon
                      icon={IconComponent}
                      size="md"
                      className={cn(
                        'transition-colors duration-[var(--duration-slow)]',
                        isActive ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    />
                    <p
                      className={cn(
                        'leading-none transition-all duration-[var(--duration-slow)]',
                        isActive ? 'font-semibold text-foreground' : 'text-muted-foreground',
                      )}>
                      {label}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Sliding indicator */}
          {activeIndex >= 0 && (
            <div
              className="glass-subtle pointer-events-none absolute bottom-1 top-1 z-0 rounded-full shadow-lg transition-all duration-500 ease-out"
              style={{
                left: `calc(${activeIndex * 25}% + 0.25rem)`,
                width: 'calc(25% - 0.5rem)',
              }}
            />
          )}
        </div>

        {/* Rainbow search button */}
        <Button
          onClick={openSearch}
          variant="ghost"
          size="icon"
          className="h-auto w-auto rounded-full bg-gradient-to-r from-yellow-500 via-red-500 to-blue-500 p-[2px] shadow-lg transition-all duration-[var(--duration-slow)] hover:from-yellow-600 hover:via-red-600 hover:to-blue-600"
          aria-label="검색">
          <div className="relative flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full">
            {/* Opaque layer */}
            <div className="absolute inset-[1px] rounded-full bg-gradient-to-b from-white/95 to-white/90" />
            {/* Glass layer */}
            <div className="absolute inset-[1px] rounded-full bg-white/20 backdrop-blur-md" />
            {/* Icon */}
            <Search className="relative z-10 h-6 w-6 text-foreground" />
          </div>
        </Button>
      </div>
    </section>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { siteConfig } from '@/app/common/config/site';
import { Button } from '@/app/common/components/ui/button';
import { useSearchModalStore } from '@/app/common/store';
import { useCallback } from 'react';

function Nav() {
  const { navItems } = siteConfig;
  const pathname = usePathname();
  const open = useSearchModalStore((s) => s.open);

  const onClickSearchBar = useCallback(() => {
    open();
  }, [open]);

  const activeIndex = navItems.findIndex(({ href }) =>
    pathname === '/' ? pathname?.endsWith(href) : href !== '/' && pathname?.startsWith(href),
  );

  return (
    <section className="fixed bottom-0 left-0 z-50 px-2 pb-2 w-full pointer-events-none md:hidden">
      <div className="flex gap-2 items-end mx-auto w-full max-w-md pointer-events-auto">
        <div className="relative flex-1 rounded-full glass-medium shadow-2xl">
          <ul className="flex relative z-10 gap-1 justify-between items-center px-1 py-1">
            {navItems.map(({ label, href, IconComponent }) => {
              const isActive = pathname === '/' ? pathname?.endsWith(href) : href !== '/' && pathname?.startsWith(href);

              return (
                <li key={label} className="w-full">
                  <Link
                    className="flex flex-col items-center gap-1 text-[10px] font-medium transition-all duration-[var(--duration-slow)] relative group rounded-full py-1"
                    href={href}>
                    <IconComponent
                      className={`w-6 h-6 transition-colors duration-[var(--duration-slow)] ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    />
                    <p
                      className={`leading-none transition-all duration-[var(--duration-slow)] ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      {label}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>

          {activeIndex >= 0 && (
            <div
              className="absolute top-1 bottom-1 z-0 rounded-full shadow-lg glass-subtle transition-all duration-500 ease-out pointer-events-none"
              style={{
                left: `calc(${activeIndex * 25}% + 0.25rem)`,
                width: `calc(25% - 0.5rem)`,
              }}
            />
          )}
        </div>

        <Button
          onClick={onClickSearchBar}
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-[2px] rounded-full bg-gradient-to-r from-yellow-500 via-red-500 to-blue-500 hover:from-yellow-600 hover:via-red-600 hover:to-blue-600 transition-all duration-[var(--duration-slow)] shadow-lg"
          aria-label="검색">
          <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full relative overflow-hidden">
            {/* Opaque layer to block rainbow gradient */}
            <div className="absolute inset-[1px] bg-gradient-to-b from-white/95 to-white/90 rounded-full" />
            {/* Glass effect layer */}
            <div className="absolute inset-[1px] rounded-full backdrop-blur-md bg-white/20" />
            {/* Icon */}
            <Search className="relative z-10 w-6 h-6 text-foreground" />
          </div>
        </Button>
      </div>
    </section>
  );
}

export default Nav;

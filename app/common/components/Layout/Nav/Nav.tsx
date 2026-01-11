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

  console.log('Active Index:', activeIndex, 'Pathname:', pathname);

  return (
    <section className="fixed bottom-0 left-0 z-50 px-2 pb-2 w-full pointer-events-none md:hidden">
      <div className="flex gap-2 items-end mx-auto w-full max-w-md pointer-events-auto">
        <div className="relative flex-1 rounded-full border shadow-2xl backdrop-blur-md bg-white/20 border-white/60 shadow-black/20">
          <ul className="flex relative z-10 gap-1 justify-between items-center px-1 py-1">
            {navItems.map(({ label, href, IconComponent }) => {
              const isActive = pathname === '/' ? pathname?.endsWith(href) : href !== '/' && pathname?.startsWith(href);

              return (
                <li key={label} className="w-full">
                  <Link
                    className="flex flex-col items-center gap-1 text-[10px] font-medium transition-all duration-300 relative group rounded-full py-1"
                    href={href}>
                    <IconComponent
                      className={`w-6 h-6 transition-colors duration-300 ${
                        isActive ? 'text-gray-900' : 'text-gray-600'
                      }`}
                    />
                    <p
                      className={`leading-none transition-all duration-300 ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                      {label}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>

          {activeIndex >= 0 && (
            <div
              className="absolute top-1 bottom-1 z-0 rounded-full border shadow-lg backdrop-blur-xl transition-all duration-500 ease-out pointer-events-none bg-white/40 border-white/60"
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
          className="h-auto w-auto p-[2px] rounded-full bg-gradient-to-r from-yellow-500 via-red-500 to-blue-500 hover:from-yellow-600 hover:via-red-600 hover:to-blue-600 transition-all duration-300 shadow-lg"
          aria-label="검색">
          <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full relative overflow-hidden">
            {/* Opaque layer to block rainbow gradient */}
            <div className="absolute inset-[1px] bg-gradient-to-b from-white/95 to-white/90 rounded-full" />
            {/* Glass effect layer */}
            <div className="absolute inset-[1px] rounded-full backdrop-blur-md bg-white/20" />
            {/* Icon */}
            <Search className="relative z-10 w-6 h-6 text-gray-900" />
          </div>
        </Button>
      </div>
    </section>
  );
}

export default Nav;

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { siteConfig } from '@/app/common/config/site';
import { IconNavBorder } from '@/public/svgs';
import {
  GoBackButton,
  SettingButton,
  SearchButton,
  NotificationButton,
  ThemeSwitchButton,
} from '@/app/common/components';
import { SearchBarButton } from '@/app/search/components';
import Logo from './Logo';

export default function Header({
  logo,
  goBack,
  title,
  setting,
  search,
  notification,
  theme,
}: {
  logo?: boolean;
  goBack?: boolean;
  title?: string;
  setting?: boolean;
  search?: boolean;
  notification?: boolean;
  theme?: boolean;
}) {
  const pathname = usePathname();
  const { navItems } = siteConfig;
  const [toggleSearch, setToggleSearch] = useState(false);
  const isTimelineOrFollowing = pathname.startsWith('/timeline') || pathname.startsWith('/following');

  const onClickSearch = useCallback(() => {
    setToggleSearch(!toggleSearch);
  }, [toggleSearch]);

  return (
    <section className="w-full">
      <nav
        className={`relative flex items-center w-full lg:shadow-md md:h-[98px] ${isTimelineOrFollowing ? 'md:border-b' : 'border-b'}`}>
        <div className="hidden xl:absolute xl:left-[-100px] lg:block">
          <Link href="/">
            <Logo width={106} height={18} />
          </Link>
        </div>

        {logo && (
          <div className="lg:hidden">
            <Link href="/">
              <Logo width={106} height={18} />
            </Link>
          </div>
        )}

        {goBack && (
          <div className="flex justify-start lg:hidden">
            <GoBackButton />
          </div>
        )}

        <div className="hidden justify-center mx-auto md:flex">
          <ul className="flex justify-between md:min-w-[430px] w-full gap-2 px-10 lg:gap-20">
            {navItems.map(({ label, href }) => {
              const isActive = pathname === '/' ? pathname?.endsWith(href) : href !== '/' && pathname?.startsWith(href);

              return (
                <li key={label} className="flex justify-center items-center">
                  <div className={`${isActive ? 'z-10' : '-z-10'} absolute`}>
                    <IconNavBorder />
                  </div>
                  <Link
                    className={`${isActive ? 'text-foreground font-semibold bg-transparent' : 'text-muted-foreground'} flex flex-col items-center justify-center text-sm lg:text-base font-medium lg:px-5 lg:py-3 bg-white w-[110px] h-[60px] leading-[60px]`}
                    href={href}>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {title && (
          <div className="flex justify-center md:hidden">
            <div className="font-medium">{title}</div>
          </div>
        )}

        <div className="flex justify-end items-center ml-auto xl:absolute xl:right-[-100px]">
          {setting && (
            <>
              <ThemeSwitchButton />
              <SettingButton />
            </>
          )}

          {search && (
            <>
              <ThemeSwitchButton />
              <SearchButton onClick={onClickSearch} />
            </>
          )}

          {notification && (
            <>
              <ThemeSwitchButton />
              <NotificationButton />
            </>
          )}

          {theme && <ThemeSwitchButton />}
        </div>
      </nav>

      <div>{toggleSearch && <SearchBarButton />}</div>
    </section>
  );
}

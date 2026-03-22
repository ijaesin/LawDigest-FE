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
      <main className="min-w-0 flex-1 max-w-[640px] px-4 pb-20 md:pb-0">{children}</main>

      {/* Right Sidebar — desktop only */}
      {rightSidebar && <RightSidebar>{rightSidebar}</RightSidebar>}

      {/* Mobile Bottom Nav */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 md:hidden transition-transform',
          'duration-[var(--duration-normal)] ease-[var(--easing-default)]',
          scrollDirection === 'down' ? 'translate-y-full' : 'translate-y-0',
        )}
        style={{ zIndex: 'var(--z-nav)' }}>
        <Nav />
      </div>
    </div>
  );
}

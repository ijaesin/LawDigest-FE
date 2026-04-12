import { cn } from '@/app/common/lib/utils';

export interface RightSidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function RightSidebar({ children, className }: RightSidebarProps) {
  return (
    <aside
      className={cn('sticky top-0 hidden h-screen w-[300px] shrink-0 overflow-y-auto py-6 pl-4 lg:block', className)}>
      <div className="flex flex-col gap-4">{children}</div>
    </aside>
  );
}

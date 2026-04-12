import * as React from 'react';
import { cn } from '@/app/common/lib/utils';

const glassLevelMap = {
  subtle: 'glass-subtle',
  medium: 'glass-medium',
  heavy: 'glass-heavy',
} as const;

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: keyof typeof glassLevelMap;
  hover?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, level = 'subtle', hover = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        glassLevelMap[level],
        'rounded-md p-4 md:p-6 transition-all',
        'duration-[var(--duration-normal)] ease-[var(--easing-default)]',
        hover && 'hover:-translate-y-0.5 hover:bg-[var(--glass-bg-medium)] cursor-pointer',
        className,
      )}
      {...props}>
      {children}
    </div>
  ),
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };

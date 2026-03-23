import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/app/common/lib/utils';

const glassBadgeVariants = cva(
  'inline-flex items-center rounded-sm border-none px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary-subtle text-primary',
        accent: 'bg-accent-subtle text-accent',
        warning: 'bg-[hsl(var(--warning)/0.15)] text-warning',
        danger: 'bg-[hsl(var(--danger)/0.15)] text-danger',
        glass: 'glass-subtle text-foreground',
        outline: 'border border-border bg-transparent text-foreground',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

export interface GlassBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof glassBadgeVariants> {}

const GlassBadge = React.forwardRef<HTMLSpanElement, GlassBadgeProps>(({ className, variant, ...props }, ref) => (
  <span className={cn(glassBadgeVariants({ variant, className }))} ref={ref} {...props} />
));

GlassBadge.displayName = 'GlassBadge';

export { GlassBadge, glassBadgeVariants };

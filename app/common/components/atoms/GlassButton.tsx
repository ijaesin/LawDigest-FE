import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/app/common/lib/utils';

const glassButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 duration-[var(--duration-fast)] ease-[var(--easing-default)]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover',
        glass: 'glass-subtle text-foreground hover:bg-[var(--glass-bg-medium)]',
        outline: 'border border-border bg-transparent text-foreground shadow-sm hover:bg-primary-subtle',
        ghost: 'text-muted-foreground hover:bg-primary-subtle hover:text-foreground',
        danger: 'bg-danger text-danger-foreground shadow-sm hover:bg-danger/90',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 rounded-md px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(glassButtonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);

GlassButton.displayName = 'GlassButton';

export { GlassButton, glassButtonVariants };

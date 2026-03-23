import * as React from 'react';
import { cn } from '@/app/common/lib/utils';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(({ className, icon, ...props }, ref) => (
  <div className={cn('glass-subtle flex items-center gap-2 rounded-md px-3 py-2', className)}>
    {icon}
    <input
      ref={ref}
      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  </div>
));

GlassInput.displayName = 'GlassInput';

export { GlassInput };

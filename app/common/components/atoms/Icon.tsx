import type { LucideIcon } from 'lucide-react';
import { cn } from '@/app/common/lib/utils';

const sizeMap = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' } as const;

export interface IconProps {
  icon: LucideIcon;
  size?: keyof typeof sizeMap;
  className?: string;
}

export function Icon({ icon: LucideIconComponent, size = 'md', className }: IconProps) {
  return <LucideIconComponent className={cn(sizeMap[size], className)} />;
}
Icon.displayName = 'Icon';

'use client';

import * as React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/common/components/ui/avatar';
import { cn } from '@/app/common/lib/utils';
import { PARTY_COLOR } from '@/app/common/constants/theme';

const sizeMap = {
  sm: { container: 'h-7 w-7', border: '1.5px', text: 'text-[10px]' },
  md: { container: 'h-10 w-10', border: '2px', text: 'text-xs' },
  lg: { container: 'h-14 w-14', border: '2px', text: 'text-sm' },
  xl: { container: 'h-20 w-20', border: '3px', text: 'text-lg' },
} as const;

export interface GlassAvatarProps {
  size?: keyof typeof sizeMap;
  partyName?: string;
  src?: string;
  fallback?: string;
  className?: string;
}

const GlassAvatar = React.forwardRef<HTMLSpanElement, GlassAvatarProps>(
  ({ size = 'md', partyName, src, fallback, className }, ref) => {
    const sizeConfig = sizeMap[size];
    const partyColor = partyName ? PARTY_COLOR[partyName as keyof typeof PARTY_COLOR] : undefined;

    return (
      <Avatar
        ref={ref}
        className={cn(sizeConfig.container, className)}
        style={{
          borderWidth: partyColor ? sizeConfig.border : undefined,
          borderColor: partyColor,
          borderStyle: partyColor ? 'solid' : undefined,
        }}>
        {src && <AvatarImage src={src} alt={fallback ?? ''} />}
        <AvatarFallback className={cn(sizeConfig.text, 'font-semibold')}>{fallback}</AvatarFallback>
      </Avatar>
    );
  },
);
GlassAvatar.displayName = 'GlassAvatar';

export { GlassAvatar };

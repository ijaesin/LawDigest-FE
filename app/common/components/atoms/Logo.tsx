import Image from 'next/image';
import { cn } from '@/app/common/lib/utils';

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 140, height: 28 },
  lg: { width: 222, height: 37 },
} as const;

export interface LogoProps {
  size?: keyof typeof sizeMap;
  className?: string;
}

export function Logo({ size = 'md', className }: LogoProps) {
  const { width, height } = sizeMap[size];
  return (
    <span className={cn('inline-flex', className)}>
      <Image src="/svgs/logo.svg" alt="모두의입법" width={width} height={height} className="dark:hidden" priority />
      <Image
        src="/svgs/logo-dark.svg"
        alt="모두의입법"
        width={width}
        height={height}
        className="hidden dark:block"
        priority
      />
    </span>
  );
}
Logo.displayName = 'Logo';

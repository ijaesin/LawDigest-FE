import { NavIconProps } from '@/types';

export default function IconHome({ className, isActive }: NavIconProps) {
  return (
    <svg
      width="30"
      height="31"
      viewBox="0 0 30 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}>
      <path
        d="M3.25 27.25V13.3605L15 3.96047L26.75 13.3605V27.25H3.25Z"
        fill={isActive ? '#FFFFFF' : '#191919'}
        stroke={isActive ? '#191919' : '#999999'}
        strokeWidth="1.5"
      />
      <path d="M15 28V18" stroke={isActive ? '#191919' : '#999999'} strokeWidth="1.5" />
    </svg>
  );
}

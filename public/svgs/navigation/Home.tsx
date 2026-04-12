import type { NavIconProps } from '@/app/common/types';

export default function IconHome({ isActive }: NavIconProps) {
  return isActive ? (
    <svg width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.25 27.25V13.3605L15 3.96047L26.75 13.3605V27.25H3.25Z"
        fill="#191919"
        stroke="white"
        strokeWidth="1.5"
      />
      <path d="M15 28V18" stroke="white" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.25 27.25V13.3605L15 3.96047L26.75 13.3605V27.25H3.25Z"
        fill="#191919"
        stroke="#999999"
        strokeWidth="1.5"
      />
      <path d="M15 28V18" stroke="#999999" strokeWidth="1.5" />
    </svg>
  );
}

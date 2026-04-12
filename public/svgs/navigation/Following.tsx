import type { NavIconProps } from '@/app/common/types';

export default function IconFollowing({ isActive }: NavIconProps) {
  return isActive ? (
    <svg width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.65 26.9483V3.65H24.35V26.9483L15.2907 22.4186L15 22.2733L14.7093 22.4186L5.65 26.9483Z"
        stroke="white"
        strokeWidth="1.3"
      />
      <path
        d="M5.65 26.9483V3.65H24.35V26.9483L15.2907 22.4186L15 22.2733L14.7093 22.4186L5.65 26.9483Z"
        stroke="white"
        strokeOpacity="0.2"
        strokeWidth="1.3"
      />
    </svg>
  ) : (
    <svg width="30" height="31" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.65 26.9483V3.65H24.35V26.9483L15.2907 22.4186L15 22.2733L14.7093 22.4186L5.65 26.9483Z"
        stroke="#999999"
        strokeWidth="1.3"
      />
      <path
        d="M5.65 26.9483V3.65H24.35V26.9483L15.2907 22.4186L15 22.2733L14.7093 22.4186L5.65 26.9483Z"
        stroke="#999999"
        strokeOpacity="0.2"
        strokeWidth="1.3"
      />
    </svg>
  );
}

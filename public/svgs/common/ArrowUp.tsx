'use client';

import { useTheme } from 'next-themes';

export default function IconArrowUp() {
  const { theme } = useTheme();

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.9201 15.0506L13.4001 8.53062C12.6301 7.76063 11.3701 7.76063 10.6001 8.53062L4.08008 15.0506"
        stroke={theme === 'dark' ? '#555555' : '#292D32'}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

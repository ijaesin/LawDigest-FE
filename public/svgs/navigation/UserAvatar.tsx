import { NavIconProps } from '@/types';

export default function IconUserAvatar({ className, isActive }: NavIconProps) {
  return isActive ? (
    <svg
      width="30"
      height="31"
      viewBox="0 0 30 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}>
      <circle cx="15" cy="9.25" r="6.25" fill="white" />
      <path
        d="M27.5 28C27.5 27.5815 27.4741 27.1642 27.4226 26.75C27.2924 25.7018 26.9987 24.6731 26.5485 23.6948C25.9203 22.3299 24.9996 21.0897 23.8388 20.045C22.6781 19.0004 21.3001 18.1717 19.7835 17.6064C18.267 17.041 16.6415 16.75 15 16.75C13.3585 16.75 11.733 17.041 10.2165 17.6064C8.69989 18.1717 7.3219 19.0004 6.16116 20.045C5.00043 21.0897 4.07969 22.3299 3.4515 23.6948C3.00125 24.6731 2.70762 25.7018 2.5774 26.75C2.52594 27.1642 2.5 27.5815 2.5 28L27.5 28Z"
        fill="white"
      />
    </svg>
  ) : (
    <svg
      width="30"
      height="31"
      viewBox="0 0 30 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}>
      <circle
        cx="15"
        cy="9.25"
        r="5.6"
        fill={isActive ? '#FFFFFF' : 'none'}
        stroke={isActive ? 'none' : '#999999'}
        strokeWidth="1.3"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.58701 24.2174C4.21212 25.032 3.96136 25.8836 3.83837 26.75L26.1616 26.75C26.0386 25.8836 25.7879 25.032 25.413 24.2174C24.8587 23.013 24.0421 21.9097 23.0026 20.9742C21.9629 20.0384 20.7217 19.2901 19.3469 18.7776C17.972 18.2651 16.4946 18 15 18C13.5054 18 12.028 18.2651 10.6531 18.7776C9.27829 19.2901 8.03706 20.0384 6.99737 20.9742C5.95794 21.9097 5.14131 23.013 4.58701 24.2174ZM27.4226 26.75C27.4741 27.1642 27.5 27.5815 27.5 28L2.5 28C2.5 27.5815 2.52594 27.1642 2.5774 26.75C2.70762 25.7018 3.00125 24.6731 3.4515 23.6948C4.07969 22.3299 5.00043 21.0897 6.16116 20.045C7.3219 19.0004 8.69989 18.1717 10.2165 17.6064C11.733 17.041 13.3585 16.75 15 16.75C16.6415 16.75 18.267 17.041 19.7835 17.6064C21.3001 18.1717 22.6781 19.0004 23.8388 20.045C24.9996 21.0897 25.9203 22.3299 26.5485 23.6948C26.9987 24.6731 27.2924 25.7018 27.4226 26.75Z"
        fill="#999999"
        stroke="none"
        strokeWidth="1"
      />
    </svg>
  );
}

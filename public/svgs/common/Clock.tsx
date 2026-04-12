export default function IconClock() {
  return (
    <>
      {/* Dark Mode SVG */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hidden dark:block">
        <circle cx="9" cy="9" r="7" stroke="#999999" />
        <circle cx="9" cy="9" r="7" stroke="black" strokeOpacity="0.2" />
        <path d="M9 4.5V9H13.5" stroke="#999999" />
        <path d="M9 4.5V9H13.5" stroke="black" strokeOpacity="0.2" />
      </svg>
      {/* Light Mode SVG */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="dark:hidden">
        <rect width="18" height="18" fill="white" />
        <circle cx="9" cy="9" r="7" stroke="#999999" />
        <path d="M9 4.5V9H13.5" stroke="#999999" />
      </svg>
    </>
  );
}

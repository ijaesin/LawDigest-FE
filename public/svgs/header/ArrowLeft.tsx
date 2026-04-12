export default function IconArrowLeft() {
  return (
    <>
      {/* Dark Mode SVG */}
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hidden dark:block">
        <path
          d="M12.57 8.93018L6.5 15.0002L12.57 21.0702"
          stroke="#999999"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.57 8.93018L6.5 15.0002L12.57 21.0702"
          stroke="black"
          strokeOpacity="0.2"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23.4999 15H6.66992"
          stroke="#999999"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23.4999 15H6.66992"
          stroke="black"
          strokeOpacity="0.2"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Light Mode SVG */}
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="dark:hidden">
        <path
          d="M12.57 8.93018L6.5 15.0002L12.57 21.0702"
          stroke="black"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23.5 15H6.67004"
          stroke="black"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}

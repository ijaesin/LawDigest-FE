export default function IconChecked() {
  return (
    <>
      {/* Light Mode SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="dark:hidden">
        <circle cx="10" cy="10" r="10" fill="#999999" />
        <circle cx="10" cy="10" r="10" fill="black" fillOpacity="0.2" />
        <path
          d="M8.25009 12.4324L5.81759 9.99991L4.98926 10.8224L8.25009 14.0832L15.2501 7.08324L14.4276 6.26074L8.25009 12.4324Z"
          fill="white"
        />
      </svg>
      {/* Dark Mode SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hidden dark:block">
        <circle cx="10" cy="10" r="10" fill="#555555" />
        <path
          d="M8.25009 12.4324L5.81759 9.99991L4.98926 10.8224L8.25009 14.0832L15.2501 7.08324L14.4276 6.26074L8.25009 12.4324Z"
          fill="#E0E0E0"
        />
      </svg>
    </>
  );
}

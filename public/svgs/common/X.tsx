'use client';

export default function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      {...props}>
      <path d="M3 3L21 21" />
      <path d="M21 3L3 21" />
    </svg>
  );
}

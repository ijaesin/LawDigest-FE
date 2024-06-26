import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '선거 페이지',
  description: '선거 정보를 자세히 확인할 수 있는 페이지',
};

export default function ElectionLayout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}

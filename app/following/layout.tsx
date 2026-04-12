import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '팔로잉 페이지',
  description: '내가 팔로우한 의원과 법안을 확인할 수 있는 페이지',
};

export default function FollowingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

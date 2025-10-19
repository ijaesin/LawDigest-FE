import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// TODO: React Query hydration disabled temporarily while investigating build error
import { ACCESS_TOKEN } from '@/app/common/constants';
// import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import MyPageContent from './MyPageContent';

export default async function MyPage() {
  const token = (await cookies()).get(ACCESS_TOKEN)?.value;
  if (!token) redirect('/auth/login');

  return <MyPageContent />;
}

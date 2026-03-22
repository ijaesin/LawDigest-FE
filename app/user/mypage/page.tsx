// TODO: React Query hydration disabled temporarily while investigating build error
import { requireAuth } from '@/app/auth/lib/require-auth';
// import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import MyPageContent from './MyPageContent';

export default async function MyPage() {
  await requireAuth();
  return <MyPageContent />;
}

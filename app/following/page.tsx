import { requireAuth } from '@/app/auth/lib/require-auth';
import { Suspense } from 'react';
import { Loading } from '@/app/common/components/Loading';
import NewFollowingContainer from './components/NewFollowingContainer';

export default async function Following() {
  await requireAuth();
  return (
    <Suspense fallback={<Loading />}>
      <NewFollowingContainer />
    </Suspense>
  );
}

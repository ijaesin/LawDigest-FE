import { requireAuth } from '@/app/auth/lib/require-auth';
import { Suspense } from 'react';
import { Loading } from '@/app/common/components/Loading';
import NewMyPageContainer from './NewMyPageContainer';

export default async function MyPage() {
  await requireAuth();
  return (
    <Suspense fallback={<Loading />}>
      <NewMyPageContainer />
    </Suspense>
  );
}

import { requireAuth } from '@/app/auth/lib/require-auth';
import { AppLayout } from '@/app/common/components/Layout/AppLayout/AppLayout';
import FollowingContent from './components/FollowingContent';

export default async function Following() {
  await requireAuth();
  return (
    <AppLayout>
      <FollowingContent />
    </AppLayout>
  );
}

import { requireAuth } from '@/app/auth/lib/require-auth';
import FollowingContent from './components/FollowingContent';

export default async function Following() {
  await requireAuth();
  return <FollowingContent />;
}

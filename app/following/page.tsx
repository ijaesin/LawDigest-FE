import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_TOKEN } from '@/app/common/constants';
import FollowingContent from './components/FollowingContent';

export default async function Following() {
  const token = (await cookies()).get(ACCESS_TOKEN)?.value;
  if (!token) redirect('/auth/login');

  return <FollowingContent />;
}

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { ACCESS_TOKEN } from '@/app/common/constants';
import { getNotification, getNotificationCount } from '@/app/notification/services/apis';
import { notificationKeys } from '@/app/notification/services/query-keys';
import NotificationContent from './components/NotificationContent';

export const dynamic = 'force-dynamic';

export default async function NotificationPage() {
  const token = (await cookies()).get(ACCESS_TOKEN)?.value;
  if (!token) redirect('/auth/login');

  const qc = new QueryClient();
  await Promise.all([
    qc.prefetchQuery({ queryKey: notificationKeys.list(), queryFn: () => getNotification() }),
    qc.prefetchQuery({ queryKey: notificationKeys.count(), queryFn: () => getNotificationCount() }),
  ]).catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotificationContent />
    </HydrationBoundary>
  );
}

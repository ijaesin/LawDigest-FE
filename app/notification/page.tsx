import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { requireAuth } from '@/app/auth/lib/require-auth';
import { getNotification, getNotificationCount } from '@/app/notification/services/apis';
import { notificationKeys } from '@/app/notification/services/query-keys';
import NewNotificationContainer from './components/NewNotificationContainer';

export const dynamic = 'force-dynamic';

export default async function NotificationPage() {
  await requireAuth();
  const qc = new QueryClient();
  await Promise.all([
    qc.prefetchQuery({ queryKey: notificationKeys.list(), queryFn: () => getNotification() }),
    qc.prefetchQuery({ queryKey: notificationKeys.count(), queryFn: () => getNotificationCount() }),
  ]).catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NewNotificationContainer />
    </HydrationBoundary>
  );
}

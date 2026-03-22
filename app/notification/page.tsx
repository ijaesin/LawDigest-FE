import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getNotification, getNotificationCount } from '@/app/notification/services/apis';
import { notificationKeys } from '@/app/notification/services/query-keys';
import { NotificationList } from './components';

export const dynamic = 'force-dynamic';

export default async function NotificationPage() {
  const qc = new QueryClient();
  // Prefetch basic data for faster client hydration (non-blocking if fails)
  await Promise.all([
    qc.prefetchQuery({ queryKey: notificationKeys.list(), queryFn: () => getNotification() }),
    qc.prefetchQuery({ queryKey: notificationKeys.count(), queryFn: () => getNotificationCount() }),
  ]).catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <section className="lg:max-w-[840px] mx-auto">
        <NotificationList />
      </section>
    </HydrationBoundary>
  );
}

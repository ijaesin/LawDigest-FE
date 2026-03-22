import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AppLayout } from '@/app/common/components/Layout/AppLayout/AppLayout';
import { Loading } from '@/app/common/components/Loading';
import { Feed } from '@/app/bill/components';
import { NotificationTopThree } from '@/app/notification/components';
import FeedErrorFallback from '@/app/bill/components/FeedErrorFallback';

export const dynamic = 'force-dynamic';

function HomeSidebar() {
  return (
    <Suspense fallback={<Loading />}>
      <NotificationTopThree />
    </Suspense>
  );
}

export default function Home() {
  return (
    <AppLayout rightSidebar={<HomeSidebar />}>
      <section>
        <ErrorBoundary FallbackComponent={FeedErrorFallback}>
          <Suspense fallback={<Loading />}>
            <Feed />
          </Suspense>
        </ErrorBoundary>
      </section>
    </AppLayout>
  );
}

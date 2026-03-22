import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Layout } from '@/app/common/components/Layout/Layout';
import { Loading } from '@/app/common/components/Loading';
import { Feed } from '@/app/bill/components';
import { NotificationTopThree } from '@/app/notification/components';
import FeedErrorFallback from '@/app/bill/components/FeedErrorFallback';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <Layout nav logo notification>
      <section className="lg:w-[880px] mx-auto">
        <ErrorBoundary FallbackComponent={FeedErrorFallback}>
          <Suspense fallback={<Loading />}>
            <NotificationTopThree />
            <Feed />
          </Suspense>
        </ErrorBoundary>
      </section>
    </Layout>
  );
}

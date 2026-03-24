import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Loading } from '@/app/common/components/Loading';
import NewFeedContainer from '@/app/bill/components/NewFeedContainer';
import FeedErrorFallback from '@/app/bill/components/FeedErrorFallback';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <ErrorBoundary FallbackComponent={FeedErrorFallback}>
      <Suspense fallback={<Loading />}>
        <NewFeedContainer />
      </Suspense>
    </ErrorBoundary>
  );
}

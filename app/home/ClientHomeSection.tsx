'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Loading } from '@/app/common/components/Loading';
import { Feed } from '@/app/bill/components';
import { NotificationTopThree } from '@/app/notification/components';
import FeedErrorFallback from '@/app/bill/components/FeedErrorFallback';

export default function ClientHomeSection() {
  return (
    <section className="lg:w-[880px] mx-auto">
      <ErrorBoundary FallbackComponent={FeedErrorFallback}>
        <Suspense fallback={<Loading />}>
          <NotificationTopThree />
          <Feed />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}

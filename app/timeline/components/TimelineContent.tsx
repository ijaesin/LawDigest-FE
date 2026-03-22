'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import TimelineBoard from './TimelineBoard';
import ListContainer from './ListContainer';
import TimelineErrorFallback from './TimelineErrorFallback';
import TimelineSkeleton from './TimelineSkeleton';

export default function TimelineContent() {
  return (
    <ErrorBoundary FallbackComponent={TimelineErrorFallback}>
      <TimelineBoard />
      <Suspense fallback={<TimelineSkeleton />}>
        <ListContainer />
      </Suspense>
    </ErrorBoundary>
  );
}

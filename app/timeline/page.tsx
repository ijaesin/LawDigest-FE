import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Loading from '@/app/common/components/Loading/Loading';
import NewTimelineContainer from './components/NewTimelineContainer';

export const dynamic = 'force-dynamic';

export default function Timeline() {
  return (
    <ErrorBoundary fallback={<p className="text-center py-10 text-muted-foreground">타임라인을 불러올 수 없습니다.</p>}>
      <Suspense fallback={<Loading />}>
        <NewTimelineContainer />
      </Suspense>
    </ErrorBoundary>
  );
}

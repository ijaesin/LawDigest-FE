'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Loading from '@/app/common/components/Loading/Loading';
import NewSearchContainer from '@/app/search/components/NewSearchContainer';

export default function SearchResult() {
  return (
    <ErrorBoundary
      fallback={<p className="text-center py-10 text-muted-foreground">검색 결과를 불러올 수 없습니다.</p>}>
      <Suspense fallback={<Loading />}>
        <NewSearchContainer />
      </Suspense>
    </ErrorBoundary>
  );
}

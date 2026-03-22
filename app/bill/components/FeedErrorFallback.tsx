'use client';

import type { FallbackProps } from 'react-error-boundary';
import { Button } from '@/app/common/components/ui/button';

export default function FeedErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <section className="flex flex-col items-center justify-center py-20 gap-4">
      <h2 className="text-lg font-semibold text-gray-3">피드를 불러올 수 없습니다</h2>
      <p className="text-sm text-gray-2">{error instanceof Error ? error.message : '알 수 없는 오류'}</p>
      <Button variant="outline" onClick={resetErrorBoundary}>
        다시 시도
      </Button>
    </section>
  );
}

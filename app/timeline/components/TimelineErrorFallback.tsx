'use client';

import { Button } from '@/app/common/components/ui/button';
import type { FallbackProps } from 'react-error-boundary';

export default function TimelineErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-5">
      <p className="text-lg font-semibold">타임라인을 불러올 수 없습니다</p>
      <p className="text-sm text-gray-2 dark:text-gray-3 text-center">
        {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
      </p>
      <Button variant="outline" onClick={resetErrorBoundary}>
        다시 시도
      </Button>
    </div>
  );
}

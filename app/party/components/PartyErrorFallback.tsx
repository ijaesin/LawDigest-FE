'use client';

import { Button } from '@/app/common/components/ui/button';
import type { FallbackProps } from 'react-error-boundary';

export default function PartyErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-lg font-semibold">정당 정보를 불러오지 못했습니다.</p>
      <p className="text-sm text-gray-2">{error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}</p>
      <Button onClick={resetErrorBoundary} variant="outline">
        다시 시도
      </Button>
    </div>
  );
}

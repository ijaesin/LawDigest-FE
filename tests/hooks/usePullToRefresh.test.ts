import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePullToRefresh } from '@/app/common/hooks/usePullToRefresh';

describe('usePullToRefresh', () => {
  it('returns pull state and handlers', () => {
    const { result } = renderHook(() => usePullToRefresh({ onRefresh: vi.fn() }));
    expect(result.current.pulling).toBe(false);
    expect(result.current.refreshing).toBe(false);
    expect(result.current.pullDistance).toBe(0);
    expect(result.current.handlers.onTouchStart).toBeDefined();
    expect(result.current.handlers.onTouchMove).toBeDefined();
    expect(result.current.handlers.onTouchEnd).toBeDefined();
  });
});

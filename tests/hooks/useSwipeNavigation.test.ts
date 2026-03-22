import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSwipeNavigation } from '@/app/common/hooks/useSwipeNavigation';

describe('useSwipeNavigation', () => {
  it('returns touch handlers', () => {
    const { result } = renderHook(() => useSwipeNavigation({ onSwipeLeft: vi.fn(), onSwipeRight: vi.fn() }));
    expect(result.current.onTouchStart).toBeDefined();
    expect(result.current.onTouchEnd).toBeDefined();
  });
});

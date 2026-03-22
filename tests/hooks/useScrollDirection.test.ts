import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useScrollDirection } from '@/app/common/hooks/useScrollDirection';

describe('useScrollDirection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function scrollTo(y: number) {
    Object.defineProperty(window, 'scrollY', { value: y, writable: true });
    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(16); // flush rAF
  }

  it('returns "up" by default', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toBe('up');
  });

  it('returns "down" after scrolling down', () => {
    const { result } = renderHook(() => useScrollDirection({ threshold: 0 }));
    act(() => {
      scrollTo(100);
    });
    expect(result.current).toBe('down');
  });

  it('returns "up" after scrolling up', () => {
    const { result } = renderHook(() => useScrollDirection({ threshold: 0 }));
    act(() => {
      scrollTo(100);
    });
    expect(result.current).toBe('down');
    act(() => {
      scrollTo(50);
    });
    expect(result.current).toBe('up');
  });
});

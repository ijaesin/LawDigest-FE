'use client';

import { useState, useCallback, useRef } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
}

export function usePullToRefresh({ onRefresh, threshold = 80 }: UsePullToRefreshOptions) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling.current || refreshing) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0) {
        setPulling(true);
        setPullDistance(Math.min(diff * 0.5, threshold * 1.5));
      }
    },
    [refreshing, threshold],
  );

  const onTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }

    setPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh]);

  return {
    pulling,
    refreshing,
    pullDistance,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}

'use client';

import { useRef, useCallback, useEffect } from 'react';
import type { IntersectHandler } from '@/app/common/types';

export const useIntersect = (onIntersect: IntersectHandler, options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);

  const callback = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersect(entry, observer);
        }
      });
    },
    [onIntersect],
  );

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new IntersectionObserver(callback, {
      // 뷰포트 하단 200px 확장하여 sentinel이 height:0이어도 감지 가능.
      // 사용자가 맨 아래 도달 전 미리 fetch하여 UX도 개선.
      rootMargin: '0px 0px 200px 0px',
      ...options,
    });
    observer.observe(ref.current);

    // eslint-disable-next-line
    return () => observer.disconnect();
  }, [ref, options, callback]);

  return ref;
};

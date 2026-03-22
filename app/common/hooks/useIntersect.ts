'use client';

import { useRef, useEffect } from 'react';
import type { IntersectHandler } from '@/app/common/types';

export const useIntersect = (onIntersect: IntersectHandler, options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const onIntersectRef = useRef(onIntersect);
  const optionsRef = useRef(options);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
    optionsRef.current = options;
  });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersectRef.current(entry, obs);
        }
      });
    }, optionsRef.current);

    observer.observe(ref.current);
    return () => observer.disconnect();
    // Observer는 마운트 시 1회 생성. options 변경 후 재생성이 필요하면
    // 컴포넌트를 key prop으로 리마운트한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
};

'use client';

import { useCallback, useState, useEffect } from 'react';
import { IconArrowUp } from '@/public/svgs';
import { Button } from '@/app/common/components/ui/button';

export default function GoToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = useCallback(() => {
    const { scrollY } = window;

    if (scrollY > 400) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  const onClickGoToTopButton = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <Button
      size="icon"
      variant="outline"
      className={`${isVisible ? '' : 'hidden'} z-10 fixed bg-muted/80 bottom-24 right-10 md:bottom-20 md:right-20`}
      onClick={onClickGoToTopButton}>
      <IconArrowUp />
    </Button>
  );
}

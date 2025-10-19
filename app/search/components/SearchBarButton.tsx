'use client';

import { useCallback } from 'react';
import { Button } from '@/app/common/components/ui/button';
import { useSearchModalStore } from '@/app/common/store';
import { IconSearchbar } from '@/public/svgs';

export default function SearchBarButton() {
  const open = useSearchModalStore((s) => s.open);

  const onClickSearchBar = useCallback(() => {
    open();
  }, [open]);

  return (
    <div
      onClick={onClickSearchBar}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClickSearchBar()}
      role="button"
      tabIndex={0}
      className="w-full px-5 rounded-2xl flex justify-between items-center gap-[10px] md:w-[600px] mx-auto my-5 h-10 shadow-sm cursor-text border border-input bg-background hover:bg-accent hover:text-accent-foreground">
      <p className="text-sm text-muted-foreground">법안, 의원, 정당명으로 검색</p>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <IconSearchbar />
      </Button>
    </div>
  );
}

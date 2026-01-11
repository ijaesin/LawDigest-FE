'use client';

import { useCallback } from 'react';
import { Button } from '@/app/common/components/ui/button';
import { useSearchModalStore } from '@/app/common/store';
import { Search } from 'lucide-react';

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
      className="w-full mx-5 px-3 rounded-2xl flex justify-between items-center gap-[10px] md:w-[600px] md:mx-auto my-5 h-10 shadow-sm cursor-text border border-input bg-background hover:bg-accent hover:text-accent-foreground">
      <p className="text-sm text-muted-foreground">법안, 의원, 정당명으로 검색</p>
      <Button variant="ghost" size="icon" className="w-8 h-8">
        <Search className="w-6 h-6" />
      </Button>
    </div>
  );
}

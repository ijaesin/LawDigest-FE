'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';
import { useSearchModalStore } from '@/app/common/store';
import { Badge } from '@/app/common/components/ui/badge';
import { Button } from '@/app/common/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/common/components/ui/dialog';
import { IconX } from '@/public/svgs';
import { ACCESS_TOKEN } from '@/app/common/constants';
import { useGetRecentKeywords, useDeleteRecentKeyword } from '@/app/search/services/queries';
import SearchBar from './SearchBar';

function useRecentKeywords() {
  const isAuthenticated = !!getCookie(ACCESS_TOKEN);
  const { data: serverKeywords } = useGetRecentKeywords({ enabled: isAuthenticated });
  const [localKeywords, setLocalKeywords] = useState<string[]>([]);
  const { mutate: deleteServerKeyword } = useDeleteRecentKeyword();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocalKeywords(JSON.parse(localStorage.getItem('recentKeywords') || '[]'));
    }
  }, [isAuthenticated]);

  const keywords: string[] = isAuthenticated ? (serverKeywords?.map((k) => k.search_word) ?? []) : localKeywords;

  const removeKeyword = (keyword: string) => {
    if (isAuthenticated) {
      deleteServerKeyword(keyword);
    } else {
      const updated = localKeywords.filter((v) => v !== keyword);
      setLocalKeywords(updated);
      localStorage.setItem('recentKeywords', JSON.stringify(updated));
    }
  };

  const removeAll = () => {
    if (isAuthenticated) {
      keywords.forEach((keyword) => deleteServerKeyword(keyword));
    } else {
      setLocalKeywords([]);
      localStorage.setItem('recentKeywords', JSON.stringify([]));
    }
  };

  return { keywords, removeKeyword, removeAll };
}

export default function SearchModal() {
  const router = useRouter();
  const show = useSearchModalStore((s) => s.show);
  const close = useSearchModalStore((s) => s.close);
  const { keywords, removeKeyword, removeAll } = useRecentKeywords();

  const onClickChip = (searchWord: string) => {
    router.push(`/search/${searchWord}`);
    close();
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-[640px] top-[10%] translate-y-0 sm:top-[10%] sm:translate-y-0 glass-heavy">
        <DialogHeader>
          <DialogTitle className="sr-only">검색</DialogTitle>
        </DialogHeader>
        <SearchBar />

        <section className="flex flex-col gap-7">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold md:text-xl">최근 검색어</h2>
            <Button variant="link" size="sm" className="text-muted-foreground" onClick={removeAll}>
              모두 지우기
            </Button>
          </div>
          <div className="flex gap-[10px] flex-wrap">
            {keywords.length > 0 ? (
              keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="outline"
                  className="cursor-pointer glass-subtle"
                  onClick={() => onClickChip(keyword)}>
                  <span className="max-w-[240px] truncate">{keyword}</span>
                  <button
                    type="button"
                    aria-label="최근 검색어 삭제"
                    className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeKeyword(keyword);
                    }}>
                    <IconX className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">최근 검색어가 존재하지 않습니다.</p>
            )}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

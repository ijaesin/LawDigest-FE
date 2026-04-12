'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/common/components/ui/dialog';
import { Button } from '@/app/common/components/ui/button';
import { useSearchModalStore } from '@/app/common/store/search-modal';
import { SearchBar, KeywordChip } from '@/app/common/components/molecules';
import { ACCESS_TOKEN } from '@/app/common/constants';
import { useGetRecentKeywords, useDeleteRecentKeyword } from '@/app/search/services/queries';

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

export function SearchModal() {
  const router = useRouter();
  const show = useSearchModalStore((s) => s.show);
  const close = useSearchModalStore((s) => s.close);
  const { keywords, removeKeyword, removeAll } = useRecentKeywords();

  const handleSearch = (query: string) => {
    router.push(`/search/${query}`);
    close();
  };

  const handleChipClick = (keyword: string) => {
    router.push(`/search/${keyword}`);
    close();
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && close()}>
      <DialogContent className="glass-heavy top-[10%] max-w-[640px] translate-y-0 sm:top-[10%] sm:translate-y-0">
        <DialogHeader>
          <DialogTitle className="sr-only">검색</DialogTitle>
        </DialogHeader>

        <SearchBar onSearch={handleSearch} />

        <section className="flex flex-col gap-7">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold md:text-xl">최근 검색어</h2>
            <Button variant="link" size="sm" className="text-muted-foreground" onClick={removeAll}>
              모두 지우기
            </Button>
          </div>
          <div className="flex flex-wrap gap-[10px]">
            {keywords.length > 0 ? (
              keywords.map((keyword) => (
                <KeywordChip key={keyword} keyword={keyword} onClick={handleChipClick} onRemove={removeKeyword} />
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

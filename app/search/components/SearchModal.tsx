'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { useSearchModalStore } from '@/app/common/store';
import { Badge } from '@/app/common/components/ui/badge';
import { Button } from '@/app/common/components/ui/button';
import { IconX } from '@/public/svgs';
import SearchBar from './SearchBar';

export default function SearchModal() {
  const router = useRouter();
  const show = useSearchModalStore((s) => s.show);
  const close = useSearchModalStore((s) => s.close);
  const [recentKeywords, setRecentKeywords] = useState(
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('recentkeywords') || '[]') : [],
  );

  const closeModal = useCallback(() => {
    close();
  }, [close]);

  const onClickRemoveAll = useCallback(() => {
    setRecentKeywords([]);
    localStorage.setItem('recentKeywords', JSON.stringify([]));
  }, []);

  const onClickChip = useCallback(
    (searchWord: string) => {
      router.push(`/search/${searchWord}`);
      close();
    },
    [router, close],
  );

  const onClickRemoveRecentKeyword = useCallback(
    (keyword: string) => {
      const newRecentKeywords = recentKeywords.filter((v: string) => v !== keyword);
      setRecentKeywords(newRecentKeywords);
      localStorage.setItem('recentKeywords', JSON.stringify(newRecentKeywords));
    },
    [recentKeywords],
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRecentKeywords(JSON.parse(localStorage.getItem('recentKeywords') || '[]'));
    }
  }, [show]);

  useEffect(() => {
    if (recentKeywords.length > 10) {
      const newRecentKeywords = recentKeywords.slice(1);
      setRecentKeywords(newRecentKeywords);
      localStorage.setItem('recentKeywords', JSON.stringify(newRecentKeywords));
    }
  }, [recentKeywords]);

  return (
    <section
      className={`inset-0 w-full dark:bg-dark-b/80 bg-white/80 backdrop-blur-[10px] z-10 flex justify-center ${show ? 'fixed' : 'hidden'}`}>
      <div className="mx-5 mt-10 md:mt-20 w-full md:w-[600px]">
        <div className="flex flex-col gap-4 md:relative">
          <div className="-right-20 md:absolute top-[22px]">
            <Button variant="ghost" size="icon" onClick={closeModal} className="float-right">
              <IconX />
            </Button>
          </div>
          <SearchBar setRecentKeywords={setRecentKeywords} />

          <section className="flex flex-col gap-7">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold md:text-xl">최근 검색어</h2>
              <Button variant="link" size="sm" className="text-gray-2" onClick={onClickRemoveAll}>
                모두 지우기
              </Button>
            </div>
            <div className="flex gap-[10px] flex-wrap">
              {recentKeywords && recentKeywords.length > 0 ? (
                recentKeywords.map((keyword: string) => (
                  <Badge
                    key={keyword}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => onClickChip(keyword)}>
                    <span className="max-w-[240px] truncate">{keyword}</span>
                    <button
                      type="button"
                      aria-label="Remove recent keyword"
                      className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClickRemoveRecentKeyword(keyword);
                      }}>
                      <IconX className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-3 dark:text-gray-2">최근 검색어가 존재하지 않습니다.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

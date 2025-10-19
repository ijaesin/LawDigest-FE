'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { IconSearchbar, IconX } from '@/public/svgs';
import { Input } from '@/app/common/components/ui/input';
import { Button } from '@/app/common/components/ui/button';
import { useSearchModalStore } from '@/app/common/store';

export default function SearchBar({
  setRecentKeywords,
}: {
  setRecentKeywords: Dispatch<SetStateAction<string[] | undefined>>;
}) {
  const router = useRouter();
  const [value, setValue] = useState('');
  const show = useSearchModalStore((s) => s.show);
  const close = useSearchModalStore((s) => s.close);

  const onSubmitSearch = useCallback(
    (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const newKeyword = value.trim();

      if (newKeyword !== '') {
        const recentKeywords = JSON.parse(localStorage.getItem('recentKeywords') || '[]');

        if (recentKeywords.find((v: string) => v === newKeyword)) {
          const newRecentKeywords = [...recentKeywords.filter((v: string) => v !== newKeyword), newKeyword];
          localStorage.setItem('recentKeywords', JSON.stringify(newRecentKeywords));
          setRecentKeywords(newRecentKeywords);
        } else {
          const newRecentKeywords = [...recentKeywords, newKeyword];
          localStorage.setItem('recentKeywords', JSON.stringify(newRecentKeywords));
          setRecentKeywords(newRecentKeywords);
        }

        router.push(`/search/${value.trim()}`);
      } else {
        setValue('');
      }

      setValue('');
      close();
    },
    [value, router, setRecentKeywords, close],
  );

  const onClear = () => {
    setValue('');
    router.push('/search');
  };

  return (
    <form
      onSubmit={onSubmitSearch}
      className="w-full rounded-2xl flex justify-center items-center gap-[10px] md:w-[600px] mx-auto my-5">
      <div className="relative w-full">
        <Input
          autoFocus={show}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="법안, 의원, 정당명으로 검색"
          className="h-10 pr-10 truncate shadow-sm"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 w-6 h-6">
            <IconX />
          </Button>
        )}
        <Button type="submit" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8">
          <IconSearchbar />
        </Button>
      </div>
    </form>
  );
}

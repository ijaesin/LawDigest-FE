'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getCookie } from 'cookies-next';
import { IconSearchbar, IconX } from '@/public/svgs';
import { Input } from '@/app/common/components/ui/input';
import { Button } from '@/app/common/components/ui/button';
import { useSearchModalStore } from '@/app/common/store';
import { ACCESS_TOKEN } from '@/app/common/constants';
import { usePostRecentKeyword } from '@/app/search/services/queries';

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const show = useSearchModalStore((s) => s.show);
  const close = useSearchModalStore((s) => s.close);
  const { mutate: saveKeyword } = usePostRecentKeyword();

  const onSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = value.trim();
    if (!keyword) {
      setValue('');
      return;
    }

    if (getCookie(ACCESS_TOKEN)) {
      saveKeyword(keyword);
    } else {
      const stored: string[] = JSON.parse(localStorage.getItem('recentKeywords') || '[]');
      const updated = [...stored.filter((v) => v !== keyword), keyword].slice(-10);
      localStorage.setItem('recentKeywords', JSON.stringify(updated));
    }

    router.push(`/search/${keyword}`);
    setValue('');
    close();
  };

  const onClear = () => {
    setValue('');
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

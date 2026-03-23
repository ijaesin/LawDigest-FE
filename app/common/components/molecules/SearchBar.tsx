'use client';

import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { GlassInput } from '@/app/common/components/atoms';

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

export function SearchBar({ onSearch, placeholder = '법안, 의원, 정당 검색...', defaultValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim()) onSearch(value.trim());
    },
    [value, onSearch],
  );

  return (
    <form onSubmit={handleSubmit} role="search">
      <GlassInput
        icon={<Search className="h-4 w-4" />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}

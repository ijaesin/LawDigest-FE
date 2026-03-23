'use client';

import { X } from 'lucide-react';
import { GlassBadge } from '@/app/common/components/atoms';

export interface KeywordChipProps {
  keyword: string;
  onClick: (keyword: string) => void;
  onRemove: (keyword: string) => void;
}

export function KeywordChip({ keyword, onClick, onRemove }: KeywordChipProps) {
  return (
    <GlassBadge
      variant="glass"
      className="cursor-pointer gap-1 pr-1 hover:bg-[var(--glass-bg-medium)]"
      onClick={() => onClick(keyword)}>
      <span className="max-w-[200px] truncate">{keyword}</span>
      <button
        type="button"
        aria-label={`${keyword} 삭제`}
        className="ml-1 rounded-full p-0.5 hover:bg-muted"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(keyword);
        }}>
        <X className="h-3 w-3" />
      </button>
    </GlassBadge>
  );
}

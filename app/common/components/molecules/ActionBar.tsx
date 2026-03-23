'use client';

import { ThumbsUp, Eye, Bookmark, Share2 } from 'lucide-react';
import { GlassButton, Icon } from '@/app/common/components/atoms';
import { cn } from '@/app/common/lib/utils';

export interface ActionBarProps {
  likeCount: number;
  viewCount?: number;
  isBookmarked: boolean;
  onBookmark: () => void;
  onShare: () => void;
}

export function ActionBar({ likeCount, viewCount, isBookmarked, onBookmark, onShare }: ActionBarProps) {
  return (
    <div className="flex items-center gap-4 pt-3 border-t border-border">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon icon={ThumbsUp} size="sm" /> {likeCount}
      </span>
      {viewCount !== undefined && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Icon icon={Eye} size="sm" /> {viewCount}
        </span>
      )}
      <div className="ml-auto flex items-center gap-2">
        <GlassButton
          variant="ghost"
          size="icon"
          onClick={onBookmark}
          aria-label={isBookmarked ? '북마크 해제' : '북마크'}>
          <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-primary text-primary')} />
        </GlassButton>
        <GlassButton variant="ghost" size="icon" onClick={onShare} aria-label="공유">
          <Share2 className="h-4 w-4" />
        </GlassButton>
      </div>
    </div>
  );
}

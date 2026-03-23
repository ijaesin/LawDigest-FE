'use client';

import { GlassCard, GlassBadge } from '@/app/common/components/atoms';
import { ActionBar } from '@/app/common/components/molecules';
import type { BillResponse } from '@/app/bill/validation/bill.schema';

export interface BillDetailHeroProps {
  bill: BillResponse;
  onBookmark: () => void;
  onShare: () => void;
}

export function BillDetailHero({ bill, onBookmark, onShare }: BillDetailHeroProps) {
  const { bill_info_dto: info, is_book_mark } = bill;

  return (
    <GlassCard level="medium">
      <div className="flex flex-wrap items-center gap-2">
        <GlassBadge variant="primary">{info.bill_stage}</GlassBadge>
      </div>

      <h1 className="mt-3 text-[28px] font-bold leading-[1.2] text-foreground md:text-[32px]">{info.brief_summary}</h1>

      <p className="mt-1 text-sm text-muted-foreground">{info.bill_name}</p>

      <p className="mt-2 text-xs text-muted-foreground">
        발의일 {info.propose_date} · 조회 {info.view_count} · 좋아요 {info.bill_like_count}
      </p>

      <div className="mt-4">
        <ActionBar
          likeCount={info.bill_like_count}
          viewCount={info.view_count}
          isBookmarked={is_book_mark}
          onBookmark={onBookmark}
          onShare={onShare}
        />
      </div>
    </GlassCard>
  );
}

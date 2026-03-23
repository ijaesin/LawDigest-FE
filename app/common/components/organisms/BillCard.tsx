'use client';

import Link from 'next/link';
import { GlassCard } from '@/app/common/components/atoms';
import { ActionBar, BillMeta, ProposerAvatar } from '@/app/common/components/molecules';
import type { BillResponse } from '@/app/bill/validation/bill.schema';

export interface BillCardProps {
  bill: BillResponse;
  onBookmark: (billId: string) => void;
  onShare: (billId: string) => void;
  variant?: 'default' | 'compact';
}

export function BillCard({ bill, onBookmark, onShare, variant = 'default' }: BillCardProps) {
  const { bill_info_dto: info, representative_proposer_dto_list: proposers, is_book_mark } = bill;
  const mainProposer = proposers[0];

  if (variant === 'compact') {
    return (
      <Link href={`/bill/${info.bill_id}`}>
        <GlassCard hover className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <BillMeta stage={info.bill_stage} proposeDate={info.propose_date} />
            <h3 className="mt-1 truncate text-sm font-medium text-foreground">{info.brief_summary}</h3>
          </div>
        </GlassCard>
      </Link>
    );
  }

  return (
    <Link href={`/bill/${info.bill_id}`}>
      <GlassCard hover>
        <BillMeta stage={info.bill_stage} proposeDate={info.propose_date} />

        <h3 className="mt-3 text-[18px] font-semibold leading-[1.3] text-foreground md:text-[20px]">
          {info.brief_summary}
        </h3>

        <p className="mt-2 line-clamp-2 text-[15px] leading-[1.6] text-muted-foreground md:text-base">
          {info.gpt_summary || info.summary}
        </p>

        {mainProposer && (
          <div className="mt-3">
            <ProposerAvatar
              name={mainProposer.representative_proposer_name}
              imageUrl={
                mainProposer.represent_proposer_img_url
                  ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${mainProposer.represent_proposer_img_url}`
                  : ''
              }
              partyName={mainProposer.party_name}
              congressmanId={mainProposer.representative_proposer_id}
              size="sm"
            />
          </div>
        )}

        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className="mt-3" onClick={(e) => e.preventDefault()}>
          <ActionBar
            likeCount={info.bill_like_count}
            viewCount={info.view_count}
            isBookmarked={is_book_mark}
            onBookmark={() => onBookmark(info.bill_id)}
            onShare={() => onShare(info.bill_id)}
          />
        </div>
      </GlassCard>
    </Link>
  );
}

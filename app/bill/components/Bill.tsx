'use client';

import { useState, useCallback } from 'react';
import { CardHeader, CardContent, CardTitle, CardDescription } from '@/app/common/components/ui/card';
import { GlassCard } from '@/app/common/components/ui/glass-card';
import { Separator } from '@/app/common/components/ui/separator';
import { Badge } from '@/app/common/components/ui/badge';
import { Button } from '@/app/common/components/ui/button';
import Link from 'next/link';
import { IconClock } from '@/public/svgs';
import { useMutateBookmark } from '@/app/bill/hooks';
import { getTimeRemaining, copyClipBoard } from '@/app/common/utils';
import { useSnackbarStore } from '@/app/common/store';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import { useAuthGuard } from '@/app/auth/hooks';
import type { BillProps } from '@/app/bill/types';
import GPTSummary from './GPTSummary';
import BillSummaryContent from './BillSummaryContent';
import BillCardFooter from './BillCardFooter';
import BillProposerSection from './BillProposerSection';

export default function Bill({
  bill_info_dto: {
    bill_id,
    bill_name,
    brief_summary,
    propose_date,
    summary,
    gpt_summary,
    view_count,
    bill_like_count,
    bill_stage,
  },
  representative_proposer_dto_list,
  is_book_mark,
  public_proposer_dto_list,
  detail,
  viewCount,
  children,
}: BillProps) {
  const mutateBookmark = useMutateBookmark(bill_id);
  const [toggleMore, setToggleMore] = useState(false);
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const { requireLogin } = useAuthGuard();

  const onClickToggleMore = useCallback(() => {
    setToggleMore(!toggleMore);
  }, [toggleMore]);

  const onClickScrap = useCallback(() => {
    if (!requireLogin()) return;
    setSnackbar({
      show: true,
      type: is_book_mark ? SNACKBAR_TYPE.CANCEL : SNACKBAR_TYPE.SUCCESS,
      message: is_book_mark ? '해당 법안의 스크랩을 취소했습니다.' : '해당 법안을 스크랩했습니다.',
      duration: 3000,
    });
    mutateBookmark.mutate(!is_book_mark);
  }, [is_book_mark, setSnackbar, mutateBookmark, requireLogin]);

  const handleCopyClipBoard = useCallback(() => {
    copyClipBoard(`${process.env.NEXT_PUBLIC_DOMAIN}/bill/${bill_id}`);
    setSnackbar({ show: true, type: SNACKBAR_TYPE.SUCCESS, message: '링크를 복사했습니다.', duration: 3000 });
  }, [bill_id, setSnackbar]);

  return (
    <section className={`flex flex-col  ${detail ? 'md:flex-row items-start' : 'md:mx-5'}`}>
      <GlassCard key={bill_id} hover={!detail} className={`flex flex-col gap-5 ${!detail ? 'md:flex-row' : ''}`}>
        <CardHeader
          className={`flex  flex-col items-start gap-2 p-0  ${!detail ? 'md:w-[270px] md:flex-shrink-0' : ''}`}>
          {detail && (
            <div className="flex gap-1 items-center">
              <IconClock />
              <h5 className="text-sm tracking-tight text-muted-foreground">{getTimeRemaining(propose_date)}</h5>
            </div>
          )}

          <CardTitle className={`${detail ? 'text-[26px]' : 'text-xl'} font-semibold`}>{brief_summary}</CardTitle>

          <CardDescription className="text-sm text-muted-foreground">{bill_name}</CardDescription>

          {!detail && (
            <div className="flex gap-3 items-center w-full">
              <h5 className="text-xs tracking-tight text-muted-foreground">{getTimeRemaining(propose_date)}</h5>
              <Badge variant="outline">{bill_stage}</Badge>
            </div>
          )}
        </CardHeader>

        <section className={!detail ? 'md:flex-1' : ''}>
          <CardContent className={`p-0 leading-normal whitespace-pre-wrap ${detail ? '' : 'text-sm md:text-base'}`}>
            <BillSummaryContent gptSummary={gpt_summary} summary={summary} isCollapsed={!detail && !toggleMore} />
            {!detail && !toggleMore && (
              <Button variant="link" onClick={onClickToggleMore} className="p-0 text-muted-foreground">
                더 보기
              </Button>
            )}
          </CardContent>

          <BillCardFooter
            billId={bill_id}
            isLiked={is_book_mark}
            likeCount={bill_like_count}
            viewCount={detail ? (viewCount ?? view_count) : view_count}
            detail={detail}
            onClickScrap={onClickScrap}
            onCopyLink={handleCopyClipBoard}
          />
        </section>

        {detail && (
          <div className="flex flex-col gap-[34px]">
            <Separator className="bg-border dark:bg-border md:hidden" />
            <GPTSummary />
            <div className="flex flex-col gap-3 items-center">
              <h5 className="text-xs font-semibold text-danger">
                AI 기반의 요약은 내용이 불완전할 수 있습니다. 꼭 원문을 확인해주세요 !
              </h5>
              <Link href={`https://likms.assembly.go.kr/bill/billDetail.do?billId=${bill_id}`}>
                <Button size="lg" className="w-[242px] h-[56px] bg-foreground dark:bg-muted rounded-full">
                  원문 확인하기
                </Button>
              </Link>
            </div>
            <Separator className="bg-border dark:bg-border md:hidden" />
          </div>
        )}
      </GlassCard>
      <BillProposerSection
        representativeProposerList={representative_proposer_dto_list}
        publicProposerList={public_proposer_dto_list}
        detail={detail}>
        {children}
      </BillProposerSection>
      <Separator className={`h-[10px] md:h-[1px] bg-border dark:bg-border ${detail ? 'hidden' : 'block'}`} />
    </section>
  );
}

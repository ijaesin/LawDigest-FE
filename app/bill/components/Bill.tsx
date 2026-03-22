'use client';

import { useState, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/app/common/components/ui/card';
import { Separator } from '@/app/common/components/ui/separator';
import { Badge } from '@/app/common/components/ui/badge';
import { Button } from '@/app/common/components/ui/button';
import Link from 'next/link';
import { IconClock } from '@/public/svgs';
import { useMutateBookmark } from '@/app/bill/hooks';
import { getTimeRemaining, copyClipBoard } from '@/app/common/utils';
import { getCookie } from 'cookies-next';
import { useSnackbarStore } from '@/app/common/store';
import { ACCESS_TOKEN, SNACKBAR_TYPE } from '@/app/common/constants';
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

  const onClickToggleMore = useCallback(() => {
    setToggleMore(!toggleMore);
  }, [toggleMore]);

  const onClickScrap = useCallback(() => {
    const accessToken = getCookie(ACCESS_TOKEN);

    if (accessToken) {
      setSnackbar({
        show: true,
        type: is_book_mark ? SNACKBAR_TYPE.CANCEL : SNACKBAR_TYPE.SUCCESS,
        message: is_book_mark ? '해당 법안의 스크랩을 취소했습니다.' : '해당 법안을 스크랩했습니다.',
        duration: 3000,
      });
      mutateBookmark.mutate(!is_book_mark);
    } else {
      setSnackbar({ show: true, type: SNACKBAR_TYPE.ERROR, message: '로그인이 필요한 서비스입니다.', duration: 3000 });
    }
  }, [is_book_mark, setSnackbar, mutateBookmark]);

  const handleCopyClipBoard = useCallback(() => {
    copyClipBoard(`${process.env.NEXT_PUBLIC_DOMAIN}/bill/${bill_id}`);
    setSnackbar({ show: true, type: SNACKBAR_TYPE.SUCCESS, message: '링크를 복사했습니다.', duration: 3000 });
  }, [bill_id, setSnackbar]);

  return (
    <section className={`flex flex-col  ${detail ? 'md:flex-row items-start' : 'md:mx-5'}`}>
      <Card
        key={bill_id}
        className={`flex flex-col gap-5 px-5 pt-6 bg-transparent border-none dark:bg-dark-b dark:lg:bg-dark-pb ${!detail ? 'md:flex-row' : ''}`}>
        <CardHeader
          className={`flex  flex-col items-start gap-2 p-0  ${!detail ? 'md:w-[270px] md:flex-shrink-0' : ''}`}>
          {detail && (
            <div className="flex gap-1 items-center">
              <IconClock />
              <h5 className="text-sm tracking-tight text-gray-2">{getTimeRemaining(propose_date)}</h5>
            </div>
          )}

          <CardTitle className={`${detail ? 'text-[26px]' : 'text-xl'} font-semibold`}>{brief_summary}</CardTitle>

          <CardDescription className="text-sm text-gray-2 dark:text-gray-3">{bill_name}</CardDescription>

          {!detail && (
            <div className="flex gap-3 items-center w-full">
              <h5 className="text-xs tracking-tight text-gray-3">{getTimeRemaining(propose_date)}</h5>
              <Badge variant="outline">{bill_stage}</Badge>
            </div>
          )}
        </CardHeader>

        <section className={!detail ? 'md:flex-1' : ''}>
          <CardContent className={`p-0 leading-normal whitespace-pre-wrap ${detail ? '' : 'text-sm md:text-base'}`}>
            <BillSummaryContent
              gptSummary={gpt_summary}
              summary={summary}
              isCollapsed={!detail && !toggleMore}
            />
            {!detail && !toggleMore && (
              <Button variant="link" onClick={onClickToggleMore} className="p-0 text-gray-2 dark:text-gray-3">
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
            <Separator className="bg-gray-0.5 dark:bg-dark-l md:hidden" />
            <GPTSummary />
            <div className="flex flex-col gap-3 items-center">
              <h5 className="text-xs font-semibold text-theme-alert">
                AI 기반의 요약은 내용이 불완전할 수 있습니다. 꼭 원문을 확인해주세요 !
              </h5>
              <Link href={`https://likms.assembly.go.kr/bill/billDetail.do?billId=${bill_id}`}>
                <Button
                  size="lg"
                  className="w-[242px] h-[56px] bg-primary-3 dark:bg-gray-0.5 dark:text-black rounded-full">
                  원문 확인하기
                </Button>
              </Link>
            </div>
            <Separator className="bg-gray-0.5 dark:bg-dark-l md:hidden" />
          </div>
        )}
      </Card>
      <BillProposerSection
        representativeProposerList={representative_proposer_dto_list}
        publicProposerList={public_proposer_dto_list}
        detail={detail}
      >
        {children}
      </BillProposerSection>
      <Separator className={`h-[10px] md:h-[1px] bg-gray-0.5 dark:bg-gray-4 ${detail ? 'hidden' : 'block'}`} />
    </section>
  );
}

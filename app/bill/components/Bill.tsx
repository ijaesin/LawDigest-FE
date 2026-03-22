'use client';

import { useState, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/app/common/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';
import { Separator } from '@/app/common/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/common/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/common/components/ui/popover';
import { Badge } from '@/app/common/components/ui/badge';
import { Button } from '@/app/common/components/ui/button';
import Link from 'next/link';
import { IconClock, IconExport, IconScrabSmall } from '@/public/svgs';
import { useMutateBookmark } from '@/app/bill/hooks';
import { getTimeRemaining, copyClipBoard } from '@/app/common/utils';
import { getCookie } from 'cookies-next';
import { useSnackbarStore } from '@/app/common/store';
import { ACCESS_TOKEN, SNACKBAR_TYPE } from '@/app/common/constants';
import { PartyLogoReplacement } from '@/app/party/components';
import type { BillProps } from '@/app/bill/types';
import ProposerList from './ProposerList';
import GPTSummary from './GPTSummary';
import BillSummaryContent from './BillSummaryContent';

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
  const [isLiked, setIsLiked] = useState(is_book_mark);
  const [likeCount, setLikeCount] = useState(bill_like_count);
  const mutateBookmark = useMutateBookmark(bill_id);
  const [toggleMore, setToggleMore] = useState(false);
  const hasRepresentative = representative_proposer_dto_list.length > 0;
  const isRepresentativeSolo = representative_proposer_dto_list.length === 1;
  const firstRepresentative = hasRepresentative ? representative_proposer_dto_list[0] : undefined;
  const partyName = hasRepresentative
    ? isRepresentativeSolo
      ? (firstRepresentative?.party_name ?? '무소속')
      : '다수'
    : '정보 없음';
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);

  const onClickToggleMore = useCallback(() => {
    setToggleMore(!toggleMore);
  }, [toggleMore]);

  const onClickScrab = useCallback(() => {
    const accessToken = getCookie(ACCESS_TOKEN);

    if (accessToken) {
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      setSnackbar({
        show: true,
        type: isLiked ? SNACKBAR_TYPE.CANCEL : SNACKBAR_TYPE.SUCCESS,
        message: isLiked ? '해당 법안의 스크랩을 취소했습니다.' : '해당 법안을 스크랩했습니다.',
        duration: 3000,
      });

      mutateBookmark.mutate(!isLiked);
    } else {
      setSnackbar({ show: true, type: SNACKBAR_TYPE.ERROR, message: '로그인이 필요한 서비스입니다.', duration: 3000 });
    }
  }, [isLiked, likeCount, setSnackbar, mutateBookmark]);

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

            {!detail && (
              <CardFooter className="flex justify-between items-center p-0 mt-5 -ml-1">
                <div className="flex gap-2">
                  <div className="flex items-center text-sm text-gray-3">
                    <Button variant="ghost" size="icon" className="p-0" onClick={onClickScrab}>
                      <IconScrabSmall isActive={isLiked} />
                    </Button>
                    <h4 className="mr-2">스크랩</h4>
                    <h4>{likeCount}</h4>
                  </div>
                  <div className="flex items-center text-sm text-gray-3">
                    <h4 className="mr-2">조회수</h4>
                    <h4>{view_count}</h4>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Export Button" onClick={handleCopyClipBoard}>
                          <IconExport />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>링크 복사하기</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <Link href={`/bill/${bill_id}`}>
                  <Button
                    className="text-sm font-medium bg-gray-1 dark:bg-gray-3 text-gray-3 dark:text-gray-2 w-[88px] h-8"
                    size="sm"
                    variant="secondary">
                    자세히 보기
                  </Button>
                </Link>
              </CardFooter>
            )}

            {detail && (
              <CardFooter className="flex justify-between items-center p-0 mt-10">
                <div className="flex gap-4">
                  <div className="flex items-center text-sm text-gray-2">
                    <Button variant="ghost" size="icon" className="p-0" onClick={onClickScrab}>
                      <IconScrabSmall isActive={isLiked} />
                    </Button>
                    <h4 className="mr-2">스크랩</h4>
                    <h4>{likeCount}</h4>
                  </div>
                  <div className="flex items-center text-sm text-gray-2">
                    <h4 className="mr-2">조회수</h4>
                    <h4>{viewCount}</h4>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleCopyClipBoard}>
                        <IconExport />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>링크 복사하기</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardFooter>
            )}
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
      <div className={`relative ${detail ? 'w-[320px] shrink-0' : 'hidden md:block'}`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-3 items-center">
            <div className="flex -space-x-4 rtl:space-x-reverse">
              {representative_proposer_dto_list.map(({ representative_proposer_id, represent_proposer_img_url }) => (
                <Avatar key={representative_proposer_id} className="border-2 border-white dark:border-dark-l">
                  <AvatarImage src={process.env.NEXT_PUBLIC_IMAGE_URL + represent_proposer_img_url} />
                  <AvatarFallback>{representative_proposer_id}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold">
                {firstRepresentative?.representative_proposer_name ?? '대표 발의자 정보 없음'}
              </p>
              <div className="flex gap-1 items-center">
                <PartyLogoReplacement partyName={partyName} circle={false} />
                <p className="text-xs text-gray-2">{partyName}</p>
              </div>
            </div>
          </div>
          {hasRepresentative ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="h-7">
                  {representative_proposer_dto_list.length}인
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <ProposerList
                  representativeProposerList={representative_proposer_dto_list}
                  publicProposerList={public_proposer_dto_list}
                  popover
                />
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
        <Separator className="dark:bg-dark-l" />
        {children}
      </div>
      <Separator className={`h-[10px] md:h-[1px] bg-gray-0.5 dark:bg-gray-4 ${detail ? 'hidden' : 'block'}`} />
    </section>
  );
}

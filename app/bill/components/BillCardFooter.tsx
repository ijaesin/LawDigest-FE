'use client';

import Link from 'next/link';
import { Button } from '@/app/common/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/common/components/ui/tooltip';
import { IconExport, IconScrabSmall } from '@/public/svgs';

interface BillCardFooterProps {
  billId: string;
  isLiked: boolean;
  likeCount: number;
  viewCount: number;
  detail?: boolean;
  onClickScrap: () => void;
  onCopyLink: () => void;
}

function FeedFooter({
  billId,
  isLiked,
  likeCount,
  viewCount,
  onClickScrap,
  onCopyLink,
}: Omit<BillCardFooterProps, 'detail'>) {
  return (
    <div className="flex justify-between items-center p-0 mt-5 -ml-1">
      <div className="flex gap-2">
        <div className="flex items-center text-sm text-gray-3">
          <Button variant="ghost" size="icon" className="p-0" onClick={onClickScrap}>
            <IconScrabSmall isActive={isLiked} />
          </Button>
          <h4 className="mr-2">스크랩</h4>
          <h4>{likeCount}</h4>
        </div>
        <div className="flex items-center text-sm text-gray-3">
          <h4 className="mr-2">조회수</h4>
          <h4>{viewCount}</h4>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Export Button" onClick={onCopyLink}>
                <IconExport />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>링크 복사하기</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Link href={`/bill/${billId}`}>
        <Button
          className="text-sm font-medium bg-gray-1 dark:bg-gray-3 text-gray-3 dark:text-gray-2 w-[88px] h-8"
          size="sm"
          variant="secondary">
          자세히 보기
        </Button>
      </Link>
    </div>
  );
}

function DetailFooter({
  isLiked,
  likeCount,
  viewCount,
  onClickScrap,
  onCopyLink,
}: Omit<BillCardFooterProps, 'detail' | 'billId'>) {
  return (
    <div className="flex justify-between items-center p-0 mt-10">
      <div className="flex gap-4">
        <div className="flex items-center text-sm text-gray-2">
          <Button variant="ghost" size="icon" className="p-0" onClick={onClickScrap}>
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
            <Button variant="ghost" size="icon" onClick={onCopyLink}>
              <IconExport />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>링크 복사하기</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default function BillCardFooter({
  detail,
  isLiked,
  likeCount,
  viewCount,
  onClickScrap,
  onCopyLink,
  billId,
}: BillCardFooterProps) {
  return detail ? (
    <DetailFooter
      isLiked={isLiked}
      likeCount={likeCount}
      viewCount={viewCount}
      onClickScrap={onClickScrap}
      onCopyLink={onCopyLink}
    />
  ) : (
    <FeedFooter
      billId={billId}
      isLiked={isLiked}
      likeCount={likeCount}
      viewCount={viewCount}
      onClickScrap={onClickScrap}
      onCopyLink={onCopyLink}
    />
  );
}

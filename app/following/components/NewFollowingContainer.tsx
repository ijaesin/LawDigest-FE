'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthGuard } from '@/app/auth/hooks';
import { useSnackbarStore } from '@/app/common/store';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import { copyClipBoard } from '@/app/common/utils';
import { Loading } from '@/app/common/components/Loading';
import { FeedTemplate } from '@/app/common/components/templates';
import { FeedList, BillCard } from '@/app/common/components/organisms';
import { GlassCard, GlassAvatar } from '@/app/common/components/atoms';
import { useGetFollowingCongressman, useInfiniteFollowingBill, followingKeys } from '@/app/following/hooks';
import { patchBookmark } from '@/app/bill/services/apis';
import { NotificationTopThree } from '@/app/notification/components';
import type { BillResponse } from '@/app/bill/validation';

const EMPTY_BILLS: BillResponse[] = [];

function FollowingSidebar() {
  return (
    <Suspense fallback={<Loading />}>
      <NotificationTopThree />
    </Suspense>
  );
}

export default function NewFollowingContainer() {
  const { requireLogin } = useAuthGuard();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const queryClient = useQueryClient();

  const { data: congressmanList } = useGetFollowingCongressman();
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteFollowingBill();

  const bills = useMemo(() => data?.pages.flatMap((p) => p.bill_list) ?? EMPTY_BILLS, [data]);

  const handleBookmark = useCallback(
    (billId: string) => {
      if (!requireLogin()) return;

      const bill = bills.find((b) => b.bill_info_dto.bill_id === billId);
      if (!bill) return;

      const nextChecked = !bill.is_book_mark;

      setSnackbar({
        show: true,
        type: nextChecked ? SNACKBAR_TYPE.SUCCESS : SNACKBAR_TYPE.CANCEL,
        message: nextChecked ? '해당 법안을 스크랩했습니다.' : '해당 법안의 스크랩을 취소했습니다.',
        duration: 3000,
      });

      patchBookmark({ billId, likeChecked: nextChecked }).then(() => {
        queryClient.invalidateQueries({ queryKey: followingKeys.billFeed() });
        queryClient.invalidateQueries({ queryKey: ['user', 'bookmark', 'bill'] });
        queryClient.invalidateQueries({ queryKey: ['user', 'bookmark', 'bill', 'count'] });
      });
    },
    [requireLogin, bills, setSnackbar, queryClient],
  );

  const handleShare = useCallback(
    (billId: string) => {
      copyClipBoard(`${process.env.NEXT_PUBLIC_DOMAIN}/bill/${billId}`);
      setSnackbar({ show: true, type: SNACKBAR_TYPE.SUCCESS, message: '링크를 복사했습니다.', duration: 3000 });
    },
    [setSnackbar],
  );

  return (
    <FeedTemplate sidebar={<FollowingSidebar />}>
      {/* Congressman list section */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-[22px] font-semibold leading-[1.3] md:text-[24px]">팔로잉</h2>
          <span className="text-lg font-semibold text-muted-foreground">{congressmanList.length}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {congressmanList.map((c) => (
            <Link key={c.congressman_id} href={`/congressman/${c.congressman_id}`} className="shrink-0">
              <GlassCard level="subtle" hover className="flex items-center gap-3">
                <GlassAvatar
                  size="lg"
                  partyName={c.party_name}
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${c.congressman_image_url}`}
                  fallback={c.congressman_name?.[0]}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{c.congressman_name}</p>
                  <p className="text-xs text-muted-foreground">{c.party_name}</p>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </GlassCard>

      {/* Followed bills feed */}
      <FeedList
        onLoadMore={fetchNextPage}
        hasMore={!!hasNextPage}
        isLoading={isFetching}
        emptyMessage="팔로우한 의원의 법안이 없습니다">
        {bills.map((bill) => (
          <BillCard key={bill.bill_info_dto.bill_id} bill={bill} onBookmark={handleBookmark} onShare={handleShare} />
        ))}
      </FeedList>
    </FeedTemplate>
  );
}

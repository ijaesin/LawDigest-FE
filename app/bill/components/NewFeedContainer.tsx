'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTabType } from '@/app/common/hooks';
import { useAuthGuard } from '@/app/auth/hooks';
import { useSnackbarStore } from '@/app/common/store';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import { copyClipBoard } from '@/app/common/utils';
import { siteConfig } from '@/app/common/config/site';
import { Loading } from '@/app/common/components/Loading';
import { FeedTemplate } from '@/app/common/components/templates';
import { FeedList, BillCard } from '@/app/common/components/organisms';
import { useInfiniteBillMainfeed, useGetBillPopular, billKeys } from '@/app/bill/hooks';
import { patchBookmark } from '@/app/bill/services/apis';
import { FEED_TAB } from '@/app/bill/constants';
import type { BillResponse } from '@/app/bill/validation';
import { NotificationTopThree } from '@/app/notification/components';

const EMPTY_BILLS: BillResponse[] = [];

const FEED_TABS = siteConfig.feedTabs.map((t) => ({
  label: t.label,
  value: FEED_TAB[t.value as keyof typeof FEED_TAB],
}));

function HomeSidebar() {
  return (
    <Suspense fallback={<Loading />}>
      <NotificationTopThree />
    </Suspense>
  );
}

export default function NewFeedContainer() {
  const [tab, setTab] = useTabType<typeof FEED_TAB>(FEED_TAB.sortedByLatest);
  const { requireLogin } = useAuthGuard();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const queryClient = useQueryClient();

  const isLatest = tab === FEED_TAB.sortedByLatest;

  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteBillMainfeed();
  const { data: popularFeed } = useGetBillPopular();

  const bills = useMemo(() => data?.pages.flatMap((p) => p.bill_list) ?? EMPTY_BILLS, [data]);
  const popularBills = popularFeed ?? EMPTY_BILLS;
  const displayBills = isLatest ? bills : popularBills;

  const handleBookmark = useCallback(
    (billId: string) => {
      if (!requireLogin()) return;

      const bill = displayBills.find((b) => b.bill_info_dto.bill_id === billId);
      if (!bill) return;

      const nextChecked = !bill.is_book_mark;

      setSnackbar({
        show: true,
        type: nextChecked ? SNACKBAR_TYPE.SUCCESS : SNACKBAR_TYPE.CANCEL,
        message: nextChecked ? '해당 법안을 스크랩했습니다.' : '해당 법안의 스크랩을 취소했습니다.',
        duration: 3000,
      });

      patchBookmark({ billId, likeChecked: nextChecked }).then(() => {
        queryClient.invalidateQueries({ queryKey: billKeys.mainfeed() });
        queryClient.invalidateQueries({ queryKey: billKeys.popular() });
        queryClient.invalidateQueries({ queryKey: ['user', 'bookmark', 'bill'] });
        queryClient.invalidateQueries({ queryKey: ['user', 'bookmark', 'bill', 'count'] });
      });
    },
    [requireLogin, displayBills, setSnackbar, queryClient],
  );

  const handleShare = useCallback(
    (billId: string) => {
      copyClipBoard(`${process.env.NEXT_PUBLIC_DOMAIN}/bill/${billId}`);
      setSnackbar({ show: true, type: SNACKBAR_TYPE.SUCCESS, message: '링크를 복사했습니다.', duration: 3000 });
    },
    [setSnackbar],
  );

  return (
    <FeedTemplate
      tabs={FEED_TABS}
      activeTab={tab}
      onTabChange={(v) => setTab(v as typeof tab)}
      sidebar={<HomeSidebar />}>
      <FeedList onLoadMore={fetchNextPage} hasMore={isLatest && !!hasNextPage} isLoading={isFetching}>
        {displayBills.map((bill) => (
          <BillCard key={bill.bill_info_dto.bill_id} bill={bill} onBookmark={handleBookmark} onShare={handleShare} />
        ))}
      </FeedList>
    </FeedTemplate>
  );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import { useIntersect, useTabType } from '@/app/common/hooks';
import { useInfiniteBillMainfeed, useGetBillPopular } from '@/app/bill/hooks';
import { FEED_TAB } from '@/app/bill/constants';
import type { BillResponse } from '@/app/bill/validation';
import type { ValueOf } from '@/app/common/types';
import BillList from './BillList';
import StageDropdown from './StageDropdown';
import FeedTab from './FeedTab';

const EMPTY_BILLS: BillResponse[] = [];

export default function Feed() {
  const [feedType, setFeedType] = useTabType<typeof FEED_TAB>('sorted_by_latest');
  const handleFeedTypeChange = useCallback((v: string) => setFeedType(v as ValueOf<typeof FEED_TAB>), [setFeedType]);
  const [selectedStage, setSelectedStage] = useState('전체');

  const stageParam = selectedStage === '전체' ? '' : selectedStage;
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteBillMainfeed(stageParam);
  const { data: popularFeed } = useGetBillPopular();

  const bills = useMemo(() => data?.pages.flatMap((p) => p.bill_list) ?? EMPTY_BILLS, [data]);
  const popularBills = popularFeed ?? EMPTY_BILLS;

  const isLatest = feedType === FEED_TAB.sortedByLatest;
  const displayBills = isLatest ? bills : popularBills;

  const fetchRef = useIntersect((entry, observer) => {
    observer.unobserve(entry.target);
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  });

  return (
    <section>
      <section className="flex justify-between items-center mx-5 mt-5">
        <FeedTab value={feedType} onValueChange={handleFeedTypeChange} />
        {isLatest && <StageDropdown selectedStage={selectedStage} onStageChange={setSelectedStage} />}
      </section>
      <BillList
        bills={displayBills}
        isFetching={isFetching}
        fetchRef={fetchRef}
        feedType={feedType}
      />
    </section>
  );
}

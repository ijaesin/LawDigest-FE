'use client';

import { useEffect, useState, useMemo } from 'react';
import { useIntersect, useTabType } from '@/app/common/hooks';
import { useInfiniteBillMainfeed, useGetBillPopular } from '@/app/bill/hooks';
import { FEED_TAB } from '@/app/bill/constants';
import type { BillResponse } from '@/app/bill/validation';
import BillList from './BillList';
import StageDropdown from './StageDropdown';
import FeedTab from './FeedTab';

export default function Feed() {
  const [feedType, setFeedType] = useTabType<typeof FEED_TAB>('sorted_by_latest');
  const [stageType, setStageType] = useState(new Set(['전체']));
  const selectedStageType = useMemo(() => Array.from(stageType).join(', ').replaceAll('_', ' '), [stageType]);
  const { data, hasNextPage, isFetching, fetchNextPage, refetch } = useInfiniteBillMainfeed(
    selectedStageType === '전체' ? '' : selectedStageType,
  );
  const [bills, setBills] = useState<BillResponse[]>(
    data ? (data.pages.flatMap((p) => p.bill_list) as unknown as BillResponse[]) : [],
  );
  const { data: popularFeed } = useGetBillPopular();
  const [popularBills, setPopularBills] = useState<BillResponse[]>((popularFeed as unknown as BillResponse[]) ?? []);

  const fetchRef = useIntersect(async (entry: any, observer: any) => {
    observer.unobserve(entry.target);
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  });

  useEffect(() => {
    if (data) setBills(() => [...(data.pages.flatMap((p) => p.bill_list) as unknown as BillResponse[])]);
  }, [data]);

  useEffect(() => {
    if (popularFeed) setPopularBills(() => [...(popularFeed as unknown as BillResponse[])]);
  }, [popularFeed]);

  useEffect(() => {
    setBills([]);
    refetch();
  }, [selectedStageType]);

  return (
    <section>
      <section className="flex justify-between items-center mx-5 mt-5">
        <FeedTab type={feedType as any} clickHandler={setFeedType as any} />
        {feedType === 'sorted_by_latest' && (
          <StageDropdown type={selectedStageType as any} clickHandler={setStageType as any} />
        )}
      </section>
      <BillList
        bills={feedType === 'sorted_by_latest' ? bills : popularBills}
        isFetching={isFetching}
        fetchRef={fetchRef}
        feedType={feedType as any}
      />
    </section>
  );
}

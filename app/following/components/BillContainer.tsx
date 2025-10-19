'use client';

import { useState, useEffect } from 'react';
import { useIntersect } from '@/app/common/hooks';
import { useInfiniteFollowingBill } from '@/app/following/hooks';
import BillFollowedList from './BillFollowedList';

export default function BillContainer() {
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteFollowingBill();
  const [bills, setBills] = useState(data ? data.pages.flatMap(({ bill_list }) => bill_list) : []);

  const fetchRef = useIntersect(async (entry: any, observer: any) => {
    observer.unobserve(entry.target);
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  });

  useEffect(() => {
    if (data) {
      setBills(() => [...data.pages.flatMap(({ bill_list }) => bill_list)]);
    }
  }, [data]);

  return (
    <section className="flex flex-col gap-6">
      <BillFollowedList bills={bills} isFetching={isFetching} fetchRef={fetchRef} />
    </section>
  );
}

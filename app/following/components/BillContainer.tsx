// app/following/components/BillContainer.tsx
'use client';

import { useMemo } from 'react';
import { useIntersect } from '@/app/common/hooks';
import { useInfiniteFollowingBill } from '@/app/following/hooks';
import type { BillResponse } from '@/app/bill/validation';
import BillFollowedList from './BillFollowedList';

const EMPTY_BILLS: BillResponse[] = [];

export default function BillContainer() {
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteFollowingBill();

  const bills = useMemo(() => data?.pages.flatMap((p) => p.bill_list) ?? EMPTY_BILLS, [data]);

  const fetchRef = useIntersect((entry, observer) => {
    observer.unobserve(entry.target);
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  });

  return (
    <section className="flex flex-col gap-6">
      <BillFollowedList bills={bills} isFetching={isFetching} fetchRef={fetchRef} />
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useIntersect, useTabType } from '@/app/common/hooks';
import { BILL_TAB } from '@/app/bill/constants';
import type { ValueOf } from '@/app/common/types';
import { BillList, BillTab } from '@/app/bill/components';
import { useInfinitePartyBills } from '@/app/party/hooks';

export default function BillContainer({ id }: { id: number }) {
  const [billType, setBillType] = useTabType<typeof BILL_TAB>('represent_proposer');
  const { data, hasNextPage, isFetching, fetchNextPage, refetch } = useInfinitePartyBills(
    id,
    billType as ValueOf<typeof BILL_TAB>,
  );
  const [bills, setBills] = useState(data ? data.pages.flatMap(({ bill_list: responses }) => responses) : []);

  const fetchRef = useIntersect(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  });

  useEffect(() => {
    if (data) {
      setBills(() => [...data.pages.flatMap(({ bill_list: responses }) => responses)]);
    }
  }, [data]);

  useEffect(() => {
    setBills([]);
    refetch();
  }, [billType]);

  return (
    <section>
      <BillTab type={billType as any} clickHandler={setBillType as any} />
      <BillList bills={bills} isFetching={isFetching} fetchRef={fetchRef} />
      {bills.length === 0 && !isFetching && (
        <p className="flex justify-center my-8 text-sm text-gray-2 dark:text-gray-3">
          발의한 법안이 존재하지 않습니다.
        </p>
      )}
    </section>
  );
}

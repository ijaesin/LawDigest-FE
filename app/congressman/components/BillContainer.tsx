'use client';

import { useMemo } from 'react';
import { BillList, BillTab } from '@/app/bill/components';
import { useIntersect, useTabType } from '@/app/common/hooks';
import { useInfiniteCongressmanBills } from '@/app/congressman/hooks';
import { BILL_TAB } from '@/app/bill/constants';
import type { ValueOf } from '@/app/common/types';

export default function BillContainer({ id }: { id: string }) {
  const [billType, setBillType] = useTabType<typeof BILL_TAB>('represent_proposer');
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteCongressmanBills(id, billType);

  const bills = useMemo(() => data?.pages.flatMap(({ bill_list }) => bill_list) ?? [], [data]);

  const fetchRef = useIntersect(() => {
    if (hasNextPage && !isFetching) fetchNextPage();
  });

  return (
    <section>
      <BillTab type={billType} clickHandler={(value: string) => setBillType(value as ValueOf<typeof BILL_TAB>)} />
      <BillList bills={bills} isFetching={isFetching} fetchRef={fetchRef} />
      {bills.length === 0 && !isFetching && (
        <p className="flex justify-center my-8 text-sm text-muted-foreground">발의한 법안이 존재하지 않습니다.</p>
      )}
    </section>
  );
}

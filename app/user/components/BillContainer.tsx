'use client';

import Image from 'next/image';
import { useIntersect } from '@/app/common/hooks';
import { Card } from '@/app/common/components/ui/card';
import { useInfiniteBillBookmarked } from '@/app/user/hooks';
import BillBookmarkedCount from './BillBookmarkedCount';
import BillBookmarkedList from './BillBookmarkedList';

export default function BillContainer() {
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteBillBookmarked();
  const bills = data.pages.flatMap((page) => page.bill_list);

  const fetchRef = useIntersect(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  });

  return (
    <section className="lg:px-[30px] flex flex-col gap-6">
      <p className="text-xl font-semibold px-[30px] lg:px-0">
        스크랩한 법안 &middot; <BillBookmarkedCount />
      </p>
      <Card className="mx-[30px] lg:mx-0 bg-foreground rounded-lg px-6 py-5 flex flex-row gap-8 items-center">
        <Image
          src="/images/scrab.png"
          width={64}
          height={64}
          alt="스크랩 아이콘 이미지"
          priority
          unoptimized
          className="shrink-0"
        />
        <p className="text-base font-semibold text-white lg:text-lg">이곳에서 스크랩한 법안들을 모아서 확인하세요!</p>
      </Card>
      <BillBookmarkedList bills={bills} isFetching={isFetching} fetchRef={fetchRef} />
    </section>
  );
}

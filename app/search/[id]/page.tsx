'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useIntersect } from '@/app/common/hooks';
import { Separator } from '@/app/common/components/ui/separator';
import { SearchBarButton, SearchList } from '@/app/search/components';
import { BillList } from '@/app/bill/components';
import { useGetSearchCongressmanParty, useInfiniteSearchBill } from '@/app/search/services/queries';

export default function SearchResult() {
  const params = useParams<{ id: string }>();
  const id = decodeURI(params.id);
  const { data: dataCP } = useGetSearchCongressmanParty(id);
  const {
    data: dataBill,
    hasNextPage: hasNextPageBill,
    isFetching: isFetchingBill,
    fetchNextPage: fetchNextPageBill,
  } = useInfiniteSearchBill(id);
  const searchResultsCP = dataCP?.search_response ?? [];
  const searchResultsBill = useMemo(
    () => dataBill?.pages.flatMap(({ search_response }) => search_response) ?? [],
    [dataBill],
  );

  const fetchRefBill = useIntersect(() => {
    if (hasNextPageBill && !isFetchingBill) {
      fetchNextPageBill();
    }
  });

  return (
    <>
      <SearchBarButton />
      <section className="lg:w-[840px] mx-auto">
        <p className="mx-5 my-4 text-sm font-medium text-center md:text-base text-gray-2">{`'${id}'에 대한 검색 결과입니다.`}</p>
        <div className="mb-10">
          <div>
            <h2 className="mx-5 text-lg font-semibold md:text-xl">의원 · 정당</h2>
            <div className="flex justify-center mx-5">
              <Separator className="my-2 bg-gray-1 dark:bg-dark-l" />
            </div>
            {searchResultsCP.length ? (
              <SearchList searchResults={searchResultsCP} />
            ) : (
              <p className="my-8 text-sm text-center md:text-base text-gray-2">검색 결과가 존재하지 않습니다.</p>
            )}
          </div>

          <div>
            <h2 className="mx-5 text-lg font-semibold md:text-xl">법안</h2>
            <div className="flex justify-center mx-5">
              <Separator className="mx-5 mt-2 bg-gray-1 dark:bg-dark-l" />
            </div>
            {searchResultsBill.length ? (
              <BillList bills={searchResultsBill} isFetching={isFetchingBill} fetchRef={fetchRefBill} detail={false} />
            ) : (
              <p className="my-8 text-sm text-center md:text-base text-gray-2">검색 결과가 존재하지 않습니다.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

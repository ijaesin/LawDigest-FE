'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useIntersect } from '@/app/common/hooks';
import { AppLayout } from '@/app/common/components/templates/AppLayout';
import { TabBar } from '@/app/common/components/molecules/TabBar';
import { FeedList } from '@/app/common/components/organisms/FeedList';
import { Separator } from '@/app/common/components/ui/separator';
import { useGetSearchCongressmanParty, useInfiniteSearchBill } from '@/app/search/services/queries';
import { SearchBarButton, SearchList } from '@/app/search/components';
import { BillList } from '@/app/bill/components';

const TABS = [
  { label: '법안', value: 'bill' },
  { label: '의원 · 정당', value: 'congressman' },
];

export default function NewSearchContainer() {
  const params = useParams<{ id: string }>();
  const searchWord = decodeURI(params.id);
  const [activeTab, setActiveTab] = useState('bill');

  const { data: dataCP } = useGetSearchCongressmanParty(searchWord);
  const {
    data: dataBill,
    hasNextPage: hasNextPageBill,
    isFetching: isFetchingBill,
    fetchNextPage: fetchNextPageBill,
  } = useInfiniteSearchBill(searchWord);

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
    <AppLayout>
      <SearchBarButton />
      <section className="lg:w-[840px] mx-auto">
        <p className="mx-5 my-4 text-sm font-medium text-center md:text-base text-muted-foreground">
          {`'${searchWord}'에 대한 검색 결과입니다.`}
        </p>

        <TabBar tabs={TABS} activeValue={activeTab} onChange={setActiveTab} variant="underline" />

        <div className="mb-10 mt-4">
          {activeTab === 'bill' && (
            <div>
              <h2 className="mx-5 text-lg font-semibold md:text-xl">법안</h2>
              <div className="flex justify-center mx-5">
                <Separator className="my-2 bg-muted dark:bg-border" />
              </div>
              {searchResultsBill.length ? (
                <BillList
                  bills={searchResultsBill}
                  isFetching={isFetchingBill}
                  fetchRef={fetchRefBill}
                  detail={false}
                />
              ) : (
                <p className="my-8 text-sm text-center md:text-base text-muted-foreground">
                  검색 결과가 존재하지 않습니다.
                </p>
              )}
            </div>
          )}

          {activeTab === 'congressman' && (
            <div>
              <h2 className="mx-5 text-lg font-semibold md:text-xl">의원 · 정당</h2>
              <div className="flex justify-center mx-5">
                <Separator className="my-2 bg-muted dark:bg-border" />
              </div>
              {searchResultsCP.length ? (
                <SearchList searchResults={searchResultsCP} />
              ) : (
                <p className="my-8 text-sm text-center md:text-base text-muted-foreground">
                  검색 결과가 존재하지 않습니다.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}

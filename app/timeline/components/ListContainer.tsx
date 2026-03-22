// app/timeline/components/ListContainer.tsx
'use client';

import { useMemo } from 'react';
import { useIntersect } from '@/app/common/hooks';
import { Loader2 } from 'lucide-react';
import { convertDateFormat } from '@/app/common/utils';
import { Separator } from '@/app/common/components/ui/separator';
import { useInfiniteTimelineFeed } from '@/app/timeline/hooks';
import PlenaryList from './PlenaryList';
import BillOutlineList from './BillOutlineList';
import CommitteeAuditList from './CommitteeAuditList';

export default function ListContainer() {
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteTimelineFeed();

  const timeline = useMemo(
    () => data?.pages.flatMap(({ timeline_response_list }) => timeline_response_list) ?? [],
    [data],
  );

  const fetchRef = useIntersect(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  });

  return (
    <section className="px-5 my-6 md:w-[640px] lg:w-[840px] xl:w-[1200px] mx-auto">
      <div className="flex flex-col">
        <div className="absolute w-[2px] h-5 bg-white dark:bg-dark-b dark:lg:bg-dark-pb" />
        {timeline.map(({ date, plenary_list, promulgation_list, committee_audit_list, submitted_list }) => {
          const [month, day, dayName] = convertDateFormat(date);
          return (
            <div key={date} className="flex gap-6">
              <Separator orientation="vertical" className="w-[2px] h-auto" />
              <div className="pb-10 w-full">
                <div className="relative">
                  <div className="w-[25px] h-[25px] bg-gray-1 dark:bg-gray-3 absolute rounded-full border-black border top-5 -left-[38px]" />
                  <h2 className="flex gap-2 items-baseline">
                    <span className="text-[42px]">
                      {month}.{day}
                    </span>
                    <span className="text-[22px]">{dayName}</span>
                  </h2>
                </div>
                <div className="flex flex-col gap-5">
                  {plenary_list.length > 0 && <PlenaryList plenary_list={plenary_list} />}
                  {promulgation_list.length > 0 && (
                    <BillOutlineList variant="promulgation" bills={promulgation_list} />
                  )}
                  {committee_audit_list.length > 0 && (
                    <CommitteeAuditList committee_audit_list={committee_audit_list} />
                  )}
                  {submitted_list.length > 0 && <BillOutlineList variant="submitted" bills={submitted_list} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {isFetching && (
        <div className="flex justify-center my-4 w-full">
          <Loader2 className="animate-spin" />
        </div>
      )}
      <div ref={fetchRef} />
    </section>
  );
}

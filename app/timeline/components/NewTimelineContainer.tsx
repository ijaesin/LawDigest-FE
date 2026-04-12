'use client';

import { useMemo } from 'react';
import { getDDay } from '@/app/common/utils';
import { GlassCard } from '@/app/common/components/ui/glass-card';
import { Separator } from '@/app/common/components/ui/separator';
import { StatCard } from '@/app/common/components/molecules/StatCard';
import { FeedList } from '@/app/common/components/organisms/FeedList';
import { TimelineEntry } from '@/app/common/components/organisms/TimelineEntry';
import { AppLayout } from '@/app/common/components/templates/AppLayout';
import { useGetTimelineBillState, useInfiniteTimelineFeed } from '@/app/timeline/hooks';

export default function NewTimelineContainer() {
  const { data: billState } = useGetTimelineBillState();
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteTimelineFeed();

  const timeline = useMemo(
    () => data?.pages.flatMap(({ timeline_response_list }) => timeline_response_list) ?? [],
    [data],
  );

  return (
    <AppLayout>
      {/* Statistics board */}
      <GlassCard className="w-full mx-auto md:mt-10 md:mb-6 md:w-[708px] md:pt-3">
        <div className="flex flex-col items-center gap-1 md:flex-row md:justify-center md:gap-[50px]">
          <div className="flex flex-col gap-3 items-center md:flex-row md:gap-6">
            <h2 className="font-semibold text-[26px] md:text-[48px] md:font-bold">타임라인</h2>
            <div className="flex gap-3 justify-center items-center md:flex-col md:gap-1">
              <p className="text-xs font-semibold text-muted-foreground md:text-[20px] md:font-normal">제 22대 국회</p>
              <Separator className="h-4 w-[1px] bg-foreground md:hidden" />
              <p className="text-lg font-semibold">{`D-${getDDay('2028-04-11')}`}</p>
            </div>
          </div>
          <Separator className="h-[82px] w-px bg-muted-foreground hidden md:block" />
          <div className="flex gap-10">
            <StatCard value={billState?.receipt_count ?? 0} label="접수법안" size="sm" className="shadow-none" />
            <StatCard value={billState?.treatment_count ?? 0} label="처리법안" size="sm" className="shadow-none" />
            <StatCard value={billState?.passed_count ?? 0} label="가결법안" size="sm" className="shadow-none" />
          </div>
        </div>
      </GlassCard>

      {/* D-Day heading */}
      <h3 className="text-center text-lg font-semibold my-4">{`제 22대 국회 D-${getDDay('2028-04-11')}`}</h3>

      {/* Timeline feed */}
      <section className="px-5 my-6 mx-auto">
        <div className="flex flex-col">
          <div className="absolute w-[2px] h-5 bg-background" />
          <FeedList
            onLoadMore={fetchNextPage}
            hasMore={!!hasNextPage}
            isLoading={isFetching}
            emptyMessage="타임라인 데이터가 없습니다">
            {timeline.map((entry) => (
              <TimelineEntry key={entry.date} entry={entry} />
            ))}
          </FeedList>
        </div>
      </section>
    </AppLayout>
  );
}

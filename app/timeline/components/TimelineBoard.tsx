'use client';

import { GlassCard } from '@/app/common/components/ui/glass-card';
import { Separator } from '@/app/common/components/ui/separator';
import { getDDay } from '@/app/common/utils';
import { useGetTimelineBillState } from '@/app/timeline/hooks';

export default function TimelineBoard() {
  const { data: billState } = useGetTimelineBillState();

  return (
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
          <div className="flex flex-col gap-2 items-center">
            <span className="text-2xl font-semibold">{billState?.receipt_count}</span>
            <span className="text-sm font-medium text-muted-foreground">접수법안</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-2xl font-semibold">{billState?.treatment_count}</span>
            <span className="text-sm font-medium text-muted-foreground">처리법안</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-2xl font-semibold">{billState?.passed_count}</span>
            <span className="text-sm font-medium text-muted-foreground">가결법안</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

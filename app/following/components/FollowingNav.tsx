'use client';

import { GlassCard } from '@/app/common/components/ui/glass-card';
import { useGetFollowingCongressman } from '@/app/following/hooks';
import CongressmanList from './CongressmanList';

export default function FollowingNav() {
  const { data: congressmanList } = useGetFollowingCongressman();

  return (
    <GlassCard>
      <h2 className="text-[22px] md:text-[24px] font-semibold leading-[1.3] mb-4">팔로잉</h2>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground">팔로우한 의원</p>
          <p className="text-lg font-semibold">{congressmanList.length}</p>
        </div>
        <div className="flex overflow-x-auto gap-4 scrollbar-hide">
          <CongressmanList congressmanList={congressmanList} />
        </div>
      </div>
    </GlassCard>
  );
}

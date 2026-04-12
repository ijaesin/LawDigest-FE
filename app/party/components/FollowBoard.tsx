'use client';

import { useCallback } from 'react';
import { Button } from '@/app/common/components/ui/button';
import { useSnackbarStore } from '@/app/common/store';
import { IconCheck, IconPlus } from '@/public/svgs';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import { useAuthGuard } from '@/app/auth/hooks';
import { useGetPartyDetail, useMutatePartyFollow } from '@/app/party/hooks';

export default function FollowBoard({ partyId }: { partyId: number }) {
  const { data: party } = useGetPartyDetail(partyId);
  const { followed, follow_count, representative_bill_count, public_bill_count } = party;
  const mutationFollow = useMutatePartyFollow(partyId);
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const { requireLogin } = useAuthGuard();

  const onClickFollow = useCallback(() => {
    if (!requireLogin()) return;
    const nextFollowed = !followed;
    setSnackbar({
      show: true,
      type: nextFollowed ? SNACKBAR_TYPE.SUCCESS : SNACKBAR_TYPE.CANCEL,
      message: nextFollowed ? '해당 정당을 팔로우했습니다.' : '해당 정당의 팔로우를 취소했습니다.',
      duration: 3000,
    });
    mutationFollow.mutate(nextFollowed);
  }, [followed, setSnackbar, requireLogin, mutationFollow]);

  return (
    <section className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-10">
        <div className="flex flex-col items-center gap-[10px]">
          <p className="text-2xl font-semibold">{follow_count}</p>
          <p className="text-sm font-medium text-muted-foreground">팔로워</p>
        </div>
        <div className="flex flex-col items-center gap-[10px]">
          <p className="text-2xl font-semibold"> {representative_bill_count}</p>
          <p className="text-sm font-medium text-muted-foreground">대표발의법안</p>
        </div>
        <div className="flex flex-col items-center gap-[10px]">
          <p className="text-2xl font-semibold"> {public_bill_count}</p>
          <p className="text-sm font-medium text-muted-foreground">공동발의법안</p>
        </div>
      </div>

      <Button
        onClick={onClickFollow}
        className={`w-full h-12 text-lg font-medium flex justify-between px-6 rounded-full ${followed ? 'bg-muted text-muted-foreground' : 'bg-foreground text-white'} `}>
        {followed ? '팔로우 취소' : '팔로우'}
        {followed ? <IconCheck /> : <IconPlus />}
      </Button>
    </section>
  );
}

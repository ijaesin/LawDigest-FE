'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/app/common/components/ui/button';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import { useSnackbarStore } from '@/app/common/store';
import { useAuthGuard } from '@/app/auth/hooks';
import { IconCheck, IconPlus } from '@/public/svgs';
import { useMutateCongressmanFollow } from '@/app/congressman/services/queries';

export default function FollowBoard({
  id,
  likeChecked,
  follow_count,
  represent_count,
  public_count,
}: {
  id: string;
  likeChecked: boolean;
  follow_count: number;
  represent_count: number;
  public_count: number;
}) {
  const [isFollowed, setIsFollowed] = useState(likeChecked);
  const [followCount, setFollowCount] = useState(follow_count);
  const mutationFollow = useMutateCongressmanFollow(id);
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const { requireLogin } = useAuthGuard();

  const onClickFollow = useCallback(() => {
    if (!requireLogin()) return;

    const prevFollowed = isFollowed;
    const prevCount = followCount;
    const nextFollowed = !isFollowed;

    setIsFollowed(nextFollowed);
    setFollowCount(nextFollowed ? followCount + 1 : followCount - 1);
    setSnackbar({
      show: true,
      type: nextFollowed ? SNACKBAR_TYPE.SUCCESS : SNACKBAR_TYPE.CANCEL,
      message: nextFollowed ? '해당 의원을 팔로우했습니다.' : '해당 의원의 팔로우를 취소했습니다.',
      duration: 3000,
    });

    mutationFollow.mutate(nextFollowed, {
      onError: () => {
        setIsFollowed(prevFollowed);
        setFollowCount(prevCount);
        setSnackbar({
          show: true,
          type: SNACKBAR_TYPE.ERROR,
          message: '팔로우 처리에 실패했습니다. 다시 시도해주세요.',
          duration: 3000,
        });
      },
    });
  }, [isFollowed, followCount, setSnackbar, requireLogin, mutationFollow]);

  return (
    <div className="flex flex-col gap-5 w-full">
      <dl className="flex justify-between w-full">
        <div className="flex flex-col items-center basis-1/3">
          <dd className="text-2xl font-semibold">{followCount}</dd>
          <dt className="text-sm font-medium text-muted-foreground">팔로워</dt>
        </div>
        <div className="flex flex-col items-center basis-1/3">
          <dd className="text-2xl font-semibold">{represent_count}</dd>
          <dt className="text-sm font-medium text-muted-foreground">대표발의법안</dt>
        </div>
        <div className="flex flex-col items-center basis-1/3">
          <dd className="text-2xl font-semibold">{public_count}</dd>
          <dt className="text-sm font-medium text-muted-foreground">공동발의법안</dt>
        </div>
      </dl>

      <Button
        onClick={onClickFollow}
        aria-pressed={isFollowed}
        aria-label={isFollowed ? '팔로우 취소' : '팔로우 하기'}
        className={`w-full h-12 text-lg font-medium flex justify-between px-6 rounded-full ${isFollowed ? 'bg-muted text-muted-foreground' : 'bg-foreground text-white'} `}>
        {isFollowed ? '팔로우 중' : '팔로우 하기'}
        {isFollowed ? <IconCheck /> : <IconPlus />}
      </Button>
    </div>
  );
}

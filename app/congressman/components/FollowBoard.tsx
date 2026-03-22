'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/app/common/components/ui/button';
import { getCookie } from 'cookies-next';
import { ACCESS_TOKEN, SNACKBAR_TYPE } from '@/app/common/constants';
import { useSnackbarStore } from '@/app/common/store';
import { IconCheck, IconPlus } from '@/public/svgs';
import { useMutateCongressmanFollow } from '@/app/congressman/services';

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

  const onClickFollow = useCallback(() => {
    const accessToken = getCookie(ACCESS_TOKEN);

    if (accessToken) {
      setIsFollowed(!isFollowed);
      setFollowCount(isFollowed ? followCount - 1 : followCount + 1);
      setSnackbar({
        show: true,
        type: isFollowed ? SNACKBAR_TYPE.CANCEL : SNACKBAR_TYPE.SUCCESS,
        message: isFollowed ? '해당 의원의 팔로우를 취소했습니다.' : '해당 의원을 팔로우했습니다.',
        duration: 3000,
      });

      mutationFollow.mutate(!isFollowed);
    } else {
      setSnackbar({ show: true, type: SNACKBAR_TYPE.ERROR, message: '로그인이 필요한 서비스입니다.', action: { label: '로그인 하기', href: '/auth/login' }, duration: 3000 });
    }
  }, [isFollowed, setSnackbar, followCount]);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex justify-between w-full">
        <div className="flex flex-col items-center basis-1/3">
          <p className="text-2xl font-semibold">{followCount}</p>
          <p className="text-sm font-medium text-gray-2">팔로워</p>
        </div>
        <div className="flex flex-col items-center basis-1/3">
          <p className="text-2xl font-semibold">{represent_count}</p>
          <p className="text-sm font-medium text-gray-2">대표발의법안</p>
        </div>
        <div className="flex flex-col items-center basis-1/3">
          <p className="text-2xl font-semibold">{public_count}</p>
          <p className="text-sm font-medium text-gray-2">공동발의법안</p>
        </div>
      </div>

      <Button
        onClick={onClickFollow}
        className={`w-full h-12 text-lg font-medium flex justify-between px-6 rounded-full ${isFollowed ? 'bg-gray-1 text-gray-3' : 'bg-primary-3 text-white dark:bg-gray-4 dark:text-gray-2'} `}>
        {isFollowed ? '팔로우 중' : '팔로우 하기'}
        {isFollowed ? <IconCheck /> : <IconPlus />}
      </Button>
    </div>
  );
}

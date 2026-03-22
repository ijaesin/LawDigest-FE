import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import { Button } from '@/app/common/components/ui/button';
import { useSnackbarStore } from '@/app/common/store';
import { usePostLogout } from '@/app/user/hooks';

export default function LogoutButton() {
  const router = useRouter();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const { mutate: postLogout } = usePostLogout({
    onSuccess: () => {
      setSnackbar({ show: true, type: SNACKBAR_TYPE.SUCCESS, message: '로그아웃을 성공했습니다.', duration: 3000 });
      router.push('/');
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const onClickLogout = useCallback(async () => {
    postLogout();
  }, [postLogout]);

  return (
    <Button
      onClick={onClickLogout}
      size="sm"
      variant="outline"
      className="h-8 rounded-full bg-transparent border-1 border-[#E0E0E0] text-[#999999] dark:border-gray-3 dark:text-gray-2">
      로그아웃
    </Button>
  );
}

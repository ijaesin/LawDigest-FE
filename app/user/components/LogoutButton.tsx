import { useRouter } from 'next/navigation';
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

  return (
    <Button
      onClick={() => postLogout()}
      size="sm"
      variant="outline"
      className="h-8 rounded-full bg-transparent border-1 border-border text-muted-foreground">
      로그아웃
    </Button>
  );
}

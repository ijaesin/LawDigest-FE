'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { ACCESS_TOKEN, SNACKBAR_TYPE } from '@/app/common/constants';
import { useSnackbarStore } from '@/app/common/store';
import { SearchBarButton } from '@/app/search/components';
import { FollowingNav, BillContainer } from './components';

export default function Following() {
  const router = useRouter();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const token = getCookie(ACCESS_TOKEN);

  useEffect(() => {
    if (!token) {
      setSnackbar({ show: true, type: SNACKBAR_TYPE.ERROR, message: '로그인이 필요한 서비스입니다.', duration: 3000 });
      router.push('/auth/login');
    }
  }, [token, router, setSnackbar]);

  if (!token) return null;

  return (
    <section className="flex flex-col mx-auto lg:flex-row lg:justify-center">
      <FollowingNav />
      <div className="mt-4 md:mt-0 lg:border-l-1 lg:dark:border-dark-l">
        <div className="hidden mt-11 lg:block">
          <SearchBarButton />
        </div>
        <BillContainer />
      </div>
    </section>
  );
}

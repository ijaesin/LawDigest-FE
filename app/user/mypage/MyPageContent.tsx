'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { ACCESS_TOKEN, SNACKBAR_TYPE } from '@/app/common/constants';
import { useSnackbarStore } from '@/app/common/store';
import { CongressmanList, UserInfo, PartyList, BillContainer } from '@/app/user/components';

export default function MyPageContent() {
  const router = useRouter();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const accessToken = getCookie(ACCESS_TOKEN);

  useEffect(() => {
    if (!accessToken) {
      setSnackbar({ show: true, type: SNACKBAR_TYPE.ERROR, message: '로그인이 필요한 서비스입니다.', duration: 3000 });
      router.push('/auth/login');
    }
  }, [accessToken, router, setSnackbar]);

  if (!accessToken) return null;

  return (
    <div className="flex flex-col gap-8 h-full lg:flex-row md:items-center lg:items-start lg:justify-center lg:mt-10 lg:mx-auto lg:ml-10 xl:ml-0">
      <UserInfo />
      <div className="flex flex-col gap-8 h-full">
        <PartyList />
        <hr className="mx-[30px] border-[#E0E0E0] dark:border-dark-l lg:border-transparent dark:lg:border-transparent" />
        <CongressmanList />
        <hr className="mx-[30px] border-[#E0E0E0] dark:border-dark-l lg:border-transparent dark:lg:border-transparent" />
        <BillContainer />
      </div>
    </div>
  );
}

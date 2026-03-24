'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/app/common/components/atoms';

export default function KaKaoLogin() {
  const router = useRouter();

  useEffect(() => {
    router.push('/user/mypage');
  }, [router]);

  return (
    <section className="w-[90%] mx-auto h-full flex flex-col justify-center items-center gap-20">
      <Logo width={222} height={37} />
      <p>로그인 중입니다.</p>
    </section>
  );
}

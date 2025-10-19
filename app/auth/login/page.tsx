'use client';

import { Button } from '@/app/common/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/app/common/components/Layout/Header/Logo';

export default function Login() {
  return (
    <section className="w-[90%] mx-auto flex flex-col items-center gap-20 mt-48 sm:w-[430px] ">
      <Logo width={222} height={37} />
      <Button variant="outline" className="w-full h-[58px] rounded-full" asChild>
        <Link
          href={`${process.env.NEXT_PUBLIC_URL}oauth2/authorization/kakao?redirect_uri=${`${process.env.NEXT_PUBLIC_DOMAIN}/auth/login/kakaoLogin`}`}>
          <Image src="/images/kakao.svg" width={22} height={22} alt="카카오톡 로고 이미지" />
          카카오톡으로 시작하기
        </Link>
      </Button>
    </section>
  );
}

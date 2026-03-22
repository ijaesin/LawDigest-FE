'use client';

import { Button } from '@/app/common/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/app/common/components/Layout/Header/Logo';
import { GlassCard } from '@/app/common/components/ui/glass-card';

export default function Login() {
  return (
    <section className="flex min-h-screen items-center justify-center px-4">
      <GlassCard className="flex w-full max-w-[430px] flex-col items-center gap-12 py-16">
        <Logo width={222} height={37} />
        <p className="text-center text-muted-foreground">법안 정보를 한눈에, AI 요약으로 쉽게</p>
        <Button variant="outline" className="h-[58px] w-full rounded-full" asChild>
          <Link
            href={`${process.env.NEXT_PUBLIC_URL}oauth2/authorization/kakao?redirect_uri=${`${process.env.NEXT_PUBLIC_DOMAIN}/auth/login/kakaoLogin`}`}>
            <Image src="/images/kakao.svg" width={22} height={22} alt="카카오톡 로고 이미지" />
            카카오톡으로 시작하기
          </Link>
        </Button>
      </GlassCard>
    </section>
  );
}

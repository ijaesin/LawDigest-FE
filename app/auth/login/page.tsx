'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AuthTemplate } from '@/app/common/components/templates';
import { GlassCard, GlassButton, Logo } from '@/app/common/components/atoms';

export default function Login() {
  return (
    <AuthTemplate>
      <GlassCard level="medium" className="flex w-full max-w-[430px] flex-col items-center gap-12 py-16">
        <Logo size="lg" />
        <p className="text-center text-muted-foreground">법안 정보를 한눈에, AI 요약으로 쉽게</p>
        <GlassButton variant="outline" className="h-[58px] w-full rounded-full" asChild>
          <Link
            href={`${process.env.NEXT_PUBLIC_URL}oauth2/authorization/kakao?redirect_uri=${process.env.NEXT_PUBLIC_DOMAIN}/auth/login/kakaoLogin`}>
            <Image src="/images/kakao.svg" width={22} height={22} alt="카카오톡 로고 이미지" />
            카카오톡으로 시작하기
          </Link>
        </GlassButton>
      </GlassCard>
    </AuthTemplate>
  );
}

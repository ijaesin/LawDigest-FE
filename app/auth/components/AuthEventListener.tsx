// app/auth/components/AuthEventListener.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authEvents } from '@/app/common/lib/auth-events';

export default function AuthEventListener() {
  const router = useRouter();

  useEffect(() => {
    const offLogout = authEvents.onLogout(() => router.push('/auth/login'));
    const offReissue = authEvents.onTokenReissued(() => router.refresh());
    return () => {
      offLogout();
      offReissue();
    };
  }, [router]);

  return null;
}

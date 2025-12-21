'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authEvents } from '@/app/common/lib/auth-events';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const offLogout = authEvents.onLogout(() => router.push('/auth/login'));
    const offReissue = authEvents.onTokenReissued(() => router.refresh());
    return () => {
      offLogout();
      offReissue();
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

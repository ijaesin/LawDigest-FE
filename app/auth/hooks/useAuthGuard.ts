'use client';

import { useCallback } from 'react';
import { getCookie } from 'cookies-next';
import { ACCESS_TOKEN, SNACKBAR_TYPE } from '@/app/common/constants';
import { useSnackbarStore } from '@/app/common/store';

export function useAuthGuard() {
  const accessToken = getCookie(ACCESS_TOKEN);
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);

  const requireLogin = useCallback(() => {
    if (accessToken) return true;
    setSnackbar({
      show: true,
      type: SNACKBAR_TYPE.ERROR,
      message: '로그인이 필요한 서비스입니다.',
      action: { label: '로그인 하기', href: '/auth/login' },
      duration: 3000,
    });
    return false;
  }, [accessToken, setSnackbar]);

  return { isAuthenticated: !!accessToken, requireLogin };
}

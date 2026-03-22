// app/auth/lib/token-reissue.ts
import type { AxiosError, AxiosInstance } from 'axios';
import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';
import { ACCESS_TOKEN } from '@/app/common/constants';
import { authEvents } from '@/app/common/lib/auth-events';

export function createAuthErrorHandler(client: AxiosInstance) {
  return async (error: AxiosError) => {
    if (error.response?.status !== 401) return Promise.reject(error);

    try {
      await client.post('/auth/reissue/token');
      const { response } = error;
      const newConfig = { ...response!.config, headers: { ...response!.config.headers } };
      const accessToken = getCookie(ACCESS_TOKEN);
      if (accessToken) {
        newConfig.headers.Authorization = `Bearer ${accessToken}`;
      }
      // raw axios를 사용하여 401 무한 루프 방지
      const retryResponse = await axios(newConfig);
      authEvents.emitTokenReissued();
      return retryResponse;
    } catch {
      deleteCookie(ACCESS_TOKEN);
      authEvents.emitLogout();
      return Promise.reject(error);
    }
  };
}

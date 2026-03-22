// app/common/lib/api.ts
import axios, { type AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getCookie } from 'cookies-next';
import qs from 'qs';
import { ACCESS_TOKEN } from '@/app/common/constants';
import { createAuthErrorHandler } from '@/app/auth/lib/token-reissue';

interface ApiResponse<T = unknown> {
  status: number;
  code: string;
  message: string;
  data: T;
}

// 브라우저에서는 Next.js rewrites를 통해 동일 오리진 경유로 프록시(/v1 → REMOTE/v1)
// 서버(SSR)에서는 직접 원격 호출을 사용
const baseURL = typeof window !== 'undefined' ? '/v1' : process.env.NEXT_PUBLIC_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axios.defaults.paramsSerializer = (params) => {
  return qs.stringify(params);
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = getCookie(ACCESS_TOKEN);

    if (!accessToken) {
      return config;
    }
    // eslint-disable-next-line
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const payload = response.data;
    // 공통 응답 래퍼({ status, code, message, data })를 사용하는 경우 내부 data만 반환
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as ApiResponse).data;
    }
    return payload;
  },
  createAuthErrorHandler(apiClient),
);

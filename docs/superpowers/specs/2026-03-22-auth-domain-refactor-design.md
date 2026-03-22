# Auth 도메인 리팩토링 Design Spec

**Date:** 2026-03-22
**Goal:** Auth 도메인의 코드 응집도, 타입 안전성, 중복 제거, 관심사 분리를 개선한다.

**Approach:** 접근법 B — Auth 도메인 응집 + 서버 컴포넌트 가드 통일. 기존 도메인 모듈 패턴과 일관되면서 실질적 개선을 달성한다.

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, TypeScript strict, Tailwind CSS, shadcn/ui

---

## 현재 문제점

| 영역 | 문제 | 위치 |
|------|------|------|
| 인증 가드 불일치 | 서버(`cookies()` + `redirect`)와 클라이언트(`getCookie` + `useEffect` + `router.push`) 패턴 혼재, 동일 코드 반복 | `mypage/page.tsx`, `following/page.tsx`, `MyPageContent.tsx` 등 |
| 로그아웃 로직 분산 | API 호출은 `user/services`, mutation 훅은 `user/hooks`, cookie 삭제는 `LogoutButton`, 이벤트는 `providers.tsx`에 분산 | 4개 파일에 걸쳐 분산 |
| 회원 탈퇴 패턴 불일치 | `useDeleteWithdraw`의 `onSuccess`/`onError`가 단순 passthrough, cookie 삭제가 컴포넌트에 위치 | `auth/hooks`, `WithdrawModal.tsx` |
| API 인터셉터 결합 | `api.ts`에 401 처리, cookie 삭제, auth 이벤트 발행 등 auth 도메인 로직이 결합 | `common/lib/api.ts` |
| 인증 필요 UI 중복 | `getCookie` + 스낵바 + 리다이렉트 패턴이 5곳에서 반복 | `Bill.tsx`, `FollowBoard.tsx`(2곳), `NotificationButton.tsx`, `MyPageContent.tsx` |
| Providers 책임 과다 | QueryClient, ThemeProvider, auth 이벤트 리스너가 한 컴포넌트에 혼재 | `providers.tsx` |

---

## 설계

### 1. 서버 컴포넌트 Auth Guard 통일

**파일:** `app/auth/lib/require-auth.ts` (신규)

서버 컴포넌트 전용 인증 가드 유틸. `cookies()` + `redirect` 패턴을 한 곳에 캡슐화한다.

```tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_TOKEN } from '@/app/common/constants';

export async function requireAuth(): Promise<string> {
  const token = (await cookies()).get(ACCESS_TOKEN)?.value;
  if (!token) redirect('/auth/login');
  return token;
}
```

**사용처 변경:**
- `app/user/mypage/page.tsx`: 인라인 쿠키 체크 → `await requireAuth()`
- `app/following/page.tsx`: 인라인 쿠키 체크 → `await requireAuth()`

### 2. 클라이언트 인증 체크 훅 통합

**파일:** `app/auth/hooks/useAuthGuard.ts` (신규)

클라이언트 컴포넌트에서 인증 상태 확인 + 미인증 시 스낵바 표시 패턴을 통합한다.

```tsx
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
    });
    return false;
  }, [accessToken, setSnackbar]);

  return { isAuthenticated: !!accessToken, requireLogin };
}
```

**사용처 변경 (5곳):**
- `app/bill/components/Bill.tsx`: `getCookie` + 스낵바 → `useAuthGuard().requireLogin()`
- `app/party/components/FollowBoard.tsx`: 동일 패턴 교체
- `app/congressman/components/FollowBoard.tsx`: 동일 패턴 교체
- `app/common/components/Button/NotificationButton.tsx`: `getCookie` → `useAuthGuard().isAuthenticated`
- `app/user/mypage/MyPageContent.tsx`: `useEffect` 내 `getCookie` + 스낵바 → `useAuthGuard()`

### 3. 로그아웃 Mutation을 auth 도메인으로 이동

**배경:** `postLogout` API와 `usePostLogout` 훅은 인증 lifecycle 로직이므로 auth 도메인에 속해야 한다. 현재 `user/services`와 `user/hooks`에 위치하여 도메인 경계가 불분명하다.

**변경:**
- `postLogout` 함수 → `app/auth/services/index.ts`로 이동
- `usePostLogout` 훅 → `app/auth/hooks/index.ts`로 이동
- `usePostLogout`의 `onSuccess`에 `deleteCookie(ACCESS_TOKEN)` 내장 (현재 `LogoutButton`에 분산)
- `app/user/services/index.ts`에서 `postLogout` re-export (하위 호환)
- `app/user/hooks/index.ts`에서 `usePostLogout` re-export (하위 호환)

**`usePostLogout` 개선 후:**
```tsx
export const usePostLogout = (options?: UseMutationOptions<void, Error, void, unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postLogout(),
    ...options,
    onSuccess: (data, variables, context) => {
      deleteCookie(ACCESS_TOKEN);
      queryClient.removeQueries();
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
```

**`LogoutButton` 변경:** `deleteCookie` 호출 제거, mutation의 `onSuccess`에서 스낵바 + 라우터만 담당.

### 4. 회원 탈퇴 Mutation 패턴 정상화

**배경:** `useDeleteWithdraw`의 `onSuccess`/`onError`가 options passthrough만 하여 의미 없음. cookie 삭제가 `WithdrawModal` 컴포넌트에 위치.

**변경:**
- `useDeleteWithdraw`의 `onSuccess`에 `deleteCookie(ACCESS_TOKEN)` + `queryClient.removeQueries()` 내장
- `WithdrawModal`에서 `deleteCookie` 호출 제거

**`useDeleteWithdraw` 개선 후:**
```tsx
export const useDeleteWithdraw = (options?: UseMutationOptions<void, Error, void, unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWithdraw,
    ...options,
    onSuccess: (data, variables, context) => {
      deleteCookie(ACCESS_TOKEN);
      queryClient.removeQueries();
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
```

### 5. API 인터셉터에서 auth 로직 분리

**파일:** `app/auth/lib/token-reissue.ts` (신규)

**배경:** `api.ts`의 response interceptor에 토큰 재발급, cookie 삭제, auth 이벤트 발행 등 auth 도메인 로직이 결합되어 있다. auth 관심사를 auth 도메인 모듈로 분리한다.

```tsx
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
```

**`api.ts` 변경:** 인라인 401 핸들러 제거 → `createAuthErrorHandler(apiClient)` 사용.

### 6. Providers에서 auth 이벤트 리스너 분리

**파일:** `app/auth/components/AuthEventListener.tsx` (신규)

**배경:** `providers.tsx`에 QueryClient, ThemeProvider, auth 이벤트 리스너가 혼재. 각각 독립적 관심사이므로 분리한다.

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authEvents } from '@/app/common/lib/auth-events';

export function AuthEventListener({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const offLogout = authEvents.onLogout(() => router.push('/auth/login'));
    const offReissue = authEvents.onTokenReissued(() => router.refresh());
    return () => {
      offLogout();
      offReissue();
    };
  }, [router]);

  return <>{children}</>;
}
```

**`providers.tsx` 변경:** auth 이벤트 `useEffect` 제거, `<AuthEventListener>` 래핑 추가.

---

## 파일 구조 — 최종 형태

### 신규 파일

| 파일 | 책임 |
|------|------|
| `app/auth/lib/require-auth.ts` | 서버 컴포넌트 인증 가드 유틸 |
| `app/auth/hooks/useAuthGuard.ts` | 클라이언트 인증 체크 훅 |
| `app/auth/lib/token-reissue.ts` | 401 인터셉터 핸들러 |
| `app/auth/components/AuthEventListener.tsx` | auth 이벤트 리스너 컴포넌트 |

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `app/auth/services/index.ts` | `postLogout` 추가 |
| `app/auth/hooks/index.ts` | `usePostLogout`, `useAuthGuard` 추가, `useDeleteWithdraw` 개선 |
| `app/common/lib/api.ts` | 인라인 401 핸들러 → `createAuthErrorHandler` 사용 |
| `app/providers.tsx` | auth 이벤트 제거, `AuthEventListener` 래핑 |
| `app/user/mypage/page.tsx` | 인라인 가드 → `requireAuth()` |
| `app/following/page.tsx` | 인라인 가드 → `requireAuth()` |
| `app/user/services/index.ts` | `postLogout` 제거, auth에서 re-export |
| `app/user/hooks/index.ts` | `usePostLogout` 제거, auth에서 re-export |
| `app/user/components/LogoutButton.tsx` | `deleteCookie` 제거 |
| `app/auth/components/WithdrawModal.tsx` | `deleteCookie` 제거 |
| `app/bill/components/Bill.tsx` | `getCookie` + 스낵바 → `useAuthGuard()` |
| `app/party/components/FollowBoard.tsx` | `getCookie` + 스낵바 → `useAuthGuard()` |
| `app/congressman/components/FollowBoard.tsx` | `getCookie` + 스낵바 → `useAuthGuard()` |
| `app/common/components/Button/NotificationButton.tsx` | `getCookie` → `useAuthGuard()` |
| `app/user/mypage/MyPageContent.tsx` | `useEffect` 인증 체크 → `useAuthGuard()` |

---

## 개선 효과 요약

| 영역 | Before | After |
|------|--------|-------|
| 서버 가드 | 2곳에서 동일 코드 반복 | `requireAuth()` 단일 유틸 |
| 클라이언트 인증 체크 | 5곳에서 `getCookie` + 스낚바 반복 | `useAuthGuard()` 단일 훅 |
| 로그아웃 | API, 훅, cookie 삭제가 3개 도메인에 분산 | auth 도메인에 응집 |
| 회원 탈퇴 | cookie 삭제가 컴포넌트에 위치 | mutation 훅에 내장 |
| API 인터셉터 | auth 로직이 `api.ts`에 결합 | auth 모듈로 분리 |
| Providers | 3가지 관심사 혼재 | 각각 독립 컴포넌트 |

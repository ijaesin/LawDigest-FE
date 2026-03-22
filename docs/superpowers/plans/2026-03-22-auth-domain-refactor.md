# Auth 도메인 리팩토링 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auth 도메인의 코드 응집도를 높이고, 인증 가드/로그아웃/회원탈퇴 패턴을 통일하며, API 인터셉터의 auth 관심사를 분리한다.

**Architecture:** 서버 가드(`requireAuth`)와 클라이언트 가드(`useAuthGuard`) 유틸을 auth 도메인에 집중시키고, 로그아웃/회원탈퇴 mutation을 auth 도메인으로 이동하며, API 인터셉터의 401 핸들러를 auth 모듈로 분리한다. Providers에서 auth 이벤트 리스너를 독립 컴포넌트로 추출한다.

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, TypeScript strict, Tailwind CSS, shadcn/ui

**Spec:** `docs/superpowers/specs/2026-03-22-auth-domain-refactor-design.md`

---

## File Structure

### 신규 생성 파일

| 파일 | 책임 |
|------|------|
| `app/auth/lib/require-auth.ts` | 서버 컴포넌트 인증 가드 유틸 |
| `app/auth/hooks/useAuthGuard.ts` | 클라이언트 인증 체크 훅 |
| `app/auth/lib/token-reissue.ts` | 401 인터셉터 핸들러 (auth 관심사 분리) |
| `app/auth/components/AuthEventListener.tsx` | auth 이벤트 리스너 (providers에서 분리) |
| `app/user/services/query-keys.ts` | userKeys 팩토리 (순환 참조 해결) |

### 수정 대상 파일

| 파일 | 변경 내용 |
|------|-----------|
| `app/auth/services/index.ts` | `postLogout` API 추가 |
| `app/auth/hooks/index.ts` | `usePostLogout`, `useAuthGuard` re-export, `useDeleteWithdraw` 개선 |
| `app/auth/components/index.tsx` | `AuthEventListener` export 추가 |
| `app/common/lib/api.ts` | 인라인 401 핸들러 → `createAuthErrorHandler` 사용 |
| `app/providers.tsx` | auth 이벤트 `useEffect` 제거, `<AuthEventListener />` 추가 |
| `app/user/mypage/page.tsx` | 인라인 가드 → `requireAuth()` |
| `app/following/page.tsx` | 인라인 가드 → `requireAuth()` |
| `app/user/services/index.ts` | `postLogout` 제거 → auth에서 re-export |
| `app/user/hooks/index.ts` | `usePostLogout` 제거 → auth에서 re-export |
| `app/user/components/LogoutButton.tsx` | `deleteCookie` 제거 |
| `app/auth/components/WithdrawModal.tsx` | `deleteCookie` 제거 |
| `app/bill/components/Bill.tsx` | `getCookie` + 스낵바 → `useAuthGuard()` |
| `app/party/components/FollowBoard.tsx` | `getCookie` + 스낵바 → `useAuthGuard()` |
| `app/congressman/components/FollowBoard.tsx` | `getCookie` + 스낵바 → `useAuthGuard()` |
| `app/common/components/Button/NotifcationButton.tsx` | `getCookie` → `useAuthGuard()` |
| `app/user/mypage/MyPageContent.tsx` | `useEffect` 인증 체크 → `useAuthGuard()` |

---

## Task 1: 서버 컴포넌트 Auth Guard 유틸 생성 및 적용

**Files:**
- Create: `app/auth/lib/require-auth.ts`
- Modify: `app/user/mypage/page.tsx`
- Modify: `app/following/page.tsx`

**배경:** 2개 보호 페이지에서 동일한 `cookies()` + `redirect` 코드가 반복된다. 서버 전용 유틸로 추출한다.

- [ ] **Step 1: require-auth.ts 생성**

```tsx
// app/auth/lib/require-auth.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_TOKEN } from '@/app/common/constants';

export async function requireAuth(): Promise<string> {
  const token = (await cookies()).get(ACCESS_TOKEN)?.value;
  if (!token) redirect('/auth/login');
  return token;
}
```

- [ ] **Step 2: app/user/mypage/page.tsx에 적용**

```tsx
// app/user/mypage/page.tsx
// TODO: React Query hydration disabled temporarily while investigating build error
import { requireAuth } from '@/app/auth/lib/require-auth';
// import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import MyPageContent from './MyPageContent';

export default async function MyPage() {
  await requireAuth();
  return <MyPageContent />;
}
```

- [ ] **Step 3: app/following/page.tsx에 적용**

```tsx
// app/following/page.tsx
import { requireAuth } from '@/app/auth/lib/require-auth';
import FollowingContent from './components/FollowingContent';

export default async function Following() {
  await requireAuth();
  return <FollowingContent />;
}
```

- [ ] **Step 4: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/auth/lib/require-auth.ts app/user/mypage/page.tsx app/following/page.tsx
git commit -m "refactor: 서버 컴포넌트 auth guard를 requireAuth() 유틸로 통합"
```

---

## Task 2: 클라이언트 인증 체크 훅 생성

**Files:**
- Create: `app/auth/hooks/useAuthGuard.ts`
- Modify: `app/auth/hooks/index.ts`

**배경:** 5곳에서 반복되는 `getCookie(ACCESS_TOKEN)` + 스낵바 패턴을 하나의 훅으로 통합한다. 이 Task에서는 훅만 생성하고, 소비자 적용은 Task 6에서 일괄 수행한다.

- [ ] **Step 1: useAuthGuard.ts 생성**

```tsx
// app/auth/hooks/useAuthGuard.ts
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
```

- [ ] **Step 2: auth/hooks/index.ts에 re-export 추가**

`useAuthGuard`를 기존 export에 추가:

```tsx
// app/auth/hooks/index.ts
import { deleteWithdraw } from '@/app/auth/services';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

export { useAuthGuard } from './useAuthGuard';

/**
 * @description 회원 탈퇴
 * @returns 회원 탈퇴 성공 여부
 */
export const useDeleteWithdraw = (options?: UseMutationOptions<void, Error, void, unknown>) => {
  return useMutation({
    mutationFn: deleteWithdraw,
    ...options,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
```

- [ ] **Step 3: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/auth/hooks/useAuthGuard.ts app/auth/hooks/index.ts
git commit -m "feat: useAuthGuard 클라이언트 인증 체크 훅 생성"
```

---

## Task 3: 로그아웃 Mutation을 auth 도메인으로 이동

**Files:**
- Modify: `app/auth/services/index.ts`
- Modify: `app/auth/hooks/index.ts`
- Modify: `app/user/services/index.ts`
- Modify: `app/user/hooks/index.ts`
- Modify: `app/user/components/LogoutButton.tsx`

**배경:** `postLogout` API와 `usePostLogout` 훅은 인증 lifecycle 로직이므로 auth 도메인에 속해야 한다. 이동 후 user 도메인에서 re-export하여 하위 호환을 유지한다. `usePostLogout`의 `onSuccess`에 `deleteCookie`를 내장하여 `LogoutButton`의 책임을 줄인다.

**동작 변경:** 기존 `usePostLogout`은 caller의 `onSuccess`를 무시하고 내부 로직만 실행했다. 개선 후에는 내부 cleanup 후 caller의 `onSuccess`를 정상 호출한다.

- [ ] **Step 1: auth/services/index.ts에 postLogout 추가**

```tsx
// app/auth/services/index.ts
import { apiClient } from '@/app/common/lib';
import { extractApiMessage } from '@/app/common/validation/api.schema';

/**
 * @description 회원 탈퇴
 * @returns void
 * @see DELETE /auth/user/withdraw
 */
export const deleteWithdraw = async (): Promise<void> => {
  try {
    await apiClient.delete(`/auth/user/withdraw`);
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};

/**
 * @description 로그아웃
 * @see POST /logout
 */
export const postLogout = async (): Promise<void> => {
  try {
    await apiClient.post('/logout');
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};
```

- [ ] **Step 2: auth/hooks/index.ts에 usePostLogout 추가**

```tsx
// app/auth/hooks/index.ts
import { deleteWithdraw, postLogout } from '@/app/auth/services';
import { deleteCookie } from 'cookies-next';
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { ACCESS_TOKEN } from '@/app/common/constants';
import { userKeys } from '@/app/user/services/query-keys';

export { useAuthGuard } from './useAuthGuard';

/**
 * @description 회원 탈퇴
 */
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

/**
 * @description 로그아웃
 */
export const usePostLogout = (options?: UseMutationOptions<void, Error, void, unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postLogout(),
    ...options,
    onSuccess: (data, variables, context) => {
      deleteCookie(ACCESS_TOKEN);
      queryClient.removeQueries({ queryKey: userKeys.root() });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
```

- [ ] **Step 3: user/services/index.ts에서 postLogout을 re-export로 변경**

`postLogout` 함수 정의를 제거하고 auth에서 re-export:

```tsx
// app/user/services/index.ts 하단에 추가, 기존 postLogout 함수 정의 제거
export { postLogout } from '@/app/auth/services';
```

기존 `postLogout` 함수 (아래)를 삭제:
```tsx
// 삭제 대상
export const postLogout = async (): Promise<void> => {
  try {
    await apiClient.post('/logout');
  } catch (err) {
    throw new Error(extractApiMessage(err));
  }
};
```

- [ ] **Step 4: user/hooks/index.ts에서 usePostLogout을 re-export로 변경**

`usePostLogout` 함수 정의를 제거하고 auth에서 re-export:

```tsx
// app/user/hooks/index.ts 하단에 추가, 기존 usePostLogout 함수 정의 제거
export { usePostLogout } from '@/app/auth/hooks';
```

기존 `usePostLogout` 함수 (L127-143)를 삭제.

**주의:** `userKeys`는 `app/user/hooks/index.ts`에 정의되어 있고, auth/hooks에서 import한다. 순환 참조를 방지하기 위해 `userKeys`를 별도 파일 `app/user/services/query-keys.ts`로 분리하는 것을 검토. 현재 `user/hooks/index.ts`가 auth를 re-export하고, auth가 `userKeys`를 import하는 구조이므로 순환 참조가 발생한다.

**순환 참조 해결:** `userKeys`를 `app/user/services/query-keys.ts`로 추출하고, `user/hooks/index.ts`와 `auth/hooks/index.ts` 모두 `query-keys.ts`에서 import한다.

```tsx
// app/user/services/query-keys.ts (신규)
export const userKeys = {
  root: () => ['user'] as const,
  info: () => [...userKeys.root(), 'info'] as const,
  followingParty: () => [...userKeys.root(), 'followingParty'] as const,
  followingCongressman: () => [...userKeys.root(), 'followingCongressman'] as const,
  billBookmarkFeed: () => [...userKeys.root(), 'billBookmarkFeed'] as const,
  billBookmarkCount: () => [...userKeys.root(), 'billBookmarkCount'] as const,
};
```

`user/hooks/index.ts`에서 `userKeys` 정의를 제거하고 re-export:
```tsx
export { userKeys } from '@/app/user/services/query-keys';
```

- [ ] **Step 5: LogoutButton에서 deleteCookie 제거**

```tsx
// app/user/components/LogoutButton.tsx
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { SNACKBAR_TYPE } from '@/app/common/constants';
import { Button } from '@/app/common/components/ui/button';
import { useSnackbarStore } from '@/app/common/store';
import { usePostLogout } from '@/app/user/hooks';

export default function LogoutButton() {
  const router = useRouter();
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const { mutate: postLogout } = usePostLogout({
    onSuccess: () => {
      setSnackbar({ show: true, type: SNACKBAR_TYPE.SUCCESS, message: '로그아웃을 성공했습니다.', duration: 3000 });
      router.push('/');
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const onClickLogout = useCallback(async () => {
    postLogout();
  }, [postLogout]);

  return (
    <Button
      onClick={onClickLogout}
      size="sm"
      variant="outline"
      className="h-8 rounded-full bg-transparent border-1 border-[#E0E0E0] text-[#999999] dark:border-gray-3 dark:text-gray-2">
      로그아웃
    </Button>
  );
}
```

- [ ] **Step 6: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/auth/services/index.ts app/auth/hooks/index.ts app/user/services/index.ts app/user/services/query-keys.ts app/user/hooks/index.ts app/user/components/LogoutButton.tsx
git commit -m "refactor: 로그아웃 mutation을 auth 도메인으로 이동, deleteCookie 내장"
```

---

## Task 4: 회원 탈퇴 Mutation 패턴 정상화

**Files:**
- Modify: `app/auth/components/WithdrawModal.tsx`

**배경:** Task 3에서 `useDeleteWithdraw`에 `deleteCookie` + `removeQueries()`를 내장했다. `WithdrawModal`에서 중복 `deleteCookie` 호출을 제거한다.

- [ ] **Step 1: WithdrawModal에서 deleteCookie 제거**

```tsx
// app/auth/components/WithdrawModal.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/common/components/ui/dialog';
import { Button } from '@/app/common/components/ui/button';
import { useDeleteWithdraw } from '@/app/auth/hooks';

export default function WithdrawModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: () => void }) {
  const router = useRouter();

  const { mutate: withdraw } = useDeleteWithdraw({
    onSuccess: () => {
      router.push('/');
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const onClickWithdraw = useCallback(async () => {
    withdraw();
  }, [withdraw]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>주의</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>회원탈퇴를 진행하시겠습니까 ?</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onOpenChange}>
            취소
          </Button>
          <Button variant="destructive" onClick={onClickWithdraw}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/auth/components/WithdrawModal.tsx
git commit -m "refactor: WithdrawModal에서 deleteCookie 제거 (mutation 훅에 내장)"
```

---

## Task 5: API 인터셉터에서 auth 로직 분리 + AuthEventListener 추출

**Files:**
- Create: `app/auth/lib/token-reissue.ts`
- Create: `app/auth/components/AuthEventListener.tsx`
- Modify: `app/auth/components/index.tsx`
- Modify: `app/common/lib/api.ts`
- Modify: `app/providers.tsx`

**배경:** `api.ts`의 401 핸들러와 `providers.tsx`의 auth 이벤트 리스너를 auth 도메인으로 분리한다.

- [ ] **Step 1: token-reissue.ts 생성**

```tsx
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
```

- [ ] **Step 2: api.ts에서 인라인 401 핸들러를 createAuthErrorHandler로 교체**

```tsx
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
```

- [ ] **Step 3: AuthEventListener.tsx 생성**

```tsx
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
```

- [ ] **Step 4: auth/components/index.tsx에 export 추가**

```tsx
// app/auth/components/index.tsx
'use client';

import WithdrawModal from './WithdrawModal';
import AuthEventListener from './AuthEventListener';

export { WithdrawModal, AuthEventListener };
```

- [ ] **Step 5: providers.tsx에서 auth 이벤트 로직 제거, AuthEventListener 추가**

```tsx
// app/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { AuthEventListener } from '@/app/auth/components';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthEventListener />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 6: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/auth/lib/token-reissue.ts app/auth/components/AuthEventListener.tsx app/auth/components/index.tsx app/common/lib/api.ts app/providers.tsx
git commit -m "refactor: API 인터셉터 auth 로직 분리, AuthEventListener 추출"
```

---

## Task 6: 클라이언트 인증 체크 훅 소비자 적용 (5곳)

**Files:**
- Modify: `app/bill/components/Bill.tsx`
- Modify: `app/party/components/FollowBoard.tsx`
- Modify: `app/congressman/components/FollowBoard.tsx`
- Modify: `app/common/components/Button/NotifcationButton.tsx`
- Modify: `app/user/mypage/MyPageContent.tsx`

**배경:** Task 2에서 생성한 `useAuthGuard`를 5곳의 소비자에 적용하여 중복 `getCookie` + 스낵바 패턴을 제거한다.

- [ ] **Step 1: Bill.tsx에 useAuthGuard 적용**

`getCookie`, `ACCESS_TOKEN` import 제거. `onClickScrap`에서 `requireLogin()` 사용:

변경 전 (L48-61):
```tsx
const onClickScrap = useCallback(() => {
  const accessToken = getCookie(ACCESS_TOKEN);

  if (accessToken) {
    setSnackbar({ ... });
    mutateBookmark.mutate(!is_book_mark);
  } else {
    setSnackbar({ show: true, type: SNACKBAR_TYPE.ERROR, message: '로그인이 필요한 서비스입니다.', ... });
  }
}, [is_book_mark, setSnackbar, mutateBookmark]);
```

변경 후:
```tsx
import { useAuthGuard } from '@/app/auth/hooks';

// 컴포넌트 내부
const { requireLogin } = useAuthGuard();

const onClickScrap = useCallback(() => {
  if (!requireLogin()) return;
  setSnackbar({
    show: true,
    type: is_book_mark ? SNACKBAR_TYPE.CANCEL : SNACKBAR_TYPE.SUCCESS,
    message: is_book_mark ? '해당 법안의 스크랩을 취소했습니다.' : '해당 법안을 스크랩했습니다.',
    duration: 3000,
  });
  mutateBookmark.mutate(!is_book_mark);
}, [is_book_mark, setSnackbar, mutateBookmark, requireLogin]);
```

`getCookie`, `ACCESS_TOKEN` import 제거. (`SNACKBAR_TYPE`은 스크랩 성공/취소 메시지에서 여전히 사용)

- [ ] **Step 2: party/FollowBoard.tsx에 useAuthGuard 적용**

동일 패턴. `getCookie` + 인라인 스낵바 → `requireLogin()`:

```tsx
import { useAuthGuard } from '@/app/auth/hooks';

// 컴포넌트 내부
const { requireLogin } = useAuthGuard();

const onClickFollow = useCallback(() => {
  if (!requireLogin()) return;
  setIsFollowed(!isFollowed);
  setFollowCount(isFollowed ? followCount - 1 : followCount + 1);
  setSnackbar({
    show: true,
    type: isFollowed ? SNACKBAR_TYPE.CANCEL : SNACKBAR_TYPE.SUCCESS,
    message: isFollowed ? '해당 정당의 팔로우를 취소했습니다.' : '해당 정당을 팔로우했습니다.',
    duration: 3000,
  });
  mutationFollow.mutate(!isFollowed);
}, [isFollowed, setSnackbar, followCount, requireLogin]);
```

`getCookie`, `ACCESS_TOKEN` import 제거.

- [ ] **Step 3: congressman/FollowBoard.tsx에 useAuthGuard 적용**

party/FollowBoard.tsx와 동일 패턴. 메시지만 "정당" → "의원"으로 다름.

```tsx
import { useAuthGuard } from '@/app/auth/hooks';

// 컴포넌트 내부
const { requireLogin } = useAuthGuard();

const onClickFollow = useCallback(() => {
  if (!requireLogin()) return;
  setIsFollowed(!isFollowed);
  setFollowCount(isFollowed ? followCount - 1 : followCount + 1);
  setSnackbar({
    show: true,
    type: isFollowed ? SNACKBAR_TYPE.CANCEL : SNACKBAR_TYPE.SUCCESS,
    message: isFollowed ? '해당 의원의 팔로우를 취소했습니다.' : '해당 의원을 팔로우했습니다.',
    duration: 3000,
  });
  mutationFollow.mutate(!isFollowed);
}, [isFollowed, setSnackbar, followCount, requireLogin]);
```

`getCookie`, `ACCESS_TOKEN` import 제거.

- [ ] **Step 4: NotifcationButton.tsx에 useAuthGuard 적용**

`getCookie` + `useSnackbarStore` → `useAuthGuard`:

```tsx
// app/common/components/Button/NotifcationButton.tsx
'use client';

import Link from 'next/link';
import { IconNotification } from '@/public/svgs';
import { useGetNotificationCount } from '@/app/notification/hooks';
import { useAuthGuard } from '@/app/auth/hooks';
import { Button } from '@/app/common/components/ui/button';

export default function NotificationButton() {
  const { isAuthenticated, requireLogin } = useAuthGuard();
  const { data: notificationCount } = useGetNotificationCount({
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <Button variant="ghost" size="icon" onClick={() => requireLogin()}>
        <IconNotification />
      </Button>
    );
  }

  const hasNotification = notificationCount && notificationCount.notification_count > 0;

  return (
    <Link href="/notification">
      <div className="relative">
        <IconNotification />
        {hasNotification && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />}
      </div>
    </Link>
  );
}
```

- [ ] **Step 5: MyPageContent.tsx에 useAuthGuard 적용**

`useEffect` 내 인증 체크 → `useAuthGuard` + `useEffect`에서 리다이렉트만.
**참고:** 서버 가드(`requireAuth`)가 이미 페이지를 보호하므로 이 클라이언트 가드는 폴백 역할 (예: 토큰 만료 후 hydration 사이 간극):

```tsx
// app/user/mypage/MyPageContent.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/app/auth/hooks';
import { CongressmanList, UserInfo, PartyList, BillContainer } from '@/app/user/components';

export default function MyPageContent() {
  const router = useRouter();
  const { isAuthenticated, requireLogin } = useAuthGuard();

  useEffect(() => {
    if (!isAuthenticated) {
      requireLogin();
      router.push('/auth/login');
    }
  }, [isAuthenticated, requireLogin, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col gap-8 h-full lg:flex-row md:items-center lg:items-start lg:justify-center lg:mt-10 lg:mx-auto lg:ml-10 xl:ml-0">
      <UserInfo />
      <div className="flex flex-col gap-8 h-full">
        <PartyList />
        <hr className="mx-[30px] border-[#E0E0E0] dark:border-dark-l lg:border-transparent dark:lg:border-transparent" />
        <CongressmanList />
        <hr className="mx-[30px] border-[#E0E0E0] dark:border-dark-l lg:border-transparent dark:lg:border-transparent" />
        <BillContainer />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: typecheck 및 lint 확인**

Run: `npm run typecheck && npm run lint`
Expected: PASS

- [ ] **Step 7: 테스트 실행**

Run: `npm test`
Expected: PASS (기존 테스트 회귀 없음 확인)

- [ ] **Step 8: Commit**

```bash
git add app/bill/components/Bill.tsx app/party/components/FollowBoard.tsx app/congressman/components/FollowBoard.tsx app/common/components/Button/NotifcationButton.tsx app/user/mypage/MyPageContent.tsx
git commit -m "refactor: 5곳의 클라이언트 인증 체크를 useAuthGuard로 통합"
```

---

## 적용된 규칙 매핑

| Task | 적용 규칙 |
|------|-----------|
| Task 1 | DRY 원칙, 서버 컴포넌트 패턴 통일 |
| Task 2 | DRY 원칙, 커스텀 훅 추출 |
| Task 3 | 도메인 응집도, mutation 패턴 통일, 순환 참조 해결 |
| Task 4 | 관심사 분리 (컴포넌트 ↔ mutation 훅) |
| Task 5 | 관심사 분리 (API 유틸 ↔ auth 로직), SRP |
| Task 6 | DRY 원칙, 중복 제거 |

## 요약 — 개선 효과

| 영역 | Before | After |
|------|--------|-------|
| **서버 가드** | 2곳에서 동일 코드 반복 | `requireAuth()` 단일 유틸 |
| **클라이언트 인증 체크** | 5곳에서 `getCookie` + 스낵바 반복 | `useAuthGuard()` 단일 훅 |
| **로그아웃** | API, 훅, cookie 삭제가 3개 도메인에 분산 | auth 도메인에 응집, caller의 `onSuccess` 정상 호출 |
| **회원 탈퇴** | cookie 삭제가 컴포넌트에 위치 | mutation 훅에 내장 |
| **API 인터셉터** | auth 로직이 `api.ts`에 결합 (20줄) | `createAuthErrorHandler`로 분리 |
| **Providers** | 3가지 관심사 혼재 | `AuthEventListener` 독립 컴포넌트 |
| **Query Key** | `userKeys`가 hooks 파일에 정의 | `query-keys.ts`로 분리 (순환 참조 해결) |

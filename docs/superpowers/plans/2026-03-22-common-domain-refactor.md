# Common 도메인 코드 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `app/common/` 도메인의 타입 안전성, React 규칙 준수, 코드 품질을 개선한다.

**Architecture:** API 레이어의 `as any`와 누락된 return을 수정하고, sortByParty의 타입 안전성을 확보하며, Snackbar에 구조화된 action 필드를 추가하고, NotificationButton의 Rules of Hooks 위반을 수정한다. 소규모 개선(getTimeRemaining, GoToTopButton, auth-events)은 하나의 태스크로 묶는다.

**Tech Stack:** Next.js 15, React 19, TypeScript strict, Zustand, Axios, Zod

**Spec:** `docs/superpowers/specs/2026-03-22-common-domain-refactor-design.md`

---

## File Structure

### 수정 대상 파일

| 파일                                                 | 책임                      | 변경 내용                                                       |
| ---------------------------------------------------- | ------------------------- | --------------------------------------------------------------- |
| `app/common/lib/api.ts`                              | Axios 인스턴스 + 인터셉터 | `as any` 제거, 누락 return, structuredClone, non-null assertion |
| `app/common/validation/api.schema.ts`                | API 에러 추출             | `as any` → `isAxiosError`                                       |
| `app/common/utils/sortByParty.ts`                    | 정당별 발의자 그룹핑      | 타입 명시, 변수명 수정, Array.of 제거                           |
| `app/common/store/snackbar.ts`                       | Zustand snackbar 스토어   | `action` 필드 추가                                              |
| `app/common/components/Snackbar/Snackbar.tsx`        | 스낵바 UI                 | 하드코딩 메시지 → action 기반 렌더링                            |
| `app/common/components/Button/NotifcationButton.tsx` | 알림 버튼                 | 조건부 훅 → enabled 옵션, ESLint suppress 제거                  |
| `app/common/utils/getTimeRemaining.ts`               | 상대 시간 표시            | nested ternary → early return, ESLint suppress 제거             |
| `app/common/components/Button/GoToTopButton.tsx`     | 맨 위로 버튼              | passive 스크롤 리스너                                           |
| `app/common/lib/auth-events.ts`                      | 인증 이벤트 버스          | 모듈 스코프 변수, ESLint suppress 제거                          |

### 영향 받는 소비자 파일 (action 마이그레이션)

| 파일                                         | action 추가 | 이유                    |
| -------------------------------------------- | ----------- | ----------------------- |
| `app/bill/components/Bill.tsx`               | 필요        | snackbar만 표시         |
| `app/party/components/FollowBoard.tsx`       | 필요        | snackbar만 표시         |
| `app/congressman/components/FollowBoard.tsx` | 필요        | snackbar만 표시         |
| `app/following/page.tsx`                     | 불필요      | router.push로 직접 이동 |
| `app/user/mypage/MyPageContent.tsx`          | 불필요      | router.push로 직접 이동 |

---

## Task 1: api.ts `as any` 제거 + 누락 return + structuredClone

**Files:**

- Modify: `app/common/lib/api.ts`

**배경:** 응답 인터셉터에서 `as any`, request 에러 인터셉터에서 `return` 누락, token reissue에서 lodash `cloneDeep` 사용.

- [ ] **Step 1: 응답 인터셉터 `as any` 제거 (L42)**

```tsx
// Before
const payload = response.data as any;

// After — 타입 인터페이스 정의 + as any 제거
interface ApiResponse<T = unknown> {
  status: number;
  code: string;
  message: string;
  data: T;
}

// 인터셉터 내부:
const payload = response.data;
if (payload && typeof payload === 'object' && 'data' in payload) {
  return (payload as ApiResponse).data;
}
return payload;
```

`ApiResponse` 인터페이스는 파일 상단에 정의.

- [ ] **Step 2: request 에러 인터셉터 `return` 추가 (L36)**

```tsx
// Before
(error: AxiosError) => {
  Promise.reject(error);
},

// After
(error: AxiosError) => {
  return Promise.reject(error);
},
```

**동작 변경:** 기존에 묵묵히 무시되던 request 에러가 정상 전파됨.

- [ ] **Step 3: lodash → shallow spread (L55)**

`structuredClone`은 Axios config의 함수 프로퍼티(`transformRequest` 등)에서 `DataCloneError`를 발생시키므로 사용 불가. token reissue 재시도에서는 `headers.Authorization`만 변경하므로 shallow spread로 충분.

```tsx
// Before
import _ from 'lodash';
// ...
const newConfig = _.cloneDeep(response!.config);

// After
const newConfig = { ...response!.config, headers: { ...response!.config.headers } };
```

`import _ from 'lodash'` 제거. `import qs from 'qs'`도 L20에서만 사용되므로 유지.

- [ ] **Step 4: non-null assertion 제거 (L26, L56)**

```tsx
// L26 — request interceptor
// Before
const accessToken = getCookie(ACCESS_TOKEN)!;
// After
const accessToken = getCookie(ACCESS_TOKEN);
// L28에서 이미 null 체크하므로 ! 불필요

// L56 — 401 handler 내부
// Before
const accessToken = getCookie(ACCESS_TOKEN)!;
newConfig.headers.Authorization = `Bearer ${accessToken}`;
// After
const accessToken = getCookie(ACCESS_TOKEN);
if (accessToken) {
  newConfig.headers.Authorization = `Bearer ${accessToken}`;
}
```

- [ ] **Step 5: typecheck 확인**

Run: `npm run typecheck`
Expected: 기존 에러만 존재, 신규 에러 없음

- [ ] **Step 6: Commit**

```bash
git add app/common/lib/api.ts
git commit -m "fix: api 인터셉터 as any 제거, 누락된 return 추가, lodash→structuredClone"
```

---

## Task 2: api.schema.ts `as any` → isAxiosError

**Files:**

- Modify: `app/common/validation/api.schema.ts`

- [ ] **Step 1: extractApiMessage 수정**

```tsx
// Before
import { z } from 'zod';

export function extractApiMessage(error: unknown, fallback = '요청에 실패했습니다.'): string {
  const data = (error as any)?.response?.data;
  const parsed = ApiErrorSchema.safeParse(data);
  return parsed.success ? (parsed.data.message ?? fallback) : fallback;
}

// After
import { z } from 'zod';
import { isAxiosError } from 'axios';

export function extractApiMessage(error: unknown, fallback = '요청에 실패했습니다.'): string {
  const data = isAxiosError(error) ? error.response?.data : undefined;
  const parsed = ApiErrorSchema.safeParse(data);
  return parsed.success ? (parsed.data.message ?? fallback) : fallback;
}
```

- [ ] **Step 2: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS (기존 에러만)

- [ ] **Step 3: Commit**

```bash
git add app/common/validation/api.schema.ts
git commit -m "refactor: extractApiMessage as any 제거, isAxiosError 타입 가드 적용"
```

---

## Task 3: sortByParty.ts 타입 안전성 + 가독성

**Files:**

- Modify: `app/common/utils/sortByParty.ts`

**배경:** `any` 타입, forEach 파라미터 이름 혼동, 불필요한 `Array.of`, 반환 타입 미지정.

- [ ] **Step 1: sortByParty 전체 교체**

```tsx
import type { z } from 'zod';
import type { PublicProposerSchema } from '@/app/bill/validation';

type PublicProposer = z.infer<typeof PublicProposerSchema>;

interface PartyGroup {
  party: string;
  proposers: string[][];
}

export default function sortByParty({ publicProposerList }: { publicProposerList: PublicProposer[] }): PartyGroup[] {
  const partyMap = new Map<string, string[][]>();

  publicProposerList
    .toSorted((a, b) => a.public_proposer_party_id - b.public_proposer_party_id)
    .forEach((proposer) => {
      const { public_proposer_id: id, public_proposer_name: name } = proposer;
      const { public_proposer_party_name: partyName } = proposer;
      const { public_proposer_party_id: partyId, public_proposer_party_image_url: partyLogo } = proposer;

      const existing = partyMap.get(partyName);
      if (existing) {
        existing.push([id, name]);
      } else {
        partyMap.set(partyName, [
          [String(partyId), partyLogo],
          [id, name],
        ]);
      }
    });

  const result: PartyGroup[] = [];
  partyMap.forEach((proposers, party) => {
    result.push({ party, proposers });
  });

  return result;
}
```

주요 변경:

- `any` → `PartyGroup[]` 타입 명시
- `Map.forEach` 파라미터 이름 올바르게 수정 (`proposers`, `party`)
- `Array.of` 제거 → `existing.push()` 직접 사용
- `partyId` `number` → `String(partyId)` (소비자가 `string[][]`로 기대)
- 반환 타입 `PartyGroup[]` 명시
- Zod 추론 타입 적용

- [ ] **Step 2: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/common/utils/sortByParty.ts
git commit -m "refactor: sortByParty 타입 안전성 개선, any 제거, forEach 파라미터명 수정"
```

---

## Task 4: Snackbar action 필드 추가 + 소비자 마이그레이션

**Files:**

- Modify: `app/common/store/snackbar.ts`
- Modify: `app/common/components/Snackbar/Snackbar.tsx`
- Modify: `app/bill/components/Bill.tsx` (또는 BillCardFooter.tsx — 선행 리팩토링에 따라)
- Modify: `app/party/components/FollowBoard.tsx`
- Modify: `app/congressman/components/FollowBoard.tsx`

**배경:** Snackbar.tsx에서 `message === '로그인이 필요한 서비스입니다.'` 문자열 비교로 로그인 링크를 표시. 구조화된 `action` 필드로 교체.

- [ ] **Step 1: snackbar store에 action 필드 추가**

```tsx
// app/common/store/snackbar.ts

export interface SnackbarState {
  show: boolean;
  type: SnackbarType;
  message: string;
  duration?: number | null;
  action?: { label: string; href: string } | null;
}

// initialState에 추가:
const initialState: SnackbarState = {
  show: false,
  type: SNACKBAR_TYPE.DEFAULT,
  message: '',
  duration: 3000,
  action: null,
};

// setSnackbar 수정:
setSnackbar: (next) =>
  set((state) => ({
    ...state,
    show: next.show ?? true,
    type: next.type ?? state.type,
    message: next.message,
    duration: next.duration ?? state.duration,
    action: next.action ?? null,
  })),
```

- [ ] **Step 2: Snackbar.tsx에서 하드코딩 메시지 비교 → action 사용**

```tsx
// Before (L47-51)
{
  message === '로그인이 필요한 서비스입니다.' && (
    <Link href="/auth/login" className="mr-2">
      <p className="text-xs font-medium text-white underline lg:text-sm">로그인 하기</p>
    </Link>
  );
}

// After
const action = useSnackbarStore((s) => s.action);
// ... (기존 selector 아래에 추가)

// JSX:
{
  action && (
    <Link href={action.href} className="mr-2">
      <p className="text-xs font-medium text-white underline lg:text-sm">{action.label}</p>
    </Link>
  );
}
```

- [ ] **Step 3: 소비자 파일에 action 추가 — Bill.tsx (또는 BillCardFooter.tsx)**

`'로그인이 필요한 서비스입니다.'` 메시지를 사용하는 setSnackbar 호출에 action 추가:

```tsx
setSnackbar({
  show: true,
  type: SNACKBAR_TYPE.ERROR,
  message: '로그인이 필요한 서비스입니다.',
  action: { label: '로그인 하기', href: '/auth/login' },
  duration: 3000,
});
```

**참고:** 선행 리팩토링(bill-domain-refactor)에서 Bill.tsx가 BillCardFooter.tsx로 분리되었을 수 있음. 실제 파일 확인 후 수정.

- [ ] **Step 4: 소비자 파일에 action 추가 — party/congressman FollowBoard**

`app/party/components/FollowBoard.tsx`와 `app/congressman/components/FollowBoard.tsx`에서 동일하게 action 추가.

- [ ] **Step 5: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/common/store/snackbar.ts app/common/components/Snackbar/Snackbar.tsx app/bill/components/Bill.tsx app/party/components/FollowBoard.tsx app/congressman/components/FollowBoard.tsx
git commit -m "feat: Snackbar에 구조화된 action 필드 추가, 하드코딩 메시지 비교 제거"
```

---

## Task 5: NotificationButton Rules of Hooks 수정

**Files:**

- Modify: `app/common/components/Button/NotifcationButton.tsx`

**배경:** 조건부 early return 이후에 `useGetNotificationCount` 호출 — Rules of Hooks 위반. ESLint suppress로 무시 중.

**의존:** Task 4 (snackbar action 필드)가 선행되어야 함.

- [ ] **Step 1: useGetNotificationCount가 enabled 옵션을 지원하는지 확인**

`app/notification/hooks/` 또는 `app/notification/services/queries.ts`에서 `useGetNotificationCount` 구현 확인. React Query 기반이면 `enabled` 옵션 지원됨.

- [ ] **Step 2: NotifcationButton.tsx 전체 교체**

```tsx
'use client';

import Link from 'next/link';
import { IconNotification } from '@/public/svgs';
import { useGetNotificationCount } from '@/app/notification/hooks';
import { getCookie } from 'cookies-next';
import { ACCESS_TOKEN, SNACKBAR_TYPE } from '@/app/common/constants';
import { useSnackbarStore } from '@/app/common/store';
import { Button } from '@/app/common/components/ui/button';

export default function NotificationButton() {
  const accessToken = getCookie(ACCESS_TOKEN);
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const { data: notificationCount } = useGetNotificationCount({
    enabled: !!accessToken,
  });

  if (!accessToken) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          setSnackbar({
            show: true,
            type: SNACKBAR_TYPE.ERROR,
            message: '로그인이 필요한 서비스입니다.',
            action: { label: '로그인 하기', href: '/auth/login' },
            duration: 3000,
          })
        }>
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

주요 변경:

- 훅을 컴포넌트 최상단에서 무조건 호출, `enabled: !!accessToken`으로 비인증 시 fetch 방지
- ESLint suppress 2건 제거 (`react-hooks/rules-of-hooks`, `jsx-a11y/anchor-is-valid`)
- `Link href="#"` → `Button` 컴포넌트
- 조건부 렌더링으로 알림 dot 표시 통합

- [ ] **Step 3: useGetNotificationCount가 enabled를 지원하지 않는 경우**

`useSuspenseQuery`를 사용하는 경우 `enabled` 미지원. 이 경우:

- `useQuery`로 전환하거나
- 래퍼 훅에서 `enabled` 옵션을 passthrough하도록 수정

- [ ] **Step 4: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/common/components/Button/NotifcationButton.tsx
git commit -m "fix: NotificationButton 조건부 훅 호출 제거 (Rules of Hooks)"
```

---

## Task 6: getTimeRemaining, GoToTopButton, auth-events 소규모 개선

**Files:**

- Modify: `app/common/utils/getTimeRemaining.ts`
- Modify: `app/common/components/Button/GoToTopButton.tsx`
- Modify: `app/common/lib/auth-events.ts`

- [ ] **Step 1: getTimeRemaining — early return + ESLint suppress 제거**

```tsx
export default function getTimeRemaining(time: string): string {
  const timeDiff = Date.now() - new Date(time).getTime();
  const minutes = Math.floor(timeDiff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 30) return time.split('T')[0];
  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  return `${minutes}분 전`;
}
```

변경: `time.replace('T', ' ')` 제거, nested ternary → early return, ESLint suppress 2건 제거.
**동작 변경:** 30일 임계값이 `hours > 720` (30일 초과)에서 `days >= 30` (30일 이상)으로 미세하게 변경됨. 기존과 실질적 차이 미미.

- [ ] **Step 2: GoToTopButton — passive 스크롤 리스너**

```tsx
// Before (L25)
window.addEventListener('scroll', handleScroll);

// After
window.addEventListener('scroll', handleScroll, { passive: true });
```

- [ ] **Step 3: auth-events — 모듈 스코프 변수, ESLint suppress 제거**

```tsx
// app/common/lib/auth-events.ts — 전체 교체
// Client-side auth event bus. On server, it's a no-op.

type AuthEventType = 'auth:logout' | 'auth:token-reissued';

let authEventTarget: EventTarget | undefined;

const getTarget = (): EventTarget | null => {
  if (typeof window === 'undefined') return null;
  if (!authEventTarget) {
    authEventTarget = new EventTarget();
  }
  return authEventTarget;
};

const dispatch = (type: AuthEventType): void => {
  getTarget()?.dispatchEvent(new CustomEvent(type));
};

const subscribe = (type: AuthEventType, listener: () => void): (() => void) => {
  const target = getTarget();
  if (!target) return () => {};
  const handler = () => listener();
  target.addEventListener(type, handler);
  return () => target.removeEventListener(type, handler);
};

export const authEvents = {
  emitLogout: () => dispatch('auth:logout'),
  emitTokenReissued: () => dispatch('auth:token-reissued'),
  onLogout: (listener: () => void) => subscribe('auth:logout', listener),
  onTokenReissued: (listener: () => void) => subscribe('auth:token-reissued', listener),
};
```

변경: `/* eslint-disable no-underscore-dangle */` 제거, `declare global` 제거, `Window.__AUTH_EVENT_TARGET__` → 모듈 스코프 `authEventTarget`.

- [ ] **Step 4: typecheck 및 lint 확인**

Run: `npm run typecheck && npm run lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/common/utils/getTimeRemaining.ts app/common/components/Button/GoToTopButton.tsx app/common/lib/auth-events.ts
git commit -m "refactor: getTimeRemaining early return, GoToTopButton passive 리스너, auth-events 모듈 스코프"
```

---

## 적용 규칙 매핑

| Task   | 적용 규칙                                                                       |
| ------ | ------------------------------------------------------------------------------- |
| Task 1 | TypeScript strict, `return` 누락 수정, `bundle-defer-third-party` (lodash 제거) |
| Task 2 | TypeScript strict, Axios 타입 가드                                              |
| Task 3 | TypeScript strict, `js-tosorted-immutable`, 타입 일관성                         |
| Task 4 | `patterns-explicit-variants`, 데이터 기반 렌더링                                |
| Task 5 | Rules of Hooks, `architecture-avoid-boolean-props`                              |
| Task 6 | `client-passive-event-listeners`, ESLint suppress 제거, 가독성                  |

## 요약 — 개선 효과

| 영역                | Before                                            | After                                          |
| ------------------- | ------------------------------------------------- | ---------------------------------------------- |
| **타입 안전성**     | `as any` 3건 (api.ts, api.schema.ts, sortByParty) | 0건                                            |
| **React 규칙**      | Rules of Hooks 위반 1건                           | 위반 없음                                      |
| **ESLint suppress** | 6건                                               | 0건                                            |
| **코드 품질**       | lodash 의존, 하드코딩 메시지 비교, nested ternary | structuredClone, 구조화된 action, early return |
| **성능**            | scroll non-passive                                | passive 리스너                                 |
| **버그**            | request interceptor 에러 무시                     | 에러 정상 전파                                 |

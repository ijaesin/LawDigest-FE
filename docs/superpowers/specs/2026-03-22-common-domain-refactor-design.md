# Common 도메인 코드 개선 Design Spec

**Date:** 2026-03-22
**Goal:** `app/common/` 도메인의 타입 안전성, React 규칙 준수, 코드 품질을 개선한다.

**Constraint:** main-feed-refactor 플랜이 수정하는 파일(`useIntersect.ts`, `useTabType.ts`)은 직접 수정하지 않는다.

**Tech Stack:** Next.js 15, React 19, TypeScript strict, Zustand, Axios, Zod

---

## 수정 대상 파일

| 파일                                                 | 변경 요약                                           |
| ---------------------------------------------------- | --------------------------------------------------- |
| `app/common/components/Button/NotifcationButton.tsx` | 조건부 훅 호출 제거 (Rules of Hooks)                |
| `app/common/utils/sortByParty.ts`                    | 타입 안전성, 변수 이름 수정, `Array.of` 제거        |
| `app/common/lib/api.ts`                              | `as any` 제거, 누락 return, lodash→spread           |
| `app/common/validation/api.schema.ts`                | `as any` → `isAxiosError` 타입 가드                 |
| `app/common/components/Snackbar/Snackbar.tsx`        | 하드코딩 메시지 비교 → 구조화된 action              |
| `app/common/store/snackbar.ts`                       | action 필드 추가                                    |
| `app/common/utils/getTimeRemaining.ts`               | nested ternary → early return, ESLint suppress 제거 |
| `app/common/components/Button/GoToTopButton.tsx`     | passive 스크롤 리스너                               |
| `app/common/lib/auth-events.ts`                      | ESLint suppress 제거, Symbol 기반 전역 키           |

---

## 영역 1: NotificationButton — Rules of Hooks 위반

### 현재 문제

```tsx
// NotifcationButton.tsx
export default function NotificationButton() {
  const accessToken = getCookie(ACCESS_TOKEN);
  if (!accessToken) {
    return (...); // early return
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: notificationCount } = useGetNotificationCount();
```

React의 Rules of Hooks를 위반: 조건부 early return 이후에 훅을 호출.

### 설계

`useGetNotificationCount`가 `enabled` 옵션을 지원하는지 확인 후:

- `enabled: !!accessToken` 옵션으로 비인증 시 fetch를 방지
- 훅을 컴포넌트 최상단에서 무조건 호출
- ESLint suppress 제거
- `Link href="#"` + preventDefault → Button 또는 조건부 렌더링으로 교체

```tsx
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

**주의:** `useGetNotificationCount`가 `enabled` 옵션을 지원하는지 확인 필요. React Query 기반이면 지원됨.

---

## 영역 2: sortByParty.ts — 타입 + 가독성

### 현재 문제

```tsx
const newProposerList: any = []; // L14: 타입 없음
Array.of([proposerId, proposerName]); // L24: 불필요한 래퍼
map.forEach((key, value) => {
  // L36: 파라미터 이름 반대
  newProposerList.push({ party: value, proposers: key });
});
```

`Map.forEach` 콜백은 `(value, key, map)` 순서인데, `key`와 `value` 변수 이름이 반대로 되어 있음. 실제 동작은 올바르지만 가독성이 매우 나쁨.

### 설계

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

변경:

- `any` → `PartyGroup[]` 타입 명시
- `Map.forEach` 파라미터 이름 수정 (`proposers`, `party`)
- `Array.of` 제거 → `existing.push()` 직접 사용
- 반환 타입 명시
- **`partyId` 타입 수정:** `number` → `String(partyId)` (`string`). 소비자(`ProposerList.tsx`)가 이미 `string[][]`로 타입 선언하고 있으므로, 기존에 `any`가 숨기던 타입 불일치를 수정하는 것.
- Zod 추론 타입 사용 (선택적 — 현재 인라인 타입과 호환 여부에 따라)

---

## 영역 3: api.ts — `as any` + 누락 return + lodash

### 3-1. `as any` 제거 (L42)

```tsx
// Before
const payload = response.data as any;

// After
interface ApiResponse<T = unknown> {
  status: number;
  code: string;
  message: string;
  data: T;
}

const payload = response.data;
if (payload && typeof payload === 'object' && 'data' in payload) {
  return (payload as ApiResponse).data;
}
return payload;
```

### 3-2. 누락된 return (L36) — 동작 변경 수반

```tsx
// Before
(error: AxiosError) => {
  Promise.reject(error);  // unhandled promise — 에러가 묵묵히 무시됨
},

// After
(error: AxiosError) => {
  return Promise.reject(error);
},
```

**주의: 동작 변경.** 기존에는 request interceptor 에러가 무시되었으나, 수정 후 에러가 정상적으로 전파됨. 이것이 올바른 동작이며, 기존에 숨겨졌던 에러가 노출될 수 있음.

### 3-3. lodash → structuredClone (L55)

Axios config는 `params`, `transformRequest` 등 중첩 참조가 있어 shallow spread로는 불충분. `structuredClone`(Node 17+, 모든 최신 브라우저 지원)을 사용.

```tsx
// Before
const newConfig = _.cloneDeep(response!.config);

// After
const newConfig = structuredClone(response!.config);
```

`import _ from 'lodash'` 제거. api.ts가 유일한 lodash 사용처이므로 안전.

### 3-4. non-null assertion 제거 (L26)

```tsx
// Before
const accessToken = getCookie(ACCESS_TOKEN)!;

// After
const accessToken = getCookie(ACCESS_TOKEN);
```

이미 L28에서 null 체크를 하므로 `!`가 불필요.

---

## 영역 4: api.schema.ts — `as any` → isAxiosError

```tsx
// Before
const data = (error as any)?.response?.data;

// After
import { isAxiosError } from 'axios';

export function extractApiMessage(error: unknown, fallback = '요청에 실패했습니다.'): string {
  const data = isAxiosError(error) ? error.response?.data : undefined;
  const parsed = ApiErrorSchema.safeParse(data);
  return parsed.success ? (parsed.data.message ?? fallback) : fallback;
}
```

---

## 영역 5: Snackbar — 구조화된 action

### 현재 문제

```tsx
// Snackbar.tsx L47
{
  message === '로그인이 필요한 서비스입니다.' && <Link href="/auth/login">...로그인 하기...</Link>;
}
```

### 설계

snackbar store에 `action` 필드 추가:

```tsx
// store/snackbar.ts
export interface SnackbarState {
  show: boolean;
  type: SnackbarType;
  message: string;
  duration?: number | null;
  action?: { label: string; href: string } | null;
}
```

Snackbar 컴포넌트에서 action 사용:

```tsx
// Snackbar.tsx
{
  action && (
    <Link href={action.href} className="mr-2">
      <p className="text-xs font-medium text-white underline lg:text-sm">{action.label}</p>
    </Link>
  );
}
```

기존 호출처 마이그레이션:

| 파일                                                 | action 추가 여부 | 이유                                   |
| ---------------------------------------------------- | ---------------- | -------------------------------------- |
| `app/common/components/Button/NotifcationButton.tsx` | 추가             | snackbar만 표시                        |
| `app/bill/components/Bill.tsx`                       | 추가             | snackbar만 표시                        |
| `app/party/components/FollowBoard.tsx`               | 추가             | snackbar만 표시                        |
| `app/congressman/components/FollowBoard.tsx`         | 추가             | snackbar만 표시                        |
| `app/following/page.tsx`                             | 불필요           | `router.push('/auth/login')` 직접 호출 |
| `app/user/mypage/MyPageContent.tsx`                  | 불필요           | `router.push('/auth/login')` 직접 호출 |

**구현 순서:** Area 5 (store 변경)를 Area 1 (NotificationButton) 이전에 구현해야 TypeScript 에러 방지.

---

## 영역 6: getTimeRemaining.ts — early return

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

변경:

- `time.replace('T', ' ')` → `new Date(time)` 직접 파싱
- nested ternary → early return
- ESLint suppress 2건 제거
- `time.split(' ')[0]` → `time.split('T')[0]` (ISO format 기준)

---

## 영역 7: GoToTopButton — passive 리스너

```tsx
// Before
window.addEventListener('scroll', handleScroll);

// After
window.addEventListener('scroll', handleScroll, { passive: true });
```

cleanup에도 동일하게 적용 (removeEventListener에는 필요 없지만 일관성).

---

## 영역 8: auth-events.ts — ESLint suppress 제거

TypeScript의 Window interface에 Symbol 인덱스 시그니처를 추가할 수 없으므로, 모듈 스코프 변수를 사용하는 접근법을 채택. auth-events.ts는 이미 모듈 싱글턴이므로 Window 전역 변수가 불필요.

```tsx
// Before
/* eslint-disable no-underscore-dangle */
declare global {
  interface Window {
    __AUTH_EVENT_TARGET__?: EventTarget;
  }
}
const getTarget = (): EventTarget | null => {
  if (typeof window === 'undefined') return null;
  if (!window.__AUTH_EVENT_TARGET__) {
    window.__AUTH_EVENT_TARGET__ = new EventTarget();
  }
  return window.__AUTH_EVENT_TARGET__;
};

// After
let authEventTarget: EventTarget | undefined;

const getTarget = (): EventTarget | null => {
  if (typeof window === 'undefined') return null;
  if (!authEventTarget) {
    authEventTarget = new EventTarget();
  }
  return authEventTarget;
};
```

ESLint suppress, global declare, underscore dangle 모두 제거. 모듈 스코프 변수는 HMR 시 모듈이 재로드되면 초기화되지만, auth event는 일시적 통신이므로 문제 없음.

---

## 변경하지 않는 것

| 대상                                    | 이유                                   |
| --------------------------------------- | -------------------------------------- |
| `useIntersect.ts` / `useTabType.ts`     | main-feed-refactor 커버                |
| Header.tsx boolean props 구조           | 아키텍처 변경 필요, 별도 작업          |
| Nav.tsx / Header.tsx active 로직 중복   | desktop/mobile 구현이 다름             |
| `snackbar.ts` `show: next.show ?? true` | 현재 패턴에서 정상                     |
| `getMetadata.ts` title 새니타이제이션   | Next.js metadata API가 자동 이스케이프 |

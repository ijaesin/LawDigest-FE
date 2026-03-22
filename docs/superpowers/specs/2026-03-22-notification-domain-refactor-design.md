# Notification 도메인 코드 개선 Design Spec

**Date:** 2026-03-22
**Goal:** `app/notification/` 도메인의 모듈 구조, 데이터 흐름, 타입 안전성, Next.js/React 패턴을 프로젝트 표준에 맞게 개선한다.

**Constraint:** common-domain-refactor에서 수정하는 `NotifcationButton.tsx`는 본 스펙에서 직접 수정하지 않는다 (이미 처리됨).

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, TypeScript strict, Tailwind CSS, shadcn/ui

---

## 수정 대상 파일

| 파일 | 변경 요약 |
|------|-----------|
| `app/notification/services/index.ts` | `services/apis.ts`로 이동 후 삭제 |
| `app/notification/hooks/index.ts` | `services/queries.ts` + `services/query-keys.ts`로 분리, re-export로 변경 |
| `app/notification/components/NotificationList.tsx` | 파생 상태 안티패턴 제거, 반복 JSX 추출, useCallback 정리 |
| `app/notification/components/NotificationTopThree.tsx` | `onClickRead` 시그니처 불일치 수정, useCallback 제거 |
| `app/notification/components/NotificationItem.tsx` | 콜백 Props 시그니처 통일 |
| `app/notification/components/index.tsx` | 내부 컴포넌트 export 제거 |
| `app/notification/page.tsx` | 서버 컴포넌트 auth guard 전환 |

## 신규 생성 파일

| 파일 | 책임 |
|------|------|
| `app/notification/services/apis.ts` | API 호출 함수 (Zod 검증 포함) |
| `app/notification/services/queries.ts` | React Query 훅 (query + mutation) |
| `app/notification/services/query-keys.ts` | 쿼리 키 팩토리 |
| `app/notification/components/NotificationContent.tsx` | 클라이언트 사이드 레이아웃 (page.tsx에서 분리) |

## 삭제 파일

| 파일 | 사유 |
|------|------|
| `app/notification/services/index.ts` | `services/apis.ts`로 이동 |

---

## 영역 1: services 구조 분리 (apis.ts + queries.ts + query-keys.ts)

### 현재 문제

프로젝트 표준(bill, following 모듈)은 `services/apis.ts` + `services/queries.ts` + `services/query-keys.ts`로 분리한다. notification은 `services/index.ts`에 API 호출, `hooks/index.ts`에 쿼리 키+훅이 함께 있어 일관성이 떨어진다.

### 설계

**query-keys.ts:**

```ts
export const notificationKeys = {
  root: () => ['notifications'] as const,
  list: () => [...notificationKeys.root()] as const,
  count: () => [...notificationKeys.root(), 'count'] as const,
  topThree: () => [...notificationKeys.root(), 'top3'] as const,
};
```

**query-keys.ts:** `'use client'` 없이 생성 — 서버 컴포넌트(`page.tsx`)에서 직접 import 가능.

**apis.ts:** `services/index.ts` 내용을 그대로 이동.

**queries.ts:** `'use client'` 포함. `hooks/index.ts`에서 React Query 훅과 mutation 훅 이동. `invalidateNotificationQueries` 헬퍼 포함.

**hooks/index.ts:** `'use client'` 포함 re-export 전용으로 변경하여 기존 import 경로 호환 유지.

**page.tsx:** `notificationKeys`는 `services/query-keys.ts`에서 직접 import (서버 컴포넌트 호환).

---

## 영역 2: NotificationList 파생 상태 안티패턴 제거

### 현재 문제

```tsx
const [listByDateStatus, setListByDateStatus] = useState(() =>
  notifications ? Array.from(Array(3), (v, i) => /* 중첩 삼항 + filter */) : initialData
);

useEffect(() => {
  if (notifications) {
    setListByDateStatus(/* 동일한 로직 반복 */);
  }
}, [notifications]);
```

- `useState` + `useEffect`로 React Query `data`를 복사 → 파생 상태 안티패턴
- 66줄 `initialData` 더미 데이터 불필요
- 동일 로직이 `useState` 초기화와 `useEffect` 내부에 중복
- `eslint-disable-next-line no-nested-ternary` ESLint suppress 필요

### 설계

`useMemo`로 직접 계산:

```tsx
const DATE_SECTIONS = ['지난 한 주', '지난 한 달', '지난 알림'] as const;

const groupedNotifications = useMemo(
  () => DATE_SECTIONS.map((label) =>
    (notifications ?? []).filter((n) => getDateStatus(n.created_date) === label)
  ),
  [notifications],
);
```

- `initialData` 제거
- `useEffect` 제거
- ESLint suppress 제거
- `DATE_SECTIONS` 상수로 반복 JSX 추출 가능

---

## 영역 3: 반복 JSX 섹션 추출

### 현재 문제

3개 날짜 그룹(지난 한 주, 지난 한 달, 지난 알림)이 동일 구조로 복붙되어 있음. `Separator` 포함 약 60줄 반복.

### 설계

`DATE_SECTIONS`와 `groupedNotifications`를 활용하여 map 기반 렌더링:

```tsx
{DATE_SECTIONS.map((label, idx) => (
  <Fragment key={label}>
    {idx > 0 && <Separator className="my-6" />}
    <h2 className="text-xl font-semibold">{label}</h2>
    <div className="flex flex-col gap-3 md:gap-4">
      {groupedNotifications[idx].length === 0 ? (
        <p className="...">{label} 알림이 없습니다.</p>
      ) : (
        groupedNotifications[idx].map((notification) => (
          <NotificationItem key={notification.notification_id} {...notification} ... />
        ))
      )}
    </div>
  </Fragment>
))}
```

빈 상태 메시지도 "지난 한 주 알림이 없습니다" → `{label} 알림이 없습니다.`로 자연스럽게 통일 (기존: "지난 알림" 섹션만 "지난 알림이 없습니다."로 다른 패턴이지만 실제로 동일).

---

## 영역 4: NotificationItem 콜백 시그니처 통일

### 현재 문제

`NotificationItem`의 `onClickRead` prop:
```ts
onClickRead: (notificationId: number, isClickByButton: boolean) => void;
```

- `NotificationList`에서는 `isClickByButton`으로 스낵바 표시 여부를 분기
- `NotificationTopThree`에서는 `handleRead(notificationId)`만 전달 → `isClickByButton`이 항상 `undefined` (falsy)

`isClickByButton` 플래그는 "Link 클릭으로 읽음 처리"와 "드롭다운 메뉴에서 읽음 표시 클릭"을 구분하는 용도. 이 분기 로직은 `NotificationItem` 내부에서 결정되므로 부모가 알 필요 없다.

### 설계

콜백을 두 개로 분리:
- `onRead(notificationId: number)` — 읽음 처리 (스낵바 포함, 드롭다운 메뉴 클릭 시)
- `onNavigate?(notificationId: number)` — Link 클릭 시 읽음 처리 (스낵바 없음, 선택적)

또는 더 단순하게: `onClickRead`를 `(notificationId: number) => void` 단일 시그니처로 통일하고, 스낵바는 mutation의 `onSuccess`에서 항상 처리.

**채택: 단순 통일 접근법.** `NotificationList`에서 Link 클릭 시 스낵바를 보여주지 않는 것은 UX적으로 합리적이므로(페이지 이동 중 스낵바는 의미 없음), `onClickRead`는 드롭다운 메뉴 전용으로 하고 Link 클릭은 별도 `onNavigateRead` 콜백으로 분리:

```ts
// NotificationItem props
type NotificationItemProps = Notification & {
  onRead: (notificationId: number) => void;       // 드롭다운 "읽음 표시" 클릭
  onNavigateRead: (notificationId: number) => void; // Link 클릭 시 무음 읽음 처리
  onDelete: (notificationId: number) => void;      // 드롭다운 "삭제" 클릭
};
```

---

## 영역 5: page.tsx 서버 컴포넌트 auth guard

### 현재 문제

`page.tsx`는 서버 컴포넌트이지만 인증 검사가 없어 비인증 사용자도 알림 페이지에 접근 가능. API 호출은 실패하지만 빈 UI가 노출된다.

### 설계

following 도메인과 동일한 패턴 적용:

```tsx
// page.tsx (서버 컴포넌트)
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_TOKEN } from '@/app/common/constants';

export default async function NotificationPage() {
  const token = (await cookies()).get(ACCESS_TOKEN)?.value;
  if (!token) redirect('/auth/login');

  // prefetch + HydrationBoundary ...
}
```

기존 `NotificationList` 렌더링 부분을 `NotificationContent` 클라이언트 컴포넌트로 분리하여 page.tsx를 순수 서버 컴포넌트로 유지.

---

## 영역 6: barrel file 정리

### 현재 문제

```tsx
export { NotificationItem, NotificationList, NotificationTopThree };
```

`NotificationItem`은 `NotificationList`와 `NotificationTopThree` 내부에서만 사용 — 외부 export 불필요.

### 설계

```tsx
export { default as NotificationList } from './NotificationList';
export { default as NotificationTopThree } from './NotificationTopThree';
```

`NotificationItem`은 배럴에서 제거. `NotificationContent`는 `page.tsx`에서 직접 import하므로 배럴에 추가하지 않음.

---

## 영역 7: useCallback 의존성 정리

### 현재 문제

```tsx
const onClickRead = useCallback(
  (notificationId: number, isClickByButton: boolean) => {
    mutateRead.mutate(notificationId);
    // ...
  },
  [mutateRead], // ← mutation 객체 매 렌더 재생성
);
```

`useMutation` 반환값은 매 렌더마다 새 객체를 생성하므로 `useCallback`이 메모이제이션 효과를 갖지 못함.

### 설계

`useCallback`을 제거하고 인라인 함수 또는 일반 함수로 전환. `NotificationItem`은 `React.memo`를 사용하지 않으므로 `useCallback` 없어도 성능 차이 없음.

```tsx
const handleRead = (notificationId: number) => {
  mutateRead.mutate(notificationId);
  setSnackbar({ ... });
};
```

---

## 영역 8: Mutation 훅 `...options` 스프레드 순서 버그

### 현재 문제

모든 mutation 훅에서 `...options`가 `onSuccess`/`onError` **뒤에** 스프레드되어 있어, 소비자가 `onSuccess`를 전달하면 내부의 `invalidateNotificationQueries` 호출이 덮어씌워진다:

```tsx
return useMutation({
  mutationFn: (notificationId: number) => putNotificationRead(notificationId),
  onSuccess: (data, variables, context) => {
    invalidateNotificationQueries(qc);          // ← 이 콜백이
    options?.onSuccess?.(data, variables, context);
  },
  ...options,  // ← 여기서 덮어씌워짐!
});
```

`NotificationTopThree`가 `onSuccess`를 전달하므로, TopThree에서 읽음 처리 시 쿼리 무효화가 실행되지 않는 실제 버그.

### 설계

`...options`를 **먼저** 스프레드하고, `mutationFn`/`onSuccess`/`onError`를 뒤에 정의:

```tsx
return useMutation({
  ...options,                                    // 먼저 스프레드
  mutationFn: (id: number) => putNotificationRead(id),
  onSuccess: (data, variables, context) => {
    invalidateNotificationQueries(qc);
    options?.onSuccess?.(data, variables, context);  // 소비자 콜백 체이닝
  },
  onError: (error, variables, context) => {
    options?.onError?.(error, variables, context);
  },
});
```

4개 mutation 훅 모두 동일하게 수정.

---

## 영역 4 보충: NotificationTopThree 콜백 어댑테이션

`NotificationTopThree`도 새 콜백 시그니처(`onRead`, `onNavigateRead`, `onDelete`)에 맞게 수정:

- `onRead`: mutation `onSuccess`에서 스낵바 표시 (기존 동작 유지)
- `onNavigateRead`: 스낵바 없이 mutation만 호출 (무음 읽음 처리)
- `onDelete`: mutation `onSuccess`에서 스낵바 표시 (기존 동작 유지)
- `useCallback` 2개 제거 (NotificationList와 동일 사유)

---

## 설계 결정 요약

| 결정 사항 | 채택 | 대안 | 이유 |
|-----------|------|------|------|
| auth redirect 경로 | `/auth/login` | `/` (메인) | 사용자 지정 |
| 콜백 시그니처 | `onRead` + `onNavigateRead` + `onDelete` | 단일 `onClickRead(id, flag)` | 관심사 분리, 타입 안전성 |
| 날짜 그룹 | `useMemo` + `DATE_SECTIONS` 상수 | 컴포넌트 분리 | 오버엔지니어링 방지 |
| useCallback | 제거 | `useRef` 패턴 | memo 미사용 시 불필요 |
| NotificationContent | 신규 클라이언트 컴포넌트 | 기존 NotificationList 유지 | page.tsx를 순수 서버 컴포넌트로 |

---

## 적용 규칙 매핑

| 영역 | 적용 규칙 |
|------|-----------|
| 영역 1 | 프로젝트 표준 모듈 구조 일관성 (apis/queries/query-keys 분리) |
| 영역 2 | `rerender-derived-state-no-effect` — 파생 상태 안티패턴 제거 |
| 영역 3 | DRY 원칙 — 반복 JSX 추출 |
| 영역 4 | 타입 안전성 — 콜백 시그니처 통일 |
| 영역 5 | Next.js 서버 컴포넌트 auth guard |
| 영역 6 | 배럴 파일 public API 정리 |
| 영역 7 | 불필요한 `useCallback` 제거 |
| 영역 8 | Mutation `...options` 스프레드 순서 버그 수정 |

## 요약 — 개선 효과

| 영역 | Before | After |
|------|--------|-------|
| **인증 처리** | 서버 컴포넌트이지만 auth guard 없음 | `cookies()` + `redirect()` (즉시 이동) |
| **데이터 흐름** | `useState` + `useEffect` + 66줄 initialData | `useMemo` 직접 계산 |
| **JSX 구조** | 3개 날짜 섹션 복붙 (~60줄) | `DATE_SECTIONS.map()` (~15줄) |
| **콜백 타입** | `(id, isClickByButton)` 플래그 패턴 | `onRead`, `onNavigateRead`, `onDelete` 분리 |
| **모듈 구조** | hooks에 키+훅 혼재, services에 API만 | apis.ts + queries.ts + query-keys.ts 표준 분리 |
| **배럴 파일** | 내부 컴포넌트 포함 3개 export | 공개 컴포넌트 2개만 export |
| **메모이제이션** | 효과 없는 `useCallback` 6개 (List 4 + TopThree 2) | 불필요한 래핑 제거 |
| **Mutation 버그** | `...options` 스프레드가 `onSuccess` 덮어씌움 | 스프레드 순서 수정, 콜백 체이닝 |

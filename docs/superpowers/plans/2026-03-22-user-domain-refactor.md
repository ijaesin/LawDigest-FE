# User 도메인 코드 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** User 도메인의 파생 상태 안티패턴 제거, React/Next.js 최신 패턴 준수, 코드 품질을 개선한다.

**Architecture:** `useState` + `useEffect`로 React Query 데이터를 동기화하는 파생 상태 3건을 직접 참조로 교체, Image `loader` no-op을 `unoptimized`로 전환, 중복 클라이언트 auth guard 제거, 파일명 오타 수정, 배럴 export 정리.

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, TypeScript strict, Tailwind CSS, shadcn/ui

**Spec:** `docs/superpowers/specs/2026-03-22-user-domain-refactor-design.md`

---

## File Structure

### 수정 대상 파일

| 파일                                          | 책임                 | 변경 내용                                   |
| --------------------------------------------- | -------------------- | ------------------------------------------- |
| `app/user/components/BillBookmarkedCount.tsx` | 북마크 개수 표시     | 파생 상태 제거                              |
| `app/user/components/CongressmanList.tsx`     | 팔로우 의원 목록     | 파생 상태 제거                              |
| `app/user/components/UserInfo.tsx`            | 유저 프로필 표시     | `loader` → `unoptimized`                    |
| `app/user/components/LogoutButton.tsx`        | 로그아웃 버튼        | 불필요한 `useCallback` 제거                 |
| `app/user/mypage/MyPageContent.tsx`           | 마이페이지 레이아웃  | 중복 클라이언트 auth guard 제거             |
| `app/user/components/BillBookmaredList.tsx`   | 북마크 법안 리스트   | 파일명 오타 수정 → `BillBookmarkedList.tsx` |
| `app/user/hooks/index.ts`                     | React Query 훅       | 중복 `userKeys` import 제거                 |
| `app/user/components/BillContainer.tsx`       | 북마크 법안 컨테이너 | 파생 상태 제거, `loader` → `unoptimized`    |
| `app/user/components/index.tsx`               | 배럴 export          | 내부 전용 컴포넌트 제거                     |

---

## Task 1: BillBookmarkedCount — 파생 상태 제거

**Files:**

- Modify: `app/user/components/BillBookmarkedCount.tsx`

- [ ] **Step 1: 파생 상태 제거 — `data.count` 직접 사용**

```tsx
'use client';

import { useGetBillBookmarkedCount } from '@/app/user/hooks';

export default function BillBookmarkedCount() {
  const { data } = useGetBillBookmarkedCount();
  return <span className="text-[#555555] dark:text-gray-2">{data.count}</span>;
}
```

`useState`, `useEffect` import 및 `billCount` 상태 + `useEffect` 동기화 로직 제거.

- [ ] **Step 2: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS

---

## Task 2: CongressmanList — 파생 상태 제거

**Files:**

- Modify: `app/user/components/CongressmanList.tsx`

- [ ] **Step 1: 파생 상태 제거 — `data` 직접 사용**

`'use client'` 유지 — 컴포넌트가 `useGetFollowingCongressman()` 클라이언트 훅을 직접 호출하므로 필요.

```tsx
'use client';

import { useGetFollowingCongressman } from '@/app/user/hooks';
import { FollowingCongressman } from '@/app/user/validation';
import { ExpandableList } from '@/app/common/components';
import CongressmanItem from './CongressmanItem';

export default function CongressmanList() {
  const { data: congressmanList } = useGetFollowingCongressman();

  return (
    <section className="px-[30px] flex flex-col gap-6">
      <p className="text-xl font-semibold">
        팔로우한 의원 &middot;<span className="text-[#555555] dark:text-gray-2"> {congressmanList.length}</span>
      </p>

      <ExpandableList
        items={congressmanList.map((congressman: FollowingCongressman) => (
          <CongressmanItem key={congressman.congressman_id} {...congressman} />
        ))}
        initialCount={8}
      />
    </section>
  );
}
```

`useState`, `useEffect` import 제거. `list` 로컬 상태 및 `useEffect` 동기화 제거. `list?.length` → `congressmanList.length`. 조건부 렌더링 `{list && ...}` 제거 — `useSuspenseQuery`로 `data`는 항상 존재.

- [ ] **Step 2: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS

---

## Task 3: UserInfo — `loader` prop 제거 + LogoutButton `useCallback` 제거

**Files:**

- Modify: `app/user/components/UserInfo.tsx`
- Modify: `app/user/components/LogoutButton.tsx`

- [ ] **Step 1: UserInfo — `loader` → `unoptimized`**

`app/user/components/UserInfo.tsx`에서:

```tsx
// Before
<Image
  src="/images/profileBorder.png"
  width={100}
  height={100}
  alt="프로필 사진 테두리"
  priority
  loader={({ src }) => `${src}`}
  className="absolute z-10"
/>

// After
<Image
  src="/images/profileBorder.png"
  width={100}
  height={100}
  alt="프로필 사진 테두리"
  priority
  unoptimized
  className="absolute z-10"
/>
```

- [ ] **Step 2: LogoutButton — `useCallback` 제거**

```tsx
import { useRouter } from 'next/navigation';
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

  return (
    <Button
      onClick={() => postLogout()}
      size="sm"
      variant="outline"
      className="h-8 rounded-full bg-transparent border-1 border-[#E0E0E0] text-[#999999] dark:border-gray-3 dark:text-gray-2">
      로그아웃
    </Button>
  );
}
```

`useCallback` import 제거. `onClickLogout` 변수 제거 → 인라인 화살표 함수.

- [ ] **Step 3: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS

---

## Task 4: MyPageContent — 중복 클라이언트 auth guard 제거

**Files:**

- Modify: `app/user/mypage/MyPageContent.tsx`

- [ ] **Step 1: 중복 인증 로직 제거**

서버의 `requireAuth()`가 미인증 시 리다이렉트하므로 클라이언트 auth guard 전체 제거:

```tsx
'use client';

import { CongressmanList, UserInfo, PartyList, BillContainer } from '@/app/user/components';

export default function MyPageContent() {
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

`useEffect`, `useRouter`, `useAuthGuard` import 모두 제거.

- [ ] **Step 2: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS

---

## Task 5: 파일명 오타 수정 + hooks import 정리

**Files:**

- Rename: `app/user/components/BillBookmaredList.tsx` → `app/user/components/BillBookmarkedList.tsx`
- Modify: `app/user/components/BillContainer.tsx` (import 경로 수정)
- Modify: `app/user/hooks/index.ts`

파일명 rename을 먼저 수행하여 이후 Task(BillContainer, 배럴 정리)에서 올바른 파일명 사용 가능.

- [ ] **Step 1: 파일 rename**

```bash
git mv app/user/components/BillBookmaredList.tsx app/user/components/BillBookmarkedList.tsx
```

- [ ] **Step 2: BillContainer.tsx import 경로 수정**

`app/user/components/BillContainer.tsx` L9:

```tsx
// Before
import BillBookmarkedList from './BillBookmaredList';
// After
import BillBookmarkedList from './BillBookmarkedList';
```

- [ ] **Step 3: hooks/index.ts 중복 import 정리**

L24의 `export { userKeys }` re-export 구문을 제거하고, L27의 `import { userKeys }` 를 유지. 파일 하단에서 `export { userKeys }` 추가:

```tsx
// 삭제할 줄 (L24):
export { userKeys } from '@/app/user/services/query-keys';

// 유지할 줄 (L27, L25로 이동):
import { userKeys } from '@/app/user/services/query-keys';

// 파일 마지막 (L118 이후)에 추가:
export { userKeys };
```

`export { usePostLogout } from '@/app/auth/hooks';` (L25)는 위치만 조정 — 다른 re-export와 함께 파일 하단으로 이동.

- [ ] **Step 4: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS

---

## Task 6: BillContainer — 파생 상태 제거 + loader 수정

**Files:**

- Modify: `app/user/components/BillContainer.tsx`

Task 5에서 파일명이 수정되었으므로 올바른 import 경로 사용 가능.

- [ ] **Step 1: 파생 상태 제거 + `loader` → `unoptimized`**

```tsx
'use client';

import Image from 'next/image';
import { useIntersect } from '@/app/common/hooks';
import { Card } from '@/app/common/components/ui/card';
import { useInfiniteBillBookmarked } from '@/app/user/hooks';
import BillBookmarkedCount from './BillBookmarkedCount';
import BillBookmarkedList from './BillBookmarkedList';

export default function BillContainer() {
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteBillBookmarked();
  const bills = data.pages.flatMap((page) => page.bill_list);

  const fetchRef = useIntersect(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  });

  return (
    <section className="lg:px-[30px] flex flex-col gap-6">
      <p className="text-xl font-semibold px-[30px] lg:px-0">
        스크랩한 법안 &middot; <BillBookmarkedCount />
      </p>
      <Card className="mx-[30px] lg:mx-0 bg-primary-3 dark:lg:bg-dark-b rounded-lg px-6 py-5 flex flex-row gap-8 items-center">
        <Image
          src="/images/scrab.png"
          width={64}
          height={64}
          alt="스크랩 아이콘 이미지"
          priority
          unoptimized
          className="shrink-0"
        />
        <p className="text-base font-semibold text-white lg:text-lg">이곳에서 스크랩한 법안들을 모아서 확인하세요!</p>
      </Card>
      <BillBookmarkedList bills={bills} isFetching={isFetching} fetchRef={fetchRef} />
    </section>
  );
}
```

`useState`, `useEffect` import 제거. `bills` 로컬 상태 + `useEffect` 동기화 제거. `loader` → `unoptimized`.

- [ ] **Step 2: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS

---

## Task 7: 배럴 export 정리

**Files:**

- Modify: `app/user/components/index.tsx`

- [ ] **Step 1: 외부 사용 컴포넌트만 export**

전체 파일을 교체 — 내부 전용 컴포넌트 제거, named re-export 패턴 사용:

```tsx
export { default as BillContainer } from './BillContainer';
export { default as CongressmanList } from './CongressmanList';
export { default as PartyList } from './PartyList';
export { default as UserInfo } from './UserInfo';
```

내부 전용 컴포넌트(`BillBookmarked`, `BillBookmarkedList`, `BillBookmarkedCount`, `LogoutButton`, `PartyItem`, `CongressmanItem`)는 배럴에서 제거 — 이미 각 소비자에서 상대경로로 import.

- [ ] **Step 2: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS

---

## Task 8: Lint + Prettier 최종 확인

- [ ] **Step 1: lint + format 실행**

Run: `npm run fix`
Expected: PASS (no errors)

- [ ] **Step 2: 빌드 최종 확인**

Run: `npm run build`
Expected: PASS

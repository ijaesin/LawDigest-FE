# User 도메인 코드 개선 Design Spec

**Date:** 2026-03-22
**Goal:** User 도메인의 파생 상태 안티패턴 제거, React/Next.js 최신 패턴 준수, 코드 품질을 개선한다.

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, TypeScript strict, Tailwind CSS, shadcn/ui

---

## 수정 대상 파일

| 파일                                          | 변경 요약                                     |
| --------------------------------------------- | --------------------------------------------- |
| `app/user/components/BillContainer.tsx`       | 파생 상태 제거, `loader` prop → `unoptimized` |
| `app/user/components/BillBookmarkedCount.tsx` | 파생 상태 제거 — `data.count` 직접 사용       |
| `app/user/components/CongressmanList.tsx`     | 파생 상태 제거 — `data` 직접 사용             |
| `app/user/components/UserInfo.tsx`            | `loader` prop → `unoptimized`                 |
| `app/user/components/LogoutButton.tsx`        | 불필요한 `useCallback` 제거                   |
| `app/user/mypage/MyPageContent.tsx`           | 중복 클라이언트 auth guard 제거               |
| `app/user/components/BillBookmaredList.tsx`   | 파일명 오타 수정 → `BillBookmarkedList.tsx`   |
| `app/user/hooks/index.ts`                     | 중복 `userKeys` import 제거                   |
| `app/user/components/index.tsx`               | 내부 전용 컴포넌트 배럴 export 제거           |

---

## 영역 1: BillContainer.tsx — 파생 상태 제거 + loader 수정

### 현재 문제

```tsx
// BillContainer.tsx
const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteBillBookmarked();
const [bills, setBills] = useState(data ? data.pages.flatMap((page) => page.bill_list) : []);

useEffect(() => {
  if (data) {
    setBills(() => [...data.pages.flatMap((page) => page.bill_list)]);
  }
}, [data]);
```

- `useState` + `useEffect`로 React Query 데이터를 로컬 상태에 동기화하는 파생 상태 안티패턴
- `useSuspenseInfiniteQuery` 사용 시 `data`는 항상 존재하므로 null 체크 불필요
- `loader={({ src }) => src}` 는 Next.js Image 최적화를 우회하는 no-op — `unoptimized` prop 사용이 의도적

### 설계

1. `bills` 로컬 상태 제거 — `data.pages.flatMap()` 결과를 직접 사용
2. `useState`, `useEffect` import 제거
3. `loader` prop → `unoptimized` prop

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

---

## 영역 2: BillBookmarkedCount.tsx — 파생 상태 제거

### 현재 문제

```tsx
const { data: billBookmarkedCount } = useGetBillBookmarkedCount();
const [billCount, setBillCount] = useState(billBookmarkedCount ? billBookmarkedCount.count : 0);

useEffect(() => {
  if (billBookmarkedCount) {
    setBillCount(billBookmarkedCount.count);
  }
}, [billBookmarkedCount]);
```

`useSuspenseQuery` 사용 시 `data`는 항상 존재. 로컬 상태로 동기화할 이유 없음.

### 설계

```tsx
'use client';

import { useGetBillBookmarkedCount } from '@/app/user/hooks';

export default function BillBookmarkedCount() {
  const { data } = useGetBillBookmarkedCount();
  return <span className="text-[#555555] dark:text-gray-2">{data.count}</span>;
}
```

---

## 영역 3: CongressmanList.tsx — 파생 상태 제거

### 현재 문제

```tsx
const { data: congressmanList } = useGetFollowingCongressman();
const [list, setList] = useState<FollowingCongressman[]>();

useEffect(() => {
  if (congressmanList) {
    setList(congressmanList);
  }
}, [congressmanList]);
```

동일한 파생 상태 안티패턴. `useSuspenseQuery`에서 `data`는 항상 존재.

### 설계

```tsx
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

`'use client'` 지시문 제거 — `useState`/`useEffect` 제거 시 `useGetFollowingCongressman`이 Suspense 쿼리이므로 부모(`MyPageContent`)가 이미 `'use client'`를 선언하고 있음. 단, `ExpandableList`가 클라이언트 상태를 사용할 경우 유지 필요 — 확인 후 결정.

---

## 영역 4: UserInfo.tsx — `loader` prop 제거

### 현재 문제

```tsx
<Image
  src="/images/profileBorder.png"
  ...
  loader={({ src }) => `${src}`}
/>
```

### 설계

```tsx
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

---

## 영역 5: LogoutButton.tsx — 불필요한 useCallback 제거

### 현재 문제

```tsx
const onClickLogout = useCallback(async () => {
  postLogout();
}, [postLogout]);
```

- `useCallback`은 참조 안정성이 필요한 경우(props 전달, 의존성 배열)에 사용
- `onClickLogout`은 `<Button onClick>`에만 사용 — 메모이제이션 불필요
- `async` 키워드도 불필요 (`postLogout()`은 mutation trigger로 Promise를 반환하지 않음)

### 설계

```tsx
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

`useCallback` import 제거.

---

## 영역 6: MyPageContent.tsx — 중복 클라이언트 auth guard 제거

### 현재 문제

```tsx
// page.tsx (서버)
export default async function MyPage() {
  await requireAuth(); // 서버에서 인증 확인
  return <MyPageContent />;
}

// MyPageContent.tsx (클라이언트)
const { isAuthenticated, requireLogin } = useAuthGuard();
useEffect(() => {
  if (!isAuthenticated) {
    requireLogin();
    router.push('/auth/login');
  }
}, [isAuthenticated, requireLogin, router]);
if (!isAuthenticated) return null;
```

서버의 `requireAuth()`가 미인증 시 리다이렉트하므로, 클라이언트의 `useEffect` + `useAuthGuard` + `router.push` + `if (!isAuthenticated) return null` 은 전부 불필요.

### 설계

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

---

## 영역 7: 파일명 오타 수정

`BillBookmaredList.tsx` → `BillBookmarkedList.tsx`

import 수정 대상:

- `app/user/components/index.tsx` (L3)
- `app/user/components/BillContainer.tsx` (L9)

---

## 영역 8: hooks/index.ts — 중복 import 정리

### 현재 문제

```tsx
// L24
export { userKeys } from '@/app/user/services/query-keys';
// L27
import { userKeys } from '@/app/user/services/query-keys';
```

`export`와 `import`가 동시에 존재. `export` 한 줄은 re-export용이고, `import` 한 줄은 내부 사용용.

### 설계

`export` 줄을 제거하고, `import`만 유지한 뒤 파일 하단에서 named export로 통합:

```tsx
import { userKeys } from '@/app/user/services/query-keys';

// ... 훅 정의 ...

export { userKeys };
export { usePostLogout } from '@/app/auth/hooks';
```

---

## 영역 9: index.tsx 배럴 정리

### 현재 문제

10개 컴포넌트 전부 export. 외부에서 사용하는 컴포넌트는 4개뿐:

- `UserInfo` — MyPageContent
- `PartyList` — MyPageContent
- `CongressmanList` — MyPageContent
- `BillContainer` — MyPageContent

내부 전용 (다른 user 컴포넌트에서만 import):

- `BillBookmarked`, `BillBookmarkedList`, `BillBookmarkedCount`, `LogoutButton`, `PartyItem`, `CongressmanItem`

### 설계

```tsx
export { default as BillContainer } from './BillContainer';
export { default as CongressmanList } from './CongressmanList';
export { default as PartyList } from './PartyList';
export { default as UserInfo } from './UserInfo';
```

내부 전용 컴포넌트는 직접 상대경로로 import.

---

## 변경하지 않는 것

| 대상                              | 이유                                                    |
| --------------------------------- | ------------------------------------------------------- |
| `app/user/services/index.ts`      | try/catch 패턴은 프로젝트 전반 규칙, 단독 변경 불가     |
| `app/user/validation/index.ts`    | 임시 완화 스키마 — 백엔드 계약 미확정 TODO 존재         |
| `app/user/services/query-keys.ts` | 현재 구조 적절                                          |
| `PartyItem.tsx`                   | dark/light Image 패턴은 프로젝트 전반 규칙              |
| `CongressmanItem.tsx`             | 현재 구조 적절                                          |
| `BillBookmarked.tsx`              | bill 도메인 리팩토링에서 ProposerList variant 변경 완료 |

---

## 적용 규칙 매핑

| 영역 | 적용 규칙                                                       |
| ---- | --------------------------------------------------------------- |
| 1    | `rerender-derived-state-no-effect`, Next.js Image `unoptimized` |
| 2    | `rerender-derived-state-no-effect`                              |
| 3    | `rerender-derived-state-no-effect`                              |
| 4    | Next.js Image `unoptimized`                                     |
| 5    | `rerender-memo` (불필요한 메모이제이션 제거)                    |
| 6    | Next.js RSC auth 패턴, 중복 코드 제거                           |
| 7    | 코드 품질                                                       |
| 8    | `bundle-barrel-imports`, import 정리                            |
| 9    | `bundle-barrel-imports`                                         |

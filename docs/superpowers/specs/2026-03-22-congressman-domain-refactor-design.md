# Congressman 도메인 코드 개선 Design Spec

**Date:** 2026-03-22
**Goal:** Congressman 도메인의 서비스 레이어 표준화, 코드 품질, 타입 안전성, 접근성, React/Next.js 최신 패턴 준수를 개선한다.

**Constraint:** 다른 에이전트가 PartyLogo common 추출을 진행 중이므로 congressman 내부 PartyLogo는 내부 정리만 수행한다. common 추출이 완료되지 않았을 경우 최종 단계에서 추출한다.

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, TypeScript strict, Tailwind CSS, shadcn/ui

---

## 수정 대상 파일

| 파일 | 변경 요약 |
| --- | --- |
| `app/congressman/services/index.ts` | `services/apis.ts`로 rename |
| `app/congressman/hooks/index.ts` | query keys -> `services/query-keys.ts`, hooks -> `services/queries.ts`로 분리, re-export 유지 |
| `app/congressman/components/BillContainer.tsx` | `useState+useEffect` -> `useMemo`, 매직넘버 상수화, 타입 캐스트 제거 |
| `app/congressman/components/FollowBoard.tsx` | optimistic update rollback 구현, 접근성 개선 |
| `app/congressman/components/CongressmanDetail.tsx` | HTML entity 안전 처리, homepage 링크 검증, 접근성 개선 |
| `app/congressman/components/PartyLogo.tsx` | 다크모드 URL 로직 정리, null guard 강화 |
| `app/congressman/components/CongressmanContainer.tsx` | 변경 없음 (thin wrapper로 적절) |
| `app/congressman/components/index.tsx` | 내부 전용 컴포넌트 배럴 export 제거 |
| `app/congressman/[id]/page.tsx` | Suspense + ErrorBoundary 래핑, import 경로 업데이트 |
| `app/congressman/[id]/layout.tsx` | 변경 없음 |
| `app/congressman/validation/index.ts` | TODO 주석 유지 (백엔드 계약 미확정) |
| `tests/congressman/` | 주요 로직 테스트 추가 |

---

## 영역 1: 서비스 레이어 3파일 분리

**현재:** `services/index.ts`에 API 호출, `hooks/index.ts`에 query keys + React Query 훅이 혼재.

**개선:** 프로젝트 표준 3파일 분리.

- `services/query-keys.ts` — `congressmanKeys` 팩토리
- `services/apis.ts` — API 호출 (기존 `services/index.ts` rename)
- `services/queries.ts` — React Query 훅 (기존 `hooks/index.ts`에서 이동)
- `hooks/index.ts` — re-export only (기존 import 경로 호환)

```ts
// services/query-keys.ts
export const congressmanKeys = {
  root: () => ['congressman'] as const,
  detail: (congressmanId: string) => [...congressmanKeys.root(), 'detail', congressmanId] as const,
  billFeed: (congressmanId: string, type: string) =>
    [...congressmanKeys.root(), 'billFeed', congressmanId, type] as const,
};
```

```ts
// services/apis.ts — 기존 services/index.ts와 동일, 변경 없음
```

```ts
// services/queries.ts — hooks/index.ts에서 이동
// import 경로를 ../services/query-keys, ../services/apis로 변경
// 'use client' 지시문 유지
```

```ts
// hooks/index.ts — re-export
export { congressmanKeys } from '@/app/congressman/services/query-keys';
export {
  useInfiniteCongressmanBills,
  useGetCongressmanDetail,
  useMutateCongressmanFollow,
} from '@/app/congressman/services/queries';
```

**추가: `useMutateCongressmanFollow` 개선**

1. 제네릭 파라미터를 concrete 타입(`Error`, `unknown`)으로 명시하여 `as any` 없이 타입 안전성 확보
2. 기존 `...options` spread가 커스텀 `onSuccess`/`onError`를 덮어쓰는 버그 수정 — spread 제거, 콜백 수동 포워딩
3. `onSuccess`에서 `invalidateQueries`로 서버 상태를 리패치 (로컬 optimistic update는 FollowBoard에서 담당, 이중 갱신 방지)

```ts
// services/queries.ts — useMutateCongressmanFollow 수정
export const useMutateCongressmanFollow = (
  congressmanId: string,
  options?: Omit<UseMutationOptions<CongressmanFollowResponse, Error, boolean, unknown>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation<CongressmanFollowResponse, Error, boolean, unknown>({
    mutationFn: (likeChecked: boolean) => patchCongressmanFollow(congressmanId, likeChecked),
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: congressmanKeys.detail(congressmanId) });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(extractApiMessage(error));
      options?.onError?.(error, variables, context);
    },
  });
};
```

**Optimistic update 전략:** FollowBoard의 로컬 상태(`isFollowed`, `followCount`)가 즉시 UI를 갱신하고, mutation 성공 시 `invalidateQueries`로 서버 데이터를 동기화한다. `setQueryData`로 캐시를 직접 조작하지 않아 이중 갱신(double-count) 위험을 제거한다.

---

## 영역 2: BillContainer — 파생 상태 안티패턴 제거

### 현재 문제

```tsx
const [bills, setBills] = useState(data ? data.pages.flatMap(({ bill_list: responses }) => responses) : []);

useEffect(() => {
  if (data) {
    setBills(() => [...data.pages.flatMap(({ bill_list: responses }) => responses)]);
  }
}, [data]);

useEffect(() => {
  setBills([]);
  refetch();
}, [billType]);
```

- `useState + useEffect`로 React Query 데이터를 로컬 상태에 동기화하는 파생 상태 안티패턴
- `billType` 변경 시 수동 `refetch()` 호출 — `queryKey`에 `billType`이 이미 포함되어 있으므로 불필요

### 설계

```tsx
import { useMemo } from 'react';

const BILL_PAGE_SIZE = 3;

export default function BillContainer({ id }: { id: string }) {
  const [billType, setBillType] = useTabType<typeof BILL_TAB>('represent_proposer');
  const { data, hasNextPage, isFetching, fetchNextPage } = useInfiniteCongressmanBills(id, billType);

  const bills = useMemo(() => data?.pages.flatMap(({ bill_list }) => bill_list) ?? [], [data]);

  const fetchRef = useIntersect(() => {
    if (hasNextPage && !isFetching) fetchNextPage();
  });

  return (
    <section>
      <BillTab type={billType} clickHandler={setBillType} />
      <BillList bills={bills} isFetching={isFetching} fetchRef={fetchRef} />
      {bills.length === 0 && !isFetching && (
        <p className="flex justify-center my-8 text-sm text-gray-2 dark:text-gray-3">
          발의한 법안이 존재하지 않습니다.
        </p>
      )}
    </section>
  );
}
```

변경 사항:
1. `useState + useEffect` 2건 제거 -> `useMemo` 1건으로 대체
2. `billType` 변경 시 `refetch()` 수동 호출 제거 — `queryKey`에 `billType` 포함되어 자동 리패치
3. `size: 3` -> `BILL_PAGE_SIZE` 상수 (`services/apis.ts`에 정의, import)
4. `billType as ValueOf<typeof BILL_TAB>` 타입 캐스트 제거 — `useTabType` 제네릭으로 해결

**`useTabType` 타입 해결:**

`useTabType`은 이미 제네릭 `<T>`를 지원하며 `[ValueOf<T>, Dispatch<SetStateAction<ValueOf<T>>>]`를 반환한다. 따라서 `useTabType<typeof BILL_TAB>('represent_proposer')`의 반환 타입은 `ValueOf<typeof BILL_TAB>`로 추론되므로 `billType as ValueOf<typeof BILL_TAB>` 캐스트는 불필요하며 제거한다.

---

## 영역 3: FollowBoard — Optimistic Update Rollback + 접근성

### 3-1. Optimistic Update Rollback

**현재 문제:** `setIsFollowed`/`setFollowCount`로 즉시 UI를 갱신하지만 mutation 실패 시 롤백하지 않음.

**설계:** `mutate()` 호출 시 인라인으로 `onError`를 전달하여 이전 상태를 로컬 변수로 캡처. 이렇게 하면 stale closure 문제 없이 정확한 롤백이 보장된다.

```tsx
export default function FollowBoard({
  id,
  likeChecked,
  follow_count,
  represent_count,
  public_count,
}: {
  id: string;
  likeChecked: boolean;
  follow_count: number;
  represent_count: number;
  public_count: number;
}) {
  const [isFollowed, setIsFollowed] = useState(likeChecked);
  const [followCount, setFollowCount] = useState(follow_count);
  const setSnackbar = useSnackbarStore((s) => s.setSnackbar);
  const { requireLogin } = useAuthGuard();
  const mutationFollow = useMutateCongressmanFollow(id);

  const onClickFollow = useCallback(() => {
    if (!requireLogin()) return;

    // 롤백용 이전 값을 로컬 변수로 캡처
    const prevFollowed = isFollowed;
    const prevCount = followCount;
    const nextFollowed = !isFollowed;

    // optimistic update
    setIsFollowed(nextFollowed);
    setFollowCount(nextFollowed ? followCount + 1 : followCount - 1);
    setSnackbar({
      show: true,
      type: nextFollowed ? SNACKBAR_TYPE.SUCCESS : SNACKBAR_TYPE.CANCEL,
      message: nextFollowed ? '해당 의원을 팔로우했습니다.' : '해당 의원의 팔로우를 취소했습니다.',
      duration: 3000,
    });

    // mutate 인라인 onError로 정확한 롤백 보장
    mutationFollow.mutate(nextFollowed, {
      onError: () => {
        setIsFollowed(prevFollowed);
        setFollowCount(prevCount);
        setSnackbar({
          show: true,
          type: SNACKBAR_TYPE.ERROR,
          message: '팔로우 처리에 실패했습니다. 다시 시도해주세요.',
          duration: 3000,
        });
      },
    });
  }, [isFollowed, followCount, setSnackbar, requireLogin, mutationFollow]);

  // ...
}
```

핵심: `onError`를 `useMutateCongressmanFollow` 옵션이 아닌 `mutate()` 인라인에 전달하여, `prevFollowed`/`prevCount` 로컬 변수로 정확한 롤백 보장. stale closure 문제 완전 해결.

### 3-2. 접근성 개선

```tsx
<Button
  onClick={onClickFollow}
  aria-pressed={isFollowed}
  aria-label={isFollowed ? '팔로우 취소' : '팔로우 하기'}
  className={...}
>
```

통계 영역에 시맨틱 마크업 추가:

```tsx
<dl className="flex justify-between w-full">
  <div className="flex flex-col items-center basis-1/3">
    <dt className="text-sm font-medium text-gray-2 order-2">팔로워</dt>
    <dd className="text-2xl font-semibold">{followCount}</dd>
  </div>
  {/* represent_count, public_count 동일 패턴 */}
</dl>
```

---

## 영역 4: CongressmanDetail — HTML Entity + Homepage 링크 + 접근성

### 4-1. brief_history HTML Entity 처리

**현재:**

```tsx
brief_history.replaceAll('&middot;', '\u00B7').replaceAll('&nbsp;', '').replaceAll('&#39;', "'")
```

수동 문자열 치환은 누락 가능성이 높고 확장성이 없다.

**설계:** `decodeHtmlEntities` 유틸 함수 사용:

```ts
// app/common/utils/decodeHtmlEntities.ts
export function decodeHtmlEntities(html: string): string {
  return html
    .replaceAll('&middot;', '\u00B7')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"');
}
```

주요 HTML 엔티티를 커버하는 순수 문자열 치환 유틸. SSR/CSR 모두에서 안전하게 동작하며, DOM API 의존성 없음. 향후 엔티티 추가가 필요하면 이 함수에 한 곳만 수정하면 된다. `app/common/utils/index.ts` barrel export에도 추가한다.

### 4-2. Homepage 링크 검증

**현재:** `homepage`이 빈 문자열일 때 `<Link href="">` -> 현재 페이지로 이동하는 무의미한 링크.

**설계:**

```tsx
{homepage ? (
  <Button asChild variant="outline" className="...">
    <Link
      href={homepage}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="홈페이지 방문 (새 창에서 열림)"
    >
      홈페이지 방문
      <IconWeb />
    </Link>
  </Button>
) : null}
```

빈 문자열이면 버튼 자체를 렌더링하지 않음. 외부 링크이므로 `target="_blank"` + `rel="noopener noreferrer"` + `aria-label` 추가.

### 4-3. 접근성

```tsx
<Avatar className="..." aria-label={`${congressman_name} 의원 사진`}>
  <AvatarImage src={...} alt={`${congressman_name} 의원`} />
  <AvatarFallback>{congressman_name[0]}</AvatarFallback>
</Avatar>
```

기본정보 섹션을 `<dl>/<dt>/<dd>` 시맨틱 마크업으로 전환:

```tsx
<dl className="ml-3 w-full">
  <div className="flex gap-2 justify-between items-center">
    <dt className="font-medium text-gray-2 dark:text-gray-3 shrink-0">나이</dt>
    <dd className="text-sm font-medium dark:text-gray-1 w-[80%] break-words text-end">
      {age ? `${age} 세` : '-'}
    </dd>
  </div>
  {/* 성별, 번호, 이메일, 의원실 동일 패턴 */}
</dl>
```

---

## 영역 5: PartyLogo — 내부 정리

**현재 문제:**
- `party_image_url !== null` 체크가 있으나 Zod 스키마에서 `nullable().transform(v => v ?? '')` 처리로 빈 문자열이 올 수 있음 -> null 체크가 항상 true

**설계:**

```tsx
export default function PartyLogo({
  party_id,
  party_name,
  party_image_url,
}: {
  party_id: number;
  party_name: string;
  party_image_url: string;
}) {
  if (!party_image_url) {
    return <PartyLogoReplacement partyName={party_name} circle={false} />;
  }

  const darkImageUrl = party_image_url.replace('wide', 'dark');

  return (
    <Link href={`/party/${party_id}`}>
      <Image
        className="dark:hidden object-contain w-[64px] h-[30px]"
        src={process.env.NEXT_PUBLIC_IMAGE_URL + party_image_url}
        width={64}
        height={30}
        alt={`${party_name} 로고`}
      />
      <Image
        className="hidden dark:block object-contain w-[64px] h-[30px]"
        src={process.env.NEXT_PUBLIC_IMAGE_URL + darkImageUrl}
        width={64}
        height={30}
        alt={`${party_name} 로고`}
      />
    </Link>
  );
}
```

변경: `!== null` -> falsy 체크(`!party_image_url`)로 빈 문자열도 처리. 다크모드 URL을 변수로 추출. fallback 시 빈 href Link 제거.

---

## 영역 6: page.tsx — Suspense + ErrorBoundary

**현재:** CongressmanContainer에 Suspense/ErrorBoundary 없이 useSuspenseQuery 사용.

**설계:**

```tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export default async function Congressman({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: congressmanKeys.detail(id),
    queryFn: () => getCongressmanDetail(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="flex flex-col gap-10">
        <SubHeader title="의원 프로필" />
        <ErrorBoundary fallback={<p className="text-center py-10 text-gray-2">의원 정보를 불러올 수 없습니다.</p>}>
          <Suspense fallback={<CongressmanDetailSkeleton />}>
            <CongressmanContainer id={id} />
          </Suspense>
        </ErrorBoundary>
      </section>
    </HydrationBoundary>
  );
}
```

`CongressmanDetailSkeleton`은 `app/congressman/components/CongressmanDetailSkeleton.tsx`에 구현. Card + Avatar + Separator 형태의 pulse 애니메이션 스켈레톤. 배럴 파일에서는 export하지 않음 (page.tsx에서만 사용). import 경로를 `services/query-keys`로 업데이트.

---

## 영역 7: 배럴 파일 정리

**현재:**

```tsx
export { BillContainer, CongressmanDetail, CongressmanContainer, FollowBoard, PartyLogo };
```

**개선:** 외부 모듈에서 import되는 컴포넌트만 export.

```tsx
export { default as CongressmanContainer } from './CongressmanContainer';
```

`BillContainer`, `CongressmanDetail`, `FollowBoard`, `PartyLogo`는 CongressmanContainer 내부에서만 사용되므로 배럴에서 제거.

---

## 영역 8: 테스트

주요 로직 위주로 테스트 작성:

### 8-1. services/apis.ts 테스트

```
tests/congressman/services/apis.test.ts
```

- `getBillByCongressman`: Zod 스키마 검증 통과/실패 케이스
- `getCongressmanDetail`: 정상 응답 + `extractApiMessage` 에러 처리
- `patchCongressmanFollow`: PATCH 호출 파라미터 검증

### 8-2. FollowBoard optimistic update 테스트

```
tests/congressman/components/FollowBoard.test.tsx
```

- 팔로우 클릭 시 UI 즉시 갱신
- mutation 실패 시 이전 상태로 rollback
- 비로그인 시 `requireLogin()` 차단

### 8-3. BillContainer 파생 상태 테스트

```
tests/congressman/components/BillContainer.test.tsx
```

- 데이터 변경 시 `bills` 자동 갱신 (useMemo)
- 탭 변경 시 새 queryKey로 리패치

---

## 변경하지 않는 것

| 대상 | 이유 |
| --- | --- |
| `validation/index.ts` 스키마 완화 | 백엔드 계약 미확정, TODO 주석 존재 |
| `CongressmanContainer.tsx` | thin wrapper로 적절 |
| `[id]/layout.tsx` | 현재 구조 적절 |
| PartyLogo common 추출 | 다른 에이전트 작업 영역, 후순위 |

---

## 적용 규칙 매핑

| 영역 | 적용 규칙 |
| --- | --- |
| 1 | 프로젝트 표준 서비스 계층 분리, React Query v5 generics |
| 2 | `rerender-derived-state-no-effect`, `js-cache-property-access` |
| 3 | Optimistic UI rollback, `aria-pressed`, semantic HTML |
| 4 | Safe HTML entity decode, `target="_blank"` + `rel`, semantic `<dl>` |
| 5 | Falsy guard, DRY (다크모드 URL 변수 추출) |
| 6 | `async-suspense-boundaries`, `error-handling` |
| 7 | `bundle-barrel-imports` |
| 8 | 주요 로직 단위 테스트 |

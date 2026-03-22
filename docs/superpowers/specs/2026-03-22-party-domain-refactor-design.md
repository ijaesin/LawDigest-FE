# Party 도메인 리팩토링 설계

- **Date:** 2026-03-22
- **Goal:** party 도메인의 코드 품질, 패턴 일관성, 타입 안전성을 bill/timeline/common 리팩토링 수준으로 개선
- **Constraint:** common 도메인 리팩토링과 PARTY_COLOR 통합 연동, PartyLogo common 이동 시 6+ 소비자 import 업데이트 필요
- **Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, TanStack React Query, Zod, shadcn/ui, Tailwind CSS

---

## 변경 요약

| 파일                                     | 변경 유형 | 설명                                   |
| ---------------------------------------- | --------- | -------------------------------------- |
| `services/index.ts` → `services/apis.ts` | rename    | 파일명 변경만                          |
| `services/query-keys.ts`                 | 신규      | partyKeys 팩토리 (hooks에서 분리)      |
| `services/queries.ts`                    | 신규      | React Query 훅 (hooks에서 이동)        |
| `hooks/index.ts`                         | 변경      | re-export만 유지                       |
| `components/BillContainer.tsx`           | 변경      | 파생 상태 → useMemo                    |
| `components/FollowBoard.tsx`             | 변경      | optimistic update with rollback        |
| `components/PartyDetail.tsx`             | 변경      | API 전환, 타입 단언 제거               |
| `components/PartyLogo.tsx`               | 삭제      | common으로 통합 이동                   |
| `components/PartyLogoReplacement.tsx`    | 삭제      | common으로 통합 이동                   |
| `components/PartyCongressmanList.tsx`    | 변경      | useCallback 의존성 수정                |
| `components/PartyErrorFallback.tsx`      | 신규      | 에러 바운더리 fallback                 |
| `components/PartySkeleton.tsx`           | 신규      | 로딩 스켈레톤                          |
| `components/index.tsx`                   | 변경      | barrel export 정리                     |
| `constants/index.ts`                     | 변경      | 간부 상수 제거, PARTY_COLOR 이동       |
| `[id]/page.tsx`                          | 변경      | ErrorBoundary/Suspense, 타입 단언 수정 |
| `app/common/components/PartyLogo.tsx`    | 신규      | 통합 PartyLogo 컴포넌트                |
| `app/common/constants/theme.ts`          | 변경      | PARTY_COLOR 통합                       |

---

## 변경하지 않는 항목

| 항목                                       | 사유                                                   |
| ------------------------------------------ | ------------------------------------------------------ |
| `validation/index.ts` Zod 스키마           | TODO 주석 대로 API 계약 확정 후 엄격화 (별도 작업)     |
| `PartyCongressmanItem` 레이아웃/스타일     | 현재 구조가 적절함                                     |
| `[id]/layout.tsx` 구조                     | 정적 metadata + Layout 래퍼로 충분                     |
| `useTabType` 제네릭 시그니처               | common 도메인 범위 (이번 리팩토링에서는 캐스팅만 정리) |
| `app/congressman/components/PartyLogo.tsx` | congressman 도메인 리팩토링 시 처리                    |

---

## 1. 서비스 레이어 3파일 분리

### 현재 문제

- `services/index.ts`에 API 호출, `hooks/index.ts`에 쿼리 키 + React Query 훅이 혼합
- 다른 도메인(bill, timeline)은 이미 `apis.ts` / `query-keys.ts` / `queries.ts` 3파일 구조로 분리됨

### 변경 사항

**`services/query-keys.ts`** (신규)

- `'use client'` 디렉티브 없음 — 순수 데이터 객체이므로 Server Component(`page.tsx`)에서도 직접 import 가능

```typescript
export const partyKeys = {
  root: () => ['party'] as const,
  detail: (partyId: number) => [...partyKeys.root(), 'detail', partyId] as const,
  billFeed: (partyId: number, type: string) => [...partyKeys.root(), 'billFeed', partyId, type] as const,
  congressman: (partyId: number) => [...partyKeys.root(), 'congressman', partyId] as const,
  executive: (partyId: number) => [...partyKeys.root(), 'executive', partyId] as const,
};
```

**`services/apis.ts`** (rename from `services/index.ts`)

- 기존 코드 그대로 유지 (이미 패턴 준수)
- 파일명만 변경

**`services/queries.ts`** (신규, `'use client'`)

- 기존 `hooks/index.ts`의 React Query 훅 이동
- `useGetPartyExecutive` 훅 추가
- `useMutatePartyFollow`에 optimistic update 로직 추가 (영역 3 참고)
- 기존 `...options` 스프레드가 `onSuccess`/`onError` 뒤에 위치하여 콜백을 덮어쓰는 버그 수정 — optimistic update 패턴에서는 `...options` 스프레드를 사용하지 않고 필요한 옵션만 명시적으로 전달

**`hooks/index.ts`** (변경)

- `'use client'` 디렉티브 유지 (queries.ts re-export)
- `partyKeys`도 re-export하되, Server Component에서는 `@/app/party/services/query-keys`에서 직접 import 권장

```typescript
'use client';

export {
  useInfinitePartyBills,
  useGetPartyDetail,
  useGetPartyCongressman,
  useGetPartyExecutive,
  useMutatePartyFollow,
} from '@/app/party/services/queries';

export { partyKeys } from '@/app/party/services/query-keys';
```

**`page.tsx` import 경로 변경:**

```typescript
// Before
import { partyKeys } from '@/app/party/hooks';
// After — Server Component에서 'use client' 모듈 우회
import { partyKeys } from '@/app/party/services/query-keys';
```

---

## 2. 파생 상태 안티패턴 제거 (BillContainer)

### 현재 문제

```typescript
// BillContainer.tsx — 안티패턴
const [bills, setBills] = useState(data ? data.pages.flatMap(...) : []);
useEffect(() => { if (data) setBills(...); }, [data]);      // data 동기화
useEffect(() => { setBills([]); refetch(); }, [billType]);  // 타입 변경 시 리셋
```

- `bills`는 `data`에서 파생되는 값인데 별도 state로 관리
- `billType` 변경 시 수동 `refetch()` 호출 (queryKey에 type이 이미 포함되어 있으므로 불필요)

### 변경 사항

```typescript
// After — useMemo 직접 도출
const bills = useMemo(() => data?.pages.flatMap(({ bill_list }) => bill_list) ?? [], [data]);
```

- `useState` + 2개 `useEffect` 제거
- `billType` 변경 → queryKey 변경 → 자동 refetch (React Query 동작)
- `refetch()` 수동 호출 제거

**적용 규칙:** `rerender-derived-state-no-effect`

---

## 3. 낙관적 UI 롤백 (FollowBoard)

### 현재 문제

```typescript
// FollowBoard.tsx — 롤백 없는 optimistic update
const [isFollowed, setIsFollowed] = useState(followed);
const [followCount, setFollowCount] = useState(follow_count);

const onClickFollow = useCallback(() => {
  setIsFollowed(!isFollowed); // UI 즉시 변경
  setFollowCount(isFollowed ? count - 1 : count + 1);
  mutationFollow.mutate(!isFollowed); // API 호출
}, [isFollowed, followCount]);
```

- API 실패 시 UI 롤백 없음
- props에서 받은 `followed`/`follow_count`를 별도 state로 복제

### 변경 사항

**`services/queries.ts` — useMutatePartyFollow에 optimistic update 추가:**

```typescript
export const useMutatePartyFollow = (partyId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checked: boolean) => patchPartyFollow(partyId, checked),
    onMutate: async (checked) => {
      await qc.cancelQueries({ queryKey: partyKeys.detail(partyId) });
      const previous = qc.getQueryData<PartyDetail>(partyKeys.detail(partyId));
      qc.setQueryData<PartyDetail>(partyKeys.detail(partyId), (old) => {
        if (!old) return old;
        return {
          ...old,
          followed: checked,
          follow_count: checked ? old.follow_count + 1 : old.follow_count - 1,
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(partyKeys.detail(partyId), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: partyKeys.detail(partyId) });
    },
  });
};
```

- 기존 `...options` 스프레드 제거 — optimistic update 콜백이 덮어써지는 버그 방지
- 제네릭 타입 파라미터 `<TError, TContext>` 제거 — 내부적으로 context 타입이 고정됨

**FollowBoard 컴포넌트:**

- `useState(followed)`, `useState(follow_count)` 제거
- `useGetPartyDetail(partyId)`에서 `followed`, `follow_count`, `representative_bill_count`, `public_bill_count` 직접 읽기
- props → `partyId: number`만 받도록 단순화
- `useGetPartyDetail`은 `useSuspenseQuery` 사용 → Suspense 바운더리 내에서 동기적 데이터 접근 보장
- **`useAuthGuard` + `requireLogin()` 가드 유지** — 클릭 핸들러에서 인증 체크 후 mutation 호출
- **스낵바 알림은 컴포넌트 클릭 핸들러에 유지** — mutation hook 내부가 아닌 UI 레이어에서 처리

**적용 규칙:** `rerender-derived-state-no-effect`, `server-cache-react`

---

## 4. 간부 정보 API 전환 (PartyDetail)

### 현재 문제

- `getPartyExecutive()` API와 Zod 스키마가 존재하지만 미사용
- `PartyDetail`에서 하드코딩된 상수 사용:
  ```typescript
  PARTY_LEADER[party_name as keyof typeof PARTY_NAME_KO];
  ```
- `as keyof typeof` 타입 단언으로 런타임 안전성 없음

### 변경 사항

- `useGetPartyExecutive(partyId)` 훅 추가 (queries.ts, `useQuery` — 비-Suspense, 로딩 상태 표시)
- PartyDetail에서 API 데이터 사용
- 상수 제거: `PARTY_LEADER`, `PARTY_FLOOR_LEADER`, `PARTY_SECRETARY_GENERAL`, `PARTY_POLISY_COMMITTEE_CHAIRMAN`
- `PARTY_POSITION`, `PARTY_NAME_EN`, `PARTY_NAME_KO`는 유지 (API에 없는 정보)

```typescript
// PartyDetail.tsx — After
const { data: executive } = useGetPartyExecutive(partyId);

// 간부 정보 렌더링 — PartyExecutiveSchema 기본값이 ''이므로 || 연산자로 fallback
<p>{executive?.party_leader || '없음'}</p>
<p>{executive?.parliamentary_leader || '없음'}</p>
<p>{executive?.secretary_general || '없음'}</p>
<p>{executive?.policy_committee_chairman || '없음'}</p>
```

---

## 5. PartyLogo 통합 + common 이동

### 현재 문제

- `PartyLogo`: Next Image 기반, 다크모드 지원 — 빈 `party_img_url`일 때 깨진 이미지 표시 (기존 버그)
- `PartyLogoReplacement`: 이미지 없을 때 텍스트 fallback
- 두 컴포넌트가 별도로 존재

### 영향 받는 소비자 (6+ 파일)

- `app/party/components/PartyDetail.tsx`
- `app/search/components/SearchParty.tsx`
- `app/congressman/components/` (PartyLogo 별도 존재 — congressman 리팩토링에서 처리)
- `app/following/components/CongressmanItem.tsx`
- `app/bill/components/BillProposerSection.tsx`
- `app/bill/components/AnotherBill.tsx`
- `app/user/components/BillBookmarked.tsx`

### 변경 사항

**`app/common/components/PartyLogo.tsx`** (신규, 통합)

```typescript
interface PartyLogoProps {
  partyName: string;
  partyImgUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

- `partyImgUrl`이 존재하고 비어있지 않을 때: Next Image (다크모드 지원)
- `partyImgUrl`이 없거나 빈 문자열: 텍스트 fallback (기존 PartyLogoReplacement 로직) — 빈 URL 버그 수정
- size variants: `sm` (54px, 기존 circle), `md` (80px), `lg` (130px, 기존 PartyLogo)
- party 도메인의 `PartyLogo.tsx` + `PartyLogoReplacement.tsx` 제거
- 위 소비자 목록의 import 경로 업데이트 (congressman 제외)

---

## 6. 정당 컬러 common 통합

### 현재 문제

- `app/party/constants/index.ts`에 `PARTY_COLOR`: `더불어민주당: '#152484'`
- `app/common/constants/theme.ts`에 `COLOR`: `더불어민주당: '#0B68B3'`
- 값이 다른 항목 존재, `COLOR`에는 구 정당(정의당, 기본소득당 등) 포함

### 변경 사항

- `PARTY_COLOR` (party 도메인)를 정본(canonical)으로 채택 — 최신 정당 목록 기준
- `app/common/constants/theme.ts`의 `COLOR`를 `PARTY_COLOR`로 교체
- 구 정당 항목(정의당, 기본소득당, 시대전환, 한국의희망)은 제거
- party 도메인 `constants/index.ts`에서 `PARTY_COLOR` export 제거
- 모든 소비자가 `@/app/common/constants/theme`에서 import

---

## 7. 타입 안전성 개선

### 변경 사항

**`as keyof typeof` 단언 제거 (PartyDetail.tsx + page.tsx `generateMetadata` 모두 적용):**

```typescript
// Before
PARTY_POSITION[party_name as keyof typeof PARTY_NAME_KO];

// After — 타입 가드 유틸 (app/common/utils 또는 party/constants에 배치)
function getPartyConstant<T extends Record<string, string>>(map: T, key: string, fallback = ''): string {
  return key in map ? map[key as keyof T] : fallback;
}

// Usage in PartyDetail.tsx
getPartyConstant(PARTY_POSITION, party_name, '정보 없음');

// Usage in page.tsx generateMetadata
getPartyConstant(PARTY_POSITION, detail.party_name);
```

**page.tsx `Number(id)` 유효성 검증 추가:**

```typescript
const partyId = Number(id);
if (Number.isNaN(partyId)) notFound();
```

**useCallback 의존성 수정 (PartyCongressmanList):**

```typescript
// Before — isOpened가 의존성이므로 매 렌더 재생성
const onClickButton = useCallback(() => {
  setIsOpened(!isOpened);
}, [isOpened]);

// After — 함수형 setState, 의존성 제거
const onClickButton = useCallback(() => {
  setIsOpened((prev) => !prev);
}, []);
```

**billType 캐스팅 제거 (BillContainer):**

- `billType as ValueOf<typeof BILL_TAB>` → 타입이 이미 올바르므로 캐스팅 불필요

**적용 규칙:** `rerender-dependencies`, `js-early-exit`

---

## 8. 에러 바운더리 추가

### 현재 문제

- Suspense/ErrorBoundary 없이 `useSuspenseQuery` 사용
- 에러 발생 시 전체 페이지 크래시

### 변경 사항

**page.tsx:**

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary FallbackComponent={PartyErrorFallback}>
  <Suspense fallback={<PartySkeleton />}>
    <PartyContainer partyId={partyId} />
  </Suspense>
</ErrorBoundary>;
```

**신규 파일:**

- `app/party/components/PartyErrorFallback.tsx` — 에러 UI + 재시도 버튼
- `app/party/components/PartySkeleton.tsx` — 로딩 스켈레톤

**적용 규칙:** `async-suspense-boundaries`

---

## 9. 기타 개선

| 항목                                   | 변경                                                                  | 비고                                         |
| -------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------- |
| PartyCongressmanItem key               | `` `${congressman_id + index}` `` → `congressman_id`                  | 문자열 연결로 유니크하지만 의미적으로 부정확 |
| barrel export 정리                     | 내부 전용 컴포넌트(PartyCongressmanItem 등) export 제거               | 외부에서 import하지 않는 컴포넌트            |
| PartyContainer props                   | `id: string` → `partyId: number` (Number 변환을 page.tsx에서 한 번만) |                                              |
| layout.tsx metadata                    | 정적 metadata 유지 (generateMetadata는 page.tsx에서 처리)             |                                              |
| `PARTY_POLISY_COMMITTEE_CHAIRMAN` 오타 | 상수 제거로 자연 해결 (API 전환)                                      |                                              |

---

## 적용 규칙 매핑

| 섹션                  | 적용 규칙                                                |
| --------------------- | -------------------------------------------------------- |
| 1. 서비스 레이어 분리 | 프로젝트 표준 아키텍처                                   |
| 2. 파생 상태 제거     | `rerender-derived-state-no-effect`                       |
| 3. 낙관적 UI 롤백     | `rerender-derived-state-no-effect`, `server-cache-react` |
| 4. 간부 API 전환      | 데이터 정합성, 타입 안전성                               |
| 5. PartyLogo 통합     | `architecture-compound-components`, DRY                  |
| 6. 컬러 통합          | DRY, 단일 진실 공급원                                    |
| 7. 타입 안전성        | `rerender-dependencies`, `js-early-exit`                 |
| 8. 에러 바운더리      | `async-suspense-boundaries`                              |
| 9. 기타               | React key 모범 사례, barrel export 정리                  |

---

## 구현 순서

1. **서비스 레이어 분리** — query-keys.ts, apis.ts rename, queries.ts 생성, hooks/index.ts re-export
2. **타입/상수 정리** — PARTY_COLOR common 이동, 간부 상수 제거, 타입 가드 유틸 추가, page.tsx Number 검증
3. **상태 관리 수정** — BillContainer useMemo, FollowBoard optimistic update
4. **PartyLogo 통합** — common 이동, 기존 컴포넌트 제거, import 경로 업데이트 (6+ 파일)
5. **PartyDetail API 전환** — useGetPartyExecutive 적용
6. **에러 바운더리** — PartyErrorFallback, PartySkeleton, page.tsx 구조 변경
7. **기타 개선** — key 수정, barrel export 정리, props 정리

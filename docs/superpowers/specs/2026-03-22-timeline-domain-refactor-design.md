# Timeline 도메인 전면 리팩토링 설계

**Goal:** Timeline 도메인의 코드 품질, 타입 안전성, 안정성을 프로젝트 표준과 최신 React/Next.js 패턴에 맞게 전면 개선한다.

**Architecture:** 서비스 계층을 프로젝트 표준(apis/queries/query-keys)으로 분리하고, React Query 데이터를 직접 파생 계산하여 불필요한 상태 동기화를 제거한다. 9회 중복되는 정당 로고 렌더링과 4회 중복되는 반응형 페이지네이션을 공유 컴포넌트/훅으로 추출한다. SubmittedList/PromulgationList를 variant 기반 BillOutlineList로 통합한다. Suspense + ErrorBoundary를 추가하고 기존 버그를 수정한다.

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, TypeScript strict, Tailwind CSS, shadcn/ui

---

## 1. 서비스 계층 분리

**현재:** `hooks/index.ts`에 query keys + React Query 훅이 혼재, `services/index.ts`에 API 호출.

**개선:** 프로젝트 표준 3파일 분리.

- `services/query-keys.ts` — `timelineKeys` 팩토리
- `services/apis.ts` — API 호출 (기존 `services/index.ts` 이름 변경)
- `services/queries.ts` — React Query 훅 (기존 `hooks/index.ts`에서 이동)
- `hooks/index.ts` — re-export only (기존 import 경로 호환)

---

## 2. ListContainer 파생 상태 안티패턴 제거

**현재:**
```tsx
const [timeline, setTimeline] = useState(data ? data.pages.flatMap(...) : []);
useEffect(() => { if (data) setTimeline(() => [...data.pages.flatMap(...)]); }, [data]);
```

**개선:** `useMemo`로 직접 파생 계산.
```tsx
const timeline = useMemo(() => data?.pages.flatMap(p => p.timeline_response_list) ?? [], [data]);
```

추가로 `convertDateFormat(date)` 3회 호출을 변수로 1회 호출로 최적화.

---

## 3. 공유 컴포넌트/훅 추출

### 3.1 PartyLogo 컴포넌트

**위치:** `app/timeline/components/PartyLogo.tsx`

9회 중복되는 정당 로고 렌더링을 하나의 컴포넌트로 추출.

```tsx
interface PartyLogoProps {
  partyInfo: PartyInfo;
  size?: number;          // default 22
  linkEnabled?: boolean;  // default true
  className?: string;
}
```

포함 기능: 무소속 처리, 다크모드 이미지 전환, Link 래핑(선택적).

### 3.2 useResponsivePagination 훅

**위치:** `app/timeline/hooks/useResponsivePagination.ts`

4개 컴포넌트에서 동일한 resize 리스너 + currentPage/itemsPerPage 로직을 추출.

```tsx
interface UseResponsivePaginationReturn<T> {
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  currentItems: T[];
  totalPages: number;
  itemsPerPage: number;
}

function useResponsivePagination<T>(
  items: T[],
  breakpoints?: { md?: number; lg?: number }
): UseResponsivePaginationReturn<T>;
```

기본 breakpoints: `{ md: 2, lg: 3 }` (기존 코드 동일).

### 3.3 TimelinePagination 컴포넌트

**위치:** `app/timeline/components/TimelinePagination.tsx`

prev/next 버튼 + dot indicator UI를 공유.

```tsx
interface TimelinePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}
```

순환 네비게이션(마지막→첫 페이지) 동작 유지. dot `key` 버그 수정 (`key={currentPage}` → `key={i}`).

---

## 4. 컴포넌트 합성 — BillOutlineList 통합

**현재:** `SubmittedList`와 `PromulgationList`는 구조가 거의 동일 (제목, 카운트 텍스트, 빈 상태 메시지만 다름).

**개선:** `BillOutlineList`로 통합, variant로 분기.

```tsx
type BillOutlineListVariant = 'submitted' | 'promulgation';

interface BillOutlineListProps {
  variant: BillOutlineListVariant;
  bills: BillOutline[];
}

const VARIANT_CONFIG = {
  submitted: {
    title: '법안 접수',
    countLabel: '접수된 법안',
    emptyLabel: '접수된 법안이 없습니다.',
  },
  promulgation: {
    title: '법안 공포',
    countLabel: '공포한 법안',
    emptyLabel: '공포된 법안이 없습니다.',
  },
} as const;
```

`PlenaryList`와 `CommitteeAuditList`는 구조가 충분히 다르므로 (투표 결과, 위원회 그룹핑) 별도 컴포넌트로 유지. 공유 훅/컴포넌트를 사용하여 중복을 제거.

**SubmittedList vs PromulgationList 미세 차이 해결:**
- 카드 로고 위치: SubmittedList는 `index === 0`일 때만 `-left-[39px]`, 나머지는 `left-0`. PromulgationList는 항상 `-left-[39px]`. → PromulgationList 방식(`-left-[39px]` 고정)을 채택. 모바일에서만 보이므로(`md:hidden`) 일관된 위치가 적절.
- CSS: `md:border` vs `md:border-1` → `md:border`로 통일 (Tailwind 표준).

---

## 5. 버그 수정

1. **PromulgationList 링크 버그:** 모달 내 `promulgation_list[currentPage].bill_id` → 루프 변수 `bill_id` 사용 (BillOutlineList 통합 시 자동 수정)
2. **페이지네이션 dot key 버그:** `key={currentPage}` → `key={i}` (TimelinePagination 추출 시 자동 수정)
3. **CommitteeAuditList prev 버튼 Math.ceil 누락:** `committee_audit_list.length / itemsPerPage - 1` → `Math.ceil(...) - 1` (useResponsivePagination 훅 추출 시 자동 수정)
4. **CommitteeAuditList 멀티모달 버그:** `isOpenIndividual` 하나의 상태로 N개 모달이 동시 열림 → 개별 위원회 ID 기반 상태로 수정
5. **CommitteeAuditList 불필요한 length 검사:** `.map()` 내부의 `committee_audit_list.length !== 0` 가드는 항상 true — 제거

---

## 6. Suspense + ErrorBoundary 추가

**현재:** `page.tsx`에서 `useSuspenseInfiniteQuery` 사용인데 Suspense 래핑 없음.

**개선:**
```tsx
// page.tsx
<ErrorBoundary FallbackComponent={TimelineErrorFallback}>
  <TimelineBoard />
  <Suspense fallback={<TimelineSkeleton />}>
    <ListContainer />
  </Suspense>
</ErrorBoundary>
```

- `TimelineBoard`는 일반 `useQuery`이므로 Suspense 밖에 위치
- `TimelineErrorFallback` — "타임라인을 불러올 수 없습니다" + 다시 시도 버튼
- `TimelineSkeleton` — 로딩 스켈레톤 UI
- `react-error-boundary` 패키지 사용 (메인 피드 리팩토링에서 이미 설치 예정)

---

## 7. TimelineModal 개선

- `onOpenChange`에 `onClose`를 직접 전달하면 boolean 인자가 무시됨. `open`/`onOpenChange` 패턴으로 정렬.
- **하드코딩된 제목 수정:** 현재 항상 "심사한 법안"으로 표시되지만, 접수/공포 맥락에서는 부적절. `title` prop을 추가하여 호출처에서 지정.

---

## 파일 구조 변경 요약

### 신규 생성

| 파일 | 책임 |
|------|------|
| `services/query-keys.ts` | timelineKeys 팩토리 |
| `services/apis.ts` | API 호출 (기존 services/index.ts 리네임) |
| `services/queries.ts` | React Query 훅 |
| `hooks/useResponsivePagination.ts` | 반응형 페이지네이션 훅 |
| `components/PartyLogo.tsx` | 정당 로고 공유 컴포넌트 |
| `components/TimelinePagination.tsx` | 페이지네이션 UI 공유 컴포넌트 |
| `components/BillOutlineList.tsx` | Submitted + Promulgation 통합 |
| `components/TimelineErrorFallback.tsx` | 에러 폴백 UI |
| `components/TimelineSkeleton.tsx` | 로딩 스켈레톤 UI |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `hooks/index.ts` | re-export only |
| `components/ListContainer.tsx` | useMemo 파생, convertDateFormat 최적화 |
| `components/PlenaryList.tsx` | 공유 컴포넌트 사용으로 축소 |
| `components/CommitteeAuditList.tsx` | 공유 컴포넌트 사용으로 축소 |
| `components/TimelineBoard.tsx` | optional chaining 개선 |
| `components/TimelineModal.tsx` | onOpenChange 패턴 정렬 |
| `components/index.tsx` | 배럴 파일 업데이트 |
| `page.tsx` | Suspense + ErrorBoundary 추가 |

### 삭제

| 파일 | 사유 |
|------|------|
| `components/SubmittedList.tsx` | BillOutlineList로 통합 |
| `components/PromulgationList.tsx` | BillOutlineList로 통합 |
| `services/index.ts` | apis.ts로 리네임 |

---

## 적용 규칙/패턴

| 영역 | 적용 규칙 |
|------|-----------|
| 서비스 분리 | 프로젝트 표준 (apis/queries/query-keys) |
| ListContainer | `rerender-derived-state-no-effect` |
| PartyLogo 추출 | DRY, 컴포넌트 합성 |
| useResponsivePagination | DRY, 커스텀 훅 추출 |
| BillOutlineList 통합 | `architecture-avoid-boolean-props`, `patterns-explicit-variants` |
| Suspense/ErrorBoundary | Next.js error boundary 필수 조합 |
| key 버그 | React reconciliation 최적화 |

## 개선 효과 요약

| 영역 | Before | After |
|------|--------|-------|
| 데이터 흐름 | useState + useEffect 동기화 | useMemo 파생 계산 |
| 정당 로고 | 9회 ~30줄 중복 | PartyLogo 단일 컴포넌트 |
| 페이지네이션 로직 | 4곳 ~25줄 중복 | useResponsivePagination 훅 |
| 페이지네이션 UI | 4곳 ~30줄 중복 | TimelinePagination 컴포넌트 |
| 컴포넌트 수 | Submitted + Promulgation 별도 | BillOutlineList variant 통합 |
| 에러 처리 | Suspense/ErrorBoundary 없음 | ErrorBoundary + Skeleton |
| 서비스 구조 | hooks/services 혼재 | 표준 3파일 분리 |
| 버그 | 링크 참조 오류, key 버그 | 수정 완료 |

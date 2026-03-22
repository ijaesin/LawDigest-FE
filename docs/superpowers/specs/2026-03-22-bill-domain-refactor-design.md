# Bill 도메인 코드 개선 Design Spec

**Date:** 2026-03-22
**Goal:** 선행 작업(main-feed-refactor)이 커버하지 않는 Bill 도메인의 타입 안전성, 코드 품질, React/Next.js 최신 패턴 준수를 개선한다.

**Constraint:** main-feed-refactor 플랜과의 도메인 겹침을 고려하여, 해당 플랜이 수정하는 파일(Feed.tsx, FeedTab.tsx, StageDropdown.tsx, BillList.tsx, useTabType.ts, useIntersect.ts, hooks/index.ts)은 직접 수정하지 않는다. 단, queries.ts와 Bill.tsx는 양쪽에서 다루지만 영역이 다르다 — 이 스펙에서는 main-feed-refactor가 다루지 않는 부분만 수정한다.

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, TypeScript strict, Tailwind CSS, shadcn/ui

---

## 수정 대상 파일

| 파일 | 변경 요약 |
|------|-----------|
| `app/bill/components/BillDetail.tsx` | useEffect 버그 수정, viewCount 로컬 상태 제거 |
| `app/bill/services/queries.ts` | `as any` 4건 제거, viewCount mutation 캐시 갱신 |
| `app/bill/components/HalfDonutChart.tsx` | D3 `null as any` 제거, rAF cleanup, tooltip 정리, useMemo 의존성 |
| `app/bill/components/AnotherBill.tsx` | router.push → Link, 조건부 preventDefault 제거 |
| `app/bill/components/ProposerList.tsx` | Zod 추론 타입 사용, ESLint suppress 제거, popover→variant |
| `app/bill/components/VoteResultBoard.tsx` | `.sort()` → `.toSorted()` |
| `app/bill/components/BillTab.tsx` | `as keyof typeof` 제거, 콜백 타입 개선 |
| `app/bill/components/GPTSummary.tsx` | 불필요한 loader prop 제거 |
| `app/bill/components/index.tsx` | 내부 전용 컴포넌트 배럴 export 제거 |

---

## 영역 1: BillDetail.tsx — useEffect 버그 수정 + 데이터 흐름 단순화

### 현재 문제

```tsx
// BillDetail.tsx
const [viewCount, setViewCount] = useState(data.bill_info_dto.view_count ?? 0);
const { mutate } = useMutateViewCount(id, {
  onSuccess: (res) => setViewCount(res.view_count),
});

useEffect(() => {
  const baseViewCount = data.bill_info_dto.view_count ?? 0;
  setViewCount(baseViewCount);
  mutate(); // data.bill_info_dto.view_count 변경 시마다 재호출
}, [data.bill_info_dto.view_count, mutate]);
```

- `useEffect` 의존성에 `data.bill_info_dto.view_count`와 `mutate`가 있어, 캐시 갱신 시 반복 호출됨
- `viewCount`를 `useState`로 관리하는 파생 상태 안티패턴

### 설계

1. `useMutateViewCount`의 `onSuccess`에서 React Query 캐시(`billKeys.detail(billId)`)의 `view_count`를 직접 갱신
2. BillDetail에서 `viewCount` 로컬 상태 제거 — `data.bill_info_dto.view_count`를 직접 사용
3. `mutate()`는 `useEffect(fn, [])` (빈 의존성) + ref 패턴으로 마운트 시 1회만 호출
4. **BillDetail.tsx의 `onSuccess` 콜백 전달 제거** — 캐시 갱신은 `useMutateViewCount` 내부에서 처리
5. **import 정리** — `useState` 제거, `useRef`와 `useEffect`만 유지

```tsx
// BillDetail.tsx — After
import { useEffect, useRef } from 'react';

export default function BillDetail({ id }: { id: string }) {
  const { data } = useGetBillDetail(id);
  const { mutate } = useMutateViewCount(id); // onSuccess 콜백 전달 없음
  const hasMutated = useRef(false);

  useEffect(() => {
    if (!hasMutated.current) {
      hasMutated.current = true;
      mutate();
    }
  }, [mutate]);

  return (
    <section>
      <Bill {...data} detail viewCount={data.bill_info_dto.view_count}>
        {/* children 동일 */}
      </Bill>
      {/* ... */}
    </section>
  );
}
```

```tsx
// queries.ts — useMutateViewCount 수정
export const useMutateViewCount = (billId: string, options?: ...) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => patchViewCount(billId),
    ...options,
    onSuccess: (data, variables, context) => {
      // 캐시 직접 갱신
      qc.setQueryData(billKeys.detail(billId), (old: BillDetail | undefined) => {
        if (!old) return old;
        return {
          ...old,
          bill_info_dto: { ...old.bill_info_dto, view_count: data.view_count },
        };
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(extractApiMessage(error));
      options?.onError?.(error, variables, context);
    },
  });
};
```

---

## 영역 2: queries.ts — `as any` 제거

### 현재 문제

```tsx
onSuccess: (data, variables, context) => {
  options?.onSuccess?.(data, variables, context as any); // L92
},
onError: (error, variables, context) => {
  options?.onError?.(error as any, variables as any, context as any); // L96
},
```

### 설계

`options`를 spread한 후 콜백을 override하는 현재 패턴에서, 제네릭 파라미터를 정확히 지정하면 `as any`가 불필요해진다:

```tsx
export const useMutateViewCount = (
  billId: string,
  options?: Omit<UseMutationOptions<ViewCountResponse, Error, void, unknown>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation<ViewCountResponse, Error, void, unknown>({
    mutationFn: () => patchViewCount(billId),
    onSuccess: (data, variables, context) => {
      qc.setQueryData(billKeys.detail(billId), (old: BillDetail | undefined) => {
        if (!old) return old;
        return {
          ...old,
          bill_info_dto: { ...old.bill_info_dto, view_count: data.view_count },
        };
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error(extractApiMessage(error));
      options?.onError?.(error, variables, context);
    },
  });
};
```

핵심: `TError`와 `TContext`에 임의 제네릭 대신 concrete 타입(`Error`, `unknown`)을 지정하여 options와 실제 콜백 사이의 타입 불일치를 해소.

---

## 영역 3: HalfDonutChart.tsx — D3 타입 + 애니메이션 cleanup

### 3-1. `null as any` 제거 (3건 모두)

D3 arc generator에 `DefaultArcObject`를 명시적으로 전달하여 `null as any` 3건을 모두 제거한다:

**배경 아크 (L303):**
```tsx
const backgroundArcPath = arc({
  innerRadius, outerRadius,
  startAngle: -Math.PI / 2, endAngle: Math.PI / 2,
});
// JSX: <path d={backgroundArcPath ?? ''} ... />
```

**진행 아크 (L307):**
```tsx
const progressArcPath = progressArc({
  innerRadius, outerRadius,
  startAngle: -Math.PI / 2,
  endAngle: (animatedValue / 100) * Math.PI - Math.PI / 2,
});
// JSX: <path d={progressArcPath ?? ''} ... />
```

**정당별 서브 아크 (L240, partyArcs useMemo 내부):**
```tsx
const arcPath = d3.arc()
  .innerRadius(subInnerRadius)
  .outerRadius(subOuterRadius)
  .startAngle(adjustedStartAngle)
  .endAngle(finalEndAngle)
  .cornerRadius(cornerRadius / 2)({
    innerRadius: subInnerRadius,
    outerRadius: subOuterRadius,
    startAngle: adjustedStartAngle,
    endAngle: finalEndAngle,
  });
```

### 3-2. requestAnimationFrame cleanup

```tsx
useEffect(() => {
  const startValue = prevTotalValueRef.current;
  const duration = 1000;
  const startTime = Date.now();
  let rafId: number;

  const animateValue = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutProgress = 1 - (1 - progress) ** 3;
    const currentValue = startValue + (approvalPercentage - startValue) * easeOutProgress;
    setAnimatedValue(currentValue);

    if (progress < 1) {
      rafId = requestAnimationFrame(animateValue);
    } else {
      setAnimatedValue(approvalPercentage);
      prevTotalValueRef.current = approvalPercentage;
    }
  };

  rafId = requestAnimationFrame(animateValue);
  return () => cancelAnimationFrame(rafId);
}, [approvalPercentage]);
```

### 3-3. Tooltip dead code 정리

`visible: false`로 고정된 tooltip 관련 상태와 핸들러를 제거하고, TODO 주석만 유지:

```tsx
// TODO: 툴팁 UI 수정 후 다시 활성화
// tooltip 상태, handleMouseEnter, handleMouseLeave, handleMouseMove 및
// JSX 내 tooltip 렌더링 블록 제거
```

### 3-4. useMemo 의존성 정리

`partyArcs`의 `useMemo` 의존성에서 미사용 `totalVoteCount` 제거.

---

## 영역 4: AnotherBill.tsx — 네비게이션 패턴

### 현재 문제

```tsx
// 문제 1: router.push in onClick
<Avatar onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  if (party_image_url !== null) router.push(`/party/${party_id}`);
}}>

// 문제 2: Link with conditional preventDefault
<Link href={party[0].party_image_url !== null ? `/party/${party[0].party_id}` : '#'}
  onClick={(e) => { if (party[0].party_image_url === null) e.preventDefault(); }}>
```

### 설계

```tsx
// 다수 정당 — Avatar를 Link로 래핑
{party.map(({ party_image_url, party_id, party_name }) =>
  party_image_url !== null ? (
    <Link href={`/party/${party_id}`} key={party_id}>
      <Avatar className={`bg-white dark:bg-dark-l p-1 border ${party_name}`}>
        {/* ... */}
      </Avatar>
    </Link>
  ) : (
    <Avatar key={party_id} className={`bg-white dark:bg-dark-l p-1 border ${party_name}`}>
      {/* ... */}
    </Avatar>
  )
)}

// 단일 정당 — party_image_url null 시 Link 대신 div
{party[0].party_image_url !== null ? (
  <Link href={`/party/${party[0].party_id}`}>
    {/* Image components */}
  </Link>
) : (
  <div>
    <PartyLogoReplacement partyName={party[0].party_name} circle={false} />
  </div>
)}
```

`useRouter` import 제거 가능 (더 이상 사용하지 않음).

**Null guard 추가:** 다수 정당 Avatar 내부의 `AvatarImage`에서 `party_image_url.replace('wide', 'dark')`를 호출하는데, `party_image_url`이 null일 수 있으므로 null인 경우 `AvatarImage`를 렌더링하지 않고 `AvatarFallback`만 표시한다.

---

## 영역 5: ProposerList.tsx — 타입 + ESLint 정리

### 설계

1. 인라인 타입을 Zod 추론 타입으로 교체:

```tsx
import type { z } from 'zod';
import type { RepresentativeProposerSchema, PublicProposerSchema } from '@/app/bill/validation';

interface ProposerListProps {
  representativeProposerList: z.infer<typeof RepresentativeProposerSchema>[];
  publicProposerList: z.infer<typeof PublicProposerSchema>[];
  variant?: 'default' | 'popover';
}
```

2. `popover` boolean → `variant` prop. 호출처 마이그레이션:
   - `BillDetail.tsx` L36: `popover={false}` → prop 제거 (default)
   - `BillProposerSection.tsx` L65: `popover` → `variant="popover"`
   - `app/user/components/BillBookmarked.tsx` L58: `popover` → `variant="popover"`

3. ESLint suppress 제거:
   - `no-nested-ternary` (L83): `.toSorted()` 내 ternary를 `localeCompare` 사용으로 대체
   - `no-unused-prop-types` (L48): `.map()` 콜백의 인라인 타입에서 발생하는 false positive — `sortByParty` 반환 타입을 명시하여 인라인 타입 어노테이션 자체를 제거

---

## 영역 6: VoteResultBoard.tsx — 원본 배열 변이 수정

```tsx
// Before
party_vote_list.sort((a, b) => b.party_approval_count - a.party_approval_count)

// After
party_vote_list.toSorted((a, b) => b.party_approval_count - a.party_approval_count)
```

---

## 영역 7: BillTab.tsx — 타입 캐스트 제거

```tsx
// Before
<TabsTrigger
  key={BILL_TAB[value as keyof typeof BILL_TAB]}
  value={BILL_TAB[value as keyof typeof BILL_TAB]}

// After — siteConfig.billTabs의 value 타입을 BILL_TAB 키로 지정
{values.map(({ label, value }) => (
  <TabsTrigger key={value} value={BILL_TAB[value]}>
    {label}
  </TabsTrigger>
))}
```

`clickHandler` 타입도 `(value: string) => void`로 단순화 (Tabs `onValueChange`와 일치).

---

## 영역 8: GPTSummary.tsx — loader 제거

```tsx
// Before
<Image src="/images/gpt.png" ... loader={({ src }) => `${src}`} />

// After
<Image src="/images/gpt.png" ... unoptimized />
```

---

## 영역 9: index.tsx 배럴 정리

외부 모듈에서 import되는 컴포넌트만 export. 내부 전용 컴포넌트(SectionContainer, GPTSummary)는 배럴에서 제거.

---

## 병합 순서 참고

`queries.ts`는 main-feed-refactor(Task 6: `useMutateBookmark`)와 본 스펙(영역 2: `useMutateViewCount`)이 동시에 수정한다. 두 변경은 다른 함수를 대상으로 하므로 충돌 가능성은 낮으나, 가능하면 main-feed-refactor를 먼저 병합한 뒤 본 스펙의 변경을 적용하는 것을 권장한다.

---

## 변경하지 않는 것

| 대상 | 이유 |
|------|------|
| `bill.schema.ts` | 백엔드 계약 미확정, TODO 주석 존재 |
| `ProcessResult.tsx` | switch-case 패턴 적절 |
| `ProgressStage.tsx` | 현재 구조 적절 |
| `BillContainer.tsx` / `SectionContainer.tsx` | thin wrapper로 적절 |
| HalfDonutChart 반응형 | 디자인 변경 수반, 별도 작업 |
| HalfDonutChart tooltip 재구현 | 기존 TODO 범위, 별도 작업 |

---

## 적용 규칙 매핑

| 영역 | 적용 규칙 |
|------|-----------|
| 1 | `rerender-derived-state-no-effect`, `advanced-event-handler-refs` |
| 2 | TypeScript strict, React Query v5 generics |
| 3 | `rendering-animate-svg-wrapper`, cleanup 패턴, `rerender-dependencies` |
| 4 | Next.js `<Link>` 우선, `patterns-explicit-variants` |
| 5 | `architecture-avoid-boolean-props`, Zod type inference |
| 6 | `js-tosorted-immutable` |
| 7 | TypeScript strict, shadcn Tabs API |
| 8 | Next.js Image optimization |
| 9 | `bundle-barrel-imports` |

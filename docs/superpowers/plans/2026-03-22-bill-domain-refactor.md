# Bill 도메인 코드 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 선행 작업(main-feed-refactor)이 커버하지 않는 Bill 도메인의 타입 안전성, 코드 품질, React/Next.js 패턴을 개선한다.

**Architecture:** queries.ts의 `as any` 제거 및 캐시 갱신 패턴 적용, BillDetail의 파생 상태 제거, HalfDonutChart의 D3 타입 안전성 확보 및 rAF cleanup, AnotherBill의 네비게이션 패턴 정상화, ProposerList 타입 개선, 소규모 컴포넌트 정리.

**Tech Stack:** Next.js 15, React 19, TanStack React Query v5, Zod, TypeScript strict, Tailwind CSS, shadcn/ui

**Spec:** `docs/superpowers/specs/2026-03-22-bill-domain-refactor-design.md`

---

## File Structure

### 수정 대상 파일

| 파일 | 책임 | 변경 내용 |
|------|------|-----------|
| `app/bill/services/queries.ts` | React Query 훅 | `as any` 4건 제거, `useMutateViewCount`에 캐시 갱신 추가 |
| `app/bill/components/BillDetail.tsx` | 상세 페이지 오케스트레이터 | viewCount 로컬 상태 제거, mutate 1회 호출 |
| `app/bill/components/HalfDonutChart.tsx` | D3 투표 시각화 | `null as any` 3건 제거, rAF cleanup, tooltip dead code 제거, useMemo 의존성 |
| `app/bill/components/AnotherBill.tsx` | 유사 법안 카드 | router.push → Link, 조건부 preventDefault 제거, null guard |
| `app/bill/components/ProposerList.tsx` | 발의자 명단 | Zod 추론 타입, popover→variant, ESLint suppress 제거 |
| `app/bill/components/VoteResultBoard.tsx` | 정당별 투표 결과 | `.sort()` → `.toSorted()` |
| `app/bill/components/BillTab.tsx` | 발의자 타입 탭 | `as keyof typeof` 제거, 콜백 타입 개선 |
| `app/bill/components/GPTSummary.tsx` | GPT 귀속 표시 | loader prop 제거 |
| `app/bill/components/index.tsx` | 배럴 export | 내부 전용 컴포넌트 제거 |

### 영향 받는 소비자 파일 (호환성 확인 필요)

| 파일 | 확인 사항 |
|------|-----------|
| `app/bill/components/BillProposerSection.tsx` | `popover` → `variant="popover"` prop 변경 |
| `app/user/components/BillBookmarked.tsx` | `popover` → `variant="popover"` prop 변경 |

---

## Task 1: queries.ts `as any` 제거 + useMutateViewCount 캐시 갱신

**Files:**
- Modify: `app/bill/services/queries.ts:84-98` (useMutateViewCount)

**배경:** `useMutateViewCount`의 onSuccess/onError 콜백에서 `as any` 4건이 사용된다. 제네릭 파라미터를 concrete 타입으로 지정하고, onSuccess에서 React Query 캐시를 직접 갱신하여 BillDetail의 로컬 상태 의존을 제거한다.

- [ ] **Step 1: useMutateViewCount 수정**

```tsx
// app/bill/services/queries.ts — useMutateViewCount 교체
export const useMutateViewCount = (
  billId: string,
  options?: Omit<UseMutationOptions<ViewCountResponse, Error, void, unknown>, 'mutationFn'>,
) => {
  const qc = useQueryClient();
  return useMutation<ViewCountResponse, Error, void, unknown>({
    mutationFn: () => patchViewCount(billId),
    ...options,
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

- [ ] **Step 2: useQueryClient import 추가 확인**

`useQueryClient`는 이미 import되어 있음 (L7). `BillDetail` 타입 import가 필요한지 확인:

```tsx
// L16에 BillDetail이 이미 import되어 있는지 확인
import type { PopularFeed, BillDetail, BookmarkResponse, ViewCountResponse, Feed } from '@/app/bill/validation';
```

- [ ] **Step 3: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS — `as any` 4건 제거 확인

- [ ] **Step 4: Commit**

```bash
git add app/bill/services/queries.ts
git commit -m "refactor: useMutateViewCount as any 제거 및 캐시 갱신 추가"
```

---

## Task 2: BillDetail.tsx viewCount 로컬 상태 제거

**Files:**
- Modify: `app/bill/components/BillDetail.tsx`

**배경:** Task 1에서 `useMutateViewCount`가 캐시를 직접 갱신하므로, BillDetail의 `useState(viewCount)` + `useEffect` + `onSuccess` 콜백이 불필요해진다. `data.bill_info_dto.view_count`를 직접 사용한다.

- [ ] **Step 1: BillDetail.tsx 수정**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { Separator } from '@/app/common/components/ui/separator';
import { useGetBillDetail, useMutateViewCount } from '@/app/bill/hooks';
import Bill from './Bill';
import SectionContainer from './SectionContainer';
import ProposerList from './ProposerList';
import ProgressStage from './ProgressStage';
import AnotherBillList from './AnotherBillList';
import ProcessResult from './ProcessResult';

export default function BillDetail({ id }: { id: string }) {
  const { data } = useGetBillDetail(id);
  const { mutate } = useMutateViewCount(id);
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
        <section className="md:w-[300px] lg:w-[490px] md:float-right flex flex-col gap-[34px] mt-[34px]">
          <SectionContainer title="발의자 명단">
            <ProposerList
              representativeProposerList={data.representative_proposer_dto_list}
              publicProposerList={data.public_proposer_dto_list}
            />
          </SectionContainer>

          <Separator className="hidden md:block h-[1px] w-full border-gray-1 dark:border-dark-l" />

          <SectionContainer title="심사 진행 단계">
            <ProgressStage billStage={data.bill_info_dto.bill_stage} />
          </SectionContainer>

          <Separator className="hidden md:block h-[1px] w-full border-gray-1 dark:border-dark-l" />

          <SectionContainer title="법안 처리 결과">
            <ProcessResult
              approval_count={data.vote_result_response.approval_count}
              total_vote_count={data.vote_result_response.total_vote_count}
              party_vote_list={data.vote_result_response.party_vote_list}
              bill_result={data.bill_info_dto.bill_result}
            />
          </SectionContainer>
        </section>
      </Bill>

      <div className="md:w-[calc(100%-340px)] lg:w-[calc(100%-530px)] border-r-[1px] md:dark:border-dark-l px-4 pt-[34px]">
        <SectionContainer>
          <AnotherBillList {...data} />
        </SectionContainer>
      </div>
    </section>
  );
}
```

주요 변경:
- `useState` → `useRef` (import 변경)
- `onSuccess` 콜백 전달 제거
- `viewCount` 로컬 상태 제거 → `data.bill_info_dto.view_count` 직접 전달
- `popover={false}` prop 제거 (Task 5에서 ProposerList variant 기본값으로 처리)

- [ ] **Step 2: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/bill/components/BillDetail.tsx
git commit -m "refactor: BillDetail viewCount 로컬 상태 제거, mutate 1회 호출"
```

---

## Task 3: HalfDonutChart.tsx D3 타입 + rAF cleanup + tooltip 정리

**Files:**
- Modify: `app/bill/components/HalfDonutChart.tsx`

**배경:**
- `null as any` 3건 — D3 arc generator 호출 시 타입 불일치
- `requestAnimationFrame` cleanup 미구현
- tooltip 핸들러 dead code (visible: false 고정)
- `useMemo` 의존성에서 미사용 `totalVoteCount`

- [ ] **Step 1: tooltip 상태 및 핸들러 제거**

삭제 대상:
- `tooltip` useState (L73-82)
- `handleMouseEnter` (L254-278)
- `handleMouseLeave` (L280-282)
- `handleMouseMove` (L285-296)
- JSX 내 tooltip 렌더링 블록 (L363-397)
- 서브 아크 path의 `onMouseEnter`, `onMouseLeave`, `onMouseMove` props (L331-333)

추가: TODO 주석 유지
```tsx
// TODO: 툴팁 UI 수정 후 다시 활성화 — 관련 코드 제거됨, git history 참조
```

- [ ] **Step 2: requestAnimationFrame cleanup 구현**

기존 useEffect (L88-117)를 교체:

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

- [ ] **Step 3: D3 `null as any` 3건 제거**

배경 아크 (L303):
```tsx
// Before
<path d={arc(null as any) as string} fill="#e6e6e6" ... />

// After — arc 정의 시 결과를 변수로 추출
const backgroundArcPath = arc({
  innerRadius, outerRadius,
  startAngle: -Math.PI / 2, endAngle: Math.PI / 2,
});

// JSX
<path d={backgroundArcPath ?? ''} fill="#e6e6e6" ... />
```

진행 아크 (L307):
```tsx
// Before
<path d={progressArc(null as any) as string} fill={progressColor} ... />

// After
const progressArcPath = progressArc({
  innerRadius, outerRadius,
  startAngle: -Math.PI / 2,
  endAngle: (animatedValue / 100) * Math.PI - Math.PI / 2,
});

// JSX
<path d={progressArcPath ?? ''} fill={progressColor} ... />
```

서브 아크 (L240, partyArcs useMemo 내부):
```tsx
// Before
.cornerRadius(cornerRadius / 2)(null as any);

// After
.cornerRadius(cornerRadius / 2)({
  innerRadius: subInnerRadius,
  outerRadius: subOuterRadius,
  startAngle: adjustedStartAngle,
  endAngle: finalEndAngle,
});
```

- [ ] **Step 4: useMemo 의존성 정리**

partyArcs useMemo (L251):
```tsx
// Before
}, [partyVoteList, totalVoteCount, animatedValue]);

// After
}, [partyVoteList, animatedValue]);
```

- [ ] **Step 5: 불필요한 import 정리**

tooltip 제거 후 미사용 import가 있으면 정리. `svgRef`는 아크 렌더링에도 사용되므로 유지.

- [ ] **Step 6: typecheck 및 lint 확인**

Run: `npm run typecheck && npm run lint`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add app/bill/components/HalfDonutChart.tsx
git commit -m "refactor: HalfDonutChart D3 null as any 제거, rAF cleanup, tooltip dead code 정리"
```

---

## Task 4: AnotherBill.tsx 네비게이션 패턴 개선

**Files:**
- Modify: `app/bill/components/AnotherBill.tsx`

**배경:** `router.push()`를 onClick에서 사용하고, `<Link>`에 조건부 `preventDefault()` 호출하는 안티패턴을 수정한다.

- [ ] **Step 1: AnotherBill.tsx 수정**

```tsx
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/app/common/components/ui/card';
import { Badge } from '@/app/common/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/common/components/ui/avatar';
import Link from 'next/link';
import { PartyLogoReplacement } from '@/app/party/components';

export default function AnotherBill({
  billBriefSummary,
  billId,
  billProposers,
  billStage,
  party,
}: {
  billBriefSummary: string;
  billId: string;
  billProposers: string;
  billStage: string;
  party: {
    party_id: number;
    party_image_url: string;
    party_name: string;
  }[];
}) {
  const isRepresentativeSolo = party.length === 1;
  const partyName = isRepresentativeSolo ? party[0].party_name : '다수';

  return (
    <Card className={`border-1.5 flex-row md:py-2 ${partyName} rounded-md`}>
      <CardContent className="flex gap-2 justify-between">
        <Link href={`/bill/${billId}`}>
          <p className="text-sm font-bold lg:text-lg">{billBriefSummary}</p>
        </Link>
        <div className="flex gap-2 items-center w-full">
          <Badge variant="outline" className="text-xs lg:text-sm">
            {billStage}
          </Badge>
          <h4 className="text-xs font-semibold lg:text-sm text-gray-2 shrink-0">{billProposers}</h4>
        </div>
      </CardContent>
      <CardFooter className="flex overflow-visible justify-center pl-0 basis-1/4 shrink-0">
        {isRepresentativeSolo ? (
          party[0].party_image_url !== null ? (
            <Link href={`/party/${party[0].party_id}`}>
              <Image
                className="dark:hidden object-contain w-[60px] h-[30px] lg:w-[120px] lg:h-[30px]"
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party[0].party_image_url}`}
                width={60}
                height={30}
                alt={`${party[0].party_name} 이미지`}
              />
              <Image
                className="hidden dark:block object-contain w-[60px] h-[30px] lg:w-[120px] lg:h-[30px]"
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party[0].party_image_url.replace('wide', 'dark')}`}
                width={60}
                height={30}
                alt={`${party[0].party_name} 이미지`}
              />
            </Link>
          ) : (
            <PartyLogoReplacement partyName={party[0].party_name} circle={false} />
          )
        ) : (
          <div className="flex -space-x-4">
            {party.map(({ party_image_url, party_id, party_name }) =>
              party_image_url !== null ? (
                <Link href={`/party/${party_id}`} key={party_id}>
                  <Avatar className={`bg-white dark:bg-dark-l p-1 border ${party_name}`}>
                    <AvatarImage
                      className="object-contain dark:hidden"
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url}`}
                    />
                    <AvatarImage
                      className="hidden object-contain dark:block"
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${party_image_url.replace('wide', 'dark')}`}
                    />
                    <AvatarFallback>{party_name[0]}</AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Avatar key={party_id} className={`bg-white dark:bg-dark-l p-1 border ${party_name}`}>
                  <AvatarFallback>{party_name[0]}</AvatarFallback>
                </Avatar>
              ),
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
```

주요 변경:
- `useRouter` import 제거
- 단일 정당: `<Link href="#">` + preventDefault → null 분기로 Link 또는 plain 컴포넌트
- 다수 정당: `router.push()` onClick → `<Link>` 래핑
- `party_image_url` null일 때 `.replace()` 호출 방지 — AvatarFallback만 표시

- [ ] **Step 2: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/bill/components/AnotherBill.tsx
git commit -m "refactor: AnotherBill router.push를 Link로 교체, 조건부 preventDefault 제거"
```

---

## Task 5: ProposerList.tsx 타입 개선 + ESLint suppress 제거

**Files:**
- Modify: `app/bill/components/ProposerList.tsx`
- Modify: `app/bill/components/BillProposerSection.tsx` (호출처)
- Modify: `app/user/components/BillBookmarked.tsx` (호출처)

**배경:** 인라인 prop 타입을 Zod 추론 타입으로 교체하고, `popover` boolean을 `variant`로 변경하며, ESLint suppress를 제거한다.

- [ ] **Step 1: ProposerList.tsx 수정**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/app/common/components/ui/card';
import { Badge } from '@/app/common/components/ui/badge';
import { sortByParty } from '@/app/common/utils';
import type { z } from 'zod';
import type { RepresentativeProposerSchema, PublicProposerSchema } from '@/app/bill/validation';

type RepresentativeProposer = z.infer<typeof RepresentativeProposerSchema>;
type PublicProposer = z.infer<typeof PublicProposerSchema>;

interface ProposerListProps {
  representativeProposerList: RepresentativeProposer[];
  publicProposerList: PublicProposer[];
  variant?: 'default' | 'popover';
}

export default function ProposerList({
  representativeProposerList,
  publicProposerList,
  variant = 'default',
}: ProposerListProps) {
  const representativeProposerLength = representativeProposerList.length;
  const publicProposerLength = publicProposerList.length;
  const proposerListByParty = sortByParty({ publicProposerList });

  const compareByName = (a: string[], b: string[]) => a[1].localeCompare(b[1]);

  return (
    <Card className={`lg:shadow-none dark:lg:bg-dark-pb ${variant === 'popover' ? 'shadow-none dark:lg:bg-transparent' : ''}`}>
      <CardHeader>
        <p className="font-medium">
          {representativeProposerLength === 1
            ? representativeProposerList[0].representative_proposer_name
            : representativeProposerList
                .map(({ representative_proposer_name }) => representative_proposer_name)
                .join('·')}{' '}
          <span className="text-sm font-normal">{`등 ${publicProposerLength}인`}</span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5 my-[18px]">
          {proposerListByParty.map(({ party, proposers }: { party: string; proposers: string[][] }) => (
            <div key={party} className="flex items-center gap-10">
              <div className="relative">
                <Link
                  href={`/party/${proposers[0][0]}`}
                  className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg shrink-0 border-1.5 ${party}`}>
                  {party === '무소속' ? (
                    <div className="text-xs font-medium text-black">무소속</div>
                  ) : (
                    <>
                      <Image
                        className="dark:hidden"
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${proposers[0][1]}`}
                        width={30}
                        height={30}
                        alt={`${party} 로고 이미지`}
                      />
                      <Image
                        className="hidden dark:block"
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${proposers[0][1].replace('wide', 'dark')}`}
                        width={30}
                        height={30}
                        alt={`${party} 로고 이미지`}
                      />
                    </>
                  )}
                </Link>
                <Badge variant="destructive" className="absolute -top-1 -right-2">
                  {proposers.length - 1}
                </Badge>
              </div>
              <div className="grid grid-cols-5 text-sm gap-x-[10px] gap-y-1">
                {proposers
                  .slice(1)
                  .toSorted(compareByName)
                  .map((proposer) => (
                    <Link href={`/congressman/${proposer[0]}`} key={proposer[0]} className="whitespace-nowrap">
                      {proposer[1].length === 2 ? (
                        <div className="flex justify-between">
                          {proposer[1].split('').map((char, i) => (
                            <p key={`${proposer[0]}-${i}`}>{char}</p>
                          ))}
                        </div>
                      ) : (
                        proposer[1]
                      )}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

주요 변경:
- 파일 상단 `/* eslint-disable no-nested-ternary */` 제거
- 인라인 타입 → Zod 추론 타입
- `popover: boolean` → `variant?: 'default' | 'popover'`
- nested ternary in `.toSorted()` → `localeCompare` 비교 함수 추출
- `eslint-disable-next-line react/no-unused-prop-types` 제거 (타입 정리로 해소)
- `char`를 key로 사용하던 것 → `${proposer[0]}-${i}`로 유니크 key 보장

- [ ] **Step 2: 호출처 마이그레이션 — BillProposerSection.tsx**

`popover` → `variant="popover"`:

```tsx
// Before (L65 부근)
<ProposerList
  representativeProposerList={representativeProposerList}
  publicProposerList={publicProposerList}
  popover
/>

// After
<ProposerList
  representativeProposerList={representativeProposerList}
  publicProposerList={publicProposerList}
  variant="popover"
/>
```

- [ ] **Step 3: 호출처 마이그레이션 — BillBookmarked.tsx**

```tsx
// Before (L55-58)
<ProposerList
  representativeProposerList={representative_proposer_dto_list}
  publicProposerList={public_proposer_dto_list}
  popover
/>

// After
<ProposerList
  representativeProposerList={representative_proposer_dto_list}
  publicProposerList={public_proposer_dto_list}
  variant="popover"
/>
```

- [ ] **Step 4: BillDetail.tsx의 `popover={false}` 확인**

Task 2에서 이미 `popover={false}` prop을 제거했으므로 추가 변경 불필요. variant 기본값이 `'default'`이므로 호환.

- [ ] **Step 5: typecheck 및 lint 확인**

Run: `npm run typecheck && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/bill/components/ProposerList.tsx app/bill/components/BillProposerSection.tsx app/user/components/BillBookmarked.tsx
git commit -m "refactor: ProposerList Zod 타입 적용, popover→variant, ESLint suppress 제거"
```

---

## Task 6: VoteResultBoard, BillTab, GPTSummary 소규모 개선

**Files:**
- Modify: `app/bill/components/VoteResultBoard.tsx`
- Modify: `app/bill/components/BillTab.tsx`
- Modify: `app/bill/components/GPTSummary.tsx`
- Modify: `app/congressman/components/BillContainer.tsx` (BillTab 소비자 — 캐스트 정리)
- Modify: `app/party/components/BillContainer.tsx` (BillTab 소비자 — `as any` 제거)

**배경:** 각각 단독으로는 커밋하기에 작은 변경이므로 하나의 태스크로 묶는다.

- [ ] **Step 1: VoteResultBoard.tsx — `.sort()` → `.toSorted()`**

```tsx
// Before (L18-19)
{party_vote_list
  .sort((a, b) => b.party_approval_count - a.party_approval_count)

// After
{party_vote_list
  .toSorted((a, b) => b.party_approval_count - a.party_approval_count)
```

- [ ] **Step 2: BillTab.tsx — 타입 캐스트 제거**

```tsx
import { Tabs, TabsList, TabsTrigger } from '@/app/common/components/ui/tabs';
import { siteConfig } from '@/app/common/config/site';
import { BILL_TAB } from '@/app/bill/constants';
import type { ValueOf } from '@/app/common/types';

export default function BillTab({
  type,
  clickHandler,
}: {
  type: ValueOf<typeof BILL_TAB>;
  clickHandler: (value: string) => void;
}) {
  const values = siteConfig.billTabs;

  return (
    <section className="w-full lg:min-w-[840px]">
      <Tabs value={type} onValueChange={clickHandler} className="w-full">
        <TabsList className="p-0 w-full h-auto bg-transparent rounded-none border-b border-divider">
          {values.map(({ label, value }) => (
            <TabsTrigger
              key={BILL_TAB[value]}
              value={BILL_TAB[value]}
              className="px-0 h-10 mx-2 text-base font-medium bg-transparent shadow-none rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:text-black dark:data-[state=active]:text-white">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </section>
  );
}
```

변경: `value as keyof typeof BILL_TAB` → `value` (siteConfig이 `as const`이므로 타입 안전), `Key` import 제거, `clickHandler` 타입을 `(value: string) => void`로 변경.

- [ ] **Step 3: BillTab 소비자 파일 캐스트 정리**

`app/congressman/components/BillContainer.tsx` (L37):
```tsx
// Before
<BillTab type={billType as ValueOf<typeof BILL_TAB>} clickHandler={setBillType as (key: Key) => void} />

// After
<BillTab type={billType as ValueOf<typeof BILL_TAB>} clickHandler={setBillType} />
```
`Key` import도 제거.

`app/party/components/BillContainer.tsx` (L37):
```tsx
// Before
<BillTab type={billType as any} clickHandler={setBillType as any} />

// After
<BillTab type={billType as ValueOf<typeof BILL_TAB>} clickHandler={setBillType} />
```

참고: 두 파일의 `billType as ValueOf<typeof BILL_TAB>` 캐스트는 `useTabType`의 반환 타입 문제에서 기인하며, main-feed-refactor Task 2에서 `useTabType` 튜플 반환 타입 명시로 해소될 예정. 현 시점에서는 캐스트를 유지한다.

- [ ] **Step 4: GPTSummary.tsx — loader prop 제거**

```tsx
// Before
<Image src="/images/gpt.png" alt="gpt-logo" width={25} height={25} priority loader={({ src }) => `${src}`} />

// After
<Image src="/images/gpt.png" alt="gpt-logo" width={25} height={25} priority unoptimized />
```

- [ ] **Step 5: typecheck 및 lint 확인**

Run: `npm run typecheck && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/bill/components/VoteResultBoard.tsx app/bill/components/BillTab.tsx app/bill/components/GPTSummary.tsx app/congressman/components/BillContainer.tsx app/party/components/BillContainer.tsx
git commit -m "refactor: VoteResultBoard immutable sort, BillTab 타입 캐스트 제거, GPTSummary loader 제거"
```

---

## Task 7: index.tsx 배럴 파일 정리

**Files:**
- Modify: `app/bill/components/index.tsx`

**배경:** 내부 전용 컴포넌트들이 배럴에서 불필요하게 re-export되고 있다. `Bill.tsx`에서 직접 import하는 컴포넌트(`BillCardFooter`, `BillSummaryContent`, `BillProposerSection`, `GPTSummary`, `SectionContainer`)는 외부 모듈에서 사용하지 않으므로 배럴에서 제거한다.

- [ ] **Step 1: 내부 전용 컴포넌트 export 제거**

```tsx
import AnotherBill from './AnotherBill';
import AnotherBillList from './AnotherBillList';
import Bill from './Bill';
import BillContainer from './BillContainer';
import BillDetail from './BillDetail';
import BillList from './BillList';
import BillTab from './BillTab';
import Feed from './Feed';
import FeedTab from './FeedTab';
import HalfDonutChart from './HalfDonutChart';
import ProcessResult from './ProcessResult';
import ProgressStage from './ProgressStage';
import ProposerList from './ProposerList';
import StageDropdown from './StageDropdown';
import VoteResultBoard from './VoteResultBoard';

export {
  AnotherBill,
  AnotherBillList,
  Bill,
  BillContainer,
  BillDetail,
  BillList,
  BillTab,
  Feed,
  FeedTab,
  HalfDonutChart,
  ProgressStage,
  ProposerList,
  ProcessResult,
  StageDropdown,
  VoteResultBoard,
};
```

제거된 export: `GPTSummary`, `SectionContainer`, `BillCardFooter`, `BillSummaryContent`, `BillProposerSection`
제거된 import: 해당 5개 항목

- [ ] **Step 2: 외부 소비자 확인**

제거 대상 5개 컴포넌트가 `app/bill/components/` 외부에서 배럴을 통해 import되지 않는지 확인:

Run: `grep -rE "GPTSummary|SectionContainer|BillCardFooter|BillSummaryContent|BillProposerSection" app/ --include="*.tsx" --include="*.ts" | grep -v "app/bill/components/"`
Expected: 결과 없음

- [ ] **Step 3: typecheck 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/bill/components/index.tsx
git commit -m "refactor: 배럴 파일에서 내부 전용 컴포넌트 export 제거"
```

---

## 적용 규칙 매핑

| Task | 적용 규칙 |
|------|-----------|
| Task 1 | TypeScript strict, React Query v5 cache update |
| Task 2 | `rerender-derived-state-no-effect`, `advanced-event-handler-refs` |
| Task 3 | D3 typing, rAF cleanup, `rerender-dependencies`, dead code 제거 |
| Task 4 | Next.js `<Link>` 우선, null safety |
| Task 5 | Zod type inference, `architecture-avoid-boolean-props`, `js-tosorted-immutable` |
| Task 6 | `js-tosorted-immutable`, TypeScript strict, Next.js Image |
| Task 7 | `bundle-barrel-imports` |

## 요약 — 개선 효과

| 영역 | Before | After |
|------|--------|-------|
| **타입 안전성** | `as any` 8건 (queries 4, chart 3, tab 1) | 0건 |
| **데이터 흐름** | BillDetail: useState + useEffect 동기화 | React Query 캐시 직접 갱신 |
| **메모리 안전** | HalfDonutChart rAF cleanup 없음 | cleanup 구현 |
| **네비게이션** | router.push + 조건부 preventDefault | Link 컴포넌트 + JSX 분기 |
| **코드 품질** | ESLint suppress 3건, dead code | suppress 제거, dead code 정리 |
| **불변성** | VoteResultBoard props 배열 직접 변이 | `.toSorted()` 사용 |

# Search 도메인 리팩터링 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Search 도메인의 코드 품질을 bill/timeline 수준으로 개선하고, PartyLogo 공통 컴포넌트를 전 도메인에 적용한다.

**Architecture:** 서비스 레이어 3-file 분리, 파생 상태 제거, 최근 검색어 서버 API 전환(인증/비인증 분기), SearchModal을 shadcn Dialog로 전환, PartyLogo를 common으로 통합하여 전 도메인에서 재사용한다.

**Tech Stack:** Next.js 15, React 19, TanStack React Query, Zustand, shadcn/ui (Dialog), Zod, cookies-next

**Spec:** `docs/superpowers/specs/2026-03-22-search-domain-refactor-design.md`

---

## File Structure

### 신규 생성

- `app/common/components/PartyLogo.tsx` — 공통 PartyLogo 컴포넌트
- `app/search/services/apis.ts` — API 호출 함수
- `app/search/services/queries.ts` — React Query hooks
- `app/search/services/query-keys.ts` — Query key factory

### 수정

- `app/search/[id]/page.tsx` — 파생 상태 제거, mutation hook 적용
- `app/search/components/SearchModal.tsx` — Dialog 전환, 서버 API 적용
- `app/search/components/SearchBar.tsx` — prop drilling 제거, mutation hook 적용
- `app/search/components/SearchBarButton.tsx` — 불필요한 useCallback 제거
- `app/search/components/SearchParty.tsx` — PartyLogo 공통 컴포넌트 적용
- `app/search/components/index.tsx` — 배럴 파일 정리
- `app/search/hooks/index.ts` → re-export 후 삭제
- `app/timeline/components/PlenaryList.tsx` — import 경로 변경
- `app/timeline/components/CommitteeAuditList.tsx` — import 경로 변경
- `app/timeline/components/BillOutlineList.tsx` — import 경로 변경
- `app/timeline/components/index.tsx` — PartyLogo export 제거
- `app/congressman/components/CongressmanDetail.tsx` — PartyLogo 교체 (이미 변경 시 무시)
- `app/congressman/components/index.tsx` — PartyLogo export 제거 (이미 변경 시 무시)
- `app/party/components/PartyDetail.tsx` — PartyLogo 교체
- `app/party/components/index.tsx` — PartyLogoReplacement export 제거
- `app/bill/components/AnotherBill.tsx` — PartyLogoReplacement → PartyLogo
- `app/bill/components/BillProposerSection.tsx` — PartyLogoReplacement → PartyLogo
- `app/user/components/BillBookmarked.tsx` — PartyLogoReplacement → PartyLogo
- `app/following/components/CongressmanItem.tsx` — PartyLogoReplacement → PartyLogo

### 삭제

- `app/search/services/index.ts` — 3-file로 분리 후 삭제
- `app/search/hooks/index.ts` — queries.ts로 이관 후 삭제
- `app/timeline/components/PartyLogo.tsx` — common으로 이관
- `app/congressman/components/PartyLogo.tsx` — common으로 이관 (이미 변경 시 무시)
- `app/party/components/PartyLogo.tsx` — common으로 이관
- `app/party/components/PartyLogoReplacement.tsx` — common PartyLogo에 통합

---

## Task 1: PartyLogo 공통 컴포넌트 생성

**Files:**

- Create: `app/common/components/PartyLogo.tsx`

PartyLogo는 3가지 variant를 지원한다:

- `badge`: 작은 원형 (timeline 카드, 28px 기본)
- `wide`: 가로형 이미지 (의원 상세, 법안 카드 등)
- `hero`: 큰 원형 (정당 상세, 130px)

모든 variant에서 light/dark 이미지 전환, null/무소속 텍스트 fallback, 선택적 Link 래핑을 처리한다.

- [ ] **Step 1: PartyLogo 공통 컴포넌트 작성**

```tsx
// app/common/components/PartyLogo.tsx
import Link from 'next/link';
import Image from 'next/image';

type PartyLogoVariant = 'badge' | 'wide' | 'hero';

interface PartyLogoProps {
  partyName: string;
  partyImageUrl: string | null;
  partyId?: number;
  variant?: PartyLogoVariant;
  /** Image width in px (badge: 22, wide: 60, hero: 100 by default) */
  imageWidth?: number;
  /** Image height in px (badge: 22, wide: 30, hero: 45 by default) */
  imageHeight?: number;
  linkEnabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const VARIANT_DEFAULTS: Record<PartyLogoVariant, { containerClass: string; imageWidth: number; imageHeight: number }> =
  {
    badge: {
      containerClass: 'flex items-center justify-center w-7 h-7 rounded-full shadow-lg shrink-0 border-1.5',
      imageWidth: 22,
      imageHeight: 22,
    },
    wide: {
      containerClass: 'flex items-center',
      imageWidth: 60,
      imageHeight: 30,
    },
    hero: {
      containerClass: 'flex items-center justify-center shadow-lg rounded-full w-[130px] h-[130px] border',
      imageWidth: 100,
      imageHeight: 45,
    },
  };

export default function PartyLogo({
  partyName,
  partyImageUrl,
  partyId,
  variant = 'badge',
  imageWidth,
  imageHeight,
  linkEnabled = false,
  className = '',
  style,
}: PartyLogoProps) {
  const defaults = VARIANT_DEFAULTS[variant];
  const w = imageWidth ?? defaults.imageWidth;
  const h = imageHeight ?? defaults.imageHeight;

  const isCircular = variant === 'badge' || variant === 'hero';
  const containerClass = `${defaults.containerClass} ${partyName} ${className}`;

  // Null image or 무소속 → text fallback
  const isFallback = !partyImageUrl || partyName === '무소속';

  const fallbackContent = isCircular ? (
    <span className="text-xs font-bold text-black dark:text-white">
      {partyName === '무소속' ? '무' : partyName.slice(0, 2)}
    </span>
  ) : (
    <span className="text-lg font-semibold text-center text-gray-3">{partyName}</span>
  );

  const imageContent = !isFallback ? (
    <>
      <Image
        className={`dark:hidden ${variant === 'wide' ? 'object-contain' : ''}`}
        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${partyImageUrl}`}
        alt={`${partyName} 로고 이미지`}
        width={w}
        height={h}
      />
      <Image
        className={`hidden dark:block ${variant === 'wide' ? 'object-contain' : ''}`}
        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${partyImageUrl!.replace('wide', 'dark')}`}
        alt={`${partyName} 로고 이미지`}
        width={w}
        height={h}
      />
    </>
  ) : null;

  const content = isFallback ? fallbackContent : imageContent;

  if (linkEnabled && partyId != null) {
    return (
      <Link href={`/party/${partyId}`} className={containerClass} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <div className={containerClass} style={style}>
      {content}
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS — 신규 파일이라 기존 코드에 영향 없음

- [ ] **Step 3: Commit**

```bash
git add app/common/components/PartyLogo.tsx
git commit -m "feat: PartyLogo 공통 컴포넌트 생성"
```

---

## Task 2: Timeline 도메인 PartyLogo 교체

**Files:**

- Modify: `app/timeline/components/PlenaryList.tsx:12` — import 변경
- Modify: `app/timeline/components/CommitteeAuditList.tsx:10` — import 변경
- Modify: `app/timeline/components/BillOutlineList.tsx:11` — import 변경
- Modify: `app/timeline/components/index.tsx` — PartyLogo export 제거
- Delete: `app/timeline/components/PartyLogo.tsx`

Timeline의 PartyLogo는 `partyInfo: PartyInfo` 객체를 받으므로, 공통 컴포넌트 호출 시 필드를 매핑해야 한다.

- [ ] **Step 1: PlenaryList import 및 사용 변경**

```tsx
// Before
import PartyLogo from './PartyLogo';
// <PartyLogo partyInfo={bill_info.party_info[0]} />

// After
import PartyLogo from '@/app/common/components/PartyLogo';
// <PartyLogo partyName={bill_info.party_info[0].party_name} partyImageUrl={bill_info.party_info[0].party_image_url} />
```

모든 `<PartyLogo partyInfo={...}>`를 `partyName`, `partyImageUrl` 분해로 교체. `className`, `style` props는 그대로 전달.

- [ ] **Step 2: CommitteeAuditList import 및 사용 변경**

동일한 패턴으로 변경. `party_info[0]`에서 필드 분해.

- [ ] **Step 3: BillOutlineList import 및 사용 변경**

동일한 패턴으로 변경.

- [ ] **Step 4: index.tsx에서 PartyLogo export 제거**

`app/timeline/components/index.tsx`에서 PartyLogo re-export 라인 제거.

- [ ] **Step 5: 기존 PartyLogo.tsx 삭제**

`app/timeline/components/PartyLogo.tsx` 삭제.

- [ ] **Step 6: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add -A app/timeline/components/
git commit -m "refactor: timeline PartyLogo를 공통 컴포넌트로 교체"
```

---

## Task 3: Congressman/Party/Bill/Following/User 도메인 PartyLogo 교체

**Files:**

- Modify: `app/congressman/components/CongressmanDetail.tsx` (이미 변경 시 무시)
- Modify: `app/congressman/components/index.tsx` (이미 변경 시 무시)
- Delete: `app/congressman/components/PartyLogo.tsx` (이미 변경 시 무시)
- Modify: `app/party/components/PartyDetail.tsx`
- Modify: `app/party/components/index.tsx`
- Delete: `app/party/components/PartyLogo.tsx`
- Delete: `app/party/components/PartyLogoReplacement.tsx`
- Modify: `app/bill/components/AnotherBill.tsx`
- Modify: `app/bill/components/BillProposerSection.tsx`
- Modify: `app/user/components/BillBookmarked.tsx`
- Modify: `app/following/components/CongressmanItem.tsx`

- [ ] **Step 1: Congressman 도메인 (이미 변경 시 무시)**

CongressmanDetail에서:

```tsx
// Before
import PartyLogo from './PartyLogo';
<PartyLogo party_id={party_id} party_name={party_name} party_image_url={party_image_url} />;

// After
import PartyLogo from '@/app/common/components/PartyLogo';
<PartyLogo
  partyName={party_name}
  partyImageUrl={party_image_url}
  partyId={party_id}
  variant="wide"
  imageWidth={64}
  imageHeight={30}
  linkEnabled
/>;
```

congressman의 PartyLogo.tsx 삭제, index.tsx에서 export 제거.

- [ ] **Step 2: Party 도메인**

PartyDetail에서:

```tsx
// Before
import PartyLogo from './PartyLogo';
<PartyLogo party_name={party_name} party_img_url={party_img_url} />;

// After
import PartyLogo from '@/app/common/components/PartyLogo';
<PartyLogo partyName={party_name} partyImageUrl={party_img_url} variant="hero" />;
```

party의 `PartyLogo.tsx` 삭제. `PartyLogoReplacement.tsx`는 다른 도메인 교체 완료 후 삭제.

- [ ] **Step 3: Following 도메인 — CongressmanItem**

```tsx
// Before
import { PartyLogoReplacement } from '@/app/party/components';
// 조건부: Image 2개 (light/dark) or PartyLogoReplacement

// After
import PartyLogo from '@/app/common/components/PartyLogo';
<PartyLogo
  partyName={party_name}
  partyImageUrl={party_image_url}
  partyId={party_id}
  variant="wide"
  imageWidth={60}
  imageHeight={20}
  linkEnabled
  className="hidden xl:block"
/>;
```

기존 조건부 렌더링 블록(Image + PartyLogoReplacement) 전체를 PartyLogo 한 줄로 교체.

- [ ] **Step 4: Bill 도메인 — BillProposerSection**

```tsx
// Before
import { PartyLogoReplacement } from '@/app/party/components';
<PartyLogoReplacement partyName={partyName} circle={false} />;

// After
import PartyLogo from '@/app/common/components/PartyLogo';
<PartyLogo partyName={partyName} partyImageUrl={null} variant="wide" />;
```

Note: BillProposerSection은 partyImageUrl이 데이터에 없으므로 항상 null 전달.

- [ ] **Step 5: Bill 도메인 — AnotherBill**

단일 정당 케이스의 Image + PartyLogoReplacement를 교체:

```tsx
// 단일 정당 케이스 (isRepresentativeSolo === true)
// Before: 조건부 Image/PartyLogoReplacement
// After:
<PartyLogo
  partyName={party[0].party_name}
  partyImageUrl={party[0].party_image_url}
  partyId={party[0].party_id}
  variant="wide"
  imageWidth={60}
  imageHeight={30}
  linkEnabled
/>
```

다중 정당 Avatar 스택 패턴은 그대로 유지 (다른 UI 패턴).

- [ ] **Step 6: User 도메인 — BillBookmarked**

단일 정당 케이스 교체:

```tsx
// Before: Link + 조건부 Image/PartyLogoReplacement (href="#" 안티패턴 포함)
// After:
<PartyLogo
  partyName={representative_proposer_dto_list[0].party_name}
  partyImageUrl={representative_proposer_dto_list[0].party_image_url}
  partyId={representative_proposer_dto_list[0].party_id}
  variant="wide"
  imageWidth={60}
  imageHeight={30}
  linkEnabled
  className="object-contain w-[60px] h-[30px] md:w-[90px] md:h-[45px]"
/>
```

다중 정당 Avatar 스택 패턴은 그대로 유지.

- [ ] **Step 7: PartyLogoReplacement 삭제 및 index.tsx 정리**

`app/party/components/PartyLogoReplacement.tsx` 삭제.
`app/party/components/index.tsx`에서 PartyLogoReplacement export 제거.

- [ ] **Step 8: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add -A app/congressman/ app/party/ app/bill/ app/following/ app/user/
git commit -m "refactor: 전 도메인 PartyLogo를 공통 컴포넌트로 교체"
```

---

## Task 4: 서비스 레이어 3-file 분리

**Files:**

- Create: `app/search/services/apis.ts`
- Create: `app/search/services/queries.ts`
- Create: `app/search/services/query-keys.ts`
- Delete: `app/search/services/index.ts`
- Modify: `app/search/hooks/index.ts` → re-export
- Modify: `app/search/[id]/page.tsx` — import 경로 수정

- [ ] **Step 1: query-keys.ts 생성**

```tsx
// app/search/services/query-keys.ts
export const searchKeys = {
  root: () => ['search'] as const,
  congressmanParty: (searchWord: string) => [...searchKeys.root(), 'congressmanParty', searchWord] as const,
  bill: (searchWord: string) => [...searchKeys.root(), 'bill', searchWord] as const,
  recentKeywords: () => [...searchKeys.root(), 'recentKeywords'] as const,
};
```

- [ ] **Step 2: apis.ts 생성**

`services/index.ts`의 API 함수 5개를 그대로 이동 (변경 없음).

- [ ] **Step 3: queries.ts 생성**

기존 `hooks/index.ts`의 `useGetSearchCongressmanParty`, `useInfiniteSearchBill`을 이동하고 최근검색어 mutation hooks를 추가:

```tsx
// app/search/services/queries.ts
'use client';

import {
  useQuery,
  useMutation,
  useSuspenseInfiniteQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type UseSuspenseInfiniteQueryOptions,
  type InfiniteData,
} from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import { ACCESS_TOKEN } from '@/app/common/constants';
import type { SearchCongressmanPartyResponse, SearchBillResponse, SearchKeywordList } from '@/app/search/validation';
import {
  getSearchCongressmanParty,
  getSearchBill,
  getRecentKeywords,
  postRecentKeyword,
  deleteRecentKeyword,
} from './apis';
import { searchKeys } from './query-keys';

export { searchKeys };

// 기존 hooks (변경 없음)
export const useGetSearchCongressmanParty = <TData = SearchCongressmanPartyResponse, TError = unknown>(
  searchWord: string,
  options?: Omit<
    UseQueryOptions<SearchCongressmanPartyResponse, TError, TData, ReturnType<typeof searchKeys.congressmanParty>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: searchKeys.congressmanParty(searchWord),
    queryFn: () => getSearchCongressmanParty(searchWord),
    ...options,
  });

export const useInfiniteSearchBill = (
  searchWord: string,
  options?: Omit<
    UseSuspenseInfiniteQueryOptions<
      SearchBillResponse,
      unknown,
      InfiniteData<SearchBillResponse>,
      ReturnType<typeof searchKeys.bill>,
      number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) =>
  useSuspenseInfiniteQuery({
    queryKey: searchKeys.bill(searchWord),
    queryFn: ({ pageParam = 0 }) => getSearchBill(searchWord, pageParam),
    initialPageParam: 0,
    getNextPageParam: (data) =>
      data.pagination_response.last_page ? undefined : data.pagination_response.page_number + 1,
    ...options,
  });

// 최근 검색어 hooks (신규)
export const useGetRecentKeywords = (
  options?: Omit<
    UseQueryOptions<SearchKeywordList, unknown, SearchKeywordList, ReturnType<typeof searchKeys.recentKeywords>>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: searchKeys.recentKeywords(),
    queryFn: getRecentKeywords,
    enabled: !!getCookie(ACCESS_TOKEN),
    ...options,
  });

export const usePostRecentKeyword = (options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postRecentKeyword,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recentKeywords() });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useDeleteRecentKeyword = (options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRecentKeyword,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recentKeywords() });
      options?.onSuccess?.(data, variables, context);
    },
  });
};
```

- [ ] **Step 4: 기존 파일 삭제 및 import 수정**

- `app/search/services/index.ts` 삭제
- `app/search/hooks/index.ts` → `services/queries.ts` re-export로 변경, 또는 삭제
- `app/search/[id]/page.tsx`의 import를 `@/app/search/services/queries`로 수정

- [ ] **Step 5: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add -A app/search/services/ app/search/hooks/ app/search/[id]/page.tsx
git commit -m "refactor: search 서비스 레이어 3-file 분리"
```

---

## Task 5: 파생 상태 제거 (search/[id]/page.tsx)

**Files:**

- Modify: `app/search/[id]/page.tsx`

- [ ] **Step 1: useState + useEffect 제거, useMemo로 교체**

```tsx
// Before
const [searchResultsCP, setSearchResultsCP] = useState(dataCP ? dataCP.search_response : []);
const [searchResultsBill, setSearchResultsBill] = useState(
  dataBill ? dataBill.pages.flatMap(({ search_response: responses }) => responses) : [],
);
useEffect(() => {
  if (dataCP) setSearchResultsCP(() => [...dataCP.search_response]);
  if (dataBill) setSearchResultsBill(() => [...dataBill.pages.flatMap(...)]);
}, [dataCP, dataBill]);
useEffect(() => { refetchCP(); refetchBill(); }, [dataCP, dataBill]);

// After
const searchResultsCP = dataCP?.search_response ?? [];
const searchResultsBill = useMemo(
  () => dataBill?.pages.flatMap(({ search_response }) => search_response) ?? [],
  [dataBill],
);
```

- `useState` 2개 제거
- `useEffect` 2개 제거 (특히 무한루프 위험 refetch 제거)
- `refetch` 디스트럭처링 제거

- [ ] **Step 2: 불필요한 import 정리**

`useState`, `useEffect` import 제거 (사용처 없으면). `useMemo` import 추가.

- [ ] **Step 3: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/search/[id]/page.tsx
git commit -m "refactor: search 결과 페이지 파생 상태 안티패턴 제거"
```

---

## Task 6: SearchModal → shadcn Dialog 전환 + 최근 검색어 서버 API 적용

**Files:**

- Modify: `app/search/components/SearchModal.tsx`
- Modify: `app/search/components/SearchBar.tsx`

이 Task는 SearchModal과 SearchBar를 함께 수정한다. 두 컴포넌트가 최근검색어 상태를 공유하므로 동시에 작업해야 한다.

- [ ] **Step 1: SearchBar 수정 — prop drilling 제거, mutation hook 적용**

```tsx
// app/search/components/SearchBar.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getCookie } from 'cookies-next';
import { IconSearchbar, IconX } from '@/public/svgs';
import { Input } from '@/app/common/components/ui/input';
import { Button } from '@/app/common/components/ui/button';
import { useSearchModalStore } from '@/app/common/store';
import { ACCESS_TOKEN } from '@/app/common/constants';
import { usePostRecentKeyword } from '@/app/search/services/queries';

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const show = useSearchModalStore((s) => s.show);
  const close = useSearchModalStore((s) => s.close);
  const { mutate: saveKeyword } = usePostRecentKeyword();

  const onSubmitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = value.trim();
    if (!keyword) {
      setValue('');
      return;
    }

    // 인증 사용자: 서버 API로 저장
    if (getCookie(ACCESS_TOKEN)) {
      saveKeyword(keyword);
    } else {
      // 비인증: localStorage fallback
      const stored: string[] = JSON.parse(localStorage.getItem('recentKeywords') || '[]');
      const updated = [...stored.filter((v) => v !== keyword), keyword].slice(-10);
      localStorage.setItem('recentKeywords', JSON.stringify(updated));
    }

    router.push(`/search/${keyword}`);
    setValue('');
    close();
  };

  const onClear = () => {
    setValue('');
  };

  return (
    <form
      onSubmit={onSubmitSearch}
      className="w-full rounded-2xl flex justify-center items-center gap-[10px] md:w-[600px] mx-auto my-5">
      <div className="relative w-full">
        <Input
          autoFocus={show}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="법안, 의원, 정당명으로 검색"
          className="h-10 pr-10 truncate shadow-sm"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 w-6 h-6">
            <IconX />
          </Button>
        )}
        <Button type="submit" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8">
          <IconSearchbar />
        </Button>
      </div>
    </form>
  );
}
```

주요 변경:

- `setRecentKeywords` prop 제거
- `useCallback` 제거 (불필요)
- 인증/비인증 분기 최근검색어 저장
- `onClear`에서 `router.push('/search')` 제거 (clear는 입력만 초기화)

- [ ] **Step 2: SearchModal 수정 — Dialog 전환 + 서버 API 적용**

```tsx
// app/search/components/SearchModal.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';
import { useSearchModalStore } from '@/app/common/store';
import { Badge } from '@/app/common/components/ui/badge';
import { Button } from '@/app/common/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/common/components/ui/dialog';
import { IconX } from '@/public/svgs';
import { ACCESS_TOKEN } from '@/app/common/constants';
import { useGetRecentKeywords, useDeleteRecentKeyword } from '@/app/search/services/queries';
import type { SearchKeywordList } from '@/app/search/validation';
import SearchBar from './SearchBar';

function useRecentKeywords() {
  const isAuthenticated = !!getCookie(ACCESS_TOKEN);
  const { data: serverKeywords } = useGetRecentKeywords({ enabled: isAuthenticated });
  const [localKeywords, setLocalKeywords] = useState<string[]>([]);
  const { mutate: deleteServerKeyword } = useDeleteRecentKeyword();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocalKeywords(JSON.parse(localStorage.getItem('recentKeywords') || '[]'));
    }
  }, [isAuthenticated]);

  const keywords: string[] = isAuthenticated ? (serverKeywords?.map((k) => k.search_word) ?? []) : localKeywords;

  const removeKeyword = (keyword: string) => {
    if (isAuthenticated) {
      deleteServerKeyword(keyword);
    } else {
      const updated = localKeywords.filter((v) => v !== keyword);
      setLocalKeywords(updated);
      localStorage.setItem('recentKeywords', JSON.stringify(updated));
    }
  };

  const removeAll = () => {
    if (isAuthenticated) {
      // 서버에 전체 삭제 API가 없으므로 개별 삭제
      keywords.forEach((keyword) => deleteServerKeyword(keyword));
    } else {
      setLocalKeywords([]);
      localStorage.setItem('recentKeywords', JSON.stringify([]));
    }
  };

  return { keywords, removeKeyword, removeAll };
}

export default function SearchModal() {
  const router = useRouter();
  const show = useSearchModalStore((s) => s.show);
  const close = useSearchModalStore((s) => s.close);
  const { keywords, removeKeyword, removeAll } = useRecentKeywords();

  const onClickChip = (searchWord: string) => {
    router.push(`/search/${searchWord}`);
    close();
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-[640px] top-[10%] translate-y-0 sm:top-[10%] sm:translate-y-0">
        <DialogHeader>
          <DialogTitle className="sr-only">검색</DialogTitle>
        </DialogHeader>
        <SearchBar />

        <section className="flex flex-col gap-7">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold md:text-xl">최근 검색어</h2>
            <Button variant="link" size="sm" className="text-gray-2" onClick={removeAll}>
              모두 지우기
            </Button>
          </div>
          <div className="flex gap-[10px] flex-wrap">
            {keywords.length > 0 ? (
              keywords.map((keyword) => (
                <Badge key={keyword} variant="outline" className="cursor-pointer" onClick={() => onClickChip(keyword)}>
                  <span className="max-w-[240px] truncate">{keyword}</span>
                  <button
                    type="button"
                    aria-label="최근 검색어 삭제"
                    className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeKeyword(keyword);
                    }}>
                    <IconX className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-3 dark:text-gray-2">최근 검색어가 존재하지 않습니다.</p>
            )}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
```

주요 변경:

- `useRecentKeywords` 커스텀 훅으로 인증/비인증 분기 추상화
- shadcn `Dialog`로 전환 — 포커스 트랩, ESC, aria 자동 확보
- `setRecentKeywords` prop drilling 완전 제거
- `useCallback` 제거 (단순 함수)
- 최근검색어 10개 제한은 서버 측에서 관리, localStorage는 `slice(-10)`으로 관리

- [ ] **Step 3: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/search/components/SearchModal.tsx app/search/components/SearchBar.tsx
git commit -m "refactor: SearchModal을 shadcn Dialog로 전환, 최근 검색어 서버 API 적용"
```

---

## Task 7: 컴포넌트 정리

**Files:**

- Modify: `app/search/components/SearchBarButton.tsx`
- Modify: `app/search/components/SearchParty.tsx`
- Modify: `app/search/components/index.tsx`

- [ ] **Step 1: SearchBarButton — 불필요한 useCallback 제거**

```tsx
// Before
const onClickSearchBar = useCallback(() => { open(); }, [open]);

// After: open()을 직접 onClick에 전달
<div onClick={open} ...>
```

`useCallback`, `useCallback` import 제거.

- [ ] **Step 2: SearchParty — PartyLogo 공통 컴포넌트 적용**

```tsx
// Before
import Image from 'next/image';
import { PartyLogoReplacement } from '@/app/party/components';
// 조건부 Image + PartyLogoReplacement 렌더링

// After
import PartyLogo from '@/app/common/components/PartyLogo';

export default function SearchParty({ party_id, party_name, party_image_url }: SearchCongressmanParty) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-6 items-center">
        <PartyLogo
          partyName={party_name}
          partyImageUrl={party_image_url || null}
          variant="badge"
          imageWidth={40}
          imageHeight={16}
          className="w-[54px] h-[54px]"
        />
        <p className="text-lg font-semibold">{party_name}</p>
      </div>
      <Link href={`/party/${party_id}`}>
        <EnterButton />
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: 배럴 파일 정리**

```tsx
// app/search/components/index.tsx
// 내부 전용 컴포넌트 제거
export { default as SearchBarButton } from './SearchBarButton';
export { default as SearchList } from './SearchList';
export { default as SearchModal } from './SearchModal';
```

SearchBar, SearchCongressman, SearchParty는 내부에서만 사용되므로 export 제거.

- [ ] **Step 4: 빌드 확인**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/search/components/
git commit -m "refactor: search 컴포넌트 정리 (PartyLogo 적용, useCallback 제거, 배럴 정리)"
```

---

## Task 8: 최종 검증

- [ ] **Step 1: TypeScript 체크**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 2: Lint 체크**

Run: `npm run lint`
Expected: PASS (또는 기존 warning만)

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: 테스트**

Run: `npm test`
Expected: 기존 테스트 통과

- [ ] **Step 5: 사용하지 않는 파일 잔존 확인**

- `app/search/services/index.ts` 삭제 확인
- `app/search/hooks/index.ts` 삭제 확인
- `app/timeline/components/PartyLogo.tsx` 삭제 확인
- `app/congressman/components/PartyLogo.tsx` 삭제 확인 (이미 변경 시 무시)
- `app/party/components/PartyLogo.tsx` 삭제 확인
- `app/party/components/PartyLogoReplacement.tsx` 삭제 확인

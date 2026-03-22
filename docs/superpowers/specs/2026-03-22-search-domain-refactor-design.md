# Search 도메인 리팩터링 설계

## 목표

Search 도메인의 코드 품질을 다른 리팩터링된 도메인(bill, timeline, common)과 동일한 수준으로 개선한다. 파생 상태 안티패턴 제거, 서비스 레이어 표준화, 최근 검색어 서버 API 전환, SearchModal 접근성 개선, PartyLogo 공통 컴포넌트 통합을 수행한다.

## 현황 분석

### 문제점

1. **파생 상태 안티패턴** — `search/[id]/page.tsx`에서 `useState + useEffect`로 React Query 데이터를 복제
2. **무한루프 위험** — `useEffect(() => { refetchCP(); refetchBill(); }, [dataCP, dataBill])` — data 변경 시 refetch → data 변경 → 무한 루프
3. **localStorage 직접 관리** — 서버 API(`postRecentKeyword`, `getRecentKeywords`, `deleteRecentKeyword`)가 이미 정의되어 있으나 미사용. SearchModal은 localStorage로 직접 관리
4. **서비스 레이어 비표준** — `services/index.ts` 단일 파일 + `hooks/index.ts` 혼합 구조. 3-file 패턴 미적용
5. **SearchModal 접근성 부재** — 수동 fixed overlay. 포커스 트랩, ESC 닫기, aria 속성 없음
6. **PartyLogo 중복** — 4개 도메인에 각각 별도 구현 존재 (`timeline`, `congressman`, `party`, `search`)
7. **불필요한 useCallback** — `SearchBarButton`의 `onClickSearchBar`는 단순 호출
8. **배럴 파일 과다 export** — 내부 전용 컴포넌트(SearchCongressman, SearchParty)까지 export

---

## 설계

### Area 1: 서비스 레이어 3-file 분리

**현재:** `services/index.ts` (API 함수) + `hooks/index.ts` (query keys + hooks)

**변경:**

```
services/
├── apis.ts          # 기존 API 함수 5개 이동 (변경 없음)
├── queries.ts       # React Query hooks (기존 hooks/index.ts에서 이동 + 최근검색어 hooks 추가)
└── query-keys.ts    # searchKeys factory 분리
```

- `hooks/index.ts`는 `services/queries.ts` re-export로 하위 호환 유지
- 모든 사용처 마이그레이션 후 `hooks/index.ts` 삭제

### Area 2: 파생 상태 제거 (`search/[id]/page.tsx`)

**현재:**
```tsx
const [searchResultsCP, setSearchResultsCP] = useState(dataCP ? dataCP.search_response : []);
const [searchResultsBill, setSearchResultsBill] = useState(...);

useEffect(() => {
  if (dataCP) setSearchResultsCP([...dataCP.search_response]);
  if (dataBill) setSearchResultsBill([...dataBill.pages.flatMap(...)]);
}, [dataCP, dataBill]);

useEffect(() => { refetchCP(); refetchBill(); }, [dataCP, dataBill]); // 무한루프 위험
```

**변경:**
```tsx
const searchResultsCP = dataCP?.search_response ?? [];
const searchResultsBill = useMemo(
  () => dataBill?.pages.flatMap(({ search_response }) => search_response) ?? [],
  [dataBill],
);
```

- `useState` 2개 + `useEffect` 2개 제거
- React Query 캐시가 단일 소스

### Area 3: 최근 검색어 서버 API 전환

**현재:** SearchModal + SearchBar가 localStorage로 직접 관리, `setRecentKeywords` prop drilling

**변경:**

- **인증 사용자:** React Query hooks (`useGetRecentKeywords`, `usePostRecentKeyword`, `useDeleteRecentKeyword`, `useDeleteAllRecentKeywords`) 사용
- **비인증 사용자:** localStorage fallback 유지
- `getCookie(ACCESS_TOKEN)` 존재 여부로 인증 판별
- `setRecentKeywords` prop drilling 제거 → React Query 캐시 또는 localStorage 훅이 단일 소스

**queries.ts에 추가할 hooks:**

```tsx
export const useGetRecentKeywords = (options?) =>
  useQuery({
    queryKey: searchKeys.recentKeywords(),
    queryFn: getRecentKeywords,
    ...options,
  });

export const usePostRecentKeyword = (options?) =>
  useMutation({
    mutationFn: postRecentKeyword,
    onSuccess: (_, __, ___) => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recentKeywords() });
      options?.onSuccess?.(...);
    },
    ...options,
  });

export const useDeleteRecentKeyword = (options?) =>
  useMutation({
    mutationFn: deleteRecentKeyword,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: searchKeys.recentKeywords() }),
    ...options,
  });
```

### Area 4: SearchModal → shadcn Dialog 전환

**현재:** 수동 `fixed` overlay + Zustand `show` 상태

**변경:**
- shadcn `Dialog` 컴포넌트 사용 (`DialogContent`, `DialogHeader`, `DialogTitle`)
- Zustand `useSearchModalStore` 유지 — `open` 값을 Dialog의 `open` prop에 바인딩, `close`를 `onOpenChange`에 바인딩
- 접근성 자동 확보: 포커스 트랩, ESC 닫기, aria 속성
- SearchBar는 Dialog 내부에서 autoFocus로 렌더링

### Area 5: PartyLogo 공통 컴포넌트

**현재:** 4개 도메인에 각각 별도 구현

| 도메인 | 파일 | 인터페이스 |
|--------|------|-----------|
| timeline | `PartyLogo.tsx` | `partyInfo: PartyInfo`, `size`, `linkEnabled`, `className`, `style` |
| congressman | `PartyLogo.tsx` | `party_id`, `party_name`, `party_image_url` (flat) |
| party | `PartyLogo.tsx` | `party_name`, `party_img_url` (large hero) |
| party | `PartyLogoReplacement.tsx` | `partyName`, `circle` (text fallback) |

**변경:** `app/common/components/PartyLogo.tsx` 신규 생성

```tsx
interface PartyLogoProps {
  partyId?: number;
  partyName: string;
  partyImageUrl: string | null;
  size?: 'sm' | 'md' | 'lg';       // sm: 28px, md: 54px, lg: 130px
  linkEnabled?: boolean;             // default: false
  className?: string;
  style?: React.CSSProperties;
}
```

- `partyImageUrl === null` 또는 `partyName === '무소속'` → 텍스트 fallback (기존 PartyLogoReplacement 기능 흡수)
- light/dark 모드 이미지 전환 내장
- `linkEnabled` + `partyId` 조합으로 Link 렌더링 조건부 처리
- `size` variant로 크기 관리 (숫자 `size` prop은 커스텀 용도로 별도 유지 가능)

**교체 범위:**
- timeline: `PartyLogo` → common 교체, 기존 삭제
- congressman: `PartyLogo` → common 교체, 기존 삭제 (이미 변경 시 무시)
- party: `PartyLogo` + `PartyLogoReplacement` → common 교체, 기존 삭제
- search: `SearchParty` 내 직접 렌더링 → common `PartyLogo` 사용
- bill: `AnotherBill`, `BillProposerSection` 내 `PartyLogoReplacement` → common 교체
- following: `CongressmanItem` 내 `PartyLogoReplacement` → common 교체
- user: `BillBookmarked` 내 `PartyLogoReplacement` → common 교체

### Area 6: 컴포넌트 정리

- **SearchBarButton:** 불필요한 `useCallback` 제거, `open()` 직접 호출
- **SearchBar:** 최근검색어 로직 → mutation hook으로 교체, `setRecentKeywords` prop 제거
- **components/index.tsx:** 내부 전용(SearchCongressman, SearchParty) export 제거
- **SearchParty:** `PartyLogo` 공통 컴포넌트 적용

---

## 변경하지 않는 것

- `validation/index.ts` — Zod 스키마 현재 상태 유지 (TODO 주석 포함)
- `[id]/layout.tsx` — 메타데이터, Layout 구조 유지
- Zustand 스토어 인터페이스 — open/close 구조 유지

## 의존 관계

```
Area 1 (서비스 분리) → Area 2 (파생 상태 제거), Area 3 (최근 검색어)
Area 5 (PartyLogo 공통) → Area 6 (SearchParty 적용)
Area 4 (Dialog 전환) + Area 3 (최근 검색어) → SearchModal/SearchBar 최종 형태
```

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**lawdigest-fe** (모두의입법) — A Next.js 15 frontend for an AI-powered Korean legislative bill summary platform. Uses React 19, App Router, TypeScript strict mode.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint check
npm run typecheck    # TypeScript type checking
npm run fix          # ESLint fix + Prettier format

# Testing
npm test             # Vitest (single run)
npm run test:watch   # Vitest watch mode
npm run coverage     # Vitest with coverage
npm run test:e2e     # Playwright E2E tests (requires dev server on localhost:3000)

# Storybook
npm run storybook    # Dev server on port 6006
```

Test files live in `tests/**/*.test.{ts,tsx}` and `app/**/*.test.{ts,tsx}`. E2E tests are in `e2e/`.

## Architecture

### Module Structure

Feature modules live under `app/` (bill, congressman, party, auth, user, notification, following, timeline, search, home). Each module follows this pattern:

```
app/{module}/
├── components/          # UI components
├── hooks/               # Custom hooks
├── services/
│   ├── apis.ts          # Axios calls with Zod response validation
│   ├── queries.ts       # React Query hooks (useQuery/useMutation wrappers)
│   └── query-keys.ts    # Query key factory
├── types/
├── validation/          # Zod schemas
└── constants/
```

Shared code is in `app/common/` (components, hooks, lib, types, utils, validation).

### API Layer (`app/common/lib/api.ts`)

- Axios instance with request/response interceptors
- Browser requests go through `/v1/*` (Next.js rewrites to backend via `NEXT_PUBLIC_URL`)
- SSR requests hit `NEXT_PUBLIC_URL` directly
- Response interceptor unwraps `{ status, code, message, data }` → returns `data`
- 401 triggers automatic token reissue; failed reissue emits logout event

### State Management

- **Server state:** TanStack React Query (caching, mutations, infinite queries)
- **Global UI state:** Zustand (snackbar notifications, search modal)
- **Auth events:** Custom EventTarget bus (`app/common/lib/auth-events.ts`) for logout/token-reissue

### Key Patterns

**API calls** validate responses with Zod schemas and use `extractApiMessage(error)` for error extraction.

**React Query hooks** use a query key factory pattern (e.g., `billKeys.detail(id)`) and support TypeScript generics with options passthrough.

**UI components** use shadcn/ui (new-york style) built on Radix UI. The `cn()` utility merges classNames with tailwind-merge. shadcn components are in `app/common/components/ui/`.

**Styling:** Tailwind CSS with class-based dark mode via next-themes.

### Path Alias

`@/*` maps to the project root (e.g., `@/app/common/lib/api`).

### Environment Variables

Key env vars: `NEXT_PUBLIC_URL` (API base), `NEXT_PUBLIC_IMAGE_URL`, `NEXT_PUBLIC_HOSTNAME`, `NEXT_PUBLIC_DOMAIN`, `NODE_ENV`.

## Code Style

- ESLint: airbnb + airbnb-typescript + next/core-web-vitals + prettier
- Prettier: single quotes, 120 char width, 2-space tabs
- Node >= 20.19.0

## Local Skills (.agents/skills/)

프로젝트에 포함된 로컬 스킬 파일들. 해당 작업 시 `.agents/skills/{name}/SKILL.md`를 읽고 지침을 따를 것.

### UI/컴포넌트
- **shadcn** — shadcn/ui 컴포넌트 추가, 스타일링, 디버깅 시
- **building-components** — 새 컴포넌트 설계, 접근성, composable API 구현 시
- **web-design-guidelines** — UI 리뷰, 접근성 점검, UX 감사 시
- **before-and-after** — UI 변경 전후 스크린샷 비교 시

### Next.js
- **next-best-practices** — Next.js 코드 작성/리뷰 시 (RSC, 데이터 패턴, 메타데이터, 에러 처리 등)
- **next-cache-components** — PPR, use cache, cacheLife, cacheTag 등 캐시 관련 작업 시
- **next-upgrade** — Next.js 버전 업그레이드 시
- **vercel-react-best-practices** — React/Next.js 성능 최적화, 번들 최적화 시
- **vercel-composition-patterns** — 컴포넌트 합성 패턴, 코드 구조 개선 시

### SEO
- **seo-audit** — SEO 감사, 기술 SEO 진단, 랭킹/트래픽 이슈 시
- **programmatic-seo** — 템플릿 기반 대량 페이지 생성, 키워드/지역 타겟 페이지 시
- **audit-website** — 사이트 전반 감사 (SEO, 성능, 보안, 접근성 등 230+ 규칙)

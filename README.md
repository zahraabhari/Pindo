# Pindo — Vertical Video Feed

Production-oriented TikTok/Instagram-style vertical feed: virtualization, centralized playback, resource scheduling, optimistic interactions, and **cache-based offline resilience**.

> **What this is:** Not a UI clone — a **production-inspired frontend feed system** with real-world architectural trade-offs (cursor streams, SWR head merge, persistence, playback orchestration). Backend and commerce are intentionally thin; the depth is in **how data moves, caches, and renders at scale**.

## Project scope (take-home / interview context)

This project is a **frontend system design** exercise — not “just a React UI.” It models how a senior team would structure a high-traffic vertical feed client: performance budgets, cache-first data paths, deterministic scroll/playback behavior, and explicit degraded modes. It prioritizes:

- Frontend architecture and module boundaries
- Virtualization and scroll/playback performance
- State management (React Query, Zustand, orchestration)
- Caching and resilience strategy
- UI/UX flow and degraded-mode behavior

It does **not** aim to deliver:

- A full backend or commerce platform
- Real payment processing or order fulfillment
- Production-grade PWA / Service Worker offline apps

Trade-offs below are **intentional** and aligned with that scope. The codebase is structured so real commerce and deeper offline layers can be added later without rewriting the feed core.

### Key engineering principles

| Principle | How it shows up in this repo |
|-----------|------------------------------|
| **Cache-first rendering (SWR)** | Feed renders from React Query cache immediately; stale head refresh via `GET /api/videos/head` + merge — no full-list refetch on mount |
| **Offline-first data resilience** | `networkMode: "offlineFirst"`, persistence to `localStorage`, commerce guards when offline — **not** a full PWA |
| **Cursor-based pagination** | Opaque `cursor` / `nextCursor` contract; single flattened stream with id dedup — avoids page-index drift |
| **Separation of UI / state / server** | `components/features` → `*.hooks.ts` → `*.api.ts` → `app/api` → `*.server.ts`; client never imports Pexels directly |
| **Virtualization for performance** | `react-virtuoso` + fixed row height; playback keyed by `video.id`, not list index |
| **Optimistic UI** | Likes (Zustand), comments (React Query `onMutate`), cart (local persist) — patterns ready for real APIs |

---

## Offline support (limitations)

Offline behavior is implemented **only at the data/cache layer** — not as a full offline-capable PWA. This is **data-layer resilience** (restore JSON cache, browse what was already fetched), not platform-level offline (installable app, precached shell, background sync).

### Design intent (cache-first, deliberate scope)

- **Cache-first is intentional:** The feed is meant to feel instant on revisit — hydrate persisted React Query state, then reconcile with the network when online.
- **React Query persistence only:** `services/query/query-persistence.ts` dehydrates successful `feed`, `discover`, and `comments` queries to `localStorage` (`pindo-rq-cache-v4`). No Service Worker — that omission is a **scope decision**, not an oversight.
- **Browser-level offline refresh failure is expected:** A hard refresh while offline may fail before JavaScript runs (Next.js must load the document and bundles). That gap is documented and accepted; soft navigation within an already-loaded session is the supported offline path.

### What is implemented

| Capability | Mechanism |
|------------|-----------|
| Persist feed, discovery, and comments metadata | React Query cache dehydrated to `localStorage` (`services/query/query-persistence.ts`) |
| Browse previously fetched reels while offline | Restored infinite-query **cursor segments** from persisted cache (flattened to one stream in UI) |
| Browse cached search/discovery grids | Same persistence for `discover` query keys |
| Offline awareness + UI | `hooks/use-online-status.ts`, `OfflineBanner`, graceful empty states |
| Reconnect refresh | `refetchOnReconnect` + active-query refetch on `online` |

- **React Query persistence** keeps previously fetched API responses available after refresh (when the app shell has already loaded).
- **New API requests** fail or are not retried when offline (`networkMode: "offlineFirst"`, no retry while `navigator.onLine === false`).
- The offline experience is limited to **cached state restoration and browsing** — not downloading new pages, posting comments, or streaming new video bytes without network.

### What is NOT implemented (out of scope)

- **No Service Workers** — no asset precaching, no offline HTML shell, no background sync.
- **No full PWA offline mode** — the app is not installable as an offline-first product.
- **No media binary cache** — video `src` URLs still require network for playback; only JSON/metadata is persisted.
- **Hard refresh while offline** may show a **browser-level network error** (e.g. Chrome “No internet”) because Next.js must load the JS bundle and document from the server/CDN first. That failure happens **before** React Query can hydrate. This is **expected** and out of scope.

```
Online session → data cached in React Query + localStorage
Offline reopen (soft navigation)     → cached feed/search may render
Offline hard refresh (F5 / new tab)  → browser may fail to load the app shell ← expected gap
```

See [ARCHITECTURE.md — Offline caching](./ARCHITECTURE.md#offline-caching-cache-layer-only) for implementation detail.

---

## Cart & payment (intentionally mocked)

Commerce UI demonstrates **product discovery and interaction patterns** — not a real store. The cart exists to show **how feed overlays wire into commerce flows** (add to cart, sheet, purchase modal, offline guards) — not to implement checkout infrastructure.

### Current implementation

- **No real cart backend** — cart state lives in Zustand + `localStorage` (`cart-store`) on the client only; sufficient for demo UX and interview discussion of state boundaries.
- **No payment processor** — no Stripe, wallets, or checkout API.
- **“Buy” / “Purchase” actions are simulated** — success is mock UI feedback (toast, sheets, DM modal).
- **No inventory, tax, shipping, or transaction records.**

### Why

- Assignment focus is architecture, performance, and state management — not e-commerce infrastructure.
- A thin, extensible commerce **surface** (add to cart, sheet, purchase modal) shows how the feed would integrate with a real backend later.

### Future direction (not built here)

- Server-backed cart and checkout APIs
- Payment provider integration
- Order persistence and webhooks

The layout under `components/features/commerce/` and `store/cart-store.ts` is designed to swap mock handlers for real service calls without changing the virtualized feed.

See [ARCHITECTURE.md — Commerce scope](./ARCHITECTURE.md#commerce-scope-mocked).

---

## Architecture

```
src/
  app/                  Next.js routes + thin API handlers
  components/features/  feed, search, commerce, video, navigation
  hooks/                viewport, debounce, intersection, playback UI, online status
  services/             feed, search, comments, commerce, query persistence, pexels, api
  store/                Zustand (playback, feed runtime, UI, interactions, cart)
  lib/                  cn, design tokens
  types/                domain types
  utils/                stable-callback
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for layering rules, data flow, and trade-offs.

### Feed architecture: page-based → cursor-based migration

The feed **used to** paginate with `page=1,2,3…`. It now uses an **opaque cursor stream** aligned with how large consumer feeds are usually built.

#### Why page-based was removed

| Problem | Effect on UX / scale |
|---------|----------------------|
| **Pagination drift after refresh** | Replacing “page 1” or refetching from page 1 shifts indices; scroll position and “what you already saw” diverge |
| **Unstable ordering over time** | New items inserted at the top make page boundaries meaningless — page 2 after refresh ≠ page 2 before |
| **Poor fit for dynamic feeds** | Page indices are client assumptions; the server cannot guarantee stable slices as the catalog changes |

#### What cursor-based streaming provides

| Benefit | Implementation in Pindo |
|---------|-------------------------|
| **Stable infinite stream** | UI treats feed as one list (`flattenFeedSlices` + dedupe by `id`); pagination is an internal detail |
| **Server-driven position** | `GET /api/videos?cursor=<opaque>` → `{ items, nextCursor, hasMore }`; cursor encodes upstream position server-side (`feed.cursor.ts`) |
| **Consistent sessions** | Tail cursors are preserved on refresh; head updates do not reset the infinite query |

**Head refresh (SWR):** `GET /api/videos/head` returns a fresh top segment; `refreshFeedStreamHead` merges into slice 0 and strips duplicate ids from tail segments — **no “refetch page 1 only”**, no pagination reset. This matches stale-while-revalidate behavior in apps like Instagram/TikTok, where deterministic page-based pagination is avoided in favor of **cursor- or rank-based streams**.

```
Client mount     → render persisted + in-memory cache immediately
Online + stale   → background head fetch → merge by stable id
Scroll deep      → fetchNextPage(nextCursor) → append segment
Offline          → no tail fetch; browse flattened cached stream
```

This migration aligns the feed architecture with real-world systems like Instagram/TikTok, where page indices are avoided in favor of opaque cursors or rank tokens.

### Trade-offs (honest engineering)

| Cost | Benefit |
|------|---------|
| **More complex data layer** — cursor encoding, infinite query segments, head merge (`feed-cache.ts`, `feed.stream.ts`) | **UX stability** — no feed reset on refresh; scroll depth preserved |
| **Harder debugging** — opaque cursors vs “page 3” in DevTools | **Scalable mental model** — one stream, server-owned ordering |
| **Cache reconciliation** — dedup, structural sharing, persist buster migrations (`pindo-rq-cache-v4`) | **Cache-first UX** — instant render, silent background head update |
| **Stronger API contract coupling** — client must honor `nextCursor` / head shape | **Production-like boundary** — same contract a real BFF would expose |

Page-based pagination is simpler to reason about in tutorials; cursor + head merge is the trade-off chosen here because **feed consistency and revisit behavior** matter more than minimal LOC for a take-home focused on system design.

### Key systems

| System | Location |
|--------|----------|
| **Data fetching** | React Query → `services/*/*.api.ts` → `/api/*` → `*.server.ts` |
| **Feed stream** | Cursor infinite query (`feed.hooks.ts`) + head SWR (`feed-cache.ts`) + dedup (`feed.stream.ts`) |
| **Offline cache** | `services/query/query-persistence.ts` + `QueryProvider` |
| **Feed orchestration** | `useFeedOrchestrator` + Zustand `feed-runtime-store` |
| **Playback** | `services/feed/playback-engine.ts` — single active video |
| **Scheduler** | `services/feed/feed.scheduler.ts` — preload tiers from scroll velocity |
| **Video pool** | `components/features/video/video-pool.ts` — 3 reused DOM nodes |
| **Optimistic likes** | `store/interaction-store.ts` |
| **Cart (mock)** | `store/cart-store.ts` (persist) + sheet/toast — **client-only, no checkout** |

`React.memo` is used only on virtualized list cells, heavy video overlays, and store-driven controls that do not subscribe to global state themselves — see [ARCHITECTURE.md](./ARCHITECTURE.md#performance-conventions).

---

## Setup

Requires [pnpm](https://pnpm.io/) (see `packageManager` in `package.json`).

```bash
pnpm install
```

Create `.env.local`:

```env
PEXELS_API_KEY=your_key_here
```

1. Register at [https://www.pexels.com/api/](https://www.pexels.com/api/) (free).
2. Add your key to `.env.local`.
3. Restart the dev server after env changes:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Feed data: `GET /api/videos?cursor=<opaque>&query=nature` → `{ items, nextCursor, hasMore }`. Head refresh: `GET /api/videos/head?query=nature` (SWR merge, no pagination reset). Pexels stays server-side.

Optional env vars:

```env
PEXELS_SEARCH_QUERY=nature
NEXT_PUBLIC_FEED_SEARCH_QUERY=nature
NEXT_PUBLIC_USE_MOCK_FEED=true   # static CDN URLs, no Pexels API calls
```

### Testing offline behavior (dev)

1. Load `/feed` and scroll while **online** (populates React Query + persistence).
2. Use DevTools → **Network → Offline** (or airplane mode).
3. Navigate within the app — cached reels and discovery should remain browsable; banner shows offline state.
4. **Hard refresh while offline** may fail at the browser level — see [Offline support (limitations)](#offline-support-limitations).

### Empty states (dev / QA)

Shared UI: `components/features/shared/EmptyState.tsx` (icon, title, description, optional retry). Offline-specific copy uses `OfflineEmptyState.tsx`. Global hint: `OfflineBanner.tsx`.

| Surface | Where | State | How to trigger |
|---------|--------|-------|----------------|
| **Feed** | `VirtualizedFeed.tsx` | Offline, no cached reels | Network offline before any successful feed load |
| **Feed** | `VirtualizedFeed.tsx` | API error | Missing/invalid `PEXELS_API_KEY` (with no mock fallback data in cache) |
| **Feed** | `VirtualizedFeed.tsx` | No reels | Successful fetch with zero items (uncommon with mock/Pexels fallback) |
| **Search** | `SearchPage.tsx` | Offline, no cached grid | Offline + no persisted `discover` data for the query |
| **Search** | `SearchPage.tsx` | Load error | Discover API failure with empty cache |
| **Search** | `SearchPage.tsx` | No results | Type **`__empty__`** in the search bar (demo hook in `services/search/search.empty-demo.ts`; skips mock/Pexels fallback) |
| **Comments** | `CommentSheet.tsx` | No comments | ~**1 in 7** reels by stable `videoId` (`isEmptyCommentsVideo` in `comment-seed.ts` — e.g. `mock-0`, `mock-7`, `mock-14`) |
| **Comments** | `CommentSheet.tsx` | Load error | Comments API fails while the sheet is open |
| **Cart** | `CartSheet.tsx` | Empty cart | Open cart with no line items |

**Comments count vs list:** Overlay count uses the same seed as the sheet (`placeholderData` + `resolveCommentCount` in `comments.hooks.ts`) so a reel with zero seeded comments shows **0** on the rail and an empty list in the sheet — not “8 on the badge, empty in the sheet”. After changing comment seed rules, hard-refresh once so old `comments` entries in `localStorage` do not linger.

**Search “no results”:** Normal queries (`nature`, `skincare`, …) almost always return mock or Pexels items. Only the reserved demo query `__empty__` returns an empty page on purpose.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Production server |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier write |
| `pnpm format:check` | Prettier check |

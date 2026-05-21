# Pindo — Frontend Architecture

## Design intent

This codebase demonstrates **how to structure a high-performance vertical video client** — not a complete commerce or offline-first product.

| In scope | Out of scope |
|----------|--------------|
| Layered frontend architecture | Real payment / order processing |
| Virtualized feed + playback orchestration | Full backend commerce APIs |
| React Query + Zustand state design | Service Workers / PWA offline shell |
| Cache-based offline resilience | Media CDN offline caching |
| Mock commerce UX flows | Production checkout compliance |

Reviewers should evaluate **architecture, performance, caching, and UX degradation** — not whether the app is a deployable e-commerce or offline-native platform.

---

## Layering

| Layer | Path | Responsibility |
|-------|------|----------------|
| **Pages** | `src/app/` | Route composition only — thin API route handlers delegate to services |
| **Features** | `src/components/features/` | Domain UI (feed, search, commerce, navigation, video) |
| **Design system** | `src/components/ui/` | Primitives only (Button, Input, Icon, Card, Typography, Skeleton) |
| **Providers** | `src/components/providers/` | React Query client + cache restore/persist |
| **Hooks** | `src/hooks/` | Reusable client utilities (viewport, debounce, intersection, online status) |
| **Services** | `src/services/` | Feature modules — API, hooks, server logic, types, keys, query persistence |
| **Store** | `src/store/` | Zustand — UI, playback mirror, feed runtime, interactions, **mock cart** |
| **Lib** | `src/lib/` | Shared utilities only (`cn`, design tokens) |
| **Types** | `src/types/` | Canonical domain types |
| **Utils** | `src/utils/` | Generic helpers (`stable-callback`) |

## Service modules

Each feature owns its vertical slice under `src/services/`:

```
services/
  api/           axios instance + getRequest/postRequest
  feed/          feed.api, feed.hooks, feed.server, feed.mock, feed.cursor, feed.stream, feed.cache, playback-engine
  search/        search.api, search.hooks, search.server, search.layout, search.mock, search.dedupe
  comments/      comments.api, comments.hooks, comments.server
  query/         query-persistence.ts — dehydrate/hydrate React Query → localStorage
  commerce/      enrich-product, comment-avatar, comment-seed (shared domain helpers)
  pexels/        server-only Pexels client, mappers, discovery adapter
```

**Rules:**
- Client components import `*.hooks.ts` for data; never import `*.server.ts` or `pexels/*`.
- API route handlers (`app/api/*`) only parse HTTP and call `*.server.ts`.
- `*.types.ts` re-exports from `@/types/*` for module boundaries.

## Data flow

```
UI component
  → services/<feature>/<feature>.hooks.ts   (React Query)
    → services/<feature>/<feature>.api.ts   (axios → /api/*)
      → app/api/<feature>/route.ts          (HTTP boundary)
        → services/<feature>/<feature>.server.ts
          → services/pexels/* OR services/*/mock
```

On the client, successful query results may also be written to `localStorage` via `setupQueryPersistence` (see [Offline caching](#offline-caching-cache-layer-only)).

### Feed stream (cursor pagination)

- **Contract**: `GET /api/videos?cursor=<opaque>` → `{ items, nextCursor, hasMore }`; opaque cursor encodes upstream position server-side (`feed.cursor.ts`).
- **Single stream**: UI flattens infinite-query segments with stable id dedup (`feed.stream.ts`); no page numbers in client state.
- **SWR head**: `GET /api/videos/head` + `refreshFeedStreamHead` merges new items into slice 0 and strips duplicates from tail — pagination cursors are not reset.
- **Offline**: `networkMode: offlineFirst`; pagination `queryFn` no-ops when offline; persisted cache key `pindo-rq-cache-v4` (buster `4`).

---

## Offline caching (cache layer only)

### Summary

Offline support is **React Query persistence** — not Service Workers, not a PWA, not offline video files.

| Layer | Offline? |
|-------|----------|
| Next.js app shell (HTML/JS on hard refresh) | **No** — requires network to load |
| React Query JSON cache (feed, discover, comments) | **Yes** — after shell loads |
| Video/media playback (`<video src>`) | **No** — streams need network |

### Implementation

```
QueryProvider (useLayoutEffect)
  1. restoreQueryClient()  — hydrate from localStorage key `pindo-rq-cache-v4`
  2. setupQueryPersistence() — throttle-writes on query cache changes

shouldPersistQuery()
  ✓ queryKey[0] ∈ { feed, discover, comments } && status === success
  ✗ comments-live, mutations, failed queries
```

| File | Role |
|------|------|
| `services/query/query-persistence.ts` | `dehydrate` / `hydrate`, TTL (24h), buster, quota handling |
| `components/providers/query-provider.tsx` | `offlineFirst` defaults, reconnect refetch |
| `hooks/use-online-status.ts` | `navigator.onLine` via `useSyncExternalStore` |
| `hooks/use-query-restore.ts` | `isRestoring` — avoid skeleton flash when cache exists |
| `components/features/shared/OfflineBanner.tsx` | Non-blocking global indicator |

### Runtime behavior

- **Previously fetched data** remains available when offline after the client has mounted and hydrated.
- **New API requests** are blocked or fail when offline (no retry while offline; pagination and comment post disabled in UI).
- **Stale-while-revalidate**: `networkMode: "offlineFirst"` serves cache first; refetch runs when online.
- **Reconnect**: `refetchOnReconnect` + explicit refetch of active `feed`, `discover`, and `comments` queries.

### Known limitation (documented, intentional)

**Hard refresh while offline** often fails before React runs:

```
User offline → browser requests document + JS chunks → network error page
              (React Query never hydrates)
```

Fixing that requires **Service Worker + precached app shell** (or static export) — explicitly **out of scope** for this assignment.

### What reviewers should not expect

- Installable PWA with offline launch
- Background sync of cart or comments
- Cached video binaries for offline playback
- Guaranteed offline cold start

---

## Commerce scope (mocked)

### What exists (UI + client state)

```
components/features/commerce/
  cart/        CartSheet, CartIconButton, AddToCartButton, CartLineItem, CartToast
  actions/     (under overlay/) AnimatedLikeButton, AnimatedBookmarkButton
  comments/    CommentSheet, CommentRow — backed by mock API + React Query
  overlay/     SocialActionRail, VideoDescription
  purchase/    PurchaseDMModal — simulated “message seller” flow
  shared/      BottomSheet
```

| Piece | Behavior |
|-------|----------|
| `cart-store` | Zustand + `localStorage` (`pindo-cart-v1`) — **no server cart** |
| Add to cart | Updates local store + toast |
| Purchase / Buy | Opens modal or success UI — **no charge, no order ID** |
| Product metadata | Enriched on feed items for display (`enrich-product`) |

### What does not exist

- Payment gateway (Stripe, PayPal, etc.)
- Checkout session, tax, shipping, inventory
- Webhooks, receipts, or fraud checks
- Cart sync across devices or sessions (beyond this browser’s localStorage)

### Extensibility

Commerce components are intentionally thin:

- Replace `cart-store` actions with calls to `POST /api/cart` when a backend exists.
- Keep feed virtualization and playback engine unchanged.
- Purchase modal can become a real checkout route without altering `useFeedOrchestrator`.

**Future enhancements** (not implemented): server cart, payment intent, order history, seller messaging API.

## Empty & degraded UI

| Layer | Files |
|-------|--------|
| Shared empty layout | `components/features/shared/EmptyState.tsx`, `OfflineEmptyState.tsx` |
| Feed / search / sheets | `VirtualizedFeed.tsx`, `SearchPage.tsx`, `CommentSheet.tsx`, `CartSheet.tsx` |
| Search “no results” demo | `services/search/search.empty-demo.ts` — query `__empty__` returns `items: []` (no mock backfill) |
| Comment empty seed | `services/commerce/comment-seed.ts` — `isEmptyCommentsVideo` (~1/7 reels); overlay count via `resolveCommentCount` in `comments.hooks.ts` |

Step-by-step triggers for QA are in [README — Empty states (dev / QA)](./README.md#empty-states-dev--qa).

## State

| Store | Purpose |
|-------|---------|
| `cart-store` | **Mock** cart items + localStorage persist (client rehydrate only) |
| `feed-runtime-store` | Scroll velocity, scheduler snapshot, preload tiers |
| `playback-store` | Active video mirror for UI |
| `interaction-store` | Optimistic likes/saves |
| `ui-store` | Modal/sheet open state |
| `purchase-store` | **Simulated** purchase flow session |
| `search-store` | Search history (persisted; not discovery grid data) |

## Performance conventions

- `React.memo` on list/grid cells (`FeedItem`, `DiscoverCard`, `CommentRow`, `CartLineItem`), heavy overlays (`VideoOverlay`, `PooledFeedItemMedia`, `VideoPlayer`), and overlay children that should not rerender when only sibling props change (`SocialActionRail`, `VideoDescription`).
- Omit `memo` on components that subscribe to Zustand/React Query (likes, cart buttons, sheets) or on shells whose parents rarely rerender.
- `useStableCallback` for scroll handlers passed to memoized children.
- Virtualized feed (`react-virtuoso`) and windowed discover masonry.
- Lazy media: `loading="lazy"` / `preload="none"` on images and videos.
- Video pool (`video-pool.ts`) reuses 3 DOM `<video>` nodes.

## Design tokens

`src/lib/tokens.ts` defines spacing, color, radius, z-index, and typography (`--font-inter`).  
`src/lib/fonts/inter.ts` loads Inter variable (woff2).  
`src/app/globals.css` exposes key tokens as CSS variables (`--ds-*`) and wires `--font-sans` in `@theme`.

---

## Intentional trade-offs (reviewer checklist)

| Decision | Rationale |
|----------|-----------|
| Cache-only offline | Demonstrates React Query resilience without SW complexity |
| No PWA | Assignment scope is feed architecture, not platform distribution |
| Mock cart/payment | Shows UX integration points without backend contract |
| Thin API routes | Server boundary exists for Pexels key safety; not a full BFF |
| Client-side cart persist | Enough for demo; server cart is a future swap |

These choices keep the repository focused on **virtualization, playback, scheduling, and state design** while remaining honest about production gaps.

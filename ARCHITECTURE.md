# Pindo — Frontend Architecture

## Layering

| Layer | Path | Responsibility |
|-------|------|----------------|
| **Pages** | `src/app/` | Route composition only — thin API route handlers delegate to services |
| **Features** | `src/components/features/` | Domain UI (feed, search, commerce, navigation, video) |
| **Design system** | `src/components/ui/` | Primitives only (Button, Input, Icon, Card, Typography, Skeleton) |
| **Providers** | `src/components/providers/` | React Query client |
| **Hooks** | `src/hooks/` | Reusable client utilities (viewport, debounce, intersection, playback UI) |
| **Services** | `src/services/` | Feature modules — API, hooks, server logic, types, keys |
| **Store** | `src/store/` | Zustand — UI, playback mirror, feed runtime, interactions |
| **Lib** | `src/lib/` | Shared utilities only (`cn`, design tokens) |
| **Types** | `src/types/` | Canonical domain types |
| **Utils** | `src/utils/` | Generic helpers (`stable-callback`) |

## Service modules

Each feature owns its vertical slice under `src/services/`:

```
services/
  api/           axios instance + getRequest/postRequest
  feed/          feed.api, feed.hooks, feed.server, feed.mock, feed.scheduler, playback-engine
  search/        search.api, search.hooks, search.server, search.layout, search.mock, search.dedupe
  comments/      comments.api, comments.hooks, comments.server
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

## Commerce UI structure

```
components/features/commerce/
  cart/        CartSheet, CartIconButton, AddToCartButton, CartLineItem, CartToast
  actions/     (under overlay/) AnimatedLikeButton, AnimatedBookmarkButton
  comments/    CommentSheet, CommentRow, CommentRowSkeleton
  overlay/     SocialActionRail, VideoDescription
  purchase/    PurchaseDMModal (DM / message seller only)
  shared/      BottomSheet
```

## State

| Store | Purpose |
|-------|---------|
| `cart-store` | Cart items + localStorage persist (Zustand persist, client rehydrate) |
| `feed-runtime-store` | Scroll velocity, scheduler snapshot, preload tiers |
| `playback-store` | Active video mirror for UI |
| `interaction-store` | Optimistic likes/saves |
| `ui-store` | Modal/sheet open state |
| `purchase-store` | Purchase flow session |
| `search-store` | Search history |

## Performance conventions

- `React.memo` on list/grid cells (`FeedItem`, `DiscoverCard`, `CommentRow`, `CartLineItem`), heavy overlays (`VideoOverlay`, `PooledFeedItemMedia`, `VideoPlayer`), and overlay children that should not rerender when only sibling props change (`SocialActionRail`, `VideoDescription`).
- Omit `memo` on components that subscribe to Zustand/React Query (likes, cart buttons, sheets) or on shells whose parents rarely rerender.
- `useStableCallback` for scroll handlers passed to memoized children.
- Virtualized feed (`react-virtuoso`) and windowed discover masonry.
- Lazy media: `loading="lazy"` / `preload="none"` on images and videos.
- Video pool (`video-pool.ts`) reuses 3 DOM `<video>` nodes.

## Design tokens

`src/lib/tokens.ts` defines spacing, color, radius, and z-index scales.  
`src/app/globals.css` exposes key tokens as CSS variables (`--ds-*`).

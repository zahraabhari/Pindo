# Pindo — Vertical Video Feed

Production-oriented TikTok/Instagram-style vertical feed: virtualization, centralized playback, resource scheduling, and optimistic interactions.

## Architecture

```
src/
  app/                  Next.js routes + thin API handlers
  components/features/  feed, search, commerce, video, navigation
  hooks/                viewport, debounce, intersection, playback UI
  services/             feed, search, comments, commerce, pexels, api
  store/                Zustand (playback, feed runtime, UI, interactions)
  lib/                  cn, design tokens
  types/                domain types
  utils/                stable-callback
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for layering rules and data flow.

### Key systems

| System | Location |
|--------|----------|
| **Data fetching** | React Query → `services/*/*.api.ts` → `/api/*` → `*.server.ts` |
| **Feed orchestration** | `useFeedOrchestrator` + Zustand `feed-runtime-store` |
| **Playback** | `services/feed/playback-engine.ts` — single active video |
| **Scheduler** | `services/feed/feed.scheduler.ts` — preload tiers from scroll velocity |
| **Video pool** | `components/features/video/video-pool.ts` — 3 reused DOM nodes |
| **Optimistic likes** | `store/interaction-store.ts` |

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

Feed data: `GET /api/videos?page=1&query=nature` → Pexels `/videos/search` (API key stays server-side).

Optional env vars:

```env
PEXELS_SEARCH_QUERY=nature
NEXT_PUBLIC_FEED_SEARCH_QUERY=nature
NEXT_PUBLIC_USE_MOCK_FEED=true   # static CDN URLs, no Pexels API calls
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Production server |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier write |
| `pnpm format:check` | Prettier check |

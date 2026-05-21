import {
  dehydrate,
  hydrate,
  type DehydratedState,
  type Query,
  QueryClient,
} from "@tanstack/react-query";
import {
  FEED_GC_TIME_MS,
  FEED_STALE_TIME_MS,
  refetchWhenOnline,
  shouldRetryQuery,
} from "@/services/query/query-config";

export const RQ_PERSIST_STORAGE_KEY = "pindo-rq-cache-v3";
export const RQ_PERSIST_BUSTER = "3";
/** Persisted cache TTL — survives refresh / offline revisit */
export const RQ_PERSIST_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PERSIST_THROTTLE_MS = 500;

type PersistEnvelope = {
  buster: string;
  timestamp: number;
  state: DehydratedState;
};

const PERSIST_ROOTS = new Set(["feed", "discover", "comments"]);

export function shouldPersistQuery(query: Query): boolean {
  const key = query.queryKey;
  if (!Array.isArray(key) || key.length === 0) return false;

  const root = key[0];
  if (typeof root !== "string" || !PERSIST_ROOTS.has(root)) return false;
  if (root === "comments-live") return false;

  return query.state.status === "success" && query.state.data !== undefined;
}

export function readPersistedState(): DehydratedState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(RQ_PERSIST_STORAGE_KEY);
    if (!raw) return null;

    const envelope = JSON.parse(raw) as PersistEnvelope;
    if (envelope.buster !== RQ_PERSIST_BUSTER) {
      localStorage.removeItem(RQ_PERSIST_STORAGE_KEY);
      return null;
    }
    if (Date.now() - envelope.timestamp > RQ_PERSIST_MAX_AGE_MS) {
      localStorage.removeItem(RQ_PERSIST_STORAGE_KEY);
      return null;
    }

    return envelope.state;
  } catch {
    localStorage.removeItem(RQ_PERSIST_STORAGE_KEY);
    return null;
  }
}

export function writePersistedState(state: DehydratedState): void {
  if (typeof window === "undefined") return;

  const envelope: PersistEnvelope = {
    buster: RQ_PERSIST_BUSTER,
    timestamp: Date.now(),
    state,
  };

  try {
    localStorage.setItem(RQ_PERSIST_STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    try {
      localStorage.removeItem(RQ_PERSIST_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

export function restoreQueryClient(client: QueryClient): boolean {
  const state = readPersistedState();
  if (!state) return false;

  hydrate(client, state, {
    defaultOptions: client.getDefaultOptions(),
  });
  return true;
}

export function persistQueryClient(client: QueryClient): void {
  const state = dehydrate(client, {
    shouldDehydrateQuery: shouldPersistQuery,
  });
  writePersistedState(state);
}

/** Throttled writes + immediate flush when tab hides (survives refresh) */
export function setupQueryPersistence(client: QueryClient): () => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    persistQueryClient(client);
  };

  const schedule = () => {
    if (timeout !== null) return;
    timeout = setTimeout(flush, PERSIST_THROTTLE_MS);
  };

  const onHide = () => {
    if (document.visibilityState === "hidden") flush();
  };

  const unsubCache = client.getQueryCache().subscribe(schedule);
  window.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", flush);

  return () => {
    unsubCache();
    window.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", flush);
    flush();
  };
}

export function createOfflineQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: FEED_STALE_TIME_MS,
        gcTime: FEED_GC_TIME_MS,
        refetchOnWindowFocus: refetchWhenOnline,
        refetchOnReconnect: refetchWhenOnline,
        refetchOnMount: refetchWhenOnline,
        networkMode: "offlineFirst",
        retry: (failureCount) => shouldRetryQuery(failureCount),
        structuralSharing: true,
      },
      mutations: {
        networkMode: "offlineFirst",
        retry: false,
      },
    },
  });
}

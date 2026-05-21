

const CURSOR_VERSION = 1;

type CursorPayload = {
  v: number;
  p: number;
  q: string;
};

export type DecodedFeedCursor = {
  page: number;
  query: string;
};

export function encodeFeedCursor(page: number, query: string): string {
  const payload: CursorPayload = { v: CURSOR_VERSION, p: page, q: query };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeFeedCursor(
  cursor: string | null | undefined,
  defaultQuery: string,
): DecodedFeedCursor {
  if (!cursor?.trim()) {
    return { page: 1, query: defaultQuery };
  }

  try {
    const json = Buffer.from(cursor, "base64url").toString("utf8");
    const payload = JSON.parse(json) as CursorPayload;
    if (
      payload.v !== CURSOR_VERSION ||
      typeof payload.p !== "number" ||
      payload.p < 1
    ) {
      throw new Error("Invalid feed cursor version");
    }
    return {
      page: Math.floor(payload.p),
      query: (payload.q || defaultQuery).trim() || defaultQuery,
    };
  } catch {
    return { page: 1, query: defaultQuery };
  }
}

export function buildNextCursor(
  currentPage: number,
  hasMore: boolean,
  query: string,
): string | null {
  if (!hasMore) return null;
  return encodeFeedCursor(currentPage + 1, query);
}

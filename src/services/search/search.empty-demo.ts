
export const EMPTY_SEARCH_DEMO_QUERY = "__empty__";

export function isEmptySearchDemoQuery(query: string): boolean {
  return query.trim().toLowerCase() === EMPTY_SEARCH_DEMO_QUERY;
}

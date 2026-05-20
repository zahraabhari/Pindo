export function commentsQueryKey(videoId: string) {
  return ["comments", videoId] as const;
}

export function commentsLiveQueryKey(videoId: string | null) {
  return ["comments-live", videoId] as const;
}

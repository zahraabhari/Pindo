/** Stable avatar URL per username (Dicebear — no API key) */
export function getCommentAvatarUrl(username: string): string {
  const seed = encodeURIComponent(username.trim() || "user");
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}&backgroundColor=27272a,3f3f46,52525b`;
}

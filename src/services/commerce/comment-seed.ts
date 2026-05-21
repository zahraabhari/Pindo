import type { Comment } from "@/types/commerce";

const SEED_USERS = ["maya_n", "eco_life", "trail_alex", "green.home", "nature.lens"];
const SEED_TEXTS = [
  "Is this still in stock?",
  "Love the packaging 😍",
  "Just ordered mine!",
  "How long is shipping?",
  "Need this for my trip next week",
  "Quality looks amazing",
];

const EMPTY_COMMENT_BUCKET_MOD = 7;
const EMPTY_COMMENT_BUCKET_MAX = 1;

function commentSeedBucket(videoId: string): number {
  const mockIdx = videoId.match(/^mock-(\d+)$/)?.[1];
  if (mockIdx !== undefined) {
    return parseInt(mockIdx, 10) % EMPTY_COMMENT_BUCKET_MOD;
  }

  let h = 0;
  for (let i = 0; i < videoId.length; i++) {
    h = (h * 31 + videoId.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % EMPTY_COMMENT_BUCKET_MOD;
}

export function isEmptyCommentsVideo(videoId: string): boolean {
  return commentSeedBucket(videoId) < EMPTY_COMMENT_BUCKET_MAX;
}

export function seedCommentsForVideo(videoId: string, count = 8): Comment[] {
  if (isEmptyCommentsVideo(videoId)) {
    return [];
  }

  const h = videoId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const baseTime = 1_700_000_000_000;
  return Array.from({ length: count }, (_, i) => {
    const idx = (h + i) % SEED_USERS.length;
    return {
      id: `${videoId}-seed-${i}`,
      videoId,
      username: SEED_USERS[idx]!,
      text: SEED_TEXTS[(h + i) % SEED_TEXTS.length]!,
      createdAt: new Date(baseTime - (i + 1) * 3600_000).toISOString(),
      likes: (h + i) % 24,
    };
  });
}

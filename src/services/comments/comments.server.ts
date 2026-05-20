import { seedCommentsForVideo } from "@/services/commerce/comment-seed";
import type { Comment } from "@/services/comments/comments.types";

const memoryStore = new Map<string, Comment[]>();

export function listCommentsForVideo(videoId: string): Comment[] {
  if (!memoryStore.has(videoId)) {
    memoryStore.set(videoId, seedCommentsForVideo(videoId));
  }
  return memoryStore.get(videoId)!;
}

export interface CreateCommentInput {
  videoId: string;
  text: string;
  username?: string;
}

export async function createCommentForVideo(
  input: CreateCommentInput,
): Promise<Comment> {
  const { videoId, text, username = "you" } = input;

  await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

  const comment: Comment = {
    id: `${videoId}-${Date.now()}`,
    videoId,
    username,
    text: text.trim(),
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  const list = listCommentsForVideo(videoId);
  list.unshift(comment);
  memoryStore.set(videoId, list);

  return comment;
}

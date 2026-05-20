import { getRequest, postRequest } from "@/services/api/axios";
import type { Comment } from "@/services/comments/comments.types";

export async function fetchComments(videoId: string): Promise<Comment[]> {
  const data = await getRequest<{ comments: Comment[] }>("/api/comments", {
    params: { videoId },
  });
  return data.comments;
}

export async function postComment(
  videoId: string,
  text: string,
): Promise<Comment> {
  const data = await postRequest<{ comment: Comment }>("/api/comments", {
    videoId,
    text,
    username: "you",
  });
  return data.comment;
}
